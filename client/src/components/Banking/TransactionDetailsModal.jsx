// components/Banking/TransactionDetailsModal.jsx
import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  CreditCard,
  Landmark,
  Wallet,
  FileText,
  Hash,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Smartphone // 👈 Add this import
} from 'lucide-react';
import showToast from '../../utils/toast';

const TransactionDetailsModal = ({ transaction, onClose, type }) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income' || type === 'income';
  const isExpense = transaction.type === 'expense' || type === 'expense';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryLabel = (category, customCategory) => {
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

    if (isIncome) {
      return incomeCategories[category] || category;
    } else {
      return expenseCategories[category] || category;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'cash':
        return <Wallet size={18} className="text-green-600" />;
      case 'upi':
        return <Smartphone size={18} className="text-blue-600" />;
      case 'bank-transfer':
        return <Landmark size={18} className="text-purple-600" />;
      case 'card':
        return <CreditCard size={18} className="text-indigo-600" />;
      case 'cheque':
        return <FileText size={18} className="text-orange-600" />;
      default:
        return <CreditCard size={18} className="text-slate-600" />;
    }
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

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const DetailRow = ({ icon: Icon, label, value, copyable = false }) => (
    <div className="flex items-start py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg mr-3">
        <Icon size={16} className="text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
          {copyable && value && (
            <button
              onClick={() => handleCopy(value, label)}
              className="p-1 hover:bg-slate-100 rounded transition-all"
              title={`Copy ${label}`}
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-slate-400" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isIncome ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isIncome ? (
                <TrendingUp size={24} className="text-green-600" />
              ) : (
                <TrendingDown size={24} className="text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isIncome ? 'Income' : 'Expense'} Details
              </h2>
              <p className="text-sm text-slate-500">Transaction ID: {transaction._id?.slice(-8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Amount Card */}
        <div className={`p-6 ${isIncome ? 'bg-green-50' : 'bg-red-50'} border-b border-slate-200`}>
          <p className="text-sm text-slate-600 mb-1">Amount</p>
          <p className={`text-4xl font-black ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Transaction Information</h3>
          
          <div className="space-y-1">
            <DetailRow 
              icon={Calendar}
              label="Date"
              value={formatDate(transaction.transactionDate)}
            />
            
            <DetailRow 
              icon={Clock}
              label="Time"
              value={formatTime(transaction.transactionDate)}
            />

            <DetailRow 
              icon={Tag}
              label="Category"
              value={getCategoryLabel(transaction.category, transaction.customCategory)}
            />

            {transaction.customerDetails && (
              <>
                <DetailRow 
                  icon={User}
                  label="Customer Name"
                  value={transaction.customerDetails.name}
                  copyable
                />
                <DetailRow 
                  icon={Smartphone}
                  label="Phone Number"
                  value={transaction.customerDetails.phone}
                  copyable
                />
              </>
            )}

            <DetailRow 
              icon={CreditCard}
              label="Payment Method"
              value={getPaymentMethodLabel(transaction.paymentMethod)}
            />

            <DetailRow 
              icon={transaction.accountType === 'hand-cash' ? Wallet : Landmark}
              label="Account"
              value={transaction.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank Account'}
            />

            {transaction.referenceNumber && (
              <DetailRow 
                icon={Hash}
                label="Reference Number"
                value={transaction.referenceNumber}
                copyable
              />
            )}

            {transaction.description && (
              <DetailRow 
                icon={FileText}
                label="Description"
                value={transaction.description}
              />
            )}

            <DetailRow 
              icon={Clock}
              label="Created At"
              value={new Date(transaction.createdAt).toLocaleString('en-IN')}
            />

            <DetailRow 
              icon={RefreshCw}
              label="Last Updated"
              value={new Date(transaction.updatedAt).toLocaleString('en-IN')}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;