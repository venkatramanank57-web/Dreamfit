import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "./orderApi";

// ===== ASYNC THUNKS =====
export const fetchAllOrders = createAsyncThunk(
  "order/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      console.log("📡 Fetching orders with params:", params);
      const response = await orderApi.getAllOrdersApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching order by ID: ${id}`);
      const response = await orderApi.getOrderByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData, { rejectWithValue }) => {
    try {
      console.log("📝 Creating order:", orderData);
      const response = await orderApi.createOrderApi(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Updating order ${id} status to:`, status);
      const response = await orderApi.updateOrderStatusApi(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting order: ${id}`);
      await orderApi.deleteOrderApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL ORDERS =====
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        console.log("✅ Orders loaded:", action.payload.orders?.length);
        
        // Log customer data for debugging
        if (action.payload.orders?.length > 0) {
          console.log("👤 Sample customer:", action.payload.orders[0].customer);
        }
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH ORDER BY ID =====
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        console.log("✅ Order loaded:", action.payload?.orderId);
        console.log("👤 Customer:", action.payload?.customer); // Debug log
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentOrder = null;
      })

      // ===== CREATE ORDER =====
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        const newOrder = action.payload.order || action.payload;
        if (newOrder && newOrder._id) {
          state.orders = [newOrder, ...state.orders];
          state.pagination.total += 1;
          console.log("✅ Order created:", newOrder.orderId);
          console.log("👤 Customer:", newOrder.customer); // Debug log
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ORDER STATUS =====
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order || action.payload;
        if (updatedOrder && updatedOrder._id) {
          const index = state.orders.findIndex(o => o._id === updatedOrder._id);
          if (index !== -1) {
            state.orders[index] = updatedOrder;
          }
          if (state.currentOrder?._id === updatedOrder._id) {
            state.currentOrder = updatedOrder;
          }
          console.log("✅ Order status updated:", updatedOrder.status);
        }
      })

      // ===== DELETE ORDER =====
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.orders = state.orders.filter(o => o._id !== deletedId);
        if (state.currentOrder?._id === deletedId) {
          state.currentOrder = null;
        }
        state.pagination.total -= 1;
        console.log("✅ Order deleted:", deletedId);
      });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;