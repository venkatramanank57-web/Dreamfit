import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "./orderApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ORDER STATS
export const fetchOrderStats = createAsyncThunk(
  "order/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📊 Fetching order statistics...");
      const response = await orderApi.getOrderStatsApi();
      return response.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

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

// ✅ NEW: UPDATE ORDER (FULL UPDATE)
export const updateOrder = createAsyncThunk(
  "order/update",
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      console.log(`📝 Updating order ${id}:`, orderData);
      const response = await orderApi.updateOrderApi(id, orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order");
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
    stats: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0,
      statusBreakdown: []
    },
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
      // ===== FETCH ORDER STATS =====
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        console.log("📊 Stats updated in store:", action.payload);
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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
        state.currentOrder = action.payload.order || action.payload;
        console.log("✅ Order loaded:", state.currentOrder?.orderId);
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
          
          if (state.stats) {
            state.stats.total += 1;
            state.stats.today += 1;
            state.stats.thisWeek += 1;
            state.stats.thisMonth += 1;
          }
          
          console.log("✅ Order created:", newOrder.orderId);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ORDER (FULL UPDATE) =====
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.order || action.payload;
        if (updatedOrder && updatedOrder._id) {
          // Update in orders list
          const index = state.orders.findIndex(o => o._id === updatedOrder._id);
          if (index !== -1) {
            state.orders[index] = updatedOrder;
          }
          
          // Update current order if it's the same one
          if (state.currentOrder?._id === updatedOrder._id) {
            state.currentOrder = updatedOrder;
          }
          
          console.log("✅ Order updated:", updatedOrder.orderId);
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE ORDER STATUS =====
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
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
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DELETE ORDER =====
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.orders = state.orders.filter(o => o._id !== deletedId);
        if (state.currentOrder?._id === deletedId) {
          state.currentOrder = null;
        }
        state.pagination.total -= 1;
        
        if (state.stats && state.stats.total > 0) {
          state.stats.total -= 1;
        }
        
        console.log("✅ Order deleted:", deletedId);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;