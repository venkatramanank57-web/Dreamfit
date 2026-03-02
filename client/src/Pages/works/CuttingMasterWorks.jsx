// Pages/works/CuttingMasterWorks.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  RefreshCw,
  Clock,
  CheckCircle,
  Scissors,
  Ruler,
  Truck,
  Eye,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  fetchMyWorks,
  acceptWorkById,
  updateWorkStatusById,
  selectMyWorks,
  selectWorkPagination,
  selectWorkLoading,
  setFilters
} from '../../features/work/workSlice';
import UpdateStatusModal from '../../components/works/UpdateStatusModal';
import showToast from '../../utils/toast';

export default function CuttingMasterWorks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const works = useSelector(selectMyWorks);
  const pagination = useSelector(selectWorkPagination);
  const loading = useSelector(selectWorkLoading);
  const { user } = useSelector((state) => state.auth);

  // State for filter and modals
  const [filter, setFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedWorkForStatus, setSelectedWorkForStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    apiCalled: false,
    response: null,
    error: null,
    worksCount: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 ===== CUTTING MASTER WORKS PAGE LOADED =====');
    console.log('👤 Current user from Redux:', user);
    console.log('🔑 User ID:', user?._id || user?.id);
    console.log('🎭 User Role:', user?.role);
    console.log('📦 Initial works from Redux:', works);
    console.log('📊 Initial pagination:', pagination);
    console.log('🔄 Loading state:', loading);
  }, []);

  useEffect(() => {
    console.log('📦 Works updated:', works);
    console.log('📊 Count:', works?.length || 0);
    setDebugInfo(prev => ({ ...prev, worksCount: works?.length || 0 }));
    
    if (works && works.length > 0) {
      console.log('📋 First work sample:', works[0]);
    }
  }, [works]);

  useEffect(() => {
    console.log('📄 Pagination updated:', pagination);
  }, [pagination]);

  useEffect(() => {
    console.log('🔄 Loading state:', loading);
  }, [loading]);

  // Load works when filter changes
  useEffect(() => {
    console.log(`🎯 Filter changed to: ${filter}, loading works...`);
    loadWorks();
  }, [filter]);

  const loadWorks = async () => {
    console.log(`🚀 Calling fetchMyWorks with filter: ${filter}`);
    setDebugInfo(prev => ({ ...prev, apiCalled: true, error: null }));
    
    try {
      // ✅ FIXED: Don't send status filter when 'all' is selected
      const params = filter !== 'all' ? { status: filter } : {};
      const result = await dispatch(fetchMyWorks(params)).unwrap();
      console.log('✅ fetchMyWorks successful!');
      console.log('📦 Result data:', result);
      setDebugInfo(prev => ({ ...prev, response: result, error: null }));
      return result;
    } catch (error) {
      console.error('❌ fetchMyWorks failed:', error);
      setDebugInfo(prev => ({ ...prev, error: error.toString() }));
      showToast.error('Failed to load works');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadWorks();
    showToast.success('Data refreshed');
  };

  const handleAcceptWork = (id) => {
    console.log(`✅ Accept work clicked for ID: ${id}`);
    if (window.confirm('Accept this work?')) {
      console.log(`📤 Dispatching acceptWorkById for: ${id}`);
      dispatch(acceptWorkById(id)).then(() => {
        console.log(`✅ Work ${id} accepted, reloading works...`);
        loadWorks();
        showToast.success('Work accepted successfully');
      }).catch((error) => {
        console.error('❌ Accept work failed:', error);
        showToast.error('Failed to accept work');
      });
    }
  };

  const handleViewWork = (id) => {
    console.log(`👁️ View work clicked for ID: ${id}`);
    navigate(`/cuttingmaster/works/${id}`);
  };

  const handleUpdateStatus = (work) => {
    console.log(`🔄 Update status clicked for work:`, work);
    setSelectedWorkForStatus(work);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (newStatus, notes) => {
    console.log(`📤 Updating work ${selectedWorkForStatus?._id} to status: ${newStatus}`);
    console.log(`📝 Notes: ${notes}`);
    
    if (selectedWorkForStatus) {
      try {
        await dispatch(updateWorkStatusById({ 
          id: selectedWorkForStatus._id, 
          status: newStatus,
          notes 
        })).unwrap();
        
        setShowStatusModal(false);
        setSelectedWorkForStatus(null);
        await loadWorks();
        showToast.success(`Status updated to ${newStatus.replace(/-/g, ' ')}`);
      } catch (error) {
        console.error('❌ Status update failed:', error);
        showToast.error('Failed to update status');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'cutting-started': 'bg-purple-100 text-purple-700',
      'cutting-completed': 'bg-indigo-100 text-indigo-700',
      'sewing-started': 'bg-pink-100 text-pink-700',
      'sewing-completed': 'bg-teal-100 text-teal-700',
      'ironing': 'bg-orange-100 text-orange-700',
      'ready-to-deliver': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'cutting-started': return <Scissors size={16} />;
      case 'cutting-completed': return <Scissors size={16} />;
      case 'sewing-started': return <Ruler size={16} />;
      case 'sewing-completed': return <Ruler size={16} />;
      case 'ironing': return <Truck size={16} />;
      case 'ready-to-deliver': return <CheckCircle size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-slate-800 text-white rounded-xl text-xs font-mono">
          <details>
            <summary className="cursor-pointer font-bold text-sm mb-2">🔧 Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>👤 User ID: {user?._id || user?.id || 'Not logged in'}</div>
              <div>🎭 User Role: {user?.role || 'Unknown'}</div>
              <div>📦 Works Count: {works?.length || 0}</div>
              <div>📊 Pagination: {JSON.stringify(pagination)}</div>
              <div>🔄 Loading: {loading ? 'true' : 'false'}</div>
              <div>🎯 Current Filter: {filter}</div>
              <div>📡 API Called: {debugInfo.apiCalled ? 'Yes' : 'No'}</div>
              {debugInfo.error && <div>❌ Error: {debugInfo.error}</div>}
            </div>
          </details>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">My Works</h1>
            <p className="text-slate-600">Manage your assigned cutting works</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 bg-white p-1 rounded-lg inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending' ? 'bg-yellow-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'accepted' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setFilter('cutting-started')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'cutting-started' ? 'bg-purple-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cutting
          </button>
          <button
            onClick={() => setFilter('cutting-completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'cutting-completed' ? 'bg-indigo-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('ready-to-deliver')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'ready-to-deliver' ? 'bg-green-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ready
          </button>
        </div>
      </div>

      {/* Works Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : works.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <div
              key={work._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Work ID</p>
                    <p className="font-mono text-sm font-bold text-blue-600">{work.workId}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(work.status)}`}>
                    {getStatusIcon(work.status)}
                    {work.status?.replace(/-/g, ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{work.garment?.name}</h3>
                  <p className="text-sm text-slate-600">Order: {work.order?.orderId}</p>
                  <p className="text-sm text-slate-600">Customer: {work.order?.customer?.name}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Est. Delivery:</span>
                    <span className="font-medium text-slate-800">
                      {work.estimatedDelivery ? new Date(work.estimatedDelivery).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  {work.tailor && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tailor:</span>
                      <span className="font-medium text-slate-800">{work.tailor.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewWork(work._id)}
                    className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {work.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptWork(work._id)}
                        className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>
                    )}

                    {work.status === 'accepted' && !work.tailor && (
                      <button
                        onClick={() => navigate(`/cuttingmaster/works/${work._id}?assign=true`)}
                        className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} />
                        Assign
                      </button>
                    )}

                    {work.status !== 'pending' && 
                     work.status !== 'ready-to-deliver' && 
                     work.status !== 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(work)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Clock size={16} />
                        Update
                      </button>
                    )}

                    {work.status === 'ready-to-deliver' && (
                      <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-center">
                        ✓ Ready
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No works found</p>
          <p className="text-sm text-slate-400 mb-4">You don't have any assigned works yet</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => dispatch(setFilters({ page: pagination.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => dispatch(setFilters({ page: pagination.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedWorkForStatus && (
        <UpdateStatusModal
          work={selectedWorkForStatus}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedWorkForStatus(null);
          }}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}