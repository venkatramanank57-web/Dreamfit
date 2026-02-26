// src/features/cuttingMaster/cuttingMasterApi.js
import API from "../../app/axios";

// ===== GET ALL CUTTING MASTERS =====
export const getAllCuttingMastersApi = async (params = {}) => {
  const { search, availability, page, limit } = params;
  let url = "/cutting-masters";
  const queryParams = [];
  
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (availability && availability !== 'all') queryParams.push(`availability=${availability}`);
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  console.log("📡 API Request:", url);
  const response = await API.get(url);
  return response.data;
};

// ===== GET CUTTING MASTER BY ID =====
export const getCuttingMasterByIdApi = async (id) => {
  console.log(`📡 Fetching cutting master: ${id}`);
  const response = await API.get(`/cutting-masters/${id}`);
  return response.data;
};

// ===== CREATE CUTTING MASTER =====
export const createCuttingMasterApi = async (data) => {
  console.log("📝 Creating cutting master:", data);
  const response = await API.post("/cutting-masters", data);
  return response.data;
};

// ===== UPDATE CUTTING MASTER =====
export const updateCuttingMasterApi = async (id, data) => {
  console.log(`📝 Updating cutting master: ${id}`, data);
  const response = await API.put(`/cutting-masters/${id}`, data);
  return response.data;
};

// ===== DELETE CUTTING MASTER =====
export const deleteCuttingMasterApi = async (id) => {
  console.log(`🗑️ Deleting cutting master: ${id}`);
  const response = await API.delete(`/cutting-masters/${id}`);
  return response.data;
};

// ===== GET CUTTING MASTER STATS =====
export const getCuttingMasterStatsApi = async () => {
  console.log("📡 Fetching cutting master stats");
  const response = await API.get("/cutting-masters/stats");
  return response.data;
};