import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, X, CheckSquare, Square
} from "lucide-react";
import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
import { createTemplate } from "../../../features/sizeTemplate/sizeTemplateSlice";
import showToast from "../../../utils/toast";

export default function NewTemplate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  
  // ✅ Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Debug: Component mounted
  useEffect(() => {
    console.log("📌 NewTemplate component mounted");
    console.log("👤 User role:", user?.role);
    console.log("📍 Base Path:", basePath);
  }, [user, basePath]);

  const { fields, loading } = useSelector((state) => {
    console.log("📊 Redux state - sizeField:", state.sizeField);
    return state.sizeField;
  });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sizeFields: []
  });

  const [selectedFields, setSelectedFields] = useState({});

  // Check if user has permission to create templates
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canCreate = isAdmin || isStoreKeeper;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canCreate) {
      showToast.error("You don't have permission to create templates");
      navigate(`${basePath}/measurements`);
    }
  }, [canCreate, navigate, basePath]);

  // Fetch size fields on mount
  useEffect(() => {
    console.log("📡 Fetching size fields...");
    dispatch(fetchAllSizeFields())
      .unwrap()
      .then((result) => {
        console.log("✅ Size fields fetched:", result?.length || 0);
      })
      .catch((error) => {
        console.error("❌ Failed to fetch size fields:", error);
      });
  }, [dispatch]);

  // Debug: Log when fields change
  useEffect(() => {
    console.log("📋 Size fields loaded:", fields);
    console.log("📋 Fields count:", fields?.length);
    
    if (fields && fields.length > 0) {
      console.log("✅ First field sample:", fields[0]);
    }
  }, [fields]);

  const handleFieldToggle = (field) => {
    console.log("🔄 Toggling field:", field.name, "Current state:", !selectedFields[field.name]);
    
    setSelectedFields(prev => ({
      ...prev,
      [field.name]: !prev[field.name]
    }));

    setFormData(prev => {
      const fieldExists = prev.sizeFields.some(f => f.name === field.name);
      
      if (fieldExists) {
        console.log("🗑️ Removing field:", field.name);
        return {
          ...prev,
          sizeFields: prev.sizeFields.filter(f => f.name !== field.name)
        };
      } else {
        console.log("➕ Adding field:", field.name);
        return {
          ...prev,
          sizeFields: [...prev.sizeFields, { 
            name: field.name, 
            isRequired: false,
            order: field.order || 0
          }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Form submitted with data:", formData);
    
    if (!canCreate) {
      showToast.error("You don't have permission to create templates");
      return;
    }
    
    if (!formData.name.trim()) {
      console.log("❌ Validation failed: Template name required");
      showToast.error("Template name is required");
      return;
    }

    if (formData.sizeFields.length === 0) {
      console.log("❌ Validation failed: No size fields selected");
      showToast.error("Please select at least one size field");
      return;
    }

    try {
      console.log("📡 Creating template...");
      const result = await dispatch(createTemplate(formData)).unwrap();
      console.log("✅ Template created successfully:", result);
      showToast.success("Template created successfully! 🎉");
      navigate(`${basePath}/measurements`);
    } catch (error) {
      console.error("❌ Create template failed:", error);
      showToast.error(error || "Failed to create template");
    }
  };

  // Group fields by category
  const groupedFields = fields?.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  console.log("📊 Grouped fields:", groupedFields);

  const categoryTitles = {
    upper: "Upper Body Measurements",
    lower: "Lower Body Measurements",
    full: "Full Body Measurements",
    other: "Other Measurements"
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render if user doesn't have permission (redirect will happen)
  if (!canCreate) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            console.log("🔙 Navigating back to measurements");
            navigate(`${basePath}/measurements`);
          }}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Template</h1>
          <p className="text-slate-500">Define size fields for your garment template</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                console.log("✏️ Name changed:", e.target.value);
                setFormData({...formData, name: e.target.value});
              }}
              placeholder="e.g., Men's Formal Shirt, Women's Blouse, etc."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add notes about this template..."
              rows="3"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
            />
          </div>

          {/* Size Fields Selection */}
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-4">Select Size Fields</h2>
            <p className="text-sm text-slate-500 mb-6">Choose the measurements needed for this garment</p>

            {!fields || fields.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <p className="text-slate-500">No size fields found. Please run seed first.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
                  <div key={category} className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-black text-slate-700 mb-4">{categoryTitles[category] || category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {categoryFields.map((field) => (
                        <label
                          key={field._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedFields[field.name]
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedFields[field.name] || false}
                            onChange={() => handleFieldToggle(field)}
                          />
                          {selectedFields[field.name] ? (
                            <CheckSquare size={20} className="text-blue-600" />
                          ) : (
                            <Square size={20} className="text-slate-400" />
                          )}
                          <span className="font-medium text-slate-700">{field.displayName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-slate-50 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              console.log("🔙 Cancel button clicked");
              navigate(`${basePath}/measurements`);
            }}
            className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center gap-2"
          >
            <Save size={18} />
            Create Template
          </button>
        </div>
      </form>
    </div>
  );
}