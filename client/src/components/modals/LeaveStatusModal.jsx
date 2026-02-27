import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Calendar, AlertCircle } from "lucide-react";
import { updateLeaveStatus } from "../../features/tailor/tailorSlice";
import showToast from "../../utils/toast";

export default function LeaveStatusModal({ tailor, onClose, onUpdate }) {
  const dispatch = useDispatch();
  
  // Debug flag
  const DEBUG = true;
  
  const logDebug = (message, data) => {
    if (DEBUG) {
      console.log(`[LeaveModal Debug] ${message}`, data || '');
    }
  };

  // Format date helper
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (error) {
      return "";
    }
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Initialize state
  const [leaveData, setLeaveData] = useState({
    leaveStatus: tailor?.leaveStatus || "present",
    leaveFrom: formatDateForInput(tailor?.leaveFrom),
    leaveTo: formatDateForInput(tailor?.leaveTo),
    leaveReason: tailor?.leaveReason || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Log initial data
  useEffect(() => {
    logDebug('Modal opened for tailor:', {
      id: tailor?._id,
      name: tailor?.name,
      currentStatus: tailor?.leaveStatus,
    });
  }, []);

  // ===== UPDATED VALIDATION FUNCTION =====
  const validateDates = () => {
    const errors = {};
    
    if (leaveData.leaveStatus !== "present") {
      // Validate From Date
      if (!leaveData.leaveFrom) {
        errors.leaveFrom = "From date is required";
      }
      
      // Validate To Date for full day leave
      if (leaveData.leaveStatus === "leave" && !leaveData.leaveTo) {
        errors.leaveTo = "To date is required for full day leave";
      }

      // Validate Date Order
      if (leaveData.leaveFrom && leaveData.leaveTo) {
        const fromDate = new Date(leaveData.leaveFrom);
        const toDate = new Date(leaveData.leaveTo);
        
        // Reset hours to compare only the calendar date
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        
        if (toDate < fromDate) {
          errors.dateOrder = "Leave to date cannot be before from date";
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== UPDATED SUBMIT HANDLER =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    logDebug('Form submitted with data:', leaveData);

    // 1. Run validation
    const isValid = validateDates();

    // 2. Handle validation errors
    if (!isValid) {
      // Check for dateOrder specifically first
      if (validationErrors.dateOrder) {
        showToast.error(validationErrors.dateOrder);
      } else {
        const firstError = Object.values(validationErrors)[0];
        showToast.error(firstError);
      }
      return;
    }

    // 3. Check reason
    if (leaveData.leaveStatus !== "present" && !leaveData.leaveReason.trim()) {
      showToast.error("Please enter leave reason");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLeaveData = {
        leaveStatus: leaveData.leaveStatus,
        leaveFrom: leaveData.leaveFrom,
        leaveReason: leaveData.leaveReason,
        ...(leaveData.leaveStatus === "leave" 
          ? { leaveTo: leaveData.leaveTo }
          : { leaveTo: leaveData.leaveFrom }
        )
      };

      const result = await dispatch(updateLeaveStatus({ 
        id: tailor._id, 
        leaveData: finalLeaveData
      })).unwrap();
      
      showToast.success(`Leave status updated to ${leaveData.leaveStatus}`);
      onUpdate();
      onClose();
    } catch (error) {
      logDebug('Update failed:', error);
      showToast.error(error?.message || "Failed to update leave status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    logDebug('Status changed to:', newStatus);
    
    setLeaveData({ 
      ...leaveData, 
      leaveStatus: newStatus,
      ...(newStatus === "present" ? { 
        leaveFrom: "", 
        leaveTo: "", 
        leaveReason: "" 
      } : {})
    });
    setValidationErrors({});
  };

  const handleFromDateChange = (e) => {
    const newFrom = e.target.value;
    logDebug('From date changed to:', newFrom);
    
    if (leaveData.leaveStatus === "half-day" || leaveData.leaveStatus === "holiday") {
      setLeaveData({ 
        ...leaveData, 
        leaveFrom: newFrom,
        leaveTo: newFrom
      });
    } else if (leaveData.leaveStatus === "leave" && leaveData.leaveTo) {
      if (new Date(leaveData.leaveTo) < new Date(newFrom)) {
        setLeaveData({ 
          ...leaveData, 
          leaveFrom: newFrom,
          leaveTo: ""
        });
      } else {
        setLeaveData({ ...leaveData, leaveFrom: newFrom });
      }
    } else {
      setLeaveData({ ...leaveData, leaveFrom: newFrom });
    }
    
    setValidationErrors({});
  };

  // ===== UPDATED TO DATE CHANGE HANDLER =====
  const handleToDateChange = (e) => {
    const newTo = e.target.value;
    logDebug('To date changed to:', newTo);
    
    // Check if from date exists and new to date is valid
    if (leaveData.leaveFrom) {
      const fromDate = new Date(leaveData.leaveFrom);
      const toDate = new Date(newTo);
      
      // Reset hours for comparison
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      
      if (toDate < fromDate) {
        // Show error and set the date with error state
        setValidationErrors({ 
          ...validationErrors, 
          dateOrder: "To date cannot be before from date" 
        });
        setLeaveData({ ...leaveData, leaveTo: newTo }); // Still set the date, but keep error visible
      } else {
        // Clear date error if valid
        setValidationErrors((prev) => {
          const { dateOrder, ...rest } = prev;
          return rest;
        });
        setLeaveData({ ...leaveData, leaveTo: newTo });
      }
    } else {
      // If no from date selected, just set the date
      setLeaveData({ ...leaveData, leaveTo: newTo });
      setValidationErrors({});
    }
  };

  const handleReasonChange = (e) => {
    setLeaveData({ ...leaveData, leaveReason: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        {/* Header with gap */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-black text-white">Update Leave Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content with top and bottom gaps */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Tailor Info with top gap */}
          <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-600 font-medium">Tailor: {tailor?.name}</p>
            <p className="text-xs text-blue-500">{tailor?.tailorId}</p>
            <p className="text-xs text-blue-400 mt-2">
              Current Status: <span className="font-bold capitalize">{tailor?.leaveStatus?.replace('-', ' ')}</span>
            </p>
          </div>

          {/* Debug Panel with gap */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-6 py-3 bg-gray-900 text-green-400 text-xs font-mono border-b border-gray-800">
              <details>
                <summary className="cursor-pointer">🔍 Debug Info</summary>
                <div className="mt-2 space-y-1">
                  <div>Tailor ID: {tailor?._id}</div>
                  <div>Current Status: {tailor?.leaveStatus}</div>
                  <div>Form Data: {JSON.stringify(leaveData, null, 2)}</div>
                  <div>Validation Errors: {JSON.stringify(validationErrors, null, 2)}</div>
                </div>
              </details>
            </div>
          )}

          {/* Form with proper gaps */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Leave Status */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-500">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={leaveData.leaveStatus}
                onChange={handleStatusChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              >
                <option value="present">Present</option>
                <option value="leave">Full Day Leave</option>
                <option value="half-day">Half Day Leave</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>

            {/* Leave From */}
            {leaveData.leaveStatus !== "present" && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-slate-500">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      type="date"
                      value={leaveData.leaveFrom}
                      onChange={handleFromDateChange}
                      min={today}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        validationErrors.leaveFrom ? 'border-red-500' : 'border-slate-200'
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.leaveFrom && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.leaveFrom}
                    </p>
                  )}
                </div>

                {/* Leave To - Only for full day leave */}
                {leaveData.leaveStatus === "leave" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-slate-500">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="date"
                        value={leaveData.leaveTo}
                        onChange={handleToDateChange}
                        min={leaveData.leaveFrom || today}
                        className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                          validationErrors.leaveTo || validationErrors.dateOrder ? 'border-red-500' : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.leaveTo && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.leaveTo}
                      </p>
                    )}
                  </div>
                )}

                {/* Note for half-day/holiday */}
                {(leaveData.leaveStatus === "half-day" || leaveData.leaveStatus === "holiday") && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
                    <p className="text-xs text-blue-600">
                      <span className="font-bold">Note:</span> For {leaveData.leaveStatus === "half-day" ? "half day leave" : "holiday"}, 
                      the leave is for a single day.
                    </p>
                  </div>
                )}

                {/* Date Order Error Message */}
                {validationErrors.dateOrder && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {validationErrors.dateOrder}
                    </p>
                  </div>
                )}

                {/* Leave Reason */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-black uppercase text-slate-500">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={leaveData.leaveReason}
                    onChange={handleReasonChange}
                    rows="3"
                    placeholder="Enter reason for leave..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    required
                  />
                </div>
              </>
            )}

            {/* Info Message */}
            {leaveData.leaveStatus !== "present" && (
              <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-200">
                <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-700 mb-1">Important</p>
                  <p className="text-xs text-orange-600">
                    When a tailor is on leave, they will not appear in the assignment list for new works.
                  </p>
                </div>
              </div>
            )}

            {/* Actions with bottom gap */}
            <div className="flex gap-3 pt-6 pb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-4 rounded-xl font-black transition-all ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}