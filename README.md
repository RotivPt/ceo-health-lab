# CEO Health Lab(TM)

**Founding Member #001 - Vitor Pereira**  
**Companion Member #001 - Claudia**

CEO Health Lab(TM) is a private health, performance, longevity and body recomposition operating system for two members.

This repository contains the internal MVP for collecting structured clinical, lifestyle, body composition and weekly check-in data.

## Product Principles

- Evidence first
- Simplicity over complexity
- Longitudinal history over isolated snapshots
- Clinical usefulness over feature bloat
- Private by default
- Built for real weekly use

## Sprint #3 Scope

The application is still intentionally simple and free to run locally:

- Static web app using HTML, CSS and JavaScript
- No framework
- No external dependencies
- Data stored in browser localStorage
- JSON copy and export for review
- Local data clearing with confirmation
- Firebase Hosting configuration with `public/` as the deployable folder
- Local history filters by member and entry type
- Individual entry deletion

Firebase, Firestore and Authentication are part of the product direction, but Auth and Firestore are not introduced in Sprint #3. The immediate goal is to keep the local MVP useful without paid platforms or extra dependencies.

## Current Structure

```text
/
+-- public/
|   +-- index.html
|   +-- styles.css
|   +-- script.js
+-- firebase.json
+-- README.md
+-- .gitignore
```

## Local Usage

Open `public/index.html` in a browser.

If Firebase CLI is available locally, preview the hosting build with:

```bash
firebase emulators:start --only hosting
```

Manual test checklist:

1. Create a health entry.
2. Reload the page and confirm the entry remains visible.
3. Copy JSON.
4. Export JSON.
5. Clear local data and confirm the dashboard resets.
6. Filter history by member and entry type.
7. Delete one individual entry.
8. Test on desktop and mobile widths.

## Privacy Note

This repository is private because it may eventually contain health-related structures and workflows. Real personal health data should not be committed to the repository.

Local browser data is still private-device data. Treat exported JSON files as sensitive health information.

## Deployment

The deployable app lives in `public/`.

No Firebase project ID is stored in this repository yet. Keep project-specific aliases local unless we decide to commit `.firebaserc`.

## Status

Sprint #3 - Local History Controls: implemented locally, pending validation.
