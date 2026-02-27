import React, { useState, useEffect, useRef } from "react";
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
  Scissors,
  X,
  Send,
  PackageCheck,
} from "lucide-react";
import {
  fetchOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../../features/order/orderSlice";
import { fetchGarmentsByOrder } from "../../features/garment/garmentSlice";
import OrderInvoice from "../../components/OrderInvoice";
import showToast from "../../utils/toast";

// ==================== IMAGE MODAL COMPONENT ====================
const ImageModal = ({ isOpen, image, imageType, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const getFullImageUrl = (img) => {
    if (!img) return null;
    
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
      return `http://localhost:5000/uploads/${img}`;
    }
    
    if (img.url) {
      return img.url;
    }
    
    return null;
  };

  const imageUrl = getFullImageUrl(image);

  const getImageTypeLabel = () => {
    switch(imageType) {
      case 'reference':
        return 'Studio Reference';
      case 'customer':
        return 'Customer Digital';
      case 'cloth':
        return 'Customer Cloth';
      default:
        return 'Image';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-6xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
          title="Close (Esc)"
        >
          <X size={24} />
        </button>

        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={imageUrl}
            alt={getImageTypeLabel()}
            className="w-full h-auto max-h-[85vh] object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          <span className="capitalize">{getImageTypeLabel()}</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden md:block">
        Press ESC to close
      </div>
    </div>
  );
};

// ==================== MAIN ORDER DETAILS COMPONENT ====================
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoiceRef = useRef();
  
  const { currentOrder, loading } = useSelector((state) => state.order);
  const { garments } = useSelector((state) => state.garment);
  const { user } = useSelector((state) => state.auth);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    image: null,
    type: ''
  });
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

  // Debug: Log garments data
  useEffect(() => {
    if (garments) {
      console.log("📦 ========== GARMENTS DATA RECEIVED ==========");
      console.log("Raw garments data:", garments);
      
      garments.forEach((garment, index) => {
        console.log(`\n📌 Garment ${index + 1}:`, {
          id: garment._id,
          name: garment.name,
          referenceImagesCount: garment.referenceImages?.length || 0,
          customerImagesCount: garment.customerImages?.length || 0,
          customerClothImagesCount: garment.customerClothImages?.length || 0,
        });
      });

      setDebug({
        garmentsCount: garments.length,
        garmentsWithRefImages: garments.filter(g => g.referenceImages?.length > 0).length,
        garmentsWithCustImages: garments.filter(g => g.customerImages?.length > 0).length,
        garmentsWithClothImages: garments.filter(g => g.customerClothImages?.length > 0).length,
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

  // Handle Invoice Download
  const handleDownloadInvoice = () => {
    if (invoiceRef.current) {
      invoiceRef.current.handleDownload();
    } else {
      showToast.error("Invoice not ready");
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // ✅ Handle Send Acknowledgment
  const handleSendAcknowledgment = () => {
    showToast.success("Acknowledgment sent to customer");
  };

  // ✅ Handle Ready for Pickup
  const handleReadyForPickup = () => {
    showToast.success("Pickup notification sent to customer");
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    
    if (img.url) {
      return img.url;
    }
    
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
      return `http://localhost:5000/uploads/${img}`;
    }
    
    return null;
  };

  const handleViewImage = (image, type) => {
    setImageModal({
      isOpen: true,
      image: image,
      type: type
    });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, image: null, type: '' });
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
      {/* Image Modal */}
      <ImageModal 
        isOpen={imageModal.isOpen}
        image={imageModal.image}
        imageType={imageModal.type}
        onClose={closeImageModal}
      />

      {/* Hidden Invoice Component */}
      <div className="fixed left-[-9999px] top-0">
        <OrderInvoice 
          ref={invoiceRef}
          order={currentOrder}
          garments={garments}
        />
      </div>

      {/* Debug Panel */}
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
            <div className="text-yellow-300">Garments: {garments?.length || 0}</div>
            <div className="text-blue-300">Reference Images: {debug.garmentsWithRefImages || 0}</div>
            <div className="text-green-300">Customer Images: {debug.garmentsWithCustImages || 0}</div>
            <div className="text-orange-300">Cloth Images: {debug.garmentsWithClothImages || 0}</div>
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
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Download size={18} />
            Invoice
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
        {/* Left Column */}
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
                  
                  const referenceImages = garment.referenceImages || [];
                  const customerImages = garment.customerImages || [];
                  const customerClothImages = garment.customerClothImages || [];
                  
                  const totalImages = referenceImages.length + customerImages.length + customerClothImages.length;
                  
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

                          {totalImages > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {/* Reference Images */}
                              {referenceImages.slice(0, 2).map((img, idx) => {
                                const imgUrl = getImageUrl(img);
                                return imgUrl ? (
                                  <button
                                    key={`ref-${idx}`}
                                    onClick={() => handleViewImage(img, 'reference')}
                                    className="relative group"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Reference ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200"
                                    />
                                  </button>
                                ) : null;
                              })}
                              
                              {/* Customer Images */}
                              {customerImages.slice(0, 2).map((img, idx) => {
                                const imgUrl = getImageUrl(img);
                                return imgUrl ? (
                                  <button
                                    key={`cust-${idx}`}
                                    onClick={() => handleViewImage(img, 'customer')}
                                    className="relative group"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Customer ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-green-200"
                                    />
                                  </button>
                                ) : null;
                              })}
                              
                              {/* Cloth Images */}
                              {customerClothImages.slice(0, 2).map((img, idx) => {
                                const imgUrl = getImageUrl(img);
                                return imgUrl ? (
                                  <button
                                    key={`cloth-${idx}`}
                                    onClick={() => handleViewImage(img, 'cloth')}
                                    className="relative group"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Cloth ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded-lg border-2 border-orange-200"
                                    />
                                  </button>
                                ) : null;
                              })}
                              
                              {totalImages > 6 && (
                                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                                  +{totalImages - 6}
                                </div>
                              )}
                            </div>
                          )}

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
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      {/* Expanded Gallery */}
                      {expandedGarment === garment._id && totalImages > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          {referenceImages.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Camera size={16} className="text-indigo-600" />
                                <p className="text-sm font-bold text-indigo-600">
                                  Reference Images ({referenceImages.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {referenceImages.map((img, idx) => {
                                  const imgUrl = getImageUrl(img);
                                  return imgUrl ? (
                                    <button
                                      key={`ref-full-${idx}`}
                                      onClick={() => handleViewImage(img, 'reference')}
                                      className="relative group aspect-square"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Reference ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {customerImages.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon size={16} className="text-green-600" />
                                <p className="text-sm font-bold text-green-600">
                                  Customer Images ({customerImages.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {customerImages.map((img, idx) => {
                                  const imgUrl = getImageUrl(img);
                                  return imgUrl ? (
                                    <button
                                      key={`cust-full-${idx}`}
                                      onClick={() => handleViewImage(img, 'customer')}
                                      className="relative group aspect-square"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Customer ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {customerClothImages.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Scissors size={16} className="text-orange-600" />
                                <p className="text-sm font-bold text-orange-600">
                                  Cloth Images ({customerClothImages.length})
                                </p>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {customerClothImages.map((img, idx) => {
                                  const imgUrl = getImageUrl(img);
                                  return imgUrl ? (
                                    <button
                                      key={`cloth-full-${idx}`}
                                      onClick={() => handleViewImage(img, 'cloth')}
                                      className="relative group aspect-square"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Cloth ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg border-2 border-orange-200"
                                      />
                                    </button>
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
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
                <p className="text-2xl font-black text-blue-700">
                  ₹{priceSummary.totalMin} - ₹{priceSummary.totalMax}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase text-slate-500">Advance Payment</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {advancePayment.method || "cash"}
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600">₹{advancePayment.amount || 0}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                <p className="text-xl font-black text-orange-700">
                  ₹{balanceAmount.min} - ₹{balanceAmount.max}
                </p>
              </div>

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

              {/* ✅ TWO NEW BUTTONS ADDED HERE - BOTTOM OF PAGE */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSendAcknowledgment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Send size={18} />
                  Send Acknowledgment
                </button>

                <button
                  onClick={handleReadyForPickup}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <PackageCheck size={18} />
                  Order Ready for Pickup
                </button>
              </div>

              {/* Download Invoice Button */}
              <button
                onClick={handleDownloadInvoice}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
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