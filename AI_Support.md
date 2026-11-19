---
project: Photography_app
file: AI_Support.md
purpose: Persistent memory + decision log for AI assistant sessions
schema_version: 1
written_by: AI assistant (sole writer)
last_updated: 2026-11-19
repo_root: C:\Stagging\AZ104_free_sub_project\Photography_app
---

# AI_Support

Single source of truth for context that must survive a new chat, a different model,
an OpenCode reinstall, or a restored disk. Humans are not expected to read this file;
it is optimized for machine re-hydration.

---

## 0. How to use this file (instructions for future AI sessions)

1. Read §0–§3 before answering anything. Do not assume prior context exists.
2. **§2 Sure_Points are locked.** Never re-litigate, soften, or silently change them.
   New certainties are *appended* with the next free `SP-n` id and a dated log entry.
3. §3 Open decisions are fair game for discussion — move an item to DECIDED only when
   the user explicitly says so, and record the rationale.
4. Append to §9 Conversation log; never rewrite or reorder past entries.
5. Preserve existing IDs (`SP-n`, `OD-n`, `NA-n`). Never renumber.
6. Update `last_updated` in the front matter on every write.
7. Modify only files under `repo_root`. Never touch global git config, user profile
   files, or anything outside this folder unless the user explicitly asks.
8. Commit at **milestones only** (`git add -A && git commit -m "..."`), not every
   experiment — the owner does not want exhaustive version control.
9. Keep this file under ~400 lines. If it grows, compress §9 older entries into
   one-line summaries — but never delete a Sure_Point or a changelog row.
10. **Plain language, always (SP-11).** The owner is an Azure admin, not a
    developer. No unexplained jargon; define any necessary term in one line.

---

## 1. Project snapshot

| Field | Value |
|---|---|
| Goal | Publicly reachable, HTTPS **photo community** on Azure: owner's gallery first, community later |
| Product model | "A shop": shop floor = the app; warehouse = one storage account. Read-only showcase now |
| Stage 1 scope | **Read-only gallery of the owner's work**, public, no logins, no uploads — "we are open" |
| Later stages | Stage 2 member accounts + uploads; Stage 3 events/contests with voting |
| Owner intent | Learning-first: understand Azure deeply for an **AZ-104 / cloud admin interview**, not just ship a site |
| Subscription | Free/student subscription; will convert the **same** subscription to pay-as-you-go |
| Cost | Stage 1 target **₹10–50/month**; app stages cost more and get their own measured line |
| Audience | ~**20 known visitors per month** at launch, arriving only when the owner shares the link |
| Domain | **None purchased** — Azure-provided hostnames only |
| Data home | **One** Azure Storage account, three data areas, containers as needed (SP-8) |
| Hosting | **Not decided** — hands-on bake-off, instinct-driven (SP-9) |
| Reference sites | anseladams.com, jimmychin.com, artwolfe.com (look/feel), gurushots.com (events) |
| Working dir | `C:\Stagging\AZ104_free_sub_project\Photography_app` (Windows, pwsh, git 2.54) |

Non-goals near term: custom domain, CDN/Front Door, microservices, native mobile
app, payments, SEO/marketing, multi-region.

The ₹10–50 ceiling (SP-4) applies to **read-only Stage 1**. Stage 2+ exceeds it;
each stage gets a measured cost figure before launch.

---

## 2. Sure_Points (LOCKED — append-only)

