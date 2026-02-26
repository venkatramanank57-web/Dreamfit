// src/Pages/admin/storeKeeper/EditStoreKeeper.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Store,
} from "lucide-react";
import { fetchStoreKeeperById, updateStoreKeeper } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";

export default function EditStoreKeeper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentStoreKeeper, loading } = useSelector((state) => state.storeKeeper);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    department: "both",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    experience: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAdmin;

  useEffect(() => {
    if (id) dispatch(fetchStoreKeeperById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentStoreKeeper) {
      setFormData({
        name: currentStoreKeeper.name || "",
        phone: currentStoreKeeper.phone || "",
        email: currentStoreKeeper.email || "",
        department: currentStoreKeeper.department || "both",
        address: {
          street: currentStoreKeeper.address?.street || "",
          city: currentStoreKeeper.address?.city || "",
          state: currentStoreKeeper.address?.state || "",
          pincode: currentStoreKeeper.address?.pincode || ""
        },
        experience: currentStoreKeeper.experience || "",
      });
    }
  }, [currentStoreKeeper]);

  const handleBack = () => navigate(`/admin/store-keepers/${id}`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      showToast.error("Name and Phone are required");
      return;
    }
    if (formData.phone.length !== 10) {
      showToast.error("Phone must be 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateStoreKeeper({ id, data: formData })).unwrap();
      showToast.success("Store Keeper updated successfully! 🎉");
      navigate(`/admin/store-keepers/${id}`);
    } catch (error) {
      showToast.error(error || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = [
    { value: "inventory", label: "Inventory Management" },
    { value: "sales", label: "Sales & Customer" },
    { value: "both", label: "Both (Full Access)" },
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Store Keeper</h1>
          <p className="text-slate-500">Update store keeper information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-green-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:bg-slate-100"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    disabled={!canEdit}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:bg-slate-100"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Experience (Years)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    disabled={!canEdit}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all disabled:bg-slate-100"
                >
                  {departmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {canEdit && (
            <div>
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-600" />
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" className="px-4 py-3 bg-slate-50 border rounded-xl" />
                <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" className="px-4 py-3 bg-slate-50 border rounded-xl" />
                <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} maxLength="6" placeholder="Pincode" className="px-4 py-3 bg-slate-50 border rounded-xl" />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !canEdit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Updating...</> : <><Save size={18} /> Update Store Keeper</>}
            </button>
            <button type="button" onClick={handleBack} className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}