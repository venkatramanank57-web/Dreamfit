// features/notification/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationApi from './notificationApi';
import showToast from '../../utils/toast';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationApi.markAsRead(id);
      showToast.success('Notification marked as read');
      dispatch(fetchUnreadCount());
      return { id, ...response.data };
    } catch (error) {
      showToast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationApi.markAllAsRead();
      showToast.success('All notifications marked as read');
      dispatch(fetchUnreadCount());
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteNotificationById = createAsyncThunk(
  'notification/deleteNotificationById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationApi.deleteNotification(id);
      showToast.success('Notification deleted');
      dispatch(fetchUnreadCount());
      return id;
    } catch (error) {
      showToast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload?.unreadCount || 0;
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload.id);
        if (notification) {
          notification.isRead = true;
        }
      })
      
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      
      // Delete Notification
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  }
});

export const { clearNotifications } = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notification?.notifications || [];
export const selectUnreadCount = (state) => state.notification?.unreadCount || 0;
export const selectNotificationLoading = (state) => state.notification?.loading || false;
export const selectNotificationPagination = (state) => state.notification?.pagination || {};

export default notificationSlice.reducer;