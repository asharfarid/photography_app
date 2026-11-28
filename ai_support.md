---
project: Photography_app
file: ai_support.md
purpose: Persistent memory + decision log for AI assistant sessions
schema_version: 2
written_by: AI assistant (sole writer)
last_updated: 2026-11-28
repo_root: C:\Stagging\AZ104_free_sub_project\Photography_app
---

# ai_support

Single source of truth for context that must survive a new chat, a different model,
an OpenCode reinstall, or a restored disk. Optimized for machine re-hydration.

---

## 0. How to use this file (instructions for future AI sessions)

1. Read §0–§3 before answering anything. Do not assume prior context exists.
2. **§2 Sure_Points are locked.** Never re-litigate or silently change them. A
   decision that is reversed is marked **RETIRED** with a date and reason — never
   deleted. New certainties get the next free `SP-n`.
3. §3 is grouped by service type (`OD-H`, `OD-I`, …). Move an item to DECIDED only
   when the owner explicitly says so, and record why.
4. Append to §9; never rewrite, reorder, compress or delete past entries. The owner
   approves any cut, after review.
5. Preserve IDs. Grouped IDs (`OD-H`, `OD-C1`) are allowed; never renumber.
6. Update `last_updated` in the front matter on every write.
7. Modify only the repo and the storage mirror (`..\Storage`). Never touch global
   git config or anything else outside these unless explicitly asked.
8. Commit at **milestones only** — not every experiment.
9. **No automatic compression, ever.** If this file grows large, report the size and
   propose a cut list; nothing is cut until the owner approves. Never delete SPs.
10. **Plain language, always (SP-11).** Owner is an Azure admin, not a developer.
    Define any unavoidable term in one line.
11. **Two environments share this repo — detect, never ask.** Windows (`win32`,
    a `C:\` path, `$env:OS = Windows_NT`) owns `local_handover.md`; Linux under
    `/workspaces` (`uname -s`) owns `cloud_handover.md`. Anything else: ask once,
    then record it in that handover's header. Read the **other** environment's
    handover at the start of every session; write only your own, never the other.
12. **`git start` — read-only.** Read §0–§3, both handover headers and the other
    handover's newest entry. Capture `git rev-parse --short HEAD` and the
    ahead/behind count for the close-out. Report exactly four lines: me · other ·
    who worked last · open items. Write nothing — the owner runs `git pull` and
    `git push` himself, before and after the session.
13. **`git end` — the close-out.** Run §0.1 in order. Writes files. **Never
    commits or pushes** — the owner does that after reviewing.
14. **Decisions live here; session detail lives in the handovers.** A handover
    decision is one line **plus a pointer** ("→ §2 SP-19"). No pointer, not a
    decision.
15. **Handover format.** Five-line front matter (`environment`, `machine`,
    `last_session`, `sessions`); entries **newest first**; the eight headings in
    §0.2; ≤60 lines per entry (a writing limit, never retroactive). Entry titles
    carry **date + time in UTC**: `## YYYY-MM-DD HH:MM UTC — <environment> —
    session <n>`. `sessions` counts entries, so a second `git end` on the same day
    is a **new entry**, never a rewrite. **Past entries are never edited,
    compressed or deleted**; the owner approves any cut. The Git section is always
    three lines and describes the **start**, never the end. A file with no front
    matter (an older handover) is read by the date and time in its newest title.
16. **A stale handover is normal.** An older date means that environment has not
    been used since. Never write to it, never "complete" it, never report it as
    a problem.
17. **Memory updates happen at the start of any build-mode session**, not only
    at `git end` (owner, 2026-11-27). `git end` stays the close-out; a decision
    must never wait for it.

### 0.1 `git end` checklist (run in order)

1. Detect the environment (rule 11). If the two checks disagree, **stop and ask**.
2. Read the other environment's newest entry.
3. Promote every decision here: §2 (new SP), §3 (status), §4/§5/§8 if structure
   moved; update `last_updated`.
4. Park undecided ideas in `app_v1/ideas.md` (next free `I-n`); mark promoted ones.
5. Append the session to §9.
6. Update §10 and §13.
7. Write your handover entry (newest first, date + time in UTC) and bump
   `last_session`, `sessions`. Every run is a new entry; never edit an old one.
8. Self-check and print: headings 8/8 · every decision has a pointer · Git 3
   lines · files written · files untouched.
9. Report what was recorded and what could not be verified.
10. Do not commit, do not push.

### 0.2 Handover headings — exactly these eight, in this order

Entry title: `## YYYY-MM-DD HH:MM UTC — <environment> — session <n>` (UTC so both
machines compare cleanly; a second run on the same day is a new entry).

| Heading | Its only job |
|---|---|
| `Session` | branch, start commit, one-line goal (no date — the entry title has it) |
| `Start here` | max 3 bullets: what the next session needs if it reads nothing else |
| `Changes` | files created / modified / deleted — on disk, not why |
| `Decisions` | one line each, always with a pointer into this file |
| `Ideas parked` | IDs only (`I-8`, `I-9`) |
| `Open / unverified` | blockers, owner answers needed, what could not be tested |
| `Next steps` | three to five, ordered |
| `Git` | `Session start: <hash> on main, <n> ahead / <n> behind origin` · `Work at close: <n> modified, <n> new — left uncommitted for the owner` · `Commit/push: none by the AI` |

---

## 1. Project snapshot

| Field | Value |
|---|---|
| Goal | Publicly reachable, HTTPS **photo community** on Azure: owner's gallery first |
| Product model | "A shop": shop floor = the app; warehouse = one storage account |
| Current stage | **Stage 1 + Stage 2 merged** (SP-10): owner-only build, identity faked as `786` (SP-16). Four sections — My Gallery, Public Gallery, My Store, Events. **Stage B (upload) works locally** since 2026-11-27 |
| Later stages | Real login for other users; Stage 3 events/contests with voting |
| Owner intent | Learning-first for an **AZ-104 / cloud admin interview**, not just shipping |
| Subscription | Free/student; will convert the **same** subscription to pay-as-you-go |
| Cost rule | Least monthly cost wins; each service reviewed before finalizing (SP-12) |
| Audience | ~**20 known visitors per month** at launch, shared link only |
| Domain | **None purchased** — Azure-provided hostnames only (SP-2) |
| Media home | **One** storage account for all photos and derivatives (SP-1) |
| Hosting | **OPEN** — hands-on bake-off across candidates (`OD-H`) |
| Reference sites | anseladams.com, jimmychin.com, artwolfe.com (look), gurushots.com (events) |
| Working dir | `C:\Stagging\AZ104_free_sub_project\Photography_app` (Windows, pwsh, git 2.54) |
| App root | `app_v1\main` = the whole site (HTML/CSS/JS/JSON/artwork) |
| Storage mirror | `C:\Stagging\AZ104_free_sub_project\Storage` — **outside the repo, outside every app version** (SP-15). Empty today; 3 containers agreed |
| Local run | `serve.cmd` at the repo root → `http://localhost:8000`, installs requirements once and runs `app_v1\server.py` — read, upload, delete, restore (`/api/upload`, `/api/photos`, `/api/delete`, `/api/trash`, `/api/restore`, `/media`, `/trash-media`) |