| ID | Decision | Rationale | Locked |
|---|---|---|---|
| SP-1 | All data lives centrally in **one Azure Storage account** | Simplicity, one billing surface, one lifecycle policy | 2026-11-05 |
| SP-2 | **No domain purchase**; use Azure default HTTPS hostname | Removes DNS zone, cert purchase, and CA/binding work entirely | 2026-11-05 |
| SP-3 | Method A = **Storage static website** (`$web`), same subscription **converted to pay-as-you-go** | Only option that keeps everything in one storage account at ~₹0 compute | 2026-11-08 |
| SP-4 | Running cost must stay **₹10–50/month**; ~20 known visitors/month | Free-credit discipline; egress and tier choices are designed around it | 2026-11-08 |
| SP-5 | Method B = **full 3-tier on VMs**, repeatedly built and torn down during the free month, for architect-level learning | Deliberate lab, not production; IaaS breadth for interviews | 2026-11-08 |
| SP-6 | IaC is **on hold**; small per-lab templates only later, as DevOps/Terraform learning | User wants understanding first, then automation | 2026-11-08 |
| SP-7 | **One app (monolith) + separate storage.** The app never stores photos on its own disk | Owner requirement: images live apart from the app; app only presents them | 2026-11-19 |
| SP-8 | Storage keeps **three data areas**: owner photos (`your-photos` + private `originals`), member photos (`members-photos`), app records (`app-data`) | Clear separation of owner content, member content, records; masters need their own private container | 2026-11-19 |
| SP-9 | **Hosting service is NOT locked.** Hands-on bake-off; instinct decides; no App Service default | Owner will learn by trying; premature lock rejected | 2026-11-19 |
| SP-10 | Product is a **staged photo community**: Stage 1 owner gallery (read-only) → Stage 2 accounts/uploads → Stage 3 events/voting | "Stage then scale"; each stage ships only when the previous works | 2026-11-19 |
| SP-11 | **Plain language only.** Define any unavoidable term in one line; no developer jargon | Owner is an admin, not a developer | 2026-11-19 |

Derived constraints (consequences, not new decisions):

- **Stage 1 runs no compute** (static website) so it stays inside SP-4.
- Storage account: **Standard GPv2, LRS, hierarchical namespace OFF** (needed for
  static website hosting).
- No Azure DNS zone, no certificate purchase, no custom-domain binding.
- Monolith: whatever host is chosen must run **one app**, not many services.
- Photo files never sit on app storage; the app holds code and settings only.
- Every lab is **delete-by-default** (auto-shutdown for VMs).
- Git: commit at **milestones only**, not every experiment (owner preference).

---

## 3. Open decisions

| ID | Question | Options | Status | Current leaning |
|---|---|---|---|---|
| OD-1 | Azure region | `centralindia` / `southeastasia` / `eastus` | OPEN | closest-to-audience + cheapest; confirm before any deploy |
| OD-2 | Naming prefix + tag set | e.g. `ashphoto`, tags `env`, `owner`, `purpose` | OPEN | short, globally-unique-safe prefix |
| OD-3 | Any server-side behaviour? | none in Stage 1 / accounts+uploads in Stage 2 | **DECIDED 2026-11-19** | Stage 1 none; Stage 2 yes |
| OD-4 | Image publish pipeline | local script vs automated | OPEN | local script first |
| OD-5 | Hotlink / abuse posture | accept public reads vs Front Door/Referer check later | OPEN | accept in Stage 1, revisit if traffic appears |
| OD-6 | Landing-zone template timing | now vs after Stage 1 is hand-built | OPEN | after Stage 1 works manually |
| OD-7 | Template authoring style | hand-written ARM JSON vs Bicep compiled to JSON | OPEN | Bicep source + committed `azuredeploy.json` |
| OD-8 | Look and feel | reference sites: anseladams / jimmychin / artwolfe | OPEN | big single photo, simple menu, work grouped in collections |
| OD-9 | Originals tier | Cool vs Archive | OPEN | **Cool** (Archive retrieval latency/cost not worth it) |
| OD-10 | Off-machine backup | private GitHub remote vs none | OPEN | add later; local `.git` is not a backup |
| OD-11 | VM lab component list | LB, 2× web VMs, DB host, NSGs, Bastion?, NAT? | OPEN | Basic LB (free) + B1s VMs + DB on VM to stay in grant |
| OD-12 | Photo list format | one generated file vs Table Storage | OPEN | one generated file (no runtime dependency) |
| OD-13 | Image sizes | thumbnail + viewing size, exact pixels | OPEN | ~400px WebP thumb, ~1600px viewing |
| OD-14 | Hosting bake-off shortlist | App Service / Container Apps / VMs / Functions / static | OPEN | hands-on testing, instinct decides (SP-9) |
| OD-15 | Member accounts | Entra External ID vs own sign-up vs social login | OPEN | Stage 2 only |
| OD-16 | Records store (database) | Azure SQL free offer vs Cosmos free tier vs Table Storage | OPEN | Stage 2 only; pick by cost + effort |
| OD-17 | Member upload rules | size/format limits, moderation, per-user quota | OPEN | Stage 2 only |

