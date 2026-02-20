// features/auth/authAPI.js
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Your backend URL

export const loginRequest = async (email, password) => {
  try {
    // Use fetch instead of axios interceptor for login (no token needed)
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    
    // Log what backend returns for debugging
    console.log("✅ Login API Response:", data);
    
    // Ensure response has the correct structure
    // Backend should return: { user: {...}, token: "..." }
    if (!data.token || !data.user) {
      console.error("❌ Invalid response structure:", data);
      throw new Error("Invalid response from server");
    }
    
    return data;
  } catch (error) {
    console.error("❌ Login API Error:", error);
    throw error;
  }
};