Non-goals near term: custom domain, microservices, native mobile app, payments,
SEO/marketing, multi-region.

---

## 2. Sure_Points (LOCKED — append-only; retired items stay visible)

| ID | Decision | State | Date |
|---|---|---|---|
| SP-1 | **All photo/media assets** — originals, viewing sizes, thumbnails, member uploads, contest entries — live in **one storage account** | ACTIVE | 2026-11-22 |
| SP-2 | **No domain purchase**; use Azure default HTTPS hostname | ACTIVE | 2026-11-05 |
| SP-3 | ~~Hosting = Storage static website~~ | **RETIRED** 2026-11-22 — hosting is not locked; see `OD-H` | 2026-11-08 |
| SP-4 | ~~Running cost ceiling ₹10–50/month~~ | **RETIRED** 2026-11-22 — no fixed ceiling; replaced by SP-12 | 2026-11-08 |
| SP-5 | **Full 3-tier VM lab**, built and torn down repeatedly, for architect-level learning | ACTIVE | 2026-11-08 |
| SP-6 | **IaC on hold**; small per-lab templates only later, as DevOps/Terraform learning | ACTIVE | 2026-11-08 |
| SP-7 | **One app (monolith) + separate storage.** The app never stores photos on its own disk | ACTIVE | 2026-11-19 |
| SP-8 | **Data areas, revised 2026-11-25** — was "owner photos / member photos / app records". Now split by **purpose**: `public_photos`, `store_photos`, `event_photos` (SP-17); app records still undecided (`OD-R`) | ACTIVE (revised) | 2026-11-19 |
| SP-9 | **Hosting service NOT locked.** Hands-on bake-off; instinct decides | ACTIVE | 2026-11-19 |
| SP-10 | **Staged product, revised 2026-11-25: Stage 1 and Stage 2 are merged.** Build the site once for "a signed-in user"; identity is faked today (SP-16) and real login is added later without rebuilding pages. Stage 3 (events) stays separate | ACTIVE (revised) | 2026-11-19 |
| SP-11 | **Plain language only**; define any unavoidable term in one line | ACTIVE | 2026-11-19 |
| SP-12 | **Least monthly cost is the standing rule.** No fixed ceiling; every service's cost is reviewed before finalizing | ACTIVE | 2026-11-22 |
| SP-13 | **Stage 1 front end is hand-written HTML/CSS/JS.** No React/Next.js in Stage 1; revisit only if Stage 2 needs it | ACTIVE | 2026-11-23 |
| SP-14 | **App data files are `.json`.** They need a local web server (`file://` blocks reads); `serve.cmd` on port 8000 | ACTIVE | 2026-11-23 |
| SP-15 | **The storage mirror lives outside the repo and outside every app version** — `C:\Stagging\AZ104_free_sub_project\Storage` (renamed from `storage_account` 2026-11-25) | ACTIVE | 2026-11-24 |
| SP-16 | **Single-user mode.** One value, `currentUser` in `site.json`, answers "who am I?" for every page through `getCurrentUser()`. No password, no fake login screen. When real login arrives, only that function changes | ACTIVE | 2026-11-25 |
| SP-17 | **Containers are by purpose, not by person**: `public_photos`, `store_photos`, `event_photos`. A user is a **folder** named by their numeric ID (`786`); a new user needs no provisioning | ACTIVE | 2026-11-25 |
| SP-18 | **No page writes a storage path.** One function builds it (`photoUrl` / `savePhoto`); pages ask, never assemble. All data access goes through `app.js` — no page calls `fetch()` itself | ACTIVE | 2026-11-25 |
| SP-19 | **One folder per photo.** The folder name is a server-generated id (`YYYYMMDD-HHMMSS-xxxx`); the user types only a **display name**, unique per user, case-insensitive. `photo.json` inside the folder holds name/facts and is written **last** — its presence means "upload finished". `photos[]` in `users_gallery.json` is retired | ACTIVE | 2026-11-27 |
| SP-20 | **Three copies per photo:** `thumb.webp` (~400 px), `display.webp` (~1600 px), `original.<ext>` (full resolution, download only). Reason is **viewing speed / mobile data, not disk space** — the two derived copies add ~1% to storage | ACTIVE | 2026-11-27 |
| SP-21 | **The server makes the copies inside the upload request** (Pillow, pillow-heif, rawpy). Installed **once per machine/deployment** from `requirements.txt`; never per upload, never on the visitor's device. A copy failure never rejects the photo — the card shows a placeholder | ACTIVE | 2026-11-27 |
| SP-22 | **GPS is stripped from all three copies**; camera settings (aperture, shutter, ISO, lens, focal) are copied into `photo.json` for display. JPEG originals are stripped losslessly; other originals keep their metadata for now (`NA-19`) | ACTIVE | 2026-11-27 |
| SP-23 | **Upload limits:** 500 MB, ~200 MP, formats **JPEG/PNG/WebP/HEIC/TIFF/RAW**. PDF and SVG are rejected. Validation reads the file's bytes, never the extension | ACTIVE | 2026-11-27 |
| SP-24 | **The server resolves the owner**; a client-sent id is ignored. Ids and paths are pattern-checked and confined to the storage root. `store_photos` is readable only by its owner once auth exists | ACTIVE | 2026-11-27 |
| SP-25 | **`app_v1` is the deployable root:** `server.py`, `storage.py`, `requirements.txt`, `main\`. `HOST`/`PORT`/`STORAGE_ROOT` come from the environment; `serve.cmd` sits **one level above** (repo root) and never deploys | ACTIVE (revised 2026-11-28) | 2026-11-27 |
| SP-26 | **Deleted photos go to a private retention area for 48 hours.** The folder moves to `Retention\<owner>\<category>\<id>\` with a `deleted.json` holding `deleted_at` (UTC); the category stays in the path so the folder survives a corrupt `photo.json`. The 48-hour rule is enforced **by that timestamp at read time**, not by a scheduled job: at 48 h the photo is gone to the app, exact to the second. Removing the bytes is housekeeping (`purge_trash`), selected by `TRASH_PURGE=app\|azure`; in Azure a lifecycle rule on `Retention/` may do it. Retention is invisible in counts, cards, search, cover and `/media` | ACTIVE (revised 2026-11-28) | 2026-11-27 |
| SP-27 | **Delete UI lives only inside a category** — never on My Gallery; categories are not deletable. Tick boxes + Select all; a pale-red **Delete** button sits below the toolbar under the bin/`+` pair and turns solid red once ≥1 photo is ticked; confirming shows a popup with the count and the 48-hour disclaimer; the result reads "3 deleted / 1 failed", and a failed photo stays in the grid to retry | ACTIVE | 2026-11-27 |
| SP-28 | **Restore is the second item in the `+` menu** ("Upload from device" / "Restore deleted photos"). The tray lists deleted photos newest first with thumbnail, name and hours left. Restoring opens the **upload form pre-filled** (name, description, category all editable); a taken name shows the same inline error as a fresh upload; the photo returns to the chosen category and becomes its cover if that category was empty. The **original id is kept**, and the chosen category is written back into `photo.json` | ACTIVE (revised 2026-11-28) | 2026-11-27 |
| SP-29 | **Upload has an optional Description** — max 300 characters, stored in `photo.json`, shown under the camera details in the lightbox | ACTIVE | 2026-11-27 |
| SP-30 | **A cover is never empty while photos exist:** deleting the cover auto-reassigns to another photo; an empty category card disappears (already the render rule). The manual cover picker stays deferred (`NA-21`) | ACTIVE | 2026-11-27 |
| SP-31 | **The site header shows where you are**, as non-clickable text in the centre: "My Gallery", or the category label ("Landscape"). It is hidden on narrow phones if it cannot fit; the site name stays left and the nav right | ACTIVE | 2026-11-27 |
| SP-32 | **Per-user data lives in storage, not in the site folder.** `Storage\public_photos\<owner>\gallery.json` holds `firstName`, `categories` and `cover`; the browser gets it from `/api/photos`, never as a static file. `main\data\site.json` keeps site-wide settings only | ACTIVE | 2026-11-28 |
| SP-33 | **One launcher: `serve.cmd` at the repo root.** It installs requirements once, opens the browser and starts `server.py` itself; `serve.ps1` is deleted. No launcher file is ever deployed | ACTIVE | 2026-11-28 |

Derived constraints (consequences, not new decisions):

- Storage account: **Standard GPv2, LRS, hierarchical namespace OFF** if static
  website is used.
- No Azure DNS zone, no certificate purchase, no custom-domain binding.
- Monolith: whatever host is chosen must run **one app**, not many services.
- Photo files never sit on app storage; the app holds code and settings only.
- Every lab is **delete-by-default** (auto-shutdown for VMs).
- Git: commit at **milestones only**.
- A user is a **folder inside a purpose container**, never a container of its own.
- **Static website hosting cannot accept an upload or log anyone in.** Stage B
  (uploads) has landed locally (2026-11-27), so `OD-H` now excludes Storage
  static website.

---

## 3. Open decisions (grouped by service type)

### 3.1 Service groups — what we rent

| ID | Service type | Candidates | Status | Notes |
|---|---|---|---|---|
| `OD-H` | **Hosting** (where pages/app run) | Storage static website, App Service, Static Web Apps, Container Apps, VMs, Functions | OPEN | hands-on bake-off; cheapest that works; no default. Static website drops out once uploads exist |
| `OD-I` | **Identity** (login) | Entra External ID, own sign-up, social login | OPEN | real login only when a second user exists |
| `OD-R` | **Records** (database) | Table Storage (same account), Azure SQL free offer, Cosmos free tier, plain file | OPEN | Stage 2; prefer living inside the storage account to honour SP-1 |
| `OD-P` | **Image processing** (resize/thumbnails) | Local script, Functions, Container Apps job | OPEN | local script first |
| `OD-D` | **Delivery** (speed/abuse) | None, Front Door, CDN | OPEN | none initially |
| `OD-M` | **Monitoring & cost** | Budget alerts, Azure Monitor, Log Analytics | OPEN | budget alerts minimum |
| `OD-E` | **Email/contact** | None, Logic Apps, third-party form | OPEN | none initially |

### 3.2 Configuration decisions — settings, not services

| ID | Decision | Status | Notes |
|---|---|---|---|
| `OD-C1` | Azure region | OPEN | `centralindia` / `southeastasia` / `eastus`; cheapest sensible |
| `OD-C2` | Naming prefix + tags | OPEN | e.g. `ashphoto`; tags `env`, `owner`, `purpose` |
| `OD-C3` | Look and feel | OPEN | big single photo, simple menu, work grouped in collections |
| `OD-C4` | Original tier | OPEN | Cool likely; Archive needs long retention |
| `OD-C5` | Off-machine backup | OPEN (partly met) | `origin` = GitHub added 2026-11-25, so an off-machine copy exists; privacy/retention not formally decided. Local `.git` alone is not a backup |
| `OD-C6` | Image sizes | **DECIDED 2026-11-27** | thumbnail ~400 px, display ~1600 px, original full resolution; both derived copies WebP |
| `OD-C7` | Member upload rules | **PARTLY DECIDED 2026-11-27** | 500 MB, ~200 MP, JPEG/PNG/WebP/HEIC/TIFF/RAW, PDF/SVG blocked, content sniffing. Quotas (~100–200 photos), moderation and per-user limits still open |
| `OD-C8` | IaC timing/style, when SP-6 lifts | OPEN | subscription-scope template vs Bicep |
| `OD-C9` | Image layout + URL paths | **DECIDED 2026-11-25** | relative paths only; **lowercase, no spaces; hyphens or underscores both allowed — be consistent within a folder**. Underscores are legal in URLs, blob names and resource names; "hyphens only" was style, not a constraint. Containers use underscores (`public_photos`) |

Old flat IDs `OD-1…OD-17` were folded into these groups on 2026-11-22.

### 3.3 Rejected options (do not re-suggest without new evidence)

| Option | Why rejected | Date |
|---|---|---|
| WordPress (both .com and self-hosted) | Large attack surface, plugin patching, ~₹2,000+/mo; free .com plan can't do members/contests | 2026-11-23 |
| Wix / Squarespace | Not Azure; monthly cost; limited control | 2026-11-23 |
| Microservices | One-person project; adds cost and failure points (SP-7) | 2026-11-19 |
| Next.js server (Node on server in Stage 1) | Extra machinery, no Stage 1 benefit | 2026-11-23 |
| One storage container per user | N users = N copies of every rule (access, lifecycle, tiers, CORS, cost report); one forgotten rule leaks a paid photo. Superseded by SP-17 | 2026-11-25 |
| Fake password / pretend login | Security theatre: the password sits in plain sight, teaches the wrong habit, and gets deleted later. Superseded by SP-16 | 2026-11-25 |
| Delete a whole category | Too destructive; an empty category card already disappears on its own, and photos can be deleted one by one | 2026-11-27 |

---

## 4. Architecture (app + separate storage, merged stages)

**One app, one storage account, three purpose containers (SP-17) plus retention.**

```
Visitor --HTTPS--> App (single app; host TBD via `OD-H`)
                      |
                      v
                Storage account (fixed, SP-1)
                  |-- public_photos\    every user's public photos
                  |-- store_photos\     masters offered for sale
                  |-- event_photos\     contest entries (Stage 3)
                  |-- Retention\        deleted photos, 48 hours (SP-26)
                        \786\landscape\sunrise.webp
                         ^ user id = folder, never a container
