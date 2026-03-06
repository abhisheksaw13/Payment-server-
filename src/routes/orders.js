const express = require('express');
const router = express.Router();
const { createOrder, getOrder } = require('../controllers/paymentController');
const { validateCreateOrder, validateOrderId } = require('../middleware/validation');
const { orderCreationLimiter, orderReadLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/orders
 * Create a new payment order.
 */
router.post('/', orderCreationLimiter, validateCreateOrder, createOrder);

/**
 * GET /api/orders/:orderId
 * Retrieve order details and current status.
 */
router.get('/:orderId', orderReadLimiter, validateOrderId, getOrder);

module.exports = router;
