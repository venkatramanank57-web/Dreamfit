// features/notification/notificationApi.js
import API from "../../app/axios";

// Get user notifications
export const getNotifications = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/notifications?${queryParams}`);
  return response.data;
};

// Get unread count
export const getUnreadCount = async () => {
  const response = await API.get('/notifications/unread-count');
  return response.data;
};

// Mark notification as read
export const markAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all as read
export const markAllAsRead = async () => {
  const response = await API.patch('/notifications/mark-all-read');
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};