# 🔒 Stripe Security & Production Best Practices

## Enterprise-Grade Security for Payment Processing

---

## 1. Environment & Key Management

### ✅ Current Implementation
- API keys stored in `.env` (not in code)
- `.env` in `.gitignore`
- Environment-specific configuration possible

### 🔐 Production Enhancements

#### Use Environment Managers:
```bash
# Option 1: Platform-specific secrets (Recommended for Production)
# Heroku:
heroku config:set STRIPE_SECRET_KEY=sk_live_...

# AWS:
AWS Systems Manager Parameter Store or Secrets Manager

# Azure:
Azure Key Vault

# Google Cloud:
Google Secret Manager
```

#### Never Log Sensitive Data:
```javascript
// ❌ WRONG - Never log API key!
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);

// ✅ CORRECT - Log only last 4 characters
console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY?.slice(-4));
```

---

## 2. PCI Compliance

### ✅ Current Implementation
- Using Stripe Elements (PCI Level 1 compliant)
- Card data never touches your server
- Only tokenization on frontend

### 🔐 Additional Measures

```javascript
// Validate card data on frontend BEFORE submission
const isCardValid = cardElement && elements.getElement(CardElement).complete;

// Rate limit payment attempts
const rateLimiter = require('express-rate-limit');
const paymentLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many payment attempts, please try again later'
});

router.post('/create-intent', paymentLimiter, verifyToken, createPaymentIntent);
```

---

## 3. Webhook Security

### ✅ Current Implementation
- Webhook signature verification implemented

### 🔐 Enhanced Security:

```javascript
// Already in place - verify this is present:
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // ✅ GOOD: Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process only trusted events
  switch(event.type) {
    case 'payment_intent.succeeded':
      // Handle success
      break;
    case 'payment_intent.payment_failed':
      // Handle failure
      break;
    default:
      // Ignore other events
  }

  res.json({received: true});
};
```

### Additional Webhook Measures:

```javascript
// 1. Webhook Request Logging (for monitoring)
app.post('/api/payments/webhook', (req, res, next) => {
  console.log(`[WEBHOOK] Received: ${req.headers['stripe-signature']?.slice(0, 20)}...`);
  next();
});

// 2. Idempotency Handler (prevent duplicate processing)
const webhookProcessedIds = new Set();

const handleStripeWebhook = async (req, res) => {
  const event = stripe.webhooks.constructEvent(...);
  
  // Prevent processing same event twice
  if (webhookProcessedIds.has(event.id)) {
    return res.json({received: true});
  }
  
  webhookProcessedIds.add(event.id);
  
  // Process event...
};

// 3. Webhook Timeout (prevent hanging)
const webhookTimeout = setTimeout(() => {
  console.error('Webhook processing timeout');
}, 30000); // 30 seconds
```

---

## 4. Error Handling & Information Disclosure

### ✅ Production Error Responses:

```javascript
// ❌ DON'T expose API errors to frontend
res.status(500).json({
  error: error.message, // ⚠️ This could leak sensitive info
});

// ✅ DO use generic messages
res.status(500).json({
  success: false,
  message: 'Payment processing failed. Please try again or contact support.',
  // In development/test mode:
  ...(process.env.NODE_ENV === 'development' && { debugMessage: error.message })
});
```

---

## 5. Rate Limiting

### Implement Rate Limiting:

```javascript
// backend/middlewares/paymentRateLimiter.js
const rateLimit = require('express-rate-limit');

const createPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // 5 payment attempts per user
  keyGenerator: (req, res) => req.user._id, // Per user, not per IP
  message: 'Too many payment attempts, please wait before trying again',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = createPaymentLimiter;
```

Add to payment routes:
```javascript
const paymentLimiter = require('../middlewares/paymentRateLimiter');
router.post('/create-intent', paymentLimiter, verifyToken, createPaymentIntent);
```

---

## 6. Logging & Monitoring

### Comprehensive Logging:

```javascript
// Structured logging for payment events
const logPaymentEvent = (eventType, data) => {
  const log = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: data.userId,
    rentId: data.rentId,
    amount: data.amount,
    stripeIntentId: data.paymentIntentId?.slice(-4), // Last 4 chars only
    status: data.status,
    errorMessage: data.errorMessage || null,
  };
  
  console.log(JSON.stringify(log));
  
  // Send to monitoring service (e.g., Sentry, DataDog)
  if (eventType === 'payment.failed' || eventType === 'payment.error') {
    alertMonitoring(log);
  }
};

// Usage:
logPaymentEvent('payment.initiated', {
  userId: req.user._id,
  rentId: rentId,
  amount: amount,
});
```

---

## 7. Production Deployment Checklist

### Security Items:

- [ ] API keys in secure environment variables (not .env files)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS whitelist includes only trusted domains
- [ ] Rate limiting enabled on payment endpoints
- [ ] Webhook signature verification active
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured (not logging API keys)
- [ ] Database backups automated and tested
- [ ] Monitoring/alerting configured for payment failures
- [ ] API key rotation schedule established
- [ ] Team access to Stripe account limited
- [ ] 2FA enabled on Stripe account
- [ ] IP whitelisting for API access (if possible)
- [ ] Regular security audits scheduled

---

