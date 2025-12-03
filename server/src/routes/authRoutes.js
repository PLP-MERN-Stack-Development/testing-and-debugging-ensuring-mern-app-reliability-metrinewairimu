const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authValidationRules, validateRequest } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.post('/register', authValidationRules(), validateRequest, register);
router.post('/login', authValidationRules(), validateRequest, login);
router.get('/me', protect, getMe);

module.exports = router;