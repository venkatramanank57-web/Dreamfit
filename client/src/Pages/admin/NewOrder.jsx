import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  CreditCard,
  IndianRupee,
  Package,
  ChevronDown,
} from "lucide-react";
import { createOrder } from "../../features/order/orderSlice";
import { createGarment } from "../../features/garment/garmentSlice";
import { fetchAllCustomers } from "../../features/customer/customerSlice";
import GarmentForm from "./GarmentForm";
import showToast from "../../utils/toast";

export default function NewOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Debug flag
  const DEBUG = true;
  
  const logDebug = (message, data) => {
    if (DEBUG) {
      console.log(`[NewOrder Debug] ${message}`, data || '');
    }
  };

  useEffect(() => {
    logDebug('Component mounted');
    return () => logDebug('Component unmounted');
  }, []);

  const { customers, loading: customersLoading } = useSelector((state) => ({
    customers: state.customer?.customers || [],
    loading: state.customer?.loading || false
  }));

  // Get current user from auth state
  const { user } = useSelector((state) => {
    console.log('👤 User from Redux:', state.auth?.user);
    return { user: state.auth?.user };
  });
  
  const [formData, setFormData] = useState({
    customer: "",
    deliveryDate: "",
    specialNotes: "",
    advancePayment: {
      amount: 0,
      method: "cash",
    },
  });

  const [garments, setGarments] = useState([]);
  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user ID - properly format for MongoDB
  const userId = user?.id;
  const userRole = user?.role;

  logDebug('User authentication', { 
    userExists: !!user, 
    userId, 
    userRole,
    userObject: user 
  });

  // Load customers on mount
  useEffect(() => {
    logDebug('Dispatching fetchAllCustomers');
    dispatch(fetchAllCustomers())
      .unwrap()
      .then((result) => {
        logDebug('Customers fetched successfully', { count: result?.length });
      })
      .catch((error) => {
        logDebug('Error fetching customers', { error: error.message });
        showToast.error("Failed to load customers");
      });
  }, [dispatch]);

  // Function to get customer full name from firstName and lastName
  const getCustomerFullName = (customer) => {
    if (!customer) return 'Unknown Customer';
    
    if (customer.firstName || customer.lastName) {
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    
    if (customer.salutation && customer.firstName) {
      return `${customer.salutation} ${customer.firstName}`.trim();
    }
    
    return 'Unknown Customer';
  };

  // Function to get customer display ID
  const getCustomerDisplayId = (customer) => {
    return customer.customerId || customer._id || '';
  };

  // Function to get customer phone
  const getCustomerPhone = (customer) => {
    return customer.phone || customer.whatsappNumber || 'No phone';
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customers || customers.length === 0) {
      return [];
    }
    
    const filtered = customers.filter(customer => {
      const fullName = getCustomerFullName(customer).toLowerCase();
      const customerId = getCustomerDisplayId(customer).toLowerCase();
      const phone = getCustomerPhone(customer);
      const firstName = (customer.firstName || '').toLowerCase();
      const lastName = (customer.lastName || '').toLowerCase();
      
      const searchLower = searchTerm.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        phone.includes(searchTerm) ||
        customerId.includes(searchLower)
      );
    });
    
    logDebug('Filtered customers', { 
      searchTerm, 
      total: customers.length,
      filtered: filtered.length
    });
    
    return filtered;
  }, [customers, searchTerm]);

  const priceSummary = useMemo(() => {
    const totalMin = garments.reduce((sum, g) => {
      const price = g.priceRange?.min || 0;
      return sum + Number(price);
    }, 0);
    
    const totalMax = garments.reduce((sum, g) => {
      const price = g.priceRange?.max || 0;
      return sum + Number(price);
    }, 0);
    
    return {
      totalMin,
      totalMax
    };
  }, [garments]);

  const balanceAmount = useMemo(() => {
    const advanceAmount = Number(formData.advancePayment.amount) || 0;
    return {
      min: Number(priceSummary.totalMin) - advanceAmount,
      max: Number(priceSummary.totalMax) - advanceAmount,
    };
  }, [priceSummary, formData.advancePayment.amount]);

  const handleAddGarment = useCallback(() => {
    setEditingGarment(null);
    setShowGarmentModal(true);
  }, []);

  const handleEditGarment = useCallback((garment) => {
    setEditingGarment(garment);
    setShowGarmentModal(true);
  }, []);

  const handleDeleteGarment = useCallback((index, garment) => {
    if (window.confirm(`Are you sure you want to remove ${garment.name || 'this garment'}?`)) {
      const newGarments = [...garments];
      newGarments.splice(index, 1);
      setGarments(newGarments);
      showToast.success("Garment removed");
    }
  }, [garments]);

  const handleSaveGarment = useCallback((garmentData) => {
    if (editingGarment !== null) {
      const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
      if (index !== -1) {
        const newGarments = [...garments];
        newGarments[index] = { ...garmentData, tempId: editingGarment.tempId };
        setGarments(newGarments);
        showToast.success("Garment updated");
      }
    } else {
      const newGarment = {
        ...garmentData,
        tempId: Date.now() + Math.random(),
      };
      setGarments([...garments, newGarment]);
      showToast.success("Garment added");
    }
    setShowGarmentModal(false);
  }, [garments, editingGarment]);

  const handleCustomerSelect = useCallback((customer) => {
    const fullName = getCustomerFullName(customer);
    const displayId = getCustomerDisplayId(customer);
    
    logDebug('Customer selected', { 
      id: customer._id,
      fullName,
      displayId,
      customer
    });

    setFormData(prev => ({
      ...prev,
      customer: customer._id
    }));

    let displayText = fullName;
    if (customer.salutation && !fullName.includes(customer.salutation)) {
      displayText = `${customer.salutation} ${fullName}`.trim();
    }
    displayText = `${displayText} (${displayId})`;
    
    setSelectedCustomerDisplay(displayText);
    setSearchTerm(displayText);
    setShowCustomerDropdown(false);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowCustomerDropdown(true);
    
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, customer: "" }));
      setSelectedCustomerDisplay("");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customer) {
      showToast.error("Please select a customer");
      return;
    }

    if (garments.length === 0) {
      showToast.error("Please add at least one garment");
      return;
    }

    if (!formData.deliveryDate) {
      showToast.error("Please select delivery date");
      return;
    }

    if (!userId) {
      logDebug('User not authenticated - no id found', { user });
      showToast.error("You must be logged in to create an order. Please log in and try again.");
      return;
    }

    for (const [index, garment] of garments.entries()) {
      if (!garment.name || !garment.category || !garment.item) {
        showToast.error(`Garment #${index + 1} is incomplete`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const createdById = userId;
      
      if (!createdById) {
        throw new Error("User ID is missing. Please log in again.");
      }

      const orderData = {
        customer: formData.customer,
        deliveryDate: formData.deliveryDate,
        specialNotes: formData.specialNotes || "",
        advancePayment: {
          amount: Number(formData.advancePayment.amount) || 0,
          method: formData.advancePayment.method,
          date: new Date().toISOString(),
        },
        priceSummary: {
          totalMin: Number(priceSummary.totalMin),
          totalMax: Number(priceSummary.totalMax),
        },
        balanceAmount: Number(balanceAmount.min),
        createdBy: createdById,
        status: "draft",
        orderDate: new Date().toISOString(),
        garments: [],
      };

      console.log("🔍 FINAL CHECK - createdBy:", orderData.createdBy);
      
      if (!orderData.createdBy) {
        throw new Error("createdBy is undefined in final order data!");
      }

      console.log("📦 FINAL ORDER DATA BEING SENT:", JSON.stringify(orderData, null, 2));

      const result = await dispatch(createOrder(orderData)).unwrap();
      logDebug('Order created successfully', result);
      
      const orderId = result.order?._id || result._id;

      for (const garment of garments) {
        logDebug(`Creating garment`, garment);
        
        const garmentFormData = new FormData();
        garmentFormData.append("name", garment.name);
        garmentFormData.append("category", garment.category);
        garmentFormData.append("item", garment.item);
        garmentFormData.append("measurementTemplate", garment.measurementTemplate || "");
        garmentFormData.append("measurementSource", garment.measurementSource || "template");
        garmentFormData.append("measurements", JSON.stringify(garment.measurements || []));
        garmentFormData.append("additionalInfo", garment.additionalInfo || "");
        garmentFormData.append("estimatedDelivery", garment.estimatedDelivery);
        garmentFormData.append("priority", garment.priority || "normal");
        
        const priceRange = {
          min: Number(garment.priceRange?.min) || 0,
          max: Number(garment.priceRange?.max) || 0
        };
        garmentFormData.append("priceRange", JSON.stringify(priceRange));
        
        garmentFormData.append("orderId", orderId);
        garmentFormData.append("createdBy", createdById);

        if (garment.referenceImages && garment.referenceImages.length > 0) {
          for (const img of garment.referenceImages) {
            garmentFormData.append("referenceImages", img);
          }
        }
        if (garment.customerImages && garment.customerImages.length > 0) {
          for (const img of garment.customerImages) {
            garmentFormData.append("customerImages", img);
          }
        }

        await dispatch(createGarment({ orderId, garmentData: garmentFormData })).unwrap();
      }

      showToast.success("Order created successfully! 🎉");
      navigate("/admin/orders");
    } catch (error) {
      console.error('❌ Full error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      logDebug('Order creation error', { 
        message: error.message,
        response: error.response?.data
      });
      
      if (error.response?.data?.message) {
        showToast.error(error.response.data.message);
      } else if (error.message) {
        showToast.error(error.message);
      } else {
        showToast.error("Failed to create order");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DebugPanel = () => {
    if (!DEBUG || process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="bg-gray-900 text-green-400 p-4 rounded-2xl font-mono text-sm mb-4 overflow-auto max-h-96">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">🔍 Debug Info</span>
          <button 
            onClick={() => console.clear()} 
            className="text-xs bg-gray-700 px-2 py-1 rounded"
          >
            Clear Console
          </button>
        </div>
        <div className="space-y-1">
          <div>Customer ID: {formData.customer || '❌ Not selected'}</div>
          <div>Customer Display: {selectedCustomerDisplay || 'None'}</div>
          <div>Search Term: "{searchTerm}"</div>
          <div>Garments: {garments.length}</div>
          <div>Delivery Date: {formData.deliveryDate || 'Not set'}</div>
          <div>Customers Loaded: {customers?.length || 0}</div>
          <div>Filtered Customers: {filteredCustomers.length}</div>
          <div className="text-green-400 font-bold">
            User ID: {userId || '❌ Not found'}
          </div>
          <div>User Role: {userRole || 'N/A'}</div>
          <div>Price Summary: Min ₹{priceSummary.totalMin} - Max ₹{priceSummary.totalMax}</div>
          <div>Balance Amount: Min ₹{balanceAmount.min} - Max ₹{balanceAmount.max}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      <DebugPanel />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/orders")}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Order</h1>
          <p className="text-slate-500">Add customer details and garments to create an order</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Customer Details
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search customer by name, phone or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />

              {showCustomerDropdown && (
                <>
                  {customersLoading && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      <p className="text-sm text-slate-500 mt-2">Loading customers...</p>
                    </div>
                  )}

                  {!customersLoading && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => {
                        const fullName = getCustomerFullName(customer);
                        const displayId = getCustomerDisplayId(customer);
                        const phone = getCustomerPhone(customer);
                        
                        let displayName = fullName;
                        if (customer.salutation && !fullName.includes(customer.salutation)) {
                          displayName = `${customer.salutation} ${fullName}`.trim();
                        }
                        
                        return (
                          <button
                            key={customer._id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
                          >
                            <p className="font-medium text-slate-800">{displayName}</p>
                            <p className="text-xs text-slate-400">
                              <span className="font-mono">{displayId}</span> • {phone}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!customersLoading && filteredCustomers.length === 0 && searchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <p className="text-slate-500">No customers found</p>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/customers/new")}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Create new customer
                      </button>
                    </div>
                  )}
                </>
              )}

              {formData.customer && !showCustomerDropdown && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Customer selected: {selectedCustomerDisplay}
                </div>
              )}
            </div>

            {/* Special Notes - Moved above Delivery Date */}
            <div className="mt-4">
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
                Garments
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

            {garments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Package size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">No garments added yet</p>
                <button
                  type="button"
                  onClick={handleAddGarment}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add your first garment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {garments.map((garment, index) => (
                  <div
                    key={garment.tempId}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-800">{garment.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {garment.priority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">Category/Item</p>
                            <p className="font-medium">{garment.category} / {garment.item}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400">Garment Delivery</p>
                            <p className="font-medium text-purple-600">
                              {garment.estimatedDelivery ? new Date(garment.estimatedDelivery).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400">Price Range</p>
                            <p className="font-medium">₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}</p>
                          </div>
                        </div>
                        
                        {garment.additionalInfo && (
                          <p className="text-sm text-slate-500 mt-2 italic">
                            Note: {garment.additionalInfo}
                          </p>
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
                          onClick={() => handleDeleteGarment(index, garment)}
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

          {/* Delivery Date - NOW MOVED BELOW GARMENTS SECTION */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Order Delivery Details
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
              <p className="text-xs text-slate-400 mt-2">
                This is the overall order delivery date. Each garment can have its own estimated delivery date.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Price Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
                <p className="text-2xl font-black text-blue-700">
                  ₹{priceSummary.totalMin} - ₹{priceSummary.totalMax}
                </p>
              </div>

              {/* Garment Delivery Range */}
              {garments.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs text-purple-600 font-black uppercase mb-1">
                    Garment Delivery Range
                  </p>
                  <p className="text-sm font-bold text-purple-700">
                    {new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery)))).toLocaleDateString()} - {new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery)))).toLocaleDateString()}
                  </p>
                </div>
              )}

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
                    placeholder="Enter amount"
                  />
                </div>
              </div>

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

              <div className="bg-orange-50 p-4 rounded-xl mt-4">
                <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                <p className="text-xl font-black text-orange-700">
                  ₹{balanceAmount.min} - ₹{balanceAmount.max}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !userId}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
                  isSubmitting || !userId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : !userId ? (
                  'Please log in to create order'
                ) : (
                  <>
                    <Save size={18} />
                    Create Order
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
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