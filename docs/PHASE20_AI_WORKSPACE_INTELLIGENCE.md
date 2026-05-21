# Phase 20: AI + Workspace Intelligence System

## Summary

Phase 20 transforms Parallel into a genuinely intelligent workspace operating system. Six AI systems are woven directly into the existing product fabric — calm, ambient, deeply integrated, and never disruptive. All intelligence is derived from real workspace data: databases, records, dates, statuses, relations, and activity signals.

All changes apply identically to both `apps/app/index.html` and `apps/studio/index.html`. No existing systems were modified, removed, or destabilized. The single global shell, footer, and dock order remain intact.

---

## Part 1 — Workspace AI Search: "Ask Parallel"

### Entry Points
- **"Ask Parallel" button** in the Studio Pulse card — always visible at the bottom of the pulse section
- **"Ask" button** in the Workspace Intelligence card — contextual shortcut
- Opens the AI sheet bottom sheet (`#aiSheetOverlay`)

### AI Sheet UX
The AI sheet slides up from the bottom of the screen using the same `.overlay + .sheet` pattern as the global create overlay. It contains:
- Sage-tinted mark icon + "Ask Parallel" title + dismiss button
- Free-text query input (`#aiQueryInput`) with live results on `oninput`
- 7 pre-built query chips for instant exploration
- Results area (`#aiResultsArea`) populated by `renderAiResults(query)`

### Natural Language Query Engine — `parseWorkspaceQuery(q)`

The engine matches ~20 natural language patterns and maps them to real workspace data:

| Pattern keywords | Intent | Data source |
|---|---|---|
| `overdue`, `past due`, `late`, `missed`, `behind` | Overdue records | `workspaceOverdue()` |
| `attention`, `urgent`, `blocked`, `critical`, `needs` | Needs attention | `workspaceNeedsAttention()` |
| `this week`, `due`, `upcoming`, `soon`, `deadline` | Due this week | `workspaceUpcoming(7)` |
| `stale`, `inactive`, `no update`, `old`, `forgotten` | Stale records | `workspaceStale(14)` |
| `active`, `in progress`, `current`, `working`, `open` | Active projects | Projects DB + all records |
| `recent`, `last`, `latest`, `history`, `worked` | Recent activity | `studioRecentRecords()` + `recentPages()` |
| `summary`, `overview`, `status`, `workspace` | Workspace snapshot | `generateWorkspaceInsights()` |
| (anything else) | Free text search | Pages + databases + records |

Each query result shows:
- Colored icon (tone-coded by data type)
- Title + database/type metadata
- Badge with urgency label (overdue, upcoming, stale, active)

Clicking a result closes the AI sheet and navigates to the record, page, or database.

### Pre-built Query Chips
```
What needs attention? · What's overdue? · Due this week ·
Recent activity · Active projects · Stale records · Workspace overview
```

---

## Part 2 — Workspace Intelligence Card

A premium card injected into the Command Center above the Getting Started card (and above Continue Working). It appears on every load since it's computed from live workspace data.

### Rendered by `studioWorkspaceIntelCard()`

The card shows up to 5 live workspace insights from `generateWorkspaceInsights()`:
- Sage brain icon + "Workspace Intelligence" heading
- "Ask" shortcut button → opens AI sheet
- Insight rows with colored urgency dots

### Insight Generation — `generateWorkspaceInsights()`

Produces insight objects with `level` (urgent/warn/good/neutral) and rich HTML `text`:

1. **Overdue signal** — "X is N days overdue in Y database" (most urgent overdue record)
2. **Overdue count** — "N records are past their due date" (if more than 1)
3. **Upcoming signal** — "X is due today/tomorrow/in N days"
4. **Progress signal** — "X project is N% complete — [context phrase]"
5. **Stale signal** — "N records haven't been updated in over 3 weeks"
6. **Activity signal** — "Most recent activity is in [database name]"
7. **Workspace size** — "Workspace holds N records across N databases and N pages"

Urgency dots:
- `urgent` → peach (overdue)
- `warn` → lilac (upcoming)
- `good` → sage (progress, activity)
- `neutral` → muted (size, stale count)

---

## Part 3 — AI Summaries on Record Pages

### AI Action Bar

