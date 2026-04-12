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

---

## Media

### GET `/media`
Query params:
- `search` (string)
- `genre` (string)
- `platform` (string)
- `releaseYear` (number)
- `minRating` (number)
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
List comments.

### POST `/reviews/:reviewId/comments`
Request:
```json
{ "content": "Nice review" }
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
{ "type": "rent", "mediaId": "1" }
```
`type`: `rent|buy|subscription`

### GET `/payments/history`
Returns purchase records.

---

## Admin Moderation

### GET `/admin/reviews/pending`
List pending reviews.

### POST `/admin/reviews/:reviewId/approve`
Approve review for publication.

### POST `/admin/reviews/:reviewId/unpublish`
Unpublish review.

### DELETE `/admin/reviews/:reviewId`
Delete review and related comments.

---

## Error format (recommended)

```json
{
  "message": "Human readable error",
  "code": "BAD_REQUEST",
  "details": {}
}
```
