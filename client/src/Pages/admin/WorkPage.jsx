import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Scissors,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react"; // Removed SewingPin
import {
  fetchAllWorks,
  fetchWorksByUser,
  updateWorkStatus,
  fetchWorkStats,
} from "../../features/work/workSlice";
import showToast from "../../utils/toast";

export default function WorkPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { works, stats, pagination, loading } = useSelector((state) => state.work);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedWork, setSelectedWork] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch works based on role
  useEffect(() => {
    if (isCuttingMaster) {
      // Cutting Master sees only their assigned works
      dispatch(fetchWorksByUser({ 
        userId: user._id, 
        status: statusFilter !== "all" ? statusFilter : "" 
      }));
    } else {
      // Admin and Store Keeper see all works
      dispatch(fetchAllWorks({
        page: currentPage,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : "",
      }));
    }
    
    // Fetch stats for admin/store keeper
    if (isAdmin || isStoreKeeper) {
      dispatch(fetchWorkStats());
    }
  }, [dispatch, currentPage, debouncedSearch, statusFilter, user, isCuttingMaster]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewWork = (id) => {
    navigate(`/admin/works/${id}`);
  };

  const handleStatusUpdate = (work) => {
    setSelectedWork(work);
    setStatusNotes(work.notes || "");
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedWork) return;

    try {
      let newStatus = "";
      switch (selectedWork.status) {
        case "pending":
          newStatus = "cutting";
          break;
        case "cutting":
          newStatus = "sewing";
          break;
        case "sewing":
          newStatus = "completed";
          break;
        default:
          return;
      }

      await dispatch(updateWorkStatus({
        id: selectedWork._id,
        status: newStatus,
        notes: statusNotes,
      })).unwrap();

      showToast.success(`Work status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedWork(null);
      setStatusNotes("");
    } catch (error) {
      showToast.error("Failed to update work status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700", 
        label: "Pending",
        icon: Clock,
        nextAction: "Start Cutting",
        nextColor: "bg-blue-600",
      },
      cutting: { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        label: "Cutting",
        icon: Scissors,
        nextAction: "Start Sewing",
        nextColor: "bg-purple-600",
      },
      sewing: { 
        bg: "bg-purple-100", 
        text: "text-purple-700", 
        label: "Sewing",
        icon: Package, // Changed from SewingPin to Package
        nextAction: "Mark Complete",
        nextColor: "bg-green-600",
      },
      completed: { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        label: "Completed",
        icon: CheckCircle,
        nextAction: null,
        nextColor: null,
      },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "normal":
        return "bg-blue-100 text-blue-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "cutting", label: "Cutting" },
    { value: "sewing", label: "Sewing" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
          <Briefcase size={32} className="text-blue-600" />
          Work Assignments
        </h1>
        <p className="text-slate-500 font-medium">
          {isCuttingMaster 
            ? "Manage your assigned work tasks" 
            : "Track and manage all work assignments"}
        </p>
      </div>

      {/* Stats Cards (Admin/Store Keeper only) */}
      {(isAdmin || isStoreKeeper) && stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400 mb-1">Total Works</p>
            <p className="text-2xl font-black text-slate-800">{stats.total || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p className="text-sm text-yellow-600 mb-1">Pending</p>
            <p className="text-2xl font-black text-yellow-700">{stats.pending || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Cutting</p>
            <p className="text-2xl font-black text-blue-700">{stats.cutting || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-purple-600 mb-1">Sewing</p>
            <p className="text-2xl font-black text-purple-700">{stats.sewing || 0}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-sm text-green-600 mb-1">Completed</p>
            <p className="text-2xl font-black text-green-700">{stats.completed || 0}</p>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Work ID or Garment..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Works Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Work ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Garment
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Started
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
                    <p className="mt-2 text-slate-500">Loading works...</p>
                  </td>
                </tr>
              ) : works?.length > 0 ? (
                works.map((work) => {
                  const statusBadge = getStatusBadge(work.status);
                  const StatusIcon = statusBadge.icon;
                  const priorityBadge = getPriorityBadge(work.garment?.priority || "normal");
                  
                  return (
                    <tr key={work._id} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {work.workId || work._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {work.order?.orderId || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{work.garment?.name || "N/A"}</p>
                          <p className="text-xs text-slate-400">{work.garment?.garmentId || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span>{work.assignedTo?.name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorityBadge}`}>
                          {work.garment?.priority || "normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon size={16} className={statusBadge.text} />
                          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {work.startedAt 
                          ? new Date(work.startedAt).toLocaleDateString()
                          : "-"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewWork(work._id)}
                            className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {work.status !== "completed" && (
                            <button
                              onClick={() => handleStatusUpdate(work)}
                              className={`p-2 rounded-lg text-white ${statusBadge.nextColor} hover:opacity-90`}
                              title={statusBadge.nextAction || ""}
                            >
                              <Play size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Briefcase size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No work assignments found</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {isCuttingMaster 
                          ? "You don't have any pending work" 
                          : "Create orders to generate work assignments"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Admin/Store Keeper only) */}
        {(isAdmin || isStoreKeeper) && pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
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
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className={`p-2 rounded-lg ${
                  currentPage === pagination.pages
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">Update Work Status</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Work ID</p>
                <p className="font-mono font-bold text-blue-600">
                  {selectedWork.workId || selectedWork._id.slice(-6)}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Garment</p>
                <p className="font-bold text-slate-800">{selectedWork.garment?.name}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedWork.garment?.garmentId}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-sm font-medium text-blue-700">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  getStatusBadge(selectedWork.status).bg
                } ${getStatusBadge(selectedWork.status).text}`}>
                  {getStatusBadge(selectedWork.status).label}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-green-700">Next Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  getStatusBadge(
                    selectedWork.status === "pending" ? "cutting" :
                    selectedWork.status === "cutting" ? "sewing" :
                    "completed"
                  ).bg
                } ${
                  getStatusBadge(
                    selectedWork.status === "pending" ? "cutting" :
                    selectedWork.status === "cutting" ? "sewing" :
                    "completed"
                  ).text
                }`}>
                  {selectedWork.status === "pending" ? "Cutting" :
                   selectedWork.status === "cutting" ? "Sewing" :
                   "Completed"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows="3"
                  placeholder="Add any notes about this work..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitStatusUpdate}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all"
                >
                  Confirm & Update
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedWork(null);
                    setStatusNotes("");
                  }}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}