// src/features/notification/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationApi from "./notificationApi";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotificationsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAsReadApi(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllAsReadApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload.id);
        if (notification) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  }
});

export const { clearNotifications, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;