```

Each user folder also holds `gallery.json` (firstName, categories, covers — SP-32);
each photo folder holds `photo.json` and the three copies.

**Dev layout:** `Photography_app\app_v1\main` (the repo) and `..\Storage` (outside
the repo) sit side by side on disk, mirroring the Azure split — site in one place,
blobs in another. In Azure they are two services.

**Why purpose-first (owner's question, 2026-11-25):** access rules, lifecycle rules,
tiers, CORS, cost reports and monitoring are all set **per container**. Per-user
containers would duplicate every rule N times. A new user is a folder the first
time they upload — nothing to provision, nothing to clean up if sign-up is abandoned.

Design rules:

- The app never keeps photos; it only hands out links.
- One app, three internal rooms (owner, members, events). Split later only with evidence.
- Database choice deferred to Stage 2 (`OD-R`).
- **One folder per photo**, named by a generated id:
  `public_photos/<owner>/<category>/<id>/` holding `photo.json` (written last),
  `thumb.webp` (~400 px), `display.webp` (~1600 px) and `original.<ext>`.
  Cards and grids load `thumb`; an opened photo loads `display`; `original` only
  on Download. `photo.json` also carries the camera settings, so no page ever
  reads EXIF from an image.
- **Deleting moves the photo folder to `Retention\<owner>\<category>\<id>\`** with a
  `deleted.json` (`deleted_at`, UTC). The app hides anything older than 48 hours
  the moment it reads; a purge function only reclaims disk (SP-26). Restoring
  moves the folder back into the chosen category, keeps the id, and rewrites the
  category in `photo.json` (SP-28).
- The photo list **is the folder listing**, not a stored array. A folder without
  `photo.json` is an unfinished upload and is never shown.
- Site artwork (backgrounds) lives in the app (`app_v1\main\artwork`), not in
  storage; ~1920 px wide, real WebP. **A file's extension must match its real
  format** — Azure sets `Content-Type` from the name, browsers sniff and lie.
- Remove camera location data before publishing (privacy).
- Copies are made at upload by the server; a separate publish script is still
  planned for Azure upload and name normalisation.
- **Paths:** relative only (`images/nature/x.jpg`), never `C:\...`. Lowercase,
  no spaces — cloud storage is case-sensitive, Windows is not.
- **Identity:** pages ask `getCurrentUser()`; nothing else knows who is signed in.
- **Paths are built, never typed:** the server turns a photo into
  `/media/<owner>/<category>/<id>/<variant>`; a page only reads `photo.urls`.
  Today `owner` is always `786`.
- Keep local folders and cloud folders identical so hosting changes no code.

Deferred until justified: Front Door, Log Analytics, microservices.

---

## 5. Roadmap

**Stage 0 — foundations (done)**
- [x] Memory file, git repo, product shape, service-group decisions

**Stage 1 + 2 — owner build (current, merged per SP-10)**
- [x] Homepage skeleton (2026-11-23) → **JSON-driven page** (2026-11-24)
- [x] **Four sections + 2×2 buttons** (2026-11-25): `my_gallery`, `community`,
      `store`, `events`; header name links home; `currentUser` added
- [x] **Stage B — local upload server + gallery view** (2026-11-27):
      `server.py`, `storage.py`, `/api/upload`, `/api/photos`, `/media`;
      `+` → wizard; category grid + lightbox; three copies per photo
- [ ] **Delete + 48-hour trash + restore + description** — designed 2026-11-27
      (SP-26…SP-29); not built yet (`NA-26`…`NA-29`)
- [ ] **Header location trail** (SP-31, `NA-30`)
- [ ] Real login for other users (`OD-I`), records (`OD-R`), upload rules (`OD-C7`)
- [ ] Host bake-off (`OD-H`), storage account, publish script, budget alert, launch

**Stage 3 — events (later)**
- [ ] Contests, entries, voting, results

**Lab track — parallel, delete-by-default**
- [ ] 3-tier VM lab (SP-5)
- [ ] App Service / Container Apps / Functions comparisons
- [ ] Small templates only if a lab needs them (SP-6)

---

## 6. Cost — illustrative only (if Storage static website is chosen)

No locked ceiling (SP-4 retired). Least-cost option wins; measure each service.

| Item | Volume | Unit price | Monthly |
|---|---|---|---|
| Viewing images — Hot LRS | ~3 GB | ~$0.018/GB | ~₹5 |
| Originals — Cool LRS | ~30 GB | ~$0.010/GB | ~₹26 |
| Transactions | ~20 visitors | negligible | <₹1 |
| Egress | ~60 MB (first 100 GB/mo free) | $0 | ₹0 |
| **Example total** | | | **~₹32** |

Guardrails: budget alert at ₹100 (safety net, not a ceiling) · lifecycle rule moves
originals to Cool, never auto-deletes masters · early deletion fees: Cool 30 days,
Archive 180 days · never commit keys or SAS tokens · pay-as-you-go keeps always-free
tiers and 12-month grants, but Student credit does not carry over.

---

## 7. IaC status — ON HOLD (SP-6)

Reserved folder: `Master_landing_zone_v1\` (empty). When resumed: subscription-scope
template (RG, budget, policy, RBAC); storage name via `uniqueString()`; `Incremental`
mode; gate with `what-if`.

Portal **Export template** is a snapshot, not truth — it misses the RG, budgets,
policy, role assignments, locks, diagnostics, subscription-scope items and secrets.
Workflow: intended template → `what-if` → deploy → `az group export` → **diff** →
catalogue gaps.

```
budget/monthly-100      MISSING in export (subscription scope)
roleAssignment: Reader  MISSING in export
storage.minTlsVersion   expected TLS1_2, actual TLS1_0
```

Interview framing: the template is authoritative; what-if gates change; the export
diff proves drift is caught; keep a written list of non-exportable resources.

---

## 8. File map

```
C:\Stagging\AZ104_free_sub_project\
├── Storage\                      mirror of the blob account — OUTSIDE the repo (SP-15)
│   ├── public_photos\                every user's public photos; user id = folder
│   │                                 (each user folder has gallery.json — SP-32)
│   ├── store_photos\                 masters offered for sale
│   ├── event_photos\                 contest entries (Stage 3)
│   └── Retention\                    deleted photos for 48 hours (SP-26)
│       (created at server start)
└── Photography_app\              THE REPO
    ├── .git\  .gitignore
    ├── ai_support.md             this file — project memory + decision log
    ├── cloud_handover.md         Codespaces session diary (cloud writes it)
    ├── local_handover.md         Windows session diary (local writes it)
    ├── temp.txt                  project brief (ignored)
    ├── Master_landing_zone_v1\   reserved for ARM (empty; on hold)
    ├── serve.cmd                 the one launcher (local only, never deployed)
    ├── app_v1\                   THE DEPLOYABLE ROOT (SP-25)
    │   ├── ideas.md              idea parking lot for THIS version (resets per version)
    │   ├── server.py             static site + upload API + image copies
    │   ├── storage.py            the one storage seam: disk today, blob later
    │   ├── requirements.txt      pillow, pillow-heif, rawpy
    │   └── main\                 SITE ROOT — served by server.py
    │       ├── index.html        home: hero + 2×2 buttons (shell only)
    │       ├── my_gallery.html   ┐
    │       ├── community.html    │ header + white; content arrives in Stage B/C
    │       ├── store.html        │
    │       ├── events.html       ┘
    │       ├── css\site.css      header, hero, 2×2 overlay buttons, messages
    │       ├── js\app.js         reads site.json → header, hero, buttons
    │       ├── data\site.json    site-wide: siteName, currentUser, imageBase,
    │       │                     titleBarImage, heroImage, heroText[], nav[], buttons[]
    │       └── artwork\          site artwork only (real WebP, not photos)
    ├── labs\                     (planned) 01-storage-static · 02-app-service-f1 ·
    │                             03-functions-api · 04-vm-3tier (SP-5) · 05-static-web-apps
    ├── pipeline\                 (planned) resize / strip location data / upload
    └── docs\                     (planned) cost screenshots, interview notes
