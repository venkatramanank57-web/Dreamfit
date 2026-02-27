import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Phone, Mail, MapPin, Home, ChevronRight, X, Save, 
  Building, Globe, BookOpen, AlertCircle, Hash, Calendar
} from "lucide-react";
import { createNewCustomer } from "../../../features/customer/customerSlice";
import showToast from "../../../utils/toast";

export default function AddCustomer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, customers } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  console.log("🔵 ========== ADD CUSTOMER COMPONENT ==========");
  console.log("👤 User role:", user?.role);
  console.log("📊 Customers count:", customers?.length);

  const [formData, setFormData] = useState({
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    contactNumber: "",
    whatsappNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  // ✅ Get base path based on user role
  const rolePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  console.log("📍 Base path:", rolePath);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`✏️ Field changed: ${name} =`, value);
    
    // Special handling for phone numbers
    if (name === "contactNumber" || name === "whatsappNumber" || name === "pincode") {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = name === "pincode" ? 6 : 10;
      const truncated = numericValue.slice(0, maxLength);
      setFormData(prev => ({ ...prev, [name]: truncated }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const validateForm = () => {
    console.log("🔍 Validating form...");
    const newErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      console.log("❌ First name missing");
    }

    // Validate contact number
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
      console.log("❌ Contact number missing");
    } else if (formData.contactNumber.length !== 10) {
      newErrors.contactNumber = "Contact number must be 10 digits";
      console.log("❌ Contact number invalid length:", formData.contactNumber.length);
    }

    // Validate WhatsApp number
    if (!formData.whatsappNumber) {
      newErrors.whatsappNumber = "WhatsApp number is required";
      console.log("❌ WhatsApp number missing");
    } else if (formData.whatsappNumber.length !== 10) {
      newErrors.whatsappNumber = "WhatsApp number must be 10 digits";
      console.log("❌ WhatsApp number invalid length:", formData.whatsappNumber.length);
    }

    // Validate email if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
        console.log("❌ Invalid email:", formData.email);
      }
    }

    // Validate address line 1
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
      console.log("❌ Address line 1 missing");
    }

    // Validate pincode if provided
    if (formData.pincode && formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be 6 digits";
      console.log("❌ Invalid pincode:", formData.pincode);
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("✅ Form valid:", isValid);
    if (!isValid) console.log("❌ Errors:", newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🚀 ========== FORM SUBMIT START ==========");
    console.log("📋 Raw formData:", {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? `"${formData.dateOfBirth}"` : "empty"
    });
    console.log("🎂 Raw dateOfBirth value:", formData.dateOfBirth ? `"${formData.dateOfBirth}"` : "empty");
    console.log("🎂 dateOfBirth type:", typeof formData.dateOfBirth);
    console.log("🎂 dateOfBirth length:", formData.dateOfBirth?.length || 0);
    
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      showToast.error("Please fix the errors in the form");
      return;
    }
    
    // ✅ Process date of birth
    let dobValue = undefined;
    if (formData.dateOfBirth) {
      console.log("📅 Processing date:", formData.dateOfBirth);
      
      // Create date object (input is YYYY-MM-DD)
      const dateObj = new Date(formData.dateOfBirth);
      console.log("📅 Date object created:", dateObj);
      console.log("📅 Date ISO string:", dateObj.toISOString());
      
      // Set to noon UTC to avoid timezone issues
      const isoString = dateObj.toISOString();
      dobValue = isoString;
      console.log("📅 Final DOB value for API:", dobValue);
    } else {
      console.log("📅 No date selected - sending undefined");
    }
    
    // Prepare customer data for API
    const customerData = {
      salutation: formData.salutation,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: dobValue,
      contactNumber: formData.contactNumber,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email.trim() || undefined,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      pincode: formData.pincode || undefined,
      notes: formData.notes.trim() || undefined
    };

    console.log("📦 Final customerData being sent to API:", {
      ...customerData,
      dateOfBirth: customerData.dateOfBirth ? `"${customerData.dateOfBirth}"` : "undefined"
    });
    console.log("📦 Date of Birth in payload:", customerData.dateOfBirth ? `"${customerData.dateOfBirth}"` : "undefined");

    try {
      console.log("⏳ Dispatching createNewCustomer action...");
      const result = await dispatch(createNewCustomer(customerData)).unwrap();
      console.log("✅ Customer created successfully!");
      console.log("✅ Response from server:", result);
      console.log("✅ Date of Birth in response:", result.customer?.dateOfBirth);
      
      showToast.success("Customer created successfully! 🎉");
      console.log("🔄 Navigating to:", `${rolePath}/customers`);
      navigate(`${rolePath}/customers`);
    } catch (error) {
      console.error("❌ Error creating customer:", error);
      
      // Check for duplicate phone error message
      const errorMsg = error.message || error.toString();
      console.log("❌ Error message:", errorMsg);
      
      if (errorMsg.includes("already exists") || 
          errorMsg.includes("duplicate") ||
          errorMsg.includes("phone") ||
          errorMsg.includes("Phone number")) {
        
        console.log("❌ Duplicate phone number detected");
        showToast.error("❌ This mobile number is already registered! Please use a different number.");
        
        // Highlight the phone field with error
        setErrors(prev => ({
          ...prev,
          contactNumber: "This phone number is already taken"
        }));
      } else {
        console.log("❌ Unknown error:", errorMsg);
        showToast.error(error.message || "Failed to create customer");
      }
    } finally {
      console.log("🏁 ========== FORM SUBMIT END ==========");
    }
  };

  // ✅ Handle Cancel - with rolePath
  const handleCancel = () => {
    console.log("🔙 Cancel clicked - navigating to:", `${rolePath}/customers`);
    navigate(`${rolePath}/customers`);
  };

  // Get full name for display
  const getFullName = () => {
    return `${formData.salutation} ${formData.firstName} ${formData.lastName}`.trim();
  };

  // Generate preview customer ID
  const getCustomerIdPreview = () => {
    const year = new Date().getFullYear();
    const nextNumber = (customers?.length || 0) + 1;
    const sequential = String(nextNumber).padStart(5, '0');
    return `CUST-${year}-${sequential}`;
  };

  console.log("🔄 Component rendering with formData:", {
    ...formData,
    dateOfBirth: formData.dateOfBirth ? `"${formData.dateOfBirth}"` : "empty"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-2xl font-mono text-sm mb-4 overflow-auto max-h-40">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">🔍 DEBUG INFO</span>
            <button 
              onClick={() => {
                console.clear();
                console.log("🧹 Console cleared");
              }} 
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Clear Console
            </button>
          </div>
          <div className="space-y-1">
            <div>Date of Birth: {formData.dateOfBirth || '❌ Not set'}</div>
            <div>DOB Length: {formData.dateOfBirth?.length || 0}</div>
            <div>First Name: {formData.firstName || '❌'}</div>
            <div>Phone: {formData.contactNumber || '❌'}</div>
            <div>Role: {user?.role}</div>
            <div>Base Path: {rolePath}</div>
          </div>
        </div>
      )}

      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span 
              onClick={handleCancel}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Customers
            </span>
            <ChevronRight size={14} />
            <span className="text-blue-600 font-bold">Add New Customer</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Add Customer</h1>
        </div>
        <button
          onClick={handleCancel}
          className="p-3 hover:bg-slate-100 rounded-xl transition-all"
          title="Close"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Live Preview - Shows how name will appear */}
      {formData.firstName && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <User size={20} className="text-blue-600" />
          <div>
            <span className="text-xs text-blue-600 font-black uppercase tracking-wider">Preview</span>
            <p className="text-lg font-black text-slate-800">{getFullName()}</p>
          </div>
        </div>
      )}

      {/* Customer ID Preview - Shows auto-generated ID */}
      {formData.firstName && formData.contactNumber && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <Hash size={20} className="text-purple-600" />
          <div>
            <span className="text-xs text-purple-600 font-black uppercase tracking-wider">Customer ID Preview</span>
            <p className="text-lg font-mono font-bold text-purple-800">{getCustomerIdPreview()}</p>
            <p className="text-xs text-purple-500 mt-1">Auto-generated on save</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Customer Detail Section */}
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            Customer Details
          </h2>

          <div className="space-y-6">
            {/* Salutation Row */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
                Salutation <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {["Mr.", "Mrs.", "Ms.", "Dr."].map((sal) => (
                  <label key={sal} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="salutation"
                      value={sal}
                      checked={formData.salutation === sal}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      {sal}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={`w-full px-5 py-4 bg-slate-50 border ${
                    errors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Contact Number (Primary) */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Contact Number (Primary) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                    errors.contactNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.contactNumber}
                </p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                  maxLength="10"
                  className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                    errors.whatsappNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                />
              </div>
              {errors.whatsappNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.whatsappNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address (optional)"
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

            {/* Address Line 1 */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Home className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House no., Building, Street"
                  className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
                    errors.addressLine1 ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                />
              </div>
              {errors.addressLine1 && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.addressLine1}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Address Line 2
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Area, Locality (optional)"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                  State
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  maxLength="6"
                  className={`w-full px-5 py-4 bg-slate-50 border ${
                    errors.pincode ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
                />
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Additional Notes
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-4 text-slate-400" size={20} />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any special instructions or notes about this customer..."
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-slate-50 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Customer
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>
          <span className="text-red-500">*</span> Required fields
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone size={12} /> Phone numbers must be unique
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> Complete address helps delivery
          </span>
        </div>
      </div>
    </div>
  );
}