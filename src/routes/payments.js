const express = require('express');
const router = express.Router();
const { handleWebhook, verifyPayment } = require('../controllers/paymentController');
const { paymentWebhookLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/payments/webhook
 * Handle Cashfree webhook callbacks with signature verification.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), paymentWebhookLimiter, handleWebhook);

/**
 * POST /api/payments/verify
 * Verify payment completion by checking Cashfree for latest order status.
 */
router.post('/verify', verifyPayment);

module.exports = router;
