import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { createOrder } from "../../../features/order/orderSlice";
import { createGarment } from "../../../features/garment/garmentSlice";
import { fetchAllCustomers } from "../../../features/customer/customerSlice";
import GarmentForm from "../garment/GarmentForm";
import showToast from "../../../utils/toast";

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

  // Get customers from Redux
  const { customers, loading: customersLoading } = useSelector((state) => ({
    customers: state.customer?.customers || [],
    loading: state.customer?.loading || false
  }));

  // Get current user from auth state
  const { user } = useSelector((state) => {
    console.log('👤 Full auth state:', state.auth);
    console.log('👤 User object from Redux:', state.auth?.user);
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

  // Get user ID directly from user.id
  const userId = user?.id;
  const userRole = user?.role;

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Enhanced user debugging
  useEffect(() => {
    console.log("👤 USER DEBUG:", {
      userExists: !!user,
      userObject: user,
      userId,
      userRole,
      allKeys: user ? Object.keys(user) : []
    });
  }, [user, userId, userRole]);

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

  // Function to get customer full name
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

  // FIXED: Handle FormData from GarmentForm
  const handleSaveGarment = useCallback((garmentData) => {
    console.log("📦 Received garment data:", garmentData);
    
    // Check if it's FormData (for new/edited garments with images)
    if (garmentData instanceof FormData) {
      // Convert FormData to object for storage
      const garmentObj = {
        tempId: editingGarment?.tempId || Date.now() + Math.random(),
        referenceImages: [],
        customerImages: [],
        customerClothImages: []
      };
      
      // Parse FormData
      for (let [key, value] of garmentData.entries()) {
        if (value instanceof File) {
          // Store files in appropriate arrays
          if (key === 'referenceImages') {
            garmentObj.referenceImages.push(value);
          } else if (key === 'customerImages') {
            garmentObj.customerImages.push(value);
          } else if (key === 'customerClothImages') {
            garmentObj.customerClothImages.push(value);
          }
        } else {
          // Parse JSON fields
          if (key === 'measurements' || key === 'priceRange') {
            try {
              garmentObj[key] = JSON.parse(value);
            } catch {
              garmentObj[key] = value;
            }
          } else {
            garmentObj[key] = value;
          }
        }
      }
      
      console.log("📦 Converted garment object:", {
        name: garmentObj.name,
        referenceImages: garmentObj.referenceImages?.length || 0,
        customerImages: garmentObj.customerImages?.length || 0,
        customerClothImages: garmentObj.customerClothImages?.length || 0
      });
      
      if (editingGarment !== null) {
        // Update existing garment
        const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
        if (index !== -1) {
          const newGarments = [...garments];
          newGarments[index] = garmentObj;
          setGarments(newGarments);
          showToast.success("Garment updated");
        }
      } else {
        // Add new garment
        setGarments([...garments, garmentObj]);
        showToast.success("Garment added");
      }
    } else {
      // Old method (plain object) - for backward compatibility
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

    const finalUserId = user?.id;

    if (!finalUserId) {
      console.error("❌ No user ID found. User object:", user);
      showToast.error("You must be logged in to create an order. Please log in and try again.");
      return;
    }

    console.log("✅ Using User ID for createdBy:", finalUserId);

    // Validate MongoDB ID format
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(finalUserId);
    if (!isValidMongoId) {
      console.warn("⚠️ User ID may not be a valid MongoDB ID:", finalUserId);
    }

    for (const [index, garment] of garments.entries()) {
      if (!garment.name || !garment.category || !garment.item) {
        showToast.error(`Garment #${index + 1} is incomplete`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
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
        createdBy: finalUserId,
        status: "draft",
        orderDate: new Date().toISOString(),
        garments: [],
      };

      // CRITICAL: Validate createdBy before sending
      if (!orderData.createdBy) {
        throw new Error("createdBy is undefined in final order data!");
      }

      console.log("========== FINAL ORDER DATA ==========");
      console.log("📦 createdBy value:", orderData.createdBy);
      console.log("📦 createdBy length:", orderData.createdBy.length);
      console.log("📦 createdBy type:", typeof orderData.createdBy);
      console.log("📦 createdBy valid MongoDB ID:", /^[0-9a-fA-F]{24}$/.test(orderData.createdBy));
      console.log("📦 Full order data:", JSON.stringify(orderData, null, 2));
      console.log("======================================");

      const result = await dispatch(createOrder(orderData)).unwrap();
      logDebug('Order created successfully', result);
      
      const orderId = result.order?._id || result._id;

      // Create garments with images
      for (const garment of garments) {
        logDebug(`Creating garment`, garment);
        
        const garmentFormData = new FormData();
        
        // Add text fields
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
        garmentFormData.append("createdBy", finalUserId);

        // Add images with correct field names
        if (garment.referenceImages && garment.referenceImages.length > 0) {
          console.log(`📸 Adding ${garment.referenceImages.length} reference images`);
          for (const img of garment.referenceImages) {
            if (img instanceof File) {
              garmentFormData.append("referenceImages", img);
              console.log(`   ✅ Added: ${img.name}`);
            }
          }
        }
        
        if (garment.customerImages && garment.customerImages.length > 0) {
          console.log(`📸 Adding ${garment.customerImages.length} customer images`);
          for (const img of garment.customerImages) {
            if (img instanceof File) {
              garmentFormData.append("customerImages", img);
              console.log(`   ✅ Added: ${img.name}`);
            }
          }
        }
        
        if (garment.customerClothImages && garment.customerClothImages.length > 0) {
          console.log(`📸 Adding ${garment.customerClothImages.length} cloth images`);
          for (const img of garment.customerClothImages) {
            if (img instanceof File) {
              garmentFormData.append("customerClothImages", img);
              console.log(`   ✅ Added: ${img.name}`);
            }
          }
        }

        // Debug log FormData
        console.log("🔍 Garment FormData contents:");
        let imageCount = 0;
        for (let [key, value] of garmentFormData.entries()) {
          if (value instanceof File) {
            imageCount++;
            console.log(`   📸 ${key}: ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`   📝 ${key}: ${value.substring?.(0, 50) || value}`);
          }
        }
        console.log(`📊 Total images in this garment: ${imageCount}`);

        await dispatch(createGarment({ orderId, garmentData: garmentFormData })).unwrap();
      }

      showToast.success("Order created successfully! 🎉");
      // ✅ Navigate with basePath
      navigate(`${basePath}/orders`);
    } catch (error) {
      console.error('❌ Full error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error.response?.data?.message || error.message || "Failed to create order");
      
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug Panel
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
          <div>Garments with Images: {
            garments.filter(g => 
              (g.referenceImages?.length > 0) || 
              (g.customerImages?.length > 0) || 
              (g.customerClothImages?.length > 0)
            ).length
          }</div>
          <div>Delivery Date: {formData.deliveryDate || 'Not set'}</div>
          <div>Customers Loaded: {customers?.length || 0}</div>
          <div>Filtered Customers: {filteredCustomers.length}</div>
          <div>Base Path: {basePath}</div>
          <div className="text-yellow-400 font-bold">
            User Object: {user ? JSON.stringify(user).substring(0, 100) + '...' : '❌ No user'}
          </div>
          <div className="text-green-400 font-bold">
            User ID: {userId || '❌ Not found'} {userId && ( /^[0-9a-fA-F]{24}$/.test(userId) ? '✅ Valid' : '⚠️ Invalid format' )}
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
          onClick={() => navigate(`${basePath}/orders`)}
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
                        onClick={() => navigate(`${basePath}/add-customer`)}
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

            {/* Special Notes */}
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
                          {(garment.referenceImages?.length > 0 || 
                            garment.customerImages?.length > 0 || 
                            garment.customerClothImages?.length > 0) && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                              📸 {garment.referenceImages?.length || 0}/
                              {garment.customerImages?.length || 0}/
                              {garment.customerClothImages?.length || 0}
                            </span>
                          )}
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

          {/* Delivery Date */}
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
                onClick={() => navigate(`${basePath}/orders`)}
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