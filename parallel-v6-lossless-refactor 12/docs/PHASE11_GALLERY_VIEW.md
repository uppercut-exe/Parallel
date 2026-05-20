# Phase 11: Database Gallery View

Phase 11 adds a fully usable Gallery view to Studio databases. It keeps the existing database sheet, global Parallel shell, record pages, List/Table/Board views, filters, sorting, and local persistence intact.

## Gallery View

Database sheets now support four persisted views:

- List
- Table
- Board
- Gallery

Gallery is stored in `database.metadata.viewState.activeView`. Older saved databases migrate safely because `ensureDatabaseViews()` adds the missing Gallery view and a default `galleryStyle` when needed.

## Gallery Cards

Each gallery card shows:

- visual cover
- record icon
- database-specific record personality
- record title
- last edited metadata
- key properties based on the database type

Cards open the full Phase 9 record page, so edits, duplicate, archive, body notes, and create-another behavior stay shared across database views.

## Cover Logic

Gallery cover selection is safe and lightweight:

- Use `record.metadata.coverUrl` when it points to an HTTP(S) or `data:image/` URL.
- Use a URL/file/image-like property when a safe URL is present.
- Otherwise generate a stable cinematic gradient from the database id, record id, title, and database type.

This lets every record feel visual without adding uploads, heavy media handling, or backend storage.

## Gallery Style

Gallery includes a persisted style toggle:

- Editorial
- Compact

The selected style is saved per database in `database.metadata.viewState.galleryStyle`.

## Actions

Gallery supports:

- opening records
- creating a new gallery card
- record title/property/body editing through the shared record page
- duplicate
- archive
- create another
- search
- filter
- sort
- reload persistence

## Boundaries

Phase 11 does not add Calendar view, Timeline view, AI, collaboration, backend sync, relation editing, rollup calculation, formula execution, uploads, or a heavy media library.

## Future Work

Recommended next phase: Calendar view for date-based planning, followed by Timeline once database date fields and record scheduling feel stable.
