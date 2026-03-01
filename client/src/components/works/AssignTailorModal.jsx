// components/works/AssignTailorModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Search, User, Scissors, ChevronRight } from 'lucide-react';
import { fetchAllTailors } from '../../features/tailor/tailorSlice';
import showToast from '../../utils/toast';

export default function AssignTailorModal({ work, onClose, onAssign }) {
  const dispatch = useDispatch();
  const { tailors, loading } = useSelector((state) => state.tailor);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [filteredTailors, setFilteredTailors] = useState([]);

  useEffect(() => {
    dispatch(fetchAllTailors());
  }, [dispatch]);

  useEffect(() => {
    if (tailors) {
      const filtered = tailors.filter(tailor => 
        tailor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tailor.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tailor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTailors(filtered);
    }
  }, [tailors, searchQuery]);

  const handleAssign = () => {
    if (!selectedTailor) {
      showToast.error('Please select a tailor');
      return;
    }
    onAssign(selectedTailor._id);
    onClose();
  };

  const getStatusColor = (tailor) => {
    if (tailor.onLeave) return 'bg-red-100 text-red-700';
    if (tailor.currentWorkload > 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (tailor) => {
    if (tailor.onLeave) return 'On Leave';
    if (tailor.currentWorkload > 5) return 'Busy';
    return 'Available';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Assign Tailor</h2>
              <p className="text-sm text-white/80 mt-1">
                Work: {work.workId} - {work.garment?.name}
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Work Summary */}
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-purple-600 mb-1">Order ID</p>
                <p className="font-medium text-slate-800">{work.order?.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 mb-1">Garment</p>
                <p className="font-medium text-slate-800">{work.garment?.name}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 mb-1">Customer</p>
                <p className="font-medium text-slate-800">{work.order?.customer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 mb-1">Est. Delivery</p>
                <p className="font-medium text-slate-800">
                  {new Date(work.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tailor by name, ID or specialization..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Tailors List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading tailors...</p>
              </div>
            ) : filteredTailors.length > 0 ? (
              filteredTailors.map((tailor) => (
                <button
                  key={tailor._id}
                  onClick={() => setSelectedTailor(tailor)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTailor?._id === tailor._id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Scissors size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{tailor.name}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>ID: {tailor.employeeId}</span>
                          <span>•</span>
                          <span>{tailor.specialization || 'General'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tailor)}`}>
                        {getStatusText(tailor)}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Workload: {tailor.currentWorkload || 0}/10
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <User size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No tailors found</p>
              </div>
            )}
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
              onClick={handleAssign}
              disabled={!selectedTailor}
              className={`flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2 ${
                !selectedTailor ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Assign to {selectedTailor?.name}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}