// features/work/workApi.js
import API from "../../app/axios";

// Get all works (with filters)
export const getWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/works?${queryParams}`);
  return response.data;
};

// Get work by ID
export const getWorkById = async (id) => {
  const response = await API.get(`/works/${id}`);
  return response.data;
};

// Get works by cutting master
export const getMyWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await API.get(`/works/my-works?${queryParams}`);
  return response.data;
};

// Get works by tailor
export const getTailorWorks = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await API.get(`/works/tailor-works?${queryParams}`);
  return response.data;
};

// Get work statistics
export const getWorkStats = async () => {
  const response = await API.get('/works/stats');
  return response.data;
};

// Accept work (Cutting Master only)
export const acceptWork = async (id) => {
  const response = await API.patch(`/works/${id}/accept`);
  return response.data;
};

// Assign tailor (Cutting Master only)
export const assignTailor = async (id, tailorId) => {
  const response = await API.patch(`/works/${id}/assign-tailor`, { tailorId });
  return response.data;
};

// Update work status (Cutting Master only)
export const updateWorkStatus = async (id, statusData) => {
  const response = await API.patch(`/works/${id}/status`, statusData);
  return response.data;
};

// Delete work (Admin only)
export const deleteWork = async (id) => {
  const response = await API.delete(`/works/${id}`);
  return response.data;
};