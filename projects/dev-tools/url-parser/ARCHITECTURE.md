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
┌─────────────────────────────┐
│     Result Interface        │
│  Edit + Copy Components     │
└─────────────────────────────┘
```
