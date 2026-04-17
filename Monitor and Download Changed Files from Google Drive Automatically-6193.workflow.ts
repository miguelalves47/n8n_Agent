import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : google drive workflow
// Nodes   : 19  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// NoOperation                        noOp
// Merge                              merge
// CreateTimestampFile                code
// ScheduleTrigger1                   scheduleTrigger
// SearchForTimestampFile1            googleDrive                [onError→regular] [creds]
// DownloadTimestampFile1             googleDrive                [creds]
// DownloadNewFiles2                  googleDrive                [creds]
// UploadNewTimestamp2                googleDrive                [creds]
// If_                                if
// EditFields                         set                        [executeOnce]
// ExtractTimestampText1              extractFromFile
// EditFields2                        set
// SearchForNewFiles2                 googleDrive                [creds] [alwaysOutput] [executeOnce]
// GetCurrentTime1                    dateTime
// DeleteOldTimestampFile1            googleDrive                [creds]
// StickyNote                         stickyNote
// StickyNote1                        stickyNote
// StickyNote2                        stickyNote
// StickyNote3                        stickyNote
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger1
//    → SearchForTimestampFile1
//      → DownloadTimestampFile1
//        → ExtractTimestampText1
//          → EditFields2
//            → SearchForNewFiles2
//              → If_
//                → DownloadNewFiles2
//                  → Merge
//                    → EditFields
//                      → DeleteOldTimestampFile1
//                        → GetCurrentTime1
//                          → CreateTimestampFile
//                            → UploadNewTimestamp2
//               .out(1) → NoOperation
//                  → Merge (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Zm3vlJ68snvoKOBG',
    name: 'google drive workflow',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class GoogleDriveWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '96c1dd68-0754-4142-b4a3-33da8c7ecbb4',
        name: 'No Operation',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [60, -180],
    })
    NoOperation = {};

    @node({
        id: '1311ef97-df8e-413c-b2a4-744f6d52a464',
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 2,
        position: [280, -280],
    })
    Merge = {};

    @node({
        id: '36218a2a-19cb-411b-b16c-abac840c781d',
        name: 'Create Timestamp File',
        type: 'n8n-nodes-base.code',
        version: 1,
        position: [1160, -280],
    })
    CreateTimestampFile = {
        jsCode: `// Get ISO string from DateTime node
const dateString = $json['date'] || new Date().toISOString();

// Return in expected format
return [{
  json: {},
  binary: {
    data: {
      data: Buffer.from(dateString).toString('base64'),
      mimeType: 'text/plain'
    }
  }
}];`,
    };

    @node({
        id: 'edc76c05-1f99-4013-b9fe-b13adcac72af',
        name: 'Schedule Trigger1',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.1,
        position: [-1480, -280],
    })
    ScheduleTrigger1 = {
        rule: {
            interval: [
                {
                    field: 'minutes',
                },
            ],
        },
    };

    @node({
        id: '7127ff0e-88c3-4de3-a20d-9691af5cb97e',
        name: 'Search for Timestamp File1',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [-1260, -280],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
        onError: 'continueRegularOutput',
    })
    SearchForTimestampFile1 = {
        filter: {},
        options: {
            fields: ['*'],
        },
        resource: 'fileFolder',
        returnAll: true,
        queryString: "=name = 'n8n_last_run.txt' and trashed = false",
        searchMethod: 'query',
    };

    @node({
        id: '1bec1940-0532-4329-9661-fb2bccf00ccd',
        name: 'Download Timestamp File1',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [-1040, -280],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
    })
    DownloadTimestampFile1 = {
        fileId: {
            __rl: true,
            mode: 'id',
            value: '={{ $json.id }}',
        },
        options: {},
        operation: 'download',
    };

    @node({
        id: '93a1e5f1-cfcd-409a-861d-ac2fe26e02fa',
        name: 'Download New Files2',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [60, -380],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
    })
    DownloadNewFiles2 = {
        fileId: {
            __rl: true,
            mode: 'id',
            value: '={{ $json.id }}',
        },
        options: {},
        operation: 'download',
    };

    @node({
        id: '97cadaca-a362-401b-9024-f4c982fbdfce',
        name: 'Upload New Timestamp2',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [1380, -280],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
    })
    UploadNewTimestamp2 = {
        name: 'n8n_last_run.txt',
        driveId: {
            __rl: true,
            mode: 'list',
            value: 'My Drive',
            cachedResultUrl: 'https://drive.google.com/drive/my-drive',
            cachedResultName: 'My Drive',
        },
        options: {},
        folderId: {
            __rl: true,
            mode: 'list',
            value: '1ycXdgyWRiQ_Ce_IgeZN1au6QKQNYOMJn',
            cachedResultUrl: 'https://drive.google.com/drive/folders/1ycXdgyWRiQ_Ce_IgeZN1au6QKQNYOMJn',
            cachedResultName: 'n8n Workflows',
        },
    };

    @node({
        id: '1fe60540-aedd-4b20-9ec4-44f63e9c995b',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-160, -280],
    })
    If_ = {
        options: {},
        conditions: {
            options: {
                version: 2,
                leftValue: '',
                caseSensitive: true,
                typeValidation: 'strict',
            },
            combinator: 'and',
            conditions: [
                {
                    id: '9f2f6596-c151-4fa1-aadd-ec26345aba4d',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                        singleValue: true,
                    },
                    leftValue: '={{ $json.id }}',
                    rightValue: '',
                },
            ],
        },
    };

    @node({
        id: '51894b5f-1a9c-416c-b3ee-49bb20c904f1',
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [500, -280],
        executeOnce: true,
    })
    EditFields = {
        options: {},
    };

    @node({
        id: '3d6cbf9c-da08-42d4-a682-bf0c97700754',
        name: 'Extract Timestamp Text1',
        type: 'n8n-nodes-base.extractFromFile',
        version: 1,
        position: [-820, -280],
    })
    ExtractTimestampText1 = {
        options: {},
        operation: 'text',
    };

    @node({
        id: '7004e5b2-1d35-4900-ae9a-90e8d4ce2d49',
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-600, -280],
    })
    EditFields2 = {
        options: {},
        assignments: {
            assignments: [
                {
                    id: 'd6a28651-3a08-4a34-a5a7-e53bb335c83b',
                    name: 'searchFromTimestamp',
                    type: 'string',
                    value: '={{ $json.data || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }}',
                },
            ],
        },
    };

    @node({
        id: '10fae4c7-57ab-44c4-86d1-34ea5fea1316',
        name: 'Search for New Files2',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [-380, -280],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
        alwaysOutputData: true,
        executeOnce: true,
    })
    SearchForNewFiles2 = {
        filter: {},
        options: {
            fields: ['*'],
        },
        resource: 'fileFolder',
        returnAll: true,
        queryString:
            "='1ycXdgyWRiQ_Ce_IgeZN1au6QKQNYOMJn' in parents and (createdTime > '{{ $json.searchFromTimestamp }}' OR modifiedTime > '{{ $json.searchFromTimestamp }}') and trashed = false",
        searchMethod: 'query',
    };

    @node({
        id: '358f5927-e9ce-4935-b9bb-4f34996cb932',
        name: 'Get Current Time1',
        type: 'n8n-nodes-base.dateTime',
        version: 2,
        position: [940, -280],
    })
    GetCurrentTime1 = {
        options: {
            timezone: 'UTC',
            includeInputFields: false,
        },
    };

    @node({
        id: '8f058442-c3e4-47f2-8185-388856bb9338',
        name: 'Delete Old Timestamp File1',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [720, -280],
        credentials: { googleDriveOAuth2Api: { id: '2ntQDVP0dIsxbgub', name: 'Google Drive account' } },
    })
    DeleteOldTimestampFile1 = {
        fileId: {
            __rl: true,
            mode: 'id',
            value: '={{ $node["Search for Timestamp File1"].json.id }}',
        },
        options: {},
        operation: 'deleteFile',
    };

    @node({
        id: '47c471f5-e804-42f1-a8b5-d35ec2982daa',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-1580, -520],
    })
    StickyNote = {
        width: 150,
        height: 180,
        content: `Workflow Purpose
This workflow automatically downloads new or updated files from a Google Drive folder since the last workflow run, using a timestamp file for tracking.`,
    };

    @node({
        id: 'c8aa3c8a-46ab-449a-936c-93955f6f3083',
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-1280, -520],
    })
    StickyNote1 = {
        content: `Setup Required
You need to set up your Google Drive credentials in n8n for this workflow to function.
Edit the nodes marked with "Google Drive" to select your credentials and set your target folder ID.`,
    };

    @node({
        id: 'a5b5c496-231f-44bc-bfb9-7c96b89067cc',
        name: 'Sticky Note2',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-860, -520],
    })
    StickyNote2 = {
        content: `Timestamp File
The workflow looks for a n8n_last_run.txt file in Google Drive to know when it last ran.
If the file isn’t found, it defaults to files from the last 24 hours.`,
    };

    @node({
        id: '5c5b741d-2237-4228-afc4-a13eea55faf1',
        name: 'Sticky Note3',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [1240, -600],
    })
    StickyNote3 = {
        content: `Timestamp Update
After all files are processed, the timestamp file is updated so future runs only process new/changed files.`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.If_.out(0).to(this.DownloadNewFiles2.in(0));
        this.If_.out(1).to(this.NoOperation.in(0));
        this.Merge.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.DeleteOldTimestampFile1.in(0));
        this.EditFields2.out(0).to(this.SearchForNewFiles2.in(0));
        this.NoOperation.out(0).to(this.Merge.in(0));
        this.GetCurrentTime1.out(0).to(this.CreateTimestampFile.in(0));
        this.ScheduleTrigger1.out(0).to(this.SearchForTimestampFile1.in(0));
        this.DownloadNewFiles2.out(0).to(this.Merge.in(0));
        this.CreateTimestampFile.out(0).to(this.UploadNewTimestamp2.in(0));
        this.SearchForNewFiles2.out(0).to(this.If_.in(0));
        this.ExtractTimestampText1.out(0).to(this.EditFields2.in(0));
        this.DownloadTimestampFile1.out(0).to(this.ExtractTimestampText1.in(0));
        this.DeleteOldTimestampFile1.out(0).to(this.GetCurrentTime1.in(0));
        this.SearchForTimestampFile1.out(0).to(this.DownloadTimestampFile1.in(0));
    }
}
