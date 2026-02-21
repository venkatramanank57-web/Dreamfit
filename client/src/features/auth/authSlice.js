import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../app/axios";

// 👤 Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await API.put("/users/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// 🔐 Change Password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await API.put("/users/change-password", passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

// Function to load state from localStorage
const loadStateFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      return {
        user: JSON.parse(user),
        token: token,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error("Failed to load auth state from localStorage:", error);
  }
  
  return {
    user: null,
    token: null,
    loading: false,
    error: null,
  };
};

const initialState = loadStateFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // when login starts
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // when login success
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      // Save to localStorage
      try {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        console.log("✅ Auth state saved to localStorage");
      } catch (error) {
        console.error("Failed to save auth state to localStorage:", error);
      }
    },

    // when login fails
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      
      // Clear localStorage
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("✅ Auth state cleared from localStorage");
      } catch (error) {
        console.error("Failed to clear auth state from localStorage:", error);
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in state
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
          console.log("✅ Profile updated in localStorage");
        } catch (error) {
          console.error("Failed to update user in localStorage:", error);
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change Password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;