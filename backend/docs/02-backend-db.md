# Brief — Backend & Database

**Owner: Member 2** · Hackathon duration: **8 hours** · Team of 3

> Drop this file into your project root as `CLAUDE.md` so your AI tooling has full context.
>
> **Read [`docs/PLAN.md`](../PLAN.md) alongside this** — it holds the integrated timeline,
> the sync checkpoints, the cut list and the demo script. Where its schedule differs from
> section 9 below, the plan wins.

---

## 1. What we are building

**Dayflow** — a Human Resource Management System. Employees check in/out, view attendance,
apply for time off, and view their salary. Admin / HR officers create employees, approve
time off, and manage salary structures that compute automatically from a single wage figure.
A third member is adding an AI assistant on top.

Two roles only: `ADMIN` (HR officer) and `EMPLOYEE`.

**The wireframe is the spec.** Where the original PDF disagrees with the Excalidraw board
(`Human Resource Management System - 8 hours`), the wireframe wins.

## 2. Stack

React + Tailwind (frontend) · **Node.js + Express (you)** · **MongoDB Atlas + Mongoose (you)**
· Zod validation · JWT + bcrypt · Groq + Qdrant (AI layer, not yours).

## 3. Team split

| Member | Owns |
|---|---|
| Hari | AI agent, RAG, agent routes |
| **You** | **Express APIs, Mongoose schemas, auth, salary engine, seed data** |
| Member 3 | React frontend |

You are the **critical path**. Both other members are blocked on your endpoints, so ship
in the order given in section 9 and tell people the moment a route goes live.

---

## 4. Non-negotiable rules

1. **Authorization is enforced here, not in the UI.** Every route returning
   employee-scoped data filters by `req.user.id` unless `req.user.role === 'ADMIN'`.
2. **Salary endpoints are Admin-only.** An employee hitting `GET /employees/:id/salary`
   for anyone — including themselves — goes through `/payroll/me` instead.
3. **Routes stay thin; logic lives in `services/`.** Hari's agent tools import your service
   functions directly. If a rule lives in a route handler, the agent bypasses it.
4. **Never let the caller pass `role`, `loginId`, `wage`, or `companyId` in a PATCH body.**
   Whitelist fields explicitly per role.
5. **Status fields are closed enums** at the schema level.
6. Money is stored as a **Number rounded to 2 decimals**. Do all salary maths in one place.

---

## 5. Data model

Five collections. Reference by id — **never embed attendance or time off inside the
employee document**, they grow unbounded.

```js
// companies
{ name, logoUrl, code: "OI", joiningSerialByYear: { "2022": 4 } }

// users            (auth identity)
{ companyId, loginId: "OIJODO20220001", email, passwordHash,
  role: "ADMIN" | "EMPLOYEE", mustChangePassword: true, employeeId }

// employees        (profile)
{ companyId, userId, firstName, lastName, jobPosition, email, mobile,
  department, managerId, location, dateOfJoining, avatarUrl,
  resume: { about, loveAboutJob, interests, skills: [], certifications: [] },
  privateInfo: { dateOfBirth, nationality, personalEmail, maritalStatus, gender,
                 residingAddress,
                 bank: { accountNumber, bankName, ifsc, pan, uan, empCode } },
  salary: { wage, workingDaysPerWeek, breakMinutes, hoursPerDay } }

// attendancerecords
{ companyId, employeeId, date: "2025-10-22", checkIn, checkOut,
  workMinutes, extraMinutes, status: "PRESENT"|"ABSENT"|"HALF_DAY"|"LEAVE" }

// timeoffrequests
{ companyId, employeeId, type: "PAID"|"SICK"|"UNPAID",
  startDate, endDate, days, reason, attachmentUrl,
  status: "PENDING"|"APPROVED"|"REJECTED", reviewerId, reviewComment, createdAt }
```

**Indexes — these enforce your invariants, do not skip them:**
```js
attendancerecords.index({ employeeId: 1, date: 1 }, { unique: true })  // one record per day
timeoffrequests.index({ employeeId: 1, status: 1 })
timeoffrequests.index({ status: 1, createdAt: -1 })                    // admin queue
users.index({ loginId: 1 }, { unique: true })
users.index({ email: 1 }, { unique: true })
```

---

## 6. Login ID generation

`OI` + first 2 letters of first name + first 2 of last name + year of joining + 4-digit serial.

```
John Doe, joined 2022, 1st hire that year  ->  OIJODO20220001
```

