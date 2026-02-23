import API from "../../app/axios";

// ===== GET ALL WORKS =====
export const getAllWorksApi = async (params = {}) => {
  const { page = 1, limit = 10, status = "", assignedTo = "" } = params;
  
  let url = `/works?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (assignedTo) url += `&assignedTo=${assignedTo}`;
  
  const response = await API.get(url);
  return response.data;
};

// ===== GET WORKS BY USER =====
export const getWorksByUserApi = async (userId, status = "") => {
  let url = `/works/user/${userId}`;
  if (status) url += `?status=${status}`;
  
  const response = await API.get(url);
  return response.data;
};

// ===== GET WORK BY ID =====
export const getWorkByIdApi = async (id) => {
  const response = await API.get(`/works/${id}`);
  return response.data;
};

// ===== UPDATE WORK STATUS =====
export const updateWorkStatusApi = async (id, status, notes = "") => {
  const response = await API.patch(`/works/${id}/status`, { status, notes });
  return response.data;
};

// ===== GET WORK STATS =====
export const getWorkStatsApi = async () => {
  const response = await API.get("/works/stats");
  return response.data;
};