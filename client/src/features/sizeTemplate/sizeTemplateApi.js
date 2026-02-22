import API from "../../app/axios";

export const getAllTemplatesApi = async (page = 1, search = "", includeInactive = false) => {
  const response = await API.get(`/size-templates?page=${page}&search=${search}&includeInactive=${includeInactive}`);
  return response.data;
};

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