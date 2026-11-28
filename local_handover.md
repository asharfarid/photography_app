---
environment: local
machine: Windows (DESKTOP-661R4KD)
last_session: 2026-11-28
sessions: 3
---

# local_handover — Windows session diary

Written only by the local (Windows) environment. Protocol: `ai_support.md` §0,
rules 11–16. Entries newest first.

## 2026-11-28 04:06 UTC — local — session 3

### Session
- Branch `main`, started at `0961c04`, 0 ahead / 0 behind `origin/main`; tree clean.
- Goal: build delete → 48-hour retention → restore, plus the description field,
  header location title, per-user data move, and a single launcher.

### Start here
- Everything works locally: run `serve.cmd` at the repo root, open
  `http://localhost:8000`, then `My Gallery`.
- Nothing is committed — all of this session is uncommitted on disk.
- The four real photos are back in place; `Storage\Retention` is empty.

### Changes
- Per-user data moved: `Storage\public_photos\786\gallery.json`, created by the
  server on first use; nothing per-user remains in `app_v1/main/data`.
- Deleted: `app_v1/main/data/users_gallery.json`, `serve.ps1`.
- `serve.cmd`: now standalone — checks/installs requirements, prints the URL,
  opens the browser, runs `server.py`.
- `app_v1/storage.py`: `trash`, `list_trash`, `restore`, `purge_trash`,
  `gallery.json` read/write; `Retention` added to the container list; `delete`
  kept for purge only.
- `app_v1/server.py`: `/api/delete`, `/api/trash`, `/api/restore`, `/trash-media`;
  48 h enforced at read time; cover cleared on delete; description accepted and
  returned; gallery data served from storage.
- `app_v1/main/js/app.js`: bin + tick boxes + Select all + Delete bar + confirm;
  restore tray and pre-filled restore form; description field and lightbox line;
  header location title.
- `app_v1/main/css/site.css`: delete bar, selection, trash tray, description,
  header title (hidden under 900 px), toasts.

### Decisions
- Retention folder name is `Retention`, not `_trash` → §2 SP-26 (revised).
- Restore keeps the original id and rewrites the category → §2 SP-28 (revised).
- Per-user data lives in storage, not the site folder → §2 SP-32.
- One launcher only, `serve.cmd` → §2 SP-33.
- Corrupt or missing `deleted.json` counts as expired — never offered.
- Description is rendered as text, never HTML.

### Verified end to end
- Upload with description → delete → folder moved to `Retention`, cover cleared,
  `/api/photos` and `/api/trash` both correct.
- Trash thumbnail served; `photo.json` refused over `/trash-media`.
- Restore into a different category under a new name, same id; cover set because
  the category was empty.
- Name clash on restore → 409 with the same message as upload.
- Stamp moved back 49 h → `/api/trash` empty, restore → 410.
- Purge removed the expired folder.
- UI: bin only inside a category, bar pale → solid, confirm text, "1 deleted"
  toast, bulk "2 deleted", empty Sky card disappeared, bin hidden in My Gallery.
- Header title "My Gallery" / "Sky", hidden at 700 px.

### Open / unverified
- Phone/hotspot test still not run (`NA-24`).
- Download name still lacks an extension (`NA-25`).
- RAW upload still untested (`NA-22`).
- `TRASH_PURGE=azure` path not written yet (only `app`).

### Next steps
1. Owner tests the five points and scores it out of 5.
2. Fix the download filename (`NA-25`).
3. Test from the phone (`NA-24`).

### Git
- Session start: `0961c04` on main, 0 ahead / 0 behind origin.
- Work at close: 7 modified, 2 deleted — left uncommitted for the owner.
- Commit/push: none by the AI.

## 2026-11-27 — local — session 2

### Session
- Branch `main`, started at `28c84a7`, 0 ahead / 0 behind `origin/main`; tree clean.
- Goal: build Stage B — a local upload server, so one real photo can be uploaded.

### Start here
- Stage B works: run `serve.cmd` at the repo root, open `http://localhost:8000`.
- `app_v1` is exactly what deploys; the two launchers sit one level above it.
- Nothing is committed — all Stage B work is uncommitted on disk.

### Changes
- New: `app_v1/server.py`, `app_v1/storage.py`, `app_v1/requirements.txt`.
- Modified: `app_v1/main/js/app.js`, `app_v1/main/css/site.css`,
  `app_v1/main/data/users_gallery.json` (`photos[]` removed), `.gitignore`.
