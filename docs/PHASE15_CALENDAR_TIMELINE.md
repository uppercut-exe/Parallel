# Phase 15: Calendar + Timeline Workspace System

## Summary

Phase 15 introduces two fully-functional time-based database views — Calendar and Timeline — making Parallel's Studio a genuine workspace OS with built-in temporal planning. Both views integrate cleanly into the existing database architecture, respect all filters/sorts, and preserve full record-editing capabilities. A Studio polish pass tightens spacing, adds section grouping backgrounds, and improves database sheet rhythm throughout.

## What Changed

### Calendar View (`renderDbCalendar`)

A monthly calendar grid that places database records on dates visually. Designed for calm, premium feel — not enterprise dense.

**Layout**
- 7-column CSS grid (`repeat(7,1fr)`)
- Day cells: minimum 54px tall, soft `rgba(0,0,0,.025)` background, 9px border radius
- Week day headers: 9px uppercase abbreviated labels (Su Mo Tu We Th Fr Sa)
- Other-month cells dimmed to 36% opacity — grid always fills 5–6 rows

**Today state**
- Sage-tinted cell background `rgba(139,170,142,.14)` with a `1.5px sage` outline
- Date number rendered in `--sage` at weight 700

**Record pills**
- Up to 2 per cell (overflow shows `+N` counter)
- 9px font, `white/86%` glass background, colored left border by database type
- `type-projects` → lilac · `type-clients` → sage · `type-meetings` → peach · `type-content` → sky
- Tap opens the immersive record editor via existing `data-db-open-record` handler

**Month navigation**
- Header: serif month+year label + 3 nav buttons (prev / today / next)
- State stored in `database.metadata.viewState.calYear` + `calMonth`
- Buttons: `data-db-cal-prev`, `data-db-cal-today`, `data-db-cal-next`
- Handled in the global click listener alongside all other `data-db-*` actions

**Date detection** (`calendarDateFieldFor`)
Priority order for finding the date field to place records on:
1. Field named `due` / `duedate` / `startdate` / `start`
2. Field named `date` / `scheduled` / `deadline` / `enddate`
3. Any `type==='date'` field
4. Fallback: `record.createdAt`

**Empty state**
If no records fall in the current month, a calm centered message appears below the grid.

---

### Timeline View (`renderDbTimeline`)

Records grouped by month in vertical card stacks, sorted chronologically within each group.

**Structure**
- Month group headers: 10px uppercase lettered, sage calendar icon, full-width divider line
- Record cards: glass background `rgba(255,255,255,.66)`, 14px border radius, subtle shadow
- Database-type dot badge (30×30px rounded square): lilac/sage/peach/sky per type
- Title (truncated), formatted date string, property chips (top 3 key fields)
- Tap opens record editor via `data-db-open-record`

**Progress bar** (shown when start + end date fields both exist)
- 3px bar below the property chips
- Filled percentage = elapsed time from start to today / total duration
- Gradient fill color matches database type (lilac→sky, peach→lilac, sage→sky, sky→lilac)
- Only shown if two distinct date fields exist and end date is in the future relative to start

**Grouping logic**
- `calendarDateFor(database, record)` returns the primary date for each record
- Keys: `"YYYY-MM"` sorted lexicographically → chronological order automatically
- Records within each month sorted ascending by date

**Empty states**
Two variants: no records at all, and no month groups (edge case safety net).

---

### View Switcher — 6 Views

`renderDbControls` now renders 6 tabs:

```
List  |  Table  |  Board  |  Gallery  |  Calendar  |  Timeline
```

The tab bar CSS is updated to allow horizontal overflow scroll on narrow screens:
- `.db-view-tabs`: `overflow-x:auto; scrollbar-width:none; flex-wrap:nowrap`
- `.db-view-tab`: `flex:0 0 auto; min-width:60px` — no longer `flex:1`

This means the bar scrolls gracefully rather than compressing all 6 tabs to microscopic widths.

---

### `ensureDatabaseViews` — Updated

Two new view entries added: `calendar` and `timeline`.

`validViews` array expanded to `['list','table','board','gallery','calendar','timeline']`.

`calYear` and `calMonth` now preserved in the viewState reconstruction (previously unknown keys were dropped). Safe default: current year and month from `new Date()`.

