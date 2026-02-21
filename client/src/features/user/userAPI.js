// src/features/user/userAPI.js
import API from "../../app/axios";

// 📋 Get all staff
export const getAllStaff = async () => {
  try {
    const response = await API.get("/users/all-staff");
    console.log("✅ getAllStaff response:", response.data);
    return response.data; // This should return the array directly
  } catch (error) {
    console.error("❌ getAllStaff error:", error);
    throw error;
  }
};

// 🆕 Create new user
export const createUser = async (userData) => {
  try {
    const response = await API.post("/users/create", userData);
    console.log("✅ createUser response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ createUser error:", error);
    throw error;
  }
};

// ✏️ Update user
export const updateUser = async (id, userData) => {
  const response = await API.put(`/users/${id}`, userData);
  return response.data;
};

// ❌ Delete user
export const deleteUser = async (id) => {
  const response = await API.delete(`/users/${id}`);
  return response.data;
};

// 🔄 Toggle user status
export const toggleUserStatus = async (id) => {
  const response = await API.put(`/users/${id}/toggle-status`);
  return response.data;
};