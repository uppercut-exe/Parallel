# Phase 17: Workspace Intelligence + Linked Workspace Experience

## Summary

Phase 17 makes Parallel Studio feel **alive and contextual**. The workspace now surfaces what needs attention, shows what's coming up, exposes connections between records, and embeds database views directly inside pages and records. Every feature is non-invasive — Studio still loads quietly with the same shell, dock, and footer structure.

---

## Part 1 — Workspace Intelligence Layer

### Workspace Health Functions

Four new helper functions scan the entire workspace state on every render:

| Function | What it returns |
|---|---|
| `workspaceUpcoming(days=14)` | `[{record, database, date}]` — records with a date field value within the next `days` days, sorted chronologically |
| `workspaceOverdue()` | `[{record, database, date, daysLate}]` — non-completed records whose date field is in the past, sorted by most overdue |
| `workspaceStale(days=14)` | `[{record, database}]` — non-completed records not updated in `days` days |
| `workspaceNeedsAttention()` | Combined: up to 4 overdue + up to 3 stale, deduped |

All functions:
- Skip completed/done records (check status field for `complete`, `done`, `completed`)
- Use `calendarDateFieldFor(database)` for intelligent date field detection
- Are read-only — they never mutate state

### Record Health Badge

`recordHealthBadge(database, record)` → HTML string or `''`

- Returns `<span class="ws-badge overdue">Overdue</span>` for past-due records
- Returns `<span class="ws-badge upcoming">Due soon</span>` for records due within 3 days
- Returns `''` for completed records or records with no date field
- Called from `renderDbList`, `renderDatabaseBlock`, `renderLinkedDatabaseBlock`

**Updated `renderDbList`**

List view records now show a health badge instead of the chevron arrow when one is present. Completed records and records without dates keep their normal chevron.

---

## Part 2 — Contextual Workspace Surfaces

### Studio Command Center — New Sections

Two conditional sections appear between **Continue Working** and **Quick Create** when relevant data exists:

**Upcoming**
- Appears when `workspaceUpcoming(14)` returns any results
- Shows up to 5 records with their due date and database name
- Color-coded urgency: peach (today/tomorrow), lilac (2–3 days), sage (4–14 days)
- Each card is tappable → `openRecordEditor`
- Section title: "Upcoming" / "Records with due dates in the next two weeks."

**Needs Attention**
- Appears when `workspaceNeedsAttention()` returns any results
- Shows up to 5 records with overdue/stale badges
- Overdue badge: red background, shows `Nd overdue`
- Stale badge: grey background, shows `Stale`
- Each card is tappable → `openRecordEditor`
- Section title: "Needs Attention" / "Overdue or stale records across your workspace."

### Studio Pulse Ribbon — Intelligence Update

The second ribbon chip now shows live intelligence:
- When overdue records exist: `N overdue item(s)`
- When nothing is overdue: `[Last DB name] is ready` or `All clear — nothing overdue`
- A third chip appears when upcoming items exist: `N due this week`

---

## Part 3 — Related Work in Record Pages

### Related Work Panel

`renderRecordRelatedPanel(database, record)` → HTML string

Renders a **Related Work** section directly inside the record editor, between the properties panel and the block editor. Only appears when the record's database has at least one `relation` field with linked records.

**Design**
- Panel label: "RELATED WORK" (uppercase, spaced)
- One section per relation field that has linked records
- Each section shows: database icon + title header, then a bordered card list
- Each linked record row: icon, title, status value (if present), health badge (if relevant)
- Up to 4 rows shown; overflow shows `+N more`
- All rows are tappable → `openRecordEditor`

**Integration point**
- `renderRecordEditorContent(database, record)` — inserted after the properties section, before the action buttons
- Applied to both `apps/app/index.html` and `apps/studio/index.html`

---

## Part 4 — Embedded Linked Database Block

### New Block Type: `linked-database`

Added as the 15th block type across the full block engine stack:

**`blockTypeConfig` entry**
```js
'linked-database': {
  label: 'Linked Database',
  sub: 'Embed a filtered database view',
  icon: 'ti-layout-list',
  tone: 'sage',
  group: 'Advanced',
  defaultContent: ''
}
```

Available in slash menu under **Advanced** group alongside `database` and `code`.

