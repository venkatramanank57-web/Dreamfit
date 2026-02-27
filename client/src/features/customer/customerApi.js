// features/customer/customerApi.js
import API from "../../app/axios";

// 🔍 Search customer by phone
export const searchCustomerApi = async (phone) => {
  console.log(`🔍 API - Searching customer by phone: ${phone}`);
  const response = await API.get(`/customers/search/phone/${phone}`);
  return response.data;
};

// 🔍 Search customer by Customer ID
export const searchCustomerByCustomerIdApi = async (customerId) => {
  console.log(`🔍 API - Searching customer by ID: ${customerId}`);
  const response = await API.get(`/customers/search/id/${customerId}`);
  return response.data;
};

// 🆕 Create new customer
export const createCustomerApi = async (customerData) => {
  console.log("\n📦 ========== API CALL ==========");
  console.log("📦 Original customerData:", customerData);
  
  // ✅ FIXED: Direct mapping - no transformations!
  const apiData = {
    salutation: customerData.salutation,
    firstName: customerData.firstName,
    lastName: customerData.lastName || "",
    dateOfBirth: customerData.dateOfBirth,  // ✅ ADD THIS!
    contactNumber: customerData.contactNumber,  // ✅ Direct from frontend
    whatsappNumber: customerData.whatsappNumber,  // ✅ Direct from frontend
    email: customerData.email || "",
    addressLine1: customerData.addressLine1,  // ✅ Direct from frontend
    addressLine2: customerData.addressLine2 || "",
    city: customerData.city || "",
    state: customerData.state || "",
    pincode: customerData.pincode || "",
    notes: customerData.notes || ""
  };
  
  console.log("📦 Mapped API data:", apiData);
  console.log("📞 contactNumber being sent:", apiData.contactNumber);
  console.log("🏠 addressLine1 being sent:", apiData.addressLine1);
  console.log("📅 dateOfBirth being sent:", apiData.dateOfBirth);
  console.log("================================\n");
  
  try {
    const response = await API.post("/customers/create", apiData);
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

// 📋 Get all customers
export const getAllCustomersApi = async () => {
  console.log("📋 API - Fetching all customers");
  const response = await API.get("/customers/all");
  return response.data;
};

// 👤 Get customer by MongoDB ID
export const getCustomerByIdApi = async (id) => {
  console.log(`👤 API - Fetching customer by ID: ${id}`);
  const response = await API.get(`/customers/${id}`);
  return response.data;
};

// ✏️ Update customer
export const updateCustomerApi = async (id, customerData) => {
  console.log(`✏️ API - Updating customer ${id}:`, customerData);
  
  // ✅ FIXED: Direct mapping for update
  const apiData = {
    salutation: customerData.salutation,
    firstName: customerData.firstName,
    lastName: customerData.lastName || "",
    dateOfBirth: customerData.dateOfBirth,  // ✅ ADD THIS!
    contactNumber: customerData.contactNumber,
    whatsappNumber: customerData.whatsappNumber,
    email: customerData.email || "",
    addressLine1: customerData.addressLine1,
    addressLine2: customerData.addressLine2 || "",
    city: customerData.city || "",
    state: customerData.state || "",
    pincode: customerData.pincode || "",
    notes: customerData.notes || ""
  };
  
  const response = await API.put(`/customers/${id}`, apiData);
  return response.data;
};

// ❌ Delete customer
export const deleteCustomerApi = async (id) => {
  console.log(`🗑️ API - Deleting customer: ${id}`);
  const response = await API.delete(`/customers/${id}`);
  return response.data;
};