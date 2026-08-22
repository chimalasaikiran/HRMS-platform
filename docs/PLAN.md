# Dayflow — 8-hour execution plan

**Read this first, whichever part you own.** Your individual brief tells you *what* to
build. This tells you *when*, *what you are blocked on*, and *what we cut if we fall behind*.

This timeline is authoritative. Where it disagrees with the schedule at the end of your own
brief, follow this one.

---

## 1. Mission

Ship a working HRMS with an AI assistant in 8 hours, with 3 people, and demo it live.

**Definition of success** — these seven things work end to end. Nothing else counts:

1. Admin signs in and sees the Employees grid with live status dots
2. Admin creates an employee, Login ID auto-generates (`OIJODO20220001`)
3. Admin sets Wage `50000`, all salary components compute instantly
4. Employee signs in and checks in, status dot flips green
5. Employee applies for sick leave, Admin approves it
6. Employee asks the AI "how many leaves do I have left?" and gets a real number
7. Employee asks for someone else's salary and is refused by role policy

Everything else in the spec is decoration on top of these seven.

---

## 2. Team & ownership

| Member | Owns | Brief |
|---|---|---|
| **Hari** | AI agent, RAG, `/ai/chat` | [`team/01-ai-agent-rag.md`](team/01-ai-agent-rag.md) |
| **Member 2** | Express APIs, Mongoose, auth, salary engine | [`team/02-backend-db.md`](team/02-backend-db.md) |
| **Member 3** | React frontend, all screens | [`team/03-frontend.md`](team/03-frontend.md) |

Shared and frozen: [`api-contract.md`](api-contract.md) · Full spec: [`../CLAUDE.md`](../CLAUDE.md)
· UI prompts: [`stitch-prompts.md`](stitch-prompts.md)

---

## 3. The dependency chain

```
Member 2 (backend)  ──────►  Member 3 (frontend)
        │                            ▲
        └──────►  Hari (agent)  ─────┘
```

**Member 2 is the critical path.** Both others consume their services. Two consequences:

- Member 2 ships in dependency order and **announces every route the moment it goes live**.
- Member 3 and Hari **never sit idle waiting**. Member 3 builds against mock data shaped
  like the contract; Hari builds RAG first, which has no dependencies at all.

The contract in [`api-contract.md`](api-contract.md) exists so all three can work in
parallel from minute one. **Nobody changes a path or a field name without telling the
other two.**

---

## 4. Integrated timeline

| Time | Member 2 — Backend | Member 3 — Frontend | Hari — AI |
|---|---|---|---|
| **0:00–0:30** | Express + Mongoose scaffold, `.env`, CORS, error handler | Vite + Tailwind + router + design tokens | Groq key working, one tool-call round trip proven |
| **0:30–1:30** | Schemas + indexes + **seed script** | Login / Sign Up / change-password vs mocks | Write 3–4 HR policy docs, chunk, embed, load Qdrant |
| **1:30–2:30** | Auth: login, JWT middleware, `requireAdmin`, `/auth/me` | Auth context, role guard, app shell + top bar | `search_hr_policy` tool + threshold + citations |
| **2:30–3:30** | Employees list / create / get / patch + Login ID generator | **Employees grid + status dots + Check In/Out systray** | Agent loop: Zod schemas, tool dispatch, `steps[]` |
| **3:30–4:30** | **Salary engine** + salary GET/PUT | Employee profile, four tabs, locked vs editable | Read-only tools on Member 2's real services |
| **4:30–5:30** | Attendance: check-in/out, `/me`, summary, admin day view | **Salary Info tab** — wage in, components render | `/ai/chat` + auth context + **role enforcement + `blocked`** |
| **5:30–6:30** | Time off: allocations, create, list, approve/reject | Attendance, both role variants | Draft/confirm for `apply_time_off`, admin tools |
| **6:30–7:00** | Payroll endpoints, integration fixes | Time Off list + new request modal + approve/reject | Wire into Member 3's assistant panel |
| **7:00–7:30** | 🔒 **FEATURE FREEZE** — integration and bug fixes only, all three | | |
| **7:30–8:00** | Demo rehearsal, twice, start to finish | | |

---

## 5. Sync checkpoints

