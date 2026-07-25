# Invoice Generator Architecture

## Overview

Invoice Generator is a static browser mini project that creates professional invoices from user-entered billing information. It calculates totals in real time and uses print-specific CSS for PDF export through the browser.

## Purpose & Goals

- Generate professional invoices directly in the browser.
- Support itemized billing with tax, discount, shipping, and total calculations.
- Allow users to upload a logo and choose usable invoice templates.
- Provide print and PDF export without adding dependencies.
- Keep invoice data portable with JSON export and import.

## Folder Structure

```text
invoice-generator/
├── ARCHITECTURE.md  # Project architecture and maintenance notes
├── README.md        # Usage instructions and feature list
├── index.html       # Invoice form, toolbar, preview shell, and item template
├── script.js        # State collection, calculations, rendering, persistence, exports
└── style.css        # App layout, invoice templates, responsive rules, print CSS
```

## System / Project Architecture Overview

The project follows a static frontend architecture. `index.html` defines form controls and preview containers, `script.js` stores invoice state and renders the invoice preview, and `style.css` handles the editor layout, invoice templates, and print-only PDF view.

```text
User opens index.html
        ↓
Saved invoice or sample invoice loads
        ↓
User edits details, logo, line items, tax, or template
        ↓
script.js collects form state and recalculates totals
        ↓
Preview updates and state is saved to localStorage
        ↓
User prints, exports JSON, or imports JSON
```

## Component Breakdown

| File | Responsibility |
|---|---|
| `index.html` | Defines invoice controls, form fields, item row template, and preview panel. |
| `script.js` | Handles invoice state, tax math, logo upload, preview rendering, print, JSON import/export, and autosave. |
| `style.css` | Styles the editor UI, invoice paper, templates, responsive behavior, and print layout. |
| `README.md` | Documents features, run steps, PDF export, and dependencies. |

## Key Features

- Real-time subtotal, discount, taxable amount, tax, shipping, and total calculation.
- Dynamic line item creation and removal.
- Business logo upload using `FileReader`.
- Classic, Modern, and Compact templates.
- Currency-aware totals using `Intl.NumberFormat`.
- JSON export/import for invoice data portability.
- Print-specific CSS that hides editor controls and prints only the invoice.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Form controls, semantic sections, and reusable item template. |
| CSS3 | Responsive app layout, invoice templates, and print styling. |
| Vanilla JavaScript | State handling, calculations, DOM rendering, and exports. |
| localStorage API | Saves the current invoice between sessions. |
| FileReader API | Reads logo image files and imported JSON files. |
| Blob URL API | Downloads invoice JSON export files. |
| Browser Print API | Opens print/save-as-PDF flow. |

## File Responsibilities

### `index.html`

- Loads shared Cradle UI tokens and components.
- Defines template and currency controls.
- Provides invoice detail inputs and line item template.
- Contains the preview container used for print/PDF export.

### `script.js`

- `initializeInvoiceGenerator()` loads state and attaches events.
- `collectInvoice()` converts the current form into a serializable object.
- `calculateTotals()` computes subtotal, discount, tax, shipping, and final total.
- `renderPreview()` builds the printable invoice HTML.
- `handleLogoUpload()` stores the uploaded logo as a data URL.
- `exportInvoiceJson()` and `importInvoiceJson()` handle invoice data portability.

### `style.css`

- Uses Cradle-style dark panels for the editor interface.
- Styles invoice paper separately from the app chrome.
- Adds template classes for Classic, Modern, and Compact layouts.
- Uses `@media print` to hide controls and print only the invoice.

## Design Decisions

- PDF export uses `window.print()` so no third-party PDF package is needed.
- Logo upload stores a data URL in browser state so it appears immediately in preview and exported JSON.
- Currency formatting uses `Intl.NumberFormat` for reliable browser-native formatting.
- Discount is capped at subtotal to prevent negative taxable values.

## Known Limitations

- PDF export depends on the browser print dialog.
- Logo images are stored as data URLs, so very large logos may increase saved JSON size.
- The app does not integrate with payment gateways or accounting systems.

## Future Improvements

- Add tax labels for GST/VAT/Sales Tax.
- Add partial payment and paid/unpaid status.
- Add downloadable standalone HTML invoice export.
- Add more invoice templates.
