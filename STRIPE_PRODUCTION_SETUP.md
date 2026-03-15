# 🔐 Stripe Production Integration Guide

## Overview
Your CMS project has Stripe infrastructure ready. This guide covers production-level setup, security best practices, and deployment steps.

---

## 📋 Prerequisites

- Stripe account (https://stripe.com)
- Production Stripe API keys
- Webhook signing secret for your environment

---

## 🔑 Step 1: Get Your Stripe Keys

### From Stripe Dashboard:

1. **Go to Dashboard → Developers → API Keys**
2. **Get these keys:**
   - **Secret Key** (starts with `sk_live_`) - Keep this secret!
   - **Publishable Key** (starts with `pk_live_`) - Safe to share
   - **Webhook Signing Secret** (starts with `whsec_`) - From Webhooks section

### ⚠️ Security Rules:
- Never commit API keys to git
- Use environment variables only
- Rotate keys periodically
- Use test keys (`sk_test_`, `pk_test_`) for development
- Use live keys (`sk_live_`, `pk_live_`) for production only

---

## 🛠️ Step 2: Configure Environment Variables

### Backend Setup (`backend/.env`)

Already added placeholders. Replace with your actual keys:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE
```

### Frontend Setup (`frontend/.env`)

Already added placeholder. Replace with your actual key:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

---

## 🔗 Step 3: Stripe Webhook Setup

### In Stripe Dashboard:

1. **Go to Developers → Webhooks**
2. **Add Endpoint:**
   - URL: `https://your-production-domain.com/api/payments/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

3. **Copy the Signing Secret** → Add to `STRIPE_WEBHOOK_SECRET` in backend `.env`

### Important:
- Your webhook must be **HTTPS** (not HTTP)
- Stripe will retry failed webhook deliveries
- Monitor webhook logs in Stripe Dashboard for debugging

---

## ✅ Step 4: Security Checklist

- [ ] All API keys are in `.env` files (never in code)
- [ ] `.env` files are in `.gitignore` (check git config)
- [ ] Backend validates webhook signatures
- [ ] Frontend never sends card data to your backend
- [ ] All payment routes require authentication
- [ ] HTTPS is enabled on production
- [ ] CORS is properly configured for your domain
- [ ] Rate limiting is enabled on payment endpoints
- [ ] Payment failures are logged and alerted
- [ ] Regular key rotation schedule established

---

## 🧪 Step 5: Testing

### Test Mode:
Use Stripe's test card numbers:

| Card Number | Result |
|------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure Required |

### Test Workflow:
1. Switch to test keys in `.env`
2. Create a test rent as admin
3. Pay as resident with test card
4. Check webhook delivery in Stripe Dashboard
5. Verify rent status updates to "paid"

---

## 🚀 Step 6: Deployment Checklist

### Before Going Live:

1. **Backend Deployment:**
   ```bash
   # Ensure environment variables are set
   # STRIPE_SECRET_KEY=sk_live_...
   # STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Frontend Deployment:**
   ```bash
   # Ensure environment variable is set
   # VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **HTTPS/TLS:**
   - Verify SSL certificate is valid
   - Redirect HTTP → HTTPS
   - Update webhook URL to use HTTPS

4. **CORS Configuration:**
   - Update `allowedOrigins` in `backend/index.js` with your production domain

5. **Database:**
   - Ensure MongoDB backups are automated
   - Verify connection string uses production database

6. **Monitoring:**
   - Set up error logging (Sentry, LogRocket, etc.)
   - Monitor Stripe Dashboard for failed payments
   - Set up alerts for payment errors

---

## 📊 Step 7: Monitoring & Logging

### Server Logging:

Add logging to payment operations:

```javascript
// Example in paymentController.js
const createPaymentIntent = async (req, res) => {
  try {
    console.log(`[PAYMENT] Creating intent for rent: ${rentId}`);
    // ... payment logic
    console.log(`[PAYMENT] Intent created: ${paymentIntent.id}`);
  } catch (error) {
    console.error(`[PAYMENT ERROR] ${error.message}`);
    // Alert monitoring service
  }
};
```

### Stripe Dashboard:
- Check Payment Logs regularly
- Review failed payment attempts
- Monitor webhook delivery status
- Track refund requests

---

## 🔄 Step 8: Production APIs

### Create Payment Intent
```
POST /api/payments/create-intent
Headers: Authorization: Bearer {token}
Body: { rentId, amount }
Response: { clientSecret, paymentIntentId }
```

### Confirm Payment
```
POST /api/payments/confirm
Headers: Authorization: Bearer {token}
Body: { paymentIntentId, rentId }
Response: { success, message, data }
```

### Webhook Handler
```
POST /api/payments/webhook
Headers: stripe-signature: {signature}
Body: {event_data}
```

---

## 🆘 Troubleshooting

### Payment Intent Creation Fails:
- Check Stripe secret key is correct
- Verify rent record exists
- Check user has permission to pay this rent

### Card Declined:
- Use test cards in test mode
- Check Stripe Dashboard for decline reason
- Verify 3D Secure requirements

### Webhook Not Received:
- Verify webhook URL is HTTPS and accessible
- Check signing secret is correct
- Review Stripe Dashboard webhook logs
- Check backend error logs

### Balance Not Updating:
- Verify webhook reached backend
- Check rent status update logic
- Monitor server logs during payment

---

## 📞 Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **React Stripe SDK:** https://stripe.com/docs/stripe-js/react
- **Webhook Events:** https://stripe.com/docs/webhooks

---

## 🎯 Next Steps

1. ✅ Get actual Stripe keys
2. ✅ Update `.env` files with live keys
3. ✅ Test in test mode
4. ✅ Set up webhook in Stripe Dashboard
5. ✅ Deploy to production with HTTPS
6. ✅ Verify end-to-end payment flow
7. ✅ Monitor Stripe Dashboard regularly
8. ✅ Train support team on payment issues

---

**Your Stripe integration is production-ready!** 🚀
