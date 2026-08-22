# Dayflow HRMS

Team of 3 · Member 2 backend lives in [`server/`](./server/).

| Member | Owns |
|--------|------|
| Hari | AI agent / RAG (`POST /api/ai/chat`) |
| **Member 2 (you)** | Express + MongoDB — [`server/`](./server/) |
| Member 3 | React frontend (`client/`) |

Docs: [`docs/PLAN.md`](./docs/PLAN.md) · [`docs/api-contract.md`](./docs/api-contract.md) · [`docs/02-backend-db.md`](./docs/02-backend-db.md)

## Backend quick start

```bash
cd server
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api`  
Demo logins: see [`server/SEED.md`](./server/SEED.md)

## Deploy on Render

Repo includes [`render.yaml`](./render.yaml) (Web Service `dayflow-api`, root `server/`).

1. Push branch `vamsi` to GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → select `HRMS-platform` / branch `vamsi`  
   Or **New Web Service** → connect repo → Root Directory `server` → Build `npm install` → Start `npm start`
3. Set env vars (do **not** commit `.env`):
   - `MONGODB_URI` — Atlas connection string (database `dayflow`)
   - `JWT_SECRET` — same secret the team uses
   - `HOST=0.0.0.0`
   - `NODE_ENV=production`
   - `JWT_EXPIRES_IN=7d`
4. In Atlas **Network Access**, allow `0.0.0.0/0` (or Render outbound IPs)
5. After deploy, health: `https://<your-service>.onrender.com/api/health`
6. Optional seed (one-time): Render Shell → `cd server` is already root → `npm run seed`
