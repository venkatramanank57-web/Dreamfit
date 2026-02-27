import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Ruler,
  Calendar,
  IndianRupee,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { fetchGarmentById, deleteGarment } from "../../../features/garment/garmentSlice";
import showToast from "../../../utils/toast";

export default function GarmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentGarment, loading } = useSelector((state) => state.garment);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  useEffect(() => {
    if (id) {
      dispatch(fetchGarmentById(id));
    }
  }, [dispatch, id]);

  // ✅ Handle Back - with basePath
  const handleBack = () => {
    if (currentGarment?.order) {
      navigate(`${basePath}/orders/${currentGarment.order._id}`);
    } else {
      navigate(`${basePath}/orders`);
    }
  };

  // ✅ Handle Edit - with basePath
  const handleEdit = () => {
    if (canEdit) {
      navigate(`${basePath}/garments/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit garments");
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to delete garments");
      return;
    }

    if (window.confirm("Are you sure you want to delete this garment?")) {
      try {
        await dispatch(deleteGarment(id)).unwrap();
        showToast.success("Garment deleted successfully");
        // ✅ Navigate with basePath
        if (currentGarment?.order) {
          navigate(`${basePath}/orders/${currentGarment.order._id}`);
        } else {
          navigate(`${basePath}/orders`);
        }
      } catch (error) {
        showToast.error("Failed to delete garment");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending", icon: Clock },
      cutting: { bg: "bg-blue-100", text: "text-blue-700", label: "Cutting", icon: AlertCircle },
      sewing: { bg: "bg-purple-100", text: "text-purple-700", label: "Sewing", icon: Package },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", icon: CheckCircle },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "normal":
        return "bg-blue-100 text-blue-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentGarment) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Garment Not Found</h2>
        <button
          onClick={() => navigate(`${basePath}/orders`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(currentGarment.status);
  const StatusIcon = statusBadge.icon;
  const priorityBadge = getPriorityBadge(currentGarment.priority);
  const order = currentGarment.order || {};
  const customer = order.customer || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Order</span>
        </button>

        <div className="flex items-center gap-3">
          {canEdit && (
            <>
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

      {/* Garment ID Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Garment ID</p>
            <h1 className="text-3xl font-black">{currentGarment.garmentId || currentGarment._id.slice(-8)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${statusBadge.bg} ${statusBadge.text}`}>
              <StatusIcon size={16} className="inline mr-2" />
              {statusBadge.label}
            </span>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${priorityBadge}`}>
              {currentGarment.priority?.toUpperCase() || "NORMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Garment Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Garment Name</p>
                <p className="font-bold text-slate-800">{currentGarment.name}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Category / Item</p>
                <p className="font-bold text-slate-800">
                  {currentGarment.category?.name} / {currentGarment.item?.name}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Order ID</p>
                <p className="font-mono font-bold text-blue-600">{order.orderId || "N/A"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Customer</p>
                <p className="font-bold text-slate-800">{customer.name || "N/A"}</p>
                <p className="text-xs text-slate-400">{customer.phone || ""}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Estimated Delivery</p>
                <p className="font-bold text-slate-800">
                  {new Date(currentGarment.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Price Range</p>
                <p className="font-bold text-blue-600">
                  ₹{currentGarment.priceRange?.min} - ₹{currentGarment.priceRange?.max}
                </p>
              </div>
            </div>

            {currentGarment.additionalInfo && (
              <div className="mt-4 bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Additional Information</p>
                <p className="text-slate-700">{currentGarment.additionalInfo}</p>
              </div>
            )}
          </div>

          {/* Measurements Section */}
          {currentGarment.measurements?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Ruler size={20} className="text-purple-600" />
                Measurements
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentGarment.measurements.map((measurement, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-400 capitalize">{measurement.name}</p>
                    <p className="font-bold text-slate-800">
                      {measurement.value || "-"} {measurement.unit || "inches"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Images & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Reference Images */}
          {currentGarment.referenceImages?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4">Reference Images</h2>
              <div className="grid grid-cols-2 gap-3">
                {currentGarment.referenceImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setSelectedImage(img.url);
                      setShowImageModal(true);
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200 group-hover:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Images */}
          {currentGarment.customerImages?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4">Customer Images</h2>
              <div className="grid grid-cols-2 gap-3">
                {currentGarment.customerImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setSelectedImage(img.url);
                      setShowImageModal(true);
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`Customer ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200 group-hover:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Timeline</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-slate-400">
                    {new Date(currentGarment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {currentGarment.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Started</p>
                    <p className="text-xs text-slate-400">
                      {new Date(currentGarment.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {currentGarment.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-slate-400">
                      {new Date(currentGarment.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-in zoom-in duration-300">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
            >
              <XCircle size={24} />
            </button>
            <a
              href={selectedImage}
              download
              className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all"
            >
              <Download size={20} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}