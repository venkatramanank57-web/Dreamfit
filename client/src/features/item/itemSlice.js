// src/features/item/itemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as itemApi from "./itemApi";

// ===== ASYNC THUNKS =====
export const fetchItems = createAsyncThunk(
  "item/fetch",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await itemApi.getItemsApi(categoryId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch items");
    }
  }
);

export const createItem = createAsyncThunk(
  "item/create",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await itemApi.createItemApi(itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create item");
    }
  }
);

export const updateItem = createAsyncThunk(
  "item/update",
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await itemApi.updateItemApi(id, itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update item");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "item/delete",
  async (id, { rejectWithValue }) => {
    try {
      await itemApi.deleteItemApi(id);
      return id;
    } catch (error) {
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
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create item
      .addCase(createItem.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export const { clearItemError } = itemSlice.actions;
export default itemSlice.reducer;