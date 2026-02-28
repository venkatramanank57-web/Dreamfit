// components/Banking/AddExpenseModal.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  IndianRupee,
  Calendar,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  Zap,
  Car,
  ShoppingBag,
  Home,
  Wrench,  // ✅ Changed from Tool to Wrench
  Briefcase,
  Plus
} from 'lucide-react';
import { createNewTransaction } from '../../features/transaction/transactionSlice';
import showToast from '../../utils/toast';

const EXPENSE_CATEGORIES = [
  { value: 'salary', label: 'Employee Salary', icon: <Briefcase size={24} />, color: 'blue' },
  { value: 'electricity', label: 'Electricity Bill', icon: <Zap size={24} />, color: 'yellow' },
  { value: 'travel', label: 'Travel', icon: <Car size={24} />, color: 'green' },
  { value: 'material-purchase', label: 'Material Purchase', icon: <ShoppingBag size={24} />, color: 'purple' },
  { value: 'rent', label: 'Rent', icon: <Home size={24} />, color: 'indigo' },
  { value: 'maintenance', label: 'Maintenance', icon: <Wrench size={24} />, color: 'orange' }, // ✅ Fixed here
  { value: 'other-expense', label: 'Other Expense', icon: <Plus size={24} />, color: 'gray' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵', accountType: 'hand-cash', color: 'orange' },
  { value: 'upi', label: 'UPI', icon: '📱', accountType: 'bank', color: 'purple' },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: '🏦', accountType: 'bank', color: 'blue' },
  { value: 'card', label: 'Card', icon: '💳', accountType: 'bank', color: 'green' }
];

export default function AddExpenseModal({ onClose, accountType = null }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.transaction);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    customCategory: '',
    amount: '',
    paymentMethod: accountType === 'hand-cash' ? 'cash' : 'upi',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    referenceNumber: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      showToast.error('Please select expense category');
      return;
    }

    if (formData.category === 'other-expense' && !formData.customCategory) {
      showToast.error('Please specify the expense category');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: formData.category,
      customCategory: formData.category === 'other-expense' ? formData.customCategory : undefined
    };

    dispatch(createNewTransaction(transactionData))
      .unwrap()
      .then(() => {
        onClose();
      })
      .catch(() => {});
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'blue',
      yellow: 'yellow',
      green: 'green',
      purple: 'purple',
      indigo: 'indigo',
      orange: 'orange',
      gray: 'gray'
    };
    return colors[color] || 'blue';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Add Expense</h2>
              <p className="text-sm text-white/80 mt-1">Record money spent</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Select Expense Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const color = getCategoryColor(cat.color);
                  return (
                    <button
                      type="button"
                      key={cat.value}
                      onClick={() => {
                        setFormData({ ...formData, category: cat.value });
                        setStep(2);
                      }}
                      className={`p-4 rounded-xl border-2 border-slate-200 hover:border-${color}-500 hover:bg-${color}-50 transition-all text-left`}
                    >
                      <div className={`text-${color}-600 mb-2`}>
                        {cat.icon}
                      </div>
                      <span className="font-medium text-slate-700">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {formData.category === 'other-expense' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="Enter expense category name (e.g., Marketing, Stationery)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Amount & Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800">Enter Amount & Payment Method</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-2xl font-bold"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === method.value
                          ? `border-${method.color}-500 bg-${method.color}-50`
                          : 'border-slate-200 hover:border-red-200'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                      <span className={`text-xs block mt-1 ${
                        method.accountType === 'hand-cash' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {method.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Type Info */}
              <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                {formData.paymentMethod === 'cash' ? (
                  <Wallet size={18} className="text-orange-600" />
                ) : (
                  <Landmark size={18} className="text-blue-600" />
                )}
                <span className="text-sm text-slate-600">
                  This expense will be deducted from:{' '}
                  <span className="font-bold text-blue-600">
                    {formData.paymentMethod === 'cash' ? 'Hand Cash' : 'Bank Account'}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.amount}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800">Additional Details</h3>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Reference Number (for non-cash) */}
              {formData.paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reference Number</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="UPI ID / Transaction ID / Card Number"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description / Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Add any additional details about this expense..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="font-medium text-red-800 mb-2">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-700">Category:</span>
                    <span className="font-medium">
                      {EXPENSE_CATEGORIES.find(c => c.value === formData.category)?.label || formData.customCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Amount:</span>
                    <span className="font-bold text-red-600">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Will be deducted from:</span>
                    <span className={`font-medium ${
                      formData.paymentMethod === 'cash' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {formData.paymentMethod === 'cash' ? 'Hand Cash' : 'Bank Account'}
                    </span>
                  </div>
                  {formData.description && (
                    <div className="flex justify-between">
                      <span className="text-red-700">Note:</span>
                      <span className="text-slate-600 truncate max-w-[200px]">{formData.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                Back
              </button>
            )}
            {step === 3 ? (
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            ) : step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.amount}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}