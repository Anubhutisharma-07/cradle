# Invoice Generator

Invoice Generator is a browser-based Cradle mini project for creating professional invoices without a backend. It supports editable billing details, itemized line items, tax and discount calculation, logo upload, templates, JSON import/export, autosave, and PDF export through the browser print dialog.

## Features

- Add business and client billing details.
- Upload a business logo for the invoice preview.
- Add, edit, and remove invoice line items.
- Automatically calculate subtotal, discount, tax, shipping, and final total.
- Switch between Classic, Modern, and Compact templates.
- Select USD, INR, EUR, or GBP currency formatting.
- Export invoice data as JSON and import it again later.
- Autosave the current invoice in `localStorage`.
- Print the invoice or save it as PDF from the browser print dialog.

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

Click `Export PDF`, then choose `Save as PDF` in the browser print dialog.

## Manual Testing

- Confirm the sample invoice loads on first open.
- Edit invoice fields and verify the preview updates instantly.
- Add and remove line items and verify item totals and invoice total update.
- Change template and currency selections.
- Upload a logo image and verify it appears in the invoice preview.
- Export JSON, import the downloaded JSON, and verify the invoice restores correctly.
- Use `Export PDF` and confirm only the invoice preview is printed.

## Dependencies

No new dependencies are required. The project uses HTML, CSS, vanilla JavaScript, native browser APIs, and the existing Cradle UI files.
