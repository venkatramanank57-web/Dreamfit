import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Package, Palette, 
  IndianRupee, Calendar, Tag, Image as ImageIcon, Power 
} from "lucide-react";
import { fetchFabricById, deleteFabric, toggleFabricStatus, clearCurrentFabric } from "../../../features/fabric/fabricSlice";
import showToast from "../../../utils/toast";

export default function FabricDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentFabric, loading } = useSelector((state) => state.fabric);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin; // Only Admin can delete
  const canToggle = isAdmin || isStoreKeeper;

  useEffect(() => {
    if (id) dispatch(fetchFabricById(id));
    return () => dispatch(clearCurrentFabric());
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!canDelete) {
      showToast.error("Only Admin can delete fabrics");
      return;
    }
    if (window.confirm("Delete this fabric?")) {
      try {
        await dispatch(deleteFabric(id)).unwrap();
        showToast.success("Fabric deleted");
        navigate(`${basePath}/products?tab=fabric`);
      } catch (error) {
        showToast.error("Delete failed");
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!canToggle) {
      showToast.error("You don't have permission to change status");
      return;
    }
    try {
      await dispatch(toggleFabricStatus(id)).unwrap();
      showToast.success("Status updated");
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  const handleEdit = () => {
    if (canEdit) {
      navigate(`${basePath}/fabrics/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit fabrics");
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!currentFabric) return (
    <div className="text-center p-8">
      <Package size={48} className="mx-auto text-slate-400 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Fabric Not Found</h2>
      <button 
        onClick={() => navigate(`${basePath}/products?tab=fabric`)} 
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Back to Products
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate(`${basePath}/products?tab=fabric`)} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{currentFabric.name}</h1>
            <div className="flex gap-3">
              {canToggle && (
                <button 
                  onClick={handleToggleStatus} 
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    currentFabric.isActive 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  title={currentFabric.isActive ? 'Deactivate fabric' : 'Activate fabric'}
                >
                  <Power size={18} /> {currentFabric.isActive ? 'Active' : 'Inactive'}
                </button>
              )}
              {canEdit && (
                <button 
                  onClick={handleEdit} 
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit size={18} /> Edit
                </button>
              )}
              {canDelete && (
                <button 
                  onClick={handleDelete} 
                  className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column - Image */}
          <div>
            {currentFabric.imageUrl ? (
              <img 
                src={currentFabric.imageUrl} 
                alt={currentFabric.name} 
                className="w-full rounded-lg border shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center border">
                <ImageIcon size={64} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Tag size={18} className="text-blue-600" />
                <span className="text-sm font-medium uppercase tracking-wider">Name</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{currentFabric.name}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Palette size={18} className="text-blue-600" />
                <span className="text-sm font-medium uppercase tracking-wider">Color</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{currentFabric.color}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <IndianRupee size={18} className="text-blue-600" />
                <span className="text-sm font-medium uppercase tracking-wider">Price</span>
              </div>
              <p className="text-xl font-bold text-slate-800">₹{currentFabric.pricePerMeter}/m</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Calendar size={18} className="text-blue-600" />
                <span className="text-sm font-medium uppercase tracking-wider">Added On</span>
              </div>
              <p className="text-lg text-slate-800">
                {new Date(currentFabric.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Status Badge (for non-editable view) */}
            {!canToggle && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Power size={18} className="text-blue-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Status</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  currentFabric.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {currentFabric.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}