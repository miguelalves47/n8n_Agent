import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Company Scraper (Single)
// Nodes   : 7  |  Connections: 8
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ExecuteWorkflowTrigger             executeWorkflowTrigger
// SearchSerpAPI                      httpRequest                [creds] [onError→regular] [alwaysOutput]
// ParseSerpAPIResults                code
// FetchHomepage                      httpRequest                [onError→regular] [retry]
// BuildCandidateUrls                 code
// FetchCandidate                     httpRequest                [onError→regular]
// AggregateAndCompare                code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ExecuteWorkflowTrigger
//    → SearchSerpAPI
//      → ParseSerpAPIResults
//        → FetchHomepage
//          → BuildCandidateUrls
//            → FetchCandidate
//              → AggregateAndCompare
// </workflow-map>

@workflow({
    id: '43Qi5DrbmeaLK7ld',
    name: 'Company Scraper (Single)',
    active: false,
    settings: {
        saveDataErrorExecution: 'all',
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
        availableInMCP: false,
    },
})
export class CompanyScraperSingleWorkflow {

    @node({
        id: 'f98e5725-2e5e-4b43-8711-ca94eeb7e531',
        name: 'Execute Workflow Trigger',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [0, 0],
    })
    ExecuteWorkflowTrigger = {
        inputSource: 'passthrough',
    };

