# Civix GC — Preconstruction Bid Leveling Demo

This repository provides an offline-friendly demo of Civix GC's preconstruction workflow. It ships a
self-contained Node.js server that serves a rich single-page experience for bid uploads, leveling,
RFQ tracking, RFIs, and export snapshots without requiring any third-party npm dependencies.

The goal is to make the product brief tangible even in restricted environments where installing
packages from the public npm registry is blocked.

## What's Included

- **Projects overview** with bid due dates, invited scopes, and invitation progress.
- **Trade scope workspace** featuring bids, leveled comparison matrix, RFQ tracker, RFIs, and CSV export.
- **Interactive actions** for uploading bids (metadata only), marking parse completion, updating invite
  statuses, logging RFIs, queuing nudges, and downloading leveling snapshots.
- **Persistent sample data** stored in `data/sample-data.json` that is updated as you interact with the UI.

## Running the Demo

All scripts rely only on Node's standard library. No additional packages are required.

```bash
npm install    # installs nothing but ensures a package-lock.json for reproducibility
npm run dev    # starts the local server on http://localhost:3000
```

Use `npm run lint` to verify the sample dataset structure:

```bash
npm run lint
```

The command simply parses `data/sample-data.json` and reports success or structural issues.

## Project Layout

```
public/             # Static assets and the browser application (index.html, styles, app logic)
data/sample-data.json
                    # Seed + persisted demo data (projects, trade scopes, bids, RFQs, RFIs, events)
server.mjs          # Minimal Node HTTP server exposing JSON APIs and serving the SPA
scripts/check.mjs   # Validates the sample data file (used by npm run lint)
```

## API Surface

The demo server exposes lightweight JSON endpoints that mutate the sample data on disk:

- `GET /api/state` – returns projects, trade scopes, bids, invitations, RFIs, and event history.
- `POST /api/trade-scopes/:id/bids` – register a new bid upload for a subcontractor.
- `POST /api/bids/:id/parse` – mark a bid as parsed and auto-generate placeholder line items.
- `POST /api/trade-scopes/:id/invitations/:invitationId/status` – update invite status + last touch.
- `POST /api/trade-scopes/:id/rfis` – log a new clarification and target subcontractors.
- `POST /api/rfis/:id/respond` – append a subcontractor response.
- `POST /api/trade-scopes/:id/nudge` – record that reminder emails were queued.

Each mutation writes back to `data/sample-data.json` so refreshing the browser retains changes.

## Extending the Demo

- Wire up actual file handling by saving uploads to disk and storing metadata alongside the bid record.
- Expand the leveling matrix to support manual overrides and normalization rules.
- Implement authentication and multi-org scoping by storing user sessions and filtering state per org.
- Add CSV/XLSX export endpoints that stream files from the server instead of client-side generation.
- Integrate a parsing worker (Python/Node) that produces the parsed line items for real bid documents.

The current approach optimizes for environments with strict network policies while keeping the
product vision interactive and demonstrable.
