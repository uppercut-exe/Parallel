# Phase 16: Advanced Database Engine + Spatial Rhythm Refinement

## Summary

Phase 16 transforms Parallel Studio from a structured collection system into a true **relational workspace engine**. Four advanced database features are introduced — Relations, Rollups, Formulas, and Grouped List View — while a comprehensive spatial rhythm pass normalizes card spacing, section padding, and visual cadence across the entire Studio command center using the Templates section as the reference standard.

---

## Part 1 — Advanced Database Engine

### Feature 1: Relations (`relation` field type)

Records can now be linked across databases. The relation field renders as lightweight pill chips with live connected record titles. Users can add and remove links through an elegant sheet-based picker.

**What changed**

- `databasePropertyTypes.relation` → `implemented:true`
- `prop('projects.relatedClient','Linked Client','relation',8,{metadata:{targetDatabaseId:'db-clients'}})` added to Projects schema
- `prop('meetings.relatedProject','Linked Project','relation',7,{metadata:{targetDatabaseId:'db-projects'}})` added to Meetings schema
- Seed records pre-populated with relation values: Projects → Clients, Meetings → Projects
- `defaultRecordProperties` initializes relation fields as empty arrays `[]`

**New function: `getRelatedRecords(record, field)`**
- Reads the array of record IDs stored in `record.properties[field.id]`
- Returns the live record objects from `studioDatabaseRecords`
- Safe to call on any field type — returns `[]` for non-relation fields

**Updated `formatDbValue`**
- Relation type: joins linked record titles with `, ` or returns `'No links'`

**Updated `renderRecordField(record, field, database)`**
- Relation: renders pills with record icon + title + removable `×` button, plus an "Add link" button that opens the relation picker
- Function signature updated to accept optional `database` param (for rollup/formula computation)
- Both call sites updated to pass `database`

**Relation Picker Sheet (`#relationPickerSheet`)**
- Slides up from bottom of the phone shell (same pattern as `databaseActionSheet`)
- Shows all records from the target database with search filtering
- Each row shows: icon, title, updated date, checkmark (green when linked)
- Tap a row toggles the link (add or remove)
- Picker updates in-place as links change
- Live search: input at `#relationPickerSearch` filters rows by title

**New functions**
- `renderRelationPicker(database, record, field)` — returns picker HTML
- `openRelationPicker(database, record, field)` — sets state, injects HTML, slides up
- `closeRelationPicker()` — slides down, clears state
- `relationPickerState` — `{recordId, fieldId, databaseId}` — tracks open picker context

**New click handlers**
- `[data-db-relation-add]` → open picker for that field
- `[data-db-relation-pick]` → toggle link (add or remove by `data-db-relation-action`)
- `[data-relation-picker-close]` → close picker
- `[data-db-relation-remove]` → remove a specific linked record from a pill

**New input handler**
- `#relationPickerSearch` → live search filter on picker rows

---

### Feature 2: Rollups (`rollup` field type)

Rollup fields display aggregated values computed from linked records.

**What changed**

- `databasePropertyTypes.rollup` → `implemented:true`
- `renderRecordField` renders rollups as a computed card with badge (`COUNT`, `SUM`, `AVG`, etc.) and large value display

**New function: `computeRollupValue(database, record, field)`**

Reads `field.metadata`:
- `sourceRelationFieldId` — which relation field to traverse (falls back to first relation field)
- `sourcePropertyId` — which property to aggregate on linked records
- `operation` — `count` (default), `sum`, `avg`, `min`, `max`, `percent`

Example: a Project rollup counting linked meetings would use `{operation:'count'}` with the meetings relation field.

---

### Feature 3: Formulas (`formula` field type)

Formula fields display computed values derived from other field values on the same record.

**What changed**

- `databasePropertyTypes.formula` → `implemented:true`
- `renderRecordField` renders formulas as a computed card with `FORMULA` badge

**New function: `computeFormulaValue(database, record, field)`**

Reads `field.metadata`:
- `operation` — `concat` (default), `sum`, `avg`, `multiply`, `days_remaining`
- `fieldIds` — array of field IDs to operate on
- `separator` — join string for concat (default ` · `)

Built-in behaviors:
- `concat` with no fieldIds: auto-joins title + first status/select field values
- `days_remaining`: reads first `type==='date'` field, returns `"Overdue"`, `"Today"`, or `"Nd left"`
- `sum/avg/multiply`: operates on number fields

---

### Feature 4: Grouped List View

The list view can now be grouped by any status, select, or checkbox field. Groups are collapsible accordion sections.

**What changed**

- `ensureDatabaseViews` now preserves `groupBy` key in `viewState` (like `calYear`/`calMonth`)
- `renderActiveDatabaseView` routes to `renderDbGroupedList` when `listGroupField(database)` is non-null
- `databaseViewLabel` returns `'Grouped list view'` when list view has a group field active

