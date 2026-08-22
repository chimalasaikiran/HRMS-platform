# Dayflow Server (Member 2)

Express + MongoDB backend for Dayflow HRMS. Implements the frozen [api-contract](./docs/api-contract.md).

## Quick start

1. MongoDB running locally (or set Atlas URI in `.env`)
2. `npm install`
3. `npm run seed`
4. `npm run dev` → binds `0.0.0.0:5000`
   - Local: `http://localhost:5000/api`
   - LAN: `http://<your-ip>:5000/api` (printed on startup)

See [SEED.md](./SEED.md) for demo logins.

## Layout

- `src/models` — Company, User, Employee, AttendanceRecord, TimeOffRequest
- `src/services` — business rules (import these from the AI agent)
- `src/routes` — thin HTTP adapters
- `src/middleware` — JWT, requireAdmin, errors

## Announce when live

Post in the team chat as each area lands: `/auth/*`, `/employees`, `/employees/:id/salary`, `/attendance/*`, `/timeoff/*`, `/payroll/*`.