---

## 4. Architecture (staged: app + separate storage)

**Stage 1 — read-only showcase (no app, no logins).**

```
Visitor --HTTPS--> Storage static website address
                      |
                      +-- $web        : pages, styles, thumbnails
                      +-- your-photos : viewing-size images (public)
                      +-- originals   : full-size masters (private, Cool tier)
                      +-- app-data    : photo list + captions (one file)
```

**Stage 2+ — community (one app, storage kept separate).**

```
Visitor --HTTPS--> App (single app; host TBD) --reads/writes--> Storage account
                                                                  |-- your-photos
                                                                  |-- members-photos
                                                                  |-- app-data (records)
```

Design rules:

- The app never keeps photos; it only gives visitors a link.
- One app, one deployment, three internal rooms (owner, members, events). Split
  only if evidence demands it.
- Database choice deferred to Stage 2 (OD-16).
- Stage 1 stays inside ₹10–50/month; each later stage gets a measured cost line.
- Two image sizes: thumbnail for browsing, ~1600px for viewing. Masters private.
- Remove camera location data before publishing (privacy).
- Publish is a local script, not a web portal.

Deferred until justified: Front Door, Log Analytics, microservices.

---

## 5. Roadmap

**Stage 0 — foundations (done)**
- [x] Record Sure_Points and open decisions in this file
- [x] `git init` the project folder
- [x] Lock product shape, architecture, and staging (SP-7..SP-11)

**Stage 1 — read-only gallery, public launch (NEXT)**
- [ ] Answer OD-1 (region) and OD-2 (naming/tags)
- [ ] Manually create storage account in portal; enable static website
- [ ] Create containers; upload a hello-world page; confirm the HTTPS address
- [ ] Choose the look from the reference sites (OD-8)
- [ ] Build the pages + the photo list file
- [ ] Publish script: resize, remove location data, upload
- [ ] Create budget alert + lifecycle rule for originals
- [ ] Share the link with the 20 people

**Stage 2 — members (later)**
- [ ] Hosting bake-off, hands-on (OD-14); decide by instinct
- [ ] Accounts (OD-15) and records store (OD-16)
- [ ] Upload with limits/moderation (OD-17)

**Stage 3 — events (later)**
- [ ] Contests, entries, voting, results

**Lab track — parallel, delete-by-default**
- [ ] 3-tier VM lab (SP-5)
- [ ] App Service / Container Apps / Functions comparisons
- [ ] Small templates only if a lab needs them (SP-6)

---

## 6. Cost model — Stage 1 (~₹85/$)

| Item | Volume | Unit price | Monthly |
|---|---|---|---|
| Web renditions — Hot LRS | ~3 GB | ~$0.018/GB | ~₹5 |
| Originals — **Cool** LRS | ~30 GB | ~$0.010/GB | ~₹26 |
| Transactions | ~20 visitors | negligible | <₹1 |
| Egress | ~60 MB (first 100 GB/mo free) | $0 | ₹0 |
| **Estimated total** | | | **~₹32** ✅ |

Guardrails:
- Budget alert at **₹100** (hard ceiling vs expected ~₹32).
- Lifecycle rule: move originals Hot→Cool; never auto-delete masters.
- **Early deletion fees:** Cool = 30-day minimum, Archive = 180-day minimum.
  Build/delete cycles during the VM month can trigger these — prefer
  delete-then-recreate over tier flipping.
- Storage keys are not exported by ARM; never commit keys or SAS tokens.
- Converting to pay-as-you-go keeps always-free tiers and 12-month free grants,
  but **Student credit does not carry over**.

---

## 7. IaC status — ON HOLD (SP-6)

