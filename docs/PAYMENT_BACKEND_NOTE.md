# Payment Backend Integration Note

Frontend checkout route: `/card`

## Required APIs

### 1) Create subscription checkout
- **POST** `/api/payments/checkout/subscription`
- **Request body**
```json
{
  "type": "subscription",
  "plan": "monthly",
  "amount": 9.99,
  "currency": "USD",
  "paymentMethod": "visa",
  "emailReceipt": true,
  "card": {
    "number": "4111111111111111",
    "holder": "John Doe",
    "expiry": "12/28",
    "cvv": "123"
  },
  "wallet": null
}
```
- `paymentMethod` must support: `visa`, `debit_card`, `credit_card`, `bKash`, `nagad`, `rocket`
- For wallet methods, use `wallet: { provider, number }` and `card: null`

- **Success response**
```json
{
  "checkoutId": "chk_12345",
  "status": "pending",
  "transactionId": "txn_12345",
  "paymentUrl": "https://gateway.example/redirect/chk_12345",
  "message": "Checkout created"
}
```

### 2) Get checkout status (real-time polling)
- **GET** `/api/payments/checkout/:checkoutId/status`
- **Success response**
```json
{
  "checkoutId": "chk_12345",
  "status": "paid",
  "transactionId": "txn_12345",
  "paidAt": "2026-04-14T11:20:00.000Z",
  "message": "Payment completed"
}
```

`status` values: `pending | processing | paid | failed`

### 3) Existing history endpoint (already used by subscription page)
- **GET** `/api/payments/history`
- Return active subscription with `type=subscription`, `plan`, `expiresAt`, `status=active`

## Backend implementation checklist

1. Validate payment payload by method type (card vs wallet).
2. Tokenize sensitive card data (never store plain CVV).
3. Integrate real payment gateway providers for card + mobile wallet channels.
4. Save checkout + transaction state in DB (`pending`, `processing`, `paid`, `failed`).
5. Provide webhook endpoint from payment providers and update checkout status.
6. On `paid`, create/update subscription entitlement and set `expiresAt`.
7. Ensure idempotency for repeated checkout requests (`Idempotency-Key` recommended).
8. Secure all payment endpoints with authenticated user context.
9. Add audit log for payment attempts and gateway callback responses.

## Frontend env variables

Add and configure:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_USE_REMOTE_API=true`

Frontend is already prepared; once these endpoints are live, checkout and subscription activation will work end-to-end.
# Payment Backend Note (for `/card` checkout)

This note is for connecting the new frontend route: **`/card`**.

## 1) Required Environment Variable

Set in frontend (`.env.local`):

- `NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:5000/api`

Frontend will call:
- `POST {NEXT_PUBLIC_PAYMENT_API_URL}/purchases`
- `GET {NEXT_PUBLIC_PAYMENT_API_URL}/purchases/history`

> If this env is missing, checkout intentionally blocks (no demo fallback), so real integration is enforced.

---

## 2) Create Subscription Endpoint

### `POST /api/purchases`

Expected request body (minimum):

```json
{
  "type": "subscription",
  "plan": "monthly",
  "provider": "stripe",
  "method": "card",
  "cardLast4": "4242",
  "sendConfirmationEmail": true,
  "paymentMethodType": "visa",
  "walletNumber": null,
  "customer": {
    "name": "User Name",
    "email": "user@email.com"
  }
}
```

### Important backend validations

- `type` must be `subscription`
- `plan` must be `monthly | yearly`
- `method` must be `card | wallet`
- `paymentMethodType` must be one of:
  - `visa`
  - `debit_card`
  - `credit_card`
  - `bkash`
  - `nagad`
  - `rocket`
- For `method=card`: require secure tokenized card flow (never store raw PAN/CVV)
- For `method=wallet`: require wallet number + OTP/authorization with gateway

### Recommended success response

```json
{
  "id": "purchase_123",
  "clientSecret": "pi_xxxxx",
  "redirectUrl": "https://gateway.example/checkout"
}
```

If `redirectUrl` is present, frontend auto-redirects user.

---

## 3) Purchase History Endpoint

### `GET /api/purchases/history`

Return authenticated user purchases, newest first.

Frontend expects array items like:

```json
[
  {
    "id": "purchase_123",
    "type": "subscription",
    "plan": "monthly",
    "provider": "stripe",
    "method": "card",
    "amount": 990,
    "status": "active",
    "createdAt": "2026-04-14T10:00:00.000Z",
    "expiresAt": "2026-05-14T10:00:00.000Z"
  }
]
```

This endpoint is polled every 5 seconds from frontend.

---

## 4) Security Checklist (must)

- Use HTTPS only in production
- Verify auth session/JWT for every payment endpoint
- Validate amount server-side from plan (do not trust frontend amount)
- Store provider transaction reference ID
- Support webhook for final confirmation (Stripe/bKash/Nagad/Rocket aggregator)
- Idempotency key for duplicate-click protection
- Rate limit payment endpoints
- Audit log for every status change

---

## 5) Integration Tips

- Keep response `message` field for user-friendly error display
- Return proper HTTP status codes (`400/401/422/500`)
- For card payments, integrate PCI-compliant tokenization provider before charge creation
- For Bangladesh wallets (bKash/Nagad/Rocket), connect their official API or a trusted payment aggregator (e.g., SSLCommerz/PortWallet style flow)
