# STAGE 1 — Trustscan Company Contacts (URL Validation)

> **Workflow ID:** `cUUUCbn21ZeikazR-pmgX` · **File:** `Trustscan Company Contacts Stage 1 - URL Validation.workflow.ts` · **Sheet doc:** `1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE`
>
> This document explains the **logic** of Stage 1 — what each phase tries to achieve, how data flows, and the rules governing URL normalization, HTTP testing, and state transitions. It is not a node-by-node inventory; the workflow file and its `<workflow-map>` header are the authoritative source for that.
>
> **When to update this doc:** when the URL normalization strategy changes, when a new HTTP fallback tier is added, when the response-class taxonomy changes, or when the CONTROL_EXEC write schema changes.

---

## 0. Pipeline context — where Stage 1 fits

Stage 1 is the **first** workflow in the pipeline. It reads the raw company list, assigns stable identities to every entity, and performs an initial HTTP test on any URL that already exists in the input. Its output determines which pathway each entity follows downstream.

See `PIPELINE.md` for the full four-workflow pipeline diagram and Google Sheets schema.

### What Stage 1 reads

- `Cliente_BD_INPUT` · `Página1` (Sheet ID `1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU`) — the raw export from the client registry: NIPC, legal name, address, raw contact fields, and an optional raw website URL.

### What Stage 1 writes

| Tab (in `Cliente_BD_OUTPUT`) | Operation | Key |
|---|---|---|
| `INPUT_SNAPSHOT` | `appendOrUpdate` matched on `NIPC` | Snapshot of every input row with pipeline metadata |
| `CONTROL_EXEC` | `appendOrUpdate` matched on `Exec_key` | Three writes per entity: INGESTED → URL_SKIPPED or URL_VALIDATED or URL_FAILED |
| `URL_CHECKS` | `appendOrUpdate` matched on `Exec_key` | One row per entity with the HTTP test result |

---

## 1. Purpose

For each company in the input:

1. Assign stable pipeline identifiers (`Run_ID`, `Entity_key`, `Exec_key`).
2. Normalize the raw website field to a canonical HTTPS URL.
3. Run an HTTP health check on any URL that exists.
4. Write the result to `URL_CHECKS` and advance `CONTROL_EXEC` so downstream workflows know what to do next.

Stage 1 does **not** discover URLs — that is HYBRID's job. It only validates URLs that are already in the registry input.

---

## 2. Identity assignment (`INGEST · Normalizar + IDs`)

The first code node runs per-item and produces the canonical identifiers used by every downstream workflow:

| Field | Derivation |
|---|---|
| `run_id` | `$execution.id` (n8n execution ID) — unique per Stage 1 run |
| `entity_key` | NIPC if present; else `Entidade`; else `ROW_<input_row>` |
| `exec_key` | `run_id + "_" + entity_key` — the cross-tab join key |
| `input_row` | Row number in the source sheet |

URL normalization produces three outputs:

| Field | Value |
|---|---|
| `website_raw` | Raw value from `Internet` / `Website` / `internet` input column, whitespace-stripped |
| `website_norm` | Canonical URL (see §3) |
| `website_norm_status` | `NO_INPUT` \| `NORMALIZED_STRICT` \| `COERCED_FALLBACK` \| `FAILED` |

Business fields (`nipc`, `nome`, `morada`, `localidade`, `cod_postal`, `concelho`, `distrito`, `telefone`, `fax`, `email`, `internet`) are also normalized for consistent casing and whitespace.

Entities missing both `nipc` and `entidade` are dropped at this stage (`return null`).

---

## 3. URL normalization strategy

The normalizer tries to produce a valid HTTPS URL from whatever the registry field contains.

**Strict path** (`normalizeUrlForceHttps`):
1. Strip leading/trailing whitespace and invisible Unicode characters.
2. Remove trailing punctuation (`),.;`).
3. Reject `mailto:`, `tel:`, `ftp:` schemes.
4. Prefix `//` → `https:`.
5. Fix double-scheme duplication (`https://https://...` → `https://...`).
6. Force `http://` → `https://`.
7. Parse with `new URL()` — requires a hostname with at least one `.`. Strip hash fragment. Return canonical form.

