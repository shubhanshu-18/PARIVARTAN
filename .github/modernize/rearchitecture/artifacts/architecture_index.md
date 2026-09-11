# Implementation Guide

This index is a navigation guide, not the full contract. Implementation agents must read the
listed unit artifacts and filter global artifacts by the referenced unit before changing code.

## Project
- Structure: `project-structure.md`
- Stack and blockers: `tech-stack.md`
- Data entities: `data-model.md`
- Entry points and signatures: `unit_graph.yaml`
- Runtime boundary: `migration_boundary.yaml`
- External contracts: `wire_contracts.yaml`
- Shared code: `shared_modules.yaml`
- Cross-unit state: `cross_unit_state.yaml`

## Units
Each unit has `behavior.yaml`, `bindings.yaml`, and `unit_decomposition.yaml`.
Completion evidence must include preserved response/error behavior and a build validation.

| Unit | Read first | Global filtering |
|---|---|---|
| app-ui | `units/app-ui/*` | `unit_graph` entry `app.jsx` |
| health | `units/health/*` | `wire_contracts` `/api/health` |
| businesses-list | `units/businesses-list/*` | `wire_contracts` `/api/businesses` |
| businesses-nearby | `units/businesses-nearby/*` | `wire_contracts` `/api/businesses/nearby` |
| market-intelligence | `units/market-intelligence/*` | `wire_contracts` `/api/market-intelligence` |
| location-geocode | `units/location-geocode/*` | `wire_contracts` `/api/location/geocode` |
| financial-calculate | `units/financial-calculate/*` | `wire_contracts` `/api/financials/calculate` |
| advisory | `units/advisory/*` | `wire_contracts` `/api/advisory` |
| schemes-match | `units/schemes-match/*` | `wire_contracts` `/api/schemes/match` |
| assessments | `units/assessments/*` | `wire_contracts` `/api/assessments` |
| admin-stats | `units/admin-stats/*` | `wire_contracts` `/api/admin/stats` |
| report-pdf | `units/report-pdf/*` | `wire_contracts` `/api/reports/pdf` |
