# NGV Frontend API Contract (Integration Spec)

This document defines the API contract used by `src/lib/portal/httpService.ts`.

Switch frontend to real backend mode with:

- `NEXT_PUBLIC_USE_REMOTE_API=true`
- `NEXT_PUBLIC_API_URL=http://<backend-host>/api`

## Base URL

`/api`

## Auth

### GET `/auth/me`

Returns current user.

```json
{
  "id": "u1",
  "name": "Demo User",
  "email": "user@example.com",
  "role": "user"
}
```

### POST `/dev/switch-user` (dev helper)

Request:

```json
{ "role": "user" }
```

### POST `/auth/login`

Request:

```json
{ "email": "user@example.com", "password": "secret" }
```

### POST `/auth/register`

Request:

```json
{ "name": "John", "email": "john@example.com", "password": "secret" }
```

### POST `/auth/social-login`

Request:

```json
{ "provider": "google" }
```

### POST `/auth/password-reset/request`

Request:

```json
{ "email": "user@example.com" }
```

### POST `/auth/password-reset/confirm`

Request:

```json
{ "resetToken": "rst_xxx", "newPassword": "newSecret" }
```

### POST `/auth/logout`

Invalidates user session/token.

---

## Media

### GET `/media`

Query params:

- `search` (string)
- `genre` (string)
- `platform` (string)
- `releaseYear` (number)
- `minRating` (number)
- `maxRating` (number)
- `minPopularity` (number, total review count threshold)
- `sort`: `latest|highest-rated|most-reviewed`
- `page` (number)
- `pageSize` (number)

Response:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 12,
  "total": 0,
  "totalPages": 1
}
```

### GET `/media/:id`

Returns one media item or `null`.

### POST `/admin/media` (admin only)

Create media item.

### PATCH `/admin/media/:id` (admin only)

Update media item.

### DELETE `/admin/media/:id` (admin only)

Delete media item.

---

## Reviews

### GET `/reviews?mediaId=<id>&includePending=<bool>`

Returns review list for a media item.

### POST `/reviews`

Request:

```json
{
  "mediaId": "1",
  "rating": 9,
  "content": "Great title",
  "tags": ["classic", "family-friendly"],
  "spoiler": false
}
```

### PATCH `/reviews/:reviewId`

Update own unpublished review.

### DELETE `/reviews/:reviewId`

Delete own unpublished review.

### POST `/reviews/:reviewId/like`

Toggle like/unlike.

### GET `/reviews/:reviewId/comments`

List comments (may include `parentCommentId` for threaded replies).

### POST `/reviews/:reviewId/comments`

Request:

```json
{ "content": "Nice review", "parentCommentId": "c1" }
```

---

## Watchlist

### GET `/watchlist`

Returns media items in current user watchlist.

### POST `/watchlist/:mediaId`

Toggle add/remove watchlist.

Response:

```json
{ "saved": true }
```

---

## Payments

### POST `/payments/purchase`

Request:

```json
{
  "type": "subscription",
  "mediaId": "1",
  "payment": {
    "provider": "stripe",
    "plan": "monthly",
    "method": "card",
    "cardLast4": "4242",
    "walletNumber": null,
    "sendConfirmationEmail": true
  }
}
```

`type`: `rent|buy|subscription`

### GET `/payments/history`

Returns current user's purchase records.

### GET `/admin/payments` (admin only)

Returns all purchase/rental records for analytics.

### POST `/admin/payments/:purchaseId/revoke` (admin only)

Revoke access or mark as refunded.

---

## Admin Moderation & Analytics

### GET `/admin/reviews/pending`

List pending reviews.

### POST `/admin/reviews/:reviewId/approve`

Approve review for publication.

### POST `/admin/reviews/:reviewId/unpublish`

Unpublish review.

### DELETE `/admin/reviews/:reviewId`

Delete review and related comments.

### GET `/admin/comments/pending`

List hidden/unpublished comments.

### POST `/admin/comments/:commentId/approve`

Approve comment.

### POST `/admin/comments/:commentId/unpublish`

Hide/unpublish comment.

### DELETE `/admin/comments/:commentId`

Remove comment permanently.

### GET `/admin/overview`

Returns admin dashboard summary (users, media, pending, revenue, most-reviewed).

---

## Security Notes

- Backend should issue JWT tokens after login/register/social auth.
- Passwords must be hashed server-side (bcrypt/argon2), never stored plaintext.
- Reset tokens should be short-lived and single-use.

---

## Error format (recommended)

```json
{
  "message": "Human readable error",
  "code": "BAD_REQUEST",
  "details": {}
}
```
