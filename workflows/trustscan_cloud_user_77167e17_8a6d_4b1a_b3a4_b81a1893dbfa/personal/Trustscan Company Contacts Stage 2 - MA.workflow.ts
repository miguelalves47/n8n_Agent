import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts  Stage 2 - MA
// Nodes   : 36  |  Connections: 37
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Phase1Trigger                      manualTrigger
// ReadUrlChecks                      googleSheets               [creds]
// NormalizeInput                     code
// GateHasUrl                         if
// UpdateControlExecStage2            googleSheets               [creds] [alwaysOutput]
// LoopOverCompanies                  splitInBatches
// WaitBeforeSerpapi                  wait
// SearchSerpapi                      httpRequest                [creds] [alwaysOutput]
// ParseSerpapiResults                code
// FetchHomepage                      httpRequest                [onError→regular] [retry]
// BuildCandidateUrls                 code
// FetchCandidate                     httpRequest                [onError→regular] [retry]
// AggregateAndCompare                code
// WriteToControlEvidence             googleSheets               [creds] [retry]
// WaitBeforePhase1Write              wait
// DeduplicateCompanies               code
// LoopFirecrawl                      splitInBatches
// CheckMissingFields                 if
// PrepCrawl                          code
// FirecrawlStartCrawl                httpRequest                [onError→regular]
// ExtractCrawlId                     code
// CheckCrawlStarted                  if
// CrawlFailedFallback                code
// WaitCrawlStart                     wait
// PrepPoll                           code
// PollCrawlStatus                    httpRequest                [onError→regular]
// CheckCrawlDone                     if
// WaitPollRetry                      wait
// MergeCrawlData                     code
// ParseFirecrawlResults              code
// WaitBeforePhase2Write              wait
// WriteFirecrawlEvidence             googleSheets               [creds] [retry]
// UpdateControlExecDone              googleSheets               [creds] [alwaysOutput] [retry]
// StickyNote                         stickyNote
// StickyNote1                        stickyNote
// UpdateControlExecScraperDone       googleSheets               [creds] [alwaysOutput] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Phase1Trigger
//    → ReadUrlChecks
//      → NormalizeInput
//        → GateHasUrl
//          → UpdateControlExecStage2
//          → LoopOverCompanies
//            → WaitBeforePhase1Write
//              → WriteToControlEvidence
//                → DeduplicateCompanies
//                  → CheckMissingFields
//                    → UpdateControlExecScraperDone
//                   .out(1) → LoopFirecrawl
//                     .out(1) → PrepCrawl
//                        → FirecrawlStartCrawl
//                          → ExtractCrawlId
//                            → CheckCrawlStarted
//                              → WaitCrawlStart
//                                → PrepPoll
//                                  → PollCrawlStatus
//                                    → CheckCrawlDone
//                                      → MergeCrawlData
//                                        → ParseFirecrawlResults
//                                          → WaitBeforePhase2Write
//                                            → WriteFirecrawlEvidence
//                                              → UpdateControlExecDone
//                                                → LoopFirecrawl (↩ loop)
//                                     .out(1) → WaitPollRetry
//                                        → PrepPoll (↩ loop)
//                             .out(1) → CrawlFailedFallback
//                                → ParseFirecrawlResults (↩ loop)
//           .out(1) → WaitBeforeSerpapi
//              → SearchSerpapi
//                → ParseSerpapiResults
//                  → FetchHomepage
//                    → BuildCandidateUrls
//                      → FetchCandidate
//                        → AggregateAndCompare
//                          → LoopOverCompanies (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'DmaKVjkSXjdqbOnl',
    name: 'Trustscan Company Contacts  Stage 2 - MA',
    active: false,
    tags: ['Company Contacts'],
    settings: { executionOrder: 'v1', availableInMCP: false, binaryMode: 'separate' },
})
export class TrustscanCompanyContactsStage2MaWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '2f40b53a-6854-4c0d-8324-a4583bc52008',
        name: 'Phase 1 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-944, -160],
    })
    Phase1Trigger = {};

    @node({
        id: '26001e7d-417e-466a-9c7d-9fd407c20974',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-704, -160],
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
        id: '49d7ff39-9c55-49ca-ad09-85e9103f63f4',
        name: 'Normalize Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-480, -160],
    })
    NormalizeInput = {
        mode: 'runOnceForEachItem',
        jsCode: `// Accepts both sheet columns (Run_ID / Entity_key / Final_url) and seed columns (RUN_ID / EntityKey / Final_URL)
// Skip rows whose discovery flow already confirmed the URL doesn't respond —
// scraping them is guaranteed to waste SerpAPI/Firecrawl budget.
const respClass = String($json['Response_class'] || '').trim().toUpperCase();
const SKIP_CLASSES = new Set(['URL_FOUND_NOT_RESPONDING']);

const rawUrl = String($json['Final_url'] || $json['Final_URL'] || '').trim();
let url = rawUrl;
if (url && !url.startsWith('http')) url = 'https://' + url;
url = url.replace(/\\/+$/, '');
if (SKIP_CLASSES.has(respClass)) url = '';   // Gate Has URL will drop this item
return {
  json: {
    RUN_ID:      String($json['Run_ID']    || $json['RUN_ID']    || '').trim(),
    EntityKey:   String($json['Entity_key'] || $json['EntityKey'] || '').trim(),
    Website_URL: url,
    Response_class_in: respClass,
  },
};
`,
    };

    @node({
        id: 'ma-gate-has-url',
        name: 'Gate Has URL',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-256, -160],
    })
    GateHasUrl = {
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
                    leftValue: '={{ $json.Website_URL }}',
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
        id: 'ma-update-ctrl-exec-stage2',
        name: 'Update Control Exec Stage 2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-64, -352],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecStage2 = {
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
                Current_phase: 'STAGE 2',
                Process_Status: 'IN_PROGRESS',
                Next_action: 'STAGE 3',
                Queued_action: 'SERPAPI',
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
        id: '570560b5-c8f3-4c65-82ce-82170786795c',
        name: 'Loop Over Companies',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [288, -32],
    })
    LoopOverCompanies = {
        options: {},
    };

    @node({
        id: 'wait-before-serpapi',
        webhookId: 'wait-before-serpapi-wh',
        name: 'Wait Before SerpAPI',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [544, -32],
    })
    WaitBeforeSerpapi = {
        amount: 2,
    };

    @node({
        id: '392f5d34-782d-4523-a166-8594bf0d2950',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [688, -32],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
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
                    value: `={{
  $json.Website_URL
    ? 'site:' + $json.Website_URL.replace(/^https?:\\/\\//i,'').replace(/^www\\./,'').replace(/\\/+$/,'')
    : $json.EntityKey + ' contacto email telefone'
}}`,
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
        id: 'ca0cea4f-9c5e-4cdf-9a12-872a871b085a',
        name: 'Parse SerpAPI Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [960, -32],
    })
    ParseSerpapiResults = {
        jsCode: `// Extracts contacts from SerpAPI site: query results (own-domain only).
const trig = $('Loop Over Companies').item.json;

const EMAIL_JUNK  = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const PREF_PREFIX = /^(geral|info|contacto|contactos|contact|hello|ola|support|suporte|comercial|apoio|atendimento|reservas|marketing|imprensa|press|rgpd)@/i;
const phoneRegex  = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
// Email: must start with a real local-part (no leading dots), strip Google's "...@domain" truncation
const emailRegex  = /[a-zA-Z0-9\\u00C0-\\u017E][a-zA-Z0-9._%+\\-\\u00C0-\\u017E]{2,}@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
// Address: street keyword + rest of line (trimmed after city)
const addrRegex   = /(?:Rua|R\\.|Avenida|Av\\.|Avda\\.|Pra[çc]a|Largo|Estrada|Travessa|Cal[çc]ada|Alameda|Beco|Calle|C\\/|Carrer|Passeig|Paseo|Plaza|Pl\\.|Edificio|Edif\\.|Pol\\.?\\s*Ind\\.|Pol[íi]gono|Urb\\.)\\s{0,2}[^\\n]{5,120}/g;

function trimAddress(raw) {
  var t = String(raw || "").replace(/\\s+/g, ' ').trim();

  // Step 1: hard separators — cut immediately ("; Telemóvel:", "– Bernardo", "| Contact")
  var hm = /\\s*[;|–—]\\s*/.exec(t);
  if (hm && hm.index > 8) t = t.slice(0, hm.index);

  // Step 2: cut at explicit contact/noise keywords preceded by space or dot
  // Real examples: ". Actividade", " Contact Us", " CONTATO", " Pagamentos", " NIF", " River View"
  var nm = /[\\s.]+(Telefone|Telemóvel|Telemovel|Tel\\b|Telf\\b|Tlf\\b|Fax\\b|Email\\b|NIF\\b|CONTATO|Contato|Contact|Actividade|Pagamentos|Vendas|River\\b|View\\b|Office\\b|Robert\\b|Código\\b|Codigo\\b|COMÉRCIO|COMERCIO|www\\.)/i.exec(t);
  if (nm && nm.index > 8) t = t.slice(0, nm.index);

  // Step 3: anchor to postal code — PT (DDDD-DDD) or ES (5 digits standalone).
  // MANDATORY: if no postal code is present the snippet address is partial
  // (e.g. "Rua Entre Vinhas ·" from a truncated Google snippet) — reject it and
  // let the HTML scraper (whose trimAddr already enforces this rule) extract the
  // authoritative full address. Mirrors §4.4's postal-code-required precision gate.
  var pm = /(\\d{4}-\\d{3})/.exec(t) || /(?<![\\d-])(\\d{5})(?![\\d-])/.exec(t);
  if (!pm) return '';
  var after = t.slice(pm.index + pm[0].length);
  var cityTail = after.match(/^[^.;|–—·]{0,30}/);
  t = t.slice(0, pm.index + pm[0].length) + (cityTail ? cityTail[0] : '');

  // Step 4: final cap and strip trailing punctuation/spaces (including middle dot)
  return t.slice(0, 120).replace(/[\\s,\\.\\-·]+$/, '').trim();
}

function extractFromText(text) {
  const emails = new Set(), phones = new Set(), t = String(text || '');
  for (const m of t.matchAll(new RegExp(emailRegex.source, 'g'))) {
    const e = m[0].toLowerCase();
    if (e.startsWith('...') || EMAIL_JUNK.test(e)) continue;
    emails.add(e);
  }
  let pm; const pr2 = new RegExp(phoneRegex.source, 'g');
  while ((pm = pr2.exec(t)) !== null) {
    const cleaned = pm[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits  = cleaned.replace(/[\\+]/g, '');
    if (digits.length === 9 || digits.length === 11 || digits.length === 12 || digits.length === 13) { const stored = cleaned.startsWith('+') ? '00' + cleaned.slice(1) : cleaned; phones.add(stored); }
  }
  const addrs = new Set();
  const ar2 = new RegExp(addrRegex.source, 'g');
  let am;
  while ((am = ar2.exec(t)) !== null) { const a = trimAddress(am[0].replace(/\\s+/g,' ')); if (a.length > 8) addrs.add(a); }
  return { emails: [...emails], phones: [...phones], addrs: [...addrs] };
}

function rankEmail(emails, domain) {
  if (!emails.length) return '';
  const d = String(domain || '').toLowerCase().replace(/^www\\./, '');
  const same = emails.filter(e => d && e.endsWith('@' + d));
  const samePref = same.filter(e => PREF_PREFIX.test(e));
  if (samePref.length) return samePref[0];
  if (same.length)     return same[0];
  const anyPref = emails.filter(e => PREF_PREFIX.test(e));
  if (anyPref.length)  return anyPref[0];
  return emails[0];
}

// Merges results from both SerpAPI calls.
const call1Item = $input.first();
const body1 = call1Item?.json?.body || call1Item?.json || {};

const organic1 = Array.isArray(body1.organic_results) ? body1.organic_results : [];

// Knowledge graph: prefer call1 (site: query), fall back to call2 (branded)
const kg = body1.knowledge_graph || {};

// homeDomain from trigger
const rawSite = trig.Website_URL || '';
const homeDomain = rawSite.replace(/^https?:\\/\\//i, '').replace(/\\/.*$/, '').replace(/^www\\./, '');

const kgEmail   = kg.email    ? kg.email.toLowerCase().trim()              : '';
const kgPhone   = kg.phone    ? kg.phone.replace(/[\\s.\\-()]/g, '').trim() : '';
const kgAddress = kg.address  || kg.headquarters || '';
const kgWebsite = kg.website  || '';

// Track value → { url, sourceType } — all organic1 results are own-domain by definition
const emailSourceMap = new Map();
const phoneSourceMap = new Map();
const addrSourceMap  = new Map();
const allEmails = [], allPhones = [], allAddrs = [];

for (const r of organic1) {
  const link = String(r.link || '');
  const { emails, phones, addrs } = extractFromText((r.snippet || '') + ' ' + (r.title || ''));
  for (const e of emails) { allEmails.push(e); if (!emailSourceMap.has(e)) emailSourceMap.set(e, { url: link, sourceType: 'serpapi' }); }
  for (const p of phones) { allPhones.push(p); if (!phoneSourceMap.has(p)) phoneSourceMap.set(p, { url: link, sourceType: 'serpapi' }); }
  for (const a of addrs)  { allAddrs.push(a);  if (!addrSourceMap.has(a))  addrSourceMap.set(a,  { url: link, sourceType: 'serpapi' }); }
}

const bestEmail   = kgEmail   || rankEmail(allEmails, homeDomain);
const bestPhone   = kgPhone   || phoneSourceMap.keys().next().value || allPhones[0] || '';
const bestAddress = kgAddress || addrSourceMap.keys().next().value  || allAddrs[0]  || '';
const websiteUrlClean = String(trig.Website_URL || '').trim();

const serpContactMap = {};
if (bestEmail   && emailSourceMap.has(bestEmail))   serpContactMap[bestEmail]   = emailSourceMap.get(bestEmail);
if (bestPhone   && phoneSourceMap.has(bestPhone))   serpContactMap[bestPhone]   = phoneSourceMap.get(bestPhone);
if (bestAddress && addrSourceMap.has(bestAddress))  serpContactMap[bestAddress] = addrSourceMap.get(bestAddress);

// SerpAPI_ContactUrls: own-domain subpage URLs likely to contain contact info
const CONTACT_URL_RE = /contact|contacto|contactos|contato|contatos|apoio|suporte|fale|atendimento|sobre|about|legal|pag=|page=/i;
const serpContactUrls = [...new Map(
  organic1
    .filter(r => homeDomain && r.link && String(r.link).toLowerCase().includes(homeDomain) && CONTACT_URL_RE.test(r.link))
    .map(r => [r.link, r.link])
).values()].slice(0, 5);

return [{
  json: {
    RUN_ID:               String(trig.RUN_ID      || '').trim(),
    EntityKey:            String(trig.EntityKey   || '').trim(),
    Website_URL:          websiteUrlClean,
    SerpAPI_Email:        bestEmail,
    SerpAPI_Email_Url:    (emailSourceMap.get(bestEmail) || {}).url || websiteUrlClean,
    SerpAPI_Phone:        bestPhone,
    SerpAPI_Phone_Url:    (phoneSourceMap.get(bestPhone) || {}).url || websiteUrlClean,
    SerpAPI_Address:      bestAddress,
    SerpAPI_Address_Url:  (addrSourceMap.get(bestAddress) || {}).url || websiteUrlClean,
    SerpAPI_Website:      kgWebsite,
    SerpAPI_ContactUrls:  serpContactUrls,
    SerpAPI_ContactMap:   serpContactMap,
    SerpAPI_OrganicCount: organic1.length,
  },
}];
`,
    };

    @node({
        id: 'a20f2863-7022-4b17-a503-740527a743ed',
        name: 'Fetch Homepage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1424, -32],
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 1500,
    })
    FetchHomepage = {
        url: '={{ $json.Website_URL || "https://invalid.invalid" }}',
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
                {
                    name: 'Upgrade-Insecure-Requests',
                    value: '1',
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
        id: 'cd60fa77-1872-4657-8548-e57e972592d3',
        name: 'Build Candidate URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1616, -32],
    })
    BuildCandidateUrls = {
        jsCode: `// Fan-out: homepage response → homepage item + ranked contact subpage items.
// HTTP Request overwrites $json so identity comes from Parse SerpAPI Results.
const fetched  = $input.all()[0];
if (!fetched) return [];
const j        = fetched.json;
const serpData = $('Parse SerpAPI Results').item.json;

const excel = {
  RUN_ID:      String(serpData.RUN_ID      || '').trim(),
  EntityKey:   String(serpData.EntityKey   || '').trim(),
  Website_URL: String(serpData.Website_URL || '').trim(),
};
const serpApiData = {
  SerpAPI_Email:        serpData.SerpAPI_Email        || '',
  SerpAPI_Phone:        serpData.SerpAPI_Phone        || '',
  SerpAPI_Address:      serpData.SerpAPI_Address      || '',
  SerpAPI_Website:      serpData.SerpAPI_Website      || '',
  SerpAPI_ContactUrls:  serpData.SerpAPI_ContactUrls  || [],
  SerpAPI_OrganicCount: serpData.SerpAPI_OrganicCount || 0,
};

const emit = (url, kind, homeHtml, errorStatus, errorMessage) => ({
  json: { Company_Key: excel.EntityKey + '|' + excel.Website_URL, RUN_ID: excel.RUN_ID, EntityKey: excel.EntityKey, Website_URL: excel.Website_URL, ...serpApiData, Candidate_URL: url, Candidate_Kind: kind, Homepage_HTML: homeHtml || '', Error_Status: errorStatus || '', Error_Message: errorMessage || '' },
});

if (!excel.Website_URL) return [emit('', 'none', '', 'No_URL', 'Row has empty URL')];

const rawError = j.error, httpStatus = Number(j.statusCode || 0);
if (rawError || httpStatus >= 400) {
  let errMsg = typeof rawError === 'string' ? rawError : (rawError?.message || j.message || (httpStatus ? 'HTTP ' + httpStatus : JSON.stringify(j).substring(0, 200)));
  const s = (errMsg + (rawError?.code || '')).toLowerCase();
  const status = s.includes('timeout') || s.includes('etimedout') ? 'Timeout'
    : s.includes('enotfound') || s.includes('getaddrinfo') ? 'DNS_Not_Found'
    : s.includes('econnrefused') || s.includes('econnreset') ? 'Connection_Refused'
    : s.includes('certificate') || s.includes('ssl') ? 'SSL_Error'
    : httpStatus >= 400 ? 'HTTP_' + httpStatus : 'Error';
  return [emit('', 'none', '', status, errMsg)];
}

const rawHomepage = String(j.data || j.body || '');
const decodeEntities = (s) => String(s || '').replace(/&#(\\d+);/g, (_, d) => String.fromCharCode(Number(d))).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const CONTACT_KEYWORDS = /contact|contato|contacto|contact-us|kontakt|reach-us|get-in-touch|sobre|quem-somos|quien-somos|nosotros|about|about-us|who-we-are|our-team|company|empresa|equipa|equipo|team|legal|impressum|imprint|aviso-legal|termos|privacy|apoio|suporte|support|atendimento|fale/i;

let homeOrigin = '';
try { homeOrigin = new URL(excel.Website_URL).origin; } catch (_) { homeOrigin = excel.Website_URL.replace(/\\/+$/, ''); }

const foundHrefs = new Set(serpApiData.SerpAPI_ContactUrls);
const re = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([^<]{0,140})<\\/a>/gi;
let m, count = 0;
while ((m = re.exec(rawHomepage)) !== null && count++ < 500) {
  const href = (m[1] || '').trim(), text = decodeEntities(m[2] || '').trim().toLowerCase();
  if (!href || /^(mailto:|tel:|javascript:)/.test(href)) continue;
  if (!CONTACT_KEYWORDS.test(href + ' ' + text)) continue;
  let abs; try { abs = new URL(href, excel.Website_URL).toString(); } catch (_) { continue; }
  if (new URL(abs).hostname.replace(/^www\\./, '') !== new URL(excel.Website_URL).hostname.replace(/^www\\./, '')) continue;
  foundHrefs.add(abs.split('#')[0]);
}

const score = (u) => { const s = u.toLowerCase(); return /(contactos|contacto|contatos|contato|contact-us|contact\\/|contacts\\/|kontakt|get-in-touch|reach-us)/.test(s) ? 100 : /contact/.test(s) ? 40 : /(quem-somos|quien-somos|nosotros|about-us|who-we-are|sobre|empresa)/.test(s) ? 25 : /(equipa|equipo|our-team|team)/.test(s) ? 20 : /(legal|termos|impressum|imprint|privacy)/.test(s) ? 10 : 0; };
const homepageKey = excel.Website_URL.replace(/\\/+$/, '');
const subpages = [...new Set([...[...foundHrefs].filter(u => u.replace(/\\/+$/, '') !== homepageKey).sort((a,b) => score(b)-score(a)).slice(0,4), ...['/contactos','/contacto','/contatos','/contato','/contact','/contact-us','/get-in-touch','/reach-us','/sobre-nos','/about','/about-us','/quien-somos','/nosotros','/quem-somos'].map(p => homeOrigin + p)])].filter(u => u.replace(/\\/+$/, '') !== homepageKey).slice(0, 8);

return [emit(excel.Website_URL, 'homepage', rawHomepage, '', ''), ...subpages.map(u => emit(u, 'subpage', '', '', ''))];
`,
    };

    @node({
        id: 'a90ed98f-5079-460b-930c-7000d7eebda0',
        name: 'Fetch Candidate',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1792, -32],
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 2000,
    })
    FetchCandidate = {
        url: '={{ $json.Candidate_URL || "https://invalid.invalid" }}',
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
                {
                    name: 'Upgrade-Insecure-Requests',
                    value: '1',
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
            timeout: 20000,
        },
    };

    @node({
        id: 'd6f8eaae-ea5e-46db-aa01-db5bb0b45d79',
        name: 'Aggregate And Compare',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1936, 128],
    })
    AggregateAndCompare = {
        jsCode: `// Collects all fetched HTML pages for one company and emits one row per contact item.
// source_type: 'scrape' for contacts found in HTML, 'serpapi' for contacts from SerpAPI only.
const fetched  = $input.all();
const meta     = $('Build Candidate URLs').all();
const serpData = $('Parse SerpAPI Results').item.json;
const trig     = $('Loop Over Companies').item.json;

const runId      = String(serpData.RUN_ID      || trig.RUN_ID      || '').trim();
const entityKey  = String(serpData.EntityKey   || trig.EntityKey   || '').trim();
const websiteUrl = String(serpData.Website_URL || trig.Website_URL || '').trim();

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;

const stripNoise      = (h) => h
  .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<noscript[^>]*>[\\s\\S]*?<\\/noscript>/gi, ' ')
  .replace(/<!--[\\s\\S]*?-->/g, ' ')
  // Remove structural/non-content elements that contain noise numbers (nav, footer, sidebar, SVG, hidden)
  .replace(/<nav[^>]*>[\\s\\S]*?<\\/nav>/gi, ' ')
  .replace(/<header[^>]*>[\\s\\S]*?<\\/header>/gi, ' ')
  .replace(/<footer[^>]*>[\\s\\S]*?<\\/footer>/gi, ' ')
  .replace(/<aside[^>]*>[\\s\\S]*?<\\/aside>/gi, ' ')
  .replace(/<svg[^>]*>[\\s\\S]*?<\\/svg>/gi, ' ')
  .replace(/<[^>]+(?:hidden|aria-hidden=["']true["']|display:\\s*none)[^>]*>[\\s\\S]*?<\\/[^>]+>/gi, ' ')
  // Strip all remaining tags, collapse whitespace
  .replace(/<[^>]+>/g, ' ')
  .replace(/\\s{2,}/g, ' ');
const decodeEntities  = (s) => String(s||'').replace(/&#(\\d+);/g,(_,d)=>String.fromCharCode(Number(d))).replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCharCode(parseInt(h,16))).replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
const deobfuscate     = (s) => String(s||'').replace(/\\s*\\[\\s*at\\s*\\]\\s*/gi,'@').replace(/\\s*\\(\\s*at\\s*\\)\\s*/gi,'@').replace(/\\s+at\\s+/gi,'@').replace(/\\s*\\[dot\\]\\s*/gi,'.').replace(/\\s*\\(dot\\)\\s*/gi,'.').replace(/\\s+dot\\s+/gi,'.');

const extractEmails = (html) => {
  const found = new Set();
  [...html.matchAll(/href\\s*=\\s*["']mailto:([^"'?#]+)/gi)].forEach(m => { if (!EMAIL_JUNK.test(m[1])) found.add(m[1].toLowerCase().trim()); });
  (deobfuscate(decodeEntities(html)).match(/[a-zA-Z0-9\\u00C0-\\u017E][a-zA-Z0-9._%+\\-\\u00C0-\\u017E]{2,}@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g)||[]).forEach(e => { const el = e.toLowerCase().trim(); if (!el.startsWith('...') && !EMAIL_JUNK.test(el)) found.add(el); });
  return [...found];
};
const extractPhones = (html) => {
  const found = new Set();
  [...html.matchAll(/href\\s*=\\s*["']tel:([^"']+)/gi)].forEach(m => found.add(m[1].replace(/[\\s.\\-()]/g,'').trim()));
  // Strict prefix validation to avoid matching serial numbers, zip codes, etc.
  // PT landline: 2xx (valid area codes), PT mobile: 91/92/93/96, PT toll-free: 800/808
  // ES landline: 8xx/9xx, ES mobile: 6xx/7xx — always require country code for ES
  const pr = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
  let m;
  while ((m = pr.exec(html)) !== null) {
    const c = m[1].replace(/[\\s.\\-()]/g,'').trim();
    const d = c.replace(/[\\+]/g,'');
    if (d.length===9||d.length===11||d.length===12) {
      if (d === entityKey) continue;
      const stored = c.startsWith('+') ? '00' + c.slice(1) : c; found.add(stored);
    }
  }
  return [...found];
};
const extractFromJsonLd = (rawHtml) => {
  const result = { emails: [], phones: [] };
  for (const b of [...rawHtml.matchAll(/<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1])) {
    let obj; try { obj = JSON.parse(b.trim()); } catch (_) { continue; }
    for (const n of (Array.isArray(obj)?obj:[obj])) {
      for (const c of [n,...(Array.isArray(n?.['@graph'])?n['@graph']:[])]) {
        if (!c||typeof c!=='object') continue;
        if (typeof c.email==='string')     result.emails.push(c.email.replace(/^mailto:/i,'').toLowerCase().trim());
        if (typeof c.telephone==='string') result.phones.push(c.telephone.replace(/[\\s.\\-()]/g,'').trim());
      }
    }
  }
  return result;
};

const trimAddr = (raw) => {
  var t = String(raw || '').replace(/[\\t\\r\\n]+/g, ' ').replace(/  +/g, ' ').trim();
  t = t.replace(/&#[0-9]+;/g, '').replace(/&[a-z]+;/g, ' ').trim();
  var nm = /[\\s.]+(Telefone|Telef|Telemovel|Telemóvel|Tel[\\s:.]|Telf[\\s:.]|Fax[\\s:.]|Email[\\s:@]|NIF|CONTATO|Contato|Contact|www\\.)/i.exec(t);
  if (nm && nm.index > 8) t = t.slice(0, nm.index);
  var pm = /(\\d{4}-\\d{3})/.exec(t) || /(?<![\\d-])(\\d{5})(?![\\d-])/.exec(t);
  if (!pm) return '';
  var after = t.slice(pm.index + pm[0].length);
  var ct = after.match(/^[^.;|\\u2013\\u2014]{0,30}/);
  t = t.slice(0, pm.index + pm[0].length) + (ct ? ct[0] : '');
  return t.slice(0, 120).replace(/[\\s,\\.\\-]+$/, '').trim();
};
const extractAddresses = (text) => {
  const clean = String(text || '').replace(/[\\t\\r\\n]+/g, ' ').replace(/  +/g, ' ');
  const found = new Set();
  const streetRe = /(?:Rua|R\\.\\s|Avenida|Av\\.\\s|Avda\\.\\s|Pra[\\u00e7c]a|Largo\\s|Estrada|Travessa|Cal[\\u00e7c]ada|Alameda|Beco\\s|Calle\\s|Carrer\\s|Passeig|Paseo|Plaza\\s|Edif[\\u00ed]cio|Edif\\.\\s|Pol\\.?\\s*Ind\\.)[\\s\\S]{5,160}/g;
  let am;
  while ((am = streetRe.exec(clean)) !== null) {
    const a = trimAddr(am[0]);
    if (a && a.length > 10) found.add(a);
  }
  return [...found];
};

let homepage_html = '';
const scrapeEmailMap = new Map();
const scrapePhoneMap = new Map();
const scrapeAddrMap  = new Map();

// Collect subpages and homepage separately — subpages processed first for priority
const subpageItems = []; // { url, idx }
let homepageIdx = -1;
for (let i = 0; i < meta.length; i++) {
  const mm = meta[i].json;
  if (mm.Candidate_Kind === 'homepage') {
    homepage_html = String(mm.Homepage_HTML || '');
    homepageIdx = i;
  } else if (mm.Candidate_Kind === 'subpage') {
    subpageItems.push({ url: String(mm.Candidate_URL || websiteUrl), idx: i });
  }
}

// Process each page immediately and discard HTML — subpages first, then homepage
const processPage = (html, srcUrl) => {
  if (!html) return;
  const jl = extractFromJsonLd(html);
  for (const e of jl.emails) { if (!scrapeEmailMap.has(e)) scrapeEmailMap.set(e, srcUrl); }
  for (const p of jl.phones) { if (!scrapePhoneMap.has(p)) scrapePhoneMap.set(p, srcUrl); }
  const clean = stripNoise(html);
  for (const e of extractEmails(clean))    { if (!EMAIL_JUNK.test(e) && !scrapeEmailMap.has(e)) scrapeEmailMap.set(e, srcUrl); }
  for (const p of extractPhones(clean))    { if (!scrapePhoneMap.has(p)) scrapePhoneMap.set(p, srcUrl); }
  for (const a of extractAddresses(clean)) { if (!scrapeAddrMap.has(a))  scrapeAddrMap.set(a,  srcUrl); }
};

// Subpages first (contact pages more reliable — win over homepage if same value)
for (const sp of subpageItems) {
  const f = fetched[sp.idx]?.json || {};
  if (!f.error && !(Number(f.statusCode||0)>=400)) {
    const body = String(f.data||f.body||'');
    processPage(body, sp.url);
  }
}
// Homepage last (lower priority)
processPage(homepage_html, ''); // empty srcUrl = homepage = leave SerpAPI_ContactUrls blank

const scrapeEmails    = [...scrapeEmailMap.keys()];
const scrapePhones    = [...scrapePhoneMap.keys()];
const scrapeAddresses = [...scrapeAddrMap.keys()];

const serpEmail      = serpData.SerpAPI_Email      || '';
const serpPhone      = serpData.SerpAPI_Phone      || '';
const serpAddress    = serpData.SerpAPI_Address    || '';
const serpWebsite    = serpData.SerpAPI_Website    || '';

// SerpAPI takes priority: if SerpAPI found it, label serpapi and use its source URL
const serpEmailSet = new Set(serpEmail ? [serpEmail.toLowerCase()] : []);
const serpPhoneSet = new Set(serpPhone ? [serpPhone]               : []);

const allEmails    = [...new Set([...(serpEmail   ? [serpEmail]   : []), ...scrapeEmails])];
const allPhones    = [...new Set([...(serpPhone   ? [serpPhone]   : []), ...scrapePhones])];
const allAddresses = [...new Set([...(serpAddress ? [serpAddress] : []), ...scrapeAddresses])];

const scrapeStatus = !websiteUrl ? 'No_URL' : (meta.length===1 && meta[0].json.Error_Status) ? meta[0].json.Error_Status : 'Done';
const now  = $now.setZone("Europe/Lisbon").toISO();
const base = { Run_ID: runId, Entity_key: entityKey, Extracted_at: now };

const serpContactUrls = Array.isArray(serpData.SerpAPI_ContactUrls) ? serpData.SerpAPI_ContactUrls : [];
const Has_Email   = allEmails.length > 0;
const Has_Phone   = allPhones.length > 0;
const Has_Address = allAddresses.length > 0;
// SerpAPI_ContactMap: value → { url, sourceType }
const serpContactMap = typeof serpData.SerpAPI_ContactMap === 'object' && serpData.SerpAPI_ContactMap !== null
  ? serpData.SerpAPI_ContactMap : {};

const rows = [];
const getSerpType = (v) => { const e = serpContactMap[v] || serpContactMap[(v||'').toLowerCase()]; return e && typeof e === 'object' ? e.sourceType : (e ? 'serpapi' : null); };
const getSerpUrl  = (v) => { const e = serpContactMap[v] || serpContactMap[(v||'').toLowerCase()]; return e && typeof e === 'object' ? e.url : (typeof e === 'string' ? e : ''); };
// For scrape values: use per-page source map; empty string means found on homepage
const getScrapeUrl = (v, map) => map.get(v) || map.get((v||'').toLowerCase()) || '';
for (const v of allEmails)    rows.push({ json: { ...base, 'Field (phone | email | address)': 'email',   Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': serpEmailSet.has(v.toLowerCase()) ? (getSerpType(v) || 'serpapi') : 'scrape', SerpAPI_ContactUrls: serpEmailSet.has(v.toLowerCase()) ? getSerpUrl(v) : getScrapeUrl(v, scrapeEmailMap) } });
for (const v of allPhones)    rows.push({ json: { ...base, 'Field (phone | email | address)': 'phone',   Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': serpPhoneSet.has(v)                ? (getSerpType(v) || 'serpapi') : 'scrape', SerpAPI_ContactUrls: serpPhoneSet.has(v)                ? getSerpUrl(v) : getScrapeUrl(v, scrapePhoneMap) } });
const serpAddrSet = new Set(serpAddress ? [serpAddress] : []);
for (const v of allAddresses) rows.push({ json: { ...base, 'Field (phone | email | address)': 'address', Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': serpAddrSet.has(v)                ? (getSerpType(v) || 'serpapi') : 'scrape', SerpAPI_ContactUrls: serpAddrSet.has(v)                ? getSerpUrl(v) : getScrapeUrl(v, scrapeAddrMap) } });
if (rows.length === 0) rows.push({ json: { ...base, 'Field (phone | email | address)': '', Value: '', Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': '', SerpAPI_ContactUrls: '' } });
return rows;
`,
    };

    @node({
        id: '0a784f67-7610-4171-bd4a-67d556995d55',
        name: 'Write To Control Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [688, -464],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    WriteToControlEvidence = {
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
                Confidence: '',
                Hint_url: '={{ $json.SerpAPI_ContactUrls }}',
                Extracted_at: '={{ $json.Extracted_at }}',
                SerpAPI_ContactUrls: '={{ $json.SerpAPI_ContactUrls }}',
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Field (phone | email | address)',
                    displayName: 'Field (phone | email | address)',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Value',
                    displayName: 'Value',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Source_url',
                    displayName: 'Source_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Source_type  (input | serpapi | scrape | openai)',
                    displayName: 'Source_type  (input | serpapi | scrape | openai)',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Confidence',
                    displayName: 'Confidence',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Hint_url',
                    displayName: 'Hint_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Extracted_at',
                    displayName: 'Extracted_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'SerpAPI_ContactUrls',
                    displayName: 'SerpAPI_ContactUrls',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'wait-before-phase1-write',
        webhookId: '70aa5841-38f1-4394-8a7b-288f0d2c66b4',
        name: 'Wait Before Phase 1 Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [464, -464],
    })
    WaitBeforePhase1Write = {
        amount: 2,
    };

    @node({
        id: 'fc-deduplicate-companies',
        name: 'Deduplicate Companies',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [912, -464],
    })
    DeduplicateCompanies = {
        jsCode: `// Receives rows from WriteToControlEvidence (Phase 1) or ReadUrlChecks (Phase 2).
// Deduplicate by Website_URL. Infer Has_Email/Phone/Address from Field value.
const seen = new Map(); // url → index in unique[]
const unique = [];
for (const item of $input.all()) {
  // Support Source_url (Phase 1 rows), Website_URL, and Final_url/Final_URL (Phase 2 raw rows)
  let rawUrl = String(item.json.Source_url || item.json.Website_URL || item.json['Final_url'] || item.json['Final_URL'] || '').trim();
  if (rawUrl && !rawUrl.startsWith('http')) rawUrl = 'https://' + rawUrl;
  const url = rawUrl.replace(/\\/+$/, '');
  if (!url) continue;
  const field = String(item.json['Field (phone | email | address)'] || '').trim();
  const serpUrls = [];
  const serpMap = (item.json.SerpAPI_ContactMap && typeof item.json.SerpAPI_ContactMap === 'object') ? item.json.SerpAPI_ContactMap : {};
  if (!seen.has(url)) {
    seen.set(url, unique.length);
    unique.push({
      json: {
        RUN_ID:              String(item.json.Run_ID    || item.json.RUN_ID    || item.json['Run_ID']    || '').trim(),
        EntityKey:           String(item.json.Entity_key || item.json.EntityKey || item.json['Entity_key'] || '').trim(),
        Website_URL:         url,
        SerpAPI_ContactUrls: serpUrls,
        SerpAPI_ContactMap:  serpMap,
        Has_Email:           field === 'email',
        Has_Phone:           field === 'phone',
        Has_Address:         field === 'address',
      },
    });
  } else {
    const entry = unique[seen.get(url)].json;
    if (field === 'email')   entry.Has_Email   = true;
    if (field === 'phone')   entry.Has_Phone   = true;
    if (field === 'address') entry.Has_Address = true;
    Object.assign(entry.SerpAPI_ContactMap, serpMap);
  }
}
for (const entry of unique) {
  const missing = [];
  if (!entry.json.Has_Email)   missing.push('email');
  if (!entry.json.Has_Phone)   missing.push('phone');
  if (!entry.json.Has_Address) missing.push('address');
  entry.json.Missing_Fields = missing;
}
return unique;
`,
    };

    @node({
        id: 'fc-loop-firecrawl',
        name: 'Loop Firecrawl',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [1360, -464],
    })
    LoopFirecrawl = {
        options: {},
    };

    @node({
        id: 'fc-check-missing-fields',
        name: 'Check Missing Fields',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1136, -464],
    })
    CheckMissingFields = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 1,
            },
            conditions: [
                {
                    id: 'missing-fields-nonempty',
                    leftValue: '={{ $json.Missing_Fields.length }}',
                    rightValue: 0,
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'fc-prep-crawl',
        name: 'Prep Crawl',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1808, -560],
    })
    PrepCrawl = {
        jsCode: `let item;
try { item = $('Loop Firecrawl').item.json; } catch(_) { item = $input.first().json; }
const baseInclude = [
  // pt-pt locale + contact/about page — highest priority
  ".*/pt-pt/.*(contact|contac|about|sobre|empresa|apoio|suporte|fale|atendimento|legal|privacy|quem|equipa).*",
  ".*/pt/.*(contact|contac|about|sobre|empresa|apoio|suporte|fale|atendimento|legal|privacy|quem|equipa).*",
  // es locale + contact/about — second priority (Spain in scope)
  ".*/es/.*(contact|contac|about|sobre|empresa|apoio|suporte|fale|atendimento|legal|privacy|quem|equipa|nosotros|quien).*",
  // plain contact/about pages (no locale prefix)
  ".*contact.*",".*contac.*",".*contact-us.*",".*about.*",".*about-us.*",".*sobre.*",".*empresa.*",".*quem.somos.*",".*quien.somos.*",".*nosotros.*",".*equipa.*",".*equipo.*",".*team.*",".*our-team.*",".*who-we-are.*",".*get-in-touch.*",".*reach-us.*",".*apoio.*",".*suporte.*",".*support.*",".*atendimento.*",".*fale.*",".*legal.*",".*impressum.*",".*imprint.*",".*privacy.*"
];
const excludePaths = [".*/en/.*",".*/en-.*",".*/fr/.*",".*/fr-.*",".*/de/.*",".*/de-.*",".*/it/.*",".*/it-.*",".*/nl/.*",".*/nl-.*",".*/ru/.*",".*/zh/.*",".*/ja/.*",".*/ko/.*",".*/pl/.*",".*/cs/.*",".*/hu/.*",".*/ro/.*"];
const serpUrls = Array.isArray(item.SerpAPI_ContactUrls) ? item.SerpAPI_ContactUrls : [];
// Pure string path extraction — new URL() silently returns empty hostname in n8n sandbox
const serpPaths = serpUrls.flatMap(function(u) {
  var p = String(u || "").replace(/^https?:\\/\\/[^\\/]*/i, "").replace(/[?#].*$/, "").replace(/^\\//, "").replace(/\\/$/, "");
  return p ? [".*" + p + ".*"] : [];
});
const includePaths = baseInclude.concat(serpPaths.filter(function(x) { return baseInclude.indexOf(x) === -1; }));
const missingFields = Array.isArray(item.Missing_Fields) ? item.Missing_Fields : [];
return [{ json: { RUN_ID: String(item.RUN_ID || "").trim(), EntityKey: String(item.EntityKey || "").trim(), Website_URL: String(item.Website_URL || "").trim(), SerpAPI_ContactUrls: serpUrls, includePaths: includePaths, excludePaths: excludePaths, Missing_Fields: missingFields } }];`,
    };

    @node({
        id: 'fc-firecrawl-start-crawl',
        name: 'Firecrawl Start Crawl',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [2032, -560],
        onError: 'continueRegularOutput',
    })
    FirecrawlStartCrawl = {
        method: 'POST',
        url: 'https://api.firecrawl.dev/v1/crawl',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer fc-bcb07136c3e64a7a8ab7c51dcf397568',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={{ JSON.stringify({ url: $json.Website_URL, limit: 8, includePaths: $json.includePaths, excludePaths: $json.excludePaths, scrapeOptions: { formats: ["markdown"], onlyMainContent: true, headers: { "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.5", "Accept": "text/html,application/xhtml+xml" } } }) }}',
        options: {
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 30000,
        },
    };

    @node({
        id: 'fc-extract-crawl-id',
        name: 'Extract Crawl ID',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2256, -560],
    })
    ExtractCrawlId = {
        jsCode: `let loopItem;
try { loopItem = $('Loop Firecrawl').item.json; } catch(_) { loopItem = $('Prep Crawl').first().json; }
const resp = $input.first().json;
const body = resp?.body || resp || {};
const crawlId = body?.id || body?.jobId || '';
return [{
  json: {
    RUN_ID:              String(loopItem.RUN_ID      || '').trim(),
    EntityKey:           String(loopItem.EntityKey   || '').trim(),
    Website_URL:         String(loopItem.Website_URL || '').trim(),
    SerpAPI_ContactUrls: Array.isArray(loopItem.SerpAPI_ContactUrls) ? loopItem.SerpAPI_ContactUrls : [],
    Missing_Fields:      Array.isArray(loopItem.Missing_Fields) ? loopItem.Missing_Fields : [],
    crawl_id:            crawlId,
    poll_attempt:        0,
  },
}];`,
    };

    @node({
        id: 'fc-check-crawl-started',
        name: 'Check Crawl Started',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [2480, -560],
    })
    CheckCrawlStarted = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 1,
            },
            conditions: [
                {
                    id: 'crawl-id-nonempty',
                    leftValue: '={{ $json.crawl_id }}',
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
        id: 'fc-crawl-failed-fallback',
        name: 'Crawl Failed Fallback',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3600, -544],
    })
    CrawlFailedFallback = {
        jsCode: `const inp = $input.first().json;
return [{ json: {
  RUN_ID:         String(inp.RUN_ID      || '').trim(),
  EntityKey:      String(inp.EntityKey   || '').trim(),
  Website_URL:    String(inp.Website_URL || '').trim(),
  Missing_Fields: Array.isArray(inp.Missing_Fields) ? inp.Missing_Fields : [],
  pages_scraped:  0,
  page_data:      '[]',
} }];`,
    };

    @node({
        id: 'fc-wait-crawl-start',
        webhookId: 'fc-wait-crawl-start-wh',
        name: 'Wait Crawl Start',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [2704, -752],
    })
    WaitCrawlStart = {
        amount: 20,
    };

    @node({
        id: 'fc-prep-poll',
        name: 'Prep Poll',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2928, -752],
    })
    PrepPoll = {
        jsCode: `const inp = $input.first().json;
// crawl_id may be missing when inp is a Firecrawl 404 error response.
// Fall back to the stable item from Check Crawl Started which always carries it.
const starter = $('Check Crawl Started').first()?.json || {};
const crawlId = String(inp.crawl_id || '').trim() || String(starter.crawl_id || '').trim();
const serpUrls = Array.isArray(inp.SerpAPI_ContactUrls) ? inp.SerpAPI_ContactUrls
  : Array.isArray(starter.SerpAPI_ContactUrls) ? starter.SerpAPI_ContactUrls : [];
const missingFields = Array.isArray(inp.Missing_Fields) ? inp.Missing_Fields
  : Array.isArray(starter.Missing_Fields) ? starter.Missing_Fields : [];
return [{ json: {
  RUN_ID:              String(inp.RUN_ID      || starter.RUN_ID      || '').trim(),
  EntityKey:           String(inp.EntityKey   || starter.EntityKey   || '').trim(),
  Website_URL:         String(inp.Website_URL || starter.Website_URL || '').trim(),
  SerpAPI_ContactUrls: serpUrls,
  Missing_Fields:      missingFields,
  crawl_id:            crawlId,
  poll_attempt:        Number(inp.poll_attempt || 0) + 1,
} }];`,
    };

    @node({
        id: 'fc-poll-crawl-status',
        name: 'Poll Crawl Status',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [3152, -896],
        onError: 'continueRegularOutput',
    })
    PollCrawlStatus = {
        url: '={{ "https://api.firecrawl.dev/v1/crawl/" + $json.crawl_id }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer fc-bcb07136c3e64a7a8ab7c51dcf397568',
                },
            ],
        },
        options: {
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 15000,
        },
    };

    @node({
        id: 'fc-check-crawl-done',
        name: 'Check Crawl Done',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [3376, -896],
    })
    CheckCrawlDone = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 1,
            },
            conditions: [
                {
                    id: 'crawl-done-check',
                    leftValue: '={{ ($input.first().json?.body?.status || $input.first().json?.status || "") }}',
                    rightValue: 'completed',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
                {
                    id: 'crawl-max-attempts',
                    leftValue: '={{ $runIndex }}',
                    rightValue: 1,
                    operator: {
                        type: 'number',
                        operation: 'gte',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        id: 'fc-wait-poll-retry',
        webhookId: 'fc-wait-poll-retry-wh',
        name: 'Wait Poll Retry',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [3600, -736],
    })
    WaitPollRetry = {
        amount: 15,
    };

    @node({
        id: 'fc-merge-crawl-data',
        name: 'Merge Crawl Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3600, -880],
    })
    MergeCrawlData = {
        jsCode: `const prepItem = $('Prep Poll').item.json;
const resp = $input.first().json;
const body = resp?.body || resp || {};
const pages = Array.isArray(body.data) ? body.data : [];
const pageData = pages.map(p => ({
  url:      String(p.metadata?.sourceURL || p.url || p.sourceURL || ''),
  markdown: String(p.markdown || p.content || ''),
})).filter(p => p.markdown);
return [{
  json: {
    RUN_ID:         String(prepItem.RUN_ID      || '').trim(),
    EntityKey:      String(prepItem.EntityKey   || '').trim(),
    Website_URL:    String(prepItem.Website_URL || '').trim(),
    Missing_Fields: Array.isArray(prepItem.Missing_Fields) ? prepItem.Missing_Fields : [],
    pages_scraped:  pages.length,
    page_data:      JSON.stringify(pageData),
  },
}];`,
    };

    @node({
        id: 'fc-parse-firecrawl',
        name: 'Parse Firecrawl Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3856, -688],
    })
    ParseFirecrawlResults = {
        jsCode: `// Only extracts fields still missing after the SerpAPI phase.
// Missing_Fields = ["email","phone","address"] subset — skip anything already found.
const inp           = $input.first().json;
const runId         = String(inp.RUN_ID      || '').trim();
const entityKey     = String(inp.EntityKey   || '').trim();
const websiteUrl    = String(inp.Website_URL || '').trim();
const missingFields = Array.isArray(inp.Missing_Fields) ? inp.Missing_Fields : ['email','phone','address'];

const needEmail   = missingFields.includes('email');
const needPhone   = missingFields.includes('phone');
const needAddress = missingFields.includes('address');

const EMAIL_JUNK   = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const emailRegex   = /[a-zA-Z0-9\\u00C0-\\u017E][a-zA-Z0-9._%+\\-\\u00C0-\\u017E]{2,}@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
const phoneRegex   = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9[1236]\\d|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
// Street-keyword regex: Portuguese + Spanish formats
const addressRegex = /(?:Rua|R\\.|Avenida|Av\\.|Avda\\.|Pra[çc]a|Largo|Estrada|Travessa|Cal[çc]ada|Alameda|Beco|Calle|C\\/|Carrer|Passeig|Paseo|Plaza|Pl\\.|Edificio|Edif\\.|Pol\\.?\\s*Ind\\.|Pol[íi]gono|Urb\\.)\\s{0,2}[^\\n]{5,120}/g;
// Label-based: captures value after "Endereço", "Dirección", "Dirección:", "Address:" etc.
const labelAddressRegex = /(?:Endere[çc]o|Direc[cç][ií][oó]n|Direcci[oó]n|Morada|Address|Sede)\\s*[:\\-]?\\s*([^\\n]{8,150})/gi;

function trimAddress(raw) {
  var t = String(raw || "").replace(/\\s+/g, ' ').trim();

  // Strip label prefixes that appear before the street keyword (e.g. "Social: ", "Sede: ")
  var lp = /^[^A-Z\\u00C0-\\u00FF]{0,30}(?:Rua|Avenida|Av\\.|Avda\\.|Pra[\\u00e7c]a|Largo|Estrada|Travessa|Cal[\\u00e7c]ada|Alameda|Beco|Calle|Carrer|Passeig|Paseo|Plaza|Edif[\\u00ed]cio|Edif\\.|Pol\\.?\\s*Ind\\.|Pol[\\u00edi]gono|Urb\\.)/i.exec(t);
  if (lp && lp.index > 0) t = t.slice(lp.index);

  // Step 1: hard separators
  var hm = /\\s*[;|\\u2013\\u2014]\\s*/.exec(t);
  if (hm && hm.index > 8) t = t.slice(0, hm.index);

  // Step 2: cut at contact/noise keywords
  var nm = /[\\s.]+(Telefone|Telemóvel|Telemovel|Tel\\b|Telf\\b|Tlf\\b|Fax\\b|Email\\b|NIF\\b|CONTATO|Contato|Contact|Actividade|Pagamentos|Vendas|River\\b|View\\b|Office\\b|Robert\\b|Código\\b|Codigo\\b|COMÉRCIO|COMERCIO|www\\.)/i.exec(t);
  if (nm && nm.index > 8) t = t.slice(0, nm.index);

  // Step 3: postal code is MANDATORY — discard if not present
  var pm = /(\\d{4}-\\d{3})/.exec(t) || /(?<![\\d-])(\\d{5})(?![\\d-])/.exec(t);
  if (!pm) return '';
  var after = t.slice(pm.index + pm[0].length);
  var cityTail = after.match(/^[^.;|\\u2013\\u2014]{0,30}/);
  t = t.slice(0, pm.index + pm[0].length) + (cityTail ? cityTail[0] : '');

  // Step 4: country name as terminator if no postal code follows
  var cm = /\\b(PORTUGAL|Portugal|España|Espanha|Spain)\\b/.exec(t);
  if (cm) {
    var afterCountry = t.slice(cm.index + cm[0].length, cm.index + cm[0].length + 20);
    var hasPostalAfter = /\\d{4}-\\d{3}|\\d{5}/.test(afterCountry);
    if (!hasPostalAfter) t = t.slice(0, cm.index + cm[0].length);
  }

  // Step 5: cap and strip trailing punctuation
  return t.slice(0, 120).replace(/[\\s,\\.\\-]+$/, '').trim();
}

let pageData = [];
try { pageData = JSON.parse(inp.page_data || '[]'); } catch (_) {}

const emailSource   = new Map(); // value → first source url
const phoneSource   = new Map();
const addressSource = new Map();

for (const page of pageData) {
  const md  = String(page.markdown || '');
  const url = String(page.url || websiteUrl);

  if (needEmail) {
    for (const m of md.matchAll(new RegExp(emailRegex.source, 'g'))) {
      const e = m[0].toLowerCase().trim();
      if (!e.startsWith('...') && !EMAIL_JUNK.test(e) && !emailSource.has(e)) emailSource.set(e, url);
    }
  }

  if (needPhone) {
    const pr2 = new RegExp(phoneRegex.source, 'g');
    let pm;
    while ((pm = pr2.exec(md)) !== null) {
      const cleaned = pm[1].replace(/[\\s.\\-()]/g, '').trim();
      const digits  = cleaned.replace(/[\\+]/g, '');
      if (digits.length === 9 || digits.length === 11 || digits.length === 12) {
        if (digits === entityKey) continue;
        const stored = cleaned.startsWith('+') ? '00' + cleaned.slice(1) : cleaned;
        if (!phoneSource.has(stored)) phoneSource.set(stored, url);
      }
    }
  }

  if (needAddress) {
    const ar2 = new RegExp(addressRegex.source, 'g');
    let am;
    while ((am = ar2.exec(md)) !== null) {
      const addr = trimAddress(am[0].replace(/\\s+/g, ' '));
      if (addr.length > 8 && !addressSource.has(addr)) addressSource.set(addr, url);
    }
    // Label-based extraction: "Endereço: ...", "Dirección: ...", "Morada: ...", "Address: ..."
    const lr2 = new RegExp(labelAddressRegex.source, 'gi');
    let lm;
    while ((lm = lr2.exec(md)) !== null) {
      const addr = trimAddress(lm[1].replace(/\\s+/g, ' '));
      if (addr.length > 8 && !addressSource.has(addr)) addressSource.set(addr, url);
    }
  }
}

const now  = $now.setZone("Europe/Lisbon").toISO();
const base = {
  Run_ID:       runId,
  Entity_key:   entityKey,
  Extracted_at: now,
  'Source_type  (input | serpapi | scrape | openai)': 'firecrawl',
};

const rows = [];
for (const [v, srcUrl] of emailSource)   rows.push({ json: { ...base, 'Field (phone | email | address)': 'email',   Value: v, Source_url: websiteUrl, SerpAPI_ContactUrls: srcUrl !== websiteUrl ? srcUrl : '' } });
for (const [v, srcUrl] of phoneSource)   rows.push({ json: { ...base, 'Field (phone | email | address)': 'phone',   Value: v, Source_url: websiteUrl, SerpAPI_ContactUrls: srcUrl !== websiteUrl ? srcUrl : '' } });
for (const [v, srcUrl] of addressSource) rows.push({ json: { ...base, 'Field (phone | email | address)': 'address', Value: v, Source_url: websiteUrl, SerpAPI_ContactUrls: srcUrl !== websiteUrl ? srcUrl : '' } });
if (rows.length === 0) rows.push({ json: { ...base, 'Field (phone | email | address)': '', Value: '', Source_url: websiteUrl, SerpAPI_ContactUrls: '' } });
return rows;
`,
    };

    @node({
        id: 'wait-before-phase2-write',
        webhookId: '8de793c2-3402-4441-ae3b-ee146bd05118',
        name: 'Wait Before Phase 2 Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [4048, -688],
    })
    WaitBeforePhase2Write = {
        amount: 15,
    };

    @node({
        id: 'fc-write-firecrawl-evidence',
        name: 'Write Firecrawl Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [4256, -448],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    WriteFirecrawlEvidence = {
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
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: [],
            schema: [
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Field (phone | email | address)',
                    displayName: 'Field (phone | email | address)',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Value',
                    displayName: 'Value',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Source_url',
                    displayName: 'Source_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Source_type  (input | serpapi | scrape | openai)',
                    displayName: 'Source_type  (input | serpapi | scrape | openai)',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Hint_url',
                    displayName: 'Hint_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
                {
                    id: 'Extracted_at',
                    displayName: 'Extracted_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'SerpAPI_ContactUrls',
                    displayName: 'SerpAPI_ContactUrls',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: false,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'fc-update-ctrl-exec-done',
        name: 'Update Control Exec Done',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [4480, -448],
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
                Exec_key: '={{ $json.Run_ID + "_" + $json.Entity_key }}',
                Queued_action: 'FIRECRAWL',
                Process_Status: 'DONE',
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
        id: '45688f6f-d67b-459b-8548-7a04e2fafa93',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [208, -96],
    })
    StickyNote = {
        content: '## SerpAPI and Scraper',
        height: 448,
        width: 1872,
        color: 6,
    };

    @node({
        id: '41f13b27-6637-42b3-949c-1f7587e8a5f5',
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [368, -928],
    })
    StickyNote1 = {
        content: '## FireCrawl',
        height: 736,
        width: 4288,
        color: 6,
    };

    @node({
        id: 'scraper-update-ctrl-exec-done',
        name: 'Update Control Exec Scraper Done',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1280, -752],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 30000,
    })
    UpdateControlExecScraperDone = {
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
                Process_Status: 'DONE',
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
        this.ReadUrlChecks.out(0).to(this.NormalizeInput.in(0));
        this.NormalizeInput.out(0).to(this.GateHasUrl.in(0));
        this.GateHasUrl.out(0).to(this.UpdateControlExecStage2.in(0));
        this.GateHasUrl.out(0).to(this.LoopOverCompanies.in(0));
        this.LoopOverCompanies.out(0).to(this.WaitBeforePhase1Write.in(0));
        this.LoopOverCompanies.out(1).to(this.WaitBeforeSerpapi.in(0));
        this.WaitBeforeSerpapi.out(0).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.ParseSerpapiResults.in(0));
        this.ParseSerpapiResults.out(0).to(this.FetchHomepage.in(0));
        this.FetchHomepage.out(0).to(this.BuildCandidateUrls.in(0));
        this.BuildCandidateUrls.out(0).to(this.FetchCandidate.in(0));
        this.FetchCandidate.out(0).to(this.AggregateAndCompare.in(0));
        this.AggregateAndCompare.out(0).to(this.LoopOverCompanies.in(0));
        this.WaitBeforePhase1Write.out(0).to(this.WriteToControlEvidence.in(0));
        this.WriteToControlEvidence.out(0).to(this.DeduplicateCompanies.in(0));
        this.DeduplicateCompanies.out(0).to(this.CheckMissingFields.in(0));
        this.CheckMissingFields.out(0).to(this.UpdateControlExecScraperDone.in(0));
        this.CheckMissingFields.out(1).to(this.LoopFirecrawl.in(0));
        this.LoopFirecrawl.out(1).to(this.PrepCrawl.in(0));
        this.PrepCrawl.out(0).to(this.FirecrawlStartCrawl.in(0));
        this.FirecrawlStartCrawl.out(0).to(this.ExtractCrawlId.in(0));
        this.ExtractCrawlId.out(0).to(this.CheckCrawlStarted.in(0));
        this.CheckCrawlStarted.out(0).to(this.WaitCrawlStart.in(0));
        this.CheckCrawlStarted.out(1).to(this.CrawlFailedFallback.in(0));
        this.CrawlFailedFallback.out(0).to(this.ParseFirecrawlResults.in(0));
        this.WaitCrawlStart.out(0).to(this.PrepPoll.in(0));
        this.PrepPoll.out(0).to(this.PollCrawlStatus.in(0));
        this.PollCrawlStatus.out(0).to(this.CheckCrawlDone.in(0));
        this.CheckCrawlDone.out(0).to(this.MergeCrawlData.in(0));
        this.CheckCrawlDone.out(1).to(this.WaitPollRetry.in(0));
        this.WaitPollRetry.out(0).to(this.PrepPoll.in(0));
        this.MergeCrawlData.out(0).to(this.ParseFirecrawlResults.in(0));
        this.ParseFirecrawlResults.out(0).to(this.WaitBeforePhase2Write.in(0));
        this.WaitBeforePhase2Write.out(0).to(this.WriteFirecrawlEvidence.in(0));
        this.WriteFirecrawlEvidence.out(0).to(this.UpdateControlExecDone.in(0));
        this.UpdateControlExecDone.out(0).to(this.LoopFirecrawl.in(0));
    }
}
