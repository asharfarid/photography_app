---
file: ideas.md
scope: app_v1
purpose: Parking lot for app ideas that are not being built yet
written_by: AI assistant
last_updated: 2026-11-23
---

# ideas.md — app_v1

Ideas only. **Nothing here is a decision.** Nothing gets built from this file
until it is promoted to `AI_Support.md` (Sure_Point or Open Decision).

This file travels with `app_v1`. When `app_v2` starts, this log stays behind and
a fresh one is created — that is intentional, so each app version carries only
its own ideas.

Rules:

- One row per idea. Never delete a row; mark it `DROPPED` with a reason instead.
- `Stage` uses the project stages: 1 (read-only gallery), 2 (members),
  3 (events), 4 (purchase store), `v2` (next app version).
- Keep the reasoning to one line. If it needs more, it is a decision, not an idea.

## Ideas

| ID | Idea | Why it matters | Stage | Logged |
|---|---|---|---|---|
| I-1 | All master images live in `c2_my_purchase_store`; the app decides free vs paid | One copy of each master; price/free status is data, not a file move | 4 | 2026-11-23 |
| I-2 | Publish script generates the photo list (`photos.json`) from the folders | Add photos without editing HTML; machines can rewrite data, not hand-made pages | v2 | 2026-11-23 |
| I-3 | Background/artwork images resized to ~1920 px wide, JPEG q80 | Blurred artwork hides compression; 2 MB per background is wasted download | 1 | 2026-11-23 |
| I-4 | Three sizes per photo: thumbnail (~400 px), display (~1600–1920 px), master (untouched) | Browser never loads a 100 MB file; only the download does | 1 | 2026-11-23 |
| I-5 | Add `serve.cmd` (local `python -m http.server`) when `photos.json` arrives | `.json` cannot be fetched from `file://`; needed only once there is data to load | 1 | 2026-11-23 |
| I-6 | Fixed-height frame with `object-fit: cover` for stacked photos | Mixed portrait/landscape images jump around when each keeps its own height | 1 | 2026-11-23 |

## Promoted

| Idea | Promoted to | Date |
|---|---|---|
| — | — | — |
