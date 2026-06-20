# STAGE 2 — Trustscan Company Contacts (MA workflow)

> **Workflow ID:** `DmaKVjkSXjdqbOnl` · **File:** `Trustscan Company Contacts Stage 2 - MA.workflow.ts` · **Sheet doc:** `1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE`
>
> This document explains the **logic** of Stage 2 — what each phase tries to achieve, how data flows between them, and the rules that govern source attribution, field coverage, and control state. It is not a node-by-node inventory; the workflow file (and its `<workflow-map>` header) is the authoritative source for that.
>
> **When to update this doc:** only when the logic changes — new gating rule, new collector, new attribution semantic, new sheet schema, new state transition, new sandbox gotcha. Adding/removing a node that doesn't change behaviour is not a doc change.

---

## 0. Pipeline context — where Stage 2 fits

Stage 2 is the **third** workflow in a four-workflow pipeline. The whole pipeline turns a list of company identifiers (NIPC + legal name from the master `INPUT_SNAPSHOT` sheet) into per-company contact-data evidence (email / phone / address) in `CONTROL_EVIDENCE`. Two sheets carry state across the stages: `URL_CHECKS` (per-entity URL state) and `CONTROL_EXEC` (per-entity phase/status).

```
INPUT_SNAPSHOT (NIPC + legal name)
        │
        ▼
┌──────────────────────────┐
│  STAGE 1 — URL Validation │     workflow file: "Trustscan Company Contacts Stage 1 - URL Validation.workflow.ts"
│  Reads INPUT_SNAPSHOT;    │     ── writes URL_CHECKS.Response_class = SUCCESS | NO_URL | <transport error>
│  HEAD/GET-tests any URL   │     ── writes CONTROL_EXEC.Current_phase = STAGE 1, Process_Status = DONE
│  the input already has.   │
└──────────────────────────┘
        │
        ▼   (entities with Response_class = NO_URL → next workflow)
┌──────────────────────────┐
│  URL_DISCOVER_HYBRID     │     workflow file: "URL_DISCOVER_HYBRID.workflow.ts"  (ID: s2kskrjBoXoUh0fR)
│  For NO_URL entities,    │     ── inner-joins URL_CHECKS (NO_URL) with INPUT_SNAPSHOT to get the legal name
│  discovers a candidate   │     ── strips PT corporate suffixes (Lda., S.A., Unipessoal…) to a clean Search_name
│  URL via SerpAPI + OpenAI│     ── fans out three signal sources: SerpAPI organic top-10, SerpAPI Knowledge Graph,
│  websearch + GPT judge.  │        OpenAI websearch with json_schema response (PT locale, aggregator blocklist)
│  Validates by fetching   │     ── aggregates and ranks candidates per host (KG > OpenAI > organic; NIF-in-snippet boosts)
│  the candidate and       │     ── GPT-4.1-mini judge picks the official site (or falls back to high-trust signals)
│  scanning for the NIPC.  │     ── fetches homepage + 8 path candidates, scans cleaned HTML for the NIPC digits
└──────────────────────────┘     ── writes URL_CHECKS.Response_class = URL_DISCOVERED | URL_LIKELY | URL_FOUND_NOT_RESPONDING | NO_URL_FOUND
        │                         ── writes CONTROL_EXEC.Current_phase = DISCOVERING_URL_PHASE, Process_Status = DONE,
        │                            Next_action = STAGE 2 (when a URL was found) or STAGE 3 (no URL)
        ▼
┌──────────────────────────┐
│  STAGE 2 — MA            │     ◄── you are here. Reads URL_CHECKS where a URL exists,
│  Collects email/phone/   │        runs Collector A (SerpAPI + scrape) and Collector B (Firecrawl), writes
│  address into            │        per-value rows to CONTROL_EVIDENCE.
│  CONTROL_EVIDENCE.       │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│  STAGE 3 — Research       │    workflow file: "STAGE_3_RESEARCH.workflow.ts"  (ID: EtfFFrnxUDJ9cuxa)
│                           │    doc: STAGE_3_RESEARCH.md
│                           │    (for entities with no URL or missing fields; consumes CONTROL_EVIDENCE)
└──────────────────────────┘
```

