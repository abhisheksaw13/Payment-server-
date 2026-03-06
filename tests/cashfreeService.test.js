/**
 * Unit tests for cashfreeService.verifyWebhookSignature
 */
const crypto = require('crypto');

// We need to set env before requiring the service
process.env.CASHFREE_SECRET_KEY = 'test_secret_key';
process.env.CASHFREE_APP_ID = 'test_app_id';
process.env.CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';

const { verifyWebhookSignature } = require('../src/services/cashfreeService');

describe('cashfreeService – verifyWebhookSignature', () => {
  const secretKey = 'test_secret_key';

  function buildSignature(timestamp, rawBody) {
    return crypto
      .createHmac('sha256', secretKey)
      .update(timestamp + rawBody)
      .digest('base64');
  }

  it('returns true for a valid signature', () => {
    const timestamp = '1700000000';
    const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' });
    const sig = buildSignature(timestamp, rawBody);
    expect(verifyWebhookSignature(rawBody, sig, timestamp)).toBe(true);
  });

  it('returns false for a tampered body', () => {
    const timestamp = '1700000000';
    const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' });
    const sig = buildSignature(timestamp, rawBody);
    expect(verifyWebhookSignature('tampered_body', sig, timestamp)).toBe(false);
  });

  it('returns false for a wrong timestamp', () => {
    const timestamp = '1700000000';
    const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' });
    const sig = buildSignature(timestamp, rawBody);
    expect(verifyWebhookSignature(rawBody, sig, '9999999999')).toBe(false);
  });

  it('returns false for an incorrect signature string', () => {
    const timestamp = '1700000000';
    const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' });
    expect(verifyWebhookSignature(rawBody, 'invalidsignature==', timestamp)).toBe(false);
  });
});