Uppercase. The serial resets each year. **Allocate it atomically** — use
`findOneAndUpdate` with `$inc` on `companies.joiningSerialByYear.<year>` so two
simultaneous creations cannot collide.

New employees get an auto-generated temporary password and `mustChangePassword: true`.
Return the temp password in the create response — the admin reads it out to the employee.
There is **no self-registration and no email verification.**

---

## 7. Salary engine — the highest-value feature

Admin enters **one number (Wage)**. Everything else derives, and re-derives whenever the
wage changes. Percentages are of **Basic**, except Basic itself which is of Wage.

```js
function computeSalary(wage) {
  const basic = wage * 0.50;
  const hra   = basic * 0.50;
  const std   = 4167;                 // fixed amount
  const bonus = basic * 0.0833;
  const lta   = basic * 0.0833;
  const fixed = wage - (basic + hra + std + bonus + lta);   // balancing item

  const pfEmployee = basic * 0.12;
  const pfEmployer = basic * 0.12;
  const ptax       = 200;             // fixed

  const gross  = basic + hra + std + bonus + lta + fixed;   // === wage by construction
  const netPay = gross - pfEmployee - ptax;
  return { /* round every value to 2dp */ };
}
```

At Wage ₹50,000: Basic 25,000 · HRA 12,500 · Standard 4,167 · Bonus 2,082.50 ·
LTA 2,082.50 · Fixed 4,168 · PF(e) 3,000 · PF(er) 3,000 · PTax 200 · **Net 46,800**.

- The total of components must never exceed the Wage — Fixed Allowance guarantees this.
- ⚠️ The wireframe prints Fixed Allowance as ₹2,918 but its own stated rule gives ₹4,168.
  **Implement the rule.** The mockup figure does not reconcile.

**Payable days come from attendance, not the calendar.** Unpaid leave and missing
attendance days reduce payable days:
`netPayable = netPay × (payableDays / totalWorkingDays)`

---

## 8. Endpoints

Full contract with request/response shapes: [`docs/api-contract.md`](../api-contract.md).
That file is the agreement — **do not rename a path or field without telling the other two.**

Summary of what you own:

- `POST /auth/register-company`, `POST /auth/login`, `POST /auth/change-password`, `GET /auth/me`
- `GET|POST /employees`, `GET|PATCH /employees/:id`, `GET|PUT /employees/:id/salary`
- `POST /attendance/check-in`, `POST /attendance/check-out`,
  `GET /attendance/me`, `GET /attendance/me/summary`, `GET /attendance`
- `GET /timeoff/allocations/me`, `GET /timeoff/me`, `GET /timeoff`,
  `POST /timeoff`, `PATCH /timeoff/:id/approve`, `PATCH /timeoff/:id/reject`
- `GET /payroll/me`, `GET /payroll/:employeeId`

**Employee card status** (`GET /employees`) is computed, not stored:
🟢 `PRESENT` checked in today · ✈️ `ON_LEAVE` approved time off covering today ·
🟡 `ABSENT` neither.

**Approving time off writes to two collections** — the request status *and* attendance
records for the covered dates (status `LEAVE`). Wrap it in a Mongoose transaction; Atlas
replica sets support them.

---

## 9. Your 8-hour order of work

Ship in this sequence — the others unblock as you go.

| Time | Deliver | Unblocks |
|---|---|---|
| 0:00–0:30 | Express + Mongoose scaffold, `.env`, CORS, error handler | — |
| 0:30–1:30 | Schemas + indexes + **seed script** (1 admin, 6 employees, 2 weeks attendance) | everyone |
| 1:30–2:30 | Auth: login, JWT middleware, `requireAdmin`, `/auth/me` | frontend login, agent auth |
| 2:30–3:30 | Employees list + create (login ID gen) + get + patch | frontend grid, profile |
| 3:30–4:30 | **Salary engine** + salary GET/PUT | frontend salary tab, agent salary tool |
| 4:30–5:30 | Attendance check-in/out, `/me`, `/me/summary`, admin day view | frontend attendance, agent |
| 5:30–6:30 | Time off: allocations, create, list, approve/reject | frontend time off, agent |
| 6:30–7:00 | Payroll endpoints, integration fixes | — |
| 7:00–8:00 | Bug fixes, demo rehearsal support | — |

**Do the seed script early.** Frontend and the agent both need realistic data to build
against, and demo data written at hour 7 is how demos fail.

---

## 10. Deliberately out of scope

Email verification · password reset flows · file upload to S3 (store a URL string) ·
pagination · soft deletes · audit logs · multi-company switching. If you find yourself
building any of these, stop.
