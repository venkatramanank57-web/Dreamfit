import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Trash2,
  ChevronDown,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  User,
  Camera,
  Scissors,
} from "lucide-react";
import { fetchAllCategories } from "../../features/category/categorySlice";
import { fetchItems } from "../../features/item/itemSlice";
import { fetchAllSizeFields } from "../../features/sizeField/sizeFieldSlice";
import { fetchAllTemplates } from "../../features/sizeTemplate/sizeTemplateSlice";
import showToast from "../../utils/toast";

export default function GarmentForm({ onClose, onSave, editingGarment }) {
  const dispatch = useDispatch();
  
  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { fields } = useSelector((state) => state.sizeField);
  const { templates } = useSelector((state) => state.sizeTemplate);
  const { user } = useSelector((state) => state.auth);
  const { currentCustomer } = useSelector((state) => state.customer);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    item: "",
    measurementTemplate: "",
    measurementSource: "template",
    measurements: [],
    studioImages: [], // Designer/studio reference images
    customerProvidedImages: [], // Images sent by customer via WhatsApp/email
    customerClothImages: [], // NEW: Photos of physical cloth given by customer
    additionalInfo: "",
    estimatedDelivery: "",
    priority: "normal",
    priceRange: {
      min: "",
      max: "",
    },
  });

  const [selectedFields, setSelectedFields] = useState({});
  const [manualMeasurements, setManualMeasurements] = useState({});
  const [previewImages, setPreviewImages] = useState({
    studio: [],
    customerProvided: [],
    customerCloth: [], // NEW: Preview for customer cloth images
  });
  const [loading, setLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllSizeFields());
    dispatch(fetchAllTemplates({ page: 1, search: "" }));
  }, [dispatch]);

  // Load items when category changes
  useEffect(() => {
    if (formData.category) {
      dispatch(fetchItems(formData.category));
    }
  }, [dispatch, formData.category]);

  // Load template measurements when template changes
  useEffect(() => {
    if (formData.measurementTemplate && formData.measurementSource === "template") {
      const template = templates?.find(t => t._id === formData.measurementTemplate);
      if (template) {
        const measurements = template.sizeFields.map(field => ({
          name: field.name,
          value: "",
          unit: "inches",
        }));
        setFormData(prev => ({ ...prev, measurements }));
        
        const selected = {};
        template.sizeFields.forEach(field => {
          selected[field.name] = true;
        });
        setSelectedFields(selected);
      }
    }
  }, [formData.measurementTemplate, templates]);

  // Load customer measurements if available
  useEffect(() => {
    if (currentCustomer?.measurements && formData.measurementSource === "customer") {
      setManualMeasurements(currentCustomer.measurements);
    }
  }, [currentCustomer, formData.measurementSource]);

  // Load editing data
  useEffect(() => {
    if (editingGarment) {
      setFormData({
        name: editingGarment.name || "",
        category: editingGarment.category?._id || editingGarment.category || "",
        item: editingGarment.item?._id || editingGarment.item || "",
        measurementTemplate: editingGarment.measurementTemplate?._id || editingGarment.measurementTemplate || "",
        measurementSource: editingGarment.measurementSource || "template",
        measurements: editingGarment.measurements || [],
        studioImages: editingGarment.studioImages || editingGarment.referenceImages || [],
        customerProvidedImages: editingGarment.customerProvidedImages || editingGarment.customerImages || [],
        customerClothImages: editingGarment.customerClothImages || [], // NEW
        additionalInfo: editingGarment.additionalInfo || "",
        estimatedDelivery: editingGarment.estimatedDelivery?.split("T")[0] || "",
        priority: editingGarment.priority || "normal",
        priceRange: editingGarment.priceRange || { min: "", max: "" },
      });

      // Set preview for existing images
      const studioPreviews = (editingGarment.studioImages || editingGarment.referenceImages || []).map(img => ({
        preview: img.url || img,
        file: null,
      }));
      
      const customerPreviews = (editingGarment.customerProvidedImages || editingGarment.customerImages || []).map(img => ({
        preview: img.url || img,
        file: null,
      }));

      const clothPreviews = (editingGarment.customerClothImages || []).map(img => ({
        preview: img.url || img,
        file: null,
      }));

      setPreviewImages({
        studio: studioPreviews,
        customerProvided: customerPreviews,
        customerCloth: clothPreviews, // NEW
      });

      // Set selected fields for measurements
      if (editingGarment.measurements) {
        const selected = {};
        editingGarment.measurements.forEach(m => {
          selected[m.name] = true;
        });
        setSelectedFields(selected);
      }

      // Set manual measurements if source is customer
      if (editingGarment.measurementSource === "customer" && editingGarment.measurements) {
        const manual = {};
        editingGarment.measurements.forEach(m => {
          manual[m.name] = m.value;
        });
        setManualMeasurements(manual);
      }
    }
  }, [editingGarment]);

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 5MB each)
    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showToast.error("Some images exceed 5MB limit");
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidTypes = files.filter(f => !validTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      showToast.error("Please upload only JPG, PNG or WEBP images");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviewImages(prev => ({
      ...prev,
      [type]: [...prev[type], ...newPreviews],
    }));

    // Store actual files
    let imageField;
    switch(type) {
      case "studio":
        imageField = "studioImages";
        break;
      case "customerProvided":
        imageField = "customerProvidedImages";
        break;
      case "customerCloth":
        imageField = "customerClothImages";
        break;
      default:
        return;
    }
    
    const existingFiles = formData[imageField] || [];
    
    setFormData(prev => ({
      ...prev,
      [imageField]: [
        ...existingFiles,
        ...files,
      ],
    }));
  };

  const removeImage = (index, type) => {
    // Clean up preview URL
    const imageToRemove = previewImages[type][index];
    if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setPreviewImages(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

    let imageField;
    switch(type) {
      case "studio":
        imageField = "studioImages";
        break;
      case "customerProvided":
        imageField = "customerProvidedImages";
        break;
      case "customerCloth":
        imageField = "customerClothImages";
        break;
      default:
        return;
    }

    setFormData(prev => ({
      ...prev,
      [imageField]: prev[imageField].filter((_, i) => i !== index),
    }));
  };

  const handleMeasurementToggle = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field.name]: !prev[field.name],
    }));

    if (!selectedFields[field.name]) {
      // Add measurement
      setFormData(prev => ({
        ...prev,
        measurements: [
          ...prev.measurements,
          { name: field.name, value: "", unit: field.unit || "inches" },
        ],
      }));
    } else {
      // Remove measurement
      setFormData(prev => ({
        ...prev,
        measurements: prev.measurements.filter(m => m.name !== field.name),
      }));
    }
  };

  const handleMeasurementChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.map(m =>
        m.name === name ? { ...m, value: parseFloat(value) || "" } : m
      ),
    }));
  };

  const handleManualMeasurementChange = (name, value) => {
    setManualMeasurements(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      showToast.error("Garment name is required");
      return;
    }

    if (!formData.category) {
      showToast.error("Please select a category");
      return;
    }

    if (!formData.item) {
      showToast.error("Please select an item");
      return;
    }

    if (!formData.estimatedDelivery) {
      showToast.error("Please select estimated delivery date");
      return;
    }

    if (!formData.priceRange.min || !formData.priceRange.max) {
      showToast.error("Please enter price range");
      return;
    }

    if (parseInt(formData.priceRange.min) > parseInt(formData.priceRange.max)) {
      showToast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    // Validate measurements based on source
    if (formData.measurementSource === "template" && formData.measurements.length === 0) {
      showToast.error("Please select at least one measurement");
      return;
    }

    // Prepare final data
    let finalMeasurements = formData.measurements;
    if (formData.measurementSource === "customer") {
      finalMeasurements = Object.entries(manualMeasurements)
        .filter(([_, value]) => value)
        .map(([name, value]) => ({
          name,
          value: parseFloat(value),
          unit: "inches",
        }));
    }

    // Clean up blob URLs
    previewImages.studio.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    previewImages.customerProvided.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    previewImages.customerCloth.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });

    onSave({
      ...formData,
      measurements: finalMeasurements,
    });
  };

  // Group size fields by category
  const groupedFields = fields?.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const categoryTitles = {
    upper: "Upper Body Measurements",
    lower: "Lower Body Measurements",
    full: "Full Body Measurements",
    other: "Other Measurements",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-black text-white">
            {editingGarment ? "Edit Garment" : "Add New Garment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-black text-slate-800 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Garment Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Garment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Men's Formal Shirt"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      category: e.target.value,
                      item: "" // Reset item when category changes
                    })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Item */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Item</option>
                    {items?.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Estimated Delivery */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Estimated Delivery <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Measurement Section */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-black text-slate-800 mb-4">Measurements</h3>

              {/* Measurement Source Selection */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="template"
                    checked={formData.measurementSource === "template"}
                    onChange={(e) => setFormData({ ...formData, measurementSource: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Use Template</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="customer"
                    checked={formData.measurementSource === "customer"}
                    onChange={(e) => setFormData({ ...formData, measurementSource: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Use Customer Measurements</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="manual"
                    checked={formData.measurementSource === "manual"}
                    onChange={(e) => setFormData({ ...formData, measurementSource: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Manual Entry</span>
                </label>
              </div>

              {formData.measurementSource === "template" && (
                <>
                  {/* Template Selection */}
                  <div className="mb-4">
                    <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                      Measurement Template
                    </label>
                    <select
                      value={formData.measurementTemplate}
                      onChange={(e) => setFormData({ ...formData, measurementTemplate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Template</option>
                      {templates?.map((template) => (
                        <option key={template._id} value={template._id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Template Measurements */}
                  {formData.measurementTemplate && (
                    <div className="space-y-4">
                      {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
                        <div key={category}>
                          <h4 className="font-bold text-slate-700 mb-2">
                            {categoryTitles[category] || category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categoryFields.map((field) => (
                              <label
                                key={field._id}
                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                                  selectedFields[field.name]
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-blue-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={selectedFields[field.name] || false}
                                  onChange={() => handleMeasurementToggle(field)}
                                />
                                <span className="text-sm">{field.displayName}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Measurement Inputs */}
                      {formData.measurements.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-bold text-slate-700">Enter Values</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {formData.measurements.map((measurement) => (
                              <div key={measurement.name}>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  {measurement.name}
                                </label>
                                <input
                                  type="number"
                                  value={measurement.value}
                                  onChange={(e) => handleMeasurementChange(measurement.name, e.target.value)}
                                  placeholder="inches"
                                  step="0.1"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {formData.measurementSource === "customer" && currentCustomer?.measurements && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Using measurements from customer profile</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(currentCustomer.measurements).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                          {key}
                        </label>
                        <input
                          type="number"
                          value={value}
                          readOnly
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.measurementSource === "manual" && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Enter measurements manually</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fields?.map((field) => (
                      <div key={field._id}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          {field.displayName}
                        </label>
                        <input
                          type="number"
                          value={manualMeasurements[field.name] || ""}
                          onChange={(e) => handleManualMeasurementChange(field.name, e.target.value)}
                          placeholder={field.unit}
                          step="0.1"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IMAGES SECTION - WITH NEW CUSTOMER CLOTH SECTION */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Camera size={20} className="text-blue-600" />
                Garment Images
              </h3>

              {/* Studio/Reference Images */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Studio Reference Images</h4>
                    <p className="text-xs text-slate-500">Designer images, style references, inspiration</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previewImages.studio.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Studio ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, "studio")}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-slate-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                      <Upload size={24} className="text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "studio")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">Max 5MB per image. JPG, PNG, WEBP only.</p>
                </div>
              </div>

              {/* Customer Provided Images (Digital) */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Customer Digital Images</h4>
                    <p className="text-xs text-slate-500">Photos sent by customer via WhatsApp/email</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previewImages.customerProvided.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Customer Digital ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, "customerProvided")}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-slate-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                      <Upload size={24} className="text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "customerProvided")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">Max 5MB per image. JPG, PNG, WEBP only.</p>
                </div>
              </div>

              {/* NEW: Customer Physical Cloth Images */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Scissors size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Customer's Reference Cloth</h4>
                    <p className="text-xs text-slate-500">Photos of physical cloth/design given by customer - for color, fabric, and design reference</p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-orange-200 bg-orange-50/30 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previewImages.customerCloth.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Customer Cloth ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-orange-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, "customerCloth")}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-orange-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-all">
                      <Upload size={24} className="text-orange-400 mb-1" />
                      <span className="text-xs text-orange-600 font-medium">Upload Cloth Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "customerCloth")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-orange-600">
                    <span className="font-bold">Important:</span> Upload photos of the actual cloth/design given by customer. 
                    This helps in matching color, fabric texture, and design details.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-black text-slate-800 mb-4">Price Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Minimum Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priceRange.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: { ...formData.priceRange, min: e.target.value }
                    })}
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Maximum Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priceRange.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: { ...formData.priceRange, max: e.target.value }
                    })}
                    min="0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Additional Information
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows="3"
                placeholder="Any special instructions or notes about this garment..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all"
              >
                {editingGarment ? "Update Garment" : "Add Garment"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}