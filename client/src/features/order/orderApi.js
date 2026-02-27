import API from "../../app/axios";

// ===== 1. GET ALL ORDERS with filters =====
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
  
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...(search && { search }),
    ...(status && status !== 'all' && { status }),
    ...(timeFilter && { timeFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  }).toString();

  console.log("📡 Fetching orders with params:", params);
  const response = await API.get(`/orders?${queryParams}`);
  return response.data;
};

// ===== 2. GET ORDER STATS =====
export const getOrderStatsApi = async () => {
  console.log("📊 Fetching order stats");
  const response = await API.get("/orders/stats");
  return response.data;
};

// ===== 3. GET ORDER BY ID =====
export const getOrderByIdApi = async (id) => {
  console.log(`📡 Fetching order: ${id}`);
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

// ===== 4. CREATE NEW ORDER =====
export const createOrderApi = async (orderData) => {
  // 🔍 CRITICAL DEBUGGING - Check what's coming into the API
  console.log("========== ORDER API DEBUG ==========");
  console.log("📥 Received orderData type:", typeof orderData);
  console.log("📥 Received orderData:", orderData);
  console.log("📥 All keys:", Object.keys(orderData));
  console.log("📥 createdBy value:", orderData.createdBy);
  console.log("📥 createdBy type:", typeof orderData.createdBy);
  console.log("📥 createdBy length:", orderData.createdBy?.length);
  console.log("📥 customer value:", orderData.customer);
  console.log("=====================================");
  
  // Create a clean copy of the data to ensure nothing is lost
  const dataToSend = {
    customer: orderData.customer,
    deliveryDate: orderData.deliveryDate,
    specialNotes: orderData.specialNotes || "",
    advancePayment: {
      amount: Number(orderData.advancePayment?.amount) || 0,
      method: orderData.advancePayment?.method || "cash",
      date: orderData.advancePayment?.date || new Date().toISOString(),
    },
    priceSummary: {
      totalMin: Number(orderData.priceSummary?.totalMin) || 0,
      totalMax: Number(orderData.priceSummary?.totalMax) || 0,
    },
    balanceAmount: Number(orderData.balanceAmount) || 0,
    createdBy: orderData.createdBy, // ⚠️ This MUST be present
    status: orderData.status || "draft",
    orderDate: orderData.orderDate || new Date().toISOString(),
    garments: orderData.garments || [],
  };

  // Verify createdBy is still present
  console.log("📤 Data being sent to backend:", {
    ...dataToSend,
    createdBy: dataToSend.createdBy || "❌ MISSING - THIS IS THE PROBLEM!"
  });

  if (!dataToSend.createdBy) {
    console.error("❌ CRITICAL: createdBy is missing in dataToSend!");
    throw new Error("createdBy is required but was not provided");
  }

  try {
    const response = await API.post("/orders", dataToSend);
    console.log("✅ Order created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Order creation failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// ===== 5. UPDATE ORDER (FULL UPDATE) =====
export const updateOrderApi = async (id, orderData) => {
  console.log(`========== UPDATE ORDER API DEBUG ==========`);
  console.log(`📝 Updating order ${id}:`, orderData);
  
  // Create a clean copy for the update
  const dataToSend = {
    deliveryDate: orderData.deliveryDate,
    specialNotes: orderData.specialNotes || "",
    advancePayment: {
      amount: Number(orderData.advancePayment?.amount) || 0,
      method: orderData.advancePayment?.method || "cash",
    },
    priceSummary: {
      totalMin: Number(orderData.priceSummary?.totalMin) || 0,
      totalMax: Number(orderData.priceSummary?.totalMax) || 0,
    },
    balanceAmount: Number(orderData.balanceAmount) || 0,
    status: orderData.status || "draft",
  };

  console.log("📤 Update data being sent:", dataToSend);
  console.log("==========================================");

  try {
    const response = await API.put(`/orders/${id}`, dataToSend);
    console.log("✅ Order updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Order update failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// ===== 6. UPDATE ORDER STATUS =====
export const updateOrderStatusApi = async (id, status) => {
  console.log(`🔄 Updating order ${id} status to:`, status);
  const response = await API.patch(`/orders/${id}/status`, { status });
  return response.data;
};

// ===== 7. DELETE ORDER =====
export const deleteOrderApi = async (id) => {
  console.log(`🗑️ Deleting order: ${id}`);
  const response = await API.delete(`/orders/${id}`);
  return response.data;
};