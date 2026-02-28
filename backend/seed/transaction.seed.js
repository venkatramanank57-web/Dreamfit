// seed/transaction.seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Sample data
const incomeCategories = [
  'customer-advance',
  'full-payment',
  'fabric-sale',
  'project-payment'
];

const expenseCategories = [
  'salary',
  'electricity',
  'travel',
  'material-purchase',
  'rent',
  'maintenance'
];

const paymentMethods = ['cash', 'upi', 'bank-transfer', 'card'];

const descriptions = [
  'Monthly rent payment',
  'Customer advance for wedding suit',
  'Fabric purchase from vendor',
  'Electricity bill payment',
  'Full payment for blouse stitching',
  'Tailor salary for March',
  'Travel expenses for fabric shopping',
  'Project payment for school uniforms',
  'Maintenance of sewing machines',
  'Material purchase for new collection',
  'Customer advance for saree',
  'Card payment for designer wear',
  'UPI payment for fabric sale',
  'Bank transfer for bulk order',
  'Cash payment for alteration'
];

const customerNames = [
  'Rajesh Kumar',
  'Priya Sharma',
  'Amit Patel',
  'Deepa Venkat',
  'Suresh Reddy',
  'Kavitha Nair',
  'Manoj Singh',
  'Anjali Desai',
  'Vikram Mehta',
  'Lakshmi Krishnan'
];

// Generate random date within last 3 months
const getRandomDate = (daysBack = 90) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Generate random amount
const getRandomAmount = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get random customer ID (will be set after fetching from DB)
let customerIds = [];

// Seed function
const seedTransactions = async () => {
  try {
    await connectDB();

    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing transactions');

    // Get admin user (or first user)
    const adminUser = await User.findOne({ role: 'ADMIN' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create a user first.');
      process.exit(1);
    }

    // Get all customers
    const customers = await Customer.find().limit(10);
    if (customers.length === 0) {
      console.log('⚠️  No customers found. Creating transactions without customer reference.');
    } else {
      customerIds = customers.map(c => c._id);
      console.log(`📋 Found ${customers.length} customers`);
    }

    const transactions = [];

    // Create 20 INCOME transactions
    console.log('\n💰 Creating 20 INCOME transactions...');
    for (let i = 0; i < 20; i++) {
      const useCustomer = customerIds.length > 0 && Math.random() > 0.3; // 70% chance to have customer
      const customerId = useCustomer ? customerIds[Math.floor(Math.random() * customerIds.length)] : null;
      const customerName = useCustomer ? customerNames[Math.floor(Math.random() * customerNames.length)] : null;
      
      const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const amount = getRandomAmount(500, 50000);
      const date = getRandomDate(60); // Last 60 days
      
      // 20% chance to be "other" income
      const isOther = Math.random() > 0.8;
      
      const transaction = {
        type: 'income',
        category: isOther ? 'project-payment' : category,
        isOtherCategory: isOther,
        customCategory: isOther ? 'Custom Project Payment' : undefined,
        amount,
        paymentMethod,
        accountType: paymentMethod === 'cash' ? 'hand-cash' : 'bank',
        customer: customerId,
        customerDetails: customerId ? {
          name: customerName || `Customer ${i+1}`,
          phone: `98765${String(i+1).padStart(5, '0')}`,
          id: customerId
        } : null,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        transactionDate: date,
        referenceNumber: paymentMethod !== 'cash' ? `REF${String(i+1).padStart(6, '0')}` : undefined,
        createdBy: adminUser._id,
        status: 'completed'
      };
      
      transactions.push(transaction);
    }

    // Create 10 EXPENSE transactions
    console.log('💸 Creating 10 EXPENSE transactions...');
    for (let i = 0; i < 10; i++) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const amount = getRandomAmount(1000, 100000);
      const date = getRandomDate(45); // Last 45 days
      
      // 15% chance to be "other" expense
      const isOther = Math.random() > 0.85;
      
      const transaction = {
        type: 'expense',
        category: isOther ? 'maintenance' : category,
        isOtherCategory: isOther,
        customCategory: isOther ? 'Office Maintenance' : undefined,
        amount,
        paymentMethod,
        accountType: paymentMethod === 'cash' ? 'hand-cash' : 'bank',
        customer: null,
        customerDetails: null,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        transactionDate: date,
        referenceNumber: paymentMethod !== 'cash' ? `EXP${String(i+1).padStart(6, '0')}` : undefined,
        createdBy: adminUser._id,
        status: 'completed'
      };
      
      transactions.push(transaction);
    }

    // Insert all transactions
    const inserted = await Transaction.insertMany(transactions);
    console.log(`\n✅ Successfully added ${inserted.length} transactions:`);
    console.log(`   📈 Income: ${inserted.filter(t => t.type === 'income').length}`);
    console.log(`   📉 Expense: ${inserted.filter(t => t.type === 'expense').length}`);

    // Calculate totals
    const totalIncome = inserted
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = inserted
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const handCashIncome = inserted
      .filter(t => t.type === 'income' && t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + t.amount, 0);

    const bankIncome = inserted
      .filter(t => t.type === 'income' && t.accountType === 'bank')
      .reduce((sum, t) => sum + t.amount, 0);

    const handCashExpense = inserted
      .filter(t => t.type === 'expense' && t.accountType === 'hand-cash')
      .reduce((sum, t) => sum + t.amount, 0);

    const bankExpense = inserted
      .filter(t => t.type === 'expense' && t.accountType === 'bank')
      .reduce((sum, t) => sum + t.amount, 0);

    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`💰 Total Income: ₹${totalIncome.toLocaleString('en-IN')}`);
    console.log(`   💵 Hand Cash Income: ₹${handCashIncome.toLocaleString('en-IN')}`);
    console.log(`   🏦 Bank Income: ₹${bankIncome.toLocaleString('en-IN')}`);
    console.log('-'.repeat(50));
    console.log(`💸 Total Expense: ₹${totalExpense.toLocaleString('en-IN')}`);
    console.log(`   💵 Hand Cash Expense: ₹${handCashExpense.toLocaleString('en-IN')}`);
    console.log(`   🏦 Bank Expense: ₹${bankExpense.toLocaleString('en-IN')}`);
    console.log('-'.repeat(50));
    console.log(`📈 Net Balance: ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}`);
    console.log('='.repeat(50));

    // Sample transactions
    console.log('\n📋 Sample Transactions:');
    console.log('-'.repeat(80));
    inserted.slice(0, 5).forEach((t, i) => {
      const date = new Date(t.transactionDate).toLocaleDateString('en-IN');
      const type = t.type === 'income' ? '📈' : '📉';
      const account = t.accountType === 'hand-cash' ? '💵 Hand Cash' : '🏦 Bank';
      console.log(`${type} ${date} | ${account} | ₹${t.amount.toLocaleString('en-IN')} | ${t.category}`);
    });
    console.log('-'.repeat(80));

  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run seed function
seedTransactions();