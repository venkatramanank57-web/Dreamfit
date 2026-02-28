// utils/exportToExcel.js
import * as XLSX from 'xlsx';
import showToast from './toast';

export const exportToExcel = (data, filename, type = 'transactions') => {
  try {
    if (!data || data.length === 0) {
      showToast.warning('No data to export');
      return;
    }

    // Format data based on type
    let formattedData;
    
    if (type === 'income') {
      formattedData = data.map(t => ({
        'Date': new Date(t.transactionDate).toLocaleDateString('en-IN'),
        'Time': new Date(t.transactionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        'Category': getCategoryLabel(t.category, t.customCategory, 'income'),
        'Customer Name': t.customerDetails?.name || '-',
        'Customer Phone': t.customerDetails?.phone || '-',
        'Payment Method': getPaymentMethodLabel(t.paymentMethod),
        'Account': t.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank',
        'Amount (₹)': t.amount,
        'Reference No': t.referenceNumber || '-',
        'Description': t.description || '-'
      }));
    } else if (type === 'expense') {
      formattedData = data.map(t => ({
        'Date': new Date(t.transactionDate).toLocaleDateString('en-IN'),
        'Time': new Date(t.transactionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        'Category': getCategoryLabel(t.category, t.customCategory, 'expense'),
        'Description': t.description || '-',
        'Payment Method': getPaymentMethodLabel(t.paymentMethod),
        'Account': t.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank',
        'Amount (₹)': t.amount,
        'Reference No': t.referenceNumber || '-'
      }));
    } else {
      // For overview - both income and expense
      formattedData = data.map(t => ({
        'Date': new Date(t.transactionDate).toLocaleDateString('en-IN'),
        'Time': new Date(t.transactionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        'Type': t.type === 'income' ? 'Income' : 'Expense',
        'Category': getCategoryLabel(t.category, t.customCategory, t.type),
        'Customer/Description': t.customerDetails?.name || t.description || '-',
        'Payment Method': getPaymentMethodLabel(t.paymentMethod),
        'Account': t.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank',
        'Amount (₹)': t.type === 'income' ? t.amount : -t.amount,
        'Reference No': t.referenceNumber || '-'
      }));
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    
    // Set column widths
    const colWidths = [];
    if (formattedData.length > 0) {
      const columns = Object.keys(formattedData[0]);
      colWidths.push(columns.map(col => ({ wch: Math.max(col.length, 15) })));
    }
    ws['!cols'] = colWidths[0];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, finalFilename);
    
    showToast.success(`Exported to ${finalFilename} successfully!`);
  } catch (error) {
    console.error('Export failed:', error);
    showToast.error('Failed to export data');
  }
};

// Helper functions (duplicate from your components)
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