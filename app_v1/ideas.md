---
file: ideas.md
scope: app_v1
purpose: Parking lot for app ideas that are not being built yet
written_by: AI assistant
last_updated: 2026-11-26
---

# ideas.md — app_v1

Ideas only. **Nothing here is a decision.** Nothing gets built from this file
until it is promoted to `ai_support.md` (Sure_Point or Open Decision).

This file travels with `app_v1`. When `app_v2` starts, this log stays behind and
a fresh one is created — that is intentional, so each app version carries only
its own ideas.

Rules:

- One row per idea. Never delete a row; mark it `DROPPED` with a reason instead.
- `Stage` uses the project stages: 1 (owner build — Stage 1 and 2 merged),
  2 (real login), 3 (events), 4 (purchase store), `v2` (next app version).
- Keep the reasoning to one line. If it needs more, it is a decision, not an idea.

## Ideas

| ID | Idea | Why it matters | Stage | Logged |
|---|---|---|---|---|
| I-1 | All master images live in `c2_my_purchase_store` (now `store_photos`); the app decides free vs paid | One copy of each master; price/free status is data, not a file move | 4 | 2026-11-23 |
| I-2 | Publish script generates the photo list (`photos.json`) from the folders | Add photos without editing HTML; machines can rewrite data, not hand-made pages | v2 | 2026-11-23 |
| I-3 | Background/artwork images resized to ~1920 px wide, JPEG q80 | Blurred artwork hides compression; 2 MB per background is wasted download | 1 | 2026-11-23 |
| I-4 | Three sizes per photo: thumbnail (~400 px), display (~1600–1920 px), master (untouched) | Browser never loads a 100 MB file; only the download does | 1 | 2026-11-23 |
| I-5 | Add `serve.cmd` (local `python -m http.server`) when `photos.json` arrives | `.json` cannot be fetched from `file://`; needed only once there is data to load | 1 | 2026-11-23 |
| I-6 | Fixed-height frame with `object-fit: cover` for stacked photos | Mixed portrait/landscape images jump around when each keeps its own height | 1 | 2026-11-23 |
| I-7 | ~~Keep `storage_account` beside `main`, serve from `app_v1` (`/main/`)~~ — **DROPPED 2026-11-26**: storage is `..\Storage`, and Stage B's server writes by absolute path, so the root stays `main` | A local server cannot reach files above its root; siblings mirror the Azure split | 1 | 2026-11-24 |
| I-8 | Let the owner reorder categories (gear → Manage photos → sections) | Alphabetical is the default; personal order matters once there are many | 1 | 2026-11-26 |
| I-9 | Gear settings: choose the cover, the order and the page background | Settings need a file or a server to persist; browser storage is not enough | 1 | 2026-11-26 |
| I-10 | Make the search box actually search photo names | It is visual only today; searching needs the photo list first | 1 | 2026-11-26 |
| I-11 | Category page: photo grid + lightbox | A card is a menu; the photos need a page of their own | 1 | 2026-11-26 |
| I-12 | Prompt for a unique filename at upload | One folder per category; a duplicate name would overwrite silently | 1 | 2026-11-26 |

## Promoted

| Idea | Promoted to | Date |
|---|---|---|
| — | — | — |
