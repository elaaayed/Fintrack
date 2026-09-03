const express = require('express');
const router = express.Router();
const { createAccount, getAccounts } = require('../controllers/accountController');
const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, createAccount);
router.get('/', authenticate, getAccounts);

module.exports = router;