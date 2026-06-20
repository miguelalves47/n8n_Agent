# PIPELINE — Trustscan Company Contacts (End-to-End)

> **Purpose.** This is the spine doc: the single place that shows how all four workflows connect, what each Google Sheet tab carries, and the complete status taxonomy. Read this before touching any individual workflow. For per-workflow detail, read the companion `.md` file listed in each stage.
>
> **When to update this doc:** when a new workflow is added to the pipeline, when a Google Sheet tab is added/renamed/extended, when the status taxonomy gains a new value, or when the handoff logic between stages changes.

---

## 0. The Two Workbooks

| Workbook | Google Sheet ID | Role |
|---|---|---|
| `Cliente_BD_INPUT` | `1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU` | Source data — raw company list exported from the client registry. **Read-only** from the pipeline's perspective. |
| `Cliente_BD_OUTPUT` | `1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE` | Processing & output — every workflow writes here. Contains all pipeline state and evidence. |

All workflow Sheets nodes reference `Cliente_BD_OUTPUT` unless noted.

---

## 1. Pipeline Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Cliente_BD_INPUT · Página1                                              │
│  (NIPC + legal name + raw contact fields from client registry)          │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ read
                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1 — URL Validation                                                  │
│  File: Trustscan Company Contacts Stage 1 - URL Validation.workflow.ts     │
│  ID:   cUUUCbn21ZeikazR-pmgX   Doc: STAGE_1.md                            │
│                                                                            │
│  · Mirrors every input row to INPUT_SNAPSHOT (keyed by NIPC)              │
│  · Assigns Run_ID (= execution ID), Entity_key (= NIPC), Exec_key         │
│  · Upserts CONTROL_EXEC: INGESTED → URL_VALIDATED | URL_SKIPPED | URL_FAILED│
│  · Writes URL_CHECKS: SUCCESS | NO_URL | transport error class            │
└──────┬──────────────────────────────────────────────────────┬─────────────┘
       │ entities where Response_class = NO_URL               │ entities where
       │ (no website in input OR URL unreachable)             │ Response_class = SUCCESS
       ▼                                                      │ (website validated)
┌──────────────────────────────────────────────────────┐     │
│  URL_DISCOVER_HYBRID                                 │     │
│  File: URL_DISCOVER_HYBRID.workflow.ts               │     │
│  ID:   s2kskrjBoXoUh0fR   Doc: URL_DISCOVER_HYBRID.md│    │
│                                                      │     │
│  · For each NO_URL entity: SerpAPI (PT) +            │     │
│    OpenAI websearch + GPT-4.1-mini judge             │     │
│  · Fetches homepage + subpages, scans for NIPC       │     │
│  · Writes URL_CHECKS: URL_DISCOVERED | URL_LIKELY    │     │
│    | URL_FOUND_NOT_RESPONDING | NO_URL_FOUND         │     │
│  · CONTROL_EXEC Next_action → STAGE 2 or STAGE 3    │     │
└──────┬───────────────────────────────────────────────┘     │
       │                                                      │
       ├─ URL_DISCOVERED / URL_LIKELY ───────────────────────►┤
       │                                                      │
       │                           ┌──────────────────────────▼──────────────┐
       │                           │  STAGE 2 — MA Contact Extraction         │
       │                           │  File: Trustscan Company Contacts         │
       │                           │         Stage 2 - MA.workflow.ts          │
       │                           │  ID:   DmaKVjkSXjdqbOnl   Doc: STAGE_2.md│
       │                           │                                            │
       │                           │  · SerpAPI + HTML scrape (Collector A)    │
       │                           │  · Firecrawl crawl if ≥1 field missing    │
       │                           │  · Writes CONTROL_EVIDENCE (email/phone/  │
       │                           │    address rows per company)              │
       │                           │  · CONTROL_EXEC → STAGE 2 DONE           │
       │                           └────────────────────────────────────────────┘
       │
       └─ URL_FOUND_NOT_RESPONDING / NO_URL_FOUND ──►
                           ┌──────────────────────────────────────────────────┐
                           │  STAGE 3 — Research                              │
                           │  File: STAGE_3_RESEARCH.workflow.ts              │
                           │  ID:   EtfFFrnxUDJ9cuxa   Doc: STAGE_3_RESEARCH.md│
                           │                                                  │
                           │  · For entities with missing contact fields:     │
                           │    SerpAPI keyword search + OpenAI websearch     │
                           │  · Skips fields already in CONTROL_EVIDENCE     │
                           │  · Writes CONTROL_EVIDENCE (stage3_* source_type)│
                           │  · CONTROL_EXEC → STAGE 3 DONE                  │
                           └──────────────────────────────────────────────────┘
