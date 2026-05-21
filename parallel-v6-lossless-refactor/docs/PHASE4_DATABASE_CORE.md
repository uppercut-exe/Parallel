# Phase 4 Studio Database Core

Phase 4 adds the local database foundation inside `apps/studio/index.html`.

## Added

- Database model with id, title, icon, description, workspace id, parent page id, schema, record ids, default view, view metadata, timestamps, and metadata.
- Property model with stable property ids, names, types, options, default values, required/hidden flags, order, and metadata.
- Record model with database id, title, icon, property values, page/block references, timestamps, archive flag, and metadata.
- Default Projects, Content Ideas, Clients, and Meetings databases.
- Database registry helpers for retrieving databases and records, creating databases, creating/updating/archiving/duplicating records, and handling missing references.
- Database block type that renders a compact Parallel-style preview card with title, description, record count, default view label, Open database, and New record actions.
- Persistence support for database schemas, views, records, and database block references.

## Boundaries

Phase 4 is database core only. It does not add table, board, gallery, calendar, timeline, chart, relation, rollup, formula, AI, collaboration, backend, or full record-page views.

## Safety Notes

Older Studio storage without database data is merged with default database state. Corrupted database data falls back to defaults without intentionally wiping page, block, drawer, favorite, recent, archive, or active page state.
