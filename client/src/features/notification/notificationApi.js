// src/features/notification/notificationApi.js
import API from "../../app/axios";

export const getNotificationsApi = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markAsReadApi = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await API.patch("/notifications/mark-all-read");
  return response.data;
};