```

**Run-ID continuity.** `Run_ID` is set once by Stage 1 (= n8n execution ID) and propagated unchanged through HYBRID, Stage 2, and Stage 3. All sheet rows for a given pipeline run are queryable via `Run_ID`. `Exec_key = Run_ID + "_" + Entity_key` is the primary join key across all tabs.

---

## 2. Google Sheets Schema — `Cliente_BD_OUTPUT`

### 2.1 `INPUT_SNAPSHOT` (gid=0)

Mirror of the client input. Written once per entity per run by Stage 1. Matched on `NIPC` (upsert — second run updates existing row).

| Column | Type | Source | Notes |
|---|---|---|---|
| `Entidade` | string | INPUT | Legal entity type |
| `NIPC` | string | INPUT | **Match key** — Portuguese NIF/tax ID, 9 digits |
| `Nome` | string | INPUT | Legal company name |
| `Morada` | string | INPUT | Street address from registry |
| `Localidade` | string | INPUT | City |
| `CodPostal` | string | INPUT | Postal code |
| `Concelho` | string | INPUT | Municipality |
| `Distrito` | string | INPUT | District |
| `Telefone` | string | INPUT | Registry phone (may be stale) |
| `Fax` | string | INPUT | Registry fax |
| `Email` | string | INPUT | Registry email (may be stale) |
| `Internet` | string | INPUT | Raw website from registry (unnormalized) |
| `Run_ID` | string | Stage 1 | n8n execution ID |
| `Input_Row` | int | Stage 1 | Row number in source sheet |
| `Imported_at` | ISO timestamp | Stage 1 | When Stage 1 ingested this entity |

### 2.2 `CONTROL_EXEC` (gid=1167682274)

One row per entity per run. Tracks the pipeline phase and process status for orchestration. Upserted on `Exec_key`.

| Column | Type | Notes |
|---|---|---|
| `Exec_key` | string | **Match key** — `Run_ID + "_" + Entity_key` |
| `Run_ID` | string | n8n execution ID |
| `Entity_key` | string | NIPC (9-digit string) |
| `Input_Row` | int | Source sheet row number |
| `Current_phase` | string | See phase table below |
| `Process_Status` | string | `IN_PROGRESS` \| `PENDING` \| `DONE` |
| `Next_action` | string | `STAGE 2` \| `STAGE 3` \| `''` |
| `Queued_action` | string | See queued-action table below |
| `Attempts` | int | HTTP attempt count (Stage 1) |
| `Lock_until` | timestamp | Reserved for retry locking |
| `Last_error` | string | Last error message or code |
| `Updated_at` | ISO timestamp | Last write time |

**`Current_phase` values — in pipeline order:**

| Value | Written by | Meaning |
|---|---|---|
| `INGESTED` | Stage 1 (start) | Entity normalised and entered pipeline |
| `URL_SKIPPED` | Stage 1 (no URL path) | No URL in input; entity queued for HYBRID |
| `URL_VALIDATED` | Stage 1 (success path) | URL tested and responded |
| `URL_FAILED` | Stage 1 (error path) | URL tested, all attempts failed |
| `DISCOVERING_URL_PHASE` | HYBRID (start + done) | HYBRID is running or completed for this entity |
| `STAGE 2` | Stage 2 | Stage 2 contact extraction running or done |
| `STAGE 3` | Stage 3 | Stage 3 research running or done |

**`Queued_action` values:**

| Value | Set by | Meaning |
|---|---|---|
| `DISCOVER_URL` | Stage 1 (NO_URL / URL_FAILED path) | Entity needs HYBRID |
| `ENRICH_FROM_WEBSITE` | Stage 1 (URL_VALIDATED path) | Entity is ready for Stage 2 |
| `SERPAPI` | Stage 2 (start) | Collector A phase |
| `FIRECRAWL` | Stage 2 (Firecrawl path done) | Collector B was used |
| `STAGE_3` | Stage 3 (start) | Stage 3 in progress |
| `''` | HYBRID done, Stage 2/3 done | No further action queued |

### 2.3 `URL_CHECKS` (gid=806341849)

One row per entity per run. Written by Stage 1 (initial URL test) and overwritten by HYBRID (URL discovery). Upserted on `Entity_key` (HYBRID) or `Exec_key` (Stage 1).

| Column | Type | Notes |
|---|---|---|
| `Exec_key` | string | `Run_ID + "_" + Entity_key` |
| `Run_ID` | string | n8n execution ID |
| `Entity_key` | string | NIPC |
| `Attempt_no` | int | HTTP attempt number (Stage 1 only) |
| `Request_method` | string | `HEAD` \| `GET` \| `None` |
| `Request_url` | string | URL that was tested |
| `Status_code` | int | HTTP status code (if applicable) |
| `Response_class` | string | **See status taxonomy below** |
| `Final_url` | string | Final URL after redirects (or discovered URL from HYBRID) |
| `Content_type` | string | HTTP Content-Type header |
| `Transport_error` | string | Low-level error string (ECONNREFUSED, DNS, etc.) |
| `Network_error` | string | Network-layer error detail |
| `Source_signal` | string | HYBRID only: `serpapi_kg` \| `serpapi_organic` \| `openai_websearch` \| `none` |
| `Pick_method` | string | HYBRID only: `judge` \| `fallback` |

### 2.4 `CONTROL_EVIDENCE`

Append-only. One row per (entity, field, value) tuple. Written by Stage 2 (Collector A + Firecrawl) and Stage 3. No deduplication — the same field can have multiple rows from different sources; downstream triage chooses the best value.

| Column | Type | Notes |
|---|---|---|
| `Run_ID` | string | n8n execution ID |
| `Entity_key` | string | NIPC |
| `Field (phone \| email \| address)` | string | Which contact field |
| `Value` | string | The extracted value (empty for `stage3_not_found`) |
| `Source_url` | string | Company's own website URL (the base domain) |
| `Source_type  (input \| serpapi \| scrape \| openai)` | string | **See source-type table below** |
| `Confidence` | string | Reserved (not currently populated by Stage 2) |
| `Extracted_at` | ISO timestamp | When the row was written |
| `SerpAPI_ContactUrls` | string | Specific subpage URL where the value was found |
| `Hint_url` | string | Stage 3 only: dead-but-known company URL used as search context |

**`Source_type` values:**

| Value | Written by | Meaning |
|---|---|---|
| `input` | Stage 1 (reserved) | Value from raw registry input |
| `serpapi` | Stage 2 Collector A | Value found in SerpAPI snippet or Knowledge Graph |
| `scrape` | Stage 2 Collector A | Value extracted from HTML by regex/JSON-LD scraper |
| `firecrawl` | Stage 2 Collector B | Value extracted from Firecrawl markdown |
| `openai` | Reserved | Not currently emitted |
| `serpapi_stage_3` | Stage 3 | SerpAPI organic hit during Stage 3 research |
| `openai_stage_3` | Stage 3 | OpenAI websearch result during Stage 3 research |
| `stage3_not_found` | Stage 3 | Placeholder: field was searched but no value found |

---

## 3. `Response_class` Status Taxonomy

The `Response_class` column in `URL_CHECKS` is the primary routing signal for the pipeline. Every downstream workflow filters on it.

| Value | Written by | Has URL? | Meaning | Next stage |
|---|---|---|---|---|
| `NO_URL` | Stage 1 | ❌ | No website in registry input | HYBRID |
| `SUCCESS` | Stage 1 | ✅ | URL tested, responded 2xx | Stage 2 |
| `URL_FAILED` | Stage 1 | ✅ (but dead) | URL tested, all HTTP attempts failed | HYBRID (if re-run) |
| Transport error classes | Stage 1 | ✅ (but dead) | DNS, ECONNREFUSED, timeout, etc. | Stage 2 (treated as having URL) |
| `URL_DISCOVERED` | HYBRID | ✅ | URL found + NIPC confirmed on a fetched page | Stage 2 |
| `URL_LIKELY` | HYBRID | ✅ | URL found + homepage responded, NIPC not confirmed | Stage 2 |
| `URL_FOUND_NOT_RESPONDING` | HYBRID | ✅ (dead) | URL found, homepage didn't load | Stage 3 |
| `NO_URL_FOUND` | HYBRID | ❌ | No URL candidate found by any source | Stage 3 |

**Stage 2 gate logic**: processes `SUCCESS`, `URL_DISCOVERED`, `URL_LIKELY`. Explicitly skips `URL_FOUND_NOT_RESPONDING` (`SKIP_CLASSES`). Drops `NO_URL` and `NO_URL_FOUND` (no `Final_url`).

**Stage 3 gate logic**: picks up entities still missing contact fields in `CONTROL_EVIDENCE` for the current run. No filter on `Response_class` — it works from the evidence gap, not the URL state. URL state determines the search strategy (live site → `Source_url`, dead site → `Hint_url`, no site → open search).

---

## 4. Retired Alternative Workflows

These files exist in the repo but are **not part of the active pipeline**. Do not activate them. They are kept as reference for past approaches.

### `URL_DISCOVER_STAGE_2.1.workflow.ts` — ID: `1ElFDAJzMjMy9kaK`

An earlier SerpAPI-only URL discovery approach with code-based scoring. 19 nodes. Zero production executions.

- **Why retired**: No OpenAI websearch component, no GPT judge layer. SerpAPI organic results alone have high noise — aggregators (racius, einforma) often rank above the company's own site for less-known entities. HYBRID's two-stage approach (search → judge) achieves significantly better precision.
- **Difference from HYBRID**: missing `SearchOpenaiWeb`, `AggregateCandidates`, `JudgeOpenai`, `ParseJudgeResult`. Uses a pure scoring heuristic in a single code node instead.

### `URL_DISCOVER_OPENAI.workflow.ts` — no production executions

An even earlier version using only OpenAI websearch without SerpAPI.

- **Why retired**: OpenAI websearch alone lacks the structured signal from SerpAPI's Knowledge Graph and organic ranking. The KG source is a near-deterministic indicator (Google has indexed the company's NIF on that host); losing it means lower precision on well-known entities. HYBRID uses OpenAI as a second signal (cross-validation) rather than the sole oracle.

**Decision rule**: if HYBRID is insufficient for a use case, the correct path is to improve HYBRID (e.g. add a third search source, tune the judge prompt) — not to reactivate the retired workflows.

---

## 5. Workflow File Reference

| Workflow | File | ID | Doc |
|---|---|---|---|
| Stage 1 — URL Validation | `Trustscan Company Contacts Stage 1 - URL Validation.workflow.ts` | `cUUUCbn21ZeikazR-pmgX` | `STAGE_1.md` |
| URL Discovery (active) | `URL_DISCOVER_HYBRID.workflow.ts` | `s2kskrjBoXoUh0fR` | `URL_DISCOVER_HYBRID.md` |
| Stage 2 — MA | `Trustscan Company Contacts Stage 2 - MA.workflow.ts` | `DmaKVjkSXjdqbOnl` | `STAGE_2.md` |
| Stage 3 — Research | `STAGE_3_RESEARCH.workflow.ts` | `EtfFFrnxUDJ9cuxa` | `STAGE_3_RESEARCH.md` |
| URL Discovery (retired) | `URL_DISCOVER_STAGE_2.1.workflow.ts` | `1ElFDAJzMjMy9kaK` | — |
| URL Discovery (retired) | `URL_DISCOVER_OPENAI.workflow.ts` | — | — |
