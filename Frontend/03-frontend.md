# Brief — Frontend

**Owner: Member 3** · Hackathon duration: **8 hours** · Team of 3

> Drop this file into your project root as `CLAUDE.md` so your AI tooling has full context.
>
> **Read [`docs/PLAN.md`](../PLAN.md) alongside this** — it holds the integrated timeline,
> the sync checkpoints, the cut list and the demo script. Where its schedule differs from
> section 8 below, the plan wins.

---

## 1. What we are building

**Dayflow** — a Human Resource Management System. Employees check in/out, view attendance,
apply for time off, and view their salary. Admin / HR officers create employees, approve
time off, and manage salary structures that compute automatically from a single wage figure.
A third member is adding an AI assistant, which you will render.

Two roles only: `ADMIN` (HR officer) and `EMPLOYEE`. **Almost every screen has two
variants.** Build the role check into each page from the start; retrofitting it is painful.

**The wireframe is the spec.** Where the original PDF disagrees with the Excalidraw board
(`Human Resource Management System - 8 hours`), the wireframe wins.

## 2. Stack

**React (Vite) + Tailwind CSS (you)** · react-router · TanStack Query · Recharts ·
Node/Express + MongoDB (Member 2) · Groq + Qdrant (Hari).

## 3. Team split

| Member | Owns |
|---|---|
| Hari | AI agent, RAG, agent routes |
| Member 2 | Express APIs, Mongoose schemas, auth, salary engine |
| **You** | **All screens, routing, state, styling, role-based rendering** |

---

## 4. Do not wait for the backend

The API contract is agreed and frozen: [`docs/api-contract.md`](../api-contract.md).
Build against **mock data shaped exactly like the contract** from hour 0, behind a
TanStack Query layer, then swap the fetcher when endpoints go live. Member 2 ships a seed
script early — real data should appear around hour 1:30.

Auth: JWT in `localStorage`, attached as `Authorization: Bearer <token>`.
`GET /auth/me` returns `{ id, name, loginId, email, role, avatarUrl }` — put it in context
and gate on `role`.

Error shape is always `{ error: { code, message } }`. Render `message` directly; it is
written to be user-facing.

---

## 5. Navigation

Top bar on every authenticated screen:

```
[Company Logo]  Employees   Attendance   Time Off        [Searchbar]  [Avatar ▾]
                                                                       ├ My Profile
                                                                       └ Log Out
```

Routes: `/login`, `/signup`, `/employees`, `/employees/:id`, `/attendance`, `/timeoff`,
`/me`, `/assistant`.

---

## 6. Screens

### 6.1 Sign In / Sign Up
- **Sign In:** Login ID *or* Email + Password. Inline error on failure. If the response has
  `mustChangePassword: true`, force a change-password screen before the app loads.
- **Sign Up creates a *company*, not an employee** — Company Name, Name, Email, Phone,
  Password, Confirm Password, Upload Logo. Employees cannot self-register; admins create them.

### 6.2 Employees grid — landing page after login
Cards showing avatar + name + job position. **Top-right of each card is a status indicator:**

| Indicator | Meaning |
|---|---|
| 🟢 green dot | present in office (checked in today) |
| ✈️ airplane | on approved leave today |
| 🟡 yellow dot | absent — no time off applied, not checked in |

Cards are clickable → employee detail page, opened **view-only (non-editable)** for
employees. Admin sees a `NEW` button to create an employee; on success show the generated
**Login ID and temporary password** in a modal — the admin reads these to the new hire.

Also on this screen: the **Check In / Check Out systray**. A button showing `Check IN →`
with a red dot; after check-in it flips green and shows `Since 10:00 AM` with a
`Check Out →` button.

### 6.3 Employee profile
Header: avatar, name, job position, then fields — Login ID, Email, Mobile, Company,
Department, Manager, Location.

Tabs: **Resume · Private Info · Salary Info · Security**

- **Resume** — About, What I love about my job, My interests and hobbies (free text);
  Skills and Certification with `+ Add Skills`.
- **Private Info** — Date of Birth, Nationality, Personal Email, Marital Status, Gender,
  Residing Address, Date of Joining, and Bank Details (Account Number, Bank Name, IFSC,
  PAN No, UAN No, Emp Code).
- **Salary Info — render this tab only when `role === 'ADMIN'`.** Do not render it disabled;
  do not render it at all.
- **Security** — change password. Only on your own profile (`/me`).

Employees may edit only mobile, residing address, avatar and Resume fields. Everything else
renders locked with a padlock icon and the tooltip "Only HR can edit this field". The
backend enforces this too — but make the distinction visible at a glance.

### 6.4 Salary Info tab (admin only)
Admin types **one number — Wage** — and every component fills in instantly. Show the
recompute happening; it is the most impressive interaction in the app.

Layout: Wage (Month / Yearly toggle), working days per week, break time, hours per day.
Then a components table — Component · description · Amount ₹/month · Percentage.

