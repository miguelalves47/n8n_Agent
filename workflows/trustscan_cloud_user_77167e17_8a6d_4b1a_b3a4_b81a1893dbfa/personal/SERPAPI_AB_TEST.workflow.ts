import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : SERPAPI AB TEST
// Nodes   : 6  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Trigger                            webhook
// BuildTestMatrix                    code
// Loop                               splitInBatches
// WaitPacing                         wait
// Serpapi                            httpRequest                [creds] [alwaysOutput]
// Score                              code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Trigger
//    → BuildTestMatrix
//      → Loop
//       .out(1) → WaitPacing
//          → Serpapi
//            → Score
//              → Loop (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 't5KT79ovpToTW7po',
    name: 'SERPAPI AB TEST',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class SerpapiAbTestWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'ab-trigger',
        webhookId: 'ab-trigger-wh',
        name: 'Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [0, 0],
    })
    Trigger = {
        path: 'serpapi-ab-test',
        httpMethod: 'POST',
        responseMode: 'onReceived',
    };

    @node({
        id: 'ab-build-matrix',
        name: 'Build Test Matrix',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [240, 0],
    })
    BuildTestMatrix = {
        jsCode: `// Wider A/B: 20 companies x 4 SerpAPI query variants.
// Brand is auto-derived from host (mirrors what production would have to do).
function deriveBrand(host) {
  let b = String(host).replace(/^www\\./i, '');
  b = b.replace(/\\.(com\\.pt|com\\.br|co\\.uk|com|pt|es|net|org|io|co|eu)$/i, '');
  b = b.split('.')[0];
  return b.split('-').filter(Boolean).map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join(' ');
}

const hosts = [
  '100avarias.com',
  'beher.com',
  'bp.pt',
  'bright-science.com',
  'carpintariadavila.pt',
  'cepsa.com',
  'csgpt.com',
  'domore.com.pt',
  'galpenergia.com',
  'gtmotive.pt',
  'hotellusitaniaparque.com',
  'inditex.com',
  'boaenergia.pt',
  'bosch.pt',
  'colegioaquinta.com',
  'continental-pneus.pt',
  'e-redes.pt',
  'dimep.pt',
  'endesa.pt',
  'homeblock.pt',
];

const variants = [
  { id: 'V1_site',          q: (c) => 'site:' + c.host,                                                                   num: '10' },
  { id: 'V4_site_kw',       q: (c) => 'site:' + c.host + ' (contacto OR contactos OR contact OR "fale connosco")',        num: '10' },
  { id: 'V5_brand_kw',      q: (c) => '"' + c.brand + '" contactos OR telefone OR email',                                 num: '10' },
  { id: 'V5h_host_kw',      q: (c) => '"' + c.host  + '" contactos OR telefone OR email',                                 num: '10' },
];

const out = [];
for (const h of hosts) {
  const c = { host: h, brand: deriveBrand(h) };
  for (const v of variants) {
    out.push({ json: { brand: c.brand, host: c.host, variant: v.id, q: v.q(c), num: v.num } });
  }
}
return out;
`,
    };

    @node({
        id: 'ab-loop',
        name: 'Loop',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [480, 0],
    })
    Loop = {
        options: {},
    };

    @node({
        id: 'ab-wait',
        webhookId: 'ab-wait-wh',
        name: 'Wait Pacing',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [704, 160],
    })
    WaitPacing = {
        amount: 2,
    };

    @node({
        id: 'ab-serpapi',
        name: 'SerpAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [928, 160],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
        alwaysOutputData: true,
    })
    Serpapi = {
        url: '=https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'q',
                    value: '={{ $json.q }}',
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
                    value: '={{ $json.num }}',
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
        id: 'ab-score',
        name: 'Score',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1152, 160],
    })
    Score = {
        mode: 'runOnceForEachItem',
        jsCode: `// Score one variant-call's SerpAPI response.
const req = $('Loop').item.json;          // brand, host, variant, q, num
const body = $json.body || {};
const organic = Array.isArray(body.organic_results) ? body.organic_results : [];
const kg = body.knowledge_graph || null;

const CONTACT_URL_RE = new RegExp('contact|contacto|contactos|contato|contatos|apoio|suporte|fale|atendimento|sobre|about|legal','i');
const EMAIL_RE = new RegExp('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}','g');
// PT/ES phone-ish: 9 to 13 digits, optional country code and separators
const PHONE_RE = new RegExp('(?:\\\\+?\\\\s*\\\\d{2,3}[\\\\s.-]*)?\\\\d{2,3}[\\\\s.-]?\\\\d{3}[\\\\s.-]?\\\\d{3,4}','g');

const hostBare = req.host.replace(/^www\\./,'').toLowerCase();
const own = organic.filter(r => String(r.link || '').toLowerCase().includes(hostBare));
const ownContact = own.filter(r => CONTACT_URL_RE.test(String(r.link || '')));

const text = organic.map(r => (r.title || '') + ' ' + (r.snippet || '')).join(' ');
const emails = [...new Set((text.match(EMAIL_RE) || []).filter(e => !e.includes('...') && !e.startsWith('.')))];
const phones = [...new Set((text.match(PHONE_RE) || []))].filter(p => p.replace(/\\D/g,'').length >= 9 && p.replace(/\\D/g,'').length <= 13);

// KG fields of interest
let kgEmail = null, kgPhone = null, kgAddress = null, kgWebsite = null;
if (kg && typeof kg === 'object') {
  kgEmail   = kg.email || null;
  kgPhone   = kg.phone || null;
  kgAddress = kg.address || kg.headquarters || null;
  kgWebsite = kg.website || kg.link || null;
}

return { json: {
  brand: req.brand,
  host: req.host,
  variant: req.variant,
  q: req.q,
  n_organic: organic.length,
  has_kg: !!kg,
  kg_email: kgEmail,
  kg_phone: kgPhone,
  kg_address: kgAddress,
  kg_website: kgWebsite,
  n_own_domain: own.length,
  n_own_contact_urls: ownContact.length,
  own_contact_urls: ownContact.map(r => r.link).slice(0, 10),
  snippet_emails: emails,
  snippet_phones: phones,
  search_state: body.search_information && body.search_information.organic_results_state || null,
}};
`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Trigger.out(0).to(this.BuildTestMatrix.in(0));
        this.BuildTestMatrix.out(0).to(this.Loop.in(0));
        this.Loop.out(1).to(this.WaitPacing.in(0));
        this.WaitPacing.out(0).to(this.Serpapi.in(0));
        this.Serpapi.out(0).to(this.Score.in(0));
        this.Score.out(0).to(this.Loop.in(0));
    }
}
