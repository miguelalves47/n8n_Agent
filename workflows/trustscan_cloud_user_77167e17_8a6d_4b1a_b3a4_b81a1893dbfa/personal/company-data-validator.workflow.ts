import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Company Data Validator
// Nodes   : 16  |  Connections: 16
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ReceiveExcelFile                   webhook
// ParseExcel                         extractFromFile
// NormalizeUrl                       code
// ValidateContacts                   code
// HasUrl                             if
// CheckWebsite                       httpRequest                [onError→out(1)]
// FormatSuccess                      code
// FormatError                        code
// FormatNoUrl                        code
// MergeResults                       merge
// BuildReport                        code
// RespondWithReport                  respondToWebhook
// GenerateXlsx                       convertToFile
// WhenClickingExecuteWorkflow        manualTrigger
// GoogleDriveTrigger                 googleDriveTrigger         [creds]
// DownloadFile                       googleDrive                [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ReceiveExcelFile
//    → ParseExcel
//      → NormalizeUrl
//        → ValidateContacts
//          → HasUrl
//            → CheckWebsite
//              → FormatSuccess
//                → MergeResults
//                  → BuildReport
//                    → RespondWithReport
//                  → GenerateXlsx
//             .out(1) → FormatError
//                → MergeResults.in(1) (↩ loop)
//           .out(1) → FormatNoUrl
//              → MergeResults.in(2) (↩ loop)
// GoogleDriveTrigger
//    → DownloadFile
//      → ParseExcel (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'm6jC0eO7QSxTl0Vr',
    name: 'Company Data Validator',
    active: true,
    settings: {
        saveDataErrorExecution: 'all',
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
        availableInMCP: false,
        binaryMode: 'separate',
        timeSavedMode: 'fixed',
    },
})
export class CompanyDataValidatorWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'beacb902-807a-4bf0-9e0f-16136f02cefd',
        webhookId: '9d14a161-de25-49f2-a0bf-2e29f40de666',
        name: 'Receive Excel File',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 0],
    })
    ReceiveExcelFile = {
        httpMethod: 'POST',
        path: 'company-validator',
        responseMode: 'responseNode',
        options: {
            rawBody: true,
        },
    };

    @node({
        id: '48dc3a1b-5870-4ff8-8c9d-390a18798bf5',
        name: 'Parse Excel',
        type: 'n8n-nodes-base.extractFromFile',
        version: 1.1,
        position: [480, 0],
    })
    ParseExcel = {
        operation: 'xlsx',
        binaryPropertyName: 'data',
        options: {},
    };

    @node({
        id: '2dea1f04-e17a-442d-8d5e-6fb151acf23e',
        name: 'Normalize URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [736, 0],
    })
    NormalizeUrl = {
        mode: 'runOnceForEachItem',
        jsCode: `const rawUrl = String($json.Internet || '').trim();
let normalizedUrl = '';
let hasUrl = false;

if (rawUrl.length > 0) {
  let url = rawUrl;
  while (url.endsWith(')') || url.endsWith(',') || url.endsWith('.') || url.endsWith(';')) {
    url = url.slice(0, -1);
  }
  const lc = url.toLowerCase();
  if (!lc.startsWith('http://') && !lc.startsWith('https://')) {
    url = 'https://' + url;
  }
  if (url.toLowerCase().startsWith('http://')) {
    url = 'https://' + url.substring(7);
  }
  const afterProtocol = url.substring(url.indexOf('//') + 2);
  const hostPart = afterProtocol.split('/')[0].split('?')[0].split('#')[0];
  if (hostPart.includes('.') && hostPart.length > 3) {
    normalizedUrl = url;
    hasUrl = true;
  }
}

return {
  ...$json,
  _normalized_url: normalizedUrl,
  _has_url: hasUrl,
  _company_name: String($json.Nome || 'Unknown'),
};
`,
    };

    @node({
        id: 'b761646e-1e97-4e3a-bde7-24c586c36e22',
        name: 'Validate Contacts',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [992, 0],
    })
    ValidateContacts = {
        mode: 'runOnceForEachItem',
        jsCode: `const email = String($json.Email || '').trim();
let emailValid = false;
let emailNotes = '';
if (email.length === 0) {
  emailNotes = 'No email provided';
} else {
  const atIdx = email.indexOf('@');
  const dotAfterAt = email.indexOf('.', atIdx + 1);
  if (atIdx > 0 && dotAfterAt > atIdx + 1 && !email.includes(' ') && email.length > 5) {
    emailValid = true;
  } else {
    emailNotes = 'Invalid email format';
  }
}

function validatePtPhone(raw) {
  if (!raw || String(raw).trim().length === 0) {
    return { valid: false, notes: 'No phone provided' };
  }
  let phone = String(raw).trim();
  phone = phone.split(' ').join('').split('-').join('').split('.').join('');
  if (phone.startsWith('+351')) phone = phone.substring(4);
  if (phone.startsWith('00351')) phone = phone.substring(5);
  if (phone.length === 9 && phone.split('').every(c => c >= '0' && c <= '9')) {
    return { valid: true, notes: '' };
  }
  return { valid: false, notes: 'Invalid phone format (expected 9 digits or +351 prefix)' };
}

const phoneResult = validatePtPhone($json.Telefone);
const faxResult = validatePtPhone($json.Fax);

return {
  ...$json,
  _email_valid: emailValid,
  _email_notes: emailNotes,
  _phone_valid: phoneResult.valid,
  _phone_notes: phoneResult.notes,
  _fax_valid: faxResult.valid,
  _fax_notes: faxResult.notes,
};
`,
    };

    @node({
        id: 'bf18c529-eae3-4779-9732-c738014897d3',
        name: 'Has URL?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1248, 0],
    })
    HasUrl = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
            },
            conditions: [
                {
                    id: '1',
                    leftValue: '={{ $json._has_url }}',
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
        id: '9af45262-96b7-44d1-a0d7-1bcafc5bc7d7',
        name: 'Check Website',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1520, -96],
        onError: 'continueErrorOutput',
    })
    CheckWebsite = {
        method: 'HEAD',
        url: '={{ $json._normalized_url }}',
        options: {
            redirect: {
                redirect: {
                    maxRedirects: 5,
                },
            },
            timeout: 10000,
        },
    };

    @node({
        id: '61a6e35b-b5c6-4e0c-bccc-623afaf3380c',
        name: 'Format Success',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1776, -208],
    })
    FormatSuccess = {
        mode: 'runOnceForEachItem',
        jsCode: `const vc = $('Validate Contacts').item.json;
const now = new Date().toISOString();
return {
  Entidade: vc.Entidade || '', NIPC: vc.NIPC || '', Nome: vc._company_name,
  Morada: vc.Morada || '', Localidade: vc.Localidade || '', CodPostal: vc.CodPostal || '',
  Concelho: vc.Concelho || '', Distrito: vc.Distrito || '',
  Telefone: vc.Telefone || '', Fax: vc.Fax || '', Email: vc.Email || '',
  Internet: vc.Internet || '', normalized_url: vc._normalized_url,
  website_status: 'exists', http_status_code: $json.statusCode || 200,
  redirect_url: $json.redirectUrl || '',
  email_valid: vc._email_valid, email_notes: vc._email_notes,
  phone_format_valid: vc._phone_valid, phone_notes: vc._phone_notes,
  fax_format_valid: vc._fax_valid, fax_notes: vc._fax_notes,
  validation_timestamp: now, notes: '',
};
`,
    };

    @node({
        id: '5c1bca19-db2a-4a9f-a64f-5679a4960f4e',
        name: 'Format Error',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1776, 0],
    })
    FormatError = {
        mode: 'runOnceForEachItem',
        jsCode: `const vc = $('Validate Contacts').item.json;
const now = new Date().toISOString();
const errMsg = String($json.error?.message || $json.message || 'unknown error').toLowerCase();
let status = 'error';
if (errMsg.includes('timeout') || errMsg.includes('timedout') || errMsg.includes('timed out')) {
  status = 'timeout';
} else if (errMsg.includes('enotfound') || errMsg.includes('getaddrinfo') || errMsg.includes('not found')) {
  status = 'not_found';
} else if (errMsg.includes('econnrefused') || errMsg.includes('econnreset')) {
  status = 'connection_refused';
}
return {
  Entidade: vc.Entidade || '', NIPC: vc.NIPC || '', Nome: vc._company_name,
  Morada: vc.Morada || '', Localidade: vc.Localidade || '', CodPostal: vc.CodPostal || '',
  Concelho: vc.Concelho || '', Distrito: vc.Distrito || '',
  Telefone: vc.Telefone || '', Fax: vc.Fax || '', Email: vc.Email || '',
  Internet: vc.Internet || '', normalized_url: vc._normalized_url,
  website_status: status, http_status_code: $json.statusCode || 0, redirect_url: '',
  email_valid: vc._email_valid, email_notes: vc._email_notes,
  phone_format_valid: vc._phone_valid, phone_notes: vc._phone_notes,
  fax_format_valid: vc._fax_valid, fax_notes: vc._fax_notes,
  validation_timestamp: now, notes: errMsg.substring(0, 200),
};
`,
    };

    @node({
        id: 'ca2dd6be-4c20-44ae-bdd5-24fa2759405a',
        name: 'Format No URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1520, 208],
    })
    FormatNoUrl = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();
