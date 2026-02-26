// src/Pages/admin/storeKeeper/StoreKeepers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, XCircle, Store, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllStoreKeepers, deleteStoreKeeper, fetchStoreKeeperStats } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";

export default function StoreKeepers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { storeKeepers, stats, loading, pagination } = useSelector((state) => state.storeKeeper);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const isAdmin = user?.role === "ADMIN";
  const canAdd = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  useEffect(() => {
    dispatch(fetchAllStoreKeepers({ page: currentPage, limit: itemsPerPage, search: searchTerm, department: departmentFilter }));
    dispatch(fetchStoreKeeperStats());
  }, [dispatch, currentPage, itemsPerPage, searchTerm, departmentFilter]);

  const handleAdd = () => navigate("/admin/store-keepers/add");
  const handleView = (id) => navigate(`/admin/store-keepers/${id}`);
  const handleEdit = (id) => navigate(`/admin/store-keepers/edit/${id}`);
  const handleDeleteClick = (item) => { setSelected(item); setShowDeleteModal(true); };
  const handleDeleteConfirm = async () => {
    try { await dispatch(deleteStoreKeeper(selected._id)).unwrap(); showToast.success("Deleted"); setShowDeleteModal(false); }
    catch (e) { showToast.error(e || "Failed"); }
  };

  const departments = [
    { value: "all", label: "All Depts" },
    { value: "inventory", label: "Inventory" },
    { value: "sales", label: "Sales" },
    { value: "both", label: "Both" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between">
            <div><p className="text-slate-500">Total Store Keepers</p><p className="text-3xl font-black">{stats?.total || 0}</p></div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><Store size={24} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <div className="flex justify-between">
            <div><p className="text-green-600">Active</p><p className="text-3xl font-black text-green-700">{stats?.departmentStats?.reduce((a, b) => a + b.count, 0) || 0}</p></div>
            <div className="w-12 h-12 bg-green-100 rounded-xl"><CheckCircle size={24} className="text-green-600 m-3" /></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm flex items-center justify-between">
        <div><h1 className="text-3xl font-black flex items-center gap-3"><Store size={32} className="text-green-600" /> Store Keepers</h1></div>
        {canAdd && (
          <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2">
            <Plus size={20} /> Add Store Keeper
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:ring-4 focus:ring-green-500/10" />
        </div>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-4 py-3 bg-white border rounded-xl">
          {departments.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr><th className="px-6 py-4 text-left text-xs font-black uppercase">ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Department</th><th>Status</th><th>Orders</th><th>Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan="8" className="text-center py-12">Loading...</td></tr> :
             storeKeepers?.length > 0 ? storeKeepers.map(s => (
              <tr key={s._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-green-600">{s.storeKeeperId}</td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.phone}</td>
                <td className="px-6 py-4 text-sm">{s.email}</td>
                <td className="px-6 py-4 capitalize">{s.department}</td>
                <td className="px-6 py-4">{s.isActive ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Active</span> : <span className="text-red-600"><XCircle size={14} /> Inactive</span>}</td>
                <td className="px-6 py-4 text-xs">{s.stats?.total || 0} orders</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleView(s._id)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Eye size={16} /></button>
                    {canEdit && <button onClick={() => handleEdit(s._id)} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Edit size={16} /></button>}
                    {canDelete && <button onClick={() => handleDeleteClick(s)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16} /></button>}
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="8" className="text-center py-12">No store keepers</td></tr>}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 border rounded-lg text-sm">
              {[5,10,25,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-2 disabled:text-slate-300"><ChevronLeft size={20} /></button>
              <span className="py-2">Page {currentPage} of {pagination.pages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p+1))} disabled={currentPage===pagination.pages} className="p-2 disabled:text-slate-300"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-md rounded-2xl p-6">
            <h3 className="text-xl font-black text-center mb-2">Delete Store Keeper?</h3>
            <p className="text-center text-slate-500 mb-6">Delete {selected.name}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-200 rounded-xl">Cancel</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}