import { initStripe } from '@stripe/stripe-react-native';
import { api } from './api';

class StripeService {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        console.warn('Stripe publishable key not found. Payment functionality will be limited.');
        return;
      }

      await initStripe({
        publishableKey,
        merchantIdentifier: 'merchant.com.marketpace.app',
        urlScheme: 'marketpace',
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  async createPaymentIntent(amount, orderId, metadata = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe is not initialized');
      }

      const response = await api.post('/payments/create-intent', {
        amount,
        orderId,
        metadata,
      });

      return response;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret, paymentMethod = null, billingDetails = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe is not initialized');
      }

      const { confirmPayment } = await import('@stripe/stripe-react-native');
      
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: paymentMethod ? {
          ...paymentMethod,
          billingDetails,
        } : undefined,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async processPayment(amount, orderId, paymentMethod = null, billingDetails = {}) {
    try {
      // Step 1: Create payment intent
      const { clientSecret } = await this.createPaymentIntent(amount, orderId);

      // Step 2: Confirm payment
      const result = await this.confirmPayment(clientSecret, paymentMethod, billingDetails);

      if (result.success) {
        // Step 3: Notify backend of successful payment
        await api.post('/payments/confirm', {
          paymentIntentId: result.paymentIntent.id,
          orderId,
        });
      }

      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createSetupIntent(customerId = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe is not initialized');
      }

      const response = await api.post('/payments/create-setup-intent', {
        customerId,
      });

      return response;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  async savePaymentMethod(setupIntentClientSecret, billingDetails = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('Stripe is not initialized');
      }

      const { confirmSetupIntent } = await import('@stripe/stripe-react-native');
      
      const { error, setupIntent } = await confirmSetupIntent(setupIntentClientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        setupIntent,
        paymentMethodId: setupIntent.payment_method,
      };
    } catch (error) {
      console.error('Error saving payment method:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getPaymentMethods() {
    try {
      return await api.get('/payments/payment-methods');
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async deletePaymentMethod(paymentMethodId) {
    try {
      return await api.delete(`/payments/payment-methods/${paymentMethodId}`);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  async createCustomer(email, name) {
    try {
      const response = await api.post('/payments/create-customer', {
        email,
        name,
      });

      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, data) {
    try {
      const response = await api.put(`/payments/customers/${customerId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Subscription methods
  async createSubscription(priceId, customerId = null) {
    try {
      const response = await api.post('/payments/create-subscription', {
        priceId,
        customerId,
      });

      return response;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await api.post(`/payments/subscriptions/${subscriptionId}/cancel`);
      return response;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async getSubscriptions() {
    try {
      return await api.get('/payments/subscriptions');
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  // Refund methods
  async createRefund(paymentIntentId, amount = null, reason = null) {
    try {
      const response = await api.post('/payments/refunds', {
        paymentIntentId,
        amount,
        reason,
      });

      return response;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  }

  validateCardNumber(cardNumber) {
    // Basic Luhn algorithm implementation
    const sanitized = cardNumber.replace(/\D/g, '');
    
    if (sanitized.length < 13 || sanitized.length > 19) {
      return false;
    }

    let sum = 0;
    let alternate = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  getCardType(cardNumber) {
    const sanitized = cardNumber.replace(/\D/g, '');
    
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      dinersclub: /^3[0689]/,
      jcb: /^35/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(sanitized)) {
        return type;
      }
    }

    return 'unknown';
  }

  formatCardNumber(cardNumber) {
    const sanitized = cardNumber.replace(/\D/g, '');
    const type = this.getCardType(sanitized);
    
    if (type === 'amex') {
      return sanitized.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      return sanitized.replace(/(\d{4})/g, '$1 ').trim();
    }
  }

  formatExpiryDate(expiry) {
    const sanitized = expiry.replace(/\D/g, '');
    
    if (sanitized.length >= 2) {
      return sanitized.substring(0, 2) + (sanitized.length > 2 ? '/' + sanitized.substring(2, 4) : '');
    }
    
    return sanitized;
  }

  validateExpiryDate(expiry) {
    const [month, year] = expiry.split('/');
    
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return false;
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return false;
    }

    return true;
  }

  validateCVC(cvc, cardType = null) {
    const sanitized = cvc.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return sanitized.length === 4;
    } else {
      return sanitized.length === 3;
    }
  }
}

// Create and initialize the Stripe service
const stripeService = new StripeService();
stripeService.init();

export default stripeService;
export { stripeService };
