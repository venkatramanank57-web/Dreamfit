import API from "../../app/axios";

export const getAllSizeFieldsApi = async () => {
  console.log("📡 API call started...");
  try {
    const response = await API.get("/size-fields");
    console.log("📡 API response status:", response.status);
    console.log("📡 API response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("📡 API error:", error.response?.status, error.response?.data);
    throw error;
  }
}

export const getTemplateByIdApi = async (id) => {
  const response = await API.get(`/size-templates/${id}`);
  return response.data;
};

export const createTemplateApi = async (templateData) => {
  const response = await API.post("/size-templates", templateData);
  return response.data;
};

export const updateTemplateApi = async (id, templateData) => {
  const response = await API.put(`/size-templates/${id}`, templateData);
  return response.data;
};

export const deleteTemplateApi = async (id) => {
  const response = await API.delete(`/size-templates/${id}`);
  return response.data;
};

export const toggleTemplateStatusApi = async (id) => {
  const response = await API.patch(`/size-templates/${id}/toggle`);
  return response.data;
};