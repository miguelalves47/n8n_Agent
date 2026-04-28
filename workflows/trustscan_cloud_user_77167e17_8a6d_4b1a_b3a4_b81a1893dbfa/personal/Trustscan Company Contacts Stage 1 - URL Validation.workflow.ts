import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts Stage 1 - URL Validation
// Nodes   : 40  |  Connections: 42
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// CodeSemUrl                         code                       [alwaysOutput]
// InputLerClienteBdInput             googleSheets               [creds]
// IngestNormalizarIdsRunEntityExecUrl code                       [alwaysOutput]
// StateUpsertControlExecIngested     googleSheets               [creds] [alwaysOutput]
// AuditAppendUrlChecksHttpOk         googleSheets               [creds] [alwaysOutput]
// StateUpdateControlExecPosHttpOk    googleSheets               [creds] [alwaysOutput]
// AuditAppendUrlChecksHttpErr        googleSheets               [creds] [alwaysOutput]
// StateUpdateControlExecPosHttpErr   googleSheets               [creds] [alwaysOutput]
// AuditAppendUrlChecksNoUrl          googleSheets               [creds] [alwaysOutput]
// StateUpdateControlExecNoUrl        googleSheets               [creds]
// StateUpdateControlExecPosHttpOk1   googleSheets               [creds] [alwaysOutput]
// AuditAppendUrlChecksHttpOk1        googleSheets               [creds] [alwaysOutput]
// Finalize1                          code
// Finalize2                          code
// Finalize3                          code
// StateUpsertSnapshot                googleSheets               [creds] [alwaysOutput]
// Merge                              merge
// WhenClickingExecuteWorkflow        manualTrigger
// HeadNormalizaSucess                code                       [onError→regular] [alwaysOutput]
// HeadNormalizaErro                  code                       [onError→regular] [alwaysOutput]
// GetNormalizaErro                   code
// GateTemWebsiteNorm                 if                         [alwaysOutput]
// GetNormalizaSucess                 code
// Merge2                             merge
// AuditAppendUrlChecksHttpErr1       googleSheets               [onError→regular] [creds]
// DecideHttpFallback                 code                       [alwaysOutput]
// If_                                if                         [onError→regular] [alwaysOutput]
// HttpRequest                        httpRequest                [onError→out(1)]
// HttpsGetRequestUrl                 httpRequest                [onError→out(1)] [alwaysOutput]
// HttpsHeadRequestUrl                httpRequest                [onError→out(1)] [alwaysOutput]
// Finalize5                          code
// Finalize4                          code                       [onError→regular]
// Finalize                           code
// StateUpdateControlExecPosHttpOk2   googleSheets               [creds] [alwaysOutput]
// AuditAppendUrlChecksHttpOk11       googleSheets               [creds] [alwaysOutput]
// Finalize6                          code
// HttpNormalizaErro                  code
// HttpNormalizaSucess                code
// AuditAppendUrlChecksHttp           googleSheets               [creds] [alwaysOutput]
// StateUpdateControlExecPosHttp      googleSheets               [creds] [alwaysOutput]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingExecuteWorkflow
//    → InputLerClienteBdInput
//      → IngestNormalizarIdsRunEntityExecUrl
//        → StateUpsertControlExecIngested
//          → Merge
//            → GateTemWebsiteNorm
//              → HttpsHeadRequestUrl
//                → HeadNormalizaSucess
//                  → AuditAppendUrlChecksHttpOk
//                    → StateUpdateControlExecPosHttpOk
//                      → Finalize1
//               .out(1) → HeadNormalizaErro
//                  → Merge2.in(1)
//                    → AuditAppendUrlChecksHttpOk1
//                      → StateUpdateControlExecPosHttpOk1
//                        → Finalize2
//                  → AuditAppendUrlChecksHttpErr1
//                    → Finalize4
//                  → DecideHttpFallback
//                    → If_
//                      → HttpRequest
//                        → HttpNormalizaSucess
//                          → AuditAppendUrlChecksHttpOk11
//                            → StateUpdateControlExecPosHttpOk2
//                              → Finalize6
//                       .out(1) → HttpNormalizaErro
//                          → AuditAppendUrlChecksHttp
//                            → StateUpdateControlExecPosHttp
//                              → Finalize
//                     .out(1) → HttpsGetRequestUrl
//                        → GetNormalizaSucess
//                          → Merge2 (↩ loop)
//                       .out(1) → GetNormalizaErro
//                          → AuditAppendUrlChecksHttpErr
//                            → StateUpdateControlExecPosHttpErr
//                              → Finalize3
//             .out(1) → CodeSemUrl
//                → AuditAppendUrlChecksNoUrl
//                  → StateUpdateControlExecNoUrl
//                    → Finalize5
//        → Merge.in(1) (↩ loop)
//        → StateUpsertSnapshot
//          → Merge.in(2) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'cUUUCbn21ZeikazR-pmgX',
    name: 'Trustscan Company Contacts Stage 1 - URL Validation',
    active: false,
    tags: ['Company Contacts'],
    settings: {
        executionOrder: 'v1',
        availableInMCP: false,
        timeSavedMode: 'fixed',
        callerPolicy: 'workflowsFromSameOwner',
        saveDataSuccessExecution: 'none',
        saveManualExecutions: true,
        binaryMode: 'separate',
        saveDataErrorExecution: 'all',
    },
})
export class TrustscanCompanyContactsStage1UrlValidationWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '3b0d3d34-31e2-4223-bcef-1ee7c69a5d35',
        name: 'Code "Sem URL"',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2112, -224],
        alwaysOutputData: true,
    })
    CodeSemUrl = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

