# Perfumeria — Project Code

This package contains two complete projects that together make up the Perfumeria demo:

## 1. `perfumeria/` — Web App (Next.js 16)

A full perfume e-commerce web application with 22 routes and 47 static pages.

### Tech stack
- Next.js 16.3.0 (App Router, static export)
- React 19, TypeScript
- Tailwind CSS 4 (custom luxury theme: cream/gold/dark-oud)
- Zustand for state (cart, wishlist, auth, orders)
- localStorage persistence
- Lucide icons

### Features
- 24 realistic perfumes across 8 brands
- Home, Shop, Product detail, Cart, Checkout, Order confirmation
- Auth (login/signup), Account dashboard, Wishlist, Addresses, Settings
- 4-step "Find Your Scent" quiz with personalized recommendations
- Support page with AI chatbot (Liora)
- Admin panel: Dashboard, Products, Orders, Customers, Promotions, Analytics, Content

### Run locally
```bash
cd perfumeria
npm install
npm run dev          # http://localhost:3000
# or
npm run build        # static export to ./out
npx serve out        # serve the build
```

The web app is also live at: https://ocqnqqqlfxbrv.space.minimax.io

---

## 2. `perfumeria-app/` — Mobile App (Expo SDK 54)

A native Expo shell that wraps the live web app in a WebView with mobile UX polish.

### Tech stack
- Expo SDK 54
- React Native 0.81, React 19
- React Native WebView 13
- React Native Safe Area Context
- Lucide React Native

### Features
- Custom branded splash screen
- Header with logo, "Live/Offline" status pill, share button
- Loading progress bar
- Pull-to-refresh
- Bottom tab bar (Back, Home, Reload, Forward, Share)
- Safe area handling
- Error state with retry

### Run on your phone
```bash
cd perfumeria-app
npm install
npx expo start --tunnel
```

Then scan the QR code with **Expo Go** (or paste the URL into "Enter URL manually").

### Notes
- The shop URL is configured in `app.json` under `extra.shopUrl`
- Update it to point to your own deployed version of the web app

---

## Project structure

```
.
├── perfumeria/              # Next.js web app
│   ├── app/                 # Routes (App Router)
│   ├── components/          # Shared React components
│   ├── lib/                 # Data, types, state stores, utils
│   ├── public/              # Static assets (images, banners)
│   └── out/                 # Static export (after `npm run build`)
│
└── perfumeria-app/          # Expo mobile app
    ├── App.tsx              # Main component (WebView wrapper)
    ├── app.json             # Expo config
    ├── assets/              # Icons & splash
    └── index.ts             # Entry point
```

## Demo credentials

For the web app:
- Any email works on signup
- Use `demo@perfumeria.com` to log in as a pre-filled user with addresses

## Notes

This is a frontend-only demo. State is persisted to localStorage on both platforms. For production you'd need:
- A real backend (PostgreSQL + API)
- Real auth (NextAuth/Clerk/Supabase)
- Real payments (Stripe/PayPal/regional gateway)
- Real product catalog & inventory
- Order fulfillment integration
- Push notifications via Firebase Cloud Messaging
- EAS Build for shipping a native binary to the App Store / Play Store
