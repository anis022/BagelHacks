# Swoin (BagelCoin demo)

This repository contains a Next.js application that implements a simple, opinionated demo of a cross-border payments dashboard (internally called "Swoin"). It includes a server-rendered React UI, lightweight session handling, and a Postgres-backed data layer for users, balances, transactions and payment methods.

This README documents the codebase layout, how to run the project locally, important environment variables, and quick notes about the database schema and developer tooling.

If you only need the app README (swoin/README.md) see that file — the root README here is focused on the whole repository and developer onboarding.

Summary

Project: Swoin — demo cross-border payments UI + server logic

Stack:

- Next.js (app router)
- React 19
- TypeScript
- Postgres (pg)
- Tailwind CSS

Where to start

1. Install dependencies in the swoin folder:

   ```bash
   cd swoin
   npm install
   ```

2. Set required environment variables (see below).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

Project layout (important files)

- swoin/package.json — scripts and dependencies (Next.js v16.x in this tree).
- swoin/app — Next.js app folder (routes and UI components). Key pages:
  - app/page.tsx — marketing / landing page
  - app/layout.tsx — root layout wrapping children with the Toast provider
  - app/dashboard, app/activity, app/settings, app/cards, app/deposit, app/cashout — primary app pages
  - app/components — UI primitives and shell (Sidebar, TopBar, PlaidLink, AppShell, ToastProvider, BottomNav)
- swoin/lib
  - db.ts — Postgres pool and all database helpers (users, balances, transactions, payment methods, withdrawals, deposits, transfers).
  - auth.ts — password hashing and credential validation helpers (bcryptjs).
  - session.ts — compact HMAC-signed session token implementation stored in a cookie.
- swoin/proxy.ts — middleware-style request proxy that redirects to /login when a session token is missing for protected routes.
- swoin/scripts/test-update-balance.ts — helper script that exercises DB createUser / updateBalance flows (ts-node script).

Database notes

The app expects a Postgres database and uses SQL queries in lib/db.ts. The code references these logical tables (create these in a test DB for local development):

- login (id, email, password)
- balance (id, balance)
- transactions (id, sender_id, receiver_id, amount, created_at)
- payment_methods (id, user_id, type, label, details, created_at)
- withdrawals (id, user_id, method_id, method_label, amount, created_at)
- deposits (id, user_id, method_label, amount, crossmint_payment_id, created_at)

The DB helper functions use transactions and SELECT ... FOR UPDATE when mutating balances to avoid races. Review lib/db.ts to see the exact SQL used.

Required environment variables

Set these in your environment (for local development a .env.local in the swoin folder works):

- PGHOST — Postgres host
- PGPORT — Postgres port (default 5432)
- PGUSER — Postgres user
- PGPASSWORD — Postgres password
- PGDATABASE — Postgres database name
- SESSION_SECRET — secret for HMAC-signed session tokens (default exists in code but do NOT use in production)

Optional / integration-related variables

- Plaid integration is expected by PlaidLink and API routes (look for /api/plaid/\*). Supply your Plaid credentials in environment variables used by those routes if you plan to test linking banks.

Development tips

- Run the test script that creates a user and updates the balance (make sure you use a test database):

  ```bash
  cd swoin
  npx ts-node scripts/test-update-balance.ts
  ```

- If you change session implementation or cookie options, update lib/session.ts and the proxy rules in proxy.ts.

- The frontend components call several API routes under app/api (e.g. /api/transactions, /api/plaid/_, /api/auth/_). Look at corresponding files in the app/api folder if you need to modify server behavior.

Security notes

- The session token is a signed payload stored in a cookie. SESSION_SECRET must be a safe random string in production. The repository defaults are explicitly dangerous for production — replace them.

- Password hashing uses bcryptjs with 12 rounds (see lib/auth.ts). Passwords must be kept secure in transit (use HTTPS in production).

- This project performs real database writes in scripts like scripts/test-update-balance.ts. Run those only on non-production/test databases.

Common commands

- Install: `npm install` (run inside swoin/)
- Dev server: `npm run dev`
- Build: `npm run build`
- Start (production): `npm run start`
- Lint: `npm run lint`

How to contribute

- Create branches for changes, run the dev server locally and verify UI and API behavior.
- If you add or change DB tables, include migrations or SQL schema files in a new directory (there are no migrations in this repo by default).

Further reading

- Browse lib/db.ts for the canonical list of queries and available DB helpers.
- Read lib/session.ts to understand token format and cookie defaults.

If you'd like, I can:

1. Create a local SQL schema file with CREATE TABLE statements inferred from lib/db.ts.
2. Add a .env.example file listing the env vars.
3. Update the app/api README or add a developer checklist for setting up Plaid and Postgres.

Tell me which of the above you'd like next.
