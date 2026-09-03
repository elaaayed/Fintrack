const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, createTransaction);
router.get('/account/:accountId', authenticate, getTransactions);
router.patch('/:id', authenticate, updateTransaction);
router.delete('/:id', authenticate, deleteTransaction);

module.exports = router;