# Notable Refactor Roadmap

## Purpose

This document is the staged refactor plan for Notable. The goal is not to rewrite the app, but to move the frontend and backend toward a clearer, more maintainable structure while keeping the demoable product working after every phase.

The refactor must be incremental. Every phase should be small enough to review, test, and stop safely.

## Current Shape

### Frontend

- React/Vite app with route pages owned under `Frontend/src/features/*/pages`.
- `Frontend/src/app/routes.jsx` is the route source of truth.
- Shared UI primitives live under `Frontend/src/shared/components/ui`.
- API/session transport lives in `Frontend/src/shared/api`; feature endpoint wrappers live in `Frontend/src/features/*/*.api.js`.
- App providers live in `Frontend/src/app/providers`.
- Cross-cutting utilities live in `Frontend/src/utils`.
- Styling is layered: `Frontend/src/index.css` imports global style layers, feature CSS files, and the final grayscale theme override.

### Backend

- Express app entrypoint is `Backend/index.js`.
- `Backend/src/routes/api.js` composes domain route modules from `Backend/src/routes/modules`.
- Controllers live in `Backend/src/controllers`.
- Business logic lives in `Backend/src/services`.
- Runtime data access lives in `Backend/src/repositories`.
- SQLite setup and schema patching live in `Backend/src/db`.
- Validation, auth middleware, uploads, and rate limiting live under `Backend/src/utils`.

## Refactor Principles

- No big-bang rewrite.
- Keep route paths and API contracts stable unless a phase explicitly says otherwise.
- Keep UI behavior stable while moving files.
- Prefer moving and extracting before redesigning logic.
- Each phase must pass:
  - `npm run lint` in `Frontend`
  - `npm run build` in `Frontend`
  - `npm run seed` in `Backend` when backend/data behavior changes
- Do not combine broad formatting, visual redesign, and architecture refactor in one phase.

## Target Architecture

### Frontend Target

Use a feature-first structure:

```txt
Frontend/src/
  app/
    App.jsx
    routes.jsx
    providers/
  shared/
    api/
    components/
    hooks/
    utils/
    styles/
  features/
    auth/
    dashboard/
    workspace/
    notebook/
    chapter/
    focus/
    settings/
```

Rules:

- `shared` cannot import from `features`.
- `features/*` may import from `shared`.
- Page-level route components should live inside their feature when the feature owns the route.
- Shared components should be generic, not domain-specific.
- Feature components should keep domain-specific copy, data mapping, and layout.
- CSS should move from one large `index.css` into layered files:
  - tokens/base
  - shared components
  - feature styles

### Backend Target

Move toward route modules plus service/repository boundaries:

```txt
Backend/src/
  app.js
  server.js
  config/
  db/
  middleware/
  modules/
    auth/
      auth.routes.js
      auth.controller.js
      auth.service.js
      auth.repository.js
      auth.validation.js
    todos/
    workspace/
    notebooks/
    chapters/
    focus/
    settings/
    resources/
  shared/
    errors/
    http/
    validation/
    dates/
```

Rules:

- Routes only declare routes and middleware.
- Controllers translate HTTP request/response.
- Services own business rules.
- Repositories own database queries.
- Validation stays close to each module.
- Shared utilities must not know about app-specific modules.

## Phase Plan

### Phase 0: Safety Baseline

Goal: make refactoring safer before moving many files.

Frontend:

- Add a small manual smoke checklist in docs for the main demo flows.
- Document current route map and feature ownership.
- Keep `index.css` untouched except for comments/section markers.
- Artifact: [`frontend-route-map.md`](frontend-route-map.md).
- Artifact: [`frontend-smoke-checklist.md`](frontend-smoke-checklist.md).

Backend:

- Document current API route map.
- Add a lightweight backend smoke checklist for seed, login, todos, notebook, focus, and resources.
- Identify endpoints that are part of the demo contract and must not change.
- Artifact: [`backend-api-map.md`](backend-api-map.md).
- Artifact: [`backend-smoke-checklist.md`](backend-smoke-checklist.md).

Exit criteria:

- New docs exist.
- No runtime behavior changes.

Phase 0 complete when:

- Frontend route map matches the current route source of truth (`Frontend/src/app/routes.jsx` after Phase 1).
- Backend API map matches `Backend/src/routes/api.js`.
- Frontend smoke checklist covers auth, dashboard, folder, notebook, chapter, focus, reminders, and settings.
- Backend smoke checklist covers seed, auth, workspace, notebooks/chapters, todos, notes, resources, focus, and settings.
- Demo-contract frontend routes and backend endpoints are explicitly listed.

### Phase 1: Frontend Shared Foundation

Goal: clarify shared UI/API/provider boundaries without changing screens.

Frontend:

- Create `src/shared` and move generic UI components there:
  - modal
  - feedback banner
  - search input
  - icons
  - protected topbar
  - action popover
