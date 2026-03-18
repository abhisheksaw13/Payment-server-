const { body, param, validationResult } = require('express-validator');

const validateCreateOrder = [
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
  
  body('customerEmail')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  
  body('customerPhone')
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  
  body('amount')
    .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  
  body('currency')
    .optional()
    .isIn(['INR', 'USD']).withMessage('Invalid currency'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

const validateOrderId = [
  param('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCreateOrder,
  validateOrderId,
};
