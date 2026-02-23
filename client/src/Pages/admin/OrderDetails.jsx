import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Download,
  Package,
  User,
  Phone,
  Calendar,
  IndianRupee,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Image as ImageIcon,
  Camera,
  X,
} from "lucide-react";
import {
  fetchOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../../features/order/orderSlice";
import { fetchGarmentsByOrder } from "../../features/garment/garmentSlice";
import showToast from "../../utils/toast";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, loading } = useSelector((state) => state.order);
  const { garments } = useSelector((state) => state.garment);
  const { user } = useSelector((state) => state.auth);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageType, setImageType] = useState("");
  const [expandedGarment, setExpandedGarment] = useState(null);
  const [debug, setDebug] = useState({});

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  useEffect(() => {
    if (id) {
      console.log("🔍 Fetching order details for ID:", id);
      dispatch(fetchOrderById(id));
      dispatch(fetchGarmentsByOrder(id));
    }
  }, [dispatch, id]);

  // Debug: Log garments data when it changes
  useEffect(() => {
    if (garments) {
      console.log("📦 Garments data received:", garments);
      
      garments.forEach((garment, index) => {
        console.log(`📌 Garment ${index + 1}:`, {
          id: garment._id,
          name: garment.name,
          referenceImages: garment.referenceImages,
          customerImages: garment.customerImages,
          referenceImagesType: typeof garment.referenceImages,
          customerImagesType: typeof garment.customerImages,
          referenceImagesLength: garment.referenceImages?.length,
          customerImagesLength: garment.customerImages?.length,
          referenceImagesIsArray: Array.isArray(garment.referenceImages),
          customerImagesIsArray: Array.isArray(garment.customerImages),
        });

        // Log each image URL
        if (garment.referenceImages && garment.referenceImages.length > 0) {
          garment.referenceImages.forEach((img, i) => {
            console.log(`   🖼️ Reference image ${i + 1}:`, img);
          });
        }
        
        if (garment.customerImages && garment.customerImages.length > 0) {
          garment.customerImages.forEach((img, i) => {
            console.log(`   🖼️ Customer image ${i + 1}:`, img);
          });
        }
      });

      setDebug({
        garmentsCount: garments.length,
        garmentsWithRefImages: garments.filter(g => g.referenceImages?.length > 0).length,
        garmentsWithCustImages: garments.filter(g => g.customerImages?.length > 0).length,
      });
    }
  }, [garments]);

  const handleBack = () => {
    navigate("/admin/orders");
  };

  const handleEdit = () => {
    if (canEdit) {
      navigate(`/admin/orders/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit orders");
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to delete orders");
      return;
    }

    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        showToast.success("Order deleted successfully");
        navigate("/admin/orders");
      } catch (error) {
        showToast.error("Failed to delete order");
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!canEdit) {
      showToast.error("You don't have permission to update order status");
      return;
    }

    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
      showToast.success(`Order status updated to ${newStatus}`);
      setShowStatusMenu(false);
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  const handleViewGarment = (garmentId) => {
    navigate(`/admin/garments/${garmentId}`);
  };

  const handleViewImage = (image, type) => {
    console.log("🔍 Opening image:", image, "type:", type);
    setSelectedImage(image);
    setImageType(type);
    setShowImageModal(true);
  };

  const toggleGarmentImages = (garmentId) => {
    setExpandedGarment(expandedGarment === garmentId ? null : garmentId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Draft", icon: Clock },
      confirmed: { bg: "bg-orange-100", text: "text-orange-700", label: "Confirmed", icon: CheckCircle },
      "in-progress": { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress", icon: AlertCircle },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered", icon: CheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: XCircle },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Function to safely get image URL
  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(currentOrder.status);
  const StatusIcon = statusBadge.icon;
  const customer = currentOrder.customer || {};
  const advancePayment = currentOrder.advancePayment || {};
  const priceSummary = currentOrder.priceSummary || { totalMin: 0, totalMax: 0 };
  const balanceAmount = {
    min: priceSummary.totalMin - (advancePayment.amount || 0),
    max: priceSummary.totalMax - (advancePayment.amount || 0),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-2xl font-mono text-sm mb-4 overflow-auto max-h-40">
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
            <div>Garments: {garments?.length || 0}</div>
            <div>With Reference Images: {debug.garmentsWithRefImages || 0}</div>
            <div>With Customer Images: {debug.garmentsWithCustImages || 0}</div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt="Garment"
              className="w-full h-auto rounded-2xl shadow-2xl"
              onError={(e) => {
                console.error("❌ Image failed to load:", getImageUrl(selectedImage));
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            <p className="text-white text-center mt-4 capitalize">
              {imageType === 'reference' ? 'Studio Reference Image' : 'Customer Image'}
            </p>
          </div>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Orders</span>
        </button>

        <div className="flex items-center gap-3">
          {canEdit && (
            <>
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}
                >
                  <StatusIcon size={18} />
                  {statusBadge.label}
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all ${
                          currentOrder.status === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Order ID Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Order ID</p>
            <h1 className="text-3xl font-black">{currentOrder.orderId}</h1>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm font-medium">Order Date</p>
            <p className="text-xl font-bold">
              {new Date(currentOrder.orderDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Customer Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{customer.name || "N/A"}</p>
                  <p className="text-sm text-slate-400">{customer.customerId || ""}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Phone size={16} className="text-blue-500" />
                    <span className="text-xs font-medium">Phone</span>
                  </div>
                  <p className="font-bold">{customer.phone || "N/A"}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-xs font-medium">Delivery Date</span>
                  </div>
                  <p className="font-bold">
                    {new Date(currentOrder.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {currentOrder.specialNotes && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 mb-1">Special Notes</p>
                  <p className="text-slate-700">{currentOrder.specialNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Garments List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Garments ({garments?.length || 0})
              </h2>
              {canEdit && (
                <button
                  onClick={() => navigate(`/admin/orders/${id}/add-garment`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Garment
                </button>
              )}
            </div>

            {garments?.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Package size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">No garments in this order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {garments.map((garment) => {
                  const garmentStatus = getStatusBadge(garment.status || "pending");
                  
                  // Get images from database fields
                  const referenceImages = garment.referenceImages || [];
                  const customerImages = garment.customerImages || [];
                  
                  const hasReferenceImages = referenceImages.length > 0;
                  const hasCustomerImages = customerImages.length > 0;
                  const totalImages = referenceImages.length + customerImages.length;
                  
                  console.log(`🎨 Garment ${garment.name}:`, {
                    referenceImages: referenceImages.length,
                    customerImages: customerImages.length,
                    total: totalImages
                  });
                  
                  return (
                    <div
                      key={garment._id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-black text-slate-800">{garment.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${garmentStatus.bg} ${garmentStatus.text}`}>
                              {garmentStatus.label}
                            </span>
                            {totalImages > 0 && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {totalImages} {totalImages === 1 ? 'image' : 'images'}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                            <div>
                              <p className="text-slate-400">Garment ID</p>
                              <p className="font-mono text-slate-700">{garment.garmentId}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Price Range</p>
                              <p className="font-bold text-blue-600">
                                ₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Delivery</p>
                              <p>{new Date(garment.estimatedDelivery).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Image Previews - Always visible */}
                          {totalImages > 0 && (
                            <div className="flex gap-2 mt-2">
                              {/* Reference Images */}
                              {referenceImages.slice(0, 3).map((img, idx) => {
                                const imgUrl = getImageUrl(img);
                                console.log(`🖼️ Reference image URL ${idx + 1}:`, imgUrl);
                                
                                return imgUrl ? (
                                  <div
                                    key={`ref-${idx}`}
                                    className="relative group cursor-pointer"
                                    onClick={() => handleViewImage(img, 'reference')}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Reference ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-500 transition-all"
                                      onError={(e) => {
                                        console.error(`❌ Failed to load reference image: ${imgUrl}`);
                                        e.target.src = 'https://via.placeholder.com/48?text=Error';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                                      <Eye size={14} className="text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                ) : null;
                              })}
                              
                              {/* Customer Images */}
                              {customerImages.slice(0, 3).map((img, idx) => {
                                const imgUrl = getImageUrl(img);
                                console.log(`🖼️ Customer image URL ${idx + 1}:`, imgUrl);
                                
                                return imgUrl ? (
                                  <div
                                    key={`cust-${idx}`}
                                    className="relative group cursor-pointer"
                                    onClick={() => handleViewImage(img, 'customer')}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Customer ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-green-200 hover:border-green-500 transition-all"
                                      onError={(e) => {
                                        console.error(`❌ Failed to load customer image: ${imgUrl}`);
                                        e.target.src = 'https://via.placeholder.com/48?text=Error';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                                      <Eye size={14} className="text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                ) : null;
                              })}
                              
                              {/* More images indicator */}
                              {totalImages > 6 && (
                                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                                  +{totalImages - 6}
                                </div>
                              )}
                            </div>
                          )}

                          {/* View All Images Button */}
                          {totalImages > 0 && (
                            <button
                              onClick={() => toggleGarmentImages(garment._id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
                            >
                              <ImageIcon size={14} />
                              {expandedGarment === garment._id ? 'Hide all images' : 'View all images'}
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleViewGarment(garment._id)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 ml-2"
                          title="View garment details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      {/* Expanded Image Gallery */}
                      {expandedGarment === garment._id && totalImages > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          {/* Reference Images Section */}
                          {referenceImages.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Camera size={16} className="text-indigo-600" />
                                <p className="text-sm font-bold text-indigo-600">
                                  Studio Reference Images ({referenceImages.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {referenceImages.map((img, idx) => {
                                  const imgUrl = getImageUrl(img);
                                  return imgUrl ? (
                                    <div
                                      key={`ref-full-${idx}`}
                                      className="relative group cursor-pointer aspect-square"
                                      onClick={() => handleViewImage(img, 'reference')}
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Reference ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-500 transition-all"
                                        onError={(e) => {
                                          console.error(`❌ Failed to load reference image in gallery: ${imgUrl}`);
                                          e.target.src = 'https://via.placeholder.com/150?text=Error';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-center justify-center">
                                        <Eye size={20} className="text-white opacity-0 group-hover:opacity-100" />
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Customer Images Section */}
                          {customerImages.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon size={16} className="text-green-600" />
                                <p className="text-sm font-bold text-green-600">
                                  Customer Images ({customerImages.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {customerImages.map((img, idx) => {
                                  const imgUrl = getImageUrl(img);
                                  return imgUrl ? (
                                    <div
                                      key={`cust-full-${idx}`}
                                      className="relative group cursor-pointer aspect-square"
                                      onClick={() => handleViewImage(img, 'customer')}
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Customer ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg border-2 border-green-200 hover:border-green-500 transition-all"
                                        onError={(e) => {
                                          console.error(`❌ Failed to load customer image in gallery: ${imgUrl}`);
                                          e.target.src = 'https://via.placeholder.com/150?text=Error';
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-center justify-center">
                                        <Eye size={20} className="text-white opacity-0 group-hover:opacity-100" />
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Payment Summary</h2>
            
            <div className="space-y-4">
              {/* Total Amount */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
                <p className="text-2xl font-black text-blue-700">
                  ₹{priceSummary.totalMin} - ₹{priceSummary.totalMax}
                </p>
              </div>

              {/* Advance Payment */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase text-slate-500">Advance Payment</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {advancePayment.method || "cash"}
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600">₹{advancePayment.amount || 0}</p>
              </div>

              {/* Balance Amount */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                <p className="text-xl font-black text-orange-700">
                  ₹{balanceAmount.min} - ₹{balanceAmount.max}
                </p>
              </div>

              {/* Order Timeline */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-black uppercase text-slate-500 mb-3">Order Timeline</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order Created</p>
                      <p className="text-xs text-slate-400">
                        {new Date(currentOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {currentOrder.status === "delivered" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-slate-400">
                          {new Date(currentOrder.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentOrder.status === "cancelled" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cancelled</p>
                        <p className="text-xs text-slate-400">
                          {new Date(currentOrder.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Invoice */}
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Download size={18} />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}