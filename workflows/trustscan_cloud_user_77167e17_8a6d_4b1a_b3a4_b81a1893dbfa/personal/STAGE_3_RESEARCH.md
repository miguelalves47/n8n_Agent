# STAGE 3 — Research

> **Workflow ID:** `EtfFFrnxUDJ9cuxa` · **File:** `STAGE_3_RESEARCH.workflow.ts` · **Sheet doc:** `1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE`
>
> This document explains the **logic** of Stage 3 — what it searches for, how it decides what's already known, how it classifies URL state to inform the search strategy, and how it writes results. It is not a node-by-node inventory; the workflow file and its `<workflow-map>` header are the authoritative source for that.
>
> **When to update this doc:** when the field-coverage logic changes, when a new search source is added, when the URL-state classification changes, when the CONTROL_EXEC write schema changes, or when a new `source_type` value is introduced.

---

## 0. Pipeline context — where Stage 3 fits

Stage 3 is the **fourth and final** workflow in the pipeline. It handles contact-field discovery for entities that fall through Stage 2 — either because they have no usable URL (`NO_URL_FOUND`, `URL_FOUND_NOT_RESPONDING`) or because Stage 2 Collector A + Firecrawl still left some fields empty. Stage 3 uses SerpAPI keyword search and OpenAI websearch to find contact data without relying on a live company website.

See `PIPELINE.md` for the full four-workflow pipeline diagram and Google Sheets schema.

### What Stage 3 reads

| Tab | Filter | Notes |
|---|---|---|
| `URL_CHECKS` | All rows for current `Run_ID` | URL state determines `Source_url` vs `Hint_url` |
| `CONTROL_EVIDENCE` | All rows for current `Run_ID` | Determines which fields are already found |
| `INPUT_SNAPSHOT` | All rows | Provides `Company_name` and `NIPC_digits` |

### What Stage 3 writes

| Tab | Operation | Notes |
|---|---|---|
| `CONTROL_EVIDENCE` | `append` (no dedup key) | One row per missing field per entity |
| `CONTROL_EXEC` | `appendOrUpdate` on `Exec_key` | Two writes: start (IN_PROGRESS) and done (DONE) per entity |

---

## 1. Purpose

Stage 3 fills the gaps that Stages 1, HYBRID, and Stage 2 couldn't resolve:

- Entities where HYBRID returned `NO_URL_FOUND` (no website at all).
- Entities where HYBRID returned `URL_FOUND_NOT_RESPONDING` (website known but down).
- Entities that went through Stage 2 but still have ≥1 missing contact field.

For each missing field, Stage 3 emits one evidence row. If no source is found, it emits a `stage3_not_found` placeholder so there is always a row in `CONTROL_EVIDENCE` for the field — this prevents Stage 3 from re-processing the same entity on a re-run.

---

## 2. Input shaping (`ComputeMissingFields`)

This is the most complex node in Stage 3. It runs once (not per-loop) and shapes the full set of entities to process.

### Step 1 — Determine current Run_ID

Scans all `Run_ID` values in `URL_CHECKS` and picks the maximum numeric value. This is how Stage 3 identifies "the current run" without the user having to configure it. All downstream filtering uses this `Run_ID`.

> **Important**: This means Stage 3 always processes the most recent pipeline run's entities. If two Stage 1 runs exist in the sheet, Stage 3 processes only the newer one.

### Step 2 — Inner-join `INPUT_SNAPSHOT`

Builds a `Map<Entity_key → { Company_name, NIPC_digits }>`. Entities missing from `INPUT_SNAPSHOT` or with no `Company_name` are dropped — Stage 3 cannot search without a name.

### Step 3 — Build coverage map from `CONTROL_EVIDENCE`

For the current `Run_ID`, counts which fields (`email`, `phone`, `address`) have at least one non-empty `Value` row in `CONTROL_EVIDENCE`. Empty-value rows (e.g. `stage3_not_found` placeholders) do **not** count as found — only rows where `Value` is non-empty.

### Step 4 — URL state classification

For each entity in `URL_CHECKS` for the current `Run_ID`:

| `Response_class` | `Final_url` present | URL state | Effect |
|---|---|---|---|
| `2XX`, `SUCCESS`, `URL_DISCOVERED`, `URL_LIKELY` | ✅ | `live` | `Source_url = Final_url`, `Hint_url = ''` |
| `URL_FOUND_NOT_RESPONDING`, `4XX`, `5XX`, `TRANSPORT_ERROR` | ✅ | `dead` | `Source_url = ''`, `Hint_url = Final_url` |
| `NO_URL_FOUND`, `NO_URL`, anything else | — | `none` | Both empty |

