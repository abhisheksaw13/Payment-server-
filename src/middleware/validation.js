const { body, param, validationResult } = require('express-validator');

/**
 * Extract validation errors and respond with 422 if any.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

const validateCreateOrder = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name must not exceed 100 characters'),

  body('customerEmail')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('customerPhone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    // E.164-style: optional leading +, 8–15 total digits (covers all international formats)
    .matches(/^\+?[1-9]\d{7,14}$/)
    .withMessage('Invalid phone number'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number greater than or equal to 1'),

  body('currency')
    .optional()
    .isAlpha()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter ISO code'),

  handleValidationErrors,
];

const validateOrderId = [
  param('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isAlphanumeric('en-US', { ignore: '-_' })
    .withMessage('Invalid order ID format'),

  handleValidationErrors,
];

module.exports = {
  validateCreateOrder,
  validateOrderId,
  handleValidationErrors,
};
