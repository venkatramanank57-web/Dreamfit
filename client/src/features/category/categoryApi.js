// src/features/category/categoryApi.js
import API from "../../app/axios";

export const getAllCategoriesApi = async () => {
  const response = await API.get("/categories");
  return response.data;
};

export const createCategoryApi = async (categoryData) => {
  const response = await API.post("/categories", categoryData);
  return response.data;
};

export const updateCategoryApi = async (id, categoryData) => {
  const response = await API.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};