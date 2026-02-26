import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as workApi from "./workApi";

export const fetchAllWorks = createAsyncThunk(
  "work/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await workApi.getAllWorksApi(params);
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
      const response = await workApi.updateWorkStatusApi(id, { status, notes });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const assignTailor = createAsyncThunk(
  "work/assignTailor",
  async ({ id, tailorId }, { rejectWithValue }) => {
    try {
      const response = await workApi.assignTailorApi(id, { tailorId });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign tailor");
    }
  }
);

const workSlice = createSlice({
  name: "work",
  initialState: {
    works: [],
    currentWork: null,
    stats: {
      total: 0,
      pending: 0,
      accepted: 0,
      inProgress: 0,
      ready: 0,
      completed: 0
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentWork: (state) => {
      state.currentWork = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWorks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload.works;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.currentWork = action.payload;
      })
      .addCase(updateWorkStatus.fulfilled, (state, action) => {
        const updatedWork = action.payload.work;
        const index = state.works.findIndex(w => w._id === updatedWork._id);
        if (index !== -1) {
          state.works[index] = updatedWork;
        }
        if (state.currentWork?._id === updatedWork._id) {
          state.currentWork = updatedWork;
        }
      })
      .addCase(assignTailor.fulfilled, (state, action) => {
        const updatedWork = action.payload.work;
        const index = state.works.findIndex(w => w._id === updatedWork._id);
        if (index !== -1) {
          state.works[index] = updatedWork;
        }
        if (state.currentWork?._id === updatedWork._id) {
          state.currentWork = updatedWork;
        }
      });
  }
});

export const { clearCurrentWork, clearError } = workSlice.actions;
export default workSlice.reducer;