| Component | Rule | At ₹50,000 |
|---|---|---|
| Basic Salary | 50% of Wage | 25,000.00 |
| House Rent Allowance | 50% of Basic | 12,500.00 |
| Standard Allowance | fixed | 4,167.00 |
| Performance Bonus | 8.33% of Basic | 2,082.50 |
| Leave Travel Allowance | 8.33% of Basic | 2,082.50 |
| Fixed Allowance | Wage − all above | 4,168.00 |

Deductions: PF employee 12% of Basic (3,000) · PF employer 12% (3,000) · Professional Tax 200.
Net pay 46,800.

The backend returns all of this computed — **do not calculate salary in the browser.**
Send the wage, render what comes back.

### 6.5 Attendance
Two variants of one page.

- **Employee (default):** day-wise attendance for the ongoing month. Month picker (`Oct ▾`),
  and summary tiles — count of days present, leaves count, total working days.
  Table: Date · Check In · Check Out · Work Hours · Extra hours.
- **Admin:** all employees present on a chosen day. Date stepper `← 22, October 2025 →`
  with a Day/Date toggle and a search bar. Table: Emp · Check In · Check Out · Work Hours ·
  Extra hours.

Times render as `10:00`, `19:00`, `09:00`, `01:00`.

### 6.6 Time Off
- **Employee:** own requests only. Allocation cards at the top — `24 Days Available`
  (Paid Time Off), `07 Days Available` (Sick time off). List: Name · Start Date · End Date ·
  Time off Type · Status.
- **Admin:** all employees' requests, plus **Approve and Reject buttons** and a comment field.

**New request modal** (`NEW` button): Employee · Time off Type (`Paid Time Off`,
`Sick Leave`, `Unpaid Leaves`) · Validity Period (From → To) · Allocation in days (`01.00`)
· Attachment (labelled "For sick leave certificate") · **Submit** / **Discard**.

### 6.7 Dayflow AI assistant
Hari builds the agent; you render it. One endpoint: `POST /ai/chat` with
`{ messages: [{ role, content }] }`.

The response carries more than text — render each part:

| Field | Render as |
|---|---|
| `reply` | assistant message text |
| `steps[]` | a collapsed "Steps" row of chips above the reply — `Checked leave balance` — expandable, shimmer while running |
| `blocks[]` | rich cards: `leave_balance`, `attendance_table`, `salary_breakdown`, `policy_excerpt`, `timeoff_draft` |
| `sources[]` | a small clickable source chip, e.g. `Leave Policy 2026 · 4.2` |
| `pendingAction` | a **draft card with Edit / Confirm & submit** — on confirm, POST the payload to the real endpoint |
| `blocked` | a red-tinted padlock card with the refusal message and `Blocked by role policy` |

**The `blocked` state is our closing demo beat** — an employee asks for someone else's
salary and gets a designed refusal, not an error. Make it look deliberate and trustworthy.

Entry points: a floating violet button bottom-right on every page, and a full `/assistant` page.

---

## 7. Design system

Ready-made Google Stitch prompts for every screen, including the assistant:
[`docs/stitch-prompts.md`](../stitch-prompts.md). Generate, then convert to Tailwind.

Primary violet `#6D4AFF` · deep violet `#3B2A80` · amber `#FFB020` · canvas `#F7F7FB` ·
surface `#FFFFFF` · border `#E9E7F2` · text `#1B1836` · muted `#6B6785`.
Status: green `#12B76A` present/approved · amber `#F79009` pending/half-day ·
red `#F04438` absent/rejected · blue `#2E90FA` on leave.

Font Plus Jakarta Sans. Cards 16px radius, inputs 12px, pill buttons, status pills as a
10% tint with solid coloured text. **Tabular numerals on every figure, time and duration** —
the attendance and salary tables look broken without them.

---

## 8. Your 8-hour order of work

| Time | Deliver |
|---|---|
| 0:00–0:45 | Vite + Tailwind + router + design tokens; axios client + TanStack Query; mock fetchers |
| 0:45–1:30 | Login / Sign Up / force-change-password; auth context + role guard |
| 1:30–2:45 | App shell (top bar, avatar menu) + **Employees grid with status dots** + Check In/Out systray |
| 2:45–4:00 | Employee profile with all four tabs; locked vs editable fields |
| 4:00–5:00 | **Salary Info tab** — wage in, components render |
| 5:00–6:00 | Attendance, both role variants |
| 6:00–6:45 | Time Off list + new request modal + admin approve/reject |
| 6:45–7:30 | Assistant panel — steps, blocks, draft confirm, blocked card |
| 7:30–8:00 | Polish, empty states, demo rehearsal |

**Build the Employees grid before anything pretty.** It is the landing screen and the first
thing judges see.

---

## 9. Deliberately out of scope

Dark mode · animations beyond simple transitions · mobile responsive (demo on a laptop) ·
pagination · real file upload (accept a URL string) · form libraries beyond simple state ·
i18n. If you find yourself building any of these, stop.
