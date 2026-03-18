# Workspace

## Overview

LIMS (Laboratory Information Management System) — a full-stack web application for managing lab samples, tests, inventory, workflows, storage, reporting, and compliance audit trails.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS v4, React Query, Recharts, Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all LIMS API routes)
│   └── lims/               # React + Vite LIMS frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## LIMS Modules

### Frontend Pages (`artifacts/lims/src/pages/`)
- **Dashboard** — Stats overview, activity chart, recent audit logs, latest samples
- **Samples** — Register, list, filter, and update lab samples with barcodes
- **Tests** — Manage lab tests linked to samples, record results
- **Inventory** — Track chemicals/kits/tools, low-stock alerts
- **Workflows** — State machine workflow tracker (received → logged → testing → review → approved → completed)
- **Storage** — Hierarchical storage management (freezer → rack → box → slot)
- **Reports** — Generate and view reports (test results, audit, inventory, workflow)
- **Audit Logs** — Compliance audit trail of all actions
- **Users** — Manage lab users with roles (admin, technician, reviewer, customer)

### Database Schema (`lib/db/src/schema/`)
- `users.ts` — Users table (id, name, email, role)
- `samples.ts` — Samples table (id, barcode, type, status, priority, locationId, createdById)
- `tests.ts` — Tests table (id, sampleId, testName, result, status, performedById)
- `inventory.ts` — Inventory table (id, name, category, quantity, unit, threshold, expiryDate, supplier, location)
- `workflows.ts` — Workflows table (id, sampleId, workflowName, currentStage, status, assignedToId)
- `storage.ts` — Storage locations table (id, name, type, parentId, temperature, capacity)
- `reports.ts` — Reports table (id, sampleId, reportType, title, content, generatedById)
- `audit-logs.ts` — Audit logs table (id, userId, action, entityType, entityId, oldValue, newValue)

### API Routes (`artifacts/api-server/src/routes/`)
- `health.ts` — Health check
- `users.ts` — GET/POST /users, GET /users/:id
- `samples.ts` — GET/POST /samples, GET/PATCH /samples/:id (auto-generates barcodes like SAMPLE-00001)
- `tests.ts` — GET/POST /tests, GET/PATCH /tests/:id
- `inventory.ts` — GET/POST /inventory, GET/PATCH /inventory/:id
- `workflows.ts` — GET/POST /workflows, GET/PATCH /workflows/:id
- `storage.ts` — GET/POST /storage, GET /storage/:id
- `reports.ts` — GET/POST /reports, GET /reports/:id
- `audit-logs.ts` — GET /audit-logs (with userId, action, limit filters)
- `dashboard.ts` — GET /dashboard/stats

### Shared Lib (`artifacts/api-server/src/lib/`)
- `audit.ts` — logAudit() helper (called on all CUD operations), generateBarcode() for samples

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`

## Deployment

- Frontend (artifacts/lims) serves at `/` (static Vite build)
- Backend (artifacts/api-server) serves at `/api`
