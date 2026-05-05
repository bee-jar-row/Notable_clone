# Frontend Smoke Checklist

Use this checklist after each frontend refactor phase. It is intentionally manual and demo-focused.

## Auth

- Open `/`.
- Use the demo credentials shown on the login page.
- Confirm login reaches `/dashboard`.
- Confirm register page opens from Login and back link returns to Login.
- Confirm reset password page opens and can show/reset with a local token.
- Confirm logout from a protected page returns to Login.

## Dashboard

- Confirm Dashboard loads the demo user's folders and notebooks.
- Search by folder/notebook title and confirm grid filters.
- Search by todo title and confirm Timeline filters.
- Open filter popover with click, choose type/status, and confirm visible cards/timeline update.
- Open sort popover with click, test Newest, A-Z, highest count, and lowest count.
- Create Folder from Dashboard.
- Create Notebook from Dashboard with and without folder assignment.
- Create Todo with assignment, deadline, effort, weight, and reminder.
- Complete a Timeline task and confirm visual completed state.
- Delete a task and confirm it disappears.

## Folder Detail

- Open a folder from Dashboard.
- Confirm the folder title, notebook grid, and folder timeline render.
- Add Notebook from inside the folder.
- Confirm the new notebook appears inside that folder.
- Open a notebook from the folder and confirm Back returns to the folder.

## Notebook

- Open a notebook from Dashboard and confirm Back returns to Dashboard.
- Open a notebook from Folder Detail and confirm Back returns to that folder.
- Search chapters.
- Add Chapter.
- Open a chapter card.
- Delete a chapter and confirm it disappears.
- Complete a notebook timeline task.
- Delete a notebook timeline task.
- Add a linked note from the Notes panel.
- Upload a resource from the Resources panel.
- Download a resource.

## Chapter

- Open Chapter detail/edit page.
- Confirm title, content, dates, and linked resources render.
- Edit title/content and save.
- Confirm success message and updated reader content.
- Download a linked resource if present.
- Confirm Back returns to the notebook.

## Focus Session

- Confirm Dashboard Focus Session shows BHPS recommendation block when no active session exists.
- Start a 50-minute focus session.
- Confirm global floating timer appears.
- Navigate to Folder, Notebook, Chapter, and Settings; confirm timer stays visible and countdown continues.
- Open Focus overlay from floating timer.
- Complete one task in overlay.
- Minimize overlay and confirm floating timer remains.
- End session from overlay or widget.
- Confirm Focus Summary modal appears.

## Reminders

- Confirm Reminders panel appears on Dashboard.
- Confirm overdue/due soon/upcoming badges render when seeded data includes reminders.
- Complete a task with a reminder and confirm it leaves the active reminder list after refresh.

## Settings / Calendar

- Open Settings from a protected topbar.
- Update display/profile fields.
- Add or edit Google Calendar embed URL.
- Return to Dashboard and confirm Your Day shows the configured calendar iframe or empty state.
- Attempt password change with wrong current password and confirm error.
- Change password with correct current password if intentionally testing account credentials.

