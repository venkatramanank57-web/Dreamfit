// src/features/item/itemApi.js
import API from "../../app/axios";

export const getItemsApi = async (categoryId) => {
  console.log(`📡 API: Fetching items${categoryId ? ` for category: ${categoryId}` : ''}`);
  const url = categoryId ? `/items?categoryId=${categoryId}` : "/items";
  
  try {
    const response = await API.get(url);
    console.log(`✅ API: Fetched ${response.data?.length || 0} items`);
    return response.data;
  } catch (error) {
    console.error("❌ API: Fetch items failed:", error.response?.data || error.message);
    throw error;
  }
};

export const createItemApi = async (itemData) => {
  console.log("\n📤 ========== API CREATE ITEM ==========");
  console.log("📦 Received itemData:", itemData);
  console.log("📦 Name:", itemData.name);
  console.log("📦 Category ID:", itemData.categoryId);
  console.log("💰 Price Range:", itemData.priceRange);
  if (itemData.priceRange) {
    console.log("   - Min Price:", itemData.priceRange.min);
    console.log("   - Max Price:", itemData.priceRange.max);
  }
  console.log("====================================\n");
  
  try {
    const response = await API.post("/items", itemData);
    console.log("✅ API: Item created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API: Create item failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateItemApi = async (id, itemData) => {
  console.log(`\n📤 ========== API UPDATE ITEM ${id} ==========`);
  console.log("📦 Update data:", itemData);
  console.log("📦 Name:", itemData.name);
  if (itemData.priceRange) {
    console.log("💰 Price Range:");
    console.log("   - Min Price:", itemData.priceRange.min);
    console.log("   - Max Price:", itemData.priceRange.max);
  }
  console.log("========================================\n");
  
  try {
    const response = await API.put(`/items/${id}`, itemData);
    console.log("✅ API: Item updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API: Update item failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteItemApi = async (id) => {
  console.log(`🗑️ API: Deleting item ${id}`);
  
  try {
    const response = await API.delete(`/items/${id}`);
    console.log("✅ API: Item deleted successfully");
    return response.data;
  } catch (error) {
    console.error("❌ API: Delete item failed:", error.response?.data || error.message);
    throw error;
  }
};