import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : URL_DISCOVER_OPENAI
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
// WaitBeforeOpenai                   wait
// SearchOpenai                       httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// ParseOpenaiResult                  code
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
//           .out(1) → WaitBeforeOpenai
//              → SearchOpenai
//                → ParseOpenaiResult
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
    id: 'dMkOqZFsB2ylSJWa',
    name: 'URL_DISCOVER_OPENAI',
    active: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class UrlDiscoverOpenaiWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '2cde44f5-daed-4fd5-908a-1e1383ed2781',
        name: 'Phase 1 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1200, 0],
    })
    Phase1Trigger = {};

    @node({
        id: 'd49647d4-40b8-4204-8fa9-09cd866b1493',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-960, -100],
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
        id: '119e17a6-dd81-4561-bed5-d893aa63380e',
        name: 'Read Input Snapshot',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-960, 100],
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
        id: 'a7707786-c23f-4808-9757-ee77ed143c14',
        name: 'Merge Reads',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-840, 0],
    })
    MergeReads = {
        mode: 'chooseBranch',
        chooseBranchMode: 'waitForAll',
        output: 'specifiedInput',
        useDataOfInput: '1',
    };

    @node({
        id: 'd6fefeea-def5-435b-9445-9aa40fa57d1f',
        name: 'Join And Filter',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-720, 0],
    })
    JoinAndFilter = {
        jsCode: `// Inner-join URL_CHECKS rows where Response_class = NO_URL with INPUT_SNAPSHOT
// to attach NOME (company name) and NIPC (fiscal number). Filters:
//   - skip rows where Response_class = NO_URL_FINDED (loop guard)
//   - skip entities with empty/non-9-digit NIPC (PT-only)
const checks   = $('Read URL Checks').all();
const snapshot = $('Read Input Snapshot').all();

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

const runId = String(Math.floor(Date.now() / 1000)).slice(-4);

const out = [];
const seen = new Set();
for (const it of checks) {
  const j = it.json || {};
  const status = String(j['Response_class'] || '').trim().toUpperCase();
  const ek = String(j['Entity_key'] || j['EntityKey'] || '').trim();
  if (!ek || seen.has(ek)) continue;
  if (status !== 'NO_URL') continue;
  const meta = byEntity.get(ek);
  if (!meta || !meta.Company_name) continue;
  const nipcDigits = String(meta.NIPC).replace(/\\D/g, '');
  if (nipcDigits.length !== 9) continue;
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
        id: '3f235f59-3488-4aee-8834-0bd12d8adcc7',
        name: 'Loop Over Entities',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-480, 0],
    })
    LoopOverEntities = {
        options: {},
    };

    @node({
        id: '26ce649d-3474-48d2-9388-217ab6787919',
        webhookId: 'disc-openai-wait-wh',
        name: 'Wait Before OpenAI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-240, 0],
    })
    WaitBeforeOpenai = {
        amount: 1,
    };

    @node({
        id: 'ed2e2c0d-145f-446f-93fb-8c0172e3802d',
        name: 'Search OpenAI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [0, 0],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 2000,
    })
    SearchOpenai = {
        method: 'POST',
        url: 'https://api.openai.com/v1/responses',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: `={{ JSON.stringify({
  model: "gpt-4.1-mini",
  tools: [{ type: "web_search_preview" }],
  tool_choice: "required",
  input: [
    {
      role: "system",
      content: "Tu és um assistente que descobre o site institucional oficial de empresas portuguesas. REGRAS OBRIGATÓRIAS:\\n1. TENS DE usar a ferramenta web_search_preview para pesquisar (nunca respondas só do teu conhecimento prévio).\\n2. TENS DE abrir/visitar a página candidata para confirmar que carrega e que a empresa é mesmo essa.\\n3. Se NÃO conseguires confirmar que o URL carrega via pesquisa web, devolve candidate_url=\\"\\" e confidence=\\"none\\". Inventar/adivinhar um domínio é o pior resultado possível.\\n4. NUNCA devolvas diretórios/agregadores: racius, einforma, dnb, dun-and-bradstreet, paginasamarelas, opencorporates, bloomberg, linkedin, facebook, instagram, twitter, x.com, google, wikipedia, yelp.\\n5. Devolve apenas o URL https da raiz (sem caminho/query), e o hostname puro."
    },
    {
      role: "user",
      content: "Empresa: " + $json.Company_name + "\\nNIPC: " + $json.NIPC_digits + " (" + $json.NIPC_dotted + ")\\n\\nUsa web_search_preview para localizar o site institucional oficial desta empresa portuguesa e confirma que a página carrega antes de devolver. Se não tiveres certeza razoável, devolve candidate_url vazio."
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "company_official_url",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidate_url:  { type: "string", description: "Full https URL of the company official site, or empty string." },
          candidate_host: { type: "string", description: "Hostname only (no scheme, no path), or empty string." },
          confidence:     { type: "string", enum: ["high","medium","low","none"] },
          reasoning:      { type: "string", description: "One short sentence explaining the choice." }
        },
        required: ["candidate_url","candidate_host","confidence","reasoning"]
      }
    }
  }
}) }}`,
        options: {
            response: {
                response: {
                    fullResponse: false,
                },
            },
            timeout: 60000,
        },
    };

    @node({
        id: 'c32f2422-b924-4bfe-8468-258044a716b4',
        name: 'Parse OpenAI Result',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [240, 0],
    })
    ParseOpenaiResult = {
        jsCode: `// Parse the Responses API output into the same shape used by the SerpAPI variant.
