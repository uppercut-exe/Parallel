# Phase 3.5 Persistence + Search + Archive Restore

Phase 3.5 stabilizes the Studio page tree, active page, and editor state in `apps/studio/index.html`.

## Added

- Versioned localStorage snapshot for pages, active page id, page documents, drawer groups, expanded page tree nodes, favorites, recents, archived pages, databases, and records.
- Safe fallback and reset path for unreadable local state.
- Drawer search across page title, page type, and metadata/tags.
- Archive section with restore/unarchive behavior.
- Restore fallback to a safe root area when the previous parent is unavailable.

## Boundaries

Phase 3.5 remains local only. It does not add backend sync, collaboration, permissions, or database views.
