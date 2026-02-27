// src/Pages/admin/EditFabric.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { fetchFabricById, updateFabric } from "../../../features/fabric/fabricSlice";
import showToast from "../../../utils/toast";

export default function EditFabric() {
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

  const [formData, setFormData] = useState({
    name: "",
    color: "",
    pricePerMeter: "",
    imageFile: null,
    imagePreview: null
  });

  useEffect(() => {
    if (id) dispatch(fetchFabricById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (currentFabric) {
      setFormData({
        name: currentFabric.name || "",
        color: currentFabric.color || "",
        pricePerMeter: currentFabric.pricePerMeter || "",
        imageFile: null,
        imagePreview: currentFabric.imageUrl || null
      });
    }
  }, [currentFabric]);

  // Check if user has permission to edit
  useEffect(() => {
    if (!canEdit && !loading && currentFabric) {
      showToast.error("You don't have permission to edit fabrics");
      navigate(`${basePath}/fabrics/${id}`);
    }
  }, [canEdit, loading, currentFabric, navigate, basePath, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit) {
      showToast.error("You don't have permission to edit fabrics");
      return;
    }

    if (!formData.name || !formData.color || !formData.pricePerMeter) {
      showToast.error("Please fill all required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('pricePerMeter', formData.pricePerMeter);
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      await dispatch(updateFabric({ id, fabricData: formDataToSend })).unwrap();
      showToast.success("Fabric updated successfully! ✅");
      navigate(`${basePath}/fabrics/${id}`);
    } catch (error) {
      showToast.error(error || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button 
        onClick={() => navigate(`${basePath}/fabrics/${id}`)} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={20} /> Back to Fabric Details
      </button>

      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">Edit Fabric</h1>
          {!canEdit && (
            <p className="text-sm text-red-200 mt-2">You don't have permission to edit</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Fabric Name"
            value={formData.name}
            onChange={handleChange}
            disabled={!canEdit}
            className={`w-full px-4 py-3 border rounded-lg ${
              !canEdit ? 'bg-slate-100 cursor-not-allowed' : ''
            }`}
            required
          />
          
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
            disabled={!canEdit}
            className={`w-full px-4 py-3 border rounded-lg ${
              !canEdit ? 'bg-slate-100 cursor-not-allowed' : ''
            }`}
            required
          />
          
          <input
            type="number"
            name="pricePerMeter"
            placeholder="Price per Meter (₹)"
            value={formData.pricePerMeter}
            onChange={handleChange}
            disabled={!canEdit}
            className={`w-full px-4 py-3 border rounded-lg ${
              !canEdit ? 'bg-slate-100 cursor-not-allowed' : ''
            }`}
            required
          />

          {formData.imagePreview && (
            <div className="relative">
              <img src={formData.imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {canEdit && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
              <Upload className="w-8 h-8 mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">Click to upload new image</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!canEdit}
              className={`flex-1 px-6 py-3 text-white rounded-lg font-bold flex items-center justify-center gap-2 ${
                canEdit 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} /> Update Fabric
            </button>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/fabrics/${id}`)}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}