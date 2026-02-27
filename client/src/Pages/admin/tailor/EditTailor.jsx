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
  Scissors,
  X,
} from "lucide-react";
import { fetchTailorById, updateTailor } from "../../../features/tailor/tailorSlice";
import showToast from "../../../utils/toast";

export default function EditTailor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTailor, loading } = useSelector((state) => state.tailor);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    specialization: [],
    experience: "",
  });

  const [specializationInput, setSpecializationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isTailorSelf = user?.tailorId === id;
  
  const canEditAll = isAdmin || isStoreKeeper;
  const canEditBasic = isTailorSelf;

  useEffect(() => {
    if (id) {
      dispatch(fetchTailorById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTailor) {
      setFormData({
        name: currentTailor.name || "",
        phone: currentTailor.phone || "",
        email: currentTailor.email || "",
        address: {
          street: currentTailor.address?.street || "",
          city: currentTailor.address?.city || "",
          state: currentTailor.address?.state || "",
          pincode: currentTailor.address?.pincode || ""
        },
        specialization: currentTailor.specialization || [],
        experience: currentTailor.experience || "",
      });
    }
  }, [currentTailor]);

  // ✅ Handle Back - with basePath
  const handleBack = () => {
    navigate(`${basePath}/tailors/${id}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specializationInput.trim()]
      }));
      setSpecializationInput("");
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter(s => s !== spec)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      showToast.error("Please enter tailor name");
      return;
    }

    if (!formData.phone) {
      showToast.error("Please enter phone number");
      return;
    }

    if (formData.phone.length !== 10) {
      showToast.error("Phone number must be 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateTailor({ id, tailorData: formData })).unwrap();
      showToast.success("Tailor updated successfully! 🎉");
      // ✅ Navigate with basePath
      navigate(`${basePath}/tailors/${id}`);
    } catch (error) {
      showToast.error(error || "Failed to update tailor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Tailor</h1>
          <p className="text-slate-500">Update tailor information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
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
                  disabled={!canEditAll && !canEditBasic}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    disabled={!canEditAll && !canEditBasic}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canEditAll}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
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
                    disabled={!canEditAll}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Specialization - Only Admin/Store Keeper can edit */}
              {canEditAll && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Specialization
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                      placeholder="e.g., Shirts, Pants, Suits"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecialization}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information - Only Admin/Store Keeper can edit */}
          {canEditAll && (
            <div>
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Address Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Street name, building, area"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    placeholder="600001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Tailor
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}