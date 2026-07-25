# File Difference Visualizer Architecture Documentation

## Overview

The File Difference Visualizer is a tool that allows developers to compare two text inputs or files and visually highlight additions, removals, and modifications. It supports:
- Side-by-side comparison mode with synchronized scrolling.
- Unified diff mode.
- Line-by-line highlighting with color indicators (green for additions, red for deletions, and yellow/blue for modifications).
- Drag-and-drop or file upload capabilities.

## Architecture

```text
┌─────────────────────────────┐      ┌─────────────────────────────┐
│       Original Text /       │      │       Modified Text /       │
│        File Input A         │      │        File Input B         │
└──────────────┬──────────────┘      └──────────────┬──────────────┘
               │                                    │
               └─────────────────┬──────────────────┘
                                 │
                                 ▼
                   ┌──────────────────────────┐
                   │   Myers' Diff Engine     │
                   │      (script.js)         │
                   └─────────────┬────────────┘
                                 │
                                 ▼
                   ┌──────────────────────────┐
                   │    Diff Output Model     │
                   └─────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                            ┌──────────────────┐
│  Side-by-Side    │                            │     Unified      │
│  Dual Pane view  │                            │   Single Pane    │
│  (Sync Scroll)   │                            │   Inline Diff    │
└──────────────────┘                            └──────────────────┘
```
