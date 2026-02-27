// src/Pages/admin/AddStaff.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Lock, Phone, Briefcase, X, Save,
  AlertCircle, ChevronRight, UserCog, ArrowRight
} from "lucide-react";
import { createStaff } from "../../../features/user/userSlice";
import showToast from "../../../utils/toast";

export default function AddStaff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user || {});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STORE_KEEPER",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState("STORE_KEEPER");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    setFormData(prev => ({ ...prev, role: newRole }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    // Password required only for Store Keeper (creates User model)
    if (selectedRole === "STORE_KEEPER" && !formData.password) {
      newErrors.password = "Password is required";
    } else if (selectedRole === "STORE_KEEPER" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Role-based redirection logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate common fields
    if (!formData.name || !formData.email) {
      showToast.error("Name and Email are required");
      return;
    }

    // Role-based redirection
    switch(selectedRole) {
      case "TAILOR":
        // Redirect to Add Tailor page with pre-filled data
        showToast.info("Redirecting to Tailor creation page...");
        setTimeout(() => {
          navigate("/admin/tailors/add", { 
            state: { 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              fromStaff: true
            }
          });
        }, 1000);
        break;

      case "CUTTING_MASTER":
        // ✅ Redirect to Add Cutting Master page with pre-filled data
        showToast.info("Redirecting to Cutting Master creation page...");
        setTimeout(() => {
          navigate("/admin/cutting-masters/add", { 
            state: { 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              fromStaff: true
            }
          });
        }, 1000);
        break;

      case "STORE_KEEPER":
        // ✅ Redirect to Add Store Keeper page with pre-filled data
        showToast.info("Redirecting to Store Keeper creation page...");
        setTimeout(() => {
          navigate("/admin/store-keepers/add", { 
            state: { 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              fromStaff: true
            }
          });
        }, 1000);
        break;

      default:
        break;
    }
  };

  const handleCancel = () => {
    navigate("/admin/staff");
  };

  // Role options
  const roleOptions = [
    { 
      value: "STORE_KEEPER", 
      label: "Store Keeper", 
      icon: "🛍️",
      description: "Manages inventory and store operations",
      color: "green",
      model: "StoreKeeper Model",
      path: "/admin/store-keepers/add"
    },
    { 
      value: "CUTTING_MASTER", 
      label: "Cutting Master", 
      icon: "✂️",
      description: "Handles cutting operations",
      color: "orange",
      model: "CuttingMaster Model",
      path: "/admin/cutting-masters/add"
    },
    { 
      value: "TAILOR", 
      label: "Tailor", 
      icon: "🧵",
      description: "Sews garments",
      color: "blue",
      model: "Tailor Model",
      path: "/admin/tailors/add"
    },
  ];

  const getRoleColor = (role) => {
    switch(role) {
      case "STORE_KEEPER": return "green";
      case "CUTTING_MASTER": return "orange";
      case "TAILOR": return "blue";
      default: return "slate";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span 
              onClick={handleCancel}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Staff
            </span>
            <ChevronRight size={14} />
            <span className="text-blue-600 font-bold">Add New Staff</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserCog size={24} className="text-blue-600" />
            Add New Staff Member
          </h1>
        </div>
        <button
          onClick={handleCancel}
          className="p-3 hover:bg-slate-100 rounded-xl transition-all"
          title="Close"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Role Selection Notice */}
      {selectedRole === "TAILOR" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowRight size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800">You're adding a Tailor</p>
              <p className="text-xs text-blue-600">You'll be redirected to the Tailor creation form</p>
            </div>
          </div>
          <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">
            Tailor Model
          </span>
        </div>
      )}

      {selectedRole === "CUTTING_MASTER" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowRight size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-800">You're adding a Cutting Master</p>
              <p className="text-xs text-orange-600">You'll be redirected to the Cutting Master creation form</p>
            </div>
          </div>
          <span className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-bold">
            CuttingMaster Model
          </span>
        </div>
      )}

      {selectedRole === "STORE_KEEPER" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowRight size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">You're adding a Store Keeper</p>
              <p className="text-xs text-green-600">You'll be redirected to the Store Keeper creation form</p>
            </div>
          </div>
          <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-bold">
            StoreKeeper Model
          </span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password - Only for reference, not used in redirect */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Password (Optional)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password will be set in the next form"
                className={`w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                disabled
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-slate-400" size={20} />
              <select
                name="role"
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Role Description */}
            <div className={`mt-2 p-3 rounded-lg bg-${getRoleColor(selectedRole)}-50 border border-${getRoleColor(selectedRole)}-200`}>
              <p className={`text-xs text-${getRoleColor(selectedRole)}-700 flex items-center gap-2`}>
                <span className="text-lg">{roleOptions.find(r => r.value === selectedRole)?.icon}</span>
                <span className="font-medium">{roleOptions.find(r => r.value === selectedRole)?.description}</span>
                <span className="ml-auto text-xs px-2 py-0.5 bg-white rounded-full">
                  {roleOptions.find(r => r.value === selectedRole)?.model}
                </span>
              </p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData(prev => ({ ...prev, phone: value }));
                }}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 ${
                selectedRole === "TAILOR"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
                  : selectedRole === "CUTTING_MASTER"
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/30"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Continue to {selectedRole === "TAILOR" ? "Tailor" : selectedRole === "CUTTING_MASTER" ? "Cutting Master" : "Store Keeper"} Form
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Model Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-black text-blue-800 mb-2 flex items-center gap-2">
          <Briefcase size={16} />
          Role & Model Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <span className="font-black text-green-600">🛍️ Store Keeper</span>
            <p className="text-slate-600 mt-1">Uses <span className="font-bold text-green-600">StoreKeeper Model</span></p>
            <p className="text-slate-400 text-[10px] mt-1">Redirects to Store Keeper form</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <span className="font-black text-orange-600">✂️ Cutting Master</span>
            <p className="text-slate-600 mt-1">Uses <span className="font-bold text-orange-600">CuttingMaster Model</span></p>
            <p className="text-slate-400 text-[10px] mt-1">Redirects to Cutting Master form</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-200">
            <span className="font-black text-blue-600">🧵 Tailor</span>
            <p className="text-slate-600 mt-1">Uses <span className="font-bold text-blue-600">Tailor Model</span></p>
            <p className="text-slate-400 text-[10px] mt-1">Redirects to Tailor form</p>
          </div>
        </div>
      </div>
    </div>
  );
}