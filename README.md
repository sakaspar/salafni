# Salafni (سلفني)

Salafni is a Tunisian BNPL micro-lending platform ("Lend me") with one shared backend powering:
- Mobile client app (React Native + Expo)
- Admin and merchant web dashboards (React + Vite + Tailwind)
- JSON flat-file data lake (no SQL/NoSQL database)

## Project structure

`/backend` Express API, business rules, cron, JSON data lake
`/web` Admin + Merchant dashboard
`/mobile` Expo mobile app (onboarding, loans, repayments, profile)
`/shared` Shared constants (tiers, categories)

## Environment setup

1. Copy `.env.example` to `.env`
2. Set values:

- `PORT=5000`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `DATA_PATH=./backend/data`
- `WEB_API_URL=http://localhost:5000/api`
- `MOBILE_API_URL=http://localhost:5000/api`

For web:
- `VITE_API_URL=http://localhost:5000/api` (optional, defaults to localhost)

For mobile:
- `EXPO_PUBLIC_API_URL=http://localhost:5000/api` (optional, defaults to localhost)

## Install dependencies

```bash
npm install
```

## Run backend

```bash
npm run seed
npm run dev:backend
```

## Run web

```bash
npm run dev:web
```

## Run mobile

```bash
npm run dev:mobile
```

## Reset data

1. Stop backend
2. Replace JSON files in `backend/data` with `[]` (or delete and recreate as arrays)
3. Rerun:

```bash
npm run seed
```

## Seed credentials

- Admin: `admin@salafni.tn` / `Admin123!`
- Merchant (example): `techstore@salafni.tn` / `Merchant123!`
- Client seed passwords: `Client123!`

## New Features & Endpoints

### 1. Admin Management
- `DELETE /api/admin/clients/:id` - Soft delete user
- `PUT /api/admin/clients/:id/freeze` - Freeze user account
- `PUT /api/admin/clients/:id/unfreeze` - Unfreeze user account
- `GET /api/admin/kyc/pending` - List pending KYC
- `PUT /api/admin/kyc/:userId/approve` - Approve KYC
- `PUT /api/admin/kyc/:userId/reject` - Reject KYC
- `PUT /api/admin/kyc/:userId/request-more` - Request more KYC info
- `GET /api/admin/kyb/pending` - List pending KYB
- `PUT /api/admin/kyb/:merchantId/approve` - Approve KYB
- `PUT /api/admin/kyb/:merchantId/reject` - Reject KYB

### 2. Merchant KYB
- `POST /api/merchant/kyb/upload` - Upload KYB documents
- `GET /api/merchant/kyb/status` - Check KYB status

### 3. Support Tickets
- `POST /api/support/tickets` - Create a support ticket
- `GET /api/support/tickets/my` - Get own tickets
- `GET /api/support/tickets/:id` - Get ticket details
- `POST /api/support/tickets/:id/message` - Reply to ticket
- `GET /api/support/admin/tickets` - Admin: List tickets
- `PUT /api/support/admin/tickets/:id/status` - Admin: Update status
- `PUT /api/support/admin/tickets/:id/priority` - Admin: Update priority
- `PUT /api/support/admin/tickets/:id/assign` - Admin: Assign ticket

### 4. Occupation Logic
Updated occupations: `EMPLOYED_PUBLIC`, `EMPLOYED_PRIVATE`, `FREELANCER`, `INFORMAL`, `STUDENT`, `JOBLESS`.
- `JOBLESS` users are capped at 300 DT (Starter) or 600 DT (Trusted max).
- `EMPLOYED` users must provide 3 months bank statements for KYC.

### 5. Security & Infrastructure
- Input validation on all POST/PUT routes using `express-validator`.
- Rate limiting on auth routes (5 attempts / 10 min).
- Consistent API response shape: `{ success: true, data: {} }`.
- Pagination on all list endpoints.
