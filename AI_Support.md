---
project: Photography_app
file: AI_Support.md
purpose: Persistent memory + decision log for AI assistant sessions
schema_version: 2
written_by: AI assistant (sole writer)
last_updated: 2026-11-23
repo_root: C:\Stagging\AZ104_free_sub_project\Photography_app
---

# AI_Support

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
7. Modify only files under `repo_root`. Never touch global git config or anything
   outside this folder unless explicitly asked.
8. Commit at **milestones only** — not every experiment.
9. Keep this file under ~400 lines; compress old log entries, never delete SPs.
10. **Plain language, always (SP-11).** Owner is an Azure admin, not a developer.
    Define any unavoidable term in one line.

---

## 1. Project snapshot

| Field | Value |
|---|---|
| Goal | Publicly reachable, HTTPS **photo community** on Azure: owner's gallery first |
| Product model | "A shop": shop floor = the app; warehouse = one storage account |
| Stage 1 scope | **Read-only gallery of the owner's work**, public, no logins, no uploads |
| Later stages | Stage 2 member accounts + uploads; Stage 3 events/contests with voting |
| Owner intent | Learning-first for an **AZ-104 / cloud admin interview**, not just shipping |
| Subscription | Free/student; will convert the **same** subscription to pay-as-you-go |
| Cost rule | Least monthly cost wins; each service reviewed before finalizing (SP-12) |
| Audience | ~**20 known visitors per month** at launch, shared link only |
| Domain | **None purchased** — Azure-provided hostnames only (SP-2) |
| Media home | **One** storage account for all photos and derivatives (SP-1) |
| Hosting | **OPEN** — hands-on bake-off across candidates (`OD-H`) |
| Reference sites | anseladams.com, jimmychin.com, artwolfe.com (look), gurushots.com (events) |
| Working dir | `C:\Stagging\AZ104_free_sub_project\Photography_app` (Windows, pwsh, git 2.54) |
| App root | `app_v1\main` = site root; `app_v1\storage_account` = lift-and-shift mirror of the blob account |

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
| SP-8 | Three data areas: owner photos (`your-photos` + private `originals`), member photos (`members-photos`), app records (`app-data`) | ACTIVE | 2026-11-19 |
| SP-9 | **Hosting service NOT locked.** Hands-on bake-off; instinct decides | ACTIVE | 2026-11-19 |
| SP-10 | **Staged product**: Stage 1 read-only gallery → Stage 2 accounts/uploads → Stage 3 events | ACTIVE | 2026-11-19 |
| SP-11 | **Plain language only**; define any unavoidable term in one line | ACTIVE | 2026-11-19 |
| SP-12 | **Least monthly cost is the standing rule.** No fixed ceiling; every service's cost is reviewed before finalizing | ACTIVE | 2026-11-22 |
| SP-13 | **Stage 1 front end is hand-written HTML/CSS/JS.** No React/Next.js in Stage 1; revisit only if Stage 2 needs it | ACTIVE | 2026-11-23 |
| SP-14 | **App data files are `.json`.** They need a local web server (`file://` blocks reads); `serve.cmd` arrives when the gallery does | ACTIVE | 2026-11-23 |

Derived constraints (consequences, not new decisions):

- Storage account: **Standard GPv2, LRS, hierarchical namespace OFF** if static
  website is used.
- No Azure DNS zone, no certificate purchase, no custom-domain binding.
- Monolith: whatever host is chosen must run **one app**, not many services.
- Photo files never sit on app storage; the app holds code and settings only.
- Every lab is **delete-by-default** (auto-shutdown for VMs).
- Git: commit at **milestones only**.

---

## 3. Open decisions (grouped by service type)

### 3.1 Service groups — what we rent

| ID | Service type | Candidates | Status | Notes |
|---|---|---|---|---|
| `OD-H` | **Hosting** (where pages/app run) | Storage static website, App Service, Static Web Apps, Container Apps, VMs, Functions | OPEN | hands-on bake-off; cheapest that works; no default |
| `OD-I` | **Identity** (login) | Entra External ID, own sign-up, social login | OPEN | Stage 2 only |
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
| `OD-C5` | Off-machine backup | OPEN | private GitHub remote later; local `.git` is not a backup |
| `OD-C6` | Image sizes | OPEN | ~400px thumbnail, ~1600px viewing |
| `OD-C7` | Member upload rules | OPEN | size/format limits, moderation, per-user quota — Stage 2 |
| `OD-C8` | IaC timing/style, when SP-6 lifts | OPEN | subscription-scope template vs Bicep |
| `OD-C9` | Image layout + URL paths | OPEN | viewing images under `$web/images/...` so local and cloud paths match; lowercase, hyphens, no spaces; relative paths only |

