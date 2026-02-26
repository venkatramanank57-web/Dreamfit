// src/Pages/admin/cuttingMaster/CuttingMasterDetails.jsx
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
  Star,
} from "lucide-react";
import { fetchCuttingMasterById, deleteCuttingMaster } from "../../../features/cuttingMaster/cuttingMasterSlice";
import showToast from "../../../utils/toast";

export default function CuttingMasterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentCuttingMaster, works, workStats, loading } = useSelector((state) => state.cuttingMaster);
  const { user } = useSelector((state) => state.auth);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  useEffect(() => {
    if (id) {
      dispatch(fetchCuttingMasterById(id));
    }
  }, [dispatch, id]);

  const handleBack = () => {
    navigate("/admin/cutting-masters");
  };

  const handleEdit = () => {
    navigate(`/admin/cutting-masters/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCuttingMaster(id)).unwrap();
      showToast.success("Cutting Master deleted successfully");
      navigate("/admin/cutting-masters");
    } catch (error) {
      showToast.error(error || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentCuttingMaster) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <Scissors size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Cutting Master Not Found</h2>
        <button onClick={handleBack} className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-orange-600">
          <ArrowLeft size={20} /> <span className="font-bold">Back</span>
        </button>

        <div className="flex gap-3">
          {canEdit && (
            <button onClick={handleEdit} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Edit size={18} /> Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Trash2 size={18} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl font-black">
                {currentCuttingMaster.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">{currentCuttingMaster.name}</h1>
                <p className="text-orange-100">{currentCuttingMaster.cuttingMasterId}</p>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Briefcase size={16} /> {currentCuttingMaster.experience || 0} years
                  </span>
                  {currentCuttingMaster.isActive ? (
                    <span className="flex items-center gap-1 text-green-300"><CheckCircle size={16} /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-300"><AlertCircle size={16} /> Inactive</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-200 text-sm">Joined</p>
              <p className="font-bold">{formatDate(currentCuttingMaster.joiningDate)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-8 flex gap-8">
          {["overview", "works"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-bold capitalize border-b-2 transition-colors ${
                activeTab === tab ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500"
              }`}
            >
              {tab} {tab === "works" && `(${works?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl"><p className="text-blue-600">Total Works</p><p className="text-3xl font-black">{workStats?.total || 0}</p></div>
                <div className="bg-green-50 p-6 rounded-xl"><p className="text-green-600">Completed</p><p className="text-3xl font-black">{workStats?.completed || 0}</p></div>
                <div className="bg-orange-50 p-6 rounded-xl"><p className="text-orange-600">In Progress</p><p className="text-3xl font-black">{workStats?.inProgress || 0}</p></div>
                <div className="bg-yellow-50 p-6 rounded-xl"><p className="text-yellow-600">Pending</p><p className="text-3xl font-black">{workStats?.pending || 0}</p></div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-black">Contact</h3>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Phone className="text-orange-600 mb-2" size={18} />
                    <p className="font-bold">{currentCuttingMaster.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Mail className="text-purple-600 mb-2" size={18} />
                    <p className="font-bold break-all">{currentCuttingMaster.email}</p>
                  </div>
                  {currentCuttingMaster.address?.street && (
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <MapPin className="text-green-600 mb-2" size={18} />
                      <p>{currentCuttingMaster.address.street}</p>
                      <p className="text-sm text-slate-600">
                        {[currentCuttingMaster.address.city, currentCuttingMaster.address.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-black">Professional</h3>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Scissors className="text-indigo-600 mb-2" size={18} />
                    <div className="flex flex-wrap gap-2">
                      {currentCuttingMaster.specialization?.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "works" && (
            <div>
              <h3 className="font-black mb-4">Assigned Works</h3>
              {works?.length > 0 ? (
                <div className="space-y-3">
                  {works.map(work => (
                    <div key={work._id} className="bg-slate-50 p-4 rounded-xl cursor-pointer hover:shadow-md"
                         onClick={() => navigate(`/admin/works/${work._id}`)}>
                      <div className="flex justify-between mb-2">
                        <span className="font-mono font-bold text-orange-600">{work.workId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          work.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{work.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><p className="text-slate-400">Order</p><p>{work.order?.orderId}</p></div>
                        <div><p className="text-slate-400">Garment</p><p>{work.garment?.name}</p></div>
                        <div><p className="text-slate-400">Delivery</p><p>{formatDate(work.deliveryDate)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Clock size={40} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No works assigned</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-md rounded-2xl p-6">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center mb-2">Delete Cutting Master?</h3>
            <p className="text-center text-slate-500 mb-6">Are you sure you want to delete {currentCuttingMaster.name}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-200 rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}