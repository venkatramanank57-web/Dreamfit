// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userAPI from "./userAPI";

// 📋 Fetch all staff
export const fetchAllStaff = createAsyncThunk(
  "user/fetchAllStaff",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getAllStaff();
      console.log("✅ fetchAllStaff response:", response); // Debug log
      return response; // This should be the array of users
    } catch (error) {
      console.error("❌ fetchAllStaff error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch staff");
    }
  }
);

// 🆕 Create new staff
export const createStaff = createAsyncThunk(
  "user/createStaff",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await userAPI.createUser(userData);
      console.log("✅ createStaff response:", response);
      await dispatch(fetchAllStaff()); // Refresh the list
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create staff");
    }
  }
);

// ✏️ Update staff
export const updateStaff = createAsyncThunk(
  "user/updateStaff",
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      console.log("✅ updateStaff response:", response);
      await dispatch(fetchAllStaff()); // Refresh the list
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update staff");
    }
  }
);

// ❌ Delete staff
export const deleteStaff = createAsyncThunk(
  "user/deleteStaff",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await userAPI.deleteUser(id);
      console.log("✅ deleteStaff response:", response);
      await dispatch(fetchAllStaff()); // Refresh the list
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete staff");
    }
  }
);

// 🔄 Toggle staff status
export const toggleStaffStatus = createAsyncThunk(
  "user/toggleStatus",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await userAPI.toggleUserStatus(id);
      console.log("✅ toggleStaffStatus response:", response);
      await dispatch(fetchAllStaff()); // Refresh the list
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle status");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearUserState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all staff
      .addCase(fetchAllStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 fetchAllStaff pending");
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // ✅ Make sure this is set correctly
        state.error = null;
        console.log("✅ fetchAllStaff fulfilled - users updated:", action.payload);
      })
      .addCase(fetchAllStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log("❌ fetchAllStaff rejected:", action.payload);
      })

      // Create staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle status
      .addCase(toggleStaffStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleStaffStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleStaffStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;