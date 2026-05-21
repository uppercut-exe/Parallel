# components/dock

Reserved for lossless migration from the preserved Parallel source files. Do not delete or simplify existing behavior when moving code into this folder.

## Canonical Order

The global Parallel dock order is:

```text
STUDIO / TASKS / + / HOME / YOU
```

Studio-specific tools should sit above the dock or inside the Studio workspace, not replace this global shell navigation. In the integrated app, `STUDIO` is the first module and switches to the mounted Studio world inside the same shell. `TASKS` still maps to the existing Timeline implementation. The standalone Studio preview keeps the same dock order for comparison and development.

Phase 6 source of truth: `systems/shell/shared-shell.js`.

Use `window.ParallelShell.dockItems` for dock rendering and `window.ParallelShell.createActions` / `actionsForPage()` for contextual plus menu actions. Dock visuals remain owned by the existing app CSS; this shared file only centralizes stable shell metadata and positioning constants.

Phase 8 navigation rule: Studio may render command center cards, workspace drawer, editor tools, database sheets, and record previews above the dock, but it must never render a competing footer, reorder the footer, or create a second shell-level plus button inside the integrated app.