- Move API/auth helpers into `src/shared/api` and `src/app/providers`, with compatibility exports removed during Phase 8 cleanup.
- Keep backward-compatible re-export files if needed to avoid one huge import update.
- Add `src/app/routes.jsx` to separate route declarations from `App.jsx`.

Backend:

- No structural backend changes in this phase.

Exit criteria:

- Frontend imports are cleaner.
- All existing routes/screens behave the same.
- Lint/build pass.

Phase 1 compatibility policy:

- Canonical shared UI location is `Frontend/src/shared/components/ui`.
- Canonical API/session transport location is `Frontend/src/shared/api`.
- Canonical auth provider location is `Frontend/src/app/providers`.
- Old `components/ui` and `lib` re-export shims are removed during Phase 8 cleanup.
- `Frontend/src/App.jsx` should compose providers and render `AppRoutes`; route declarations live in `Frontend/src/app/routes.jsx`.

### Phase 2: Frontend Feature Ownership

Goal: move page components into owning features.

Frontend:

- Move:
  - auth pages into `features/auth`
  - dashboard page into `features/dashboard`
  - folder detail into `features/workspace`
  - notebook page into `features/notebook`
  - chapter detail/edit into `features/chapter`
  - settings page into `features/settings`
- Keep feature hooks/components colocated.
- Remove old page wrappers only after routes point to feature pages.

Backend:

- No behavior changes.

Exit criteria:

- `src/pages` is empty or contains only temporary compatibility wrappers.
- Feature folders clearly own their route, hook, components, and local helpers.

Phase 2 completion policy:

- Route declarations stay in `Frontend/src/app/routes.jsx`, importing route pages from `features/*/pages`.
- `Frontend/src/pages` should not own runtime routes after this phase.
- Domain workspace cards live in `features/workspace/components`; shared UI primitives remain in `shared/components/ui`.
- Phase 1 compatibility shims for `components/ui` and `lib` are removed during Phase 8 cleanup.

### Phase 3: CSS Layering

Goal: reduce `index.css` size and make styles discoverable.

Frontend:

- Split CSS into layered imports:
  - `styles/tokens.css`
  - `styles/base.css`
  - `styles/layout.css`
  - `styles/components.css`
  - feature styles such as `features/dashboard/dashboard.css`
- Preserve class names first; do not rename aggressively in the same phase.
- Remove duplicate or dead styles only after verifying usage with search.

Backend:

- No backend changes.

Exit criteria:

- `index.css` becomes an import hub.
- Styles are grouped by ownership.
- Visual output should remain the same.

Phase 3 completion policy:

- `Frontend/src/index.css` only imports layered CSS files.
- Global style ownership lives in `Frontend/src/styles`: tokens, base, layout, shared components, and final theme overrides.
- Feature style ownership lives beside features: `features/auth/auth.css`, `features/dashboard/dashboard.css`, `features/workspace/workspace.css`, `features/notebook/notebook.css`, `features/chapter/chapter.css`, `features/settings/settings.css`, and `features/focus/focus.css`.
- The grayscale theme override remains imported last through `Frontend/src/styles/theme.css`.
- Dead CSS removal is intentionally deferred until a dedicated cleanup pass.

### Phase 4: Backend Route Modularization

Goal: split the single API route file into module routes.

Backend:

- Create module route files:
  - `auth.routes.js`
  - `todos.routes.js`
  - `notes.routes.js`
  - `notebooks.routes.js`
  - `workspace.routes.js`
  - `chapters.routes.js`
  - `focus.routes.js`
  - `resources.routes.js`
  - `settings.routes.js`
  - `calendar.routes.js`
- Keep existing controller/model implementations.
- Compose the module routes from one central API router.
- Keep endpoint paths exactly the same.

Frontend:

- No frontend API changes.

Exit criteria:

- `Backend/src/routes/api.js` becomes a route composer.
- No endpoint path changes.
- Seed and existing flows still work.

Phase 4 completion policy:

- Route modules live in `Backend/src/routes/modules`.
- `Backend/src/routes/api.js` only composes module routers and remains the single router mounted by `Backend/index.js`.
- Notes and Google Calendar have dedicated route modules because they are active current endpoints.
- Controller, model, middleware, validation, and upload behavior stay unchanged until later backend service/repository phases.

### Phase 5: Backend Services Extraction

Goal: move business logic out of controllers.

Backend:

- Extract services incrementally:
  - `focus.service.js` for recommendation block, summary, timing/session composition.
  - `todo.service.js` for assignment, reminders, BHPS ranking response.
  - `workspace.service.js` for folder/notebook aggregation counts.
  - `user.service.js` for profile/password changes.
- Controllers should become thin request/response adapters.
- Keep repository/model queries stable until each service is covered by smoke tests.

Frontend:

- No UI changes.

Exit criteria:

- Focus and todo controllers are noticeably smaller.
- Domain helpers are unit-testable by direct import later.

