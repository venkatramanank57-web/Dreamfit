// src/Pages/admin/Staff.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  UserPlus, Users, Edit, Trash2, Search, 
  Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, UserCog, Power, Eye,
  Scissors, HardHat, Store
} from "lucide-react";
import { fetchAllStaff, updateStaff, deleteStaff, toggleStaffStatus } from "../../../features/user/userSlice";
import { fetchAllTailors, deleteTailor } from "../../../features/tailor/tailorSlice";
import { fetchAllCuttingMasters, deleteCuttingMaster } from "../../../features/cuttingMaster/cuttingMasterSlice";
import { fetchAllStoreKeepers, deleteStoreKeeper } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";

export default function Staff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users = [], loading = false } = useSelector((state) => state.user) || {};
  const { tailors = [], loading: tailorsLoading = false } = useSelector((state) => state.tailor) || {};
  const { cuttingMasters = [], loading: cuttingMastersLoading = false } = useSelector((state) => state.cuttingMaster) || {};
  const { storeKeepers = [], loading: storeKeepersLoading = false } = useSelector((state) => state.storeKeeper) || {};
  const { user: currentUser } = useSelector((state) => state.auth || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteType, setDeleteType] = useState("staff");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: ""
  });
  const [filterRole, setFilterRole] = useState("all");

  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchAllStaff());
    dispatch(fetchAllTailors());
    dispatch(fetchAllCuttingMasters());
    dispatch(fetchAllStoreKeepers());
  }, [dispatch]);

  // Combine all users, tailors, cutting masters, and store keepers
  const combinedStaff = useMemo(() => {
    const staffList = users.filter(user => 
      user && (user.role === "STORE_KEEPER" || user.role === "CUTTING_MASTER")
    );
    
    const tailorList = tailors.map(tailor => ({
      _id: tailor._id,
      name: tailor.name,
      email: tailor.email || `${tailor.phone}@tailor.dreamfit.com`,
      phone: tailor.phone,
      role: "TAILOR",
      isActive: tailor.isActive,
      createdAt: tailor.joiningDate || tailor.createdAt,
      updatedAt: tailor.updatedAt,
      type: "tailor",
      originalData: tailor
    }));

    const cuttingMasterList = cuttingMasters.map(cm => ({
      _id: cm._id,
      name: cm.name,
      email: cm.email,
      phone: cm.phone,
      role: "CUTTING_MASTER",
      isActive: cm.isActive,
      createdAt: cm.joiningDate || cm.createdAt,
      updatedAt: cm.updatedAt,
      type: "cuttingMaster",
      originalData: cm
    }));

    const storeKeeperList = storeKeepers.map(sk => ({
      _id: sk._id,
      name: sk.name,
      email: sk.email,
      phone: sk.phone,
      role: "STORE_KEEPER",
      isActive: sk.isActive,
      createdAt: sk.joiningDate || sk.createdAt,
      updatedAt: sk.updatedAt,
      type: "storeKeeper",
      originalData: sk
    }));

    return [...staffList, ...tailorList, ...cuttingMasterList, ...storeKeeperList];
  }, [users, tailors, cuttingMasters, storeKeepers]);

  // Filter based on search and role
  const filteredUsers = useMemo(() => {
    if (!combinedStaff || !Array.isArray(combinedStaff)) return [];
    
    return combinedStaff.filter(user => {
      if (filterRole !== "all" && user.role !== filterRole) return false;
      
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));
      
      return matchesSearch;
    });
  }, [combinedStaff, searchTerm, filterRole]);

  // Navigate to add pages
  const handleAddStaff = () => navigate("/admin/add-staff");
  const handleAddTailor = () => navigate("/admin/tailors/add");
  const handleAddCuttingMaster = () => navigate("/admin/cutting-masters/add");
  const handleAddStoreKeeper = () => navigate("/admin/store-keepers/add");

  // View details
  const handleViewDetails = (item) => {
    switch(item.type) {
      case "tailor": navigate(`/admin/tailors/${item._id}`); break;
      case "cuttingMaster": navigate(`/admin/cutting-masters/${item._id}`); break;
      case "storeKeeper": navigate(`/admin/store-keepers/${item._id}`); break;
      default: navigate(`/admin/staff/${item._id}`);
    }
  };

  // Edit
  const handleEdit = (item) => {
    switch(item.type) {
      case "tailor": navigate(`/admin/tailors/edit/${item._id}`); break;
      case "cuttingMaster": navigate(`/admin/cutting-masters/edit/${item._id}`); break;
      case "storeKeeper": navigate(`/admin/store-keepers/edit/${item._id}`); break;
      default:
        setSelectedUser(item);
        setEditFormData({
          name: item.name || "",
          email: item.email || "",
          role: item.role || "STORE_KEEPER",
          phone: item.phone || ""
        });
        setIsEditing(true);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await dispatch(updateStaff({ 
        id: selectedUser._id, 
        userData: editFormData
      })).unwrap();
      showToast.success("Staff updated successfully! ✅");
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      showToast.error(error || "Failed to update");
    }
  };

  // Delete
  const handleDeleteClick = (item) => {
    setSelectedUser(item);
    setDeleteType(item.type || "staff");
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      switch(deleteType) {
        case "tailor": await dispatch(deleteTailor(selectedUser._id)).unwrap(); showToast.success("Tailor deleted successfully! 🗑️"); break;
        case "cuttingMaster": await dispatch(deleteCuttingMaster(selectedUser._id)).unwrap(); showToast.success("Cutting Master deleted successfully! 🗑️"); break;
        case "storeKeeper": await dispatch(deleteStoreKeeper(selectedUser._id)).unwrap(); showToast.success("Store Keeper deleted successfully! 🗑️"); break;
        default: await dispatch(deleteStaff(selectedUser._id)).unwrap(); showToast.success("Staff deleted successfully! 🗑️");
      }
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      showToast.error(error || "Failed to delete");
    }
  };

  // Toggle status (only for staff users)
  const handleToggleStatus = async (item) => {
    if (item.type) {
      showToast.info(`${item.role.replace('_', ' ')} status can be managed in their details page`);
      return;
    }
    try {
      await dispatch(toggleStaffStatus(item._id)).unwrap();
      showToast.success(`Staff ${item.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  const getRoleBadge = (role, type) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold";
    
    if (type === "tailor") return `${baseClasses} bg-blue-100 text-blue-700`;
    if (type === "cuttingMaster") return `${baseClasses} bg-orange-100 text-orange-700`;
    if (type === "storeKeeper") return `${baseClasses} bg-green-100 text-green-700`;
    
    switch(role) {
      case "ADMIN": return `${baseClasses} bg-purple-100 text-purple-700`;
      case "STORE_KEEPER": return `${baseClasses} bg-green-100 text-green-700`;
      case "CUTTING_MASTER": return `${baseClasses} bg-orange-100 text-orange-700`;
      case "TAILOR": return `${baseClasses} bg-blue-100 text-blue-700`;
      default: return `${baseClasses} bg-slate-100 text-slate-700`;
    }
  };

  const getRoleIcon = (role, type) => {
    if (type === "tailor") return "🧵";
    if (type === "cuttingMaster") return "✂️";
    if (type === "storeKeeper") return "🛍️";
    
    switch(role) {
      case "TAILOR": return "🧵";
      case "CUTTING_MASTER": return "✂️";
      case "STORE_KEEPER": return "🛍️";
      default: return "👤";
    }
  };

  const getAvatarGradient = (role, type) => {
    if (type === "tailor") return "from-blue-500 to-blue-600";
    if (type === "cuttingMaster") return "from-orange-500 to-orange-600";
    if (type === "storeKeeper") return "from-green-500 to-green-600";
    
    switch(role) {
      case "STORE_KEEPER": return "from-green-500 to-green-600";
      case "CUTTING_MASTER": return "from-orange-500 to-orange-600";
      case "TAILOR": return "from-blue-500 to-blue-600";
      default: return "from-purple-500 to-purple-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const isLoading = loading || tailorsLoading || cuttingMastersLoading || storeKeepersLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
              <UserCog size={32} className="text-blue-600" />
              Team Management
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage all staff, tailors, cutting masters, and store keepers</p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, email..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full lg:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
            >
              <option value="all">All Roles</option>
              <option value="STORE_KEEPER">Store Keepers</option>
              <option value="CUTTING_MASTER">Cutting Masters</option>
              <option value="TAILOR">Tailors</option>
            </select>
          </div>
        </div>

        {/* Add Buttons - Separated for better layout */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleAddStaff}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            <UserPlus size={18} />
            Add Staff
          </button>
          
          <button
            onClick={handleAddTailor}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            <Scissors size={18} />
            Add Tailor
          </button>

          <button
            onClick={handleAddCuttingMaster}
            className="inline-flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            <HardHat size={18} />
            Add Cutting Master
          </button>

          <button
            onClick={handleAddStoreKeeper}
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            <Store size={18} />
            Add Store Keeper
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-blue-600" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Team Members
            </h2>
          </div>
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
            {filteredUsers.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((item) => (
              <div key={item._id} className="p-6 hover:bg-slate-50 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Section - Avatar and Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div 
                      onClick={() => handleViewDetails(item)}
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(item.role, item.type)} flex items-center justify-center text-white font-black text-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform flex-shrink-0`}
                      title="View details"
                    >
                      {getRoleIcon(item.role, item.type)}
                    </div>

                    {/* Info */}
                    <div 
                      onClick={() => handleViewDetails(item)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-black text-slate-800 text-lg hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <span className={getRoleBadge(item.role, item.type)}>
                          {item.type === "tailor" ? "Tailor" : 
                           item.type === "cuttingMaster" ? "Cutting Master" :
                           item.type === "storeKeeper" ? "Store Keeper" :
                           item.role?.replace('_', ' ')}
                        </span>
                        {item.isActive ? (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {item.email}
                        </span>
                        
                        {item.phone ? (
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {item.phone}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Phone size={14} className="text-slate-300" />
                            No phone
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          Joined {formatDate(item.createdAt)}
                        </span>
                      </div>

                      {/* Show specialization for tailors */}
                      {item.type === "tailor" && item.originalData?.specialization?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.originalData.specialization.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {spec}
                            </span>
                          ))}
                          {item.originalData.specialization.length > 3 && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              +{item.originalData.specialization.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 lg:ml-4">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="p-2.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`p-2.5 rounded-xl transition-all ${
                        item.type ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        item.isActive 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={item.type ? 'Manage in details page' : (item.isActive ? 'Deactivate' : 'Activate')}
                      disabled={!!item.type}
                    >
                      <Power size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users size={64} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-2xl mb-2">No Team Members Found</p>
            <p className="text-slate-300 mb-8">Add your first team member using the buttons above</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-black mb-6">Edit Staff</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                name="name" 
                value={editFormData.name} 
                onChange={handleEditChange} 
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                type="email" 
                name="email" 
                value={editFormData.email} 
                onChange={handleEditChange} 
                placeholder="Email Address"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                type="tel" 
                name="phone" 
                value={editFormData.phone} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setEditFormData(prev => ({ ...prev, phone: value }));
                }}
                placeholder="Phone Number"
                maxLength="10"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleEditSubmit} 
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-2">Confirm Delete</h2>
              <p className="text-slate-500 mb-2">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedUser?.name}</span>?
              </p>
              <p className="text-sm text-red-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}