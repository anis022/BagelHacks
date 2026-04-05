# Swoin — Borderless Payments (Problem → Technical Solution)

Short summary

Swoin is a prototype custodial cross-border payments platform that moves USD-equivalent value (USDM) between users and traditional banks. This README focuses on the problem we solve, the technical design choices made to solve it, and the concrete implementation details that matter for correctness, auditability, and operations.

The problem

Cross-border and interbank value movement suffers from three main issues:

- Latency & uncertainty: settlement across rails (ACH, SWIFT) can take days and fees are unpredictable.
- Reconciliation complexity: fragmented rails and asynchronous callbacks make accounting and audits difficult.
- Race conditions and correctness: concurrent operations must not produce inconsistent balances or allow double-spend.

Requirements we targeted

- Deterministic accounting (audit trail for every movement).
- Atomic user-level transfers with strong consistency.
- Predictable operational flows for deposits/withdrawals (idempotent handling of provider retries).
- Low onboarding friction (simple bank linking in dev via Plaid placeholder).
- Reasonable performance for MVP (Postgres-level throughput) with clear paths for scaling.

Technical solution (high level)

We implemented a custodial global-wallet model with PostgreSQL as the single source of truth. Every change to money is represented by a persistent transaction row and an accompanying balance mutation performed inside a single ACID database transaction.

Why this approach

- Simplicity & auditability: a single authoritative ledger (transactions table + user balances) makes reconciliation straightforward.
- Correctness: row-level locking (SELECT ... FOR UPDATE) and Postgres transactions prevent concurrent double-spend.
- Operational visibility: an explicit `global_wallet` row captures platform-level custody for reconciliation against external settlement reports.

Core design details

- Ledger model: users have numeric balance columns and there is a transactions table storing immutable records for deposits, withdrawals, transfers, fees, and settlement events.
- Atomic updates: business flows (transfer, deposit, cashout) execute inside a Postgres transaction. The pattern is:
  1) INSERT a transaction record (idempotency key when relevant)
  2) SELECT the involved balance rows FOR UPDATE
  3) Validate balances and business rules
  4) UPDATE balance rows
  5) COMMIT

- Idempotency: external callbacks (webhooks) and multi-step flows use idempotency keys stored alongside transaction rows so retries do not create duplicate effects.
- Global wallet: a single `global_wallet` row represents the platform pool of USDM. Deposits increment it; cashouts decrement it. This makes platform liquidity explicit and easy to reconcile.

API surface (implementation-level)

- POST /api/auth/signup        — create user and seed starting balance
- POST /api/auth/signin        — authenticate and create session
- GET  /api/auth/session       — return current session user
- POST /api/transfer           — P2P transfer (performs atomic ledger update)
- POST /api/deposit            — record deposit and credit user (idempotent)
- POST /api/cashout            — record withdrawal and debit user (idempotent)
- GET  /api/transactions       — fetch transaction history
- POST /api/plaid/exchange-token — exchange Plaid public token for access (dev placeholder)

Concrete guarantees and failure modes

- Correctness: if the database transaction commits, ledger rows and balances are consistent. If it aborts, no partial state is left.
- Idempotency: repeated webhook deliveries or client retries with the same idempotency key are safe and ignored after the first successful application.
- Partial external failures: external settlement (bank push/pull) is modeled separately from the ledger; reconciliation is required to match on-chain ledger state with external settlement reports.

Operational & scaling notes

- Postgres is sufficient for MVP throughput and provides the strong consistency we need. For higher scale consider:
  - Logical sharding (by customer cohort or geography)
  - Sequenced batching service or append-only ledger service for very high write rates
  - Read replicas and caching for read-heavy endpoints
- Monitoring: alert on negative balances, gaps between `global_wallet` and sum(user balances), and idempotency/in-flight failures.
- Backups & audit: enable point-in-time recovery and immutable backups of transaction history for compliance.

Security & compliance

- Passwords: bcrypt hashing (configurable cost factor).
- Sessions: HMAC-signed tokens in Secure, HttpOnly cookies — rotate secrets in production and consider HSM for signing.
- KYC/AML: hooks exist where a production deployment MUST integrate a KYC provider and transaction monitoring before enabling fiat rails.

Developer quick start

Prerequisites:

- Node.js 18+
- PostgreSQL 14+

Quick start:

1. Change into the app directory: `cd swoin`
2. Install dependencies: `npm install`
3. Create `.env.local` with required variables (see below)
4. Start dev server: `npm run dev`

Minimum environment variables:

- PGHOST, PGPORT, PGUSER, PGDATABASE, PGPASSWORD
- SESSION_SECRET
- NODE_ENV

Testing and verification

- Tests should exercise concurrent transfer scenarios to validate SELECT ... FOR UPDATE locking and atomic updates.
- Run integration flows covering deposits -> ledger credit -> external settlement reconciliation.

Next steps (product & engineering)

1. Integrate a production-grade KYC/AML provider and enable transaction monitoring.
2. Harden production deployment: secrets management, rotated keys, stricter cookie policies, HSM-backed signing.
3. Implement end-to-end reconciliation between `global_wallet` and external settlement reports.

Project layout (short)

- `app/`     — Next.js frontend and API route handlers
- `lib/`     — DB connection and utilities (auth, session)
- `proxy.ts` — middleware for route-level auth

Scripts (from inside `swoin/`):

```
npm run dev    # Start development server (hot reload)
npm run build  # Compile for production
npm start      # Run the production build
npm run lint   # Run ESLint
```

Contact and license

This repository is an implementation prototype created for BagelHacks. For commercial use consult legal and compliance experts.
