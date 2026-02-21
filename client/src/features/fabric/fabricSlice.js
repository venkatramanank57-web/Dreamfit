// src/features/fabric/fabricSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as fabricApi from "./fabricApi";

// ===== ASYNC THUNKS =====
export const fetchAllFabrics = createAsyncThunk(
  "fabric/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fabricApi.getAllFabricsApi();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fabrics");
    }
  }
);

export const fetchFabricById = createAsyncThunk(
  "fabric/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await fabricApi.getFabricByIdApi(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fabric");
    }
  }
);

export const createFabric = createAsyncThunk(
  "fabric/create",
  async (fabricData, { rejectWithValue }) => {
    try {
      return await fabricApi.createFabricApi(fabricData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create fabric");
    }
  }
);

export const updateFabric = createAsyncThunk(
  "fabric/update",
  async ({ id, fabricData }, { rejectWithValue }) => {
    try {
      return await fabricApi.updateFabricApi(id, fabricData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update fabric");
    }
  }
);

export const deleteFabric = createAsyncThunk(
  "fabric/delete",
  async (id, { rejectWithValue }) => {
    try {
      await fabricApi.deleteFabricApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete fabric");
    }
  }
);

// ✅ ADD THIS - Toggle fabric status
export const toggleFabricStatus = createAsyncThunk(
  "fabric/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fabricApi.toggleFabricStatusApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

const fabricSlice = createSlice({
  name: "fabric",
  initialState: {
    fabrics: [],
    currentFabric: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFabric: (state) => {
      state.currentFabric = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllFabrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFabrics.fulfilled, (state, action) => {
        state.loading = false;
        state.fabrics = action.payload;
      })
      .addCase(fetchAllFabrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchFabricById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentFabric = null;
      })
      .addCase(fetchFabricById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFabric = action.payload;
      })
      .addCase(fetchFabricById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentFabric = null;
      })

      // Create
      .addCase(createFabric.fulfilled, (state, action) => {
        const newFabric = action.payload.fabric || action.payload;
        if (newFabric && newFabric._id) {
          state.fabrics = [newFabric, ...state.fabrics];
        }
      })

      // Update
      .addCase(updateFabric.fulfilled, (state, action) => {
        const updatedFabric = action.payload.fabric || action.payload;
        if (updatedFabric && updatedFabric._id) {
          const index = state.fabrics.findIndex(f => f._id === updatedFabric._id);
          if (index !== -1) state.fabrics[index] = updatedFabric;
          if (state.currentFabric?._id === updatedFabric._id) {
            state.currentFabric = updatedFabric;
          }
        }
      })

      // Delete
      .addCase(deleteFabric.fulfilled, (state, action) => {
        state.fabrics = state.fabrics.filter(f => f._id !== action.payload);
        if (state.currentFabric?._id === action.payload) {
          state.currentFabric = null;
        }
      })

      // ✅ ADD THIS - Toggle status
      .addCase(toggleFabricStatus.fulfilled, (state, action) => {
        if (state.currentFabric && state.currentFabric._id === action.meta.arg) {
          state.currentFabric.isActive = !state.currentFabric.isActive;
        }
        // Also update in the fabrics list
        const index = state.fabrics.findIndex(f => f._id === action.meta.arg);
        if (index !== -1) {
          state.fabrics[index].isActive = !state.fabrics[index].isActive;
        }
      });
  },
});

export const { clearError, clearCurrentFabric } = fabricSlice.actions;
export default fabricSlice.reducer;