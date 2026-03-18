const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature or timestamp',
      });
    }

    // Get raw body from request
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else {
      rawBody = JSON.stringify(req.body);
    }

    // Store raw body for webhook verification
    req.rawBody = rawBody;

    const isValid = cashfreeService.verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      logger.warn('Invalid webhook signature received');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    // Parse body if it's a string
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.type;
    const eventData = event.data || {};

    logger.info(`Webhook received: ${eventType}`);

    if (
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK'
    ) {
      const paymentInfo = eventData.payment || {};
      const orderInfo = eventData.order || {};
      const cfOrderId = orderInfo.order_id;

      const order = await Order.findOne({ cashfreeOrderId: cfOrderId });
      if (!order) {
        logger.warn(`Webhook received for unknown cashfree order: ${cfOrderId}`);
        return res.status(200).json({ success: true });
      }

      let paymentStatus;
      let orderStatus;
      if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
        paymentStatus = PAYMENT_STATUS.SUCCESS;
        orderStatus = ORDER_STATUS.PAID;
      } else if (eventType === 'PAYMENT_USER_DROPPED_WEBHOOK') {
        paymentStatus = PAYMENT_STATUS.USER_DROPPED;
        orderStatus = ORDER_STATUS.FAILED;
      } else {
        paymentStatus = PAYMENT_STATUS.FAILED;
        orderStatus = ORDER_STATUS.FAILED;
      }

      const transactionId = generateId('txn');
      await PaymentTransaction.create({
        transactionId,
        orderId: order.orderId,
        cfPaymentId: paymentInfo.cf_payment_id != null ? String(paymentInfo.cf_payment_id) : null,
        paymentMethod: paymentInfo.payment_method
          ? Object.keys(paymentInfo.payment_method)[0]
          : null,
        status: paymentStatus,
        amount: paymentInfo.payment_amount || order.amount,
        currency: paymentInfo.payment_currency || order.currency,
        gatewayResponse: event,
      });

      order.status = orderStatus;
      await order.save();
      logger.info(`Order ${order.orderId} updated to ${orderStatus} via webhook`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
};
