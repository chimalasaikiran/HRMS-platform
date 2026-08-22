# HRMS Platform — Dayflow

> *Every workday, perfectly aligned.*

Welcome to the **HRMS Platform** repository. Dayflow is a Human Resource Management System that digitizes employee onboarding, profile management, attendance tracking, leave workflows and payroll — with an **AI assistant built in** that answers questions about your own records and company policy in plain language.

---

## Team

| Member | Owns |
|--------|------|
| Hari | AI agent / RAG (`POST /api/ai/chat`) |
| Member 2 (vamsi) | Express + MongoDB — [`backend/`](./backend/) |
| Member 3 (saikiran) | React frontend — [`Frontend/`](./Frontend/) |

Docs: [`backend/docs/PLAN.md`](./backend/docs/PLAN.md) · [`backend/docs/api-contract.md`](./backend/docs/api-contract.md) · [`backend/docs/02-backend-db.md`](./backend/docs/02-backend-db.md)

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
- **AI Assistant**: Role-aware agent over the live database and HR policy documents.

---

## AI Assistant

Instead of hunting through screens, just ask:

> *"How many leaves do I have left?"*
> → **You have 9 paid and 4 sick days remaining.**

> *"Apply sick leave for Monday to Wednesday"*
> → *drafts the request and waits for you to confirm.*

> *"What's the salary of the accounts manager?"*
> → Salary details are visible only to HR officers.

### How it works

```
You ask:  "How many leaves do I have left?"
   │
   ▼
1. Request hits /api/ai/chat carrying your JWT
   The server knows exactly who you are: { userId, employeeId, role }
   │
   ▼
2. The model picks a tool:  get_my_leave_balance()
   │
   ▼
3. The handler runs — scoped to YOUR employee id, never one the model supplied
   Queries MongoDB, returns JSON:  { PAID: 9, SICK: 4, UNPAID: 0 }
   │
   ▼
4. The model phrases the answer. It does not calculate anything.
   │
   ▼
You see:  "You have 9 paid and 4 sick days remaining."
```

### Structured data vs. document search

| Question type | Path | Example |
|---|---|---|
| **About your records** | Tool call → MongoDB | *"Show my attendance this week"* |
| **About company policy** | RAG → Qdrant | *"What's the notice period?"* |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS |
| **Routing / State** | React Router, TanStack Query |
| **Backend** | Node.js, Express (`backend/`) |
| **Database** | MongoDB Atlas, Mongoose |
| **Validation** | Zod |
| **Auth** | JWT + bcrypt |
| **LLM** | Groq |
| **Vector DB** | Qdrant |

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
├── Frontend/                 # Member 3 — React + Vite + Tailwind
├── backend/                  # Member 2 — Express + MongoDB
│   ├── src/
│   ├── docs/                 # Spec + API contract
│   ├── render.yaml
│   └── SEED.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **MongoDB Atlas** cluster (free tier is enough)
- **Groq API key** (for AI) — [console.groq.com](https://console.groq.com)
- **Qdrant** (for policy RAG) — optional for core API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chimalasaikiran/HRMS-platform.git
   cd HRMS-platform
   ```

2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../Frontend && npm install
   ```

3. Create `backend/.env` from `backend/.env.example` (do not commit `.env`).

4. Run both servers:
   ```bash
   # Terminal 1 — backend on :5000
   cd backend && npm run seed && npm run dev

   # Terminal 2 — frontend on :5173
   cd Frontend && npm run dev
   ```

API: `http://localhost:5000/api`  
Demo logins: see [`backend/SEED.md`](./backend/SEED.md)

---

## Deploy backend on Render

[`backend/render.yaml`](./backend/render.yaml) — Web Service `dayflow-api`.

1. Root Directory: `backend`
2. Env vars: `MONGODB_URI`, `JWT_SECRET`, `HOST=0.0.0.0`, `NODE_ENV=production`, `JWT_EXPIRES_IN=7d`
3. Atlas Network Access: allow `0.0.0.0/0`
4. Health: `https://<your-service>.onrender.com/api/health`

---

## License

MIT
