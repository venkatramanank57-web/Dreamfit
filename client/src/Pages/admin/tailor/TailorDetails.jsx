import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Scissors,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Coffee,
  Star,
  MessageCircle,
  Download,
} from "lucide-react";
import { fetchTailorById, deleteTailor } from "../../../features/tailor/tailorSlice";
import showToast from "../../../utils/toast";
import StatusBadge from "../../../components/common/StatusBadge";
import LeaveStatusModal from "../../../components/modals/LeaveStatusModal";

export default function TailorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTailor, works, workStats, loading } = useSelector((state) => state.tailor);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, works, feedback

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  const isTailorSelf = user?.tailorId === id;
  
  const canEdit = isAdmin || isStoreKeeper || isTailorSelf;
  const canDelete = isAdmin;
  const canUpdateLeave = isAdmin || isStoreKeeper || isCuttingMaster || isTailorSelf;

  useEffect(() => {
    if (id) {
      dispatch(fetchTailorById(id));
    }
  }, [dispatch, id]);

  // ✅ Handle Back - with basePath
  const handleBack = () => {
    navigate(`${basePath}/tailors`);
  };

  // ✅ Handle Edit - with basePath
  const handleEdit = () => {
    if (canEdit) {
      navigate(`${basePath}/tailors/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit this tailor");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteTailor(id)).unwrap();
      showToast.success("Tailor deleted successfully");
      navigate(`${basePath}/tailors`);
    } catch (error) {
      showToast.error(error || "Failed to delete tailor");
    }
  };

  const getLeaveStatusIcon = (status) => {
    switch(status) {
      case "present": return <UserCheck size={20} className="text-green-600" />;
      case "leave": return <UserX size={20} className="text-red-600" />;
      case "half-day": return <Coffee size={20} className="text-orange-600" />;
      case "holiday": return <Calendar size={20} className="text-purple-600" />;
      default: return <UserCheck size={20} className="text-green-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "present": return "text-green-600 bg-green-100";
      case "leave": return "text-red-600 bg-red-100";
      case "half-day": return "text-orange-600 bg-orange-100";
      case "holiday": return "text-purple-600 bg-purple-100";
      default: return "text-green-600 bg-green-100";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ✅ Handle Work click - with basePath
  const handleWorkClick = (workId) => {
    navigate(`${basePath}/works/${workId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentTailor) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <Scissors size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Tailor Not Found</h2>
        <p className="text-slate-500 mb-6">The tailor you're looking for doesn't exist.</p>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold"
        >
          Back to Tailors
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Tailors</span>
        </button>

        <div className="flex items-center gap-3">
          {canUpdateLeave && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <Calendar size={18} />
              Update Leave
            </button>
          )}

          {canEdit && (
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <Edit size={18} />
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header with Avatar and Basic Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border-2 border-white/30">
                <span className="text-5xl font-black">
                  {currentTailor.name?.charAt(0)}
                </span>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black">{currentTailor.name}</h1>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                    {currentTailor.tailorId}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getLeaveStatusIcon(currentTailor.leaveStatus)}
                    <span className="text-sm font-medium capitalize">
                      {currentTailor.leaveStatus?.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <span className="text-sm font-medium">{currentTailor.experience || 0} years exp</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Joined on</p>
              <p className="text-white font-bold">{formatDate(currentTailor.joiningDate)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("works")}
              className={`py-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "works"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Work History ({works?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`py-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "feedback"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Performance
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1">Total Works</p>
                  <p className="text-3xl font-black text-blue-700">{workStats?.total || 0}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Completed</p>
                  <p className="text-3xl font-black text-green-700">{workStats?.completed || 0}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                  <p className="text-sm text-orange-600 mb-1">In Progress</p>
                  <p className="text-3xl font-black text-orange-700">{workStats?.inProgress || 0}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                  <p className="text-sm text-yellow-600 mb-1">Pending</p>
                  <p className="text-3xl font-black text-yellow-700">{workStats?.pending || 0}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800">Contact Information</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Phone size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-slate-600">Phone</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 ml-8">{currentTailor.phone}</p>
                  </div>

                  {currentTailor.email && (
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail size={18} className="text-purple-600" />
                        <span className="text-sm font-medium text-slate-600">Email</span>
                      </div>
                      <p className="text-lg font-bold text-slate-800 ml-8 break-all">{currentTailor.email}</p>
                    </div>
                  )}

                  {currentTailor.address && (
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin size={18} className="text-green-600" />
                        <span className="text-sm font-medium text-slate-600">Address</span>
                      </div>
                      <p className="text-lg font-bold text-slate-800 ml-8">
                        {currentTailor.address.street && <>{currentTailor.address.street}<br /></>}
                        {[currentTailor.address.city, currentTailor.address.state, currentTailor.address.pincode]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-slate-800">Professional Information</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Scissors size={18} className="text-indigo-600" />
                      <span className="text-sm font-medium text-slate-600">Specialization</span>
                    </div>
                    <div className="ml-8 flex flex-wrap gap-2">
                      {currentTailor.specialization?.length > 0 ? (
                        currentTailor.specialization.map((spec, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500">No specialization specified</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Star size={18} className="text-yellow-600" />
                      <span className="text-sm font-medium text-slate-600">Performance Rating</span>
                    </div>
                    <div className="ml-8">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-yellow-600">
                          {currentTailor.performance?.rating || 0}
                        </span>
                        <span className="text-slate-400">/ 5</span>
                      </div>
                    </div>
                  </div>

                  {currentTailor.leaveStatus !== 'present' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle size={18} className="text-orange-600" />
                        <span className="text-sm font-bold text-orange-600">Leave Information</span>
                      </div>
                      <div className="ml-8 space-y-1 text-sm">
                        <p><span className="font-medium">Status:</span> {currentTailor.leaveStatus}</p>
                        {currentTailor.leaveFrom && (
                          <p><span className="font-medium">From:</span> {formatDate(currentTailor.leaveFrom)}</p>
                        )}
                        {currentTailor.leaveTo && (
                          <p><span className="font-medium">To:</span> {formatDate(currentTailor.leaveTo)}</p>
                        )}
                        {currentTailor.leaveReason && (
                          <p><span className="font-medium">Reason:</span> {currentTailor.leaveReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "works" && (
            <div>
              <h3 className="font-black text-slate-800 mb-4">Work History</h3>
              {works?.length > 0 ? (
                <div className="space-y-3">
                  {works.map((work) => (
                    <div
                      key={work._id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleWorkClick(work._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-blue-600">{work.workId}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              work.status === 'completed' ? 'bg-green-100 text-green-700' :
                              work.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {work.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Order</p>
                              <p className="font-medium">{work.order?.orderId}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Garment</p>
                              <p className="font-medium">{work.garment?.name}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Delivery</p>
                              <p>{formatDate(work.deliveryDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Clock size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500">No works assigned yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div>
              <h3 className="font-black text-slate-800 mb-4">Performance Feedback</h3>
              {currentTailor.performance?.feedback?.length > 0 ? (
                <div className="space-y-4">
                  {currentTailor.performance.feedback.map((fb, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{fb.rating}/5</span>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(fb.date)}</span>
                      </div>
                      <p className="text-slate-700 italic">"{fb.comment}"</p>
                      <p className="text-xs text-slate-400 mt-2">- {fb.from?.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <MessageCircle size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500">No feedback available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Delete Tailor</h2>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{currentTailor.name}</span>?
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
                  onClick={handleDelete}
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
      {showLeaveModal && (
        <LeaveStatusModal
          tailor={currentTailor}
          onClose={() => setShowLeaveModal(false)}
          onUpdate={() => dispatch(fetchTailorById(id))}
        />
      )}
    </div>
  );
}