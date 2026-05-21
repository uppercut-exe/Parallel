# Phase 7A: Database List + Table Views

Phase 7A is a lossless product-entry and database-view pass.

## Public Entry

The root `index.html` now opens the integrated Parallel app directly. Users are no longer asked to choose between Parallel and Studio Preview.

- Public product entry: `apps/app/index.html`
- Standalone Studio development harness: `apps/studio/index.html`
- Preserved original Studio source: `legacy/parallel-studio.html`

The Studio preview remains available by path for development and comparison, but it is not a public product choice.

## Studio Navigation

Studio replaces Journal as the primary creative module in the shared shell. The canonical dock order is:

```text
STUDIO / TASKS / + / HOME / YOU
```

The old Journal detail screen remains buried as legacy content inside the main app source, but it is no longer exposed as a primary category/module.

## Database Views

Database blocks now open a premium Studio database sheet with:

- List view
- Table view
- view switcher
- record search
- simple status/select/checkbox filtering
- basic sorting by title, dates, created/updated, and simple select/status fields
- new record action
- record preview sheet
- basic title and simple property editing
- archive record action
- persisted active view, filters, sort, records, and edits

The sheet uses the Phase 6 dock-aware overlay helper so it remains above the global dock in both the integrated app and standalone Studio harness.

## Still Future

Phase 7A does not add board, gallery, calendar, timeline, AI, collaboration, backend sync, formulas, rollups, relation UI, or full spreadsheet editing.

## Phase 7B Direction

Recommended next: deepen database records safely with richer property editing, saved view objects, and record pages before adding board/gallery/calendar views.