**New functions**

| Function | Purpose |
|---|---|
| `groupableListFields(database)` | Returns status/select/checkbox fields eligible for grouping |
| `listGroupField(database)` | Returns the active group field from `viewState.groupBy` |
| `renderDbGroupedList(database, records)` | Renders the accordion-grouped list view |

**Group-by selector in `renderDbControls`**

A compact `Group` label + select dropdown appears below the sort selector when:
1. Active view is `list`
2. The database has at least one groupable field

**Group section design**
- `.db-group-section` — rounded card per group with soft glass background
- `.db-group-header` — colored dot, group name, count badge, chevron
- Groups default to expanded; tap header to collapse (CSS class `.collapsed`)
- Record cards inside groups inherit the existing `.db-record-card` styles

**Click handler**
- `[data-db-toggle-group]` → toggles `.collapsed` on the parent `.db-group-section`

**Change handler**
- `[data-db-groupby]` → calls `updateDatabaseViewState(database, {groupBy: value||null})` → `renderDatabaseSheet()`

---

## Part 2 — Spatial Rhythm Normalization

The Templates section (`.tmpl2-card`) was used as the spatial reference standard:

```css
.tmpl2-card {
  border-radius: 20px;
  padding: 16px 16px 14px;
  gap: 11px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.045);
}
```

### Changes Applied

| Selector | Before | After |
|---|---|---|
| `.studio-home-card` | `border-radius:23px; padding:13px` | `border-radius:20px; padding:14px 14px 13px; box-shadow:0 2px 10px rgba(0,0,0,.045)` |
| `.studio-card-stack` | `gap:9px; padding:0 18px` | `gap:10px; padding:0 14px` |
| `.studio-home-section` | `padding:4px 2px 8px` | `gap:10px; padding:6px 4px 10px` |
| `.studio-section-head` | `padding:10px 10px 6px` | `padding:2px 12px 8px` |

Cards across Projects, Databases, Documents, and Continue Working sections now share the same corner radius (20px), shadow weight, and padding as the Templates section.

---

## New CSS Classes

```css
/* Relations */
.relation-field-wrap, .relation-pill, .relation-pill i
.relation-pill-remove, .relation-add-btn

/* Computed fields (Rollup + Formula) */
.field-computed, .field-computed-badge, .field-computed-val, .field-computed-sub

/* Relation picker sheet */
.relation-picker-sheet, .relation-picker-sheet.open
.relation-picker-head, .relation-picker-title, .relation-picker-close
.relation-picker-search-wrap, .relation-picker-search
.relation-picker-list, .relation-picker-row, .relation-picker-row.linked
.relation-picker-ico, .relation-picker-info, .relation-picker-name, .relation-picker-meta
.relation-picker-check, .relation-picker-empty

/* Grouped list */
.db-grouped-list, .db-group-section, .db-group-section.collapsed
.db-group-header, .db-group-dot, .db-group-name, .db-group-count, .db-group-chevron
.db-group-records

/* Group-by controls */
.db-groupby-row, .db-groupby-label
```

---

## Data Flow

### Relation links
```
Tap "Link [Database]" → openRelationPicker → renderRelationPicker
Tap a picker row → data-db-relation-pick → toggle IDs in record.properties[fieldId]
                 → re-render picker in place + refresh props grid
Tap × on pill   → data-db-relation-remove → filter IDs → refresh
```

### Rollup/Formula
```
renderRecordField(record, field, database)
  → computeRollupValue(db, record, field) / computeFormulaValue(db, record, field)
  → display as .field-computed card
  (read-only, computed on render — no separate storage)
```

### Grouped list
```
data-db-groupby change → updateDatabaseViewState({groupBy}) → renderDatabaseSheet
renderActiveDatabaseView → listGroupField(database) → renderDbGroupedList
data-db-toggle-group click → section.classList.toggle('collapsed')
```

---

## Works In Both Shells

All changes applied identically to:
- `apps/app/index.html` — integrated Parallel app
- `apps/studio/index.html` — standalone Studio dev harness

---

## Lossless Compliance

- `legacy/` files untouched
- All existing views (List, Table, Board, Gallery, Calendar, Timeline), page editor, shell/dock, persistence, templates, and record block editor unchanged
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced

---

## What's Next

- **Relation back-links** — show which records link *to* a given record
- **Rollup fields in schema builder** — UI to add rollup fields to any database
- **Formula editor** — inline formula expression editing in record properties
- **Linked database blocks** — embed filtered database views inside page documents
- **Calendar record creation** — tap an empty day cell to create a date-stamped record
- **AI block suggestions** — context-aware content in the block editor