**`ensureLinkedDatabaseBlock(block)`**
- Like `ensureDatabaseBlock` but links to the first existing database rather than creating a new one
- Falls back to creating a new database only if no databases exist

**`renderLinkedDatabaseBlock(block)`**
- Renders a compact embedded view with:
  - Header row: database icon, title, record count, view type, "Linked" chip — tappable to open full database view
  - Up to 4 mini record rows with health badges
  - "View all N records →" row if more than 4 records exist
  - Action row: Open + New Record buttons
- Uses `.block-linked-db` / `.ldb-*` CSS classes

**Handler updates**
- `insertBlockBelow`: calls `ensureLinkedDatabaseBlock` when `type === 'linked-database'`
- `transformBlock`: calls `ensureLinkedDatabaseBlock` when `type === 'linked-database'`
- `renderBlockBody`: routes `linked-database` to `renderLinkedDatabaseBlock`

---

## Part 5 — Upgraded Database Block

`renderDatabaseBlock(block)` now shows **inline record previews** below the database metadata:

- Up to 5 records shown as `.db-mini-record` rows
- Each row: icon, title, health badge or status value
- `+N more records` row if more than 5 records exist — tappable to open full database
- Rows are tappable → `openRecordEditor`
- Layout uses `.db-preview-records` container

---

## New CSS Classes

```css
/* Health badges */
.ws-badge, .ws-badge.overdue, .ws-badge.upcoming, .ws-badge.stale

/* Inline record previews */
.db-preview-records, .db-mini-record, .db-mini-rec-ico
.db-mini-rec-title, .db-mini-rec-meta, .db-mini-rec-more

/* Linked-database block */
.block-linked-db, .ldb-head, .ldb-head-ico, .ldb-head-info
.ldb-head-title, .ldb-head-meta, .ldb-filter-chip
.ldb-records, .ldb-actions

/* Related work panel */
.rec-related-panel, .rec-related-panel-lbl
.rec-related-section, .rec-related-head
.rec-related-list, .rec-related-row
.rec-related-ico, .rec-related-main
.rec-related-title, .rec-related-status, .rec-related-more

/* Contextual surface cards */
.ws-upcoming-item, .ws-upcoming-ico, .ws-upcoming-main
.ws-upcoming-title, .ws-upcoming-meta, .ws-upcoming-date
.ws-needs-item, .ws-needs-badge, .ws-needs-badge.overdue, .ws-needs-badge.stale
```

---

## Data Flow

### Workspace intelligence
```
renderStudioCommandCenter()
  → workspaceUpcoming(14) → date-field scan across all databases
  → workspaceNeedsAttention() → workspaceOverdue() + workspaceStale()
  → Upcoming section (conditional) + Needs Attention section (conditional)
  → Pulse ribbon updated with live overdue/upcoming counts
```

### Health badges in list view
```
renderDbList(database, records)
  → recordHealthBadge(database, record) per record
  → badge shown instead of chevron when non-empty
```

### Related work panel
```
renderRecordEditorContent(database, record)
  → renderRecordRelatedPanel(database, record)
    → sortedSchema → filter relation fields
    → getRelatedRecords(record, field) per relation
    → recordHealthBadge for each linked record
  → inserted between props section and action buttons
```

### Linked-database block
```
Slash menu / transform → 'linked-database'
  → insertBlockBelow / transformBlock → ensureLinkedDatabaseBlock
  → renderBlockBody → renderLinkedDatabaseBlock
    → recordsForDatabase + recordHealthBadge
    → .block-linked-db card with header + mini records + actions
```

---

## Works In Both Shells

All changes applied identically to:
- `apps/app/index.html` — integrated Parallel app
- `apps/studio/index.html` — standalone Studio dev harness

---

## Lossless Compliance

- `legacy/` files untouched
- All existing views, editors, shell/dock, persistence, and Phase 16 features unchanged
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced

---

## What's Next

- **Linked database filtering** — filter the embedded view by a property value, not just show all records
- **Relation back-links** — show which records link *to* a given record
- **Formula editor** — inline formula expression editing in record properties
- **AI block suggestions** — context-aware content in the block editor
- **Calendar record creation** — tap an empty day cell to create a date-stamped record
- **Workspace digest** — weekly summary of what moved, what's stale, what shipped
