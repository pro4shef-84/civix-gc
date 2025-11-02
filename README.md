# Civix GC — Preconstruction Bid Leveling Platform

This repository contains the groundwork for Civix GC's preconstruction toolkit. The MVP delivers the core
bid-leveling workflow outlined in the product brief: upload subcontractor bids, parse and normalize line items,
map CSI codes, highlight gaps/overlaps, and manage outreach through an RFQ tracker and RFI log.

## Tech Stack

- **Next.js 14** with the App Router and TypeScript
- **Tailwind CSS** for rapid UI composition
- **Prisma** ORM connected to **PostgreSQL**
- **React Query**, **React Hook Form**, and **Zod** for future form workflows
- Placeholder hooks for S3 file storage, email nudges, and LLM-backed parsing workers

## Getting Started

> Dependencies are declared in `package.json`. Installing them requires access to the public npm registry.

```bash
npm install
cp .env.example .env
npm run dev
```

Run Prisma migrations once you have a Postgres database available:

```bash
npm run prisma:migrate
```

Seed data is returned automatically by server utilities when the database is empty so the UI remains functional while
infrastructure is bootstrapped.

## Project Structure

```
app/                # Next.js routes (App Router)
  page.tsx          # Projects overview
  trade-scopes/     # Trade scope workspace with tabs for bids, leveling, RFQ, RFIs, exports
components/         # UI components, domain-specific panels, and layout pieces
lib/server/         # Data access helpers (Prisma + demo fallbacks)
prisma/schema.prisma# Database schema reflecting the data model
```

Key features implemented:

- **Projects dashboard** – snapshot of active pursuits with progress metrics.
- **Trade scope workspace** – tabbed layout surfacing bid uploads, leveled matrix, RFQ tracker, RFIs, and exports.
- **Leveling matrix** – interactive grid with filters for gaps, overlaps, and low-confidence items.
- **RFQ tracker** – Kanban-style grouping of subcontractors with nudge action placeholders.
- **Export tools** – instant CSV/XLSX generation in-browser for sharing snapshots.

## Next Steps

- Wire up authentication (NextAuth) with organization-scoped access control.
- Implement file uploads to S3 and trigger the PDF parsing worker.
- Persist normalization, CSI auto-suggestions, and vendor override rules.
- Build email integrations (Postmark/Sendgrid) for nudges and RFI notifications.
- Replace demo fallbacks with live Prisma queries once migrations run.
