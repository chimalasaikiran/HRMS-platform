# HRMS Platform — Dayflow

> *Every workday, perfectly aligned.*

Welcome to the **HRMS Platform** repository. Dayflow is a Human Resource Management System that digitizes employee onboarding, profile management, attendance tracking, leave workflows and payroll — with an **AI assistant built in** that answers questions about your own records and company policy in plain language.

---

## Team

| Member | Owns |
|--------|------|
| Hari | AI agent / RAG (`POST /api/ai/chat`) |
| Member 2 (vamsi) | Express + MongoDB — [`backend/`](./backend/) |
| Member 3 | React frontend (`client/` / `Frontend/`) |

Docs: [`docs/PLAN.md`](./docs/PLAN.md) · [`docs/api-contract.md`](./docs/api-contract.md) · [`docs/02-backend-db.md`](./docs/02-backend-db.md)

---

## Features

### For Employees
- **Check In / Check Out**: One-click attendance with a live shift timer.
- **Attendance Tracking**: Day-wise records — check-in, check-out, work hours, extra hours.
- **Time Off**: Apply for Paid, Sick or Unpaid leave with date range, reason and attachment.
- **Profile Management**: Resume, private info and bank details, with clear locks on HR-only fields.
- **Salary View**: Read-only breakdown of all earnings and deductions.

### For Admin / HR Officers
- **Employee Directory**: Card grid with live status — present · on leave · absent.
- **Onboarding**: Create an employee; Login ID and temporary password generate automatically.
- **Approvals**: Approve or reject time-off requests with comments.
- **Company Attendance**: View every employee's attendance for any given day.
- **Salary Structures**: Enter one wage figure — all components and deductions compute instantly.

### Across the Platform
- **Role-Based Access Control (RBAC)**: Admin/HR and Employee — enforced on the server via JWT.
- **AI Assistant**: Role-aware agent over the live database and HR policy documents (Hari).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS |
| Backend | Node.js, Express (`backend/`) |
| Database | MongoDB Atlas, Mongoose |
| Validation | Zod |
| Auth | JWT + bcrypt |
| AI (Hari) | Groq + RAG / Qdrant |

---

## Salary Engine

HR sets **one number — the monthly wage.** Components derive automatically.

At ₹50,000: Basic 25,000 · HRA 12,500 · Standard 4,167 · Bonus 2,082.50 · LTA 2,082.50 · Fixed 4,168 · **Net 46,800**.

```
netPayable = netPay × (payableDays ÷ totalWorkingDays)
```

---

## Repository Structure

```
HRMS-platform/
├── backend/                  # Member 2 — Express + MongoDB (this branch)
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── seed.js
├── docs/                     # Spec + API contract
├── render.yaml               # Render blueprint for dayflow-api
├── client/ or Frontend/      # Member 3 — React (when merged)
└── README.md
```

---

## Backend quick start (Member 2)

```bash
cd backend
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api`  
Demo logins: see [`backend/SEED.md`](./backend/SEED.md)

---

## Deploy on Render

Repo includes [`render.yaml`](./render.yaml) (Web Service `dayflow-api`, root `backend/`).

1. Use branch **`vamsi`**
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** (or Web Service, Root Directory `backend`)
3. Env vars (do **not** commit `.env`):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `HOST=0.0.0.0`
   - `NODE_ENV=production`
   - `JWT_EXPIRES_IN=7d`
4. Atlas Network Access: allow `0.0.0.0/0`
5. Health: `https://<your-service>.onrender.com/api/health`
6. Optional: Render Shell → `npm run seed`

---

## License

MIT
