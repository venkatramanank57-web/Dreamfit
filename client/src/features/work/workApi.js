import API from "../../app/axios";

// ===== GET ALL WORKS =====
export const getAllWorksApi = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    status = "",
    dateRange = "",
    priority = "",
    search = "",
    assignedTo = "",
    assignedBy = ""
  } = params;
  
  let url = `/works?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (dateRange) url += `&dateRange=${dateRange}`;
  if (priority) url += `&priority=${priority}`;
  if (search) url += `&search=${search}`;
  if (assignedTo) url += `&assignedTo=${assignedTo}`;
  if (assignedBy) url += `&assignedBy=${assignedBy}`;
  
  const response = await API.get(url);
  return response.data;
};

// ===== GET WORK BY ID =====
export const getWorkByIdApi = async (id) => {
  const response = await API.get(`/works/${id}`);
  return response.data;
};

// ===== UPDATE WORK STATUS =====
export const updateWorkStatusApi = async (id, data) => {
  const response = await API.patch(`/works/${id}/status`, data);
  return response.data;
};

// ===== ASSIGN TAILOR =====
export const assignTailorApi = async (id, data) => {
  const response = await API.patch(`/works/${id}/assign-tailor`, data);
  return response.data;
};