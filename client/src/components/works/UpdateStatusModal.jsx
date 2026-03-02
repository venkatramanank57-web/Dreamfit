// components/works/UpdateStatusModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Scissors, 
  Ruler, 
  Truck, 
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import showToast from '../../utils/toast';

// ✅ Complete status workflow for Cutting Master
const STATUS_OPTIONS = [
  { 
    value: 'cutting-started', 
    label: 'Start Cutting', 
    icon: Scissors, 
    color: 'purple',
    description: 'Begin cutting the fabric',
    stage: 'cutting'
  },
  { 
    value: 'cutting-completed', 
    label: 'Complete Cutting', 
    icon: CheckSquare, 
    color: 'indigo',
    description: 'Cutting work finished',
    stage: 'cutting'
  },
  { 
    value: 'sewing-started', 
    label: 'Start Sewing', 
    icon: Ruler, 
    color: 'pink',
    description: 'Begin sewing the garment',
    stage: 'sewing'
  },
  { 
    value: 'sewing-completed', 
    label: 'Complete Sewing', 
    icon: CheckSquare, 
    color: 'teal',
    description: 'Sewing work finished',
    stage: 'sewing'
  },
  { 
    value: 'ironing', 
    label: 'Ironing', 
    icon: Truck, 
    color: 'orange',
    description: 'Iron and finish the garment',
    stage: 'finishing'
  },
  { 
    value: 'ready-to-deliver', 
    label: 'Ready to Deliver', 
    icon: CheckCircle, 
    color: 'green',
    description: 'Garment is ready for delivery',
    stage: 'finishing'
  }
];

// ✅ Workflow order - defines which status comes next
const WORKFLOW_ORDER = [
  'pending',
  'accepted',
  'cutting-started',
  'cutting-completed',
  'sewing-started',
  'sewing-completed',
  'ironing',
  'ready-to-deliver'
];

export default function UpdateStatusModal({ work, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Get current status index in workflow
  const currentStatusIndex = WORKFLOW_ORDER.indexOf(work?.status);
  
  // ✅ Filter statuses based on workflow (only show next logical statuses)
  const getAvailableStatuses = () => {
    // If no work or no status, show all
    if (!work?.status) return STATUS_OPTIONS;
    
    // Based on current status, determine what's next
    switch(work.status) {
      case 'accepted':
        // After acceptance, can only start cutting
        return STATUS_OPTIONS.filter(opt => opt.value === 'cutting-started');
      
      case 'cutting-started':
        // After starting cutting, can only complete cutting
        return STATUS_OPTIONS.filter(opt => opt.value === 'cutting-completed');
      
      case 'cutting-completed':
        // After cutting completed, can start sewing
        return STATUS_OPTIONS.filter(opt => opt.value === 'sewing-started');
      
      case 'sewing-started':
        // After starting sewing, can only complete sewing
        return STATUS_OPTIONS.filter(opt => opt.value === 'sewing-completed');
      
      case 'sewing-completed':
        // After sewing completed, can iron
        return STATUS_OPTIONS.filter(opt => opt.value === 'ironing');
      
      case 'ironing':
        // After ironing, can mark ready
        return STATUS_OPTIONS.filter(opt => opt.value === 'ready-to-deliver');
      
      case 'ready-to-deliver':
        // Terminal state - no further updates
        return [];
      
      default:
        // For any other status (like pending), show all
        return STATUS_OPTIONS;
    }
  };

  const availableStatuses = getAvailableStatuses();

  // ✅ Check if status is allowed based on workflow
  const isStatusAllowed = (statusValue) => {
    const statusIndex = WORKFLOW_ORDER.indexOf(statusValue);
    return statusIndex > currentStatusIndex; // Only allow forward progress
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent any default form submission
    
    console.log('🔘 Submit clicked - selectedStatus:', selectedStatus);
    console.log('📝 Notes:', notes);
    console.log('📦 Work:', work);
    
    if (!selectedStatus) {
      console.log('❌ No status selected');
      showToast.error('Please select a status');
      return;
    }

    // ✅ Validate workflow
    if (!isStatusAllowed(selectedStatus)) {
      showToast.error('Invalid status transition. Please follow the workflow order.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📤 Calling onUpdate with:', selectedStatus, notes);
      await onUpdate(selectedStatus, notes);
      console.log('✅ Update successful');
      showToast.success(`Status updated to ${selectedStatus.replace(/-/g, ' ')}`);
      onClose(); // Close modal on success
    } catch (error) {
      console.error('❌ Update failed:', error);
      showToast.error(error?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get status badge color based on status
  const getStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'cutting-started': 'bg-purple-100 text-purple-700',
      'cutting-completed': 'bg-indigo-100 text-indigo-700',
      'sewing-started': 'bg-pink-100 text-pink-700',
      'sewing-completed': 'bg-teal-100 text-teal-700',
      'ironing': 'bg-orange-100 text-orange-700',
      'ready-to-deliver': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Update Work Status</h2>
              <p className="text-sm text-white/80 mt-1 flex items-center gap-2">
                <span className="font-mono">{work?.workId}</span>
                <span>•</span>
                <span>{work?.garment?.name}</span>
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

        {/* Current Status Info */}
        <div className="px-6 pt-4">
          <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(work?.status)}`}>
              {work?.status?.replace(/-/g, ' ') || 'Unknown'}
            </span>
          </div>

          {/* Work Progress Indicator */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round((currentStatusIndex / (WORKFLOW_ORDER.length - 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (WORKFLOW_ORDER.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Status Options */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            Select Next Status
          </h3>
          
          {availableStatuses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No further status updates available</p>
              <p className="text-xs text-slate-400 mt-2">This work is already completed</p>
            </div>
          ) : (
            availableStatuses.map((status) => {
              const Icon = status.icon;
              const isSelected = selectedStatus === status.value;
              const isAllowed = isStatusAllowed(status.value);
              
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    if (isAllowed) {
                      console.log('📌 Status selected:', status.value);
                      setSelectedStatus(status.value);
                    } else {
                      showToast.warning('Please follow the workflow order');
                    }
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `border-${status.color}-500 bg-${status.color}-50`
                      : isAllowed
                        ? 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                        : 'border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!isAllowed}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? `bg-${status.color}-100` : 'bg-slate-100'
                    }`}>
                      <Icon size={20} className={isSelected ? `text-${status.color}-600` : 'text-slate-600'} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isSelected ? `text-${status.color}-700` : 'text-slate-700'}`}>
                        {status.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{status.description}</p>
                    </div>
                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full bg-${status.color}-500 flex items-center justify-center`}>
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* Notes Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <FileText size={14} />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status update (measurements, issues, special instructions, etc.)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows="3"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus || loading}
              className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                (!selectedStatus || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  Update Status
                  <CheckCircle size={18} />
                </>
              )}
            </button>
          </div>

          {/* Workflow Hint */}
          <div className="text-xs text-slate-400 text-center mt-2">
            <Clock size={12} className="inline mr-1" />
            Following workflow: Accepted → Cutting → Sewing → Ironing → Ready
          </div>
        </form>
      </div>
    </div>
  );
}