**Soft coerce path** (`softCoerceUrl`) — runs when strict path fails:
1. Same whitespace/punctuation cleanup.
2. Skip `mailto:`/`tel:`/`ftp:`.
3. If no scheme detected, prepend `https://`.
4. Strips `http://` or `https://` from the input before prepending (handles `https://http://...`).

If the registry field is empty → `website_norm = ''`, status = `NO_INPUT`.
If both strict and coerce fail → `website_norm = ''`, status = `FAILED`.

**Why coerce?** Registry data frequently contains values like `www.empresa.pt` (no scheme) or `empresa.pt/contactos` (path without scheme). The strict path rejects these; the soft coerce salvages them with an `https://` prefix and returns them for HTTP testing.

---

## 4. Three-tier HTTP test (entities with a URL)

After normalization, entities with a non-empty `website_norm` pass the `Gate Has Website` node and enter a three-tier HTTP cascade. The goal is to find any responding endpoint for the URL, trying progressively more permissive methods.

```
                          ┌────────────────────────────┐
                          │ Gate: has website_norm?    │
                          └──────────┬─────────────────┘
                                     │ yes
                                     ▼
                       ┌─────────────────────────────┐
                       │ TIER 1: HEAD request         │
                       │ (HttpsHeadRequestUrl)        │
                       └──────────┬──────────────────┘
                          success │        │ error
                                  │        ▼
                              Write     ┌──────────────────────────────┐
                            SUCCESS     │ HeadNormalizaErro             │
                                        │ DecideHttpFallback            │
                                        └──────┬───────────────────────┘
                                               │
                              ┌────────────────┴───────────────┐
                              │ TIER 2a: GET                   │ TIER 2b: HTTP Request
                              │ (HttpsGetRequestUrl)           │ (HttpRequest — plain fallback)
                              └──────────┬─────────────────────┴──────────────┐
                                 success │      │ error            success │   │ error
                                         │      ▼                          │   ▼
                                     Write  Write error               Write  Write error
                                   SUCCESS  to URL_CHECKS           SUCCESS  to URL_CHECKS
```

**Tier 1 — HEAD.** Fast, low-bandwidth. If the server returns any 2xx (or follows redirects to a 2xx), the entity is `URL_VALIDATED`. A HEAD error does not immediately write a failure — it moves to `DecideHttpFallback`.

**Tier 2a — GET.** Used when HEAD fails with certain error classes (blocked by server, timeout). A GET response is fed through `GetNormalizaSucess`/`GetNormalizaErro`, which converge at `Merge2`. A GET success writes `SUCCESS` to `URL_CHECKS`.

**Tier 2b — HTTP Request node.** A separate n8n `httpRequest` node (not the HTTP Request base node) handles some edge cases where the standard GET also fails. A success here also writes `SUCCESS`.

**Error write.** Any entity that exhausts all tiers writes its final error state to `URL_CHECKS` with `Response_class` set to a transport error code, and to `CONTROL_EXEC` with `Current_phase = URL_FAILED`, `Queued_action = DISCOVER_URL`.

> The three-tier approach reflects real-world registry data quality: many Portuguese SME websites reject HEAD requests but respond to GET, and some shared-hosting setups respond differently depending on the HTTP client. The fallback chain was built empirically from failed Stage 1 runs.

---

## 5. No-URL branch

Entities where `website_norm` is empty (either `NO_INPUT` or normalization `FAILED`) skip the HTTP cascade entirely. The `Code "Sem URL"` node emits:

```json
{
  "Website_ResponseClass": "NO_URL",
  "Queued_action": "DISCOVER_URL",
  "Current_phase": "URL_SKIPPED"
}
```

These entities go directly to `AUDIT · Append URL_CHECKS (NO_URL)` and `STATE · Update CONTROL_EXEC (NO_URL)`, which write `Response_class = NO_URL` to `URL_CHECKS` and `Current_phase = URL_SKIPPED, Queued_action = DISCOVER_URL` to `CONTROL_EXEC`.

HYBRID picks up entities with `Response_class = NO_URL` on its next run.

---

## 6. Parallel writes at startup

After `INGEST · Normalizar + IDs`, three operations run in parallel before HTTP testing begins:

1. **`STATE · Upsert CONTROL_EXEC (INGESTED)`** — Writes `Current_phase = INGESTED` immediately. Provides an audit trail even if HTTP testing crashes mid-run.
2. **`STATE · Upsert SNAPSHOT`** — Mirrors all business fields to `INPUT_SNAPSHOT` (matched on `NIPC`). This is the canonical company-name source for HYBRID and Stage 3.
3. **Feed into `Merge`** — The entity proceeds to `GateTemWebsiteNorm` for HTTP testing.

The `Merge` node (`combineBySql`, RIGHT JOIN on `exec_key`) ensures HTTP testing starts only after both CONTROL_EXEC and SNAPSHOT writes have completed for the entity. This prevents a crash in Sheets writes from leaving an entity in an undocumented state.

---

## 7. `URL_CHECKS` writes

Stage 1 writes to `URL_CHECKS` once per entity (upserted on `Exec_key`). The schema is documented in `PIPELINE.md §2.3`. Key values per path:

| Path | `Response_class` | `Final_url` | `Request_method` |
|---|---|---|---|
| No URL | `NO_URL` | (empty) | `None` |
| HEAD success | `SUCCESS` (from normalizer) | redirected URL | `HEAD` |
| GET success | `SUCCESS` | redirected URL | `GET` |
| HTTP Request success | `SUCCESS` | redirected URL | `GET` |
| HEAD error only | error class | (empty or attempted) | `HEAD` |
| All tiers fail | transport error code | (empty) | varies |

---

## 8. `CONTROL_EXEC` state transitions

Stage 1 writes to `CONTROL_EXEC` at three points per entity:

| When | Node | `Current_phase` | `Process_Status` | `Queued_action` |
|---|---|---|---|---|
| Start | `STATE · Upsert CONTROL_EXEC (INGESTED)` | `INGESTED` | `IN_PROGRESS` | `''` |
| URL success | `STATE · Update CONTROL_EXEC (pós HTTP_OK)` | `URL_VALIDATED` | `PENDING` | `ENRICH_FROM_WEBSITE` |
| URL error | `STATE · Update CONTROL_EXEC (pós HTTP_ERR)` | `URL_FAILED` | `PENDING` | `DISCOVER_URL` |
| No URL | `STATE · Update CONTROL_EXEC (NO_URL)` | `URL_SKIPPED` | `PENDING` | `DISCOVER_URL` |

`ENRICH_FROM_WEBSITE` → entity proceeds to Stage 2 directly.
`DISCOVER_URL` → entity must go through HYBRID first.

---

## 9. Run-ID propagation

`Run_ID` is set to `$execution.id` (the n8n cloud execution ID for this Stage 1 run). It is written to every `URL_CHECKS` and `CONTROL_EXEC` row. HYBRID reads `Run_ID` from each `URL_CHECKS` row and propagates it unchanged, so all downstream rows remain joinable on `Exec_key = Run_ID + "_" + Entity_key`.

A fallback (current timestamp) is used only if `$execution.id` is unavailable — this should not occur in practice.

---

## 10. Known constraints

1. **`new URL()` in n8n sandbox**: The vm2 sandbox may return `new URL('invalid')` with an empty hostname instead of throwing. The normalizer checks `!u.hostname || !u.hostname.includes('.')` defensively.

2. **Duplicate NIPC rows in input**: If the source sheet has two rows with the same NIPC, both will be processed. `CONTROL_EXEC` and `URL_CHECKS` will be upserted (the second run overwrites the first). `INPUT_SNAPSHOT` is also upserted on `NIPC` so only the last row survives.

3. **Sheets `appendOrUpdate` replaces `$json`**: The Sheets write response uses sheet column names (`Run_ID` not `run_id`). Code nodes after a Sheets write must reference the column-name casing. This is why the CONTROL_EXEC write at the HTTP-OK stage reads `$json.Run_ID` (capital R) while code before it uses `$json.run_id`.

4. **The `Merge` node SQL**: `RIGHT JOIN input2` means HTTP testing depends on input2 (the direct normalize output). Input1 (CONTROL_EXEC write output) and input3 (SNAPSHOT write output) are joined in only to synchronize timing; their data isn't needed downstream and may return empty on Sheets quota errors without blocking HTTP testing.

5. **`Attempts` field**: Stage 1 writes `Attempts = 1` on the first try. If Stage 1 is re-run for the same entity, the upsert increments the attempt count. The value is carried forward by HYBRID using the `Run_ID` propagation — `Attempts` in CONTROL_EXEC does not accumulate across stages.
