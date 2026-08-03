# URL Parser Architecture Documentation

## Overview

The URL Parser is a developer tool that breaks down a URL into its individual components.

It uses the browser's native `URL` API to extract information like protocol, hostname, path, query parameters, fragments, and file details.

## Architecture

```text
┌─────────────────────────────┐
│        User Input URL       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      URL Parser Engine      │
│       (script.js)           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     URL Information         │
│                             │
│ Protocol                    │
│ Hostname                    │
│ Port                        │
│ Path                        │
│ Query Parameters            │
│ Fragment                    │
│ File Details                │
└──────────────┬──────────────┘
               │
               ▼
```text
projects/dev-tools/url-parser/
├── ARCHITECTURE.md # Architecture documentation
├── index.html        # Main HTML user interface
├── urlEngine.js      # Modular URL parser, query string builder, and safe encoder
├── script.js         # UI bindings and row creation
└── style.css         # Styling rules
```

- **tests/url-parser.test.js**: Dedicated unit test suite covering protocol normalization, query parameter building, and URL encoding.