```

How the page works: `index.html` is an empty shell → `js/app.js` fetches
`data/site.json` → writes the header, hero and buttons → `css/site.css` styles them.
**CSS never reads JSON; only JS does.** `imageBase` in `site.json` is the single
switch from local artwork to Azure Blob URLs. `getCurrentUser()` is the single
switch from a faked identity to a real login.

Git conventions:
- Commit at **milestones only**; `main` is the record.
- Style: `area: what changed`.
- `temp.txt` is **ignored**; media lives outside the repo entirely (SP-15).
- Exported actual-state JSON is committed — that is the drift timeline.
- Repo-local identity `ashar` / `ashar@local`; global config untouched.
- Remote `origin` = `github.com/asharfarid/photography_app` (added 2026-11-25).
  Push **after** `git end`, so code, memory and handover land in one commit.
- Two author identities exist: `ashar <ashar@local>` (Windows) and
  `asharfarid <asharfarid@gmail.com>` (Codespaces / GitHub).

---

## 9. Conversation log (append-only)

### Sessions 1–6 (2026-11-05 → 2026-11-23) — compressed
- S1: public HTTPS photo site on Azure, learning-first; locked SP-1/SP-2.
- S2: free/student subscription; SP-3..SP-6 (later revised); ~₹32/mo static estimate.
- S3: community platform, not a portfolio; SP-7..SP-11; staged delivery.
- S4: contradiction review — SP-3/SP-4 retired, SP-1 tightened, SP-12 added; §3 grouped.
- S5: React rejected (SP-13); path rule (`OD-C9`); WordPress/Wix rejected.
- S6: `app_v1` contract, c1–c5 containers (later replaced), photo model, `ideas.md`, first homepage.

### 2026-11-24 — Session 7: JSON-driven page, ps1 server, storage moved out
- Page became data-driven (`site.json` + `app.js`; `index.html` is a shell);
  header 70 px sticky, hero natural height, `serve.ps1`/`.cmd` on port 8000.
- Storage moved out to `..\storage_account` (SP-15); **4 photos lost** in the move
  (15 of 19 remain); names inconsistent — normalise in the publish script.

### 2026-11-25 — Session 8: four sections, single-user mode, containers by purpose
- Four sections: 2×2 transparent buttons (2 px `#F77D31`, 18 px radius) at 51 %
  of window height, stack below 700 px; pages `my_gallery`, `community`, `store`,
  `events`; hero *"The world looks different through my lens"*.
