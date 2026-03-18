const express = require('express');
const router = express.Router();
const { handleWebhook, verifyPayment } = require('../controllers/paymentController');
const { paymentWebhookLimiter } = require('../middleware/rateLimiter');

// Webhook - requires raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentWebhookLimiter,
  handleWebhook
);

// Verify payment status
router.post('/verify', verifyPayment);

module.exports = router;
