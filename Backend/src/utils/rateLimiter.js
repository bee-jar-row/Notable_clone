const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 5000,
  message: { message: 'Too many requests, please try again later!' }
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 500,
  message: { message: 'Too many login attempts, please try again later!' }
});

module.exports = { generalLimiter, authLimiter };