- SP-16 single-user (`currentUser: "786"`); SP-17 purpose containers; storage
  renamed `..\Storage` and empty (NA-14); Stage B agreed.
- Lessons: anchoring needs `top: 0` + `height: 100%` + `max-height`; the stdlib
  server sends no cache headers — **Ctrl+F5** after changes.

### 2026-11-26 — Session 9: Codespaces — My Gallery toolbar + category cards
- **Environment:** GitHub Codespaces (Linux), fresh OpenCode install. Owner spent
  ~1 hour re-explaining the project; `ai_support.md` + `ideas.md` then carried it.
  No browser there — every visual check deferred to Windows.
- **`data/users_gallery.json` created:** `users.786.firstName = "Ashar"` plus the
  eight categories, each `photos: []`, `cover: null`.
- **`my_gallery.html`** → `data-page="my-gallery"`. **`app.js`** loads the new file
  on that page only, builds a non-sticky toolbar (`Ashar · 786` left, search
  centre, `+` and `⚙` right) and the category cards.
- **Cards are dormant:** only categories with ≥1 photo render — no placeholders.
  Card = 24 vh, half album art / half frosted label, ±4 % zigzag, odd = name left.
  Mobile: full-bleed art + overlay, 120 px. **No drag reorder**; alphabetical.