Added to both record views (inline database sheet + full-screen record editor). Sits below the record hero section, above Properties, separated by a subtle top border.

Four action buttons:
- **Summarize** — `aiContentForRecord(db, record, 'summarize')`
- **Next steps** — `aiContentForRecord(db, record, 'next-steps')`
- **Break down** — `aiContentForRecord(db, record, 'breakdown')`
- **Agenda** — `aiContentForRecord(db, record, 'meeting-agenda')`

### AI Content Generation — `aiContentForRecord(database, record, action)`

Reads real record data (title, status, date, properties, body) and generates contextual text output.

**Summarize:** Status + due date + truncated body notes + key property fields  
**Next steps:** 5 contextual steps based on current status stage (early/mid/late)  
**Meeting agenda:** 5-point agenda template with record context in the footer  
**Task breakdown:** 6-step breakdown with complexity/timeline estimate

### AI Output Block — `renderAiActionBlock()`

Generated content appears as a `.ai-gen-block` immediately after the action bar — sage-tinted, animated with `blockBloom`. The block includes:
- Sage label with sparkles icon and action name
- Pre-formatted content body
- Three footer actions: **Insert as notes** (appends to record body textarea) / **Copy** (clipboard) / **Dismiss**

Only one output block is shown at a time (replaces any previous output).

---

## Part 4 — Intelligent Record Suggestions

### `generateAiSuggestions(database, record)`

Analyzes each record for up to 2 contextual gaps and returns suggestion objects:

| Condition | Suggestion |
|---|---|
| No date field or value | "Add a due date to use timeline and calendar planning." |
| Has relation fields, none linked | "Link a related record to connect this across your workspace." |
| Body is empty or <10 chars | "Add notes to capture context, decisions, or next actions." |
| Status field exists but not set | "Set a status to track progress through your workflow." |

### `renderAiSuggestionsHtml(database, record)`

Returns HTML string of `.ai-suggestion` pills injected above the Properties label (below the AI action bar). Each suggestion shows a sage icon, the tip text with bold key phrase, and a dismiss button that removes the pill immediately.

---

## Part 5 — AI-Assisted Creation (Action Block → Notes)

The "Insert as notes" action in the AI output block inserts the generated content directly into the record body textarea using the existing `[data-db-record-body]` selector. The insert dispatches an `input` event so any existing autosave/persist logic fires naturally.

This integrates AI creation directly into the real workspace persistence system — no disconnected AI documents, no separate AI data layer.

---

## Part 6 — Calm AI UX Layer

### Visual approach
- All AI surfaces use existing design tokens: `--sage`, `--lilac`, `--cinematic`, `--dur-md`
- AI sheet matches the create overlay pattern (same easing, same handle, same glass background)
- Workspace Intelligence card uses the same glass card aesthetic as Getting Started
- AI action buttons use the same border radius, shadow, and hover behavior as existing UI
- The pulsing dot (`aiDotPulse` keyframe) in the "understanding" banner is the only active animation added

### Z-index hierarchy
- AI sheet overlay: `z-index: 3700` (below onboarding at 9000, below create overlay at 500 — actually the create overlay is 500 so this is higher, which is correct for a sheet)
- AI output blocks: inline in record content, no z-index needed

### Non-invasive integration
- "Ask Parallel" button appears only in the Pulse card — one clear, calm entry point
- Workspace Intelligence card renders only if `generateWorkspaceInsights()` returns results
- AI suggestions render only if the record has actual gaps
- No persistent AI state (beyond localStorage from previous phases)
- No AI-specific localStorage keys added

### Performance
- All intelligence functions are synchronous and operate on already-loaded workspace data
- No network calls, no async operations, no loading spinners
- `renderAiResults` runs on every keypress but only processes arrays of 6–8 records max
- `generateWorkspaceInsights` iterates all databases once — same computational cost as existing `workspaceOverdue()` calls

---

## New CSS Classes

