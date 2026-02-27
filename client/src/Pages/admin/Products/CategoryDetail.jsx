import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Layers, Calendar, 
  Package, Power, Eye
} from "lucide-react";
import { fetchAllCategories, deleteCategory, updateCategory } from "../../../features/category/categorySlice";
import { fetchItems } from "../../../features/item/itemSlice";
import showToast from "../../../utils/toast";

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [isEditing, setIsEditing] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin; // Only Admin can delete

  const category = categories?.find(c => c._id === id);

  useEffect(() => {
    if (!categories?.length) {
      dispatch(fetchAllCategories());
    }
    dispatch(fetchItems(id)); // Fetch items in this category
  }, [dispatch, id, categories?.length]);

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
    }
  }, [category]);

  const handleDelete = async () => {
    if (!canDelete) {
      showToast.error("Only Admin can delete categories");
      return;
    }
    if (window.confirm("Delete this category? Items in this category will also be affected.")) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        showToast.success("Category deleted");
        navigate(`${basePath}/products?tab=category`);
      } catch (error) {
        showToast.error("Delete failed");
      }
    }
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit categories");
      return;
    }
    if (!categoryName.trim()) {
      showToast.error("Category name is required");
      return;
    }

    try {
      await dispatch(updateCategory({ 
        id, 
        categoryData: { name: categoryName } 
      })).unwrap();
      showToast.success("Category updated");
      setIsEditing(false);
    } catch (error) {
      showToast.error("Update failed");
    }
  };

  const handleViewItem = (itemId) => {
    navigate(`${basePath}/items/${itemId}`);
  };

  if (!category) {
    return (
      <div className="text-center py-16">
        <Layers size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Category Not Found</h2>
        <button 
          onClick={() => navigate(`${basePath}/products?tab=category`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(`${basePath}/products?tab=category`)} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Categories
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Layers size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Category Details</h1>
                <p className="text-green-100">Manage category information</p>
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
            {/* Category Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Category Information</h2>
              
              {/* Name */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Layers size={18} className="text-green-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Name</span>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-xl font-bold">{category.name}</p>
                )}
              </div>

              {/* ID */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package size={18} className="text-green-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Category ID</span>
                </div>
                <p className="text-sm font-mono bg-slate-100 p-2 rounded">{category._id}</p>
              </div>

              {/* Created Date */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar size={18} className="text-green-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Created On</span>
                </div>
                <p className="text-lg">{new Date(category.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {/* Status */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Power size={18} className="text-green-600" />
                  <span className="text-sm font-medium uppercase tracking-wider">Status</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  category.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Items in this Category */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={20} className="text-green-600" />
                Items in this Category ({items?.length || 0})
              </h2>

              {items?.length > 0 ? (
                <div className="space-y-3">
                  {items.map(item => (
                    <div 
                      key={item._id} 
                      className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleViewItem(item._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800">{item.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Added: {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Eye size={18} className="text-slate-400 hover:text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-8 rounded-lg text-center">
                  <Package size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No items in this category</p>
                  {canEdit && (
                    <button
                      onClick={() => navigate(`${basePath}/products?tab=item`)}
                      className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      + Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`${basePath}/products?tab=category`)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
              >
                View All Categories
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    navigate(`${basePath}/products?tab=category`);
                    setTimeout(() => {
                      document.querySelector('[data-add-button]')?.click();
                    }, 100);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                  Add New Category
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}