- **Cover rule:** first upload becomes the cover, locked while there is one photo;
  the user picks once there are two. Store a reference, never a copy.
- Committed and pushed by the owner as `b663909` (GitHub identity).
- **Known gaps:** `+` and `⚙` have no handlers; `imageUrl(cover)` breaks if
  `photos[]` ever holds objects instead of strings.

### 2026-11-26 — Session 10: cross-environment protocol + file rename
- **Local check of the pull:** home renders 4 buttons at 174–519 in a 678 px
  window, no console errors; `my_gallery` renders a 72 px toolbar (`Ashar · 786`,
  search, two icon buttons), zero cards, no errors.
- **Collaboration protocol agreed** (§0 rules 11–16, §0.1, §0.2): two keywords,
  environment detection, eight handover headings, five-line front matter,
  newest-first, 60-line cap, three-line Git section, printed self-check.
- **Renamed `AI_Support.md` → `ai_support.md`** (case-only, two-step `git mv`).
  Older notes may still say `AI_Support.md`; it is this file.
- **Push timing settled:** `git pull` → `git start` → work → `git end` → review →
  commit → push. The owner does the pull and the push; the AI never commits.
- **`AGENTS.md` declined** — a fifth file duplicating §0; `git start` covers it.

### 2026-11-26 — Session 11: Codespaces — `git start` review (no work)
- **Environment:** GitHub Codespaces (Linux), `/workspaces/photography_app`.
- Ran `git start`: read §0–§3, both handover headers and the local newest entry;
  reported me/other/last/open in four lines.
- Repo at `8821af5` on `main`, clean, 0 ahead / 0 behind `origin/main`.
- **No code, data or decisions changed**; NA-17, NA-15, NA-16, NA-18, NA-13 and
  NA-14 all remain open.
- Closed out with `git end`; no commit or push by the AI.

### 2026-11-27 — Session 12: Stage B built — upload, copies, wizard
- **Environment:** local Windows. Plan reviewed across several rounds; owner set
  the rule that memory updates happen at build-mode start (§0 rule 17).
- **Promoted:** SP-19…SP-25; `OD-C6` decided; `OD-C7` partly; §4 photo model
  rewritten; NA-17 closed.
- **Built:** `app_v1\server.py` (static + `/api/upload` + `/api/photos` +
  `/media`, streaming multipart, content sniffing, JPEG GPS strip, HEIC/RAW via
  pillow-heif/rawpy), `app_v1\storage.py` (the storage seam), `requirements.txt`.
- **Launchers moved** to the repo root (2026-11-27) so `app_v1` is exactly what
  deploys; `serve.ps1` now enters `app_v1` before starting.
- **Close-out:** `.jfif` uploads store as `original.jpg` (format detected, not the
  extension); the download name still lacks one (`NA-25`). Phone testing written,
  not run (`NA-24`); delete/rename and the cover picker parked (`NA-20/21`).
- **Front end:** `+` → menu → wizard (browse, name, category, progress); cards
  with counts; grid + lightbox + Download original; empty-state hint.
  `users_gallery.json` shrunk to `firstName` + categories; `photos[]` retired.
- **Verified:** JPEG upload (3 copies, GPS gone, camera kept), HEIC upload,
  duplicate name 409, PDF renamed `.jpg` 415, path traversal 404, and a full
  UI upload with no console errors. RAW path written, **not** tested (no RAW
  file available).
- **Cleanup:** test photos removed; the three containers exist and are empty.

### 2026-11-27 23:10 UTC — Session 13: Codespaces — delete/restore design + memory rules
- **Environment:** GitHub Codespaces (Linux), `/workspaces/photography_app`, at
  `49e7ccd` on `main`, clean, 0 ahead / 0 behind `origin/main`. No browser here.
- **Goal:** design delete + restore for My Gallery, and settle handover retention.
- **Owner decisions promoted:** SP-26 (48-hour private trash, timestamp not job),
  SP-27 (bin only inside a category; multi-select; Delete bar; confirm + result),
  SP-28 (`+` → Restore tray; prefilled form), SP-29 (optional 300-char
  description), SP-30 (cover auto-reassign, empty card disappears), SP-31
  (header centre location trail).
- **Category deletion rejected** (§3.3): too destructive; empty cards vanish on
  their own.
- **Retention design:** `deleted_at` (UTC) checked at read time is the rule;
  `purge_trash` is only disk housekeeping, switchable by `TRASH_PURGE=app|azure`.
  Azure may use a `_trash/` lifecycle rule instead — no rewrite, one config flag.
- **Memory rules changed (owner):** no automatic compression anywhere (§0 rules
  4, 9, 15, §0.1 step 7); entries keep date + time in UTC in the title; a second
  `git end` on the same day is a new entry; cuts only after owner review.
- **Not built:** no code changed this session — the design is the deliverable.
- **Close-out:** `cloud_handover.md` Session 3; NAs `NA-26`…`NA-31` added;
  `NA-20` narrowed to rename only. No commit or push by the AI.

---

## 10. Next actions

