# Website requirements — Daymark product homepage

Goal: a single-page product homepage for Daymark, live as the GitHub repo's landing page.
No template code is copied; the layout follows the DevAid theme's structure (hero → features
→ callout → contact) with our own CSS.

## Decisions settled (2026-10-04)

- **Location**: `website/` in this repo, deployed via **GitHub Pages** at
  `https://btafoya.github.io/Daymark/` (subpath — relative asset paths only, no leading `/`).
- **Stack**: one `index.html` + one CSS file + minimal JS. Vendored Bootstrap 5.3 CSS/JS,
  no build step, no CDN — same rule as the web UI.
- **Visual identity**: Daymark brand (logo, tokens modeled on the web UI's surface-var
  approach) with DevAid **theme-1's** teal/cyan accent on a light surface. Logo and
  screenshots copied from `assets/`.
- **License**: no 3rd Wave Media code or attribution — the theme is reference only.

## Sections

1. **Hero + CTA** — Daymark logo, tagline ("A standards-first, self-hosted calendar &
   contacts server"), primary buttons: GitHub repo + latest release.
2. **Feature grid** — the README's feature categories condensed: Standards (CalDAV/CardDAV/
   iCalendar), Data & storage, Auth, Collaboration, Automation, Developer platform.
3. **Screenshots** — subset of `assets/screenshots/*` (calendar, tasks, contacts, admin at
   minimum), lightboxed or grid.
4. **Install/download** — prebuilt binary tarball, `ghcr.io/btafoya/daymark`, systemd script;
   copy the README's three quick-start commands; link to Releases.
5. **Contact/footer** — GitHub issues (bugs + feature requests both), security disclosure
   link (`SECURITY.md`), MIT license note.

## Non-functional

- Fully responsive (Bootstrap grid), works without JS for content.
- Subpath-correct: every asset href relative (e.g. `./css/site.css`, `../assets/...` only if
  assets are copied into `website/` — they must be: Pages serves from `website/` or a branch,
  not repo root).
- No secrets, no external requests beyond self-hosted vendor files.
- Pages deployment: `website/` published from `main` via a small GitHub Actions workflow
  (upload-pages-artifact + deploy-pages), triggered on pushes touching `website/`.
- After deploy: set repo `homepageUrl` to the Pages URL.

## Open questions

- Exact accent hex for theme-1 teal: pick one matching DevAid theme-1's look (~teal/cyan on
  light gray); verify visually in the browser once built.
- Dark mode: ship light-only first (matches theme); the web UI's theme.js pattern is
  available if wanted later.