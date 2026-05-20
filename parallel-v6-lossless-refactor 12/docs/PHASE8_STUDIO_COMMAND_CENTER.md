# Phase 8: Studio Command Center

Phase 8 is a lossless navigation stabilization and Studio home organization pass.

## Navigation Ownership

Parallel has one global shell and one global footer. The fixed dock order remains:

```text
STUDIO / TASKS / + / HOME / YOU
```

The footer is rendered from `systems/shell/shared-shell.js` in both runnable entries. Studio does not own or replace the global dock, plus button, status bar, or ambient shell. Studio-specific tools sit inside the Studio module or above the dock.

## Studio Home

The Studio home now renders as a mobile-first command center:

- Studio Pulse with workspace focus, active project count, open record count, database count, current project context, and integrated command search.
- Continue Working from recent pages, the latest database, and recent records, with clear page/database/record/project labels.
- Quick Create for New Page, New Project, New Database, New Canvas, and Meeting Note.
- Projects from the Projects database with status, progress, client/timeline metadata, and next-action copy.
- Databases from the database registry, with record count, current view, open, and new-record actions.
- Documents from Studio pages with type/context labels.
- Templates with usable page creation flows, including Project Brief and Meeting Notes.

## Usable Actions

- New Page creates and opens a persisted Studio page.
- New Project creates a project page and, when available, a Projects database record.
- New Database creates a persisted database, inserts a database block, opens the editor, and shows the database sheet.
- Meeting Note creates and opens a persisted meeting page.
- Project Brief and Meeting Notes create and open structured template pages.
- Database cards open the List/Table/Board/Gallery database sheet.
- Record cards open the record preview sheet.
- Command search routes to pages, databases, and records.

## Still Future

Phase 8 does not add board, gallery, calendar, or timeline database views. It does not add AI, collaboration, backend sync, advanced templates, or a shared Studio engine extraction.
