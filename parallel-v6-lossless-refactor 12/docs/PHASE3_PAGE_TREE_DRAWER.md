# Phase 3 Studio Page Tree + Workspace Drawer

This package includes a lightweight in-memory Studio page hierarchy in `apps/studio/index.html`.

## Added

- Page tree records with page ids, title, type, icon, parent/children links, workspace id, favorite/archive state, timestamps, block references, and metadata.
- Mobile-first Studio workspace drawer with search, Favorites, Recent, Workspace Pages, Projects, Databases, Templates, Archive, and Settings.
- Nested page rendering with expand/collapse, open page, favorite, duplicate, archive, create page, create subpage, and rename flows.
- Editor header upgrade with breadcrumbs, page icon, editable title, favorite state, saved/workspace copy, and page actions.
- Premium empty states for favorites, recent pages, empty folders, and archive.

## Notes

The model is intentionally local and lightweight. Persistence, permissions, real databases, drag-and-drop reordering, and collaboration presence should be added in later phases.
