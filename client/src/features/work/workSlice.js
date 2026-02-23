import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as workApi from "./workApi";

// ===== ASYNC THUNKS =====
export const fetchAllWorks = createAsyncThunk(
  "work/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      console.log("📡 Fetching works with params:", params);
      const response = await workApi.getAllWorksApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch works");
    }
  }
);

export const fetchWorksByUser = createAsyncThunk(
  "work/fetchByUser",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching works for user: ${userId}`);
      const response = await workApi.getWorksByUserApi(userId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch works");
    }
  }
);

export const fetchWorkById = createAsyncThunk(
  "work/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching work by ID: ${id}`);
      const response = await workApi.getWorkByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch work");
    }
  }
);

export const updateWorkStatus = createAsyncThunk(
  "work/updateStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Updating work ${id} status to:`, status);
      const response = await workApi.updateWorkStatusApi(id, status, notes);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update work status");
    }
  }
);

export const fetchWorkStats = createAsyncThunk(
  "work/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkStatsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch work stats");
    }
  }
);

const workSlice = createSlice({
  name: "work",
  initialState: {
    works: [],
    currentWork: null,
    stats: null,
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
    clearCurrentWork: (state) => {
      state.currentWork = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL WORKS =====
      .addCase(fetchAllWorks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload.works;
        state.pagination = action.payload.pagination;
        console.log("✅ Works loaded:", action.payload.works?.length);
      })
      .addCase(fetchAllWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH WORKS BY USER =====
      .addCase(fetchWorksByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorksByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload;
        console.log("✅ User works loaded:", action.payload?.length);
      })
      .addCase(fetchWorksByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH WORK BY ID =====
      .addCase(fetchWorkById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentWork = null;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWork = action.payload;
        console.log("✅ Work loaded:", action.payload?.workId);
      })
      .addCase(fetchWorkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentWork = null;
      })

      // ===== UPDATE WORK STATUS =====
      .addCase(updateWorkStatus.fulfilled, (state, action) => {
        const updatedWork = action.payload.work || action.payload;
        if (updatedWork && updatedWork._id) {
          const index = state.works.findIndex(w => w._id === updatedWork._id);
          if (index !== -1) {
            state.works[index] = updatedWork;
          }
          if (state.currentWork?._id === updatedWork._id) {
            state.currentWork = updatedWork;
          }
          console.log("✅ Work status updated:", updatedWork.status);
        }
      })

      // ===== FETCH WORK STATS =====
      .addCase(fetchWorkStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        console.log("✅ Work stats loaded");
      });
  },
});

export const { clearCurrentWork, clearError } = workSlice.actions;
export default workSlice.reducer;