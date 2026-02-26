// src/Pages/admin/Staff.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  UserPlus, Users, Edit, Trash2, Search, 
  Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, UserCog, Power, Eye, PlusCircle,
  Scissors // ✅ Add Tailor icon
} from "lucide-react";
import { fetchAllStaff, updateStaff, deleteStaff, toggleStaffStatus } from "../../features/user/userSlice";
import { fetchAllTailors, deleteTailor } from "../../features/tailor/tailorSlice"; // ✅ Import tailor actions
import showToast from "../../utils/toast";

export default function Staff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users = [], loading = false } = useSelector((state) => state.user) || {};
  const { tailors = [], loading: tailorsLoading = false } = useSelector((state) => state.tailor) || {}; // ✅ Get tailors
  const { user: currentUser } = useSelector((state) => state.auth || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteType, setDeleteType] = useState("staff"); // 'staff' or 'tailor'
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: ""
  });
  const [filterRole, setFilterRole] = useState("all"); // ✅ Role filter

  // Fetch all staff and tailors on component mount
  useEffect(() => {
    dispatch(fetchAllStaff());
    dispatch(fetchAllTailors()); // ✅ Fetch tailors too
  }, [dispatch]);

  // Combine users and tailors
  const combinedStaff = useMemo(() => {
    const staffList = users.filter(user => 
      user && (user.role === "STORE_KEEPER" || user.role === "CUTTING_MASTER" || user.role === "TAILOR")
    );
    
    // Convert tailors to staff format
    const tailorList = tailors.map(tailor => ({
      _id: tailor._id,
      name: tailor.name,
      email: tailor.email || `${tailor.phone}@tailor.dreamfit.com`,
      phone: tailor.phone,
      role: "TAILOR",
      isActive: tailor.isActive,
      createdAt: tailor.joiningDate || tailor.createdAt,
      updatedAt: tailor.updatedAt,
      isTailor: true, // ✅ Flag to identify tailor
      tailorData: tailor // Original tailor data
    }));

    return [...staffList, ...tailorList];
  }, [users, tailors]);

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    if (!combinedStaff || !Array.isArray(combinedStaff)) return [];
    
    return combinedStaff.filter(user => {
      // Role filter
      if (filterRole !== "all" && user.role !== filterRole) return false;
      
      // Search filter
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));
      
      return matchesSearch;
    });
  }, [combinedStaff, searchTerm, filterRole]);

  // Navigate to add staff page
  const handleAddStaff = () => {
    navigate("/admin/add-staff");
  };

  // Navigate to add tailor page
  const handleAddTailor = () => {
    navigate("/admin/tailors/add");
  };

  // View individual staff/tailor details
  const handleViewStaff = (staff) => {
    if (staff.isTailor) {
      navigate(`/admin/tailors/${staff._id}`); // ✅ Go to tailor details
    } else {
      navigate(`/admin/staff/${staff._id}`); // ✅ Go to staff details
    }
  };

  // Edit staff/tailor
  const handleEdit = (staff) => {
    if (staff.isTailor) {
      navigate(`/admin/tailors/edit/${staff._id}`); // ✅ Edit tailor
    } else {
      setSelectedUser(staff);
      setEditFormData({
        name: staff.name || "",
        email: staff.email || "",
        role: staff.role || "STORE_KEEPER",
        phone: staff.phone || ""
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

  // Delete staff/tailor
  const handleDeleteClick = (staff) => {
    setSelectedUser(staff);
    setDeleteType(staff.isTailor ? "tailor" : "staff");
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "tailor") {
        await dispatch(deleteTailor(selectedUser._id)).unwrap();
        showToast.success("Tailor deleted successfully! 🗑️");
      } else {
        await dispatch(deleteStaff(selectedUser._id)).unwrap();
        showToast.success("Staff deleted successfully! 🗑️");
      }
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      showToast.error(error || "Failed to delete");
    }
  };

  // Toggle status (only for staff, not tailors)
  const handleToggleStatus = async (staff) => {
    if (staff.isTailor) {
      showToast.info("Tailor status can be managed in Tailor Details");
      return;
    }
    try {
      await dispatch(toggleStaffStatus(staff._id)).unwrap();
      showToast.success(`Staff ${staff.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "STORE_KEEPER":
        return "bg-green-100 text-green-700";
      case "CUTTING_MASTER":
        return "bg-orange-100 text-orange-700";
      case "TAILOR":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "TAILOR":
        return "🧵";
      case "CUTTING_MASTER":
        return "✂️";
      case "STORE_KEEPER":
        return "📦";
      default:
        return "👤";
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
            <UserCog size={32} className="text-blue-600" />
            Staff & Tailors Management
          </h1>
          <p className="text-slate-500 font-medium">Manage Store Keepers, Cutting Masters, and Tailors</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 w-full sm:w-80 font-bold transition-all"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
          >
            <option value="all">All Roles</option>
            <option value="STORE_KEEPER">Store Keepers</option>
            <option value="CUTTING_MASTER">Cutting Masters</option>
            <option value="TAILOR">Tailors</option>
          </select>
          
          {/* Add Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddStaff}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              title="Add Staff"
            >
              <UserPlus size={20} />
              <span className="hidden lg:inline">Add Staff</span>
            </button>
            
            <button
              onClick={handleAddTailor}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
              title="Add Tailor"
            >
              <Scissors size={20} />
              <span className="hidden lg:inline">Add Tailor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff/Tailor List */}
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

        {loading || tailorsLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((staff) => (
              <div key={staff._id} className="p-6 hover:bg-slate-50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div 
                      onClick={() => handleViewStaff(staff)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg cursor-pointer hover:scale-105 transition-transform
                      ${staff.role === 'STORE_KEEPER' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                        staff.role === 'CUTTING_MASTER' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                        staff.role === 'TAILOR' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        'bg-gradient-to-br from-purple-500 to-purple-600'}`}
                      title="View details"
                    >
                      {getRoleIcon(staff.role)}
                    </div>

                    {/* Staff Info */}
                    <div 
                      onClick={() => handleViewStaff(staff)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-slate-800 text-lg hover:text-blue-600 transition-colors">
                          {staff.name}
                        </h3>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${getRoleBadge(staff.role)}`}>
                          {staff.role === 'TAILOR' ? '🧵 Tailor' : staff.role.replace('_', ' ')}
                        </span>
                        {staff.isActive ? (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {staff.email}
                        </span>
                        
                        {staff.phone ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {staff.phone}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Phone size={14} className="text-slate-300" />
                            No phone
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          Joined {formatDate(staff.createdAt)}
                        </span>
                      </div>

                      {/* Show tailor specialization if available */}
                      {staff.isTailor && staff.tailorData?.specialization?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {staff.tailorData.specialization.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {spec}
                            </span>
                          ))}
                          {staff.tailorData.specialization.length > 2 && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              +{staff.tailorData.specialization.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 md:ml-4">
                    <button
                      onClick={() => handleViewStaff(staff)}
                      className="p-2.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(staff)}
                      className={`p-2.5 rounded-xl transition-all ${
                        staff.isTailor ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        staff.isActive 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={staff.isTailor ? 'Manage in Tailor Details' : (staff.isActive ? 'Deactivate' : 'Activate')}
                      disabled={staff.isTailor}
                    >
                      <Power size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleEdit(staff)}
                      className="p-2.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(staff)}
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
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-xl">No Team Members Found</p>
            <p className="text-slate-300 mt-2">Add your first staff or tailor</p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={handleAddStaff}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all inline-flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Staff
              </button>
              <button
                onClick={handleAddTailor}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-500/30 transition-all inline-flex items-center gap-2"
              >
                <Scissors size={20} />
                Add Tailor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (for staff only) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Edit Staff</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="STORE_KEEPER">Store Keeper</option>
                  <option value="CUTTING_MASTER">Cutting Master</option>
                  <option value="TAILOR">Tailor</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setEditFormData(prev => ({ ...prev, phone: value }));
                  }}
                  placeholder="Phone"
                  maxLength="10"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2">
                Delete {deleteType === "tailor" ? "Tailor" : "Staff"}
              </h2>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{selectedUser?.name}</span>?
                {deleteType === "tailor" && (
                  <span className="block mt-2 text-sm text-red-500">This will also remove their user account.</span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
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