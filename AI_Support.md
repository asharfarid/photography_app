---
project: Photography_app
file: AI_Support.md
purpose: Persistent memory + decision log for AI assistant sessions
schema_version: 1
written_by: AI assistant (sole writer)
last_updated: 2026-11-08
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
8. Commit after every meaningful change (`git add -A && git commit -m "..."`).
9. Keep this file under ~400 lines. If it grows, compress §9 older entries into
   one-line summaries — but never delete a Sure_Point or a changelog row.

---

## 1. Project snapshot

| Field | Value |
|---|---|
| Goal | Publicly reachable, HTTPS photography showcase on Azure |
| Owner intent | Learning-first: understand Azure deeply for an **AZ-104 / cloud admin interview**, not just ship a site |
| Subscription | Free/student subscription; Method A track converts the **same** subscription to pay-as-you-go |
| Cost ceiling | **₹10–50 per month (~$0.12–0.60)** for the running showcase |
| Audience | ~**20 known visitors per month**, arriving only when the owner shares the link |
| Domain | **None purchased** — Azure-provided hostnames only |
| Data home | **One** Azure Storage account holds site + photos + metadata |
| Working dir | `C:\Stagging\AZ104_free_sub_project\Photography_app` (Windows, pwsh, git 2.54) |
| Session date baseline | 2026-11-05 → 2026-11-08 |

Non-goals (v1): custom domain, CDN/Front Door, database, user accounts, public
self-service upload, SEO/marketing, multi-region.

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

Derived constraints (consequences, not new decisions):

- Storage account must be **Standard GPv2, LRS, hierarchical namespace OFF**
  (static website hosting is unsupported on ADLS Gen2).
- No Azure DNS zone, no App Service certificate, no custom-domain binding.
- Method A runs no compute → no idle spend.
- Method B must be built with **auto-shutdown / delete-by-default** habits.

---

## 3. Open decisions

| ID | Question | Options | Status | Current leaning |
|---|---|---|---|---|
| OD-1 | Azure region | `centralindia` / `southeastasia` / `eastus` | OPEN | closest-to-audience + cheapest; confirm before any deploy |
| OD-2 | Naming prefix + tag set | e.g. `ashphoto`, tags `env`, `owner`, `purpose` | OPEN | short, globally-unique-safe prefix |
| OD-3 | Any server-side behaviour in v1? | none / contact form / search / client-proofed galleries | OPEN | none (keeps ₹0 compute) |
| OD-4 | Image publish pipeline | local script (PowerShell/Python) vs GitHub Actions | OPEN | local script first |
| OD-5 | Hotlink / abuse posture | accept public blob reads vs Front Door/Referer check later | OPEN | accept in v1, revisit if traffic appears |
| OD-6 | Landing-zone template timing | now vs after Method A is hand-built and understood | OPEN | after Method A works manually |
| OD-7 | Template authoring style | hand-written ARM JSON vs Bicep compiled to JSON | OPEN | Bicep source + committed `azuredeploy.json` |
| OD-8 | Front-end stack | vanilla HTML/CSS/JS vs static site generator | OPEN | vanilla + build-time JSON manifest |
| OD-9 | Originals tier | Cool vs Archive | OPEN | **Cool** (Archive retrieval latency/cost not worth it) |
| OD-10 | Off-machine backup | private GitHub remote vs none | OPEN | add later; local `.git` is not a backup |
| OD-11 | VM lab component list | LB, 2× web VMs, DB host, NSGs, Bastion?, NAT? | OPEN | Basic LB (free) + B1s VMs + DB on VM to stay in grant |
| OD-12 | Photo metadata store | generated JSON manifest vs Table Storage | OPEN | JSON manifest (no runtime dependency) |
| OD-13 | Gallery image sizing | thumbnail + lightbox renditions, exact px/format | OPEN | ~400px WebP thumb, ~1600px WebP lightbox |

---

## 4. Chosen architecture — v1 (Method A)

```
                        HTTPS (Azure default hostname)
                                    |
                    <account>.z##.web.core.windows.net
                                    |
        +---------------------------+---------------------------+
        |            Storage Account (GPv2, LRS, no HNS)        |
        |                                                       |
        |  $web            public  static site + thumbnails     |
        |  photos          public  web renditions (WebP)        |
        |  originals       private full-res masters (Cool)      |
        |  data            public  gallery manifest JSON        |
        +-------------------------------------------------------+
```