Reserved folder: `Master_landing_zone_v1\` (currently empty).

When resumed:
- Author a **subscription-scope** template (`subscriptionDeploymentTemplate.json`)
  so it can create the resource group, budget, policy assignment, and RBAC.
- Storage name via `[format('st{0}photo', uniqueString(subscription().subscriptionId, resourceGroup().name))]`.
- `deploymentMode: Incremental` for idempotent redeploys.
- Gate every deploy with `az deployment sub what-if`.
- Target: rebuild "everything to date" in any new subscription with one command.

### Why we author forward instead of trusting portal export

Portal **Export template** (and `az group export`) is a snapshot, not a source of
truth. It does **not** capture: the resource group itself, **budgets**, **policy
assignments**, **role assignments**, resource locks, diagnostic settings/alerts,
subscription-scope resources, or secrets. Names come back hardcoded, not
parameterized.

Known-good workflow (this is also the interview story):
intended template → `what-if` → deploy → `az group export` → **diff** →
catalogue every non-exportable gap → optionally flip a setting in the portal to
prove drift is detected.

Illustrative diff:
```
budget/monthly-100            MISSING in export  (subscription scope)
roleAssignment: Reader        MISSING in export
storage.allowBlobPublicAccess expected false, actual true
storage.minTlsVersion         expected TLS1_2, actual TLS1_0
staticWebsite.error404Path    expected 404.html, actual unset
```

Interview framing (STAR): situation = cost-capped greenfield landing zone;
task = prove the template is authoritative and know its blind spots; action =
forward-authored template + what-if gate + export diff + intentional drift test;
result = rebuild in minutes, zero click-ops, documented list of non-exportable
resource types, cost guardrails as code. Follow-ups it invites: drift strategy,
why not just export, secrets handling.

---

## 8. File map

```
Photography_app\
├── .git\                     local version history (not a backup)
├── .gitignore                secrets, scratch, OS noise
├── AI_Support.md             THIS FILE — AI memory + decision log (AI-written)
├── Master_landing_zone_v1\   reserved for subscription-scope ARM (empty; on hold)
├── labs\                     (planned) per-option implementations
│   ├── 01-storage-static\    Stage 1 — read-only gallery
│   ├── 02-app-service-f1\    hosting bake-off candidate
│   ├── 03-functions-api\     later, optional dynamic bits
│   ├── 04-vm-3tier\          architect lab (SP-5)
│   └── 05-static-web-apps\   hosting bake-off candidate
├── pipeline\                 (planned) resize / strip location data / upload
└── docs\                     (planned) decision log exports, cost screenshots,
                              interview notes
