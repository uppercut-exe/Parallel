# Parallel Architecture Direction

Parallel is moving from large prototype files into a scalable product architecture without losing its emotional design language.

## Source of truth

The preserved legacy files remain the current source of truth:

- `legacy/parallel-app-v5.html`
- `legacy/parallel-studio.html`

The public root entry now opens the integrated Parallel app directly. `apps/app/index.html` is the integrated Parallel product experience and mounts Studio as a true module inside the shared phone shell. `apps/studio/index.html` remains a standalone Studio preview/development harness carrying the Studio Block Engine, interaction polish, page tree, persistence, archive/search/restore, database core, database block, and database List/Table/Board/Gallery views while `legacy/parallel-studio.html` remains the untouched source archive.

## Global shell state

The canonical global dock order is:

```text
STUDIO / TASKS / + / HOME / YOU
```

That order should appear anywhere shell UI is shown. Studio replaces Journal as the primary creative module and opens inside the shared app shell. Module-specific tools belong above or inside the active module, not in place of the global dock. Studio therefore keeps its workspace drawer, page tree, editor toolbar, slash menu, and database actions as internal module UI.

Phase 4.5 kept this migration safe by mapping `TASKS` to the existing Timeline implementation in the main app and aligning the Studio preview to the same dock order. Focus remains preserved through existing non-dock entry points until the full shell module map is built.

Phase 5 mounts Studio inside `apps/app/index.html`. The mounted Studio module uses the global dock, plus button, status bar, ambient background, and page transition rhythm. Studio-specific systems remain internal: workspace drawer, page tree, block editor, slash menu, mobile editing toolbar, database block, archive/search/restore, and local persistence.

Phase 6 begins that extraction at the safest shell layer. `systems/shell/shared-shell.js` is now the shared source for dock metadata, contextual create action metadata, shell storage constants, overlay spacing, z-index constants, and the dock-aware overlay clamp helper. Both `apps/app/index.html` and `apps/studio/index.html` consume that file while preserving their existing visual behavior.

Phase 7A updates the public entry and adds the first database view layer. Database blocks now open a premium Studio database sheet with List and Table views, simple search/filter/sort controls, new-record creation, and a record preview/editing foundation. Board and Gallery are added in later phases; calendar, timeline, formulas, relations, AI, collaboration, and backend remain future work.

Phase 8 stabilizes the global navigation ownership rule and reorganizes Studio home into a command center. The shared shell owns the status bar, ambient background, main content slot, global plus button, and global dock. Studio owns only internal workspace surfaces: command center, drawer, pages, editor, database sheets, record preview, slash menu, and mobile editing toolbar. The Studio home now renders from existing page, database, record, recent, and template state instead of acting as a separate app shell.

Phase 9 upgrades database records from compact previews into fuller Studio object pages. Records still live in the lightweight local database registry, but each record can now carry saved body notes in `record.metadata.body`, a `templateType`, duplicated-from metadata, and per-database view state such as active List/Table view, search, filter, sort, and last opened record. This keeps the data shape ready for future record block bodies while avoiding a risky extraction of the Studio block editor or database engine.

Phase 10 adds the first spatial database view: Board. Board uses the existing database sheet, record pages, filters, sort, persistence, and schema model. It groups records by status/select/status-like fields where possible, falls back gracefully, supports new cards in a column, and uses a safe Move to workflow instead of fragile drag-and-drop.

Phase 11 adds Gallery as the first visual/editorial database view. Gallery uses the same database sheet and record-page integration, adds generated cinematic covers with safe media URL fallback, persists an Editorial/Compact style per database, and keeps search/filter/sort behavior shared. Calendar, Timeline, and richer relation/formula behavior remain future phases.

The Phase 6 implementation intentionally leaves Studio block/page/database engines duplicated between the integrated module and standalone harness. Those systems should not be extracted until database views and module routing are stable enough to verify without risking editor, drawer, persistence, or standalone preview behavior.

## Migration strategy

1. Preserve the original files untouched.
2. Extract design tokens into `styles/variables.css` and `styles/motion.css`.
3. Move reusable UI into `components/` one component at a time.
4. Move screen logic into `modules/` one module at a time.
5. Move shared behavior into `systems/`.
6. Keep data and service boundaries ready for backend integration.
7. Verify after each migration that no visual or interaction behavior has been lost.

## Priority modules

- `modules/tasks/`
- `modules/studio/`
- `modules/focus/`
- `components/dock/`
- `systems/navigation/`
- `systems/state/`
- `systems/motion/`

## Visual identity rules

Do not remove the luxury sanctuary feeling. Preserve warm white surfaces, sage/lilac accents, floating glass cards, cinematic gradients, soft shadows, and tactile spring motion.
