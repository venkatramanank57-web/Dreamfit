// Pages/banking/IncomePage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  IndianRupee,
  Wallet,
  Landmark,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import { 
  fetchIncomeTransactions,
  createNewTransaction,
  deleteExistingTransaction,
  setFilters,
  resetFilters,
  selectIncomeTransactions,
  selectTransactionSummary,
  selectTransactionPagination,
  selectTransactionLoading,
  selectTransactionFilters
} from '../../features/transaction/transactionSlice';
import AddIncomeModal from '../../components/Banking/AddIncomeModal';
import TransactionDetailsModal from '../../components/Banking/TransactionDetailsModal'; // 👈 Add this import
import showToast from '../../utils/toast';
import { exportToExcel } from '../../utils/exportToExcel';

export default function IncomePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const accountFilter = searchParams.get('account');
  
  const transactions = useSelector(selectIncomeTransactions);
  const summary = useSelector(selectTransactionSummary);
  const pagination = useSelector(selectTransactionPagination);
  const filters = useSelector(selectTransactionFilters);
  const loading = useSelector(selectTransactionLoading);
  const { user } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // 👈 Add this
  const [selectedTransaction, setSelectedTransaction] = useState(null); // 👈 Add this
  const [dateRange, setDateRange] = useState('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accountFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const canDelete = isAdmin;

  // Calculate totals based on income transactions
  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const handCashTotal = transactions
    .filter(t => t.accountType === 'hand-cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankTotal = transactions
    .filter(t => t.accountType === 'bank')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get filtered transactions based on active view
  const getFilteredTransactions = () => {
    if (activeView === 'hand-cash') {
      return transactions.filter(t => t.accountType === 'hand-cash');
    } else if (activeView === 'bank') {
      return transactions.filter(t => t.accountType === 'bank');
    }
    return transactions;
  };

  const displayedTransactions = getFilteredTransactions();

  useEffect(() => {
    if (accountFilter && accountFilter !== 'all') {
      dispatch(setFilters({ 
        type: 'income',
        accountType: accountFilter === 'hand-cash' ? 'hand-cash' : 'bank',
        page: 1
      }));
      setSelectedAccount(accountFilter);
      setActiveView(accountFilter);
    } else {
      dispatch(setFilters({ 
        type: 'income',
        page: 1 
      }));
    }
  }, [accountFilter, dispatch]);

  useEffect(() => {
    loadTransactions();
  }, [filters, dispatch]);

  const loadTransactions = async (showToastMessage = false) => {
    try {
      await dispatch(fetchIncomeTransactions(filters)).unwrap();
      if (!isInitialLoad && showToastMessage) {
        showToast.success('Data refreshed successfully');
      }
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      if (!isInitialLoad && showToastMessage) {
        showToast.error('Failed to load transactions');
      }
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    let startDate = '';
    let endDate = '';

    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (range === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      startDate = weekStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'year') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);
      startDate = yearStart.toISOString().split('T')[0];
      endDate = endOfDay.toISOString().split('T')[0];
    } else if (range === 'custom' && customDates.start && customDates.end) {
      startDate = customDates.start;
      endDate = customDates.end;
    }

    if (startDate && endDate) {
      dispatch(setFilters({ startDate, endDate, page: 1 }));
    }
  };

  const handleAccountFilter = (account) => {
    setSelectedAccount(account);
    setActiveView(account);
    
    if (account === 'all') {
      dispatch(setFilters({ accountType: '', page: 1 }));
    } else {
      dispatch(setFilters({ 
        accountType: account === 'hand-cash' ? 'hand-cash' : 'bank',
        page: 1 
      }));
    }
  };

  const handleCardClick = (accountType) => {
    setActiveView(accountType);
    setSelectedAccount(accountType);
    dispatch(setFilters({ 
      accountType: accountType === 'hand-cash' ? 'hand-cash' : accountType === 'bank' ? 'bank' : '',
      page: 1 
    }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic if needed
  };

  const handlePageChange = (newPage) => {
    dispatch(setFilters({ page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await dispatch(deleteExistingTransaction(id)).unwrap();
        showToast.success('Income deleted successfully');
      } catch (error) {
        showToast.error('Failed to delete income');
      }
    }
  };

  const handleRefresh = () => {
    loadTransactions(true);
  };

  const handleExport = () => {
    exportToExcel(displayedTransactions, 'income_transactions', 'income');
  };

  // 👈 Updated handleViewDetails function
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryLabel = (category, customCategory) => {
    const categories = {
      'customer-advance': 'Customer Advance',
      'full-payment': 'Full Payment',
      'fabric-sale': 'Fabric Sale',
      'project-payment': 'Project Payment',
      'other-income': customCategory || 'Other Income'
    };
    return categories[category] || category;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash': 'Cash',
      'upi': 'UPI',
      'bank-transfer': 'Bank Transfer',
      'card': 'Card',
      'cheque': 'Cheque'
    };
    return methods[method] || method;
  };

  // Calculate pagination display values
  const startEntry = pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Income Tracker</h1>
            <p className="text-slate-600">Manage and track all your income</p>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Income
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Income Card */}
        <div 
          onClick={() => handleCardClick('all')}
          className={`bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
            activeView === 'all' ? 'ring-2 ring-green-500 ring-offset-2' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Total Income</p>
              <p className="text-3xl font-black text-green-600">
                ₹{totalIncome.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Total transactions: {pagination.total || transactions.length}</p>
            <span className="text-xs font-medium text-green-600">
              {activeView === 'all' ? 'Currently Viewing' : 'Click to view all'}
            </span>
          </div>
        </div>

        {/* Hand Cash Income Card */}
        <div 
          onClick={() => handleCardClick('hand-cash')}
          className={`bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
            activeView === 'hand-cash' ? 'ring-2 ring-orange-500 ring-offset-2' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Hand Cash Income</p>
              <p className="text-3xl font-black text-orange-600">
                ₹{handCashTotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Transactions: {transactions.filter(t => t.accountType === 'hand-cash').length}
            </p>
            <span className="text-xs font-medium text-orange-600">
              {activeView === 'hand-cash' ? 'Currently Viewing' : 'Click to view'}
            </span>
          </div>
        </div>

        {/* Bank Income Card */}
        <div 
          onClick={() => handleCardClick('bank')}
          className={`bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-md ${
            activeView === 'bank' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Bank Income</p>
              <p className="text-3xl font-black text-blue-600">
                ₹{bankTotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Landmark size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Transactions: {transactions.filter(t => t.accountType === 'bank').length}
            </p>
            <span className="text-xs font-medium text-blue-600">
              {activeView === 'bank' ? 'Currently Viewing' : 'Click to view'}
            </span>
          </div>
        </div>
      </div>

      {/* Active View Indicator */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Currently showing:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          activeView === 'all' ? 'bg-green-100 text-green-700' :
          activeView === 'hand-cash' ? 'bg-orange-100 text-orange-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {activeView === 'all' ? 'All Income' : activeView === 'hand-cash' ? 'Hand Cash Income' : 'Bank Income'}
        </span>
        <span className="text-sm text-slate-500">
          ({displayedTransactions.length} of {pagination.total || 0} transactions)
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Account Type Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleAccountFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedAccount === 'all'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-600 hover:text-green-600'
              }`}
            >
              All Income
            </button>
            <button
              onClick={() => handleAccountFilter('hand-cash')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedAccount === 'hand-cash'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              <Wallet size={16} />
              Hand Cash
            </button>
            <button
              onClick={() => handleAccountFilter('bank')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedAccount === 'bank'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <Landmark size={16} />
              Bank
            </button>
          </div>

          {/* Date Range and Search */}
          <div className="flex gap-3">
            {/* Date Range Dropdown */}
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => {
                    setCustomDates({ ...customDates, start: e.target.value });
                    if (customDates.end) handleDateRangeChange('custom');
                  }}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => {
                    setCustomDates({ ...customDates, end: e.target.value });
                    if (customDates.start) handleDateRangeChange('custom');
                  }}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by customer..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => dispatch(setFilters({ category: e.target.value, page: 1 }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="customer-advance">Customer Advance</option>
                  <option value="full-payment">Full Payment</option>
                  <option value="fabric-sale">Fabric Sale</option>
                  <option value="project-payment">Project Payment</option>
                  <option value="other-income">Other Income</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Payment Method</label>
                <select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => dispatch(setFilters({ paymentMethod: e.target.value, page: 1 }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    dispatch(resetFilters());
                    setSelectedAccount('all');
                    setActiveView('all');
                    setDateRange('month');
                    setSearchQuery('');
                    setCustomDates({ start: '', end: '' });
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && transactions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center">
            <RefreshCw size={48} className="text-slate-300 animate-spin mb-3" />
            <p className="text-slate-500 font-medium">Loading transactions...</p>
          </div>
        </div>
      )}

      {/* Income Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{formatDate(transaction.transactionDate)}</div>
                        <div className="text-xs text-slate-500">{formatTime(transaction.transactionDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-800">
                        {getCategoryLabel(transaction.category, transaction.customCategory)}
                      </span>
                      {transaction.referenceNumber && (
                        <div className="text-xs text-slate-500">Ref: {transaction.referenceNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.customerDetails ? (
                        <div>
                          <div className="text-sm font-medium text-slate-800">{transaction.customerDetails.name}</div>
                          <div className="text-xs text-slate-500">{transaction.customerDetails.phone}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-800">
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.accountType === 'hand-cash'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-green-600">
                        + ₹{transaction.amount.toLocaleString('en-IN')}
                      </span>
                      {transaction.description && (
                        <div className="text-xs text-slate-500 truncate max-w-[150px]" title={transaction.description}>
                          {transaction.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {displayedTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <TrendingUp size={48} className="text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No income transactions found</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {activeView === 'all' 
                            ? 'Add your first income to get started'
                            : activeView === 'hand-cash'
                            ? 'No hand cash income transactions found'
                            : 'No bank income transactions found'}
                        </p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                        >
                          Add Income
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Showing {startEntry} to {endEntry} of {pagination.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Simple Pagination for single page */}
          {pagination.pages === 1 && pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 text-center">
                Showing {pagination.total} {pagination.total === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Income Modal */}
      {showAddModal && (
        <AddIncomeModal
          onClose={() => setShowAddModal(false)}
          accountType={selectedAccount !== 'all' ? selectedAccount : null}
          onSuccess={() => {
            loadTransactions();
            setShowAddModal(false);
          }}
        />
      )}

      {/* 👈 Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          type="income"
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}