Old flat IDs `OD-1…OD-17` were folded into these groups on 2026-11-22.

### 3.3 Rejected options (do not re-suggest without new evidence)

| Option | Why rejected | Date |
|---|---|---|
| WordPress (both .com and self-hosted) | Large attack surface, plugin patching, ~₹2,000+/mo; free .com plan can't do members/contests | 2026-11-23 |
| Wix / Squarespace | Not Azure; monthly cost; limited control | 2026-11-23 |
| Microservices | One-person project; adds cost and failure points (SP-7) | 2026-11-19 |
| Next.js server (Node on server in Stage 1) | Extra machinery, no Stage 1 benefit | 2026-11-23 |

---

## 4. Architecture (app + separate storage, staged)

**Stage 1 — read-only showcase (host TBD via `OD-H`).**

```
Visitor --HTTPS--> Stage 1 host (TBD)
                      |
                      v
                Storage account (fixed, SP-1)
                  |-- $web (if static website hosting is chosen): pages, styles, artwork
                  |-- c1_my_photos_public   : owner photos, one folder per category
                  |-- c2_my_purchase_store  : masters; app decides free vs paid (Stage 4)
                  |-- c3_user_photos_public : member photos (Stage 2)
                  |-- c4_user_purchase_store: member purchases (Stage 2/4)
                  |-- c5_competitive_events : contest entries (Stage 3)
```

**Stage 2+ — community (one app, storage separate).**

```
Visitor --HTTPS--> App (single app; host TBD) --reads/writes--> Storage account
                                                                  |-- your-photos
                                                                  |-- members-photos
                                                                  |-- app-data (records)
```

Design rules:

- The app never keeps photos; it only hands out links.
- One app, three internal rooms (owner, members, events). Split later only with evidence.
- Database choice deferred to Stage 2 (`OD-R`).
- Two image sizes per photo in `c1`: **thumbnail** (~400 px) for browsing and
  **display** (~1600–1920 px) for viewing. An optional **master** (up to 100 MB)
  lives in `c2_my_purchase_store` and is only fetched on download. The browser
  never loads a master.
- Site artwork (backgrounds) lives in the app (`app_v1\main\artwork`), not in
  storage; ~1920 px wide, real WebP. **A file's extension must match its real
  format** — Azure sets `Content-Type` from the name, browsers sniff and lie.
- Remove camera location data before publishing (privacy).
- Publish is a local script, not a web portal.
- **Paths:** relative only (`images/nature/x.jpg`), never `C:\...`. Lowercase,
  hyphens, no spaces — cloud storage is case-sensitive, Windows is not.
- Keep local folders and cloud folders identical so hosting changes no code.

Deferred until justified: Front Door, Log Analytics, microservices.

---

## 5. Roadmap

**Stage 0 — foundations (done)**
- [x] Memory file, git repo, product shape, service-group decisions

**Stage 1 — read-only gallery, public launch (NEXT)**
- [ ] Answer `OD-C1` (region) and `OD-C2` (naming/tags)
- [x] **First homepage skeleton** — `app_v1\main\index.html`, one full-width
      image, title `weshoot`, no scrolling (2026-11-23)
- [ ] Decide the homepage **content flow** — which boxes are clickable and where
      they lead (navigation details later)
- [ ] Agree the component list from that homepage (nav, grid, footer, etc.)
- [ ] Pick the Stage 1 host from `OD-H` (hands-on test)
- [ ] Create the storage account; containers for site, photos, private masters, records
- [ ] Move the homepage to the host; confirm the HTTPS address
- [ ] Publish script: resize, remove location data, upload
- [ ] Finishing styles (`OD-C3`) after the structure is agreed
- [ ] Budget alert (safety, not a locked ceiling)
- [ ] Share the link with the initial 20 people

**Stage 2 — members (later)**
- [ ] Identity (`OD-I`), records (`OD-R`), upload rules (`OD-C7`)
- [ ] Hosting decision finalized from the bake-off

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

Guardrails:
- Budget alert at ₹100 as a safety net (not a decision ceiling).
- Lifecycle rule: move originals to Cool; never auto-delete masters.
- Early deletion fees: Cool = 30 days, Archive = 180 days.
- Never commit keys or SAS tokens.
- Converting to pay-as-you-go keeps always-free tiers and 12-month grants, but
  Student credit does not carry over.

---

## 7. IaC status — ON HOLD (SP-6)