- [ ] **NA-1** Answer `OD-C1` (region) and `OD-C2` (naming/tags)
- [x] **NA-2** ~~Build the rough homepage as the sketch~~ — skeleton done 2026-11-23
- [x] **NA-12** ~~Decide homepage content flow~~ — four sections + 2×2 buttons, 2026-11-25
- [x] **NA-17** ~~Settle the photo record shape~~ — Option C + generated id, 2026-11-27
- [x] **NA-15** ~~Build Stage B~~ — `server.py` + wizard, 2026-11-27 (§11)
- [x] **NA-16** ~~Create the 3 containers~~ — created 2026-11-27;
      layout `public_photos\<owner>\<category>\<id>\`
- [x] **NA-13** ~~Gallery view~~ — category grid + lightbox + download, 2026-11-27
- [x] **NA-18** ~~Wire the `+` button~~ — done 2026-11-27; `⚙` still inert
- [ ] **NA-19** Strip GPS from non-JPEG originals (HEIC/TIFF/WebP); RAW cannot
      be edited in place
- [ ] **NA-20** Rename UI — delete half done 2026-11-28; cover reassignment done
      (`SP-30`), only the rename itself remains
- [ ] **NA-21** Cover picker behind `⚙`; preferences now live in
      `Storage\public_photos\<owner>\gallery.json` (`SP-32`)
- [ ] **NA-22** Upload a real RAW file and confirm the preview path
- [ ] **NA-23** Admin console: per-user counts **computed from storage**, never stored
- [ ] **NA-24** Test from a phone over the laptop hotspot: `HOST=0.0.0.0` plus a
      temporary firewall rule for TCP 8000; remove the rule afterwards
- [ ] **NA-25** Download name: `sanitise(photo.name) + extension from
      photo.urls.original`, so Windows gets `Sunrise Test.jpg` instead of a name
      with no extension (and no invalid characters)
- [x] **NA-26** ~~Build the delete UI (`SP-27`)~~ — done 2026-11-28: bin inside a
      category only, tick boxes + Select all, pale→solid red Delete bar, confirm
      popup with the 48-hour disclaimer, "N deleted · M failed" toast
- [x] **NA-27** ~~Build the retention area (`SP-26`)~~ — done 2026-11-28:
      `Retention\<owner>\<category>\<id>\` + `deleted.json`, hidden at 48 h by
      `deleted_at` (UTC), `purge_trash`, `TRASH_PURGE=app|azure`
- [x] **NA-28** ~~Build restore (`SP-28`)~~ — done 2026-11-28: second `+` item,
      tray newest first with thumbnail/name/hours left, pre-filled form, name-clash
      error, category change, id kept
- [x] **NA-29** ~~Add the optional description (`SP-29`)~~ — done 2026-11-28:
      300 chars, `photo.json`, shown as text under the camera details
- [x] **NA-30** ~~Header location trail (`SP-31`)~~ — done 2026-11-28: centre
      text, non-clickable, "My Gallery" / category label, hidden under 900 px
- [x] **NA-31** ~~Verify delete/restore~~ — done 2026-11-28: cover cleared then
      reassigned, empty card disappears, name freed then reused, partial failure,
      expired item → 410, 48-hour read rule, phone-width header
- [ ] **NA-32** Trash view is a modal, not a page; if the list ever grows past a
      screenful it should become its own page with paging
- [ ] **NA-14** Confirm or recover the 4 missing photos. The old `storage_account`
      folder was deleted on 2026-11-25, so recovery is now unlikely — record the loss
- [ ] **NA-3** Agree the component list for the four sections
- [ ] **NA-4** Test Stage 1 host candidates from `OD-H`; note cost/effort
- [ ] **NA-5** Set up the storage account + folder layout (`OD-C9`)
- [ ] **NA-6** Move the site to the chosen host; confirm HTTPS
- [ ] **NA-7** Publish script (resize, remove location data, upload)
- [ ] **NA-8** Finishing styles (`OD-C3`); budget alert + lifecycle rule
- [ ] **NA-9** Convert subscription to pay-as-you-go; check first invoice
- [ ] **NA-10** Launch read-only link with the initial 20 people
- [ ] **NA-11** Real login (`OD-I`), records (`OD-R`), 3-tier VM lab (SP-5)

---

## 11. Stage B — upload + delete/restore server (BUILT 2026-11-27/28)

One process serves the site and the API: `app_v1\server.py` on `127.0.0.1:8000`.

```
browser --POST /api/upload-->  server.py --writes--> ..\Storage\public_photos\786\<category>\<id>\
browser --POST /api/delete-->  server.py --moves --> ..\Storage\Retention\786\<category>\<id>\
browser --POST /api/restore->  server.py --moves --> ..\Storage\public_photos\786\<category>\<id>\
browser --GET  /media/...-->   server.py --reads -->  a live photo folder
browser --GET  /trash-media--> server.py --reads -->  a retention folder (thumbs only)
browser --GET  /api/photos-->  server.py --lists -->  folder listing + photo.json + gallery.json
browser --GET  /api/trash-->   server.py --lists -->  retention folders still inside 48 h
```

- Root stays `app_v1\main`; the storage folder is never reachable from the browser.
- The owner comes from `current_owner()` (site.json today, login later); a
  client-sent id is ignored (SP-24).
- Upload path: stream the body to a temp file → validate by bytes → generated id
  → original → strip JPEG GPS → `display.webp` + `thumb.webp` → `photo.json`
  **last** → atomic rename into place. A failed upload leaves nothing behind.
- Limits: 500 MB, ~200 MP; JPEG/PNG/WebP/HEIC/TIFF/RAW; PDF/SVG rejected.
  Description is optional, 300 characters, stored in `photo.json` and shown as text.
- A copy failure keeps the upload and shows a placeholder (SP-21).
- **One file at a time**; no drag-and-drop.
- **Delete:** `POST /api/delete` takes `{category, ids[]}`, one move per id, and
  returns `{deleted[], failed[]}`; the cover is cleared as each id goes.
- **Restore:** `POST /api/restore` takes `{id, category, name, description}`; the
  id is kept, the folder moves back and `photo.json` is rewritten. A name clash is
  `409`, an expired or missing item is `410`.
- **Retention is read-time:** anything stamped more than 48 h ago is already gone
  from `/api/trash` and `/trash-media`, even before the bytes are purged.
- **Storage seam:** `storage.py` exposes save / list / file_path / trash / restore /
  list_trash / purge_trash / gallery read-write. A blob implementation replaces the
  disk one later, chosen by `STORAGE_BACKEND`.
- **The folder is the truth; the JSON is the preferences.** The photo list is the
  folder listing; `Storage\public_photos\<owner>\gallery.json` holds only what a
  folder cannot express (firstName, category labels, covers — SP-32). Never a
  second list, and never in the site folder.
- **Not in Stage B:** login, quotas, moderation, rename UI, cover picker,
  admin console.
- **Testing from a phone:** set `HOST=0.0.0.0` plus a temporary inbound firewall
  rule for TCP 8000, then open `http://<laptop-ip>:8000`; anyone on that network
  can upload while open — own hotspot only, remove the rule afterwards.
