// features/customer/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  searchCustomerApi, 
  createCustomerApi, 
  getAllCustomersApi,
  getCustomerByIdApi,
  updateCustomerApi,
  deleteCustomerApi
} from "./customerApi";

// 🔍 Search Customer by Phone
export const searchCustomerByPhone = createAsyncThunk(
  "customer/search",
  async (phone, { rejectWithValue }) => {
    try {
      return await searchCustomerApi(phone);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Search failed" });
    }
  }
);

// 🆕 Create New Customer
export const createNewCustomer = createAsyncThunk(
  "customer/create",
  async (customerData, { rejectWithValue }) => {
    try {
      return await createCustomerApi(customerData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Creation failed" });
    }
  }
);

// 📋 Fetch All Customers
export const fetchAllCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllCustomersApi();
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch customers" });
    }
  }
);

// 👤 Fetch Customer by ID
export const fetchCustomerById = createAsyncThunk(
  "customer/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCustomerByIdApi(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch customer" });
    }
  }
);

// ✏️ Update Customer
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      return await updateCustomerApi(id, customerData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update customer" });
    }
  }
);

// ❌ Delete Customer
export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteCustomerApi(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete customer" });
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    currentCustomer: null,
    customers: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearCustomerState: (state) => {
      state.currentCustomer = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Actions
      .addCase(searchCustomerByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCustomer = null;
      })
      .addCase(searchCustomerByPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(searchCustomerByPhone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Search failed";
        state.currentCustomer = null;
      })
      
      // Create Actions
      .addCase(createNewCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentCustomer = action.payload;
        state.customers = [action.payload, ...state.customers];
        state.error = null;
      })
      .addCase(createNewCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Creation failed";
      })

      // Fetch All Customers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
        state.error = null;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch customers";
      })

      // Fetch Customer By ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch customer";
        state.currentCustomer = null;
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        // Update in customers list
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update customer";
      })

      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = null;
        // Remove from customers list
        state.customers = state.customers.filter(c => c._id !== action.meta.arg);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete customer";
      });
  },
});

export const { clearCustomerState } = customerSlice.actions;
export default customerSlice.reducer;