Reserved folder: `Master_landing_zone_v1\` (empty).

When resumed: subscription-scope template (creates RG, budget, policy, RBAC);
storage name via `uniqueString()`; `Incremental` mode; gate with `what-if`.

Portal **Export template** is a snapshot, not truth. It misses the resource group,
budgets, policy, role assignments, locks, diagnostics, subscription-scope items,
and secrets; names return hardcoded. Workflow: intended template → `what-if` →
deploy → `az group export` → **diff** → catalogue gaps.

```
budget/monthly-100            MISSING in export  (subscription scope)
roleAssignment: Reader        MISSING in export
storage.minTlsVersion         expected TLS1_2, actual TLS1_0
```

Interview framing: template is authoritative; what-if gates changes; export diff
proves drift is detected; documented list of non-exportable resources.

---

## 8. File map

```
Photography_app\
├── .git\                     local history (not a backup)
├── .gitignore                secrets, scratch, OS noise, media payloads
├── AI_Support.md             THIS FILE — AI memory + decision log
├── temp.txt                  project brief (untracked, ignored)
├── Master_landing_zone_v1\   reserved for ARM (empty; on hold)
├── app_v1\                   current app version
│   ├── ideas.md              idea parking lot for THIS version (resets per version)
│   ├── main\                 SITE ROOT — lifted to the host as-is
│   │   ├── index.html        one image, full width, blur(2px), no scroll
│   │   └── artwork\          site artwork, not photos (real WebP, ~1920 px)
│   └── storage_account\      mirror of the blob account (NOT in git)
│       ├── c1_my_photos_public\   9 category folders; photos still flat originals
│       ├── c2_my_purchase_store\  masters; free vs paid decided by the app
│       ├── c3_user_photos_public\ Stage 2
│       ├── c4_user_purchase_store\Stage 2/4
│       └── c5_competitive_events\ Stage 3
├── labs\                     (planned) per-candidate builds
│   ├── 01-storage-static\    hosting candidate
│   ├── 02-app-service-f1\    hosting candidate
│   ├── 03-functions-api\     later, optional
│   ├── 04-vm-3tier\          architect lab (SP-5)
│   └── 05-static-web-apps\   hosting candidate
├── pipeline\                 (planned) resize / strip location data / upload
└── docs\                     (planned) cost screenshots, interview notes
```

Photo folder target (not built yet): one folder per photo, `thumb` + `display`,
plus optional `master` in `c2`.

Git conventions:
- Commit at **milestones only**; `main` is the record.
- Style: `area: what changed`.
- `app_v1/storage_account/` and `temp.txt` are **ignored** — media is not versioned.
- Exported actual-state JSON is committed — that is the drift timeline.
- Repo-local identity `ashar` / `ashar@local`; global config untouched.
- No remote yet (`OD-C5`).

---

## 9. Conversation log (append-only)

### 2026-11-05 — Session 1
- Goal: public HTTPS photography site on Azure; learning for AZ-104 interviews.
- Locked SP-1, SP-2. Hosting matrix; separate data from presentation; export-template limits.

### 2026-11-08 — Session 2
- Free/student subscription confirmed. Locked SP-3..SP-6 (since revised).
- ~₹32/month estimate for a static showcase. Created git repo + this file.

### 2026-11-19 — Session 3: product shape
- Not "portfolio only": community platform — owner's work, member posts, events.
  References: anseladams, jimmychin, artwolfe. Locked SP-7..SP-11.
- Staged delivery; Stage 1 read-only, world-visible. Milestone commits only.

### 2026-11-22 — Session 4: service grouping + SP cleanup
- Contradiction review. **SP-3 retired** (hosting open), **SP-4 retired** (no ceiling).
- **SP-1 re-affirmed and tightened**: all photos, thumbnails, member uploads and
  contest entries in one storage account. **SP-12 added**: least monthly cost.
- §3 restructured into service groups (`OD-H/I/R/P/D/M/E`) + config (`OD-C1…C8`).

### 2026-11-23 — Session 5: runtime + build approach
- Second opinion (ChatGPT) recommended React + Vite; rejected for Stage 1 —
  read-only, security and simplicity win. **SP-13 locked:** hand-written HTML/CSS/JS.
- **Path rule agreed** (`OD-C9`): relative, lowercase, hyphens, no spaces; local and
  cloud folders identical. WordPress and Wix formally rejected (`§3.3`).
- Build approach: the **rough homepage is the sketch** — real photos, styling last.

### 2026-11-23 — Session 6: app_v1 skeleton + first homepage
- **Folder contract agreed:** `app_v1\main` = site root (code only);
  `app_v1\storage_account` = mirror of the blob account, lifted as-is.
- Storage containers named `c1_my_photos_public`, `c2_my_purchase_store`,
  `c3_user_photos_public`, `c4_user_purchase_store`, `c5_competitive_events`.
- **Photo model:** one folder per photo — `thumb` + `display`; optional `master`
  for download. Masters stay in `c2`; app decides free vs paid (**Stage 4**).
  Photos are still flat originals; not reorganised yet.
- `app_v1\ideas.md` created — idea parking lot per app version; nothing there is
  a decision until promoted here.
- **First homepage built:** `app_v1\main\index.html`, title `weshoot`, one image
  at full width, `blur(2px)`, no scrolling. Owner cropped artwork to 1920×1112.
- **SP-14:** app data is `.json`; a local server is required (owner's choice
  after being shown every alternative). `serve.cmd` deferred to the gallery.
- Lesson learned twice: **extension must match real format.** Browsers sniff and
  hide it; Azure sets `Content-Type` from the name. Squoosh export fixed it.
- Decision recorded, not built: purchase store masters all live in `c2`.

---

## 10. Next actions

- [ ] **NA-1** Answer `OD-C1` (region) and `OD-C2` (naming/tags)
- [ ] **NA-2** ~~Build the rough homepage as the sketch~~ — skeleton done 2026-11-23
- [ ] **NA-12** Decide homepage content flow: which boxes are clickable, where they lead
- [ ] **NA-3** Agree the component list from the homepage
- [ ] **NA-4** Test Stage 1 host candidates from `OD-H`; note cost/effort
- [ ] **NA-5** Set up the storage account + folder layout (`OD-C9`)
- [ ] **NA-6** Move the homepage to the chosen host; confirm HTTPS
- [ ] **NA-7** Publish script (resize, remove location data, upload)
- [ ] **NA-8** Finishing styles (`OD-C3`); budget alert + lifecycle rule
- [ ] **NA-9** Convert subscription to pay-as-you-go; check first invoice
- [ ] **NA-10** Launch read-only link with the initial 20 people
- [ ] **NA-11** Prepare Stage 2 (`OD-I`, `OD-R`) and the 3-tier VM lab (SP-5)

---

## 11. Glossary

| Term | Meaning here |
|---|---|
| Service | An Azure capability you rent (storage, App Service, database) |
| Microservice | Your own app split into several small apps talking over a network |
| GPv2 | General-purpose v2 storage account; required for static website |
| `$web` | Reserved container that serves the static website |
| HNS | Hierarchical namespace (ADLS Gen2) — keep **off** for static websites |
| LRS | Locally redundant storage; cheapest redundancy |
| Hot / Cool / Archive | Blob tiers: cheaper storage, higher access/min-retention |
| Egress | Outbound data transfer; first 100 GB/month free |
| RBAC | Role-based access control |
| Budget | Cost Management object with alert thresholds |
| ARM template | Declarative JSON describing desired Azure state |
| Bicep | Language that compiles to ARM JSON |
| Vite | Free tool that bundles front-end files for publishing |
| Relative path | A path starting from the site folder (`images/x.jpg`), not `C:\...` |
| `what-if` | Dry-run diff of a deployment against current state |
| Drift | Difference between desired (template) and actual (deployed) state |
| Idempotent | Re-running produces the same end state |
| Subscription-scope | Template that can create RGs, budgets, policy, RBAC |
| Auto-shutdown | Schedule that stops a VM nightly to protect credit |

---

## 12. Changelog

| Date | Change | Reason |
|---|---|---|
| 2026-11-08 | Created file; seeded sessions 1–2 | Persist context across chats/models/reinstalls |
| 2026-11-08 | `git init`, `.gitignore`, initial commit | Tamper-proof history + drift timeline |
| 2026-11-19 | Locked SP-7..SP-11; staged architecture | Product changed to community platform |
| 2026-11-22 | SP-3, SP-4 retired; SP-1 tightened; SP-12 added; §3 regrouped (`OD-H…`, `OD-C…`); schema v2 | Contradiction review + owner wants services grouped; old OD-1…OD-17 folded into groups |
| 2026-11-23 | SP-13 added (HTML/CSS/JS); `OD-C9` paths; rejected options; homepage-is-the-sketch approach | Runtime decision + build approach settled |
| 2026-11-23 | Session 6: `app_v1` contract, containers `c1…c5`, photo model, `ideas.md`, first homepage, SP-14 (`.json`) | App folder structure and first build agreed |