- Moved: `app_v1/serve.cmd`, `app_v1/serve.ps1` → repo root.
- Deleted: `app_v1/__pycache__` (scratch, regenerates).

### Decisions
- One folder per photo, id-named, `photo.json` written last → §2 SP-19.
- Three copies per photo: thumb / display / original → §2 SP-20.
- Copies made server-side at upload; failure keeps the photo → §2 SP-21.
- GPS stripped from all copies; camera settings kept → §2 SP-22.
- 500 MB / ~200 MP; JPEG/PNG/WebP/HEIC/TIFF/RAW, content-sniffed → §2 SP-23.
- Owner resolved server-side; paths confined → §2 SP-24.
- `app_v1` is the deployable root; launchers above it → §2 SP-25.
- `OD-C6` decided, `OD-C7` partly → §3.2.

### Ideas parked
- None new; `I-4`, `I-5`, `I-11`, `I-12` promoted.

### Open / unverified
- RAW upload path never run — no RAW file available (`NA-22`).
- GPS stripped from JPEG originals only; HEIC/TIFF/WebP keep metadata (`NA-19`).
- Delete/rename and the cover picker not built (`NA-20`, `NA-21`).
- Download name has no extension and is not sanitised (`NA-25`).
- Never opened from a phone; hotspot steps written but untested (`NA-24`).

### Next steps
1. Upload one real photo from the laptop; check card, grid, lightbox, download.
2. Test from the phone: `HOST=0.0.0.0` plus a temporary firewall rule (`NA-24`).
3. Fix the download filename (`NA-25`).
4. Plan delete plus cover reassignment (`NA-20`).

### Git
- Session start: `28c84a7` on main, 0 ahead / 0 behind origin.
- Work at close: 6 modified, 3 new, 2 moved — left uncommitted for the owner.
- Commit/push: none by the AI.

## 2026-11-26 — local — session 1

### Session
- Branch `main`, started at `b663909`, in sync with `origin/main`.
- Goal: verify the pull from Codespaces, then design the cross-environment protocol.

### Start here
- The site works locally as of `b663909`; no code is half-finished.
- Stage B (upload server) is **not started**; its design is `ai_support.md` §11.
- Before writing `server.py`, settle NA-17: is `photos[]` strings or objects?

### Changes
- Renamed `AI_Support.md` → `ai_support.md` (case-only; older notes may still use
  the old name — it is this file).
- `ai_support.md`: §0 rules 11–16, §0.1 checklist, §0.2 headings; §8 file map,
  remote and two git identities; §9 Sessions 9–10; §10 NA-17/NA-18; §11
  folder-is-truth; §13 changelog.
- `app_v1/ideas.md`: `I-7` marked DROPPED, `I-8…I-12` added, reference updated.
- `local_handover.md`: filled in (it was an empty tracked file).

### Decisions
- Two keywords, `git start` and `git end`; the environment is detected, never
  typed → §0 rule 11.
- The owner does every `git pull` and `git push`; `git start` reads only and
  `git end` writes only → §0 rules 12–13.
- Eight handover headings, five-line front matter, newest first, 60-line cap,
  three-line Git section → §0 rules 14–15 and §0.2.
- Push after `git end`; code, memory and handover in one commit → §8.
- `AGENTS.md` declined; four collaboration files only → §9 Session 10.
- The folder is the truth, the JSON is the preferences → §11.

### Ideas parked
- `I-8`, `I-9`, `I-10`, `I-11`, `I-12` (raised in the Codespaces session).

### Open / unverified
- Category-card layout has never been seen in a browser — every category is empty,
  so no card renders. Needs one real photo, which needs Stage B.
- `imageUrl(cover)` breaks if `photos[]` holds objects instead of strings (NA-17).
- The `+` and `⚙` toolbar buttons do nothing (NA-18).
- The 4 photos lost on 2026-11-25 were not recovered.

### Next steps
1. Answer NA-17 (photo record shape), then build Stage B (`server.py`).
2. Create the three containers and move to `public_photos\786\<category>\` (NA-16).
3. Upload one real photo and confirm the card layout in a browser.
4. Wire or disable the two toolbar buttons (NA-18).

### Git
- Session start: `b663909` on main, in sync with origin.
- Work at close: 3 modified — `ai_support.md` (renamed + edited), `app_v1/ideas.md`,
  `local_handover.md` — left uncommitted for the owner.
- Commit/push: none by the AI.
