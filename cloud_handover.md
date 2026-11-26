# Cloud Handover — GitHub Codespaces

## 2026-11-26 — GitHub Codespaces (Linux) — Session 1

### Environment
- Working dir: `/workspaces/photography_app` (Linux Codespace). Repo root is the anchor; machine paths before the root are notes only.
- Local machine is Windows at `C:\Stagging\AZ104_free_sub_project\Photography_app`.
- `local_handover.md` read: empty (no local session history yet).
- No browser/UI testing in Codespace; testing deferred to the local Windows machine.
- `serve.ps1` / `serve.cmd` not used here (Windows-only); owner plans to gitignore them later.
- Python 3 and Node available for static checks.

### Development changes (uncommitted)
- **Created** `app_v1/main/data/users_gallery.json` — per-user gallery metadata:
  `users.786.firstName = "Ashar"`, 8 categories (`abstract`, `birds_animals`,
  `landscape`, `life_style`, `micro_lense`, `portraits`, `sky`, `travel`),
  each with `photos: []` and `cover: null`.
- **Modified** `app_v1/main/my_gallery.html` — body `data-page="inner"` → `data-page="my-gallery"`.
- **Modified** `app_v1/main/js/app.js`:
  - added `loadJson()` helper;
  - loads `users_gallery.json` only on `my-gallery`;
  - builds toolbar: `Ashar · 786` (left), search input (~50%, centre), `+` and `⚙`
    buttons (visual only, no handlers);
  - builds category cards only where `photos.length > 0` (dormant today);
  - all image paths via `imageUrl()`; no fetch/path building in HTML (SP-18).
- **Modified** `app_v1/main/css/site.css`:
  - toolbar is non-sticky and scrolls under the sticky header;
  - category cards: 24vh height (same as homepage buttons), ~two-button width,
    alternating ±4% zigzag, odd = name left/art right, even = art left/name right,
    half art / half frosted translucent text (text sharp);
  - hover = 2px accent ring + tiny scale 1.015 + stronger frost;
  - mobile <700px: full-bleed art + text overlay, 120px, no zigzag, toolbar wraps;
  - white page background.
- **No files deleted.**
- **No changes** to `site.json`, serve scripts, backend, other pages, or Azure.

### Decisions / conclusions
- My Gallery has a separate title bar and search/toolbar; toolbar scrolls behind the header.
- **Strict rendering:** only categories with ≥1 photo render; no placeholder/demo cards.
  Card layout will be visually confirmed only after upload exists and a real photo is added.
- Keep all **8 categories** for now; add more later based on user feedback.
- **No drag reorder.** Default alphabetical; user sorting later via
  gear → Manage photos → category sections.
- **Album art:** first upload auto-becomes the cover; locked with 1 photo; user picks
  once there are 2+. Store only a reference, never duplicate image files.
- **Display name:** `firstName` in `users_gallery.json`; `currentUser` stays in
  `site.json`; header shows `Firstname · 786`.
- Default My Gallery background = **white** for now.
- Search will be full-photo search later; category filtering via cards is enough.
  Photo-name uniqueness per single user is intended.
- Gear/settings menu contents deferred.
- Category-card navigation to a new category page deferred; whole card is a button
  with no handler for now.
- Mobile: no separate site; card becomes full-bleed art + text overlay.
- Persistence of settings (order, cover, background) deferred; will need a file/server,
  not only browser storage.

### New ideas / requirements
- **Implemented:** toolbar, strict empty-category rendering, dormant card renderer/CSS.
- **Approved-pending:** none.
- **Proposed/deferred:** category reorder UI; gear settings (cover, order, background);
  working search; category page + photo grid/lightbox; upload (`+`) flow; album-art
  picker; unique filenames; upload rules (OD-C7); image processing (OD-P);
  real login (OD-I); records (OD-R).

### Problems / pending work
- Stage B upload server (`server.py`, `/api/upload`, `/api/photos`, `/media`) not built;
  cards cannot appear until photos exist.
- Category-card visuals are unverified (no browser testing in Codespace); confirm at home.
- `users_gallery.json` `photos` / `cover` shape is provisional; Stage B will define how
  photo entries are written.
- `cover` reference scheme (storage path vs `/media`) not finalized; no impact yet.
- `serve.ps1` / `serve.cmd` are Windows-only; planned gitignore in Codespace not done.
- `AI_Support.md` was **not** modified this session; the new My Gallery decisions above
  are not yet promoted to Sure_Points / Open Decisions.

### Environment changes
- No dependency/config changes.
- Validation only: `node --check app_v1/main/js/app.js` passed; JSON validated;
  `my_gallery.html`, `data/users_gallery.json`, `js/app.js`, `css/site.css`
  all served `200` via `python3 -m http.server`.

### Git
- Branch: `main`
- Latest commit: `a76c6f3` ("add navigation buttons to the homepage"),
  2026-11-25 13:35:34 +0530
- Remote: `origin` https://github.com/asharfarid/photography_app
- Ahead/behind `origin/main`: 0 / 0 at session start
- Working tree: **uncommitted** (3 modified, 2 new files; handover files untracked)
- Not committed, not pushed.

### Next steps
1. At home: pull, then implement Stage B upload server; add a real photo to verify
   My Gallery cards/layout.
2. Confirm toolbar/card visuals on Windows browser (Ctrl+F5).
3. Decide persistence for order/cover/background before building gear settings.
4. Build category page + grid/lightbox after upload works.
5. Optionally gitignore Windows-only serve scripts for the Codespace workflow.
