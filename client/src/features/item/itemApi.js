// src/features/item/itemApi.js
import API from "../../app/axios";

export const getItemsApi = async (categoryId) => {
  const url = categoryId ? `/items?categoryId=${categoryId}` : "/items";
  const response = await API.get(url);
  return response.data;
};

export const createItemApi = async (itemData) => {
  const response = await API.post("/items", itemData);
  return response.data;
};

export const updateItemApi = async (id, itemData) => {
  const response = await API.put(`/items/${id}`, itemData);
  return response.data;
};

export const deleteItemApi = async (id) => {
  const response = await API.delete(`/items/${id}`);
  return response.data;
};