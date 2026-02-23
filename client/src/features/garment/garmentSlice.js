import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as garmentApi from "./garmentApi";

// ===== ASYNC THUNKS =====
export const createGarment = createAsyncThunk(
  "garment/create",
  async ({ orderId, garmentData }, { rejectWithValue }) => {
    try {
      console.log(`📝 Creating garment for order: ${orderId}`);
      const response = await garmentApi.createGarmentApi(orderId, garmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create garment");
    }
  }
);

export const fetchGarmentsByOrder = createAsyncThunk(
  "garment/fetchByOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching garments for order: ${orderId}`);
      const response = await garmentApi.getGarmentsByOrderApi(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch garments");
    }
  }
);

export const fetchGarmentById = createAsyncThunk(
  "garment/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching garment by ID: ${id}`);
      const response = await garmentApi.getGarmentByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch garment");
    }
  }
);

export const updateGarment = createAsyncThunk(
  "garment/update",
  async ({ id, garmentData }, { rejectWithValue }) => {
    try {
      console.log(`📝 Updating garment: ${id}`);
      const response = await garmentApi.updateGarmentApi(id, garmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update garment");
    }
  }
);

export const updateGarmentImages = createAsyncThunk(
  "garment/updateImages",
  async ({ id, imageData }, { rejectWithValue }) => {
    try {
      console.log(`📸 Updating garment images: ${id}`);
      const response = await garmentApi.updateGarmentImagesApi(id, imageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update images");
    }
  }
);

export const deleteGarmentImage = createAsyncThunk(
  "garment/deleteImage",
  async ({ id, imageKey, imageType }, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting garment image: ${imageKey}`);
      const response = await garmentApi.deleteGarmentImageApi(id, imageKey, imageType);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete image");
    }
  }
);

export const deleteGarment = createAsyncThunk(
  "garment/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting garment: ${id}`);
      await garmentApi.deleteGarmentApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete garment");
    }
  }
);

const garmentSlice = createSlice({
  name: "garment",
  initialState: {
    garments: [],
    currentGarment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentGarment: (state) => {
      state.currentGarment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH GARMENTS BY ORDER =====
      .addCase(fetchGarmentsByOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGarmentsByOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.garments = action.payload;
        console.log("✅ Garments loaded:", action.payload?.length);
      })
      .addCase(fetchGarmentsByOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH GARMENT BY ID =====
      .addCase(fetchGarmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentGarment = null;
      })
      .addCase(fetchGarmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGarment = action.payload;
        console.log("✅ Garment loaded:", action.payload?.name);
      })
      .addCase(fetchGarmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentGarment = null;
      })

      // ===== CREATE GARMENT =====
      .addCase(createGarment.fulfilled, (state, action) => {
        const newGarment = action.payload.garment || action.payload;
        if (newGarment && newGarment._id) {
          state.garments = [newGarment, ...state.garments];
          console.log("✅ Garment created:", newGarment.name);
        }
      })

      // ===== UPDATE GARMENT =====
      .addCase(updateGarment.fulfilled, (state, action) => {
        const updatedGarment = action.payload.garment || action.payload;
        if (updatedGarment && updatedGarment._id) {
          const index = state.garments.findIndex(g => g._id === updatedGarment._id);
          if (index !== -1) {
            state.garments[index] = updatedGarment;
          }
          if (state.currentGarment?._id === updatedGarment._id) {
            state.currentGarment = updatedGarment;
          }
        }
      })

      // ===== DELETE GARMENT =====
      .addCase(deleteGarment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.garments = state.garments.filter(g => g._id !== deletedId);
        if (state.currentGarment?._id === deletedId) {
          state.currentGarment = null;
        }
      });
  },
});

export const { clearCurrentGarment, clearError } = garmentSlice.actions;
export default garmentSlice.reducer;