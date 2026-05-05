# Notable

Notable is a local-first study productivity app for organizing folders, notebooks, chapters, notes, tasks, resources, calendar context, and focus sessions. The MVP combines a React/Vite frontend with an Express/SQLite backend and implements the core flow described in the group report: authentication, dashboard workspace, notebook/chapter writing, BHPS task priority, global search, reminders, and editable focus-session recommendations.

Group report: [Notable Group Report](https://docs.google.com/document/d/1MLaiFm2-XS0ueA3eEfL4rn2nbUW_koQJesylkEIdjTQ/edit?usp=sharing)

## Project Structure

```text
Notable/
├── Backend/      # Express API, SQLite DB, repositories, services, route modules
├── Frontend/     # React + Vite app with feature-owned pages/components
├── docs/         # Refactor maps, API maps, smoke checklists, roadmap
└── README.md
```

## Tech Stack

- Frontend: React, Vite, React Router, MDXEditor, ESLint
- Backend: Node.js, Express, SQLite via better-sqlite3
- Auth: bcrypt password hashing, JWT bearer tokens
- Uploads: multer, local `Backend/uploads/`
- Optional email delivery: nodemailer
- Optional Google Calendar OAuth/event reads: googleapis

## Local Setup

Install backend dependencies:

```bash
cd Backend
npm install
```

Install frontend dependencies:

```bash
cd Frontend
npm install
```

Create `Backend/.env`:

```env
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://127.0.0.1:5173

# Optional. If omitted, forgot-password returns a local reset token/link for testing.
EMAIL_USER=
EMAIL_PASS=

# Optional Google Calendar OAuth skeleton.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Running Locally

Start the backend in one terminal:

```bash
cd Backend
npm start
```

The API runs at:

```text
http://localhost:3000
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

The app runs at:

```text
http://127.0.0.1:5173
```

## MVP Features

- Register, login, logout, protected dashboard, and local JWT session storage.
- Password reset flow for local testing. If SMTP credentials are not configured, `/auth/forgot-password` returns a reset token/link in the response.
- Demo account seeding with rich folders, notebooks, chapters, todos, resources, notes, reminders, and focus data via `cd Backend && npm run seed`.
- Dynamic dashboard using backend data:
  - profile greeting
  - clickable folders and notebooks
  - todos with ownership, deadline, academic weight, estimated effort, reminders, BHPS score, and priority label
  - search, filter, sort, reminders, and timeline panels
  - Your Day calendar panel with Google Calendar embed fallback
  - global command search across workspace, tasks, notes, chapters, and resources
  - BHPS focus recommendations and editable global focus timer
- Notebook detail route at `/notebook/:id`:
  - chapter list from backend with delete/edit actions
  - chapter search
  - create chapter and continue writing in the full editor
  - create quick note linked optionally to a todo
  - upload resource to notebook/chapter
  - download resource
- Folder detail route at `/folder/:id`:
  - notebook list in that folder
  - folder-related task timeline
  - create notebook directly inside the folder
- Chapter detail/editor route at `/notebook/:notebookId/chapter/:chapterId/edit`:
  - rich Markdown editor with toolbar
  - rendered Markdown reading pane
  - linked resources
- Focus Session:
  - recommended study block from BHPS-ranked tasks
  - global countdown widget across protected pages
  - full focus overlay
  - editable active session title, notes, duration, and task list
  - end-session summary
- Backend ownership checks prevent users from updating/deleting/downloading another user's data.
- SQLite schema is created idempotently on startup, so a fresh local database can boot without manual migration.

## Available Scripts

Frontend:

```bash
npm run dev      # Start Vite dev server
npm run build    # Build production frontend
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm run smoke    # Run lint + build
```

Backend:

```bash
npm start        # Start Express with node
npm run dev      # Start Express with nodemon
npm run seed     # Reset/seed demo data
npm run smoke    # Require DB/repositories/routes and print route map
```

## Backend API

Base URL:

```text
http://localhost:3000/api
```

Public routes:

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `POST` | `/auth/forgot-password` | Request password reset; returns local token/link when SMTP is not configured |
| `POST` | `/auth/reset-password` | Reset password with token |

Protected routes require:

```http
Authorization: Bearer <token>
```

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/user/profile` | Get safe current-user profile |
| `PATCH` | `/user/profile` | Update profile name/display name |
| `PATCH` | `/user/password` | Change current-user password |
| `GET` | `/folders` | List folders |
| `POST` | `/folders` | Create folder |
| `PATCH` | `/folders/:id` | Update folder |
| `DELETE` | `/folders/:id` | Delete folder |
| `GET` | `/folders/:id/notebooks` | List notebooks in a folder |
| `GET` | `/notebooks` | List notebooks |
| `POST` | `/notebooks` | Create notebook |
| `PATCH` | `/notebooks/:id` | Update notebook |
| `DELETE` | `/notebooks/:id` | Delete notebook |
| `GET` | `/notebooks/:notebookId/chapters` | List notebook chapters |
| `POST` | `/notebooks/:notebookId/chapters` | Create chapter |
| `PATCH` | `/chapters/:id` | Update chapter |
| `DELETE` | `/chapters/:id` | Delete chapter |
| `GET` | `/todos` | List todos ranked with BHPS |
| `POST` | `/todos` | Create todo |
| `PATCH` | `/todos/:id` | Update todo |
| `PATCH` | `/todos/:id/complete` | Mark todo complete |
| `DELETE` | `/todos/:id` | Delete todo |
| `GET` | `/notes` | List notes |
| `POST` | `/notes` | Create note |
| `PATCH` | `/notes/:id` | Update note |
| `DELETE` | `/notes/:id` | Delete note |
| `GET` | `/resources` | List resources |
| `POST` | `/resources` | Upload resource with multipart `file` |
| `GET` | `/resources/notebook/:notebookId` | List notebook resources |
| `GET` | `/resources/chapter/:chapterId` | List chapter resources |
| `GET` | `/resources/:id/download` | Download resource |
| `DELETE` | `/resources/:id` | Delete resource |
| `GET` | `/focus-sessions` | List focus sessions |
| `GET` | `/focus-sessions/recommended` | Recommend incomplete todos and a BHPS study block |
| `POST` | `/focus-sessions` | Start focus session |
| `PATCH` | `/focus-sessions/:id` | Edit an active focus session title, notes, duration, and task list |
| `PATCH` | `/focus-sessions/:id/end` | End focus session |
| `GET` | `/focus-sessions/:id/summary` | Get focus session summary |
| `GET` | `/search?q=...` | Global grouped search with BHPS recommendations |
| `GET` | `/calendar/auth` | Generate Google Calendar OAuth URL |
| `GET` | `/calendar/events` | Fetch Google Calendar events using provided tokens |

## Example API Calls

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student",
    "email": "student@example.com",
    "password": "secret123",
    "display_name": "Student"
  }'
```

Log in:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "secret123"
  }'
```

Create a todo:

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Review Chapter 3",
    "deadline": "2026-05-25",
    "academic_weight": 8,
    "estimated_effort": 4,
    "notebook_id": "<notebook-id>",
    "reminder_at": "2026-05-24T08:00:00.000Z"
  }'
```

Edit an active focus session:

```bash
curl -X PATCH http://localhost:3000/api/focus-sessions/<session-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Thesis writing block",
    "session_notes": "Stay on Chapter 3 and finish the draft pass.",
    "duration_minutes": 45,
    "todo_ids": ["<todo-id-1>", "<todo-id-2>"]
  }'
```

## Verification

Frontend:

```bash
cd Frontend
npm run lint
npm run build
```

Backend smoke check:

```bash
cd Backend
npm run smoke
```

Optional API health check:

```bash
cd Backend
npm start
curl http://localhost:3000/
```

## Local Data Notes

- SQLite data is stored in `Backend/database/notable.db`.
- Uploaded files are stored in `Backend/uploads/`.
- These local runtime artifacts may change during manual testing.
- `Backend/database/notable.db` may change when schema bootstrap adds nullable columns during smoke/dev runs.
- Chapter content is stored as Markdown text in `chapters.content`.