return {
  Entidade: $json.Entidade || '', NIPC: $json.NIPC || '', Nome: $json._company_name,
  Morada: $json.Morada || '', Localidade: $json.Localidade || '', CodPostal: $json.CodPostal || '',
  Concelho: $json.Concelho || '', Distrito: $json.Distrito || '',
  Telefone: $json.Telefone || '', Fax: $json.Fax || '', Email: $json.Email || '',
  Internet: $json.Internet || '', normalized_url: '', website_status: 'no_url',
  http_status_code: 0, redirect_url: '',
  email_valid: $json._email_valid, email_notes: $json._email_notes,
  phone_format_valid: $json._phone_valid, phone_notes: $json._phone_notes,
  fax_format_valid: $json._fax_valid, fax_notes: $json._fax_notes,
  validation_timestamp: now, notes: 'No website URL provided',
};
`,
    };

    @node({
        id: 'fd6fba90-0e45-4011-a36f-d761ae5c56ca',
        name: 'Merge Results',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [2032, 0],
    })
    MergeResults = {
        numberInputs: 3,
    };

    @node({
        id: 'd385b894-bac0-424c-bc2e-8572d62d9d88',
        name: 'Build Report',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2288, -208],
    })
    BuildReport = {
        jsCode: `const items = $input.all().map(i => i.json);
