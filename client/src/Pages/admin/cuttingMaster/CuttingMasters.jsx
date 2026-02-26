// src/Pages/admin/cuttingMaster/CuttingMasters.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { fetchAllCuttingMasters, deleteCuttingMaster, fetchCuttingMasterStats } from "../../../features/cuttingMaster/cuttingMasterSlice";
import showToast from "../../../utils/toast";

export default function CuttingMasters() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cuttingMasters, stats, loading, pagination } = useSelector((state) => state.cuttingMaster);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const isAdmin = user?.role === "ADMIN";
  const canAdd = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  useEffect(() => {
    dispatch(fetchAllCuttingMasters({ 
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm, 
      availability: availabilityFilter 
    }));
    dispatch(fetchCuttingMasterStats());
  }, [dispatch, currentPage, itemsPerPage, searchTerm, availabilityFilter]);

  const handleAdd = () => navigate("/admin/cutting-masters/add");
  const handleView = (id) => navigate(`/admin/cutting-masters/${id}`);
  const handleEdit = (id) => navigate(`/admin/cutting-masters/edit/${id}`);

  const handleDeleteClick = (master) => {
    setSelectedMaster(master);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteCuttingMaster(selectedMaster._id)).unwrap();
      showToast.success("Cutting Master deleted successfully");
      setShowDeleteModal(false);
      setSelectedMaster(null);
    } catch (error) {
      showToast.error(error || "Failed to delete");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const availabilityOptions = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
  ];

  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Cutting Masters</p>
              <p className="text-3xl font-black text-slate-800">{stats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Scissors size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Available</p>
              <p className="text-3xl font-black text-green-700">{stats?.available || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
            <Briefcase size={32} className="text-orange-600" />
            Cutting Masters
          </h1>
          <p className="text-slate-500 font-medium">Manage cutting masters and their work</p>
        </div>
        {canAdd && (
          <button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Cutting Master
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
          {availabilityOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Work Stats</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center">Loading...</td></tr>
              ) : cuttingMasters?.length > 0 ? (
                cuttingMasters.map((master) => (
                  <tr key={master._id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-mono font-bold text-orange-600">{master.cuttingMasterId}</td>
                    <td className="px-6 py-4 font-medium">{master.name}</td>
                    <td className="px-6 py-4">{master.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{master.email}</td>
                    <td className="px-6 py-4">{master.experience || 0} years</td>
                    <td className="px-6 py-4">
                      {master.isActive ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600"><XCircle size={14} /> Inactive</span>
                      )}
                      {!master.isAvailable && <span className="text-xs text-red-500 block mt-1">Unavailable</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div>Total: {master.workStats?.total || 0}</div>
                        <div className="text-green-600">Completed: {master.workStats?.completed || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(master._id)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Eye size={16} /></button>
                        {canEdit && <button onClick={() => handleEdit(master._id)} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Edit size={16} /></button>}
                        {canDelete && <button onClick={() => handleDeleteClick(master)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-6 py-12 text-center">No cutting masters found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                className="px-2 py-1 bg-slate-50 border rounded-lg text-sm">
                {itemsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="text-sm text-slate-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:text-slate-300">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.pages}
                className="p-2 rounded-lg disabled:text-slate-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white max-w-md rounded-2xl p-6">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Delete Cutting Master?</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete {selectedMaster.name}?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-200 rounded-xl">Cancel</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}