return {
  ...$json,

  Current_phase: 'URL_SKIPPED',
  Status: 'PENDING',

  // 🔥 motor deste workflow tem de morrer
  Next_action: '',

  // ✅ handoff para o próximo workflow
  Queued_action: 'DISCOVER_URL',

  Attempts: Number($json.Attempts ?? $json.attempts) || 0,
  Last_error: 'NO_URL_PROVIDED',

  Website_ResponseClass: 'NO_URL',
  Website_Error: 'NO_URL',
  Website_CheckedAt: now,
  Updated_at: now,
};
`,
    };

    @node({
        id: 'b11695a7-f2d8-4e9d-a585-5262b805a620',
        name: 'INPUT · Ler Cliente_BD_INPUT',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-3232, -848],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: false,
    })
    InputLerClienteBdInput = {
        documentId: {
            __rl: true,
            value: '1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU',
            mode: 'list',
            cachedResultName: 'Cliente_BD_INPUT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Página1',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1--llpu9MQcy81_6xJ5GIoJQjsRy4QT9nEPXF0_ckhCU/edit#gid=0',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRangeA1',
                },
            },
        },
    };

    @node({
        id: 'e73d5482-5bb2-4409-aec0-6ba708a0abaa',
        name: 'INGEST · Normalizar + IDs (Run/Entity/Exec/URL)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-3008, -848],
        alwaysOutputData: true,
    })
    IngestNormalizarIdsRunEntityExecUrl = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function pickFirst(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return v;
    }
  }
  return '';
}

function pickFirstAny(...vals) {
  for (const v of vals) {
    if (v === 0) return v;
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return v;
    }
  }
  return '';
}

function toStr(v) {
  return (v ?? '').toString().trim();
}

function toIntOrNull(v) {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function stripWeirdWhitespace(s) {
  return (s ?? '')
    .toString()
    .replace(/[\\u0000-\\u001F\\u007F-\\u009F\\u00A0]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

function normalizeLooseText(s) {
  return stripWeirdWhitespace(s);
}

function normalizeUrlForceHttps(input) {
  let s = stripWeirdWhitespace(input);
  if (!s) return '';

  s = s.replace(/[),.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:)/i.test(s)) return '';
  if (s.startsWith('//')) s = 'https:' + s;

  // corrige duplicações do género https://https://dominio
  s = s.replace(/^https?:\\/\\/https?:\\/\\//i, 'https://');

  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) {
    s = 'https://' + s;
  }

  s = s.replace(/^http:\\/\\//i, 'https://');

  try {
    const u = new URL(s);
    if (!u.hostname || !u.hostname.includes('.')) return '';
    u.hash = '';
    return u.toString();
  } catch {
    return '';
  }
}

function softCoerceUrl(input) {
  let s = stripWeirdWhitespace(input);
  if (!s) return '';

  s = s.replace(/[),.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:)/i.test(s)) return '';
  if (s.startsWith('//')) s = 'https:' + s;

  s = s.replace(/^https?:\\/\\/https?:\\/\\//i, 'https://');

  if (/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) {
    return s.replace(/^http:\\/\\//i, 'https://');
  }

  return 'https://' + s.replace(/^http:\\/\\//i, '').replace(/^https:\\/\\//i, '');
}

// --------------------------------------------------
// Input
// --------------------------------------------------
const input = { ...$json };

// remove lixo técnico herdado que não interessa propagar
delete input.request_url_seed;
delete input.Request_url_seed;

// --------------------------------------------------
// Canonical technical fields
// --------------------------------------------------
const runId = toStr(
  pickFirst(
    $execution?.id,
    input.run_id,
    input.Run_ID,
    now
  )
);

let inputRow = pickFirstAny(
  input.input_row,
  input.Input_Row,
  input.Input_row,
  input.row_number,
  input.rowNumber,
  input.row
);

inputRow = toIntOrNull(inputRow);

const nipc = toStr(pickFirst(input.nipc, input.NIPC));
const entidade = toStr(pickFirst(input.entidade, input.Entidade));

const entityKey =
  nipc ||
  entidade ||
  (inputRow !== null
    ? \`ROW_\${inputRow}\`
    : \`ROW_FALLBACK_\${Math.floor(Math.random() * 1e9)}\`);

const finalInputRow =
  inputRow !== null
    ? inputRow
    : \`NO_INPUT_ROW_\${entityKey}\`;

const execKey = \`\${runId}_\${entityKey}\`;

// --------------------------------------------------
// Website normalization
// --------------------------------------------------
const websiteRaw = normalizeLooseText(
  pickFirst(
    input.website_raw,
    input.Internet,
    input.internet,
    input.Website,
    input.website,
    input.site
  )
);

const hasWebsiteInput = websiteRaw.length > 0;
const websiteNormStrict = normalizeUrlForceHttps(websiteRaw);

const websiteNormFinal = hasWebsiteInput
  ? (websiteNormStrict || softCoerceUrl(websiteRaw))
  : '';

const websiteNormStatus = !hasWebsiteInput
  ? 'NO_INPUT'
  : websiteNormStrict
    ? 'NORMALIZED_STRICT'
    : websiteNormFinal
      ? 'COERCED_FALLBACK'
      : 'FAILED';

// --------------------------------------------------
// Process fields
// --------------------------------------------------
const attempts = Number(
  pickFirstAny(input.attempts, input.Attempts, 0)
) || 0;

const lockUntil = toStr(pickFirst(input.lock_until, input.Lock_until));
const lastError = toStr(pickFirst(input.last_error, input.Last_error));

// estado de processo separado de status HTTP
const processPhase = toStr(pickFirst(input.current_phase, input.process_phase)) || 'INGESTED';
const processStatus = toStr(pickFirst(input.process_status)) || 'IN_PROGRESS';
const nextAction = toStr(pickFirst(input.next_action));
const queuedAction = toStr(pickFirst(input.queued_action));

// --------------------------------------------------
// Preserve HTTP fields safely (sem colidir com "status")
// --------------------------------------------------
const httpMethod = toStr(pickFirst(input.http_method, input.method)).toUpperCase();
const httpStatus =
  (typeof input.http_status === 'number' ? input.http_status : null) ??
  (typeof input.statusCode === 'number' ? input.statusCode : null) ??
  (typeof input.status === 'number' ? input.status : null) ??
  (typeof input.error?.status === 'number' ? input.error.status : null);

const httpStatusMessage = toStr(
  pickFirst(
    input.http_status_message,
    input.statusMessage,
    input.error?.message,
    input.message
  )
);

const httpContentType = toStr(
  pickFirst(
    input.http_content_type,
    input.headers?.['content-type'],
    input.headers?.['Content-Type'],
    input.response?.headers?.['content-type'],
    input.contentType
  )
);

// --------------------------------------------------
// Normalized business fields
// --------------------------------------------------
const normalizedBusiness = {
  entidade: toStr(pickFirst(input.entidade, input.Entidade)),
  nipc: toStr(pickFirst(input.nipc, input.NIPC)),
  nome: normalizeLooseText(pickFirst(input.nome, input.Nome)),
  morada: normalizeLooseText(pickFirst(input.morada, input.Morada)),
  localidade: normalizeLooseText(pickFirst(input.localidade, input.Localidade)),
  cod_postal: normalizeLooseText(pickFirst(input.cod_postal, input.CodPostal, input.codigo_postal)),
  concelho: normalizeLooseText(pickFirst(input.concelho, input.Concelho)),
  distrito: normalizeLooseText(pickFirst(input.distrito, input.Distrito)),
  telefone: toStr(pickFirst(input.telefone, input.Telefone)),
  fax: toStr(pickFirst(input.fax, input.Fax)),
  email: toStr(pickFirst(input.email, input.Email)),
  internet: websiteRaw,
};

// --------------------------------------------------
// Output
// --------------------------------------------------
return {
  ...input,

  // canónicos técnicos
  run_id: runId,
  entity_key: entityKey,
  exec_key: execKey,
  input_row: finalInputRow,

  website_raw: websiteRaw,
  website_norm: websiteNormFinal,
  website_norm_status: websiteNormStatus,

  // estado do pipeline — NÃO usar "status"
  current_phase: processPhase,
  process_status: processStatus,
  next_action: nextAction,
  queued_action: queuedAction,

  attempts,
  lock_until: lockUntil,
  last_error: lastError,
  updated_at: now,

  // http canónico, sem ambiguidade
  http_method: httpMethod,
  http_status: httpStatus,
  http_status_message: httpStatusMessage,
  http_content_type: httpContentType,

  // canónicos de negócio
  ...normalizedBusiness,
};`,
    };

    @node({
        id: '2530e2db-5732-4a57-a2d3-f8568217923b',
        name: 'STATE · Upsert CONTROL_EXEC (INGESTED)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-2784, -992],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpsertControlExecIngested = {
        operation: 'appendOrUpdate',
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
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Input_Row: '={{ $json.input_row }}',
                Current_phase: '={{ $json.current_phase }}',
                Next_action: '={{ $json.next_action }}',
                Attempts: '={{ $json.attempts }}',
                Lock_until: '={{ $json.lock_until }}',
                Last_error: '={{ $json.last_error }}',
                Updated_at: '={{ $json.updated_at }}',
                Exec_key: '={{ $json.exec_key }}',
                Process_Status: '={{ $json.process_status }}',
                Queued_action: '=',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: '1986acc3-641f-4eea-8fd6-f2ace45cba4e',
        name: 'AUDIT · Append URL_CHECKS (HTTP_OK)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1664, -1376],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksHttpOk = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Attempt_no: '=1',
                Request_url: '={{ $json.request_url }}',
                Status_code: '={{ $json.status_code }}',
                Response_class: '={{ $json.response_class }}',
                Content_type: '={{ $json.content_type }}',
                Transport_error: '={{ $json.transport_error }}',
                Request_method: 'HEAD',
                Final_url: '={{ $json.final_url }}',
                Network_error: '={{ $json.network_error }}',
                Exec_key: '=§ {{ $json.run_id }}',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: '110528b7-21cf-4d06-b0ab-351c1f94a02c',
        name: 'STATE · Update CONTROL_EXEC (pós HTTP_OK)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1440, -1376],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlExecPosHttpOk = {
        operation: 'appendOrUpdate',
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
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: '={{ $(\'Head Normaliza  "Sucess"\').item.json.row_number }}',
                Current_phase: '=URL_VALIDATED',
                Next_action: "={{ '' }}",
                Attempts: '={{ $json.Attempt_no }}',
                Last_error: '=',
                Updated_at: '={{ $now.toISO() }}',
                Queued_action: 'ENRICH_FROM_WEBSITE',
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: '09e030e4-25c5-440a-8edd-9fd9931bc2f6',
        name: 'AUDIT · Append URL_CHECKS (HTTP_ERR)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-768, -544],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksHttpErr = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Response_class: '={{ $json.response_class }}',
                Transport_error: "={{ ($json.transport_error || '').replace(/\\s+/g,' ').slice(0,100) }}",
                Run_ID: "={{$json.run_id || ''}}",
                Entity_key: "={{$json.entity_key || ''}}",
                Attempt_no: '=1',
                Request_method: 'GET',
                Status_code: '={{ $json.status_code }}',
                Content_type: "={{ $json.content_type || '' }}",
                Request_url: '={{ $json.request_url }}',
                Network_error: "={{ $json.network_error || '' }}",
                Final_url: '={{ $json.final_url || $json.request_url }}',
                Exec_key: "={{$json.exec_key || ''}}",
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: '054ea162-cc65-481e-ad63-67089ae2e48a',
        name: 'STATE · Update CONTROL_EXEC (pós HTTP_ERR)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-544, -544],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlExecPosHttpErr = {
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
                Current_phase: 'URL_FAILED',
                Next_action: "={{ '' }}",
                Attempts: '={{ $json.attempts ?? 1 }}',
                Last_error: '=',
                Lock_until: "={{ '' }}",
                Updated_at: '={{ $now.toISO() }}',
                Queued_action: 'DISCOVER_URL',
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: "={{ $('Get Normaliza > Erro').item.json.input_row }}",
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: 'd2f6e065-f0f3-4fd7-9a00-b7835eeb170a',
        name: 'AUDIT · Append URL_CHECKS (NO_URL)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1888, -224],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksNoUrl = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Entity_key: '={{ $json.entity_key }}',
                Attempt_no: '0',
                Response_class: 'NO_URL',
                Transport_error: 'NO_URL_PROVIDED',
                Network_error: '=',
                Request_method: 'None',
                Exec_key: '={{ $json.exec_key }}',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: 'a57200c2-0a87-41c3-9a5b-7e38b1f5de2a',
        name: 'STATE · Update CONTROL_EXEC (NO_URL)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1664, -224],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
    })
    StateUpdateControlExecNoUrl = {
        operation: 'appendOrUpdate',
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
                Last_error: 'NO_URL_PROVIDED',
                Current_phase: 'URL_SKIPPED',
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: '={{ $(\'Code "Sem URL"\').item.json.input_row }}',
                Queued_action: "={{ $json.Queued_action ?? 'DISCOVER_URL' }}",
                Next_action: "={{ '' }}",
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: 'c15abe14-7370-493f-bba9-a5ca8c835d05',
        name: 'STATE · Update CONTROL_EXEC (pós HTTP_OK)1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-320, -736],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlExecPosHttpOk1 = {
        operation: 'appendOrUpdate',
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
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: "={{ $('Merge2').item.json.input_row }}",
                Current_phase: 'URL_VALIDATED',
                Next_action: "={{ '' }}",
                Attempts: '={{$json.attempts || 1}}',
                Last_error: '=',
                Updated_at: '={{ $now.toISO() }}',
                Queued_action: 'ENRICH_FROM_WEBSITE',
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: 'c851ff20-8ee5-4cac-ab3e-86252656ce2c',
        name: 'AUDIT · Append URL_CHECKS (HTTP_OK) ',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-544, -736],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksHttpOk1 = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{$json.run_id}}',
                Entity_key: '={{$json.entity_key}}',
                Status_code: "={{$json.get_status || ''}}",
                Response_class: '=SUCCESS',
                Final_url: "={{$json.website_norm || ''}}",
                Content_type: "= {{$json.get_has_html ? 'text/html' : ''}}",
                Transport_error: "={{ ($json.transport_error || '').replace(/\\s+/g,' ').slice(0,100) }}",
                Attempt_no: '=1',
                Request_url: "={{$json.website_norm || ''}}",
                Network_error: '={{ $json.network_error }}',
                Request_method: 'GET',
                Exec_key: '={{$json.exec_key}}',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: 'ee22348f-1387-4688-9c77-8f3fe52fe0cf',
        name: 'Finalize 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1216, -1376],
    })
    Finalize1 = {
        mode: 'runOnceForEachItem',
        jsCode: `const j = $json ?? {};
const now = new Date().toISOString();

return {
  json: {
    ...j,

    // campos finais sempre por último
    request_method: 'HEAD',
    website_ok: true,
    head_validated: true,
    should_run_get: false,
    validation_source: 'HEAD',
    final_decision: 'VALIDATED_BY_HEAD',

    current_phase: 'URL_VALIDATED',
    process_status: 'PENDING',
    queued_action: 'ENRICH_FROM_WEBSITE',

    website_state: 'OK',
    updated_at: now
  }
};`,
    };

    @node({
        id: 'f4641361-170b-4ffd-88ef-82fc7cc428f2',
        name: 'Finalize 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-96, -736],
    })
    Finalize2 = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

return {
  ...$json,
  Next_action: '',
  Finished_at: now,
  Updated_at: now,
};
`,
    };

    @node({
        id: '3fdde966-dc82-457b-8353-595e1165590b',
        name: 'Finalize 3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-320, -544],
    })
    Finalize3 = {
        mode: 'runOnceForEachItem',
        jsCode: `// Add a new field called 'myNewField' to the JSON of the item
