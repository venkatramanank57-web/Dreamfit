import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Scissors,
  Users,
} from "lucide-react";
import { fetchAllWorks, updateWorkStatus, assignTailor } from "../../features/work/workSlice";
// import { fetchAllTailors } from "../../features/user/userSlice";
import showToast from "../../utils/toast";
import StatusBadge from "../../components/common/StatusBadge";
import AssignTailorModal from "../../components/modals/AssignTailorModal";

export default function WorkPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { works, stats, pagination, loading } = useSelector((state) => state.work);
  const { tailors } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    priority: "all",
    search: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";

  useEffect(() => {
    dispatch(fetchAllWorks({ page: currentPage, ...filters }));
    if (isCuttingMaster) {
      dispatch(fetchAllTailors());
    }
  }, [dispatch, currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewWork = (workId) => {
    navigate(`/admin/works/${workId}`);
  };

  const handleStatusUpdate = async (workId, newStatus) => {
    try {
      await dispatch(updateWorkStatus({ id: workId, status: newStatus })).unwrap();
      showToast.success(`Status updated to ${newStatus}`);
      setShowStatusMenu(null);
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  const handleAssignTailor = (work) => {
    setSelectedWork(work);
    setShowAssignModal(true);
  };

  const handleTailorAssigned = async (workId, tailorId) => {
    try {
      await dispatch(assignTailor({ id: workId, tailorId })).unwrap();
      showToast.success("Tailor assigned successfully");
      setShowAssignModal(false);
      setSelectedWork(null);
    } catch (error) {
      showToast.error("Failed to assign tailor");
    }
  };

  const getStatusOptions = (currentStatus) => {
    const flow = {
      pending: ["accepted"],
      accepted: ["cutting"],
      cutting: ["stitching"],
      stitching: ["iron"],
      iron: ["ready-to-deliver"],
      "ready-to-deliver": ["completed"]
    };
    return flow[currentStatus] || [];
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "accepted", label: "Accepted", color: "blue" },
    { value: "cutting", label: "Cutting", color: "purple" },
    { value: "stitching", label: "Stitching", color: "indigo" },
    { value: "iron", label: "Iron", color: "orange" },
    { value: "ready-to-deliver", label: "Ready to Deliver", color: "green" },
    { value: "completed", label: "Completed", color: "emerald" }
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "high", label: "High", color: "red" },
    { value: "normal", label: "Normal", color: "blue" },
    { value: "low", label: "Low", color: "green" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Total Works</p>
          <p className="text-3xl font-black text-slate-800">{stats?.total || 0}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-3xl font-black text-yellow-700">{stats?.pending || 0}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600">Accepted</p>
          <p className="text-3xl font-black text-blue-700">{stats?.accepted || 0}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
          <p className="text-sm text-purple-600">In Progress</p>
          <p className="text-3xl font-black text-purple-700">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <p className="text-sm text-green-600">Ready</p>
          <p className="text-3xl font-black text-green-700">{stats?.ready || 0}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-sm text-emerald-600">Completed</p>
          <p className="text-3xl font-black text-emerald-700">{stats?.completed || 0}</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
          Work Management
        </h1>
        <p className="text-slate-500 font-medium">Track and manage all production works</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Work ID..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange("dateRange", e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
          {dateRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
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
                  Delivery Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Tailor
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
                works.map((work) => (
                  <tr key={work._id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {work.workId}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {work.order?.orderId}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{work.garment?.name}</p>
                        <p className="text-xs text-slate-400">{work.garment?.garmentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(work.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        work.priority === 'high' ? 'bg-red-100 text-red-700' :
                        work.priority === 'low' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {work.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => isCuttingMaster && setShowStatusMenu(showStatusMenu === work._id ? null : work._id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            work.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            work.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            work.status === 'cutting' ? 'bg-purple-100 text-purple-700' :
                            work.status === 'stitching' ? 'bg-indigo-100 text-indigo-700' :
                            work.status === 'iron' ? 'bg-orange-100 text-orange-700' :
                            work.status === 'ready-to-deliver' ? 'bg-green-100 text-green-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {work.status?.replace('-', ' ')}
                        </button>

                        {isCuttingMaster && showStatusMenu === work._id && (
                          <div className="absolute z-10 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200">
                            {getStatusOptions(work.status).map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(work._id, status)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                              >
                                {status.replace('-', ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {work.assignedTo ? (
                        <span className="text-sm text-slate-600">{work.assignedTo.name}</span>
                      ) : (
                        isCuttingMaster && (
                          <button
                            onClick={() => handleAssignTailor(work)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Users size={14} />
                            Assign Tailor
                          </button>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewWork(work._id)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Clock size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No works found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="text-slate-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
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

      {/* Assign Tailor Modal */}
      {showAssignModal && selectedWork && (
        <AssignTailorModal
          work={selectedWork}
          tailors={tailors}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedWork(null);
          }}
          onAssign={handleTailorAssigned}
        />
      )}
    </div>
  );
}