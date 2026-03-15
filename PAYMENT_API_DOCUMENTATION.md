# Payment API Documentation

## 🔐 Authentication

All endpoints (except webhooks) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Admin endpoints require the user to have `role: "admin"`.

---

## 👤 User Payment Endpoints

### 1. Create Payment Intent
Creates a Stripe PaymentIntent for a rent payment.

**Endpoint:** `POST /api/payments/create-intent`

**Authentication:** Required (Authenticated User)

**Request Body:**
```json
{
  "rentId": "607f1f77bcf86cd799439011",
  "amount": 15000
}
```

**Parameters:**
- `rentId` (string, required): MongoDB ID of the rent to pay
- `amount` (number, required): Amount in rupees

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "rentId": "607f1f77bcf86cd799439011",
    "amount": 15000
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_1TAm4p3Rj1d3BAeM_secret_6H7F8G9H0I1J2K3L4M",
    "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
    "paymentId": "607f1f77bcf86cd799439015",
    "publishableKey": "pk_test_51TAm4p3Rj1d3BAeM0O2mZ9tgK4nQ5kL6mN7oP8qR9sTuVwXyZaBcDeF0GhI1JkL2MnOpQ3rStUvWxYzAbCdEFGhI1J2kL3m"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `403 Forbidden`: User is not authorized to pay this rent
- `404 Not Found`: Rent not found
- `500 Internal Server Error`: Server error

---

### 2. Confirm Payment
Confirms the payment after successful card processing with Stripe.

**Endpoint:** `POST /api/payments/confirm`

**Authentication:** Required (Authenticated User)

**Request Body:**
```json
{
  "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
  "rentId": "607f1f77bcf86cd799439011"
}
```

**Parameters:**
- `paymentIntentId` (string, required): Stripe PaymentIntent ID from step 1
- `rentId` (string, required): MongoDB ID of the rent

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
    "rentId": "607f1f77bcf86cd799439011"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "rent": {
      "_id": "607f1f77bcf86cd799439011",
      "month": "2024-03",
      "rentAmount": 15000,
      "totalAmount": 15000,
      "status": "paid",
      "paidAt": "2024-03-14T10:30:00Z"
    },
    "payment": {
      "_id": "607f1f77bcf86cd799439015",
      "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
      "amount": 15000,
      "status": "succeeded",
      "paidAt": "2024-03-14T10:30:00Z"
    }
  }
}
```

---

### 3. Get Payment History
Retrieves all payments for the authenticated user.

**Endpoint:** `GET /api/payments/history`

**Authentication:** Required (Authenticated User)

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, succeeded, failed, canceled, refunded)
- `limit` (number, optional): Number of records per page (default: 10, max: 100)
- `skip` (number, optional): Number of records to skip for pagination (default: 0)

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/payments/history?status=succeeded&limit=10&skip=0" \
  -H "Authorization: Bearer your_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439015",
      "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
      "amount": 15000,
      "currency": "inr",
      "status": "succeeded",
      "paymentMethodType": "card",
      "paidAt": "2024-03-14T10:30:00Z",
      "createdAt": "2024-03-14T10:29:00Z",
      "rentId": {
        "_id": "607f1f77bcf86cd799439011",
        "month": "2024-03",
        "rentAmount": 15000,
        "totalAmount": 15000
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "skip": 0,
    "pages": 1
  }
}
```

---

### 4. Get Payment Details
Retrieves details of a specific payment.

**Endpoint:** `GET /api/payments/:paymentId`

**Authentication:** Required (Authenticated User)

**Parameters:**
- `paymentId` (string, required): MongoDB ID of the payment (path parameter)

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/payments/607f1f77bcf86cd799439015 \
  -H "Authorization: Bearer your_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439015",
    "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
    "chargeId": "ch_1TAm4p3Rj1d3BAeM0O2mZ9tg",
    "residentId": "507f1f77bcf86cd799439011",
    "rentId": "607f1f77bcf86cd799439011",
    "amount": 15000,
    "currency": "inr",
    "status": "succeeded",
    "paymentMethodType": "card",
    "last4Digits": "4242",
    "description": "Rent payment for 2024-03",
    "paidAt": "2024-03-14T10:30:00Z",
    "webhookProcessed": true,
    "createdAt": "2024-03-14T10:29:00Z",
    "updatedAt": "2024-03-14T10:30:00Z"
  }
}
```

---

### 5. Request Refund
Requests a refund for a successful payment.

**Endpoint:** `POST /api/payments/:paymentId/refund`

**Authentication:** Required (Authenticated User)

**Path Parameters:**
- `paymentId` (string, required): MongoDB ID of the payment

**Request Body:**
```json
{
  "reason": "Customer requested"
}
```

**Parameters:**
- `reason` (string, optional): Reason for the refund

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/payments/607f1f77bcf86cd799439015/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "reason": "Customer requested"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439015",
    "paymentIntentId": "pi_1TAm4p3Rj1d3BAeM",
    "amount": 15000,
    "status": "refunded",
    "refundId": "re_1TAm4p3Rj1d3BAeM0O2mZ9tg",
    "refundAmount": 15000,
    "refundStatus": "full",
    "refundReason": "Customer requested",
    "refundedAt": "2024-03-14T11:00:00Z"
  }
}
```

---

### 6. Stripe Webhook Handler
Handles Stripe webhook events.

**Endpoint:** `POST /api/payments/webhook`

**Authentication:** Not required (Stripe signature verification)

**Headers:**
- `stripe-signature` (required): Stripe webhook signature

**Events Handled:**
- `payment_intent.succeeded`: Payment completed
- `payment_intent.payment_failed`: Payment failed
- `charge.refunded`: Payment refunded
- `charge.dispute.created`: Dispute created