### What MA expects on input

Stage 2 reads from `URL_CHECKS`. For every row:

- It needs `Final_url` (or seed-style `Final_URL`) populated **with a real URL**. Stage 1 supplies these for input rows that already had a URL; HYBRID writes `Final_url = Candidate_URL` on its success branch.
- It needs `Response_class` populated. Values that may be present after Stages 1 + HYBRID:

  | `Response_class` | Source | Has URL? | MA processes? |
  |---|---|---|---|
  | `SUCCESS` | Stage 1 (URL provided and responded) | ✅ | ✅ |
  | `URL_DISCOVERED` | HYBRID (URL found + NIF confirmed on a page) | ✅ | ✅ |
  | `URL_LIKELY` | HYBRID (URL found + homepage responded, NIF not confirmed) | ✅ | ✅ |
  | `URL_FOUND_NOT_RESPONDING` | HYBRID (URL found but homepage didn't load) | ✅ | ❌ — explicitly skipped in `Normalize Input` (`SKIP_CLASSES`). Scraping would waste SerpAPI/Firecrawl budget. |
  | `NO_URL` | Stage 1 (no URL in input, HYBRID hasn't run yet) | ❌ | ❌ — `Gate Has URL` drops it |
  | `NO_URL_FOUND` | HYBRID (couldn't find any candidate) | ❌ | ❌ — `Gate Has URL` drops it |
  | (transport errors from Stage 1: DNS, ECONNREFUSED, …) | Stage 1 | URL exists but unreachable | ❌ — `Gate Has URL` typically drops (empty Final_url for these) |

  In short: MA processes only rows where Stage 1 confirmed a working URL **or** HYBRID confirmed a likely / verified one. Everything else is short-circuited.

### What MA writes back

- `CONTROL_EVIDENCE` — appends one row per (`Entity_key`, `Field`, `Value`) tuple. `Source_type` distinguishes collectors: `serpapi` (snippet/KG), `scrape` (HTML extraction), `firecrawl` (markdown extraction). `input` and `openai` are reserved.
- `CONTROL_EXEC` — three writes per entity at most:
  1. At Stage 2 start: `Current_phase = STAGE 2, Process_Status = IN_PROGRESS, Queued_action = SERPAPI`.
  2. At Collector A end, if all 3 fields found: `Process_Status = DONE` (no Firecrawl needed).
  3. After Firecrawl: `Process_Status = DONE, Queued_action = FIRECRAWL`.

The orchestrator (Stage 3 or human triage) keys on `Exec_key = RUN_ID + "_" + EntityKey` and `Process_Status = DONE` to know which entities are ready for downstream validation.

### Run-ID continuity across stages

`RUN_ID` is set by Stage 1 and propagated through HYBRID and MA unchanged. HYBRID's `JoinFilterCleanName` explicitly carries forward each entity's Stage-1 `Run_ID` (with a millisecond-derived fallback only for hand-seeded rows without one). MA's `Normalize Input` reads the same `Run_ID`. This makes `CONTROL_EVIDENCE` rows queryable per pipeline run.

---

## 1. Purpose

For each company website (read from `URL_CHECKS`), Stage 2 collects three contact fields:

| Field | Examples |
|---|---|
| `email` | `info@e-redes.pt`, `geral@colegioaquinta.com` |
| `phone` | `218100100`, `0034981185400` (Portuguese / Spanish, normalised) |
| `address` | `Rua Camilo Castelo Branco, 43. 1050-044 Lisboa` |

Every value found is appended as one row in `CONTROL_EVIDENCE` with attribution (which collector found it, on which subpage). The workflow then advances the company's state in `CONTROL_EXEC` so the orchestrator (Stage 1 / Stage 3) knows what's next.

---

## 2. Two collectors, sequential, gated

The workflow runs **two collectors in series**, with a coverage gate between them.

```
┌─ COLLECTOR A — SerpAPI + HTML scrape (always runs, per-company) ──────┐
│   One own-domain SerpAPI call + Knowledge Graph + homepage/contact    │
│   page HTML scrape. Aggregates per-company, then loops to next.       │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ (after ALL companies finish Collector A)
                  ┌─────── coverage gate ──────────┐
                  │ For this company, do we have   │
                  │  email AND phone AND address?  │
                  └──────────┬─────────┬───────────┘
                          yes│         │no (≥1 missing)
                             ▼         ▼
                   ┌─ scraper-only ┐  ┌─ COLLECTOR B — Firecrawl ──────┐
                   │ Process_Status│  │  Crawl ≤8 contact-style pages  │
                   │   = DONE      │  │  on the company's own domain.  │
                   └───────────────┘  │  Extract ONLY missing fields.  │
                                      │  Append rows to evidence.      │
                                      └────────────────────────────────┘
                                              │
                                              ▼
                                      Process_Status = DONE
                                      Queued_action  = FIRECRAWL
```

**The gate is the heart of the design.** Firecrawl is paid and slow. If SerpAPI + scrape already gave us all three fields, we don't pay for Firecrawl.

**Sequential execution.** `Loop Over Companies` (SplitInBatches v3) runs the SerpAPI/scrape sub-flow N times via `out(1)` (per-iteration). When the last company finishes, `out(0)` (done) fires once, triggering the bulk write to `CONTROL_EVIDENCE` and then the Firecrawl branch. Firecrawl never starts before Collector A completes for all companies.

---

## 3. Trigger

A single **`Phase 1 Trigger`** (manual). The whole pipeline runs end-to-end: read `URL_CHECKS` → normalise → loop Collector A → bulk write → coverage gate → maybe Collector B per company.

The historical second trigger (`Phase 2 Trigger`) was removed; both phases now run from the single trigger.

---

## 4. Per-company loop (Collector A)

After `URL_CHECKS` is read and normalised, every company flows through `Loop Over Companies`. Inside the loop, for each company:

### 4.1 SerpAPI — one own-domain call

| Step | What |
|---|---|
| `Wait Before SerpAPI` | 2 s pacing wait per iteration |
| `Search SerpAPI` | One Google query: `site:<host>` (host only — no `www.`, no `inurl:` chain). Engine `google`, `gl=pt`, `hl=pt`, `num=10` |
| `Parse SerpAPI Results` | Extract emails/phones/addresses from each organic snippet + title; merge with Knowledge Graph; rank emails (own-domain + preferred prefix > own-domain > preferred prefix > first); keep one best value per field; build per-value `SerpAPI_ContactMap = { value: { url, sourceType: 'serpapi' } }` from the organic-result link the value was extracted from |

**Why one query.** A keyword-targeted variant (`site:<host> (contacto OR contactos OR contact OR "fale connosco")`) was A/B-tested on 20 companies (execution 4405) and delivered 2.5× more own-domain contact URLs. It was deployed to production but coincided with deterministic n8n cloud worker crashes (`status: crashed`, `isArtificialRecoveredEventItem` everywhere). After a full byte-equivalent rollback to the pre-change `site:<host>` form the crashes continued for several runs, then cleared on n8n's side — strongly suggesting the crashes were an n8n cloud platform issue, not a query-shape issue. The keyword-targeted variant can be re-attempted now that the platform is stable; current production is the simple `site:<host>` form.

**Why own-domain only.** Third-party sites (aggregators, gov directories) are filtered: every link kept must satisfy `homeDomain && link.includes(homeDomain)`. The contractual ask is "what's published on the company's site, not what aggregators redistribute."

**Why Knowledge Graph is dead.** KG only fires for entity-name queries (`Continente`), never for `site:` operators. The branch is retained for defensive parity but `kg.email/phone/address` was null in test responses.

### 4.2 HTML scrape — homepage + ranked subpages

In the same loop iteration (after SerpAPI parsing):

1. **`Fetch Homepage`** — fetch the company website (15 s timeout, 2 retries, 1.5 s wait between, custom UA / Accept-Language `pt-PT,pt;q=0.9`).
2. **`Build Candidate URLs`** — fan-out: emit homepage as one item plus up to 8 candidate subpages. Sources, in priority:
   - SerpAPI's `SerpAPI_ContactUrls` (seeded into `foundHrefs`).
   - Anchor tags on the homepage whose `href` or visible text matches `CONTACT_KEYWORDS` (contact / contacto / sobre / about / legal / equipa / etc.) — but only if the absolute href's hostname (after `replace(/^www\./, '')`) **equals** the homepage's hostname. Cross-domain anchors are dropped.
   - A hard-coded fallback list: `/contactos`, `/contacto`, `/contatos`, `/contato`, `/contact`, `/contact-us`, `/get-in-touch`, `/reach-us`, `/sobre-nos`, `/about`, `/about-us`, `/quien-somos`, `/nosotros`, `/quem-somos`.
   - Ranked: contact pages > about/who-we-are > team > legal. Top 4 ranked subpages plus the synthetic fallbacks, deduped, capped at 8.
3. **`Fetch Candidate`** — fetch each subpage (20 s timeout, 2 retries, 2 s wait between).
4. **`Aggregate And Compare`** — collect all fetched HTML for the company, run extractors per page, then per-value attribution (see §4.3).

Extractors:

- **Emails:** `mailto:` href + plain-text email regex (Latin-1 supplement allowed in local-part for accented domains). Junk filter: image / font / Wix / Sentry / `noreply@` / fake placeholder domains.
- **Phones:** `tel:` href + strict PT/ES regex. Validates against valid area-code prefixes (PT landline 2xx, mobile 91/92/93/96, toll-free 800/808; ES requires country code, mobile/landline 6xx/7xx/8xx/9xx). Rejects values whose digit count isn't 9 / 11 / 12 / 13. Rejects values equal to `EntityKey` (NIF would otherwise match).
- **Addresses:** street keyword (`Rua | Avenida | Av. | Praça | Largo | Estrada | Travessa | Calçada | Alameda | Beco | Calle | Carrer | Plaza | Edificio | Pol. Ind.` + variants) + `[\s\S]{5,160}`, then `trimAddr` (see §4.4).
- **JSON-LD:** `email` and `telephone` only — JSON-LD addresses tend to be a `PostalAddress` object (`streetAddress` / `postalCode` / `addressLocality`) and concatenating them safely is brittle; left to the regex extractor.

**Memory pattern — per-page `processPage` discards immediately.** HTML for each candidate is processed once, values are merged into per-value source maps (`scrapeEmailMap`, `scrapePhoneMap`, `scrapeAddrMap` — `value → srcUrl`), then the HTML string is dropped. Holding all 8 fetched pages in memory at once was crashing runs on companies with heavy pages. Subpages are processed first so a contact page's value wins over a homepage one if duplicated; homepage is processed last with empty `srcUrl` (so homepage hits show no `SerpAPI_ContactUrls`).

### 4.3 Source attribution rule

Per-value, when both SerpAPI and the HTML scraper found a value:

| Field | If literal value appears in SerpAPI snippet/KG | Otherwise |
|---|---|---|
| email | `serpapi`, `SerpAPI_ContactUrls = SerpAPI_ContactMap[v].url` | `scrape`, `SerpAPI_ContactUrls = scrapeEmailMap.get(v)` (page where the scraper found it; empty if homepage) |
| phone | `serpapi` (same logic) | `scrape` (same logic) |
| address | `serpapi` (same logic) | `scrape` (same logic) |

> **Discovery vs extraction.** A scrape value tagged `scrape` may still have come from a URL SerpAPI surfaced (because SerpAPI URLs are seeded into the candidate list). The label reflects which mechanism extracted the literal text from HTML/snippet, not which channel discovered the URL. This is the chosen taxonomy: SerpAPI gets credit only when its own snippet contained the value; otherwise, the HTML extractor that produced the literal value is credited. We considered crediting SerpAPI for surfacing the URL even when the scraper extracted the value, but rejected it — `scrape` more honestly answers "what produced the string we wrote."

Each row is **per-value** (one email = one row). `Source_url` is always the company's `Website_URL`; `SerpAPI_ContactUrls` is the specific subpage URL the value was found on (or empty for homepage hits).

### 4.4 Address-trimming logic (`trimAddress` and the scrape-side `trimAddr`)

SerpAPI snippets and HTML pages both produce addresses surrounded by phone numbers, emails, country names, and arbitrary noise (`. Robert R. is the owner`, `River View Hotel`, etc.). Trimming on the SerpAPI side runs in steps:

1. **Hard separators** — cut at the first `;`, `|`, `–`, or `—` (provided we already have ≥8 chars of address).
2. **Contact-info / noise keywords** — cut before the earliest occurrence of `Telefone | Telemóvel | Tel | Telf | Tlf | Fax | Email | NIF | CONTATO | Contato | Contact | Actividade | Pagamentos | Vendas | River | View | Office | Robert | Código | COMÉRCIO | www.` (provided ≥8 chars precede).
3. **Postal-code anchor — MANDATORY.** Find PT (`DDDD-DDD`) or ES (5 standalone digits). **If no postal code is present, return empty.** After the postal code, allow up to 30 chars (the city tail), stopping at `.;|–—·`.
4. **Final cap** at 120 chars; strip trailing punctuation/whitespace (including middle-dot `·`).

The SerpAPI side and the scrape-side `trimAddr` now share the same precision rule: **postal code is required.** Without it the trimmed value is a partial address fragment — the typical failure mode is a snippet like `Colégio A Quinta, Rua Entre Vinhas · Contacto · …` from a truncated Google snippet, which previously left `Rua Entre Vinhas ·` as the SerpAPI-tagged row even though the HTML scrape extracted the full `Rua Entre Vinhas Recoveiro 2725-506 Algueirão` from the same site. The scrape side already enforced this; aligning the SerpAPI side prevents the duplicate-noisy-row pattern in `CONTROL_EVIDENCE`. Earlier versions returned the raw match and we got values like `Rua do Amparo, aumentando a intensidade da cor...` from prose text. The postal-code requirement is the single biggest false-positive filter.

---

## 5. Sheet write — `CONTROL_EVIDENCE`

After Collector A's loop finishes for **all** companies, `Wait Before Phase 1 Write` (2 s) precedes one batched `append` write to `CONTROL_EVIDENCE`. Every collector (A and B) appends to the same sheet — the `Source_type` column distinguishes them.

Schema (header order is enforced via `defineBelow` with explicit `schema: []`):

```
Run_ID  Entity_key  Field (phone | email | address)  Value  Source_url
Source_type  (input | serpapi | scrape | openai)  Confidence  Extracted_at
SerpAPI_ContactUrls
```

`Source_type` values currently in use:

- `input` — value carried from `URL_CHECKS` (Stage 1)
- `serpapi` — value found in SerpAPI snippet or Knowledge Graph
- `scrape` — value extracted from HTML by the regex/JSON-LD scraper
- `firecrawl` — value extracted from Firecrawl markdown (Collector B)
- `openai` — reserved (legacy; Stage 2 doesn't emit this)

The Sheets node has `retryOnFail: true, maxTries: 5, waitBetweenTries: 30000` to ride out transient `429` quota errors without aborting the run. Same setting applies to `WriteFirecrawlEvidence`, `UpdateControlExecDone`, and `UpdateControlExecScraperDone`.

---

## 6. Coverage gate — `Deduplicate Companies` + `Check Missing Fields`

After the Phase 1 write, `Deduplicate Companies` collapses per-value rows back to one entry per company URL. For each company it computes:

- `Has_Email` / `Has_Phone` / `Has_Address` — booleans, `true` if any row was emitted for that field
- `Missing_Fields` — array of the labels missing (`['email','phone','address']` subset)
- `SerpAPI_ContactMap` — merged across the company's rows so Firecrawl can use the subpage URLs as crawl seeds

`Check Missing Fields` (If node) tests `Missing_Fields.length === 0`:

- `out(0)` **all three found** → `Update Control Exec Scraper Done` (sets `Process_Status = DONE`); company is finished, no Firecrawl
- `out(1)` **≥1 missing** → `Loop Firecrawl` (per-company sub-flow below)

> The condition is `=== 0` (not `> 0`) and routed via `out(1)` for the Firecrawl branch on purpose. An earlier inversion produced a dead-end where companies with missing fields skipped Firecrawl entirely.

---

## 7. Collector B — Firecrawl, only when needed

`Loop Firecrawl` (SplitInBatches v3) iterates the companies that came through `out(1)` of the gate, one at a time, so per-company state stays isolated.

Per iteration:

1. **`Prep Crawl`** — build the Firecrawl payload. `includePaths` is 26 base regex patterns covering `pt-pt/`, `pt/`, `es/` locales plus plain English/Portuguese contact paths, with `SerpAPI_ContactUrls` path-fragments appended. `excludePaths` excludes `en/`, `fr/`, `de/`, `it/`, `nl/`, `ru/`, `zh/`, `ja/`, `ko/`, `pl/`, `cs/`, `hu/`, `ro/`. Pure string-path extraction (`replace(/^https?:\/\/[^/]*/, '')`) — `new URL()` returns empty hostnames in the n8n sandbox.
2. **`Firecrawl Start Crawl`** — POST `/v1/crawl` with `url: Website_URL` (single own-domain seed), `limit: 8`, `formats: ['markdown']`, `onlyMainContent: true`, `Accept-Language: pt-PT,pt;q=0.9,en;q=0.5`, 30 s timeout.
3. **`Extract Crawl ID` → `Check Crawl Started`** — if `crawl_id` is missing (Firecrawl 4xx), `Crawl Failed Fallback` emits an empty page list so the rest of the loop completes cleanly. If `crawl_id` exists, continue.
4. **Polling loop** — `Wait Crawl Start` (20 s) → `Prep Poll` → `Poll Crawl Status` → `Check Crawl Done`.
   - `Check Crawl Done` returns true if `body.status === 'completed'` **OR** `$runIndex >= 1` (i.e. we already retried once). This gives at most one retry — total max wait `20 + 15 = 35 s`.
   - On not-done: `Wait Poll Retry` (15 s) → back to `Prep Poll`.
5. **`Merge Crawl Data`** — collect returned `[{ url, markdown }, ...]`.
6. **`Parse Firecrawl Results`** — extract **only** the fields in `Missing_Fields`. If SerpAPI/scrape already had phone + address, Firecrawl extracts only emails. Per-page extraction: each emitted row's `Source_url` is the specific Firecrawl page URL.
7. **`Wait Before Phase 2 Write`** (15 s) → **`Write Firecrawl Evidence`** (`Source_type = firecrawl`) → **`Update Control Exec Done`** → next iteration.

The 15 s wait before `Write Firecrawl Evidence` is the heaviest pacing in the workflow. With `retryOnFail (5×30 s)` on top, sustained `429` bursts heal automatically.

---

## 8. `CONTROL_EXEC` state transitions

`CONTROL_EXEC` is the orchestrator's source of truth. Stage 2 writes to it **at three points** (one row per company, matched on `Exec_key = Run_ID + "_" + Entity_key`):

| When | Node | `Current_phase` | `Process_Status` | `Next_action` | `Queued_action` |
|---|---|---|---|---|---|
| Start of Stage 2 (parallel branch off `Gate Has URL`) | `Update Control Exec Stage 2` | `STAGE 2` | `IN_PROGRESS` | `STAGE 3` | `SERPAPI` |
| Gate decided no Firecrawl needed (all 3 fields found) | `Update Control Exec Scraper Done` | (unchanged) | `DONE` | (unchanged) | (unchanged → stays `SERPAPI`) |
| Firecrawl path completes for the company | `Update Control Exec Done` | (unchanged) | `DONE` | (unchanged) | `FIRECRAWL` |

Two design choices worth keeping in mind:

> **Why the start-of-stage write is parallel.** `Gate Has URL.out(0)` fans out to *both* `Update Control Exec Stage 2` and `Loop Over Companies`. Putting the Sheets write inline (`Normalize → Update → Loop`) caused a real bug: the Sheets `appendOrUpdate` response replaces `$json` with `{ Run_ID, Entity_key, ... }` (sheet-column casing), which shadowed the original `{ RUN_ID, EntityKey, Website_URL }` shape inside the loop. Downstream identity expressions (`$('Loop Over Companies').item.json.RUN_ID`) went empty. The parallel branch isolates the cast.

> **Why `UpdateControlExecFirecrawl` was removed.** An earlier design wrote `Process_Status = IN_PROGRESS, Queued_action = FIRECRAWL` once *per Firecrawl iteration*, before each company's crawl. With 3 Sheets writes per Firecrawl iteration and `WriteToControlEvidence` already burning quota, runs hit `429 — Write requests per minute` and crashed. Solution: drop the IN_PROGRESS write entirely (the company is already `IN_PROGRESS` from Stage 2 startup), and fold `Queued_action: 'FIRECRAWL'` into the existing `UpdateControlExecDone` payload so it costs zero extra writes.

---

## 9. Identity propagation rules

Several Code nodes need to know **which company** they're processing.

- **Inside `Loop Over Companies`:** read `$('Loop Over Companies').item.json.RUN_ID / EntityKey / Website_URL`. **Use `.item`, never `.first()`** — `.first()` always returns the first iteration's data regardless of which company is being processed.
- **Outside the loop (Collector B / Firecrawl):** identity comes from the row itself (`item.json.RUN_ID`, `EntityKey`, `Website_URL`), carried through `Deduplicate Companies` → `Loop Firecrawl` → `Prep Crawl` → `Extract Crawl ID` → `Prep Poll` → `Merge Crawl Data` → `Parse Firecrawl Results`. `Prep Poll` falls back to `$('Check Crawl Started').first()` for `crawl_id` when the upstream item is a Firecrawl error response.

---

## 10. Known constraints (n8n sandbox gotchas)

These are real and have bitten this workflow more than once:

1. **`new URL()` returns empty hostname** in the n8n Code-node sandbox instead of throwing. Always use string operations (`replace(/^https?:\/\//i, '').replace(/\/.*$/, '')`) for URL parsing.
2. **`[^]` regex syntax silently fails** in the vm2 sandbox — use `[\s\S]` for "match any char including newline."
3. **Backtick `jsCode` strips backslashes from regex literals** at certain depths. `/\d/` written inside a template-literal jsCode can become `/d/` at runtime (a literal `d`). Mitigation when escaping is fragile: use `new RegExp('\\d', 'g')` with explicitly double-escaped strings, or `String.fromCharCode` / array-of-keywords loops.
4. **Sheets node `autoMapInputData` is brittle.** Extra columns in the data, or columns with leading spaces in the header (the `Source_type  (input | serpapi | scrape | openai)` column has two spaces!) cause "Column names were updated" failures or right-extension of the sheet. `defineBelow` with explicit `value` mappings + empty `schema: []` is the safe fallback.
5. **Sheets node response replaces `$json`.** `appendOrUpdate` returns the row with **sheet column names** (e.g. `Run_ID`), not the input field names (`RUN_ID`). Run identity-changing Sheets writes on parallel branches.
6. **OCC conflicts on every push.** The sync engine treats every push to a tracked workflow as conflicting once both sides have changed. Standard recovery is `n8nac resolve <id> --mode keep-current` after `validate`.
7. **Firecrawl v1 API rejects `startUrls`** as an unrecognised key. Only `url` (single seed) and `includePaths` (regex array) are accepted. SerpAPI subpages are surfaced to Firecrawl by appending their path fragments to `includePaths`, not as separate seeds.
8. **Sheets project-wide write quota: 6000 writes/minute/project.** Per-iteration writes inside `Loop Firecrawl` plus the bulk Phase-1 write can stack into the rolling window. Mitigations in place: `WaitBeforePhase2Write` (15 s) + `retryOnFail (5 × 30 s)` on every Sheets writer.

---

## 11. Field-extraction reliability summary

| Field | SerpAPI (`site:<host>`) | HTML scrape | Firecrawl markdown |
|---|---|---|---|
| email | Low–Medium (Google often truncates as `...@domain`, filtered out) | High (`mailto:` + JSON-LD + regex) | High |
| phone | Low–Medium (snippet text) | High (`tel:` + JSON-LD + strict PT/ES regex) | High |
| address | Low–Medium (snippet text + `trimAddress`, postal-code required) | Medium (postal-code-required `trimAddr`; many false positives without it) | Medium (markdown text + `trimAddress`) |

Knowledge Graph: empirically null on contact fields for `site:` query shapes (verified across test responses). Retained for defensive parity, treated as dead code in practice.

**Empirical (run 4441, 58 companies)**: Phase 1 produced 144 evidence rows across `serpapi` + `scrape` source-types. The coverage gate sent 40 of 58 to Firecrawl; 11 passed with all 3 fields from Collector A alone. The HTML scrape produces the bulk of `scrape`-tagged rows from the SerpAPI-surfaced URLs plus the homepage.

**Query upgrades on the roadmap.** An A/B test on 20 companies (execution 4405) showed that two query shapes outperform today's `site:<host>`:

- `site:<host> (contacto OR contactos OR contact OR "fale connosco")` — 2.5× more own-domain contact URLs; the keyword-targeted form pushes contact pages above generic top-10 noise on large sites.
- `"<host>" contactos OR telefone OR email` — 6× more snippet emails, 5× more snippet phones; biases SERP toward pages that mention the host alongside contact tokens (own-domain + aggregator pages). Needs a strict own-domain email filter on the parser side to drop aggregator emails.

A dual-query deployment of both was tried in production and coincided with deterministic n8n cloud worker crashes; rollback didn't fix it but the platform recovered on its own. The variants can be reintroduced one at a time when desired.

---

## 12. Performance / scalability notes

- **Cumulative wait per company in Collector A:** 2 s (`Wait Before SerpAPI`) + SerpAPI call + `Fetch Homepage` (≤15 s) + up to 8 × `Fetch Candidate` (≤20 s each, sequential per company). Median observed: 8–12 s/company; worst case ~60 s on a slow site.
- **Collector B per company:** 20 s (`Wait Crawl Start`) + Firecrawl crawl + 15 s (`Wait Before Phase 2 Write`). At least one retry cycle adds 15 s.
- **Sheets writes:** 1 batched Phase-1 append (one API call regardless of row count, up to a 10 MB payload limit) + 1 `Update Control Exec Stage 2` per company at startup + 1 `Update Control Exec Scraper Done` *or* (1 `Write Firecrawl Evidence` + 1 `Update Control Exec Done`) per company at completion. With `retryOnFail (5×30 s)` baked in, sustained 429 bursts heal without aborting.
- **Scaling ceiling.** The current pacing waits favour partial-output safety (each company gets its own Sheets write so a mid-run failure preserves earlier progress) over throughput. At ≥1000 companies per run, the cumulative serialised waits become hours; the path forward is one batch append per phase plus dropping the per-iteration `Update Control Exec Done` in favour of a single Phase-2 batch update at the end of `Loop Firecrawl`.
- **Cost control.** Firecrawl is the paid step. The coverage gate is the primary cost control — companies that already have all three fields after Collector A skip Firecrawl entirely.

---

## 13. When to revise this document

Update STAGE_2.md when:

- A **new collector** is added (e.g. an LLM-based fallback) — extend §2 and §11.
- The **gate logic** changes (e.g. only require email + phone, drop address) — update §6.
- A **new source-attribution rule** is introduced (e.g. `openai` becomes active, or scrape values from SerpAPI URLs get re-tagged) — update §4.3 and §5.
- A **new sheet column** carries logical meaning (e.g. `Confidence` becomes populated) — update §5.
- **`CONTROL_EXEC` transitions change** (new states, new fields touched) — update §8.
- The **trigger surface** changes (a second trigger reappears, webhook trigger, scheduled trigger) — update §3.
- A **new sandbox gotcha** is discovered — extend §10.

Pure cosmetic / refactor changes (renaming a node, equivalent regex tweak, wait-time adjustments within the same order of magnitude) are not doc-worthy.
