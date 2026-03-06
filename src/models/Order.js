const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/cashfree');

const customerDetailsSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
      index: true,
    },
    customerDetails: {
      type: customerDetailsSchema,
      required: true,
    },
    cashfreeOrderId: { type: String, default: null },
    paymentSessionId: { type: String, default: null },
    orderMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
