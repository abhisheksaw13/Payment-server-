const { firestore, db } = require('../config/firebase');

class PaymentTransaction {
  // Create new payment transaction
  static async create(paymentData) {
    try {
      const transactionRef = firestore.collection('payments').doc();
      const transactionId = transactionRef.id;
      
      const transaction = {
        id: transactionId,
        userId: paymentData.userId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        paymentMethod: paymentData.paymentMethod,
        status: paymentData.status || 'pending',
        transactionId: paymentData.transactionId,
        gateway: paymentData.gateway || 'stripe',
        metadata: paymentData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await transactionRef.set(transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Get payment by ID
  static async getById(transactionId) {
    try {
      const doc = await firestore.collection('payments').doc(transactionId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error('Error fetching payment transaction:', error);
      throw error;
    }
  }

  // Get all payments by user
  static async getByUserId(userId) {
    try {
      const snapshot = await firestore
        .collection('payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching payments by user:', error);
      throw error;
    }
  }

  // Get all payments by order
  static async getByOrderId(orderId) {
    try {
      const snapshot = await firestore
        .collection('payments')
        .where('orderId', '==', orderId)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching payments by order:', error);
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(transactionId, status) {
    try {
      await firestore.collection('payments').doc(transactionId).update({
        status: status,
        updatedAt: new Date().toISOString()
      });
      return await this.getById(transactionId);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Update payment
  static async update(transactionId, updateData) {
    try {
      updateData.updatedAt = new Date().toISOString();
      await firestore.collection('payments').doc(transactionId).update(updateData);
      return await this.getById(transactionId);
    } catch (error) {
      console.error('Error updating payment transaction:', error);
      throw error;
    }
  }

  // Delete payment
  static async delete(transactionId) {
    try {
      await firestore.collection('payments').doc(transactionId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting payment transaction:', error);
      throw error;
    }
  }

  // Get payments by status
  static async getByStatus(status) {
    try {
      const snapshot = await firestore
        .collection('payments')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching payments by status:', error);
      throw error;
    }
  }
}

module.exports = PaymentTransaction;
