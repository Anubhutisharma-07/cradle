# Meme Generator Studio Architecture Documentation

## Overview

The Meme Generator Studio is an interactive HTML5 Canvas meme creation tool. It features custom text overlay rendering, real-time typography styling, custom file uploads, random meme API ingestion, preset saving via LocalStorage, and image export capabilities.

## Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Meme Generator Interface                 │
│    Text Inputs, Font Controls, Image Uploader, Presets      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│            Meme Engine & Text Canvas (memeEngine.js)        │
│   • Text Wrapping & Multiline Layout Engine                 │
│   • HTML5 2D Context Stroke & Fill Overlay                 │
│   • High Dynamic Resolution Rendering                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│             LocalStorage Manager (memeStorage.js)           │
│   • Preset History Storage & Deserialization                │
│   • PNG Canvas Export Trigger                               │
└─────────────────────────────────────────────────────────────┘
```

## Modular Components

- `memeEngine.js`: Text wrapping math and HTML5 2D canvas drawing logic.
- `memeStorage.js`: Storage manager for keeping history of up to 10 meme presets in `localStorage`.
- `script.js`: DOM binding layer, event listeners, and API fetcher.
- `index.html`: Responsive studio UI with canvas preview card and control controls.
- `style.css`: Modern dark studio CSS styling and preset grid layout.
