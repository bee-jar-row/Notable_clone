# Backend Smoke Checklist

Use this checklist after backend refactor phases and after any change that touches API routes, controllers, models, seed data, database setup, or middleware.

## Setup

- Run `npm run seed` in `Backend`.
- Start backend with `npm run dev` or `npm start`.
- Confirm `GET /` returns `Notable Backend is running!`.

## Auth

- Register a new user with `POST /api/auth/register`.
- Login demo user with `POST /api/auth/login`.
- Confirm response includes a token and public user fields.
- Use token for protected endpoint checks.
- Request password reset with `POST /api/auth/forgot-password`.
- Reset password with `POST /api/auth/reset-password` using returned/local token.

## User / Settings

- `GET /api/user/profile` returns current authenticated user.
- `PATCH /api/user/profile` updates `name`, `display_name`, and `gcal_url`.
- `PATCH /api/user/password` rejects wrong current password.
- `PATCH /api/user/password` accepts correct current password and updates login credentials.

## Workspace

- `GET /api/folders` returns demo folders.
- `POST /api/folders` creates a folder.
- `PATCH /api/folders/:id` updates a folder title.
- `GET /api/folders/:id/notebooks` returns notebooks inside the folder.
- `DELETE /api/folders/:id` deletes a folder when intentionally testing destructive behavior.

## Notebooks / Chapters

- `GET /api/notebooks` returns demo notebooks.
- `POST /api/notebooks` creates a notebook with optional `folder_id`.
- `PATCH /api/notebooks/:id` updates title.
- `DELETE /api/notebooks/:id` deletes a notebook when intentionally testing destructive behavior.
- `GET /api/notebooks/:notebookId/chapters` returns chapters.
- `POST /api/notebooks/:notebookId/chapters` creates a chapter.
- `PATCH /api/chapters/:id` edits title/content.
- `DELETE /api/chapters/:id` deletes a chapter.

## Todos / BHPS / Reminders

- `GET /api/todos?limit=100` returns todos with BHPS fields and `reminder_at`.
- `POST /api/todos` creates unassigned, folder-assigned, and notebook-assigned todos.
- `PATCH /api/todos/:id` updates assignment, deadline, effort, weight, and reminder.
- `PATCH /api/todos/:id/complete` marks a todo complete.
- `DELETE /api/todos/:id` deletes a todo.

## Notes

- `GET /api/notes` returns notes for the user.
- `POST /api/notes` creates a note with optional `todo_id`.
- `PATCH /api/notes/:id` updates note title/content.
- `DELETE /api/notes/:id` deletes a note.

## Resources

- `GET /api/resources` returns all user resources.
- `POST /api/resources` uploads a file linked to a notebook or chapter.
- `GET /api/resources/notebook/:notebookId` returns notebook resources.
- `GET /api/resources/chapter/:chapterId` returns chapter resources.
- `GET /api/resources/:id/download` downloads the file.
- `DELETE /api/resources/:id` removes metadata and file when intentionally testing destructive behavior.

## Focus Sessions

- `GET /api/focus-sessions/recommended` returns `recommended_todos` and `recommended_block`.
- `POST /api/focus-sessions` starts a session with one or more todo ids.
- `GET /api/focus-sessions` returns active/completed sessions with ranked todos.
- `PATCH /api/todos/:id/complete` during active focus updates session todo state on next fetch.
- `PATCH /api/focus-sessions/:id/end` ends a session and returns a summary.
- `GET /api/focus-sessions/:id/summary` returns the same enriched summary shape.

## Calendar

- `GET /api/calendar/auth` returns a Google auth URL when OAuth env is configured.
- `GET /api/calendar/events` should fail gracefully or return events depending on auth configuration.
- For the current demo, frontend primarily uses `user.gcal_url`; OAuth is not a core demo dependency.

