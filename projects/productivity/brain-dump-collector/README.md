# Brain Dump Collector

Brain Dump Collector is a small productivity mini project for capturing messy thoughts before they disappear. Paste one thought or many lines at once, and the app automatically groups each note into a category using lightweight keyword matching.

## Features

- Fast note capture with multiline input.
- Automatic grouping into Work, Study, Ideas, Personal, Health, Finance, Errands, or Later.
- Optional manual category override during capture.
- Search across note text, categories, and generated tags.
- Filter by category, open notes, done notes, or pinned notes.
- Pin, mark done, edit, and delete individual thoughts.
- Focus queue for the newest open thoughts.
- Category summary cards.
- Local persistence with `localStorage`.
- Export and import notes as JSON.

## How to Run

Open `index.html` directly in a browser, or run the repository with a local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/productivity/brain-dump-collector/
```

## Keyboard Shortcut

Use `Ctrl + Enter` or `Cmd + Enter` inside the text area to capture thoughts quickly.

## Dependencies

No external dependencies are required. The project uses HTML, CSS, vanilla JavaScript, and `localStorage`.
