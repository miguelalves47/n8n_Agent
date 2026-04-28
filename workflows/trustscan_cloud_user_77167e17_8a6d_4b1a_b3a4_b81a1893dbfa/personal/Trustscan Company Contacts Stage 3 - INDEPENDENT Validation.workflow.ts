import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trustscan Company Contacts  Stage 3 - INDEPENDENT Validation
// Nodes   : 70  |  Connections: 59
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// TriggerRun                         manualTrigger              [executeOnce]
// LoopOverItems                      splitInBatches
// Merge                              merge                      [alwaysOutput]
// ClienteBdOutputUrlChecks           googleSheets               [creds]
// ClienteBdOutputControlExec         googleSheets               [creds]
// StateUpdateControlEvidence         googleSheets               [creds] [alwaysOutput]
// Merge1                             merge
// Markdown                           markdown
// CodeInJavascript1                  code
// MessageAModel                      openAi                     [creds]
// OpenaiPesquisaSiteDaEmpresa        openAi                     [onError→regular] [creds] [alwaysOutput]
// GetResultsArray                    code                       [alwaysOutput]
// CodeInJavascript                   code                       [alwaysOutput]
// If_                                if                         [alwaysOutput]
// StateUpdateControlEvidence1        googleSheets               [creds] [alwaysOutput]
// GetResultsArray1                   code                       [alwaysOutput]
// Wait                               wait
// StickyNote3                        stickyNote
// ClienteBdOutputInputSnapshot       googleSheets               [creds] [alwaysOutput]
// IfAnyResults1                      if
// FiltraResultadosParaTestes         code
// NoResults1                         if
// NoWebsiteSerpapiQuery              code
// SerpapiNoWebsite                   httpRequest                [creds]
// CodeInJavascript3                  code
// StickyNote4                        stickyNote
// CodeInJavascript4                  code
// Empty                              if
// PesquisaSiteDaEmpresa              openAi                     [onError→regular] [creds] [alwaysOutput]
// EncontrouSite                      if
// HttpsSiteUrl1                      httpRequest                [onError→regular] [alwaysOutput]
// SetWebsiteInTheOriginalItem        code
// StickyNote5                        stickyNote
// GetItem                            code
// Markdown2                          markdown
// Merge3                             merge
// IfResultados                       if
// UpdateControlExecution7            googleSheets               [creds] [alwaysOutput]
// NoOperationDoNothing               noOp
// HttpRequest                        httpRequest
// CallWebsite1                       httpRequest                [onError→regular] [alwaysOutput] [retry]
// Switch_                            switch
// SerpapiCompanyNameGoogleMaps       httpRequest                [creds]
// StickyNote                         stickyNote
// TransformToContactsArray1          code
// TodosMenosWebsite1                 filter                     [alwaysOutput]
// IfResultados1                      if
// StateUpdateControlEvidence3        googleSheets               [creds] [alwaysOutput] [retry]
// CreateControlExecutionGmaps        googleSheets               [creds] [alwaysOutput]
// UpdateControlExecutionOpenai       googleSheets               [creds] [alwaysOutput]
// UpdateControlExecutionOpenai1      googleSheets               [creds] [alwaysOutput]
// Merge2                             merge
// UpdateControlExecutionGmaps        googleSheets               [creds] [alwaysOutput]
// Merge4                             merge
// CreateControlExecutionOpenai       googleSheets               [creds] [alwaysOutput]
// PesquisaSiteDaEmpresa1             openAi                     [onError→regular] [creds] [alwaysOutput]
// PesquisaContactos                  openAi                     [onError→regular] [creds] [alwaysOutput]
// StickyNote1                        stickyNote
// InsertControlEvidence              googleSheets               [creds] [alwaysOutput] [retry]
// GetResultsArray2                   code                       [alwaysOutput]
// IfResultados2                      if
// UpdateControlExecutionOpenai2      googleSheets               [creds] [alwaysOutput]
// UpdateControlExecutionOpenai3      googleSheets               [creds] [alwaysOutput]
// StickyNote2                        stickyNote
// CreateControlExecutionEnrichai     googleSheets               [creds] [alwaysOutput]
// Merge5                             merge
// GetContacts                        code
// Merge6                             merge
// SendToDiscoverUrl                  code
// IfError                            if
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// TriggerRun
//    → ClienteBdOutputUrlChecks
//      → Merge
//        → FiltraResultadosParaTestes
//          → LoopOverItems
//            → NoOperationDoNothing
//           .out(1) → Switch_
//              → CreateControlExecutionOpenai
//                → PesquisaSiteDaEmpresa
//                  → GetResultsArray1
//                    → IfResultados
//                      → UpdateControlExecutionOpenai1
//                        → Merge2
//                          → Merge1
//                            → InsertControlEvidence
//                              → Wait
//                                → LoopOverItems (↩ loop)
//                      → Merge2.in(1) (↩ loop)
//                     .out(1) → UpdateControlExecutionOpenai
//                        → CreateControlExecutionGmaps
//                          → SerpapiCompanyNameGoogleMaps
//                            → IfResultados1
//                              → UpdateControlExecutionGmaps
//                                → Merge4
//                                  → TransformToContactsArray1
//                                    → Merge1.in(1) (↩ loop)
//                              → Merge4.in(1) (↩ loop)
//                             .out(1) → UpdateControlExecution7
//                                → Wait (↩ loop)
//             .out(1) → CreateControlExecutionEnrichai
//                → PesquisaContactos
//                  → IfError
//                    → SendToDiscoverUrl
//                      → Merge6.in(1)
//                        → Switch_ (↩ loop)
//                   .out(1) → GetResultsArray2
//                      → IfResultados2
//                        → UpdateControlExecutionOpenai3
//                          → Merge5
//                            → GetContacts
//                              → Merge1.in(2) (↩ loop)
//                        → Merge5.in(1) (↩ loop)
//                       .out(1) → UpdateControlExecutionOpenai2
//                          → Merge6 (↩ loop)
//                       .out(1) → SendToDiscoverUrl (↩ loop)
//    → ClienteBdOutputControlExec
//      → Merge.in(1) (↩ loop)
//    → ClienteBdOutputInputSnapshot
//      → Merge.in(2) (↩ loop)
// CodeInJavascript1
//    → Markdown
//      → If_
//        → MessageAModel
// OpenaiPesquisaSiteDaEmpresa
//    → GetResultsArray
// NoResults1
//    → StateUpdateControlEvidence3
// NoWebsiteSerpapiQuery
//    → CodeInJavascript4
//      → SerpapiNoWebsite
//        → CodeInJavascript3
// EncontrouSite
//    → SetWebsiteInTheOriginalItem
// HttpsSiteUrl1
//    → SetWebsiteInTheOriginalItem (↩ loop)
// HttpRequest
//    → Markdown2
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '8XhhUJ2mUxOoFzgp',
    name: 'Trustscan Company Contacts  Stage 3 - INDEPENDENT Validation',
    active: false,
    tags: ['Company Contacts'],
    settings: { executionOrder: 'v1', availableInMCP: false, binaryMode: 'separate' },
})
export class TrustscanCompanyContactsStage3IndependentValidationWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '8a99a8d2-045a-485c-a557-647a9e600382',
        name: 'TRIGGER · Run',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1904, -192],
        alwaysOutputData: false,
        executeOnce: true,
    })
    TriggerRun = {};

    @node({
        id: '94148196-021f-453c-b439-96042ccdf70f',
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-736, -208],
    })
    LoopOverItems = {
        options: {
            reset: false,
        },
    };

    @node({
        id: '46956728-0335-4426-84e4-4249cf40b40b',
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-1152, -224],
        alwaysOutputData: true,
    })
    Merge = {
        mode: 'combineBySql',
        numberInputs: 3,
        query: `SELECT distinct inputSnapshot.*,
  controlExec.*
  , urlChecks.Final_url 
  FROM input2 as controlExec 
INNER JOIN (SELECT distinct Entity_key,Final_url FROM  input1) as urlChecks ON controlExec.Entity_key = urlChecks.Entity_key --AND urlChecks.Request_method='GET'
INNER JOIN input3 as inputSnapshot ON inputSnapshot.Input_Row=controlExec.Input_Row
WHERE ((controlExec.Queued_action ='DISCOVER_URL' AND NOT controlExec.Current_phase='URL_FAILED')
OR controlExec.Queued_action = 'ENRICH_FROM_AI')
--where inputSnapshot.Nome='Recheio - Cash & Carry, S.A.'
--where inputSnapshot.Nome='Prio Supply, S.A.'
--where inputSnapshot.Nome='BP Portugal - Comércio de Combustíveis e Lubrificantes, S.A.'
-- AND controlExec.Entity_key=500194670
--where urlChecks.Final_url='https://www.bp.pt'
--where urlChecks.Final_url='https://www.beher.com'
  --where inputSnapshot.Nome='GT Motive Einsa, Unipessoal, Lda.'
--order by inputSnapshot.Nome  
--AND NOT inputSnapshot.Processed=1
order by inputSnapshot.row_number asc`,
        options: {
            emptyQueryResult: 'empty',
        },
    };

    @node({
        id: 'a0a372b0-c9eb-4a1e-8aea-2ba2d260de64',
        name: 'Cliente_BD_OUTPUT / URL_CHECKS',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1392, -512],
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
        id: '80ea0713-47f7-41aa-b8e3-8383a2af6bdb',
        name: 'Cliente_BD_OUTPUT / CONTROL_EXEC',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1408, -288],
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
        id: '07966979-67db-46ec-8654-b6ea94f0b309',
        name: 'STATE · Update CONTROL_EVIDENCE',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [3280, -2576],
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
        id: 'd0491b73-57ec-4eec-a888-3b4cf7ae1e9a',
        name: 'Merge1',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [4208, -256],
    })
    Merge1 = {
        numberInputs: 3,
    };

    @node({
        id: '6e8741cc-3c2b-4065-8dc8-6fadd5724f0c',
        name: 'Markdown',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [3632, -2304],
    })
    Markdown = {
        html: '={{ $json.data }}',
        options: {},
    };

    @node({
        id: '02fe9e81-8c0b-4f23-a085-b228b36d9a08',
        name: 'Code in JavaScript1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3456, -2304],
    })
    CodeInJavascript1 = {
        jsCode: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one

return [...$input.all().filter(y => y.json.data)];`,
    };

    @node({
        id: '04479397-6caa-4001-a548-8029bcaa8ac2',
        name: 'Message a model',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [4096, -2336],
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
        id: 'c45f0bb2-e23d-481c-92b0-21e3a465b668',
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
        id: '3631cf60-4041-40ff-963e-eeda33e0857d',
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
        id: 'b93da83e-5dab-4f43-b988-58d2faebdca2',
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3872, -2576],
        alwaysOutputData: true,
    })
    CodeInJavascript = {
        jsCode: "return $input.all().filter(u=> u.json.data?.trim()!='');",
    };

    @node({
        id: '736c3679-4cf0-4e57-9ed4-2304bd3723b7',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [3824, -2304],
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
        id: '2a6df372-2320-4979-a13c-f78ed9a20b33',
        name: 'STATE · Update CONTROL_EVIDENCE1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [3552, -2640],
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
        id: '5529a62a-780a-4b23-b4f3-e430e5bff32c',
        name: 'Get Results Array1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [496, -736],
        alwaysOutputData: true,
    })
    GetResultsArray1 = {
        jsCode: `const input = $('Switch').item.json;

/*var jsonString = $input.item.json.output[0].content[0].text
  .replace('\`\`\`json','')
  .replace('\`\`\`','');*/

 
var jsonString = $input.first().json.output[0].content[0].text;

const leftIndex = jsonString.indexOf('[');
if (leftIndex > 0)
  jsonString = jsonString.substring(leftIndex);

const rightIndex = jsonString.lastIndexOf(']');
if (rightIndex >= 0 && rightIndex < jsonString.length - 1)
  jsonString = jsonString.substring(0, rightIndex + 1);

jsonString = '['+jsonString.replaceAll('[','').replaceAll(']','')+']';
var items = JSON.parse(jsonString);

if (items[0].error!=null)
  return items

for(var item of items)
{
  //item.confidence = item.source_typesource_type==='sim'?1:0;
  //item.source_type = 'openai';
  item.run_id = input.Run_ID;
  item.entity_key = input.Entity_key;
}

return items`,
    };

    @node({
        id: '0ee95570-f21b-4c1a-bc8e-684971507723',
        webhookId: 'ca5ca1bf-3d00-453c-bbcf-c2975fd9ab57',
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [5072, 624],
    })
    Wait = {
        amount: 3,
    };

    @node({
        id: 'd7d4552d-fa7a-4af7-a81d-1abbb097c2c7',
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
        id: '9632d9b3-ce52-42e7-9822-85713e8e3f9b',
        name: 'Cliente_BD_OUTPUT / INPUT_SNAPSHOT',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-1408, -48],
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
        id: '1d494d9b-16b6-492e-8ee1-309e660e9ade',
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
        id: '9e7628e8-b4f6-4744-bd57-f8d31d0e52ac',
        name: 'filtra resultados para testes',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-960, -208],
    })
    FiltraResultadosParaTestes = {
        jsCode: `//filtra resultados
return $input.all()//.filter(t=>t.json.Current_phase!=='URL_VALIDATED')
  //.at(0);
  //.slice(0,4);
//.slice(0,20)
  ;`,
    };

    @node({
        id: '44d45a17-02bb-4241-af0e-5f406466f02d',
        name: 'No results?1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [2336, -1744],
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
        id: '6356a423-3de0-4700-8ef4-83825b07ee0f',
        name: 'NO website SERPAPI query',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [784, 1168],
    })
    NoWebsiteSerpapiQuery = {
        jsCode: `const items = $input.all();
const results = [];

for (const item of items) {
  const name = item.json.Nome;
  const nipc = item.json.NIPC;
  
  // Priority 1: Name + contact keywords
  const queries = [];
  
  if (name) {
    queries.push(\`"\${name}" contactos email telefone\`);
    queries.push(\`"\${name}" site oficial\`);
  }
  
  // Priority 2: NIPC on directories
  if (nipc) {
    queries.push(\`"\${nipc}" site:racius.com OR site:einforma.pt OR site:portugalio.com\`);
  }
  
  // Priority 3: NIPC + email anywhere
  if (nipc) {
    queries.push(\`"\${nipc}" "@" email\`);
  }

  results.push({
    json: {
      ...item.json,
      serpQueries: queries      
    }
  });
}

return results;`,
    };

    @node({
        id: 'b739f6ad-89e7-4e8c-8b8f-660c3dcb485f',
        name: 'SerpAPI NO website',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1216, 1168],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
    })
    SerpapiNoWebsite = {
        url: '=https://serpapi.com/search.json',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'q',
                    value: '={{ $json.currentQuery }}',
                },
                {
                    name: 'engine',
                    value: 'google',
                },
                {
                    name: 'gl',
                    value: 'pt',
                },
                {
                    name: 'hl',
                    value: 'pt',
                },
                {
                    name: 'num',
                    value: '5',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'b975d13f-b92e-4b6a-9531-160862b5cb91',
        name: 'Code in JavaScript3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1424, 1168],
    })
    CodeInJavascript3 = {
        jsCode: `const resultsAll = $input.all().map(u=>u.json);

const emails = new Set();
const phones = new Set();

const emailRegex = // /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi;
  /[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9.-]+\\.[a-z]{2,}/gi;
const phoneRegex = /(?<!\\d)(?:\\+351[\\s.-]?)?(?:2[1-9]\\d|9[1-9]\\d)[\\s.-]?\\d{3}[\\s.-]?\\d{3}(?!\\d)/g;

for (const queryResult of resultsAll) {
  const results = queryResult.organic_results || [];
  for (const r of results) {
    const text = \`\${r.title || ''} \${r.snippet || ''} \${r.link || ''}\`;
    
    const foundEmails = text.match(emailRegex) || [];
    foundEmails.forEach(e => {
      // Filter junk
      if (!/noreply|no-reply|wix|wordpress|example\\.com/i.test(e)) {
        emails.add({
          field:'email',
          value:e.toLowerCase(),
          source_url:r.link,
          source_type: 'serpapi'});
      }
    });
    
    const foundPhones = text.match(phoneRegex) || [];
    foundPhones.forEach(p => phones.add(
      {
        field:'phone',
        value:p.replace(/[\\s.-]/g, ''),
        source_url:r.link,
        source_type: 'serpapi'
      }
    ));
  }
}

/*return [{
  json: {
    ...$('Previous Node').item.json,
    serp_emails: [...emails],
    serp_phones: [...phones],
    serp_sources: results.map(r => r.link).slice(0, 3),
  }
}];*/

return [...emails, ...phones];    `,
    };

    @node({
        id: '2afa40f2-8e37-4dd1-ac54-9b0e2a7da7d3',
        name: 'Sticky Note4',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [704, 1088],
    })
    StickyNote4 = {
        content: '## several SerpAPI queries by company name and NIPC',
        height: 272,
        width: 960,
        color: 6,
    };

    @node({
        id: '02504802-0933-49f7-89c4-6911eb64f03f',
        name: 'Code in JavaScript4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [992, 1168],
    })
    CodeInJavascript4 = {
        jsCode: `var _return = $input.first()
  .json.serpQueries;

return _return.map((r) => ({
  currentQuery: r
}));`,
    };

    @node({
        id: '32d1a975-0adf-4a08-953f-466e3dd7a0b1',
        name: 'Empty?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1312, -2208],
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
        id: '29f23c73-a488-4c4c-9d23-df5a3c228550',
        name: 'Pesquisa site da empresa',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [192, -736],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: false,
    })
    PesquisaSiteDaEmpresa = {
        modelId: {
            __rl: true,
            value: 'gpt-4.1',
            mode: 'list',
            cachedResultName: 'GPT-4.1',
        },
        responses: {
            values: [
                {
                    role: 'system',
                    content: `És um agente que descobre o website institucional de uma empresa a partir do seu NIPC e nome e apenas tendo como base o website que encontraste retorna dados gerais de emails | fax | telefone | morada dessa empresa. 

`,
                },
                {
                    role: 'system',
                    content: `Se não encontrares o website insitucional deves:
- basear-te noutras fontes que consideres fidedignas para descobrir dados gerais de emails | fax | telefone | morada da empresa
- não retornas o registo do website
- procura contacto válidos. Telefones e faxes com formato de Portugal e emails válidos. Só retornas se for válido. 
- Não te podes basear em resultados vindos de redes sociais
- Retorna somente os contactos que encontraste. Não justifiques a resposta.`,
                },
                {
                    role: 'system',
                    content: `Retorna APENAS um json que é um array de contactos no seguinte formato (sem mais texto na tua resposta):

[{
	field: tipo de contacto (email/fax/phone/website/address),
	value: valor encontrado para o campo,
	source_url: url válido onde foi encontrado o contacto,
        confidence: 1 (se a source é do website oficial) | 0 (Caso contrário),
        source_type: 'openai'
}] 

O retorno tem que ser SEMPRE um array json. Mesmo que tenha só 1 elemento.

Se não conseguires encontrar nada ou não encontraste pelo menos um telefone e um email retornas um JSON no formato {"error": message}`,
                },
                {
                    content: `=NIPC da empresa: "{{ $('Switch').item.json.NIPC }}"
nome da empresa: "{{ $('Switch').item.json.Nome }}"`,
                },
            ],
        },
        builtInTools: {
            webSearch: {
                searchContextSize: 'high',
                country: 'PT',
            },
            codeInterpreter: true,
        },
        options: {
            temperature: 0,
        },
    };

    @node({
        id: '859bb383-7c00-4df9-b477-c13d1ae7dacc',
        name: 'Encontrou site?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [3440, -1632],
    })
    EncontrouSite = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'a2c21662-10b5-4be2-a4b8-8da5076087e7',
                    leftValue: '={{ $json.field === "internet"}}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
                {
                    id: 'fe721028-3a25-4a87-a0ce-a7ed7f472823',
                    leftValue:
                        "={{ $('Switch').item.json.Queued_action ==='DISCOVER_URL' &&  $('Switch').item.json.Current_phase==='URL_SKIPPED' }}",
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
                {
                    id: '834e254e-4b90-4932-9bc2-b4ffa5044b23',
                    leftValue:
                        "={{ $json.value.toLowerCase().replace('https://','').replace('http://','') !== $('Switch').item.json.Internet }}",
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
        looseTypeValidation:
            "={{ $('Switch').item.json.Internet !== $json.value.toLowerCase().replace('https://','').replace('http://','') }}",
        options: {},
    };

    @node({
        id: '7a825ba4-c942-4dc8-9a25-a0da5cadb331',
        name: 'HTTPS site url1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [2960, -1888],
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
    })
    HttpsSiteUrl1 = {
        url: "=https://{{ $json.value.toLowerCase().replace('https://','').replace('http://','') }}",
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
        id: '333e5813-3aff-434a-91a5-f074be36aa9d',
        name: 'Set website in the original item',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3776, -1664],
    })
    SetWebsiteInTheOriginalItem = {
        mode: 'runOnceForEachItem',
        jsCode: `// Add a new field called 'myNewField' to the JSON of the item
const input = $('Switch').item.json;
//console.log(input);
input.Internet = $json.value.toLowerCase().replace('https://','').replace('http://','');

return input;`,
    };

    @node({
        id: 'ae011fc5-efbf-4d50-b576-cfa2d8c3585e',
        name: 'Sticky Note5',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [3664, -1744],
    })
    StickyNote5 = {
        content: `
Se encontrou website (e não tinha originalmente) volta a fazer scrap`,
        height: 240,
        width: 464,
    };

    @node({
        id: '36fe58ae-fb37-4955-bb6e-3dfb15ecc9c1',
        name: 'Get Item',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2416, -1968],
    })
    GetItem = {
        jsCode: `const input = $('Switch').item.json;

/*for (const item of $input.all()) {
  item.json.myNewField = 1;
}*/

return input;`,
    };

    @node({
        id: 'f36a82fb-8a95-4e79-aeab-142849562d62',
        name: 'Markdown2',
        type: 'n8n-nodes-base.markdown',
        version: 1,
        position: [1904, -2096],
    })
    Markdown2 = {
        html: '={{ $json.data || {} }}',
        options: {},
    };

    @node({
        id: '679c2eec-f403-494c-b29b-44882fec556c',
        name: 'Merge3',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [3488, -2000],
    })
    Merge3 = {};

    @node({
        id: '952dc8bc-2380-4728-8fd0-4cb9975d0cc4',
        name: 'If Resultados',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [672, -736],
    })
    IfResultados = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '0e80c7a0-81e2-402a-8427-090e9289cd69',
                    leftValue: '={{ $json.error==null }}',
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
        id: 'a7dfc460-48c1-4556-a2d2-92aa984afeff',
        name: 'Update CONTROL_EXECUTION7',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2224, -128],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecution7 = {
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
                Next_action: 'NONE',
                Exec_key: "={{ $('Create CONTROL_EXECUTION GMAPS').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '31610195-2f2f-40c9-8a41-48990e34932d',
        name: 'No Operation, do nothing',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [-560, -864],
    })
    NoOperationDoNothing = {};

    @node({
        id: '2410c662-4b79-4a08-bf71-3565d6dc6563',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1600, -2096],
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
        id: '8b99d4b2-b607-4c95-b5fe-5bfab411e4a2',
        name: 'Call website1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1744, -2256],
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
        id: '5cc82cbe-0cb8-4aa4-bca9-6a05bdf47de2',
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.4,
        position: [-480, -192],
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
                                id: '23a55481-f8b9-46d3-9f10-39727f75f05b',
                                leftValue:
                                    "={{ $json.Queued_action ==='DISCOVER_URL' && $json.Current_phase !=='URL_FAILED' }}",
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
                                id: 'e758f584-9294-4769-ac43-213d25903df7',
                                leftValue: "={{ $json.Queued_action ==='ENRICH_FROM_AI' }}",
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
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        id: '7a71aa0a-845a-47f5-9bbc-92874ad7c2c6',
        name: 'SerpAPI Company Name / Google Maps',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1680, -240],
        credentials: { serpApi: { id: 'TPQCvbAqVDrs1oJp', name: 'SerpAPI account' } },
    })
    SerpapiCompanyNameGoogleMaps = {
        url: '=https://serpapi.com/search',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'serpApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'q',
                    value: "={{ $('Switch').item.json.Nome }} {{ $('Switch').item.json.Morada }} {{ $('Switch').item.json.CodPostal }} {{ $('Switch').item.json.Localidade }}",
                },
                {
                    name: 'engine',
                    value: 'google_maps',
                },
                {
                    name: 'type',
                    value: 'search',
                },
                {
                    name: 'hl',
                    value: 'pt',
                },
                {
                    name: 'gl',
                    value: 'pt',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'dae4dea0-5ec9-4fe7-b3f5-996591f552f5',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [1120, -448],
    })
    StickyNote = {
        content: '## SerpAPI  Google Maps',
        height: 496,
        width: 1616,
    };

    @node({
        id: '3d51d3ec-ac27-4cb7-ae77-38fa4b74ac3c',
        name: 'Transform to contacts array1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2512, -320],
    })
    TransformToContactsArray1 = {
        jsCode: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
/*for (const item of $input.all()) {
  item.json.myNewField = 1;
}*/
const input = $input.last().json;
const results = input.local_results || [input.place_results]
  
var websites= [...new Set(results
  .map(
    data => data.website
  ))].map(u => ({
    value: u,
    field: 'internet',
    source_url: input.search_metadata.google_maps_url,
    source_type: 'serpapi'
  }));

var phones= [...new Set(results
  .map(
    data => data.phone
  ))].map(u => ({
    value: u,
    field: 'phone',
    source_url: input.search_metadata.google_maps_url,
    source_type: 'serpapi'
  }));

return [...websites, ...phones];`,
    };

    @node({
        id: '68ffeb80-0044-4a61-b2bd-89561501c32f',
        name: 'todos menos website1',
        type: 'n8n-nodes-base.filter',
        version: 2.3,
        position: [3184, -1696],
        alwaysOutputData: true,
    })
    TodosMenosWebsite1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '28aba885-2f7c-422d-bf1b-15b9ce9e0e9e',
                    leftValue: '={{ $json.field }}',
                    rightValue: '=internet',
                    operator: {
                        type: 'string',
                        operation: 'notEquals',
                    },
                },
                {
                    id: '11ca75d9-bcde-4156-8557-da7eb53f9a73',
                    leftValue: '={{ $json.field }}',
                    rightValue: 'address',
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
        id: '378d0656-4aaf-440e-a854-f272f84c17d1',
        name: 'If Resultados1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1872, -240],
    })
    IfResultados1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'a619e9c6-a453-4c1f-b95b-da2c1b491c8f',
                    leftValue: '={{ $json.error ==null }}',
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
        id: '97962257-f239-46c5-91f7-47bcc2733ac9',
        name: 'STATE · Update CONTROL_EVIDENCE3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2608, -1824],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
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
        id: '0e82b005-56a0-4c26-a32c-1f451b1c4d01',
        name: 'Create CONTROL_EXECUTION GMAPS',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1440, -240],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    CreateControlExecutionGmaps = {
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
                Current_phase: 'DISCOVER_URL_GMAPS',
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
        id: 'd4dfb352-2397-4f10-ae86-d50261d4eced',
        name: 'Update CONTROL_EXECUTION OPENAI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1088, -672],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionOpenai = {
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
                Next_action: 'DISCOVER_URL_GMAPS',
                Exec_key: "={{ $('Create CONTROL_EXECUTION OPENAI').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: true,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'e606fa37-ea9a-4326-9c48-31541adb217a',
        name: 'Update CONTROL_EXECUTION OPENAI1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1216, -864],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionOpenai1 = {
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
                Process_Status: 'SOME_RESULTS',
                Next_action: 'DISCOVER_URL_GMAPS',
                Exec_key: "={{ $('Create CONTROL_EXECUTION OPENAI').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '3e1ba6cf-7b10-42e4-8d59-6763be201e82',
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [1568, -768],
    })
    Merge2 = {
        mode: 'chooseBranch',
        useDataOfInput: 2,
    };

    @node({
        id: '94693d9e-18a2-4cf6-a37b-1b0073e79dd5',
        name: 'Update CONTROL_EXECUTION GMAPS',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [2112, -432],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionGmaps = {
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
                Next_action: 'NONE',
                Exec_key: "={{ $('Create CONTROL_EXECUTION GMAPS').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'c42d00f9-63cd-41b8-8ba1-5470a0a90823',
        name: 'Merge4',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [2352, -320],
    })
    Merge4 = {
        mode: 'chooseBranch',
        useDataOfInput: 2,
    };

    @node({
        id: '9cec9e5c-d4f5-4e91-af02-4f3d4e46eec5',
        name: 'Create CONTROL_EXECUTION OPENAI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-16, -736],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    CreateControlExecutionOpenai = {
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
                Current_phase: 'DISCOVER_URL_OPENAI',
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
        id: '4b4815d5-28f5-4bdb-89c3-57c2316bf8a9',
        name: 'Pesquisa site da empresa1',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [3120, -2000],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: false,
    })
    PesquisaSiteDaEmpresa1 = {
        modelId: {
            __rl: true,
            value: 'gpt-4',
            mode: 'list',
            cachedResultName: 'GPT-4',
        },
        responses: {
            values: [
                {
                    role: 'system',
                    content: `És um agente que procura e devolve contactos institucionais (website, emails, faxes, telefones, moradas) de uma determinada empresa a operar em Portugal a partir do seu NIPC, nome e morada. 
Caso tenhas encontrado o website deves analisar o seu conteúdo detalhadamente e procurar os restantes contactos nessa a partir dessa fonte. 

Caso não tenhas encontrado website baseia-te noutras fontes públicas fidedignas mas guarda o url da fonte para apresentar nos resultados.

Não pares quando já tiveres encontrado alguns. Procura pelo máximo de contactos que encontrares. No entanto não te podes basear em resultados vindos de redes sociais.

Antes de retornares valida se os URLs de sources e website são válidos e funcionam.

Retorna APENAS um json no seguinte formato (sem mais texto na tua resposta):

[{
	field: contect type (email/fax/phone),
	value: value for the field,
	source_url: url for the source,
        source_type: se a source é do website oficial 'sim'. Caso contrário 'não'
}] 

Caso tenhas encontrado o website institucional (oficial) deves incluir no output o registo
{
	field: contect type "internet",
	value: url do website,
	source_url: url for the source,
        source_type: "sim"
}

Muito importante: só deverá existir 1 único web site institucional da empresa. Apresenta o que achares melhor

Se não conseguires por qualquer razão responde com um JSON do tipo {error: message}

Assume sempre que tens acesso a fontes públicas de dados empresariais.`,
                },
                {
                    content: `nome da empresa: Prio Supply, S.A.
NIPC da empresa: 509637027
morada (a verificar): Cplx Terminal de Granéis Líquidos - Porto de Aveiro Lt. B 3830-565 Gafanha da Nazaré Gafanha da Nazaré

Procura por contactos institucionais de Portugal

Se não conseguires por qualquer razão responde com um JSON do tipo {error: message}`,
                },
            ],
        },
        builtInTools: {},
        options: {
            temperature: 1,
        },
    };

    @node({
        id: 'aba42b89-0ddd-4508-8e59-1ce28b9220c7',
        name: 'Pesquisa Contactos',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 2.1,
        position: [-112, 320],
        credentials: { openAiApi: { id: '3m9rDHSTaM0KM3o5', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
        alwaysOutputData: true,
        retryOnFail: false,
    })
    PesquisaContactos = {
        modelId: {
            __rl: true,
            value: 'gpt-4.1',
            mode: 'list',
            cachedResultName: 'GPT-4.1',
        },
        responses: {
            values: [
                {
                    role: 'system',
                    content: `És um agente que faz scrap num website de uma empresa e encontra e retorna dados gerais de emails | fax | telefone | morada.
A tua resposta deverá ser unicamente um JSON com o formato lista de contacts em que cada registo de contacto tem o seguinte formato:
{
	field: tipo de contacto (email/fax/phone/address),
	value: valor encontrado para o campo,
	source_url: url válido onde foi encontrado o contacto,
        source_type: 'openai'
}


Se não conseguires encontrar nada ou não encontraste pelo menos um telefone e um email retornas um JSON no formato {"error": message}`,
                },
                {
                    content: '=Website: "{{ $(\'Switch\').item.json.Final_url }}"',
                },
            ],
        },
        builtInTools: {
            webSearch: {
                searchContextSize: 'high',
                country: 'PT',
            },
            codeInterpreter: true,
        },
        options: {
            temperature: 0,
        },
    };

    @node({
        id: '6b90e940-2fd9-46c0-8102-ab8840e59e41',
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-80, -960],
    })
    StickyNote1 = {
        content: '## OpenAI - Search for Website',
        height: 464,
        width: 1936,
        color: 4,
    };

    @node({
        id: '4ab983c1-cfe2-4f0d-8488-d2089a0a2930',
        name: 'INSERT CONTROL_EVIDENCE',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [4464, -240],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
        retryOnFail: true,
    })
    InsertControlEvidence = {
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
        id: '1ba9bc22-190b-4f21-84c9-eb35eda9f17b',
        name: 'Get Results Array2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [496, 320],
        alwaysOutputData: true,
    })
    GetResultsArray2 = {
        jsCode: `const company = $('Switch').item.json;

function getConfidence(item)
{
  var confidence=0;
  
  switch (item.field) {
    case 'fax':
      confidence = item.value.replace(/\\s/g, "").substring(-9)==company.Fax?.toString().substring(-9) ? 1: 0;
      break;
    case 'email':
      confidence = item.value.trim()==company.Email?.trim() ? 1: 0;
      break;
    case 'phone':
      confidence = item.value.replace(/\\s/g, "").substring(-9)==company.Telefone?.toString().toString()?.substring(-9) ? 1: 0;
      break;
    case 'address':
      confidence = item.value.trim()==company.Morada?.trim() ? 1: 0;
      break;
    default:confidence=0;
      break;
  }

  return confidence;
}

var jsonString = $input.first().json.output[0].content[0].text
  .replace('\`\`\`json','')
  .replace('\`\`\`','');

const leftIndex = jsonString.indexOf('[');
if (leftIndex > 0)
  jsonString = jsonString.substring(leftIndex);

const rightIndex = jsonString.lastIndexOf(']');
if (rightIndex >= 0 && rightIndex < jsonString.length - 1)
  jsonString = jsonString.substring(0, rightIndex + 1);

var items = JSON.parse(jsonString);

if (items.error!=null)
  return items

for(var item of items)
{
  item.confidence = getConfidence(item);
  item.run_id = company.Run_ID;
  item.entity_key = company.Entity_key;
}

const success = items.filter(i => i.field == "phone").length>0 && 
  items.filter(i => i.field == "email").length>0 
  items.filter(i => i.field == "address").length>0;

return [{
  success: success,
  contacts: items
  //,input: company
}]`,
    };

    @node({
        id: '5d6750c7-cf5e-4a55-b99c-866e4567e8f3',
        name: 'If Resultados2',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [672, 320],
    })
    IfResultados2 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 3,
            },
            conditions: [
                {
                    id: '0e80c7a0-81e2-402a-8427-090e9289cd69',
                    leftValue: '={{ $json.error==null }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
                {
                    id: '4c451984-1d7d-4a10-8600-c279dc3cf8c2',
                    leftValue: '={{ $json.contacts }}',
                    rightValue: 0,
                    operator: {
                        type: 'array',
                        operation: 'lengthGt',
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
        id: '4d4ba309-f026-4851-a0ef-9cb687ff07db',
        name: 'Update CONTROL_EXECUTION OPENAI2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1088, 384],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionOpenai2 = {
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
                Next_action: 'DISCOVER_URL_OPENAI',
                Exec_key: "={{ $('Create CONTROL_EXECUTION ENRICHAI').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: true,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: 'd4b73e19-b082-41a5-9a55-5d230eb45d28',
        name: 'Update CONTROL_EXECUTION OPENAI3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [1104, 144],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    UpdateControlExecutionOpenai3 = {
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
                Process_Status: "={{ $json.success ? 'ALL_RESULTS':'SOME_RESULTS' }}",
                Next_action: '',
                Exec_key: "={{ $('Create CONTROL_EXECUTION ENRICHAI').item.json.Exec_key }}",
                row_number: 0,
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
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '01464230-71c9-4630-98c2-ea2ed530cdad',
        name: 'Sticky Note2',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-448, 96],
    })
    StickyNote2 = {
        content: '## OpenAI - Search Contacts from Website',
        height: 464,
        width: 2544,
        color: 3,
    };

    @node({
        id: 'ede212d2-4de0-43f3-8ed8-bfe458fa60c6',
        name: 'Create CONTROL_EXECUTION ENRICHAI',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-304, 320],
        credentials: { googleSheetsOAuth2Api: { id: '0my7636ExgjsVAtQ', name: 'Google Sheets account' } },
        alwaysOutputData: true,
    })
    CreateControlExecutionEnrichai = {
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
                Current_phase: 'ENRICH_FROM_AI',
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
        id: 'e04b22e1-6b65-49c6-b77b-005e228b3c7c',
        name: 'Merge5',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [1536, 272],
    })
    Merge5 = {
        mode: 'chooseBranch',
        useDataOfInput: 2,
    };

    @node({
        id: 'a3341c22-d07b-4669-9079-1eaacb8b27bf',
        name: 'Get Contacts',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1808, 272],
    })
    GetContacts = {
        jsCode: 'return $input.first().json.contacts;',
    };

    @node({
        id: '540de76d-101f-4b81-9f46-879dce826431',
        name: 'Merge6',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [1344, 608],
    })
    Merge6 = {
        mode: 'chooseBranch',
        useDataOfInput: 2,
    };

    @node({
        id: '61ed2511-26fd-4ce1-a2cb-305080056846',
        name: 'Send to DISCOVER_URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [880, 608],
    })
    SendToDiscoverUrl = {
        jsCode: `var input = $('Switch').last().json;
input.Queued_action = 'DISCOVER_URL';
input.Current_phase = 'URL_ERROR';

return [{json: input}]`,
    };

    @node({
        id: '3c7e6520-fd63-4571-82c4-5194a8b1fa21',
        name: 'If Error',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [240, 320],
    })
    IfError = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '402bd76a-4b4b-4c20-9734-db98db66d9c9',
                    leftValue: '={{ $json.error!=null }}',
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

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.TriggerRun.out(0).to(this.ClienteBdOutputUrlChecks.in(0));
        this.TriggerRun.out(0).to(this.ClienteBdOutputControlExec.in(0));
        this.TriggerRun.out(0).to(this.ClienteBdOutputInputSnapshot.in(0));
        this.LoopOverItems.out(0).to(this.NoOperationDoNothing.in(0));
        this.LoopOverItems.out(1).to(this.Switch_.in(0));
        this.Merge.out(0).to(this.FiltraResultadosParaTestes.in(0));
        this.ClienteBdOutputUrlChecks.out(0).to(this.Merge.in(0));
        this.ClienteBdOutputControlExec.out(0).to(this.Merge.in(1));
        this.Merge1.out(0).to(this.InsertControlEvidence.in(0));
        this.CodeInJavascript1.out(0).to(this.Markdown.in(0));
        this.Markdown.out(0).to(this.If_.in(0));
        this.OpenaiPesquisaSiteDaEmpresa.out(0).to(this.GetResultsArray.in(0));
        this.If_.out(0).to(this.MessageAModel.in(0));
        this.GetResultsArray1.out(0).to(this.IfResultados.in(0));
        this.Wait.out(0).to(this.LoopOverItems.in(0));
        this.ClienteBdOutputInputSnapshot.out(0).to(this.Merge.in(2));
        this.FiltraResultadosParaTestes.out(0).to(this.LoopOverItems.in(0));
        this.NoResults1.out(0).to(this.StateUpdateControlEvidence3.in(0));
        this.NoWebsiteSerpapiQuery.out(0).to(this.CodeInJavascript4.in(0));
        this.SerpapiNoWebsite.out(0).to(this.CodeInJavascript3.in(0));
        this.CodeInJavascript4.out(0).to(this.SerpapiNoWebsite.in(0));
        this.PesquisaSiteDaEmpresa.out(0).to(this.GetResultsArray1.in(0));
        this.EncontrouSite.out(0).to(this.SetWebsiteInTheOriginalItem.in(0));
        this.HttpsSiteUrl1.out(0).to(this.SetWebsiteInTheOriginalItem.in(0));
        this.IfResultados.out(0).to(this.UpdateControlExecutionOpenai1.in(0));
        this.IfResultados.out(0).to(this.Merge2.in(1));
        this.IfResultados.out(1).to(this.UpdateControlExecutionOpenai.in(0));
        this.UpdateControlExecution7.out(0).to(this.Wait.in(0));
        this.HttpRequest.out(0).to(this.Markdown2.in(0));
        this.Switch_.out(0).to(this.CreateControlExecutionOpenai.in(0));
        this.Switch_.out(1).to(this.CreateControlExecutionEnrichai.in(0));
        this.SerpapiCompanyNameGoogleMaps.out(0).to(this.IfResultados1.in(0));
        this.TransformToContactsArray1.out(0).to(this.Merge1.in(1));
        this.IfResultados1.out(0).to(this.UpdateControlExecutionGmaps.in(0));
        this.IfResultados1.out(0).to(this.Merge4.in(1));
        this.IfResultados1.out(1).to(this.UpdateControlExecution7.in(0));
        this.CreateControlExecutionGmaps.out(0).to(this.SerpapiCompanyNameGoogleMaps.in(0));
        this.UpdateControlExecutionOpenai.out(0).to(this.CreateControlExecutionGmaps.in(0));
        this.UpdateControlExecutionOpenai1.out(0).to(this.Merge2.in(0));
        this.Merge2.out(0).to(this.Merge1.in(0));
        this.UpdateControlExecutionGmaps.out(0).to(this.Merge4.in(0));
        this.Merge4.out(0).to(this.TransformToContactsArray1.in(0));
        this.CreateControlExecutionOpenai.out(0).to(this.PesquisaSiteDaEmpresa.in(0));
        this.InsertControlEvidence.out(0).to(this.Wait.in(0));
        this.GetResultsArray2.out(0).to(this.IfResultados2.in(0));
        this.IfResultados2.out(0).to(this.UpdateControlExecutionOpenai3.in(0));
        this.IfResultados2.out(0).to(this.Merge5.in(1));
        this.IfResultados2.out(1).to(this.UpdateControlExecutionOpenai2.in(0));
        this.IfResultados2.out(1).to(this.SendToDiscoverUrl.in(0));
        this.CreateControlExecutionEnrichai.out(0).to(this.PesquisaContactos.in(0));
        this.UpdateControlExecutionOpenai3.out(0).to(this.Merge5.in(0));
        this.Merge5.out(0).to(this.GetContacts.in(0));
        this.PesquisaContactos.out(0).to(this.IfError.in(0));
        this.UpdateControlExecutionOpenai2.out(0).to(this.Merge6.in(0));
        this.GetContacts.out(0).to(this.Merge1.in(2));
        this.Merge6.out(0).to(this.Switch_.in(0));
        this.SendToDiscoverUrl.out(0).to(this.Merge6.in(1));
        this.IfError.out(0).to(this.SendToDiscoverUrl.in(0));
        this.IfError.out(1).to(this.GetResultsArray2.in(0));
    }
}
