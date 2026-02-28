// components/Banking/AddIncomeModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  IndianRupee,
  User,
  Calendar,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  Search,
  ChevronDown
} from 'lucide-react';
import { createNewTransaction } from '../../features/transaction/transactionSlice';
import { fetchAllCustomers } from '../../features/customer/customerSlice';
import showToast from '../../utils/toast';

const INCOME_CATEGORIES = [
  { value: 'customer-advance', label: 'Customer Advance Payment', icon: '💰' },
  { value: 'full-payment', label: 'Full Payment', icon: '✅' },
  { value: 'fabric-sale', label: 'Fabric Sale', icon: '🧵' },
  { value: 'project-payment', label: 'Project Payment', icon: '📋' },
  { value: 'other-income', label: 'Other Income', icon: '📦' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵', accountType: 'hand-cash' },
  { value: 'upi', label: 'UPI', icon: '📱', accountType: 'bank' },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: '🏦', accountType: 'bank' },
  { value: 'card', label: 'Card', icon: '💳', accountType: 'bank' }
];

export default function AddIncomeModal({ onClose, accountType = null }) {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customer);
  const { loading } = useSelector((state) => state.transaction);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    customCategory: '',
    amount: '',
    paymentMethod: accountType === 'hand-cash' ? 'cash' : 'upi',
    customer: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    referenceNumber: ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      showToast.error('Please select income category');
      return;
    }

    if (formData.category === 'other-income' && !formData.customCategory) {
      showToast.error('Please specify the income category');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }

    if (formData.category === 'customer-advance' && !formData.customer) {
      showToast.error('Please select a customer for advance payment');
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: formData.category,
      customCategory: formData.category === 'other-income' ? formData.customCategory : undefined
    };

    dispatch(createNewTransaction(transactionData))
      .unwrap()
      .then(() => {
        onClose();
      })
      .catch(() => {});
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({ ...formData, customer: customer._id });
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const filteredCustomers = customers?.filter(c => 
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch) ||
    c._id?.includes(customerSearch)
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Add Income</h2>
              <p className="text-sm text-white/80 mt-1">Record money received</p>
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
            {[1, 2, 3, 4].map((s) => (
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
              <h3 className="font-bold text-slate-800">Select Income Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {INCOME_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.value });
                      setStep(2);
                    }}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
                  >
                    <span className="text-3xl mb-2 block">{cat.icon}</span>
                    <span className="font-medium text-slate-700">{cat.label}</span>
                  </button>
                ))}
              </div>

              {formData.category === 'other-income' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="Enter income category name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Selection (for advance/full payment) */}
          {step === 2 && (formData.category === 'customer-advance' || formData.category === 'full-payment') && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Select Customer</h3>
              
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search by name, phone or ID"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
                
                {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 transition-all border-b last:border-0"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                          <span>ID: {customer._id.slice(-6)}</span>
                          <span>📞 {customer.phone}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.customer}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2 Skip for other categories */}
          {step === 2 && formData.category !== 'customer-advance' && formData.category !== 'full-payment' && (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No customer needed for this income type</p>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
              >
                Continue to Amount
              </button>
            </div>
          )}

          {/* Step 3: Amount & Payment Method */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800">Enter Amount & Payment Method</h3>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-2xl font-bold"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-green-200'
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

              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!formData.amount}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
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
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
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
                  placeholder="Add any additional details..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-medium text-green-800 mb-2">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Category:</span>
                    <span className="font-medium">
                      {INCOME_CATEGORIES.find(c => c.value === formData.category)?.label || formData.customCategory}
                    </span>
                  </div>
                  {selectedCustomer && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Customer:</span>
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-bold text-green-600">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Will be added to:</span>
                    <span className={`font-medium ${
                      formData.paymentMethod === 'cash' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {formData.paymentMethod === 'cash' ? 'Hand Cash' : 'Bank Account'}
                    </span>
                  </div>
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
            {step === 4 ? (
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding...' : 'Add Income'}
              </button>
            ) : step !== 3 && formData.category !== 'customer-advance' && formData.category !== 'full-payment' ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
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