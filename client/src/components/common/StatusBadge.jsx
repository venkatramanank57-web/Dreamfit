import React from "react";

export default function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    const config = {
      // Work Status
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      accepted: { bg: "bg-blue-100", text: "text-blue-700", label: "Accepted" },
      cutting: { bg: "bg-purple-100", text: "text-purple-700", label: "Cutting" },
      stitching: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Stitching" },
      iron: { bg: "bg-orange-100", text: "text-orange-700", label: "Iron" },
      "ready-to-deliver": { bg: "bg-green-100", text: "text-green-700", label: "Ready to Deliver" },
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
      
      // Order Status
      draft: { bg: "bg-slate-100", text: "text-slate-700", label: "Draft" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
      "in-progress": { bg: "bg-purple-100", text: "text-purple-700", label: "In Progress" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
      
      // Priority
      high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
      normal: { bg: "bg-blue-100", text: "text-blue-700", label: "Normal" },
      low: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
    };
    
    return config[status] || { bg: "bg-slate-100", text: "text-slate-700", label: status };
  };

  const { bg, text, label } = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}