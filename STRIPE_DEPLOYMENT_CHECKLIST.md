# Stripe Integration - Setup & Deployment Checklist

## ✅ Development Setup Checklist

### Backend Setup
- [ ] Navigate to `backend` directory
- [ ] Run `npm install` to install new stripe package
- [ ] Verify `.env` file has:
  - [ ] `STRIPE_SECRET_KEY` (starts with sk_test_)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (starts with pk_test_)
  - [ ] `STRIPE_WEBHOOK_SECRET` (placeholder for now)
- [ ] Start backend: `npm run dev`
- [ ] Verify server starts on port 5000

### Frontend Setup
- [ ] Navigate to `frontend` directory
- [ ] Run `npm install` to install Stripe packages
- [ ] Verify `.env` file has:
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (starts with pk_test_)
- [ ] Start frontend: `npm run dev`
- [ ] Verify app loads on localhost:3000

### Database Verification
- [ ] MongoDB connection verified
- [ ] Rent collection exists
- [ ] User collection exists
- [ ] Payment collection will be created automatically on first payment

---

## 🧪 Testing Checklist

### Payment Flow Testing
- [ ] Navigate to `/pay-rent` page (as resident)
- [ ] Select a rent to pay
- [ ] Click "Pay Now" button
- [ ] Verify PaymentForm modal appears
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Enter any future date (e.g., 12/25)
- [ ] Enter any CVC (e.g., 123)
- [ ] Click "Pay" button
- [ ] Verify loading states appear
- [ ] Verify payment success message
- [ ] Check database for Payment record created
- [ ] Check Rent status updated to "paid"

### Error Handling Testing
- [ ] Test with declined card: `4000 0000 0000 0002`
- [ ] Verify error message displays
- [ ] Test with invalid amount (0 or negative)
- [ ] Verify validation error
- [ ] Test with another user's rent
- [ ] Verify authorization error

### History & Details Testing
- [ ] Navigate to `/pay-rent` page
- [ ] Verify payment history section displays
- [ ] Test payment details endpoint: `GET /api/payments/history`
- [ ] Test get payment details: `GET /api/payments/:paymentId`

### Admin Testing
- [ ] Login as admin user
- [ ] Access `/admin/analytics` (or similar page if exists)
- [ ] Test admin payment endpoints:
  - [ ] `GET /api/admin/payments`
  - [ ] `GET /api/admin/payments/stats`
  - [ ] `GET /api/admin/payments/export/csv`
  - [ ] `GET /api/admin/payments/resident/:residentId`

### Webhook Testing (Local)
- [ ] Download and install Stripe CLI
- [ ] Run: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- [ ] Trigger test payment
- [ ] Verify webhook received
- [ ] Check webhook logs in Stripe Dashboard

---

## 🌍 Production Deployment Checklist

### Pre-Deployment
- [ ] All tests passed
- [ ] No console errors in browser
- [ ] No server errors in backend logs
- [ ] Database verified
- [ ] Code reviewed

### Stripe Configuration
- [ ] Obtain production Stripe API keys from Stripe Dashboard
- [ ] Replace test keys with production keys in `.env`
- [ ] Verify keys start with `sk_live_` and `pk_live_`
- [ ] Never commit .env files to git

### Environment Setup
- [ ] Set up production environment variables:
  - [ ] Backend `.env` with production keys
  - [ ] Frontend `.env` with production key
- [ ] Enable HTTPS on your server
- [ ] Verify SSL certificate is valid

### Webhook Configuration
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Add endpoint with production URL
- [ ] Example: `https://yourdomain.com/api/payments/webhook`
- [ ] Select events:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
  - [ ] `charge.dispute.created`
- [ ] Copy signing secret
- [ ] Add to production `.env` as `STRIPE_WEBHOOK_SECRET`

### Server Deployment
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify environment variables are set
- [ ] Restart backend server
- [ ] Clear frontend cache/rebuild

### Production Testing
- [ ] Test with real test card in production environment
- [ ] Create test payment with small amount
- [ ] Verify payment appears in Stripe Dashboard
- [ ] Check webhook delivery logs
- [ ] Verify database records created
- [ ] Test payment history retrieval
- [ ] Test admin endpoints
- [ ] Test error handling
- [ ] Monitor logs for any errors