$input.item.json.myNewField = 1;

return $input.item;`,
    };

    @node({
        id: 'f6edf0b4-f9f8-44b8-9be8-e8c8aec5e0ca',
        name: 'STATE · Upsert SNAPSHOT',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-2784, -704],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpsertSnapshot = {
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
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'INPUT_SNAPSHOT',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=0',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{ $json.run_id }}',
                Input_Row: '={{ $json.input_row }}',
                Imported_at: '={{ $json.updated_at }}',
                Internet: '={{ $json.Internet }}',
                Email: '={{ $json.Email }}',
                Fax: '={{ $json.Fax }}',
                Telefone: '={{ $json.Telefone }}',
                Distrito: '={{ $json.Distrito }}',
                Concelho: '={{ $json.Concelho }}',
                CodPostal: '={{ $json.CodPostal }}',
                Localidade: '={{ $json.Localidade }}',
                Morada: '={{ $json.Morada }}',
                Nome: '={{ $json.Nome }}',
                NIPC: '={{ $json.NIPC }}',
                Entidade: '={{ $json.Entidade }}',
                Processed: '=',
            },
            matchingColumns: ['Exec_KEY'],
            schema: [
                {
                    id: 'Processed',
                    displayName: 'Processed',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
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
        id: '9dca5ecc-0d37-488b-923a-329067617ab6',
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-2560, -864],
    })
    Merge = {
        mode: 'combineBySql',
        numberInputs: 3,
        query: 'SELECT * FROM input1 RIGHT JOIN input2 ON input1.exec_key = input2.exec_key',
        options: {},
    };

    @node({
        id: '0c168bed-2ee1-41f9-9cfe-cd56472ccfa9',
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-3456, -848],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        id: '196fd4aa-ce48-47d1-af5c-7271f784f619',
        name: 'Head Normaliza  "Sucess"',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1888, -1376],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    HeadNormalizaSucess = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlForceHttps(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;
  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) return original;
  if (s.startsWith('//')) s = 'https:' + s;
  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) s = 'https://' + s;

  s = s.replace(/^http:\\/\\//i, 'https://');

  try {
    const u = new URL(s);
    if (!u.hostname || !u.hostname.includes('.')) return original;
    u.hash = '';

    if (u.protocol === 'https:' && u.port === '443') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function extractBody(j) {
  return (
    j.body ??
    j.response_body ??
    j.data ??
    ''
  );
}

function detectHasHtml(contentType, body, headers) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;

  const xPoweredBy = asCleanString(headers['x-powered-by']);
  const server = asCleanString(headers['server']);

  if (/cloudflare/i.test(server) && bodyStr) return true;

  return false;
}

function estimateBodySize(body) {
  if (body === undefined || body === null) return 0;
  if (typeof body === 'string') return body.length;

  try {
    return JSON.stringify(body).length;
  } catch {
    return String(body).length;
  }
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const http = $json ?? {};
const src = $('GATE_Tem website_norm?').item.json ?? {};
const j = { ...src, ...http };

const headersRaw = j.headers ?? j.response_headers ?? {};
const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

// --------------------------------------------------
// Website original / norm
// --------------------------------------------------
const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.internet, j.Internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// URL
// --------------------------------------------------
const requestUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

const redirectLocation = pickFirstNonEmpty(
  j.redirect_location,
  headers.location,
  headers.Location
);

const finalUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.final_url,
    j.website_final_url_norm,
    redirectLocation,
    requestUrl
  )
);

// --------------------------------------------------
// Método / status / content-type
// --------------------------------------------------
const method = asCleanString(
  pickFirstNonEmpty(
    j.request_method,
    j.http_method,
    j.method,
    'HEAD'
  )
).toUpperCase();

const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.status_code,
    j.http_status,
    j.statusCode,
    j.status
  )
);

const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    j.http_status_message,
    j.head_status_message,
    'OK'
  )
);

const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  j.head_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);

// --------------------------------------------------
// Body / sinais de HTML
// --------------------------------------------------
const body = extractBody(j);
const headHasHtml = detectHasHtml(contentType, body, headers);
const headBodySize = estimateBodySize(body);

const finalContentType = contentType || (headHasHtml ? 'text/html' : '');

// --------------------------------------------------
// Classificação
// --------------------------------------------------
const responseClass = classifyStatus(statusCode);

const websiteOk =
  typeof statusCode === 'number' &&
  !Number.isNaN(statusCode) &&
  statusCode >= 200 &&
  statusCode < 400;

const isHtml = headHasHtml;

const headValidated =
  method === 'HEAD' &&
  websiteOk &&
  isHtml;

// --------------------------------------------------
// Decisão operacional
// --------------------------------------------------
// 2xx/3xx com HTML => validado por HEAD
// 2xx/3xx sem HTML => existe, mas pode justificar GET se precisares de conteúdo
let websiteState = 'OK';
let finalDecision = 'VALIDATED_BY_HEAD';
let auditResult = 'HTTP_OK';
let queuedAction = 'ENRICH_FROM_WEBSITE';
let processStatus = 'PENDING';
let shouldRunGet = false;

if (!websiteOk) {
  websiteState = 'HEAD_HTTP_NOT_OK';
  finalDecision = 'HEAD_NOT_VALIDATED';
  auditResult = 'HTTP_ERROR';
  queuedAction = '';
  processStatus = 'IN_PROGRESS';
  shouldRunGet = false;
} else if (!isHtml) {
  websiteState = 'HEAD_OK_NON_HTML';
  finalDecision = 'HEAD_OK_NON_HTML';
  auditResult = 'HTTP_OK_NON_HTML';
  queuedAction = '';
  processStatus = 'PENDING';
  shouldRunGet = false;
}

// --------------------------------------------------
// Output final
// --------------------------------------------------
return {
  json: {
    ...j,

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: 'HEAD',
    request_url: requestUrl,

    status_code: statusCode ?? '',
    response_class: responseClass,
    final_url: finalUrl || requestUrl,
    content_type: finalContentType,

    transport_error: '',
    network_error: '',

    website_raw: websiteRaw,
    website_norm: finalUrl || requestUrl || websiteNormOriginal,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: finalUrl || requestUrl,
    website_status_code: statusCode ?? '',
    website_response_class: responseClass,
    website_content_type: finalContentType || '',
    website_checked_at: now,

    website_checked: true,
    website_ok: websiteOk,
    website_state: websiteState,
    website_exists: websiteOk,
    website_works: websiteOk,

    is_html: isHtml,
    head_validated: headValidated,
    should_run_get: shouldRunGet,

    validation_source: 'HEAD',
    final_decision: finalDecision,
    audit_result: auditResult,

    current_phase: websiteOk ? 'URL_VALIDATED' : 'HEAD_CHECKED',
    process_status: processStatus,
    queued_action: queuedAction,
    last_error: '',
    last_error_short: '',

    head_status: statusCode ?? '',
    head_status_message: statusMessage,
    head_status_message_short: truncateText(statusMessage, 500),
    head_has_html: headHasHtml,
    head_body_size: headBodySize,

    head_error_type: '',
    head_error_code: '',
    head_error_message: '',
    head_error_message_short: '',
    has_http_response: true,

    website_final_ok: websiteOk,
    website_final_state: websiteState,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: '6f4bdc21-b4b5-4e64-81b9-982787f5b326',
        name: 'Head Normaliza  "Erro"',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1888, -656],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    HeadNormalizaErro = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlForceHttps(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;

  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) {
    return original;
  }

  if (s.startsWith('//')) {
    s = 'https:' + s;
  }

  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) {
    s = 'https://' + s;
  }

  s = s.replace(/^http:\\/\\//i, 'https://');

  try {
    const u = new URL(s);

    if (!u.hostname || !u.hostname.includes('.')) {
      return original;
    }

    u.hash = '';

    if (u.protocol === 'https:' && u.port === '443') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function parseStatusFromMessage(msg) {
  const s = asCleanString(msg);
  if (!s) return null;

  let m = s.match(/^(\\d{3})\\s*-\\s*/);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/status code\\s+(\\d{3})/i);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/\\bstatus[:\\s]+(\\d{3})\\b/i);
  if (m) return toNumberOrNull(m[1]);

  return null;
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function detectHasHtml(contentType, body, message) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;

  const msgStr = asCleanString(message);
  if (/<html[\\s>]/i.test(msgStr) || /<!doctype html/i.test(msgStr)) return true;

  return false;
}

function estimateBodySize(body, fallbackMessage) {
  const bodyStr =
    typeof body === 'string'
      ? body
      : body != null
        ? JSON.stringify(body)
        : '';

  const msgStr =
    typeof fallbackMessage === 'string'
      ? fallbackMessage
      : '';

  const candidate = bodyStr || msgStr || '';
  return candidate.length;
}

function extractBody(j, errorObj) {
  return (
    errorObj.response?.data ??
    j.body ??
    j.response_body ??
    j.data ??
    ''
  );
}

function inferAuditResult(hasHttpResponse, headState) {
  if (hasHttpResponse) return 'HTTP_ERROR';

  if (
    headState === 'HEAD_DNS_NOT_FOUND' ||
    headState === 'HEAD_CONNECTION_REFUSED' ||
    headState === 'HEAD_CONNECTION_RESET' ||
    headState === 'HEAD_TIMEOUT' ||
    headState === 'HEAD_TLS_ERROR' ||
    headState === 'HEAD_TRANSPORT_ERROR'
  ) {
    return 'TRANSPORT_ERROR';
  }

  return 'REQUEST_ERROR';
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const j = $json ?? {};
const errorObj = (j.error && typeof j.error === 'object') ? j.error : {};

const headersRaw =
  j.headers ??
  errorObj.response?.headers ??
  j.response_headers ??
  {};

const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

// --------------------------------------------------
// Website original / normalizado
// --------------------------------------------------
const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.internet, j.Internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// URL tentada
// --------------------------------------------------
const requestUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

// --------------------------------------------------
// Mensagens / códigos de erro
// --------------------------------------------------
const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    j.head_status_message,
    j.message,
    errorObj.response?.statusText,
    errorObj.message
  )
);

let headErrorCode = asCleanString(
  pickFirstNonEmpty(
    j.code,
    j.head_error_code,
    errorObj.code
  )
);

// coerência operacional: se a mensagem indicar timeout, forçamos o código
if (/timeout/i.test(statusMessage)) {
  headErrorCode = 'ECONNABORTED';
}

const headErrorName = asCleanString(
  pickFirstNonEmpty(
    j.error_name,
    errorObj.name
  )
);

// --------------------------------------------------
// Status HTTP com fallback inteligente
// --------------------------------------------------
const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.statusCode,
    j.status,
    errorObj.status,
    errorObj.response?.status,
    j.head_status,
    parseStatusFromMessage(statusMessage)
  )
);

const hasHttpResponse =
  typeof statusCode === 'number' && !Number.isNaN(statusCode);

// --------------------------------------------------
// Content-Type e body
// --------------------------------------------------
const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  j.head_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);
const body = extractBody(j, errorObj);
const headHasHtml = detectHasHtml(contentType, body, statusMessage);
const headBodySize = estimateBodySize(body, statusMessage);

const finalContentType = contentType || (headHasHtml ? 'text/html' : '');

// --------------------------------------------------
// Classificação de resposta
// --------------------------------------------------
const responseClass = hasHttpResponse
  ? classifyStatus(statusCode)
  : 'TRANSPORT_ERROR';

// --------------------------------------------------
// Erros técnicos HEAD
// --------------------------------------------------
const transportError = statusMessage;
const networkError = headErrorCode;

// --------------------------------------------------
// Classificação final do erro HEAD
// --------------------------------------------------
let headState = 'HEAD_REQUEST_ERROR';

if (hasHttpResponse) {
  if (statusCode === 401 || statusCode === 403) {
    headState = 'HEAD_BLOCKED';
  } else if (statusCode === 404 || statusCode === 410) {
    headState = 'HEAD_NOT_FOUND';
  } else if (statusCode === 405 || statusCode === 501) {
    headState = 'HEAD_METHOD_NOT_ALLOWED';
  } else if (statusCode === 408) {
    headState = 'HEAD_TIMEOUT';
  } else if (statusCode === 429) {
    headState = 'HEAD_RATE_LIMITED';
  } else if (statusCode >= 500) {
    headState = 'HEAD_SERVER_ERROR';
  } else if (statusCode >= 400 && statusCode < 500) {
    headState = 'HEAD_CLIENT_ERROR';
  } else {
    headState = 'HEAD_HTTP_ERROR';
  }
} else {
  if (
    headErrorCode === 'ECONNABORTED' ||
    headErrorCode === 'ETIMEDOUT' ||
    /timeout/i.test(statusMessage)
  ) {
    headState = 'HEAD_TIMEOUT';
  } else if (
    headErrorCode === 'ENOTFOUND' ||
    headErrorCode === 'EAI_AGAIN'
  ) {
    headState = 'HEAD_DNS_NOT_FOUND';
  } else if (headErrorCode === 'ECONNREFUSED') {
    headState = 'HEAD_CONNECTION_REFUSED';
  } else if (headErrorCode === 'ECONNRESET') {
    headState = 'HEAD_CONNECTION_RESET';
  } else if (
    headErrorCode === 'EPROTO' ||
    headErrorCode === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    headErrorCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    headErrorCode === 'CERT_HAS_EXPIRED' ||
    headErrorCode === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    headErrorCode === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    headErrorName === 'NodeSslError' ||
    /ssl issue|ssl|certificate|certificado|tls/i.test(statusMessage)
  ) {
    headState = 'HEAD_TLS_ERROR';
  } else {
    headState = 'HEAD_TRANSPORT_ERROR';
  }
}

// --------------------------------------------------
// Sinais de existência
// --------------------------------------------------
const websiteExists = hasHttpResponse ? true : false;
const websiteWorks = false;

// --------------------------------------------------
// Erros resumidos
// --------------------------------------------------
const lastError = asCleanString(
  pickFirstNonEmpty(
    statusMessage,
    headErrorCode,
    headErrorName,
    headState
  )
);

const lastErrorShort = truncateText(lastError, 500);
const statusMessageShort = truncateText(statusMessage, 500);
const errorMessageShort = truncateText(statusMessage, 500);

// --------------------------------------------------
// Outros campos derivados
// --------------------------------------------------
const auditResult = inferAuditResult(hasHttpResponse, headState);

// --------------------------------------------------
// Output final
// --------------------------------------------------
return {
  json: {
    ...j,

    // opcional: saneamos o bloco error para refletir o erro operacional final
    error: {
      ...(errorObj || {}),
      code: headErrorCode,
      name: headErrorName,
      message: statusMessage
    },

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: 'HEAD',
    request_url: requestUrl,

    status_code: hasHttpResponse ? statusCode : '',
    response_class: responseClass,
    final_url: requestUrl,
    content_type: finalContentType,

    transport_error: transportError,
    network_error: networkError,

    website_raw: websiteRaw,
    website_norm: websiteNormOriginal || requestUrl,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: hasHttpResponse ? requestUrl : '',
    website_status_code: hasHttpResponse ? statusCode : '',
    website_response_class: responseClass,
    website_content_type: hasHttpResponse ? finalContentType : '',
    website_checked_at: now,

    website_checked: true,
    website_ok: false,
    website_state: headState,
    website_exists: websiteExists,
    website_works: websiteWorks,

    validation_source: 'HEAD',
    final_decision: headState,
    audit_result: auditResult,

    current_phase: 'HEAD_CHECKED',
    process_status: 'IN_PROGRESS',
    queued_action: '',
    last_error: lastError,
    last_error_short: lastErrorShort,

    head_status: hasHttpResponse ? statusCode : '',
    head_status_message: statusMessage,
    head_status_message_short: statusMessageShort,
    head_has_html: headHasHtml,
    head_body_size: headBodySize,

    head_error_type: headState,
    head_error_code: headErrorCode,
    head_error_message: statusMessage,
    head_error_message_short: errorMessageShort,
    has_http_response: hasHttpResponse,

    website_final_ok: false,
    website_final_state: headState,

    head_validated: false,
    should_run_get: false,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: '056fab5d-9ed3-42fb-b189-62fbc87990a9',
        name: 'Get Normaliza > Erro',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-992, -704],
    })
    GetNormalizaErro = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlForceHttps(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;

  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) {
    return original;
  }

  if (s.startsWith('//')) {
    s = 'https:' + s;
  }

  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) {
    s = 'https://' + s;
  }

  s = s.replace(/^http:\\/\\//i, 'https://');

  try {
    const u = new URL(s);

    if (!u.hostname || !u.hostname.includes('.')) {
      return original;
    }

    u.hash = '';

    if (u.protocol === 'https:' && u.port === '443') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function parseStatusFromMessage(msg) {
  const s = asCleanString(msg);
  if (!s) return null;

  let m = s.match(/^(\\d{3})\\s*-\\s*/);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/status code\\s+(\\d{3})/i);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/\\bstatus[:\\s]+(\\d{3})\\b/i);
  if (m) return toNumberOrNull(m[1]);

  return null;
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function detectHasHtml(contentType, body, message) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;

  const msgStr = asCleanString(message);
  if (/<html[\\s>]/i.test(msgStr) || /<!doctype html/i.test(msgStr)) return true;

  return false;
}

function estimateBodySize(body, fallbackMessage) {
  const bodyStr =
    typeof body === 'string'
      ? body
      : body != null
        ? JSON.stringify(body)
        : '';

  const msgStr =
    typeof fallbackMessage === 'string'
      ? fallbackMessage
      : '';

  const candidate = bodyStr || msgStr || '';
  return candidate.length;
}

function extractBody(j, errorObj) {
  return (
    errorObj.response?.data ??
    j.body ??
    j.response_body ??
    j.data ??
    ''
  );
}

function inferAuditResult(hasHttpResponse, getState) {
  if (hasHttpResponse) return 'HTTP_ERROR';

  if (
    getState === 'GET_DNS_NOT_FOUND' ||
    getState === 'GET_CONNECTION_REFUSED' ||
    getState === 'GET_CONNECTION_RESET' ||
    getState === 'GET_TIMEOUT' ||
    getState === 'GET_TLS_ERROR' ||
    getState === 'GET_TRANSPORT_ERROR'
  ) {
    return 'TRANSPORT_ERROR';
  }

  return 'REQUEST_ERROR';
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const j = $json ?? {};
const errorObj = (j.error && typeof j.error === 'object') ? j.error : {};

const headersRaw =
  j.headers ??
  errorObj.response?.headers ??
  j.response_headers ??
  {};

const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

// --------------------------------------------------
// Website original / normalizado
// --------------------------------------------------
const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.internet, j.Internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// URL tentada
// --------------------------------------------------
const requestUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

// --------------------------------------------------
// Mensagens / códigos de erro
// --------------------------------------------------
const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    errorObj.response?.statusText,
    errorObj.message,
    j.message,
    j.get_status_message
  )
);

const getErrorCode = asCleanString(
  pickFirstNonEmpty(
    errorObj.code,
    j.code,
    j.get_error_code
  )
);

const getErrorName = asCleanString(
  pickFirstNonEmpty(
    errorObj.name,
    j.error_name
  )
);

// --------------------------------------------------
// Status HTTP com fallback inteligente
// --------------------------------------------------
const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.statusCode,
    j.status,
    errorObj.status,
    errorObj.response?.status,
    j.get_status,
    parseStatusFromMessage(statusMessage)
  )
);

const hasHttpResponse =
  typeof statusCode === 'number' && !Number.isNaN(statusCode);

// --------------------------------------------------
// Content-Type e body
// --------------------------------------------------
const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  j.get_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);
const body = extractBody(j, errorObj);
const getHasHtml = detectHasHtml(contentType, body, statusMessage);
const getBodySize = estimateBodySize(body, statusMessage);

// se não vier content-type mas houver HTML explícito, inferimos
const finalContentType = contentType || (getHasHtml ? 'text/html' : '');

// --------------------------------------------------
// Classificação de resposta
// --------------------------------------------------
const responseClass = hasHttpResponse
  ? classifyStatus(statusCode)
  : 'TRANSPORT_ERROR';

// --------------------------------------------------
// Erros técnicos GET
// --------------------------------------------------
const transportError = statusMessage;
const networkError = getErrorCode;

// --------------------------------------------------
// Classificação final do erro GET
// --------------------------------------------------
let getState = 'GET_REQUEST_ERROR';

if (hasHttpResponse) {
  if (statusCode === 401 || statusCode === 403) {
    getState = 'GET_BLOCKED';
  } else if (statusCode === 404 || statusCode === 410) {
    getState = 'GET_NOT_FOUND';
  } else if (statusCode === 405 || statusCode === 501) {
    getState = 'GET_METHOD_NOT_ALLOWED';
  } else if (statusCode === 408) {
    getState = 'GET_TIMEOUT';
  } else if (statusCode === 429) {
    getState = 'GET_RATE_LIMITED';
  } else if (statusCode >= 500) {
    getState = 'GET_SERVER_ERROR';
  } else if (statusCode >= 400 && statusCode < 500) {
    getState = 'GET_CLIENT_ERROR';
  } else {
    getState = 'GET_HTTP_ERROR';
  }
} else {
  if (
    getErrorCode === 'ECONNABORTED' ||
    getErrorCode === 'ETIMEDOUT' ||
    /timeout/i.test(statusMessage)
  ) {
    getState = 'GET_TIMEOUT';
  } else if (
    getErrorCode === 'ENOTFOUND' ||
    getErrorCode === 'EAI_AGAIN'
  ) {
    getState = 'GET_DNS_NOT_FOUND';
  } else if (getErrorCode === 'ECONNREFUSED') {
    getState = 'GET_CONNECTION_REFUSED';
  } else if (getErrorCode === 'ECONNRESET') {
    getState = 'GET_CONNECTION_RESET';
  } else if (
    getErrorCode === 'EPROTO' ||
    getErrorCode === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    getErrorCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    getErrorCode === 'CERT_HAS_EXPIRED' ||
    getErrorCode === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    getErrorCode === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    getErrorName === 'NodeSslError' ||
    /ssl issue|ssl|certificate|certificado|tls/i.test(statusMessage)
  ) {
    getState = 'GET_TLS_ERROR';
  } else {
    getState = 'GET_TRANSPORT_ERROR';
  }
}

// --------------------------------------------------
// Sinais de existência
// --------------------------------------------------
const websiteExists = hasHttpResponse ? true : false;
const websiteWorks = false;

// --------------------------------------------------
// Erros resumidos
// --------------------------------------------------
const lastError = asCleanString(
  pickFirstNonEmpty(
    statusMessage,
    getErrorCode,
    getErrorName,
    getState
  )
);

const lastErrorShort = truncateText(lastError, 500);
const statusMessageShort = truncateText(statusMessage, 500);
const errorMessageShort = truncateText(statusMessage, 500);

// --------------------------------------------------
// Outros campos derivados
// --------------------------------------------------
const auditResult = inferAuditResult(hasHttpResponse, getState);

// --------------------------------------------------
// Output final
// --------------------------------------------------
return {
  json: {
    ...j,

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: 'GET',
    request_url: requestUrl,

    status_code: hasHttpResponse ? statusCode : '',
    response_class: responseClass,
    final_url: requestUrl,
    content_type: finalContentType,

    transport_error: transportError,
    network_error: networkError,

    website_raw: websiteRaw,
    website_norm: websiteNormOriginal || requestUrl,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: hasHttpResponse ? requestUrl : '',
    website_status_code: hasHttpResponse ? statusCode : '',
    website_response_class: responseClass,
    website_content_type: hasHttpResponse ? finalContentType : '',
    website_checked_at: now,

    website_checked: true,
    website_ok: false,
    website_state: getState,
    website_exists: websiteExists,
    website_works: websiteWorks,

    validation_source: 'GET',
    final_decision: getState,
    audit_result: auditResult,

    current_phase: 'GET_CHECKED',
    process_status: 'IN_PROGRESS',
    queued_action: '',
    last_error: lastError,
    last_error_short: lastErrorShort,

    get_status: hasHttpResponse ? statusCode : '',
    get_status_message: statusMessage,
    get_status_message_short: statusMessageShort,
    get_has_html: getHasHtml,
    get_body_size: getBodySize,

    get_error_type: getState,
    get_error_code: getErrorCode,
    get_error_message: statusMessage,
    get_error_message_short: errorMessageShort,
    has_http_response: hasHttpResponse,

    website_final_ok: false,
    website_final_state: getState,

    head_validated: false,
    should_run_get: false,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: 'af4aa530-57c3-4fed-8cff-b3eacf7a05a2',
        name: 'GATE_Tem website_norm?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-2336, -848],
        alwaysOutputData: true,
    })
    GateTemWebsiteNorm = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'e66b6145-23f4-4b24-a33e-02935fe4e08e',
                    leftValue: '={{ $json.website_norm }}',
                    rightValue: '=',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: '={{ false }}',
        options: {},
    };

    @node({
        id: '51fa0e48-2c5f-40e0-9659-97cf156e21c7',
        name: 'Get Normaliza > Sucess',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-992, -896],
    })
    GetNormalizaSucess = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlForceHttps(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;
  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) return original;
  if (s.startsWith('//')) s = 'https:' + s;
  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) s = 'https://' + s;

  s = s.replace(/^http:\\/\\//i, 'https://');

  try {
    const u = new URL(s);
    if (!u.hostname || !u.hostname.includes('.')) return original;
    u.hash = '';

    if (u.protocol === 'https:' && u.port === '443') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function extractBody(j) {
  return (
    j.body ??
    j.data ??
    j.responseBody ??
    j.response_body ??
    ''
  );
}

function detectHasHtml(contentType, body) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;
  if (/<head[\\s>]/i.test(bodyStr) || /<body[\\s>]/i.test(bodyStr)) return true;

  return false;
}

function estimateBodySize(body) {
  if (body === undefined || body === null) return 0;
  if (typeof body === 'string') return body.length;

  try {
    return JSON.stringify(body).length;
  } catch {
    return String(body).length;
  }
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const j = $json ?? {};
const headersRaw = j.headers ?? j.response_headers ?? {};
const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

// --------------------------------------------------
// Website original / normalizado
// --------------------------------------------------
const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.internet, j.Internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// URL
// --------------------------------------------------
const requestUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

const redirectLocation = pickFirstNonEmpty(
  j.redirect_location,
  headers.location,
  headers.Location
);

const finalUrl = normalizeUrlForceHttps(
  pickFirstNonEmpty(
    j.final_url,
    j.website_final_url_norm,
    redirectLocation,
    requestUrl
  )
);

// --------------------------------------------------
// HTTP GET success
// --------------------------------------------------
const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.status_code,
    j.statusCode,
    j.status,
    j.get_status
  )
);

const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    j.message,
    j.get_status_message,
    'OK'
  )
);

const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  j.get_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);
const responseClass = classifyStatus(statusCode);

// --------------------------------------------------
// Body / HTML
// --------------------------------------------------
const body = extractBody(j);
const bodySize = estimateBodySize(body);
const hasHtml = detectHasHtml(contentType, body);

const finalContentType = contentType || (hasHtml ? 'text/html' : '');

// --------------------------------------------------
// Validação final
// --------------------------------------------------
const isHttpOk =
  typeof statusCode === 'number' &&
  !Number.isNaN(statusCode) &&
  statusCode >= 200 &&
  statusCode < 400;

const getState = isHttpOk
  ? (hasHtml ? 'GET_OK_HTML' : 'GET_OK_NON_HTML')
  : 'GET_UNEXPECTED_STATE';

// --------------------------------------------------
// Decisão operacional
// --------------------------------------------------
// GET com 2xx/3xx já prova reachability.
// Se vem HTML, está pronto para enrichment.
// Se não vem HTML, existe mas pode não ser uma homepage HTML tradicional.
let websiteState = getState;
let finalDecision = isHttpOk ? 'VALIDATED_BY_GET' : 'GET_NOT_VALIDATED';
let auditResult = isHttpOk ? 'HTTP_OK' : 'HTTP_ERROR';
let queuedAction = hasHtml && isHttpOk ? 'ENRICH_FROM_WEBSITE' : '';
let processStatus = hasHtml && isHttpOk ? 'PENDING' : 'IN_PROGRESS';

// --------------------------------------------------
// Campos auxiliares
// --------------------------------------------------
const lastError = '';
const lastErrorShort = '';
const statusMessageShort = truncateText(statusMessage, 500);

// --------------------------------------------------
// Output final
// --------------------------------------------------
return {
  json: {
    ...j,

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: 'GET',
    request_url: requestUrl,

    status_code: statusCode ?? '',
    response_class: responseClass,
    final_url: finalUrl || requestUrl,
    content_type: finalContentType,

    transport_error: '',
    network_error: '',

    website_raw: websiteRaw,
    website_norm: finalUrl || requestUrl || websiteNormOriginal,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: finalUrl || requestUrl,
    website_status_code: statusCode ?? '',
    website_response_class: responseClass,
    website_content_type: finalContentType || '',
    website_checked_at: now,

    website_checked: true,
    website_ok: isHttpOk,
    website_state: websiteState,
    website_exists: isHttpOk,
    website_works: isHttpOk,

    validation_source: 'GET',
    final_decision: finalDecision,
    audit_result: auditResult,

    current_phase: isHttpOk ? 'URL_VALIDATED' : 'GET_CHECKED',
    process_status: processStatus,
    queued_action: queuedAction,
    last_error: lastError,
    last_error_short: lastErrorShort,

    get_status: statusCode ?? '',
    get_status_message: statusMessage,
    get_status_message_short: statusMessageShort,
    get_has_html: hasHtml,
    get_body_size: bodySize,

    get_error_type: '',
    get_error_code: '',
    get_error_message: '',
    get_error_message_short: '',
    has_http_response: isHttpOk,

    website_final_ok: isHttpOk,
    website_final_state: getState,

    head_validated: false,
    should_run_get: false,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: 'bc988fd8-1188-4df5-9aa2-87d4a0830914',
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-768, -736],
        alwaysOutputData: false,
    })
    Merge2 = {
        mode: 'combine',
        combineBy: 'combineByPosition',
        options: {},
    };

    @node({
        id: '590a18e6-2ec5-4703-b308-877ae4b03b5a',
        name: 'AUDIT · Append URL_CHECKS (HTTP_ERR)1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1664, -416],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: false,
    })
    AuditAppendUrlChecksHttpErr1 = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Response_class: '={{ $json.response_class }}',
                Transport_error: '={{ $json.content_type }}',
                Run_ID: "={{$json.run_id || ''}}",
                Entity_key: "={{$json.entity_key || ''}}",
                Attempt_no: '=1',
                Status_code: '={{ $json.status_code }}',
                Content_type: '={{ $json.response_class }}',
                Request_url: '={{ $json.request_url }}',
                Network_error: '= {{ $json.transport_error }}',
                Final_url: "={{ $json.website_norm || '' }}",
                Exec_key: "={{$json.exec_key || ''}}",
                Request_method: 'HEAD',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: 'da866b5d-ad43-4d43-bb03-16ffe8dad9ec',
        name: 'Decide HTTP Fallback',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1664, -992],
        alwaysOutputData: true,
    })
    DecideHttpFallback = {
        mode: 'runOnceForEachItem',
        jsCode: `const j = $json ?? {};