**Example Response:**
```json
{
  "received": true
}
```

---

## 🛡️ Admin Payment Endpoints

### 1. Get All Payments
Retrieves all payments in the system with filters.

**Endpoint:** `GET /api/admin/payments`

**Authentication:** Required (Admin user)

**Query Parameters:**
- `status` (string, optional): Filter by status
- `residentId` (string, optional): Filter by resident
- `rentId` (string, optional): Filter by rent
- `startDate` (string, optional): ISO date string (e.g., 2024-03-01)
- `endDate` (string, optional): ISO date string (e.g., 2024-03-31)
- `limit` (number, optional): Records per page (default: 20)
- `skip` (number, optional): Records to skip (default: 0)
- `sortBy` (string, optional): Sort field (default: createdAt)
- `sortOrder` (string, optional): 'asc' or 'desc' (default: desc)

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/admin/payments?status=succeeded&limit=20&skip=0" \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [ /* Array of payment objects */ ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "skip": 0,
    "pages": 8
  }
}
```

---

### 2. Get Payment Statistics
Retrieves payment statistics and analytics.

**Endpoint:** `GET /api/admin/payments/stats`

**Authentication:** Required (Admin user)

**Query Parameters:**
- `startDate` (string, optional): ISO date string
- `endDate` (string, optional): ISO date string

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/admin/payments/stats" \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPayments": 150,
      "totalAmount": 2250000,
      "avgAmount": 15000
    },
    "byStatus": [
      {
        "_id": "succeeded",
        "count": 145,
        "total": 2175000
      },
      {
        "_id": "failed",
        "count": 5,
        "total": 75000
      }
    ],
    "byPaymentMethod": [
      {
        "_id": "card",
        "count": 150,
        "total": 2250000
      }
    ],
    "dailyStats": [
      {
        "_id": "2024-03-13",
        "count": 25,
        "total": 375000
      },
      {
        "_id": "2024-03-14",
        "count": 30,
        "total": 450000
      }
    ],
    "topResidents": [
      {
        "residentId": "507f1f77bcf86cd799439011",
        "resident": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "totalPaid": 45000,
        "paymentCount": 3
      }
    ]
  }
}
```

---

### 3. Get Payment Details (Admin)
Retrieves detailed information about a specific payment.

**Endpoint:** `GET /api/admin/payments/:paymentId`

**Authentication:** Required (Admin user)

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/admin/payments/607f1f77bcf86cd799439015 \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* Payment object with populated resident and rent info */ }
}
```

---

### 4. Export Payments
Exports payment records as CSV or JSON.

**Endpoint:** `GET /api/admin/payments/export/:format`

**Authentication:** Required (Admin user)

**Path Parameters:**
- `format` (string, required): Export format ('csv' or 'json')

**Query Parameters:**
- `status` (string, optional): Filter by status
- `startDate` (string, optional): ISO date string
- `endDate` (string, optional): ISO date string

**Example cURL (CSV):**
```bash
curl -X GET "http://localhost:5000/api/admin/payments/export/csv?status=succeeded" \
  -H "Authorization: Bearer admin_jwt_token" \
  > payments_export.csv
```

**Example cURL (JSON):**
```bash
curl -X GET "http://localhost:5000/api/admin/payments/export/json" \
  -H "Authorization: Bearer admin_jwt_token" \
  > payments_export.json
```

**Success Response (200):**
- CSV Format: File download with payment records as CSV
- JSON Format: JSON array of payment objects

---

### 5. Get Resident Payment History
Retrieves payment history for a specific resident.

**Endpoint:** `GET /api/admin/payments/resident/:residentId`

**Authentication:** Required (Admin user)

**Path Parameters:**
- `residentId` (string, required): MongoDB ID of the resident

**Query Parameters:**
- `limit` (number, optional): Records per page (default: 20)
- `skip` (number, optional): Records to skip (default: 0)

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/admin/payments/resident/507f1f77bcf86cd799439011?limit=20" \
  -H "Authorization: Bearer admin_jwt_token"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "resident": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "address": "123 Main St"
    },
    "payments": [ /* Array of payment objects */ ],
    "summary": {
      "totalPayments": 12,
      "totalPaid": 180000,
      "successfulPayments": 10,
      "failedPayments": 1,
      "refundedPayments": 1,
      "totalRefunded": 15000
    },
    "pagination": {
      "total": 12,
      "limit": 20,
      "skip": 0,
      "pages": 1
    }
  }
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400 Bad Request`: Invalid data or parameters
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 🧪 Testing with Test Cards

Use these test cards in development/testing:

| Card Number | CVC | Expiry | Result |
|------------|-----|--------|--------|
| 4242 4242 4242 4242 | Any 3 digits | Any future | Successful |
| 4000 0000 0000 0002 | Any 3 digits | Any future | Declined |
| 4000 0000 0000 3220 | Any 3 digits | Any future | 3D Secure |

---

## 📝 Request/Response Examples

### Complete Payment Flow Example

**1. Create Intent:**
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"rentId": "607f1f77bcf86cd799439011", "amount": 15000}'
```

Response:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_..."
  }
}
```

**2. Process with Stripe (Frontend)**

**3. Confirm Payment:**
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "paymentIntentId": "pi_...",
    "rentId": "607f1f77bcf86cd799439011"
  }'
```

**4. Stripe Webhook**
Stripe automatically sends webhook event to `/api/payments/webhook`

---

## 🔗 Related Documentation

- [Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/elements/payment-request-button)

---

**Last Updated:** March 2026
**API Version:** 1.0