- **Downloads keep the real extension** (a `.jfif` is stored as `original.jpg`);
  the suggested download name still lacks one (`NA-25`).

**Azure later:** implement the blob version of `storage.py`, point `STORAGE_ROOT`
at the mount (or use the blob backend) and serve `/media/` from the container or a
SAS link. Pages do not change; they already read `photo.urls`.

**Consequence:** uploads need a host that runs code, so `OD-H` excludes Storage
static website. App Service, Container Apps, a VM or Kubernetes all fit: one
process, environment-configured, no framework.

---

## 12. Glossary

| Term | Meaning here |
|---|---|
| GPv2 | General-purpose v2 storage account; required for static website |
| `$web` | Reserved container that serves the static website |
| HNS | Hierarchical namespace (ADLS Gen2) — keep **off** for static websites |
| LRS | Locally redundant storage; cheapest redundancy |
| Hot / Cool / Archive | Blob tiers: cheaper storage, higher access/min-retention |
| Container | A top-level folder inside a storage account; we use one per **purpose** |
| `currentUser` | The one value that answers "who is signed in?" today |
| POST | An HTTP request that sends data **to** the server (this is how an upload arrives) |
| Endpoint / route | A URL the server answers with code, e.g. `/api/upload` |
| SAS | Shared Access Signature — a time-limited link granting access to one blob |
| ARM template | Declarative JSON describing desired Azure state |
| Bicep | Language that compiles to ARM JSON |
| Relative path | A path starting from the site folder (`images/x.jpg`), not `C:\...` |
| `what-if` | Dry-run diff of a deployment against current state |
| Drift | Difference between desired (template) and actual (deployed) state |
| Idempotent | Re-running produces the same end state |
| Subscription-scope | Template that can create RGs, budgets, policy, RBAC |
| Auto-shutdown | Schedule that stops a VM nightly to protect credit |

---

## 13. Changelog

| Date | Change | Reason |
|---|---|---|
| 2026-11-08 | Created file; seeded sessions 1–2 | Persist context across chats/models/reinstalls |
| 2026-11-08 | `git init`, `.gitignore`, initial commit | Tamper-proof history + drift timeline |
| 2026-11-19 | Locked SP-7..SP-11; staged architecture | Product changed to community platform |
| 2026-11-22 | SP-3, SP-4 retired; SP-1 tightened; SP-12 added; §3 regrouped (`OD-H…`, `OD-C…`); schema v2 | Contradiction review + owner wants services grouped; old OD-1…OD-17 folded into groups |
| 2026-11-23 | SP-13 added (HTML/CSS/JS); `OD-C9` paths; rejected options; homepage-is-the-sketch approach | Runtime decision + build approach settled |
| 2026-11-23 | Session 6: `app_v1` contract, containers `c1…c5`, photo model, `ideas.md`, first homepage, SP-14 (`.json`) | App folder structure and first build agreed |
| 2026-11-24 | Session 7: JSON-driven page, `serve.ps1`/`.cmd`, hero text, storage moved outside the repo (SP-15) | Page became data-driven; owner wants storage out of every version |
| 2026-11-25 | Memory caught up after one day of drift; sessions 1–5 compressed; 4 missing photos recorded | Owner asked whether progress was being recorded — it was not |
| 2026-11-25 | SP-10 revised (stages 1+2 merged); SP-16/17/18 added; `OD-C9` decided (underscores allowed); containers `c1…c5` → 3 purpose containers; `storage_account` → `Storage`; §4 rewritten; §11 Stage B added; §5/§8/§10 updated | Four sections built; owner wants the site built once for "a signed-in user" and asked what must exist now so Stage B and real login need no rewrite |
| 2026-11-26 | Session 9 (Codespaces): My Gallery toolbar + dormant category cards, `users_gallery.json`. Session 10 (Windows): cross-environment protocol (§0 rules 11–16, §0.1, §0.2), `AI_Support.md` → `ai_support.md`, push-after-`git end` rule, §8 remote, §11 folder-is-truth, NA-17/NA-18 | Owner works in two environments and will not paste a handover prompt each session |
| 2026-11-26 | Session 11 (Codespaces): `git start`/`git end` protocol run only; no code or decisions changed; `cloud_handover.md` given front matter + Session 2 entry | First end-to-end run of the two-keyword workflow |
| 2026-11-27 | Session 12 (Windows): Stage B built — `server.py`, `storage.py`, wizard, grid + lightbox; SP-19…SP-25; `OD-C6` decided, `OD-C7` partly; §4/§5/§8/§10/§11 rewritten; §0 rule 17; launchers moved to the repo root; `NA-24`/`NA-25` added | Upload works locally end to end; three copies per photo; `app_v1` is now exactly what deploys |
| 2026-11-27 | Session 13 (Codespaces): delete/restore design — SP-26…SP-31; category deletion rejected; NA-26…NA-31 added, NA-20 narrowed to rename; **no automatic compression** in §0 rules 4, 9, 15 and §0.1; handover titles now date + time in UTC, every run a new entry | Owner wants undo safety without a scheduler, and a diary that is never shrunk behind his back |
| 2026-11-28 | Session 14 (Windows): delete → 48 h Retention → restore built (SP-26/28 revised, SP-32/33 added); per-user `gallery.json` moved into `Storage\public_photos\<owner>\` and `users_gallery.json` deleted; description field (300 chars); header location title; bulk delete bar with tick boxes; restore tray + pre-filled form; `serve.ps1` deleted, `serve.cmd` now standalone; §4/§8/§11 rewritten | Owner approved the plan; one launcher and one place for per-user data |
