---
project: Photography_app
file: ai_support.md
purpose: Persistent memory + decision log for AI assistant sessions
schema_version: 2
written_by: AI assistant (sole writer)
last_updated: 2026-11-26
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
4. Append to §9; never rewrite or reorder past entries (older ones may be compressed).
5. Preserve IDs. Grouped IDs (`OD-H`, `OD-C1`) are allowed; never renumber.
6. Update `last_updated` in the front matter on every write.
7. Modify only the repo and the storage mirror (`..\Storage`). Never touch global
   git config or anything else outside these unless explicitly asked.
8. Commit at **milestones only** — not every experiment.
9. Keep this file under ~600 lines; compress §9 history when over; never delete SPs.
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
    §0.2; ≤60 lines per entry; entries older than three sessions compress to
    three bullets, never deleted. The Git section is always three lines and
    describes the **start**, never the end. A file with no front matter (an older
    handover) is read by the date in its newest entry title.
16. **A stale handover is normal.** An older date means that environment has not
    been used since. Never write to it, never "complete" it, never report it as
    a problem.

### 0.1 `git end` checklist (run in order)

1. Detect the environment (rule 11). If the two checks disagree, **stop and ask**.
2. Read the other environment's newest entry.
3. Promote every decision here: §2 (new SP), §3 (status), §4/§5/§8 if structure
   moved; update `last_updated`.
4. Park undecided ideas in `app_v1/ideas.md` (next free `I-n`); mark promoted ones.
5. Append the session to §9.
6. Update §10 and §13.
7. Write your handover entry (newest first) and bump `last_session`, `sessions`.
8. Self-check and print: headings 8/8 · every decision has a pointer · Git 3
   lines · files written · files untouched.
9. Report what was recorded and what could not be verified.
10. Do not commit, do not push.

### 0.2 Handover headings — exactly these eight, in this order

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
| Current stage | **Stage 1 + Stage 2 merged** (SP-10): owner-only build, identity faked as `786` (SP-16). Four sections — My Gallery, Public Gallery, My Store, Events |
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
| Local run | `app_v1\serve.ps1` (or `serve.cmd`) → `http://localhost:8000`, currently `python -m http.server` — read-only, cannot accept uploads |

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
| SP-14 | **App data files are `.json`.** They need a local web server (`file://` blocks reads); `serve.ps1`/`serve.cmd` on port 8000 | ACTIVE | 2026-11-23 |
| SP-15 | **The storage mirror lives outside the repo and outside every app version** — `C:\Stagging\AZ104_free_sub_project\Storage` (renamed from `storage_account` 2026-11-25) | ACTIVE | 2026-11-24 |
| SP-16 | **Single-user mode.** One value, `currentUser` in `site.json`, answers "who am I?" for every page through `getCurrentUser()`. No password, no fake login screen. When real login arrives, only that function changes | ACTIVE | 2026-11-25 |
| SP-17 | **Containers are by purpose, not by person**: `public_photos`, `store_photos`, `event_photos`. A user is a **folder** named by their numeric ID (`786`); a new user needs no provisioning | ACTIVE | 2026-11-25 |
| SP-18 | **No page writes a storage path.** One function builds it (`photoUrl` / `savePhoto`); pages ask, never assemble. All data access goes through `app.js` — no page calls `fetch()` itself | ACTIVE | 2026-11-25 |

Derived constraints (consequences, not new decisions):

- Storage account: **Standard GPv2, LRS, hierarchical namespace OFF** if static
  website is used.
- No Azure DNS zone, no certificate purchase, no custom-domain binding.
- Monolith: whatever host is chosen must run **one app**, not many services.
- Photo files never sit on app storage; the app holds code and settings only.
- Every lab is **delete-by-default** (auto-shutdown for VMs).
- Git: commit at **milestones only**.
- A user is a **folder inside a purpose container**, never a container of its own.
- **Static website hosting cannot accept an upload or log anyone in.** Once Stage B
  (uploads) lands, `OD-H` narrows to App Service / Container Apps / a VM.

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
| `OD-C6` | Image sizes | OPEN | ~400px thumbnail, ~1600px viewing |
| `OD-C7` | Member upload rules | OPEN | size/format limits, moderation, per-user quota (~100–200 photos) |
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

