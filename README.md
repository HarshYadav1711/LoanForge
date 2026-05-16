# LoanForge

Internal lending platform monorepo: borrower portal, business rule engine (BRE), and operations dashboard.

> **Status:** Scaffold only — business features are not implemented yet.

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Web      | Next.js 15 (App Router), TypeScript, Tailwind   |
| API      | Node.js, Express, TypeScript, Mongoose          |
| Database | MongoDB (local)                                 |
| Shared   | `@loanforge/shared` — cross-app types & constants |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally

## Project structure

```
loanforge/
├── apps/
│   ├── web/                 # Next.js — borrower portal + ops dashboard UI
│   └── server/              # Express API — auth, BRE, loans, dashboard
├── packages/
│   └── shared/              # Shared TypeScript types and constants
├── package.json             # Workspace root scripts
└── README.md
```

### `apps/web`

```
src/
├── app/
│   ├── (auth)/              # login, register
│   ├── (borrower)/borrower/   # borrower portal
│   └── (dashboard)/dashboard/ # operations dashboard
├── components/
├── hooks/
├── lib/
└── types/
```

### `apps/server`

```
src/
├── config/                  # env, database
├── controllers/             # route handlers (per domain)
├── middleware/              # auth, RBAC, errors
├── models/                  # Mongoose schemas
├── routes/                  # Express routers
├── seeds/                   # database seed scripts
├── services/                # business logic
├── types/                   # Express augmentations
└── utils/
```

## Setup

```bash
# Install dependencies (from repo root)
npm install

# Environment files
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local

# Build shared package (required before server start in production)
npm run build:shared
```

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start API + web in parallel          |
| `npm run dev:server` | API only (`http://localhost:4000`) |
| `npm run dev:web`  | Web only (`http://localhost:3000`)   |
| `npm run build`    | Build shared, server, and web        |
| `npm run start`    | Run production builds (both apps)    |
| `npm run lint`     | Type-check / lint all workspaces     |
| `npm run seed`     | Run database seed script             |

## Local services

Everything runs locally — no paid cloud dependencies required.

| Service  | Default URL                              |
| -------- | ---------------------------------------- |
| MongoDB  | `mongodb://127.0.0.1:27017/loanforge`    |
| API      | `http://localhost:4000`                  |
| Web      | `http://localhost:3000`                  |

Health check: `GET http://localhost:4000/api/health`

## Environment variables

See `apps/server/.env.example` and `apps/web/.env.example`.

## Next steps

- [ ] Auth (JWT + bcrypt) and user model
- [ ] Borrower profile, BRE, and loan application flows
- [ ] Operations dashboard modules (sales → collection)
- [ ] Seed script with demo accounts per role
