// Pages/works/WorkDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Clock,
  User,
  Scissors,
  Ruler,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw,
  UserPlus,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { 
  fetchWorkById,
  acceptWorkById,
  assignTailorToWork,
  updateWorkStatusById,
  selectCurrentWork,
  selectWorkLoading,
  clearCurrentWork
} from '../../features/work/workSlice';
import { fetchAllTailors } from '../../features/tailor/tailorSlice';
import AssignTailorModal from '../../components/works/AssignTailorModal';
import UpdateStatusModal from '../../components/works/UpdateStatusModal';
import showToast from '../../utils/toast';

export default function WorkDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const work = useSelector(selectCurrentWork);
  const loading = useSelector(selectWorkLoading);
  const { user } = useSelector((state) => state.auth);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, measurements, images

  const isAdmin = user?.role === 'ADMIN';
  const isStoreKeeper = user?.role === 'STORE_KEEPER';
  const isCuttingMaster = user?.role === 'CUTTING_MASTER';

  useEffect(() => {
    loadWork();
    return () => {
      dispatch(clearCurrentWork());
    };
  }, [id]);

  const loadWork = () => {
    dispatch(fetchWorkById(id));
  };

  const handleRefresh = () => {
    loadWork();
    showToast.success('Data refreshed');
  };

  const handleAcceptWork = () => {
    if (window.confirm('Accept this work?')) {
      dispatch(acceptWorkById(id)).then(() => {
        loadWork();
      });
    }
  };

  const handleAssignTailor = (tailorId) => {
    dispatch(assignTailorToWork({ id, tailorId })).then(() => {
      loadWork();
    });
  };

  const handleUpdateStatus = (statusData) => {
    dispatch(updateWorkStatusById({ id, ...statusData })).then(() => {
      loadWork();
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'accepted': 'bg-blue-100 text-blue-700 border-blue-200',
      'cutting-started': 'bg-purple-100 text-purple-700 border-purple-200',
      'cutting-completed': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'sewing-started': 'bg-pink-100 text-pink-700 border-pink-200',
      'sewing-completed': 'bg-teal-100 text-teal-700 border-teal-200',
      'ironing': 'bg-orange-100 text-orange-700 border-orange-200',
      'ready-to-deliver': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[work?.status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={20} />;
      case 'accepted': return <CheckCircle size={20} />;
      case 'cutting-started': return <Scissors size={20} />;
      case 'cutting-completed': return <Scissors size={20} />;
      case 'sewing-started': return <Ruler size={20} />;
      case 'sewing-completed': return <Ruler size={20} />;
      case 'ironing': return <Truck size={20} />;
      case 'ready-to-deliver': return <CheckCircle size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  const isOverdue = () => {
    return work?.estimatedDelivery && new Date(work.estimatedDelivery) < new Date() && work?.status !== 'ready-to-deliver';
  };

  if (loading && !work) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading work details...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="text-center">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Work Not Found</h2>
          <p className="text-slate-600 mb-4">The work you're looking for doesn't exist.</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-all"
        >
          <ArrowLeft size={18} />
          <span>Back to Works</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Work Details</h1>
            <p className="text-slate-600">Work ID: {work.workId}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-xl border ${getStatusColor(work.status)} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(work.status)}
          <div>
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-lg font-bold capitalize">{work.status?.replace(/-/g, ' ')}</p>
          </div>
        </div>
        {isOverdue() && (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-lg">
            <AlertCircle size={18} />
            <span className="font-medium">Overdue</span>
          </div>
        )}
      </div>

      {/* Action Buttons for Cutting Master */}
      {isCuttingMaster && (
        <div className="mb-6 flex gap-3">
          {work.status === 'pending' && (
            <button
              onClick={handleAcceptWork}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Accept Work
            </button>
          )}
          
          {work.status !== 'pending' && !work.tailor && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <UserPlus size={18} />
              Assign Tailor
            </button>
          )}

          {work.tailor && work.status !== 'ready-to-deliver' && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Clock size={18} />
              Update Status
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-slate-200">
        <div className="flex gap-1 p-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'details' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={18} className="inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'measurements' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Ruler size={18} className="inline mr-2" />
            Measurements
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'images' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ImageIcon size={18} className="inline mr-2" />
            Images
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl p-6 shadow-sm">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Order ID</span>
                    <span className="text-sm font-medium text-blue-600">{work.order?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Order Date</span>
                    <span className="text-sm text-slate-800">{formatDate(work.order?.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Delivery Date</span>
                    <span className="text-sm text-slate-800">{formatDate(work.order?.deliveryDate)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-4">Customer Details</h3>
                <div className="space-y-3">
                  <p className="font-medium text-slate-800">{work.order?.customer?.name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} />
                    <span>{work.order?.customer?.phone}</span>
                  </div>
                  {work.order?.customer?.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} />
                      <span>{work.order.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Garment Information */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-4">Garment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Garment Name</p>
                  <p className="font-medium text-slate-800">{work.garment?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Garment ID</p>
                  <p className="font-mono text-sm text-blue-600">{work.garment?.garmentId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Price Range</p>
                  <p className="font-medium text-slate-800">
                    ₹{work.garment?.priceRange?.min} - ₹{work.garment?.priceRange?.max}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Priority</p>
                  <p className="font-medium capitalize text-slate-800">{work.garment?.priority}</p>
                </div>
              </div>
            </div>

            {/* Work Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-4">Cutting Master</h3>
                {work.cuttingMaster ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{work.cuttingMaster.name}</p>
                      <p className="text-xs text-slate-500">Assigned on {formatDate(work.acceptedAt)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Not assigned yet</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-4">Tailor</h3>
                {work.tailor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Scissors size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{work.tailor.name}</p>
                      <p className="text-xs text-slate-500">{work.tailor.employeeId}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Not assigned yet</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-4">Work Timeline</h3>
              <div className="space-y-3">
                {work.acceptedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Accepted: {formatDate(work.acceptedAt)}</span>
                  </div>
                )}
                {work.cuttingStartedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Cutting Started: {formatDate(work.cuttingStartedAt)}</span>
                  </div>
                )}
                {work.cuttingCompletedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Cutting Completed: {formatDate(work.cuttingCompletedAt)}</span>
                  </div>
                )}
                {work.sewingStartedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Sewing Started: {formatDate(work.sewingStartedAt)}</span>
                  </div>
                )}
                {work.sewingCompletedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Sewing Completed: {formatDate(work.sewingCompletedAt)}</span>
                  </div>
                )}
                {work.ironingAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Ironing: {formatDate(work.ironingAt)}</span>
                  </div>
                )}
                {work.readyAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Ready to Deliver: {formatDate(work.readyAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {(work.cuttingNotes || work.tailorNotes) && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-4">Notes</h3>
                {work.cuttingNotes && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Cutting Notes:</p>
                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg">{work.cuttingNotes}</p>
                  </div>
                )}
                {work.tailorNotes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tailor Notes:</p>
                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg">{work.tailorNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'measurements' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Garment Measurements</h3>
              {work.measurementPdf && (
                <a
                  href={work.measurementPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {work.garment?.measurements?.map((measurement, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1 capitalize">{measurement.name}</p>
                  <p className="text-xl font-bold text-slate-800">
                    {measurement.value} <span className="text-sm font-normal text-slate-500">{measurement.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Reference Images */}
            {work.garment?.referenceImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Reference Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {work.garment.referenceImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Eye size={24} className="text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Images */}
            {work.garment?.customerImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Customer Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {work.garment.customerImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Customer ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Eye size={24} className="text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cloth Images */}
            {work.garment?.customerClothImages?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Cloth Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {work.garment.customerClothImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Cloth ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Eye size={24} className="text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!work.garment?.referenceImages?.length && 
             !work.garment?.customerImages?.length && 
             !work.garment?.customerClothImages?.length && (
              <div className="text-center py-12">
                <ImageIcon size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No images available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignTailorModal
          work={work}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignTailor}
        />
      )}

      {showStatusModal && (
        <UpdateStatusModal
          work={work}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}