function str(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function toHttp(url) {
  const s = str(url);
  if (!s) return '';
  return s.replace(/^https:\\/\\//i, 'http://');
}

const requestUrl = str(
  j.request_url ||
  j.website_attempted_url_norm ||
  j.website_norm ||
  j.website_raw
);

const websiteState = str(j.website_state || j.website_final_state);
const requestMethod = str(j.request_method || 'GET').toUpperCase();

// FONTE DE VERDADE ORIGINAL
const originalInternet = str(j.Internet || j.internet);

const fallbackAlreadyAttempted =
  j.http_fallback_attempted === true ||
  str(j.http_fallback_attempted).toLowerCase() === 'true';

const isHttps = /^https:\\/\\//i.test(requestUrl);
const originalExplicitHttps = /^https:\\/\\//i.test(originalInternet);
const originalExplicitHttp = /^http:\\/\\//i.test(originalInternet);
const originalWithoutScheme =
  !!originalInternet && !/^[a-z][a-z0-9+.-]*:\\/\\//i.test(originalInternet);

const eligibleStates = new Set([
  'HEAD_TLS_ERROR',
  'GET_TLS_ERROR',
  'HEAD_CONNECTION_RESET',
  'GET_CONNECTION_RESET',
  'HEAD_CONNECTION_REFUSED',
  'GET_CONNECTION_REFUSED',
  'HEAD_TIMEOUT',
  'GET_TIMEOUT',
  'HEAD_TRANSPORT_ERROR',
  'GET_TRANSPORT_ERROR'
]);

const allowHttpFallback =
  originalWithoutScheme || originalExplicitHttp;

const shouldRetryHttp =
  isHttps &&
  !fallbackAlreadyAttempted &&
  allowHttpFallback &&
  eligibleStates.has(websiteState);

return {
  json: {
    ...j,

    original_internet: originalInternet,
    original_scheme: originalExplicitHttps ? 'https' : originalExplicitHttp ? 'http' : '',
    original_without_scheme: originalWithoutScheme,

    http_fallback_attempted: shouldRetryHttp ? true : fallbackAlreadyAttempted,
    http_fallback_reason: shouldRetryHttp ? websiteState : '',
    http_fallback_source_state: shouldRetryHttp ? websiteState : '',

    retry_method: requestMethod,
    retry_url: shouldRetryHttp ? toHttp(requestUrl) : '',
    should_retry_http: shouldRetryHttp
  }
};`,
    };

    @node({
        id: 'ed041ac2-c9dd-49ae-808f-1ed5ec524976',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-1440, -992],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '12e36a28-4375-454e-8ff4-6aa84aadf19f',
                    leftValue: '={{ $json.should_retry_http === true }}',
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
        id: '224149c0-2264-46a1-b0da-6b6031f5104d',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [-1216, -1184],
        onError: 'continueErrorOutput',
        alwaysOutputData: false,
    })
    HttpRequest = {
        method: '={{ $json.retry_method }}',
        url: '={{ $json.retry_url }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: '=User-Agent',
                    value: 'Mozilla/5.0 (compatible; n8n-url-check/1.0)',
                },
                {
                    name: 'Accept: text/html',
                    value: 'Accept-Language: en-US,en;q=0.9',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: false,
            redirect: {
                redirect: {},
            },
        },
    };

    @node({
        id: 'c9a889fa-1175-46d0-b7b8-c8b18c44ba0b',
        name: 'HTTPS - GET request_url ',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-1216, -800],
        onError: 'continueErrorOutput',
        alwaysOutputData: true,
    })
    HttpsGetRequestUrl = {
        url: '={{ $json.website_norm }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: "={{   [     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',     'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',     'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0'   ][Math.floor(Math.random() * 3)] }}",
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
                    name: 'Range',
                    value: 'bytes=0-2048',
                },
                {
                    name: 'Connection',
                    value: 'close',
                },
            ],
        },
        options: {
            allowUnauthorizedCerts: false,
            lowercaseHeaders: true,
            redirect: {
                redirect: {
                    maxRedirects: 5,
                },
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 15000,
        },
    };

    @node({
        id: 'e0b474b5-1b61-4a53-b91f-338c853a6cbd',
        name: 'HTTPS · HEAD request_url',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-2112, -944],
        onError: 'continueErrorOutput',
        alwaysOutputData: true,
    })
    HttpsHeadRequestUrl = {
        method: 'HEAD',
        url: '={{ $json.website_norm }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'User-Agent',
                    value: '=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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
            lowercaseHeaders: true,
            redirect: {
                redirect: {
                    maxRedirects: 10,
                },
            },
            response: {
                response: {
                    fullResponse: true,
                },
            },
            timeout: 10000,
        },
    };

    @node({
        id: 'b83bef25-4366-4fe9-9d55-41e4123a7919',
        name: 'Finalize 5',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1440, -224],
    })
    Finalize5 = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// Nunca deixar o item sair como "em progresso"
let finalStatus = ($json.Status ?? $json.status ?? '').toString().trim();
if (!finalStatus || finalStatus === 'IN_PROGRESS') {
  finalStatus = 'DONE';
}

return {
  ...$json,

  Status: finalStatus,
  Current_phase: 'COMPLETED',

  // 🔴 ISTO É O QUE MATA O LOOP
  Next_action: '',

  Finished_at: now,
  Updated_at: now,
};
`,
    };

    @node({
        id: '29294f41-2012-40a7-860c-7e33ca897591',
        name: 'Finalize 4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1440, -416],
        onError: 'continueRegularOutput',
        alwaysOutputData: false,
    })
    Finalize4 = {
        mode: 'runOnceForEachItem',
        jsCode: `const j = $json ?? {};

function str(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

const now = new Date().toISOString();

return {
  json: {
    ...j,

    // marcação do ramo
    finalize_node: 'Finalize 4',
    finalize_branch: 'HEAD_ERROR_AUDITED',
    head_error_audited: true,

    // estado deste ramo específico
    branch_status: 'DONE',
    branch_result: 'HEAD_ERROR_REGISTERED',

    // metadados úteis
    finalized_at: now,

    // preserva coerência sem reescrever a lógica principal
    current_phase: str(j.current_phase) || 'HEAD_CHECKED',
    process_status: str(j.process_status) || 'IN_PROGRESS',
    final_decision: str(j.final_decision),
    website_final_state: str(j.website_final_state || j.website_state),
    last_error: str(j.last_error || j.transport_error || j.get_error_message || j.head_error_message)
  }
};`,
    };

    @node({
        id: '8cfbd417-3144-4e67-a039-5e41331222a9',
        name: 'Finalize ',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-320, -1088],
    })
    Finalize = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

