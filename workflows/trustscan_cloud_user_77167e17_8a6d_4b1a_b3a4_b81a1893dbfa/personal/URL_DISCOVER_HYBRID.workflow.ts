import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : URL_DISCOVER_HYBRID
// Nodes   : 25  |  Connections: 28
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Phase1Trigger                      manualTrigger
// ReadUrlChecks                      googleSheets               [creds]
// ReadInputSnapshot                  googleSheets               [creds]
// MergeReads                         merge
// JoinFilterCleanName                code
// LoopOverEntities                   splitInBatches
// WaitBeforeSerpapi                  wait
// SearchSerpapi                      httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// WaitBeforeOpenaiSearch             wait
// SearchOpenaiWeb                    httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// AggregateCandidates                code
// JudgeOpenai                        httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// ParseJudgeResult                   code
// GateHasCandidate                   if
// BuildSubpageUrls                   code
// FetchPage                          httpRequest                [onError→regular] [retry]
// ValidateNifOnPages                 code
// GateUrlAcceptable                  if
// PrepFailureNoCandidate             code
// WaitBeforeSuccessWrite             wait
// WaitBeforeFailureWrite             wait
// UpsertUrlChecksSuccess             googleSheets               [creds] [retry]
// UpsertUrlChecksFailure             googleSheets               [creds] [retry]
// MarkDiscoveringPhase               googleSheets               [creds] [retry]
// MarkDiscoveryDone                  googleSheets               [creds] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Phase1Trigger
//    → ReadUrlChecks
//      → MergeReads
//        → JoinFilterCleanName
//          → LoopOverEntities
//           .out(1) → MarkDiscoveringPhase
//              → WaitBeforeSerpapi
//                → SearchSerpapi
//                  → WaitBeforeOpenaiSearch
//                    → SearchOpenaiWeb
//                      → AggregateCandidates
//                        → JudgeOpenai
//                          → ParseJudgeResult
//                            → GateHasCandidate
//                              → BuildSubpageUrls
//                                → FetchPage
//                                  → ValidateNifOnPages
//                                    → GateUrlAcceptable
//                                      → WaitBeforeSuccessWrite
//                                        → UpsertUrlChecksSuccess
//                                          → MarkDiscoveryDone
//                                            → LoopOverEntities (↩ loop)
//                                     .out(1) → WaitBeforeFailureWrite
//                                        → UpsertUrlChecksFailure
//                                          → MarkDiscoveryDone (↩ loop)
//                             .out(1) → PrepFailureNoCandidate
//                                → WaitBeforeFailureWrite (↩ loop)
//    → ReadInputSnapshot
//      → MergeReads.in(1) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 's2kskrjBoXoUh0fR',
    name: 'URL_DISCOVER_HYBRID',
    active: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class UrlDiscoverHybridWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '5391910d-6a3d-420f-baf3-9af18abfcdb8',
        name: 'Phase 1 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1400, 0],
    })
    Phase1Trigger = {};

    @node({
        id: '0cd70b37-2d26-4ff5-aca9-da33514baa66',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1160, -100],
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
        id: '0db82d60-dd2f-458b-bf23-d93ae1b96272',
        name: 'Read Input Snapshot',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1160, 100],
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
        id: '74aecbff-eaa8-49ec-b27f-0c766d0d4bf8',
        name: 'Merge Reads',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-1000, 0],
    })
    MergeReads = {
        mode: 'chooseBranch',
        chooseBranchMode: 'waitForAll',
        output: 'specifiedInput',
        useDataOfInput: '1',
    };

    @node({
        id: '95ca38ce-3d68-46cc-83c5-8f312561894d',
        name: 'Join Filter Clean Name',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-840, 0],
    })
    JoinFilterCleanName = {
        jsCode: `// Inner-join URL_CHECKS (Response_class = NO_URL) with INPUT_SNAPSHOT, then
// derive Search_name by stripping PT corporate suffixes so the search query
// targets the brand, not the legal form (which biases toward directory hits).
//   "Espiralforte, Unipessoal, Lda." → "Espiralforte"
//   "Idyllic Pages, Unipessoal, Lda." → "Idyllic Pages"
//   "Bosch Car Multimédia Portugal, S.A." → "Bosch Car Multimédia Portugal"
const checks   = $('Read URL Checks').all();
const snapshot = $('Read Input Snapshot').all();

// Anchored alternative to \\b on the trailing edge: explicitly consume an
// optional trailing "." and require [\\s,] or end-of-string after it. Using
// \\b on the suffix tail backtracks and leaves a stray "." behind whenever
// the suffix ends in a period (S.A., Lda., Cia., etc).
const SUFFIX_RE = /(?:(?<=^)|(?<=[\\s,]))(?:lda|ltda|limitada|s\\.?\\s*a|sociedade\\s+anonima|sociedade\\s+an[oó]nima|sociedade\\s+por\\s+quotas|unipessoal|unip|sgps|crl|epe|companhia|cia)\\.?(?=[\\s,]|$)/gi;
function cleanName(n) {
  let s = String(n || '');
  s = s.replace(SUFFIX_RE, ' ');
  // collapse runs of separators (commas / dashes / dots / whitespace) and trim ends
  s = s.replace(/\\s+/g, ' ');
  s = s.replace(/(?:[,\\-\\.]\\s*){2,}/g, ', ');
  s = s.replace(/^[\\s,\\-\\.]+|[\\s,\\-\\.]+$/g, '');
  return s.trim();
}

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

// Run_ID continuity: propagate Stage 1's original Run_ID per entity so that
// CONTROL_EXEC / URL_CHECKS rows stay matchable by Exec_key across stages.
// Fall back to a fresh 4-digit ID only if a URL_CHECKS row is missing Run_ID
// (hand-seeded edge case).
const fallbackRunId = String(Math.floor(Date.now() / 1000)).slice(-4);
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
  const search = cleanName(meta.Company_name) || meta.Company_name;
  const stageOneRunId = String(j['Run_ID'] || j['RUN_ID'] || '').trim();
  out.push({
    json: {
      RUN_ID:       stageOneRunId || fallbackRunId,
      EntityKey:    ek,
      Company_name: meta.Company_name,
      Search_name:  search,
      NIPC_digits:  nipcDigits,
      NIPC_dotted:  nipcDotted,
    },
  });
}
return out;
`,
    };

    @node({
        id: 'a2be4dc1-6ae9-4b8b-82c7-4f447de816d3',
        name: 'Loop Over Entities',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-640, 0],
    })
    LoopOverEntities = {
        options: {},
    };

    @node({
        id: '75baaf33-2ef3-4b36-a73c-087211cbc6af',
        webhookId: 'hybrid-wait-serp-wh',
        name: 'Wait Before SerpAPI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-400, 0],
    })
    WaitBeforeSerpapi = {
        amount: 2,
    };

    @node({
        id: '9e56afc0-b983-4db3-a323-2d6aa3ccdc0a',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [-160, 0],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 2000,
    })
    SearchSerpapi = {
        url: 'https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'q',
                    value: '={{ $json.Search_name }}',
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
                    name: 'location',
                    value: 'Portugal',
                },
                {
                    name: 'num',
                    value: '10',
                },
            ],
        },
        options: {
            response: {
                response: {
                    fullResponse: false,
                },
            },
            timeout: 30000,
        },
    };

    @node({
        id: '06867240-7547-42e6-940d-17aa536e89aa',
        webhookId: 'hybrid-wait-oai-wh',
        name: 'Wait Before OpenAI Search',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [80, 0],
    })
    WaitBeforeOpenaiSearch = {
        amount: 1,
    };

    @node({
        id: 'f01a501a-f9c3-4e59-a4ed-7550613e9b3f',
        name: 'Search OpenAI Web',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [320, 0],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 4,
        waitBetweenTries: 5000,
    })
    SearchOpenaiWeb = {
        method: 'POST',
        url: 'https://api.openai.com/v1/responses',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: `={{ JSON.stringify({
  model: "gpt-4.1-mini",
  tools: [{
    type: "web_search_preview",
    user_location: { type: "approximate", country: "PT", city: "Lisbon", region: "Lisboa", timezone: "Europe/Lisbon" },
    search_context_size: "high"
  }],
  tool_choice: "required",
  input: [
    {
      role: "system",
      content: "Tu és um assistente que descobre o site institucional oficial de empresas portuguesas. REGRAS: usa web_search_preview e visita o URL antes de responder. Se não conseguires confirmar, devolve candidate_url=\\"\\". NUNCA devolvas diretórios/agregadores: racius, einforma, iberinform, dnb, dun-and-bradstreet, paginasamarelas, opencorporates, bloomberg, linkedin, facebook, instagram, twitter, x.com, google, wikipedia, yelp, companyradar, bizapedia, zoominfo, statista, crunchbase, glassdoor, kompass, europages, infobel, guiafiscal, pj.gov, empresite, jornaldenegocios."
    },
    {
      role: "user",
      content: "Empresa: " + $('Loop Over Entities').item.json.Search_name + " (NIPC " + $('Loop Over Entities').item.json.NIPC_digits + ")\\n\\nDevolve o URL https da raiz do site institucional oficial. Se não houver com certeza razoável, candidate_url vazio."
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "openai_websearch",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidate_url:  { type: "string" },
          candidate_host: { type: "string" },
          confidence:     { type: "string", enum: ["high","medium","low","none"] },
          reasoning:      { type: "string" }
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
        id: 'ebb6eaa9-9f45-4803-8522-854712356822',
        name: 'Aggregate Candidates',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [560, 0],
    })
    AggregateCandidates = {
        jsCode: `// Combine SerpAPI Knowledge-Graph + organic[0..9] + OpenAI websearch hit.
// Filter aggregators, dedup by host, build a compact candidate list for the judge.
const trig = $('Loop Over Entities').item.json;
const serpRaw = $('Search SerpAPI').first()?.json || {};
const oaiRaw  = $input.first()?.json || {};
const serp = serpRaw.body || serpRaw;
const organic = Array.isArray(serp.organic_results) ? serp.organic_results : [];
const kg      = serp.knowledge_graph || {};

const BLOCKLIST = /(?:^|\\.)(racius|einforma|iberinform|dnb|dun(?:-|and)?bradstreet|paginasamarelas|paginas-amarelas|opencorporates|bloomberg|linkedin|facebook|instagram|twitter|x\\.com|google|wikipedia|yelp|companyradar|bizapedia|zoominfo|statista|crunchbase|glassdoor|kompass|europages|infobel|guiafiscal|pj\\.gov|empresite|jornaldenegocios|reddit|pinterest|youtube|tiktok|freepik|shutterstock|softwaresuggest|tourmag|sapo|bportugal|diariodarepublica|infoempresas|pai|ipac|stock\\.adobe|comum\\.rcaap)\\./i;

function hostOf(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  try { return new URL(s).hostname.replace(/^www\\./, ''); } catch (_) {
    return s.replace(/^https?:\\/\\//i, '').split('/')[0].replace(/^www\\./, '');
  }
}
function rootUrl(u) {
  const h = hostOf(u);
  return h ? 'https://' + h : '';
}

// Extract OpenAI websearch result from Responses API
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
let oaiParsed = {};
const oaiTxt = pickText(oaiRaw);
if (oaiTxt) {
  try { oaiParsed = JSON.parse(oaiTxt); }
  catch (_) {
    const m = oaiTxt.match(/\\{[\\s\\S]*\\}/);
    if (m) { try { oaiParsed = JSON.parse(m[0]); } catch (_) {} }
  }
}

// Source-priority dedup: when the same host appears from multiple sources we
// promote it to the highest-trust source instead of dropping the duplicate.
// Two independent signals agreeing on a host (e.g. SerpAPI organic + OpenAI
// websearch high-confidence) is a STRONGER signal, not weaker — losing the
// OpenAI rating would discard the strongest cross-source vote.
const SOURCE_RANK = { serpapi_kg: 3, openai_websearch: 2, serpapi_organic: 1 };
const oaiConfStr = String(oaiParsed.confidence || 'none').toLowerCase();

// NIF-in-snippet detector: Google has already indexed the company's NIPC on
// this site at some point — a near-deterministic signal that the host is the
// right entity (aggregator hosts are filtered earlier by BLOCKLIST).
const nipcTarget = String(trig.NIPC_digits || '');
function snippetHasNif(text) {
  if (!nipcTarget) return false;
  const digits = String(text || '').replace(/\\D/g, '');
  return digits.includes(nipcTarget);
}

const candidatesByHost = new Map();   // host → { url, host, source, snippet, oai_conf, nif_in_snippet }
function pushCand(url, source, snippet, extra) {
  const host = hostOf(url);
  if (!host) return;
  if (BLOCKLIST.test(host)) return;
  const snipStr = String(snippet || '');
  const incoming = {
    url: rootUrl(url),
    host,
    source,
    snippet: snipStr.slice(0, 220),
    oai_conf: (extra && extra.oai_conf) || '',
    // Only trust deterministic snippets — SerpAPI snippets come from Google's
    // actual page index, KG fields likewise. OpenAI's reasoning text is
    // model-generated prose that varies between calls (e.g. one call cites the
    // NIF, the next call doesn't), so it must NOT contribute to nif_in_snippet.
    nif_in_snippet: source !== 'openai_websearch' && snippetHasNif(snipStr),
  };
  const existing = candidatesByHost.get(host);
  if (!existing) { candidatesByHost.set(host, incoming); return; }
  // Promote: keep the highest-rank source, but merge oai_conf + nif_in_snippet
  // if any independent source confirms them.
  const exRank = SOURCE_RANK[existing.source] || 0;
  const inRank = SOURCE_RANK[source] || 0;
  if (inRank > exRank) {
    incoming.oai_conf = incoming.oai_conf || existing.oai_conf;
    incoming.nif_in_snippet = incoming.nif_in_snippet || existing.nif_in_snippet;
    candidatesByHost.set(host, incoming);
  } else {
    if (incoming.oai_conf && !existing.oai_conf) existing.oai_conf = incoming.oai_conf;
    if (incoming.nif_in_snippet) existing.nif_in_snippet = true;
  }
}

// 1) SerpAPI Knowledge Graph (highest signal). KG text fields can also carry
//    the company's NIF — concatenate everything searchable.
if (kg.website) {
  const kgText = [kg.title, kg.description, kg.address, JSON.stringify(kg.attributes || {})].filter(Boolean).join(' — ');
  pushCand(kg.website, 'serpapi_kg', kgText);
}

// 2) SerpAPI organic results — scan title+snippet for the NIPC digits.
for (const r of organic.slice(0, 10)) {
  if (!r || !r.link) continue;
  pushCand(r.link, 'serpapi_organic', (r.title || '') + ' — ' + (r.snippet || ''));
}

// 3) OpenAI websearch (also scan its reasoning text — the model often quotes
//    the company's NIF as supporting evidence).
const oaiUrl = String(oaiParsed.candidate_url || '').trim();
if (oaiUrl) {
  pushCand(oaiUrl, 'openai_websearch', String(oaiParsed.reasoning || '').slice(0, 220), { oai_conf: oaiConfStr });
}

// Stable order: KG → openai_websearch → organic
const candidates = [...candidatesByHost.values()].sort(
  (a, b) => (SOURCE_RANK[b.source] || 0) - (SOURCE_RANK[a.source] || 0)
);

return [{
  json: {
    RUN_ID:       trig.RUN_ID,
    EntityKey:    trig.EntityKey,
    Company_name: trig.Company_name,
    Search_name:  trig.Search_name,
    NIPC_digits:  trig.NIPC_digits,
    NIPC_dotted:  trig.NIPC_dotted,
    Candidates:   candidates,
    Candidates_count: candidates.length,
    OpenAI_websearch_url: oaiUrl,
    OpenAI_websearch_confidence: String(oaiParsed.confidence || 'none').toLowerCase(),
  },
}];
`,
    };

    @node({
        id: '802a5257-a806-429b-a2e1-cd388a6a9867',
        name: 'Judge OpenAI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [800, 0],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 4,
        waitBetweenTries: 5000,
    })
    JudgeOpenai = {
        method: 'POST',
        url: 'https://api.openai.com/v1/responses',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: `={{ JSON.stringify({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "system",
      content: "És um juiz que escolhe o site institucional oficial de uma empresa portuguesa a partir de uma lista de candidatos pré-filtrados (vindos de Google PT via SerpAPI e de uma pesquisa OpenAI). Regras: 1) escolhe o domínio próprio da empresa, NUNCA um diretório/agregador (mesmo que apareça); 2) prefere domínios .pt para empresas claramente portuguesas; 3) se nenhum candidato for plausível, devolve chosen_url=\\"\\" e picked_from=\\"none\\"; 4) não inventes URLs fora da lista. Devolve picked_from = serpapi_kg | serpapi_organic | openai_websearch | none."
    },
    {
      role: "user",
      content: "Empresa (nome legal completo): " + $json.Company_name + "\\nNIPC: " + $json.NIPC_digits + "\\nNome usado na pesquisa: " + $json.Search_name + "\\n\\nCandidatos (" + $json.Candidates_count + "):\\n" + ($json.Candidates.map((c,i) => (i+1) + ". " + c.url + "  | host: " + c.host + "  | fonte: " + c.source + "  | snippet: " + c.snippet).join("\\n") || "(lista vazia)") + "\\n\\nEscolhe o site institucional oficial."
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "judge_pick",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          chosen_url:  { type: "string" },
          chosen_host: { type: "string" },
          picked_from: { type: "string", enum: ["serpapi_kg","serpapi_organic","openai_websearch","none"] },
          confidence:  { type: "string", enum: ["high","medium","low","none"] },
          reasoning:   { type: "string" }
        },
        required: ["chosen_url","chosen_host","picked_from","confidence","reasoning"]
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
        id: 'f0a4922f-a6f4-4e1a-909e-f8cdae01f74b',
        name: 'Parse Judge Result',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1040, 0],
    })
    ParseJudgeResult = {
        jsCode: `// Extract the judge's chosen candidate; fall back to empty if missing/invalid.
const trig = $('Aggregate Candidates').item.json;
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
    if (m) { try { parsed = JSON.parse(m[0]); } catch (_) {} }
  }
}

let url  = String(parsed.chosen_url  || '').trim();
let host = String(parsed.chosen_host || '').trim();
let pickedFrom = String(parsed.picked_from || 'none').toLowerCase();
let conf       = String(parsed.confidence  || 'none').toLowerCase();
const reason   = String(parsed.reasoning   || '').slice(0, 400);

function hostOf(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  try { return new URL(s).hostname.replace(/^www\\./, ''); } catch (_) {
    return s.replace(/^https?:\\/\\//i, '').split('/')[0].replace(/^www\\./, '');
  }
}
function normalise(u) {
  let x = String(u || '').trim();
  if (!x) return { url: '', host: '' };
  if (!/^https?:\\/\\//i.test(x)) x = 'https://' + x;
  const h = hostOf(x);
  return { url: h ? 'https://' + h : '', host: h };
}

// Belt-and-braces aggregator guard (judge SHOULD have rejected, but a fallback
// pick from raw candidates also runs through it).
const BLOCKLIST = /(?:^|\\.)(racius|einforma|iberinform|dnb|dun(?:-|and)?bradstreet|paginasamarelas|paginas-amarelas|opencorporates|bloomberg|linkedin|facebook|instagram|twitter|x\\.com|google|wikipedia|yelp|companyradar|bizapedia|zoominfo|statista|crunchbase|glassdoor|kompass|europages|infobel|guiafiscal|pj\\.gov|empresite|jornaldenegocios|reddit|pinterest|youtube|tiktok|freepik|shutterstock|softwaresuggest|tourmag|sapo|bportugal|diariodarepublica|infoempresas|pai|ipac|stock\\.adobe|comum\\.rcaap)\\./i;

// Normalise + blocklist what the judge picked.
const norm = normalise(url);
url = norm.url; host = norm.host;
if (host && BLOCKLIST.test(host)) { url = ''; host = ''; pickedFrom = 'none'; }

let pickMethod = 'judge';
let fallbackUsed = false;

// Backup plan: if the judge returned nothing usable, only fall back to high-trust
// signals — never to raw SerpAPI organic results, because those routinely include
// noise (reddit, pinterest, news media, regulators) and the judge was the
// precision filter that separated signal from noise.
//   Tier 1: SerpAPI Knowledge Graph (Google itself has flagged it as the
//           company's official site — independent confirmation)
//   Tier 2: OpenAI websearch result whose own pre-judge confidence was
//           high or medium
// Anything outside these two tiers stays as NO_CANDIDATE and lands in NO_URL_FOUND.
if ((!url || !host) && Array.isArray(trig.Candidates) && trig.Candidates.length) {
  const oaiConfTop = String(trig.OpenAI_websearch_confidence || 'none').toLowerCase();
  const TRUSTED = (c) => {
    if (c.source === 'serpapi_kg') return true;
    if (c.source === 'openai_websearch' && (oaiConfTop === 'high' || oaiConfTop === 'medium')) return true;
    // Cross-source ratification: same host found by SerpAPI organic AND
    // confirmed by OpenAI websearch at high/medium confidence.
    const cConf = String(c.oai_conf || '').toLowerCase();
    if (cConf === 'high' || cConf === 'medium') return true;
    // NIF-in-snippet ratification: Google indexed the company's NIPC digits
    // on this host. Near-deterministic — accept even from organic source.
    if (c.nif_in_snippet) return true;
    return false;
  };
  for (const c of trig.Candidates) {
    if (!TRUSTED(c)) continue;
    const n = normalise(c.url || ('https://' + c.host));
    if (!n.host || BLOCKLIST.test(n.host)) continue;
    url = n.url;
    host = n.host;
    pickedFrom = String(c.source || 'unknown').toLowerCase();
    conf = c.source === 'serpapi_kg' || c.nif_in_snippet ? 'medium' : 'low';
    fallbackUsed = true;
    pickMethod = 'fallback';
    break;
  }
}

// Look up which candidate matches the chosen host so we can carry forward
// its nif_in_snippet flag (regardless of whether the judge or fallback picked).
let snippetNifMatch = false;
if (host && Array.isArray(trig.Candidates)) {
  for (const c of trig.Candidates) {
    if (c.host === host) { snippetNifMatch = Boolean(c.nif_in_snippet); break; }
  }
}

const hasCandidate = Boolean(url && host && pickedFrom !== 'none');

return [{
  json: {
    RUN_ID:           trig.RUN_ID,
    EntityKey:        trig.EntityKey,
    Company_name:     trig.Company_name,
    Search_name:      trig.Search_name,
    NIPC_digits:      trig.NIPC_digits,
    NIPC_dotted:      trig.NIPC_dotted,
    Candidate_URL:    hasCandidate ? url  : '',
    Candidate_host:   hasCandidate ? host : '',
    Source_signal:    hasCandidate ? pickedFrom : 'none',
    Pick_method:      hasCandidate ? pickMethod : 'none',
    Judge_confidence: conf,
    Judge_reasoning:  fallbackUsed ? ('[fallback ' + pickedFrom + '] ' + reason) : reason,
    Candidates_seen:  trig.Candidates_count,
    Snippet_nif_match: hasCandidate ? snippetNifMatch : false,
    Found_status:     hasCandidate ? 'CANDIDATE_FOUND' : 'NO_CANDIDATE',
  },
}];
`,
    };

    @node({
        id: '3ea9af67-fc27-4e68-be7e-54912a0fcafa',
        name: 'Gate Has Candidate',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1280, 0],
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
        id: '9c33dac2-fdc5-4261-a309-454c9ca0dd3e',
        name: 'Build Subpage URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1520, -150],
    })
    BuildSubpageUrls = {
        jsCode: `const j = $input.first().json;
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
        id: '6a101cd7-eb04-48e0-9f91-9f50c6ad4fd0',
        name: 'Fetch Page',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1760, -150],
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
                    fullResponse: true,
                },
            },
            timeout: 15000,
        },
    };

    @node({
        id: 'd3dee2dd-df2b-4700-9619-21075fb47d50',
        name: 'Validate NIF On Pages',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2000, -150],
    })
    ValidateNifOnPages = {
        jsCode: `// Outcome ladder identical to URL_DISCOVER_OPENAI.
const fetched = $input.all();
const meta    = $('Build Subpage URLs').all();
const trig    = $('Parse Judge Result').item.json;

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
let contentType = '';

// Normalise content-type header lookup — HTTP headers are case-insensitive but
// n8n returns them as a plain object keyed by lowercase strings under fullResponse.
function pickContentType(headers) {
  if (!headers || typeof headers !== 'object') return '';
  const h = headers['content-type'] || headers['Content-Type'] || headers['CONTENT-TYPE'];
  if (!h) return '';
  // Strip charset / boundary parameters: "text/html; charset=utf-8" → "text/html"
  return String(h).split(';')[0].trim().toLowerCase();
}

for (let i = 0; i < fetched.length; i++) {
  const f = fetched[i]?.json || {};
  const sc = Number(f.statusCode || 0);
  const hasError = Boolean(f.error) || (sc && sc >= 400);
  const body = String(f.data || f.body || '');
  if (i === 0 && !hasError && body.length > 1000) {
    homepageReachable = true;
    contentType = pickContentType(f.headers);
  }
  if (hasError || !body) continue;
  const cleanDigits = stripNoise(body).replace(/\\D/g, '');
  if (target && cleanDigits.includes(target)) {
    nifFound = true;
    nifPage  = String(meta[i]?.json?.Page_URL || '');
    // Capture content-type from the page that matched if we hadn't yet.
    if (!contentType) contentType = pickContentType(f.headers);
    break;
  }
}

// Outcome ladder (we only get here if Gate Has Candidate said yes — i.e. there
// IS a candidate URL that already passed the judge or the trusted-signal fallback):
//   URL_DISCOVERED            — NIF appears on a fetched page OR was already
//                               indexed in the candidate's SerpAPI snippet
//                               (Google saw the NIF on this host) AND the
//                               homepage responds. Both are deterministic
//                               matches of the company's NIPC digits.
//   URL_LIKELY                — candidate URL + homepage responded
//   URL_FOUND_NOT_RESPONDING — candidate URL but homepage didn't load (DNS fail,
//                               ECONNREFUSED, all-404). Keep the URL for retry.
const snippetNifMatch = Boolean(trig.Snippet_nif_match);
let outcome;
if (nifFound) outcome = 'URL_DISCOVERED';
else if (snippetNifMatch && homepageReachable) outcome = 'URL_DISCOVERED';
else if (homepageReachable) outcome = 'URL_LIKELY';
else outcome = 'URL_FOUND_NOT_RESPONDING';

return [{
  json: {
    RUN_ID:          trig.RUN_ID,
    EntityKey:       trig.EntityKey,
    Company_name:    trig.Company_name,
    NIPC_digits:     trig.NIPC_digits,
    NIPC_dotted:     trig.NIPC_dotted,
    Candidate_URL:   trig.Candidate_URL,
    Candidate_host:  trig.Candidate_host,
    Source_signal:   trig.Source_signal,
    Pick_method:     trig.Pick_method,
    Judge_confidence: trig.Judge_confidence,
    Judge_reasoning:  trig.Judge_reasoning,
    Candidates_seen:  trig.Candidates_seen,
    Nif_on_page:     nifFound,
    Nif_page_url:    nifPage,
    Nif_in_snippet:  snippetNifMatch,
    Homepage_reachable: homepageReachable,
    Content_type:    contentType,
    Has_url:         outcome !== 'NO_URL_FOUND',
    Discovery_outcome: outcome,
  },
}];
`,
    };

    @node({
        id: '3e9e1851-85bc-4f14-a77d-9f8328d6e580',
        name: 'Gate URL Acceptable',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [2240, -150],
    })
    GateUrlAcceptable = {
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
        id: '37fe8e92-b29e-451a-b189-076d2d8ae4f5',
        name: 'Prep Failure (No Candidate)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1520, 150],
    })
    PrepFailureNoCandidate = {
        jsCode: `const j = $input.first().json;
return [{
  json: {
    RUN_ID:        j.RUN_ID,
    EntityKey:     j.EntityKey,
    Candidate_URL: '',
    Source_signal: 'none',
    Discovery_outcome: 'NO_URL_FOUND',
  },
}];
`,
    };

    @node({
        id: '63e80f69-b141-4dcb-9083-1fe6ee9af180',
        webhookId: 'hybrid-success-wh',
        name: 'Wait Before Success Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [2480, -200],
    })
    WaitBeforeSuccessWrite = {
        amount: 2,
    };

    @node({
        id: 'e7870338-d11a-41cc-bd27-9c6ad7d45a5c',
        webhookId: 'hybrid-failure-wh',
        name: 'Wait Before Failure Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [2480, 200],
    })
    WaitBeforeFailureWrite = {
        amount: 2,
    };

    @node({
        id: '3a498710-cc41-4814-b550-5694641b5816',
        name: 'Upsert URL_CHECKS (Success)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [2720, -200],
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
                Source_signal: '={{ $json.Source_signal }}',
                Pick_method: '={{ $json.Pick_method }}',
                Content_type: '={{ $json.Content_type }}',
                Transport_error: '',
            },
            matchingColumns: ['Entity_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'b9b5a83f-1b9a-4a88-8e21-44efa6287b25',
        name: 'Upsert URL_CHECKS (Failure)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [2720, 200],
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
                Source_signal: '={{ $json.Source_signal }}',
            },
            matchingColumns: ['Entity_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '6d69fd23-3704-4147-9805-4ef02dd9283f',
        name: 'Mark Discovering Phase',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-540, 0],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 10000,
    })
    MarkDiscoveringPhase = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'CONTROL_EXEC',
            mode: 'name',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{ $json.RUN_ID + "_" + $json.EntityKey }}',
                Run_ID: '={{ $json.RUN_ID }}',
                Entity_key: '={{ $json.EntityKey }}',
                Current_phase: 'DISCOVERING_URL_PHASE',
                Process_Status: 'PENDING',
                Updated_at: '={{ $now.setZone("Europe/Lisbon").toISO() }}',
            },
            matchingColumns: ['Exec_key'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '724dd5d3-9818-4bca-b246-8b0e2c85241a',
        name: 'Mark Discovery Done',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [2960, 0],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 10000,
    })
    MarkDiscoveryDone = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'CONTROL_EXEC',
            mode: 'name',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{ ($json.Run_ID || $json.RUN_ID) + "_" + ($json.Entity_key || $json.EntityKey) }}',
                Run_ID: '={{ $json.Run_ID || $json.RUN_ID }}',
                Entity_key: '={{ $json.Entity_key || $json.EntityKey }}',
                Current_phase: 'DISCOVERING_URL_PHASE',
                Process_Status: 'DONE',
                Next_action:
                    '={{ ["URL_DISCOVERED","URL_LIKELY"].includes($json.Response_class || $json.Discovery_outcome) ? "STAGE 2" : "STAGE 3" }}',
                Queued_action: '',
                Updated_at: '={{ $now.setZone("Europe/Lisbon").toISO() }}',
            },
            matchingColumns: ['Exec_key'],
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
        this.MergeReads.out(0).to(this.JoinFilterCleanName.in(0));
        this.JoinFilterCleanName.out(0).to(this.LoopOverEntities.in(0));
        this.LoopOverEntities.out(1).to(this.MarkDiscoveringPhase.in(0));
        this.MarkDiscoveringPhase.out(0).to(this.WaitBeforeSerpapi.in(0));
        this.WaitBeforeSerpapi.out(0).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.WaitBeforeOpenaiSearch.in(0));
        this.WaitBeforeOpenaiSearch.out(0).to(this.SearchOpenaiWeb.in(0));
        this.SearchOpenaiWeb.out(0).to(this.AggregateCandidates.in(0));
        this.AggregateCandidates.out(0).to(this.JudgeOpenai.in(0));
        this.JudgeOpenai.out(0).to(this.ParseJudgeResult.in(0));
        this.ParseJudgeResult.out(0).to(this.GateHasCandidate.in(0));
        this.GateHasCandidate.out(0).to(this.BuildSubpageUrls.in(0));
        this.GateHasCandidate.out(1).to(this.PrepFailureNoCandidate.in(0));
        this.BuildSubpageUrls.out(0).to(this.FetchPage.in(0));
        this.FetchPage.out(0).to(this.ValidateNifOnPages.in(0));
        this.ValidateNifOnPages.out(0).to(this.GateUrlAcceptable.in(0));
        this.GateUrlAcceptable.out(0).to(this.WaitBeforeSuccessWrite.in(0));
        this.GateUrlAcceptable.out(1).to(this.WaitBeforeFailureWrite.in(0));
        this.PrepFailureNoCandidate.out(0).to(this.WaitBeforeFailureWrite.in(0));
        this.WaitBeforeSuccessWrite.out(0).to(this.UpsertUrlChecksSuccess.in(0));
        this.WaitBeforeFailureWrite.out(0).to(this.UpsertUrlChecksFailure.in(0));
        this.UpsertUrlChecksSuccess.out(0).to(this.MarkDiscoveryDone.in(0));
        this.UpsertUrlChecksFailure.out(0).to(this.MarkDiscoveryDone.in(0));
        this.MarkDiscoveryDone.out(0).to(this.LoopOverEntities.in(0));
    }
}
