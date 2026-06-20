# URL_DISCOVER_HYBRID — URL Discovery Workflow

> **Workflow ID:** `s2kskrjBoXoUh0fR` · **File:** `URL_DISCOVER_HYBRID.workflow.ts` · **Sheet doc:** `1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE`
>
> This document explains the **logic** of HYBRID — how it discovers a candidate URL for each entity that Stage 1 could not validate, and how it decides what outcome class to assign. It is not a node-by-node inventory; the workflow file and its `<workflow-map>` header are the authoritative source for that.
>
> **When to update this doc:** when a new search source is added, when the candidate ranking or blocklist changes, when the judge prompt changes, when the NIF-validation logic changes, when the outcome ladder changes, or when the CONTROL_EXEC write schema changes.

---

## 0. Pipeline context — where HYBRID fits

HYBRID is the **second** workflow in the pipeline, running after Stage 1. It handles every entity for which Stage 1 could not confirm a working URL (i.e. `Response_class = NO_URL` in `URL_CHECKS`).

See `PIPELINE.md` for the full four-workflow pipeline diagram and Google Sheets schema.

### What HYBRID reads

| Tab | Filter | Notes |
|---|---|---|
| `URL_CHECKS` | All rows | Filters to `Response_class = NO_URL` in `JoinFilterCleanName` |
| `INPUT_SNAPSHOT` | All rows | Provides `Nome` (legal name) for search queries |

### What HYBRID writes

| Tab | Operation | Key | Values written |
|---|---|---|---|
| `URL_CHECKS` | `appendOrUpdate` on `Entity_key` | `Response_class`, `Final_url`, `Request_url`, `Source_signal`, `Pick_method`, `Content_type`, `Transport_error` |
| `CONTROL_EXEC` | `appendOrUpdate` on `Exec_key` | Phase tracking (start + done) |

---

## 1. Purpose

For each entity with no known website, HYBRID:

1. Builds a clean search name by stripping Portuguese corporate suffixes.
2. Queries two independent search sources (SerpAPI + OpenAI websearch).
3. Aggregates and deduplicates candidates by host, ranked by source trust.
4. Asks a GPT-4.1-mini judge to select the official site from the candidate list.
5. Fetches the homepage + subpages and scans for the NIPC digits.
6. Assigns an outcome class and writes the result to `URL_CHECKS`.

HYBRID only processes entities with a 9-digit NIPC (Portuguese tax IDs). Non-PT entities are silently skipped by the `JoinFilterCleanName` gate.

---

## 2. Input gate (`JoinFilterCleanName`)

This code node performs an inner-join and applies three filters before any entity enters the loop:

1. **`Response_class = NO_URL`** — only entities Stage 1 could not validate.
2. **9-digit NIPC** — strips non-digit characters and checks `nipcDigits.length === 9`. Non-PT entities (fewer or more digits) are dropped.
3. **Non-empty `Company_name`** from `INPUT_SNAPSHOT` — an entity without a legal name cannot be searched.
4. **Dedup by `Entity_key`** — if the same entity appears multiple times in `URL_CHECKS`, only the first occurrence is processed.

Additionally, `JoinFilterCleanName` derives `Search_name` by stripping Portuguese corporate suffixes from the legal name:

```
"Espiralforte, Unipessoal, Lda."  →  "Espiralforte"
"Bosch Car Multimédia Portugal, S.A."  →  "Bosch Car Multimédia Portugal"
```

Suffixes removed: `lda`, `ltda`, `limitada`, `s.a`, `sociedade anonima`, `sociedade por quotas`, `unipessoal`, `unip`, `sgps`, `crl`, `epe`, `companhia`, `cia`.

**Why strip suffixes?** Legal names end with the corporate form, which biases searches toward legal-directory aggregators (racius, einforma) that index the full legal name. Stripping to the brand name pushes the SERP toward the company's own site. The suffix stripping does NOT apply to the judge's input — it receives the full `Company_name` alongside `Search_name` for disambiguation.

**Run-ID continuity**: each entity's `RUN_ID` is taken from its `URL_CHECKS` row (Stage 1's execution ID). Only if that field is empty (hand-seeded rows) does the node generate a 4-digit fallback. This keeps `Exec_key = RUN_ID + "_" + EntityKey` consistent across all stages.

---

## 3. Per-entity loop — overview

`Loop Over Entities` (SplitInBatches, batch size 1) processes one entity at a time. Per entity, the flow is:

