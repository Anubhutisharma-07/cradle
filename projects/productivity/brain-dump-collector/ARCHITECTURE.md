# Brain Dump Collector Architecture

Brain Dump Collector is a lightweight, privacy-first productivity mini-project designed to capture random thoughts rapidly before they disappear and organize them into meaningful categories using lightweight keyword matching, with zero external dependencies.

---

## Table of Contents

- [Overview & Purpose](#overview--purpose)
- [Key Features](#key-features)
- [How to Run](#how-to-run)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [System Architecture Overview](#system-architecture-overview)
- [Folder Structure](#folder-structure)
- [Component Breakdown](#component-breakdown)
- [Data Model & Persistence](#data-model--persistence)
- [File Responsibilities](#file-responsibilities)
- [Technologies Used](#technologies-used)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Dependencies](#dependencies)

---

## Overview & Purpose

Brain Dump Collector is a browser-based static application built within the Cradle mini-project collection. Its primary goal is to help users declutter their minds by rapidly dumping messy, unstructured thoughts and automatically categorizing them into Work, Study, Ideas, Personal, Health, Finance, Errands, or Later buckets.

### Core Goals:
- **Fast Multiline Capture:** Capture single or batch thoughts instantly.
- **Automatic Keyword Categorization:** Group notes heuristics-based without requiring a remote AI backend or external API dependencies.
- **Effortless Retrieval:** Enable search across notes, categories, and generated tags alongside multi-facet filtering.
- **Data Mobility:** Provide seamless JSON import and export for backups and migration across devices.
- **Zero-Build Ecosystem:** Remain fully self-contained as native HTML, CSS, and Vanilla JavaScript.

---

## Key Features

- **Multiline Fast Capture:** Paste multiple lines of thoughts at once; each line creates a distinct, categorized note card.
- **Keyword-based Auto Grouping:** Rule-scoring algorithm automatically assigns thoughts to appropriate category buckets.
- **Manual Category Override:** Option to select a category manually during capture.
- **Rich Search & Multi-Filtering:** Real-time search across text, category, and tags; filter by category, open, done, or pinned status.
- **Note Lifecycle Management:** Pin, edit, mark done/reopen, or delete individual thoughts.
- **Focus Queue Panel:** Quick summary displaying recent open thoughts for immediate attention.
- **Category Summary Cards:** Visual insight breakdown of note counts per category.
- **Local Persistence:** Data persists locally across sessions via browser `localStorage`.
- **JSON Import & Export:** Download or upload notes via JSON backups.

---

## How to Run

Open `index.html` directly in any web browser, or serve locally using Python:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/productivity/brain-dump-collector/
```

---

## Keyboard Shortcuts

- `Ctrl + Enter` or `Cmd + Enter`: Rapidly capture thoughts inside the text area.

---

## System Architecture Overview

The application follows a static three-file web architecture. `index.html` provides the semantic markup, form inputs, and card templates; `style.css` defines responsive layouts and design tokens; `script.js` manages internal state, keyword detection heuristics, DOM rendering, `localStorage` synchronization, and JSON data import/export.

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

---

## Folder Structure

```text
brain-dump-collector/
├── ARCHITECTURE.md  # Unified architecture document, component breakdown, and usage guide
├── index.html       # Semantic UI shell and note templates
├── script.js        # Note state, grouping engine, search, persistence, and export/import
├── style.css        # Dashboard layout, theme variables, and card styling
└── thumbnail.svg    # Project preview graphic
```

---

## Component Breakdown

| Component / File | Responsibility |
|---|---|
| `index.html` | Provides the application shell, capture interface, filter controls, insight panels, board container, and reusable `<template>`. |
| `script.js` | Manages application state, auto-grouping heuristics, tag generation, persistence, DOM updates, and backup export/import. |
| `style.css` | Handles design system tokens, CSS grid/flexbox layouts, responsive states, card styles, and mobile behavior. |
| `ARCHITECTURE.md` | Single authoritative documentation covering architecture, component roles, data schema, and usage. |

---

## Data Model & Persistence

### Note Object Schema

Each thought is stored as a plain JavaScript object:

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

### Local Storage Key

All notes are stored in `localStorage` under the key:

```text
cradle:brain-dump-collector
```

---

## File Responsibilities

### `index.html`
- Form controls for multiline text input and category override selection.
- Search input bar, category dropdown, and status filter buttons.
- Stats summary cards, focus queue container, category summary panel, and note board container.
- Includes reusable note card HTML structure inside a `<template>` tag.

### `script.js`
- `handleCapture()`: Converts text area lines into note objects.
- `detectCategory()`: Scores text content against keyword rules to infer categories.
- `extractTags()`: Generates searchable tags from category names, hashtags, and keywords.
- `render()`: Updates stats, active filters, focus queue, summaries, and note cards in the DOM.
- `getFilteredNotes()`: Filters notes based on search query, category selection, and note status (open/done/pinned).
- `toggleNote()`, `editNote()`, `deleteNote()`: Performs mutations on notes.
- `exportNotes()` & `importNotes()`: Generates Blob downloads and processes FileReader JSON uploads.
- `persistNotes()`: Serializes state to `localStorage`.

### `style.css`
- Defines CSS custom properties for color palette and layout tokens.
- Constructs responsive grid containers for hero section, filter bar, and note board.
- Provides interactive hover effects, state styling for pinned/completed items, and mobile responsiveness.

---

## Technologies Used

| Technology / API | Purpose |
|---|---|
| **HTML5** | Page structure, form controls, and card template. |
| **CSS3** | Responsive dashboard layout, card styling, states, and mobile behavior. |
| **Vanilla JavaScript** | State management, keyword grouping heuristics, DOM rendering, and export/import. |
| **localStorage API** | Persists notes between browser sessions. |
| **FileReader API** | Reading and parsing imported JSON note backups. |
| **Blob & URL API** | Generating downloadable JSON note export files. |

---

## Design Decisions

- **Client-Side Keyword Heuristics:** Used instead of a remote AI service to guarantee zero runtime latency, complete privacy, and zero external infrastructure dependencies.
- **Multiline Line-by-Line Capture:** Designed to match natural brain-dumping workflows where thoughts arrive in rapid batches.
- **Post-Filter Categorized Board:** Grouping occurs after search filtering so search results remain organized by category context.
- **Native Web APIs:** Built using standard `localStorage`, `FileReader`, and `Blob` APIs to maintain Cradle's zero-build requirement.

---

## Known Limitations

- **Heuristic Auto-Grouping:** Keyword-based classification may occasionally miscategorize complex or ambiguous thoughts.
- **Single-Browser Persistence:** Data is stored within the specific browser instance unless manually exported to JSON.
- **Native Prompt Editing:** Quick editing utilizes browser prompt dialogs to avoid external modal libraries.

---

## Future Improvements

- Drag-and-drop category reassignment for note cards.
- Customizable keyword rule management.
- Export options for Markdown (.md) and CSV formats.
- Recurring review reminders and scheduled cleanups.

---

## Dependencies

No third-party libraries or build tools are required. Built with standard HTML, CSS, Vanilla JavaScript, and native Web APIs.
