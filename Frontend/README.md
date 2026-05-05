# Notable Frontend

React + Vite frontend for Notable. The app is organized by feature ownership and talks to the Express API through feature API modules.

## Stack

- React 19
- Vite
- React Router
- MDXEditor for rich Markdown chapter editing
- ESLint

## Structure

```text
src/
├── app/              # Providers and route composition
├── features/         # Auth, dashboard, workspace, notebook, chapter, focus, settings, search
├── shared/           # Generic UI primitives and API transport
├── styles/           # CSS layers and theme overrides
└── utils/            # Date, priority, reminder helpers
```

## Local Development

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The default app URL is:

```text
http://127.0.0.1:5173
```

The frontend expects the backend API at:

```text
http://localhost:3000/api
```

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run lint     # Run ESLint
npm run build    # Build production assets
npm run smoke    # Run lint + build
npm run preview  # Preview production build
```

## Feature Notes

- Dashboard includes workspace cards, search/filter/sort, reminders, Your Day calendar panel, timeline, and Focus Session recommendations.
- Focus Session state is global across protected pages and supports active-session editing for title, notes, duration, and todos.
- Notebook pages own timeline/resources/notes/chapter lists.
- Chapter editor uses Markdown as the stored format and lazy-loads the rich editor chunk.
- Search is global command-style search across workspace, tasks, notes, chapters, and resources.

## Build Note

`@mdxeditor/editor` is intentionally lazy-loaded from chapter-related screens. Production build may still report a large `MarkdownEditor` chunk, but the main app bundle stays separate from the editor.