Four hard stops. Everyone puts hands off keyboards for five minutes and says what is
working, what is broken, and what they need.

| When | Gate — we must be able to say yes |
|---|---|
| **1:30** | Seed data is in MongoDB. Contract confirmed unchanged. Everyone's project runs. |
| **3:30** | Login works end to end, real token. Employees grid renders real data. |
| **5:30** | Salary engine works in the UI. Agent answers one real question with a tool call. |
| **7:00** | **Feature freeze.** Whatever is not working now gets cut, not fixed by adding code. |

If a checkpoint gate fails, go straight to the cut list — do not negotiate for "just
twenty more minutes."

---

## 6. Cut list

If we fall behind, sacrifice **in this order**. Decide now, while nobody is panicking.

1. Admin attendance day-view (the employee view alone demos fine)
2. Resume tab rich content — leave About / Skills / Certifications static
3. Time-off attachment upload (accept a URL string, or drop the field)
4. Admin agent tools — `get_absent_employees`, `list_pending_timeoff`, `approve_timeoff`
5. Separate Payroll page (the Salary Info tab already shows the numbers)
6. RAG / policy questions entirely — the agent keeps its data tools and still demos

**Never cut, in any circumstance:** login · Employees grid with status dots · the salary
engine · the agent answering a leave-balance question · the role-policy refusal.

Those are items 1–7 in section 1. They are the demo.

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Backend runs late, others blocked | Contract is frozen and mocks exist from hour 0. Member 2 ships seed data at 1:30 before any polish. |
| Groq free-tier rate limits during the demo | Second API key ready. Handle 429 with a friendly retry message, never a stack trace. |
| Qdrant setup eats an hour | **Fallback: skip Qdrant.** The corpus is ~40 chunks — do cosine similarity over a plain JSON array in memory. Same results, zero infrastructure. Decide by 1:30. |
| Mongo transaction fails (not a replica set) | Atlas is a replica set and supports them. On a local single node, fall back to sequential writes and accept the small race. |
| Salary figures do not match the mockup | The wireframe's own numbers do not reconcile — Fixed Allowance should be ₹4,168, printed as ₹2,918. Implement the **rule**, mention it if asked. |
| Model hallucinates a number | Tools return finished values; the model never calculates. See rule 1 in Hari's brief. |
| Merge conflicts late in the build | Three separate top-level folders — `server/`, `client/`, `server/src/ai/`. Commit small and often. |

---

## 8. Demo script

Six minutes. Rehearse it twice. Assign a driver per beat so nobody fumbles for a laptop.

| # | Beat | Driver |
|---|---|---|
| 1 | Admin signs in → Employees grid, status dots explained (🟢 present · ✈️ leave · 🟡 absent) | M3 |
| 2 | Create an employee → **Login ID generates as `OIJODO20220001`**, explain the format | M2 |
| 3 | Salary Info → type Wage `50000` → **every component fills in instantly** | M2 |
| 4 | Employee signs in on a second window → Check In → dot flips green | M3 |
| 5 | Employee applies for sick leave → Admin approves → reflected immediately | M3 |
| 6 | Ask Dayflow AI *"how many leaves do I have left?"* → steps chips, real number from Mongo | Hari |
| 7 | Ask *"what is the salary of the accounts manager?"* → **padlock refusal.** Then sign in as Admin, ask again, it answers. | Hari |

**Beat 7 is the close.** Same agent, same question, different outcome — enforced in code,
not in a prompt. Say that sentence out loud; it is the strongest thirty seconds we have.

Have the browser windows, two logins and seed data ready **before** the demo slot. Do not
create a user live unless beat 2 requires it.

---

## 9. Ground rules

1. **Contract changes are announced.** Renaming a field silently costs someone else an hour.
2. **Say when a route goes live.** Post the path in the group the second it works.
3. **No refactors after hour 4.** Ugly and working beats clean and broken.
4. **Commit to `master` often**, small commits. Separate folders make conflicts rare.
5. **Authorization is server-side.** Hiding a button is not security — a judge will check.
6. **The AI never computes a number.** Services calculate; the model phrases.
7. **Ask for help at 20 minutes stuck.** Not 60.
8. **Seed data early.** Demo data written at hour 7 is how demos fail.
