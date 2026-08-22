# HRMS Platform — Dayflow

> *Every workday, perfectly aligned.*

Welcome to the **HRMS Platform** repository. Dayflow is a Human Resource Management System that digitizes employee onboarding, profile management, attendance tracking, leave workflows and payroll — with an **AI assistant built in** that answers questions about your own records and company policy in plain language.

---

## 🚀 Features

### For Employees
- **Check In / Check Out**: One-click attendance with a live shift timer.
- **Attendance Tracking**: Day-wise records — check-in, check-out, work hours, extra hours.
- **Time Off**: Apply for Paid, Sick or Unpaid leave with date range, reason and attachment.
- **Profile Management**: Resume, private info and bank details, with clear locks on HR-only fields.
- **Salary View**: Read-only breakdown of all earnings and deductions.

### For Admin / HR Officers
- **Employee Directory**: Card grid with live status — 🟢 present · ✈️ on leave · 🟡 absent.
- **Onboarding**: Create an employee; Login ID and temporary password generate automatically.
- **Approvals**: Approve or reject time-off requests with comments.
- **Company Attendance**: View every employee's attendance for any given day.
- **Salary Structures**: Enter one wage figure — all components and deductions compute instantly.

### Across the Platform
- **Role-Based Access Control (RBAC)**: Two roles — Admin/HR and Employee — enforced on the server, not just in the UI.
- **AI Assistant**: A role-aware agent over the live database and HR policy documents.

---

## 🤖 AI Assistant

Instead of hunting through screens, just ask:

> *"How many leaves do I have left?"*
> → **You have 9 paid and 4 sick days remaining.**

> *"Apply sick leave for Monday to Wednesday"*
> → *drafts the request and waits for you to confirm.*

> *"What's the salary of the accounts manager?"*
> → 🔒 **Salary details are visible only to HR officers.**

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
          + a balance card + the steps it took
```

### Structured data vs. document search

Every question routes down one of two paths, and choosing correctly is most of the work:

| Question type | Path | Example |
|---|---|---|
| **About your records** | Tool call → MongoDB | *"Show my attendance this week"* |
| **About company policy** | RAG → Qdrant | *"What's the notice period?"* |

Questions about your own data are database queries, **not** document retrieval — a distinction many "RAG chatbots" get wrong, and the reason they invent numbers.

### Keeping it honest

Five rules stop the assistant making things up:

1. **It never produces a number it wasn't given.** Balances, working days and salary figures are computed in code and handed over finished.
2. **Tools return JSON, not sentences.**
3. **Nothing relevant found → it says so.** If no document clears the similarity threshold, the answer is *"I couldn't find this in the policy documents."* It never falls back on general knowledge of labour law.
4. **Cite or don't claim.** Every policy answer carries its source document and section.
5. **Permissions live in the tools, not the prompt.** Every tool receives `{ userId, role }` and enforces access itself. A system prompt is not a security boundary.

### Actions need confirmation

The assistant can apply for leave — but never submits on its own:

```
┌─ Leave request — draft ──────────────────┐
│  Type            Sick leave              │
│  Dates           Mon 24 – Wed 26 Aug     │
│  Working days    3                       │
│  Balance after   4 → 1 days              │
│                                          │
│           [ Edit ]  [ Confirm & submit ] │
└──────────────────────────────────────────┘
   Nothing is submitted until you confirm.
