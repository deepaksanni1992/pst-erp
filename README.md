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

**Backend** — copy `backend/.env.example` → `backend/.env` and fill in values (never commit `backend/.env`):

- `MONGO_URI` — must use a **PST-dedicated** database (see `backend/.env.example`)
- `JWT_SECRET` — strong random string (32+ characters in production)
- `PORT` — default **5001** (must match Vite proxy)
- `CLIENT_URL` — e.g. `http://localhost:5174` for local UI
- Optional: `AWS_*` for S3 (see [AWS / S3](#aws--s3))

**Frontend** — for production builds (e.g. Vercel / Render static), set in the host UI:

- `VITE_API_BASE_URL` or `VITE_API_BASE` — backend origin **without** `/api` (e.g. `https://your-api.onrender.com`)

See also **[Environment & secret management](#environment--secret-management)**.

Local `npm run dev` uses same-origin `/api` and does not need a remote API URL.

Templates: repo root `.env.example`, `frontend/.env.example`, `backend/.env.example`.

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
2. Seed the default company and the primary login (from `backend/`):

```bash
cd backend
npm run seed:company
# Set DEFAULT_ADMIN_PASSWORD (and optionally DEFAULT_ADMIN_USERNAME) in backend/.env — see backend/.env.example
npm run seed:users
```

`seed:users` **deletes every user** in the database, then creates **one** `super_admin` (credentials **only** from env — never hardcoded). Older demo accounts (`admin`, `accounts`, `purchase` and passwords like `admin@pst2026`) are **retired**; run `seed:users` after updating `.env` to remove them from MongoDB. Use strong passwords in production (`NODE_ENV=production` enforces minimum length and rejects common weak values).

## Environment & secret management

- **Never commit** `.env`, `backend/.env`, `frontend/.env`, keys (`.pem`, `.key`, `.pfx`), or pasted connection strings with passwords. They are listed in `.gitignore`.
- **Use templates only in git:** `.env.example`, `backend/.env.example`, `frontend/.env.example` — placeholders such as `your_mongodb_uri`, not real secrets.
- **Production (e.g. Render):** set `MONGO_URI`, `JWT_SECRET`, and seed-related variables in the host’s **Environment** UI, not in the repo.
- **Rotate immediately** if a MongoDB URI, JWT secret, AWS key, or password was ever committed, shared in chat, or exposed in a screenshot — regenerate Atlas credentials, new JWT secret, and new IAM keys as applicable.
- **Check before push:** `npm run check:secrets` scans tracked files for common leak patterns (Mongo URIs with embedded credentials, PEM headers, `AKIA…` keys, stray `.env` files).
- Optional **pre-commit:** see `docs/git-hooks.md` to run `check:secrets` before each commit.

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

# Secret-pattern scan (tracked files only)
npm run check:secrets

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
