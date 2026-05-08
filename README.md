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

## API summary

Auth:
- `POST /api/auth/client/register`
- `POST /api/auth/client/login`
- `POST /api/auth/merchant/register`
- `POST /api/auth/merchant/login`
- `POST /api/auth/admin/login`
- `POST /api/auth/refresh-token`

Client:
- `GET /api/client/me`
- `PUT /api/client/profile`
- `POST /api/client/kyc/upload`
- `GET /api/client/kyc/status`

Loans/Repayments:
- `POST /api/loans/apply`
- `GET /api/loans/my`
- `GET /api/loans/:id`
- `POST /api/loans/:id/repay`
- `GET /api/loans/:id/repayments`

Merchant:
- `GET /api/merchant/list`
- `GET /api/merchant/me`
- `GET /api/merchant/transactions`
- `GET /api/merchant/stats`

Admin:
- `GET /api/admin/dashboard`
- `GET /api/admin/clients`
- `GET /api/admin/clients/:id`
- `PUT /api/admin/clients/:id/verify`
- `PUT /api/admin/clients/:id/reject`
- `PUT /api/admin/clients/:id/suspend`
- `GET /api/admin/loans`
- `PUT /api/admin/loans/:id/approve`
- `PUT /api/admin/loans/:id/reject`
- `GET /api/admin/merchants`
- `PUT /api/admin/merchants/:id/approve`
- `GET /api/admin/revenue`
- `GET /api/admin/kyc/queue`
- `PUT /api/admin/kyc/:id/approve`
- `PUT /api/admin/kyc/:id/reject`

## Business rules implemented

- 5% origination fee, 4-week repayment plan, DT currency
- First loan capped to 300 DT
- Loan disbursement simulated by setting loan status to `ACTIVE` after admin approval
- Tier upgrades + score updates through `creditEngine`
- Late penalties via cron each Monday 8AM (`node-cron`)
- Consecutive missed payments can trigger default and suspension
