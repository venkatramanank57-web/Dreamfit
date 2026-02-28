// features/transaction/transactionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showToast from '../../utils/toast';
import * as transactionApi from './transactionApi';

const initialState = {
  // Separate states for different views
  allTransactions: [],        // For overview (both income & expense)
  incomeTransactions: [],     // For income page
  expenseTransactions: [],    // For expense page
  currentTransaction: null,
  
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    handCash: {
      income: 0,
      expense: 0,
      balance: 0
    },
    bank: {
      income: 0,
      expense: 0,
      balance: 0
    },
    totalBalance: 0
  },
  
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  loading: false,
  error: null,
  
  filters: {
    type: '',
    accountType: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
    sortBy: 'transactionDate',
    sortOrder: 'desc'
  }
};

// ✅ Fetch ALL transactions (for overview - no type filter)
export const fetchAllTransactions = createAsyncThunk(
  'transaction/fetchAllTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactions({ 
        ...params,
        limit: params.limit || 20 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// ✅ Fetch ONLY income transactions
export const fetchIncomeTransactions = createAsyncThunk(
  'transaction/fetchIncomeTransactions',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { transaction } = getState();
      const currentFilters = { 
        ...transaction.filters, 
        ...filters, 
        type: 'income' 
      };
      const response = await transactionApi.getTransactions(currentFilters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch income');
    }
  }
);

// ✅ Fetch ONLY expense transactions
export const fetchExpenseTransactions = createAsyncThunk(
  'transaction/fetchExpenseTransactions',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { transaction } = getState();
      const currentFilters = { 
        ...transaction.filters, 
        ...filters, 
        type: 'expense' 
      };
      const response = await transactionApi.getTransactions(currentFilters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
    }
  }
);

// ✅ Fetch transaction summary
export const fetchTransactionSummary = createAsyncThunk(
  'transaction/fetchTransactionSummary',
  async (period = 'month', { rejectWithValue }) => {
    try {
      const response = await transactionApi.getTransactionSummary(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ Create new transaction
export const createNewTransaction = createAsyncThunk(
  'transaction/createNewTransaction',
  async (transactionData, { rejectWithValue, dispatch }) => {
    try {
      const response = await transactionApi.createTransaction(transactionData);
      showToast.success(response.message);
      
      // Refresh all relevant data
      dispatch(fetchAllTransactions({ limit: 20 }));
      dispatch(fetchTransactionSummary());
      
      // Also refresh specific type if needed
      if (transactionData.type === 'income') {
        dispatch(fetchIncomeTransactions());
      } else if (transactionData.type === 'expense') {
        dispatch(fetchExpenseTransactions());
      }
      
      return response.data;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create transaction');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ✅ Delete transaction
export const deleteExistingTransaction = createAsyncThunk(
  'transaction/deleteExistingTransaction',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await transactionApi.deleteTransaction(id);
      showToast.success(response.message);
      
      // Get current type from state or fetch both
      const { transaction } = getState();
      
      // Refresh all data
      dispatch(fetchAllTransactions({ limit: 20 }));
      dispatch(fetchTransactionSummary());
      
      // Also refresh specific lists
      dispatch(fetchIncomeTransactions());
      dispatch(fetchExpenseTransactions());
      
      return id;
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete transaction');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearTransactions: (state) => {
      state.allTransactions = [];
      state.incomeTransactions = [];
      state.expenseTransactions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.allTransactions = action.payload.transactions || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Income Transactions
      .addCase(fetchIncomeTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomeTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeTransactions = action.payload.transactions || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchIncomeTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Expense Transactions
      .addCase(fetchExpenseTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseTransactions = action.payload.transactions || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchExpenseTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Transaction
      .addCase(createNewTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createNewTransaction.rejected, (state) => {
        state.loading = false;
      })
      
      // Delete Transaction
      .addCase(deleteExistingTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteExistingTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteExistingTransaction.rejected, (state) => {
        state.loading = false;
      })
      
      // Fetch Summary
      .addCase(fetchTransactionSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = { ...state.summary, ...action.payload };
      })
      .addCase(fetchTransactionSummary.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setFilters, resetFilters, clearTransactions } = transactionSlice.actions;

// Selectors
export const selectAllTransactions = (state) => state.transaction.allTransactions;
export const selectIncomeTransactions = (state) => state.transaction.incomeTransactions;
export const selectExpenseTransactions = (state) => state.transaction.expenseTransactions;
export const selectTransactionSummary = (state) => state.transaction.summary;
export const selectTransactionFilters = (state) => state.transaction.filters;
export const selectTransactionPagination = (state) => state.transaction.pagination;
export const selectTransactionLoading = (state) => state.transaction.loading;

export default transactionSlice.reducer;