// components/works/UpdateStatusModal.jsx
import React, { useState } from 'react';
import { X, ChevronRight, Clock, Scissors, Ruler, Truck, CheckCircle } from 'lucide-react';
import showToast from '../../utils/toast';

const STATUS_OPTIONS = [
  { value: 'cutting-started', label: 'Start Cutting', icon: Scissors, color: 'purple' },
  { value: 'cutting-completed', label: 'Complete Cutting', icon: Scissors, color: 'indigo' },
  { value: 'sewing-started', label: 'Start Sewing', icon: Ruler, color: 'pink' },
  { value: 'sewing-completed', label: 'Complete Sewing', icon: Ruler, color: 'teal' },
  { value: 'ironing', label: 'Start Ironing', icon: Truck, color: 'orange' },
  { value: 'ready-to-deliver', label: 'Ready to Deliver', icon: CheckCircle, color: 'green' }
];

export default function UpdateStatusModal({ work, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  const handleUpdate = () => {
    if (!selectedStatus) {
      showToast.error('Please select a status');
      return;
    }
    onUpdate({ status: selectedStatus, notes });
    onClose();
  };

  const getNextStatuses = () => {
    const currentIndex = STATUS_OPTIONS.findIndex(opt => opt.value === work.status);
    if (currentIndex === -1) return STATUS_OPTIONS;
    return STATUS_OPTIONS.slice(currentIndex);
  };

  const nextStatuses = getNextStatuses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Update Work Status</h2>
              <p className="text-sm text-white/80 mt-1">
                {work.workId} - {work.garment?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-2">Current Status</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800 capitalize">
                  {work.status?.replace(/-/g, ' ')}
                </p>
                {work.tailor && (
                  <p className="text-xs text-slate-500">Tailor: {work.tailor.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Next Status Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Next Status
            </label>
            <div className="space-y-2">
              {nextStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedStatus === status.value
                        ? `border-${status.color}-500 bg-${status.color}-50`
                        : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${status.color}-100 rounded-full flex items-center justify-center`}>
                        <Icon size={18} className={`text-${status.color}-600`} />
                      </div>
                      <div>
                        <p className={`font-medium text-slate-800 ${selectedStatus === status.value ? `text-${status.color}-700` : ''}`}>
                          {status.label}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this update..."
              rows="3"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!selectedStatus}
              className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                !selectedStatus ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Update Status
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}