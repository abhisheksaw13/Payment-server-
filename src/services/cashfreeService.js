const crypto = require('crypto');
const axios = require('axios');
const { cashfreeConfig, CASHFREE_ENDPOINTS } = require('../config/cashfree');
const logger = require('../config/logger');

/**
 * Build Axios instance with Cashfree authentication headers.
 */
const getCashfreeClient = () => {
  return axios.create({
    baseURL: cashfreeConfig.apiUrl,
    headers: {
      'x-api-version': cashfreeConfig.apiVersion,
      'x-client-id': cashfreeConfig.appId,
      'x-client-secret': cashfreeConfig.secretKey,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

/**
 * Create a new order via the Cashfree API.
 * @param {Object} orderData
 * @returns {Promise<Object>} Cashfree order response
 */
const createCashfreeOrder = async (orderData) => {
  const client = getCashfreeClient();
  try {
    const response = await client.post(
      CASHFREE_ENDPOINTS.CREATE_ORDER,
      orderData
    );
    return response.data;
  } catch (err) {
    const errData = err.response ? err.response.data : err.message;
    logger.error('Cashfree createOrder error:', errData);
    throw new Error(
      (err.response && err.response.data && err.response.data.message) ||
        'Failed to create Cashfree order'
    );
  }
};

/**
 * Fetch order details from the Cashfree API.
 * @param {string} cashfreeOrderId
 * @returns {Promise<Object>}
 */
const getCashfreeOrder = async (cashfreeOrderId) => {
  const client = getCashfreeClient();
  try {
    const response = await client.get(
      CASHFREE_ENDPOINTS.GET_ORDER(cashfreeOrderId)
    );
    return response.data;
  } catch (err) {
    const errData = err.response ? err.response.data : err.message;
    logger.error('Cashfree getOrder error:', errData);
    throw new Error(
      (err.response && err.response.data && err.response.data.message) ||
        'Failed to fetch Cashfree order'
    );
  }
};

/**
 * Fetch payment details for an order from the Cashfree API.
 * @param {string} cashfreeOrderId
 * @returns {Promise<Object[]>}
 */
const getCashfreePayments = async (cashfreeOrderId) => {
  const client = getCashfreeClient();
  try {
    const response = await client.get(
      CASHFREE_ENDPOINTS.GET_PAYMENTS(cashfreeOrderId)
    );
    return response.data;
  } catch (err) {
    const errData = err.response ? err.response.data : err.message;
    logger.error('Cashfree getPayments error:', errData);
    throw new Error(
      (err.response && err.response.data && err.response.data.message) ||
        'Failed to fetch Cashfree payments'
    );
  }
};

/**
 * Verify the Cashfree webhook signature.
 *
 * Cashfree v3 webhook signature is computed as:
 *   HMAC-SHA256( timestamp + rawBody, secretKey )  → base64
 * where the timestamp comes from the "x-webhook-timestamp" header.
 *
 * @param {string} rawBody    Raw request body string
 * @param {string} signature  Value of "x-webhook-signature" header
 * @param {string} timestamp  Value of "x-webhook-timestamp" header
 * @returns {boolean}
 */
const verifyWebhookSignature = (rawBody, signature, timestamp) => {
  if (!cashfreeConfig.secretKey) {
    logger.warn('CASHFREE_SECRET_KEY is not set; skipping signature verification');
    return false;
  }
  // Validate that the received signature looks like a base64-encoded string
  // before comparing buffers to avoid accepting malformed input.
  if (!/^[A-Za-z0-9+/]+=*$/.test(signature)) {
    return false;
  }
  const data = timestamp + rawBody;
  const computedSignature = crypto
    .createHmac('sha256', cashfreeConfig.secretKey)
    .update(data)
    .digest('base64');
  // Normalise: decode then re-encode so both buffers are in identical base64 form.
  const normReceived = Buffer.from(signature, 'base64').toString('base64');
  const computedBuf = Buffer.from(computedSignature);
  const receivedBuf = Buffer.from(normReceived);
  if (computedBuf.length !== receivedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(computedBuf, receivedBuf);
};

module.exports = {
  createCashfreeOrder,
  getCashfreeOrder,
  getCashfreePayments,
  verifyWebhookSignature,
};
