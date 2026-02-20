// features/customer/customerApi.js
import API from "../../app/axios";

// Search customer by phone
export const searchCustomerApi = async (phone) => {
  const response = await API.get(`/customers/search/${phone}`);
  return response.data;
};

// 🆕 Create new customer - FIXED MAPPING
export const createCustomerApi = async (customerData) => {
  console.log("📦 Original customer data:", customerData); // Debug log
  
  // Map frontend field names to what backend expects
  const apiData = {
    salutation: customerData.salutation,
    firstName: customerData.firstName,
    lastName: customerData.lastName || "",
    contactNumber: customerData.phone, // Make sure this matches backend field name
    whatsappNumber: customerData.whatsapp || customerData.phone,
    email: customerData.email || "",
    addressLine1: customerData.address?.line1 || "",
    addressLine2: customerData.address?.line2 || "",
    city: customerData.address?.city || "",
    state: customerData.address?.state || "",
    pincode: customerData.address?.pincode || "",
    notes: customerData.notes || ""
  };
  
  console.log("📦 Sending to backend:", apiData); // Debug log
  
  try {
    const response = await API.post("/customers/create", apiData);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get all customers
export const getAllCustomersApi = async () => {
  const response = await API.get("/customers/all");
  return response.data;
};

// Get customer by ID
export const getCustomerByIdApi = async (id) => {
  const response = await API.get(`/customers/${id}`);
  return response.data;
};

// Update customer
export const updateCustomerApi = async (id, customerData) => {
  // Map frontend field names to backend field names for update
  const apiData = {
    salutation: customerData.salutation,
    firstName: customerData.firstName,
    lastName: customerData.lastName || "",
    contactNumber: customerData.phone || customerData.contactNumber,
    whatsappNumber: customerData.whatsappNumber || customerData.whatsapp || customerData.phone,
    email: customerData.email || "",
    addressLine1: customerData.addressLine1 || customerData.address?.line1 || "",
    addressLine2: customerData.addressLine2 || customerData.address?.line2 || "",
    city: customerData.city || customerData.address?.city || "",
    state: customerData.state || customerData.address?.state || "",
    pincode: customerData.pincode || customerData.address?.pincode || "",
    notes: customerData.notes || ""
  };
  
  const response = await API.put(`/customers/${id}`, apiData);
  return response.data;
};

// Delete customer
export const deleteCustomerApi = async (id) => {
  const response = await API.delete(`/customers/${id}`);
  return response.data;
};