# BidPilot MVP

Next.js 14 + Prisma + NextAuth application for bid normalization and risk scoring.

## Setup
1. Copy `.env.example` to `.env` and update values.
2. Start Postgres via docker-compose: `docker-compose up -d`.
3. Install deps: `pnpm install`.
4. Run migrations/seed: `pnpm db:setup`.
5. Start dev server: `pnpm dev`.
6. Login with demo user `demo@gc.com` / `password`.

## Tests
- Unit tests: `pnpm vitest`
- E2E: `pnpm test:e2e` (requires `pnpm dev` running).

## Notes
- File uploads stored in `uploads/` locally.
- LLM parsing uses `OPENAI_API_KEY` and may incur costs.
