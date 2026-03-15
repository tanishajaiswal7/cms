# Stripe Integration Guide

## Overview
This project uses Stripe for resident rent payments with:
- PaymentIntent creation
- Frontend card confirmation via Stripe Elements
- Backend payment confirmation
- Webhook-based status synchronization

## Implemented Components

### Backend
- Config: `backend/config/stripe.js`
- Model: `backend/models/Payment.js`
- Controller: `backend/controllers/paymentController.js`
- Admin controller: `backend/controllers/adminPaymentController.js`
- User routes: `backend/routes/paymentRoutes.js`
- Admin routes: `backend/routes/adminPaymentRoutes.js`
- Webhook handler: `backend/webhooks/stripeWebhook.js`

### Frontend
- Stripe provider in `frontend/src/App.jsx`
- Payment modal: `frontend/src/components/PaymentForm/PaymentForm.jsx`
- Resident payment page: `frontend/src/pages/PayYourRent/PayYourRent.jsx`

## Required Environment Variables

### Backend (`backend/.env`)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend (`frontend/.env`)
- `VITE_STRIPE_PUBLISHABLE_KEY`

## API Surface

### Resident/User Endpoints
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`
- `GET /api/payments/history`
- `GET /api/payments/:paymentId`
- `POST /api/payments/:paymentId/refund`

### Admin Endpoints
- `GET /api/admin/payments`
- `GET /api/admin/payments/stats`
- `GET /api/admin/payments/:paymentId`
- `GET /api/admin/payments/export/:format`
- `GET /api/admin/payments/resident/:residentId`

### Webhook
- `POST /api/payments/webhook`

## Payment Flow
1. Resident clicks pay in rent UI.
2. Frontend requests PaymentIntent from backend (`create-intent`).
3. Frontend confirms card using Stripe Elements.
4. Frontend calls backend `confirm` endpoint.
5. Backend marks payment/rent as paid.
6. Stripe webhook events keep records synchronized.

## Hardening in Place
- Amount validation against due amount.
- Resident authorization checks before intent/confirm.
- Webhook signature verification.
- Automatic payment methods configured with redirects disabled:
  - `automatic_payment_methods.enabled = true`
  - `automatic_payment_methods.allow_redirects = "never"`

## Webhook Events Handled
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

## Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3DS flow card: `4000 0000 0000 3220`

## Production Checklist (Short)
- Use live Stripe keys only in production.
- Serve backend/frontend over HTTPS.
- Configure production webhook endpoint in Stripe dashboard.
- Monitor webhook delivery and payment failures.
- Keep secrets out of logs and version control.

## Troubleshooting
- `create-intent` fails: verify rent ownership, due amount, and Stripe secret key.
- `confirm` fails: ensure PaymentIntent is `succeeded` and rent belongs to token user.
- Webhook issues: verify `STRIPE_WEBHOOK_SECRET` and raw body route ordering.

## Related Docs
- `PAYMENT_API_DOCUMENTATION.md`
- `STRIPE_DEPLOYMENT_CHECKLIST.md`
- `STRIPE_PRODUCTION_SETUP.md`
- `STRIPE_SECURITY_BEST_PRACTICES.md`
