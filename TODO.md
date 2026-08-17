# Rebuild system to Intelligent Inventory / Operations (TODO)

## Step 1 — Route & UI flow replacement
- [x] Update `src/app/routes.tsx` to remove `/customer` and `/designer`
- [ ] Add new routes/pages for: Management Ops, Operational Staff, Public inquiry/portfolio

- [ ] Update any navigation labels in `Header.tsx` / landing components

## Step 2 — Replace appointment/designer state model
- [ ] Refactor `AdminPage.tsx` to remove appointments + designer recommendation logic
- [ ] Swap `appointments` usage for: inventory/material consumption/project/workforce/delivery/inquiry (localStorage placeholders if no backend)

## Step 3 — Inventory intelligence UI alignment
- [ ] Extend `InventoryDashboard.tsx` with material consumption entry + BOM trigger + restock recommendation placeholders

## Step 4 — Forecasting module UI
- [ ] Replace `MaterialRecommendations.tsx` with forecasting review UI (Prophet/ML placeholder)

## Step 5 — Operations monitoring & workforce deployment
- [ ] Rework `AnalyticsDashboard.tsx` into operations monitoring dashboard (project progress, workforce deployment, delivery)

## Step 6 — Analytics dashboard improvements
- [ ] Add KPIs/charts based on inventory levels, consumption velocity, forecast vs actual (once data exists)

## Step 7 — Docs/diagrams consistency
- [ ] Update `README.md` / docs mentioning appointments, designers, email notifications
- [ ] (Optional) Add new doc pages describing new ERD/entities

## Step 8 — Verification
- [ ] Run `npm run build` (or `pnpm` equivalent) + fix TS errors
- [ ] Smoke test key pages: login/signup + new routes