Design rules:

- **Two-tier images:** small WebP thumbnails in the grid, ~1600px rendition in the
  lightbox. Masters never served. This is the egress control.
- **Originals in Cool**, web renditions in Hot.
- **Content-hashed filenames** + `Cache-Control: public, max-age=31536000, immutable`.
- **EXIF/GPS stripped** on publish (privacy); masters keep EXIF.
- Custom **404 page** via static website `errorDocument404Path`.
- No JS framework, no API, no database. Gallery manifest is a build artifact.
- Publish is a **local script**, not a web portal.

Deferred until justified: Front Door Standard (~$35/mo base — rejected for now),
Functions API, SWA, Entra-protected upload portal, Log Analytics.

---

## 5. Roadmap

**Phase 0 — foundations (current)**
- [x] Record Sure_Points and open decisions in this file
- [x] `git init` the project folder
- [ ] Answer OD-1 (region) and OD-2 (naming/tags)

**Phase 1 — Method A: the real showcase**
- [ ] Manually create storage account + static website in portal (learning, no template)
- [ ] Build gallery HTML/CSS/JS + manifest generator
- [ ] Publish pipeline: resize → WebP → strip EXIF → `azcopy`
- [ ] Budget + alert, lifecycle rule, cache headers
- [ ] Verify HTTPS URL on the default storage endpoint

**Phase 2 — cost/ops hardening**
- [ ] Confirm monthly spend inside ₹10–50 for 2 billing cycles
- [ ] Document measured costs in §6
- [ ] Hotlink-abuse check only if traffic materializes

**Phase 3 — Method B: 3-tier VM lab**
- [ ] VNet + subnets + NSGs
- [ ] 2× B1s web VMs (free-account 750 h/mo grant) + Basic LB (free)
- [ ] DB on a VM (avoid paid PaaS SQL)
- [ ] Auto-shutdown; delete resource group after each experiment
- [ ] Capture screenshots/notes for interview stories

**Phase 4 — optional breadth**
- [ ] App Service F1 alternative rendering the same library
- [ ] Functions consumption API (contact/search)
- [ ] Static Web Apps comparison
- [ ] Small ARM/Bicep templates per lab (resumes SP-6 learning track)

---

## 6. Cost model (Method A, ~₹85/$)

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
├── labs\                     (planned) per-method implementations
│   ├── 01-storage-static\    Method A — the real showcase
│   ├── 02-app-service-f1\    later comparison
│   ├── 03-functions-api\     later, optional dynamic bits
│   ├── 04-vm-3tier\          Method B — architect lab
│   └── 05-static-web-apps\   later comparison
├── pipeline\                 (planned) resize / EXIF strip / WebP / azcopy
└── docs\                     (planned) decision log exports, cost screenshots,
                              interview notes
```

Git conventions:
- Branch `main` is the record; commit after each meaningful step.
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

---

## 10. Next actions

- [ ] **NA-1** Answer OD-1 (region) and OD-2 (prefix/tags)
- [ ] **NA-2** Manually build Method A in the portal: storage account (GPv2/LRS/no HNS),
      enable static website, create containers, upload a hello-world `index.html`
- [ ] **NA-3** Verify the `*.web.core.windows.net` HTTPS URL loads
- [ ] **NA-4** Design gallery manifest schema + build the front end
- [ ] **NA-5** Write publish script (resize, WebP, EXIF strip, azcopy, cache headers)
- [ ] **NA-6** Create budget + alert at ₹100; add lifecycle rule for originals
- [ ] **NA-7** Convert subscription to pay-as-you-go and verify first invoice delta
- [ ] **NA-8** Start Method B lab plan (OD-11) and note AZ-104 objectives per component

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

---

## 12. Changelog

| Date | Change | Reason |
|---|---|---|
| 2026-11-08 | Created file; seeded §0–§12 from Sessions 1–2 | Persist context across chats/models/reinstalls |
| 2026-11-08 | `git init -b main`, `.gitignore`, initial commit | Tamper-proof history + drift timeline |