const trig = $('Loop Over Entities').item.json;
const body = $input.first()?.json || {};

function pickText(b) {
  if (typeof b.output_text === 'string' && b.output_text) return b.output_text;
  const out = Array.isArray(b.output) ? b.output : [];
  for (const m of out) {
    const content = Array.isArray(m?.content) ? m.content : [];
    for (const c of content) {
      if (typeof c?.text === 'string' && c.text) return c.text;
      if (typeof c?.text?.value === 'string' && c.text.value) return c.text.value;
    }
  }
  return '';
}

let parsed = {};
const txt = pickText(body);
if (txt) {
  try { parsed = JSON.parse(txt); }
  catch (_) {
    const m = txt.match(/\\{[\\s\\S]*\\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch (_) { /* leave empty */ } }
  }
}

let candUrl  = String(parsed.candidate_url  || '').trim();
let candHost = String(parsed.candidate_host || '').trim();
const conf   = String(parsed.confidence || 'none').toLowerCase();
const reason = String(parsed.reasoning  || '').slice(0, 400);

// Normalise: ensure scheme on URL, derive host if missing, strip path.
function hostOf(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  try { return new URL(s).hostname; } catch (_) {
    return s.replace(/^https?:\\/\\//i, '').split('/')[0];
  }
}
if (candUrl && !/^https?:\\/\\//i.test(candUrl)) candUrl = 'https://' + candUrl;
if (!candHost && candUrl) candHost = hostOf(candUrl);
if (candHost && candUrl) {
  // strip any path/query — we only want the root.
  candUrl = 'https://' + candHost.replace(/^https?:\\/\\//i, '').replace(/\\/.*$/, '');
}

// Reject obvious aggregators even if the model slipped one in.
const BLOCKLIST = /(?:^|\\.)(racius|einforma|iberinform|dnb|dun(?:-|and)?bradstreet|paginasamarelas|paginas-amarelas|opencorporates|bloomberg|linkedin|facebook|instagram|twitter|x\\.com|google|wikipedia|yelp|companyradar|bizapedia|zoominfo|statista|crunchbase|glassdoor|kompass|europages|infobel|guiafiscal|pj\\.gov)\\./i;
if (candHost && BLOCKLIST.test(candHost)) {
  candUrl = '';
  candHost = '';
}

const hasCandidate = Boolean(candUrl && candHost && conf !== 'none');

return [{
  json: {
    RUN_ID:           trig.RUN_ID,
    EntityKey:        trig.EntityKey,
    Company_name:     trig.Company_name,
    NIPC_digits:      trig.NIPC_digits,
    NIPC_dotted:      trig.NIPC_dotted,
    Candidate_URL:    hasCandidate ? candUrl  : '',
    Candidate_host:   hasCandidate ? candHost : '',
    Candidate_score:  hasCandidate ? (conf === 'high' ? 100 : conf === 'medium' ? 60 : 30) : 0,
    Candidate_source: hasCandidate ? 'openai_websearch' : 'none',
    Openai_confidence: conf,
    Openai_reasoning:  reason,
    Nif_in_snippet:   false,
    Found_status:     hasCandidate ? 'CANDIDATE_FOUND' : 'NO_CANDIDATE',
  },
}];
`,
    };

    @node({
        id: 'f70ac700-1ae6-4ebe-9aef-0c310eb24d9b',
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
        id: 'a7ba2405-44d3-405e-ab4f-95eea4020bcc',
        name: 'Build Subpage URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [720, -150],
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
        id: '1565fa84-c5a2-460a-95a0-ed27552adcf2',
        name: 'Fetch Page',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [960, -150],
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
        id: 'cd5e428e-59c4-4b6d-bb19-909d3e47be4c',
        name: 'Validate NIF On Pages',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1200, -150],
    })
    ValidateNifOnPages = {
        jsCode: `// Strip HTML, decode entities, search for digits-only NIF across all fetched pages.
// Outcome ladder:
//   URL_DISCOVERED — NIF appears on at least one fetched page (high precision)
//   URL_LIKELY     — homepage reachable + OpenAI confidence high/medium, NIF not found
//   NO_URL_FINDED  — neither: hallucinated domain, no reachable page, or OpenAI low/none
const fetched = $input.all();
const meta    = $('Build Subpage URLs').all();
const trig    = $('Parse OpenAI Result').item.json;

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
let homepageReachable = false;

for (let i = 0; i < fetched.length; i++) {
  const f = fetched[i]?.json || {};
  const sc = Number(f.statusCode || 0);
  const hasError = Boolean(f.error) || (sc && sc >= 400);
  const body = String(f.data || f.body || '');
  if (i === 0 && !hasError && body.length > 1000) homepageReachable = true;
  if (hasError || !body) continue;
  const cleanDigits = stripNoise(body).replace(/\\D/g, '');
  if (target && cleanDigits.includes(target)) {
    nifFound = true;
    nifPage  = String(meta[i]?.json?.Page_URL || '');
    break;
  }
}

const conf = String(trig.Openai_confidence || 'none').toLowerCase();
let outcome;
if (nifFound) outcome = 'URL_DISCOVERED';
else if (homepageReachable && (conf === 'high' || conf === 'medium')) outcome = 'URL_LIKELY';
else outcome = 'NO_URL_FINDED';

return [{
  json: {
    RUN_ID:         trig.RUN_ID,
    EntityKey:      trig.EntityKey,
    Company_name:   trig.Company_name,
    NIPC_digits:    trig.NIPC_digits,
    NIPC_dotted:    trig.NIPC_dotted,
    Candidate_URL:  trig.Candidate_URL,
    Candidate_host: trig.Candidate_host,
    Openai_confidence: trig.Openai_confidence,
    Openai_reasoning:  trig.Openai_reasoning,
    Nif_in_snippet: trig.Nif_in_snippet,
    Nif_on_page:    nifFound,
    Nif_page_url:   nifPage,
    Homepage_reachable: homepageReachable,
    Has_url:        outcome !== 'NO_URL_FINDED',
    Discovery_outcome: outcome,
  },
}];
`,
    };

    @node({
        id: 'c47f60e1-5752-45f0-8254-9f17157be24e',
        name: 'Gate NIF Found',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1440, -150],
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
                    id: 'has-url',
                    leftValue: '={{ $json.Has_url }}',
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
        id: '3dc03451-d2dd-43a4-a6a7-e384d24035d2',
        name: 'Prep Failure (No Candidate)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [720, 150],
    })
    PrepFailureNoCandidate = {
        jsCode: `const j = $input.first().json;
return [{
  json: {
    RUN_ID:       j.RUN_ID,
    EntityKey:    j.EntityKey,
    Candidate_URL: '',
    Discovery_outcome: 'NO_URL_FINDED',
  },
}];
`,
    };

    @node({
        id: 'b4a3ec4f-cb68-4e5b-b8f2-326e9bd060b2',
        webhookId: 'disc-openai-success-wh',
        name: 'Wait Before Success Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1680, -200],
    })
    WaitBeforeSuccessWrite = {
        amount: 2,
    };

    @node({
        id: 'a6261974-26e6-4754-a2ce-3ae1409b4e83',
        webhookId: 'disc-openai-failure-wh',
        name: 'Wait Before Failure Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1680, 200],
    })
    WaitBeforeFailureWrite = {
        amount: 2,
    };

    @node({
        id: '3f20f891-c2a1-420e-8866-94db3f94bbc7',
        name: 'Upsert URL_CHECKS (Success)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1920, -200],
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
                Response_class: '={{ $json.Discovery_outcome }}',
            },
            matchingColumns: ['Entity_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'd82c470d-92a5-4b8a-9760-b27ff5f278ba',
        name: 'Upsert URL_CHECKS (Failure)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1920, 200],
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
                Response_class: 'NO_URL_FINDED',
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
        this.LoopOverEntities.out(1).to(this.WaitBeforeOpenai.in(0));
        this.WaitBeforeOpenai.out(0).to(this.SearchOpenai.in(0));
        this.SearchOpenai.out(0).to(this.ParseOpenaiResult.in(0));
        this.ParseOpenaiResult.out(0).to(this.GateHasCandidate.in(0));
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