const j = $json ?? {};

return {
  json: {
    ...j,

    // Estado final do website
    website_checked: true,
    website_final_ok: false,

    // Estado final do fluxo
    current_phase: 'URL_CHECKED',
    process_status: 'COMPLETED',

    // Nenhuma ação futura
    queued_action: '',

    // auditoria
    finalized_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: '5a0260a4-28b7-42d1-bedb-f50c2a7c38fa',
        name: 'STATE · Update CONTROL_EXEC (pós HTTP_OK)2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-544, -1280],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlExecPosHttpOk2 = {
        operation: 'appendOrUpdate',
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
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: "={{ $('Merge3').item.json.input_row }}",
                Current_phase: 'URL_VALIDATED',
                Next_action: "={{ '' }}",
                Attempts: '={{$json.attempts || 1}}',
                Last_error: '=',
                Updated_at: '={{ $now.toISO() }}',
                Queued_action: 'ENRICH_FROM_WEBSITE',
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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
        id: '23932dca-b4a3-4a07-b8ff-35d8eed0b239',
        name: 'AUDIT · Append URL_CHECKS (HTTP_OK) 1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-768, -1280],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksHttpOk11 = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Run_ID: '={{$json.run_id}}',
                Entity_key: '={{$json.entity_key}}',
                Status_code: "={{$json.get_status || ''}}",
                Response_class: '=SUCCESS',
                Final_url: "={{$json.website_norm || ''}}",
                Content_type: "= {{$json.get_has_html ? 'text/html' : ''}}",
                Transport_error: "={{ ($json.transport_error || '').replace(/\\s+/g,' ').slice(0,100) }}",
                Attempt_no: '=1',
                Request_url: "={{$json.website_norm || ''}}",
                Network_error: '={{ $json.network_error }}',
                Request_method: 'GET',
                Exec_key: '={{$json.exec_key}}',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: '1dbe8d89-7bd8-4e82-a71b-b2af4d1dfefd',
        name: 'Finalize 6',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-320, -1280],
    })
    Finalize6 = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

