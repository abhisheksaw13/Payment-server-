const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  apiUrl: process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg',
  apiVersion: '2023-08-01',
};

const CASHFREE_ENDPOINTS = {
  CREATE_ORDER: '/orders',
  GET_ORDER: (orderId) => `/orders/${orderId}`,
  GET_PAYMENTS: (orderId) => `/orders/${orderId}/payments`,
};

const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
};

const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  USER_DROPPED: 'USER_DROPPED',
};

module.exports = {
  cashfreeConfig,
  CASHFREE_ENDPOINTS,
  ORDER_STATUS,
  PAYMENT_STATUS,
};
