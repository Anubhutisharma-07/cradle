# Browser Storage Inspector & Backup Manager 💾

A unified browser storage inspector and backup management developer tool for inspecting, searching, filtering, editing, and backing up LocalStorage, SessionStorage, Cookies, and IndexedDB stores.

## Key Enhancements & Features

- **Unified Storage Engine**: Automatically parses data types (JSON, JWT tokens, Base64 strings, Numbers, Booleans, Raw strings).
- **Byte Footprint Estimation**: Calculates UTF-16 memory consumption for each key-value pair and displays human-readable sizes (Bytes, KB, MB).
- **Type Filtering**: Filter entries by data type (JSON, JWT, String, Number, Boolean, Base64).
- **Multi-Format Export & Backup**:
  - Export full store snapshot to structured **JSON** with metadata.
  - Export entries to **CSV** spreadsheet format.
  - Restore storage snapshots from JSON backups.
- **Search & Editing**: Live search across keys and values with CRUD form support.

## How to Run

Open `index.html` in any web browser or serve locally:

```bash
http://localhost:8000/projects/dev-tools/browser-storage-inspector/
```

## Architecture

- `storageEngine.js` — Data type detection, byte footprint calculation, store reading.
- `storageExporter.js` — JSON/CSV export serialization and backup restoration validation.
- `script.js` — DOM inspector controller, tab switching, and CRUD handlers.
- `style.css` — Badge styling for data types, flex search toolbar, and glassmorphic tables.
