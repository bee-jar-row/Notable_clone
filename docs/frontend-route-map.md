# Frontend Route Map

Source of truth: `Frontend/src/app/routes.jsx`.

## Providers

- `AuthProvider` lives in `Frontend/src/app/providers/AuthContext.jsx` and wraps the whole app.
- `BrowserRouter` owns client routing.
- `FocusSessionProvider` wraps all routes, so active focus sessions can follow the user across protected pages.
- `ProtectedRoute` guards authenticated app pages and redirects guests to `/`.

## Current Routes

| Path | Access | Component | Current owner | Notes |
| --- | --- | --- | --- | --- |
| `/` | Guest | `features/auth/pages/Login.jsx` | auth | Login and demo account entry. Redirects successful login to `/dashboard` or the originally requested protected route. |
| `/register` | Guest | `features/auth/pages/Register.jsx` | auth | Creates an account, then logs in and redirects to `/dashboard`. |
| `/reset-password` | Guest | `features/auth/pages/ResetPassword.jsx` | auth | Local/demo password reset request page. |
| `/new-password` | Guest | `features/auth/pages/NewPassword.jsx` | auth | Consumes reset token from query string. |
| `/dashboard` | Protected | `features/dashboard/pages/Dashboard.jsx` | dashboard | Main workspace, Your Day, Reminders, Timeline, Focus Session, create modals. |
| `/folder/:id` | Protected | `features/workspace/pages/FolderDetail.jsx` | workspace | Folder detail, notebooks in folder, folder timeline, add notebook to current folder. |
| `/notebook` | Protected redirect | `Navigate` | notebook | Redirects to `/dashboard`. |
| `/notebook/:id` | Protected | `features/notebook/pages/Notebook.jsx` | notebook | Notebook detail, timeline, notes, resources, chapters. Back target may be Dashboard or the originating Folder via location state. |
| `/notebook/:notebookId/chapter/:chapterId/edit` | Protected | `features/chapter/pages/EditChapter.jsx` | chapter | Chapter read/edit page with linked resources. |
| `/settings` | Protected | `features/settings/pages/Settings.jsx` | settings | Account profile, Google Calendar embed URL, password update. |

## Feature Ownership

After Phase 2, route pages live with their feature owner:

- `features/auth`: Auth pages and auth navbar.
- `features/dashboard`: Dashboard route, widgets, modals, workspace grid, timeline, reminders, focus recommendation panel.
- `features/focus`: Global focus session provider, countdown widget, overlay.
- `features/workspace`: Folder detail page plus folder/notebook workspace cards.
- `features/notebook`: Notebook route, hook, and notebook-owned panels/modals.
- `features/chapter`: Chapter detail/edit route.
- `features/settings`: Settings route.
- `features/search`: Global command-search UI and search API module.
- `shared/components/ui`: Canonical shared UI primitive location.
- `shared/api`: Canonical API/session transport location.
- `features/*/*.api.js`: Feature-owned endpoint wrappers with intent-named functions.
- `app/providers`: Canonical app provider location.
- `utils`: Shared formatting/domain helpers.

## Raw API Usage Hotspots

After Phase 7, raw endpoint strings should stay in feature API modules:

- `Frontend/src/features/auth/auth.api.js`
- `Frontend/src/features/settings/settings.api.js`
- `Frontend/src/features/workspace/workspace.api.js`
- `Frontend/src/features/notebook/notebook.api.js`
- `Frontend/src/features/focus/focus.api.js`
- `Frontend/src/features/search/search.api.js`
- `Frontend/src/shared/api/api.js` remains transport/session only.
- Legacy compatibility imports from `Frontend/src/components/ui` and `Frontend/src/lib` were removed in Phase 8.

## Demo Route Contract

During early refactor phases, keep these route paths stable:

- `/`
- `/register`
- `/reset-password`
- `/new-password`
- `/dashboard`
- `/folder/:id`
- `/notebook/:id`
- `/notebook/:notebookId/chapter/:chapterId/edit`
- `/settings`

## CSS Ownership

- `Frontend/src/index.css` is an import hub only.
- Global CSS layers live in `Frontend/src/styles`.
- Feature-owned CSS lives next to the owning feature folder.
- `Frontend/src/styles/theme.css` is imported last and owns the current grayscale visual override.

## Guardrail Scripts

- In `Frontend`, `npm run smoke` runs lint and build together as the main frontend refactor guardrail.
