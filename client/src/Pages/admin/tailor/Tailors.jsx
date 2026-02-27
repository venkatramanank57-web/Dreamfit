import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Scissors,
  UserCheck,
  UserX,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchAllTailors, deleteTailor, fetchTailorStats } from "../../../features/tailor/tailorSlice";
import showToast from "../../../utils/toast";
import StatusBadge from "../../../components/common/StatusBadge";
import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

export default function Tailors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { tailors, tailorStats, loading, pagination } = useSelector((state) => state.tailor);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin;
  const canAdd = isAdmin || isStoreKeeper;

  // ✅ Fetch tailors with pagination
  useEffect(() => {
    dispatch(fetchAllTailors({ 
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm, 
      status: statusFilter,
      availability: availabilityFilter 
    }));
    dispatch(fetchTailorStats());
  }, [dispatch, currentPage, itemsPerPage, searchTerm, statusFilter, availabilityFilter]);

  // ✅ Handle Add Tailor - with basePath
  const handleAddTailor = () => {
    navigate(`${basePath}/tailors/add`);
  };

  // ✅ Handle View Tailor - with basePath
  const handleViewTailor = (id) => {
    navigate(`${basePath}/tailors/${id}`);
  };

  // ✅ Handle Edit Tailor - with basePath
  const handleEditTailor = (id) => {
    if (canEdit) {
      navigate(`${basePath}/tailors/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit tailors");
    }
  };

  const handleDeleteClick = (tailor) => {
    setSelectedTailor(tailor);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteTailor(selectedTailor._id)).unwrap();
      showToast.success("Tailor deleted successfully");
      setShowDeleteModal(false);
      setSelectedTailor(null);
    } catch (error) {
      showToast.error(error || "Failed to delete tailor");
    }
  };

  const handleLeaveUpdate = (tailor) => {
    setSelectedTailor(tailor);
    setShowLeaveModal(true);
  };

  const handleLeaveStatusUpdated = () => {
    dispatch(fetchAllTailors({ 
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm, 
      status: statusFilter,
      availability: availabilityFilter 
    }));
  };

  // ✅ Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // ✅ Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const getLeaveStatusIcon = (status) => {
    switch(status) {
      case "present": return <UserCheck size={16} className="text-green-600" />;
      case "leave": return <UserX size={16} className="text-red-600" />;
      case "half-day": return <Coffee size={16} className="text-orange-600" />;
      case "holiday": return <Calendar size={16} className="text-purple-600" />;
      default: return <UserCheck size={16} className="text-green-600" />;
    }
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "present", label: "Present" },
    { value: "leave", label: "On Leave" },
    { value: "half-day", label: "Half Day" },
    { value: "holiday", label: "Holiday" },
  ];

  const availabilityOptions = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
  ];

  // ✅ Items per page options
  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Tailors</p>
              <p className="text-3xl font-black text-slate-800">{tailorStats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Scissors size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Present</p>
              <p className="text-3xl font-black text-green-700">{tailorStats?.present || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">On Leave</p>
              <p className="text-3xl font-black text-red-700">{tailorStats?.onLeave || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <UserX size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Half Day</p>
              <p className="text-3xl font-black text-orange-700">{tailorStats?.halfDay || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Coffee size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Available</p>
              <p className="text-3xl font-black text-purple-700">{tailorStats?.available || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Tailors Management
          </h1>
          <p className="text-slate-500 font-medium">Manage all tailors and their work assignments</p>
        </div>
        {canAdd && (
          <button
            onClick={handleAddTailor}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Tailor
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

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

      {/* Tailors Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Tailor ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Work Stats
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-slate-500">Loading tailors...</p>
                  </td>
                </tr>
              ) : tailors?.length > 0 ? (
                tailors.map((tailor) => (
                  <tr key={tailor._id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {tailor.tailorId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {tailor.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{tailor.name}</p>
                          <p className="text-xs text-slate-400">{tailor.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tailor.phone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tailor.specialization?.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{tailor.experience || 0} years</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getLeaveStatusIcon(tailor.leaveStatus)}
                        <span className={`text-sm font-medium ${
                          tailor.leaveStatus === 'present' ? 'text-green-600' :
                          tailor.leaveStatus === 'leave' ? 'text-red-600' :
                          tailor.leaveStatus === 'half-day' ? 'text-orange-600' :
                          'text-purple-600'
                        }`}>
                          {tailor.leaveStatus?.replace('-', ' ')}
                        </span>
                      </div>
                      {!tailor.isAvailable && (
                        <span className="text-xs text-red-500 block mt-1">Unavailable</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Total:</span>
                          <span className="font-bold">{tailor.workStats?.total || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">Completed:</span>
                          <span className="font-bold">{tailor.workStats?.completed || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-orange-600">Pending:</span>
                          <span className="font-bold">{tailor.workStats?.pending || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewTailor(tailor._id)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {(canEdit || tailor._id === user?.tailorId) && (
                          <button
                            onClick={() => handleLeaveUpdate(tailor)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                            title="Update Leave Status"
                          >
                            <Calendar size={16} />
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => handleEditTailor(tailor._id)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(tailor)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Scissors size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No tailors found</p>
                      {canAdd && (
                        <button
                          onClick={handleAddTailor}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Add Your First Tailor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination Section */}
        {pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">entries</span>
              </div>

              {/* Showing info */}
              <div className="text-sm text-slate-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  
                  // Show first page, last page, and pages around current page
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === pagination.pages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTailor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Delete Tailor</h2>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{selectedTailor.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Status Modal */}
      {showLeaveModal && selectedTailor && (
        <LeaveStatusModal
          tailor={selectedTailor}
          onClose={() => {
            setShowLeaveModal(false);
            setSelectedTailor(null);
          }}
          onUpdate={handleLeaveStatusUpdated}
        />
      )}
    </div>
  );
}