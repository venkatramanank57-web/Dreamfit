import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Phone, Mail, MapPin, Calendar, ShoppingBag, 
  ChevronLeft, PlusCircle, AlertCircle, Edit, Trash2, 
  Save, X, Hash
} from "lucide-react";
import { fetchCustomerById, updateCustomer, deleteCustomer } from "../../features/customer/customerSlice";
import showToast from "../../utils/toast";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentCustomer, loading } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "MANAGER" ? "manager" :
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  // Check if user can perform CRUD operations
  const canEdit = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";
  const canDelete = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
  }, [id, dispatch]);

  // ✅ FIXED: Separate useEffect for form data - only depends on currentCustomer
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        salutation: currentCustomer.salutation || "Mr.",
        firstName: currentCustomer.firstName || "",
        lastName: currentCustomer.lastName || "",
        phone: currentCustomer.phone || "",
        whatsappNumber: currentCustomer.whatsappNumber || "",
        email: currentCustomer.email || "",
        addressLine1: currentCustomer.addressLine1 || "",
        addressLine2: currentCustomer.addressLine2 || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        pincode: currentCustomer.pincode || "",
        notes: currentCustomer.notes || ""
      });
    }
  }, [currentCustomer]); // ✅ Removed isEditing dependency

  const handleBack = () => {
    navigate(`/${rolePath}/customers`);
  };

  const handleCreateOrder = () => {
    navigate(`/${rolePath}/create-order`, { 
      state: { customer: currentCustomer } 
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to current customer values
    if (currentCustomer) {
      setFormData({
        salutation: currentCustomer.salutation || "Mr.",
        firstName: currentCustomer.firstName || "",
        lastName: currentCustomer.lastName || "",
        phone: currentCustomer.phone || "",
        whatsappNumber: currentCustomer.whatsappNumber || "",
        email: currentCustomer.email || "",
        addressLine1: currentCustomer.addressLine1 || "",
        addressLine2: currentCustomer.addressLine2 || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        pincode: currentCustomer.pincode || "",
        notes: currentCustomer.notes || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone numbers
    if (name === "phone" || name === "whatsappNumber" || name === "pincode") {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = name === "pincode" ? 6 : 10;
      const truncated = numericValue.slice(0, maxLength);
      setFormData(prev => ({ ...prev, [name]: truncated }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      // Prepare update data
      const updateData = {
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        notes: formData.notes
      };

      await dispatch(updateCustomer({ id, customerData: updateData })).unwrap();
      showToast.success("Customer updated successfully! ✅");
      setIsEditing(false);
      dispatch(fetchCustomerById(id)); // Refresh data
    } catch (error) {
      showToast.error(error.message || "Failed to update customer");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      showToast.success("Customer deleted successfully! 🗑️");
      setShowDeleteModal(false);
      navigate(`/${rolePath}/customers`);
    } catch (error) {
      showToast.error(error.message || "Failed to delete customer");
    }
  };

  const formatDate = (dateString) => {
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
        <p className="text-slate-500 font-medium">Loading customer details...</p>
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Customer Not Found</h2>
        <p className="text-slate-500 mb-6">The customer you're looking for doesn't exist.</p>
        <button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // Get customer name
  const customerName = currentCustomer.name || 
    `${currentCustomer.salutation || ''} ${currentCustomer.firstName || ''} ${currentCustomer.lastName || ''}`.trim();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Customers</span>
        </button>
        
        <div className="flex items-center gap-3">
          {/* Edit and Delete buttons for Admin and Store Keeper */}
          {canEdit && !isEditing && (
            <>
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
              >
                <Edit size={18} />
                Edit
              </button>
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </>
          )}
          
          {/* Create Order Button */}
          <button
            onClick={handleCreateOrder}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all hover:scale-105"
          >
            <PlusCircle size={18} />
            New Order
          </button>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <span className="text-4xl font-black">
                {customerName?.charAt(0) || 'C'}
              </span>
            </div>

            {/* Customer Info - Edit Mode or View Mode */}
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Salutation</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-800 mb-2">{customerName}</h1>
                
                {/* Customer ID - NEW */}
                {currentCustomer.customerId && (
                  <div className="flex items-center gap-3 text-slate-600 mb-4">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Hash size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Customer ID</p>
                      <p className="font-mono font-bold text-indigo-600">{currentCustomer.customerId}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Phone */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                      <p className="font-bold">{currentCustomer.phone}</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  {currentCustomer.whatsappNumber && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">WhatsApp</p>
                        <p className="font-bold">{currentCustomer.whatsappNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {currentCustomer.email && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Mail size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                        <p className="font-bold">{currentCustomer.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Total Orders */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Total Orders</p>
                      <p className="font-bold">{currentCustomer.totalOrders || 0}</p>
                    </div>
                  </div>

                  {/* Customer Since */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Customer Since</p>
                      <p className="font-bold">{formatDate(currentCustomer.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Section (View Mode Only) */}
        {!isEditing && (currentCustomer.addressLine1 || currentCustomer.city) && (
          <div className="px-8 pb-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Address Information
              </h2>
              <p className="text-slate-700 font-medium">{currentCustomer.addressLine1}</p>
              {currentCustomer.addressLine2 && <p className="text-slate-600 mt-1">{currentCustomer.addressLine2}</p>}
              {(currentCustomer.city || currentCustomer.state || currentCustomer.pincode) && (
                <p className="text-slate-600 mt-1">
                  {[currentCustomer.city, currentCustomer.state, currentCustomer.pincode].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Delete Customer</h2>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{customerName}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all"
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