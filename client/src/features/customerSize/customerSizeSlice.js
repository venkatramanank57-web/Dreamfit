// frontend/src/features/customerSize/customerSizeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as customerSizeApi from "./customerSizeApi";

// ========== INITIAL STATE ==========
const initialState = {
  profiles: [],           // All profiles for current customer
  currentProfile: null,   // Currently selected profile
  history: [],            // Measurement history
  statistics: null,       // Profile statistics
  recentProfiles: [],     // Recently used profiles
  oldProfiles: [],        // Old profiles (>3 months)
  
  loading: false,         // Loading state
  error: null,            // Error state
  success: false,         // Success state
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

// ========== ASYNC THUNKS ==========

// Fetch all profiles for a customer
export const fetchProfiles = createAsyncThunk(
  'customerSize/fetchProfiles',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchCustomerProfiles(customerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profiles');
    }
  }
);

// Fetch single profile by ID
export const fetchProfile = createAsyncThunk(
  'customerSize/fetchProfile',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchProfileById(profileId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

// Create new profile
export const createNewProfile = createAsyncThunk(
  'customerSize/createProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.createProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create profile');
    }
  }
);

// Update measurements
export const updateMeasurements = createAsyncThunk(
  'customerSize/updateMeasurements',
  async ({ profileId, measurementsData }, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.updateProfileMeasurements(profileId, measurementsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update measurements');
    }
  }
);

// Mark profile as used
export const markAsUsed = createAsyncThunk(
  'customerSize/markAsUsed',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.markProfileAsUsed(profileId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark as used');
    }
  }
);

// Fetch measurement history
export const fetchHistory = createAsyncThunk(
  'customerSize/fetchHistory',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchMeasurementHistory(profileId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch history');
    }
  }
);

// Delete profile (soft delete)
export const deleteProfileById = createAsyncThunk(
  'customerSize/deleteProfile',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.deleteProfile(profileId);
      return { profileId, message: response.message };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete profile');
    }
  }
);

// Fetch old profiles (>3 months)
export const fetchOldProfiles = createAsyncThunk(
  'customerSize/fetchOldProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchOldProfiles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch old profiles');
    }
  }
);

// Fetch recent profiles
export const fetchRecentProfiles = createAsyncThunk(
  'customerSize/fetchRecentProfiles',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchRecentProfiles(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch recent profiles');
    }
  }
);

// Fetch profile statistics
export const fetchStatistics = createAsyncThunk(
  'customerSize/fetchStatistics',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await customerSizeApi.fetchProfileStatistics(customerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

// ========== SLICE ==========
const customerSizeSlice = createSlice({
  name: 'customerSize',
  initialState,
  reducers: {
    // Clear all profiles
    clearProfiles: (state) => {
      state.profiles = [];
      state.currentProfile = null;
    },
    
    // Clear current profile
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success
    clearSuccess: (state) => {
      state.success = false;
    },
    
    // Set selected profile
    setSelectedProfile: (state, action) => {
      state.currentProfile = action.payload;
    },
    
    // Update local measurements (without API)
    updateLocalMeasurements: (state, action) => {
      if (state.currentProfile) {
        state.currentProfile.measurements = action.payload;
      }
    },
    
    // Reset state
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH PROFILES =====
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
        state.success = true;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== FETCH SINGLE PROFILE =====
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
        state.success = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== CREATE PROFILE =====
      .addCase(createNewProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = [action.payload, ...state.profiles];
        state.currentProfile = action.payload;
        state.success = true;
      })
      .addCase(createNewProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== UPDATE MEASUREMENTS =====
      .addCase(updateMeasurements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeasurements.fulfilled, (state, action) => {
        state.loading = false;
        // Update in profiles array
        const index = state.profiles.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        // Update current profile if it's the same
        if (state.currentProfile?._id === action.payload._id) {
          state.currentProfile = action.payload;
        }
        state.success = true;
      })
      .addCase(updateMeasurements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== MARK AS USED =====
      .addCase(markAsUsed.fulfilled, (state, action) => {
        // Update usage count in profiles
        const profile = state.profiles.find(p => p._id === action.meta.arg);
        if (profile) {
          profile.usageCount = (profile.usageCount || 0) + 1;
          profile.lastUsed = new Date().toISOString();
        }
        // Update current profile
        if (state.currentProfile?._id === action.meta.arg) {
          state.currentProfile.usageCount = (state.currentProfile.usageCount || 0) + 1;
          state.currentProfile.lastUsed = new Date().toISOString();
        }
      })
      
      // ===== FETCH HISTORY =====
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
        state.success = true;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== DELETE PROFILE =====
      .addCase(deleteProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = state.profiles.filter(p => p._id !== action.payload.profileId);
        if (state.currentProfile?._id === action.payload.profileId) {
          state.currentProfile = null;
        }
        state.success = true;
      })
      .addCase(deleteProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== FETCH OLD PROFILES =====
      .addCase(fetchOldProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOldProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.oldProfiles = action.payload;
        state.success = true;
      })
      .addCase(fetchOldProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== FETCH RECENT PROFILES =====
      .addCase(fetchRecentProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.recentProfiles = action.payload;
        state.success = true;
      })
      .addCase(fetchRecentProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ===== FETCH STATISTICS =====
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.success = true;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

// ========== SELECTORS ==========
export const selectAllProfiles = (state) => state.customerSize.profiles;
export const selectCurrentProfile = (state) => state.customerSize.currentProfile;
export const selectProfileHistory = (state) => state.customerSize.history;
export const selectProfileStatistics = (state) => state.customerSize.statistics;
export const selectRecentProfiles = (state) => state.customerSize.recentProfiles;
export const selectOldProfiles = (state) => state.customerSize.oldProfiles;
export const selectLoading = (state) => state.customerSize.loading;
export const selectError = (state) => state.customerSize.error;
export const selectSuccess = (state) => state.customerSize.success;

// ========== ACTIONS ==========
export const {
  clearProfiles,
  clearCurrentProfile,
  clearError,
  clearSuccess,
  setSelectedProfile,
  updateLocalMeasurements,
  resetState
} = customerSizeSlice.actions;

// ========== REDUCER ==========
export default customerSizeSlice.reducer;