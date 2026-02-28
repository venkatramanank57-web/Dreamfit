// controllers/transaction.controller.js
import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';

// Define allowed regular categories (without 'other' options)
const INCOME_CATEGORIES = [
  'customer-advance', 
  'full-payment', 
  'fabric-sale', 
  'project-payment'
];

const EXPENSE_CATEGORIES = [
  'salary', 
  'electricity', 
  'travel', 
  'material-purchase', 
  'rent', 
  'maintenance'
];

// @desc    Create a new transaction (income/expense)
// @route   POST /api/transactions
// @access  Private (Admin, Store Keeper)
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      customCategory,
      amount,
      paymentMethod,
      customer,
      description,
      transactionDate,
      referenceNumber
    } = req.body;

    console.log('📥 Creating transaction:', { type, category, customCategory, amount, paymentMethod });

    // Validation
    if (!type || !category || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Handle "other" categories
    let isOtherCategory = false;
    let finalCategory = category;
    let finalCustomCategory = null;

    // Income category validation
    if (type === 'income') {
      if (category === 'other-income') {
        isOtherCategory = true;
        finalCategory = 'other-income';
        finalCustomCategory = customCategory;
        
        if (!customCategory) {
          return res.status(400).json({
            success: false,
            message: 'Please specify the income category'
          });
        }
      } else if (!INCOME_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid income category'
        });
      }
    }

    // Expense category validation
    if (type === 'expense') {
      if (category === 'other-expense') {
        isOtherCategory = true;
        finalCategory = 'other-expense';
        finalCustomCategory = customCategory;
        
        if (!customCategory) {
          return res.status(400).json({
            success: false,
            message: 'Please specify the expense category'
          });
        }
      } else if (!EXPENSE_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expense category'
        });
      }
    }

    // Set account type based on payment method
    const accountType = paymentMethod === 'cash' ? 'hand-cash' : 'bank';

    // Get customer details if customer ID is provided
    let customerDetails = null;
    if (customer) {
      const customerData = await Customer.findById(customer).select('firstName lastName phone customerId');
      if (customerData) {
        customerDetails = {
          name: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Unknown',
          phone: customerData.phone,
          id: customerData.customerId || customerData._id
        };
      }
    }

    // Create transaction data object
    const transactionData = {
      type,
      category: finalCategory,
      amount: Number(amount),
      paymentMethod,
      accountType,
      description: description || '',
      transactionDate: transactionDate || Date.now(),
      referenceNumber: referenceNumber || '',
      createdBy: req.user._id,
      status: 'completed'
    };

    // Add optional fields
    if (isOtherCategory) {
      transactionData.isOtherCategory = true;
      transactionData.customCategory = finalCustomCategory;
    }

    if (customer) {
      transactionData.customer = customer;
      transactionData.customerDetails = customerDetails;
    }

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Populate references
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('customer', 'firstName lastName phone')
      .populate('createdBy', 'name');

    console.log('✅ Transaction created successfully:', transaction._id);

    res.status(201).json({
      success: true,
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully`,
      data: populatedTransaction
    });

  } catch (error) {
    console.error('❌ Transaction creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
};

// @desc    Get all transactions with filters
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const {
      type,
      accountType,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'transactionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { status: 'completed' };

    if (type) filter.type = type;
    if (accountType) filter.accountType = accountType;
    if (category) filter.category = category;

    // Date range filter
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.transactionDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = end;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('customer', 'firstName lastName phone')
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(filter);

    // Calculate totals
    const totals = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          handCashIncome: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$accountType', 'hand-cash'] }, { $eq: ['$type', 'income'] }] },
                '$amount',
                0
              ]
            }
          },
          handCashExpense: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$accountType', 'hand-cash'] }, { $eq: ['$type', 'expense'] }] },
                '$amount',
                0
              ]
            }
          },
          bankIncome: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$accountType', 'bank'] }, { $eq: ['$type', 'income'] }] },
                '$amount',
                0
              ]
            }
          },
          bankExpense: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$accountType', 'bank'] }, { $eq: ['$type', 'expense'] }] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    const summary = totals[0] || {
      totalIncome: 0,
      totalExpense: 0,
      handCashIncome: 0,
      handCashExpense: 0,
      bankIncome: 0,
      bankExpense: 0
    };

    // Calculate balances
    const handCashBalance = summary.handCashIncome - summary.handCashExpense;
    const bankBalance = summary.bankIncome - summary.bankExpense;

    res.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalIncome: summary.totalIncome,
          totalExpense: summary.totalExpense,
          netBalance: summary.totalIncome - summary.totalExpense,
          handCash: {
            income: summary.handCashIncome,
            expense: summary.handCashExpense,
            balance: handCashBalance
          },
          bank: {
            income: summary.bankIncome,
            expense: summary.bankExpense,
            balance: bankBalance
          },
          totalBalance: handCashBalance + bankBalance
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// @desc    Get transaction summary for dashboard
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      startDate = new Date(startDate.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    const summary = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            accountType: '$accountType'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response
    const result = {
      handCash: { income: 0, expense: 0, count: 0 },
      bank: { income: 0, expense: 0, count: 0 },
      recentTransactions: await Transaction.find({
        transactionDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      })
        .populate('customer', 'firstName lastName phone')
        .sort({ transactionDate: -1 })
        .limit(10)
    };

    summary.forEach(item => {
      const account = item._id.accountType === 'hand-cash' ? 'handCash' : 'bank';
      const type = item._id.type;
      result[account][type] = item.total;
      result[account].count += item.count;
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private (Admin only)
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Only admin can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete transactions'
      });
    }

    await transaction.deleteOne();

    console.log('✅ Transaction deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
};