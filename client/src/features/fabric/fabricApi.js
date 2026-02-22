// src/features/fabric/fabricApi.js
import API from "../../app/axios";

// ===== GET ALL FABRICS =====
export const getAllFabricsApi = async () => {
  console.log("📡 API: Fetching all fabrics...");
  const response = await API.get("/fabrics");
  console.log("📡 API Response:", response.data);
  return response.data;
};

// ===== GET FABRIC BY ID =====
export const getFabricByIdApi = async (id) => {
  console.log(`📡 API: Fetching fabric by ID: ${id}`);
  const response = await API.get(`/fabrics/${id}`);
  console.log("📡 API Response:", response.data);
  return response.data;
};

// ===== CREATE FABRIC (with image upload) =====
export const createFabricApi = async (fabricData) => {
  console.log("📡 API: Creating new fabric...");
  const response = await API.post("/fabrics", fabricData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  console.log("📡 API Response:", response.data);
  return response.data;
};

// ===== UPDATE FABRIC (with image upload) =====
export const updateFabricApi = async (id, fabricData) => {
  console.log(`📡 API: Updating fabric ${id}...`);
  const response = await API.put(`/fabrics/${id}`, fabricData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  console.log("📡 API Response:", response.data);
  return response.data;
};

// ===== DELETE FABRIC =====
export const deleteFabricApi = async (id) => {
  console.log(`📡 API: Deleting fabric ${id}...`);
  const response = await API.delete(`/fabrics/${id}`);
  console.log("📡 API Response:", response.data);
  return response.data;
};

// ===== TOGGLE FABRIC STATUS =====
export const toggleFabricStatusApi = async (id) => {
  console.log(`📡 API: Toggling fabric status for ${id}...`);
  const response = await API.patch(`/fabrics/${id}/toggle`);
  console.log("📡 API Response:", response.data);
  return response.data;
};