---

## 4. Architecture (app + separate storage, merged stages)

**One app, one storage account, three purpose containers (SP-17).**

```
Visitor --HTTPS--> App (single app; host TBD via `OD-H`)
                      |
                      v
                Storage account (fixed, SP-1)
                  |-- public_photos\    every user's public photos
                  |-- store_photos\     masters offered for sale
                  |-- event_photos\     contest entries (Stage 3)
                        \786\landscape\sunrise.webp
                         ^ user id = folder, never a container
```

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
- Two image sizes per photo in `public_photos`: **thumbnail** (~400 px) for browsing
  and **display** (~1600–1920 px) for viewing. An optional **master** (up to 100 MB)
  lives in `store_photos` and is only fetched on download. The browser never loads
  a master.
- Site artwork (backgrounds) lives in the app (`app_v1\main\artwork`), not in
  storage; ~1920 px wide, real WebP. **A file's extension must match its real
  format** — Azure sets `Content-Type` from the name, browsers sniff and lie.
- Remove camera location data before publishing (privacy).
- Publish is a local script, not a web portal.
- **Paths:** relative only (`images/nature/x.jpg`), never `C:\...`. Lowercase,
  no spaces — cloud storage is case-sensitive, Windows is not.
- **Identity:** pages ask `getCurrentUser()`; nothing else knows who is signed in.
- **Paths are built, never typed:** `photoUrl(owner, kind, category, file)` →
  `public_photos/786/landscape/x.webp`. Today `owner` is always `786`.
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
- [ ] **Stage B — local upload server** (`server.py`, `/api/upload`, `/api/photos`) — §11
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
│   ├── store_photos\                 masters offered for sale
│   └── event_photos\                 contest entries (Stage 3)
│       (all three agreed, not created; the folder is empty — see NA-14)
└── Photography_app\              THE REPO
    ├── .git\  .gitignore
    ├── ai_support.md             this file — project memory + decision log
    ├── cloud_handover.md         Codespaces session diary (cloud writes it)
    ├── local_handover.md         Windows session diary (local writes it)
    ├── temp.txt                  project brief (ignored)
    ├── Master_landing_zone_v1\   reserved for ARM (empty; on hold)
    ├── app_v1\                   current app version
    │   ├── ideas.md              idea parking lot for THIS version (resets per version)
    │   ├── serve.ps1             local server logic (port 8000)
    │   ├── serve.cmd             double-click launcher for serve.ps1
    │   └── main\                 SITE ROOT — lifted to the host as-is
    │       ├── index.html        home: hero + 2×2 buttons (shell only)
    │       ├── my_gallery.html   ┐
    │       ├── community.html    │ header + white; content arrives in Stage B/C
    │       ├── store.html        │
    │       ├── events.html       ┘
    │       ├── css\site.css      header, hero, 2×2 overlay buttons, messages
    │       ├── js\app.js         reads site.json → header, hero, buttons
    │       ├── data\site.json    siteName, siteNameHref, currentUser, imageBase,
    │       │                     titleBarImage, heroImage, heroText[], nav[], buttons[]
    │       ├── data\users_gallery.json   per-user firstName + 8 categories
    │       │                     (photos[] + cover, both empty today)
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

Photo folder target (not built yet): one folder per photo, `thumb` + `display`,
plus optional `master` in `store_photos`.

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

### 2026-11-05 — Session 1
- Public HTTPS photo site on Azure, learning-first. Locked SP-1, SP-2; hosting matrix.

### 2026-11-08 — Session 2
- Free/student subscription. Locked SP-3..SP-6 (since revised). ~₹32/mo static estimate.

