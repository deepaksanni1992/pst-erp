# PST ERP

**Purestream Energy FZE** — enterprise resource planning: React + Vite + Tailwind frontend, Express + MongoDB backend, optional AWS S3 for document storage.

## Overview

PST ERP covers sales, procurement, inventory, logistics, accounts, documents, and master data with role-based access and multi-company support. Default branding and seeded data target **Purestream Energy FZE** (company code `PST`); additional companies (for example legacy **Okeanos** records) remain supported for multi-tenant data.

## Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query, React Router 7, Axios |
| Backend | Node.js (ESM), Express, Mongoose, JWT, optional AWS SDK (S3) |
| Database | MongoDB (dedicated database name, e.g. `pst_erp`) |

## Repository layout

- `src/` — Vite SPA
- `backend/src/` — REST API under `/api`
- `public/` — static assets (e.g. `pst-logo.png`)
- `docs/` — technical notes
- `sample-templates/` — Excel import templates

## Prerequisites

- Node.js 20+ (or current LTS)
- MongoDB connection string (local or Atlas)
- For document uploads: AWS account, S3 bucket, and IAM keys (see below)

## Local development

### 1. Install dependencies

```bash
cd pst-erp
npm install
npm install --prefix backend
```

### 2. Environment files

**Backend** — copy and edit `backend/.env` (never commit secrets):

- `MONGO_URI` — must use a **PST-dedicated** database (example in `backend/.env.example` uses `pst_erp`)
- `JWT_SECRET` — strong random string
- `PORT` — default **5001** (must match Vite proxy)
- `CLIENT_URL` — e.g. `http://localhost:5174` for local UI
- Optional: `AWS_*` for S3 (see [AWS / S3](#aws--s3))

**Frontend** — for production builds (e.g. Vercel), set in the host UI:

- `VITE_API_BASE_URL` or `VITE_API_BASE` — backend origin **without** `/api` (e.g. `https://your-api.onrender.com`)

Local `npm run dev` uses same-origin `/api` and does not need a remote API URL.

### 3. Ports (standard for this repo)

| Service | Port |
|---------|------|
| Vite dev server | **5174** (`vite.config.js`) |
| Express API | **5001** (default in `server.js` and `backend/.env.example`) |

Run backend and frontend in two terminals:

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev
```

Open `http://localhost:5174`. The Vite dev server proxies `/api/*` to `http://127.0.0.1:5001`.

## MongoDB

1. Create or use a database named in your URI (e.g. `.../pst_erp?...`).
2. Seed the default company and users (from `backend/`):

```bash
cd backend
npm run seed:company
npm run seed:users
```

Primary seed users (after `seed:company`):

| Username | Role | Password (change in production) |
|----------|------|--------------------------------|
| `admin` | admin | `admin@pst2026` |
| `accounts` | accounts_logistics | `accounts@pst2026` |
| `purchase` | purchase_sales | `purchase@pst2026` |

Emails are derived as `username@purestreamenergy.com`.

## AWS / S3

Configure in **`backend/.env`** only (never expose keys to the frontend):

| Variable | Purpose |
|----------|---------|
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | IAM user with S3 access |
| `AWS_SECRET_ACCESS_KEY` | Secret |
| `AWS_S3_BUCKET` | Default e.g. `pst-erp-documents` |
| `AWS_S3_KEY_PREFIX` | Namespace for objects, default `pst-erp/` |

See `backend/.env.example` for optional TTL and folder names.

## Build & quality checks

```bash
# Frontend production build
npm run build

# Backend syntax verification (see backend/package.json)
npm --prefix backend run verify

# Both (from repo root)
npm run verify
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Render (API) and Vercel (frontend), environment variables, and health checks.

## Import templates

Excel templates live under `sample-templates/`. Regenerate metadata if needed:

```bash
npm run generate:import-templates
```

See `sample-templates/README.md` for API routes and import order.

## Troubleshooting

- **API errors / CORS** — Ensure `CLIENT_URL` matches your browser origin (e.g. `http://localhost:5174`) and that the backend is on **5001**.
- **`VITE_API_BASE_URL` missing on production** — Set the variable in the hosting provider and rebuild the frontend.
- **Blank DB** — Run `npm run seed:company` before `seed:users`.
- **S3 upload failures** — Confirm bucket, region, credentials, and that `AWS_S3_KEY_PREFIX` is correct for your bucket policy.

## License

Proprietary — Purestream Energy FZE. All rights reserved.
