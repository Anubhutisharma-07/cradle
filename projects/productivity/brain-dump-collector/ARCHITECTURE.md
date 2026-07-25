# Brain Dump Collector Architecture

## Overview

Brain Dump Collector is a static browser productivity tool for quickly capturing random thoughts and organizing them into meaningful groups. It uses local browser storage for persistence and lightweight keyword rules for automatic categorization.

## Purpose & Goals

- Make it fast to capture one thought or many thoughts at once.
- Automatically group notes without requiring a backend or AI service.
- Keep search and filtering simple enough for quick review.
- Provide export and import so notes can be backed up or moved.
- Stay self-contained within the Cradle mini-project structure.

## Folder Structure

```text
brain-dump-collector/
├── ARCHITECTURE.md  # Project structure and maintenance notes
├── README.md        # Usage instructions and feature list
├── index.html       # Semantic UI shell and templates
├── script.js        # Capture, grouping, search, persistence, export/import
└── style.css        # Responsive layout and visual design
```

## System / Project Architecture Overview

The project follows a static three-file browser app pattern. `index.html` defines the capture form, controls, summary areas, and card template. `style.css` handles the responsive dashboard layout. `script.js` owns state, localStorage persistence, automatic grouping rules, search/filter logic, and DOM rendering.

```text
User opens index.html
        ↓
Saved notes are loaded from localStorage
        ↓
User captures one or more thoughts
        ↓
Each thought is categorized and tagged
        ↓
State is saved and the dashboard re-renders
        ↓
User searches, filters, edits, pins, completes, exports, or imports notes
```

## Component Breakdown

| File         | Responsibility                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `index.html` | Provides the app shell, capture form, filters, insight panels, board container, and note template.     |
| `script.js`  | Manages notes, auto grouping, generated tags, persistence, rendering, export/import, and user actions. |
| `style.css`  | Defines colors, responsive grids, cards, forms, note states, and mobile behavior.                      |
| `README.md`  | Documents how to run and use the mini project.                                                         |

## Data Model

Each note is stored as a plain object:

```js
{
  id: "unique note id",
  text: "thought text",
  category: "Work",
  tags: ["work", "dashboard", "coding"],
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp",
  done: false,
  pinned: false
}
```

The full notes array is persisted under:

```text
cradle:brain-dump-collector
```

## Key Features

- Multiline fast capture, with one thought created per line.
- Keyword-based automatic category detection.
- Category override for manual grouping.
- Search across note text, categories, and generated tags.
- Filters for category, status, done notes, and pinned notes.
- Pin, done/reopen, edit, and delete controls.
- Focus queue showing recent open thoughts.
- Category summary cards.
- JSON export and import.

## Technologies Used

| Technology         | Purpose                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| HTML5              | Page structure, form controls, and card template.                            |
| CSS3               | Responsive dashboard layout, card styling, states, and mobile behavior.      |
| Vanilla JavaScript | State management, keyword grouping, filtering, DOM rendering, export/import. |
| localStorage API   | Persists notes between browser sessions.                                     |
| FileReader API     | Imports JSON note backups.                                                   |
| Blob URL API       | Generates downloadable JSON exports.                                         |

## File Responsibilities

### `index.html`

- Defines the fast capture form and optional category override.
- Provides search, group, and status filters.
- Includes the stats cards, focus queue, category summary, and grouped board.
- Stores reusable note markup in a `<template>`.

### `script.js`

- `handleCapture()` converts textarea lines into note objects.
- `detectCategory()` scores text against keyword rules.
- `extractTags()` creates searchable tags from category, hashtags, and important words.
- `render()` coordinates stats, filters, focus queue, summaries, and grouped note cards.
- `getFilteredNotes()` applies search, group, status, and sort rules.
- `toggleNote()`, `editNote()`, and `deleteNote()` handle note actions.
- `exportNotes()` and `importNotes()` handle JSON backup flows.
- `persistNotes()` stores the state in localStorage.

### `style.css`

- Uses CSS custom properties for the warm productivity theme.
- Defines responsive grids for the hero, controls, insight cards, and note board.
- Keeps controls usable on small screens.
- Styles note states for pinned and completed thoughts.

## Design Decisions

- Keyword grouping is used instead of a remote AI service so the mini remains private, fast, and dependency-free.
- Multiline capture supports real brain-dump behavior where thoughts arrive in batches.
- Notes are grouped after filtering so search results stay easy to scan.
- `localStorage` is used because the project is a lightweight frontend-only mini.

## Known Limitations

- Auto grouping is heuristic and may not classify every thought perfectly.
- Data is stored in the current browser only unless exported manually.
- Editing uses simple browser prompts to keep the app dependency-free.

## Future Improvements

- Add drag-and-drop category reassignment.
- Add custom category rule editing.
- Add markdown export.
- Add recurring review reminders.