```
MarkDiscoveringPhase  (CONTROL_EXEC: DISCOVERING_URL_PHASE, PENDING)
    ↓
WaitBeforeSerpapi (2 s)
    ↓
SearchSerpapi  (SerpAPI Google PT, num=10, plain Search_name query)
    ↓
WaitBeforeOpenaiSearch (1 s)
    ↓
SearchOpenaiWeb  (OpenAI Responses API, web_search_preview, gpt-4.1-mini)
    ↓
AggregateCandidates  (merge KG + organic + OpenAI, dedup by host)
    ↓
JudgeOpenai  (gpt-4.1-mini, no web search, pure reasoning from candidate list)
    ↓
ParseJudgeResult  (extract pick, apply fallback tiers if judge returns empty)
    ↓
GateHasCandidate?
    │ no  → PrepFailureNoCandidate → WaitBeforeFailureWrite → UpsertUrlChecksFailure (NO_URL_FOUND)
    │                                                             → MarkDiscoveryDone → loop
    │
    yes
    ↓
BuildSubpageUrls  (homepage + 8 subpage paths)
    ↓
FetchPage  (fetch each URL)
    ↓
ValidateNifOnPages  (scan HTML for NIPC digits)
    ↓
GateUrlAcceptable? (Has_url = outcome ≠ 'NO_URL_FOUND' — always true here)
    ↓
WaitBeforeSuccessWrite (2 s) → UpsertUrlChecksSuccess (Response_class = outcome)
                                   → MarkDiscoveryDone → loop
```

---

## 4. Source 1 — SerpAPI (`SearchSerpapi`)

```
GET https://serpapi.com/search
  q          = <Search_name>
  engine     = google
  google_domain = google.pt
  hl         = pt
  gl         = pt
  location   = Portugal
  num        = 10
```

Returns organic results (up to 10) and a Knowledge Graph object. The query uses the brand name (`Search_name`), not `site:`. The `site:` form was used in Stage 2 Collector A (own-domain signals); here we want the open web ranked by relevance for the company name.

Knowledge Graph (`kg.website`) is the highest-trust organic signal — Google has manually associated this URL with the entity's knowledge base entry. Organic results carry lower individual trust but provide breadth.

SerpAPI errors (`onError: continueRegularOutput`) are safe — `AggregateCandidates` handles an empty/error SerpAPI response gracefully.

---

## 5. Source 2 — OpenAI websearch (`SearchOpenaiWeb`)

```
POST https://api.openai.com/v1/responses
  model: gpt-4.1-mini
  tools: [{ type: "web_search_preview", user_location: { country: "PT", city: "Lisbon", ... } }]
  tool_choice: "required"
  text.format: json_schema → { candidate_url, candidate_host, confidence, reasoning }
```

The system prompt instructs the model to visit the URL before responding and to return empty `candidate_url` if it cannot confirm with reasonable confidence. The aggregator blocklist is repeated in the system prompt to prevent the model from returning directory URLs.

**Why two separate OpenAI calls?** The first call (`SearchOpenaiWeb`) uses `web_search_preview` — it actively browses the web. The second call (`JudgeOpenai`) receives the aggregated candidate list and reasons over it without web access. Combining them would produce a single model call that mixes search and ranking — empirically more prone to hallucinating URLs not in the candidate list and to ignoring lower-ranked candidates that the judge might have promoted.

**Retry**: `maxTries: 4, waitBetweenTries: 5000`. OpenAI rate limits are the most common failure; the exponential back-off handles transient 429s.

---

## 6. Candidate aggregation (`AggregateCandidates`)

Combines results from all three sources into a unified candidate list, deduped by hostname.

**Blocklist.** Applied to every candidate host before it enters the list:
`racius, einforma, iberinform, dnb, dun-and-bradstreet, paginasamarelas, opencorporates, bloomberg, linkedin, facebook, instagram, twitter, x.com, google, wikipedia, yelp, companyradar, bizapedia, zoominfo, statista, crunchbase, glassdoor, kompass, europages, infobel, guiafiscal, pj.gov, empresite, jornaldenegocios, reddit, pinterest, youtube, tiktok, freepik, shutterstock, softwaresuggest, tourmag, sapo, bportugal, diariodarepublica, infoempresas, pai, ipac, stock.adobe, comum.rcaap`

**Source priority dedup** (when two sources agree on the same host):

| Source | Trust rank |
|---|---|
| `serpapi_kg` | 3 (highest) |
| `openai_websearch` | 2 |
| `serpapi_organic` | 1 |