---

### `databaseViewLabel` — Updated

Returns `'Calendar view'` and `'Timeline view'` for the two new view types. Used in the database sheet subtitle and search result metadata.

---

### New Helper Functions

| Function | Purpose |
|---|---|
| `calendarDateFieldFor(database)` | Returns the best date field for calendar placement by name priority |
| `calendarSecondDateFieldFor(database)` | Returns a second date field (end/due/deadline) for timeline progress bars |
| `calendarDateFor(database, record)` | Returns a JS `Date` for a record — field value or `createdAt` fallback |
| `renderDbCalendar(database, records)` | Full monthly calendar HTML |
| `renderDbTimeline(database, records)` | Monthly-grouped timeline HTML |

---

### Click Handlers — Calendar Navigation

Three new handlers in the global `click` listener (after board-move handlers):

```js
[data-db-cal-prev]   → go to previous month
[data-db-cal-next]   → go to next month
[data-db-cal-today]  → jump to current month
```

All three call `updateDatabaseViewState(db, {calYear, calMonth})` and `renderDatabaseSheet()`.

---

### Studio Polish Pass

| What | Change |
|---|---|
| `.studio-home-section` | Added `background:rgba(255,255,255,.18)` + `border-radius:18px` — subtle grouping card |
| `.studio-section-head` | Padding `10px 10px 6px` — slightly more breathing room at top |
| `.db-sheet-head` | Padding `10px 8px 12px` — consistent with new section padding |
| `.db-controls` | `gap:8px; padding-bottom:2px` — tighter and more balanced |
| `.db-list` | `padding-bottom:4px` — removes cramped bottom edge |
| `.database-action-sheet` | `max-height:min(680px,calc(100vh - 118px))` — +30px more visible height |
| `.studio-pulse-card` | `border-radius:22px` — slightly more premium card shape |
| `.studio-quick-grid` | `gap:7px; padding:2px 2px 4px` — normalized spacing |

---

## New CSS Classes

```css
/* Calendar */
.db-cal-wrap, .db-cal-header, .db-cal-month-label
.db-cal-nav, .db-cal-nav-btn
.db-cal-day-names, .db-cal-day-name
.db-cal-grid, .db-cal-cell, .db-cal-cell.other-month, .db-cal-cell.today
.db-cal-date, .db-cal-pill, .db-cal-pill.type-{projects|clients|meetings|content|default}
.db-cal-overflow, .db-cal-empty

/* Timeline */
.db-timeline, .db-tl-month, .db-tl-month-head
.db-tl-items, .db-tl-item
.db-tl-dot, .db-tl-dot.type-{projects|clients|meetings|content|default}
.db-tl-body, .db-tl-title, .db-tl-date, .db-tl-props
.db-tl-bar, .db-tl-bar-fill, .db-tl-bar-fill.type-{...}
.db-tl-empty
```

---

## Data Flow

No data-model changes. Records do not need new fields for calendar/timeline to work — they fall back to `createdAt`. Adding a `type==='date'` field to a database schema instantly makes those records date-aware in both views.

- Record tap in calendar → `data-db-open-record` → `openRecordEditor(id)` (existing)
- Record tap in timeline → `data-db-open-record` → `openRecordEditor(id)` (existing)
- Calendar month nav → `updateDatabaseViewState` → `renderDatabaseSheet` (new)

---

## Works In Both Shells

All changes applied identically to:
- `apps/app/index.html` — integrated Parallel app
- `apps/studio/index.html` — standalone Studio dev harness

---

## Lossless Compliance

- `legacy/` files untouched
- All existing database views (List, Table, Board, Gallery), page editor, shell/dock, persistence, templates, and record block editor continue to work unchanged
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced

---

## What's Next

- **Calendar record creation** — tap an empty day cell to create a record pre-populated with that date
- **Multi-day range visualization** — calendar cards that span date ranges (start → end)
- **Timeline week grouping** — optional tighter grouping for dense databases
- **Calendar density toggle** — compact (icon only) vs editorial (pill with title)
- **Record relations** — cross-database relations surfaced in record properties
- **AI block suggestions** — context-aware content suggestions in the block editor
