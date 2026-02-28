// features/transaction/transactionApi.js
import API from "../../app/axios";

// Get all transactions with filters
export const getTransactions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });

  const response = await API.get(`/transactions?${queryParams}`);
  return response.data;
};

// Create new transaction
export const createTransaction = async (transactionData) => {
  const response = await API.post('/transactions', transactionData);
  return response.data;
};

// Delete transaction (Admin only)
export const deleteTransaction = async (id) => {
  const response = await API.delete(`/transactions/${id}`);
  return response.data;
};

// Get transaction summary
export const getTransactionSummary = async (period = 'month') => {
  const response = await API.get(`/transactions/summary?period=${period}`);
  return response.data;
};