```

Git conventions:
- Commit at **milestones only** — not every experiment (owner preference 2026-11-19).
- Branch `main` is the record.
- Commit style: `area: what changed` (e.g. `site: add gallery manifest generator`).
- Exported actual-state JSON **is** committed — that is the drift timeline.
- Repo-local identity is set (`ashar` / `ashar@local`); global git config untouched.
- No remote yet (OD-10).

---

## 9. Conversation log (append-only)

### 2026-11-05 — Session 1: scoping
- Established goal: public HTTPS photography showcase on Azure; owner learning for
  AZ-104/admin interviews, not just shipping.
- Locked SP-1 (single storage account) and SP-2 (no domain).
- Explained that no-domain removes the usual "custom domain needs CDN/Front Door
  for SSL" problem → Storage static website is viable at ~₹0 compute.
- Presented hosting options matrix (storage static, SWA, App Service F1, Functions,
  Container Apps, VM 3-tier, AKS) with cost/AZ-104-value/fit columns; recommended
  decoupling **data** (one storage account) from **presentation** (multiple labs).
- Explained portal Export template limits; recommended forward-authored template +
  `what-if` + export diff as the drift story.

### 2026-11-08 — Session 2: decisions + memory file
- Owner confirmed: free/student subscription, cost ≈₹0 is a hard requirement.
- Locked SP-3..SP-6 (static website → PAYG; ₹10–50 ceiling / ~20 visitors;
  VM 3-tier lab built-and-torn-down; IaC on hold).
- Cost math accepted: Hot renditions ~₹5 + Cool originals ~₹26 ≈ **₹32/month**.
- Explained `git init` rationale: tamper-proof AI_Support, dated drift timeline
  from committed exports, safe lab teardown/restore. Not an off-machine backup.
- Ran `git init -b main`, set repo-local identity, wrote `.gitignore` and this file.

### 2026-11-19 — Session 3: product shape + staged architecture
- Owner rejected "portfolio only": the goal is a community platform — owner's work,
  member posts, and events (GuruShots-style). Reference sites: anseladams.com,
  jimmychin.com, artwolfe.com.
- Agreed staged delivery: Stage 1 read-only gallery → Stage 2 accounts + member
  uploads → Stage 3 events/voting. "Stage then scale."
- Locked SP-7..SP-11: one app + separate storage in three data areas; hosting
  NOT locked (hands-on bake-off, instinct); staged product; plain-language rule.
- Corrections: monolith describes the app code, not data location — storage stays
  separate (owner's requirement). Owner does not want exhaustive version control;
  commits at milestones only.
- Stage 1 confirmed: read-only, world-visible, no logins.

---

## 10. Next actions

- [ ] **NA-1** Answer OD-1 (region) and OD-2 (prefix/tags)
- [ ] **NA-2** Manually create the storage account in the portal (GPv2/LRS/no HNS),
      enable static website, create the containers (site, photos, private masters, records)
- [ ] **NA-3** Upload a hello-world page and confirm the HTTPS address loads
- [ ] **NA-4** Pick the look from the references (OD-8); sketch pages in plain words
- [ ] **NA-5** Build the pages + the photo list file
- [ ] **NA-6** Write the publish script (resize, remove location data, upload)
- [ ] **NA-7** Create budget alert at ₹100; add lifecycle rule for originals
- [ ] **NA-8** Convert subscription to pay-as-you-go; check the first invoice delta
- [ ] **NA-9** Launch: share the read-only link with the initial 20 people
- [ ] **NA-10** Prepare the Stage 2 hosting bake-off (OD-14) and 3-tier VM lab (SP-5)

---

## 11. Glossary (terms used in this project)

| Term | Meaning here |
|---|---|
| GPv2 | General-purpose v2 storage account; required for static website hosting |
| `$web` | Reserved container that serves the static website endpoint |
| Static website endpoint | `<account>.z##.web.core.windows.net`, anonymous read, HTTPS included |
| HNS | Hierarchical namespace (ADLS Gen2) — must stay **off**; incompatible |
| LRS | Locally redundant storage; cheapest redundancy |
| Hot / Cool / Archive | Blob access tiers: storage price down, access/latency/min-retention up |
| Egress | Outbound data transfer; first 100 GB/month free per billing account |
| SAS | Shared Access Signature — scoped, time-limited URL token |
| RBAC | Role-based access control (e.g. Storage Blob Data Contributor) |
| Budget | Cost Management object with thresholds + action group alerts |
| ARM template | Declarative JSON describing desired Azure state |
| Bicep | DSL that compiles to ARM JSON |
| `what-if` | Dry-run diff of a deployment against current state |
| Drift | Divergence between desired (template) and actual (deployed) state |
| Idempotent | Re-running produces the same end state (Incremental mode) |
| Subscription-scope deployment | Template that can create RGs, budgets, policy, RBAC |
| Auto-shutdown | Dev/Test schedule that stops a VM nightly to protect credit |
| Monolith | One app containing all features (the chosen shape, SP-7) |
| Microservices | Many small apps, each separate (not chosen) |
| Container (storage) | A folder inside a storage account |
| Database | A filing cabinet for records: users, captions, votes |
| App Service | Azure's managed place to run a web app |
| Static website | Plain files served directly by storage; no app running |

---

## 12. Changelog

| Date | Change | Reason |
|---|---|---|
| 2026-11-08 | Created file; seeded §0–§12 from Sessions 1–2 | Persist context across chats/models/reinstalls |
| 2026-11-08 | `git init -b main`, `.gitignore`, initial commit | Tamper-proof history + drift timeline |
| 2026-11-19 | Locked SP-7..SP-11; restructured architecture/roadmap | Product changed from portfolio to staged community platform; hosting left open |
