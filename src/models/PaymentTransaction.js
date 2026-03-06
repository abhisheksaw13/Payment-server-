const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/cashfree');

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    cfPaymentId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      required: true,
      index: true,
    },
    amount: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
