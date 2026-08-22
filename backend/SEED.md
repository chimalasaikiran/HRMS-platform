# Dayflow seed credentials

## MongoDB Atlas

`.env` points at your Atlas cluster (database `dayflow`).

If connect fails with **IP not whitelisted**, open [Atlas → Network Access](https://cloud.mongodb.com/v2#/security/network/whitelist) and add:

1. **Allow Access from Anywhere** → `0.0.0.0/0` (best for the hackathon team), **or**
2. Your current public IP (example: `223.228.108.151`)

Then run `npm run seed` and `npm run dev` again.

---

Password for **all** seeded users: `Dayflow@123`

| Role | Email | Notes |
|------|-------|-------|
| ADMIN | `hr@dayflow.com` | HR Officer — Employees grid, salary, approvals |
| EMPLOYEE | `john.doe@dayflow.com` | Wage ₹50,000 — salary engine demo |
| EMPLOYEE | `priya.shah@dayflow.com` | Approved paid leave in seed |
| EMPLOYEE | `amit.patel@dayflow.com` | Accounts Manager — agent refusal demo |
| EMPLOYEE | `neha.mehta@dayflow.com` | Sales |
| EMPLOYEE | `rahul.verma@dayflow.com` | QA |
| EMPLOYEE | `sneha.iyer@dayflow.com` | People Ops |

## Commands

```bash
cd backend
npm install
npm run seed
npm run dev
```

- Local API: `http://localhost:5000/api`
- LAN API: printed on `npm run dev` as `Network:` (currently often `http://10.13.190.84:5000/api` or Tailscale `http://100.64.1.27:5000/api`)
- Auth: send `Authorization: Bearer <jwt>` — role is inside the token (`ADMIN` | `EMPLOYEE`), never trust a client `role` field
