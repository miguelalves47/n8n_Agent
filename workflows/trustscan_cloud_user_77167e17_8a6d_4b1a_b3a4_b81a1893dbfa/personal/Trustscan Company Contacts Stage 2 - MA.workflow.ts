import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts  Stage 2 - MA
// Nodes   : 29  |  Connections: 33
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Phase1Trigger                      manualTrigger
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
// WaitBeforePhase1Write              wait
// Phase2Trigger                      manualTrigger
// DeduplicateCompanies               code
// LoopFirecrawl                      splitInBatches
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
// WriteFirecrawlEvidence             googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Phase1Trigger
//    → ReadUrlChecks
//      → NormalizeInput
//        → LoopOverCompanies
//          → WaitBeforePhase1Write
//            → WriteToControlEvidence
//              → DeduplicateCompanies
//                → LoopFirecrawl
//                 .out(1) → PrepCrawl
//                    → FirecrawlStartCrawl
//                      → ExtractCrawlId
//                        → CheckCrawlStarted
//                          → WaitCrawlStart
//                            → PrepPoll
//                              → PollCrawlStatus
//                                → CheckCrawlDone
//                                  → MergeCrawlData
//                                    → ParseFirecrawlResults
//                                      → WaitBeforePhase2Write
//                                        → WriteFirecrawlEvidence
//                                          → LoopFirecrawl (↩ loop)
//                                 .out(1) → WaitPollRetry
//                                    → PrepPoll (↩ loop)
//                         .out(1) → CrawlFailedFallback
//                            → ParseFirecrawlResults (↩ loop)
//         .out(1) → SearchSerpapi
//            → ParseSerpapiResults
//              → FetchHomepage
//                → BuildCandidateUrls
//                  → FetchCandidate
//                    → AggregateAndCompare
//                      → LoopOverCompanies (↩ loop)
//      → DeduplicateCompanies (↩ loop)
// Phase2Trigger
//    → ReadUrlChecks (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'DmaKVjkSXjdqbOnl',
    name: 'Trustscan Company Contacts  Stage 2 - MA',
    active: true,
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
        position: [-928, 160],
    })
    Phase1Trigger = {};

    @node({
        id: '26001e7d-417e-466a-9c7d-9fd407c20974',
        name: 'Read URL Checks',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-928, 80],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
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
        options: {},
    };

    @node({
        id: '49d7ff39-9c55-49ca-ad09-85e9103f63f4',
        name: 'Normalize Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-480, 208],
    })
    NormalizeInput = {
        mode: 'runOnceForEachItem',
        jsCode: `// Accepts both sheet columns (Run_ID / Entity_key / Final_url) and seed columns (RUN_ID / EntityKey / Final_URL)
const rawUrl = String($json['Final_url'] || $json['Final_URL'] || '').trim();
let url = rawUrl;
if (url && !url.startsWith('http')) url = 'https://' + url;
url = url.replace(/\\/+$/, '');
return {
  json: {
    RUN_ID:      String($json['Run_ID']    || $json['RUN_ID']    || '').trim(),
    EntityKey:   String($json['Entity_key'] || $json['EntityKey'] || '').trim(),
    Website_URL: url,
  },
};
`,
    };

    @node({
        id: '570560b5-c8f3-4c65-82ce-82170786795c',
        name: 'Loop Over Companies',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-256, 208],
    })
    LoopOverCompanies = {
        options: {},
    };

    @node({
        id: '392f5d34-782d-4523-a166-8594bf0d2950',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-32, 16],
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
    ? 'site:' + $json.Website_URL.replace(/^https?:\\/\\//i,'').replace(/\\/+$/,'') + ' (inurl:contact OR inurl:contact-us OR inurl:contacto OR inurl:contactos OR inurl:about OR inurl:about-us OR inurl:sobre OR inurl:quem-somos OR inurl:quien-somos OR inurl:nosotros OR inurl:equipa OR inurl:equipo OR inurl:team OR inurl:our-team OR inurl:who-we-are OR inurl:get-in-touch OR inurl:reach-us OR inurl:apoio OR inurl:suporte OR inurl:support OR inurl:atendimento OR inurl:fale OR inurl:legal OR inurl:impressum OR inurl:imprint OR inurl:privacy OR email OR telefone OR "+351" OR "+34")'
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
        id: 'ca0cea4f-9c5e-4cdf-9a12-872a871b085a',
        name: 'Parse SerpAPI Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [192, 16],
    })
    ParseSerpapiResults = {
        jsCode: `// Identity from the current loop item — .item.json is per-iteration, not .first()
const trig = $('Loop Over Companies').item.json;

const EMAIL_JUNK  = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const PREF_PREFIX = /^(geral|info|contacto|contactos|contact|hello|ola|support|suporte|comercial|apoio|atendimento|reservas|marketing|imprensa|press|rgpd)@/i;
const phoneRegex  = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9(?:1|2|3|6)|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9(?:1|2|3|6)|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
const emailRegex  = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;

function extractFromText(text) {
  const emails = new Set(), phones = new Set(), t = String(text || '');
  for (const m of t.matchAll(emailRegex)) { if (!EMAIL_JUNK.test(m[0])) emails.add(m[0].toLowerCase()); }
  let pm; const pr2 = new RegExp(phoneRegex.source, 'g');
  while ((pm = pr2.exec(t)) !== null) {
    const cleaned = pm[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits  = cleaned.replace(/[\\+]/g, '');
    if (digits.length === 9 || digits.length === 11 || digits.length === 12 || digits.length === 13) { const stored = cleaned.startsWith('+') ? '00' + cleaned.slice(1) : cleaned; phones.add(stored); }
  }
  return { emails: [...emails], phones: [...phones] };
}

function rankEmail(emails, domain) {
  if (!emails.length) return '';
  const d    = String(domain || '').toLowerCase().replace(/^www\\./, '');
  const same = emails.filter(e => d && e.endsWith('@' + d));
  const samePref = same.filter(e => PREF_PREFIX.test(e));
  if (samePref.length) return samePref[0];
  if (same.length)     return same[0];
  const anyPref = emails.filter(e => PREF_PREFIX.test(e));
  if (anyPref.length)  return anyPref[0];
  return emails[0];
}

const serpItem = $input.all()[0];
const body     = serpItem?.json?.body || serpItem?.json || {};
const organic  = Array.isArray(body.organic_results) ? body.organic_results : [];
const kg       = body.knowledge_graph || {};

// Extract homeDomain without new URL() — n8n sandbox may not support it reliably
let homeDomain = '';
const rawSite = trig.Website_URL || '';
const siteMatch = rawSite.replace(/^https?:\\/\\//i, '').replace(/\\/.*$/, '').replace(/^www\\./, '');
if (siteMatch) { homeDomain = siteMatch; }
if (!homeDomain) {
  const qParam = String((serpItem?.json?.body || serpItem?.json || {})?.search_parameters?.q || '');
  const siteQ = qParam.match(/site:([^\\s(]+)/);
  if (siteQ) homeDomain = siteQ[1].replace(/^www\\./, '').replace(/\\/.*$/, '');
}

const kgEmail   = kg.email    ? kg.email.toLowerCase().trim()              : '';
const kgPhone   = kg.phone    ? kg.phone.replace(/[\\s.\\-()]/g, '').trim() : '';
const kgAddress = kg.address  || kg.headquarters || '';
const kgWebsite = kg.website  || '';

const allEmails = [], allPhones = [];
for (const r of organic) {
  const { emails, phones } = extractFromText((r.snippet || '') + ' ' + (r.title || ''));
  allEmails.push(...emails);
  allPhones.push(...phones);
}

const serpContactUrls = organic
  .filter(r => {
    if (!homeDomain || !r.link) return false;
    const linkLower = String(r.link).toLowerCase();
    return linkLower.includes(homeDomain);
  })
  .map(r => r.link)
  .slice(0, 3);

return [{
  json: {
    RUN_ID:                String(trig.RUN_ID     || '').trim(),
    EntityKey:             String(trig.EntityKey  || '').trim(),
    Website_URL:           String(trig.Website_URL || '').trim(),
    SerpAPI_Email:         kgEmail   || rankEmail(allEmails, homeDomain),
    SerpAPI_Phone:         kgPhone   || allPhones[0] || '',
    SerpAPI_Address:       kgAddress,
    SerpAPI_Website:       kgWebsite,
    SerpAPI_ContactUrls:   serpContactUrls,
    SerpAPI_OrganicCount:  organic.length,
  },
}];
`,
    };

    @node({
        id: 'a20f2863-7022-4b17-a503-740527a743ed',
        name: 'Fetch Homepage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [416, 16],
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
        position: [640, 16],
    })
    BuildCandidateUrls = {
        jsCode: `// Fan-out: homepage response → homepage item + ranked contact subpage items.
// HTTP Request overwrites $json so identity comes from Parse SerpAPI Results.
const fetched  = $input.all()[0];
if (!fetched) return [];
const j        = fetched.json;
const serpData = $('Parse SerpAPI Results').first().json;

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

const score = (u) => { const s = u.toLowerCase(); return /(contactos|contacto|contato|contact-us|contact\\/|contacts\\/|kontakt|get-in-touch|reach-us)/.test(s) ? 100 : /contact/.test(s) ? 40 : /(quem-somos|quien-somos|nosotros|about-us|who-we-are|sobre|empresa)/.test(s) ? 25 : /(equipa|equipo|our-team|team)/.test(s) ? 20 : /(legal|termos|impressum|imprint|privacy)/.test(s) ? 10 : 0; };
const homepageKey = excel.Website_URL.replace(/\\/+$/, '');
const subpages = [...new Set([...[...foundHrefs].filter(u => u.replace(/\\/+$/, '') !== homepageKey).sort((a,b) => score(b)-score(a)).slice(0,4), ...['/contactos','/contacto','/contact','/contact-us','/get-in-touch','/reach-us','/sobre-nos','/about','/about-us','/quien-somos','/nosotros','/quem-somos'].map(p => homeOrigin + p)])].filter(u => u.replace(/\\/+$/, '') !== homepageKey).slice(0, 8);

return [emit(excel.Website_URL, 'homepage', rawHomepage, '', ''), ...subpages.map(u => emit(u, 'subpage', '', '', ''))];
`,
    };

    @node({
        id: 'a90ed98f-5079-460b-930c-7000d7eebda0',
        name: 'Fetch Candidate',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [864, 16],
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
        id: 'd6f8eaae-ea5e-46db-aa01-db5bb0b45d79',
        name: 'Aggregate And Compare',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1088, 192],
    })
    AggregateAndCompare = {
        jsCode: `// Collects all fetched HTML pages for one company and emits one row per contact item.
// source_type: 'scrape' for contacts found in HTML, 'serpapi' for contacts from SerpAPI only.
const fetched  = $input.all();
const meta     = $('Build Candidate URLs').all();
const serpData = $('Parse SerpAPI Results').first().json;
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
  (deobfuscate(decodeEntities(html)).match(/[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g)||[]).forEach(e => { if (!EMAIL_JUNK.test(e)) found.add(e.toLowerCase().trim()); });
  return [...found];
};
const extractPhones = (html) => {
  const found = new Set();
  [...html.matchAll(/href\\s*=\\s*["']tel:([^"']+)/gi)].forEach(m => found.add(m[1].replace(/[\\s.\\-()]/g,'').trim()));
  // Strict prefix validation to avoid matching serial numbers, zip codes, etc.
  // PT landline: 2xx (valid area codes), PT mobile: 91/92/93/96, PT toll-free: 800/808
  // ES landline: 8xx/9xx, ES mobile: 6xx/7xx — always require country code for ES
  const pr = /(?:^|[^\\d+])((?:(?:\\+|00)351[\\s.\\-]?(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9(?:1|2|3|6)|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:2(?:1[0-9]|2[0-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])|9(?:1|2|3|6)|800|808)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}|(?:\\+|00)34[\\s.\\-]?(?:[6-9]\\d{2})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}))(?![\\d])/g;
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

let homepage_html = '';
const subpage_htmls = [];
for (let i = 0; i < meta.length; i++) {
  const mm = meta[i].json, f = fetched[i]?.json || {};
  if (mm.Candidate_Kind === 'homepage') {
    homepage_html = String(mm.Homepage_HTML || '');
  } else if (mm.Candidate_Kind === 'subpage' && !f.error && !(Number(f.statusCode||0)>=400)) {
    const body = String(f.data||f.body||''); if (body) subpage_htmls.push(body);
  }
}

const rawBundle   = [homepage_html, ...subpage_htmls].join('\\n\\n');
const jl          = extractFromJsonLd(rawBundle);
const cleanBundle = stripNoise(rawBundle);
const scrapeEmails = [...new Set([...jl.emails, ...extractEmails(cleanBundle)])].filter(e=>!EMAIL_JUNK.test(e));
const scrapePhones = [...new Set([...jl.phones, ...extractPhones(cleanBundle)])];

const serpEmail   = serpData.SerpAPI_Email   || '';
const serpPhone   = serpData.SerpAPI_Phone   || '';
const serpAddress = serpData.SerpAPI_Address || '';
const serpWebsite = serpData.SerpAPI_Website || '';

const allEmails    = [...new Set([...scrapeEmails, ...(serpEmail   ? [serpEmail]   : [])])];
const allPhones    = [...new Set([...scrapePhones, ...(serpPhone   ? [serpPhone]   : [])])];
const allAddresses = serpAddress ? [serpAddress] : [];
const allWebsites  = [...new Set([websiteUrl, ...(serpWebsite ? [serpWebsite] : [])].filter(Boolean))];

const scrapeStatus = !websiteUrl ? 'No_URL' : (meta.length===1 && meta[0].json.Error_Status) ? meta[0].json.Error_Status : 'Done';
const now  = new Date().toISOString();
const base = { Run_ID: runId, Entity_key: entityKey, Scrape_Status: scrapeStatus, Extracted_at: now };

const serpContactUrls = Array.isArray(serpData.SerpAPI_ContactUrls) ? serpData.SerpAPI_ContactUrls : [];
const rows = [];
for (const v of allEmails)    rows.push({ json: { ...base, 'Field (phone | email | internet)': 'email',    Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': scrapeEmails.includes(v) ? 'scrape' : 'serpapi', SerpAPI_ContactUrls: JSON.stringify(serpContactUrls) } });
for (const v of allPhones)    rows.push({ json: { ...base, 'Field (phone | email | internet)': 'phone',    Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': scrapePhones.includes(v) ? 'scrape' : 'serpapi', SerpAPI_ContactUrls: JSON.stringify(serpContactUrls) } });
for (const v of allAddresses) rows.push({ json: { ...base, 'Field (phone | email | internet)': 'address',  Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': 'serpapi', SerpAPI_ContactUrls: JSON.stringify(serpContactUrls) } });
for (const v of allWebsites)  rows.push({ json: { ...base, 'Field (phone | email | internet)': 'internet', Value: v, Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': 'scrape',  SerpAPI_ContactUrls: JSON.stringify(serpContactUrls) } });
if (rows.length === 0) rows.push({ json: { ...base, 'Field (phone | email | internet)': '', Value: '', Source_url: websiteUrl, 'Source_type  (input | serpapi | scrape | openai)': 'none', SerpAPI_ContactUrls: JSON.stringify(serpContactUrls) } });
return rows;
`,
    };

    @node({
        id: '0a784f67-7610-4171-bd4a-67d556995d55',
        name: 'Write To Control Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-32, -288],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
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
                    id: 'Field (phone | email | internet)',
                    displayName: 'Field (phone | email | internet)',
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
                    id: 'Confidence',
                    displayName: 'Confidence',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
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
        position: [-32, -420],
    })
    WaitBeforePhase1Write = {
        resume: 'timeInterval',
        amount: 2,
        unit: 'seconds',
    };

    @node({
        id: 'phase2-manual-trigger',
        name: 'Phase 2 Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-928, -288],
    })
    Phase2Trigger = {};

    @node({
        id: 'fc-deduplicate-companies',
        name: 'Deduplicate Companies',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [256, -288],
    })
    DeduplicateCompanies = {
        jsCode: `// Phase 1 emits one row per contact (email/phone/address) so the same company
// appears N times. Deduplicate by Website_URL before feeding the Firecrawl loop.
// Also carry SerpAPI_ContactUrls so Firecrawl can use them as seed hints.
const seen = new Map(); // url → index in unique[]
const unique = [];
for (const item of $input.all()) {
  const url = String(item.json.Source_url || item.json.Website_URL || '').trim();
  if (!url) continue;
  let serpUrls = [];
  try { serpUrls = JSON.parse(item.json.SerpAPI_ContactUrls || '[]'); } catch (_) {}
  if (!seen.has(url)) {
    seen.set(url, unique.length);
    unique.push({
      json: {
        RUN_ID:              String(item.json.Run_ID    || item.json.RUN_ID    || '').trim(),
        EntityKey:           String(item.json.Entity_key || item.json.EntityKey || '').trim(),
        Website_URL:         url,
        SerpAPI_ContactUrls: serpUrls,
      },
    });
  } else {
    // Merge any additional SerpAPI URLs from later rows for the same company
    const existing = unique[seen.get(url)].json.SerpAPI_ContactUrls;
    for (const u of serpUrls) { if (!existing.includes(u)) existing.push(u); }
  }
}
return unique;
`,
    };

    @node({
        id: 'fc-loop-firecrawl',
        name: 'Loop Firecrawl',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [512, -288],
    })
    LoopFirecrawl = {
        options: {},
    };

    @node({
        id: 'fc-prep-crawl',
        name: 'Prep Crawl',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [640, -288],
    })
    PrepCrawl = {
        jsCode: `const item = $input.first().json;
const baseInclude = [".*contact.*",".*contac.*",".*contact-us.*",".*about.*",".*about-us.*",".*sobre.*",".*empresa.*",".*quem.somos.*",".*quien.somos.*",".*nosotros.*",".*equipa.*",".*equipo.*",".*team.*",".*our-team.*",".*who-we-are.*",".*get-in-touch.*",".*reach-us.*",".*apoio.*",".*suporte.*",".*support.*",".*atendimento.*",".*fale.*",".*legal.*",".*impressum.*",".*imprint.*",".*privacy.*"];
const serpUrls = Array.isArray(item.SerpAPI_ContactUrls) ? item.SerpAPI_ContactUrls : [];
// Pure string path extraction — new URL() silently returns empty hostname in n8n sandbox
const serpPaths = serpUrls.flatMap(function(u) {
  var p = String(u || "").replace(/^https?:\\/\\/[^\\/]*/i, "").replace(/[?#].*$/, "").replace(/^\\//, "").replace(/\\/$/, "");
  return p ? [".*" + p + ".*"] : [];
});
const includePaths = baseInclude.concat(serpPaths.filter(function(x) { return baseInclude.indexOf(x) === -1; }));
return [{ json: { RUN_ID: String(item.RUN_ID || "").trim(), EntityKey: String(item.EntityKey || "").trim(), Website_URL: String(item.Website_URL || "").trim(), SerpAPI_ContactUrls: serpUrls, includePaths: includePaths } }];`,
    };

    @node({
        id: 'fc-firecrawl-start-crawl',
        name: 'Firecrawl Start Crawl',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [768, -288],
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
                    value: 'Bearer fc-ddcb4e2f45c7449c92b1d3d7bafd5512',
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
            '={{ JSON.stringify({ url: $json.Website_URL, limit: 8, scrapeOptions: { formats: ["markdown"], onlyMainContent: true }, includePaths: $json.includePaths }) }}',
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
        position: [768, -416],
    })
    ExtractCrawlId = {
        jsCode: `const loopItem = $('Loop Firecrawl').item.json;
const resp = $input.first().json;
const body = resp?.body || resp || {};
const crawlId = body?.id || body?.jobId || '';
return [{
  json: {
    RUN_ID:              String(loopItem.RUN_ID      || '').trim(),
    EntityKey:           String(loopItem.EntityKey   || '').trim(),
    Website_URL:         String(loopItem.Website_URL || '').trim(),
    SerpAPI_ContactUrls: Array.isArray(loopItem.SerpAPI_ContactUrls) ? loopItem.SerpAPI_ContactUrls : [],
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
        position: [1024, -416],
    })
    CheckCrawlStarted = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
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
        position: [1024, -256],
    })
    CrawlFailedFallback = {
        jsCode: `const inp = $input.first().json;
return [{ json: {
  RUN_ID:              String(inp.RUN_ID      || '').trim(),
  EntityKey:           String(inp.EntityKey   || '').trim(),
  Website_URL:         String(inp.Website_URL || '').trim(),
  SerpAPI_ContactUrls: Array.isArray(inp.SerpAPI_ContactUrls) ? inp.SerpAPI_ContactUrls : [],
  pages_scraped:       0,
  page_data:           '[]',
} }];`,
    };

    @node({
        id: 'fc-wait-crawl-start',
        webhookId: 'fc-wait-crawl-start-wh',
        name: 'Wait Crawl Start',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1280, -544],
    })
    WaitCrawlStart = {
        resume: 'timeInterval',
        amount: 20,
        unit: 'seconds',
    };

    @node({
        id: 'fc-prep-poll',
        name: 'Prep Poll',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1536, -544],
    })
    PrepPoll = {
        jsCode: `const inp = $input.first().json;
// crawl_id may be missing when inp is a Firecrawl 404 error response.
// Fall back to the stable item from Check Crawl Started which always carries it.
const starter = $('Check Crawl Started').first()?.json || {};
const crawlId = String(inp.crawl_id || '').trim() || String(starter.crawl_id || '').trim();
const serpUrls = Array.isArray(inp.SerpAPI_ContactUrls) ? inp.SerpAPI_ContactUrls
  : Array.isArray(starter.SerpAPI_ContactUrls) ? starter.SerpAPI_ContactUrls : [];
return [{ json: {
  RUN_ID:              String(inp.RUN_ID      || starter.RUN_ID      || '').trim(),
  EntityKey:           String(inp.EntityKey   || starter.EntityKey   || '').trim(),
  Website_URL:         String(inp.Website_URL || starter.Website_URL || '').trim(),
  SerpAPI_ContactUrls: serpUrls,
  crawl_id:            crawlId,
  poll_attempt:        Number(inp.poll_attempt || 0) + 1,
} }];`,
    };

    @node({
        id: 'fc-poll-crawl-status',
        name: 'Poll Crawl Status',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1536, -416],
        onError: 'continueRegularOutput',
    })
    PollCrawlStatus = {
        method: 'GET',
        url: '={{ "https://api.firecrawl.dev/v1/crawl/" + $json.crawl_id }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer fc-ddcb4e2f45c7449c92b1d3d7bafd5512',
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
        position: [1792, -544],
    })
    CheckCrawlDone = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
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
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'fc-wait-poll-retry',
        webhookId: 'fc-wait-poll-retry-wh',
        name: 'Wait Poll Retry',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1792, -416],
    })
    WaitPollRetry = {
        resume: 'timeInterval',
        amount: 15,
        unit: 'seconds',
    };

    @node({
        id: 'fc-merge-crawl-data',
        name: 'Merge Crawl Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2048, -544],
    })
    MergeCrawlData = {
        jsCode: `const prepItem = $('Prep Poll').item.json;
const resp = $input.first().json;
const body = resp?.body || resp || {};
const pages = Array.isArray(body.data) ? body.data : [];
// Build per-page objects: { url, markdown } so ParseFirecrawlResults can attribute contacts to the specific subpage scraped.
const pageData = pages.map(p => ({
  url:      String(p.metadata?.sourceURL || p.url || p.sourceURL || ''),
  markdown: String(p.markdown || p.content || ''),
})).filter(p => p.markdown);
return [{
  json: {
    RUN_ID:        String(prepItem.RUN_ID      || '').trim(),
    EntityKey:     String(prepItem.EntityKey   || '').trim(),
    Website_URL:   String(prepItem.Website_URL || '').trim(),
    pages_scraped: pages.length,
    page_data:     JSON.stringify(pageData),
  },
}];`,
    };

    @node({
        id: 'fc-parse-firecrawl',
        name: 'Parse Firecrawl Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2048, -416],
    })
    ParseFirecrawlResults = {
        jsCode: `// Extracts emails and phones per crawled page; Source_url is the specific subpage scraped.
const inp        = $input.first().json;
const runId      = String(inp.RUN_ID      || '').trim();
const entityKey  = String(inp.EntityKey   || '').trim();
const websiteUrl = String(inp.Website_URL || '').trim();

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;
// PT+ES flexible regex — Firecrawl markdown is clean prose so loose prefix matching is fine here.
const phoneRegex = /(?:^|[^\\d+])((?:(?:\\+|00)(?:351|34)[\\s.\\-]?)?(?:9[0-9]|[2-9]\\d)[\\s.\\-]?\\d[\\s.\\-]?\\d[\\s.\\-]?(?:\\d[\\s.\\-]?){4}\\d)(?![\\d])/g;

let pageData = [];
try { pageData = JSON.parse(inp.page_data || '[]'); } catch (_) {}

// Track first page where each contact was found.
const emailSource = new Map(); // value → url
const phoneSource = new Map();

for (const page of pageData) {
  const md  = String(page.markdown || '');
  const url = String(page.url || websiteUrl);
  for (const m of md.matchAll(new RegExp(emailRegex.source, 'g'))) {
    const e = m[0].toLowerCase().trim();
    if (!EMAIL_JUNK.test(e) && !emailSource.has(e)) emailSource.set(e, url);
  }
  const pr2 = new RegExp(phoneRegex.source, 'g');
  let pm;
  while ((pm = pr2.exec(md)) !== null) {
    const cleaned = pm[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits  = cleaned.replace(/[\\+]/g, '');
    // PT: 9 digits bare or 12 with 351 prefix. ES: 9 digits bare or 11 with 34 prefix.
    if (digits.length === 9 || digits.length === 11 || digits.length === 12) {
      // Skip numbers that are just the EntityKey itself (company registration number).
      if (digits === entityKey) continue;
      // Normalise: replace leading + with 00 so Google Sheets doesn't strip it as a formula prefix.
      const stored = cleaned.startsWith('+') ? '00' + cleaned.slice(1) : cleaned;
      if (!phoneSource.has(stored)) phoneSource.set(stored, url);
    }
  }
}

const now = new Date().toISOString();
const base = {
  Run_ID:      runId,
  Entity_key:  entityKey,
  Extracted_at: now,
  'Source_type  (input | serpapi | scrape | openai)': 'firecrawl',
};

const rows = [];
for (const [v, srcUrl] of emailSource) rows.push({ json: { ...base, 'Field (phone | email | internet)': 'email', Value: v, Source_url: srcUrl } });
for (const [v, srcUrl] of phoneSource) rows.push({ json: { ...base, 'Field (phone | email | internet)': 'phone', Value: v, Source_url: srcUrl } });
if (rows.length === 0) rows.push({ json: { ...base, 'Field (phone | email | internet)': '', Value: '', Source_url: websiteUrl } });
return rows;
`,
    };

    @node({
        id: 'wait-before-phase2-write',
        webhookId: '8de793c2-3402-4441-ae3b-ee146bd05118',
        name: 'Wait Before Phase 2 Write',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [2304, -416],
    })
    WaitBeforePhase2Write = {
        resume: 'timeInterval',
        amount: 5,
        unit: 'seconds',
    };

    @node({
        id: 'fc-write-firecrawl-evidence',
        name: 'Write Firecrawl Evidence',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [2304, -288],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
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
                    id: 'Field (phone | email | internet)',
                    displayName: 'Field (phone | email | internet)',
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
                    id: 'Extracted_at',
                    displayName: 'Extracted_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
            ],
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
        this.Phase2Trigger.out(0).to(this.ReadUrlChecks.in(0));
        this.ReadUrlChecks.out(0).to(this.NormalizeInput.in(0));
        this.ReadUrlChecks.out(0).to(this.DeduplicateCompanies.in(0));
        this.NormalizeInput.out(0).to(this.LoopOverCompanies.in(0));
        this.LoopOverCompanies.out(0).to(this.WaitBeforePhase1Write.in(0));
        this.LoopOverCompanies.out(1).to(this.SearchSerpapi.in(0));
        this.SearchSerpapi.out(0).to(this.ParseSerpapiResults.in(0));
        this.ParseSerpapiResults.out(0).to(this.FetchHomepage.in(0));
        this.FetchHomepage.out(0).to(this.BuildCandidateUrls.in(0));
        this.BuildCandidateUrls.out(0).to(this.FetchCandidate.in(0));
        this.FetchCandidate.out(0).to(this.AggregateAndCompare.in(0));
        this.AggregateAndCompare.out(0).to(this.LoopOverCompanies.in(0));
        this.WaitBeforePhase1Write.out(0).to(this.WriteToControlEvidence.in(0));
        this.WriteToControlEvidence.out(0).to(this.DeduplicateCompanies.in(0));
        this.DeduplicateCompanies.out(0).to(this.LoopFirecrawl.in(0));
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
        this.WriteFirecrawlEvidence.out(0).to(this.LoopFirecrawl.in(0));
    }
}
