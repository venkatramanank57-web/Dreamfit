// components/works/WorkFilters.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, X } from 'lucide-react';
import { setFilters, resetFilters, selectWorkFilters } from '../../features/work/workSlice';

export default function WorkFilters() {
  const dispatch = useDispatch();
  const filters = useSelector(selectWorkFilters);
  
  const [dateRange, setDateRange] = useState('all');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    let startDate = '';
    let endDate = '';

    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (range === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      startDate = weekStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'custom' && customDates.start && customDates.end) {
      startDate = customDates.start;
      endDate = customDates.end;
    }

    if (startDate && endDate) {
      dispatch(setFilters({ startDate, endDate }));
    }
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
    setDateRange('all');
    setCustomDates({ start: '', end: '' });
  };

  return (
    <div className="space-y-4">
      {/* Date Range */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Date Range</label>
        <div className="flex flex-wrap gap-2">
          {['today', 'week', 'month', 'custom'].map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => {
                  setCustomDates({ ...customDates, start: e.target.value });
                  if (customDates.end) handleDateRangeChange('custom');
                }}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => {
                  setCustomDates({ ...customDates, end: e.target.value });
                  if (customDates.start) handleDateRangeChange('custom');
                }}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {(filters.status || filters.startDate || filters.endDate) && (
        <button
          onClick={handleClearFilters}
          className="mt-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all flex items-center gap-1"
        >
          <X size={14} />
          Clear Filters
        </button>
      )}
    </div>
  );
}