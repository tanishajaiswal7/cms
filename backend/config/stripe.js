const stripeSecretKeyRaw = process.env.STRIPE_SECRET_KEY;
const stripePublishableKeyRaw = process.env.STRIPE_PUBLISHABLE_KEY;

const stripeSecretKey =
  typeof stripeSecretKeyRaw === "string" ? stripeSecretKeyRaw.trim() : "";
const stripePublishableKey =
  typeof stripePublishableKeyRaw === "string"
    ? stripePublishableKeyRaw.trim()
    : "";

const maskKey = (key) => {
  if (!key) return "(empty)";
  if (key.length <= 18) return key;
  return `${key.slice(0, 12)}...${key.slice(-6)}`;
};

if (!stripeSecretKey) {
  throw new Error(
    "[Stripe] STRIPE_SECRET_KEY is missing in backend/.env."
  );
}

if (!/^sk_(test|live)_/.test(stripeSecretKey)) {
  throw new Error(
    `[Stripe] STRIPE_SECRET_KEY has invalid format: ${maskKey(
      stripeSecretKey
    )}. Expected prefix sk_test_ or sk_live_.`
  );
}

if (!stripePublishableKey) {
  console.warn(
    "[Stripe] STRIPE_PUBLISHABLE_KEY is missing in backend/.env."
  );
} else if (!/^pk_(test|live)_/.test(stripePublishableKey)) {
  console.warn(
    `[Stripe] STRIPE_PUBLISHABLE_KEY has invalid format: ${maskKey(
      stripePublishableKey
    )}. Expected prefix pk_test_ or pk_live_.`
  );
} else {
  console.info(
    `[Stripe] Backend keys loaded: secret=${maskKey(
      stripeSecretKey
    )}, publishable=${maskKey(stripePublishableKey)}`
  );
}

if (
  typeof stripeSecretKeyRaw === "string" &&
  stripeSecretKeyRaw !== stripeSecretKey
) {
  console.warn(
    "[Stripe] Whitespace detected in STRIPE_SECRET_KEY; trimmed automatically."
  );
}

if (
  typeof stripePublishableKeyRaw === "string" &&
  stripePublishableKeyRaw !== stripePublishableKey
) {
  console.warn(
    "[Stripe] Whitespace detected in STRIPE_PUBLISHABLE_KEY; trimmed automatically."
  );
}

const stripe = require("stripe")(stripeSecretKey);

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
