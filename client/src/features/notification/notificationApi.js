import API from "../../app/axios";

// ===== GET NOTIFICATIONS =====
export const getNotificationsApi = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

// ===== MARK AS READ =====
export const markAsReadApi = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

// ===== MARK ALL AS READ =====
export const markAllAsReadApi = async () => {
  const response = await API.patch("/notifications/mark-all-read");
  return response.data;
};