Phase 5 completion policy:

- Business logic extracted in this phase lives in `Backend/src/services`.
- Controllers remain route-compatible request/response adapters with unchanged method names.
- Current models are still used directly by services until Phase 6 introduces repository/database boundaries.
- `bhpsLogic.js` remains in its current location for compatibility and can move during a later cleanup.

### Phase 6: Backend Repository and Database Boundary

Goal: make database access consistent and easier to evolve.

Backend:

- Rename or wrap current models as repositories.
- Group SQL by module.
- Move schema setup and `ensureColumn` helpers into `src/db`.
- Add a clear migration/seed policy:
  - schema bootstrap for local demo
  - seed data for demo account
  - uploads generated by seed documented or ignored safely

Frontend:

- No frontend changes.

Exit criteria:

- Database concerns are not scattered through controllers/services.
- Demo seed remains reliable.

Phase 6 completion policy:

- SQLite connection and schema bootstrap live in `Backend/src/db`.
- `Backend/src/db` is the runtime database boundary; `Backend/database/db.js` is removed during Phase 8 cleanup.
- Runtime data access lives in `Backend/src/repositories`; old `Backend/src/models/*Model.js` shim files are removed during Phase 8 cleanup.
- `Backend/seed.js` may keep direct SQL because it owns deterministic demo fixture setup, including generated `demo-notable-*` upload files.
- Repository shims should be removed only during a later cleanup phase after imports are verified.

### Phase 7: API Client and Data Hooks

Goal: make frontend data access consistent.

Frontend:

- Create feature API modules:
  - `auth.api.js`
  - `workspace.api.js`
  - `notebook.api.js`
  - `focus.api.js`
  - `settings.api.js`
- Hooks call feature API modules instead of raw string paths everywhere.
- Keep `apiRequest` as shared transport only.

Backend:

- No endpoint changes.

Exit criteria:

- Raw endpoint strings are mostly isolated to API modules.
- Feature hooks become easier to read.

Phase 7 completion policy:

- Feature pages/hooks/context call feature API modules instead of `apiRequest` directly.
- `Frontend/src/shared/api/api.js` remains the transport/session boundary only.
- Raw endpoint strings should primarily live in `*.api.js` files.
- Phase 1 compatibility shims are removed during Phase 8 cleanup.

### Phase 8: Cleanup and Guardrails

Goal: remove compatibility leftovers and enforce structure.

Frontend:

- Remove old re-export files after imports are migrated.
- Add lightweight smoke script composition so lint/build are easy to run together.
- Do not remove repository-like frontend helpers or feature modules unless usage is proven dead.

Backend:

- Remove model/database compatibility shims after imports are verified.
- Add lightweight smoke script that requires `src/db`, repositories, and route modules, then prints the route method/path list.
- Defer unused repository method cleanup until each method is proven dead.
- Defer error response normalization because it can change the frontend API contract.

Exit criteria:

- Project structure matches the target architecture closely enough.
- Compatibility shims are removed.
- `npm run smoke` exists in both `Backend` and `Frontend`.
- Remaining cleanup risks are documented rather than bundled into this batch.

Phase 8 completion policy:

- `Frontend/src/components/ui` and `Frontend/src/lib` compatibility files are removed; runtime imports use `shared/components/ui`, `shared/api`, and `app/providers`.
- `Backend/src/models/*Model.js` and `Backend/database/db.js` compatibility files are removed; runtime imports use `Backend/src/repositories` and `Backend/src/db`.
- `Backend/database/notable.db` remains the local SQLite demo database.
- Backend smoke guardrail lives at `Backend/scripts/smoke.js` and is exposed through `npm run smoke`.
- Frontend smoke guardrail runs lint/build through `npm run smoke`.
- Backend error response normalization and deeper dead repository method pruning are deferred to separate batches because they can affect API behavior or future feature work.

## Suggested Batch Order

1. Phase 0 documentation.
2. Phase 1 frontend shared foundation.
3. Phase 4 backend route modularization.
4. Phase 2 frontend feature ownership.
5. Phase 5 backend services extraction.
6. Phase 3 CSS layering.
7. Phase 7 API client/data hooks.
8. Phase 6 repository/database boundary.
9. Phase 8 cleanup and guardrails.

This order keeps risk low: first improve visibility, then split obvious boundaries, then extract behavior.

## Non-Goals for This Refactor

- No visual redesign.
- No database engine migration.
- No OAuth rewrite.
- No deployment/CI overhaul unless added as a separate plan.
- No TypeScript migration in the first pass.
- No test framework introduction until the structure is stable enough to test meaningfully.

## Definition of Done Per Phase

Every phase should end with:

- A short change summary.
- Known risks or deferred work.
- `Frontend` lint/build results.
- `Backend` seed result when backend behavior or DB wiring changed.
- No intentional breaking change to demo flows.
