const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for order creation – prevents abuse and excessive API charges.
 * 20 requests per 15 minutes per IP.
 */
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/**
 * Rate limiter for webhook receiver.
 * High throughput allowed since Cashfree can send many events, but still bounded.
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many webhook requests.' },
});

/**
 * Rate limiter for payment verification endpoint.
 * 30 requests per 15 minutes per IP.
 */
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification requests, please try again later.' },
});

/**
 * Rate limiter for order read endpoint.
 * 60 requests per 15 minutes per IP.
 */
const orderReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

module.exports = { orderCreationLimiter, orderReadLimiter, webhookLimiter, verifyLimiter };