return {
  ...$json,
  Next_action: '',
  Finished_at: now,
  Updated_at: now,
};
`,
    };

    @node({
        id: '81ef43cf-9dc5-46b6-bce5-5c984a8db5a6',
        name: 'HTTP Normaliza > Erro',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-992, -1088],
    })
    HttpNormalizaErro = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlKeepScheme(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;
  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) {
    return original;
  }

  if (s.startsWith('//')) {
    s = 'http:' + s;
  }

  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) {
    s = 'http://' + s;
  }

  try {
    const u = new URL(s);
    if (!u.hostname || !u.hostname.includes('.')) return original;
    u.hash = '';

    if (u.protocol === 'http:' && u.port === '80') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function parseStatusFromMessage(msg) {
  const s = asCleanString(msg);
  if (!s) return null;

  let m = s.match(/^(\\d{3})\\s*-\\s*/);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/status code\\s+(\\d{3})/i);
  if (m) return toNumberOrNull(m[1]);

  m = s.match(/\\bstatus[:\\s]+(\\d{3})\\b/i);
  if (m) return toNumberOrNull(m[1]);

  return null;
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function detectHasHtml(contentType, body, message) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;

  const msgStr = asCleanString(message);
  if (/<html[\\s>]/i.test(msgStr) || /<!doctype html/i.test(msgStr)) return true;

  return false;
}

function estimateBodySize(body, fallbackMessage) {
  const bodyStr =
    typeof body === 'string'
      ? body
      : body != null
        ? JSON.stringify(body)
        : '';

  const msgStr =
    typeof fallbackMessage === 'string'
      ? fallbackMessage
      : '';

  const candidate = bodyStr || msgStr || '';
  return candidate.length;
}

function extractBody(j, errorObj) {
  return (
    errorObj.response?.data ??
    j.body ??
    j.response_body ??
    j.data ??
    ''
  );
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const j = $json ?? {};
const errorObj = (j.error && typeof j.error === 'object') ? j.error : {};

const headersRaw =
  j.headers ??
  errorObj.response?.headers ??
  j.response_headers ??
  {};

const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.Internet, j.internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// URL HTTP fallback tentada
// --------------------------------------------------
const requestUrl = normalizeUrlKeepScheme(
  pickFirstNonEmpty(
    j.retry_url,
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

// --------------------------------------------------
// Mensagens / códigos de erro
// --------------------------------------------------
const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    errorObj.response?.statusText,
    errorObj.message,
    j.message,
    j.http_status_message
  )
);

const httpErrorCode = asCleanString(
  pickFirstNonEmpty(
    errorObj.code,
    j.code,
    j.http_error_code
  )
);

const httpErrorName = asCleanString(
  pickFirstNonEmpty(
    errorObj.name,
    j.error_name
  )
);

// --------------------------------------------------
// Status HTTP com fallback inteligente
// --------------------------------------------------
const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.statusCode,
    j.status,
    errorObj.status,
    errorObj.response?.status,
    j.http_status,
    parseStatusFromMessage(statusMessage)
  )
);

const hasHttpResponse =
  typeof statusCode === 'number' && !Number.isNaN(statusCode);

// --------------------------------------------------
// Content-Type e body
// --------------------------------------------------
const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);
const body = extractBody(j, errorObj);
const httpHasHtml = detectHasHtml(contentType, body, statusMessage);
const httpBodySize = estimateBodySize(body, statusMessage);

const finalContentType = contentType || (httpHasHtml ? 'text/html' : '');

// --------------------------------------------------
// Classificação de resposta
// --------------------------------------------------
const responseClass = hasHttpResponse
  ? classifyStatus(statusCode)
  : 'TRANSPORT_ERROR';

// --------------------------------------------------
// Erros técnicos HTTP
// --------------------------------------------------
const transportError = statusMessage;
const networkError = httpErrorCode;

// --------------------------------------------------
// Classificação final do erro HTTP fallback
// --------------------------------------------------
let httpState = 'HTTP_REQUEST_ERROR';

if (hasHttpResponse) {
  if (statusCode === 401 || statusCode === 403) {
    httpState = 'HTTP_BLOCKED';
  } else if (statusCode === 404 || statusCode === 410) {
    httpState = 'HTTP_NOT_FOUND';
  } else if (statusCode === 405 || statusCode === 501) {
    httpState = 'HTTP_METHOD_NOT_ALLOWED';
  } else if (statusCode === 408) {
    httpState = 'HTTP_TIMEOUT';
  } else if (statusCode === 429) {
    httpState = 'HTTP_RATE_LIMITED';
  } else if (statusCode >= 500) {
    httpState = 'HTTP_SERVER_ERROR';
  } else if (statusCode >= 400 && statusCode < 500) {
    httpState = 'HTTP_CLIENT_ERROR';
  } else {
    httpState = 'HTTP_HTTP_ERROR';
  }
} else {
  if (
    httpErrorCode === 'ECONNABORTED' ||
    httpErrorCode === 'ETIMEDOUT' ||
    /timeout/i.test(statusMessage)
  ) {
    httpState = 'HTTP_TIMEOUT';
  } else if (
    httpErrorCode === 'ENOTFOUND' ||
    httpErrorCode === 'EAI_AGAIN'
  ) {
    httpState = 'HTTP_DNS_NOT_FOUND';
  } else if (httpErrorCode === 'ECONNREFUSED') {
    httpState = 'HTTP_CONNECTION_REFUSED';
  } else if (httpErrorCode === 'ECONNRESET') {
    httpState = 'HTTP_CONNECTION_RESET';
  } else {
    httpState = 'HTTP_TRANSPORT_ERROR';
  }
}

// --------------------------------------------------
// Erros resumidos
// --------------------------------------------------
const lastError = asCleanString(
  pickFirstNonEmpty(
    statusMessage,
    httpErrorCode,
    httpErrorName,
    httpState
  )
);

const lastErrorShort = truncateText(lastError, 500);
const statusMessageShort = truncateText(statusMessage, 500);
const errorMessageShort = truncateText(statusMessage, 500);

// --------------------------------------------------
// Output final terminal
// --------------------------------------------------
return {
  json: {
    ...j,

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: asCleanString(j.retry_method || j.request_method || 'GET').toUpperCase(),
    request_url: requestUrl,

    status_code: hasHttpResponse ? statusCode : '',
    response_class: responseClass,
    final_url: requestUrl,
    content_type: finalContentType,

    transport_error: transportError,
    network_error: networkError,

    website_raw: websiteRaw,
    website_norm: websiteNormOriginal || requestUrl,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: '',
    website_status_code: hasHttpResponse ? statusCode : '',
    website_response_class: responseClass,
    website_content_type: hasHttpResponse ? finalContentType : '',
    website_checked_at: now,

    website_checked: true,
    website_ok: false,
    website_state: httpState,
    website_exists: hasHttpResponse,
    website_works: false,

    validation_source: 'HTTP_FALLBACK',
    final_decision: httpState,
    audit_result: hasHttpResponse ? 'HTTP_ERROR' : 'TRANSPORT_ERROR',

    current_phase: 'HTTP_CHECKED',
    process_status: 'IN_PROGRESS',
    queued_action: '',
    last_error: lastError,
    last_error_short: lastErrorShort,

    http_status: hasHttpResponse ? statusCode : '',
    http_status_message: statusMessage,
    http_status_message_short: statusMessageShort,
    http_has_html: httpHasHtml,
    http_body_size: httpBodySize,

    http_error_type: httpState,
    http_error_code: httpErrorCode,
    http_error_message: statusMessage,
    http_error_message_short: errorMessageShort,
    has_http_response: hasHttpResponse,

    website_final_ok: false,
    website_final_state: httpState,

    http_fallback_failed: true,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: 'eaad85c2-0c58-411b-8143-9f17d5097528',
        name: 'HTTP Normaliza > Sucess',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-992, -1280],
    })
    HttpNormalizaSucess = {
        mode: 'runOnceForEachItem',
        jsCode: `const now = new Date().toISOString();

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmpty(v)) return v;
  }
  return '';
}

