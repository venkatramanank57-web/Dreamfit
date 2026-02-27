import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  CreditCard,
  IndianRupee,
  Package,
  ChevronDown,
  Plus,
  Trash2,
  Image as ImageIcon,
  Phone,
} from "lucide-react";
import { fetchOrderById, updateOrder, updateOrderStatus } from "../../../features/order/orderSlice";
import { fetchGarmentsByOrder, deleteGarment } from "../../../features/garment/garmentSlice";
import { fetchAllCustomers } from "../../../features/customer/customerSlice";
import GarmentForm from "../garment/GarmentForm";
import showToast from "../../../utils/toast";

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, loading } = useSelector((state) => state.order);
  const { garments } = useSelector((state) => state.garment);
  const { customers } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    customer: "",
    deliveryDate: "",
    specialNotes: "",
    advancePayment: {
      amount: 0,
      method: "cash",
    },
    status: "draft",
  });

  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  const [expandedGarment, setExpandedGarment] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
      dispatch(fetchGarmentsByOrder(id));
    }
    dispatch(fetchAllCustomers());
  }, [dispatch, id]);

  // Find customer name from customers array
  useEffect(() => {
    if (currentOrder?.customer && customers?.length > 0) {
      const customerId = currentOrder.customer._id || currentOrder.customer;
      const fullCustomer = customers.find(c => c._id === customerId);
      
      if (fullCustomer) {
        // Format name with salutation if available
        let name = '';
        if (fullCustomer.firstName || fullCustomer.lastName) {
          const firstName = fullCustomer.firstName || '';
          const lastName = fullCustomer.lastName || '';
          name = `${firstName} ${lastName}`.trim();
        } else if (fullCustomer.name) {
          name = fullCustomer.name;
        }
        
        // Add salutation
        if (fullCustomer.salutation && name) {
          name = `${fullCustomer.salutation} ${name}`;
        }
        
        setCustomerName(name || 'Customer');
      }
    }
  }, [currentOrder, customers]);

  useEffect(() => {
    if (currentOrder) {
      setFormData({
        customer: currentOrder.customer?._id || "",
        deliveryDate: currentOrder.deliveryDate?.split("T")[0] || "",
        specialNotes: currentOrder.specialNotes || "",
        advancePayment: currentOrder.advancePayment || { amount: 0, method: "cash" },
        status: currentOrder.status || "draft",
      });
    }
  }, [currentOrder]);

  const priceSummary = garments?.reduce(
    (acc, garment) => ({
      min: acc.min + (garment.priceRange?.min || 0),
      max: acc.max + (garment.priceRange?.max || 0),
    }),
    { min: 0, max: 0 }
  ) || { min: 0, max: 0 };

  const balanceAmount = {
    min: priceSummary.min - (formData.advancePayment.amount || 0),
    max: priceSummary.max - (formData.advancePayment.amount || 0),
  };

  // Calculate garment delivery range
  const garmentDeliveryRange = garments?.length > 0 ? {
    min: new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery)))),
    max: new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery))))
  } : null;

  const handleAddGarment = () => {
    setEditingGarment(null);
    setShowGarmentModal(true);
  };

  const handleEditGarment = (garment) => {
    setEditingGarment(garment);
    setShowGarmentModal(true);
  };

  const handleDeleteGarment = async (garmentId) => {
    if (window.confirm("Are you sure you want to remove this garment?")) {
      try {
        await dispatch(deleteGarment(garmentId)).unwrap();
        showToast.success("Garment removed");
      } catch (error) {
        showToast.error("Failed to remove garment");
      }
    }
  };

  const handleSaveGarment = (garmentData) => {
    setShowGarmentModal(false);
    dispatch(fetchGarmentsByOrder(id));
    showToast.success("Garment updated");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.customer) {
      showToast.error("Please select a customer");
      setIsSubmitting(false);
      return;
    }

    if (!formData.deliveryDate) {
      showToast.error("Please select delivery date");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare complete order update data
      const orderUpdateData = {
        deliveryDate: formData.deliveryDate,
        specialNotes: formData.specialNotes,
        advancePayment: {
          amount: Number(formData.advancePayment.amount) || 0,
          method: formData.advancePayment.method,
        },
        status: formData.status,
        priceSummary: {
          totalMin: priceSummary.min,
          totalMax: priceSummary.max,
        },
        balanceAmount: balanceAmount.min,
      };

      console.log("📤 Updating order with data:", orderUpdateData);

      await dispatch(updateOrder({ 
        id, 
        orderData: orderUpdateData 
      })).unwrap();
      
      showToast.success("Order updated successfully");
      // ✅ Navigate with basePath
      navigate(`${basePath}/orders/${id}`);
    } catch (error) {
      console.error("❌ Update error:", error);
      showToast.error(error.message || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!canEdit) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You don't have permission to edit orders</p>
        <button
          onClick={() => navigate(`${basePath}/orders/${id}`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const minimalCustomer = currentOrder?.customer;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`${basePath}/orders/${id}`)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Order</h1>
          <p className="text-slate-500">Order ID: {currentOrder?.orderId}</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Customer Details
            </h2>

            {minimalCustomer ? (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                        Customer Name
                      </p>
                      <h3 className="text-xl font-bold text-slate-800">
                        {customerName || 'Customer'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={16} className="text-blue-500" />
                      <p className="text-base font-medium">
                        {minimalCustomer.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 self-start">
                    <span>🆔</span>
                    {minimalCustomer.customerId || 'N/A'}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center border-t border-blue-200 pt-3">
                  Customer cannot be changed after order creation
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-8 text-center">
                <User size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No customer information available</p>
              </div>
            )}
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Delivery Information
            </h2>
            
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Order Details
            </h2>

            {/* Status Selection */}
            <div className="mb-4">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Order Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Special Notes
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                rows="3"
                placeholder="Any special instructions for this order..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Garments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Garments ({garments?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddGarment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Garment
              </button>
            </div>

            {garments?.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Package size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">No garments in this order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {garments.map((garment) => (
                  <div
                    key={garment._id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-slate-800">{garment.name}</h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {garment.garmentId}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {garment.priority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-xs text-slate-400">Price</p>
                            <p className="font-bold text-blue-600">
                              ₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Delivery</p>
                            <p className="font-medium text-purple-600">
                              {formatDate(garment.estimatedDelivery)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Status</p>
                            <p className="capitalize font-medium">{garment.status}</p>
                          </div>
                        </div>

                        {/* Images Section */}
                        {(garment.referenceImages?.length > 0 || garment.customerImages?.length > 0) && (
                          <div className="mt-3 border-t border-slate-200 pt-3">
                            <button
                              type="button"
                              onClick={() => setExpandedGarment(expandedGarment === garment._id ? null : garment._id)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <ImageIcon size={16} />
                              {expandedGarment === garment._id ? 'Hide Images' : 'Show Images'}
                            </button>
                            
                            {expandedGarment === garment._id && (
                              <div className="mt-3 space-y-3">
                                {garment.referenceImages?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 mb-2">Reference Images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {garment.referenceImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <img
                                            src={img.url}
                                            alt={`Reference ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {garment.customerImages?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 mb-2">Customer Images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {garment.customerImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <img
                                            src={img.url}
                                            alt={`Customer ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleEditGarment(garment)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGarment(garment._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Payment Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
                <p className="text-2xl font-black text-blue-700">
                  ₹{priceSummary.min} - ₹{priceSummary.max}
                </p>
              </div>

              {/* Garment Delivery Range */}
              {garmentDeliveryRange && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs text-purple-600 font-black uppercase mb-1">
                    Garment Delivery Range
                  </p>
                  <p className="text-sm font-bold text-purple-700">
                    {formatDate(garmentDeliveryRange.min)} - {formatDate(garmentDeliveryRange.max)}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    Order delivery: {formatDate(formData.deliveryDate)}
                  </p>
                </div>
              )}

              {/* Advance Payment */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Advance Payment
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="number"
                    value={formData.advancePayment.amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      advancePayment: {
                        ...formData.advancePayment,
                        amount: parseInt(e.target.value) || 0,
                      }
                    })}
                    min="0"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <select
                    value={formData.advancePayment.method}
                    onChange={(e) => setFormData({
                      ...formData,
                      advancePayment: {
                        ...formData.advancePayment,
                        method: e.target.value,
                      }
                    })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-slate-400" size={18} />
                </div>
              </div>

              {/* Balance Amount */}
              <div className="bg-orange-50 p-4 rounded-xl mt-4">
                <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                <p className="text-xl font-black text-orange-700">
                  ₹{balanceAmount.min} - ₹{balanceAmount.max}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
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
                    Update Order
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`${basePath}/orders/${id}`)}
                className="w-full px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Garment Form Modal */}
      {showGarmentModal && (
        <GarmentForm
          onClose={() => setShowGarmentModal(false)}
          onSave={handleSaveGarment}
          editingGarment={editingGarment}
        />
      )}
    </div>
  );
}