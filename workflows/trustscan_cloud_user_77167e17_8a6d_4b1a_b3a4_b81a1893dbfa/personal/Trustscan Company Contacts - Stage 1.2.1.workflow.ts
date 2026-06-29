import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts - Stage 1.2.1
// Nodes   : 19  |  Connections: 22
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Phase1Trigger                      manualTrigger
// ReadUrlChecks                      googleSheets               [creds]
// ReadInputSnapshot                  googleSheets               [creds]
// MergeReads                         merge
// JoinAndFilter                      code
// LoopOverEntities                   splitInBatches
// WaitBeforeSerpapi                  wait
// SearchSerpapi                      httpRequest                [onError→regular] [creds] [alwaysOutput]
// ScoreAndPickCandidate              code
// GateHasCandidate                   if
// BuildSubpageUrls                   code
// FetchPage                          httpRequest                [onError→regular] [retry]
// ValidateNifOnPages                 code
// GateNifFound                       if
// PrepFailureNoCandidate             code
// WaitBeforeSuccessWrite             wait
// WaitBeforeFailureWrite             wait
// UpsertUrlChecksSuccess             googleSheets               [creds] [retry]
// UpsertUrlChecksFailure             googleSheets               [creds] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Phase1Trigger
//    → ReadUrlChecks
//      → MergeReads
//        → JoinAndFilter
//          → LoopOverEntities
//           .out(1) → WaitBeforeSerpapi
//              → SearchSerpapi
//                → ScoreAndPickCandidate
//                  → GateHasCandidate
//                    → BuildSubpageUrls
//                      → FetchPage
//                        → ValidateNifOnPages
//                          → GateNifFound
//                            → WaitBeforeSuccessWrite
//                              → UpsertUrlChecksSuccess
//                                → LoopOverEntities (↩ loop)
//                           .out(1) → WaitBeforeFailureWrite
//                              → UpsertUrlChecksFailure
//                                → LoopOverEntities (↩ loop)
//                   .out(1) → PrepFailureNoCandidate
//                      → WaitBeforeFailureWrite (↩ loop)
//    → ReadInputSnapshot
//      → MergeReads.in(1) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '1ElFDAJzMjMy9kaK',
    name: 'Trustscan Company Contacts - Stage 1.2.1',
    active: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class TrustscanCompanyContactsStage121Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'disc-trigger',
        name: 'Phase 1 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1200, 0],
    })
    Phase1Trigger = {};

    @node({
        id: 'disc-read-url-checks',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1008, -96],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
    })
    ReadUrlChecks = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'URL_CHECKS',
            mode: 'name',
        },
        options: {},
    };

    @node({
        id: 'disc-read-input-snapshot',
        name: 'Read Input Snapshot',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1008, 128],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
    })
    ReadInputSnapshot = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'INPUT_SNAPSHOT',
            mode: 'name',
        },
        options: {},
    };

    @node({
        id: 'disc-merge-reads',
        name: 'Merge Reads',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-848, 0],
    })
    MergeReads = {
        mode: 'chooseBranch',
        useDataOfInput: '1',
    };

    @node({
        id: 'disc-join-filter',
        name: 'Join And Filter',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-720, 0],
    })
    JoinAndFilter = {
        jsCode: `// Inner-join URL_CHECKS rows where Response_class = NO_URL with INPUT_SNAPSHOT
// to attach NOME (company name) and NIPC (fiscal number). Filters:
//   - skip rows where Response_class = NO_URL_FOUND (loop guard)
//   - skip entities with empty/non-9-digit NIPC (PT-only)
const checks   = $('Read URL Checks').all();
const snapshot = $('Read Input Snapshot').all();

// Build NIPC/NOME lookup keyed by Entity_key (Entity_key = NIPC for PT entities;
// fall back to scanning multiple possible header names).
const byEntity = new Map();
for (const it of snapshot) {
  const j = it.json || {};
  const ek = String(j['Entity_key'] || j['EntityKey'] || j['NIPC'] || j['Entity_Key'] || '').trim();
  if (!ek) continue;
  byEntity.set(ek, {
    Company_name: String(j['NOME'] || j['Nome'] || j['Company_name'] || j['CompanyName'] || '').trim(),
    NIPC:         String(j['NIPC'] || j['Nipc'] || j['nipc'] || j['Entity_key'] || '').trim(),
  });
}

// Generate Run_ID for this discovery run (epoch seconds, 4 digits)
const runId = String(Math.floor(Date.now() / 1000)).slice(-4);

const out = [];
const seen = new Set();
for (const it of checks) {
  const j = it.json || {};
  const status = String(j['Response_class'] || '').trim().toUpperCase();
  const ek = String(j['Entity_key'] || j['EntityKey'] || '').trim();
  if (!ek || seen.has(ek)) continue;            // dedup if URL_CHECKS has multiple rows per entity
  if (status !== 'NO_URL') continue;            // only target NO_URL rows; skip NO_URL_FOUND + 2xx/3xx/4xx/5xx
  const meta = byEntity.get(ek);
  if (!meta || !meta.Company_name) continue;     // need a name to build a search query
  const nipcDigits = String(meta.NIPC).replace(/\\D/g, '');
  if (nipcDigits.length !== 9) continue;         // PT-only: 9 digits required
  const nipcDotted = nipcDigits.replace(/^(\\d{3})(\\d{3})(\\d{3})$/, '$1.$2.$3');
  seen.add(ek);
  out.push({
    json: {
      RUN_ID:       runId,
      EntityKey:    ek,
      Company_name: meta.Company_name,
      NIPC_digits:  nipcDigits,
      NIPC_dotted:  nipcDotted,
    },
  });
}
return out;
`,
    };

    @node({
        id: 'disc-loop',
        name: 'Loop Over Entities',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-480, 0],
    })
    LoopOverEntities = {
        options: {},
    };

    @node({
        id: 'disc-wait-serpapi',
        webhookId: 'disc-wait-serpapi-wh',
        name: 'Wait Before SerpAPI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-240, 0],
    })
    WaitBeforeSerpapi = {
        amount: 2,
    };

    @node({
        id: 'disc-search-serpapi',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [0, 0],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    SearchSerpapi = {
        url: '=https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: '=q',
                    value: '={{ "\\"" + $json.NIPC_digits + "\\" OR \\"" + $json.NIPC_dotted + "\\" " + $json.Company_name }}',
                },
                {
                    name: 'engine',
                    value: 'google',
                },
                {
                    name: 'google_domain',
                    value: 'google.pt',
                },
                {
                    name: 'hl',
                    value: 'pt',
                },
                {
                    name: 'gl',
                    value: 'pt',
                },
                {
                    name: 'num',
                    value: '10',
                },
            ],
        },
        options: {
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
        },
    };

    @node({
        id: 'disc-pick-candidate',
        name: 'Score And Pick Candidate',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [240, 0],
    })
    ScoreAndPickCandidate = {
        jsCode: `// Picks the best own-domain candidate URL. Order of preference:
//   1. Knowledge Graph website (highest trust — Google has flagged this as the
//      company's official site)
//   2. Organic result hostname overlap with company-name tokens (drops aggregators)
const trig = $('Loop Over Entities').item.json;
const body = $input.first()?.json?.body || $input.first()?.json || {};
const organic = Array.isArray(body.organic_results) ? body.organic_results : [];
const kg = body.knowledge_graph || {};

const STOP = new Set(['lda','ltda','sa','sl','unipessoal','unip','sgps','crl','epe','soc','sociedade','servicos','servico','de','da','do','das','dos','e','a','o','as','os','para','com','sem','em','&','-',',','/']);
function stripAccents(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[áàâãä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i')
    .replace(/[óòôõö]/g,'o').replace(/[úùûü]/g,'u').replace(/ç/g,'c').replace(/ñ/g,'n');
}
function tokenise(name) {
  return stripAccents(name)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\\s+/)
    .filter(t => t.length >= 4 && !STOP.has(t));
}
function hostnameTokens(host) {
  const stripped = stripAccents(host).replace(/^www\\./, '').replace(/\\.(pt|com|net|org|eu|info|biz|es|fr|de|co\\.uk|io)$/i, '');
  return stripped.split(/[^a-z0-9]+/).filter(t => t.length >= 3);
}
function hostFromUrl(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  try { return new URL(s).hostname; } catch (_) {
    return s.replace(/^https?:\\/\\//i, '').split('/')[0];
  }
}

const nameTokens = tokenise(trig.Company_name);
const nipcDigits = String(trig.NIPC_digits || '');

// --- 1. Knowledge Graph shortcut -------------------------------------------
const kgHost = hostFromUrl(kg.website);
if (kgHost) {
  return [{
    json: {
      RUN_ID:       trig.RUN_ID,
      EntityKey:    trig.EntityKey,
      Company_name: trig.Company_name,
      NIPC_digits:  trig.NIPC_digits,
      NIPC_dotted:  trig.NIPC_dotted,
      Candidate_URL:    'https://' + kgHost,
      Candidate_host:   kgHost,
      Candidate_score:  100,
      Candidate_source: 'kg',
      Nif_in_snippet:   false,
      Found_status:     'CANDIDATE_FOUND',
    },
  }];
}

// --- 2. Organic-result scoring ---------------------------------------------
const scored = [];
for (const r of organic) {
  const link = String(r.link || '');
  if (!link.startsWith('http')) continue;
  const host = hostFromUrl(link);
  if (!host) continue;
  const hostToks = hostnameTokens(host);
  if (hostToks.length === 0) continue;
  const overlap = nameTokens.filter(t => hostToks.some(h => h.includes(t) || t.includes(h))).length;
  if (overlap === 0) continue;
  const snippet = String((r.snippet || '') + ' ' + (r.title || ''));
  const snippetDigits = snippet.replace(/\\D/g, '');
  const nifInSnippet  = nipcDigits && snippetDigits.includes(nipcDigits);
  const score = overlap * 10 + (nifInSnippet ? 5 : 0);
  scored.push({ host, link, score, overlap, nifInSnippet });
}
scored.sort((a, b) => b.score - a.score);
const best = scored[0] || null;

return [{
  json: {
    RUN_ID:       trig.RUN_ID,
    EntityKey:    trig.EntityKey,
    Company_name: trig.Company_name,
    NIPC_digits:  trig.NIPC_digits,
    NIPC_dotted:  trig.NIPC_dotted,
    Candidate_URL:    best ? ('https://' + best.host) : '',
    Candidate_host:   best ? best.host : '',
    Candidate_score:  best ? best.score : 0,
    Candidate_source: best ? 'organic' : 'none',
    Nif_in_snippet:   best ? best.nifInSnippet : false,
    Found_status:     best ? 'CANDIDATE_FOUND' : 'NO_CANDIDATE',
  },
}];
`,
    };

    @node({
        id: 'disc-gate-candidate',
        name: 'Gate Has Candidate',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [480, 0],
    })
    GateHasCandidate = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 1,
            },
            conditions: [
                {
                    id: 'has-candidate',
                    leftValue: '={{ $json.Candidate_URL }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'notEquals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'disc-build-subpages',
        name: 'Build Subpage URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [720, -144],
    })
    BuildSubpageUrls = {
        jsCode: `// Fan-out: emit homepage + 6 contact-style subpage URLs for the candidate host.
const j = $input.first().json;
const base = String(j.Candidate_URL || '').replace(/\\/+$/, '');
if (!base) return [];
const paths = ['', '/contactos', '/contacto', '/sobre', '/sobre-nos', '/quem-somos', '/legal', '/termos', '/aviso-legal'];
return paths.map(p => ({
  json: {
    RUN_ID:        j.RUN_ID,
    EntityKey:     j.EntityKey,
    Company_name:  j.Company_name,
    NIPC_digits:   j.NIPC_digits,
    NIPC_dotted:   j.NIPC_dotted,
    Candidate_URL: base,
    Candidate_host: j.Candidate_host,
    Page_URL:      base + p,
  },
}));
`,
    };

    @node({
        id: 'disc-fetch-page',
        name: 'Fetch Page',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [960, -144],
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    FetchPage = {
        url: '={{ $json.Page_URL }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                {
                    name: 'Accept',
                    value: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                {
                    name: 'Accept-Language',
                    value: 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {
                    maxRedirects: 5,
                },
            },
            response: {
                response: {
                    responseFormat: 'text',
                },
            },
            timeout: 15000,
        },
    };

    @node({
        id: 'disc-validate-nif',
        name: 'Validate NIF On Pages',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1200, -144],
    })
    ValidateNifOnPages = {
        jsCode: `// Strip HTML, decode entities, search for digits-only NIF across all fetched pages.
const fetched = $input.all();
const meta    = $('Build Subpage URLs').all();
const trig    = $('Score And Pick Candidate').item.json;

const decodeEntities = (s) => String(s || '')
  .replace(/&#(\\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const stripNoise = (h) => decodeEntities(String(h || ''))
  .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<noscript[^>]*>[\\s\\S]*?<\\/noscript>/gi, ' ')
  .replace(/<!--[\\s\\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\\s{2,}/g, ' ');

const target = String(trig.NIPC_digits || '');
let nifPage = '';
let nifFound = false;

for (let i = 0; i < fetched.length; i++) {
  const f = fetched[i]?.json || {};
  const sc = Number(f.statusCode || 0);
  if (f.error || (sc && sc >= 400)) continue;
  const body = String(f.data || f.body || '');
  if (!body) continue;
  const cleanDigits = stripNoise(body).replace(/\\D/g, '');
  if (target && cleanDigits.includes(target)) {
    nifFound = true;
    nifPage  = String(meta[i]?.json?.Page_URL || '');
    break;
  }
}

return [{
  json: {
    RUN_ID:         trig.RUN_ID,
    EntityKey:      trig.EntityKey,
    Company_name:   trig.Company_name,
    NIPC_digits:    trig.NIPC_digits,
    NIPC_dotted:    trig.NIPC_dotted,
    Candidate_URL:  trig.Candidate_URL,
    Candidate_host: trig.Candidate_host,
    Nif_in_snippet: trig.Nif_in_snippet,
    Nif_on_page:    nifFound,
    Nif_page_url:   nifPage,
    Discovery_outcome: nifFound ? 'URL_DISCOVERED' : 'NO_URL_FOUND',
  },
}];
`,
    };

    @node({
        id: 'disc-gate-found',
        name: 'Gate NIF Found',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1440, -144],
    })
    GateNifFound = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 1,
            },
            conditions: [
                {
                    id: 'nif-on-page',
                    leftValue: '={{ $json.Nif_on_page }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'disc-prep-failure-no-candidate',
        name: 'Prep Failure (No Candidate)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [720, 160],
    })
    PrepFailureNoCandidate = {
        jsCode: `// Pass-through with explicit failure outcome for the NO_CANDIDATE branch.
const j = $input.first().json;
return [{
  json: {
    RUN_ID:       j.RUN_ID,
    EntityKey:    j.EntityKey,
    Candidate_URL: '',
    Discovery_outcome: 'NO_URL_FOUND',
  },
}];
`,
    };

    @node({
        id: 'disc-wait-success',
        webhookId: 'disc-wait-success-wh',
        name: 'Wait Before Success Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1680, -208],
    })
    WaitBeforeSuccessWrite = {
        amount: 2,
    };

    @node({
        id: 'disc-wait-failure',
        webhookId: 'disc-wait-failure-wh',
        name: 'Wait Before Failure Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1680, 208],
    })
    WaitBeforeFailureWrite = {
        amount: 2,
    };

    @node({
        id: 'disc-write-success',
        name: 'Upsert URL_CHECKS (Success)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1920, -208],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    UpsertUrlChecksSuccess = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'URL_CHECKS',
            mode: 'name',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{ $json.RUN_ID + "_" + $json.EntityKey }}',
                Run_ID: '={{ $json.RUN_ID }}',
                Entity_key: '={{ $json.EntityKey }}',
                Request_url: '={{ $json.Candidate_URL }}',
                Final_url: '={{ $json.Candidate_URL }}',
                Response_class: 'URL_DISCOVERED',
            },
            matchingColumns: ['Entity_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'disc-write-failure',
        name: 'Upsert URL_CHECKS (Failure)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1920, 208],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    UpsertUrlChecksFailure = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'URL_CHECKS',
            mode: 'name',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{ $json.RUN_ID + "_" + $json.EntityKey }}',
                Run_ID: '={{ $json.RUN_ID }}',
                Entity_key: '={{ $json.EntityKey }}',
                Response_class: 'NO_URL_FOUND',
            },
            matchingColumns: ['Entity_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Phase1Trigger.out(0).to(this.ReadUrlChecks.in(0));
        this.Phase1Trigger.out(0).to(this.ReadInputSnapshot.in(0));
        this.ReadUrlChecks.out(0).to(this.MergeReads.in(0));
        this.ReadInputSnapshot.out(0).to(this.MergeReads.in(1));
        this.MergeReads.out(0).to(this.JoinAndFilter.in(0));
        this.JoinAndFilter.out(0).to(this.LoopOverEntities.in(0));
        this.LoopOverEntities.out(1).to(this.WaitBeforeSerpapi.in(0));
        this.WaitBeforeSerpapi.out(0).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.ScoreAndPickCandidate.in(0));
        this.ScoreAndPickCandidate.out(0).to(this.GateHasCandidate.in(0));
        this.GateHasCandidate.out(0).to(this.BuildSubpageUrls.in(0));
        this.GateHasCandidate.out(1).to(this.PrepFailureNoCandidate.in(0));
        this.BuildSubpageUrls.out(0).to(this.FetchPage.in(0));
        this.FetchPage.out(0).to(this.ValidateNifOnPages.in(0));
        this.ValidateNifOnPages.out(0).to(this.GateNifFound.in(0));
        this.GateNifFound.out(0).to(this.WaitBeforeSuccessWrite.in(0));
        this.GateNifFound.out(1).to(this.WaitBeforeFailureWrite.in(0));
        this.PrepFailureNoCandidate.out(0).to(this.WaitBeforeFailureWrite.in(0));
        this.WaitBeforeSuccessWrite.out(0).to(this.UpsertUrlChecksSuccess.in(0));
        this.WaitBeforeFailureWrite.out(0).to(this.UpsertUrlChecksFailure.in(0));
        this.UpsertUrlChecksSuccess.out(0).to(this.LoopOverEntities.in(0));
        this.UpsertUrlChecksFailure.out(0).to(this.LoopOverEntities.in(0));
    }
}
