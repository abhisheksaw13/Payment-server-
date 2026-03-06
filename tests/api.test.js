/**
 * Integration-style tests for API routes using supertest with mocked services.
 *
 * MongoDB is mocked so no real DB connection is required.
 */
jest.mock('../src/config/database', () => jest.fn().mockResolvedValue());
jest.mock('../src/services/cashfreeService');

const cashfreeService = require('../src/services/cashfreeService');

// Set required env vars before requiring app
process.env.CASHFREE_APP_ID = 'test_app_id';
process.env.CASHFREE_SECRET_KEY = 'test_secret_key';
process.env.CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_payment_db';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

// Mock mongoose model methods
jest.mock('../src/models/Order');
jest.mock('../src/models/PaymentTransaction');

const Order = require('../src/models/Order');
const PaymentTransaction = require('../src/models/PaymentTransaction');

// ─── GET /health ──────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
describe('POST /api/orders', () => {
  const validPayload = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+919876543210',
    amount: 500,
    currency: 'INR',
  };

  beforeEach(() => {
    cashfreeService.createCashfreeOrder.mockResolvedValue({
      order_id: 'cf_order_123',
      payment_session_id: 'sess_abc',
    });

    const mockOrderInstance = {
      save: jest.fn().mockResolvedValue(true),
      orderId: 'order_test123',
      amount: 500,
      currency: 'INR',
      status: 'CREATED',
      paymentSessionId: 'sess_abc',
      cashfreeOrderId: 'cf_order_123',
    };
    Order.mockImplementation(() => mockOrderInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an order and returns 201 with session id', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('paymentSessionId', 'sess_abc');
  });

  it('returns 422 when customerName is missing', async () => {
    const { customerName, ...rest } = validPayload;
    const res = await request(app).post('/api/orders').send(rest);
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('returns 422 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validPayload, customerEmail: 'not-an-email' });
    expect(res.status).toBe(422);
  });

  it('returns 422 when amount is less than 1', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validPayload, amount: 0 });
    expect(res.status).toBe(422);
  });

  it('returns 500 when Cashfree API fails', async () => {
    cashfreeService.createCashfreeOrder.mockRejectedValue(
      new Error('Cashfree API error')
    );
    const res = await request(app).post('/api/orders').send(validPayload);
    expect(res.status).toBe(500);
  });
});

// ─── GET /api/orders/:orderId ─────────────────────────────────────────────────
describe('GET /api/orders/:orderId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the order when it exists', async () => {
    Order.findOne.mockResolvedValue({
      orderId: 'order_abc123',
      amount: 200,
      currency: 'INR',
      status: 'CREATED',
      customerDetails: {},
      cashfreeOrderId: 'cf_123',
      paymentSessionId: 'sess_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).get('/api/orders/order_abc123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe('order_abc123');
  });

  it('returns 404 when order does not exist', async () => {
    Order.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/orders/nonexistent123');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/payments/verify ────────────────────────────────────────────────
describe('POST /api/payments/verify', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when orderId is missing', async () => {
    const res = await request(app).post('/api/payments/verify').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when order is not found', async () => {
    Order.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/payments/verify')
      .send({ orderId: 'order_missing' });
    expect(res.status).toBe(404);
  });

  it('returns updated order status from Cashfree', async () => {
    const mockOrder = {
      orderId: 'order_pay1',
      amount: 100,
      currency: 'INR',
      status: 'CREATED',
      cashfreeOrderId: 'cf_pay1',
      save: jest.fn().mockResolvedValue(true),
    };
    Order.findOne.mockResolvedValue(mockOrder);
    cashfreeService.getCashfreeOrder.mockResolvedValue({
      order_id: 'cf_pay1',
      order_status: 'PAID',
    });

    const res = await request(app)
      .post('/api/payments/verify')
      .send({ orderId: 'order_pay1' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PAID');
  });
});

// ─── 404 route ────────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
