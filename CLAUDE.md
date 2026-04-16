# CLAUDE.md — n8n AI Agent Guide

> **Audience.** This file is read automatically by Claude Code when it opens this workspace. It is the single source of truth for how an AI agent should build, validate, and ship n8n workflows here.
>
> **Context.** This workspace uses [`n8n-as-code`](https://n8nascode.dev) — an ontology-aware CLI and TypeScript DSL (`@workflow`, `@node`, `@links` decorators) that lets an agent manage a live n8n instance through version-controlled files instead of the n8n UI.
>
> **Authoritative references.** Treat `AGENTS.md` (workspace root) and `plugins/claude/n8n-as-code/skills/n8n-architect/SKILL.md` as the definitive operating manual. This `CLAUDE.md` organizes them into a progressive methodology; if there is ever a conflict, `AGENTS.md` wins.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Architecture & Key Components](#2-architecture--key-components)
3. [Core Concepts](#3-core-concepts)
4. [The `n8nac` Command Surface](#4-the-n8nac-command-surface)
5. [Methodology — Three-Phase Workflow Building](#5-methodology--three-phase-workflow-building)
    - [Phase 1 — Simple Workflows](#phase-1--simple-workflows)
    - [Phase 2 — Validation](#phase-2--validation)
    - [Phase 3 — Complexity](#phase-3--complexity)
6. [Step-by-Step: Create a New Workflow](#6-step-by-step-create-a-new-workflow)
7. [Common Workflow Patterns](#7-common-workflow-patterns)
8. [Best Practices](#8-best-practices)
9. [Common Mistakes to Avoid](#9-common-mistakes-to-avoid)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)
11. [Resources](#11-resources)

---

## 1. What This Project Is

This workspace pairs a live n8n instance (`https://trustscan.app.n8n.cloud`, project `Personal`) with an agent-first toolkit that:

- **Represents workflows as TypeScript.** Every `.workflow.ts` file is a class decorated with `@workflow` / `@node` / `@links`. This gives Git-friendly diffs, type checking, and a form that's easy for an LLM to read and edit.
- **Carries the full n8n ontology.** The `n8nac skills` CLI ships **537 nodes, 10,209 properties, 1,243 docs pages, and 7,702 community workflow templates** — searchable in ~5 ms. The agent never needs to guess a parameter name.
- **Runs a GitOps sync loop.** Explicit `pull` / `push` / `resolve` against the remote instance with 3-way merge and Optimistic Concurrency Control.
- **Closes the runtime loop.** The agent can detect missing credentials after a push, ask the user only for the secret values, create the credential via API, activate the workflow, fire the webhook, and inspect the resulting execution — all without opening the n8n UI.

n8n version currently targeted: **2.14.2**. Keep the instance up to date — an outdated instance can't render nodes whose `typeVersion` doesn't exist on the server.

---

## 2. Architecture & Key Components

```
┌──────────────────────────────────────────────────────────────────┐
│  User interface (Claude Code, VS Code, CLI, OpenClaw, Yagr)      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
   ┌─────────────────┐              ┌──────────────────┐
   │   n8nac CLI     │              │  n8n-architect   │
   │ sync / test /   │              │   Claude skill   │
   │ verify / creds  │              │ (plugins/claude) │
   └────────┬────────┘              └────────┬─────────┘
            │                                │
            ▼                                ▼
   ┌────────────────────────────────────────────────────┐
   │              AI Skills Layer (ontology)            │
   │  537 nodes · 10 209 properties · 1 243 doc pages   │
   │  7 702 templates · FlexSearch (~5 ms) · validation │
   └────────────────────┬───────────────────────────────┘
                        │
            ┌───────────┴────────────┐
            ▼                        ▼
   ┌──────────────────┐     ┌──────────────────────┐
   │   Transformer    │     │     Sync Engine      │
   │  JSON ↔ TS DSL   │     │ 3-way merge / OCC    │
   └────────┬─────────┘     └──────────┬───────────┘
            │                          │
            ▼                          ▼
   ┌──────────────────────────────────────────────────┐
   │            Local `.workflow.ts` files            │
   │  workflows/<instanceId>/<project>/*.workflow.ts  │
   └────────────────────────┬─────────────────────────┘
                            │  push / pull
                            ▼
   ┌──────────────────────────────────────────────────┐
   │              Live n8n instance                   │
   │         https://trustscan.app.n8n.cloud          │
   └──────────────────────────────────────────────────┘
```

### Workspace layout

| Path | Purpose |
|---|---|
| `n8nac-config.json` | Active instance + sync folder + project. **Never edit by hand** — use `n8nac instance …` commands. |
| `AGENTS.md` | Authoritative agent playbook (auto-generated by `n8nac update-ai`). |
| `workflows/<instance>/<project>/*.workflow.ts` | The local source of truth for every remote workflow. |
| `packages/cli` | `n8nac` CLI source. |
| `packages/skills` | Node ontology, search index, schema validator. |
| `packages/transformer` | JSON ↔ TypeScript conversion. |
| `plugins/claude/n8n-as-code/skills/n8n-architect` | The Claude Code skill wrapping all of the above. |
| `docs/` | Docusaurus site (local mirror of `n8nascode.dev`). |
| `superpowers/` | Agent development framework (second workspace root; used for skill authoring, not day-to-day workflow work). |

### Active instance (from `n8nac-config.json`)

| Key | Value |
|---|---|
| Host | `https://trustscan.app.n8n.cloud` |
| Project | `Personal` |
| Sync folder | `workflows/trustscan_cloud_user_77167e17_8a6d_4b1a_b3a4_b81a1893dbfa/personal` |

**New workflow files MUST be created in that sync folder.** Never put `.workflow.ts` files in the repo root.

---

## 3. Core Concepts

### 3.1 The `.workflow.ts` DSL

Every workflow is a decorated class:

```typescript
import { workflow, node, links } from '@n8n-as-code/transformer';

@workflow({ name: 'Hello World', active: false })
export class HelloWorldWorkflow {
  @node({
    name: 'Trigger',
    type: 'n8n-nodes-base.manualTrigger',
    version: 1,
    position: [0, 0],
  })
  Trigger = {};

  @node({
    name: 'Set Greeting',
    type: 'n8n-nodes-base.set',
    version: 3.4,
    position: [220, 0],
  })
  SetGreeting = {
    assignments: {
      assignments: [
        { id: '1', name: 'message', value: 'Hello, {{ $json.name ?? "world" }}!', type: 'string' },
      ],
    },
  };

  @links()
  defineRouting() {
    this.Trigger.out(0).to(this.SetGreeting.in(0));
  }
}
```

Rules to remember:

- **`type`** must be the exact string from `n8nac skills node-info` (with the full package prefix, e.g. `n8n-nodes-base.set`, not `set`).
- **`version`** must be one of the values listed in the schema — never invent a number.
- **Property names** (`Trigger`, `SetGreeting`, …) are how you reference nodes inside `@links()`.
- **`name`** (inside `@node({...})`) is the user-visible label in n8n and must match the string you connect to in routing.

### 3.2 The `<workflow-map>` comment block

Every `.workflow.ts` file, after a pull or push, is regenerated with a compact index at the top. **Always read this block first.** It shows every node, every routing edge, every AI `.uses()` connection — without loading 1,500 lines of parameters into context.

```
// <workflow-map>
// Workflow : AI Agent
// Nodes   : 6  |  Connections: 1
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                 Node type (short)        Flags
// ChatTrigger                   chatTrigger
// AiAgent                       agent                     [AI]
// OpenaiModel                   lmChatOpenAi              [creds] [ai_languageModel]
// Memory                        memoryBufferWindow        [ai_memory]
// SearchTool                    httpRequestTool           [ai_tool]
//
// ROUTING MAP
// ChatTrigger
//   → AiAgent
//
// AI CONNECTIONS
// AiAgent.uses({ ai_languageModel: OpenaiModel, ai_memory: Memory, ai_tool: [SearchTool] })
// </workflow-map>
```

Flags you'll see:

- `[AI]` — this is an AI/LangChain node that accepts sub-nodes.
- `[ai_*]` — this node is a sub-node (model, memory, tool, parser, …). **It does NOT appear in the `→` routing.** It connects via `.uses()`.
- `[creds]` — the node needs credentials.
- `[onError→out(1)]` — second output branch handles errors.
- `[alwaysOutput]` — `alwaysOutputData: true` (emits items even on empty input).

### 3.3 Regular connections vs `.uses()` (CRITICAL)

| Connection type | Syntax | Example |
|---|---|---|
| Regular data flow | `source.out(<i>).to(target.in(<j>))` | `this.Trigger.out(0).to(this.Agent.in(0))` |
| AI single sub-node | `target.uses({ ai_*: this.Sub.output })` | `this.Agent.uses({ ai_languageModel: this.Model.output })` |
| AI array sub-node (`ai_tool`, `ai_document`) | `target.uses({ ai_tool: [this.A.output, this.B.output] })` | `this.Agent.uses({ ai_tool: [this.Search.output] })` |

**Using `.out().to()` for an AI sub-node produces invisible/broken connections in n8n. Never do it.**

### 3.4 GitOps sync model

This project uses a **Git-like explicit sync model** with Optimistic Concurrency Control. Local files are the source of truth for editing; remote is the source of truth for IDs and runtime state.

```
     pull (id)
 ┌──────────┐◄────────────┌──────────┐
 │   n8n    │             │   Local  │
 │  remote  │──────────── ►│  files   │
 └──────────┘  push (path)└──────────┘
                                │ git commit
                                ▼
                         ┌─────────────┐
                         │   Git repo  │
                         └─────────────┘
```

Core rules:

1. **Pull before edit.** `n8nac pull <id>` before you touch an existing workflow.
2. **Push after edit.** `n8nac push <path>` — pass the full path, not a bare filename.
3. **OCC conflict?** Resolve explicitly with `n8nac resolve <id> --mode keep-current|keep-incoming`.

### 3.5 Error classification (for post-push testing)

`n8nac test` classifies failures into three buckets. **Reacting to the wrong class wastes iterations.**

| Class | Exit | What it means | Agent response |
|---|---|---|---|
| **Class A** | 0 | Configuration gap (missing creds, unset LLM model, missing env var) | Inform the user; do NOT re-edit code. |
| **Runtime-state** | 0 | Webhook test URL not armed / prod webhook not registered | Resolve the state issue (activate, arm in UI); do NOT re-edit code. |
| **Class B** | 1 | Wiring error (bad expression, wrong field, HTTP mistake) | Fix the `.workflow.ts`, push, re-test. |

> `validate` ≠ `test`. A workflow can pass static validation and still fail at runtime with any of the three classes above.

---

## 4. The `n8nac` Command Surface

Every command below is runnable as `npx --yes n8nac …`. Always run from the workspace root.

### Workspace / instance

```bash
n8nac instance list --json                            # Show saved instance configs
n8nac instance select --instance-name <name>          # Switch active instance
n8nac init-auth --host <url> --api-key <key>          # Step 1 — credentials
n8nac init-project --project-index 1 --sync-folder workflows   # Step 2 — project selection
n8nac init --yes --host <url> --api-key <key> --project-name <n>  # 1-command alias
```

### Discovery (the ontology)

```bash
n8nac skills search "google sheets"                   # Full-text search (PRIMARY TOOL)
n8nac skills node-info googleSheets                   # Full schema, operations, required params
n8nac skills node-schema googleSheets                 # Quick reference
n8nac skills examples search "AI agent"               # Search 7,702 community templates
n8nac skills examples info 916                        # Template details
n8nac skills examples download 4365                   # Download template JSON
n8nac skills docs "OpenAI"                            # Doc pages
n8nac skills guides "webhook"                         # Tutorial pages
```

### Sync

```bash
n8nac list                                            # Status of every workflow
n8nac list --local                                    # Local files only
n8nac list --remote                                   # Remote workflows only
n8nac pull <id>                                       # Remote → local
n8nac push <path>                                     # Local → remote (full path, with .workflow.ts)
n8nac push <path> --verify                            # Push + live verify
n8nac resolve <id> --mode keep-current                # Force-push on OCC conflict
n8nac resolve <id> --mode keep-incoming               # Force-pull on OCC conflict
```

### Validation (local, pre-push)

```bash
n8nac skills validate <path>                          # Schema check local file
```

### Verification (remote, post-push)

```bash
n8nac verify <workflowId>                             # Fetch + check against schema
```

### Runtime loop (webhook / chat / form triggers)

```bash
n8nac test-plan <id>                                  # Inspect trigger, endpoints, suggested payload
n8nac test-plan <id> --json                           # Structured output for agents

n8nac workflow activate <id>                          # MANDATORY before --prod test
n8nac test <id> --prod                                # Standard test path
n8nac test <id> --data '{"k":"v"}'                    # POST body
n8nac test <id> --query '{"k":"v"}'                   # GET/HEAD query params
```

> **Default rule:** always `workflow activate <id>` then `test <id> --prod`. Bare `test <id>` requires manual arming of the test URL in the n8n editor — do NOT use it as the default path.

### Credentials (resolve Class A without opening the UI)

```bash
n8nac workflow credential-required <id> --json        # Which creds are missing? (exit 1 = missing)
n8nac credential schema <type>                        # Discover required fields for a type
n8nac credential list --json                          # List existing credentials
n8nac credential create --type <type> --name <name> --file cred.json --json
n8nac credential delete <id>
```

> **Never pass secrets inline via `--data`.** Always use `--file` (keeps secrets out of shell history).

### Execution inspection (debug server-side runs)

```bash
n8nac execution list --workflow-id <id> --limit 5 --json
n8nac execution get <executionId> --include-data --json
```

---

## 5. Methodology — Three-Phase Workflow Building

> **Why a progression?** Building n8n workflows is easy to get wrong in a big leap and easy to get right in small ones. Start with something trivially testable, prove the plumbing, then layer in branching, AI, and error handling. The phases below are the cheapest path to a working, shippable workflow.

### Phase 1 — Simple Workflows

**Goal.** Get end-to-end plumbing working: one trigger → one action → one output. No branching, no AI, no loops. You're proving that **you can push, validate, and execute**, not that the business logic is complete.

**Constraints for a Phase-1 workflow**

- ≤ 3 nodes
- Exactly one trigger (prefer **Manual Trigger** or **Webhook**)
- No AI sub-nodes
- No `If` / `Switch` / `Merge`
- No credentials unless the user's goal forces them (pure "Hello world" should use `Set`, not Google Sheets)

**Minimal Phase-1 template**

```typescript
import { workflow, node, links } from '@n8n-as-code/transformer';

@workflow({ name: 'Phase 1 — Echo', active: false })
export class Phase1EchoWorkflow {
  @node({
    name: 'Webhook',
    type: 'n8n-nodes-base.webhook',
    version: 2,
    position: [0, 0],
  })
  Webhook = {
    path: 'phase-1-echo',
    httpMethod: 'POST',
    responseMode: 'lastNode',
  };

  @node({
    name: 'Build Reply',
    type: 'n8n-nodes-base.set',
    version: 3.4,
    position: [260, 0],
  })
  BuildReply = {
    assignments: {
      assignments: [
        { id: '1', name: 'echoed', value: '={{ $json.body }}', type: 'string' },
        { id: '2', name: 'at',     value: '={{ $now.toISO() }}', type: 'string' },
      ],
    },
  };

  @links()
  defineRouting() {
    this.Webhook.out(0).to(this.BuildReply.in(0));
  }
}
```

**Phase-1 checklist**

- [ ] File is inside `workflows/<instance>/<project>/` (the active `workflowDir`).
- [ ] Every `type` / `version` came from `n8nac skills node-info`.
- [ ] No node references a node that doesn't exist in this file.
- [ ] `@links()` wires every node (no dangling nodes).
- [ ] `active: false` while you iterate (flip to `true` only when you push the final version).

Move on to Phase 2 **before** touching logic, not after.

---

### Phase 2 — Validation

**Goal.** Before you add any complexity, prove that the Phase-1 skeleton is green at every layer: local schema, remote schema, runtime.

Run this ladder, in order. Each rung catches a different class of bug.

#### Rung A — Local schema check (pre-push)

```bash
n8nac skills validate workflows/<instance>/<project>/phase-1-echo.workflow.ts
```

Catches: typos in `type`, unknown parameter names, missing required params, wrong value enums. **Fast and offline.** Do this before every push.

#### Rung B — Push + remote verify

```bash
n8nac push workflows/<instance>/<project>/phase-1-echo.workflow.ts --verify
```

Equivalent to `push` then `verify <id>`. Catches: a `typeVersion` the server doesn't support, an `operation` value that's valid locally but your instance is older, etc.

If `--verify` reports errors, fix the `.workflow.ts`, re-validate, and push again. **Do not continue until `--verify` is clean.**

#### Rung C — Test plan inspection

```bash
n8nac test-plan <id>
```

Confirms: this workflow is HTTP-testable (has a Webhook/Chat/Form trigger), shows you the endpoints, suggests a payload inferred from expressions.

If `test-plan` says "not HTTP-testable" (Schedule/polling trigger), skip Rung D — you'll test it by waiting for the next scheduled run, or by temporarily swapping in a Manual Trigger for Phase 2.

#### Rung D — Activate + runtime test

```bash
n8nac workflow activate <id>
n8nac test <id> --prod --data '{"hello":"world"}'
```

Interpret the result by **error class**:

```
┌──────────────┐    ┌─────────────────────────────────────────┐
│  test exit   │ →  │ Action                                  │
├──────────────┤    ├─────────────────────────────────────────┤
│   0 (OK)     │    │ Green light → proceed to Phase 3        │
│   0 (Class A)│    │ Missing creds → provision, DO NOT edit  │
│   0 (rt-stt) │    │ Arm the webhook or re-activate          │
│   1 (Class B)│    │ Edit `.workflow.ts`, push, re-test      │
└──────────────┘    └─────────────────────────────────────────┘
```

#### Rung E — Execution inspection (only if runtime output is wrong)

```bash
n8nac execution list --workflow-id <id> --limit 5 --json
n8nac execution get <executionId> --include-data --json
```

A 2xx webhook response only means n8n accepted the request — the run can still fail inside. Use `execution get` to see per-node item data, not just the terminal error.

**Do not move to Phase 3 until Rung D returns exit 0 with the payload you expect.**

---

### Phase 3 — Complexity

**Goal.** Layer features one at a time. After every change, re-run the Phase-2 ladder. If a rung goes red, stop and fix before adding the next feature.

Recommended order, cheapest first:

1. **Data shaping & expressions.** Add `Set` / `Code` / `Edit Fields` nodes. Use `{{ $json.… }}` modern expressions; `{{ $('NodeName').item.json.field }}` to reach upstream nodes.
2. **Branching.** `If` then `Switch`. Remember: in an `If`/`Switch` rule, `value1` is the expression being evaluated, `value2` is the literal comparison target. Inverting them is the #1 silent bug.
3. **Credentialed integrations.** Google Sheets, HTTP Request with auth, Slack, etc. Run `n8nac workflow credential-required <id> --json` immediately after the push; provision via `credential create --file` if missing.
4. **Loops.** `Loop Over Items` (SplitInBatches). Keep loop bodies small; put the heavy node on the `out(0)` branch and the loop-end on `out(1)`.
5. **Error handling.** Configure `onError: 'continueErrorOutput'` on risky nodes; route the error branch to a logger/audit node. For whole-workflow errors, wire an `Error Trigger` into a separate alerting workflow.
6. **AI sub-nodes.** Add `Agent` + `Chat Model` + `Memory` + `Tool`. **Every AI sub-node connects via `.uses()`, never `.out().to()`.** Array types (`ai_tool`, `ai_document`) must be wrapped in `[ ]` even when there's only one.
7. **Sub-workflows & reuse.** Extract repeated subgraphs into separate `.workflow.ts` files called via `Execute Workflow` node.

**Rule of thumb:** each Phase-3 iteration should add at most one of the items above, then re-validate. Big bang changes cost more to debug than they save to write.

#### Complexity-layer decision tree

```
                ┌────────────────────────────┐
                │  Does Phase 2 still pass?  │
                └──────┬──────────────┬──────┘
                    yes│              │no
                       ▼              ▼
           ┌────────────────┐   ┌──────────────────┐
           │  Add next      │   │ Revert last      │
           │  layer         │   │ change; fix;     │
           │  (1 at a time) │   │ re-run Phase 2   │
           └───────┬────────┘   └──────────────────┘
                   ▼
           ┌────────────────┐
           │ Re-run Phase 2 │
           └───────┬────────┘
                   ▼
           ┌────────────────┐
           │ Commit to git  │
           └────────────────┘
```

---

## 6. Step-by-Step: Create a New Workflow

The concrete, repeatable recipe. Every step has a command — don't skip any.

### Step 0. Verify workspace is initialized

Look at `n8nac-config.json`. It must have `activeInstanceId` pointing at an instance with `projectId`, `projectName`, and `workflowDir`. If not:

```bash
n8nac instance list --json
# If empty or stale:
n8nac init-auth --host <url> --api-key <key> --sync-folder workflows
n8nac init-project --project-index 1
```

**Never tell the user to run `init` themselves.** The agent runs it.

### Step 1. Intelligence gathering (pattern discovery)

```bash
n8nac skills examples search "<your use case>"
```

If an existing community template matches, `download` it and study the node configurations. Extracting patterns beats reinventing them.

### Step 2. Identify every node you'll need

```bash
n8nac skills search "<keyword>"              # Find the exact camelCase node name
n8nac skills node-info <nodeName>            # Get the full schema — your absolute truth
```

Write down for each node:

- Exact `type` string (with package prefix).
- Latest `typeVersion` from the `versions` array.
- Required parameters.
- Valid `resource`/`operation` combinations.

### Step 3. Draft the `.workflow.ts` file

Put it in the active `workflowDir` (read it from the active instance in `n8nac-config.json`). Filename convention: `kebab-case-name.workflow.ts`.

Use the minimal DSL structure from §3.1. Add a `<workflow-map>` comment later — `push` regenerates it for you.

### Step 4. Local validate

```bash
n8nac skills validate <path>
```

Iterate until clean.

### Step 5. Push + verify

```bash
n8nac list --local        # Confirm the file is discoverable
n8nac push <path> --verify
```

If `verify` fails, fix and re-push. Don't activate a workflow that fails `verify`.

### Step 6. Test (webhook/chat/form only)

```bash
n8nac test-plan <id>
n8nac workflow credential-required <id> --json
# If exit 1: provision creds, then:
n8nac workflow activate <id>
n8nac test <id> --prod --data '<json>'
```

### Step 7. Inspect failure (if any)

Use the error-class table in §3.5. For Class B, edit → push → re-test. For Class A, provision the credential. For runtime-state, fix the state, not the code.

### Step 8. Commit

```bash
git add workflows/<instance>/<project>/<file>.workflow.ts
git commit -m "feat(workflow): add <name>"
```

---

## 7. Common Workflow Patterns

### 7.1 Webhook → Transform → Respond

```
Webhook ── Set ── Respond to Webhook
```

Simplest HTTP API. Use `responseMode: 'lastNode'` on the webhook, or add a dedicated `Respond to Webhook` node.

### 7.2 Schedule → Fetch → Upsert to Sheet

```
Schedule Trigger ── HTTP Request ── Code (normalize) ── Google Sheets (appendOrUpdate)
```

Daily ETL. Add `alwaysOutputData: true` on the Sheets node so an empty fetch still emits a row for downstream logging.

### 7.3 If-Branch with Error Audit

```
                       ┌─ out(0) (success) ── Set ── Google Sheets (audit_ok)
 Trigger ── HTTP ──────┤
                       └─ out(1) (error)   ── Set ── Google Sheets (audit_err)
```

Set the HTTP node to `onError: 'continueErrorOutput'`. This is the pattern the Trustscan URL-Validation workflow in this repo uses at scale (40 nodes, dozens of audit branches).

### 7.4 Loop with State Snapshot

```
Trigger ── Read Input ── Loop ──┬─ out(0) ── Process One ── Update State ──┐
                                │                                          │
                                └─ out(1) ── Finalize                      │
                                                                           │
                                ◄──────── loop back into Loop.in(1) ───────┘
```

Use `Loop Over Items` (SplitInBatches). Keep `batchSize: 1` when each item does network I/O to stay within rate limits.

### 7.5 AI Agent with Tools

```
Chat Trigger ── AI Agent ──── .uses({
                                  ai_languageModel: Model,
                                  ai_memory:        Memory,
                                  ai_tool:         [Search, Calculator],
                                  ai_outputParser:  Parser,
                              })
```

See the full example in §3 of `AGENTS.md`. Remember: `ai_tool` and `ai_document` are always arrays; everything else is a single ref. If you attach an `outputParser`, set `hasOutputParser: true` on the agent node.

### 7.6 Multi-Stage Pipeline (cross-workflow)

```
Workflow A (Stage 1) ── Execute Workflow (Stage 2) ── Execute Workflow (Stage 3)
```

Split business stages across files. Each file is smaller, each `.workflow.ts` diff is readable, and you can pin a stable `Stage 1` while iterating on `Stage 2`. The two Trustscan files in this repo are an example of this pattern.

---

## 8. Best Practices

### Node definitions
- Always verify schemas via `n8nac skills node-info` before writing parameters.
- Copy the `type` string exactly — no case changes, no abbreviations.
- Pick the **highest** `typeVersion` listed for the node in the schema (not a guess).
- Reference credentials by name; never hardcode secrets.

### Node naming
- Use "Action Resource" style: `Get Customers`, `Send Slack Alert`, `Upsert Exec State`.
- Avoid generic names like `HTTP Request`, `Set`, `Code 3` — they make the `<workflow-map>` unreadable once you have more than ~10 nodes.

### Expressions
- Modern: `{{ $json.field }}`, `{{ $('NodeName').item.json.field }}`, `{{ $now.toISO() }}`.
- Legacy (avoid): `{{ $node["Name"].json.field }}`.
- Expression values in parameters must start with `=` (e.g. `value: '={{ $json.x }}'`). Plain strings do not need it.

### Connections
- Regular: `this.A.out(0).to(this.B.in(0))`.
- AI sub-nodes: `this.Agent.uses({ ai_*: this.Sub.output })`.
- Error branch: `onError: 'continueErrorOutput'` on the source node, then `this.A.out(1).to(this.ErrorLogger.in(0))`.

### File organization
- One class per `.workflow.ts` file.
- File name (kebab-case) should roughly match the workflow `name`.
- Keep the `<workflow-map>` block at the top — it is your navigation index when reading.

### Sync hygiene
- Pull before edit (otherwise OCC will reject your push).
- Push after every meaningful change — don't leave the local file drifted from remote.
- Resolve conflicts with `n8nac resolve <id> --mode …`, not by deleting and re-pulling.

### Performance & cost
- Use `executionOrder: 'v1'`, `saveDataSuccessExecution: 'none'`, `saveDataErrorExecution: 'all'` as defaults on production workflows to avoid storing huge execution logs for every happy-path run.
- For AI agents, pin a small model (`gpt-4o-mini`, `claude-haiku-4-5`) while iterating; upgrade only when the wiring is proven.

---

## 9. Common Mistakes to Avoid

| # | Mistake | Why it breaks | Fix |
|---|---|---|---|
| 1 | Missing package prefix in `type` (`switch` vs `n8n-nodes-base.switch`) | Renders as "?" node in n8n canvas | Copy `type` exactly from `node-info` |
| 2 | Non-existent `typeVersion` (e.g. `1.6` when schema lists `[1, 1.1, 2, 2.2]`) | "Could not find workflow" | Pick from the exact `versions` array |
| 3 | Invalid `operation` value for a given `resource` | "Could not find property option" | Cross-check `resource` → valid `operation[]` in schema |
| 4 | Guessing parameter names (`spreadsheet_id` vs `spreadsheetId`) | Silent empty params | Always read `node-info` |
| 5 | `.out().to()` for an AI sub-node | Invisible/broken connection | Use `.uses({ ai_*: … })` |
| 6 | Forgetting `[ ]` around `ai_tool` / `ai_document` | Runtime type error | `ai_tool: [this.Tool.output]` |
| 7 | Swapping `value1` / `value2` in If/Switch rules | Rules never match | `value1` = expression, `value2` = literal |
| 8 | Using `formFieldsUi.fieldItems` on a Wait/Form node | "Could not find property option" | Use `formFields: { values: [...] }` |
| 9 | Bare filename in `push` (`slack.workflow.ts`) | Rejected with path error | Pass full workspace-root-relative path |
| 10 | `test` without `activate` + `--prod` | Fails silently on unarmed test URL | `workflow activate <id>` then `test <id> --prod` |
| 11 | Re-editing code on a Class A error | Wastes iterations, doesn't fix anything | Provision the credential; Class A ≠ code bug |
| 12 | Writing `n8nac-config.json` by hand | Breaks instance selection + AI context | Use `n8nac instance …` commands |

---

## 10. Troubleshooting & FAQ

**Q: `n8nac push` says "file not found" but the file exists.**
A: You passed a bare filename. Pass the full workspace-root-relative path, including the `.workflow.ts` extension, e.g. `workflows/trustscan_cloud_user_.../personal/my-flow.workflow.ts`.

**Q: Push succeeds but the workflow in n8n shows a "?" on a node.**
A: Wrong `type` (missing package prefix) or a `typeVersion` the server doesn't know. Run `n8nac verify <id>` — it will tell you which node. Fix and re-push.

**Q: `n8nac test --prod` returns "webhook is not registered" even though I activated the workflow.**
A: Two possibilities. (1) The workflow has multiple webhook/trigger nodes and one of them failed to register — check `n8nac execution list`. (2) The prod webhook takes a moment to register after `activate`; wait a second and retry the request (do **not** re-edit the workflow).

**Q: `n8nac test` (no `--prod`) times out forever.**
A: The test URL path requires a manual arm in the n8n editor ("Listen for test event" or "Execute workflow"). Either use `--prod` (after `activate`) or open the editor and arm it. There is no public API to arm test webhooks programmatically.

**Q: I ran `validate` and it passed, but the workflow fails at runtime.**
A: `validate` is static schema checking. Runtime failures split into Class A (creds), runtime-state, and Class B (wiring). Run `n8nac test`, read the class, respond appropriately (§3.5).

**Q: Two agents pushed the same workflow and I got an OCC conflict.**
A: That's the safety net working. Choose: `n8nac resolve <id> --mode keep-current` (force local) or `--mode keep-incoming` (take remote and discard local). If you keep current, you're overwriting someone else's edits — prefer a pull, inspect the diff, and re-apply.

**Q: How do I add a new credential without opening the n8n UI?**
A:
```bash
n8nac credential schema <type>                  # See required fields
# Build cred.json with the values from the user
n8nac credential create --type <type> --name "<name>" --file cred.json --json
```
Then wire it into the node's `credentials: { <authType>: { id, name } }` block.

**Q: The `<workflow-map>` block shows an AI sub-node as missing from routing. Is that a bug?**
A: No. AI sub-nodes (`[ai_*]`) never appear in the `→` routing map — they only appear under `AI CONNECTIONS`. Nodes connected via `.uses()` are intentionally outside the data-flow map.

**Q: Can I convert a JSON workflow I exported from the n8n UI?**
A: Yes:
```bash
n8nac convert <file.json> --format typescript
```
Review the output, move it into the active `workflowDir`, then `push --verify`.

**Q: What n8n version does this workspace target?**
A: `2.14.2` (per `AGENTS.md`). The ontology in `packages/skills` is rebuilt against that version. If the live instance is older, some `typeVersion` values will be rejected — `verify` will catch them.

---

## 11. Resources

- `AGENTS.md` — authoritative agent playbook (workspace root). **Read this first.**
- `plugins/claude/n8n-as-code/skills/n8n-architect/SKILL.md` — the Claude skill definition.
- `README.md` — workspace overview and quick-start.
- `docs/` — local Docusaurus site; mirror of [n8nascode.dev](https://n8nascode.dev).
- [n8n docs](https://docs.n8n.io) — upstream product docs.
- [n8n community templates](https://n8n.io/workflows/) — source of the 7,702 indexed templates.
- [`n8n-as-code` GitHub](https://github.com/EtienneLescot/n8n-as-code) — toolkit source.

---

**Mantra for every session.**

> 1. Check `n8nac-config.json`. 2. `n8nac skills search` then `node-info`. 3. Pull before edit. 4. Validate locally. 5. Push with `--verify`. 6. Activate, then `test --prod`. 7. Classify the failure — don't blindly edit. 8. Commit.
