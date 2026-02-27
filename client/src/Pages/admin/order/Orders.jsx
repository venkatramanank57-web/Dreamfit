import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
  Download,
} from "lucide-react";
import {
  fetchAllOrders,
  deleteOrder,
  updateOrderStatus,
} from "../../../features/order/orderSlice";
import showToast from "../../../utils/toast";

export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Debug flag - set to true to enable console logs
  const DEBUG = true;
  
  // Debug logger
  const logDebug = (message, data) => {
    if (DEBUG) {
      console.log(`[Orders Debug] ${message}`, data || '');
    }
  };

  // Log component mount
  useEffect(() => {
    logDebug('Orders component mounted');
    return () => logDebug('Orders component unmounted');
  }, []);

  const { orders, pagination, loading, error } = useSelector((state) => {
    logDebug('Redux state updated', { 
      ordersCount: state.order?.orders?.length,
      pagination: state.order?.pagination,
      loading: state.order?.loading,
      error: state.order?.error
    });
    return {
      orders: state.order?.orders || [],
      pagination: state.order?.pagination || { page: 1, pages: 1, total: 0 },
      loading: state.order?.loading || false,
      error: state.order?.error
    };
  });
  
  const { user } = useSelector((state) => {
    logDebug('Auth state', { role: state.auth?.user?.role });
    return { user: state.auth?.user };
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  // ✅ Get base path based on user role
  const basePath = useMemo(() => {
    if (isAdmin) return "/admin";
    if (isStoreKeeper) return "/storekeeper";
    return "/cuttingmaster";
  }, [isAdmin, isStoreKeeper]);

  logDebug('User permissions', { isAdmin, isStoreKeeper, canEdit, basePath });

  // Log when filters change
  useEffect(() => {
    logDebug('Filters changed', { searchTerm, statusFilter, timeFilter, currentPage });
  }, [searchTerm, statusFilter, timeFilter, currentPage]);

  // Debounce search
  useEffect(() => {
    logDebug('Setting search debounce', { searchTerm });
    const timer = setTimeout(() => {
      logDebug('Debounced search updated', { debouncedSearch: searchTerm });
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => {
      logDebug('Clearing search debounce timer');
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch orders with error handling
  useEffect(() => {
    const fetchOrders = async () => {
      const params = {
        page: currentPage,
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : "",
        timeFilter,
      };
      
      logDebug('Fetching orders with params', params);
      
      try {
        const result = await dispatch(fetchAllOrders(params)).unwrap();
        logDebug('Orders fetched successfully', { 
          count: result?.orders?.length,
          pagination: result?.pagination 
        });
      } catch (error) {
        logDebug('Error fetching orders', { error: error.message });
        showToast.error(error?.message || "Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [dispatch, currentPage, debouncedSearch, statusFilter, timeFilter]);

  // Log when orders update
  useEffect(() => {
    logDebug('Orders updated', { 
      count: orders?.length,
      orders: orders?.map(o => ({ id: o._id, orderId: o.orderId, status: o.status }))
    });
  }, [orders]);

  // Log pagination changes
  useEffect(() => {
    logDebug('Pagination updated', pagination);
  }, [pagination]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    logDebug('Search input changed', { value });
    setSearchTerm(value);
  }, []);

  // ✅ FIXED: Use basePath for navigation
  const handleViewOrder = useCallback((id) => {
    logDebug('View order', { id, basePath });
    navigate(`${basePath}/orders/${id}`);
  }, [navigate, basePath]);

  // ✅ FIXED: Use basePath for navigation
  const handleEditOrder = useCallback((id) => {
    logDebug('Edit order', { id, canEdit, basePath });
    if (canEdit) {
      navigate(`${basePath}/orders/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit orders");
    }
  }, [canEdit, navigate, basePath]);

  const handleDeleteOrder = useCallback(async (id, orderId) => {
    logDebug('Delete order attempt', { id, orderId, canEdit });
    
    if (!canEdit) {
      showToast.error("You don't have permission to delete orders");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      setDeleteLoading(prev => ({ ...prev, [id]: true }));
      try {
        logDebug('Dispatching deleteOrder', { id });
        await dispatch(deleteOrder(id)).unwrap();
        logDebug('Order deleted successfully', { id });
        showToast.success("Order deleted successfully");
      } catch (error) {
        logDebug('Error deleting order', { id, error: error.message });
        showToast.error(error?.message || "Failed to delete order");
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  }, [dispatch, canEdit]);

  // ✅ FIXED: Use basePath for navigation
  const handleNewOrder = useCallback(() => {
    logDebug('Navigate to new order', { basePath });
    navigate(`${basePath}/orders/new`);
  }, [navigate, basePath]);

  const handlePageChange = useCallback((newPage) => {
    logDebug('Page change requested', { newPage, currentPage, totalPages: pagination?.pages });
    if (newPage >= 1 && newPage <= pagination?.pages) {
      setCurrentPage(newPage);
    } else {
      logDebug('Invalid page number', { newPage });
    }
  }, [pagination?.pages]);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      draft: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Draft" },
      confirmed: { bg: "bg-orange-100", text: "text-orange-700", label: "Confirmed" },
      "in-progress": { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    logDebug('Status badge config', { status, config });
    return config;
  }, []);

  const statusOptions = useMemo(() => [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ], []);

  const timeFilters = useMemo(() => [
    { value: "all", label: "All Time" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "9m", label: "9 Months" },
    { value: "1y", label: "1 Year" },
  ], []);

  // Error display
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Orders</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            logDebug('Retry fetching orders');
            dispatch(fetchAllOrders({
              page: currentPage,
              search: debouncedSearch,
              status: statusFilter !== "all" ? statusFilter : "",
              timeFilter,
            }));
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Debug Panel (only in development) */}
      {DEBUG && process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-3xl font-mono text-sm overflow-auto max-h-40">
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
            <div>State: {loading ? '🔄 Loading' : '✅ Idle'}</div>
            <div>Orders: {orders?.length || 0}</div>
            <div>Page: {currentPage}/{pagination?.pages || 1}</div>
            <div>Filters: S="{searchTerm}" | St="{statusFilter}" | T="{timeFilter}"</div>
            <div>Permissions: {canEdit ? '✏️ Edit' : '👀 View'}</div>
            <div>Base Path: {basePath}</div>
            <div>Role: {user?.role}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
          Orders
        </h1>
        <p className="text-slate-500 font-medium">Manage and track all customer orders</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                logDebug('Toggle filter menu', { show: !showFilterMenu });
                setShowFilterMenu(!showFilterMenu);
              }}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Filter size={18} />
              {statusOptions.find(s => s.value === statusFilter)?.label || "Filter"}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      logDebug('Status filter changed', { from: statusFilter, to: option.value });
                      setStatusFilter(option.value);
                      setShowFilterMenu(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all ${
                      statusFilter === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Order Button */}
          {canEdit && (
            <button
              onClick={handleNewOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus size={20} />
              New Order
            </button>
          )}
        </div>
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {timeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              logDebug('Time filter changed', { from: timeFilter, to: filter.value });
              setTimeFilter(filter.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              timeFilter === filter.value
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Garments
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-slate-500">Loading orders...</p>
                  </td>
                </tr>
              ) : orders?.length > 0 ? (
                orders.map((order) => {
                  if (!order) {
                    logDebug('Invalid order object', order);
                    return null;
                  }
                  
                  const statusBadge = getStatusBadge(order.status);
                  const customer = order.customer || {};
                  const isDeleting = deleteLoading[order._id];
                  
                  return (
                    <tr key={order._id} className={`hover:bg-slate-50 transition-all ${isDeleting ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {order.orderId || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{customer.name || "N/A"}</p>
                          <p className="text-xs text-slate-400">{customer.customerId || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {customer.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                          {order.garments?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            disabled={isDeleting}
                            className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleEditOrder(order._id)}
                                disabled={isDeleting}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id, order.orderId)}
                                disabled={isDeleting}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                {isDeleting ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar size={48} className="text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No orders found</p>
                      {canEdit && (
                        <button
                          onClick={handleNewOrder}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Create First Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page {pagination.page} of {pagination.pages} (Total: {pagination.total} orders)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => {
                // Show limited page numbers
                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-slate-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className={`p-2 rounded-lg ${
                  currentPage === pagination.pages
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}