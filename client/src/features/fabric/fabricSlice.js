// src/features/fabric/fabricSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as fabricApi from "./fabricApi";

// ===== ASYNC THUNKS =====
export const fetchAllFabrics = createAsyncThunk(
  "fabric/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📡 Fetching all fabrics...");
      const response = await fabricApi.getAllFabricsApi();
      console.log("✅ Fabrics fetched:", response?.length || 0, "items");
      return response;
    } catch (error) {
      console.error("❌ Fetch fabrics error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fabrics");
    }
  }
);

export const fetchFabricById = createAsyncThunk(
  "fabric/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching fabric by ID: ${id}`);
      const response = await fabricApi.getFabricByIdApi(id);
      console.log("✅ Fabric fetched:", response?.name);
      return response;
    } catch (error) {
      console.error("❌ Fetch fabric error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fabric");
    }
  }
);

export const createFabric = createAsyncThunk(
  "fabric/create",
  async (fabricData, { rejectWithValue }) => {
    try {
      console.log("📤 Creating new fabric with data:", fabricData);
      const response = await fabricApi.createFabricApi(fabricData);
      console.log("✅ Create fabric response:", response);
      return response;
    } catch (error) {
      console.error("❌ Create fabric error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to create fabric");
    }
  }
);

export const updateFabric = createAsyncThunk(
  "fabric/update",
  async ({ id, fabricData }, { rejectWithValue }) => {
    try {
      console.log(`📤 Updating fabric ${id}:`, fabricData);
      const response = await fabricApi.updateFabricApi(id, fabricData);
      console.log("✅ Update fabric response:", response);
      return response;
    } catch (error) {
      console.error("❌ Update fabric error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update fabric");
    }
  }
);

export const deleteFabric = createAsyncThunk(
  "fabric/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting fabric: ${id}`);
      await fabricApi.deleteFabricApi(id);
      console.log("✅ Fabric deleted successfully");
      return id;
    } catch (error) {
      console.error("❌ Delete fabric error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete fabric");
    }
  }
);

export const toggleFabricStatus = createAsyncThunk(
  "fabric/toggle",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🔄 Toggling fabric status: ${id}`);
      const response = await fabricApi.toggleFabricStatusApi(id);
      console.log("✅ Toggle status response:", response);
      return response;
    } catch (error) {
      console.error("❌ Toggle status error:", error);
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
      // ===== FETCH ALL FABRICS =====
      .addCase(fetchAllFabrics.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Loading fabrics...");
      })
      .addCase(fetchAllFabrics.fulfilled, (state, action) => {
        state.loading = false;
        state.fabrics = action.payload;
        console.log("✅ Fabrics loaded in state:", action.payload?.length || 0);
        
        // Log image URLs for debugging
        if (action.payload?.length > 0) {
          console.log("🖼️ Image URLs in fabrics:");
          action.payload.forEach((fabric, index) => {
            console.log(`   ${index + 1}. ${fabric.name}: ${fabric.imageUrl ? '✅ Has image' : '❌ No image'}`);
            if (fabric.imageUrl) console.log(`      URL: ${fabric.imageUrl}`);
          });
        }
      })
      .addCase(fetchAllFabrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Fetch fabrics rejected:", action.payload);
      })

      // ===== FETCH BY ID =====
      .addCase(fetchFabricById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentFabric = null;
        console.log("🔄 Loading fabric details...");
      })
      .addCase(fetchFabricById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFabric = action.payload;
        console.log("✅ Fabric details loaded:", action.payload?.name);
        console.log("🖼️ Image URL:", action.payload?.imageUrl || 'No image');
      })
      .addCase(fetchFabricById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentFabric = null;
        console.error("❌ Fetch fabric rejected:", action.payload);
      })

      // ===== CREATE FABRIC =====
      .addCase(createFabric.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Creating fabric...");
      })
      .addCase(createFabric.fulfilled, (state, action) => {
        state.loading = false;
        const newFabric = action.payload.fabric || action.payload;
        
        if (newFabric && newFabric._id) {
          state.fabrics = [newFabric, ...state.fabrics];
          console.log("✅ New fabric added to state:", newFabric.name);
          console.log("🖼️ Image URL:", newFabric.imageUrl || 'No image');
          
          if (newFabric.imageUrl) {
            console.log("   Image should display at:", newFabric.imageUrl);
          }
        } else {
          console.warn("⚠️ Invalid fabric data received:", action.payload);
        }
      })
      .addCase(createFabric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Create fabric rejected:", action.payload);
      })

      // ===== UPDATE FABRIC =====
      .addCase(updateFabric.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Updating fabric...");
      })
      .addCase(updateFabric.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFabric = action.payload.fabric || action.payload;
        
        if (updatedFabric && updatedFabric._id) {
          // Update in fabrics list
          const index = state.fabrics.findIndex(f => f._id === updatedFabric._id);
          if (index !== -1) {
            state.fabrics[index] = updatedFabric;
            console.log("✅ Fabric updated in list:", updatedFabric.name);
          }
          
          // Update currentFabric if it's the one being edited
          if (state.currentFabric && state.currentFabric._id === updatedFabric._id) {
            state.currentFabric = updatedFabric;
            console.log("✅ Current fabric updated");
          }
          
          console.log("🖼️ Updated image URL:", updatedFabric.imageUrl || 'No image');
        }
      })
      .addCase(updateFabric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Update fabric rejected:", action.payload);
      })

      // ===== DELETE FABRIC =====
      .addCase(deleteFabric.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Deleting fabric...");
      })
      .addCase(deleteFabric.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.fabrics = state.fabrics.filter(f => f._id !== deletedId);
        
        if (state.currentFabric && state.currentFabric._id === deletedId) {
          state.currentFabric = null;
        }
        
        console.log("✅ Fabric deleted from state, ID:", deletedId);
      })
      .addCase(deleteFabric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Delete fabric rejected:", action.payload);
      })

      // ===== TOGGLE STATUS =====
      .addCase(toggleFabricStatus.pending, (state) => {
        console.log("🔄 Toggling fabric status...");
      })
      .addCase(toggleFabricStatus.fulfilled, (state, action) => {
        // Update currentFabric
        if (state.currentFabric && state.currentFabric._id === action.meta.arg) {
          state.currentFabric.isActive = !state.currentFabric.isActive;
          console.log(`✅ Fabric status toggled to: ${state.currentFabric.isActive ? 'Active' : 'Inactive'}`);
        }
        
        // Update in fabrics list
        const index = state.fabrics.findIndex(f => f._id === action.meta.arg);
        if (index !== -1) {
          state.fabrics[index].isActive = !state.fabrics[index].isActive;
          console.log(`✅ Fabric ${state.fabrics[index].name} is now ${state.fabrics[index].isActive ? 'Active' : 'Inactive'}`);
        }
      })
      .addCase(toggleFabricStatus.rejected, (state, action) => {
        console.error("❌ Toggle status rejected:", action.payload);
      });
  },
});

export const { clearError, clearCurrentFabric } = fabricSlice.actions;
export default fabricSlice.reducer;