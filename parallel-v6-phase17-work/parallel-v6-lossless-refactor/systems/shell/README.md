# systems/shell

Phase 6 shared shell foundation.

`shared-shell.js` is the first safe shared shell layer used by both runnable Parallel entries:

- `apps/app/index.html`, the integrated product experience.
- `apps/studio/index.html`, the standalone Studio preview/dev harness.

It owns only stable shell-level metadata:

- global dock order: `STUDIO / TASKS / + / HOME / YOU`
- module ids and route/page keys
- contextual create menu actions
- Studio storage key constants
- shell z-index and overlay spacing constants
- dock-aware overlay clamp helpers

Phase 8 confirms the global navigation tree:

- Global Shell: status bar, ambient background, main content area, global plus button, and global footer dock.
- Global Footer Dock: Studio, Tasks, +, Home, You.
- Studio Module: command center, workspace drawer, pages, editor, database sheets, record preview, slash menu, and mobile editing toolbar.

It intentionally does not own Studio's block editor, page tree, persistence engine, database registry, drawer rendering, or full routing architecture. Those systems remain duplicated temporarily so the mounted Studio module and standalone harness can keep shipping safely while database views and future module routing settle.
