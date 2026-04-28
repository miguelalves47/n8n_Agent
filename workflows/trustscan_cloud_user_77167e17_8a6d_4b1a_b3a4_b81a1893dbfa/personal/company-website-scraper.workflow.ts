import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Company Website Scraper
// Nodes   : 13  |  Connections: 13
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ManualTrigger                      manualTrigger
// SeedTestCompany                    code
// GoogleDriveTrigger                 googleDriveTrigger         [creds]
// ReadUrlChecks                      googleSheets               [creds]
// NormalizeInput                     code
// LoopOverCompanies                  splitInBatches
// SearchSerpapi                      httpRequest                [creds] [alwaysOutput]
// ParseSerpapiResults                code
// FetchHomepage                      httpRequest                [onError→regular] [retry]
// BuildCandidateUrls                 code
// FetchCandidate                     httpRequest                [onError→regular]
// AggregateAndCompare                code
// WriteToControlEvidence             googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ManualTrigger
//    → SeedTestCompany
//      → NormalizeInput
//        → LoopOverCompanies
//          → WriteToControlEvidence
//         .out(1) → SearchSerpapi
//            → ParseSerpapiResults
//              → FetchHomepage
//                → BuildCandidateUrls
//                  → FetchCandidate
//                    → AggregateAndCompare
//                      → LoopOverCompanies (↩ loop)
// GoogleDriveTrigger
//    → ReadUrlChecks
//      → NormalizeInput (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'JIKF7ULkAzBxSx7f',
    name: 'Company Website Scraper',
    active: false,
    settings: {
        saveDataErrorExecution: 'all',
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
        availableInMCP: false,
        binaryMode: 'separate',
    },
})
export class CompanyWebsiteScraperWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '70fab25f-f484-499b-8dd2-3caa7a154f8b',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [224, 104],
    })
    ManualTrigger = {};

    @node({
        id: 'a2f91021-5e49-4fbd-b15a-494ca71062b4',
        name: 'Seed Test Company',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [448, 104],
    })
    SeedTestCompany = {
        jsCode: `return [
  { json: { RUN_ID: 'TEST-001', EntityKey: '500170880', Final_URL: 'https://www.continental-pneus.pt' } },
  { json: { RUN_ID: 'TEST-001', EntityKey: '500100144', Final_URL: 'https://www.jeronimomartins.com' } },
  { json: { RUN_ID: 'TEST-001', EntityKey: '999999999', Final_URL: 'https://this-domain-does-not-exist-99999.pt' } },
];
`,
    };

    @node({
        id: 'c4d5e6f7-a8b9-4c0d-9e1f-2a3b4c5d6e7f',
        name: 'Google Drive Trigger',
        type: 'n8n-nodes-base.googleDriveTrigger',
        version: 1,
        position: [0, -88],
        credentials: { googleDriveOAuth2Api: { id: 'X86AoRbLZx35cevh', name: 'Google Drive account' } },
    })
    GoogleDriveTrigger = {
        pollTimes: {
            item: [
                {
                    mode: 'everyMinute',
                },
            ],
        },
        triggerOn: 'specificFile',
        event: 'fileUpdated',
        fileToWatch: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'id',
            cachedResultName: 'CLIENT_BD_OUTPUT',
        },
    };

    @node({
        id: 'd5e6f7a8-b9c0-4d1e-8f2a-3b4c5d6e7f80',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [224, -88],
        credentials: { googleSheetsOAuth2Api: { id: 'X86AoRbLZx35cevh', name: 'Google Drive account' } },
    })
    ReadUrlChecks = {
        operation: 'read',
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
            mappingMode: 'autoMapInputData',
            value: {},
        },
        options: {},
    };

    @node({
        id: 'f7a8b9c0-d1e2-4f3a-8b4c-5d6e7f8091a2',
        name: 'Normalize Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [672, 32],
    })
    NormalizeInput = {
        mode: 'runOnceForEachItem',
        jsCode: `const rawUrl = String($json.Final_URL || '').trim();
let url = '';
if (rawUrl) {
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl).href;
    url = url.replace(/\\/+$/, '');
  } catch (_) { url = ''; }
}
return {
  json: {
    RUN_ID: String($json.RUN_ID || '').trim(),
    EntityKey: String($json.EntityKey || $json.ENTITY_KEY || '').trim(),
    Website_URL: url,
  },
};
`,
    };

    @node({
        id: 'aa11bb22-cc33-4dd4-85ee-66ff77889900',
        name: 'Loop Over Companies',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [896, 32],
    })
    LoopOverCompanies = {
        options: {},
    };

    @node({
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1120, -160],
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
    ? 'site:' + $json.Website_URL.replace(/^https?:\\/\\//i,'').replace(/\\/+$/,'') + ' (inurl:contact OR inurl:contacto OR inurl:contactos OR inurl:about OR inurl:sobre OR email OR telefone OR "+351")'
    : $json.EntityKey + ' contacto email telefone site:pt'
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
                    name: 'filter',
                    value: '0',
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
        id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        name: 'Parse SerpAPI Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1344, -160],
    })
    ParseSerpapiResults = {
        jsCode: `// Extract email, phone, address from SerpAPI organic_results + knowledge_graph.
// Identity comes from $('Normalize Input') since that's the source in this merged workflow.
const trig = $('Normalize Input').first().json;

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const PREF_PREFIX = /^(geral|info|contacto|contactos|contact|hello|ola|support|suporte|comercial|apoio|atendimento|reservas|marketing|imprensa|press|rgpd)@/i;

const phoneRegex = /(?:^|[^\\d+])((?:(?:\\+|00)?351[\\s.\\-]?)?(?:2\\d{2}|9[1236]\\d|800|808|30\\d)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3})(?!\\d)/g;
const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;

function extractFromText(text) {
  const emails = new Set();
  const phones = new Set();
  const t = String(text || '');
  for (const m of t.matchAll(emailRegex)) { if (!EMAIL_JUNK.test(m[0])) emails.add(m[0].toLowerCase()); }
  let pm; const pr2 = new RegExp(phoneRegex.source, 'g');
  while ((pm = pr2.exec(t)) !== null) {
    const cleaned = pm[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits = cleaned.replace(/\\+/g, '');
    if (digits.length === 9 || digits.length === 12) phones.add(cleaned);
  }
  return { emails: [...emails], phones: [...phones] };
}

function rankEmail(emails, domain) {
  if (!emails.length) return '';
  const d = String(domain || '').toLowerCase().replace(/^www\\./, '');
  const same = emails.filter(e => d && e.endsWith('@' + d));
  const samePref = same.filter(e => PREF_PREFIX.test(e));
  if (samePref.length) return samePref[0];
  if (same.length) return same[0];
  const anyPref = emails.filter(e => PREF_PREFIX.test(e));
  if (anyPref.length) return anyPref[0];
  return emails[0];
}

const serpItem = $input.all()[0];
const body = serpItem?.json?.body || serpItem?.json || {};
const organic = Array.isArray(body.organic_results) ? body.organic_results : [];
const kg = body.knowledge_graph || {};

let homeDomain = '';
try { homeDomain = new URL(trig.Website_URL || '').hostname.replace(/^www\\./, ''); } catch (_) {}

const kgEmail = kg.email ? kg.email.toLowerCase().trim() : '';
const kgPhone = kg.phone ? kg.phone.replace(/[\\s.\\-()]/g, '').trim() : '';
const kgAddress = kg.address || kg.headquarters || '';
const kgWebsite = kg.website || '';

const allEmails = [];
const allPhones = [];
for (const r of organic) {
  const text = (r.snippet || '') + ' ' + (r.title || '');
  const { emails, phones } = extractFromText(text);
  allEmails.push(...emails);
  allPhones.push(...phones);
}

const serpEmail = kgEmail || rankEmail(allEmails, homeDomain);
const serpPhone = kgPhone || allPhones[0] || '';
const serpAddress = kgAddress;

const serpContactUrls = organic
  .filter(r => {
    if (!homeDomain || !r.link) return false;
    try { return new URL(r.link).hostname.replace(/^www\\./, '') === homeDomain; } catch (_) { return false; }
  })
  .map(r => r.link)
  .slice(0, 3);

return [{
  json: {
    RUN_ID: String(trig.RUN_ID || '').trim(),
    EntityKey: String(trig.EntityKey || '').trim(),
    Website_URL: String(trig.Website_URL || '').trim(),
    SerpAPI_Email: serpEmail,
    SerpAPI_Phone: serpPhone,
    SerpAPI_Address: serpAddress,
    SerpAPI_Website: kgWebsite,
    SerpAPI_ContactUrls: serpContactUrls,
    SerpAPI_OrganicCount: organic.length,
  },
}];
`,
    };

    @node({
        id: '09d46c0c-b869-48b6-90b8-7770f7b6306b',
        name: 'Fetch Homepage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1568, -160],
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
        id: 'fa456d97-732d-4a49-b4ee-5aad060fece7',
        name: 'Build Candidate URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1792, -160],
    })
    BuildCandidateUrls = {
        jsCode: `// Fan-out: homepage response → N items (homepage + ranked subpages).
// HTTP Request overwrites $json, so identity and SerpAPI data come from Parse SerpAPI Results.
const fetched = $input.all()[0];
if (!fetched) return [];
const j = fetched.json;
const serpData = $('Parse SerpAPI Results').first().json;

const excel = {
  RUN_ID: String(serpData.RUN_ID || '').trim(),
  EntityKey: String(serpData.EntityKey || '').trim(),
  Website_URL: String(serpData.Website_URL || '').trim(),
};

const serpApiData = {
  SerpAPI_Email: serpData.SerpAPI_Email || '',
  SerpAPI_Phone: serpData.SerpAPI_Phone || '',
  SerpAPI_Address: serpData.SerpAPI_Address || '',
  SerpAPI_Website: serpData.SerpAPI_Website || '',
  SerpAPI_ContactUrls: serpData.SerpAPI_ContactUrls || [],
  SerpAPI_OrganicCount: serpData.SerpAPI_OrganicCount || 0,
};

const key = excel.EntityKey + '|' + excel.Website_URL;
const emit = (url, kind, homeHtml, errorStatus, errorMessage) => ({
  json: {
    Company_Key: key,
    RUN_ID: excel.RUN_ID,
    EntityKey: excel.EntityKey,
    Website_URL: excel.Website_URL,
    ...serpApiData,
    Candidate_URL: url,
    Candidate_Kind: kind,
    Homepage_HTML: homeHtml || '',
    Error_Status: errorStatus || '',
    Error_Message: errorMessage || '',
  },
});

if (!excel.Website_URL) {
  return [emit('', 'none', '', 'No_URL', 'Excel row has empty Internet field')];
}

const rawError = j.error;
const httpStatus = Number(j.statusCode || 0);
const hasError = rawError || (httpStatus >= 400);
if (hasError) {
  let errMsg = '', errCode = '';
  if (typeof rawError === 'string') errMsg = rawError;
  else if (rawError && typeof rawError === 'object') {
    errMsg = rawError.message || rawError.description || JSON.stringify(rawError);
    errCode = rawError.code || rawError.syscall || '';
  }
  if (!errMsg) errMsg = j.message || j.errorMessage || j.errorDescription || '';
  if (!errMsg && httpStatus) errMsg = 'HTTP ' + httpStatus;
  if (!errMsg) errMsg = JSON.stringify(j).substring(0, 300);
  const searchable = (errMsg + ' ' + errCode).toLowerCase();
  let status = 'Error';
  if (searchable.includes('timeout') || searchable.includes('etimedout')) status = 'Timeout';
  else if (searchable.includes('enotfound') || searchable.includes('getaddrinfo')) status = 'DNS_Not_Found';
  else if (searchable.includes('econnrefused') || searchable.includes('econnreset')) status = 'Connection_Refused';
  else if (searchable.includes('certificate') || searchable.includes('self signed') || searchable.includes('ssl')) status = 'SSL_Error';
  else if (httpStatus >= 400) status = 'HTTP_' + httpStatus;
  return [emit('', 'none', '', status, errMsg)];
}

const rawHomepage = String(j.data || j.body || '');

const decodeEntities = (s) => String(s || '')
  .replace(/&#(\\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

const CONTACT_KEYWORDS = /contact|contato|contacto|kontakt|reach-us|sobre|quem-somos|about|company|empresa|legal|impressum|legal-notice|aviso-legal|termos|apoio|support|atendimento/i;

let homeOrigin = '';
try { homeOrigin = new URL(excel.Website_URL).origin; } catch (_) { homeOrigin = excel.Website_URL.replace(/\\/+$/, ''); }

const foundHrefs = new Set();
for (const u of serpApiData.SerpAPI_ContactUrls) foundHrefs.add(u);

const re = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([^<]{0,140})<\\/a>/gi;
let m; let count = 0;
while ((m = re.exec(rawHomepage)) !== null && count < 500) {
  count++;
  const href = (m[1] || '').trim();
  const text = decodeEntities(m[2] || '').trim().toLowerCase();
  if (!href) continue;
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
  const combined = (href + ' ' + text).toLowerCase();
  if (!CONTACT_KEYWORDS.test(combined)) continue;
  let abs;
  try { abs = new URL(href, excel.Website_URL).toString(); } catch (_) { continue; }
  const absUrl = new URL(abs);
  const baseHost = new URL(excel.Website_URL).hostname.replace(/^www\\./, '');
  const absHost = absUrl.hostname.replace(/^www\\./, '');
  if (absHost !== baseHost) continue;
  foundHrefs.add(abs.split('#')[0]);
}

const score = (u) => {
  const s = u.toLowerCase();
  let n = 0;
  if (/\\/(contactos|contacto|contato|contact-us|contact|contacts|kontakt)(\\/|$|\\?)/.test(s)) n += 100;
  else if (/contact/.test(s)) n += 40;
  if (/(quem-somos|about|sobre|empresa|company)/.test(s)) n += 25;
  if (/(legal|impressum|aviso-legal|termos)/.test(s)) n += 10;
  if (/(apoio|support|atendimento)/.test(s)) n += 5;
  if (/\\/en\\//.test(s)) n -= 2;
  return n;
};
const homepageKey = excel.Website_URL.replace(/\\/+$/, '');
const rankedFromHome = [...foundHrefs]
  .filter(u => u.replace(/\\/+$/, '') !== homepageKey)
  .sort((a, b) => score(b) - score(a))
  .slice(0, 4);

const fallbackPaths = ['/contactos', '/contacto', '/contact', '/contact-us', '/en/contact', '/sobre-nos', '/empresa', '/about', '/about-us', '/impressum', '/legal'];
const fallbackUrls = fallbackPaths.map(p => homeOrigin + p);

const allCandidates = [...new Set([...rankedFromHome, ...fallbackUrls])]
  .filter(u => u.replace(/\\/+$/, '') !== homepageKey)
  .slice(0, 8);

const items = [];
items.push(emit(excel.Website_URL, 'homepage', rawHomepage, '', ''));
for (const url of allCandidates) {
  items.push(emit(url, 'subpage', '', '', ''));
}
return items;
`,
    };

    @node({
        id: '02d995b6-b5d4-4a5b-95ec-3a01549e3b6d',
        name: 'Fetch Candidate',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [2016, -160],
        onError: 'continueRegularOutput',
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
            timeout: 12000,
        },
    };

    @node({
        id: '574c2bd2-ccab-4df9-92c4-64f7db4e5180',
        name: 'Aggregate And Compare',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2240, 8],
    })
    AggregateAndCompare = {
        jsCode: `// Outputs one row per contact item (email, phone, address, website) found.
// Columns: RUN_ID, EntityKey, Type, Value, Source, Scrape_Status
const fetched  = $input.all();
const meta     = $('Build Candidate URLs').all();
const serpData = $('Parse SerpAPI Results').first().json;
const trig     = $('Normalize Input').first().json;

const runId      = String(trig.RUN_ID || '').trim();
const entityKey  = String(trig.EntityKey || '').trim();
const websiteUrl = String(trig.Website_URL || '').trim();

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;

const stripNoise = (h) => h
  .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<noscript[^>]*>[\\s\\S]*?<\\/noscript>/gi, ' ')
  .replace(/<!--[\\s\\S]*?-->/g, ' ');

const decodeEntities = (s) => String(s || '')
  .replace(/&#(\\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

const deobfuscateEmail = (s) => String(s || '')
  .replace(/\\s*\\[\\s*at\\s*\\]\\s*/gi, '@').replace(/\\s*\\(\\s*at\\s*\\)\\s*/gi, '@').replace(/\\s+at\\s+/gi, '@')
  .replace(/\\s*\\[\\s*dot\\s*\\]\\s*/gi, '.').replace(/\\s*\\(\\s*dot\\s*\\)\\s*/gi, '.').replace(/\\s+dot\\s+/gi, '.');

const extractEmails = (html) => {
  const found = new Set();
  const mailtos = [...html.matchAll(/href\\s*=\\s*["']mailto:([^"'?#]+)/gi)].map(m => m[1]);
  mailtos.forEach(e => { if (e && !EMAIL_JUNK.test(e)) found.add(e.toLowerCase().trim()); });
  const decoded = deobfuscateEmail(decodeEntities(html));
  const cand = decoded.match(/[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g) || [];
  cand.forEach(e => { if (!EMAIL_JUNK.test(e)) found.add(e.toLowerCase().trim()); });
  return [...found];
};

const extractPhones = (html) => {
  const found = new Set();
  const tels = [...html.matchAll(/href\\s*=\\s*["']tel:([^"']+)/gi)].map(m => m[1]);
  tels.forEach(t => { if (t) found.add(t.replace(/[\\s.\\-()]/g, '').trim()); });
  const phoneRegex = /(?:^|[^\\d+])((?:(?:\\+|00)?351[\\s.\\-]?)?(?:2\\d{2}|9[1236]\\d|800|808|30\\d)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3})(?!\\d)/g;
  let m;
  while ((m = phoneRegex.exec(html)) !== null) {
    const cleaned = m[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits = cleaned.replace(/\\+/g, '');
    if (digits.length === 9 || digits.length === 12) found.add(cleaned);
  }
  return [...found];
};

const extractFromJsonLd = (rawHtml) => {
  const result = { emails: [], phones: [] };
  const blocks = [...rawHtml.matchAll(/<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi)].map(m => m[1]);
  for (const b of blocks) {
    let obj; try { obj = JSON.parse(b.trim()); } catch (_) { continue; }
    const nodes = Array.isArray(obj) ? obj : [obj];
    for (const n of nodes) {
      if (!n || typeof n !== 'object') continue;
      const candidates = [n, ...(Array.isArray(n['@graph']) ? n['@graph'] : [])];
      for (const c of candidates) {
        if (!c || typeof c !== 'object') continue;
        if (typeof c.email === 'string') result.emails.push(c.email.replace(/^mailto:/i, '').toLowerCase().trim());
        if (typeof c.telephone === 'string') result.phones.push(c.telephone.replace(/[\\s.\\-()]/g, '').trim());
      }
    }
  }
  return result;
};

// Collect scraped HTML
let homepage_html = '';
const subpage_htmls = [];
for (let i = 0; i < meta.length; i++) {
  const mm = meta[i].json;
  const f = fetched[i] ? fetched[i].json : {};
  if (mm.Candidate_Kind === 'homepage') {
    homepage_html = String(mm.Homepage_HTML || '');
  } else if (mm.Candidate_Kind === 'subpage') {
    const fetchErr = f.error || (Number(f.statusCode || 0) >= 400);
    if (!fetchErr) {
      const body = String(f.data || f.body || '');
      if (body) subpage_htmls.push(body);
    }
  }
}

const rawBundle = [homepage_html, ...subpage_htmls].join('\\n\\n');
const jl = extractFromJsonLd(rawBundle);
const cleanBundle = stripNoise(rawBundle);
const scrapeEmails = [...new Set([...jl.emails, ...extractEmails(cleanBundle)])].filter(e => !EMAIL_JUNK.test(e));
const scrapePhones = [...new Set([...jl.phones, ...extractPhones(cleanBundle)])];

// Merge with SerpAPI results
const serpEmail   = serpData.SerpAPI_Email   || '';
const serpPhone   = serpData.SerpAPI_Phone   || '';
const serpAddress = serpData.SerpAPI_Address || '';
const serpWebsite = serpData.SerpAPI_Website || '';

const allEmails   = [...new Set([...scrapeEmails, ...(serpEmail   ? [serpEmail]   : [])])];
const allPhones   = [...new Set([...scrapePhones, ...(serpPhone   ? [serpPhone]   : [])])];
const allWebsites = [...new Set([websiteUrl,      ...(serpWebsite ? [serpWebsite] : [])].filter(Boolean))];
const allAddresses = serpAddress ? [serpAddress] : [];

const scrapeStatus = !websiteUrl ? 'No_URL'
  : (meta.length === 1 && meta[0].json.Error_Status) ? meta[0].json.Error_Status
  : 'Done';

// Build one row per contact item
const rows = [];
const base = { RUN_ID: runId, EntityKey: entityKey, Scrape_Status: scrapeStatus };

for (const v of allEmails)   rows.push({ json: { ...base, Type: 'email',   Value: v, Source: scrapeEmails.includes(v) ? 'scrape' : 'serpapi' } });
for (const v of allPhones)   rows.push({ json: { ...base, Type: 'phone',   Value: v, Source: scrapePhones.includes(v) ? 'scrape' : 'serpapi' } });
for (const v of allAddresses) rows.push({ json: { ...base, Type: 'address', Value: v, Source: 'serpapi' } });
for (const v of allWebsites)  rows.push({ json: { ...base, Type: 'website', Value: v, Source: 'scrape' } });

// Always emit at least one row so the loop advances
if (rows.length === 0) {
  rows.push({ json: { ...base, Type: '', Value: '', Source: 'none' } });
}

return rows;
`,
    };

    @node({
        id: 'b5c6d7e8-f9a0-4b1c-8d2e-3f4051627384',
        name: 'Write To Control Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1120, -464],
        credentials: { googleSheetsOAuth2Api: { id: 'X86AoRbLZx35cevh', name: 'Google Drive account' } },
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
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: [],
            schema: [],
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ManualTrigger.out(0).to(this.SeedTestCompany.in(0));
        this.SeedTestCompany.out(0).to(this.NormalizeInput.in(0));
        this.GoogleDriveTrigger.out(0).to(this.ReadUrlChecks.in(0));
        this.ReadUrlChecks.out(0).to(this.NormalizeInput.in(0));
        this.NormalizeInput.out(0).to(this.LoopOverCompanies.in(0));
        this.LoopOverCompanies.out(0).to(this.WriteToControlEvidence.in(0));
        this.LoopOverCompanies.out(1).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.ParseSerpapiResults.in(0));
        this.ParseSerpapiResults.out(0).to(this.FetchHomepage.in(0));
        this.FetchHomepage.out(0).to(this.BuildCandidateUrls.in(0));
        this.BuildCandidateUrls.out(0).to(this.FetchCandidate.in(0));
        this.FetchCandidate.out(0).to(this.AggregateAndCompare.in(0));
        this.AggregateAndCompare.out(0).to(this.LoopOverCompanies.in(0));
    }
}