    // ── Step 1: SerpAPI ──────────────────────────────────────────────
    // Two queries merged into one call: contact pages + direct email/phone signals.
    // Uses fullResponse so body.organic_results and body.knowledge_graph are available.
    @node({
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Search SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [224, 0],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account 2' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    SearchSerpAPI = {
        url: 'https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'q',
                    value: `={{
  $json.Website_URL
    ? 'site:' + $json.Website_URL.replace(/^https?:\\/\\//i,'').replace(/\\/+$/,'') + ' (inurl:contact OR inurl:contacto OR inurl:contactos OR inurl:about OR inurl:sobre OR email OR telefone OR "+351")'
    : '"' + $json.Nome + '" contacto email telefone site:pt'
}}`,
                },
                { name: 'engine', value: 'google' },
                { name: 'google_domain', value: 'google.pt' },
                { name: 'hl', value: 'pt' },
                { name: 'gl', value: 'pt' },
                { name: 'filter', value: '0' },
                { name: 'num', value: '10' },
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

    // ── Step 2: Parse SerpAPI results ────────────────────────────────
    @node({
        id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        name: 'Parse SerpAPI Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [448, 0],
    })
    ParseSerpAPIResults = {
        mode: 'runOnceForAllItems',
        jsCode: `// Extract email, phone, address, website from SerpAPI organic_results + knowledge_graph.
// Passes results downstream alongside original trigger fields.
const trig = $('Execute Workflow Trigger').first().json;

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;
const PREF_PREFIX = /^(geral|info|contacto|contactos|contact|hello|ola|support|suporte|comercial|apoio|atendimento|reservas|marketing|imprensa|press|rgpd)@/i;

const norm = s => String(s||'').toLowerCase().replace(/[\\s.\\-]/g,'').trim();
const normPhone = s => { let p = String(s||'').replace(/[\\s.\\-()]/g,''); if(p.startsWith('+351')) p=p.slice(4); if(p.startsWith('00351')) p=p.slice(5); return p; };

const phoneRegex = /(?:^|[^\\d+])((?:(?:\\+|00)?351[\\s.\\-]?)?(?:2\\d{2}|9[1236]\\d|800|808|30\\d)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3})(?!\\d)/g;
const emailRegex = /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g;

function extractFromText(text) {
  const emails = new Set();
  const phones = new Set();
  const t = String(text||'');
  for (const m of t.matchAll(emailRegex)) { if (!EMAIL_JUNK.test(m[0])) emails.add(m[0].toLowerCase()); }
  let pm; const pr2 = new RegExp(phoneRegex.source, 'g');
  while ((pm = pr2.exec(t)) !== null) {
    const cleaned = pm[1].replace(/[\\s.\\-()]/g,'').trim();
    const digits = cleaned.replace(/\\+/g,'');
    if (digits.length === 9 || digits.length === 12) phones.add(cleaned);
  }
  return { emails: [...emails], phones: [...phones] };
}

function rankEmail(emails, domain) {
  if (!emails.length) return '';
  const d = String(domain||'').toLowerCase().replace(/^www\\./, '');
  const same = emails.filter(e => d && e.endsWith('@'+d));
  const samePref = same.filter(e => PREF_PREFIX.test(e));
  if (samePref.length) return samePref[0];
  if (same.length) return same[0];
  const anyPref = emails.filter(e => PREF_PREFIX.test(e));
  if (anyPref.length) return anyPref[0];
  return emails[0];
}

const serpItem = $input.all()[0];
const body = serpItem?.json?.body || {};
const organic = Array.isArray(body.organic_results) ? body.organic_results : [];
const kg = body.knowledge_graph || {};

let homeDomain = '';
try { homeDomain = new URL(trig.Website_URL || '').hostname.replace(/^www\\./, ''); } catch(_) {}

// Pull from knowledge_graph first (highest confidence)
const kgEmail = kg.email ? kg.email.toLowerCase().trim() : '';
const kgPhone = kg.phone ? kg.phone.replace(/[\\s.\\-()]/g,'').trim() : '';
const kgAddress = kg.address || kg.headquarters || '';
const kgWebsite = kg.website || '';

// Pull from organic snippets
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

// Also collect candidate contact-page URLs from organic results that match the domain
const serpContactUrls = organic
  .filter(r => {
    if (!homeDomain || !r.link) return false;
    try { return new URL(r.link).hostname.replace(/^www\\./, '') === homeDomain; } catch(_) { return false; }
  })
  .map(r => r.link)
  .slice(0, 3);

return [{
  json: {
    // Pass-through trigger fields
    NIPC: String(trig.NIPC||'').trim(),
    Nome: String(trig.Nome||'').trim(),
    Website_URL: String(trig.Website_URL||'').trim(),
    Email_Excel: String(trig.Email_Excel||'').trim(),
    Telefone_Excel: String(trig.Telefone_Excel||'').trim(),
    Morada_Excel: String(trig.Morada_Excel||'').trim(),
    // SerpAPI findings
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

    // ── Step 3: Fetch Homepage ───────────────────────────────────────
    @node({
        id: '09d46c0c-b869-48b6-90b8-7770f7b6306b',
        name: 'Fetch Homepage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [672, 0],
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
                { name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                { name: 'Accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
                { name: 'Accept-Language', value: 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7' },
                { name: 'Upgrade-Insecure-Requests', value: '1' },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: { redirect: { maxRedirects: 5 } },
            response: { response: { responseFormat: 'text' } },
            timeout: 15000,
        },
    };

    // ── Step 4: Build candidate subpage URLs from homepage HTML ──────
    @node({
        id: 'fa456d97-732d-4a49-b4ee-5aad060fece7',
        name: 'Build Candidate URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [896, 0],
    })
    BuildCandidateUrls = {
        mode: 'runOnceForAllItems',
        jsCode: `// Fan-out: one input item (homepage response) → N items (homepage + ranked subpages).
// HTTP Request overwrites $json with the response body/error, so company identity and
// SerpAPI findings are recovered from Parse SerpAPI Results node.
const fetched = $input.all()[0];
if (!fetched) return [];
const j = fetched.json;
const serpData = $('Parse SerpAPI Results').first().json;

const excel = {
  NIPC: String(serpData.NIPC || '').trim(),
  Nome: String(serpData.Nome || '').trim(),
  Email_Excel: String(serpData.Email_Excel || '').trim(),
  Telefone_Excel: String(serpData.Telefone_Excel || '').trim(),
  Morada_Excel: String(serpData.Morada_Excel || '').trim(),
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

const key = excel.NIPC + '|' + excel.Website_URL;
const emit = (url, kind, homeHtml, errorStatus, errorMessage) => ({
  json: {
    Company_Key: key,
    NIPC: excel.NIPC,
    Nome: excel.Nome,
    Website_URL: excel.Website_URL,
    Email_Excel: excel.Email_Excel,
    Telefone_Excel: excel.Telefone_Excel,
    Morada_Excel: excel.Morada_Excel,
    ...serpApiData,
    Candidate_URL: url,
    Candidate_Kind: kind,
    Homepage_HTML: homeHtml || '',
    Error_Status: errorStatus || '',
    Error_Message: errorMessage || '',
  },
});

if (!excel.Website_URL) {
  // No URL in Excel — return a single no-scrape item; SerpAPI results still flow through
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
// Also seed with SerpAPI contact URLs (they matched the domain already)
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

    // ── Step 5: Fetch each candidate subpage ─────────────────────────
    @node({
        id: '02d995b6-b5d4-4a5b-95ec-3a01549e3b6d',
        name: 'Fetch Candidate',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1120, 0],
        onError: 'continueRegularOutput',
    })
    FetchCandidate = {
        url: '={{ $json.Candidate_URL || "https://invalid.invalid" }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                { name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                { name: 'Accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
                { name: 'Accept-Language', value: 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7' },
                { name: 'Upgrade-Insecure-Requests', value: '1' },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: { redirect: { maxRedirects: 5 } },
            response: { response: { responseFormat: 'text' } },
            timeout: 12000,
        },
    };

    // ── Step 6: Aggregate scraping + SerpAPI into one result row ─────
    @node({
        id: '574c2bd2-ccab-4df9-92c4-64f7db4e5180',
        name: 'Aggregate And Compare',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1344, 0],
    })
    AggregateAndCompare = {
        mode: 'runOnceForAllItems',
        jsCode: `// Reduces all candidate fetches + SerpAPI findings into one result row.
// Identity + SerpAPI fields come from $('Parse SerpAPI Results') (not $input which is post-HTTP).
// Per-candidate metadata (Candidate_Kind, Homepage_HTML) from $('Build Candidate URLs').
// Fetched HTML from $input (FetchCandidate output), indexed 1:1 with meta.
const fetched = $input.all();
const meta    = $('Build Candidate URLs').all();
const serpData = $('Parse SerpAPI Results').first().json;
const trig    = $('Execute Workflow Trigger').first().json;

const out = {
  NIPC: String(trig.NIPC || '').trim(),
  Nome: String(trig.Nome || '').trim(),
  Website_URL: String(trig.Website_URL || '').trim(),
  Email_Excel: String(trig.Email_Excel || '').trim(),
  Telefone_Excel: String(trig.Telefone_Excel || '').trim(),
  Morada_Excel: String(trig.Morada_Excel || '').trim(),
};

const stripNoise = (h) => h
  .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, ' ')
  .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, ' ')
  .replace(/<noscript[^>]*>[\\s\\S]*?<\\/noscript>/gi, ' ')
  .replace(/<!--[\\s\\S]*?-->/g, ' ');

const decodeEntities = (s) => String(s || '')
  .replace(/&#(\\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const deobfuscateEmail = (s) => String(s || '')
  .replace(/\\s*\\[\\s*at\\s*\\]\\s*/gi, '@').replace(/\\s*\\(\\s*at\\s*\\)\\s*/gi, '@').replace(/\\s+at\\s+/gi, '@')
  .replace(/\\s*\\[\\s*dot\\s*\\]\\s*/gi, '.').replace(/\\s*\\(\\s*dot\\s*\\)\\s*/gi, '.').replace(/\\s+dot\\s+/gi, '.');

const EMAIL_JUNK = /\\.(png|jpe?g|gif|svg|webp|ico|js|css|woff2?|ttf)(\\?|$)|sentry\\.io|wixpress|@.*\\.wix|@sentry|@example|@domain|@email|@yourdomain|@company|@sitename|noreply@|no-reply@/i;

const extractEmails = (cleanHtml) => {
  const out = new Set();
  const mailtos = [...cleanHtml.matchAll(/href\\s*=\\s*["']mailto:([^"'?#]+)/gi)].map(m => m[1]);
  mailtos.forEach(e => { if (e && !EMAIL_JUNK.test(e)) out.add(e.toLowerCase().trim()); });
  const decoded = deobfuscateEmail(decodeEntities(cleanHtml));
  const cand = decoded.match(/[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g) || [];
  cand.forEach(e => { if (!EMAIL_JUNK.test(e)) out.add(e.toLowerCase().trim()); });
  return [...out];
};

const rankEmail = (emails, domain) => {
  if (!emails.length) return '';
  const d = String(domain || '').toLowerCase().replace(/^www\\./, '');
  const prefPrefix = /^(geral|info|contacto|contactos|contact|hello|ola|support|suporte|comercial|apoio|atendimento|reservas|marketing|imprensa|press|comunicacao|rgpd)@/i;
  const sameDomain = emails.filter(e => d && e.endsWith('@' + d));
  const samePref  = sameDomain.filter(e => prefPrefix.test(e));
  if (samePref.length) return samePref[0];
  if (sameDomain.length) return sameDomain[0];
  const anyPref = emails.filter(e => prefPrefix.test(e));
  if (anyPref.length) return anyPref[0];
  return emails[0];
};

const extractPhones = (cleanHtml) => {
  const out = new Set();
  const tels = [...cleanHtml.matchAll(/href\\s*=\\s*["']tel:([^"']+)/gi)].map(m => m[1]);
  tels.forEach(t => { if (t) out.add(t.replace(/[\\s.\\-()]/g, '').trim()); });
  const phoneRegex = /(?:^|[^\\d+])((?:(?:\\+|00)?351[\\s.\\-]?)?(?:2\\d{2}|9[1236]\\d|800|808|30\\d)[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3})(?!\\d)/g;
  let m;
  while ((m = phoneRegex.exec(cleanHtml)) !== null) {
    const cleaned = m[1].replace(/[\\s.\\-()]/g, '').trim();
    const digits = cleaned.replace(/\\+/g, '');
    if (digits.length === 9 || digits.length === 12) out.add(cleaned);
  }
  return [...out];
};

const extractAddress = (cleanHtml) => {
  const addressTag = cleanHtml.match(/<address[^>]*>([\\s\\S]*?)<\\/address>/i);
  if (addressTag) {
    const txt = decodeEntities(addressTag[1]).replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
    if (txt.length >= 12 && txt.length <= 300) return txt;
  }
  const itemprop = cleanHtml.match(/itemprop=["']address["'][^>]*>([\\s\\S]{10,400}?)<\\/(?:address|span|div|p)>/i);
  if (itemprop) {
    const txt = decodeEntities(itemprop[1]).replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
    if (txt.length >= 12) return txt;
  }
  const ptPrefix = cleanHtml.match(/(?:Rua|Avenida|Av\\.|Praça|Largo|Travessa|Estrada|Alameda|Quinta|Zona Industrial|Parque Industrial)\\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][^<>\\n]{5,160}/);
  if (ptPrefix) return ptPrefix[0].replace(/\\s+/g, ' ').trim();
  const cep = cleanHtml.match(/\\b\\d{4}-\\d{3}\\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zA-ZÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç\\s\\-]{3,60}/);
  if (cep) return cep[0].replace(/\\s+/g, ' ').trim();
  return '';
};

const extractFromJsonLd = (rawHtml) => {
  const out = { email: '', phone: '', address: '' };
  const blocks = [...rawHtml.matchAll(/<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi)].map(m => m[1]);
  for (const b of blocks) {
    let obj; try { obj = JSON.parse(b.trim()); } catch (_) { continue; }
    const nodes = Array.isArray(obj) ? obj : [obj];
    for (const n of nodes) {
      if (!n || typeof n !== 'object') continue;
      const candidates = [n, ...(Array.isArray(n['@graph']) ? n['@graph'] : [])];
      for (const c of candidates) {
        if (!c || typeof c !== 'object') continue;
        if (!out.email && typeof c.email === 'string') out.email = c.email.replace(/^mailto:/i, '').toLowerCase().trim();
        if (!out.phone && typeof c.telephone === 'string') out.phone = c.telephone.replace(/[\\s.\\-()]/g, '').trim();
        if (!out.address && c.address) {
          if (typeof c.address === 'string') out.address = c.address;
          else if (typeof c.address === 'object') {
            const a = c.address;
            out.address = [a.streetAddress, a.postalCode, a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(', ');
          }
        }
      }
    }
  }
  return out;
};

const norm = (s) => String(s || '').toLowerCase().replace(/[\\s.\\-]/g, '').trim();
const normPhone = (s) => {
  let p = String(s || '').replace(/[\\s.\\-()]/g, '');
  if (p.startsWith('+351')) p = p.substring(4);
  if (p.startsWith('00351')) p = p.substring(5);
  return p;
};
const cmp = (excelVal, scrapedVal, matcher) => {
  if (!scrapedVal) return 'Missing';
  if (!excelVal)   return 'Missing';
  return matcher(excelVal, scrapedVal) ? 'Match' : 'Mismatch';
};

// ── Scraping aggregation ────────────────────────────────────────────
if (!meta.length) {
  const serpEmail = serpData.SerpAPI_Email || '';
  const serpPhone = serpData.SerpAPI_Phone || '';
  const serpAddr  = serpData.SerpAPI_Address || '';
  return [{
    json: {
      ...out,
      Email_Scraped: serpEmail, Email_Status: cmp(out.Email_Excel, serpEmail, (a,b) => norm(a)===norm(b)),
      Telefone_Scraped: serpPhone, Telefone_Status: cmp(out.Telefone_Excel, serpPhone, (a,b) => normPhone(a)===normPhone(b)),
      Morada_Scraped: serpAddr, Morada_Status: cmp(out.Morada_Excel, serpAddr, (a,b) => norm(a).includes(norm(b).substring(0,10))||norm(b).includes(norm(a).substring(0,10))),
      Nome_Scraped: '',
      Scrape_Status: 'Empty_Input',
      Subpages_Fetched: '0/0',
      SerpAPI_Email: serpData.SerpAPI_Email || '',
      SerpAPI_Phone: serpData.SerpAPI_Phone || '',
      SerpAPI_Address: serpData.SerpAPI_Address || '',
      Data_Source: serpEmail ? 'serpapi' : 'none',
      Error_Message: '',
    },
  }];
}

// Error short-circuit: homepage fetch failed
const firstMeta = meta[0].json;
if (meta.length === 1 && firstMeta.Candidate_Kind === 'none' && firstMeta.Error_Status) {
  const serpEmail = serpData.SerpAPI_Email || '';
  const serpPhone = serpData.SerpAPI_Phone || '';
  const serpAddr  = serpData.SerpAPI_Address || '';
  return [{
    json: {
      ...out,
      Email_Scraped: serpEmail, Email_Status: cmp(out.Email_Excel, serpEmail, (a,b) => norm(a)===norm(b)),
      Telefone_Scraped: serpPhone, Telefone_Status: cmp(out.Telefone_Excel, serpPhone, (a,b) => normPhone(a)===normPhone(b)),
      Morada_Scraped: serpAddr, Morada_Status: cmp(out.Morada_Excel, serpAddr, (a,b) => norm(a).includes(norm(b).substring(0,10))||norm(b).includes(norm(a).substring(0,10))),
      Nome_Scraped: '',
      Scrape_Status: firstMeta.Error_Status,
      Subpages_Fetched: '0/0',
      SerpAPI_Email: serpData.SerpAPI_Email || '',
      SerpAPI_Phone: serpData.SerpAPI_Phone || '',
      SerpAPI_Address: serpData.SerpAPI_Address || '',
      Data_Source: serpEmail ? 'serpapi' : firstMeta.Error_Status.toLowerCase(),
      Error_Message: String(firstMeta.Error_Message || '').substring(0, 300),
    },
  }];
}

let homepage_html = '';
const subpage_htmls = [];
let subpage_count = 0;
let subpage_success = 0;

for (let i = 0; i < meta.length; i++) {
  const m = meta[i].json;
  const f = fetched[i] ? fetched[i].json : {};
  if (m.Candidate_Kind === 'homepage') {
    homepage_html = String(m.Homepage_HTML || '');
  } else if (m.Candidate_Kind === 'subpage') {
    subpage_count += 1;
    const fetchErr = f.error || (Number(f.statusCode || 0) >= 400);
    if (!fetchErr) {
      const body = String(f.data || f.body || '');
      if (body) { subpage_htmls.push(body); subpage_success += 1; }
    }
  }
}

let homeDomain = '';
try { homeDomain = new URL(out.Website_URL).hostname.replace(/^www\\./, ''); } catch (_) {}

const rawBundle = [homepage_html, ...subpage_htmls].join('\\n\\n');
const jl = extractFromJsonLd(rawBundle);
const cleanBundle = stripNoise(rawBundle);
const emails = extractEmails(cleanBundle);
const phones = extractPhones(cleanBundle);
const addressPat = extractAddress(cleanBundle);

const scrapeEmail = jl.email || rankEmail(emails, homeDomain);
const scrapePhone = jl.phone || phones[0] || '';
const scrapeAddr  = jl.address || addressPat;

// Merge: SerpAPI wins unless scraping found something better (same-domain email preferred)
const serpEmail   = serpData.SerpAPI_Email || '';
const serpPhone   = serpData.SerpAPI_Phone || '';
const serpAddr    = serpData.SerpAPI_Address || '';

const finalEmail  = scrapeEmail || serpEmail;
const finalPhone  = scrapePhone || serpPhone;
const finalAddr   = scrapeAddr  || serpAddr;

const dataSource = scrapeEmail ? 'scrape' : (serpEmail ? 'serpapi' : 'none');

const cleanHome = stripNoise(homepage_html || '');
const titleMatch = cleanHome.match(/<title[^>]*>([^<]+)<\\/title>/i);
const h1Match    = cleanHome.match(/<h1[^>]*>([^<]+)<\\/h1>/i);
const scrapedName = decodeEntities(h1Match ? h1Match[1] : (titleMatch ? titleMatch[1] : '')).replace(/\\s+/g, ' ').trim();

return [{
  json: {
    ...out,
    Email_Scraped: finalEmail,
    Email_Status: cmp(out.Email_Excel, finalEmail, (a, b) => norm(a) === norm(b)),
    Telefone_Scraped: finalPhone,
    Telefone_Status: cmp(out.Telefone_Excel, finalPhone, (a, b) => normPhone(a) === normPhone(b)),
    Morada_Scraped: finalAddr,
    Morada_Status: cmp(out.Morada_Excel, finalAddr, (a, b) => norm(a).includes(norm(b).substring(0, 10)) || norm(b).includes(norm(a).substring(0, 10))),
    Nome_Scraped: scrapedName,
    Scrape_Status: 'Success',
    Subpages_Fetched: subpage_success + '/' + subpage_count,
    SerpAPI_Email: serpEmail,
    SerpAPI_Phone: serpPhone,
    SerpAPI_Address: serpAddr,
    Data_Source: dataSource,
    Error_Message: '',
  },
}];
`,
    };

    @links()
    defineRouting() {
        this.ExecuteWorkflowTrigger.out(0).to(this.SearchSerpAPI.in(0));
        this.SearchSerpAPI.out(0).to(this.ParseSerpAPIResults.in(0));
        this.ParseSerpAPIResults.out(0).to(this.FetchHomepage.in(0));
        this.FetchHomepage.out(0).to(this.BuildCandidateUrls.in(0));
        this.BuildCandidateUrls.out(0).to(this.FetchCandidate.in(0));
        this.FetchCandidate.out(0).to(this.AggregateAndCompare.in(0));
    }
}
