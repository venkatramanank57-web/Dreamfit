// src/features/fabric/fabricApi.js
import API from "../../app/axios";

export const getAllFabricsApi = async () => {
  const response = await API.get("/fabrics");
  return response.data;
};

export const getFabricByIdApi = async (id) => {
  const response = await API.get(`/fabrics/${id}`);
  return response.data;
};

export const createFabricApi = async (fabricData) => {
  const response = await API.post("/fabrics", fabricData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateFabricApi = async (id, fabricData) => {
  const response = await API.put(`/fabrics/${id}`, fabricData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteFabricApi = async (id) => {
  const response = await API.delete(`/fabrics/${id}`);
  return response.data;
};

// ✅ ADD THIS - Toggle fabric status
export const toggleFabricStatusApi = async (id) => {
  const response = await API.patch(`/fabrics/${id}/toggle`);
  return response.data;
};