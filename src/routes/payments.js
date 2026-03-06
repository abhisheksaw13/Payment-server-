const express = require('express');
const router = express.Router();
const { handleWebhook, verifyPayment } = require('../controllers/paymentController');
const { webhookLimiter, verifyLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/payments/webhook
 * Receive Cashfree webhook events. Uses raw body parsing for signature verification.
 */
router.post(
  '/webhook',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body.toString('utf8');
    try {
      req.body = JSON.parse(req.rawBody);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    return next();
  },
  handleWebhook
);

/**
 * POST /api/payments/verify
 * Verify a payment by querying Cashfree for the latest order status.
 */
router.post('/verify', verifyLimiter, verifyPayment);

module.exports = router;
