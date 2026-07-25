# Invoice Generator

Invoice Generator is a browser-based mini project for creating professional invoices without a backend. It supports editable business/client details, itemized line items, tax calculation, logo upload, templates, print support, and PDF export through the browser print dialog.

## Features

- Add business and client billing details.
- Upload a business logo for the invoice preview.
- Add, edit, and remove line items.
- Automatic subtotal, discount, tax, shipping, and total calculation.
- Multiple templates: Classic, Modern, and Compact.
- Currency selection for USD, INR, EUR, and GBP.
- Print support and PDF export using the browser's save-as-PDF flow.
- Export/import invoice data as JSON.
- Autosaves the current invoice in `localStorage`.

## How to Run

Open `index.html` directly in a browser, or run the repository with a local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/productivity/invoice-generator/
```

## PDF Export

Click **Export PDF**, then choose **Save as PDF** in the browser print dialog.

## Dependencies

No new dependencies are required. The project uses HTML, CSS, vanilla JavaScript, and browser APIs.
