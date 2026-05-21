# Phase 21: Stabilization, Regression Repair + Feature Preservation

## Summary

Phase 21 is a targeted stabilization pass on Phase 20. No new major systems were added. Every change is a surgical fix to a confirmed bug or a defensive guard that makes existing behavior more reliable. All Phase 1–20 systems remain intact and unchanged.

---

## Bugs Repaired

### Fix A — AI Overlay Backdrop Click-to-Close
**File:** `apps/app/index.html`, `apps/studio/index.html`  
**Problem:** The `.ai-overlay` backdrop had no click handler. Tapping outside the AI sheet did nothing — the sheet could only be dismissed via the × button.  
**Fix:** Added `onclick="closeAiSheet()"` to `.ai-overlay` and `onclick="event.stopPropagation()"` to `.ai-sheet` so tapping the darkened backdrop closes the sheet without the sheet div closing itself via propagation.

```html
<!-- Before -->
<div class="ai-overlay" id="aiSheetOverlay" style="display:none;">
  <div class="ai-sheet" id="aiSheet">

<!-- After -->
<div class="ai-overlay" id="aiSheetOverlay" style="display:none;" onclick="closeAiSheet()">
  <div class="ai-sheet" id="aiSheet" onclick="event.stopPropagation()">
```

---

### Fix B — `renderAiActionBlock` Targets Correct Container
**File:** `apps/app/index.html`, `apps/studio/index.html`  
**Problem:** `document.querySelector('.ai-action-bar')` always returned the *first* `.ai-action-bar` in DOM order. When the Phase 13 full record editor was open, the first bar in DOM order was inside the database action sheet (even if hidden), not inside `#recEditorProps`. The generated AI output block was inserted into the wrong container.  
**Fix:** Use `activeRecordEditId` to select the correct container:
- Full record editor active → `#recEditorProps .ai-action-bar`
- Inline database sheet view → `#databaseActionSheet .ai-action-bar`

```js
// Before
const bar = document.querySelector('.ai-action-bar');

// After
const bar = activeRecordEditId
  ? document.querySelector('#recEditorProps .ai-action-bar')
  : document.querySelector('#databaseActionSheet .ai-action-bar');
```

---

### Fix C — `aiInsertAsNotes` Works in Phase 13 Full Record Editor
**File:** `apps/app/index.html`, `apps/studio/index.html`  
**Problem:** `aiInsertAsNotes` used `document.querySelector('[data-db-record-body]')` which targets the textarea in the *inline* record view. The Phase 13 full record editor uses a block editor (`#recordEditorBlocks`) with no `[data-db-record-body]` textarea. "Insert as notes" silently did nothing when called from the full editor.  
**Fix:** Branch on `activeRecordEditId`:
- Full editor → append a new `paragraph` block via `makeBlock()`, push to `rec.blocks`/`rec.blockIds`, then call `persistStudioState(true)` and `renderStudioBlocks(newBlock.id)`
- Inline view → append to the `[data-db-record-body]` textarea as before

```js
function aiInsertAsNotes(blockId, recordId) {
  const block = document.getElementById(blockId);
  if (!block) return;
  const body = block.querySelector('.ai-gen-body')?.textContent || '';
  if (activeRecordEditId) {
    // Phase 13 full block editor
    const rec = studioDatabaseRecords[activeRecordEditId];
    if (rec) {
      const newBlock = makeBlock('paragraph', body);
      if (!Array.isArray(rec.blocks)) rec.blocks = [];
      rec.blocks.push(newBlock);
      if (!Array.isArray(rec.blockIds)) rec.blockIds = [];
      rec.blockIds.push(newBlock.id);
      persistStudioState(true);
      renderStudioBlocks(newBlock.id);
    }
  } else {
    // Inline view: body textarea
    const textarea = document.querySelector('[data-db-record-body]');
    if (textarea) {
      textarea.value = textarea.value ? (textarea.value + '\n\n' + body) : body;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  block.remove();
}
```

---

### Fix D — AI Sheet Closes on Dock Navigation
**File:** `apps/app/index.html`  
**Problem:** The AI overlay lives at screen level (outside all `.page` elements), not inside `#pg-studio`. When the user tapped HOME, TASKS, or YOU in the dock, the AI sheet remained open on top of the new page.  
**Fix:** Added `closeAiSheet()` call to `goPage()` using a safe type-check guard so it won't error if called before Phase 20 AI JS initializes.

```js
function goPage(id) {
  // ... existing page switch logic ...
  closeMenu();
  if (typeof closeAiSheet === 'function') closeAiSheet(); // Phase 21: close AI sheet on nav
  // ...
}
```

