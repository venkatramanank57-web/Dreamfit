import { createSlice } from "@reduxjs/toolkit";

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
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;