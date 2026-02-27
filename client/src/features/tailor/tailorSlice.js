import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as tailorApi from "./tailorApi";

// ===== ASYNC THUNKS =====

// ✅ FETCH ALL TAILORS (with pagination & sorting)
export const fetchAllTailors = createAsyncThunk(
  "tailor/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tailorApi.getAllTailorsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tailors");
    }
  }
);

export const fetchTailorById = createAsyncThunk(
  "tailor/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tailorApi.getTailorByIdApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tailor");
    }
  }
);

// ===== CREATE TAILOR - UPDATED WITH DEBUG LOGS =====
export const createTailor = createAsyncThunk(
  "tailor/create",
  async (tailorData, { rejectWithValue }) => {
    try {
      // DEBUG: Log the data received in thunk
      console.log("🔵 [Redux Thunk] createTailor received:", {
        ...tailorData,
        password: tailorData.password ? `✅ PRESENT (${tailorData.password.length} chars)` : "❌ MISSING",
        passwordFirstChars: tailorData.password ? tailorData.password.substring(0, 3) + '...' : null
      });

      // CRITICAL CHECK: Verify password exists
      if (!tailorData.password) {
        console.error("🔴 [Redux Thunk] CRITICAL: Password is missing in thunk!");
        
        // Check if password might be in a different property
        const possiblePasswordProps = ['password', 'pass', 'pwd', 'Password'];
        const foundProps = possiblePasswordProps.filter(prop => tailorData[prop]);
        
        if (foundProps.length > 0) {
          console.log("🔵 [Redux Thunk] Found password in alternative property:", foundProps[0]);
          // Use the found password property
          tailorData.password = tailorData[foundProps[0]];
        } else {
          return rejectWithValue({ 
            message: "Password is required but was not provided in the request data" 
          });
        }
      }

      // Ensure all required fields are present
      const apiData = {
        name: tailorData.name,
        phone: tailorData.phone,
        email: tailorData.email || undefined,
        password: tailorData.password, // Explicitly include password
        experience: tailorData.experience || 0,
        specialization: Array.isArray(tailorData.specialization) ? tailorData.specialization : [],
        address: tailorData.address || {}
      };

      // DEBUG: Log the data being sent to API
      console.log("🔵 [Redux Thunk] Sending to API:", {
        ...apiData,
        password: apiData.password ? `✅ PRESENT (${apiData.password.length} chars)` : "❌ MISSING",
        passwordPreview: apiData.password ? apiData.password.substring(0, 3) + '...' : null
      });

      // Make the API call
      const response = await tailorApi.createTailorApi(apiData);
      
      // DEBUG: Log the API response
      console.log("🔵 [Redux Thunk] API Response:", response);
      
      return response;
    } catch (error) {
      console.error("🔴 [Redux Thunk] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to create tailor"
      );
    }
  }
);

export const updateTailor = createAsyncThunk(
  "tailor/update",
  async ({ id, tailorData }, { rejectWithValue }) => {
    try {
      const response = await tailorApi.updateTailorApi(id, tailorData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update tailor");
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  "tailor/updateLeave",
  async ({ id, leaveData }, { rejectWithValue }) => {
    try {
      const response = await tailorApi.updateLeaveStatusApi(id, leaveData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update leave status");
    }
  }
);

// ✅ NEW: TOGGLE TAILOR STATUS (Activate/Deactivate)
export const toggleTailorStatus = createAsyncThunk(
  "tailor/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tailorApi.toggleTailorStatusApi(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const deleteTailor = createAsyncThunk(
  "tailor/delete",
  async (id, { rejectWithValue }) => {
    try {
      await tailorApi.deleteTailorApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete tailor");
    }
  }
);

export const fetchTailorStats = createAsyncThunk(
  "tailor/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tailorApi.getTailorStatsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

const tailorSlice = createSlice({
  name: "tailor",
  initialState: {
    tailors: [],
    currentTailor: null,
    works: [],
    workStats: {},
    tailorStats: {},
    workDistribution: {},
    loading: false,
    error: null,
    
    // ✅ NEW: Pagination state
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    
    // ✅ NEW: Sorting state
    sorting: {
      field: "createdAt",
      order: "desc" // 'asc' or 'desc'
    },
    
    // ✅ NEW: Search state
    search: {
      term: "",
      filters: {
        status: "all",
        availability: "all"
      }
    }
  },
  reducers: {
    clearCurrentTailor: (state) => {
      state.currentTailor = null;
      state.works = [];
      state.workStats = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // ✅ NEW: Pagination actions
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // ✅ NEW: Sorting actions
    setSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
    },
    
    // ✅ NEW: Search actions
    setSearchTerm: (state, action) => {
      state.search.term = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    setSearchFilter: (state, action) => {
      state.search.filters = { ...state.search.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page
    },
    resetSearch: (state) => {
      state.search = {
        term: "",
        filters: {
          status: "all",
          availability: "all"
        }
      };
      state.pagination.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH ALL TAILORS =====
      .addCase(fetchAllTailors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTailors.fulfilled, (state, action) => {
        state.loading = false;
        
        // ✅ Handle both array and paginated responses
        if (Array.isArray(action.payload)) {
          state.tailors = action.payload;
          state.pagination.total = action.payload.length;
          state.pagination.pages = 1;
        } else {
          state.tailors = action.payload.tailors || action.payload;
          state.pagination = {
            ...state.pagination,
            ...(action.payload.pagination || {})
          };
        }
      })
      .addCase(fetchAllTailors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FETCH TAILOR BY ID =====
      .addCase(fetchTailorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTailorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTailor = action.payload.tailor;
        state.works = action.payload.works;
        state.workStats = action.payload.workStats;
      })
      .addCase(fetchTailorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE TAILOR =====
      .addCase(createTailor.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🟡 [Redux] createTailor pending");
      })
      .addCase(createTailor.fulfilled, (state, action) => {
        state.loading = false;
        console.log("🟢 [Redux] createTailor fulfilled:", action.payload);
        state.tailors = [action.payload.tailor, ...state.tailors];
        state.pagination.total += 1;
      })
      .addCase(createTailor.rejected, (state, action) => {
        state.loading = false;
        console.error("🔴 [Redux] createTailor rejected:", action.payload);
        state.error = action.payload;
      })

      // ===== UPDATE TAILOR =====
      .addCase(updateTailor.fulfilled, (state, action) => {
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== UPDATE LEAVE STATUS =====
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== TOGGLE TAILOR STATUS =====
      .addCase(toggleTailorStatus.fulfilled, (state, action) => {
        const updatedTailor = action.payload.tailor;
        const index = state.tailors.findIndex(t => t._id === updatedTailor._id);
        if (index !== -1) {
          state.tailors[index] = updatedTailor;
        }
        if (state.currentTailor?._id === updatedTailor._id) {
          state.currentTailor = updatedTailor;
        }
      })

      // ===== DELETE TAILOR =====
      .addCase(deleteTailor.fulfilled, (state, action) => {
        state.tailors = state.tailors.filter(t => t._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTailor?._id === action.payload) {
          state.currentTailor = null;
          state.works = [];
          state.workStats = {};
        }
      })

      // ===== FETCH TAILOR STATS =====
      .addCase(fetchTailorStats.fulfilled, (state, action) => {
        state.tailorStats = action.payload.tailorStats;
        state.workDistribution = action.payload.workDistribution;
      });
  },
});

export const { 
  clearCurrentTailor, 
  clearError,
  setPage,
  setLimit,
  setSorting,
  setSearchTerm,
  setSearchFilter,
  resetSearch
} = tailorSlice.actions;

export default tailorSlice.reducer;