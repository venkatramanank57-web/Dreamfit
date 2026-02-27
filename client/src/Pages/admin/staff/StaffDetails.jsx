// src/Pages/admin/StaffDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Phone, Calendar, MapPin, 
  ChevronLeft, Edit, Power, AlertCircle,
  Shield, Clock, CheckCircle, XCircle, Scissors, Star,
  HardHat, Store, Briefcase
} from "lucide-react";
import { fetchAllStaff } from "../../../features/user/userSlice";
import { fetchTailorById } from "../../../features/tailor/tailorSlice";
import { fetchCuttingMasterById } from "../../../features/cuttingMaster/cuttingMasterSlice";
import { fetchStoreKeeperById } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";
import API from "../../../app/axios";

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState("staff"); // 'staff', 'tailor', 'cuttingMaster', 'storeKeeper'
  
  const { user: currentUser } = useSelector((state) => state.auth || {});
  const { currentTailor } = useSelector((state) => state.tailor || {});
  const { currentCuttingMaster } = useSelector((state) => state.cuttingMaster || {});
  const { currentStoreKeeper } = useSelector((state) => state.storeKeeper || {});

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Try staff first
      try {
        const response = await API.get(`/users/${id}`);
        setStaff(response.data);
        setUserType("staff");
        setError(null);
        return;
      } catch (staffErr) {
        console.log("Not a staff member");
      }

      // Try tailor
      try {
        const result = await dispatch(fetchTailorById(id)).unwrap();
        if (result) {
          setStaff(result.tailor);
          setUserType("tailor");
          setError(null);
          return;
        }
      } catch (tailorErr) {
        console.log("Not a tailor");
      }

      // Try cutting master
      try {
        const result = await dispatch(fetchCuttingMasterById(id)).unwrap();
        if (result) {
          setStaff(result.cuttingMaster);
          setUserType("cuttingMaster");
          setError(null);
          return;
        }
      } catch (cmErr) {
        console.log("Not a cutting master");
      }

      // Try store keeper
      try {
        const result = await dispatch(fetchStoreKeeperById(id)).unwrap();
        if (result) {
          setStaff(result.storeKeeper);
          setUserType("storeKeeper");
          setError(null);
          return;
        }
      } catch (skErr) {
        console.log("Not a store keeper");
      }

      // If all fail
      setError("User not found");
      
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load details");
      showToast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/staff");
  };

  const handleEdit = () => {
    switch(userType) {
      case "tailor":
        navigate(`/admin/tailors/edit/${id}`);
        break;
      case "cuttingMaster":
        navigate(`/admin/cutting-masters/edit/${id}`);
        break;
      case "storeKeeper":
        navigate(`/admin/store-keepers/edit/${id}`);
        break;
      default:
        navigate(`/admin/staff?edit=${id}`);
    }
  };

  const handleToggleStatus = async () => {
    if (userType !== "staff") {
      showToast.info(`${userType.replace(/([A-Z])/g, ' $1').trim()} status can be managed in their details page`);
      return;
    }
    
    try {
      const response = await API.put(`/users/${id}/toggle-status`);
      setStaff(prev => ({ ...prev, isActive: !prev.isActive }));
      showToast.success(`Staff ${staff.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  const getRoleBadge = (role, type) => {
    const baseClasses = "px-4 py-1.5 rounded-full text-sm font-black border";
    
    if (type === "tailor") return `${baseClasses} bg-blue-100 text-blue-700 border-blue-200`;
    if (type === "cuttingMaster") return `${baseClasses} bg-orange-100 text-orange-700 border-orange-200`;
    if (type === "storeKeeper") return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
    
    switch(role) {
      case "ADMIN": return `${baseClasses} bg-purple-100 text-purple-700 border-purple-200`;
      case "STORE_KEEPER": return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
      case "CUTTING_MASTER": return `${baseClasses} bg-orange-100 text-orange-700 border-orange-200`;
      case "TAILOR": return `${baseClasses} bg-blue-100 text-blue-700 border-blue-200`;
      default: return `${baseClasses} bg-slate-100 text-slate-700 border-slate-200`;
    }
  };

  const getRoleIcon = (type) => {
    switch(type) {
      case "tailor": return "🧵";
      case "cuttingMaster": return "✂️";
      case "storeKeeper": return "🛍️";
      case "staff":
        if (staff?.role === "ADMIN") return "👑";
        if (staff?.role === "STORE_KEEPER") return "🛍️";
        if (staff?.role === "CUTTING_MASTER") return "✂️";
        return "👤";
      default: return "👤";
    }
  };

  const getHeaderGradient = (type) => {
    switch(type) {
      case "tailor": return "from-blue-600 to-indigo-600";
      case "cuttingMaster": return "from-orange-600 to-red-600";
      case "storeKeeper": return "from-green-600 to-emerald-600";
      case "staff":
        if (staff?.role === "ADMIN") return "from-purple-600 to-pink-600";
        if (staff?.role === "STORE_KEEPER") return "from-green-600 to-emerald-600";
        if (staff?.role === "CUTTING_MASTER") return "from-orange-600 to-red-600";
        return "from-blue-600 to-indigo-600";
      default: return "from-blue-600 to-indigo-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = () => {
    switch(userType) {
      case "tailor": return "Tailor";
      case "cuttingMaster": return "Cutting Master";
      case "storeKeeper": return "Store Keeper";
      default: return staff?.role?.replace('_', ' ') || "Staff";
    }
  };

  const getStatusBadge = () => {
    if (userType === "tailor") {
      switch(staff?.leaveStatus) {
        case "present": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✅ Present</span>;
        case "leave": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">🚫 On Leave</span>;
        case "half-day": return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">⏳ Half Day</span>;
        case "holiday": return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">🎉 Holiday</span>;
        default: return null;
      }
    } else {
      return staff?.isActive ? (
        <span className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur px-3 py-1 rounded-full text-sm">
          <CheckCircle size={14} /> Active
        </span>
      ) : (
        <span className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur px-3 py-1 rounded-full text-sm">
          <XCircle size={14} /> Inactive
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Not Found</h2>
        <p className="text-slate-500 mb-6">The person you're looking for doesn't exist.</p>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold"
        >
          Back to Staff List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Team</span>
        </button>
        
        <div className="flex items-center gap-3">
          {userType === "staff" && (
            <button
              onClick={handleToggleStatus}
              className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                staff.isActive 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Power size={18} />
              {staff.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Edit size={18} />
            Edit {getDisplayName()}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Profile Header */}
        <div className={`bg-gradient-to-r ${getHeaderGradient(userType)} px-8 py-12 text-white`}>
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-4 border-white/50 shadow-xl">
              <span className="text-5xl font-black">
                {getRoleIcon(userType)}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{staff.name}</h1>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={getRoleBadge(staff.role, userType)}>
                  {getDisplayName()}
                  {userType === "staff" && staff.role === "ADMIN" && " 👑"}
                </span>
                
                {getStatusBadge()}

                {/* Experience for relevant roles */}
                {(userType === "tailor" || userType === "cuttingMaster" || userType === "storeKeeper") && staff.experience > 0 && (
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                    <Star size={14} /> {staff.experience} years exp
                  </span>
                )}
              </div>
              <p className="text-white/80 flex items-center gap-2">
                <Mail size={16} />
                {staff.email || 'No email'}
              </p>
              {staff.phone && (
                <p className="text-white/80 flex items-center gap-2 mt-1">
                  <Phone size={16} />
                  {staff.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            {getDisplayName()} Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Phone Number</p>
                  <p className="font-bold text-lg">{staff.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Email Address</p>
                  <p className="font-bold text-lg break-all">{staff.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* ID Field */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    {userType === "tailor" ? "Tailor ID" : 
                     userType === "cuttingMaster" ? "Cutting Master ID" :
                     userType === "storeKeeper" ? "Store Keeper ID" : 
                     "User ID"}
                  </p>
                  <p className="font-bold text-lg font-mono">
                    {staff.tailorId || staff.cuttingMasterId || staff.storeKeeperId || staff._id?.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status/Availability */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Power size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    {userType === "tailor" ? 'Availability' : 'Account Status'}
                  </p>
                  {userType === "tailor" ? (
                    <p className={`font-bold text-lg ${staff.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {staff.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  ) : (
                    <p className={`font-bold text-lg ${staff.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Specialization for Tailors */}
            {userType === "tailor" && staff.specialization?.length > 0 && (
              <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 text-slate-600 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Scissors size={18} className="text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Specialization</p>
                </div>
                <div className="flex flex-wrap gap-2 ml-13">
                  {staff.specialization.map((spec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Department for Store Keepers */}
            {userType === "storeKeeper" && staff.department && (
              <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 text-slate-600 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={18} className="text-green-600" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Department</p>
                </div>
                <p className="font-bold text-lg capitalize">{staff.department}</p>
              </div>
            )}

            {/* Leave Information for Tailors */}
            {userType === "tailor" && staff.leaveStatus !== "present" && (
              <div className="md:col-span-2 bg-orange-50 p-5 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 text-orange-600 mb-3">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase">Leave Information</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Status:</span> {staff.leaveStatus}</p>
                  {staff.leaveFrom && <p><span className="font-medium">From:</span> {formatDate(staff.leaveFrom)}</p>}
                  {staff.leaveTo && <p><span className="font-medium">To:</span> {formatDate(staff.leaveTo)}</p>}
                  {staff.leaveReason && <p><span className="font-medium">Reason:</span> {staff.leaveReason}</p>}
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Joined Date</p>
                  <p className="font-bold text-lg">{formatDate(staff.joiningDate || staff.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Last Updated</p>
                  <p className="font-bold text-lg">{formatDate(staff.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {staff.address && (staff.address.street || staff.address.city) && (
            <div className="mt-6">
              <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Address Information
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                {staff.address.street && <p className="text-slate-700 font-medium">{staff.address.street}</p>}
                {(staff.address.city || staff.address.state || staff.address.pincode) && (
                  <p className="text-slate-600 mt-1">
                    {[staff.address.city, staff.address.state, staff.address.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {staff.notes && (
            <div className="mt-6">
              <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                Notes
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-600">{staff.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}