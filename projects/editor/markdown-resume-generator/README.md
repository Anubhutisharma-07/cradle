# Markdown Resume Generator

Markdown Resume Generator is a browser-based Cradle mini project for writing a professional resume in Markdown and previewing it instantly. It includes template switching, theme selection, source downloads, standalone HTML export, and PDF export through the browser print dialog.

## Features

- Live resume preview while typing Markdown.
- Three templates: Classic, Modern, and Compact.
- Four themes: Slate, Indigo, Emerald, and Rose.
- Sample professional resume content for quick testing.
- Copy Markdown to clipboard.
- Download the source resume as `resume.md`.
- Export a standalone `resume.html` file.
- Print support for browser save-as-PDF export.
- Autosaves draft Markdown, selected template, and selected theme in `localStorage`.

## How to Run

Open `index.html` directly in a browser, or run the repository with a local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/editor/markdown-resume-generator/
```

## How to Use

1. Edit the Markdown resume in the left editor pane.
2. Choose a template from Classic, Modern, or Compact.
3. Choose a color theme from Slate, Indigo, Emerald, or Rose.
4. Use **Copy Markdown**, **Download MD**, **Export HTML**, or **Export PDF** depending on the output needed.
5. For PDF export, click **Export PDF** and choose **Save as PDF** in the browser print dialog.

## Supported Markdown

- `#` main heading
- `##` section headings
- `###` role, project, education, or experience headings
- Bullet lists using `-` or `*`
- Bold text using `**text**`
- Italic text using `*text*`
- Links using `[label](https://example.com)`

## Documentation

For implementation details, data flow, file responsibilities, design decisions, dependencies, and development notes, see `ARCHITECTURE.md`.

## Dependencies

No npm packages are required. The project uses HTML, CSS, vanilla JavaScript, browser APIs, Google Fonts, and local Cradle UI helper files.
