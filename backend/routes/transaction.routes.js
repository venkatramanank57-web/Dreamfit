// routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  deleteTransaction
} = require('../controllers/transaction.controller');

// All routes require authentication
router.use(protect);

// Summary route
router.get('/summary', getTransactionSummary);

// Main routes
router.route('/')
  .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
  .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

router.delete('/:id', authorize('ADMIN'), deleteTransaction);

module.exports = router;