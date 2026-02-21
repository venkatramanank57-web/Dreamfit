import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Package, Palette, 
  IndianRupee, Calendar, Tag, Image as ImageIcon, Power 
} from "lucide-react";
import { fetchFabricById, deleteFabric, toggleFabricStatus, clearCurrentFabric } from "../../features/fabric/fabricSlice";
import showToast from "../../utils/toast";

export default function FabricDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentFabric, loading } = useSelector((state) => state.fabric);

  useEffect(() => {
    if (id) dispatch(fetchFabricById(id));
    return () => dispatch(clearCurrentFabric());
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Delete this fabric?")) {
      try {
        await dispatch(deleteFabric(id)).unwrap();
        showToast.success("Fabric deleted");
        navigate("/admin/products?tab=fabric");
      } catch (error) {
        showToast.error("Delete failed");
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await dispatch(toggleFabricStatus(id)).unwrap();
      showToast.success("Status updated");
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;

  if (!currentFabric) return (
    <div className="text-center p-8">
      <Package size={48} className="mx-auto text-slate-400 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Fabric Not Found</h2>
      <button onClick={() => navigate("/admin/products")} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">Back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate("/admin/products?tab=fabric")} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{currentFabric.name}</h1>
            <div className="flex gap-3">
              <button onClick={handleToggleStatus} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${currentFabric.isActive ? 'bg-green-500' : 'bg-orange-500'}`}>
                <Power size={18} /> {currentFabric.isActive ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => navigate(`/admin/fabrics/edit/${id}`)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2">
                <Edit size={18} /> Edit
              </button>
              <button onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            {currentFabric.imageUrl ? (
              <img src={currentFabric.imageUrl} alt={currentFabric.name} className="w-full rounded-lg border" />
            ) : (
              <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                <ImageIcon size={64} className="text-slate-400" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600"><Tag size={18} /> Name</div>
              <p className="text-xl font-bold">{currentFabric.name}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600"><Palette size={18} /> Color</div>
              <p className="text-xl font-bold">{currentFabric.color}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600"><IndianRupee size={18} /> Price</div>
              <p className="text-xl font-bold">₹{currentFabric.pricePerMeter}/m</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600"><Calendar size={18} /> Added</div>
              <p className="text-lg">{new Date(currentFabric.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}