**Why the URL state matters for Stage 3?**
- `live` (URL works): Stage 3 knows where the company's site is. SerpAPI results whose host matches `Source_url` get priority over other organic results. (These entities are rare in Stage 3 — Stage 2 should have already handled them, but Stage 3 fills fields Stage 2 missed.)
- `dead` (URL known but down): Stage 3 passes `Hint_url` to OpenAI as contextual information ("this URL exists but doesn't respond"). The model can use it to identify the company's domain in its web search without trying to fetch the dead site.
- `none` (no URL): open keyword search with no domain context.

### Step 5 — Build entity list

For each entity in `URL_CHECKS` (current `Run_ID`, deduped), if `Missing_fields` is non-empty after the coverage check, emit one item for the loop. Skip entities where all 3 fields already have non-empty evidence rows.

Output per entity:

```json
{
  "RUN_ID": "...",
  "EntityKey": "510234567",
  "Company_name": "Empresa Exemplo Lda",
  "NIPC_digits": "510234567",
  "Missing_fields": ["email", "address"],
  "Source_url": "",
  "Hint_url": "https://empresaexemplo.pt",
  "Url_state": "dead",
  "Response_class": "URL_FOUND_NOT_RESPONDING"
}
```

---

## 3. Parallel CONTROL_EXEC start write

`ComputeMissingFields` fans out to two parallel branches:
1. `UpdateControlExecStage3` — writes `Current_phase = STAGE 3, Process_Status = IN_PROGRESS, Queued_action = STAGE_3` for every entity in the batch.
2. `LoopOverEntities` — starts the per-entity loop.

> **Why parallel?** Same design principle as Stage 2: if the CONTROL_EXEC write happened inline before the loop, the Sheets response (`$json` with column-name casing) would shadow the original entity data inside the loop body. Putting it on a parallel branch keeps the loop's data clean.

---

## 4. Per-entity loop

`Loop Over Entities` (SplitInBatches, batch size 1) processes one entity at a time.

### 4.1 SerpAPI search (`SearchSerpapi`)

```
GET https://serpapi.com/search
  q        = '"<Company_name>" contacto telefone email morada'
  engine   = google
  google_domain = google.pt
  hl       = pt
  gl       = pt
  location = Portugal
  num      = 10
```

**Why a keyword query (not `site:`)?** Stage 3 runs for entities without a confirmed working website. A `site:` query requires knowing the domain; without it, the query returns nothing. The keyword query (`contacto telefone email morada`) biases results toward contact pages for the named company.

**Why quoted company name?** Quoting forces Google to treat the legal name as a phrase, reducing SERP noise from partial-name matches. Stage 2 (which already has the domain) uses `site:<host>` instead.

Aggregator hosts are filtered during `ParseStage3Results` — SerpAPI organic results from blocklisted hosts are skipped.

### 4.2 OpenAI websearch (`SearchOpenai`)

```
POST https://api.openai.com/v1/responses
  model: gpt-4.1-mini
  max_output_tokens: 1000
  tools: [{ type: "web_search_preview", ... PT locale }]
  tool_choice: "required"
  text.format: json_schema → {
    email, email_source_url,
    phone, phone_source_url,
    address, address_source_url
  }
```

