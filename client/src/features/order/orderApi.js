import API from "../../app/axios";

// ===== GET ALL ORDERS with filters =====
export const getAllOrdersApi = async (params = {}) => {
  const { 
    page = 1, 
    limit = 10, 
    search = "", 
    status = "", 
    timeFilter = "all",
    startDate = "",
    endDate = "" 
  } = params;
  
  let url = `/orders?page=${page}&limit=${limit}`;
  if (search) url += `&search=${search}`;
  if (status) url += `&status=${status}`;
  if (timeFilter) url += `&timeFilter=${timeFilter}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  
  const response = await API.get(url);
  return response.data;
};

// ===== GET ORDER BY ID =====
export const getOrderByIdApi = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

// ===== CREATE NEW ORDER =====
export const createOrderApi = async (orderData) => {
  console.log("📤 Sending to backend:", JSON.stringify(orderData, null, 2));
  console.log("📤 createdBy in API call:", orderData.createdBy);
  
  try {
    const response = await API.post("/orders", orderData);
    console.log("📥 Backend response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw error;
  }
};

// ===== UPDATE ORDER STATUS =====
export const updateOrderStatusApi = async (id, status) => {
  const response = await API.patch(`/orders/${id}/status`, { status });
  return response.data;
};

// ===== DELETE ORDER =====
export const deleteOrderApi = async (id) => {
  const response = await API.delete(`/orders/${id}`);
  return response.data;
};