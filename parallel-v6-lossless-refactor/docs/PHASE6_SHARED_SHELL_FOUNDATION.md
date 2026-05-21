# Phase 6: Shared Shell Foundation

Phase 6 is a lossless architecture cleanup pass, not a feature phase.

## Extracted

- Shared global dock metadata in `systems/shell/shared-shell.js`.
- Shared contextual create menu metadata for Home, Tasks, Studio, You, and preserved Focus entry points.
- Shared shell constants for Studio storage keys, overlay spacing, and z-index values.
- Shared dock-aware overlay clamp helper used by the Studio overlay wrappers in both runnable entries.

The canonical dock order remains:

```text
STUDIO / TASKS / + / HOME / YOU
```

Phase 7A updates this order so Studio replaces Journal as the first-class creative module.

## Consuming Entries

- `apps/app/index.html` uses the shared metadata for the integrated Parallel shell dock, contextual plus menu, Studio storage constants, and dock-aware overlay positioning.
- `apps/studio/index.html` uses the same shared metadata while remaining a standalone Studio preview/dev harness.

## Intentionally Not Extracted

These remain local and duplicated for safety:

- Studio block editor engine
- page tree model and drawer rendering
- local persistence hydration and migration logic
- database registry and database block rendering
- editor rendering
- full app routing/module architecture

They should be extracted later only after database views and module routing are stable enough to verify without losing Studio behavior.

## Standalone Studio

`apps/studio/index.html` still exists as a standalone preview, development harness, and comparison surface. `legacy/parallel-studio.html` remains the untouched preserved source archive.

## Next Extraction Rule

Future shared shell work should consume `window.ParallelShell.dockItems`, `actionsForPage()`, and `overlayTop()` rather than hardcoding dock order, create actions, or footer-aware overlay math.