The system prompt instructs the model to return only values attributable to a primary source (company's own site, press release, news, official social media — NOT directories). The aggregator blocklist is embedded in the system prompt.

The user prompt:
- Passes `Company_name` and `NIPC_digits`.
- If `Hint_url` is non-empty, passes it with explicit framing: *"this URL currently does not respond, use only as context, do not cite it"*. This lets the model recognize the company's domain in search results without trying to fetch the dead URL.
- Passes `Missing_fields` — instructs the model to return empty strings for fields that are not missing (avoids overwriting existing evidence).

**Retry**: `maxTries: 4, waitBetweenTries: 5000`. Same pattern as HYBRID.

---

## 5. Result parsing (`ParseStage3Results`)

Combines SerpAPI + OpenAI, filters aggregators, produces per-field evidence rows.

### SerpAPI extraction

For each organic result whose host passes the blocklist:
- Extract emails (regex + `mailto:` href), phones (PT/ES pattern), addresses (street keyword + postal code anchor).
- Push unique values with `{ value, link, host }`.

### OpenAI extraction

Parse the `json_schema` text from the Responses API output. For each field:
1. Extract `value` and `url` from the JSON.
2. Reject if `url` is a blocklisted aggregator host.
3. Validate the value with the **same regex** used on SerpAPI snippets:
   - Email: must pass `emailRegex`.
   - Phone: must pass the PT/ES phone pattern and correct digit count (9/11/12/13).
   - Address: must pass `addrRegex` AND `trimAddress` (postal-code required, see §5.1).
4. If validation fails, treat as not found (reject the OpenAI value rather than writing garbage).

### Per-field pick: SerpAPI > OpenAI > not_found

For each missing field:

1. **SerpAPI has a result?** → use it. If `Source_url` or `Hint_url` is known, prefer a SerpAPI hit whose `host` matches (`hintHost`). Otherwise take the first result.
2. **OpenAI has a validated result?** → use it.
3. **Neither?** → emit `stage3_not_found` with empty `Value`.

Source types written: `serpapi_stage_3`, `openai_stage_3`, `stage3_not_found`.

### 5.1 Address trimming (`trimAddress`)

Shared with Stage 2 logic. Key rule: **postal code is required**. Without a `DDDD-DDD` (PT) or 5-digit (ES) postal code in the match, the address fragment is discarded.

After the postal code, the trimmer allows up to 30 characters (the city tail), stopping at `.;|–—·`. This prevents raw address snippets like `Rua do Amparo, aumentando a intensidade...` (prose text) from being written as addresses.

---

## 6. `CONTROL_EVIDENCE` write (`WriteStage3Evidence`)

`append` operation (no match key) — each call appends new rows without checking for duplicates.

One row per missing field per entity:

| Column | Value |
|---|---|
| `Run_ID` | Entity's `RUN_ID` |
| `Entity_key` | Entity's NIPC |
| `Field (phone \| email \| address)` | Field name |
| `Value` | Extracted value (empty for `stage3_not_found`) |
| `Source_url` | `Source_url` from URL state (entity's live website, if known) |
| `Source_type  (input \| serpapi \| scrape \| openai)` | `serpapi_stage_3` / `openai_stage_3` / `stage3_not_found` |
| `Confidence` | `''` (not populated by Stage 3) |
| `Extracted_at` | ISO timestamp (Europe/Lisbon timezone) |
| `SerpAPI_ContactUrls` | SerpAPI result link where value was found (or OpenAI source URL) |
| `Hint_url` | Dead-but-known company URL (for traceability) |

**`Hint_url` column** is Stage 3-specific. Stage 2 never writes it. It provides audit context: if the value was found while knowing the company had a dead URL, that's useful for manual review.

---

## 7. `CONTROL_EXEC` state transitions

| When | Node | `Current_phase` | `Process_Status` | `Queued_action` |
|---|---|---|---|---|
| Before loop starts (for all entities) | `UpdateControlExecStage3` | `STAGE 3` | `IN_PROGRESS` | `STAGE_3` |
| After each entity completes in loop | `UpdateControlExecDone` | `STAGE 3` | `DONE` | `''` |

`UpdateControlExecDone` reads identity from `$('Loop Over Entities').item.json` to avoid the Sheets-response-replaces-`$json` problem. The `DedupeExecUpdate` node before it collapses per-field evidence rows back to a single entity item so `UpdateControlExecDone` fires once per entity, not once per evidence row.

---

## 8. Known constraints and design decisions

1. **`stage3_not_found` is intentional, not an error**: It creates a `CONTROL_EVIDENCE` row with an empty `Value`. `ComputeMissingFields` treats this row as NOT found (empty value skipped in coverage check), so re-running Stage 3 will retry the entity. If you want to mark a field as definitively not available, you'd need a different sentinel value — this is currently done only manually.

2. **Run_ID = max numeric value**: This heuristic works because n8n execution IDs are monotonically increasing integers for cloud executions. If the ID format changes, `ComputeMissingFields` will silently process the wrong run.

3. **Stage 3 and Stage 2 both write to `CONTROL_EVIDENCE`**: For entities that went through Stage 2 but still had missing fields, Stage 3 appends additional rows for those fields without touching Stage 2's existing rows. The `Source_type` column is the discriminator.

4. **OpenAI `Hint_url` instruction**: The prompt explicitly says "this URL currently does not respond, use only as context, do not cite it." This prevents the model from returning the dead URL as `email_source_url` / `phone_source_url`, which would write a non-crawlable URL as the evidence source.

5. **SerpAPI query uses the full `Company_name`** (not `Search_name`): HYBRID uses `Search_name` (stripped of corporate suffixes) to find the company's own website — avoiding directory results is critical there. Stage 3 uses the full quoted legal name because it needs any available contact data, including from directories (which are then filtered by the blocklist). The quoted legal name generates fewer false positives from partial-name matches than the stripped brand name would.

6. **No loop guard against re-processing**: Unlike Stage 2 (which skips entities with `URL_FOUND_NOT_RESPONDING` via `SKIP_CLASSES`), Stage 3 re-processes any entity with a missing field in `CONTROL_EVIDENCE`. If a `stage3_not_found` placeholder was written, the entity still appears in the `ComputeMissingFields` output (because `Value` is empty). Re-running Stage 3 will retry those entities — which is usually the desired behavior.

7. **`$now.setZone("Europe/Lisbon").toISO()`**: Stage 3 timestamps use Lisbon timezone for `Extracted_at` and CONTROL_EXEC `Updated_at`. This matches HYBRID's pattern. Stage 1 and Stage 2 use `$now.toISO()` (UTC). Not a functional difference, but worth knowing when reading timestamps in the sheet.
