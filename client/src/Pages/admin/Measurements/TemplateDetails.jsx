import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Power, Save, X, 
  CheckSquare, Square, Ruler
} from "lucide-react";
import { fetchTemplateById, updateTemplate, deleteTemplate, toggleTemplateStatus } from "../../../features/sizeTemplate/sizeTemplateSlice";
import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
import showToast from "../../../utils/toast";

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTemplate, loading } = useSelector((state) => state.sizeTemplate);
  const { fields } = useSelector((state) => state.sizeField);
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sizeFields: []
  });
  const [selectedFields, setSelectedFields] = useState({});

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
    if (id) {
      dispatch(fetchTemplateById(id));
      dispatch(fetchAllSizeFields());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTemplate) {
      setFormData({
        name: currentTemplate.name || "",
        description: currentTemplate.description || "",
        sizeFields: currentTemplate.sizeFields || []
      });

      // Set selected fields for checkboxes
      const selected = {};
      currentTemplate.sizeFields?.forEach(field => {
        selected[field.name] = true;
      });
      setSelectedFields(selected);
    }
  }, [currentTemplate]);

  const handleBack = () => {
    navigate(`${basePath}/measurements`);
  };

  const handleDelete = async () => {
    if (!canDelete) {
      showToast.error("Only Admin can delete templates");
      return;
    }
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await dispatch(deleteTemplate(id)).unwrap();
        showToast.success("Template deleted successfully");
        navigate(`${basePath}/measurements`);
      } catch (error) {
        showToast.error("Failed to delete template");
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!canToggle) {
      showToast.error("You don't have permission to change status");
      return;
    }
    try {
      await dispatch(toggleTemplateStatus(id)).unwrap();
      showToast.success(`Template ${currentTemplate.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit templates");
      return;
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data
    if (currentTemplate) {
      setFormData({
        name: currentTemplate.name || "",
        description: currentTemplate.description || "",
        sizeFields: currentTemplate.sizeFields || []
      });
      const selected = {};
      currentTemplate.sizeFields?.forEach(field => {
        selected[field.name] = true;
      });
      setSelectedFields(selected);
    }
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field.name]: !prev[field.name]
    }));

    setFormData(prev => {
      const fieldExists = prev.sizeFields.some(f => f.name === field.name);
      
      if (fieldExists) {
        return {
          ...prev,
          sizeFields: prev.sizeFields.filter(f => f.name !== field.name)
        };
      } else {
        return {
          ...prev,
          sizeFields: [...prev.sizeFields, { 
            name: field.name, 
            isRequired: false,
            order: field.order 
          }]
        };
      }
    });
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit templates");
      return;
    }
    if (!formData.name.trim()) {
      showToast.error("Template name is required");
      return;
    }

    if (formData.sizeFields.length === 0) {
      showToast.error("Please select at least one size field");
      return;
    }

    try {
      await dispatch(updateTemplate({ id, templateData: formData })).unwrap();
      showToast.success("Template updated successfully");
      setIsEditing(false);
      dispatch(fetchTemplateById(id)); // Refresh data
    } catch (error) {
      showToast.error(error || "Failed to update template");
    }
  };

  // Group fields by category
  const groupedFields = fields?.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const categoryTitles = {
    upper: "Upper Body Measurements",
    lower: "Lower Body Measurements",
    full: "Full Body Measurements",
    other: "Other Measurements"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="text-center py-16">
        <Ruler size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Template Not Found</h2>
        <button 
          onClick={handleBack}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Templates
        </button>
        
        {!isEditing && (
          <div className="flex gap-3">
            {canToggle && (
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  currentTemplate.isActive 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                <Power size={18} />
                {currentTemplate.isActive ? 'Active' : 'Inactive'}
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleEdit}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2"
              >
                <Edit size={18} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Template' : currentTemplate.name}
          </h1>
          {!isEditing && currentTemplate.description && (
            <p className="text-purple-100 mt-2">{currentTemplate.description}</p>
          )}
        </div>

        <div className="p-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-lg"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-50 border rounded-lg"
                />
              </div>

              {/* Size Fields Selection */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Select Size Fields</h3>
                <div className="space-y-4">
                  {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
                    <div key={category} className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-bold text-slate-700 mb-3">{categoryTitles[category] || category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoryFields.map((field) => (
                          <label
                            key={field._id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                              selectedFields[field.name]
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-slate-200 hover:border-purple-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={selectedFields[field.name] || false}
                              onChange={() => handleFieldToggle(field)}
                            />
                            {selectedFields[field.name] ? (
                              <CheckSquare size={18} className="text-purple-600" />
                            ) : (
                              <Square size={18} className="text-slate-400" />
                            )}
                            <span className="text-sm">{field.displayName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              {/* Size Fields List */}
              <h3 className="font-bold text-slate-800 mb-4">Size Fields</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentTemplate.sizeFields?.map((field, index) => {
                  const fieldDetails = fields?.find(f => f.name === field.name);
                  return (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="font-medium text-slate-800">
                        {fieldDetails?.displayName || field.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {fieldDetails?.unit || 'inches'}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="font-medium">
                    {new Date(currentTemplate.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Last Updated</p>
                  <p className="font-medium">
                    {new Date(currentTemplate.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}