When the same host appears from multiple sources, the highest-rank source wins. But `oai_conf` (OpenAI's stated confidence) and `nif_in_snippet` (see below) are **merged across sources** — a cross-source agreement is a stronger signal than a single-source one.

**NIF-in-snippet detection.** For SerpAPI results, the node checks whether the NIPC digits appear anywhere in the title+snippet text. If they do, `nif_in_snippet = true` is set on that candidate. This is a near-deterministic confirmation: Google has indexed the company's tax ID on this domain. Crucially, **OpenAI's `reasoning` text is excluded** from this check — the model sometimes generates the NIPC in its prose whether or not it found it on the page, which would produce false positives.

**Candidate list output**: sorted descending by source trust rank (KG → OpenAI → organic).

---

## 7. GPT judge (`JudgeOpenai` + `ParseJudgeResult`)

A second GPT-4.1-mini call with no web access. It receives the candidate list (URL, host, source, snippet for each) and the company's legal name, NIPC, and `Search_name`. Its task: pick the official site domain. The structured output schema is:

```json
{
  "chosen_url": "https://empresa.pt",
  "chosen_host": "empresa.pt",
  "picked_from": "serpapi_kg | serpapi_organic | openai_websearch | none",
  "confidence": "high | medium | low | none",
  "reasoning": "..."
}
```

`ParseJudgeResult` then:
1. Extracts the pick and normalizes the URL to root (`https://hostname`).
2. Applies the blocklist again as a belt-and-braces check.
3. If the judge returns empty or blocked, applies **fallback tiers**:
   - **Tier 1**: Any candidate with `source = serpapi_kg` → accept.
   - **Tier 2**: Any candidate with `source = openai_websearch` AND OpenAI top-level confidence = `high` or `medium` → accept.
   - **Cross-source ratification**: Any candidate whose `oai_conf` is `high` or `medium` (from a prior OpenAI source that was merged during aggregation) → accept.
   - **NIF-in-snippet ratification**: Any candidate with `nif_in_snippet = true` → accept (even from organic source).
   - **Anything below these tiers** → NO_CANDIDATE → `NO_URL_FOUND`.

The fallback ensures that high-confidence single-source signals aren't discarded just because the judge failed (e.g. OpenAI quota error on the judge call). It deliberately excludes raw SerpAPI organic results without corroboration — those are too noisy.

---

## 8. Homepage + subpage fetch and NIF validation

If a candidate URL is found, `BuildSubpageUrls` fans out 9 URLs:
- The root URL (homepage)
- 8 fixed subpaths: `/contactos`, `/contacto`, `/sobre`, `/sobre-nos`, `/quem-somos`, `/legal`, `/termos`, `/aviso-legal`

`FetchPage` fetches each (15 s timeout, 2 retries, 1.5 s wait, UA: Chrome 120 PT locale, `allowUnauthorizedCerts: true`, full response with `responseFormat: text`).

`ValidateNifOnPages` processes all fetched pages:
- Strips scripts, styles, noscript, comments, and all HTML tags from each page body.
- HTML entities are decoded before digit extraction.
- Checks whether the NIPC digit string appears in the cleaned text of any page.
- Also checks homepage reachability: `statusCode < 400` AND `body.length > 1000`.

**Outcome ladder:**

| Condition | `Discovery_outcome` | `Has_url` |
|---|---|---|
| NIPC digits found in any fetched page body | `URL_DISCOVERED` | `true` |
| NIPC was in SerpAPI snippet (`Snippet_nif_match`) AND homepage responds | `URL_DISCOVERED` | `true` |
| Homepage responds (no NIF confirmation) | `URL_LIKELY` | `true` |
| Homepage does not respond (DNS, ECONNREFUSED, all-400+) | `URL_FOUND_NOT_RESPONDING` | `true` |

Note: `Has_url = outcome !== 'NO_URL_FOUND'` — which means all four outcomes from `ValidateNifOnPages` set `Has_url = true` (none of them are `NO_URL_FOUND`). `GateUrlAcceptable.out(1)` is therefore not reached from this path; it would only be triggered by explicit `Has_url = false`, which `ValidateNifOnPages` never sets.

The distinction between `URL_DISCOVERED`, `URL_LIKELY`, and `URL_FOUND_NOT_RESPONDING` matters downstream:
- Stage 2 (MA) processes `URL_DISCOVERED` and `URL_LIKELY` (it has a URL to scrape).
- Stage 2 skips `URL_FOUND_NOT_RESPONDING` (the URL exists but the site is down — scraping is pointless).
- Stage 3 handles `URL_FOUND_NOT_RESPONDING` and `NO_URL_FOUND` (it works without a live URL).

---

## 9. Sheet writes

### `URL_CHECKS` — success path (`UpsertUrlChecksSuccess`)

Matched on `Entity_key` (not `Exec_key` — overwrites the Stage 1 row for this entity).

| Column | Value |
|---|---|
| `Exec_key` | `RUN_ID + "_" + EntityKey` |
| `Response_class` | `Discovery_outcome` (URL_DISCOVERED / URL_LIKELY / URL_FOUND_NOT_RESPONDING) |
| `Final_url` | `Candidate_URL` |
| `Request_url` | `Candidate_URL` |
| `Source_signal` | `serpapi_kg / serpapi_organic / openai_websearch` |
| `Pick_method` | `judge / fallback` |
| `Content_type` | Content-Type of the homepage response |
| `Transport_error` | `''` (cleared) |

### `URL_CHECKS` — failure path (`UpsertUrlChecksFailure`)

| Column | Value |
|---|---|
| `Response_class` | `NO_URL_FOUND` (hard-coded) |
| `Source_signal` | `none` |

### `CONTROL_EXEC` — `MarkDiscoveryDone`

Written for every entity at the end of the loop iteration (both success and failure paths converge here):

| Column | Value |
|---|---|
| `Current_phase` | `DISCOVERING_URL_PHASE` |
| `Process_Status` | `DONE` |
| `Next_action` | `STAGE 2` if outcome is `URL_DISCOVERED` or `URL_LIKELY`; `STAGE 3` otherwise |
| `Queued_action` | `''` |

---

## 10. `CONTROL_EXEC` state transitions

| When | Node | `Current_phase` | `Process_Status` | `Next_action` |
|---|---|---|---|---|
| Start of each entity in loop | `MarkDiscoveringPhase` | `DISCOVERING_URL_PHASE` | `PENDING` | (unchanged) |
| End of each entity (success or failure) | `MarkDiscoveryDone` | `DISCOVERING_URL_PHASE` | `DONE` | `STAGE 2` or `STAGE 3` |

`MarkDiscoveryDone` intentionally sets `Current_phase = DISCOVERING_URL_PHASE` on the done write (not a different value like `URL_DISCOVERED_DONE`). This keeps the phase field reflecting the workflow that last touched the entity, while `Process_Status = DONE` signals completion.

---

## 11. Wait nodes and pacing

| Node | Wait | Purpose |
|---|---|---|
| `WaitBeforeSerpapi` | 2 s | SerpAPI rate limit — one call per entity |
| `WaitBeforeOpenaiSearch` | 1 s | Buffer between SerpAPI response and OpenAI call |
| `WaitBeforeSuccessWrite` | 2 s | Buffer before Sheets write to avoid 429 bursts |
| `WaitBeforeFailureWrite` | 2 s | Same for failure path |

Sheets nodes: `retryOnFail: true, maxTries: 5, waitBetweenTries: 30000` (for upsert nodes) or `maxTries: 3, waitBetweenTries: 10000` (for phase-tracking nodes).

---

## 12. Known constraints and design decisions

1. **Why plain `Search_name` query (not `site:`)**: The `site:` operator forces results to a specific domain — it's used in Stage 2 (where we already know the domain) but defeats the purpose of discovery. A plain name query lets Google's ranking algorithm surface the most authoritative result for the company name.

2. **`new URL()` returns empty hostname in n8n sandbox**: All URL parsing in `AggregateCandidates` and `ParseJudgeResult` falls back to string operations (`replace(/^https?:\/\//i, '').split('/')[0]`) when `new URL()` fails silently.

3. **Blocklist duplication**: The aggregator blocklist appears in three places — `AggregateCandidates` (filter before entering the list), `ParseJudgeResult` (belt-and-braces after judge picks), and the `SearchOpenaiWeb` system prompt (prevent the model from picking a directory). This redundancy is intentional: the model has been observed ignoring system-prompt blocklists under adversarial-style entity names, so the code-level filter is the authoritative gate.

4. **OpenAI `reasoning` text excluded from NIF detection**: The model's reasoning prose sometimes mentions the NIPC in a paraphrase even when it hasn't found it on the target site. Only SerpAPI snippet text (which comes directly from Google's index of the page) is trusted for `nif_in_snippet`.

5. **Judge fallback tier ordering matters**: The tiers go KG → OpenAI high/medium → cross-source → NIF-in-snippet. Raw organic without any corroboration is intentionally excluded from the fallback — those results are too noisy and the judge was supposed to filter them. Bypassing the judge with raw organic would defeat the architecture.

6. **`UpsertUrlChecksSuccess` matches on `Entity_key` (not `Exec_key`)**: This overwrites the Stage 1 row for the entity. If Stage 1 wrote `NO_URL` for this entity, HYBRID's write replaces `Response_class = NO_URL` with the discovered outcome. Only the latest state matters; the Stage 1 entry is considered superseded.

7. **Empirical results (run 2025, 1 execution, ~50 entities)**: 32% URL recovery rate (entities that went from `NO_URL` to `URL_DISCOVERED` or `URL_LIKELY`), 100% NIF precision on recovered entities (no known false-positive attributions). These numbers are early-stage; a larger sample would be needed for stable estimates.
