# Project Notes

Cross-session reminders, design decisions, and pending actions.
Update this file whenever a decision is made or a task needs to survive across sessions.

---

## Pending actions

### Firecrawl API key — URGENT
- Old key `fc-bcb07136c3e64a7a8ab7c51dcf397568` was hardcoded in Stage 2 and committed to git history. **Treat as compromised.**
- [ ] Revoke old key at firecrawl.dev
- [ ] Generate new key
- [ ] Add to `.env` as `FIRECRAWL_API_KEY=<new_key>`
- [ ] Set `Bearer <new_key>` in `Authorization` header of `FirecrawlStartCrawl` and `PollCrawlStatus` nodes in `Stage 2 - MA.workflow.ts` (or configure via n8n credential — preferred so key never touches the `.workflow.ts` file again)

---

## Design decisions

### Google Sheets write strategy — Stage 2 (Option B: Wait node)
2-second Wait node before each Sheets write, rather than batching all rows into a single append call.

**Why:** Safer partial output per company — if one write fails, only that row is lost. Dataset is currently small enough that the latency is acceptable.

**Revisit if:** Pipeline grows to thousands of companies per run. At that scale Option B is too slow (1000 companies × 9 rows × 2 s ≈ 5 hrs on writes alone). Option A (batch) is faster but risks losing all rows in a phase if the single call fails. Also: Sheets API has a 10 MB payload limit per call.

---

### No company-name / homepage-text overlap filter in URL discovery
Do not filter out URL candidates because the company legal name doesn't appear in homepage text.

**Why:** Portuguese companies frequently operate under a brand name that diverges from the legal name (e.g. `Phluirsense, Lda.` → `homeblock.pt`). A name-overlap kill-switch would drop real URLs. Confirmed by user with a concrete example.

**Acceptable precision guards:** (a) NIPC/NIF digit match on the page, (b) reachable homepage + plausible HTTP response, (c) aggregator/directory blocklist on the host. Name-token overlap is fine as one *positive* signal in multi-candidate scoring, never as a discard rule.

---

## Pipeline documentation

Every active workflow has a companion `.md` in the sync folder:

| File | Covers |
|---|---|
| `workflows/.../personal/PIPELINE.md` | Spine: full pipeline diagram, both workbooks, all tab schemas, status taxonomy, retired alternatives |
| `workflows/.../personal/STAGE_1.md` | URL normalization, 3-tier HTTP cascade, CONTROL_EXEC transitions |
| `workflows/.../personal/URL_DISCOVER_HYBRID.md` | JoinFilterCleanName gate, SerpAPI + OpenAI search, GPT judge, NIF validation, outcome ladder |
| `workflows/.../personal/STAGE_2.md` | SerpAPI scrape + Firecrawl, coverage gate, attribution rules, address trimming |
| `workflows/.../personal/STAGE_3_RESEARCH.md` | ComputeMissingFields, URL state cohorts, SerpAPI + OpenAI per-field pick, stage3_not_found |

Read the matching `.md` before editing any `.workflow.ts`.

Retired workflows (`URL_DISCOVER_OPENAI`, `URL_DISCOVER_STAGE_2.1`) have no companion docs — rationale in `PIPELINE.md §4`.
