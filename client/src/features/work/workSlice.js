// features/work/workSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showToast from '../../utils/toast';
import * as workApi from './workApi';

const initialState = {
  works: [],
  myWorks: [], // For cutting master
  tailorWorks: [], // For tailor
  currentWork: null,
  stats: {
    totalWorks: 0,
    pendingWorks: 0,
    acceptedWorks: 0,
    cuttingStarted: 0,
    cuttingCompleted: 0,
    sewingStarted: 0,
    sewingCompleted: 0,
    ironing: 0,
    readyToDeliver: 0,
    todayWorks: 0,
    overdueWorks: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  filters: {
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  }
};

// Async Thunks
export const fetchWorks = createAsyncThunk(
  'work/fetchWorks',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { work } = getState();
      const currentFilters = { ...work.filters, ...filters };
      const response = await workApi.getWorks(currentFilters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch works');
    }
  }
);

export const fetchMyWorks = createAsyncThunk(
  'work/fetchMyWorks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await workApi.getMyWorks(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your works');
    }
  }
);

export const fetchWorkById = createAsyncThunk(
  'work/fetchWorkById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work');
    }
  }
);

export const fetchWorkStats = createAsyncThunk(
  'work/fetchWorkStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workApi.getWorkStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const acceptWorkById = createAsyncThunk(
  'work/acceptWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await workApi.acceptWork(id);
      showToast.success('Work accepted successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorks());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to accept work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignTailorToWork = createAsyncThunk(
  'work/assignTailorToWork',
  async ({ id, tailorId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await workApi.assignTailor(id, tailorId);
      showToast.success('Tailor assigned successfully');
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to assign tailor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateWorkStatusById = createAsyncThunk(
  'work/updateWorkStatusById',
  async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
    try {
      const response = await workApi.updateWorkStatus(id, { status, notes });
      showToast.success(`Work status updated to ${status}`);
      dispatch(fetchMyWorks());
      dispatch(fetchWorkById(id));
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update status');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteWorkById = createAsyncThunk(
  'work/deleteWorkById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await workApi.deleteWork(id);
      showToast.success('Work deleted successfully');
      dispatch(fetchWorks());
      return id;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete work');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentWork: (state) => {
      state.currentWork = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Works
      .addCase(fetchWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.works = action.payload.works || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        if (action.payload.statusCounts) {
          state.stats = { ...state.stats, ...action.payload.statusCounts };
        }
      })
      .addCase(fetchWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Works (Cutting Master)
      .addCase(fetchMyWorks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyWorks.fulfilled, (state, action) => {
        state.loading = false;
        state.myWorks = action.payload.works || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMyWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work By ID
      .addCase(fetchWorkById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWork = action.payload;
      })
      .addCase(fetchWorkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Work Stats
      .addCase(fetchWorkStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      });
  }
});

export const { setFilters, resetFilters, clearCurrentWork } = workSlice.actions;

// Selectors
export const selectAllWorks = (state) => state.work.works;
export const selectMyWorks = (state) => state.work.myWorks;
export const selectCurrentWork = (state) => state.work.currentWork;
export const selectWorkStats = (state) => state.work.stats;
export const selectWorkPagination = (state) => state.work.pagination;
export const selectWorkFilters = (state) => state.work.filters;
export const selectWorkLoading = (state) => state.work.loading;

export default workSlice.reducer;