import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Image,
  Palette,
  Tag,
  Layers,
  Upload,
  Eye,
  Power,
  EyeOff,
  IndianRupee, // ✅ Add IndianRupee icon
} from "lucide-react";
import {
  fetchAllFabrics,
  createFabric,
  updateFabric,
  deleteFabric,
  toggleFabricStatus,
} from "../../../features/fabric/fabricSlice";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../features/category/categorySlice";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../../features/item/itemSlice";
import showToast from "../../../utils/toast";

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fabric");

  // Redux state
  const { fabrics } = useSelector((state) => state.fabric);
  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { user } = useSelector((state) => state.auth);

  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper; // Both Admin and Store Keeper can edit
  const canDelete = isAdmin; // Only Admin can delete

  // Form states
  const [fabricForm, setFabricForm] = useState({
    name: "",
    color: "",
    pricePerMeter: "",
    imageFile: null,
    imagePreview: null,
  });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  
  // ✅ Updated itemForm with priceRange
  const [itemForm, setItemForm] = useState({ 
    name: "", 
    categoryId: "",
    priceRange: {  // ✅ Added priceRange object
      min: 0,
      max: 0
    }
  });

  // Load data
  useEffect(() => {
    dispatch(fetchAllFabrics());
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchItems(selectedCategory));
    } else {
      dispatch(fetchItems());
    }
  }, [selectedCategory, dispatch]);

  // ========== FABRIC FUNCTIONS ==========
  const handleFabricSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit fabrics");
      return;
    }
    if (!fabricForm.name || !fabricForm.color || !fabricForm.pricePerMeter) {
      showToast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", fabricForm.name);
      formData.append("color", fabricForm.color);
      formData.append("pricePerMeter", fabricForm.pricePerMeter);
      if (fabricForm.imageFile) formData.append("image", fabricForm.imageFile);

      if (editingItem) {
        await dispatch(
          updateFabric({ id: editingItem._id, fabricData: formData }),
        ).unwrap();
        showToast.success("Fabric updated successfully! ✅");
      } else {
        await dispatch(createFabric(formData)).unwrap();
        showToast.success("Fabric created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  // ========== CATEGORY FUNCTIONS ==========
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit categories");
      return;
    }
    if (!categoryForm.name) {
      showToast.error("Category name is required");
      return;
    }

    try {
      if (editingItem) {
        await dispatch(
          updateCategory({ id: editingItem._id, categoryData: categoryForm }),
        ).unwrap();
        showToast.success("Category updated successfully! ✅");
      } else {
        await dispatch(createCategory(categoryForm)).unwrap();
        showToast.success("Category created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  // ========== ITEM FUNCTIONS ==========
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit items");
      return;
    }
    if (!itemForm.name || !itemForm.categoryId) {
      showToast.error("Please fill all required fields");
      return;
    }

    // ✅ Validate price range
    if (itemForm.priceRange.min < 0 || itemForm.priceRange.max < 0) {
      showToast.error("Price cannot be negative");
      return;
    }
    if (itemForm.priceRange.min > itemForm.priceRange.max) {
      showToast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    try {
      if (editingItem) {
        // ✅ Include priceRange in update
        await dispatch(
          updateItem({
            id: editingItem._id,
            itemData: { 
              name: itemForm.name,
              priceRange: itemForm.priceRange  // ✅ Added priceRange
            },
          }),
        ).unwrap();
        showToast.success("Item updated successfully! ✅");
      } else {
        // ✅ Include priceRange in create
        await dispatch(createItem({
          name: itemForm.name,
          categoryId: itemForm.categoryId,
          priceRange: itemForm.priceRange  // ✅ Added priceRange
        })).unwrap();
        showToast.success("Item created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  const resetForms = () => {
    setFabricForm({
      name: "",
      color: "",
      pricePerMeter: "",
      imageFile: null,
      imagePreview: null,
    });
    setCategoryForm({ name: "" });
    setItemForm({ 
      name: "", 
      categoryId: "",
      priceRange: {  // ✅ Reset priceRange
        min: 0,
        max: 0
      }
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit");
      return;
    }
    setEditingItem(item);
    if (activeTab === "fabric") {
      setFabricForm({
        name: item.name,
        color: item.color,
        pricePerMeter: item.pricePerMeter,
        imageFile: null,
        imagePreview: item.imageUrl,
      });
    } else if (activeTab === "category") {
      setCategoryForm({ name: item.name });
    } else {
      // ✅ Include priceRange when editing item
      setItemForm({ 
        name: item.name, 
        categoryId: item.category?._id || "",
        priceRange: {
          min: item.priceRange?.min || 0,
          max: item.priceRange?.max || 0
        }
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      showToast.error("Only Admin can delete items");
      return;
    }
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        if (activeTab === "fabric") {
          await dispatch(deleteFabric(id)).unwrap();
          showToast.success("Fabric deleted successfully! 🗑️");
        } else if (activeTab === "category") {
          await dispatch(deleteCategory(id)).unwrap();
          showToast.success("Category deleted successfully! 🗑️");
        } else {
          await dispatch(deleteItem(id)).unwrap();
          showToast.success("Item deleted successfully! 🗑️");
        }
      } catch (error) {
        showToast.error(error || "Failed to delete");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      showToast.error("You don't have permission to change status");
      return;
    }
    try {
      if (activeTab === "fabric") {
        await dispatch(toggleFabricStatus(id)).unwrap();
        showToast.success(`Fabric ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      }
      // Add similar for categories and items when you have toggle functions
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  // ✅ Handle View Details - with basePath
  const handleViewDetails = (id) => {
    if (activeTab === "fabric") navigate(`${basePath}/fabrics/${id}`);
    else if (activeTab === "category") navigate(`${basePath}/categories/${id}`);
    else navigate(`${basePath}/items/${id}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setFabricForm((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
        }));
      reader.readAsDataURL(file);
    }
  };

  // ✅ Format price helper function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter items based on showInactive toggle (for Admin only)
  const filteredFabrics = (isAdmin && showInactive) 
    ? fabrics 
    : fabrics?.filter(f => f.isActive !== false);
  
  const filteredCategories = (isAdmin && showInactive) 
    ? categories 
    : categories?.filter(c => c.isActive !== false);
  
  const filteredItems = (isAdmin && showInactive) 
    ? items 
    : items?.filter(i => i.isActive !== false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
          <Package size={32} className="text-blue-600" />
          Products Management
        </h1>
        <p className="text-slate-500 font-medium">
          Manage fabrics, categories, and items
        </p>
      </div>

      {/* Tabs with Counts */}
      <div className="flex gap-2 border-b border-slate-200 bg-white p-4 rounded-t-2xl">
        {["fabric", "category", "item"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab === "fabric"
                ? "👕 Fabrics"
                : tab === "category"
                  ? "📁 Categories"
                  : "🧵 Items"}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab === "fabric"
                  ? fabrics?.length || 0
                  : tab === "category"
                    ? categories?.length || 0
                    : items?.length || 0}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header with Add Button and Inactive Toggle */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTab === "fabric" && (
              <Tag size={24} className="text-blue-600" />
            )}
            {activeTab === "category" && (
              <Layers size={24} className="text-blue-600" />
            )}
            {activeTab === "item" && (
              <Package size={24} className="text-blue-600" />
            )}
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {activeTab === "fabric"
                ? "Fabrics"
                : activeTab === "category"
                  ? "Categories"
                  : "Items"}
              {showInactive && isAdmin && (
                <span className="ml-3 text-sm font-normal text-purple-600">
                  (Showing inactive)
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter for Items */}
            {activeTab === "item" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Admin Only: Show Inactive Toggle */}
            {isAdmin && (
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  showInactive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                title={showInactive ? 'Showing all items' : 'Show inactive items'}
              >
                {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
                {showInactive ? 'All Items' : 'Hide Inactive'}
              </button>
            )}

            {/* Add Button - Only for Admin and Store Keeper */}
            {canEdit && (
              <button
                onClick={() => {
                  resetForms();
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Plus size={20} />
                Add{" "}
                {activeTab === "fabric"
                  ? "Fabric"
                  : activeTab === "category"
                    ? "Category"
                    : "Item"}
              </button>
            )}
          </div>
        </div>

        {/* Lists */}
        <div className="p-6">
          {/* Fabrics List */}
          {activeTab === "fabric" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFabrics?.map((fabric) => (
                <div
                  key={fabric._id}
                  className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                    !fabric.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                  }`}
                >
                  <div className="relative h-48 bg-slate-100">
                    {fabric.imageUrl ? (
                      <img
                        src={fabric.imageUrl}
                        alt={fabric.name}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://placehold.co/600x400/cccccc/ffffff?text=No+Image")
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={48} className="text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ₹{fabric.pricePerMeter}/m
                    </div>
                    {!fabric.isActive && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-black text-lg ${!fabric.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {fabric.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Palette size={14} className="text-blue-500" />
                          <span>{fabric.color}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(fabric._id)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(fabric._id, fabric.isActive)}
                              className={`p-2 rounded-lg ${fabric.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}
                              title={fabric.isActive ? "Deactivate" : "Activate"}
                            >
                              <Power size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(fabric)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          </>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(fabric._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categories List */}
          {activeTab === "category" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories?.map((category) => (
                <div
                  key={category._id}
                  className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
                    !category.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-black ${!category.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        ID: {category._id.slice(-6)}
                      </p>
                      {!category.isActive && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(category._id)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Items List - ✅ Updated to show price range */}
          {activeTab === "item" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems?.map((item) => (
                <div
                  key={item._id}
                  className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
                    !item.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-black ${!item.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Category: {item.category?.name}
                      </p>
                      {/* ✅ Display price range */}
                      {item.priceRange && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 font-bold mt-2">
                          <IndianRupee size={14} />
                          <span>{formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}</span>
                        </div>
                      )}
                      {!item.isActive && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(item._id)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal - ✅ Updated item section with price range inputs */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">
                {editingItem ? "Edit" : "Add"}{" "}
                {activeTab === "fabric"
                  ? "Fabric"
                  : activeTab === "category"
                    ? "Category"
                    : "Item"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForms();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={
                activeTab === "fabric"
                  ? handleFabricSubmit
                  : activeTab === "category"
                    ? handleCategorySubmit
                    : handleItemSubmit
              }
              className="p-6 space-y-4"
            >
              {activeTab === "fabric" && (
                <>
                  <input
                    type="text"
                    placeholder="Fabric Name"
                    value={fabricForm.name}
                    onChange={(e) =>
                      setFabricForm({ ...fabricForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={fabricForm.color}
                    onChange={(e) =>
                      setFabricForm({ ...fabricForm, color: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price per Meter (₹)"
                    value={fabricForm.pricePerMeter}
                    onChange={(e) =>
                      setFabricForm({
                        ...fabricForm,
                        pricePerMeter: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                    required
                  />

                  {fabricForm.imagePreview && (
                    <div className="relative">
                      <img
                        src={fabricForm.imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFabricForm((prev) => ({
                            ...prev,
                            imageFile: null,
                            imagePreview: null,
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      Click to upload image
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </>
              )}

              {activeTab === "category" && (
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                  required
                />
              )}

              {activeTab === "item" && (
                <>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                    required
                  />
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* ✅ Price Range Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Min Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={itemForm.priceRange.min}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            priceRange: {
                              ...itemForm.priceRange,
                              min: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        min="0"
                        step="10"
                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Max Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={itemForm.priceRange.max}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            priceRange: {
                              ...itemForm.priceRange,
                              max: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        min="0"
                        step="10"
                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingItem ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForms();
                  }}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}