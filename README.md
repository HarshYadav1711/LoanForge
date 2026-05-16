# LoanForge

LoanForge is an internal digital lending platform for borrower self-service and back-office operations. Borrowers complete a guided application with server-side eligibility checks; operations teams move loans through sanction, disbursement, and collection with role-based access on both the API and UI.

## Stack

| Layer | Technology |
| ----- | ---------- |
| Web | Next.js 15 (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod |
| API | Node.js, Express, TypeScript, Mongoose |
| Database | MongoDB (local) |
| Auth | JWT + bcrypt |
| Uploads | Multer (local `apps/server/uploads/`) |
| Shared | `@loanforge/shared` — types, validation, RBAC helpers |

## Prerequisites

- **Node.js** 20 or later
- **MongoDB** running locally (default URI below)

## Quick start

From the repository root:

```bash
npm install

cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local

npm run seed
npm run dev
```

| Service | URL |
| ------- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/api/health |

`npm run dev` builds the shared package, then starts the API and web app together. For separate terminals, use `npm run dev:server` and `npm run dev:web`.

Re-run `npm run seed` anytime to reset demo users and sample pipeline data (safe to run multiple times).

## Seed accounts

**Password for every seed account:** `Password1!`

| Role | Email | After login |
| ---- | ----- | ----------- |
| Admin | `admin@loanforge.test` | `/dashboard` — all modules |
| Sales | `sales@loanforge.test` | `/dashboard/sales` |
| Sanction | `sanction@loanforge.test` | `/dashboard/sanction` |
| Disbursement | `disbursement@loanforge.test` | `/dashboard/disbursement` |
| Collection | `collection@loanforge.test` | `/dashboard/collection` |
| Borrower | `borrower@loanforge.test` | `/borrower` — submitted application |

**Extra demo borrower (Sales pipeline):** `lead@loanforge.test` — draft application at the salary-slip step.

**Pre-seeded operations data**

- **Sales:** `lead@loanforge.test` appears as a pre-application lead.
- **Sanction:** `borrower@loanforge.test` has an **applied** loan (₹1,50,000 / 180 days) ready for review.

## Product flows

### Borrower portal (`/borrower`)

1. **Register or sign in** at `/register` or `/login`.
2. **Personal details** — name, DOB, PAN, employment, salary.
3. **BRE validation** — server-side rules (age 23–50, salary ≥ ₹25,000, valid PAN, not unemployed).
4. **Salary slip** — PDF, JPG, or PNG, max 5 MB.
5. **Loan configuration** — ₹50,000–₹5,00,000, 30–365 days, 12% p.a. simple interest.
6. **Submit** — creates a loan in `applied` status; timeline shown on the portal.

Interest: `SI = P × R × T / 365` (rate as decimal). Total repayment = principal + interest.

### Operations dashboard (`/dashboard`)

| Module | Role | Purpose |
| ------ | ---- | ------- |
| Sales | `sales`, `admin` | View draft applications (pre-submit leads) |
| Sanction | `sanction`, `admin` | Approve or reject `applied` loans (rejection requires a reason) |
| Disbursement | `disbursement`, `admin` | Mark `sanctioned` loans as `disbursed` |
| Collection | `collection`, `admin` | Record payments (unique UTR), track outstanding balance, auto-`closed` when fully repaid |

**Loan status flow:** `applied` → `sanctioned` | `rejected` → `disbursed` → `closed`

RBAC is enforced on the API (403 for wrong role) and in Next.js middleware (route redirects). Borrowers cannot access dashboard routes.

## Environment variables

### API — `apps/server/.env`

Copy from `apps/server/.env.example`.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `MONGODB_URI` | Yes | MongoDB connection string (default: `mongodb://127.0.0.1:27017/loanforge`) |
| `JWT_SECRET` | Yes | Secret for signing access tokens — use a long random string in production |
| `PORT` | No | API port (default `4000`) |
| `NODE_ENV` | No | `development` or `production` |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `CLIENT_URL` | No | Allowed CORS origin for the web app (default `http://localhost:3000`) |
| `UPLOAD_DIR` | No | Directory for salary slip files, relative to `apps/server` (default `uploads`) |

### Web — `apps/web/.env.local`

Copy from `apps/web/.env.example`.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL **including** `/api` (default `http://localhost:4000/api`) |

## Project structure

```
loanforge/
├── apps/
│   ├── web/          # Next.js — borrower portal + operations UI
│   └── server/       # Express API — auth, BRE, loans, dashboard
├── packages/
│   └── shared/       # Shared types, Zod schemas, RBAC helpers
└── package.json      # Workspace scripts
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Build shared + run API and web |
| `npm run dev:server` | API only |
| `npm run dev:web` | Web only |
| `npm run build` | Production build (shared, server, web) |
| `npm run start` | Run production builds |
| `npm run seed` | Reset demo users and pipeline data |
| `npm run lint` | Type-check all workspaces |
| `npm run test` | Shared package unit tests |

## Demo checklist (~3–5 minutes)

Use this order to match the assignment evaluation flow.

- [ ] **Setup** — `npm install`, copy env files, `npm run seed`, `npm run dev`, open http://localhost:3000
- [ ] **BRE fail** — Register a new borrower; enter age &lt; 23 or salary &lt; ₹25,000 or invalid PAN or **Unemployed**; confirm BRE blocks progress
- [ ] **BRE pass + apply** — Fix details, pass BRE, upload a slip (PDF/JPG/PNG), configure loan, submit; confirm status **applied**
- [ ] **Sales** — Sign in as `sales@loanforge.test`; confirm `lead@loanforge.test` draft lead is listed
- [ ] **Sanction** — Sign in as `sanction@loanforge.test`; approve the seeded `borrower@loanforge.test` loan (or the one you just applied)
- [ ] **Disbursement** — Sign in as `disbursement@loanforge.test`; disburse the sanctioned loan
- [ ] **Collection** — Sign in as `collection@loanforge.test`; record payment(s) with a **unique UTR** until outstanding is ₹0; confirm loan **closed**
- [ ] **Borrower view** — Sign in as the borrower; confirm timeline reflects sanction / disbursement / closed
- [ ] **RBAC** — As `borrower@loanforge.test`, try `/dashboard` (redirected); as `sales@loanforge.test`, try `/dashboard/sanction` (redirected)

**Optional:** Sign in as `admin@loanforge.test` to open any dashboard module from `/dashboard`.

## API overview

Base path: `/api`

| Area | Examples |
| ---- | -------- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Borrower | `GET /borrower/application`, `PUT /borrower/application/personal`, `POST /borrower/application/bre`, `POST /borrower/application/salary-slip`, `POST /borrower/application/submit` |
| Dashboard | `GET /dashboard/sales/leads`, `GET /dashboard/sanction/loans`, `POST /dashboard/sanction/loans/:id/approve`, `POST /dashboard/sanction/loans/:id/reject`, `GET /dashboard/disbursement/loans`, `POST /dashboard/disbursement/loans/:id/disburse`, `GET /dashboard/collection/loans`, `POST /dashboard/collection/loans/:id/payments` |

All dashboard and borrower routes require `Authorization: Bearer <accessToken>` from login.

## Troubleshooting

| Issue | Fix |
| ----- | --- |
| `Missing required environment variable` | Copy `.env.example` files and set `MONGODB_URI` + `JWT_SECRET` |
| MongoDB connection failed | Start MongoDB locally; confirm `MONGODB_URI` |
| Empty sanction queue after testing | Run `npm run seed` again to reset demo loans |
| CORS errors | Set `CLIENT_URL` to your web origin (default `http://localhost:3000`) |
| Payment rejected for date | Use today’s date (not future); payment cannot be before disbursement |

## License

Internal / assignment submission — not for production use without hardening (secrets, HTTPS, backups, audit logging).
