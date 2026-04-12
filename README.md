# NGV - Next.js Video Streaming Platform

A modern, fully dynamic video streaming platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The frontend is **100% ready for backend API integration**.

---

## 📋 Project Status

### ✅ Frontend - COMPLETE

All pages and components are **fully dynamic** and ready for API integration.

### 🔄 Backend - PENDING

The backend needs to implement all APIs as documented in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## 🛠️ Tech Stack

**Frontend**: Next.js 16 • React 19 • TypeScript • Tailwind CSS • Radix UI • Better Auth  
**Backend (To implement)**: Database • Authentication • Payments • Social OAuth

---

## 🚀 Getting Started

### Prerequisites
Node.js 18+, npm or yarn

### Installation

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

---

## 📚 Documentation

- **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Complete API reference (68 endpoints documented)
- **[AUTH_SETUP.md](./docs/AUTH_SETUP.md)** - Authentication & OAuth setup guide
- **[API_CONTRACT.md](./docs/API_CONTRACT.md)** - Frontend-backend contract
- **[src/guidelines/Guidelines.md](./src/guidelines/Guidelines.md)** - Frontend guidelines

---

## ✨ What's Already Done

✅ **11 Full Pages** - Responsive design, loading states, error handling  
✅ **40+ Components** - Radix UI components integrated  
✅ **Authentication** - Better Auth setup with social login UI  
✅ **Dynamic Data Binding** - All pages use fetcher functions  
✅ **Search & Filters** - Advanced filtering, sorting, pagination  
✅ **Admin Dashboard** - User management, content moderation  
✅ **Payment UI** - Subscription, rental, purchase flows  
✅ **User Dashboard** - Stats, favorites, watch history, watchlist  

---

## 🎯 What Needs to be Done

Implement backend APIs following 7 phases in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md#implementation-checklist):

1. **Core Infrastructure** - Database, auth setup
2. **Authentication** - 7 endpoints for login/signup/reset
3. **Content APIs** - 9 endpoints for media listing/filtering
4. **User APIs** - 5 endpoints for dashboard/history/progress
5. **Reviews** - 7 endpoints for reviews/comments/likes
6. **Payment** - 4 endpoints for purchases/subscriptions
7. **Admin** - 5 endpoints for moderation/analytics

**Total: 73 API endpoints to implement**

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete specifications.

---

## 🔄 API Integration Flow

```typescript
// Each page uses fetcher functions:
import { homeFetchers } from "@/src/lib/fetchers/core";

const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  homeFetchers.getTrending()
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

Fetcher functions call `portalService` which will call backend APIs once implemented.

---

## 📁 Project Structure

```
src/
├── app/(auth)           # Login, signup, password reset
├── app/(main)           # Home, library, watch, dashboard, admin
├── components/ui        # 40+ Radix UI components
├── lib/fetchers         # API fetcher functions
├── lib/auth            # Better Auth configuration
└── pages/              # Page component logic
```

---

## 🔐 Security Features Implemented

- Better Auth for authentication
- Social OAuth ready (Google, GitHub, Facebook)
- Role-based access (user/admin)
- Protected routes framework
- Input validation ready

---

## 📊 Database Models Required

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md#database-models) for:
- User model (fields, relationships)
- Media model (movies, series, documentaries)
- Review model (ratings, comments)
- Purchase model (rentals, subscriptions)
- And 6 more models

---

## 🐛 Troubleshooting

**Pages show "Loading..."**: Backend not configured. Check docs.  
**Social buttons inactive**: OAuth not set up. See [AUTH_SETUP.md](./docs/AUTH_SETUP.md)  
**API errors in console**: Backend APIs not implemented yet.

---

## 📄 License

Proprietary - Confidential

---

**🎬 NGV - Video Streaming Platform**  
Frontend Ready ✅ | Backend Pending 🔄 
