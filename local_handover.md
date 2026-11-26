---
environment: local
machine: Windows (DESKTOP-661R4KD)
last_session: 2026-11-26
sessions: 1
---

# local_handover — Windows session diary

Written only by the local (Windows) environment. Protocol: `ai_support.md` §0,
rules 11–16. Entries newest first.

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
