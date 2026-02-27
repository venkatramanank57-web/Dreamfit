import API from "../../app/axios";

// ===== 1. CREATE GARMENT (Supports 3-Type Images) =====
export const createGarmentApi = async (orderId, garmentData) => {
  console.log(`📤 Creating garment for order ${orderId}`);
  
  // Debug: FormData content monitoring
  if (garmentData instanceof FormData) {
    for (let pair of garmentData.entries()) {
      console.log(`📤 Field: ${pair[0]} | Value:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }
  }
  
  const response = await API.post(`/garments/order/${orderId}`, garmentData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===== 2. GET GARMENTS BY ORDER =====
export const getGarmentsByOrderApi = async (orderId) => {
  const response = await API.get(`/garments/order/${orderId}`);
  return response.data;
};

// ===== 3. GET GARMENT BY ID (Used for Notifications Redirect) =====
export const getGarmentByIdApi = async (id) => {
  const response = await API.get(`/garments/${id}`);
  return response.data;
};

// ===== 4. UPDATE GARMENT (Text & Details) =====
export const updateGarmentApi = async (id, garmentData) => {
  // If editing text data, it's JSON. If editing images, it's FormData.
  const isFormData = garmentData instanceof FormData;
  
  const response = await API.put(`/garments/${id}`, garmentData, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

// ===== 5. UPDATE GARMENT IMAGES (R2 Cloud Sync) =====
export const updateGarmentImagesApi = async (id, imageData) => {
  const response = await API.patch(`/garments/${id}/images`, imageData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===== 6. DELETE GARMENT IMAGE =====
export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
  // Axois DELETE method-la data anuppa 'data' property thevai
  const response = await API.delete(`/garments/${id}/images`, {
    data: { imageKey, imageType }
  });
  return response.data;
};

// ===== 7. DELETE GARMENT (Soft Delete) =====
export const deleteGarmentApi = async (id) => {
  const response = await API.delete(`/garments/${id}`);
  return response.data;
};