## 8. Monitoring Strategy

### Key Metrics to Track:

```javascript
// Track these metrics
const paymentMetrics = {
  totalTransactions: 0,
  successfulPayments: 0,
  failedPayments: 0,
  averagePaymentAmount: 0,
  paymentRetryRate: 0,
  webhookDeliveryRate: 0.99, // Target 99% success
  averageProcessingTime: 0,
};

// Alert if:
- Payment failure rate > 5%
- Webhook delivery rate < 95%
- Average processing time > 30 seconds
- Any payment > ₹1,00,000 (for fraud detection)
```

### Monitoring Tools:

- **Stripe Dashboard** - Native payment monitoring
- **Sentry** - Error tracking and alerting
- **DataDog** - Infrastructure & application monitoring
- **LogRocket** - Session replay and logs
- **PagerDuty** - Incident management

---

## 9. Fraud Prevention

### Enable Stripe Radar:

```javascript
// Automatic fraud detection with Stripe Radar
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'inr',
  metadata: {
    rentId: rentId,
    userId: req.user._id,
  },
  // Enable fraud detection
  radar_options: {
    filters: 'all' // Use all Radar filters
  },
});
```

### Manual Fraud Checks:

```javascript
// Check for suspicious patterns
const isSuspicious = (payment) => {
  // Multiple failed attempts from same user
  if (payment.failureCount > 3) return true;
  
  // Unusual amount
  if (payment.amount > 100000) return true;
  
  // Multiple payments from different IPs in short time
  if (payment.ipChanges > 2) return true;
  
  return false;
};
```

---

## 10. Compliance & Legal

### ✅ Documentation:

Create these documents:
- [ ] Payment Processing Policy
- [ ] Refund Policy
- [ ] Privacy Policy (mentioning Stripe)
- [ ] Terms of Service (payment terms)
- [ ] Data Protection Agreement (GDPR compliance)

### ✅ Data Protection:

```javascript
// GDPR Compliance - Handle data deletion requests
router.delete('/api/payments/user/:userId', async (req, res) => {
  // Delete payment records for user (or anonymize)
  const { userId } = req.params;
  
  // Delete payment history (with logging for audit)
  await PaymentHistory.updateMany(
    { userId },
    { $set: { userId: null, anonymized: true } }
  );
  
  res.json({ success: true, message: 'User payment data deleted' });
});
```

---

## 11. Incident Response Plan

### If Payment Processing Goes Down:

```
1. ALERT (Immediate)
   - Notify payment team
   - Check Stripe status page
   - Check backend logs
   - Check network connectivity

2. INVESTIGATE (Within 15 min)
   - Error rate spike?
   - Webhook delivery issues?
   - Rate limiting triggered?
   - Database connection issues?

3. COMMUNICATE (Within 30 min)
   - Notify users if needed
   - Post status update
   - Provide ETA for resolution

4. RESOLVE (Prioritized)
   - Fix root cause
   - Test with test payment
   - Verify webhook delivery
   - Confirm end-to-end flow

5. POST-MORTEM (Within 24 hours)
   - Document incident
   - Identify improvements
   - Update runbooks
```

---

## 12. Testing Strategy

### Security Testing:

```javascript
// Test 1: Webhook signature verification
// Send webhook with wrong signature - should fail

// Test 2: Rate limiting
// Send 10 payment requests in 1 minute - should block

// Test 3: Error handling
// Send invalid rentId - should not expose internals

// Test 4: Authentication
// Send payment without JWT - should reject

// Test 5: Authorization
// Resident tries to pay different resident's rent - should deny
```

---

## Production Checklist Template

```markdown
## Pre-Production (Do This Before Live)

- [ ] All security measures implemented
- [ ] Monitoring/alerting configured
- [ ] Incident response plan documented
- [ ] Team trained on payment procedures
- [ ] Backups tested and working
- [ ] DNS configured for production domain
- [ ] SSL certificate valid and renewed
- [ ] Rate limiting tested
- [ ] Webhook tested with real events
- [ ] Payment flow tested end-to-end
- [ ] Error messages reviewed (no leaks)
- [ ] Logs reviewed (no sensitive data)
- [ ] Database backup automated
- [ ] Support team trained

## Go-Live

- [ ] Switch to live Stripe keys
- [ ] Test one payment with live key
- [ ] Monitor closely first 24 hours
- [ ] Be ready to rollback if issues

## Post-Launch

- [ ] Review Stripe Dashboard daily (first week)
- [ ] Review logs for errors
- [ ] Verify webhook deliveries
- [ ] Monitor payment success rate
- [ ] Gather user feedback
```

---

## 🎯 Quick Reference

| Item | Development | Production |
|------|-------------|-----------|
| Stripe Keys | `sk_test_` / `pk_test_` | `sk_live_` / `pk_live_` |
| Environment | `.env` file | Secure secrets manager |
| HTTPS | Optional | Required |
| Rate Limiting | Relaxed (10 req/min) | Strict (5 req/15min) |
| Logging | Verbose | Structured + monitoring |
| Error Messages | Detailed | Generic |
| Database | Local | Replicated with backups |
| Monitoring | Basic | Comprehensive |

---

**Your payment system is now enterprise-grade ready!** 🚀
