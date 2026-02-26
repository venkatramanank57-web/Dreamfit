// src/features/storeKeeper/storeKeeperSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as storeKeeperApi from "./storeKeeperApi";

export const fetchAllStoreKeepers = createAsyncThunk(
  "storeKeeper/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await storeKeeperApi.getAllStoreKeepersApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store keepers");
    }
  }
);

export const fetchStoreKeeperById = createAsyncThunk(
  "storeKeeper/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await storeKeeperApi.getStoreKeeperByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch store keeper");
    }
  }
);

export const createStoreKeeper = createAsyncThunk(
  "storeKeeper/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await storeKeeperApi.createStoreKeeperApi(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create store keeper");
    }
  }
);

export const updateStoreKeeper = createAsyncThunk(
  "storeKeeper/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await storeKeeperApi.updateStoreKeeperApi(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update store keeper");
    }
  }
);

export const deleteStoreKeeper = createAsyncThunk(
  "storeKeeper/delete",
  async (id, { rejectWithValue }) => {
    try {
      await storeKeeperApi.deleteStoreKeeperApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete store keeper");
    }
  }
);

export const fetchStoreKeeperStats = createAsyncThunk(
  "storeKeeper/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeKeeperApi.getStoreKeeperStatsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

const storeKeeperSlice = createSlice({
  name: "storeKeeper",
  initialState: {
    storeKeepers: [],
    currentStoreKeeper: null,
    orders: [],
    orderStats: {},
    stats: {},
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0, pages: 1 }
  },
  reducers: {
    clearCurrentStoreKeeper: (state) => {
      state.currentStoreKeeper = null;
      state.orders = [];
      state.orderStats = {};
    },
    setPage: (state, action) => { state.pagination.page = action.payload; },
    setLimit: (state, action) => { state.pagination.limit = action.payload; state.pagination.page = 1; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStoreKeepers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllStoreKeepers.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.storeKeepers = action.payload;
        } else {
          state.storeKeepers = action.payload.storeKeepers || action.payload;
          state.pagination = { ...state.pagination, ...(action.payload.pagination || {}) };
        }
      })
      .addCase(fetchAllStoreKeepers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStoreKeeperById.fulfilled, (state, action) => {
        state.currentStoreKeeper = action.payload.storeKeeper;
        state.orders = action.payload.orders || [];
        state.orderStats = action.payload.orderStats || {};
      })
      .addCase(createStoreKeeper.fulfilled, (state, action) => {
        state.storeKeepers = [action.payload.storeKeeper, ...state.storeKeepers];
      })
      .addCase(updateStoreKeeper.fulfilled, (state, action) => {
        const updated = action.payload.storeKeeper;
        const index = state.storeKeepers.findIndex(s => s._id === updated._id);
        if (index !== -1) state.storeKeepers[index] = updated;
        if (state.currentStoreKeeper?._id === updated._id) state.currentStoreKeeper = updated;
      })
      .addCase(deleteStoreKeeper.fulfilled, (state, action) => {
        state.storeKeepers = state.storeKeepers.filter(s => s._id !== action.payload);
        if (state.currentStoreKeeper?._id === action.payload) {
          state.currentStoreKeeper = null;
          state.orders = [];
        }
      })
      .addCase(fetchStoreKeeperStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearCurrentStoreKeeper, setPage, setLimit } = storeKeeperSlice.actions;
export default storeKeeperSlice.reducer;