### AI Sheet
```css
.ai-overlay            /* fullscreen overlay, absolute inset, z-index:3700 */
.ai-sheet              /* bottom sheet, slides up from translateY(100%) */
.ai-sheet-handle       /* drag handle pill */
.ai-sheet-head         /* header row with icon, title, close */
.ai-sheet-mark         /* sage-tinted icon container */
.ai-sheet-title-wrap   /* title + sub column */
.ai-sheet-title        /* "Ask Parallel" */
.ai-sheet-sub          /* sub-label */
.ai-sheet-close        /* × button */
.ai-query-area         /* query input padding area */
.ai-query-input        /* text input with sage focus ring */
.ai-query-chips        /* scrollable chip row */
.ai-query-chip         /* individual query suggestion pill */
```

### AI Results
```css
.ai-understanding      /* "Parallel understands: …" banner */
.ai-understanding-dot  /* pulsing sage dot */
.ai-understanding-text /* explanation text */
.ai-results-area       /* results padding wrapper */
.ai-result-label       /* section label (ALL CAPS, tracked) */
.ai-result-row         /* individual result button row */
.ai-result-ico         /* tone-colored icon */
.ai-result-main        /* title + meta column */
.ai-result-title       /* record/page/database name */
.ai-result-meta        /* database or type context */
.ai-result-badge       /* urgency badge (overdue/upcoming/stale/active) */
.ai-empty              /* empty state container */
.ai-empty-ico          /* large muted icon */
.ai-empty-text         /* calm explanation */
```

### Workspace Intelligence Card
```css
.ws-intel-card         /* glass card with sage border */
.ws-intel-head         /* icon + labels + Ask button row */
.ws-intel-ico          /* brain icon container */
.ws-intel-label        /* "Workspace Intelligence" */
.ws-intel-sublabel     /* sub-description */
.ws-intel-ask          /* "Ask" shortcut button */
.ws-insight-list       /* column of insight rows */
.ws-insight-row        /* individual insight row */
.ws-insight-dot        /* urgency dot (urgent/warn/good/neutral) */
.ws-insight-text       /* insight text with bold inline emphasis */
```

### AI Pulse Button
```css
.ai-pulse-btn          /* "Ask Parallel" button in Studio Pulse */
```

### AI Action Bar & Output
```css
.ai-action-bar         /* flex row of action buttons on record pages */
.ai-action-btn         /* individual Summarize/Next steps/etc. button */
.ai-gen-block          /* generated output card, sage tinted */
.ai-gen-label          /* "PARALLEL AI · Action" label */
.ai-gen-body           /* pre-wrapped content text */
.ai-gen-footer         /* Insert / Copy / Dismiss row */
.ai-gen-insert         /* sage primary action button */
.ai-gen-copy           /* copy to clipboard button */
.ai-gen-dismiss        /* ghost dismiss button */
```

### Contextual Suggestions
```css
.ai-suggestions-area   /* wrapper for suggestion pills */
.ai-suggestion         /* individual suggestion row */
.ai-sug-ico            /* sage icon */
.ai-sug-body           /* tip text with bold key phrase */
.ai-sug-close          /* × dismiss button */
```

---

## New JS Functions

| Function | Purpose |
|---|---|
| `generateWorkspaceInsights()` | Compute 5 live insight objects from workspace data |
| `studioWorkspaceIntelCard()` | Render the Workspace Intelligence card HTML |
| `parseWorkspaceQuery(q)` | Map natural language → workspace data query results |
| `renderAiResults(query)` | Populate AI sheet results area |
| `runAiQuery(q)` | Set query input value and run renderAiResults |
| `openAiSheet()` | Show AI overlay + focus input |
| `closeAiSheet()` | Fade out and hide AI overlay |
| `aiContentForRecord(db, record, action)` | Generate AI text for a record+action pair |
| `renderAiActionBlock(db, record, action)` | Insert AI output block into the DOM |
| `aiInsertAsNotes(blockId, recordId)` | Append AI output to record body textarea |
| `aiCopyContent(blockId)` | Copy AI output to clipboard |
| `generateAiSuggestions(db, record)` | Compute up to 2 contextual suggestions |
| `renderAiSuggestionsHtml(db, record)` | Return suggestion pills HTML string |

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second shell, no second dock, no second footer
- Dock order unchanged: Studio / Tasks / + / Home / You
- All existing views, editors, databases, and Phase 19 onboarding unchanged
- No new localStorage keys introduced
- No external dependencies or network calls
