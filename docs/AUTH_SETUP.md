# Better Auth Implementation Guide

## ✅ Frontend Setup Complete

### What's Implemented:
- ✓ Better Auth library configured
- ✓ Email/Password authentication ready
- ✓ Social login UI (Google, GitHub, Facebook) on login & signup pages
- ✓ Auth state management with `authClient`
- ✓ Password reset flow (frontend ready)
- ✓ Protected routes framework

### Pages Updated:
- **Login Page**: `src/app/(auth)/login/page.tsx`
  - Email/password login form
  - Social login buttons (Google, GitHub, Facebook)
  
- **Signup Page**: `src/app/(auth)/signup/page.tsx`
  - Email/password registration form
  - Social login buttons (Google, GitHub, Facebook)

---

## 🔧 Backend Setup Required (Next Phase)

When you start backend development, follow these steps:

### 1. Database Setup
Choose one and configure:

**Option A: PostgreSQL** (Recommended)
```typescript
// src/lib/auth.ts
import { postgresAdapter } from "better-auth/adapters/postgres";

export const auth = betterAuth({
  database: postgresAdapter({
    url: process.env.DATABASE_URL!,
  }),
  // ... rest config
});
```

**Option B: MongoDB**
```typescript
import { mongoAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
  database: mongoAdapter(mongoClient.db("ngv")),
  // ... rest config
});
```

**Option C: SQLite** (for development)
```typescript
import { sqliteAdapter } from "better-auth/adapters/sqlite";

export const auth = betterAuth({
  database: sqliteAdapter({
    filename: "./auth.db",
  }),
  // ... rest config
});
```

### 2. OAuth Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new OAuth 2.0 Client ID (Web application)
3. Add Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
4. Copy credentials to `.env.local`

#### GitHub OAuth:
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github`
4. Copy credentials to `.env.local`

#### Facebook OAuth:
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create new app
3. Configure OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
4. Copy credentials to `.env.local`

### 3. Environment Variables
Create `.env.local` file:
```
BETTER_AUTH_SECRET=your-32-char-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost/ngv_db

# Social OAuth Credentials
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx
```

### 4. Install Database Driver
```bash
# For PostgreSQL
npm install better-auth pg

# For MongoDB
npm install better-auth mongodb

# For SQLite
npm install better-auth better-sqlite3
```

### 5. Email Service (Optional)
For password reset emails, configure SMTP or use services like:
- SendGrid
- AWS SES
- Gmail
- Mailgun

### 6. Database Migrations
Better Auth auto-creates tables on first run, but verify:
```bash
npm run build
npm run dev
```

---

## 🔐 Security Checklist

- [ ] Use strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Never commit `.env.local`
- [ ] Set `BETTER_AUTH_URL` to production domain when deployed
- [ ] Configure HTTPS in production
- [ ] Add CORS settings if API on different domain
- [ ] Enable rate limiting on auth endpoints
- [ ] Set secure session cookies (httpOnly, Secure, SameSite)

---

## 📝 Current API Contracts

The following auth methods are implemented and ready:

```typescript
// From src/lib/fetchers/core.ts
authFetchers.me()              // Get current user
authFetchers.login(email, pwd) // Email login
authFetchers.register(...)     // Email signup
authFetchers.socialLogin(provider) // Google/GitHub/Facebook
authFetchers.requestPasswordReset(email)
authFetchers.resetPassword(token, newPassword)
authFetchers.logout()
```

All routes mapped in: `src/app/api/auth/[...all]/route.ts`

---

## 🚀 Testing During Frontend Development

For now, the app uses in-memory storage. This resets on server restart:
- Default demo user: `user@ngv.local / user123`
- Default demo admin: `admin@ngv.local / admin123`
- Social logins will fail until backend OAuth is set up

---

## Next Steps (Frontend):
1. ✓ Auth pages done
2. Continue with other frontend pages
3. Implement protected routes middleware (if needed)
4. Add user profile page
5. Complete all frontend features

Then backend phase will activate auth persistence and OAuth.
