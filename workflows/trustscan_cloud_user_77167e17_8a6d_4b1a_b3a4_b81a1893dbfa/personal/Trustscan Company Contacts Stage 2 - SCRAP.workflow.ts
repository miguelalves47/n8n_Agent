import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts  Stage 2 - SCRAP
// Nodes   : 112  |  Connections: 103
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// TriggerRun                         manualTrigger              [executeOnce]
// LoopOverItems                      splitInBatches
// ExtraiInformacaoComRegex           code                       [alwaysOutput]
// EscolheOMelhorContacto             code
// SemEmail                           if
// HttpContactos                      httpRequest                [onError→regular] [alwaysOutput] [retry]
// TentaPossiveisRoutesDeContactos    code
// ProcuraMailtoTags                  code
// Merge                              merge                      [alwaysOutput]
// ClienteBdOutputUrlChecks           googleSheets               [creds]
// ClienteBdOutputControlExec         googleSheets               [creds]
// StateUpdateControlEvidence         googleSheets               [creds] [alwaysOutput]
// SerpapiWebsiteContactos            httpRequest                [creds] [alwaysOutput]
// Merge1                             merge
// SmartScrapePage                    airtop                     [creds]
// Markdown                           markdown
// CodeInJavascript1                  code
// MessageAModel                      openAi                     [creds]
// OpenaiPesquisaSiteDaEmpresa        openAi                     [onError→regular] [creds] [alwaysOutput]
// GetResultsArray                    code                       [alwaysOutput]
// CodeInJavascript                   code                       [alwaysOutput]
// If_                                if                         [alwaysOutput]
// StateUpdateControlEvidence1        googleSheets               [creds] [alwaysOutput]
// StateUpdateControlEvidence2        googleSheets               [creds] [alwaysOutput] [retry]
// Merge2                             merge
// Wait                               wait
// StickyNote1                        stickyNote
// StickyNote2                        stickyNote
// StickyNote3                        stickyNote
// ClienteBdOutputInputSnapshot       googleSheets               [creds] [alwaysOutput]
// ValidaDominioNosResultados         code                       [alwaysOutput]
// SplitOut                           splitOut
// TransformToContactsArray           code                       [alwaysOutput]
// SerpapiWebsiteContactos1           httpRequest                [creds] [alwaysOutput]
// Merge4                             merge
// RetiraContactosDoSnipet            code                       [alwaysOutput]
// IfAnyResults1                      if
// NoResults                          if
// Switch_                            switch
// HttpsSiteUrl                       httpRequest                [onError→regular] [alwaysOutput]
// HttpSiteUrl                        httpRequest                [onError→regular] [alwaysOutput]
// NoHttps                            if
// CodeInJavascript2                  code
// RetornaDados                       code
// RespondeuSemDados                  if
// SubstituiUrlDoInput                code
// StateUpdateControlEvidence3        googleSheets               [creds] [alwaysOutput]
// CallRedirectWebsite                httpRequest                [onError→regular] [alwaysOutput]
// IfHtmlRefresh                      if
// FiltraResultadosParaTestes         code
// CalculaDominioDoSite               code
// StickyNote                         stickyNote
// NoResults1                         if
// Markdown1                          markdown                   [onError→regular]
// SearchesLinksToContactPages        code                       [alwaysOutput]
// CallWebsite                        httpRequest                [onError→regular] [alwaysOutput] [retry]
// Empty                              if
// GetItem                            code
// StateUpdateNoEvidences             googleSheets               [creds] [alwaysOutput]
// Markdown2                          markdown
// UpdateControlExecution1            googleSheets               [creds] [alwaysOutput]
// OriginalItem                       noOp
// UpdateControlExecution3            googleSheets               [creds] [alwaysOutput]
// UpdateControlExecution4            googleSheets               [creds] [alwaysOutput]
// Markdown3                          markdown                   [alwaysOutput]
// WebsiteWorking                     if
// UpdateControlExecution5            googleSheets               [creds] [alwaysOutput]
// StartScrapeOperation               googleSheets               [creds] [alwaysOutput]
// GetItem1                           code
// UpdateControlExecution6            googleSheets               [creds] [alwaysOutput]
// Merge3                             merge
// HttpRequest                        httpRequest
// CallWebsite1                       httpRequest                [onError→regular] [alwaysOutput] [retry]
// TransformToContactsArray1          code                       [alwaysOutput]
// GetItem2                           code
// FoundAllContacts                   code
// ContinueScraping                   if
// StateUpdateNoEvidences2            googleSheets               [creds] [alwaysOutput]
// CallWebsite2                       httpRequest                [onError→regular] [alwaysOutput] [retry]
// SearchesLinksToContactPages1       code                       [alwaysOutput]
// CodeInJavascript4                  code
// SplitUrl                           splitOut
// ManualScrapForContacts             code
// IfHasUrlsInQueue                   if
// ExtraiInformacaoComRegex1          code                       [alwaysOutput]
// SearchesLinksToContactPages2       code                       [alwaysOutput]
// TransformToContactsArray2          code                       [alwaysOutput]
// StickyNote4                        stickyNote
// Merge5                             merge
// NoResults2                         if
// FoundAllContacts2                  code
// WebsiteWorking1                    if
// NoResults3                         if
// EndLoop                            noOp
// CreateControlExecutionSerpapi      googleSheets               [creds] [alwaysOutput]
// Merge6                             merge
// SetEvidencesSerpapi                googleSheets               [creds] [alwaysOutput] [retry]
// UpdateControlExecutionSerpapi1     googleSheets               [creds] [alwaysOutput]
// UpdateControlExecutionSerpapi2     googleSheets               [creds] [alwaysOutput]
// CreateControlExecutionScrape       googleSheets               [creds] [alwaysOutput]
// SetEvidencesScrap                  googleSheets               [creds] [alwaysOutput] [retry]
// UpdateControlExecution             googleSheets               [creds] [alwaysOutput]
// SetNoEvidencesSerpapi              googleSheets               [creds] [alwaysOutput]
// SetNoEvidencesScrap                googleSheets               [creds] [alwaysOutput]
// UpdateControlExecution2            googleSheets               [creds] [alwaysOutput]
// NoResults4                         if
// UpdateControlExecutionNotIndexed   googleSheets               [creds] [alwaysOutput]
// UpdateControlExecutionNotResults   googleSheets               [creds] [alwaysOutput]
// FirstUrl                           if
// UpdateControlExecutionNotValidurl  googleSheets               [creds] [alwaysOutput]
// IsItASuccess                       code
// SetUrl                             set
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// TriggerRun
//    → ClienteBdOutputControlExec
//      → Merge.in(1)
//        → FiltraResultadosParaTestes
//          → NoResults3
//           .out(1) → LoopOverItems
//              → EndLoop
//             .out(1) → CalculaDominioDoSite
//                → CreateControlExecutionSerpapi
//                  → SerpapiWebsiteContactos
//                    → Merge4
//                      → ValidaDominioNosResultados
//                        → NoResults
//                          → UpdateControlExecutionNotIndexed
//                            → Merge6
//                              → CreateControlExecutionScrape
//                                → ManualScrapForContacts
//                                  → IfHasUrlsInQueue
//                                    → SetUrl
//                                      → CallWebsite2
//                                        → WebsiteWorking1
//                                          → Markdown1
//                                            → ExtraiInformacaoComRegex1
//                                              → SearchesLinksToContactPages1
//                                                → IfHasUrlsInQueue (↩ loop)
//                                         .out(1) → FirstUrl
//                                            → SetNoEvidencesScrap
//                                              → Merge3
//                                                → Wait
//                                                  → LoopOverItems (↩ loop)
//                                            → UpdateControlExecutionNotValidurl
//                                              → Merge3.in(1) (↩ loop)
//                                           .out(1) → ExtraiInformacaoComRegex1 (↩ loop)
//                                   .out(1) → TransformToContactsArray2
//                                      → NoResults2
//                                        → SetNoEvidencesScrap (↩ loop)
//                                        → UpdateControlExecution
//                                          → Merge3.in(1) (↩ loop)
//                                       .out(1) → SetEvidencesScrap
//                                          → IsItASuccess
//                                            → UpdateControlExecution2
//                                              → Wait (↩ loop)
//                          → SetNoEvidencesSerpapi
//                            → Merge6.in(1) (↩ loop)
//                         .out(1) → RetiraContactosDoSnipet
//                            → TransformToContactsArray1
//                              → NoResults4
//                                → SetNoEvidencesSerpapi (↩ loop)
//                                → UpdateControlExecutionNotResults
//                                  → Merge6 (↩ loop)
//                               .out(1) → Merge5
//                                  → FoundAllContacts
//                                    → ContinueScraping
//                                      → UpdateControlExecutionSerpapi1
//                                        → CreateControlExecutionScrape (↩ loop)
//                                     .out(1) → UpdateControlExecutionSerpapi2
//                                        → Wait (↩ loop)
//                               .out(1) → SetEvidencesSerpapi
//                                  → Merge5.in(1) (↩ loop)
//                  → SerpapiWebsiteContactos1
//                    → Merge4.in(1) (↩ loop)
//    → ClienteBdOutputUrlChecks
//      → Merge (↩ loop)
//    → ClienteBdOutputInputSnapshot
//      → Merge.in(2) (↩ loop)
// EscolheOMelhorContacto
//    → SemEmail
//      → ProcuraMailtoTags
// CodeInJavascript1
//    → Markdown
//      → If_
//        → MessageAModel
// OpenaiPesquisaSiteDaEmpresa
//    → GetResultsArray
// OriginalItem
//    → UpdateControlExecution1
//      → HttpsSiteUrl
//        → NoHttps
//          → HttpSiteUrl
//            → RetornaDados
//              → IfHtmlRefresh
//                → CallRedirectWebsite
//                  → RespondeuSemDados
//                   .out(1) → SubstituiUrlDoInput
//                      → StateUpdateControlEvidence3
//                      → UpdateControlExecution6
//               .out(1) → SubstituiUrlDoInput (↩ loop)
//         .out(1) → RetornaDados (↩ loop)
// UpdateControlExecution3
//    → StartScrapeOperation
//      → CallWebsite
//        → WebsiteWorking
//          → SearchesLinksToContactPages
//            → TentaPossiveisRoutesDeContactos
//              → SplitOut
//                → HttpContactos
//                  → Markdown3
//                    → ExtraiInformacaoComRegex
//                      → Merge2
//                        → TransformToContactsArray
//                          → Merge1
//                            → NoResults1
//                              → GetItem
//                                → StateUpdateNoEvidences
//                             .out(1) → StateUpdateControlEvidence2
//         .out(1) → StateUpdateNoEvidences2
// UpdateControlExecution5
//    → GetItem1
// HttpRequest
//    → Markdown2
// CodeInJavascript4
//    → SplitUrl
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'kpOK5Ei8S3FvBbbH',
    name: 'Trustscan Company Contacts  Stage 2 - SCRAP',
    active: false,
    tags: ['Company Contacts'],
    settings: { executionOrder: 'v1', availableInMCP: false, binaryMode: 'separate' },
})
export class TrustscanCompanyContactsStage2ScrapWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '26042500-210b-4441-9c25-1e32e695a4d8',
        name: 'TRIGGER · Run',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1808, -272],
        alwaysOutputData: false,
        executeOnce: true,
    })
    TriggerRun = {};

    @node({
        id: '53b2fffc-3d5b-4276-a76d-06c97d92de06',
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-384, -208],
    })
    LoopOverItems = {
        options: {
            reset: false,
        },
    };

    @node({
        id: '4d6fab53-aac5-4c03-a5f0-723feb968ce5',
        name: 'Extrai informação com regex',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5184, -2256],
        alwaysOutputData: true,
    })
    ExtraiInformacaoComRegex = {
        jsCode: `
const phoneRegex = // /(?<!\\d)(?:\\+351[\\s.-]?)?(?:2[1-9]\\d|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3}(?!\\d)/g;
  ///(?<!\\d)(?:\\+351[\\s-])?(?:2[1-9]\\d|9[1-9]\\d)[\\s-]\\d{3}[\\s-]\\d{3}(?!\\d)/g;
/(?<!\\d)(?<!rgb\\()(?:\\+351[\\s-])?(?:2[1-9]\\d|9[1-9]\\d)[\\s-]\\d{3}[\\s-]\\d{3}(?!\\d)/g;

const junkEmails = /noreply|no-reply|mailer-daemon|wix\\.com|wordpress|sentry/i;
const inputs = $('Split Out').all().map(u=>u.json);

//console.log("this");
///console.log($input.all().length);
//console.log($('HTTP contactos').all().length);

var _return=[];
$input.all().map((item,i) => 
{
  //console.log(item.json["data"]=={});
  var input = inputs[i];
  const pages = item.json["data"]!=null && Object.keys( item.json.data).length !== 0 && item.json["error"]==null ? 
    item.json.data.replace(/!\\[([^\\]]*)\\]\\(([^)]*@2x[^)]*)\\)/g, '![$1]([IMAGE])') 
    : '';//.join(' ');  //retirar @ das imagens
    
  // Emails
  const emails = pages.match(
    /\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{2,}(?:\\.[a-zA-Z0-9-]{2,})+\\b(?!\\.(?:png|jpe?g|gif|webp|svg|bmp|ico)\\b)/gi
  ) || [];
    
  //console.log(phones.join(' '));
  // Fax: look for "fax" keyword nearby
  const faxMatches = pages.match(
    /(?:fax|telecópia|facsimile)[:\\s]*([+\\d\\s.()\\-]{9,})/gi
  ) || [];
  const faxes = faxMatches.map(f =>
    f.replace(/^(fax|telecópia|facsimile)[:\\s]*/i, '').trim()
  );

  // Portuguese phones: +351, 2xx, 9xx formats
  ///(?:\\+351[\\s.-]?)?(?:2\\d{1,2}|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3,4}/g
  const phones = (pages.match(phoneRegex  
  ) || []).filter(i=> !faxes.includes(i));

  const addresses = pages.match(/Morada\\s+(.+?)\\s*;/) || [];

  //non empty results
  if (emails.length!=0 || phones.length!=0 || faxes.length!=0 || addresses.length!=0)
    //console.log(pages)
    _return=_return.concat({
      //...$json,
      input,
      emails: [...new Set(emails)].filter(e => !junkEmails.test(e)),
      phones: [...new Set(phones)],
      faxes: [...new Set(faxes)],
      addresses: [...new Set(addresses)]
    });
});

return _return.filter(i =>
  i.emails.length!=0 ||
  i.phones.length!=0 ||
  i.faxes.length!=0 ||
  i.addresses.length!=0
); `,
    };

    @node({
        id: 'c912790e-3854-4cd0-b328-0141c7a95cdb',
        name: 'escolhe o melhor contacto',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-992, 1584],
    })
    EscolheOMelhorContacto = {
        jsCode: `const emails = $json.emails_found ?? [];
const phones = $json.phones_found ?? [];

// Prefer generic company emails
const preferred = ['geral@', 'info@', 'contact', 'admin@'];
const bestEmail = emails.find(e =>
  preferred.some(p => e.toLowerCase().includes(p))
) || emails[0] || '';

return {
  ...$json,
  email: bestEmail,
  phone: phones[0] || '',
  fax: ($json.faxes_found ?? [])[0] || '',
};`,
    };

    @node({
        id: 'e330d3aa-2185-4fb8-bf37-2dd7e8535bb0',
        name: 'Sem email?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-800, 1584],
    })
    SemEmail = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '3775e23a-34c6-4ab6-96a6-f239d7ab68c1',
                    leftValue: '={{ $json.email }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'empty',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: 'c513660a-f4e2-4b65-a2db-bcc603e6e5ad',
        name: 'HTTP contactos',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [4720, -2352],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
        waitBetweenTries: 2000,
    })
    HttpContactos = {
        url: '={{ $json.fetch_url }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (compatible; ContactBot/1.0)',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: '736ff462-870b-4f4c-8616-db11465a5c36',
        name: 'tenta possíveis routes de contactos',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3808, -2336],
    })
    TentaPossiveisRoutesDeContactos = {
        jsCode: `//const input = $input.first().json;
//const input = $('Loop Over Items').item.json;
//const input = {...$('calcula domínio do site').item.json};
const input = $('calcula domínio do site').item.json;
const base = input.Final_url.replace(/\\/+$/, '');
const prevousUrls = $input.all()?.map(u=>u.json.fetch_url);

const paths = [
  '/',
  '/contactos',
  '/contacts',
  '/contact',
  '/contacto',
  '/contact-us',
  '/sobre',
  '/about',
  '/about-us',
  '/impressum',
].map(p => base + p);

//console.log($input.all().length);

return [...paths,...prevousUrls].map(p => {
  var _return = {...input};
  _return.fetch_url = p;
  _return.source_type = 'scrape';
  return _return;
    /*{
    json: {
      input,
      fetch_url: p,
    }*/
  }
);`,
    };

    @node({
        id: '2c3bf89d-397c-4bce-957d-009c8a178570',
        name: 'procura mailto tags',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-528, 1504],
    })
    ProcuraMailtoTags = {
        jsCode: `function extractMailtos(html) {
  const results = [];
  const regex = /href=["']mailto:([^"'?#]+)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const email = decodeURIComponent(match[1]).toLowerCase().trim();
    if (email.includes('@')) results.push(email);
  }
  return [...new Set(results)];
}

function extractObfuscated(html) {
  const results = [];

  // 1. HTML entity decoding: &#64; &#46; &#x40; &#x2e;
  const entityDecoded = html
    .replace(/&#64;/g, '@')
    .replace(/&#46;/g, '.')
    .replace(/&#x40;/gi, '@')
    .replace(/&#x2e;/gi, '.')
    .replace(/&#0*64;/g, '@')
    .replace(/&#0*46;/g, '.');

  const entityEmails = entityDecoded.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi
  ) || [];
  results.push(...entityEmails);

  // 2. [at] / [dot] style obfuscation
  const atDotRegex =
    /[a-zA-Z0-9._%+-]+\\s*[\\[({<]\\s*(?:at|arroba)\\s*[\\])}>]\\s*[a-zA-Z0-9.-]+\\s*[\\[({<]\\s*(?:dot|ponto)\\s*[\\])}>]\\s*[a-z]{2,}/gi;
  const atDotMatches = html.match(atDotRegex) || [];

  for (const raw of atDotMatches) {
    const cleaned = raw
      .replace(/\\s*[\\[({<]\\s*(?:at|arroba)\\s*[\\])}>]\\s*/gi, '@')
      .replace(/\\s*[\\[({<]\\s*(?:dot|ponto)\\s*[\\])}>]\\s*/gi, '.')
      .toLowerCase()
      .trim();
    if (cleaned.includes('@')) results.push(cleaned);
  }

  // 3. Spaced out: "info @ empresa . pt" or "info (at) empresa (dot) pt"
  const spacedAtRegex =
    /[a-zA-Z0-9._%+-]+\\s+(?:@|at|arroba)\\s+[a-zA-Z0-9.-]+\\s+(?:\\.|dot|ponto)\\s+[a-z]{2,}/gi;
  const spacedMatches = html.match(spacedAtRegex) || [];

  for (const raw of spacedMatches) {
    const cleaned = raw
      .replace(/\\s+(?:@|at|arroba)\\s+/gi, '@')
      .replace(/\\s+(?:\\.|dot|ponto)\\s+/gi, '.')
      .toLowerCase()
      .trim();
    if (cleaned.includes('@')) results.push(cleaned);
  }

  // 4. Cloudflare email protection
  const cfeRegex = /data-cfemail=["']([a-f0-9]+)["']/gi;
  let cfeMatch;
  while ((cfeMatch = cfeRegex.exec(html)) !== null) {
    try {
      const hex = cfeMatch[1];
      const key = parseInt(hex.substr(0, 2), 16);
      let email = '';
      for (let i = 2; i < hex.length; i += 2) {
        email += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ key);
      }
      if (email.includes('@')) results.push(email.toLowerCase());
    } catch {
      // skip malformed
    }
  }

  // 5. JavaScript document.write / String.fromCharCode patterns
  const charCodeRegex = /String\\.fromCharCode\\(([0-9,\\s]+)\\)/gi;
  let ccMatch;
  while ((ccMatch = charCodeRegex.exec(html)) !== null) {
    try {
      const decoded = ccMatch[1]
        .split(',')
        .map(n => String.fromCharCode(parseInt(n.trim(), 10)))
        .join('');
      const innerEmails = decoded.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi
      ) || [];
      results.push(...innerEmails.map(e => e.toLowerCase()));
    } catch {
      // skip malformed
    }
  }

  // 6. Reverse string trick: "tp.aserpm@laregog" → "geral@empresa.pt"
  const reverseRegex = /["']([a-z]{2,}\\.[a-zA-Z0-9.-]+@[a-zA-Z0-9._%+-]+)["']/g;
  let revMatch;
  while ((revMatch = reverseRegex.exec(html)) !== null) {
    const reversed = revMatch[1].split('').reverse().join('').toLowerCase();
    if (reversed.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}$/)) {
      results.push(reversed);
    }
  }

  // Deduplicate
  return [...new Set(results.map(e => e.toLowerCase().trim()))];
}

function getCompanyDomain(websiteNorm) {
  try {
    const host = new URL(websiteNorm).hostname;
    // "www.empresa.pt" → "empresa.pt"
    return host.replace(/^www\\./, '');
  } catch { return ''; }
}

function filterAndRank(emailResults, companyDomain) {
  return emailResults
    .filter(e => e.score > -5)
    .map(e => ({
      ...e,
      isCompanyDomain: e.email.endsWith('@' + companyDomain),
    }))
    .sort((a, b) => {
      // Company domain first, then by score
      if (a.isCompanyDomain !== b.isCompanyDomain) return b.isCompanyDomain - a.isCompanyDomain;
      return b.score - a.score;
    });
}

function extractEmailsWithContext(html) {
  // Strip tags but keep structure hints
  const lines = html
    .replace(/<br\\s*\\/?>/gi, '\\n')
    .replace(/<\\/?(p|div|li|td|tr|h\\d)[^>]*>/gi, '\\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\\n');

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi;
  const results = [];

  for (const line of lines) {
    const found = line.match(emailRegex) || [];
    for (const email of found) {
      const ctx = line.toLowerCase();
      let score = 0;
      let role = 'unknown';

      // Context scoring
      if (/mailto:/i.test(line))                    score += 3;
      if (/contact|contacto/i.test(ctx))            { score += 2; role = 'contact'; }
      if (/geral|general|info/i.test(email))        { score += 3; role = 'general'; }
      if (/comercial|sales|vendas/i.test(ctx))      { score += 1; role = 'sales'; }
      if (/suporte|support|help/i.test(ctx))        { score += 1; role = 'support'; }
      if (/rh|hr|recurso|career/i.test(ctx))        { score += 0; role = 'hr'; }
      if (/fatura|invoice|billing|contab/i.test(ctx)) { score += 0; role = 'billing'; }
      if (/footer|rodapé/i.test(ctx))               score += 1;

      // Penalties
      if (/noreply|no-reply|mailer/i.test(email))   score -= 10;
      if (/example\\.com|test\\.|localhost/i.test(email)) score -= 10;
      if (/\\.png|\\.jpg|\\.gif|\\.svg/i.test(email))   score -= 10;
      if (/wix|wordpress|squarespace/i.test(email)) score -= 5;
      if (/@sentry|@github|@google/i.test(email))   score -= 5;

      results.push({
        email: email.toLowerCase(),
        score,
        role,
        context: line.trim().substring(0, 120),
      });
    }
  }

  return results;
}

const html = $input.last().json.data;
const companyDomain = getCompanyDomain($('Loop Over Items').first().json.Final_url);

// 1. Mailto links (highest trust)
const mailtos = extractMailtos(html);

// 2. Obfuscated emails
const deobfuscated = extractObfuscated(html);

// 3. Context-aware regex
const contextual = extractEmailsWithContext(html);

// 4. Merge & deduplicate
const allEmails = new Map();
for (const e of [...mailtos.map(m => ({ email: m, score: 5, role: 'mailto' })),
                  ...deobfuscated.map(d => ({ email: d, score: 4, role: 'deobfuscated' })),
                  ...contextual]) {
  const key = e.email.toLowerCase();
  if (!allEmails.has(key) || allEmails.get(key).score < e.score) {
    allEmails.set(key, e);
  }
}

// 5. Filter & rank
const ranked = filterAndRank([...allEmails.values()], companyDomain);

// 6. Pick best
const best = ranked[0]?.email ?? '';
const bestGeneral = ranked.find(e => e.role === 'general')?.email ?? '';
const bestContact = ranked.find(e => e.role === 'contact')?.email ?? '';

return {
  ...$input.last().json,
  email_best: bestGeneral || bestContact || best,
  email_all: ranked.filter(e => e.isCompanyDomain).map(e => e.email),
  email_details: ranked.slice(0, 10), // top 10 for debugging
  email_source: ranked[0]?.role ?? 'none',
  email_count: ranked.filter(e => e.isCompanyDomain).length,
};`,
    };

    @node({
        id: '1e9b629d-6477-4d4f-9668-6eb0446c3df8',
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-944, -224],
        alwaysOutputData: true,
    })
    Merge = {
        mode: 'combineBySql',
        numberInputs: 3,
        query: `SELECT
  urlChecks.RUN_ID   AS Run_ID,
  urlChecks.ENTITY_KEY AS Entity_key,
  urlChecks.Final_URL  AS Final_url
FROM input1 AS urlChecks
WHERE urlChecks.Final_URL IS NOT NULL
  AND urlChecks.Final_URL != ''`,
        options: {
            emptyQueryResult: 'empty',
        },
    };

    @node({
        id: 'acda1cd2-c82c-4803-b4b3-dee35f879eeb',
        name: 'Cliente_BD_OUTPUT / URL_CHECKS',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1184, -512],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: false,
    })
    ClienteBdOutputUrlChecks = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        options: {},
    };

    @node({
        id: '656830fb-5b86-47ec-b2c1-bee5ac8de45c',
        name: 'Cliente_BD_OUTPUT / CONTROL_EXEC',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1232, -272],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: false,
    })
    ClienteBdOutputControlExec = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        options: {},
    };

    @node({
        id: '5e784802-d58e-451c-8376-387cfc09cb50',
        name: 'STATE · Update CONTROL_EVIDENCE',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4368, -2944],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlEvidence = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: "={{ $('Loop Over Items').item.json.Run_ID }}",
                Entity_key: "={{ $('Loop Over Items').item.json.Entity_key }}",
                Extracted_at: '={{ $now.toISO() }}',
                'Source_type  (input | serpapi | scrape | openai)': 'serpapi',
                Source_url: '={{ $json.source_url }}',
                Value: '={{ $json.value }}',
                'Field (phone | email | internet)': '={{ $json.field }}',
            },
            matchingColumns: ['Exec_KEY'],
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
        id: 'd203a165-ca33-4576-9ab5-846e805d6832',
        name: 'SerpAPI website contactos',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [352, -128],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
        alwaysOutputData: true,
    })
    SerpapiWebsiteContactos = {
        url: '=https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: '=q',
                    value: `=site:{{ $('calcula domínio do site').item.json.Final_url }} (
  inurl:contact OR inurl:contacts OR
  inurl:contacto OR inurl:contactos OR
  inurl:contato OR inurl:contatos OR
  inurl:"fale-connosco" OR inurl:"fale-conosco" OR
  inurl:about OR inurl:"about-us" OR
  inurl:sobre OR inurl:"quem-somos" OR
  inurl:privacy OR inurl:privacidade OR
  inurl:rgpd OR inurl:legal OR inurl:impressum OR
  inurl:policies OR inurl:"contact-information" OR inurl:"pages/contact"
)
`,
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
            ],
        },
        options: {
            allowUnauthorizedCerts: false,
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
        id: 'f7f4fa6a-f2f0-484a-877a-9197f5a4f2d2',
        name: 'Merge1',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [6480, -1504],
    })
    Merge1 = {};

    @node({
        id: 'c1b876a7-cfc7-48c5-b44c-74ca94087bfd',
        name: 'Smart scrape page',
        type: 'n8n-nodes-base.airtop',
        version: 1,
        position: [-720, 1232],
        credentials: { airtopApi: { id: 'tfAiqtc7MlXa3Nlx', name: 'Airtop account' } },
    })
    SmartScrapePage = {
        resource: 'extraction',
        operation: 'scrape',
        sessionMode: 'new',
        url: 'www.recheio.pt/portal/contact-us',
    };

    @node({
        id: '92fa05ca-e580-4d2f-88da-de3f4fe70ae8',
        name: 'Markdown',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [4720, -2672],
    })
    Markdown = {
        html: '={{ $json.data }}',
        options: {},
    };

    @node({
        id: '98287283-dade-4a15-89c4-a9b251a161ae',
        name: 'Code in JavaScript1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4544, -2672],
    })
    CodeInJavascript1 = {
        jsCode: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one

return [...$input.all().filter(y => y.json.data)];`,
    };

    @node({
        id: '6255a739-61e6-4c54-8bf0-40bdc2be0685',
        name: 'Message a model',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [5184, -2704],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
    })
    MessageAModel = {
        modelId: {
            __rl: true,
            value: 'codex-mini-latest',
            mode: 'list',
            cachedResultName: 'CODEX-MINI-LATEST',
        },
        responses: {
            values: [
                {
                    role: 'system',
                    content: `És um agente que lê o markdown de um site e analisa o seu conteúdo detalhadamente. O Conteúdo veio de um site de uma empresa.
O teu papel é encontrar dados de contacto sobre essa mesma empresa (emails, telefones,faxes).
Deves seguir os vários links que fores encontrando (com o mesmo domínio) até encontrares dados.
Retorna um json no seguinte formato:

{
emails:[],
phones:[],
faxes:[]
}`,
                },
                {
                    content: '={{ $json.data }}',
                },
            ],
        },
        builtInTools: {},
        options: {},
    };

    @node({
        id: '8b23d1be-1df2-4293-a93f-78dedb7bc945',
        name: 'OPENAI - Pesquisa site da empresa',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [-736, 2096],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    OpenaiPesquisaSiteDaEmpresa = {
        modelId: {
            __rl: true,
            value: 'chatgpt-4o-latest',
            mode: 'list',
            cachedResultName: 'CHATGPT-4O-LATEST',
        },
        responses: {
            values: [
                {
                    role: 'system',
                    content: `És um agente que pesquisa um determinado site de uma empresa, analisa o seu conteúdo detalhadamente, e tenta encontrar dados de contacto institucional sobre essa mesma empresa (emails, telefones,faxes).

Deves seguir os vários links que fores encontrando (com o mesmo domínio) até encontrares dados.

Não pares quando já tiveres encontrado alguns. Procura pelo máximo de contactos que encontrares.

Retorna APENAS um json no seguinte formato (sem mais texto na tua resposta):

[{
	field: contect type (email/fax/phone),
	value: value for the field,
	source_url: url for the source
}] `,
                },
                {
                    content:
                        '=pesquisa o site {{ $json.Final_url }} da empresa {{ $json.Nome }} e procura por contactos institucionais',
                },
            ],
        },
        builtInTools: {},
        options: {},
    };

    @node({
        id: '5ddfd614-ea49-4baf-8d75-267705866426',
        name: 'Get Results Array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-400, 2096],
        alwaysOutputData: true,
    })
    GetResultsArray = {
        jsCode: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for (const item of $input.all()) {

  var jsonString = item.json.output[0].content[0].text
  .replace('\`\`\`json','')
  .replace('\`\`\`','');

  var _return= JSON.parse(jsonString);
}
return $input.all();

return _return.map(t=>({...t,source_type: 'openai'}));`,
    };

    @node({
        id: '038c0d10-bd8c-4cc2-a03d-310b08deeb7b',
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4960, -2944],
        alwaysOutputData: true,
    })
    CodeInJavascript = {
        jsCode: "return $input.all().filter(u=> u.json.data?.trim()!='');",
    };

    @node({
        id: 'bc0cfbf9-91bf-4185-87b9-600aaea2812e',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [4912, -2672],
        alwaysOutputData: true,
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'a016a7ce-726f-4dff-a2f0-b7bfa0add076',
                    leftValue: '={{ $json.data }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'db5ccaef-c0c8-4268-a6d0-306d29c8b0a0',
        name: 'STATE · Update CONTROL_EVIDENCE1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4640, -3008],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlEvidence1 = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: "={{ $('Loop Over Items').item.json.Run_ID }}",
                Entity_key: "={{ $('Loop Over Items').item.json.Entity_key }}",
                Extracted_at: '={{ $now.toISO() }}',
                'Source_type  (input | serpapi | scrape | openai)': 'openai',
                Source_url: '={{ $json.source_url }}',
                Value: '={{ $json.value }}',
                'Field (phone | email | internet)': '={{ $json.field }}',
            },
            matchingColumns: ['Exec_KEY'],
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
        id: 'cc878570-a8db-4af8-9f85-1aefceae06b8',
        name: 'STATE · Update CONTROL_EVIDENCE2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [6864, -1184],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
    })
    StateUpdateControlEvidence2 = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Extracted_at: '={{ $now.toISO() }}',
                'Source_type  (input | serpapi | scrape | openai)': '={{ $json.source_type }}',
                Source_url: '={{ $json.source_url }}',
                Value: "={{ $json.value.replace('+','\\'+') }}",
                'Field (phone | email | internet)': '={{ $json.field }}',
                Confidence: '={{ $json.confidence }}',
            },
            matchingColumns: ['Exec_KEY'],
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
        options: {
            locationDefine: {
                values: {},
            },
            useAppend: true,
        },
    };

    @node({
        id: 'd7dd6861-ac01-4e71-8101-02bd2df02273',
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [5712, -2256],
    })
    Merge2 = {};

    @node({
        id: '9583fa27-5d15-4090-ac90-6f1b44d18c0f',
        webhookId: '37e0dcb8-6cd2-43c4-9bd2-faaba8b3e39f',
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [6640, 816],
    })
    Wait = {
        amount: 2,
    };

    @node({
        id: 'ca689547-8778-45ca-8ede-22a39a2179f7',
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [48, -416],
    })
    StickyNote1 = {
        content: '## SerpAPI by website /tries to find official contacts  page',
        height: 880,
        width: 2884,
        color: 5,
    };

    @node({
        id: '8951d6f9-5615-40e9-80b2-386fc7c317ef',
        name: 'Sticky Note2',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [2896, -2448],
    })
    StickyNote2 = {
        content: '## No results / tries direct access possible contacts page',
        height: 352,
        width: 1104,
    };

    @node({
        id: 'c6f76da3-5261-4a07-bbf0-57e5e400020b',
        name: 'Sticky Note3',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-768, 2032],
    })
    StickyNote3 = {
        content: '## openai agent bywebsite',
        height: 240,
        width: 656,
        color: 4,
    };

    @node({
        id: '80b2fdba-d494-4254-af4b-059d3495098f',
        name: 'Cliente_BD_OUTPUT / INPUT_SNAPSHOT',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1200, -48],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    ClienteBdOutputInputSnapshot = {
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'INPUT_SNAPSHOT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=0',
        },
        options: {},
    };

    @node({
        id: '21d3db46-8807-4979-98ed-cd40a47a9b75',
        name: 'valida domínio nos resultados',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [768, -32],
        alwaysOutputData: true,
    })
    ValidaDominioNosResultados = {
        jsCode: `// gets first result
//const results = $input.last()?.json?.body.organic_results ?? [];
const results = $input.all().map(o=>o.json).filter(i=>i.body?.organic_results!=null).flatMap(obj => obj?.body?.organic_results) ?? [];

//set results links domain
for (const item of results) {
  const website = item.link.trim();    
  const domain = website
  .replace(/^https?:\\/\\//i, '')
  .split('/')[0]
  .replace(/^www\\./i, '')
  .toLowerCase();
  
  item.domain= domain;
}

const input = $('calcula domínio do site').item.json;

if (results.length>0) 
   
  return [{
  json: {
    ...input,
    fetch_url: results.filter(y=>y.domain === input.targetDomain).map(i =>i.link),
    source_type: 'serpapi',
    snipets:  results.filter(y=>y.domain === input.targetDomain).map(i =>
      i.snippet
        //.toLowerCase()
        //.replace(/\\n/g, '')      // Remove newlines
        //.replace(/-/g, '')        // Remove hyphens
        //.replace(/\\?/g, '')       // Remove question marks
)
  }
}];
else return [];`,
    };

    @node({
        id: 'a4fc621d-068a-42ec-b552-62fe3703fae4',
        name: 'Split Out',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [4432, -2352],
    })
    SplitOut = {
        fieldToSplitOut: 'fetch_url',
        include: 'allOtherFields',
        options: {},
    };

    @node({
        id: '46e406c8-123e-493e-9661-531ace018b75',
        name: 'Transform to contacts array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5968, -2064],
        alwaysOutputData: true,
    })
    TransformToContactsArray = {
        jsCode: `//const url = $('Split Out').last().json.fetch_url;
let _return = [];

// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for(const item of $input.all().filter(i=>i.json.input?.fetch_url!=null)){
  const url = item.json.input.fetch_url;
  const source_type = item.json.input.source_type;
  const runid = item.json.input.Run_ID;
  const entitykey = item.json.input.Entity_key;
  
  const input = item.json;
    
  var faxes= [...new Set(input.faxes)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'fax',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==item.json.input.Fax?.toString().substring(-9) ? 1: 0
    }));
  
  var emails= [...new Set(input.emails)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'email',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.trim()==item.json.input.Email?.trim() ? 1: 0
    }));
  
  var phones= [...new Set(input.phones)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'phone',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==item.json.input.Telefone?.toString().toString()?.substring(-9) ? 1: 0
    }));
  
  _return=_return.concat( [...emails, ...phones, ...faxes] );
};

//retirar repetidos
var uniqueData = _return.filter((item, index) => {
  return index === _return.findIndex(el => 
    el.field === item.field && el.value === item.value
  );
});

//retira telefone que já existem como faxes
var allFaxes = uniqueData.filter(o=>o.field=='fax').map(i=>i.value.substring(-9));
var phonesToRemove = uniqueData.filter(o=>o.field=='phone' && allFaxes.includes(o.value.substring(-9))).map(p=>p.value);
uniqueData = uniqueData.filter(y=> y.field != 'phone' || !phonesToRemove.includes(y.value));

return uniqueData;`,
    };

    @node({
        id: '2e7d1f2b-9334-4c05-975b-569fac475fe7',
        name: 'SerpAPI website contactos1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [352, 48],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
        alwaysOutputData: true,
    })
    SerpapiWebsiteContactos1 = {
        url: '=https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: '=q',
                    value: `=site:{{ $('calcula domínio do site').item.json.Final_url }} (
  "@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  "info@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  "geral@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  "contact@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  "marketing@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  "admin@{{ $('calcula domínio do site').item.json.Final_url }}" OR
  email OR "e-mail" OR "correio" OR "correio electrónico" OR "correio electronico" OR
  telefone OR phone OR tel OR
  morada OR address OR localização OR location OR
  rgpd OR privacidade OR termos OR legal OR impressum OR
  "+351" OR "00351"
)
`,
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
            ],
        },
        options: {
            allowUnauthorizedCerts: false,
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
        id: 'c7fa2e3d-dafc-47d6-a282-ff6348b60695',
        name: 'Merge4',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [576, -32],
    })
    Merge4 = {};

    @node({
        id: 'cf0331e3-7b0f-4154-84a3-146ca4729609',
        name: 'Retira contactos do snipet',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1184, 160],
        alwaysOutputData: true,
    })
    RetiraContactosDoSnipet = {
        jsCode: `const phoneRegex = /(?<!\\d)(?:\\+351[\\s.-]?)?(?:2[1-9]\\d|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3}(?!\\d)/g;

// Loop over input items and add a new field called 'myNewField' to the JSON of each one
const ipt = $input.first()?.json;
let _return =[];

ipt.snipets.map((serp_text,i) => {
  let input = {...ipt};
  let fetch_url = input.fetch_url[i];
  delete input.snipets;
  delete input.fetch_url;
  input.fetch_url=fetch_url;
  input.source_type= 'serpapi';
  
  // Item 1 - Email extraction
  const email = (() => {
    const text = serp_text.toLowerCase();
    const emailIndex = text.indexOf("emptystring");
    if (emailIndex === -1) {
      const startIndex = text.indexOf(".com");
      const parts = text.substring(0, startIndex + 4).split(" ");
      const joined = parts.join("");
      return joined.replace(/,/g, "");
    }
    return "";
  })();
  
  // Item 2 - Phone extraction
  const phone = (() => {
    const text = serp_text.toLowerCase();
    if (text.includes("telefone:")) {
      const startIndex = text.indexOf("telefone:") + 9;
      const phoneText = text.substring(startIndex, startIndex + 20);
      const parts = phoneText.split(" ");
      const phone = parts[0].replace(/[^\\d+]/g, "");
      return phone;
    }
    return "";
  })();
  
  // Item 3 - Address extraction
  const address = (() => {
    const text = serp_text.toLowerCase();
    if (text.includes("morada")) {
      const startIndex = text.indexOf("morada") + 6;
      const addressText = text.substring(startIndex, startIndex + 100);
      const address = addressText.split(",")[0].trim();
      return address;
    }
    return "";
  })();

  const emails = serp_text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi
  ) || [];
    
  //console.log(phones.join(' '));
  // Fax: look for "fax" keyword nearby
  const faxMatches = serp_text.match(
    /(?:fax|telecópia|facsimile)[:\\s]*([+\\d\\s.()\\-]{9,})/gi
  ) || [];
  const faxes = faxMatches.map(f =>
    f.replace(/^(fax|telecópia|facsimile)[:\\s]*/i, '').trim()
  );

  // Portuguese phones: +351, 2xx, 9xx formats
  ///(?:\\+351[\\s.-]?)?(?:2\\d{1,2}|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3,4}/g
  const phones = (serp_text.match(phoneRegex  
  ) || []).filter(i=> !faxes.includes(i));

   const addresses = serp_text.match(/Morada\\s+(.+?)\\s*;/) || [];
  
  _return.push({
    json: {
      input,
      emails: emails,
      phones: phones,
      faxes: faxes,
      addresses: addresses
    }
  });
});

return _return;`,
    };

    @node({
        id: '2711729a-c3bd-4947-8e1e-a18c902161e4',
        name: 'If any results1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [928, 1984],
    })
    IfAnyResults1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $json.fetch_url }}',
                    rightValue: '',
                    operator: {
                        type: 'array',
                        operation: 'exists',
                        singleValue: true,
                    },
                },
                {
                    id: 'bdacdd94-cd29-471c-b213-382f3245012e',
                    leftValue: '={{ $json.fetch_url }}',
                    rightValue: 0,
                    operator: {
                        type: 'array',
                        operation: 'lengthNotEquals',
                        rightType: 'number',
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: '032d4cbc-82ad-46cf-bd3f-fb2fac8c8a8a',
        name: 'No results?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [976, -32],
        executeOnce: false,
    })
    NoResults = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $input.all().length==1 && $input.first().json.keys()==0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: 'd7272089-4077-4933-94af-a1a53b39b565',
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.4,
        position: [-432, -1936],
    })
    Switch_ = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.Queued_action }}',
                                rightValue: 'ENRICH_FROM_WEBSITE',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                                id: '3cc0c2d6-aedf-406a-964d-7de2d836e59f',
                            },
                        ],
                        combinator: 'and',
                    },
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                id: '2fc5582b-bcb5-447a-be2e-a46613dde1b0',
                                leftValue:
                                    "={{ $json.Queued_action ==='DISCOVER_URL' &&  $json.Current_phase==='URL_FAILED' }}",
                                rightValue: '',
                                operator: {
                                    type: 'boolean',
                                    operation: 'true',
                                    singleValue: true,
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: '={{ false }}',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        id: '250d2a70-5e0e-40d0-ba49-71b09db638ab',
        name: 'HTTPS site url',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [736, 1488],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    HttpsSiteUrl = {
        url: "=https://{{ $('Original Item').item.json.Internet }}",
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: '79fdff73-3961-49f5-aa9f-d598e30c7ecc',
        name: 'HTTP site url',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1328, 1424],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    HttpSiteUrl = {
        url: "=http://{{ $('Switch').item.json.Internet }}",
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (compatible; ContactBot/1.0)',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                    neverError: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: '4c802405-6515-49b7-818d-feaf24f40968',
        name: 'NO HTTPS?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [944, 1488],
    })
    NoHttps = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '56b4b84b-ad9f-4029-b39e-37b011f2684d',
                    leftValue: '={{ $json.error == null}}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'false',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: '={{ false }}',
        options: {
            ignoreCase: true,
        },
    };

    @node({
        id: 'ac2c8410-acc1-4b92-aada-1ae2b58bc3d8',
        name: 'Code in JavaScript2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-576, 1760],
    })
    CodeInJavascript2 = {
        mode: 'runOnceForEachItem',
        jsCode: `const url = $json.Internet;

async function resolveRedirect(ctx, u) {
  console.log(url);
  try{
    const response = await ctx.helpers.httpRequest({
    url: 'http://'+u,
    method: 'GET',    
    returnFullResponse: true,
    });
  
   
    const req = response?.request || {};
     console.log(response);
    const finalUrl =
      req.href ||
      req.url ||
      (req.uri && req.uri.href) ||
      u;
   //console.log(response);
    return {
      originalUrl: u,
      finalUrl,
      statusCode: response.statusCode,
    };
  }catch(e){
    console.log('erro');
    return e;
  };
}

const result = await resolveRedirect(this, url);

return [{ json: result }];`,
    };

    @node({
        id: '35d53162-6be8-4196-aea2-eaf2d218f6d7',
        name: 'retorna dados',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1520, 1568],
    })
    RetornaDados = {
        mode: 'runOnceForEachItem',
        jsCode: `const html = $json.data || '';

// Look for a meta refresh with a URL=
const match = html.match(/<meta[^>]*http-equiv=["']?refresh["'][^>]*content=["'][^"']*url=([^"'>]+)["'][^>]*>/i);

const hasMetaRefresh = !!match;
//console.log(hasMetaRefresh);
const redirectUrl = hasMetaRefresh ? match[1].trim() : null;
//console.log(redirectUrl);

return  {
    json: {
      hasMetaRefresh,
      redirectUrl,
      data: html
    }
  }
;
`,
    };

    @node({
        id: '7ab6ef0f-0840-4f88-8675-13602e64dab2',
        name: 'respondeu sem dados?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [2304, 1456],
    })
    RespondeuSemDados = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'b4c6e97c-8f4d-4fcd-a7bb-747dfdaa74ce',
                    leftValue: '={{ $json.data ==null }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'f9eb0748-8160-4930-993b-b21f8e8fd718',
        name: 'substitui url do input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2560, 1632],
    })
    SubstituiUrlDoInput = {
        mode: 'runOnceForEachItem',
        jsCode: `const input = $('Original Item').item.json;

//https://{{ $json.Internet }}
//http://{{ $('Switch').item.json.Internet }}
//{{ $json.redirectUrl }}

var Final_url = 'https://' +input.Internet;

try {
  const temp = $('HTTP site url').item;
  Final_url = 'http://' +input.Internet;
} catch(ex){}

try {
  const temp = $('Call redirect website').item;  
  const item =$('If HTML refresh').item.json;
  Final_url = item.redirectUrl;
} catch(ex){}

input.Final_url = Final_url;
input.data = $json.data;

return input;//$input.item;`,
    };

    @node({
        id: 'b73f515f-6ede-486c-8ce1-822759959f3a',
        name: 'STATE · Update CONTROL_EVIDENCE3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2848, 1360],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlEvidence3 = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.Run_ID }}',
                Extracted_at: '={{ $now.toISO() }}',
                Confidence: '=1',
                row_number: 0,
                'Field (phone | email | internet)': 'internet',
                'Source_type  (input | serpapi | scrape | openai)': 'scrape',
                Value: '={{$json.Final_url}}',
                Source_url: '={{$json.Final_url}}',
                Entity_key: '={{ $json.Entity_key }}',
            },
            matchingColumns: ['Exec_KEY'],
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
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '3d2a86b4-0c46-4870-ba29-63f8d2b7f39a',
        name: 'Call redirect website',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [2096, 1456],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    CallRedirectWebsite = {
        url: '={{ $json.redirectUrl }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (compatible; ContactBot/1.0)',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                    neverError: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: 'f778468c-5db0-4ce2-a1f4-7e60e0c98bef',
        name: 'If HTML refresh',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1696, 1568],
    })
    IfHtmlRefresh = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '101eec48-7600-48e4-9c40-4140ccfbc67b',
                    leftValue: '={{ $json.hasMetaRefresh }}',
                    rightValue: false,
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '37a73204-69d8-45db-8aa3-f926902a79cb',
        name: 'filtra resultados para testes',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-752, -208],
    })
    FiltraResultadosParaTestes = {
        jsCode: `// Map URL_CHECKS columns to the field names expected downstream.
// RUN_ID and ENTITY_KEY come directly from the sheet; Fall back to execution id if missing.
var _return = $input.all();
for (var item of _return) {
  if (!item.json.Run_ID)    item.json.Run_ID    = item.json.RUN_ID    || String(+$execution?.id || '');
  if (!item.json.Entity_key) item.json.Entity_key = item.json.ENTITY_KEY || item.json.Entity_key || '';
  if (!item.json.Final_url)  item.json.Final_url  = item.json.Final_URL  || '';
}
return _return;`,
    };

    @node({
        id: '6551e9e3-80b4-4191-ba92-bf8a46d37d43',
        name: 'calcula domínio do site',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-128, -16],
    })
    CalculaDominioDoSite = {
        mode: 'runOnceForEachItem',
        jsCode: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
const item = $json
const website = (item.Final_url || '').trim();  
const domain = website
.replace(/^https?:\\/\\//i, '')
.split('/')[0]
.replace(/^www\\./i, '')
.toLowerCase();

item.targetDomain= domain;

return item;`,
    };

    @node({
        id: '2864be2c-7aa3-4891-98d9-903b9879a84a',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [912, 1200],
    })
    StickyNote = {
        content: '## Website não validado',
        height: 640,
        width: 2432,
        color: 3,
    };

    @node({
        id: 'd3c0c2eb-4d65-40e0-a515-72ecee33290c',
        name: 'No results?1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [6544, -1200],
        executeOnce: false,
    })
    NoResults1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $input.all().length==1 && $input.first().json.keys()==0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: '85b3933c-d651-4398-83f2-999eab3f3481',
        name: 'Markdown1',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [4784, -1504],
        onError: 'continueRegularOutput',
    })
    Markdown1 = {
        html: '={{ $json.data }}',
        destinationKey: 'markdown',
        options: {},
    };

    @node({
        id: 'c5cd150a-28bb-4567-9250-065777b6c6fc',
        name: 'searches links to contact pages',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3600, -2336],
        alwaysOutputData: true,
    })
    SearchesLinksToContactPages = {
        mode: 'runOnceForEachItem',
        jsCode: `// Code node: "ExtractContactLinks" (Run Once for Each Item)
// Input: $json.data = HTML, $json.baseUrl = site URL

//const input = $('calcula domínio do site').item.json;
const htmlRaw = $json.data || '';
const html = htmlRaw.toLowerCase();
const baseUrl = $('calcula domínio do site').item.json.Final_url || '';

const links = [];
let match;

// Match <a href="..." >...</a> - like Make's href parsing
const linkRegex = /<a\\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\\/a>/gis;

while ((match = linkRegex.exec(htmlRaw)) !== null) {
  const rawHref = match[1].trim();
  const rawText = match[2].trim();

  // Skip empty/junk
  if (!rawHref || rawHref === '#') continue;

  const text = rawText.replace(/\\s+/g, ' ').trim();
  
  // Clean query params (like Make's split(href, "?")[0])
  const cleanHref = rawHref.split('?')[0].split('#')[0];

  // Score by keywords (like Make's ">contat" / ">contact")
  const score = scoreLink(cleanHref, text);

  if (score > 0) {
    const url = toAbsolute(cleanHref, baseUrl);
    
    if (!links.map(o=>o.hrefFull).includes(url))
      links.push({
        text,
        hrefRaw: rawHref,
        hrefClean: cleanHref,
        hrefFull: url,
        score,
      });
  }
}

// Helpers (same as before)
function scoreLink(href, text) {
  const c = (text + ' ' + href).toLowerCase();
  const keywords = ['contact', 'contato', 'contacto', 'contat', 'contacts', 'contatos', 'contactos'];
  let score = 0;
  for (const kw of keywords) {
    if (c.includes(kw)) score += 10;
  }
  if (/tel:/i.test(href)) score += 20;
  if (/mailto:/i.test(href)) score += 20;
  return score;
}

function toAbsolute(href, base) {
  try {
    if (/^https?:\\/\\//i.test(href)) return href;
    if (/^(mailto|tel):/i.test(href)) return href;
    if (!base) return href;
    //return new URL(href, base).toString();
    return \`\${base}\${href}\`
  } catch {
    return href;
  }
}

// Sort best first
//links.sort((a, b) => b.score - a.score);
//return links.map(o=>o.hrefFull);

return {
  json: {
    //...$json,  // preserve original
    //input,
    fetch_url:links.map(o=>o.hrefFull),
    //bestContactLink: links[0] || null,
  },
};`,
    };

    @node({
        id: 'c61c3257-606a-4b98-8589-334a20d5d724',
        name: 'Call website',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [3152, -2320],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
    })
    CallWebsite = {
        url: "={{ $('calcula domínio do site').item.json.Final_url }}",
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: 'c46c8649-ce0e-463d-8737-a8823aad2103',
        name: 'Empty?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [352, -2464],
    })
    Empty = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '3de6ddfa-aec5-4427-97be-efb438364824',
                    leftValue: '={{ $json!=={} && $json.fetch_url.length>0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'd1b18386-eaaf-466d-b913-7be103831220',
        name: 'Get Item',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6816, -1344],
    })
    GetItem = {
        jsCode: `const input = $('calcula domínio do site').first().json;

/*for (const item of $input.all()) {
  item.json.myNewField = 1;
}*/

return input;`,
    };

    @node({
        id: 'af741e98-0cdd-49df-8bdb-a73f1683ecb3',
        name: 'STATE · Update NO_EVIDENCES',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [7200, -1104],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateNoEvidences = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1295478207,
            mode: 'list',
            cachedResultName: 'NO_EVIDENCES',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1295478207',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $input.item.json.Run_ID }}',
                Input_Row: '={{ $input.item.json.Input_Row }}',
                Internet: '={{ $input.item.json.Internet }}',
                Email: '={{ $input.item.json.Email }}',
                Fax: '={{ $input.item.json.Fax }}',
                Telefone: '={{ $input.item.json.Telefone }}',
                Distrito: '={{ $input.item.json.Distrito }}',
                Concelho: '={{ $input.item.json.Concelho }}',
                CodPostal: '={{ $input.item.json.CodPostal }}',
                Localidade: '={{ $input.item.json.Localidade }}',
                Morada: '={{ $input.item.json.Morada }}',
                Nome: '={{ $input.item.json.Nome }}',
                NIPC: '={{ $input.item.json.NIPC }}',
                Entidade: '={{ $input.item.json.Entidade }}',
            },
            matchingColumns: ['Exec_KEY'],
            schema: [
                {
                    id: 'Entidade',
                    displayName: 'Entidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'NIPC',
                    displayName: 'NIPC',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Nome',
                    displayName: 'Nome',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Morada',
                    displayName: 'Morada',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Localidade',
                    displayName: 'Localidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'CodPostal',
                    displayName: 'CodPostal',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Concelho',
                    displayName: 'Concelho',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Distrito',
                    displayName: 'Distrito',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Telefone',
                    displayName: 'Telefone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Fax',
                    displayName: 'Fax',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Email',
                    displayName: 'Email',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Internet',
                    displayName: 'Internet',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
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
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Imported_at',
                    displayName: 'Imported_at',
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
        id: '4d6e2622-ae8c-44cb-90a2-7fa5087b45d6',
        name: 'Markdown2',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [944, -2352],
    })
    Markdown2 = {
        html: '={{ $json.data || {} }}',
        options: {},
    };

    @node({
        id: 'f4d0633e-d49d-44b3-bd06-c2bc69f75f7f',
        name: 'Update CONTROL_EXECUTION1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [560, 1488],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution1 = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{ $json.Exec_KEY }}',
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: '={{ $json.Input_Row }}',
                'Entity Name': '={{ $json.Nome }}',
                Current_phase: 'VALIDATE_URL',
                Updated_at: '={{ $now.toISO() }}',
                ID: '={{(+new Date).toString(36).slice(-5) + Math.random().toString(36).substr(2, 5)}}',
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '89c6d96e-560b-4487-8b3d-2075eb994bf2',
        name: 'Original Item',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [416, 1488],
    })
    OriginalItem = {};

    @node({
        id: 'eb0f66cc-caf7-4234-97a8-4509e60d7eb4',
        name: 'Update CONTROL_EXECUTION3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2256, -2192],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution3 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'NO_RESULTS',
                Next_action: 'SCRAP_WEBSITE',
                Queued_action: '=',
                ID: "={{ $('Create CONTROL_EXECUTION SerpAPI').item.json.ID }}",
            },
            matchingColumns: ['ID'],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '17126be8-6c56-4e9e-bb50-dd50c76c6dd6',
        name: 'Update CONTROL_EXECUTION4',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2000, -2288],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution4 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'NO_RESULTS',
                Next_action: 'SCRAP_WEBSITE',
                Queued_action: '=',
                ID: "={{ $('Create CONTROL_EXECUTION SerpAPI').item.json.ID }}",
            },
            matchingColumns: ['ID'],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'f2416e5b-73f7-4d6a-b199-5a5752817664',
        name: 'Markdown3',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [4960, -2352],
        alwaysOutputData: true,
    })
    Markdown3 = {
        html: '={{ $json.data || {} }}',
        options: {
            ignore: 'img',
        },
    };

    @node({
        id: '36707e06-c7b1-41ce-aee7-9e7fe9751277',
        name: 'Website working?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [3328, -2320],
    })
    WebsiteWorking = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '76426532-8187-464a-ae76-49ee32145832',
                    leftValue: '={{ $json.error }}',
                    rightValue: '',
                    operator: {
                        type: 'object',
                        operation: 'notExists',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '41d3d5ea-b22a-4f41-9ae7-b0c59fefbbb4',
        name: 'Update CONTROL_EXECUTION5',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [3040, -2768],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution5 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'WEBSITE_NOT_WORKING',
                Next_action: 'VALIDATE_URL',
                Queued_action: '=',
                ID: "={{ $('Start Scrape Operation').item.json.ID }}",
            },
            matchingColumns: ['ID'],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '6262053d-5c04-455f-a3f5-3e2c79a8fe3b',
        name: 'Start Scrape Operation',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2480, -2368],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StartScrapeOperation = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: "={{ $('calcula domínio do site').item.json.Exec_KEY }}",
                Run_ID: "={{ $('calcula domínio do site').item.json.Run_ID }}",
                Entity_key: "={{ $('calcula domínio do site').item.json.Entity_key }}",
                Input_Row: "={{ $('calcula domínio do site').item.json.Input_Row }}",
                'Entity Name': "={{ $('calcula domínio do site').item.json.Nome }}",
                Current_phase: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
                ID: '={{(+new Date).toString(36).slice(-5) + Math.random().toString(36).substr(2, 5)}}',
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '94762fd0-95f2-4c32-9673-e121a06c089b',
        name: 'Get Item1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3248, -2736],
    })
    GetItem1 = {
        jsCode: `var _return= $('calcula domínio do site').item.json;
_return.Queued_action = 'DISCOVER_URL';
//_return.Current_phase = 'URL_SKIPPED';
_return.Current_phase = 'URL_FAILED';
return _return;`,
    };

    @node({
        id: 'a6811d09-175d-49cd-9595-79dd56ec7642',
        name: 'Update CONTROL_EXECUTION6',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2896, 1600],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution6 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 2081767042,
            mode: 'list',
            cachedResultName: 'SCRAP_EXECUTION',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=2081767042',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                ID: "={{ $('Update CONTROL_EXECUTION1').item.json.ID }}",
                Process_Status: 'WEBSITE_FOUND',
                Next_action: 'SERPAPI_INDEX',
            },
            matchingColumns: ['ID'],
            schema: [
                {
                    id: 'ID',
                    displayName: 'ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity Name',
                    displayName: 'Entity Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '78b7753a-81d5-41fa-96bb-c444d49459ef',
        name: 'Merge3',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [6064, -816],
    })
    Merge3 = {};

    @node({
        id: '815cdcb8-0502-4363-9544-c5b86030d1ec',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [640, -2352],
    })
    HttpRequest = {
        url: 'http://www.gtmotive.pt',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
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
        id: '7040c1bf-8692-41ac-9abc-826c7faeadd3',
        name: 'Call website1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [784, -2512],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
    })
    CallWebsite1 = {
        url: '=https://gtmotive.pt',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                {
                    name: 'Accept',
                    value: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                {
                    name: 'Accept-Language',
                    value: 'en-US,en;q=0.5',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: 'e85a1240-90fa-4967-8cb8-03990e462559',
        name: 'Transform to contacts array1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1360, 160],
        alwaysOutputData: true,
    })
    TransformToContactsArray1 = {
        jsCode: `//const url = $('Split Out').last().json.fetch_url;
let _return = [];

// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for(const item of $input.all().filter(i=>i.json.input?.fetch_url!=null)){
  const url = item.json.input.fetch_url;
  const source_type = item.json.input.source_type;
  const runid = item.json.input.Run_ID;
  const entitykey = item.json.input.Entity_key;
  
  const input = item.json;
    
  var faxes= [...new Set(input.faxes)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'fax',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==item.json.input.Fax?.toString().substring(-9) ? 1: 0
    }));
  
  var emails= [...new Set(input.emails)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'email',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.trim()==item.json.input.Email?.trim() ? 1: 0
    }));
  
  var phones= [...new Set(input.phones)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'phone',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==item.json.input.Telefone?.toString().toString()?.substring(-9) ? 1: 0
    }));
  
  _return=_return.concat( [...emails, ...phones, ...faxes] );
};

//retirar repetidos
var uniqueData = _return.filter((item, index) => {
  return index === _return.findIndex(el => 
    el.field === item.field && el.value === item.value
  );
});

//retira telefone que já existem como faxes
var allFaxes = uniqueData.filter(o=>o.field=='fax').map(i=>i.value.substring(-9));
var phonesToRemove = uniqueData.filter(o=>o.field=='phone' && allFaxes.includes(o.value.substring(-9))).map(p=>p.value);
uniqueData = uniqueData.filter(y=> y.field != 'phone' || !phonesToRemove.includes(y.value));

return uniqueData;`,
    };

    @node({
        id: 'd2b924a9-074a-4aff-a3df-febd56f7735d',
        name: 'Get Item2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6400, -2608],
    })
    GetItem2 = {
        jsCode: `const input = $('Switch').item.json;

/*for (const item of $input.all()) {
  item.json.myNewField = 1;
}*/

return input;`,
    };

    @node({
        id: '5f0aef41-f8ec-4003-aa30-1d182a02bb42',
        name: 'Found all contacts?',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2320, 80],
    })
    FoundAllContacts = {
        jsCode: `const success = $input.all().filter(i => i.json.field == "phone").length>0 && 
  $input.all().filter(i => i.json.field == "email").length>0 
  $input.all().filter(i => i.json.field == "address").length>0;

return [{ json: { continueScraping: !success} }];
`,
    };

    @node({
        id: '7f5b7f42-0a14-4617-8372-17d310c94139',
        name: 'Continue scraping?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [2512, 80],
    })
    ContinueScraping = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '345a1707-a6ca-45de-9ddf-73baaadf2f0a',
                    leftValue: '={{ $json.continueScraping }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: 'a5dde8b8-fe38-45e7-ade7-0b253c89913c',
        name: 'STATE · Update NO_EVIDENCES2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4176, -2768],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateNoEvidences2 = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1295478207,
            mode: 'list',
            cachedResultName: 'NO_EVIDENCES',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1295478207',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $input.item.json.Run_ID }}',
                Input_Row: '={{ $input.item.json.Input_Row }}',
                Internet: '={{ $input.item.json.Internet }}',
                Email: '={{ $input.item.json.Email }}',
                Fax: '={{ $input.item.json.Fax }}',
                Telefone: '={{ $input.item.json.Telefone }}',
                Distrito: '={{ $input.item.json.Distrito }}',
                Concelho: '={{ $input.item.json.Concelho }}',
                CodPostal: '={{ $input.item.json.CodPostal }}',
                Localidade: '={{ $input.item.json.Localidade }}',
                Morada: '={{ $input.item.json.Morada }}',
                Nome: '={{ $input.item.json.Nome }}',
                NIPC: '={{ $input.item.json.NIPC }}',
                Entidade: '={{ $input.item.json.Entidade }}',
            },
            matchingColumns: ['Exec_KEY'],
            schema: [
                {
                    id: 'Entidade',
                    displayName: 'Entidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'NIPC',
                    displayName: 'NIPC',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Nome',
                    displayName: 'Nome',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Morada',
                    displayName: 'Morada',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Localidade',
                    displayName: 'Localidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'CodPostal',
                    displayName: 'CodPostal',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Concelho',
                    displayName: 'Concelho',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Distrito',
                    displayName: 'Distrito',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Telefone',
                    displayName: 'Telefone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Fax',
                    displayName: 'Fax',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Email',
                    displayName: 'Email',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Internet',
                    displayName: 'Internet',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
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
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Imported_at',
                    displayName: 'Imported_at',
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
        id: '72d0f870-1c41-4390-a37c-f8918882fefc',
        name: 'Call website2',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [3952, -1328],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: true,
    })
    CallWebsite2 = {
        url: '={{ $json.fetch_url }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: true,
            redirect: {
                redirect: {},
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 20000,
        },
    };

    @node({
        id: '4bf440d3-1968-40de-9176-f42f3c6f22ee',
        name: 'searches links to contact pages1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5488, -1248],
        alwaysOutputData: true,
    })
    SearchesLinksToContactPages1 = {
        jsCode: `//const linkRegex = /\\[([^\\]]+)\\]\\(((?!javascript:)[^)]+?)\\s*\\)/g;
//const linkRegex = /\\[([^\\]]+)\\]\\(((?!javascript:|mailto:|tel:|#)[^)]+?)\\s*\\)/g;
const linkRegex = /\\[([^\\]]+)\\]\\(((?!javascript:|mailto:|tel:|#)(?!.*\\.(png|jpg|jpeg|gif|svg|webp|ico|pdf))[^)]+?)\\s*\\)/g;

// Helpers (same as before)
function scoreLink(href, text) {  
  const c = (text + ' ' + href).toLowerCase();
  const keywords = ['contact', 'contato', 'contacto', 'contat', 'contacts', 'contatos', 'contactos'];
  let score = 0;
  for (const kw of keywords) {
    if (c.includes(kw)) score += 10;
  }
  if (/tel:/i.test(href)) score += 20;
  if (/mailto:/i.test(href)) score += 20;
  return score;
}

function toAbsolute(href, base) {
  try {
    if (/^https?:\\/\\//i.test(href)) return href;
    if (/^(mailto|tel):/i.test(href)) return href;
    if (!base) return href;
    //return new URL(href, base).toString();
    return \`\${base}\${href}\`
  } catch {
    return href;
  }
}

// Code node: "ExtractContactLinks" (Run Once for Each Item)
// Input: $json.data = HTML, $json.baseUrl = site URL
const links = [];
var queuedItem = $('If Has URLs in Queue').item.json;

for (const item of $input.all())
{
  linkRegex.lastIndex = 0;
  
  //const input = $('calcula domínio do site').item.json;
  const htmlRaw = item.json.data || '';
  const html = htmlRaw.toLowerCase();
  const baseUrl = $('calcula domínio do site').first().json.Final_url || '';
  const idx = htmlRaw.indexOf('contactos');

  let match;
  
  while ((match = linkRegex.exec(htmlRaw)) !== null) {
    const rawText = match[1].trim();
    const rawHref = match[2].trim();
    //console.log(rawHref);
    //console.log(rawText);
    // Skip empty/junk
    if (!rawHref || rawHref === '#') continue;
  
    const text = rawText.replace(/\\s+/g, ' ').trim();
    
    // Clean query params (like Make's split(href, "?")[0])
    //console.log(rawHref.split('?')[0].split('#')[0]);
    const cleanHref = rawHref;//.split('?')[0].split('#')[0];
  
    // Score by keywords (like Make's ">contat" / ">contact")
    const score = scoreLink(cleanHref, text);
  
    if (score > 0) {
      const url = toAbsolute(cleanHref, baseUrl);
      
      if (!links.map(o=>o.hrefFull).includes(url))
        links.push({
          text,
          hrefRaw: rawHref,
          hrefClean: cleanHref,
          hrefFull: url,
          score,
        });
    }
  }

  const contacts = {...item.json};  
  delete contacts["data"];
  if (contacts.emails.length>0 || contacts.faxes.length>0 || contacts.phones.length>0)
    queuedItem.contacts.push(contacts);
  // Sort best first
    //links.sort((a, b) => b.score - a.score);
    //return links.map(o=>o.hrefFull);
}

//updates queue
queuedItem.visited = [...queuedItem.visited, ...queuedItem.queue];
queuedItem.queue = [...links.map(o=> o.hrefFull)];
queuedItem.initial = false;
  
return queuedItem;
//return links.map(o=> ({
  //json: {
    //...$json,  // preserve original
    //input,
    //fetch_url: o.hrefFull,
    //bestContactLink: links[0] || null,
  //},
//}));`,
    };

    @node({
        id: '10a22a84-b549-4758-ad82-bc4db51b7d2c',
        name: 'Code in JavaScript4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1808, -2016],
    })
    CodeInJavascript4 = {
        jsCode: `const visited=$input.first().json.visited;

return $input.first().json.queue.filter(f => !visited.includes(f)).map(f=>({json:{url: f}}));`,
    };

    @node({
        id: 'bd99b72e-b2e9-4d1b-af74-bffe1cf586cf',
        name: 'Split URL',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [1968, -2016],
    })
    SplitUrl = {
        fieldToSplitOut: 'url',
        include: 'allOtherFields',
        options: {},
    };

    @node({
        id: '2a57a56b-dd62-4e1d-8019-1646ca5568df',
        name: 'Manual scrap for contacts',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3376, -1312],
    })
    ManualScrapForContacts = {
        jsCode: `const url = $('calcula domínio do site').first().json.Final_url;
//console.log(url);
return [{
    json: {
      initial:true,
      queue: [
        url
        ],
      visited: [],
      contacts: []    }
  }];`,
    };

    @node({
        id: 'b5307350-1996-4f3b-8409-021a5f96831a',
        name: 'If Has URLs in Queue',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [3616, -1312],
    })
    IfHasUrlsInQueue = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '2d2b1923-cbe5-433e-ad90-bd6fc124fd0a',
                    leftValue: '={{ $json.queue.filter(f => !$json.visited.includes(f)).length>0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        id: '3beb7978-5f9e-45fe-b37f-7cbb87519e7f',
        name: 'Extrai informação com regex1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5184, -1328],
        alwaysOutputData: true,
    })
    ExtraiInformacaoComRegex1 = {
        mode: 'runOnceForEachItem',
        jsCode: `function extractAddresses(text) {
  const results = [];
  const postalCodeRegex = /(\\d{4}-\\d{3}\\s+[A-ZÀ-Ú][a-zA-ZÀ-ú\\s]{2,30})/g;
  
  // Padrões que indicam que já saímos da morada
  const stopPattern = /\\*\\*|[\\w.+-]+@[\\w.-]+\\.\\w+|\\d{3}[\\s-]\\d{3}[\\s-]\\d{3}/;

  let match;
  while ((match = postalCodeRegex.exec(text)) !== null) {
    const postalIndex = match.index;
    const before = text.substring(Math.max(0, postalIndex - 300), postalIndex);

    // Percorre para trás char a char procurando onde parar
    let startIndex = 0;
    const stopMatch = [...before.matchAll(/\\*\\*|[\\w.+-]+@[\\w.-]+\\.\\w+|\\d{3}[\\s-]\\d{3}[\\s-]\\d{3}/g)];
    
    if (stopMatch.length > 0) {
      // Para no último stop pattern encontrado
      const last = stopMatch[stopMatch.length - 1];
      startIndex = last.index + last[0].length;
    }

    const addressText = (before.substring(startIndex) + match[0]).trim();
    results.push(addressText);
  }

  return results;
}

//const phoneRegex = /(?<!\\d)(?<!rgb\\()(?:\\+351[\\s-])?(?:2[1-9]\\d|9[1-9]\\d)[\\s-]\\d{3}[\\s-]\\d{3}(?!\\d)/g;
const phoneRegex = /(?<!\\d)(?:\\+351[\\s-])?(?:2[1-9]\\d|9[1-9]\\d)[\\s-]\\d{3}[\\s-]\\d{3}(?!\\d)/g;
const junkEmails = /noreply|no-reply|mailer-daemon|wix\\.com|wordpress|sentry/i;
const addressRegex = /([^\\n.]{10,80}\\n?[^\\n.]{0,60}\\n?\\d{4}-\\d{3}\\s+[A-ZÀ-Ú][a-zA-ZÀ-ú\\s]{2,30})/gm;
const keywords = ['morada', 'localização', 'localidade', 'escritório', 'sede', 'address', 'instalações'];

//const inputs = $('Split Out').all().map(u=>u.json);
//const fetch_url = $('If Has URLs in Queue').item.json.url;
const fetch_url =  $('Set Url').item.json.fetch_url;

//console.log(item.json["data"]=={});
var input = $json;
const html = $json["data"]!=null && Object.keys( $json.data).length !== 0 && $json["error"]==null ? 
  $json.data.replace(/!\\[([^\\]]*)\\]\\(([^)]*@2x[^)]*)\\)/g, '![$1]([IMAGE])') 
  : '';//.join(' ');  //retirar @ das imagens

const markdown = $json.markdown || ''
  
// Emails
const emails = html.match(
  /\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{2,}(?:\\.[a-zA-Z0-9-]{2,})+\\b(?!\\.(?:png|jpe?g|gif|webp|svg|bmp|ico)\\b)/gi
) || [];
  
//console.log(phones.join(' '));
// Fax: look for "fax" keyword nearby
const faxMatches = markdown.match(
  /(?:fax|telecópia|facsimile)[:\\s]*([+\\d\\s.()\\-]{9,})/gi
) || [];
const faxes = faxMatches.map(f =>
  f.replace(/^(fax|telecópia|facsimile)[:\\s]*/i, '').trim()
);

// Portuguese phones: +351, 2xx, 9xx formats
///(?:\\+351[\\s.-]?)?(?:2\\d{1,2}|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3,4}/g
const phones = (markdown.match(phoneRegex  
) || []).filter(i=> !faxes.includes(i));

const addresses = extractAddresses(markdown);
  //pages.match(
  //addressRegex
  ///Morada\\s+(.+?)\\s*;/
  //) || [];

//test if it is a javascript dynamic page
const indicators = {
  // HTML quase vazio - pouco conteúdo visível
  htmlTooShort: html.length < 5000,
  
  // Body vazio ou só com um elemento raiz
  emptyBody: /<body[^>]*>\\s*<[a-z-]+-app[\\s>]/.test(html),
  
  // Frameworks SPA conhecidos
  isReact: html.includes('__NEXT_DATA__') || html.includes('react-root'),
  isVue: html.includes('data-v-app') || html.includes('__vue'),
  isAngular: html.includes('ng-version') || html.includes('ng-app'),
  isSalesforce: html.includes('webruntime') || html.includes('LWR.define'),
  isNuxt: html.includes('__NUXT__'),
  
  // Markdown gerado está vazio ou muito curto
  markdownEmpty: !markdown || markdown.trim().length < 200,
  
  // Ratio JS/HTML - SPAs têm muito JS e pouco HTML útil
  highJsRatio: (html.match(/<script/g) || []).length > 10,
};

//non empty results
if (emails.length!=0 || phones.length!=0 || faxes.length!=0 || addresses.length!=0)
  
  return {
    //...$json,
    data:input.markdown,
    fetch_url, 
    emails: [...new Set(emails)].filter(e => !junkEmails.test(e)),
    phones: [...new Set(phones)],
    faxes: [...new Set(faxes)],
    addresses: [...new Set(addresses)],
    indicators
  };

return {
    data:input.markdown ,
    fetch_url, 
    emails: [],
    phones: [],
    faxes: [],
    addresses: [],
    indicators
};

/**
return _return.filter(i =>
  i.emails.length!=0 ||
  i.phones.length!=0 ||
  i.faxes.length!=0 ||
  i.addresses.length!=0
); **/`,
    };

    @node({
        id: '6c11dd04-77de-409e-92a9-433d47b18676',
        name: 'searches links to contact pages2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1456, -1984],
        alwaysOutputData: true,
    })
    SearchesLinksToContactPages2 = {
        jsCode: `const phoneRegex = /(?<!\\d)(?<!rgb\\()(?:\\+351[\\s-])?(?:2[1-9]\\d|9[1-9]\\d)[\\s-]\\d{3}[\\s-]\\d{3}(?!\\d)/g;
const junkEmails = /noreply|no-reply|mailer-daemon|wix\\.com|wordpress|sentry/i;
// Match <a href="..." >...</a> - like Make's href parsing
//const linkRegex = /<a\\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\\/a>/gis;
//const linkRegex = /<a\\s+[^>]*href=["'](?!javascript:)([^"']+)["'][^>]*>(.*?)<\\/a>/gis;
const linkRegex = /<a\\s+[^>]*href=["']\\s*(?!javascript:)([^"']+?)["'][^>]*>(.*?)<\\/a>/gis;

// Helpers (same as before)
function scoreLink(href, text) {
  //console.log(href);
  //console.log(text);
  const c = (text + ' ' + href).toLowerCase();
  const keywords = ['contact', 'contato', 'contacto', 'contat', 'contacts', 'contatos', 'contactos'];
  let score = 0;
  for (const kw of keywords) {
    if (c.includes(kw)) score += 10;
  }
  if (/tel:/i.test(href)) score += 20;
  if (/mailto:/i.test(href)) score += 20;
  return score;
}

function toAbsolute(href, base) {
  try {
    if (/^https?:\\/\\//i.test(href)) return href;
    if (/^(mailto|tel):/i.test(href)) return href;
    if (!base) return href;
    //return new URL(href, base).toString();
    return \`\${base}\${href}\`
  } catch {
    return href;
  }
}

// Code node: "ExtractContactLinks" (Run Once for Each Item)
// Input: $json.data = HTML, $json.baseUrl = site URL
const links = [];
var queuedItem = $('If Has URLs in Queue').item.json;
//console.log($input.all());

for (const item of $input.all())
{
  linkRegex.lastIndex = 0;
  
  //const input = $('calcula domínio do site').item.json;
  const htmlRaw = item.json.data || '';
  const html = htmlRaw.toLowerCase();
  //const baseUrl = $('calcula domínio do site').item.json.Final_url || '';
  
  let match;
  
  while ((match = linkRegex.exec(htmlRaw)) !== null) {
    const rawHref = match[1].trim();
    const rawText = match[2].trim();
    console.log(rawHref);
    //console.log(rawText);
    // Skip empty/junk
    if (!rawHref || rawHref === '#') continue;
  
    const text = rawText.replace(/\\s+/g, ' ').trim();
    
    // Clean query params (like Make's split(href, "?")[0])
    const cleanHref = rawHref.split('?')[0].split('#')[0];
  
    // Score by keywords (like Make's ">contat" / ">contact")
    const score = scoreLink(cleanHref, text);
  
    if (score > 0) {
      //const url = toAbsolute(cleanHref, baseUrl);
      
      if (!links.map(o=>o.hrefFull).includes(cleanHref))
        links.push({
          text,
          hrefRaw: rawHref,
          hrefClean: cleanHref,
          hrefFull: cleanHref,
          score,
        });
    }
  }

  const contacts = {...item.json};  
  delete contacts["data"];
  if (contacts.emails.length>0 || contacts.faxes.length>0 || contacts.phones.length>0)
    queuedItem.contacts.push(contacts);
  // Sort best first
    //links.sort((a, b) => b.score - a.score);
    //return links.map(o=>o.hrefFull);
}

//updates queue
queuedItem.visited = [...queuedItem.visited, ...queuedItem.queue];
queuedItem.queue = [...links.map(o=> o.hrefFull)];
  
return queuedItem;
//return links.map(o=> ({
  //json: {
    //...$json,  // preserve original
    //input,
    //fetch_url: o.hrefFull,
    //bestContactLink: links[0] || null,
  //},
//}));`,
    };

    @node({
        id: '8d721451-82c9-446a-a6f3-244eb4501cfa',
        name: 'Transform to contacts array2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3824, -912],
        alwaysOutputData: true,
    })
    TransformToContactsArray2 = {
        jsCode: `//const url = $('Split Out').last().json.fetch_url;
let _return = [];
const contacts = $input.first().json.contacts;

const company = $('calcula domínio do site').first().json;

// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for(const item of contacts){
  
  const url = item.fetch_url;
  const source_type = 'scrap';
  const runid = company.Run_ID;
  const entitykey = company.Entity_key;  
    
  var faxes= [...new Set(item.faxes)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'fax',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==company.Fax?.toString().substring(-9) ? 1: 0
    }));
  
  var emails= [...new Set(item.emails)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'email',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.trim()==company.Email?.trim() ? 1: 0
    }));
  
  var phones= [...new Set(item.phones)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'phone',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence:  u.replace(/\\s/g, "").substring(-9)==company.Telefone?.toString().toString()?.substring(-9) ? 1: 0
    }));

  var addresses= [...new Set(item.addresses)].map(u => ({
      value: u.replace(/\\s/g, ""),
      field: 'address',
      source_url: url,
      run_id: runid,
      entity_key: entitykey,
      source_type,
      confidence: 0
    }));
  
  _return=_return.concat( [...emails, ...phones, ...faxes, ...addresses] );
};

//retirar repetidos
var uniqueData = _return.filter((item, index) => {
  return index === _return.findIndex(el => 
    el.field === item.field && el.value === item.value
  );
});

//retira telefone que já existem como faxes
var allFaxes = uniqueData.filter(o=>o.field=='fax').map(i=>i.value.substring(-9));
var phonesToRemove = uniqueData.filter(o=>o.field=='phone' && allFaxes.includes(o.value.substring(-9))).map(p=>p.value);
uniqueData = uniqueData.filter(y=> y.field != 'phone' || !phonesToRemove.includes(y.value));

return uniqueData;`,
    };

    @node({
        id: '9c89297d-f17f-4f46-8036-f37fce0f5e7f',
        name: 'Sticky Note4',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [3008, -1536],
    })
    StickyNote4 = {
        content: '## Manual Scrap',
        height: 992,
        width: 3284,
        color: 2,
    };

    @node({
        id: '86b0ddc0-b1b7-400d-9e13-890cee11c633',
        name: 'Merge5',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [2128, 80],
    })
    Merge5 = {
        mode: 'chooseBranch',
    };

    @node({
        id: '432dd31f-c3de-4f9a-bb5e-47876a61d36b',
        name: 'No results?2',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [4032, -912],
        executeOnce: false,
    })
    NoResults2 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $input.all().length==1 && $input.first().json.keys()==0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: 'd60c0f9c-d1ce-40d5-886d-566f9b73aa05',
        name: 'Found all contacts?2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6352, -2272],
    })
    FoundAllContacts2 = {
        jsCode: `const allFailed = $input.all().filter(i => i.json.field == "phone").length>0 && 
  $input.all().filter(i => i.json.field == "email").length>0 &&
  $input.all().filter(i => i.json.field == "fax").length>0 &&
  $input.all().filter(i => i.json.field == "address").length>0;

return [{ json: { continueScraping: !allFailed} }];
`,
    };

    @node({
        id: '9b02e870-7d05-41dd-bcc3-b937dbeab748',
        name: 'Website working?1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [4160, -1328],
    })
    WebsiteWorking1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '76426532-8187-464a-ae76-49ee32145832',
                    leftValue: '={{ $json.error }}',
                    rightValue: '',
                    operator: {
                        type: 'object',
                        operation: 'notExists',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '61fb7682-3722-487c-8b2c-17fb1210e1bb',
        name: 'No results?3',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-576, -368],
        executeOnce: false,
    })
    NoResults3 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $input.all().length==1 && $input.first().json.keys()==0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: 'd5de6929-4a42-427f-88a3-db7fcb968960',
        name: 'End Loop',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [32, -736],
    })
    EndLoop = {};

    @node({
        id: 'a6070c35-26ee-4e93-b190-7d73354f3ed3',
        name: 'Create CONTROL_EXECUTION SerpAPI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [128, -16],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    CreateControlExecutionSerpapi = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{(+new Date).toString(36).slice(-5) + Math.random().toString(36).substr(2, 5)}}',
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: '={{ $json.Input_Row }}',
                Current_phase: 'SERPAPI_INDEX',
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'PENDING',
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'cdac8db4-ad52-4bda-9394-b2247e96abb4',
        name: 'Merge6',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [2512, -288],
    })
    Merge6 = {
        mode: 'chooseBranch',
    };

    @node({
        id: '2c683bdf-9cac-4106-accd-9ea9767c82f6',
        name: 'SET EVIDENCES SerpAPI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1936, 256],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
    })
    SetEvidencesSerpapi = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Extracted_at: '={{ $now.toISO() }}',
                'Source_type  (input | serpapi | scrape | openai)': '={{ $json.source_type }}',
                Source_url: '={{ $json.source_url }}',
                Value: "={{ $json.value.replace('+','\\'+') }}",
                'Field (phone | email | internet)': '={{ $json.field }}',
                Confidence: '={{ $json.confidence }}',
            },
            matchingColumns: ['Exec_KEY'],
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
        options: {
            locationDefine: {
                values: {},
            },
            useAppend: true,
        },
    };

    @node({
        id: 'a55fa430-bfa9-4441-aa51-0d4326e01df8',
        name: 'Update CONTROL_EXECUTION SerpAPI1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2720, -144],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionSerpapi1 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: "={{ $('Create CONTROL_EXECUTION SerpAPI').first().json.Exec_key }}",
                Process_Status: 'SOME_RESULTS',
                Next_action: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '9afcf7f2-44c0-4e5b-b182-7843ade1b796',
        name: 'Update CONTROL_EXECUTION SerpAPI2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2736, 208],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionSerpapi2 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: "={{ $('Create CONTROL_EXECUTION SerpAPI').first().json.Exec_key }}",
                Process_Status: 'ALL_RESULTS',
                Next_action: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'd33e586c-c6a7-4e18-8183-1346fa58d26b',
        name: 'Create CONTROL_EXECUTION Scrape',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [3200, -1312],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    CreateControlExecutionScrape = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: '={{(+new Date).toString(36).slice(-5) + Math.random().toString(36).substr(2, 5)}}',
                Run_ID: "={{ $('calcula domínio do site').first().json.Run_ID }}",
                Entity_key: "={{ $('calcula domínio do site').first().json.Entity_key }}",
                Input_Row: "={{ $('calcula domínio do site').first().json.Input_Row }}",
                Current_phase: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'PENDING',
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'fec59069-c78b-4e3f-aa68-74d9b146fffc',
        name: 'SET EVIDENCES Scrap',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4512, -384],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
    })
    SetEvidencesScrap = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 864389049,
            mode: 'list',
            cachedResultName: 'CONTROL_EVIDENCE',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=864389049',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Extracted_at: '={{ $now.toISO() }}',
                'Source_type  (input | serpapi | scrape | openai)': '={{ $json.source_type }}',
                Source_url: '={{ $json.source_url }}',
                Value: "={{ $json.value.replace('+','\\'+') }}",
                'Field (phone | email | internet)': '={{ $json.field }}',
                Confidence: '={{ $json.confidence }}',
            },
            matchingColumns: ['Exec_KEY'],
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
        options: {
            locationDefine: {
                values: {},
            },
            useAppend: true,
        },
    };

    @node({
        id: 'e0222b9d-f2f6-424c-84cf-c363f67442cf',
        name: 'Update CONTROL_EXECUTION',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4768, -752],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'NO_RESULTS',
                Queued_action: '=ENRICH_FROM_AI',
                Exec_key: "={{ $('Create CONTROL_EXECUTION Scrape').item.json.Exec_key }}",
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'e56d001e-36b2-4496-96c3-f65ba1683078',
        name: 'SET NO_EVIDENCES SerpAPI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2336, -128],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    SetNoEvidencesSerpapi = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1295478207,
            mode: 'list',
            cachedResultName: 'NO_EVIDENCES',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1295478207',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: "={{ $('calcula domínio do site').item.json.Run_ID }}",
                Input_Row: "={{ $('calcula domínio do site').item.json.Input_Row }}",
                Internet: "={{ $('calcula domínio do site').item.json.Internet }}",
                Email: "={{ $('calcula domínio do site').item.json.Email }}",
                Fax: "={{ $('calcula domínio do site').item.json.Fax }}",
                Telefone: "={{ $('calcula domínio do site').json.Telefone }}",
                Distrito: "={{ $('calcula domínio do site').json.Distrito }}",
                Concelho: "={{ $('calcula domínio do site').item.json.Concelho }}",
                CodPostal: "={{ $('calcula domínio do site').item.json.CodPostal }}",
                Localidade: "={{ $('calcula domínio do site').item.json.Localidade }}",
                Morada: "={{ $('calcula domínio do site').item.json.Morada }}",
                Nome: "={{ $('calcula domínio do site').item.json.Nome }}",
                NIPC: "={{ $('calcula domínio do site').item.json.NIPC }}",
                Entidade: "={{ $('calcula domínio do site').item.json.Entidade }}",
                Phase: 'SERPAPI_INDEX',
            },
            matchingColumns: ['Exec_KEY'],
            schema: [
                {
                    id: 'Entidade',
                    displayName: 'Entidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'NIPC',
                    displayName: 'NIPC',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Nome',
                    displayName: 'Nome',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Morada',
                    displayName: 'Morada',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Localidade',
                    displayName: 'Localidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'CodPostal',
                    displayName: 'CodPostal',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Concelho',
                    displayName: 'Concelho',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Distrito',
                    displayName: 'Distrito',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Telefone',
                    displayName: 'Telefone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Fax',
                    displayName: 'Fax',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Email',
                    displayName: 'Email',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Internet',
                    displayName: 'Internet',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
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
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Phase',
                    displayName: 'Phase',
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
        id: '966a1a9c-5c5c-4b52-b162-7dab6c4d55f7',
        name: 'SET NO_EVIDENCES SCRAP',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4848, -976],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    SetNoEvidencesScrap = {
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1295478207,
            mode: 'list',
            cachedResultName: 'NO_EVIDENCES',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1295478207',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: "={{ $('calcula domínio do site').first().json.Run_ID }}",
                Input_Row: "={{ $('calcula domínio do site').first().json.Input_Row }}",
                Internet: "={{ $('calcula domínio do site').first().json.Internet }}",
                Email: "={{ $('calcula domínio do site').first().json.Email }}",
                Fax: "={{ $('calcula domínio do site').first().json.Fax }}",
                Telefone: "={{ $('calcula domínio do site').first().json.Telefone }}",
                Distrito: "={{ $('calcula domínio do site').first().json.Distrito }}",
                Concelho: "={{ $('calcula domínio do site').first().json.Concelho }}",
                CodPostal: "={{ $('calcula domínio do site').first().json.CodPostal }}",
                Localidade: "={{ $('calcula domínio do site').first().json.Localidade }}",
                Morada: "={{ $('calcula domínio do site').first().json.Morada }}",
                Nome: "={{ $('calcula domínio do site').first().json.Nome }}",
                NIPC: "={{ $('calcula domínio do site').first().json.NIPC }}",
                Entidade: "={{ $('calcula domínio do site').first().json.Entidade }}",
                Phase: 'SCRAP_WEBSITE',
            },
            matchingColumns: ['Exec_KEY'],
            schema: [
                {
                    id: 'Entidade',
                    displayName: 'Entidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'NIPC',
                    displayName: 'NIPC',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Nome',
                    displayName: 'Nome',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Morada',
                    displayName: 'Morada',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Localidade',
                    displayName: 'Localidade',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'CodPostal',
                    displayName: 'CodPostal',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Concelho',
                    displayName: 'Concelho',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Distrito',
                    displayName: 'Distrito',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Telefone',
                    displayName: 'Telefone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Fax',
                    displayName: 'Fax',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Email',
                    displayName: 'Email',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Internet',
                    displayName: 'Internet',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
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
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Phase',
                    displayName: 'Phase',
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
        id: 'bccadd98-800d-4278-900b-17014562a0b0',
        name: 'Update CONTROL_EXECUTION2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4944, -384],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution2 = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: "={{ $json.success ? 'ALL_RESULTS' : 'SOME_RESULTS' }}",
                Queued_action: "={{ $json.success ? null : 'ENRICH_FROM_AI' }}",
                Exec_key: "={{ $('Create CONTROL_EXECUTION Scrape').first().json.Exec_key }}",
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '0d69d270-a78b-4f92-a9fb-1091636bbddc',
        name: 'No results?4',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1536, 160],
        executeOnce: false,
    })
    NoResults4 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '782430b9-8b03-45ac-ac15-0bdf79bf8e0d',
                    leftValue: '={{ $input.all().length==1 && $input.first().json.keys()==0 }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        id: '2ce454eb-f2a8-47cf-8cf6-31200fa0d808',
        name: 'Update CONTROL_EXECUTION NOT_INDEXED',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1696, -320],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionNotIndexed = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: "={{ $('Create CONTROL_EXECUTION SerpAPI').first().json.Exec_key }}",
                Process_Status: 'NOT_INDEXED',
                Next_action: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '6f18b3eb-f1e0-429d-ace4-3d9812888c5c',
        name: 'Update CONTROL_EXECUTION NOT_RESULTS',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1936, -224],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionNotResults = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Exec_key: "={{ $('Create CONTROL_EXECUTION SerpAPI').first().json.Exec_key }}",
                Process_Status: 'NO_RESULTS',
                Next_action: 'SCRAP_WEBSITE',
                Updated_at: '={{ $now.toISO() }}',
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'cb191fea-c9a7-430d-b85a-7b2b3afa0a84',
        name: 'First URL?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [4384, -1248],
    })
    FirstUrl = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'cdc053ca-2d47-420f-9ede-a8c20a6164a0',
                    leftValue: "={{ $('If Has URLs in Queue').item.json.initial }}",
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '44426f14-2b1b-4aa3-b560-f76d5bf3e8c2',
        name: 'Update CONTROL_EXECUTION NOT VALIDURL',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [5760, -976],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionNotValidurl = {
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE',
            mode: 'list',
            cachedResultName: 'Cliente_BD_OUTPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 1167682274,
            mode: 'list',
            cachedResultName: 'CONTROL_EXEC',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=1167682274',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Updated_at: '={{ $now.toISO() }}',
                Process_Status: 'URL_ERROR',
                Queued_action: '=DISCOVER_URL',
                Exec_key: "={{ $('Create CONTROL_EXECUTION Scrape').first().json.Exec_key }}",
            },
            matchingColumns: ['Exec_key'],
            schema: [
                {
                    id: 'Exec_key',
                    displayName: 'Exec_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Run_ID',
                    displayName: 'Run_ID',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Entity_key',
                    displayName: 'Entity_key',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Input_Row',
                    displayName: 'Input_Row',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Current_phase',
                    displayName: 'Current_phase',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Process_Status',
                    displayName: 'Process_Status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Next_action',
                    displayName: 'Next_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Queued_action',
                    displayName: 'Queued_action',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Updated_at',
                    displayName: 'Updated_at',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '3a722899-13df-4f08-a145-1873f75570f6',
        name: 'Is it a Success?',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4720, -384],
    })
    IsItASuccess = {
        jsCode: `var contacts = $('Transform to contacts array2').all();

try{
  var contactsSerpAPI = $('Transform to contacts array2').all();  
  contacts = contacts.concat(contactsSerpAPI);
}catch{}

const success = contacts.filter(i => i.json.field == "phone").length>0 && 
  contacts.filter(i => i.json.field == "email").length>0 
  contacts.filter(i => i.json.field == "address").length>0;

return [{ json: { success: success} }];
`,
    };

    @node({
        id: '0746aeff-f3e1-42b9-bb12-0cc2b854ef4f',
        name: 'Set Url',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [3792, -1328],
    })
    SetUrl = {
        assignments: {
            assignments: [
                {
                    id: 'a183e49b-fd45-400d-b1ff-478527476555',
                    name: 'fetch_url',
                    value: '={{ $json.queue.filter(f => !$json.visited.includes(f))[0] }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.TriggerRun.out(0).to(this.ClienteBdOutputControlExec.in(0));
        this.TriggerRun.out(0).to(this.ClienteBdOutputUrlChecks.in(0));
        this.TriggerRun.out(0).to(this.ClienteBdOutputInputSnapshot.in(0));
        this.LoopOverItems.out(0).to(this.EndLoop.in(0));
        this.LoopOverItems.out(1).to(this.CalculaDominioDoSite.in(0));
        this.ExtraiInformacaoComRegex.out(0).to(this.Merge2.in(0));
        this.EscolheOMelhorContacto.out(0).to(this.SemEmail.in(0));
        this.SemEmail.out(0).to(this.ProcuraMailtoTags.in(0));
        this.HttpContactos.out(0).to(this.Markdown3.in(0));
        this.TentaPossiveisRoutesDeContactos.out(0).to(this.SplitOut.in(0));
        this.Merge.out(0).to(this.FiltraResultadosParaTestes.in(0));
        this.ClienteBdOutputUrlChecks.out(0).to(this.Merge.in(0));
        this.ClienteBdOutputControlExec.out(0).to(this.Merge.in(1));
        this.SerpapiWebsiteContactos.out(0).to(this.Merge4.in(0));
        this.Merge1.out(0).to(this.NoResults1.in(0));
        this.CodeInJavascript1.out(0).to(this.Markdown.in(0));
        this.Markdown.out(0).to(this.If_.in(0));
        this.OpenaiPesquisaSiteDaEmpresa.out(0).to(this.GetResultsArray.in(0));
        this.If_.out(0).to(this.MessageAModel.in(0));
        this.Merge2.out(0).to(this.TransformToContactsArray.in(0));
        this.Wait.out(0).to(this.LoopOverItems.in(0));
        this.ClienteBdOutputInputSnapshot.out(0).to(this.Merge.in(2));
        this.ValidaDominioNosResultados.out(0).to(this.NoResults.in(0));
        this.SplitOut.out(0).to(this.HttpContactos.in(0));
        this.TransformToContactsArray.out(0).to(this.Merge1.in(0));
        this.SerpapiWebsiteContactos1.out(0).to(this.Merge4.in(1));
        this.Merge4.out(0).to(this.ValidaDominioNosResultados.in(0));
        this.RetiraContactosDoSnipet.out(0).to(this.TransformToContactsArray1.in(0));
        this.NoResults.out(0).to(this.UpdateControlExecutionNotIndexed.in(0));
        this.NoResults.out(0).to(this.SetNoEvidencesSerpapi.in(0));
        this.NoResults.out(1).to(this.RetiraContactosDoSnipet.in(0));
        this.HttpsSiteUrl.out(0).to(this.NoHttps.in(0));
        this.NoHttps.out(0).to(this.HttpSiteUrl.in(0));
        this.NoHttps.out(1).to(this.RetornaDados.in(0));
        this.HttpSiteUrl.out(0).to(this.RetornaDados.in(0));
        this.RetornaDados.out(0).to(this.IfHtmlRefresh.in(0));
        this.RespondeuSemDados.out(1).to(this.SubstituiUrlDoInput.in(0));
        this.SubstituiUrlDoInput.out(0).to(this.StateUpdateControlEvidence3.in(0));
        this.SubstituiUrlDoInput.out(0).to(this.UpdateControlExecution6.in(0));
        this.CallRedirectWebsite.out(0).to(this.RespondeuSemDados.in(0));
        this.IfHtmlRefresh.out(0).to(this.CallRedirectWebsite.in(0));
        this.IfHtmlRefresh.out(1).to(this.SubstituiUrlDoInput.in(0));
        this.FiltraResultadosParaTestes.out(0).to(this.NoResults3.in(0));
        this.CalculaDominioDoSite.out(0).to(this.CreateControlExecutionSerpapi.in(0));
        this.NoResults1.out(0).to(this.GetItem.in(0));
        this.NoResults1.out(1).to(this.StateUpdateControlEvidence2.in(0));
        this.Markdown1.out(0).to(this.ExtraiInformacaoComRegex1.in(0));
        this.SearchesLinksToContactPages.out(0).to(this.TentaPossiveisRoutesDeContactos.in(0));
        this.CallWebsite.out(0).to(this.WebsiteWorking.in(0));
        this.GetItem.out(0).to(this.StateUpdateNoEvidences.in(0));
        this.UpdateControlExecution1.out(0).to(this.HttpsSiteUrl.in(0));
        this.OriginalItem.out(0).to(this.UpdateControlExecution1.in(0));
        this.UpdateControlExecution3.out(0).to(this.StartScrapeOperation.in(0));
        this.Markdown3.out(0).to(this.ExtraiInformacaoComRegex.in(0));
        this.WebsiteWorking.out(0).to(this.SearchesLinksToContactPages.in(0));
        this.WebsiteWorking.out(1).to(this.StateUpdateNoEvidences2.in(0));
        this.StartScrapeOperation.out(0).to(this.CallWebsite.in(0));
        this.UpdateControlExecution5.out(0).to(this.GetItem1.in(0));
        this.HttpRequest.out(0).to(this.Markdown2.in(0));
        this.TransformToContactsArray1.out(0).to(this.NoResults4.in(0));
        this.FoundAllContacts.out(0).to(this.ContinueScraping.in(0));
        this.ContinueScraping.out(0).to(this.UpdateControlExecutionSerpapi1.in(0));
        this.ContinueScraping.out(1).to(this.UpdateControlExecutionSerpapi2.in(0));
        this.CallWebsite2.out(0).to(this.WebsiteWorking1.in(0));
        this.SearchesLinksToContactPages1.out(0).to(this.IfHasUrlsInQueue.in(0));
        this.CodeInJavascript4.out(0).to(this.SplitUrl.in(0));
        this.ManualScrapForContacts.out(0).to(this.IfHasUrlsInQueue.in(0));
        this.IfHasUrlsInQueue.out(0).to(this.SetUrl.in(0));
        this.IfHasUrlsInQueue.out(1).to(this.TransformToContactsArray2.in(0));
        this.ExtraiInformacaoComRegex1.out(0).to(this.SearchesLinksToContactPages1.in(0));
        this.Merge5.out(0).to(this.FoundAllContacts.in(0));
        this.NoResults2.out(0).to(this.SetNoEvidencesScrap.in(0));
        this.NoResults2.out(0).to(this.UpdateControlExecution.in(0));
        this.NoResults2.out(1).to(this.SetEvidencesScrap.in(0));
        this.TransformToContactsArray2.out(0).to(this.NoResults2.in(0));
        this.WebsiteWorking1.out(0).to(this.Markdown1.in(0));
        this.WebsiteWorking1.out(1).to(this.FirstUrl.in(0));
        this.NoResults3.out(1).to(this.LoopOverItems.in(0));
        this.CreateControlExecutionSerpapi.out(0).to(this.SerpapiWebsiteContactos.in(0));
        this.CreateControlExecutionSerpapi.out(0).to(this.SerpapiWebsiteContactos1.in(0));
        this.Merge6.out(0).to(this.CreateControlExecutionScrape.in(0));
        this.SetEvidencesSerpapi.out(0).to(this.Merge5.in(1));
        this.UpdateControlExecutionSerpapi1.out(0).to(this.CreateControlExecutionScrape.in(0));
        this.UpdateControlExecutionSerpapi2.out(0).to(this.Wait.in(0));
        this.CreateControlExecutionScrape.out(0).to(this.ManualScrapForContacts.in(0));
        this.SetEvidencesScrap.out(0).to(this.IsItASuccess.in(0));
        this.SetNoEvidencesSerpapi.out(0).to(this.Merge6.in(1));
        this.UpdateControlExecution.out(0).to(this.Merge3.in(1));
        this.Merge3.out(0).to(this.Wait.in(0));
        this.SetNoEvidencesScrap.out(0).to(this.Merge3.in(0));
        this.UpdateControlExecution2.out(0).to(this.Wait.in(0));
        this.NoResults4.out(0).to(this.SetNoEvidencesSerpapi.in(0));
        this.NoResults4.out(0).to(this.UpdateControlExecutionNotResults.in(0));
        this.NoResults4.out(1).to(this.Merge5.in(0));
        this.NoResults4.out(1).to(this.SetEvidencesSerpapi.in(0));
        this.UpdateControlExecutionNotIndexed.out(0).to(this.Merge6.in(0));
        this.UpdateControlExecutionNotResults.out(0).to(this.Merge6.in(0));
        this.FirstUrl.out(0).to(this.SetNoEvidencesScrap.in(0));
        this.FirstUrl.out(0).to(this.UpdateControlExecutionNotValidurl.in(0));
        this.FirstUrl.out(1).to(this.ExtraiInformacaoComRegex1.in(0));
        this.UpdateControlExecutionNotValidurl.out(0).to(this.Merge3.in(1));
        this.IsItASuccess.out(0).to(this.UpdateControlExecution2.in(0));
        this.SetUrl.out(0).to(this.CallWebsite2.in(0));
    }
}
