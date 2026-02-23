import API from "../../app/axios";

// ===== CREATE GARMENT =====
export const createGarmentApi = async (orderId, garmentData) => {
  console.log(`📤 Creating garment for order ${orderId}`);
  
  // Log FormData contents for debugging
  if (garmentData instanceof FormData) {
    for (let pair of garmentData.entries()) {
      console.log(`📤 FormData: ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }
  }
  
  const response = await API.post(`/garments/order/${orderId}`, garmentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ===== GET GARMENTS BY ORDER =====
export const getGarmentsByOrderApi = async (orderId) => {
  console.log(`📡 Fetching garments for order: ${orderId}`);
  const response = await API.get(`/garments/order/${orderId}`);
  return response.data;
};

// ===== GET GARMENT BY ID =====
export const getGarmentByIdApi = async (id) => {
  console.log(`📡 Fetching garment: ${id}`);
  const response = await API.get(`/garments/${id}`);
  return response.data;
};

// ===== UPDATE GARMENT =====
export const updateGarmentApi = async (id, garmentData) => {
  console.log(`📝 Updating garment: ${id}`);
  
  // Check if it's FormData (for images) or JSON
  const isFormData = garmentData instanceof FormData;
  
  const response = await API.put(`/garments/${id}`, garmentData, {
    headers: isFormData ? {
      'Content-Type': 'multipart/form-data',
    } : {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// ===== UPDATE GARMENT IMAGES =====
export const updateGarmentImagesApi = async (id, imageData) => {
  console.log(`📸 Updating garment images: ${id}`);
  const response = await API.patch(`/garments/${id}/images`, imageData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ===== DELETE GARMENT IMAGE =====
export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
  console.log(`🗑️ Deleting image: ${imageKey} from garment: ${id}`);
  const response = await API.delete(`/garments/${id}/images`, {
    data: { imageKey, imageType }
  });
  return response.data;
};

// ===== DELETE GARMENT =====
export const deleteGarmentApi = async (id) => {
  console.log(`🗑️ Deleting garment: ${id}`);
  const response = await API.delete(`/garments/${id}`);
  return response.data;
};