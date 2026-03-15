# Rent Feature Guide

## Overview
This guide documents the implemented rent management flow:
- Admin creates and manages monthly rent records.
- Residents view their rent details and pay via Stripe flow.

## Scope Implemented

### Backend
- Model: `backend/models/Rent.js`
- Controller: `backend/controllers/rentController.js`
- Routes: `backend/routes/rentRoutes.js`
- Mounted in: `backend/index.js`

### Frontend
- Admin page: `frontend/src/pages/AdminRentManagement/AdminRentManagement.jsx`
- Resident page: `frontend/src/pages/PayYourRent/PayYourRent.jsx`
- Payment modal: `frontend/src/components/PaymentForm/PaymentForm.jsx`
- Route wiring: `frontend/src/App.jsx`
- Navigation links: `frontend/src/components/Navbar/Navbar.jsx`

## Rent Data Model (Core Fields)
`Rent` stores:
- `residentId`, `month`
- `rentAmount`, `additionalCharges`, `fine`, `totalAmount`
- `status` (`unpaid|partial|paid`), `paidAmount`
- `dueDate`, `paidDate`, `paidAt`, `paymentIntentId`
- `notes`, `createdBy`, timestamps

`totalAmount` is calculated before save from rent + charges + fine.

## API Endpoints

### Admin
- `POST /api/rents` — create rent
- `GET /api/rents` — list rents (filters via query)
- `PUT /api/rents/:id` — update rent
- `PATCH /api/rents/:id/status` — update payment status
- `DELETE /api/rents/:id` — delete rent
- `GET /api/rents/stats` — rent statistics

### Resident
- `GET /api/rents/resident/:residentId` — resident rent history
- `GET /api/rents/current-month` — current month rent

## Access Control
- Admin routes require authenticated user with `role = admin`.
- Residents can read only their own rent data.

## Payment Status Flow
- New rent starts as `unpaid`.
- Partial payment sets `status = partial`.
- Full payment sets `status = paid`, updates `paidAmount`, `paidDate`/`paidAt`.

## Frontend Behavior

### Admin Rent Management
- Select resident and month.
- Enter rent amount, additional charges, and fine.
- Total is shown in UI and persisted by backend model calculation.
- Edit/delete existing rent records.

### Resident Rent View
- Shows current month by default.
- Month selector allows viewing historical rent records.
- Displays breakup and due amount.
- If unpaid, opens payment modal.

## Validation Notes
- Duplicate rent for same resident/month is blocked.
- Amount fields are normalized as numbers.
- Authorization checks are enforced on backend.

## Quick Troubleshooting
- `404` on current month: no record exists for current month.
- `403` on rent endpoints: token role/user mismatch.
- UI fetch issues: verify backend URL and auth token in frontend API client.

## Related Docs
- `PAYMENT_API_DOCUMENTATION.md`
- `STRIPE_INTEGRATION_GUIDE.md`
- `STRIPE_DEPLOYMENT_CHECKLIST.md`
