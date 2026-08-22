# API contract

Agreed at hour 0. **Do not change a path or field name without telling the other two.**
Frontend codes against this while the backend is still being written; the agent's tools
wrap the same service functions behind these routes.

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <jwt>` on everything except `/auth/register-company` and `/auth/login`.

Error shape, always:
```json
{ "error": { "code": "FORBIDDEN", "message": "Salary details are visible only to HR officers." } }
```
Codes: `VALIDATION_ERROR` 400, `UNAUTHORIZED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT` 409.

---

## Auth

| Method | Path | Who | Body / Notes |
|---|---|---|---|
| POST | `/auth/register-company` | public | `{ companyName, adminName, email, phone, password, logoUrl? }` → creates company + first Admin |
| POST | `/auth/login` | public | `{ identifier, password }` — identifier is Login ID **or** email → `{ token, user, mustChangePassword }` |
| POST | `/auth/change-password` | any | `{ currentPassword, newPassword }` |
| GET | `/auth/me` | any | → `{ id, name, loginId, email, role, avatarUrl, companyId }` |

`role` is `"ADMIN"` or `"EMPLOYEE"`.

---

## Employees

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/employees` | any | Grid cards. `?search=` → `[{ id, name, jobPosition, avatarUrl, status }]` where `status` is `PRESENT` \| `ON_LEAVE` \| `ABSENT` |
| POST | `/employees` | admin | `{ firstName, lastName, email, mobile, jobPosition, department, manager, location, dateOfJoining }` → auto-generates `loginId` + temp password, returns both |
| GET | `/employees/:id` | any | Full profile. Non-admin viewing someone else gets the view-only subset (no `privateInfo`, no salary) |
| PATCH | `/employees/:id` | admin, or self | Self may send only `mobile`, `residingAddress`, `avatarUrl`, and Resume fields. Any other field from a non-admin → `403` |
| GET | `/employees/:id/salary` | **admin only** | → salary structure (below) |
| PUT | `/employees/:id/salary` | **admin only** | `{ wage, workingDaysPerWeek, breakMinutes, hoursPerDay }` → recomputes and returns all components |

### Employee object

```jsonc
{
  "id": "...",
  "loginId": "OIJODO20220001",
  "name": "John Doe",
  "jobPosition": "Backend Developer",
  "email": "john@odoo.in",
  "mobile": "+91...",
  "company": "Odoo India",
  "department": "Engineering",
  "manager": { "id": "...", "name": "..." },
  "location": "Gandhinagar",
  "avatarUrl": "...",
  "resume": { "about": "", "loveAboutJob": "", "interests": "", "skills": [], "certifications": [] },
  "privateInfo": {                        // self + admin only
    "dateOfBirth": "", "nationality": "", "personalEmail": "", "maritalStatus": "",
    "gender": "", "residingAddress": "", "dateOfJoining": "",
    "bank": { "accountNumber": "", "bankName": "", "ifsc": "", "pan": "", "uan": "", "empCode": "" }
  }
}
```

### Salary object (admin only)

```jsonc
{
  "wage": 50000,
  "workingDaysPerWeek": 5, "breakMinutes": 60, "hoursPerDay": 8,
  "earnings": [
    { "key": "BASIC",  "label": "Basic Salary",           "amount": 25000.00, "percent": 50.00 },
    { "key": "HRA",    "label": "House Rent Allowance",   "amount": 12500.00, "percent": 50.00 },
    { "key": "STD",    "label": "Standard Allowance",     "amount":  4167.00, "percent": 16.67 },
    { "key": "BONUS",  "label": "Performance Bonus",      "amount":  2082.50, "percent":  8.33 },
    { "key": "LTA",    "label": "Leave Travel Allowance", "amount":  2082.50, "percent":  8.33 },
    { "key": "FIXED",  "label": "Fixed Allowance",        "amount":  4168.00, "percent": 16.67 }
  ],
  "deductions": [
    { "key": "PF_EMPLOYEE", "label": "PF — employee", "amount": 3000.00, "percent": 12.00 },
    { "key": "PF_EMPLOYER", "label": "PF — employer", "amount": 3000.00, "percent": 12.00 },
    { "key": "PTAX",        "label": "Professional Tax", "amount": 200.00 }
  ],
  "gross": 50000.00,
  "netPay": 46800.00
}
```

---

## Attendance

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/attendance/check-in` | any | Idempotent for today → `{ checkIn, status }` |
| POST | `/attendance/check-out` | any | → `{ checkOut, workHours, extraHours }` |
| GET | `/attendance/me?month=YYYY-MM` | any | Day-wise, current month by default |
| GET | `/attendance/me/summary?month=YYYY-MM` | any | `{ daysPresent, leavesCount, totalWorkingDays, payableDays }` |
| GET | `/attendance?date=YYYY-MM-DD` | **admin** | All employees for that day |

Record shape: `{ date, employeeId, employeeName, checkIn: "10:00", checkOut: "19:00", workHours: "09:00", extraHours: "01:00", status }`
Status enum: `PRESENT` \| `ABSENT` \| `HALF_DAY` \| `LEAVE`.

---

## Time off

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/timeoff/allocations/me` | any | `{ PAID: { available: 24 }, SICK: { available: 7 }, UNPAID: { available: null } }` |
| GET | `/timeoff/me` | any | Own requests |
| GET | `/timeoff?status=PENDING` | **admin** | All employees' requests |
| POST | `/timeoff` | any | `{ type, startDate, endDate, days, reason, attachmentUrl? }` |
| PATCH | `/timeoff/:id/approve` | **admin** | `{ comment? }` |
| PATCH | `/timeoff/:id/reject` | **admin** | `{ comment? }` |

Type enum: `PAID` \| `SICK` \| `UNPAID`. Status enum: `PENDING` \| `APPROVED` \| `REJECTED`.
`attachmentUrl` is for the sick-leave certificate.

---

## Payroll

| Method | Path | Who |
|---|---|---|
| GET | `/payroll/me` | any — read-only |
| GET | `/payroll/:employeeId` | **admin** |

Returns the salary object plus `{ month, payableDays, totalWorkingDays, netPayable }`.

---

## AI assistant

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/ai/chat` | any | `{ messages: [{ role, content }] }` |

Response:
```jsonc
{
  "reply": "You have 9 paid and 4 sick days remaining.",
  "steps": [ { "tool": "get_my_leave_balance", "label": "Checked leave balance", "ok": true } ],
  "blocks": [ { "type": "leave_balance", "data": { "PAID": 9, "SICK": 4, "UNPAID": 0 } } ],
  "sources": [ { "doc": "Leave Policy 2026", "section": "4.2" } ],
  "pendingAction": null,
  "blocked": null
}
```

- `blocks` — structured payloads the frontend renders as rich cards. Types:
  `leave_balance`, `attendance_table`, `salary_breakdown`, `policy_excerpt`, `timeoff_draft`.
- `pendingAction` — a draft the user must confirm, e.g.
  `{ "action": "apply_time_off", "payload": {...}, "summary": "Sick leave, Mon 24 – Wed 26 Aug, 3 days" }`.
  The frontend shows Edit / Confirm & submit; confirming POSTs the payload to the real endpoint.
- `blocked` — `{ "reason": "Salary details are visible only to HR officers.", "policy": "EMPLOYEE" }`
  when a tool refused on role grounds. Frontend renders the padlock card.