*(Note: `apps/studio/index.html` is a single-screen app with no `goPage` equivalent, so this fix is app-only.)*

---

## Audit Results — Confirmed Working Systems

### Phase 20 AI Systems
| System | Status |
|---|---|
| "Ask Parallel" pulse button → AI sheet | ✅ Intact |
| AI sheet backdrop dismiss | ✅ Fixed (Fix A) |
| AI query chips (7 pre-built queries) | ✅ Intact |
| `parseWorkspaceQuery` natural language engine (~20 patterns) | ✅ Intact |
| All 8 workspace data functions referenced in query engine | ✅ Verified present |
| Workspace Intelligence card in Command Center | ✅ Intact |
| `generateWorkspaceInsights()` (5 signal types) | ✅ Intact |
| AI action bar on inline record view | ✅ Intact, correct container (Fix B) |
| AI action bar on full Phase 13 record editor | ✅ Intact, correct container (Fix B) |
| "Insert as notes" — inline view | ✅ Intact |
| "Insert as notes" — full block editor | ✅ Fixed (Fix C) |
| AI result rows → navigation routing | ✅ Intact |
| AI sheet closes on dock navigation | ✅ Fixed (Fix D) |
| Contextual record suggestions (up to 2 per record) | ✅ Intact |

### Phase 19 Onboarding
| System | Status |
|---|---|
| 3-step onboarding flow | ✅ Intact |
| `px_v19_setup` / `px_v19_name` / `px_v19_mode` / `px_v19_gs_dismissed` keys | ✅ Intact, no collisions |
| Workspace mode selection (4 modes) | ✅ Intact |
| Name personalization | ✅ Intact |
| Getting Started card (conditional, dismissible) | ✅ Intact |
| Studio Pulse greeting with user name | ✅ Intact |
| Rich empty states on all 6 database views | ✅ Intact |

### Phase 17–18 Core Intelligence & Motion
| System | Status |
|---|---|
| `workspaceUpcoming()` / `workspaceOverdue()` / `workspaceStale()` / `workspaceNeedsAttention()` | ✅ Intact |
| Upcoming / Needs Attention Command Center sections | ✅ Intact |
| Record health badges | ✅ Intact |
| Related Work panel | ✅ Intact |
| `--cinematic` / `--decelerate` easing tokens | ✅ Intact |
| Block bloom animations | ✅ Intact |

### Phase 15–16 Database Views & Relations
| System | Status |
|---|---|
| List, Table, Board, Gallery, Calendar, Timeline views | ✅ Intact |
| Grouped List view | ✅ Intact |
| Relations / Rollups / Formulas | ✅ Intact |

### Phase 12–14 Record Block Editor & Templates
| System | Status |
|---|---|
| Phase 13 full record editor (block editor) | ✅ Intact |
| `activeRecordEditId` state management | ✅ Intact |
| Record templates (4 types) | ✅ Intact |
| Page template library (7 types) | ✅ Intact |

### Shell & Navigation
| System | Status |
|---|---|
| Dock order: Studio / Tasks / + / Home / You | ✅ Intact |
| `ParallelShell.dockItems` source of truth | ✅ Intact |
| `goPage()` routing | ✅ Intact (Fix D added) |
| `openStudioModule()` | ✅ Intact |
| `isStudioMountedTarget()` guard on second click handler | ✅ Intact |
| Three global click handler chain | ✅ Intact, no new handlers added |

### Persistence & Storage
| System | Status |
|---|---|
| `persistStudioState()` | ✅ Intact |
| `parallel.studio.phase4.v2` key | ✅ Intact |
| No new localStorage keys introduced in Phase 21 | ✅ Confirmed |
| `npm run verify:lossless` | ✅ **PASSES** |

---

## Files Changed

| File | Changes |
|---|---|
| `apps/app/index.html` | Fix A (AI overlay backdrop), Fix B (action bar targeting), Fix C (insert as notes), Fix D (goPage closes AI sheet) |
| `apps/studio/index.html` | Fix A (AI overlay backdrop), Fix B (action bar targeting), Fix C (insert as notes) |
| `docs/PHASE21_STABILIZATION.md` | This file |
| `README.md` | Phase 21 entry added to Studio Phase History |

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second shell, no second dock, no second footer
- Dock order unchanged: Studio / Tasks / + / Home / You
- All existing views, editors, databases, and Phase 1–20 systems unchanged
- No new localStorage keys introduced
- No external dependencies or network calls
