# NGV Backend API Documentation

## Overview

This document outlines all the API endpoints that need to be implemented in the backend to support the fully dynamic NGV (Next.js Video) platform frontend.

**Frontend Status**: ✅ Complete - All pages are now fully dynamic and ready for API integration

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Media/Content APIs](#mediacontent-apis)
3. [User APIs](#user-apis)
4. [Review/Rating APIs](#reviewrating-apis)
5. [Watchlist APIs](#watchlist-apis)
6. [Payment/Subscription APIs](#paymentsubscription-apis)
7. [Admin APIs](#admin-apis)
8. [Error Handling](#error-handling)

---

## Authentication APIs

These endpoints handle user authentication and are already configured in Better Auth but need backend database persistence.

### 1. **POST /api/auth/email/signup**
- **Purpose**: Register a new user with email and password
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```

### 2. **POST /api/auth/email/signin**
- **Purpose**: Login with email and password
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```

### 3. **POST /api/auth/social/signin**
- **Purpose**: Login via social providers (Google, GitHub, Facebook)
- **Body**:
  ```json
  {
    "provider": "google|github|facebook",
    "idToken": "provider_token_from_frontend"
  }
  ```
- **Response (200)**: User object (same as email signin)

### 4. **POST /api/auth/forgot-password**
- **Purpose**: Request password reset email
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "redirectTo": "https://ngv-app.com/reset-password"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### 5. **POST /api/auth/reset-password**
- **Purpose**: Reset password with token
- **Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Password reset successful"
  }
  ```

### 6. **GET /api/auth/session**
- **Purpose**: Get current authenticated user
- **Response (200)**:
  ```json
  {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user|admin"
    }
  }
  ```

### 7. **POST /api/auth/signout**
- **Purpose**: Logout current user
- **Response (200)**:
  ```json
  {
    "success": true
  }
  ```

---

## Media/Content APIs

These endpoints provide all media content (movies, series, documentaries).

### 1. **GET /api/media**
- **Purpose**: List all media with pagination and filtering
- **Query Parameters**:
  ```
  ?page=1
  &pageSize=12
  &search=dark knight
  &genre=Action
  &platform=NGV
  &releaseYear=2024
  &minRating=7
  &maxRating=10
  &minPopularity=50
  &sort=latest|highest-rated|most-reviewed
  ```
- **Response (200)**:
  ```json
  {
    "items": [
      {
        "id": "media_1",
        "title": "The Dark Knight Returns",
        "synopsis": "When evil rises, a hero must answer...",
        "genres": ["Action", "Thriller"],
        "releaseYear": 2024,
        "director": "Christopher Nolan",
        "cast": ["Actor 1", "Actor 2"],
        "platforms": ["NGV"],
        "pricing": "premium",
        "poster": "https://...",
        "duration": "2h 45m",
        "avgRating": 8.9,
        "totalReviews": 1250
      }
    ],
    "total": 250,
    "page": 1,
    "pageSize": 12
  }
  ```

### 2. **GET /api/media/:id**
- **Purpose**: Get detailed information about a specific media
- **Response (200)**:
  ```json
  {
    "id": "media_1",
    "title": "The Dark Knight Returns",
    "synopsis": "When evil rises, a hero must answer...",
    "genres": ["Action", "Thriller"],
    "releaseYear": 2024,
    "director": "Christopher Nolan",
    "cast": ["Christian Bale", "Heath Ledger"],
    "platforms": ["NGV"],
    "pricing": "premium",
    "streamingUrl": "https://stream.ngv.com/...",
    "poster": "https://...",
    "duration": "2h 45m",
    "avgRating": 8.9,
    "totalReviews": 1250
  }
  ```

### 3. **GET /api/media/trending**
- **Purpose**: Get trending media (for homepage)
- **Query Parameters**:
  ```
  ?limit=6
  ```
- **Response (200)**:
  ```json
  [
    {
      "id": "media_1",
      "title": "The Dark Knight Returns",
      ...media object fields
    }
  ]
  ```

### 4. **GET /api/media/featured**
- **Purpose**: Get featured/recommended media (for homepage hero)
- **Response (200)**:
  ```json
  [
    {
      "id": "media_1",
      ...media object fields
    }
  ]
  ```

### 5. **GET /api/media/new-releases**
- **Purpose**: Get recently released media
- **Query Parameters**:
  ```
  ?limit=6
  ```
- **Response (200)**:
  ```json
  [
    {
      "id": "media_1",
      ...media object fields
    }
  ]
  ```

### 6. **GET /api/media/recommendations**
- **Purpose**: Get personalized recommendations for current user
- **Response (200)**:
  ```json
  [
    {
      "id": "media_1",
      ...media object fields
    }
  ]
  ```

### 7. **GET /api/categories**
- **Purpose**: Get all content categories
- **Response (200)**:
  ```json
  [
    {
      "id": "cat_1",
      "name": "Action",
      "icon": "icon-name"
    }
  ]
  ```

### 8. **PUT /api/media/:id** (Admin Only)
- **Purpose**: Update media information
- **Body**: Media object with updated fields
- **Response (200)**: Updated media object

### 9. **DELETE /api/media/:id** (Admin Only)
- **Purpose**: Delete media
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Media deleted"
  }
  ```

---

## User APIs

### 1. **GET /api/users/me**
- **Purpose**: Get current user profile
- **Response (200)**:
  ```json
  {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user|admin"
  }
  ```

### 2. **PUT /api/users/me**
- **Purpose**: Update current user profile
- **Body**:
  ```json
  {
    "name": "John Doe Updated",
    "email": "newemail@example.com"
  }
  ```
- **Response (200)**: Updated user object

### 3. **GET /api/dashboard/stats**
- **Purpose**: Get user dashboard statistics
- **Response (200)**:
  ```json
  {
    "totalWatchTime": "24h 32m",
    "currentPlan": "Premium",
    "planExpiresAt": "2025-05-12T10:30:00Z"
  }
  ```

### 4. **GET /api/users/me/watch-history**
- **Purpose**: Get user's watch history
- **Query Parameters**:
  ```
  ?limit=10
  &offset=0
  ```
- **Response (200)**:
  ```json
  [
    {
      "mediaId": "media_1",
      "title": "The Dark Knight Returns",
      "poster": "https://...",
      "watchedAt": "2025-01-10T15:30:00Z",
      "progressSeconds": 8100
    }
  ]
  ```

### 5. **PUT /api/users/me/watch-progress/:mediaId**
- **Purpose**: Update watch progress for a media
- **Body**:
  ```json
  {
    "progressSeconds": 1234
  }
  ```
- **Response (200)**:
  ```json
  {
    "mediaId": "media_1",
    "progressSeconds": 1234,
    "updatedAt": "2025-01-10T15:30:00Z"
  }
  ```

---

## Review/Rating APIs

### 1. **GET /api/media/:mediaId/reviews**
- **Purpose**: Get reviews for a media
- **Query Parameters**:
  ```
  ?limit=10
  &offset=0
  &includePending=false
  ```
- **Response (200)**:
  ```json
  [
    {
      "id": "review_1",
      "mediaId": "media_1",
      "userId": "user_123",
      "userName": "John Doe",
      "rating": 5,
      "content": "Amazing movie!",
      "tags": ["action", "thrilling"],
      "spoiler": false,
      "isPublished": true,
      "likes": 245,
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
  ```

### 2. **POST /api/media/:mediaId/reviews**
- **Purpose**: Create a new review (requires auth)
- **Body**:
  ```json
  {
    "rating": 5,
    "content": "Amazing movie!",
    "tags": ["action"],
    "spoiler": false
  }
  ```
- **Response (201)**: Review object

### 3. **PUT /api/reviews/:reviewId**
- **Purpose**: Update own review (only if unpublished)
- **Body**:
  ```json
  {
    "rating": 4,
    "content": "Great movie!",
    "tags": ["action"],
    "spoiler": false
  }
  ```
- **Response (200)**: Updated review object

### 4. **DELETE /api/reviews/:reviewId**
- **Purpose**: Delete own unpublished review
- **Response (200)**:
  ```json
  {
    "success": true
  }
  ```

### 5. **POST /api/reviews/:reviewId/like**
- **Purpose**: Toggle like on a review
- **Response (200)**:
  ```json
  {
    "reviewId": "review_1",
    "likes": 246,
    "isLiked": true
  }
  ```

### 6. **POST /api/reviews/:reviewId/comments**
- **Purpose**: Add comment to a review
- **Body**:
  ```json
  {
    "content": "I agree completely!",
    "parentCommentId": "comment_1"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "comment_1",
    "reviewId": "review_1",
    "userId": "user_123",
    "userName": "Jane Smith",
    "content": "I agree completely!",
    "parentCommentId": null,
    "createdAt": "2025-01-10T10:30:00Z"
  }
  ```

### 7. **GET /api/reviews/:reviewId/comments**
- **Purpose**: Get comments for a review
- **Response (200)**:
  ```json
  [
    {
      "id": "comment_1",
      "reviewId": "review_1",
      "userId": "user_123",
      "userName": "Jane Smith",
      "content": "I agree completely!",
      "parentCommentId": null,
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
  ```

---

## Watchlist APIs

### 1. **GET /api/watchlist**
- **Purpose**: Get user's watchlist (requires auth)
- **Response (200)**:
  ```json
  [
    {
      "id": "media_1",
      "title": "The Dark Knight Returns",
      "poster": "https://...",
      "avgRating": 8.9,
      "addedAt": "2025-01-10T10:30:00Z"
    }
  ]
  ```

### 2. **POST /api/watchlist/:mediaId**
- **Purpose**: Add media to watchlist (toggle on/off)
- **Response (200)**:
  ```json
  {
    "mediaId": "media_1",
    "action": "added|removed"
  }
  ```

### 3. **DELETE /api/watchlist/:mediaId**
- **Purpose**: Remove media from watchlist
- **Response (200)**:
  ```json
  {
    "success": true
  }
  ```

---

## Payment/Subscription APIs

### 1. **GET /api/purchases/history**
- **Purpose**: Get user's purchase history (requires auth)
- **Response (200)**:
  ```json
  [
    {
      "id": "purchase_1",
      "type": "rent|buy|subscription",
      "mediaId": "media_1",
      "mediaTitle": "The Dark Knight Returns",
      "provider": "stripe|paypal|razorpay",
      "amount": 4.99,
      "status": "active|expired|revoked",
      "expiresAt": "2025-02-10T10:30:00Z",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
  ```

### 2. **GET /api/purchases**
- **Purpose**: Get all purchases (admin only)
- **Response (200)**: Array of purchase objects

### 3. **POST /api/purchases**
- **Purpose**: Create a new purchase/subscription
- **Body**:
  ```json
  {
    "type": "rent|buy|subscription",
    "mediaId": "media_1",
    "plan": "monthly|yearly",
    "provider": "stripe|paypal|razorpay",
    "method": "card|wallet",
    "cardLast4": "4242",
    "sendConfirmationEmail": true
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "purchase_1",
    "clientSecret": "pi_xxxxx",
    "redirectUrl": "https://checkout.stripe.com/..."
  }
  ```

### 4. **POST /api/purchases/:purchaseId/revoke**
- **Purpose**: Revoke/cancel a purchase or subscription
- **Response (200)**:
  ```json
  {
    "success": true,
    "refundAmount": 4.99
  }
  ```

---

## Admin APIs

### 1. **GET /api/admin/overview**
- **Purpose**: Get admin dashboard overview (admin only)
- **Response (200)**:
  ```json
  {
    "totalUsers": 15250,
    "totalMedia": 2500,
    "totalRevenue": 125000,
    "pendingReviews": 45,
    "activeSubscriptions": 8500
  }
  ```

### 2. **GET /api/admin/reviews/pending**
- **Purpose**: Get pending reviews for moderation (admin only)
- **Response (200)**:
  ```json
  [
    {
      "id": "review_1",
      "mediaTitle": "The Dark Knight Returns",
      "userName": "John Doe",
      "rating": 5,
      "content": "Amazing movie!",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
  ```

### 3. **POST /api/admin/reviews/:reviewId/approve**
- **Purpose**: Approve a pending review (admin only)
- **Response (200)**:
  ```json
  {
    "success": true,
    "reviewId": "review_1"
  }
  ```

### 4. **POST /api/admin/reviews/:reviewId/reject**
- **Purpose**: Reject a pending review (admin only)
- **Response (200)**:
  ```json
  {
    "success": true,
    "reviewId": "review_1"
  }
  ```

### 5. **POST /api/admin/media**
- **Purpose**: Create new media (admin only)
- **Body**:
  ```json
  {
    "title": "New Movie",
    "synopsis": "Description...",
    "genres": ["Action"],
    "releaseYear": 2025,
    "director": "Director Name",
    "cast": ["Actor 1", "Actor 2"],
    "platforms": ["NGV"],
    "pricing": "premium",
    "streamingUrl": "https://stream.ngv.com/...",
    "poster": "https://...",
    "duration": "2h 30m"
  }
  ```
- **Response (201)**: Created media object

---

## Error Handling

All endpoints should return appropriate HTTP status codes with error messages in this format:

### Error Response Format
```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Optional additional details"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (no permission)
- **404**: Not Found
- **409**: Conflict (e.g., duplicate email)
- **422**: Unprocessable Entity (validation error)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

### Common Error Codes

```
INVALID_CREDENTIALS
USER_NOT_FOUND
MEDIA_NOT_FOUND
REVIEW_NOT_FOUND
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
DATABASE_ERROR
EXTERNAL_SERVICE_ERROR
RATE_LIMIT_EXCEEDED
```

---

## Authentication Headers

All authenticated endpoints require:

```
Authorization: Bearer {token}
```

Where token is obtained from the auth endpoints.

---

## Rate Limiting

Recommended rate limits per IP:

- **Global**: 1000 requests/hour
- **Auth endpoints**: 10 requests/minute (login, signup)
- **Payment endpoints**: 50 requests/hour
- **Public endpoints**: 500 requests/hour

---

## Database Models

### User Model
```
{
  id: String (UUID)
  name: String
  email: String (unique)
  passwordHash: String (nullable for social auth)
  role: "user" | "admin"
  createdAt: DateTime
  updatedAt: DateTime
  lastLoginAt: DateTime (nullable)
}
```

### Media Model
```
{
  id: String (UUID)
  title: String
  synopsis: String
  genres: String[] (array of genre names)
  releaseYear: Number
  director: String
  cast: String[] (array of actor names)
  platforms: String[] (array of platform names)
  pricing: "free" | "premium"
  streamingUrl: String
  poster: String (URL)
  duration: String (e.g., "2h 45m")
  avgRating: Number (0-10)
  totalReviews: Number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Review Model
```
{
  id: String (UUID)
  mediaId: String (foreign key to Media)
  userId: String (foreign key to User)
  rating: Number (1-5)
  content: String
  tags: String[] (array of tag names)
  spoiler: Boolean
  isPublished: Boolean
  likes: Number
  likedBy: String[] (array of user IDs)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Purchase Model
```
{
  id: String (UUID)
  userId: String (foreign key to User)
  mediaId: String (foreign key to Media, nullable for subscriptions)
  type: "rent" | "buy" | "subscription"
  plan: "monthly" | "yearly" (nullable)
  provider: "stripe" | "paypal" | "razorpay"
  method: "card" | "wallet"
  amount: Number
  expiresAt: DateTime (nullable)
  status: "active" | "expired" | "revoked" | "refunded"
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Frontend Integration Points

All the following frontend pages are **fully ready** for API integration:

1. ✅ **Home Page** (`/`) - Uses: `getTrending`, `getFeatured`, `getNewReleases`
2. ✅ **Watch Page** (`/watch/:id`) - Uses: `getMediaById`, `getReviews`
3. ✅ **Library Page** (`/library`) - Uses: `listMedia` with filters
4. ✅ **Categories Page** (`/categories`) - Uses: `getCategories`, `getCategoryVideos`
5. ✅ **Dashboard Page** (`/dashboard`) - Uses: `getStats`, `getFavorites`, `getWatchHistory`
6. ✅ **Profile Page** (`/profile`) - Uses: `getCurrentUser`, `updateUser`
7. ✅ **Login Page** (`/login`) - Uses Auth APIs
8. ✅ **Signup Page** (`/signup`) - Uses Auth APIs
9. ✅ **Admin Panel** (`/admin`) - Uses Admin APIs

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up database (PostgreSQL/MongoDB/etc)
- [ ] Configure authentication (Better Auth with database)
- [ ] Set up payment provider (Stripe/PayPal/Razorpay)
- [ ] Configure social OAuth (Google, GitHub, Facebook)
- [ ] Set up environment variables
- [ ] Implement error handling middleware

### Phase 2: Authentication & User
- [ ] Implement auth endpoints (signup, signin, logout, reset password)
- [ ] Implement social OAuth flow
- [ ] Implement user profile endpoints
- [ ] Implement session management
- [ ] Set up JWT/Session tokens

### Phase 3: Content Management
- [ ] Implement media list/search/filter endpoints
- [ ] Implement media detail endpoint
- [ ] Implement media categories endpoint
- [ ] Implement trending/featured/new releases endpoints
- [ ] Set up media database seeding

### Phase 4: User Features
- [ ] Implement dashboard stats endpoint
- [ ] Implement watchlist endpoints
- [ ] Implement watch history tracking
- [ ] Implement watch progress tracking
- [ ] Implement favorites management

### Phase 5: Reviews & Community
- [ ] Implement review creation/update/delete
- [ ] Implement review listing with pagination
- [ ] Implement review likes toggle
- [ ] Implement comments on reviews
- [ ] Implement review moderation queue

### Phase 6: Payments & Subscriptions
- [ ] Integrate payment provider
- [ ] Implement purchase creation
- [ ] Implement subscription management
- [ ] Implement refund/cancellation
- [ ] Set up webhooks for payment confirmations

### Phase 7: Admin Features
- [ ] Implement admin dashboard
- [ ] Implement review moderation endpoints
- [ ] Implement media management endpoints
- [ ] Implement user analytics
- [ ] Implement admin authentication/authorization

---

## Notes

- All timestamps should be in ISO 8601 format (e.g., `2025-01-10T10:30:00Z`)
- All IDs should be UUIDs (v4)
- All monetary amounts should be in cents/basis points (no decimal places)
- All endpoints should support CORS for frontend integration
- Implement proper validation for all inputs
- Set up logging and error tracking
- Implement database migrations
- Consider implementing caching (Redis) for frequently accessed data
- Implement proper database indexing for query performance

---

**Last Updated**: 2026-01-12  
**Frontend Status**: ✅ Fully Dynamic  
**Backend Status**: 🔄 Ready for Implementation
