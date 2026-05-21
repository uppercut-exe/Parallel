# Phase 12: Record Block Editor

## What Changed

Database records no longer open a simple "title + properties + textarea" sheet. Each record now opens as a full Studio block-editor page — the same block engine, slash menu, mobile toolbar, and block types used in Studio's page editor.

## How It Works

### Context-Aware Block Engine

A single block engine serves both page editing and record editing. The global `activeRecordEditId` variable tracks which record is open (or `null` in page-editor mode). Key functions are now context-aware:

- **`getBlocks()`** — returns `record.blocks` when `activeRecordEditId` is set, otherwise `currentDocument().blocks`
- **`renderStudioBlocks(focusId)`** — renders to `#recordEditorBlocks` (record mode) or `#studioBlocks` (page mode)
- **`updateActiveBlockUI()`** — queries the correct canvas for the active block highlight
- **`updateMobileToolbar()`** — shows `#recMobileEditToolbar` (record mode) or `#mobileEditToolbar` (page mode)
- **`insertBlockBelow` / `deleteBlock` / `duplicateBlock` / `insertDatabaseBlock`** — guard `currentPage().blockIds` assignment so record-mode edits do not corrupt the active page

### New UI: `#s-record-editor`

A `.sub studio-sub` full-screen panel (`z-index: 40`) that slides in over Studio. It contains:

- **Sticky header** (`#recEditorHd`) — Back button, editable title input, Done button; populated by `renderRecordEditorContent()`
- **Scrollable body** (`#recEditorBody`) — properties panel, divider, "Body" label, block canvas (`#recordEditorBlocks`), bottom spacer
- **Mobile toolbar** (`#recMobileEditToolbar`) — identical eight-button toolbar to the page editor's `#mobileEditToolbar`

### Opening a Record

`openRecordEditor(recordId)`:
1. Calls `closeDatabasePreview()` to dismiss the database action sheet (avoids z-index conflict)
2. Calls `ensureRecordBlocks(database, record)` to populate empty `record.blocks` with template blocks
3. Sets `activeRecordEditId = recordId`
4. Calls `renderRecordEditorContent(database, record)` to populate the header and properties panel
5. Calls `showSub('s-record-editor')` / `studioOpenSub('s-record-editor')` to animate the panel in
6. Calls `renderStudioBlocks()` to render the record's blocks into `#recordEditorBlocks`

### Closing a Record

`closeRecordEditor()` calls `closeSub('s-record-editor')` (standalone) or `studioCloseSub('s-record-editor')` (integrated app), which resets `activeRecordEditId`, `activeBlockId`, closes menus/toolbars, and hides the panel.

## Data Storage

Each record object gains a `blocks` array:

```js
{
  id: "rec_...",
  databaseId: "db_...",
  title: "...",
  properties: { ... },
  blocks: [            // NEW in Phase 12
    { id: "blk_...", type: "h2", content: "Overview" },
    { id: "blk_...", type: "paragraph", content: "" },
    ...
  ],
  createdAt: "...",
  updatedAt: "..."
}
```

`blocks` is serialized/deserialized through the existing `serializeBlock` / `normalizeBlock` pipeline via `serializeDatabaseRecord` / `normalizeDatabaseRecord`. Storage key is unchanged: `parallel.studio.phase4.v2`.

## Template Blocks

`recordTemplateBlocks(database)` returns typed starter blocks based on the database name:

| Database match | Template sections |
|---|---|
| project / roadmap / sprint | Overview · Goals · Next Actions · Notes |
| meeting / standup / sync | Agenda · Notes · Decisions · Action Items |
| content / editorial / campaign | Hook · Angle · Visual Direction · Caption |
| client / account / partner | About · Current Work · Follow-ups |
| *(default)* | Notes · Next Actions |

Each section is an `h2` heading block followed by an empty `paragraph` (or `todo` for action items).

`ensureRecordBlocks(database, record)` auto-populates `record.blocks` with the template only when the array is empty. Existing blocks are never overwritten.

## Actions

All existing record actions continue to work:

- **Back / Done** — both call `closeRecordEditor()`; blocks are already persisted on every keystroke
- **Duplicate** — `duplicateDatabaseRecord()` clones the source record's `blocks` array with fresh IDs via `cloneBlock()`
- **Archive** — the archive handler checks `activeRecordEditId` and calls `closeRecordEditor()` before archiving if the current record is open
- **Copy Title** — unchanged

## View Compatibility

All four database views (List, Table, Board, Gallery) are unaffected. They display the record's `title` and `properties` and open the record editor via the shared `openRecordEditor()` entry point. Block content is not shown in any view — it lives exclusively inside the record editor page.

## Mobile Experience

Bottom padding on the record editor body matches dock height:

- Default: `padding-bottom: 120px` (dock clearance)
- When mobile toolbar is active: `padding-bottom: 216px` (120px dock + 96px toolbar)

This mirrors the identical padding logic in the page editor (`editor-body` / `editor-body.toolbar-open`).

## Works In Both Shells

- **Integrated app** (`apps/app/index.html`) — uses `studioShowSub` / `studioCloseSub`, `#s-record-editor` is a `.sub.studio-sub`
- **Standalone Studio** (`apps/studio/index.html`) — uses `showSub` / `closeSub`, `#s-record-editor` is a `.sub`

`openRecordEditor` and `closeRecordEditor` are exported on `window` in both files.

## Lossless Compliance

- `legacy/` files are not modified
- All existing features (database views, page editor, Studio command center, shell/dock, persistence) continue to work
- `npm run verify:lossless` passes (legacy checksums unchanged)
- No second editor, no second dock, no second footer introduced
