# Phase 10: Database Board View

Phase 10 adds a fully usable Board view to Studio databases without changing the global Parallel shell or removing the existing List/Table views.

## Board View

Database sheets now support three persisted views:

- List
- Table
- Board

Board is stored in the same `database.metadata.viewState.activeView` field used by the earlier List/Table view state. Older saved databases migrate safely because `ensureDatabaseViews()` adds the missing Board view and `boardGroupFieldId` when needed.

## Grouping Logic

Board grouping is schema-driven:

- Prefer a `status` property.
- Prefer a property named `Status`.
- For Meetings, prefer `Sentiment` when available.
- Fall back to other status/stage/sentiment-like select or text fields.
- Use a checkbox property if no status/select-like field exists.
- If no groupable property exists, use safe local board lanes: Not Started, In Progress, Done.

The selected grouping field is saved per database in `database.metadata.viewState.boardGroupFieldId`.

## Columns And Cards

Each column shows:

- column label
- record count
- a subtle Parallel accent
- an empty lane state
- a New card action

The polish pass adds a compact board context bar, clearer “Grouped by …” hierarchy, stronger mobile column sizing, focus states, and more tactile card/column motion so the view feels like Parallel rather than a generic kanban surface.

Each card shows:

- record icon
- record title
- last edited metadata
- key properties based on the database type
- a Move to action

Cards open the full Phase 9 record page, so title edits, property edits, duplicate, archive, body notes, and create-another behavior remain shared across all views.

## Move Workflow

Phase 10 intentionally uses a polished “Move to…” action instead of drag-and-drop. This is safer across mobile and desktop and avoids fragile touch interactions.

The move panel highlights the card’s current lane before moving, remains dock-aware inside the database sheet, and persists the lane update immediately.

Moving a card updates the grouped property immediately:

- status/select/text grouping stores the selected lane value in the record property.
- checkbox grouping stores `true` or `false`.
- fallback grouping stores `record.metadata.boardGroup`.

The update persists to localStorage immediately and re-renders the board.

## New Card In Column

Each column can create a new record directly in that lane. The new record:

- receives the database-specific Phase 9 record template.
- receives the grouped property value for that column.
- opens the full record page immediately.
- persists immediately.

## Search, Filter, Sort

Board respects the existing database controls:

- record search
- simple filter
- sort

Columns remain visible when filters hide their cards, and each empty lane keeps a calm empty state.

## Boundaries

Phase 10 did not add Gallery, Calendar, Timeline, AI, collaboration, backend sync, relation editing, rollup calculation, formula execution, or drag-and-drop. Phase 11 adds Gallery; Calendar and Timeline remain future work.

## Future Work

Recommended next phase after Board: Gallery view or Calendar view, depending on whether the product should prioritize visual creative browsing or schedule-based planning.
