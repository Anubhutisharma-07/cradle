# Regular Expression (RegEx) Visualizer & Tester Architecture

## Overview

The RegEx Visualizer & Tester is an interactive developer tool designed to test, debug, and explain regular expressions in real-time. It parses the regular expression, explains its components, runs it against user-provided test strings, and renders highlighted matches and capture groups dynamically.

## Architecture

```text
┌─────────────────────────────────┐
│     User Regex & Flags Input    │
└────────────────┬────────────────┘
                 │
                 ▼
 ┌───────────────────────────────┐
 │   Regex Visualizer Engine     │
 │         (script.js)           │
 └──────┬─────────────────┬──────┘
        │                 │
        ▼                 ▼
 ┌──────────────┐  ┌──────────────┐
 │ Pattern      │  │ Matcher &    │
 │ Explainer    │  │ Highlighter  │
 └──────┬───────┘  └──────┬───────┘
        │                 │
        ▼                 ▼
 ┌──────────────┐  ┌──────────────┐
 │ Human        │  │ Dynamic HTML │
 │ Readable     │  │ Highlighted  │
 │ Breakdown    │  │ Overlay      │
 └──────────────┘  └──────────────┘
```
