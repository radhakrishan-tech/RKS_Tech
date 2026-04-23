# Radha Krishan Studio Ecommerce (Phase 1 Start)

This is a launch-first implementation starter for a smart ecommerce web app.

## Implemented now

- React + Vite storefront with lazy loaded pages and reusable components.
- Node + Express + MongoDB backend with category visibility rule.
- Product listing, search, category/price filters.
- Product detail page with quick buy and WhatsApp quick order link.
- Cart + one-page COD checkout.
- Auto discount engine:
  - 3 items => 5% OFF
  - 5 items => 10% OFF
- Delivery charge logic with admin-managed local pincodes.
- COD confirmation + OTP verification flow (provider-ready; mock default).
- Smart product badges:
  - New Arrival
  - Trending
  - Only few left
- Month-based summer smart UI (April-August).
- Behavior-based towel combo suggestion.
- Simple admin dashboard:
  - Admin login
  - Product create/list/edit/archive
  - Orders list
  - Sales summary cards
- Invoice endpoints:
  - Invoice summary JSON
  - Invoice PDF download
- OTP provider switch with Twilio + automatic mock fallback

## Folder structure

- frontend/
  - src/components/
  - src/pages/
  - src/services/
  - src/utils/
  - src/context/
- backend/
  - src/controllers/
  - src/models/
  - src/routes/
  - src/services/
  - src/middleware/
  - src/utils/
  - src/data/

## Run locally

1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

2. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Default admin credentials

Set these in backend .env:

- ADMIN_EMAIL=admin@radhakrishanstudio.com
- ADMIN_PASSWORD=ChangeMe123!

## API highlights

- GET /api/products
- GET /api/products/categories
- GET /api/products/:slug
- GET /api/products/id/:id/suggestions
- POST /api/orders/preview
- POST /api/orders
- GET /api/orders/:id/invoice-summary
- GET /api/orders/:id/invoice
- POST /api/auth/request-otp
- POST /api/auth/verify-otp
- POST /api/auth/admin/login
- GET /api/admin/summary
- GET /api/admin/products
- POST /api/admin/products
- PUT /api/admin/products/:id
- DELETE /api/admin/products/:id
- GET /api/admin/orders

## Next implementation items

- Image compression pipeline and WebP conversion during upload.
- WhatsApp sandbox/live message adapter with queue and retry.
- Report exports (PDF/Excel).
