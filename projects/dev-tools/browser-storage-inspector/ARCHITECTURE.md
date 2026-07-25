# Browser Storage Inspector Architecture

## Overview

Browser Storage Inspector is a static browser dev tool that inspects storage available to the current origin. It brings LocalStorage, SessionStorage, Cookies, and IndexedDB into one searchable interface with CRUD controls and JSON export.

## Purpose & Goals

- Provide a single place to inspect common browser storage APIs.
- Keep the implementation dependency-free and easy to run from the project folder.
- Support practical CRUD actions for frontend debugging and learning.
- Export visible storage data as JSON for sharing or backup.

## Folder Structure

```text
browser-storage-inspector/
├── ARCHITECTURE.md  # Project architecture and maintenance notes
├── README.md        # User-facing usage and feature notes
├── index.html       # Semantic UI shell and form markup
├── script.js        # Storage API logic, CRUD actions, rendering, export
└── style.css        # Responsive layout and visual design
```

## System / Project Architecture Overview

The project follows a small static-app structure. `index.html` defines panels and forms, `style.css` owns all layout and presentation, and `script.js` reads browser storage APIs, stores a normalized in-memory snapshot, and re-renders the visible tables after each operation.

```text
User opens index.html
        ↓
Browser loads style.css and script.js
        ↓
script.js reads LocalStorage, SessionStorage, Cookies, and IndexedDB
        ↓
The normalized storageState object is rendered into tables
        ↓
User searches, edits, deletes, clears, seeds, or exports data
        ↓
The related browser API updates and the UI refreshes
```

## Component Breakdown

| File | Responsibility |
|---|---|
| `index.html` | Provides the app shell, summary counters, tabs, forms, and result tables. |
| `script.js` | Reads storage APIs, performs CRUD actions, filters/searches data, and exports JSON. |
| `style.css` | Defines the responsive dashboard layout, form controls, tables, tabs, and states. |
| `README.md` | Explains how to run and use the mini project. |

## Key Features

- Four storage panels: LocalStorage, SessionStorage, Cookies, and IndexedDB.
- Live summary counts for each storage type.
- Global search across keys, values, database names, and store names.
- Add/update/delete/clear actions for Web Storage and visible cookies.
- IndexedDB database and object-store selection with record add/update/delete support.
- JSON export for individual entries and the complete storage snapshot.
- Demo seed action that creates sample data across all supported storage types.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure, forms, tables, and accessible labels. |
| CSS3 | Responsive layout, dark dashboard styling, tabs, and table presentation. |
| Vanilla JavaScript | DOM updates, event handling, browser storage API integration, JSON export. |
| Web Storage API | LocalStorage and SessionStorage CRUD operations. |
| Cookie API | Reading, creating, updating, and clearing frontend-visible cookies. |
| IndexedDB API | Database listing, object-store reads, record writes, deletes, and demo data. |
| Blob URL API | Generates downloadable JSON export files in the browser. |

## File Responsibilities

### `index.html`

- Defines the hero section and storage count cards.
- Provides a global search input and toolbar actions.
- Defines tab panels for each storage type.
- Includes forms for saving key-value entries and IndexedDB records.

### `script.js`

- `refreshAll()` reads all supported storage types and refreshes the UI.
- `readWebStorage()` normalizes LocalStorage and SessionStorage entries.
- `readCookies()` parses cookies that JavaScript can access.
- `refreshIndexedDB()` lists databases and reads records from object stores when supported.
- `handleFormSubmit()` routes save actions to the correct storage API.
- `deleteEntry()` and `clearStorage()` handle destructive CRUD actions.
- `seedDemoData()` creates sample data for all tabs.
- `exportAllData()` and `downloadJson()` create JSON downloads.
- `renderAll()` applies search filters and redraws tables.

### `style.css`

- Uses CSS custom properties for colors and spacing.
- Builds a responsive grid for summary cards and forms.
- Keeps tables horizontally scrollable on small screens.
- Styles tabs, action buttons, status messages, and empty states.

## Design Decisions

- The tool is scoped to the current browser origin because browser storage APIs are origin-restricted by design.
- HttpOnly cookies are not shown because frontend JavaScript cannot and should not read them.
- IndexedDB values are saved as JSON so object records remain structured and predictable.
- A demo seed button is included because new origins often start with empty storage.
- No external dependencies are used to match the repository's static mini-project style.

## Known Limitations

- IndexedDB database listing requires browser support for `indexedDB.databases()`.
- Cookie metadata such as expiration, domain, Secure, and HttpOnly flags cannot be fully inspected through `document.cookie`.
- The app cannot inspect storage for other domains or browser profiles.

## Future Improvements

- Add import-from-JSON support for restoring exported snapshots.
- Add per-store IndexedDB record count badges.
- Add optional confirmation dialogs for destructive actions.
- Support more cookie attributes in the creation form.
