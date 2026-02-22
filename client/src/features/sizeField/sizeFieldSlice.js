import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as sizeFieldApi from "./sizeFieldApi";

export const fetchAllSizeFields = createAsyncThunk(
  "sizeField/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📡 Fetching size fields...");
      const response = await sizeFieldApi.getAllSizeFieldsApi();
      console.log("✅ API Response:", response);
      return response;
    } catch (error) {
      console.error("❌ Fetch error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch size fields");
    }
  }
);

const sizeFieldSlice = createSlice({
  name: "sizeField",
  initialState: {
    fields: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSizeFields.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("🔄 Pending...");
      })
      .addCase(fetchAllSizeFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload;
        console.log("✅ Fulfilled! Fields count:", action.payload?.length);
      })
      .addCase(fetchAllSizeFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Rejected:", action.payload);
      });
  },
});

export default sizeFieldSlice.reducer;