// frontend/src/features/customerSize/customerSizeApi.js
import API from "../../app/axios"; // Your axios instance

// ========== GET ALL PROFILES FOR A CUSTOMER ==========
export const fetchCustomerProfiles = async (customerId) => {
  try {
    const response = await API.get(`/customer-size/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== GET SINGLE PROFILE ==========
export const fetchProfileById = async (profileId) => {
  try {
    const response = await API.get(`/customer-size/${profileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== CREATE NEW PROFILE ==========
export const createProfile = async (profileData) => {
  try {
    const response = await API.post('/customer-size', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== UPDATE MEASUREMENTS ==========
export const updateProfileMeasurements = async (profileId, measurementsData) => {
  try {
    const response = await API.put(`/customer-size/${profileId}/measurements`, measurementsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== MARK PROFILE AS USED ==========
export const markProfileAsUsed = async (profileId) => {
  try {
    const response = await API.patch(`/customer-size/${profileId}/use`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== GET MEASUREMENT HISTORY ==========
export const fetchMeasurementHistory = async (profileId) => {
  try {
    const response = await API.get(`/customer-size/${profileId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== DELETE PROFILE (Soft Delete) ==========
export const deleteProfile = async (profileId) => {
  try {
    const response = await API.delete(`/customer-size/${profileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== GET OLD PROFILES (>3 months) ==========
export const fetchOldProfiles = async () => {
  try {
    const response = await API.get('/customer-size/old');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== GET RECENT PROFILES ==========
export const fetchRecentProfiles = async (limit = 10) => {
  try {
    const response = await API.get(`/customer-size/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== GET PROFILE STATISTICS ==========
export const fetchProfileStatistics = async (customerId) => {
  try {
    const response = await API.get(`/customer-size/customer/${customerId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ========== BULK CREATE PROFILES ==========
export const bulkCreateProfiles = async (profilesData) => {
  try {
    const response = await API.post('/customer-size/bulk', profilesData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};