const total = items.length;
const exists = items.filter(i => i.website_status === 'exists').length;
const notFound = items.filter(i => i.website_status === 'not_found').length;
const timeout = items.filter(i => i.website_status === 'timeout').length;
const noUrl = items.filter(i => i.website_status === 'no_url').length;
const errors = items.filter(i => ['error', 'connection_refused'].includes(i.website_status)).length;
const emailsValid = items.filter(i => i.email_valid === true).length;
const emailsInvalid = items.filter(i => i.email_valid === false && i.email_notes !== 'No email provided').length;
const emailsMissing = items.filter(i => i.email_notes === 'No email provided').length;
const phonesValid = items.filter(i => i.phone_format_valid === true).length;
const phonesInvalid = items.filter(i => i.phone_format_valid === false && i.phone_notes !== 'No phone provided').length;
const phonesMissing = items.filter(i => i.phone_notes === 'No phone provided').length;

return [{
  json: {
    summary: {
      total_companies: total,
      website_validation: { exists, not_found: notFound, timeout, no_url: noUrl, errors },
      contact_validation: {
        emails_valid: emailsValid, emails_invalid: emailsInvalid, emails_missing: emailsMissing,
        phones_valid: phonesValid, phones_invalid: phonesInvalid, phones_missing: phonesMissing,
      },
    },
    results: items,
  }
}];
`,
    };

    @node({
        id: '6c345854-a62b-45d0-9d09-12b4ef2a3526',
        name: 'Respond With Report',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [2560, -208],
    })
    RespondWithReport = {
        respondWith: 'allIncomingItems',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Content-Type',
                        value: 'application/json',
                    },
                ],
            },
        },
    };

    @node({
        id: '77c154de-4ea3-464e-a60c-eeac6102cf2a',
        name: 'Generate XLSX',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [2288, 208],
    })
    GenerateXlsx = {
        operation: 'xlsx',
        binaryPropertyName: 'validation_report',
        options: {
            fileName: 'validation-report.xlsx',
        },
    };

    @node({
        id: 'd00da349-c6a3-4627-840d-bebd51fb7498',
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-16, 256],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        id: 'bd86fa9a-342a-4274-85c9-223f6fc946e1',
        name: 'Google Drive Trigger',
        type: 'n8n-nodes-base.googleDriveTrigger',
        version: 1,
        position: [208, -240],
        credentials: { googleDriveOAuth2Api: { id: 'X86AoRbLZx35cevh', name: 'Google Drive account' } },
        alwaysOutputData: false,
        executeOnce: false,
        retryOnFail: false,
    })
    GoogleDriveTrigger = {
        triggerOn: 'specificFile',
        event: 'fileUpdated',
        fileToWatch: {
            __rl: true,
            value: '1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU',
            mode: 'list',
            cachedResultName: 'Cliente_BD_INPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU/edit?usp=drivesdk',
        },
    };

    @node({
        id: 'f1445a76-dc02-413e-b280-bd175fa4672f',
        name: 'Download File',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [208, -80],
        credentials: { googleDriveOAuth2Api: { id: 'X86AoRbLZx35cevh', name: 'Google Drive account' } },
    })
    DownloadFile = {
        operation: 'download',
        fileId: {
            __rl: true,
            mode: 'id',
            value: '={{ $json.id }}',
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ReceiveExcelFile.out(0).to(this.ParseExcel.in(0));
        this.ParseExcel.out(0).to(this.NormalizeUrl.in(0));
        this.NormalizeUrl.out(0).to(this.ValidateContacts.in(0));
        this.ValidateContacts.out(0).to(this.HasUrl.in(0));
        this.HasUrl.out(0).to(this.CheckWebsite.in(0));
        this.HasUrl.out(1).to(this.FormatNoUrl.in(0));
        this.CheckWebsite.out(0).to(this.FormatSuccess.in(0));
        this.CheckWebsite.out(1).to(this.FormatError.in(0));
        this.FormatSuccess.out(0).to(this.MergeResults.in(0));
        this.FormatError.out(0).to(this.MergeResults.in(1));
        this.FormatNoUrl.out(0).to(this.MergeResults.in(2));
        this.MergeResults.out(0).to(this.BuildReport.in(0));
        this.MergeResults.out(0).to(this.GenerateXlsx.in(0));
        this.BuildReport.out(0).to(this.RespondWithReport.in(0));
        this.GoogleDriveTrigger.out(0).to(this.DownloadFile.in(0));
        this.DownloadFile.out(0).to(this.ParseExcel.in(0));
    }
}