### Monitoring Setup
- [ ] Set up error logging service (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for payment failures
- [ ] Set up Stripe webhook monitoring
- [ ] Create payment dashboard for admins
- [ ] Set up daily/weekly reports

### Documentation
- [ ] Document production URLs
- [ ] Document API keys location
- [ ] Create runbook for common issues
- [ ] Document backup webhook setup
- [ ] Create incident response procedures

---

## 📝 File Verification Checklist

### Backend Files Created
- [ ] `backend/config/stripe.js` - Exists and contains stripe utilities
- [ ] `backend/models/Payment.js` - Exists with payment schema
- [ ] `backend/controllers/paymentController.js` - Exists with 6 functions
- [ ] `backend/controllers/adminPaymentController.js` - Exists with 5 functions
- [ ] `backend/routes/paymentRoutes.js` - Exists with user routes
- [ ] `backend/routes/adminPaymentRoutes.js` - Exists with admin routes
- [ ] `backend/webhooks/stripeWebhook.js` - Exists with webhook handlers

### Backend Files Updated
- [ ] `backend/package.json` - Contains stripe dependency
- [ ] `backend/.env` - Contains Stripe configuration
- [ ] `backend/index.js` - Contains admin payment routes
- [ ] `backend/controllers/paymentController.js` - Updated with new functions

### Frontend Files Updated
- [ ] `frontend/.env` - Contains STRIPE_PUBLISHABLE_KEY
- [ ] `frontend/package.json` - Contains @stripe packages
- [ ] `frontend/src/components/PaymentForm/PaymentForm.jsx` - Enhanced

### Documentation Files
- [ ] `STRIPE_INTEGRATION_GUIDE.md` - Created (400+ lines)
- [ ] `PAYMENT_API_DOCUMENTATION.md` - Created (500+ lines)

---

## 🔄 Ongoing Maintenance Checklist

### Weekly Tasks
- [ ] Review Stripe Dashboard for failed payments
- [ ] Check webhook delivery status
- [ ] Monitor error logs
- [ ] Review payment statistics

### Monthly Tasks
- [ ] Update dependencies: `npm audit`
- [ ] Review and optimize queries
- [ ] Analyze payment trends
- [ ] Check for fraud patterns
- [ ] Generate payment reports

### Quarterly Tasks
- [ ] Security audit
- [ ] Backup verification
- [ ] Performance review
- [ ] Disaster recovery test
- [ ] Update documentation

### Yearly Tasks
- [ ] Stripe compliance review
- [ ] PCI DSS verification (if needed)
- [ ] Security penetration testing
- [ ] Architecture review
- [ ] Technology upgrade assessment

---

## 🚨 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Stripe not loaded" | Check VITE_STRIPE_PUBLISHABLE_KEY in .env |
| Payment intent fails | Check STRIPE_SECRET_KEY, verify MongoDB connection |
| Webhook not received | Verify endpoint in Stripe Dashboard, check firewall |
| "Unauthorized" error | Verify JWT token, check user role for admin endpoints |
| Payment stuck as pending | Check webhook configuration, manually trigger webhook |
| Test cards not working | Verify test mode active, try different test card |

---

## 📧 Notification Setup (Optional)

- [ ] Email on payment success
- [ ] Email on payment failure
- [ ] Admin notification on refund
- [ ] Admin alert on high-value payments
- [ ] SMS notification option

---

## 🎓 Team Training Checklist

- [ ] Backend developers trained on payment flow
- [ ] Frontend developers trained on Stripe Elements
- [ ] Admins trained on payment dashboard
- [ ] Support team trained on payment troubleshooting
- [ ] DevOps trained on deployment & monitoring

---

## 📊 Performance Monitoring Checklist

- [ ] API response time < 500ms
- [ ] Payment creation < 2 seconds
- [ ] Payment confirmation < 3 seconds
- [ ] Database queries optimized
- [ ] Webhook processing < 5 seconds
- [ ] No memory leaks
- [ ] Error rate < 0.1%

---

## 🔐 Security Verification Checklist

- [ ] HTTPS enabled
- [ ] No hardcoded credentials
- [ ] API keys in .env (not committed)
- [ ] JWT tokens properly validated
- [ ] User authorization checked
- [ ] Admin role verified
- [ ] Webhook signatures verified
- [ ] SQL injection prevention
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)

---

## 💡 Useful Commands

### Backend Testing
```bash
# Check all endpoints
curl http://localhost:5000/api/payments/history -H "Authorization: Bearer YOUR_TOKEN"

# Check admin endpoints
curl http://localhost:5000/api/admin/payments -H "Authorization: Bearer ADMIN_TOKEN"

# Check webhook
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "stripe-signature: test" \
  -d "{}"
```

### Database Verification
```bash
# Check MongoDB connection
mongosh

# View Payment collection
use your_database_name
db.payments.find().limit(5)

# View Payment statistics
db.payments.aggregate([{$count: "total"}])
```

### Stripe CLI Commands
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Listen for webhooks
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger test event
stripe trigger payment_intent.succeeded

# View logs
stripe logs tail
```

---

## 📞 Support Contacts

- **Stripe Support**: support@stripe.com
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Status**: https://status.stripe.com
- **Your Team**: [Add team contact info]

---

## ✅ Final Sign-Off

- [ ] All checklist items completed
- [ ] System tested thoroughly
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Monitoring setup
- [ ] Ready for production

**Signed Off By:** ________________  
**Date:** ________________  
**Notes:** ________________________________________________

---

## 📚 Quick Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Integration Guide](./STRIPE_INTEGRATION_GUIDE.md)
- [API Documentation](./PAYMENT_API_DOCUMENTATION.md)

---

**Status:** ✅ Ready for Deployment
