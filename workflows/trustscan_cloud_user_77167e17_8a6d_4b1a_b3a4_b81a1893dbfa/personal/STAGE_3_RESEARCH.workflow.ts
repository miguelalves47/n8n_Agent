import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : STAGE 3 - Research
// Nodes   : 17  |  Connections: 19
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Phase1Trigger                      manualTrigger
// ReadUrlChecks                      googleSheets               [creds]
// ReadControlEvidence                googleSheets               [creds]
// ReadInputSnapshot                  googleSheets               [creds]
// MergeReads                         merge
// ComputeMissingFields               code
// UpdateControlExecStage3            googleSheets               [creds] [alwaysOutput] [retry]
// LoopOverEntities                   splitInBatches
// WaitBeforeSerpapi                  wait
// SearchSerpapi                      httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// WaitBeforeOpenai                   wait
// SearchOpenai                       httpRequest                [onError→regular] [creds] [alwaysOutput] [retry]
// ParseStage3Results                 code
// WaitBeforePhase3Write              wait
// WriteStage3Evidence                googleSheets               [creds] [retry]
// DedupeExecUpdate                   code
// UpdateControlExecDone              googleSheets               [creds] [alwaysOutput] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Phase1Trigger
//    → ReadUrlChecks
//      → MergeReads
//        → ComputeMissingFields
//          → UpdateControlExecStage3
//          → LoopOverEntities
//           .out(1) → WaitBeforeSerpapi
//              → SearchSerpapi
//                → WaitBeforeOpenai
//                  → SearchOpenai
//                    → ParseStage3Results
//                      → WaitBeforePhase3Write
//                        → WriteStage3Evidence
//                          → DedupeExecUpdate
//                            → UpdateControlExecDone
//                              → LoopOverEntities (↩ loop)
//    → ReadControlEvidence
//      → MergeReads.in(1) (↩ loop)
//    → ReadInputSnapshot
//      → MergeReads.in(2) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'EtfFFrnxUDJ9cuxa',
    name: 'STAGE 3 - Research',
    active: false,
    settings: { executionOrder: 'v1', binaryMode: 'separate' },
})
export class Stage3ResearchWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 's3-trigger',
        name: 'Phase 1 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1400, 0],
    })
    Phase1Trigger = {};

    @node({
        id: 's3-read-url-checks',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1160, -200],
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
        id: 's3-read-evidence',
        name: 'Read CONTROL_EVIDENCE',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1160, 0],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
    })
    ReadControlEvidence = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'CONTROL_EVIDENCE',
            mode: 'name',
        },
        options: {},
    };

    @node({
        id: 's3-read-snapshot',
        name: 'Read Input Snapshot',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1160, 200],
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
        id: 's3-merge-reads',
        name: 'Merge Reads',
        type: 'n8n-nodes-base.merge',
        version: 3,
        position: [-960, 0],
    })
    MergeReads = {
        mode: 'chooseBranch',
        chooseBranchMode: 'waitForAll',
        output: 'specifiedInput',
        useDataOfInput: '1',
        numberInputs: 3,
    };

    @node({
        id: 's3-compute-missing',
        name: 'Compute Missing Fields',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-760, 0],
    })
    ComputeMissingFields = {
        jsCode: `// Stage 3 input shaping:
//   1. Determine current Run_ID = max(numeric Run_ID) from URL_CHECKS.
//   2. For every entity in URL_CHECKS for that run, look up CONTROL_EVIDENCE
//      and compute Missing_fields = fields without a non-empty Value row.
//      If nothing is missing → skip (already complete).
//   3. URL state determines (Source_url, Hint_url):
//        live  (2XX, SUCCESS, URL_DISCOVERED, URL_LIKELY)        → Source_url = Final_url
//        dead  (URL_FOUND_NOT_RESPONDING, 4XX, 5XX, TRANSPORT_ERROR) → Hint_url   = Final_url
//        none  (NO_URL_FOUND, NO_URL, anything else)            → both empty
//   4. Inner-join INPUT_SNAPSHOT (NIPC + legal name); skip entities missing those.
const urlChecks = $('Read URL Checks').all();
const evidence  = $('Read CONTROL_EVIDENCE').all();
const snapshot  = $('Read Input Snapshot').all();

// --- (1) current Run_ID
let currentRunId = '';
let maxNum = -1;
for (const it of urlChecks) {
  const v = String(it.json.Run_ID || it.json.RUN_ID || '').trim();
  const n = Number(v);
  if (!isNaN(n) && n > maxNum) { maxNum = n; currentRunId = v; }
}
if (!currentRunId) return [];

// --- (4) INPUT_SNAPSHOT lookup
const byEntity = new Map();
for (const it of snapshot) {
  const j = it.json || {};
  const ek = String(j['Entity_key'] || j['EntityKey'] || j['NIPC'] || j['Entity_Key'] || '').trim();
  if (!ek) continue;
  const name = String(j['NOME'] || j['Nome'] || j['Company_name'] || j['CompanyName'] || '').trim();
  const nipc = String(j['NIPC'] || j['Nipc'] || j['nipc'] || j['Entity_key'] || '').trim().replace(/\\D/g, '');
  byEntity.set(ek, { Company_name: name, NIPC_digits: nipc });
}

// --- CONTROL_EVIDENCE: per entity, which fields have ≥1 non-empty Value row in current run?
const fieldsByEntity = new Map();
for (const it of evidence) {
  const j = it.json || {};
  if (String(j['Run_ID'] || '').trim() !== currentRunId) continue;
  const ek = String(j['Entity_key'] || '').trim();
  if (!ek) continue;
  const field = String(j['Field (phone | email | address)'] || '').trim().toLowerCase();
  const value = String(j['Value'] || '').trim();
  if (!field || !value) continue;            // placeholder rows don't count as found
  if (!fieldsByEntity.has(ek)) fieldsByEntity.set(ek, new Set());
  fieldsByEntity.get(ek).add(field);
}

const ALL_FIELDS = ['email', 'phone', 'address'];
const LIVE_CLASSES = new Set(['2XX', 'SUCCESS', 'URL_DISCOVERED', 'URL_LIKELY']);
const DEAD_CLASSES = new Set(['URL_FOUND_NOT_RESPONDING', '4XX', '5XX', 'TRANSPORT_ERROR']);

function urlStateFor(respClass, finalUrl) {
  if (LIVE_CLASSES.has(respClass) && finalUrl) return { sourceUrl: finalUrl, hintUrl: '',       state: 'live' };
  if (DEAD_CLASSES.has(respClass) && finalUrl) return { sourceUrl: '',       hintUrl: finalUrl, state: 'dead' };
  return                                              { sourceUrl: '',       hintUrl: '',       state: 'none' };
}

const out = [];
const seen = new Set();
for (const it of urlChecks) {
  const j = it.json || {};
  if (String(j['Run_ID'] || '').trim() !== currentRunId) continue;
  const ek = String(j['Entity_key'] || '').trim();
  if (!ek || seen.has(ek)) continue;
  seen.add(ek);

  const meta = byEntity.get(ek);
  if (!meta || !meta.Company_name) continue;       // need a name for SerpAPI/OpenAI

  const respClass = String(j['Response_class'] || '').trim().toUpperCase();
  const finalUrl  = String(j['Final_url']      || '').trim();
  const { sourceUrl, hintUrl, state } = urlStateFor(respClass, finalUrl);

  const found = fieldsByEntity.get(ek) || new Set();
  const missing = ALL_FIELDS.filter(f => !found.has(f));
  if (missing.length === 0) continue;              // all 3 already in evidence

  out.push({
    json: {
      RUN_ID:        currentRunId,
      EntityKey:     ek,
      Company_name:  meta.Company_name,
      NIPC_digits:   meta.NIPC_digits,
      Missing_fields: missing,
      Source_url:    sourceUrl,
      Hint_url:      hintUrl,
      Url_state:     state,         // 'live' | 'dead' | 'none' — for downstream visibility
      Response_class: respClass,
    },
  });
}
return out;
`,
    };

    @node({
        id: 's3-update-ctrl-exec-start',
        name: 'Update Control Exec Stage 3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-560, -240],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    UpdateControlExecStage3 = {
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
                Current_phase: 'STAGE 3',
                Process_Status: 'IN_PROGRESS',
                Queued_action: 'STAGE_3',
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
        id: 's3-loop',
        name: 'Loop Over Entities',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-360, 0],
    })
    LoopOverEntities = {
        options: {},
    };

    @node({
        id: 's3-wait-serpapi',
        webhookId: 's3-wait-serpapi-wh',
        name: 'Wait Before SerpAPI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-160, 200],
    })
    WaitBeforeSerpapi = {
        amount: 2,
    };

    @node({
        id: 's3-search-serpapi',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [80, 200],
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
                    value: "={{ '\"' + $json.Company_name + '\" contacto telefone email morada' }}",
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
        id: 's3-wait-openai',
        webhookId: 's3-wait-openai-wh',
        name: 'Wait Before OpenAI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [320, 200],
    })
    WaitBeforeOpenai = {
        amount: 1,
    };

    @node({
        id: 's3-search-openai',
        name: 'Search OpenAI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [560, 200],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 4,
        waitBetweenTries: 5000,
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
  max_output_tokens: 1000,
  tools: [{
    type: "web_search_preview",
    user_location: { type: "approximate", country: "PT", city: "Lisbon", region: "Lisboa", timezone: "Europe/Lisbon" },
    search_context_size: "medium"
  }],
  tool_choice: "required",
  input: [
    {
      role: "system",
      content: "Tu és um assistente que descobre dados de contacto oficiais (email, telefone, morada) de empresas portuguesas. Devolve apenas valores que consigas atribuir a uma fonte primária: o site oficial da empresa, comunicado de imprensa, notícia, ou rede social oficial da empresa. NUNCA cites diretórios/agregadores: racius, einforma, iberinform, dnb, dun-and-bradstreet, paginasamarelas, opencorporates, bloomberg, linkedin, facebook, instagram, infoempresas, jornaldenegocios, infobel, kompass, europages, empresite, guiafiscal, pai, ipac, bportugal, sapo, statista, crunchbase, glassdoor, companyradar, bizapedia, zoominfo, wikipedia, reddit. Se um campo já está preenchido (não está em Campos em falta) devolve string vazia para esse campo. Se não tens fonte primária com certeza razoável, devolve string vazia para esse campo. Devolve o url da fonte que justifica cada valor."
    },
    {
      role: "user",
      content: "Empresa: " + $('Loop Over Entities').item.json.Company_name + "\\nNIPC: " + $('Loop Over Entities').item.json.NIPC_digits + ($('Loop Over Entities').item.json.Hint_url ? "\\nSite da empresa (atualmente NÃO responde, apenas como contexto, não cites): " + $('Loop Over Entities').item.json.Hint_url : "") + "\\nCampos em falta: " + ($('Loop Over Entities').item.json.Missing_fields || []).join(", ") + "\\n\\nDevolve apenas os campos em falta. Para campos já preenchidos devolve string vazia."
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "stage3_contacts",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          email:              { type: "string" },
          email_source_url:   { type: "string" },
          phone:              { type: "string" },
          phone_source_url:   { type: "string" },
          address:            { type: "string" },
          address_source_url: { type: "string" }
        },
        required: ["email","email_source_url","phone","phone_source_url","address","address_source_url"]
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
        id: 's3-parse-results',
        name: 'Parse Stage 3 Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [800, 200],
    })
    ParseStage3Results = {
        jsCode: `// Combine SerpAPI snippets + OpenAI parsed JSON. For each missing field:
//   1. Try SerpAPI: extract from organic snippets, filter aggregators by host.
//   2. Else try OpenAI: read field value + its cited source_url; reject if aggregator.
//   3. Else emit a stage3_not_found placeholder row.
// One row per Missing_field. Output schema matches CONTROL_EVIDENCE exactly.
const trig = $('Loop Over Entities').item.json;
const serp = $('Search SerpAPI').first()?.json || {};
const oaiRaw = $input.first()?.json || {};

const BLOCKLIST = /(?:^|\\.)(racius|einforma|iberinform|dnb|dun(?:-|and)?bradstreet|paginasamarelas|paginas-amarelas|opencorporates|bloomberg|linkedin|facebook|instagram|twitter|x\\.com|google|wikipedia|yelp|companyradar|bizapedia|zoominfo|statista|crunchbase|glassdoor|kompass|europages|infobel|guiafiscal|pj\\.gov|empresite|jornaldenegocios|reddit|pinterest|youtube|tiktok|freepik|shutterstock|softwaresuggest|tourmag|sapo|bportugal|diariodarepublica|infoempresas|pai|ipac|stock\\.adobe|comum\\.rcaap)\\./i;

const EMAIL_JUNK  = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const phoneRegex  = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
const emailRegex  = /[a-zA-Z0-9\\u00C0-\\u017E][a-zA-Z0-9._%+\\-\\u00C0-\\u017E]{2,}@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
const addrRegex   = /(?:Rua|R\\.|Avenida|Av\\.|Avda\\.|Pra[çc]a|Largo|Estrada|Travessa|Cal[çc]ada|Alameda|Beco|Calle|C\\/|Carrer|Passeig|Paseo|Plaza|Pl\\.|Edificio|Edif\\.|Pol\\.?\\s*Ind\\.|Pol[íi]gono|Urb\\.)\\s{0,2}[^\\n]{5,120}/g;

function hostOf(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  try { return new URL(s).hostname.replace(/^www\\./, ''); } catch (_) {
    return s.replace(/^https?:\\/\\//i, '').split('/')[0].replace(/^www\\./, '');
  }
}
function isAggregator(url) {
  const h = hostOf(url);
  return Boolean(h && BLOCKLIST.test(h));
}

function trimAddress(raw) {
  var t = String(raw || '').replace(/\\s+/g, ' ').trim();
  var hm = /\\s*[;|–—]\\s*/.exec(t);
  if (hm && hm.index > 8) t = t.slice(0, hm.index);
  var nm = /[\\s.]+(Telefone|Telemóvel|Telemovel|Tel\\b|Telf\\b|Tlf\\b|Fax\\b|Email\\b|NIF\\b|CONTATO|Contato|Contact|Actividade|Pagamentos|Vendas|River\\b|View\\b|Office\\b|Robert\\b|Código\\b|Codigo\\b|COMÉRCIO|COMERCIO|www\\.)/i.exec(t);
  if (nm && nm.index > 8) t = t.slice(0, nm.index);
  var pm = /(\\d{4}-\\d{3})/.exec(t) || /(?<![\\d-])(\\d{5})(?![\\d-])/.exec(t);
  if (!pm) return '';
  var after = t.slice(pm.index + pm[0].length);
  var cityTail = after.match(/^[^.;|–—·]{0,30}/);
  t = t.slice(0, pm.index + pm[0].length) + (cityTail ? cityTail[0] : '');
  return t.slice(0, 120).replace(/[\\s,\\.\\-·]+$/, '').trim();
}

function extractEmailsFromText(text) {
  const out = new Set();
  for (const m of String(text || '').matchAll(emailRegex)) {
    const e = m[0].toLowerCase();
    if (e.startsWith('...') || EMAIL_JUNK.test(e)) continue;
    out.add(e);
  }
  return [...out];
}
function extractPhonesFromText(text) {
  const out = new Set();
  let m;
  const r = new RegExp(phoneRegex.source, 'g');
  while ((m = r.exec(String(text || ''))) !== null) {
    const c = m[1].replace(/[\\s.\\-()]/g, '').trim();
    const d = c.replace(/[\\+]/g, '');
    if (d.length === 9 || d.length === 11 || d.length === 12 || d.length === 13) {
      const stored = c.startsWith('+') ? '00' + c.slice(1) : c;
      out.add(stored);
    }
  }
  return [...out];
}
function extractAddressesFromText(text) {
  const out = new Set();
  let m;
  const r = new RegExp(addrRegex.source, 'g');
  while ((m = r.exec(String(text || ''))) !== null) {
    const a = trimAddress(m[0]);
    if (a && a.length > 10) out.add(a);
  }
  return [...out];
}

// --- SerpAPI extraction: walk organic results, drop aggregator hosts.
// Keep host metadata so we can prefer own-domain hits (Cohort B → Source_url,
// Cohort A' → Hint_url) when several organic results yield the same field.
const organic = Array.isArray(serp.organic_results) ? serp.organic_results : [];
const serpEmails = [], serpPhones = [], serpAddrs = [];
function pushUnique(list, value, link, host) {
  if (!list.some(x => x.value === value)) list.push({ value, link, host });
}
for (const r of organic) {
  const link = String(r.link || '');
  if (!link) continue;
  if (isAggregator(link)) continue;
  const host = hostOf(link);
  const text = (r.title || '') + ' ' + (r.snippet || '');
  for (const e of extractEmailsFromText(text))    pushUnique(serpEmails, e, link, host);
  for (const p of extractPhonesFromText(text))    pushUnique(serpPhones, p, link, host);
  for (const a of extractAddressesFromText(text)) pushUnique(serpAddrs,  a, link, host);
}
// Cohort B has a working Source_url; Cohort A' has Hint_url (dead but discovered).
// Prefer SerpAPI hits whose host matches that domain.
const hintHost = hostOf(String(trig.Source_url || trig.Hint_url || ''));

// --- OpenAI extraction: parse json_schema text body
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
let oai = {};
const oaiTxt = pickText(oaiRaw);
if (oaiTxt) {
  try { oai = JSON.parse(oaiTxt); }
  catch (_) {
    const m = oaiTxt.match(/\\{[\\s\\S]*\\}/);
    if (m) { try { oai = JSON.parse(m[0]); } catch (_) {} }
  }
}
function oaiField(value, urlField) {
  const v = String(oai[value] || '').trim();
  const u = String(oai[urlField] || '').trim();
  if (!v) return null;
  if (u && isAggregator(u)) return null;
  return { value: v, url: u };
}
const oaiEmail   = oaiField('email',   'email_source_url');
const oaiPhone   = oaiField('phone',   'phone_source_url');
const oaiAddress = oaiField('address', 'address_source_url');

// Validate OpenAI values with the same regex used on SerpAPI snippets
function validateOaiEmail(o)   { if (!o) return null; const list = extractEmailsFromText(o.value); return list.length ? { value: list[0], url: o.url } : null; }
function validateOaiPhone(o)   { if (!o) return null; const list = extractPhonesFromText(o.value); return list.length ? { value: list[0], url: o.url } : null; }
function validateOaiAddress(o) { if (!o) return null; const trimmed = trimAddress(o.value); return trimmed && trimmed.length > 10 ? { value: trimmed, url: o.url } : null; }
const okEmail   = validateOaiEmail(oaiEmail);
const okPhone   = validateOaiPhone(oaiPhone);
const okAddress = validateOaiAddress(oaiAddress);

// --- Per missing field: pick SerpAPI > OpenAI > not_found. One row each.
const missing = Array.isArray(trig.Missing_fields) ? trig.Missing_fields : [];
const now  = $now.setZone("Europe/Lisbon").toISO();
const base = {
  Run_ID:       String(trig.RUN_ID    || '').trim(),
  Entity_key:   String(trig.EntityKey || '').trim(),
  Source_url:   String(trig.Source_url || '').trim(),
  Hint_url:     String(trig.Hint_url  || '').trim(),
  Confidence:   '',
  Extracted_at: now,
};
const NOT_FOUND = 'stage3_not_found';

function pick(field, serpList, oaiValid) {
  if (serpList.length) {
    // Prefer own-domain hit when we have a domain hint (cohort B or A').
    const own = hintHost ? serpList.find(x => x.host === hintHost) : null;
    const chosen = own || serpList[0];
    return { value: chosen.value, source: 'serpapi_stage_3', srcUrl: chosen.link };
  }
  if (oaiValid) {
    return { value: oaiValid.value, source: 'openai_stage_3', srcUrl: oaiValid.url };
  }
  return { value: '', source: NOT_FOUND, srcUrl: '' };
}

const rows = [];
for (const f of missing) {
  let chosen;
  if (f === 'email')        chosen = pick('email',   serpEmails, okEmail);
  else if (f === 'phone')   chosen = pick('phone',   serpPhones, okPhone);
  else if (f === 'address') chosen = pick('address', serpAddrs,  okAddress);
  else continue;
  rows.push({
    json: {
      ...base,
      'Field (phone | email | address)': f,
      Value: chosen.value,
      'Source_type  (input | serpapi | scrape | openai)': chosen.source,
      SerpAPI_ContactUrls: chosen.srcUrl,
    },
  });
}
return rows;
`,
    };

    @node({
        id: 's3-wait-phase3-write',
        webhookId: 's3-wait-phase3-write-wh',
        name: 'Wait Before Phase 3 Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1040, 200],
    })
    WaitBeforePhase3Write = {
        amount: 2,
    };

    @node({
        id: 's3-write-evidence',
        name: 'Write Stage 3 Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1280, 200],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    WriteStage3Evidence = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'CONTROL_EVIDENCE',
            mode: 'name',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                'Field (phone | email | address)': '={{ $json["Field (phone | email | address)"] }}',
                Value: '={{ $json.Value }}',
                Source_url: '={{ $json.Source_url }}',
                'Source_type  (input | serpapi | scrape | openai)':
                    '={{ $json["Source_type  (input | serpapi | scrape | openai)"] }}',
                Confidence: '={{ $json.Confidence }}',
                Extracted_at: '={{ $json.Extracted_at }}',
                SerpAPI_ContactUrls: '={{ $json.SerpAPI_ContactUrls }}',
                Hint_url: '={{ $json.Hint_url }}',
            },
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 's3-dedupe-exec-update',
        name: 'Dedupe Exec Update',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1400, 200],
    })
    DedupeExecUpdate = {
        jsCode: `// Collapse per-field rows back to a single item per loop iteration so the
// downstream CONTROL_EXEC update fires once per entity (not once per evidence row).
return [{ json: $('Loop Over Entities').item.json }];
`,
    };

    @node({
        id: 's3-update-ctrl-exec-done',
        name: 'Update Control Exec Done',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1620, 200],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    UpdateControlExecDone = {
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
                Exec_key:
                    "={{ $('Loop Over Entities').item.json.RUN_ID + \"_\" + $('Loop Over Entities').item.json.EntityKey }}",
                Run_ID: "={{ $('Loop Over Entities').item.json.RUN_ID }}",
                Entity_key: "={{ $('Loop Over Entities').item.json.EntityKey }}",
                Current_phase: 'STAGE 3',
                Process_Status: 'DONE',
                Next_action: '',
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
        this.Phase1Trigger.out(0).to(this.ReadControlEvidence.in(0));
        this.Phase1Trigger.out(0).to(this.ReadInputSnapshot.in(0));
        this.ReadUrlChecks.out(0).to(this.MergeReads.in(0));
        this.ReadControlEvidence.out(0).to(this.MergeReads.in(1));
        this.ReadInputSnapshot.out(0).to(this.MergeReads.in(2));
        this.MergeReads.out(0).to(this.ComputeMissingFields.in(0));
        this.ComputeMissingFields.out(0).to(this.UpdateControlExecStage3.in(0));
        this.ComputeMissingFields.out(0).to(this.LoopOverEntities.in(0));
        this.LoopOverEntities.out(1).to(this.WaitBeforeSerpapi.in(0));
        this.WaitBeforeSerpapi.out(0).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.WaitBeforeOpenai.in(0));
        this.WaitBeforeOpenai.out(0).to(this.SearchOpenai.in(0));
        this.SearchOpenai.out(0).to(this.ParseStage3Results.in(0));
        this.ParseStage3Results.out(0).to(this.WaitBeforePhase3Write.in(0));
        this.WaitBeforePhase3Write.out(0).to(this.WriteStage3Evidence.in(0));
        this.WriteStage3Evidence.out(0).to(this.DedupeExecUpdate.in(0));
        this.DedupeExecUpdate.out(0).to(this.UpdateControlExecDone.in(0));
        this.UpdateControlExecDone.out(0).to(this.LoopOverEntities.in(0));
    }
}
