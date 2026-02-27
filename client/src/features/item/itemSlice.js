// src/features/item/itemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as itemApi from "./itemApi";

// ===== ASYNC THUNKS =====
export const fetchItems = createAsyncThunk(
  "item/fetch",
  async (categoryId, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching items${categoryId ? ` for category: ${categoryId}` : ''}`);
      const response = await itemApi.getItemsApi(categoryId);
      return response;
    } catch (error) {
      console.error("❌ Fetch items error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch items");
    }
  }
);

export const createItem = createAsyncThunk(
  "item/create",
  async (itemData, { rejectWithValue }) => {
    try {
      console.log("📝 Creating item with data:", itemData);
      
      // ✅ Validate price range before sending
      if (itemData.priceRange) {
        if (itemData.priceRange.min < 0 || itemData.priceRange.max < 0) {
          return rejectWithValue("Price cannot be negative");
        }
        if (itemData.priceRange.min > itemData.priceRange.max) {
          return rejectWithValue("Minimum price cannot be greater than maximum price");
        }
      }
      
      const response = await itemApi.createItemApi(itemData);
      console.log("✅ Item created:", response);
      return response;
    } catch (error) {
      console.error("❌ Create item error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to create item");
    }
  }
);

export const updateItem = createAsyncThunk(
  "item/update",
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      console.log(`📝 Updating item ${id}:`, itemData);
      
      // ✅ Validate price range before sending
      if (itemData.priceRange) {
        if (itemData.priceRange.min < 0 || itemData.priceRange.max < 0) {
          return rejectWithValue("Price cannot be negative");
        }
        if (itemData.priceRange.min > itemData.priceRange.max) {
          return rejectWithValue("Minimum price cannot be greater than maximum price");
        }
      }
      
      const response = await itemApi.updateItemApi(id, itemData);
      console.log("✅ Item updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Update item error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update item");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "item/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Deleting item: ${id}`);
      await itemApi.deleteItemApi(id);
      return id;
    } catch (error) {
      console.error("❌ Delete item error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete item");
    }
  }
);

const itemSlice = createSlice({
  name: "item",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearItemError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🟡 Fetch items pending");
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        console.log(`✅ Fetch items fulfilled: ${action.payload?.length || 0} items`);
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Fetch items rejected:", action.payload);
      })
      
      // Create item
      .addCase(createItem.pending, (state) => {
        console.log("🟡 Create item pending");
      })
      .addCase(createItem.fulfilled, (state, action) => {
        console.log("✅ Create item fulfilled:", action.payload);
        state.items = [action.payload, ...state.items];
      })
      .addCase(createItem.rejected, (state, action) => {
        console.error("❌ Create item rejected:", action.payload);
        state.error = action.payload;
      })
      
      // Update item
      .addCase(updateItem.pending, (state) => {
        console.log("🟡 Update item pending");
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        console.log("✅ Update item fulfilled:", action.payload);
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
          console.log(`✅ Updated item at index ${index}`);
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        console.error("❌ Update item rejected:", action.payload);
        state.error = action.payload;
      })
      
      // Delete item
      .addCase(deleteItem.pending, (state) => {
        console.log("🟡 Delete item pending");
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        console.log("✅ Delete item fulfilled:", action.payload);
        state.items = state.items.filter(i => i._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        console.error("❌ Delete item rejected:", action.payload);
        state.error = action.payload;
      });
  },
});

export const { clearItemError } = itemSlice.actions;
export default itemSlice.reducer;