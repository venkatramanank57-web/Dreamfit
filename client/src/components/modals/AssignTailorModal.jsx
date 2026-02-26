import React, { useState } from "react";
import { X, Search, UserCheck } from "lucide-react";

export default function AssignTailorModal({ work, tailors, onClose, onAssign }) {
  const [selectedTailor, setSelectedTailor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTailors = tailors?.filter(tailor => 
    tailor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tailor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTailor) {
      onAssign(work._id, selectedTailor);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Assign Tailor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Work Info */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Work ID: {work.workId}</p>
          <p className="text-lg font-bold text-slate-800">{work.garment?.name}</p>
          <p className="text-sm text-slate-600">Order: {work.order?.orderId}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tailors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Tailor List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredTailors.length > 0 ? (
              filteredTailors.map((tailor) => (
                <label
                  key={tailor._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTailor === tailor._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="tailor"
                    value={tailor._id}
                    checked={selectedTailor === tailor._id}
                    onChange={(e) => setSelectedTailor(e.target.value)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {tailor.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{tailor.name}</p>
                    <p className="text-xs text-slate-400">{tailor.email}</p>
                  </div>
                  {selectedTailor === tailor._id && (
                    <UserCheck size={20} className="text-blue-600" />
                  )}
                </label>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No tailors found
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!selectedTailor}
              className={`flex-1 px-6 py-3 rounded-xl font-black transition-all ${
                selectedTailor
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Assign Tailor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}