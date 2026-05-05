const express = require('express');
const AuthController = require('../../controllers/authController');
const PasswordController = require('../../controllers/passwordController');
const { validate, registerRules, loginRules } = require('../../utils/validator');
const { authLimiter } = require('../../utils/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, AuthController.register);
router.post('/login', authLimiter, loginRules, validate, AuthController.login);
router.post('/forgot-password', authLimiter, PasswordController.forgotPassword);
router.post('/reset-password', PasswordController.resetPassword);

module.exports = router;
