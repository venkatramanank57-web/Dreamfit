// src/components/common/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, icon, bgColor, borderColor }) {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800">{value}</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/60 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}