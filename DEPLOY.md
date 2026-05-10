# PST ERP — Deployment guide

Repository layout: git root contains folder **`pst-erp/`** (Vite app + `backend/` API).

## Backend on Render

Render Web Service:

1. New → Web Service → connect this Git repository.
2. **Runtime**: Node
3. **Root Directory**: `pst-erp/backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Health Check Path**: `/api/health`

### Environment variables (Render → Settings → Environment)

| Key | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | Atlas connection string. Database name **must** be `pst_erp`. |
| `JWT_SECRET` | Yes | Strong random string. |
| `NODE_ENV` | Yes | `production` |
| `CLIENT_URL` | Yes | The Vercel frontend origin, e.g. `https://pst-erp.vercel.app` |
| `AWS_REGION` | optional | Region for S3 (e.g. `ap-south-1`) |
| `AWS_ACCESS_KEY_ID` | optional | S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | optional | S3 credentials |
| `AWS_S3_BUCKET` | optional | Default `pst-erp-documents` |

After the service is live, copy the URL (e.g. `https://pst-api.onrender.com`). The frontend calls **`https://…/api/...`** (the app appends `/api` in `src/lib/api.js`).

### One-time data setup
```bash
cd pst-erp/backend
npm run seed:company      # upsert Purestream Energy FZE
npm run seed:users        # admin / accounts / purchase logins
```

---

## Frontend on Vercel

Vercel Project:

1. New Project → import this Git repository.
2. **Root Directory**: `pst-erp` (important: not the repo root if your repo wraps this folder).
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Environment variables (Vercel → Project → Settings → Environment)

| Key | Required | Value |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | `https://pst-api.onrender.com` — **no** `/api` suffix |
| `VITE_USE_REMOTE_API_WHILE_LOCAL` | optional | `true` only if local UI should hit the remote API |

`vercel.json` already rewrites all routes to `/index.html` for SPA routing.

---

## Render Blueprint (optional)

Repo root **`render.yaml`** defines a Web Service with `rootDir: pst-erp/backend`. Use **New Blueprint Instance** on Render if you prefer infra-as-code; you still add secrets in the dashboard.

---

## Local development

```powershell
cd "E:\ERP\PST ERP\pst-erp"
npm install
npm install --prefix backend

# in two terminals:
npm run dev:backend
npm run dev
```

The Vite dev server listens on **5174** (see `vite.config.js`) and proxies `/api/*` → `http://127.0.0.1:5001`.
