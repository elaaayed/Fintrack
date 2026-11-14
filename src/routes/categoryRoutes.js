const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, getCategories);

module.exports = router;