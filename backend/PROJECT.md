# Dayflow backend (Member 2)

Express + MongoDB backend for Dayflow HRMS. Implements the frozen [api-contract](./docs/api-contract.md).

## Quick start

```bash
cd backend
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api`  
Demo logins: see [`SEED.md`](./SEED.md)

## Layout

```
backend/
├── src/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── seed.js
├── docs/
├── render.yaml
└── README.md
```

## Deploy on Render

Root Directory: `backend`. Env: `MONGODB_URI`, `JWT_SECRET`, `HOST=0.0.0.0`, `NODE_ENV=production`.
