import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Ruler, Plus, Search, Edit, Trash2, Eye, Power,
  ChevronLeft, ChevronRight, EyeOff
} from "lucide-react";
import { fetchAllTemplates, fetchAllTemplatesAdmin, deleteTemplate, toggleTemplateStatus } from "../../../features/sizeTemplate/sizeTemplateSlice";
import showToast from "../../../utils/toast";

export default function Measurements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { templates, pagination, loading } = useSelector((state) => {
    console.log("📊 Redux state - sizeTemplate:", state.sizeTemplate);
    return state.sizeTemplate;
  });
  
  const { user } = useSelector((state) => state.auth); // Get user for role check
  
  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false); // Toggle for inactive templates

  const isAdmin = user?.role === "ADMIN"; // Check if user is Admin
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  
  // Permissions
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin; // Only Admin can delete
  const canToggle = isAdmin || isStoreKeeper;
  const canViewInactive = isAdmin; // Only Admin can view inactive templates

  // Debug: Component mounted
  useEffect(() => {
    console.log("📌 Measurements component mounted");
    console.log("👤 User role:", user?.role);
    console.log("👑 Is Admin:", isAdmin);
    console.log("🏪 Is Store Keeper:", isStoreKeeper);
    console.log("✂️ Is Cutting Master:", isCuttingMaster);
    console.log("📍 Base Path:", basePath);
  }, [user, basePath, isAdmin, isStoreKeeper, isCuttingMaster]);

  // Debounce search
  useEffect(() => {
    console.log("🔍 Search term changed:", searchTerm);
    const timer = setTimeout(() => {
      console.log("⏱️ Debounced search:", searchTerm);
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch templates based on role and showInactive toggle
  useEffect(() => {
    console.log(`📡 Fetching templates - Page: ${currentPage}, Search: "${debouncedSearch}", Show Inactive: ${showInactive}`);
    
    if (isAdmin && showInactive) {
      // Admin fetching all templates (including inactive)
      dispatch(fetchAllTemplatesAdmin({ page: currentPage, search: debouncedSearch }))
        .unwrap()
        .then((result) => {
          console.log("✅ Admin fetch successful:", result);
        })
        .catch((error) => {
          console.error("❌ Admin fetch failed:", error);
        });
    } else {
      // Default: only active templates
      dispatch(fetchAllTemplates({ page: currentPage, search: debouncedSearch }))
        .unwrap()
        .then((result) => {
          console.log("✅ Fetch successful:", result);
        })
        .catch((error) => {
          console.error("❌ Fetch failed:", error);
        });
    }
  }, [dispatch, currentPage, debouncedSearch, isAdmin, showInactive]);

  // Debug: Log when templates change
  useEffect(() => {
    console.log("📋 Templates updated:", templates);
    console.log("📄 Pagination:", pagination);
    console.log("⏳ Loading state:", loading);
    
    if (templates && templates.length > 0) {
      console.log("✅ First template sample:", templates[0]);
    }
  }, [templates, pagination, loading]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (id) => {
    console.log("👁️ View details for ID:", id);
    navigate(`${basePath}/measurements/${id}`);
  };

  const handleEdit = (id) => {
    console.log("✏️ Edit template ID:", id);
    if (canEdit) {
      navigate(`${basePath}/measurements/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit templates");
    }
  };

  const handleDelete = async (id, name) => {
    console.log("🗑️ Delete template:", id, name);
    if (!canDelete) {
      showToast.error("Only Admin can delete templates");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await dispatch(deleteTemplate(id)).unwrap();
        console.log("✅ Delete successful");
        showToast.success("Template deleted successfully");
      } catch (error) {
        console.error("❌ Delete failed:", error);
        showToast.error("Failed to delete template");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    console.log("🔄 Toggle status for ID:", id, "Current:", currentStatus);
    if (!canToggle) {
      showToast.error("You don't have permission to toggle status");
      return;
    }
    try {
      await dispatch(toggleTemplateStatus(id)).unwrap();
      console.log("✅ Toggle successful");
      showToast.success(`Template ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error("❌ Toggle failed:", error);
      showToast.error("Failed to toggle status");
    }
  };

  const handleAddNew = () => {
    console.log("➕ Add new template clicked");
    if (canEdit) {
      navigate(`${basePath}/measurements/new`);
    } else {
      showToast.error("You don't have permission to create templates");
    }
  };

  const handlePageChange = (newPage) => {
    console.log("📄 Page change to:", newPage);
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
          <Ruler size={32} className="text-blue-600" />
          Measurement Templates
        </h1>
        <p className="text-slate-500 font-medium">Create and manage size templates for different garments</p>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by template name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          {/* Admin Only: Show Inactive Toggle */}
          {canViewInactive && (
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                showInactive 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              title={showInactive ? 'Showing all templates' : 'Show inactive templates'}
            >
              {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
              {showInactive ? 'Showing All' : 'Show Inactive'}
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Template
            </button>
          )}
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {showInactive ? 'All Templates (Including Inactive)' : 'Active Templates'}
          </h2>
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
            {pagination?.total || 0} Total
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : templates?.length > 0 ? (
          <>
            <div className="divide-y divide-slate-100">
              {templates.map((template) => (
                <div key={template._id} className="p-6 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 
                        className={`text-lg font-black cursor-pointer hover:text-blue-600 ${
                          !template.isActive ? 'text-slate-400' : 'text-slate-800'
                        }`}
                        onClick={() => handleViewDetails(template._id)}
                      >
                        {template.name}
                        {!template.isActive && (
                          <span className="ml-3 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </h3>
                      {template.description && (
                        <p className={`text-sm mt-1 ${!template.isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs ${!template.isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                          {template.sizeFields?.length || 0} size fields
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(template._id)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {canToggle && (
                        <button
                          onClick={() => handleToggleStatus(template._id, template.isActive)}
                          className={`p-2 rounded-lg transition-all ${
                            template.isActive 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          }`}
                          title={template.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={18} />
                        </button>
                      )}
                      
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(template._id)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(template._id, template.name)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination?.pages > 1 && (
              <div className="p-6 border-t border-slate-100 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${
                    currentPage === 1 
                      ? 'text-slate-300 cursor-not-allowed' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className={`p-2 rounded-lg ${
                    currentPage === pagination.pages
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Ruler size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-700 mb-2">No Templates Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? `No templates matching "${searchTerm}"` : 'Create your first measurement template'}
            </p>
            {canEdit && (
              <button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Template
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}