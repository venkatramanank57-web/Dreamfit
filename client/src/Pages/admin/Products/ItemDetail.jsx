import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Package, Calendar, 
  Layers, Power, Save, X, IndianRupee // ✅ Add IndianRupee icon
} from "lucide-react";
import { fetchItems, deleteItem, updateItem } from "../../../features/item/itemSlice";
import { fetchAllCategories } from "../../../features/category/categorySlice";
import showToast from "../../../utils/toast";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items } = useSelector((state) => state.item);
  const { categories } = useSelector((state) => state.category);
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // ✅ NEW: Price range state
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0
  });

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin; // Only Admin can delete

  const item = items?.find(i => i._id === id);

  useEffect(() => {
    if (!items?.length) {
      dispatch(fetchItems());
    }
    if (!categories?.length) {
      dispatch(fetchAllCategories());
    }
  }, [dispatch, items?.length, categories?.length]);

  useEffect(() => {
    if (item) {
      setItemName(item.name);
      setSelectedCategory(item.category?._id || "");
      // ✅ Set price range from item
      setPriceRange({
        min: item.priceRange?.min || 0,
        max: item.priceRange?.max || 0
      });
    }
  }, [item]);

  const handleDelete = async () => {
    if (!canDelete) {
      showToast.error("Only Admin can delete items");
      return;
    }
    if (window.confirm("Delete this item?")) {
      try {
        await dispatch(deleteItem(id)).unwrap();
        showToast.success("Item deleted");
        navigate(`${basePath}/products?tab=item`);
      } catch (error) {
        showToast.error("Delete failed");
      }
    }
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit items");
      return;
    }
    if (!itemName.trim()) {
      showToast.error("Item name is required");
      return;
    }

    // ✅ Validate price range
    if (priceRange.min < 0 || priceRange.max < 0) {
      showToast.error("Price cannot be negative");
      return;
    }
    if (priceRange.min > priceRange.max) {
      showToast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    try {
      const updateData = {
        name: itemName,
        priceRange: priceRange // ✅ Include price range in update
      };
      
      await dispatch(updateItem({ 
        id, 
        itemData: updateData
      })).unwrap();
      showToast.success("Item updated");
      setIsEditing(false);
    } catch (error) {
      showToast.error(error.message || "Update failed");
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!item) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Item Not Found</h2>
        <button 
          onClick={() => navigate(`${basePath}/products?tab=item`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(`${basePath}/products?tab=item`)} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Items
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Package size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Item Details</h1>
                <p className="text-purple-100">Manage item information</p>
              </div>
            </div>
            <div className="flex gap-3">
              {canEdit && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit size={18} /> {isEditing ? 'Cancel' : 'Edit'}
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Item Information</h2>
              
              {/* Name */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Name</span>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdate}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      <Save size={18} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xl font-bold">{item.name}</p>
                )}
              </div>

              {/* ✅ NEW: Price Range */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Price Range</span>
                </div>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Min Price (₹)</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({
                          ...priceRange,
                          min: parseFloat(e.target.value) || 0
                        })}
                        min="0"
                        step="10"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Max Price (₹)</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({
                          ...priceRange,
                          max: parseFloat(e.target.value) || 0
                        })}
                        min="0"
                        step="10"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-600">
                      {formatPrice(item.priceRange?.min || 0)} - {formatPrice(item.priceRange?.max || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Layers size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Category</span>
                </div>
                <p className="text-lg font-medium text-purple-600">
                  {item.category?.name || 'Unknown'}
                </p>
              </div>

              {/* ID */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Item ID</span>
                </div>
                <p className="text-sm font-mono bg-slate-100 p-2 rounded">{item._id}</p>
              </div>

              {/* Created Date */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Created On</span>
                </div>
                <p className="text-lg">{new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Additional Information</h2>
              
              {/* Category Details */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-bold text-slate-700 mb-3">Category Details</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-slate-500">Name:</span>{' '}
                    {item.category?.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-slate-500">Category ID:</span>{' '}
                    <span className="font-mono">{item.category?._id}</span>
                  </p>
                  <button
                    onClick={() => navigate(`${basePath}/categories/${item.category?._id}`)}
                    className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  >
                    View Category Details →
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Power size={18} className="text-purple-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Status</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  item.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Metadata */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-bold text-slate-700 mb-3">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-slate-500">Last Updated:</span>{' '}
                    {new Date(item.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-slate-500">Version:</span>{' '}
                    {item.__v || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`${basePath}/products?tab=item`)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
              >
                View All Items
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    navigate(`${basePath}/products?tab=item`);
                    setTimeout(() => {
                      document.querySelector('[data-add-button]')?.click();
                    }, 100);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                >
                  Add New Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}