### 2026-11-19 — Session 3: product shape
- Community platform, not just a portfolio: owner's work, member posts, events.
  References: anseladams, jimmychin, artwolfe. Locked SP-7..SP-11; staged delivery.

### 2026-11-22 — Session 4: service grouping + SP cleanup
- Contradiction review: **SP-3 retired** (hosting open), **SP-4 retired** (no ceiling),
  **SP-1 tightened** (all photos in one account), **SP-12 added** (least cost).
- §3 regrouped into `OD-H/I/R/P/D/M/E` + `OD-C1…C8`.

### 2026-11-23 — Session 5: runtime + build approach
- Second opinion recommended React + Vite; rejected — **SP-13**: hand-written HTML/CSS/JS.
- **Path rule** (`OD-C9`): relative, lowercase, hyphens, no spaces. WordPress/Wix rejected.
- Build approach: the **rough homepage is the sketch** — real photos, styling last.

### 2026-11-23 — Session 6: app_v1 skeleton + first homepage
- **Folder contract:** `app_v1\main` = site root (code only); storage mirror separate.
- Containers: `c1_my_photos_public`, `c2_my_purchase_store`, `c3_user_photos_public`,
  `c4_user_purchase_store`, `c5_competitive_events`. (**Replaced 2026-11-25 by SP-17.**)
- **Photo model:** one folder per photo — `thumb` + `display`; optional `master` for
  download; the app decides free vs paid (**Stage 4**). Photos still flat originals.
- `ideas.md` created — parking lot per app version; nothing there is a decision until
  promoted here.
- **SP-14:** `.json` data + local server. **Lesson:** extension must match real format.

### 2026-11-24 — Session 7: JSON-driven page, ps1 server, storage moved out
- **Page became data-driven:** `main\data\site.json` + `main\js\app.js`; `index.html`
  is a shell. `imageBase` is the single switch for Azure Blob.
- **Header:** 70 px sticky, `artwork\index_title_bar.webp` (1920×70), name `WeShoot`
  in mixed case, `nav` reserved (`[]`). **Hero:** natural height, no crop.
- **Server:** `serve.ps1` + `serve.cmd`, port 8000. Python 3.11 is on PATH.
- **Storage moved out** to `..\storage_account` (SP-15). ⚠️ **4 photos lost in the
  move** — `birds_animals\DSC01662.JPG`, `landscape\8d0f4bb2…`, `IMG_1376.JPEG`,
  `IMG_20260602_1009486120z.jpg` (15 of 19 remain). Files renamed inconsistently —
  normalise in the publish script.
- **Trap:** a local server cannot serve above its root; a gallery needs the root at
  the parent folder or a junction (`mklink /J`).

### 2026-11-25 — Session 8: four sections, single-user mode, containers by purpose
- **Four big buttons** — 2×2 over the hero's lower half, fully transparent, 2 px
  `#F77D31` border, 18 px radius, hover shadow falling bottom-left (light from the
  top right) + 4 px blur; block measured at **51 % of the window height**. Below
  700 px they leave the photo and stack. New pages `my_gallery`, `community`,
  `store`, `events` — header + white. `WeShoot` is now a link to `index.html`.
- **Hero** is one line: *"The world looks different through my lens"*.
- **Anchoring bug found and fixed:** `bottom: 7%` measured from the photo, so on
  wide/short windows row two fell below the fold (1366×768 clipped by 4 px,
  1568×700 by 176 px). Now `top: 0` + `height: 100%` +
  `max-height: calc(100vh - header)` + `align-content: center`.
- **Type:** weights only — name 700, hero 700, buttons 600. Sizes and colours
  unchanged (name dark `#3a2a1e`; hero and buttons `#F77D31`).
- **Single-user mode (SP-16):** `currentUser: "786"` in `site.json`, read through
  `getCurrentUser()`. No password, no fake login screen.
- **Containers by purpose (SP-17):** `public_photos`, `store_photos`,
  `event_photos`; the user is a folder (`786`). One container per user rejected.