function asCleanString(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function truncateText(value, maxLen = 500) {
  const s = asCleanString(value);
  if (!s) return '';
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

function normalizeHeaderNameMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    out[String(k).toLowerCase()] = v;
  }
  return out;
}

function normalizeUrlKeepScheme(input) {
  const original = asCleanString(input);
  if (!original) return '';

  let s = original;
  s = s.replace(/\\s+/g, '');
  s = s.replace(/[)\\],.;]+$/g, '');

  if (/^(mailto:|tel:|ftp:|file:|data:)/i.test(s)) return original;
  if (s.startsWith('//')) s = 'http:' + s;
  if (!/^[a-z][a-z0-9+.-]*:\\/\\//i.test(s)) s = 'http://' + s;

  try {
    const u = new URL(s);
    if (!u.hostname || !u.hostname.includes('.')) return original;
    u.hash = '';

    if (u.protocol === 'http:' && u.port === '80') {
      u.port = '';
    }

    if (u.protocol === 'https:' && u.port === '443') {
      u.port = '';
    }

    return u.toString();
  } catch {
    return original;
  }
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function classifyStatus(statusCode) {
  if (typeof statusCode !== 'number' || Number.isNaN(statusCode)) return 'UNKNOWN';
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'OTHER';
}

function normalizeContentType(value) {
  const s = asCleanString(value);
  if (!s) return '';
  return s.split(';')[0].trim().toLowerCase();
}

function extractBody(j) {
  return (
    j.body ??
    j.data ??
    j.responseBody ??
    j.response_body ??
    ''
  );
}

function detectHasHtml(contentType, body) {
  const ct = normalizeContentType(contentType);
  if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) return true;

  const bodyStr = asCleanString(body);
  if (/<html[\\s>]/i.test(bodyStr) || /<!doctype html/i.test(bodyStr)) return true;
  if (/<head[\\s>]/i.test(bodyStr) || /<body[\\s>]/i.test(bodyStr)) return true;

  return false;
}

function estimateBodySize(body) {
  if (body === undefined || body === null) return 0;
  if (typeof body === 'string') return body.length;

  try {
    return JSON.stringify(body).length;
  } catch {
    return String(body).length;
  }
}

// --------------------------------------------------
// Input base
// --------------------------------------------------
const j = $json ?? {};
const headersRaw = j.headers ?? j.response_headers ?? {};
const headers = normalizeHeaderNameMap(headersRaw);

// --------------------------------------------------
// Identidade / contexto
// --------------------------------------------------
const exec_key = asCleanString(j.exec_key);
const run_id = asCleanString(j.run_id);
const entity_key = asCleanString(j.entity_key);
const input_row = pickFirstNonEmpty(j.input_row, j.row_number, j.row_index, '');

// --------------------------------------------------
// Website original / normalizado
// --------------------------------------------------
const websiteRaw = asCleanString(
  pickFirstNonEmpty(j.website_raw, j.Internet, j.internet)
);

const websiteNormOriginal = asCleanString(
  pickFirstNonEmpty(j.website_norm, j.website_url_norm)
);

// --------------------------------------------------
// Método / URL
// --------------------------------------------------
const requestMethod = asCleanString(
  pickFirstNonEmpty(j.retry_method, j.request_method, 'GET')
).toUpperCase();

const requestUrl = normalizeUrlKeepScheme(
  pickFirstNonEmpty(
    j.retry_url,
    j.request_url,
    j.website_attempted_url_norm,
    websiteNormOriginal,
    websiteRaw
  )
);

const redirectLocation = pickFirstNonEmpty(
  j.redirect_location,
  headers.location,
  headers.Location
);

const finalUrl = normalizeUrlKeepScheme(
  pickFirstNonEmpty(
    j.final_url,
    j.website_final_url_norm,
    redirectLocation,
    requestUrl
  )
);

// --------------------------------------------------
// Status / message / content type
// --------------------------------------------------
const statusCode = toNumberOrNull(
  pickFirstNonEmpty(
    j.status_code,
    j.statusCode,
    j.status,
    j.http_status
  )
);

const statusMessage = asCleanString(
  pickFirstNonEmpty(
    j.statusMessage,
    j.message,
    j.http_status_message,
    'OK'
  )
);

const rawContentType = pickFirstNonEmpty(
  j.content_type,
  j.http_content_type,
  headers['content-type'],
  headers['Content-Type']
);

const contentType = normalizeContentType(rawContentType);
const responseClass = classifyStatus(statusCode);

// --------------------------------------------------
// Body / HTML
// --------------------------------------------------
// Se o método foi HEAD, não contamos com body útil.
const body = requestMethod === 'HEAD' ? '' : extractBody(j);
const bodySize = requestMethod === 'HEAD' ? 0 : estimateBodySize(body);
const hasHtml =
  requestMethod === 'HEAD'
    ? (
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml+xml')
      )
    : detectHasHtml(contentType, body);

