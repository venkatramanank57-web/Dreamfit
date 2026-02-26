// src/Pages/admin/storeKeeper/StoreKeeperDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { fetchStoreKeeperById, deleteStoreKeeper } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";

export default function StoreKeeperDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentStoreKeeper, orders, orderStats, loading } = useSelector((state) => state.storeKeeper);
  const { user } = useSelector((state) => state.auth);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  useEffect(() => {
    if (id) dispatch(fetchStoreKeeperById(id));
  }, [dispatch, id]);

  const handleBack = () => navigate("/admin/store-keepers");
  const handleEdit = () => navigate(`/admin/store-keepers/edit/${id}`);
  const handleDelete = async () => {
    try { await dispatch(deleteStoreKeeper(id)).unwrap(); showToast.success("Deleted"); navigate("/admin/store-keepers"); }
    catch (e) { showToast.error(e || "Failed"); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div></div>;

  if (!currentStoreKeeper) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
        <Store size={64} className="text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Store Keeper Not Found</h2>
        <button onClick={handleBack} className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold">Back</button>
      </div>
    );
  }

  const departmentLabels = { inventory: "📦 Inventory", sales: "🛒 Sales", both: "⚡ Full Access" };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-green-600">
          <ArrowLeft size={20} /> <span className="font-bold">Back</span>
        </button>
        <div className="flex gap-3">
          {canEdit && <button onClick={handleEdit} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Edit size={18} /> Edit</button>}
          {canDelete && <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold"><Trash2 size={18} /> Delete</button>}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl font-black">
                {currentStoreKeeper.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">{currentStoreKeeper.name}</h1>
                <p className="text-green-100">{currentStoreKeeper.storeKeeperId}</p>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1"><Briefcase size={16} /> {currentStoreKeeper.experience || 0} years</span>
                  <span className="flex items-center gap-1"><Store size={16} /> {departmentLabels[currentStoreKeeper.department]}</span>
                  {currentStoreKeeper.isActive ? (
                    <span className="flex items-center gap-1 text-green-300"><CheckCircle size={16} /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-300"><AlertCircle size={16} /> Inactive</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-200 text-sm">Joined</p>
              <p className="font-bold">{formatDate(currentStoreKeeper.joiningDate)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-8 flex gap-8">
          {["overview", "orders"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-4 font-bold capitalize border-b-2 transition-colors ${
                activeTab === tab ? "border-green-600 text-green-600" : "border-transparent text-slate-500"
              }`}>
              {tab} {tab === "orders" && `(${orders?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl"><p className="text-blue-600">Total Orders</p><p className="text-3xl font-black">{orderStats?.total || 0}</p></div>
                <div className="bg-green-50 p-6 rounded-xl"><p className="text-green-600">Completed</p><p className="text-3xl font-black">{orderStats?.completed || 0}</p></div>
                <div className="bg-orange-50 p-6 rounded-xl"><p className="text-orange-600">In Progress</p><p className="text-3xl font-black">{orderStats?.inProgress || 0}</p></div>
                <div className="bg-yellow-50 p-6 rounded-xl"><p className="text-yellow-600">Pending</p><p className="text-3xl font-black">{orderStats?.pending || 0}</p></div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-black">Contact</h3>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Phone className="text-green-600 mb-2" size={18} />
                    <p className="font-bold">{currentStoreKeeper.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Mail className="text-purple-600 mb-2" size={18} />
                    <p className="font-bold break-all">{currentStoreKeeper.email}</p>
                  </div>
                  {currentStoreKeeper.address?.street && (
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <MapPin className="text-green-600 mb-2" size={18} />
                      <p>{currentStoreKeeper.address.street}</p>
                      <p className="text-sm text-slate-600">
                        {[currentStoreKeeper.address.city, currentStoreKeeper.address.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-black">Department</h3>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Store className="text-green-600 mb-2" size={18} />
                    <p className="font-bold capitalize">{currentStoreKeeper.department}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {currentStoreKeeper.department === 'inventory' ? 'Manages inventory and stock' :
                       currentStoreKeeper.department === 'sales' ? 'Handles sales and customers' :
                       'Full access to all store operations'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h3 className="font-black mb-4">Created Orders</h3>
              {orders?.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order._id} className="bg-slate-50 p-4 rounded-xl cursor-pointer hover:shadow-md"
                         onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <div className="flex justify-between mb-2">
                        <span className="font-mono font-bold text-green-600">{order.orderId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-slate-400">Customer</p><p>{order.customer?.name || 'N/A'}</p></div>
                        <div><p className="text-slate-400">Delivery</p><p>{formatDate(order.deliveryDate)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <ShoppingBag size={40} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No orders created</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-md rounded-2xl p-6">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center mb-2">Delete Store Keeper?</h3>
            <p className="text-center text-slate-500 mb-6">Delete {currentStoreKeeper.name}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-200 rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}