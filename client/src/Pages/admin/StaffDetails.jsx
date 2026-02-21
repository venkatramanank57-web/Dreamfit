// src/Pages/admin/StaffDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Phone, Calendar, MapPin, 
  ChevronLeft, Edit, Power, AlertCircle,
  Shield, Clock, CheckCircle, XCircle
} from "lucide-react";
import { fetchAllStaff } from "../../features/user/userSlice";
import showToast from "../../utils/toast";
import API from "../../app/axios";

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user: currentUser } = useSelector((state) => state.auth || {});

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    setLoading(true);
    try {
      // Try to get from Redux first
      const response = await API.get(`/users/${id}`);
      setStaff(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff details");
      showToast.error("Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/staff");
  };

  const handleEdit = () => {
    navigate(`/admin/staff?edit=${id}`);
  };

  const handleToggleStatus = async () => {
    try {
      const response = await API.put(`/users/${id}/toggle-status`);
      setStaff(prev => ({ ...prev, isActive: !prev.isActive }));
      showToast.success(`Staff ${staff.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "STORE_KEEPER":
        return "bg-green-100 text-green-700 border-green-200";
      case "CUTTING_MASTER":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading staff details...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Staff Not Found</h2>
        <p className="text-slate-500 mb-6">The staff member you're looking for doesn't exist.</p>
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Staff List</span>
        </button>
        
        <div className="flex items-center gap-3">
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
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Edit size={18} />
            Edit Staff
          </button>
        </div>
      </div>

      {/* Staff Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-4 border-white/50 shadow-xl">
              <span className="text-5xl font-black">
                {staff.name?.charAt(0) || 'U'}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{staff.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-black border border-white/30 ${getRoleBadge(staff.role)}`}>
                  {staff.role.replace('_', ' ')}
                </span>
                {staff.isActive ? (
                  <span className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                    <CheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                    <XCircle size={14} /> Inactive
                  </span>
                )}
              </div>
              <p className="text-blue-100 flex items-center gap-2">
                <Mail size={16} />
                {staff.email}
              </p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Personal Information
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
                  <p className="font-bold text-lg break-all">{staff.email}</p>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Role</p>
                  <p className="font-bold text-lg">{staff.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Power size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Account Status</p>
                  <p className={`font-bold text-lg ${staff.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Joined Date</p>
                  <p className="font-bold text-lg">{formatDate(staff.createdAt)}</p>
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