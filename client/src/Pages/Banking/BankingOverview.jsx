// Pages/banking/BankingOverview.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign
} from 'lucide-react';
import { 
  fetchAllTransactions,
  fetchTransactionSummary,
  selectAllTransactions,
  selectTransactionSummary,
  selectTransactionLoading
} from '../../features/transaction/transactionSlice';
import StatCard from '../../components/common/StatCard';
import showToast from '../../utils/toast';

export default function BankingOverview() {
  const dispatch = useDispatch();
  const summary = useSelector(selectTransactionSummary);
  const loading = useSelector(selectTransactionLoading);
  const allTransactions = useSelector(selectAllTransactions);
  const { user } = useSelector((state) => state.auth);
  
  const [period, setPeriod] = useState('month');
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [stats, setStats] = useState({
    income: {
      handCash: 0,
      bank: 0,
      total: 0,
      count: 0
    },
    expense: {
      handCash: 0,
      bank: 0,
      total: 0,
      count: 0
    },
    netAmount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 👈 Track initial load

  // Load data when component mounts and when period changes
  useEffect(() => {
    loadData(false); // 👈 Pass false for initial load (no toast)
  }, [period]);

  // Recalculate stats whenever allTransactions changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      calculateStats();
      filterTransactionsByPeriod();
    }
  }, [allTransactions, period]);

  const loadData = async (showToastMessage = false) => { // 👈 Default false for initial load
    setIsLoading(true);
    try {
      await dispatch(fetchAllTransactions({ limit: 50 }));
      await dispatch(fetchTransactionSummary(period));
      
      // Only show toast if not initial load and showToastMessage is true
      if (!isInitialLoad && showToastMessage) {
        showToast.success('Data refreshed successfully');
      }
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (!isInitialLoad && showToastMessage) {
        showToast.error('Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData(true); // 👈 Pass true for manual refresh (show toast)
  };

  const getDateRangeForPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(period) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: monthStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          start: yearStart,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'all':
      default:
        return {
          start: new Date(0),
          end: new Date(8640000000000000)
        };
    }
  };

  const isTransactionInPeriod = (transactionDate) => {
    if (period === 'all') return true;
    
    const { start, end } = getDateRangeForPeriod();
    const transDate = new Date(transactionDate);
    return transDate >= start && transDate <= end;
  };

  const filterTransactionsByPeriod = () => {
    const filteredTransactions = allTransactions.filter(t => 
      isTransactionInPeriod(t.transactionDate)
    );

    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );

    const incomeList = sortedTransactions
      .filter(t => t.type === 'income')
      .slice(0, 5);
    
    const expenseList = sortedTransactions
      .filter(t => t.type === 'expense')
      .slice(0, 5);

    setRecentIncome(incomeList);
    setRecentExpense(expenseList);
  };

  const calculateStats = () => {
    const periodTransactions = allTransactions.filter(t => 
      isTransactionInPeriod(t.transactionDate)
    );

    const incomeTransactions = periodTransactions.filter(t => t.type === 'income');
    const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');

    const handCashIncome = incomeTransactions
      .filter(t => t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const bankIncome = incomeTransactions
      .filter(t => t.accountType === 'bank')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeCount = incomeTransactions.length;

    const handCashExpense = expenseTransactions
      .filter(t => t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const bankExpense = expenseTransactions
      .filter(t => t.accountType === 'bank')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseCount = expenseTransactions.length;

    const totalIncome = handCashIncome + bankIncome;
    const totalExpense = handCashExpense + bankExpense;

    setStats({
      income: {
        handCash: handCashIncome,
        bank: bankIncome,
        total: totalIncome,
        count: incomeCount
      },
      expense: {
        handCash: handCashExpense,
        bank: bankExpense,
        total: totalExpense,
        count: expenseCount
      },
      netAmount: totalIncome - totalExpense
    });
  };

  const handleExport = () => {
    showToast.info('Export feature coming soon...');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryLabel = (category, customCategory, type) => {
    const incomeCategories = {
      'customer-advance': 'Customer Advance',
      'full-payment': 'Full Payment',
      'fabric-sale': 'Fabric Sale',
      'project-payment': 'Project Payment',
      'other-income': customCategory || 'Other Income'
    };
    
    const expenseCategories = {
      'salary': 'Employee Salary',
      'electricity': 'Electricity Bill',
      'travel': 'Travel',
      'material-purchase': 'Material Purchase',
      'rent': 'Rent',
      'maintenance': 'Maintenance',
      'other-expense': customCategory || 'Other Expense'
    };

    if (type === 'income') {
      return incomeCategories[category] || category;
    } else {
      return expenseCategories[category] || category;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Banking Overview</h1>
            <p className="text-slate-600">Track your income, expenses, and net amount</p>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {new Date().toLocaleTimeString()} • Showing: {
                period === 'today' ? 'Today' :
                period === 'week' ? 'This Week' :
                period === 'month' ? 'This Month' :
                period === 'year' ? 'This Year' : 'All Time'
              }
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
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mt-4">
          {['today', 'week', 'month', 'year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Net Amount Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium opacity-90">Net Amount (Income - Expense)</h2>
            <p className="text-4xl font-black mb-2">
              ₹{stats.netAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <DollarSign size={48} className="opacity-90" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3">
            <p className="text-sm opacity-75 flex items-center gap-1">
              <TrendingUp size={16} /> Total Income
            </p>
            <p className="text-xl font-bold">+ ₹{stats.income.total.toLocaleString('en-IN')}</p>
            <p className="text-xs opacity-75">{stats.income.count} transactions</p>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3">
            <p className="text-sm opacity-75 flex items-center gap-1">
              <TrendingDown size={16} /> Total Expense
            </p>
            <p className="text-xl font-bold">- ₹{stats.expense.total.toLocaleString('en-IN')}</p>
            <p className="text-xs opacity-75">{stats.expense.count} transactions</p>
          </div>
        </div>
      </div>

      {/* Income and Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Income Summary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Total Income</h3>
              <p className="text-3xl font-black text-green-600">
                + ₹{stats.income.total.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={28} className="text-green-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                <Wallet size={12} /> Hand Cash
              </p>
              <p className="text-lg font-bold text-orange-700">
                + ₹{stats.income.handCash.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Landmark size={12} /> Bank
              </p>
              <p className="text-lg font-bold text-blue-700">
                + ₹{stats.income.bank.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/banking/income?account=hand-cash"
              className="flex-1 text-center py-2.5 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={16} />
              Hand Cash
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/banking/income?account=bank"
              className="flex-1 text-center py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <Landmark size={16} />
              Bank
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link
            to="/admin/banking/income"
            className="mt-3 block text-center py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-all"
          >
            View All Income ({stats.income.count} transactions) →
          </Link>
        </div>

        {/* Expense Summary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Total Expense</h3>
              <p className="text-3xl font-black text-red-600">
                - ₹{stats.expense.total.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={28} className="text-red-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                <Wallet size={12} /> Hand Cash
              </p>
              <p className="text-lg font-bold text-orange-700">
                - ₹{stats.expense.handCash.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Landmark size={12} /> Bank
              </p>
              <p className="text-lg font-bold text-blue-700">
                - ₹{stats.expense.bank.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/banking/expense?account=hand-cash"
              className="flex-1 text-center py-2.5 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={16} />
              Hand Cash
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/banking/expense?account=bank"
              className="flex-1 text-center py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <Landmark size={16} />
              Bank
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link
            to="/admin/banking/expense"
            className="mt-3 block text-center py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all"
          >
            View All Expenses ({stats.expense.count} transactions) →
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={`+ ₹${stats.income.total.toLocaleString('en-IN')}`}
          icon={<ArrowUpCircle className="text-green-600" size={24} />}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          linkTo="/admin/banking/income"
          linkText="View all income"
          subtext={`${stats.income.count} transactions`}
        />
        <StatCard
          title="Total Expense"
          value={`- ₹${stats.expense.total.toLocaleString('en-IN')}`}
          icon={<ArrowDownCircle className="text-red-600" size={24} />}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          linkTo="/admin/banking/expense"
          linkText="View all expenses"
          subtext={`${stats.expense.count} transactions`}
        />
        <StatCard
          title="Net Amount"
          value={`₹${stats.netAmount.toLocaleString('en-IN')}`}
          icon={<DollarSign className="text-purple-600" size={24} />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          subtext={`${stats.income.count + stats.expense.count} total transactions`}
        />
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Income */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpCircle size={20} className="text-green-600" />
              <h3 className="font-bold text-slate-800 text-lg">Recent Income</h3>
            </div>
            <Link 
              to="/admin/banking/income"
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
            >
              View all ({stats.income.count}) <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentIncome.length > 0 ? (
              recentIncome.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <TrendingUp size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {transaction.customerDetails?.name || 
                           getCategoryLabel(transaction.category, transaction.customCategory, 'income')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{formatDate(transaction.transactionDate)}</span>
                          <span>•</span>
                          <span>{formatTime(transaction.transactionDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        + ₹{transaction.amount.toLocaleString('en-IN')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        transaction.accountType === 'hand-cash' 
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <TrendingUp size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No income transactions for this period</p>
                <Link
                  to="/admin/banking/income"
                  className="text-green-600 text-sm hover:text-green-700 mt-2 inline-block"
                >
                  Add Income →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expense */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={20} className="text-red-600" />
              <h3 className="font-bold text-slate-800 text-lg">Recent Expense</h3>
            </div>
            <Link 
              to="/admin/banking/expense"
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              View all ({stats.expense.count}) <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentExpense.length > 0 ? (
              recentExpense.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <TrendingDown size={20} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {getCategoryLabel(transaction.category, transaction.customCategory, 'expense')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{formatDate(transaction.transactionDate)}</span>
                          <span>•</span>
                          <span>{formatTime(transaction.transactionDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        - ₹{transaction.amount.toLocaleString('en-IN')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        transaction.accountType === 'hand-cash' 
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <TrendingDown size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No expense transactions for this period</p>
                <Link
                  to="/admin/banking/expense"
                  className="text-red-600 text-sm hover:text-red-700 mt-2 inline-block"
                >
                  Add Expense →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/banking/income"
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <TrendingUp size={32} className="mb-3 opacity-90" />
              <h3 className="text-xl font-bold mb-1">Add Income</h3>
              <p className="text-green-100">Record new income transactions</p>
              <p className="text-sm text-green-200 mt-2">
                Current total: + ₹{stats.income.total.toLocaleString('en-IN')}
              </p>
            </div>
            <ArrowRight size={32} className="opacity-75" />
          </div>
        </Link>

        <Link
          to="/admin/banking/expense"
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <TrendingDown size={32} className="mb-3 opacity-90" />
              <h3 className="text-xl font-bold mb-1">Add Expense</h3>
              <p className="text-red-100">Record new expense transactions</p>
              <p className="text-sm text-red-200 mt-2">
                Current total: - ₹{stats.expense.total.toLocaleString('en-IN')}
              </p>
            </div>
            <ArrowRight size={32} className="opacity-75" />
          </div>
        </Link>
      </div>
    </div>
  );
}