- **Storage renamed** `storage_account` → `..\Storage` and is **empty** — the 15
  originals were lost with the old folder (NA-14). Containers agreed, not created.
- **Stage B agreed, not built** — local upload server; full design in §11.
- **Lesson:** `python -m http.server` sends no cache headers, so Chrome keeps a
  stale `app.js` and the page looks half-updated. **Ctrl+F5 after every change.**
  `server.py` will send `Cache-Control: no-store` for html/js/css.

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

---

## 10. Next actions

- [ ] **NA-1** Answer `OD-C1` (region) and `OD-C2` (naming/tags)
- [x] **NA-2** ~~Build the rough homepage as the sketch~~ — skeleton done 2026-11-23
- [x] **NA-12** ~~Decide homepage content flow~~ — four sections + 2×2 buttons, 2026-11-25
- [ ] **NA-17** **Settle the photo record shape before Stage B**: is `photos[]` a
      list of strings or objects? This decides `imageUrl(cover)` in `app.js`
- [ ] **NA-15** **Build Stage B** — local upload server (§11); see it working in
      `my_gallery.html` and `store.html` before touching Azure
- [ ] **NA-16** Create the 3 containers under `..\Storage` and move the user folder
      layout to `public_photos\786\<category>\`
- [ ] **NA-13** Build the gallery view: photo list per category, thumbnails,
      lightbox — depends on NA-15
- [ ] **NA-18** Wire or disable the `+` and `⚙` toolbar buttons — they do nothing today
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

## 11. Stage B — upload server (agreed 2026-11-25, not built)

Goal: upload a photo from `my_gallery.html` / `store.html` and have it land in the
storage mirror, without any page knowing whether the target is a disk or a blob.

**Why `python -m http.server` cannot do it:** it is read-only. A POST returns
`501 Unsupported method`. It serves files; it cannot accept one.

**Shape — one file, ~80 lines, no installs:**

```
browser --POST /api/upload-->  server.py --writes--> ..\Storage\public_photos\786\landscape\<name>
browser --GET  /media/...-->   server.py --reads -->  ..\Storage\...
browser --GET  /api/photos-->  server.py --lists -->  ..\Storage\public_photos\786\...
```

- `server.py` replaces `python -m http.server`; `serve.ps1` starts it. **The server
  root stays `app_v1\main`** — the browser never sees the storage folder. The
  server writes by absolute path, server-side. No junction, no parent root needed.
- Bind to `127.0.0.1` only. With no auth, `0.0.0.0` would let anyone on the local
  network upload.
- Front end calls one function: `savePhoto(owner, kind, category, fileBytes)`.
  Today it posts to `/api/upload`; later it puts to the blob container. Pages never
  change. Same for `loadPhotos()` → `/api/photos`.
- **One file at a time** (owner's call); no multi-select.
- No resize, no EXIF strip yet — that is the publish pipeline (`OD-P`). Files land
  exactly as uploaded, a 7 MB phone photo stays 7 MB.
- Categories (8; `events` dropped because it is now a section of its own):
  `abstract`, `birds_animals`, `landscape`, `life_style`, `micro_lense`,
  `portraits`, `sky`, `travel`.
- Filename: keep the original for now, normalise in the publish script. The owner
  is considering asking for a unique name per folder — undecided.
- Show a simple list of uploaded files under the upload box, so success is visible
  without opening Explorer.
- **The folder is the truth; the JSON is the preferences.** Photo lists are read
  from `public_photos\<id>\<category>\`; `users_gallery.json` holds only what a
  folder cannot express (display name, chosen cover, category order, background).
  Never keep a second copy of the file list — two lists always drift.
- **Not in Stage B:** login, tokens, database, per-user quotas, moderation.

**Azure later:** swap `..\Storage` for the container and `/media/` for the blob URL
(or a SAS link). `site.json → imageBase` already covers reads.

**What this breaks:** accepting a write and knowing who sent it needs a host that
runs code — so `OD-H` can no longer be Storage static website once Stage B lands.

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
