# Backend API Map

Source of truth: `Backend/src/routes/api.js` composes route modules from `Backend/src/routes/modules`.

Base path: `/api`

## Route Module Ownership

- `auth.routes.js`: `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- `settings.routes.js`: `/user/profile`, `/user/password`
- `todos.routes.js`: `/todos`
- `notes.routes.js`: `/notes`
- `focus.routes.js`: `/focus-sessions`
- `workspace.routes.js`: `/folders`
- `notebooks.routes.js`: `/notebooks`
- `chapters.routes.js`: `/notebooks/:notebookId/chapters`, `/chapters/:id`
- `resources.routes.js`: `/resources`
- `calendar.routes.js`: `/calendar`
- `search.routes.js`: `/search`

## Middleware

- `generalLimiter` applies globally in `Backend/index.js`.
- `authLimiter` applies to auth/password request endpoints listed below.
- `authMiddleware` protects authenticated endpoints.
- `validate` applies express-validator results.
- `upload.single('file')` handles resource uploads.

## Service Layer

- `Backend/src/services/focus.service.js` owns focus recommendation blocks, focus lifecycle, session todos, and summaries.
- `Backend/src/services/todo.service.js` owns todo ranking, assignment checks, reminder defaults, and todo mutations.
- `Backend/src/services/workspace.service.js` owns folder workflows and folder notebook lookup.
- `Backend/src/services/user.service.js` owns profile and password workflows.
- Controllers keep the same route-facing method names and response shapes.

## Database / Repository Layer

- `Backend/src/db` owns the SQLite connection, schema bootstrap, and `ensureColumn` schema patching.
- `Backend/src/repositories` owns runtime SQL/data access for users, todos, folders, notebooks, chapters, notes, resources, and focus sessions.
- `Backend/seed.js` intentionally uses direct SQL for deterministic demo data and generated `demo-notable-*` uploads.
- Legacy model and database compatibility shims were removed in Phase 8; runtime imports should use repositories and `Backend/src/db`.

## Guardrail Scripts

- `npm run smoke` requires `Backend/src/db`, all repositories, and all route modules, then prints the registered route method/path list.
- Error response normalization and deeper dead repository method cleanup are deferred because they can affect API behavior or future feature work.

## Auth

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public | `authLimiter`, `registerRules`, `validate` | `AuthController.register` |
| POST | `/auth/login` | Public | `authLimiter`, `loginRules`, `validate` | `AuthController.login` |
| POST | `/auth/forgot-password` | Public | `authLimiter` | `PasswordController.forgotPassword` |
| POST | `/auth/reset-password` | Public | none | `PasswordController.resetPassword` |

## User / Settings

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/user/profile` | Protected | `authMiddleware` | `UserController.getProfile` |
| PATCH | `/user/profile` | Protected | `authMiddleware` | `UserController.updateProfile` |
| PATCH | `/user/password` | Protected | `authMiddleware` | `UserController.changePassword` |

## Todos

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/todos` | Protected | `authMiddleware` | `TodoController.getAll` |
| POST | `/todos` | Protected | `authMiddleware`, `todoRules`, `validate` | `TodoController.create` |
| PATCH | `/todos/:id` | Protected | `authMiddleware`, `todoRules`, `validate` | `TodoController.update` |
| PATCH | `/todos/:id/complete` | Protected | `authMiddleware` | `TodoController.markComplete` |
| DELETE | `/todos/:id` | Protected | `authMiddleware` | `TodoController.delete` |

## Notes

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/notes` | Protected | `authMiddleware` | `NoteController.getAll` |
| POST | `/notes` | Protected | `authMiddleware`, `noteRules`, `validate` | `NoteController.create` |
| PATCH | `/notes/:id` | Protected | `authMiddleware`, `noteRules`, `validate` | `NoteController.update` |
| DELETE | `/notes/:id` | Protected | `authMiddleware` | `NoteController.delete` |

## Focus Sessions

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/focus-sessions` | Protected | `authMiddleware` | `FocusSessionController.getAll` |
| GET | `/focus-sessions/recommended` | Protected | `authMiddleware` | `FocusSessionController.getRecommended` |
| POST | `/focus-sessions` | Protected | `authMiddleware` | `FocusSessionController.start` |
| PATCH | `/focus-sessions/:id/end` | Protected | `authMiddleware` | `FocusSessionController.end` |
| GET | `/focus-sessions/:id/summary` | Protected | `authMiddleware` | `FocusSessionController.getSummary` |

## Workspace / Folders

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/folders` | Protected | `authMiddleware` | `FolderController.getAll` |
| POST | `/folders` | Protected | `authMiddleware` | `FolderController.create` |
| PATCH | `/folders/:id` | Protected | `authMiddleware` | `FolderController.update` |
| DELETE | `/folders/:id` | Protected | `authMiddleware` | `FolderController.delete` |
| GET | `/folders/:id/notebooks` | Protected | `authMiddleware` | `FolderController.getNotebooks` |

## Notebooks

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/notebooks` | Protected | `authMiddleware` | `NotebookController.getAll` |
| POST | `/notebooks` | Protected | `authMiddleware` | `NotebookController.create` |
| PATCH | `/notebooks/:id` | Protected | `authMiddleware` | `NotebookController.update` |
| DELETE | `/notebooks/:id` | Protected | `authMiddleware` | `NotebookController.delete` |

## Chapters

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/notebooks/:notebookId/chapters` | Protected | `authMiddleware` | `ChapterController.getAll` |
| POST | `/notebooks/:notebookId/chapters` | Protected | `authMiddleware` | `ChapterController.create` |
| PATCH | `/chapters/:id` | Protected | `authMiddleware` | `ChapterController.update` |
| DELETE | `/chapters/:id` | Protected | `authMiddleware` | `ChapterController.delete` |

## Resources

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/resources` | Protected | `authMiddleware` | `ResourceController.getAll` |
| POST | `/resources` | Protected | `authMiddleware`, `upload.single('file')` | `ResourceController.upload` |
| GET | `/resources/notebook/:notebookId` | Protected | `authMiddleware` | `ResourceController.getByNotebook` |
| GET | `/resources/chapter/:chapterId` | Protected | `authMiddleware` | `ResourceController.getByChapter` |
| GET | `/resources/:id/download` | Protected | `authMiddleware` | `ResourceController.download` |
| DELETE | `/resources/:id` | Protected | `authMiddleware` | `ResourceController.delete` |

## Google Calendar

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/calendar/auth` | Protected | `authMiddleware` | `GoogleCalendarController.getAuthUrl` |
| GET | `/calendar/callback` | Public callback | none | `GoogleCalendarController.handleCallback` |
| GET | `/calendar/events` | Protected | `authMiddleware` | `GoogleCalendarController.getEvents` |

## Global Search

| Method | Path | Access | Middleware | Controller |
| --- | --- | --- | --- | --- |
| GET | `/search` | Protected | `authMiddleware` | `SearchController.search` |

## Demo Contract Endpoints

Keep these stable during early refactor phases because the frontend demo depends on them:

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/user/profile`
- `/user/password`
- `/folders`
- `/folders/:id/notebooks`
- `/notebooks`
- `/notebooks/:notebookId/chapters`
- `/chapters/:id`
- `/todos`
- `/todos/:id/complete`
- `/notes`
- `/resources`
- `/resources/notebook/:notebookId`
- `/resources/chapter/:chapterId`
- `/resources/:id/download`
- `/focus-sessions`
- `/focus-sessions/recommended`
- `/focus-sessions/:id/end`
- `/focus-sessions/:id/summary`
- `/search`
