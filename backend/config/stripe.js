const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Configuration Module
 * Centralizes Stripe instance and configuration
 */

const stripeConfig = {
  // Initialize Stripe instance
  client: stripe,

  // Stripe settings
  currency: "inr",
  webhookSigningSecret: process.env.STRIPE_WEBHOOK_SECRET,

  /**
   * Get formatted amount for Stripe (in cents)
   * @param {number} amount - Amount in rupees
   * @returns {number} - Amount in cents
   */
  getAmountInCents: (amount) => Math.round(amount * 100),

  /**
   * Get formatted amount from cents
   * @param {number} amountInCents - Amount in cents
   * @returns {number} - Amount in rupees
   */
  getAmountInRupees: (amountInCents) => amountInCents / 100,

  /**
   * Create a payment intent
   * @param {object} options - Payment intent options
   * @returns {Promise} - Stripe payment intent
   */
  createPaymentIntent: async (options) => {
    return await stripe.paymentIntents.create({
      amount: stripeConfig.getAmountInCents(options.amount),
      currency: stripeConfig.currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: options.metadata || {},
      description: options.description,
      receipt_email: options.receiptEmail,
    });
  },

  /**
   * Retrieve a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise} - Stripe payment intent
   */
  retrievePaymentIntent: async (paymentIntentId) => {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  /**
   * Construct webhook event
   * @param {Buffer} body - Raw request body
   * @param {string} signature - Stripe signature header
   * @returns {object} - Constructed event
   */
  constructWebhookEvent: (body, signature) => {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSigningSecret
    );
  },

  /**
   * Create a customer
   * @param {object} options - Customer options
   * @returns {Promise} - Stripe customer
   */
  createCustomer: async (options) => {
    return await stripe.customers.create({
      email: options.email,
      name: options.name,
      phone: options.phone,
      metadata: options.metadata || {},
    });
  },

  /**
   * Update a customer
   * @param {string} customerId - Customer ID
   * @param {object} options - Update options
   * @returns {Promise} - Updated Stripe customer
   */
  updateCustomer: async (customerId, options) => {
    return await stripe.customers.update(customerId, {
      email: options.email,
      name: options.name,
      phone: options.phone,
      metadata: options.metadata || {},
    });
  },

  /**
   * List all charges
   * @param {object} options - Query options
   * @returns {Promise} - List of charges
   */
  listCharges: async (options = {}) => {
    return await stripe.charges.list(options);
  },

  /**
   * Retrieve charge by ID
   * @param {string} chargeId - Charge ID
   * @returns {Promise} - Stripe charge
   */
  retrieveCharge: async (chargeId) => {
    return await stripe.charges.retrieve(chargeId);
  },

  /**
   * Refund a charge
   * @param {string} chargeId - Charge ID
   * @param {number} amount - Amount to refund (optional, full if not provided)
   * @returns {Promise} - Refund object
   */
  refundCharge: async (chargeId, amount = null) => {
    const refundOptions = {
      charge: chargeId,
    };
    if (amount) {
      refundOptions.amount = stripeConfig.getAmountInCents(amount);
    }
    return await stripe.refunds.create(refundOptions);
  },
};

module.exports = stripeConfig;
