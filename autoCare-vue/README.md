# AutoFlow Pro — Vue 3 Edition

Converted from the original React/TypeScript app to **Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Tailwind**.

## Run it

```bash
npm install
npm run dev       # dev server
npm run build     # production build (type-checked)
```

## What changed vs. the React version

**Framework**
- React → Vue 3 `<script setup>` components
- React Router → Vue Router (same URL structure, so all 27 routes match 1:1)
- React Context (`AuthContext`) → a Pinia `auth` store
- `dataStore.ts` (one big hand-rolled file) → Pinia stores

**"Backend" simplified**
The original `dataStore.ts` had ~500 lines: 7 near-identical interfaces
(Job, DriverTask, PartRequest, InventoryItem, SystemUser, ActivityLog,
RepairReport), each with its own hand-written add/update/remove logic and
verbose mock data.

This version:
- Trims each interface down to only the fields the UI actually uses
  (`src/types.ts`).
- Replaces the 6 duplicated CRUD implementations with **one generic
  factory**, `defineCollectionStore<T>()` (`src/stores/collection.ts`).
  Every entity store (`src/stores/data.ts`) is now a single line.
- Drops the separate `ActivityLog` collection entirely — the admin Logs
  page now derives a feed on the fly from jobs/tasks/part requests, so
  there's one less thing to keep in sync.
- All state still persists to `localStorage` (this remains a frontend-only
  demo, same as the original — no real server).

**UI components**
- The original used a large ported shadcn/Radix component library (~50
  files). This version uses a handful of small, plain Tailwind components
  (`src/components/ui/`) that cover what the app needs — same visual
  language, far less code to maintain.

## Structure

```
src/
  types.ts               # domain types
  stores/
    collection.ts         # generic CRUD store factory
    seed.ts                # mock/demo data
    data.ts                # jobs, tasks, partRequests, inventory, users, reports
    auth.ts                # auth store (role, login, register)
  navigation.ts           # per-role sidebar nav config
  router/index.ts         # all routes
  components/             # NavLink, DashboardLayout, ui/*
  views/                  # Landing, auth pages, chatbot, and 5 role dashboards
    customer/ manager/ technician/ driver/ admin/
```

## Roles

Same 5 roles as before, same routes: `customer`, `manager`, `technician`,
`driver`, `admin` — pick one at `/select-role`, then log in with any
email/password (this is a demo auth, no real backend).