```

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React (Vite), Tailwind CSS | Fast dev server, utility-first styling, no design-system fights |
| **Routing / State** | React Router, TanStack Query | Route-level role guards; caching and refetching handled for us |
| **Charts** | Recharts | Declarative React components for attendance and salary views |
| **Backend** | Node.js, Express | One language across the stack; minimal framework overhead |
| **Database** | MongoDB Atlas, Mongoose | Hosted cluster, flexible schemas, enums and indexes for data rules |
| **Validation** | Zod | Validates every request — *and* generates the AI tool schemas |
| **Auth** | JWT + bcrypt | Stateless tokens, no session store, passwords never stored readable |
| **LLM** | Groq — `openai/gpt-oss-120b` | Open-weight MoE with native tool calling, served fast enough to feel instant |
| **Embeddings** | `@xenova/transformers` — `all-MiniLM-L6-v2` | 384-dim vectors generated **in-process** — no embedding API, no key, no cost |
| **Vector DB** | Qdrant | Purpose-built similarity search over the HR policy documents |

### RAG configuration

| Setting | Value |
|---|---|
| Text splitter | `RecursiveCharacterTextSplitter` |
| Chunk size | 800 characters |
| Chunk overlap | 120 characters (15%) |
| Embedding model | `all-MiniLM-L6-v2` (384 dimensions) |
| Similarity | Cosine |
| Results retrieved | top 4 |
| Score threshold | 0.45 |

> **Why 800 characters?** `all-MiniLM-L6-v2` silently truncates anything past ~256 tokens (roughly 1000 characters). Chunk bigger and the tail of every chunk never gets embedded at all — no error, retrieval just quietly gets worse.

---

## 💰 Salary Engine

HR sets **one number — the monthly wage.** Every component derives from it automatically and recalculates whenever the wage changes.

**Earnings** — percentages are of Basic, except Basic itself which is of Wage:

| Component | Rule | At ₹50,000 |
|---|---|---|
| Basic Salary | 50% of Wage | ₹25,000.00 |
| House Rent Allowance | 50% of Basic | ₹12,500.00 |
| Standard Allowance | fixed | ₹4,167.00 |
| Performance Bonus | 8.33% of Basic | ₹2,082.50 |
| Leave Travel Allowance | 8.33% of Basic | ₹2,082.50 |
| Fixed Allowance | Wage − everything above | ₹4,168.00 |

**Deductions:** Provident Fund 12% of Basic (employee and employer) · Professional Tax ₹200 fixed.

> **Net pay: ₹46,800.00**

Fixed Allowance is the balancing item, which guarantees components can never exceed the wage.

**Payable days come from attendance, not the calendar.** Unpaid leave and missing attendance days automatically reduce payable days:

```
netPayable = netPay × (payableDays ÷ totalWorkingDays)
```

---

## 🆔 Employee ID Generation

Login IDs are generated by the system when HR creates an employee — never chosen by a user.

```
   OI      JO       DO      2022      0001
   │       │        │        │          │
   │       │        │        │          └─ serial number of joining that year
   │       │        │        └──────────── year of joining
   │       │        └───────────────────── first 2 letters of last name   (DOe)
   │       └────────────────────────────── first 2 letters of first name  (JOhn)
   └────────────────────────────────────── company code

   John Doe, first hire of 2022  →  OIJODO20220001
```

The serial resets each year and is allocated atomically, so simultaneous creations can't collide.

**There is no self-registration.** Sign-up creates a *company* and its first admin. Every employee after that is created by HR, receives a generated password, and must change it on first login.

---

## 🔒 Security Model

| Action | Employee | Admin / HR |
|---|---|---|
| View own profile | ✅ | ✅ |
| View other employees' profiles | ❌ | ✅ |
| Edit own profile | Address, phone, photo only | — |
| Edit any employee record | ❌ | ✅ |
| View attendance | Own only | Everyone |
| Approve / reject time off | ❌ | ✅ |
| View salary | Own, read-only | Everyone |
| Update salary structure | ❌ | ✅ |

Authorization is enforced on the server — hiding a button is not security. The AI inherits the caller's permissions: an employee asking for a colleague's salary is refused by a `403` from the tool, not by the model choosing to be polite.

---

## 📁 Repository Structure

```
HRMS-platform/
├── Frontend/                 # React + Vite + Tailwind
│   └── src/
│       ├── pages/            # Login, Employees, Attendance, TimeOff, Profile, Assistant
│       ├── components/       # Shared UI components
│       ├── api/              # Axios client + TanStack Query hooks
│       └── auth/             # Token storage, role guards
│
├── backend/                  # Node.js + Express + MongoDB
│   └── src/
│       ├── models/           # Mongoose schemas
│       ├── routes/           # HTTP layer — thin
│       ├── services/         # Business logic — single source of truth
│       ├── middleware/       # auth, requireAdmin, error handling
│       ├── lib/              # Login ID generator, salary engine, working days
│       └── ai/               # AI agent + RAG
│           ├── agent.js      # Groq tool-calling loop
│           ├── tools/        # Tool definitions + handlers
│           └── rag/          # Ingest, chunk, embed, retrieve
│
└── docs/                     # Spec, API contract, design prompts
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **MongoDB Atlas** cluster (free tier is enough)
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **Qdrant** instance — [Qdrant Cloud](https://cloud.qdrant.io) free tier, or local Docker

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

3. Create `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-long-random-secret
   GROQ_API_KEY=gsk_...
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ```

4. Run both servers:
   ```bash
   # Terminal 1 — backend on :5000
   cd backend && npm run dev

   # Terminal 2 — frontend on :5173
   cd Frontend && npm run dev
   ```

5. Load demo data and policy documents:
   ```bash
   cd backend
   npm run seed      # 1 admin, 6 employees, 2 weeks of attendance
   npm run ingest    # embeds HR policy docs into the vector store
   ```

Open **http://localhost:5173** and sign in with the credentials printed by the seed script.

---

## 🗺️ Roadmap

- [ ] Email and push notification alerts
- [ ] Analytics dashboard — attendance trends, department reports
- [ ] Downloadable PDF payslips
- [ ] MCP server, exposing HR tools to external AI clients
- [ ] Hybrid search (dense + BM25) for policy retrieval
- [ ] Mobile-responsive layouts
- [ ] Multi-company support

---

## 📄 License

This project is licensed under the MIT License.
