# Browser Storage Inspector

Browser Storage Inspector is a dependency-free mini dev tool for viewing and managing browser storage from one interface. It supports LocalStorage, SessionStorage, visible Cookies, and IndexedDB databases available to the current origin.

## Features

- Search keys, values, database names, and object store names.
- Create, edit, delete, and clear LocalStorage entries.
- Create, edit, delete, and clear SessionStorage entries.
- Create, edit, delete, and clear browser-visible cookies.
- Load IndexedDB databases, inspect object stores, add/update/delete records, and delete a selected database.
- Export one entry or a full JSON snapshot of all visible storage.
- Seed demo data to quickly test every storage type.

## How to Run

Open `index.html` directly in a browser, or run the repository with a local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/dev-tools/browser-storage-inspector/
```

## Notes

- Browsers do not expose HttpOnly cookies to JavaScript, so the cookie tab only shows cookies that frontend code is allowed to read.
- IndexedDB database listing depends on `indexedDB.databases()`. Chromium-based browsers support it. If your browser does not expose database names, click **Seed Demo Data** to create a test database for this tool.
- IndexedDB record values must be valid JSON when saving through the form.

## Dependencies

No external libraries or build tools are required. The project uses HTML, CSS, and vanilla JavaScript browser APIs.
