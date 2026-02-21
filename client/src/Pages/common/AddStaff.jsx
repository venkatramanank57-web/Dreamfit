// src/Pages/admin/AddStaff.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Lock, Phone, Briefcase, X, Save,
  AlertCircle, ChevronRight, UserCog
} from "lucide-react";
import { createStaff } from "../../features/user/userSlice";
import showToast from "../../utils/toast";

export default function AddStaff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user || {});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STORE_KEEPER", // Default role
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error("Please fix the errors in the form");
      return;
    }

    try {
      await dispatch(createStaff(formData)).unwrap();
      showToast.success("Staff created successfully! 🎉");
      navigate("/admin/staff"); // Redirect back to staff list
    } catch (error) {
      const errorMsg = error || "Failed to create staff";
      showToast.error(errorMsg);
      
      if (errorMsg.includes("email")) {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
      }
    }
  };

  const handleCancel = () => {
    navigate("/admin/staff");
  };

  // Role options with Tailor added
  const roleOptions = [
    { value: "STORE_KEEPER", label: "Store Keeper", icon: "🛍️" },
    { value: "CUTTING_MASTER", label: "Cutting Master", icon: "✂️" },
    { value: "TAILOR", label: "Tailor", icon: "🧵" }, // ✅ New Tailor role
  ];

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

          {/* Password */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
                className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password}
              </p>
            )}
          </div>

          {/* Role - Now with Tailor option */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-slate-400" size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
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
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Staff
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

      {/* Role Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-black text-blue-800 mb-2 flex items-center gap-2">
          <Briefcase size={16} />
          Role Descriptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-2 rounded-lg">
            <span className="font-black text-green-600">🛍️ Store Keeper</span>
            <p className="text-slate-600 mt-1">Manages inventory, products, and store operations</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <span className="font-black text-orange-600">✂️ Cutting Master</span>
            <p className="text-slate-600 mt-1">Handles cutting operations and work assignments</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <span className="font-black text-purple-600">🧵 Tailor</span>
            <p className="text-slate-600 mt-1">Sews garments and handles tailoring work</p>
          </div>
        </div>
      </div>
    </div>
  );
}