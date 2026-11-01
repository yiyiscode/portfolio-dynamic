# portfolio-dynamic

Scroll-driven ASCII portfolio (Vite + React + Tailwind). Dynamic companion to the static site at
https://yiyiscode.github.io/.

- App: `dynamic/`. Copy comes from `assets/data.js` (read-only at build time by `dynamic/scripts/sync-data.mjs`);
  screenshots from `assets/img/`. `assets/` is a snapshot of the static site's files.
- Dev: `cd dynamic && npm ci && npm run dev` (Node 24).
- Build: `npm run build` -> `dynamic/dist`.
- Third-party code and licenses: `dynamic/THIRD_PARTY_NOTICES.md`.