const finalContentType = contentType || (hasHtml ? 'text/html' : '');

// --------------------------------------------------
// Validação final
// --------------------------------------------------
const isHttpOk =
  typeof statusCode === 'number' &&
  !Number.isNaN(statusCode) &&
  statusCode >= 200 &&
  statusCode < 400;

let httpState = 'HTTP_UNEXPECTED_STATE';

if (isHttpOk) {
  if (requestMethod === 'HEAD') {
    httpState = hasHtml ? 'HTTP_HEAD_OK_HTML' : 'HTTP_HEAD_OK_NON_HTML';
  } else {
    httpState = hasHtml ? 'HTTP_GET_OK_HTML' : 'HTTP_GET_OK_NON_HTML';
  }
}

// --------------------------------------------------
// Decisão operacional
// --------------------------------------------------
let websiteState = httpState;
let finalDecision = isHttpOk ? 'VALIDATED_BY_HTTP_FALLBACK' : 'HTTP_FALLBACK_NOT_VALIDATED';
let auditResult = isHttpOk ? 'HTTP_OK' : 'HTTP_ERROR';

// Se o sucesso veio por HEAD, o site está validado mas pode ainda não estar enriquecido.
// Se veio por GET com HTML, pode seguir para enrichment.
let queuedAction = '';
let processStatus = 'PENDING';

if (isHttpOk) {
  if (requestMethod === 'GET' && hasHtml) {
    queuedAction = 'ENRICH_FROM_WEBSITE';
    processStatus = 'PENDING';
  } else {
    queuedAction = '';
    processStatus = 'PENDING';
  }
} else {
  queuedAction = '';
  processStatus = 'IN_PROGRESS';
}

// --------------------------------------------------
// Campos auxiliares
// --------------------------------------------------
const lastError = '';
const lastErrorShort = '';
const statusMessageShort = truncateText(statusMessage, 500);

// --------------------------------------------------
// Output final
// --------------------------------------------------
return {
  json: {
    ...j,

    exec_key,
    run_id,
    entity_key,
    input_row,

    attempt_no: Number(pickFirstNonEmpty(j.attempt_no, j.attempts, j.Attempts, 1)) || 1,

    request_method: requestMethod,
    request_url: requestUrl,

    status_code: statusCode ?? '',
    response_class: responseClass,
    final_url: finalUrl || requestUrl,
    content_type: finalContentType,

    transport_error: '',
    network_error: '',

    website_raw: websiteRaw,
    website_norm: finalUrl || requestUrl || websiteNormOriginal,
    website_attempted_url_norm: requestUrl,
    website_final_url_norm: finalUrl || requestUrl,
    website_status_code: statusCode ?? '',
    website_response_class: responseClass,
    website_content_type: finalContentType || '',
    website_checked_at: now,

    website_checked: true,
    website_ok: isHttpOk,
    website_state: websiteState,
    website_exists: isHttpOk,
    website_works: isHttpOk,

    validation_source: 'HTTP_FALLBACK',
    final_decision: finalDecision,
    audit_result: auditResult,

    current_phase: isHttpOk ? 'URL_VALIDATED' : 'HTTP_CHECKED',
    process_status: processStatus,
    queued_action: queuedAction,
    last_error: lastError,
    last_error_short: lastErrorShort,

    http_status: statusCode ?? '',
    http_status_message: statusMessage,
    http_status_message_short: statusMessageShort,
    http_has_html: hasHtml,
    http_body_size: bodySize,

    http_error_type: '',
    http_error_code: '',
    http_error_message: '',
    http_error_message_short: '',
    has_http_response: isHttpOk,

    website_final_ok: isHttpOk,
    website_final_state: httpState,

    http_fallback_succeeded: isHttpOk,

    checked_at: now,
    updated_at: now
  }
};`,
    };

    @node({
        id: '030c5bb5-feae-42b9-840f-eb76fb43b012',
        name: 'AUDIT · Append URL_CHECKS (HTTP)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-768, -1088],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    AuditAppendUrlChecksHttp = {
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
            value: 806341849,
            mode: 'list',
            cachedResultName: 'URL_CHECKS',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1itG_bRvm-oND6i0S2SyjB_9YMRSwCI3Uayvm6DVSwEE/edit#gid=806341849',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Response_class: '={{ $json.response_class }}',
                Transport_error: "={{ ($json.transport_error || '').replace(/\\s+/g,' ').slice(0,100) }}",
                Run_ID: "={{$json.run_id || ''}}",
                Entity_key: "={{$json.entity_key || ''}}",
                Attempt_no: '=1',
                Status_code: '={{ $json.status_code }}',
                Content_type: "={{ $json.content_type || '' }}",
                Request_url: '={{ $json.request_url }}',
                Network_error: "={{ $json.network_error || '' }}",
                Final_url: '={{ $json.final_url || $json.request_url }}',
                Exec_key: "={{$json.exec_key || ''}}",
                Request_method: 'HEAD - HTTP',
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
                    id: 'Attempt_no',
                    displayName: 'Attempt_no',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_method',
                    displayName: 'Request_method',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Request_url',
                    displayName: 'Request_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Status_code',
                    displayName: 'Status_code',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Response_class',
                    displayName: 'Response_class',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Final_url',
                    displayName: 'Final_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Content_type',
                    displayName: 'Content_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Transport_error',
                    displayName: 'Transport_error',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Network_error',
                    displayName: 'Network_error',
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
        id: 'd0b14b62-ff0a-45f6-9364-cc60c9ee33a3',
        name: 'STATE · Update CONTROL_EXEC (pós HTTP)',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-544, -1088],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    StateUpdateControlExecPosHttp = {
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
                Current_phase: 'URL_FAILED',
                Next_action: "={{ '' }}",
                Attempts: '={{ $json.attempts ?? 1 }}',
                Last_error: '=',
                Lock_until: "={{ '' }}",
                Updated_at: '={{ $now.toISO() }}',
                Queued_action: 'DISCOVER_URL',
                Run_ID: '={{ $json.Run_ID }}',
                Entity_key: '={{ $json.Entity_key }}',
                Input_Row: "={{ $('HTTP Normaliza > Erro').item.json.input_row }}",
                Exec_key: '={{ $json.Exec_key }}',
                Process_Status: 'PENDING',
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
                    removed: false,
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
                    removed: false,
                },
                {
                    id: 'Attempts',
                    displayName: 'Attempts',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Lock_until',
                    displayName: 'Lock_until',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Last_error',
                    displayName: 'Last_error',
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

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.CodeSemUrl.out(0).to(this.AuditAppendUrlChecksNoUrl.in(0));
        this.InputLerClienteBdInput.out(0).to(this.IngestNormalizarIdsRunEntityExecUrl.in(0));
        this.IngestNormalizarIdsRunEntityExecUrl.out(0).to(this.StateUpsertControlExecIngested.in(0));
        this.IngestNormalizarIdsRunEntityExecUrl.out(0).to(this.Merge.in(1));
        this.IngestNormalizarIdsRunEntityExecUrl.out(0).to(this.StateUpsertSnapshot.in(0));
        this.StateUpsertControlExecIngested.out(0).to(this.Merge.in(0));
        this.AuditAppendUrlChecksHttpOk.out(0).to(this.StateUpdateControlExecPosHttpOk.in(0));
        this.AuditAppendUrlChecksHttpErr.out(0).to(this.StateUpdateControlExecPosHttpErr.in(0));
        this.AuditAppendUrlChecksNoUrl.out(0).to(this.StateUpdateControlExecNoUrl.in(0));
        this.AuditAppendUrlChecksHttpOk1.out(0).to(this.StateUpdateControlExecPosHttpOk1.in(0));
        this.StateUpdateControlExecNoUrl.out(0).to(this.Finalize5.in(0));
        this.StateUpdateControlExecPosHttpErr.out(0).to(this.Finalize3.in(0));
        this.StateUpdateControlExecPosHttpOk.out(0).to(this.Finalize1.in(0));
        this.StateUpdateControlExecPosHttpOk1.out(0).to(this.Finalize2.in(0));
        this.StateUpsertSnapshot.out(0).to(this.Merge.in(2));
        this.Merge.out(0).to(this.GateTemWebsiteNorm.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.InputLerClienteBdInput.in(0));
        this.HeadNormalizaSucess.out(0).to(this.AuditAppendUrlChecksHttpOk.in(0));
        this.HeadNormalizaErro.out(0).to(this.Merge2.in(1));
        this.HeadNormalizaErro.out(0).to(this.AuditAppendUrlChecksHttpErr1.in(0));
        this.HeadNormalizaErro.out(0).to(this.DecideHttpFallback.in(0));
        this.GetNormalizaErro.out(0).to(this.AuditAppendUrlChecksHttpErr.in(0));
        this.GateTemWebsiteNorm.out(0).to(this.HttpsHeadRequestUrl.in(0));
        this.GateTemWebsiteNorm.out(1).to(this.CodeSemUrl.in(0));
        this.GetNormalizaSucess.out(0).to(this.Merge2.in(0));
        this.Merge2.out(0).to(this.AuditAppendUrlChecksHttpOk1.in(0));
        this.DecideHttpFallback.out(0).to(this.If_.in(0));
        this.If_.out(0).to(this.HttpRequest.in(0));
        this.If_.out(1).to(this.HttpsGetRequestUrl.in(0));
        this.HttpsGetRequestUrl.out(0).to(this.GetNormalizaSucess.in(0));
        this.HttpsGetRequestUrl.out(1).to(this.GetNormalizaErro.in(0));
        this.HttpsHeadRequestUrl.out(0).to(this.HeadNormalizaSucess.in(0));
        this.HttpsHeadRequestUrl.out(1).to(this.HeadNormalizaErro.in(0));
        this.AuditAppendUrlChecksHttpErr1.out(0).to(this.Finalize4.in(0));
        this.HttpRequest.out(0).to(this.HttpNormalizaSucess.in(0));
        this.HttpRequest.out(1).to(this.HttpNormalizaErro.in(0));
        this.StateUpdateControlExecPosHttpOk2.out(0).to(this.Finalize6.in(0));
        this.AuditAppendUrlChecksHttpOk11.out(0).to(this.StateUpdateControlExecPosHttpOk2.in(0));
        this.HttpNormalizaErro.out(0).to(this.AuditAppendUrlChecksHttp.in(0));
        this.HttpNormalizaSucess.out(0).to(this.AuditAppendUrlChecksHttpOk11.in(0));
        this.AuditAppendUrlChecksHttp.out(0).to(this.StateUpdateControlExecPosHttp.in(0));
        this.StateUpdateControlExecPosHttp.out(0).to(this.Finalize.in(0));
    }
}
