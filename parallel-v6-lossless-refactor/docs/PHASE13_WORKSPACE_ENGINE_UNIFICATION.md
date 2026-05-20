# Phase 13: Workspace Engine Unification

## Summary

Phase 13 begins the architectural transformation of database records into true first-class workspace pages, and performs a comprehensive Studio polish pass that makes the entire Command Center feel more spacious, premium, and intentional.

## What Changed

### Record Editor — Immersive Document Layout

Records now open as full-page documents, not modal sheets. The redesigned layout introduces:

**Minimal sticky nav header**
- Back button + centered database crumb (icon + name) + green "Done" pill
- The title is no longer crammed into the header — it lives in the body where it can breathe

**Cinematic cover strip** (`.rec-page-cover`)
- 92px color-coded strip at the top of the body
- Background gradient is database-aware via `recordEditorAccent(database)`:
  - Projects/Roadmap/Sprint → lilac/sky gradient
  - Clients/Accounts/Partners → sage gradient
  - Meetings/Standups/Syncs → peach/amber gradient
  - Content/Editorial/Ideas/Campaigns → sky gradient
  - Default → lilac/sage gradient
- A frosted-glass icon badge sits at the bottom-left of the cover, flush with the title area

**Document-style title** (`.rec-title-input`)
- 27px Playfair Display, weight 600, letter-spacing −0.025em
- Full-width input field, no border, transparent background
- Byline row beneath: created date + last-modified timestamp
- `data-db-record-title` attribute preserved — all existing input handlers work unchanged

**Collapsible Properties panel** (`.rec-props-section`)
- Glass card with subtle inner shadow
- Toggle button: "Properties" label + count badge + chevron
- Chevron uses `.collapsed` class: points right when collapsed, down when expanded
- `toggleRecordProps()` function added and exported on `window`
- Properties grid (1×2 columns) is hidden/shown via `.rec-props-body.hidden`

**Page actions row** (`.rec-page-actions`)
- Flat flex row of action buttons: Duplicate · Another · Copy title · Archive
- Sits below the properties panel, separated by a thin border
- Removed the full-width "Done" button — Done is now the pill in the sticky header

**Block canvas**
- `.rec-canvas.studio-block-canvas{padding:0 20px}` — gives blocks proper left/right margin inside the record body
- Paragraph `line-height` increased to 1.78 for slightly more open reading rhythm

### Studio Command Center — Spacing Polish

The Command Center now breathes. All changes are additive CSS overrides (no structure changes):

| Property | Before | After |
|---|---|---|
| `.studio-command-home` gap | 16px | 22px |
| `.studio-section-head` padding-bottom | 0 | 6px |
| `.studio-home-section` gap | 9px | 11px |
| `.studio-command-top` padding-top | 4px | 8px |
| `.studio-pulse-card` padding | 21px | 24px |
| `.studio-pulse-copy` margin-top | 8px | 10px |
| `.studio-pulse-stats` margin-top | 16px | 18px |
| `.studio-card-scroll` padding-bottom | 4px | 6px |
| `.studio-section-title` font-size | 18px | 19px |

## New Functions

### `recordEditorAccent(database)` → `{grad, color}`
Returns a gradient CSS string and accent color CSS variable for the database's cover strip, based on the database title.

### `toggleRecordProps()`
Toggles the `.rec-props-body.hidden` class and the `.rec-props-chevron.collapsed` class. Both classes are defined in CSS. Exported on `window`.

## Data Flow

No data-model changes in Phase 13. All record data (including `blocks[]` from Phase 12) is unchanged. The new layout is purely presentational.

- `data-db-record-title` — title input, handled by the existing `input` event listener
- `data-db-prop-input` — property fields, handled by the existing `input`/`change` event listeners
- `data-db-duplicate-record`, `data-db-new-record`, `data-db-copy-title`, `data-db-archive-record` — action buttons, handled by the existing `click` event listener

## Works In Both Shells

Changes applied identically to:
- `apps/app/index.html` — integrated Parallel app
- `apps/studio/index.html` — standalone Studio dev harness

## Lossless Compliance

- `legacy/` files untouched
- All existing database views (List, Table, Board, Gallery), page editor, shell/dock, persistence, and block engine continue to work unchanged
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced

## What's Next

The Workspace Engine Unification program continues. Future phases should consider:

- **Shared entity model** — unify page and record into a common `WorkspaceEntity` type
- **Record relations** — cross-database relations surfaced in the record properties panel
- **AI block suggestions** — context-aware content suggestions in the block editor
- **Publishing** — make record pages shareable as read-only Studio links
- **Advanced templates** — per-database block templates with variable substitution
