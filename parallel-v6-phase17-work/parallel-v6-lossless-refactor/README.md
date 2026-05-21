# Parallel V6 Lossless Refactor

This package is intentionally **lossless**.

The original uploaded files are preserved byte-for-byte in the `legacy/` folder:

- `legacy/parallel-app-v5.html`
- `legacy/parallel-studio.html`

`index.html` now opens the integrated Parallel product experience directly. `apps/app/index.html` mounts Studio as a real module inside the same global phone shell, dock, plus button, status bar, background atmosphere, and navigation rhythm used by Tasks, Home, and You.

`apps/studio/index.html` remains as a standalone Studio preview and development harness with the Studio Block Engine, interaction polish, page tree, persistence, database core, and shell-alignment work applied, so it is no longer byte-for-byte identical to the uploaded Studio source.

## Run

```bash
npm install
npm run dev
```

Then open the root URL. It redirects directly into the integrated Parallel app. The standalone Studio preview remains available only as a development harness at `apps/studio/index.html`.

## What changed

This refactor does **not** simplify, redesign, or trim the product. It adds a professional architecture around the existing source:

- global styles folder
- components folder
- modules folder
- systems folder
- services folder
- data folder
- docs folder
- checksum verification script

## Current Studio Update

`apps/app/index.html` now includes Studio as a mounted Parallel module. Tapping `STUDIO` in the global dock switches into the Studio world without leaving the main app shell or creating a second footer, status bar, or plus button.

`apps/studio/index.html` still includes the Studio Block Engine foundation plus the polished slash menu, transform sheet, mobile editing toolbar, page tree, workspace drawer, local persistence, search/archive restore, database core, and Phase 4.5 shell alignment as a standalone preview/dev harness.

The canonical global dock order is:

```text
STUDIO / TASKS / + / HOME / YOU
```

That order is applied to both runnable shell entries. Studio replaces Journal as the primary creative module and sits first in the dock. In the integrated main app, `TASKS` safely maps to the existing Timeline surface and `STUDIO` opens the mounted Studio module in place. Focus is preserved through its existing entry points and logic, but it is not a dock slot in this shell map. Studio keeps its internal workspace drawer, page tree, editor toolbar, slash menu, database block, and archive/search/restore flows as module-level tools above or inside the global shell.

## Studio Phase History

- Phase 1: Block Engine. Data-backed blocks, block rendering, slash insertion, block actions, and move up/down foundation.
- Phase 2: Slash Toolbar. Premium grouped slash menu, mobile editing toolbar, transform sheet, keyboard navigation, and motion polish.
- Phase 3: Page Tree Drawer. Studio page hierarchy, workspace drawer, page actions, breadcrumbs, editable title, and empty states.
- Phase 3.5: Persistence/Search/Archive. Versioned localStorage, page search, archive restore, safer active page and block persistence.
- Phase 4: Database Core. Database, property, record, registry, persistence, database block preview, create database, and new record foundations.
- Phase 4.5: Shell Alignment. Shared dock order, contextual global create menu, launcher wording, and documentation clarity. This is not full app-module integration.
- Phase 5: Studio Module Mount. Studio is mounted inside `apps/app/index.html` under the global Parallel shell while `apps/studio/index.html` remains a standalone preview/dev harness.
- Phase 6: Shared Shell Foundation. Stable shell metadata now lives in `systems/shell/shared-shell.js`: dock order, contextual create actions, storage constants, z-index/overlay constants, and the dock-aware overlay clamp helper used by both runnable entries.
- Phase 7A: Database List + Table Views. The public root opens Parallel directly, Studio moves to the first dock slot, and Studio databases gain premium List/Table views, filters, sorting, record preview/editing, and persisted view state.
- Phase 8: Studio Command Center. Studio home is reorganized into a usable command center with Studio Pulse, Continue Working, Quick Create, Projects, Databases, Documents, Templates, and command search while preserving the single global footer. The polished pass adds clearer item types, project progress, calmer empty/search states, and more tactile command-center cards.
- Phase 9: Record Pages + Saved Views. Database records now open as fuller Studio object pages with context-aware property panels, editable title/properties/body notes, record templates, duplicate/archive actions, and persisted per-database view state.
- Phase 10: Database Board View. Studio databases now support a fully usable mobile-first Board view alongside List and Table, with schema-driven grouping, premium columns/cards, safe move-to workflow, new card in column, and persisted board view state.
- Phase 11: Database Gallery View. Studio databases now support a polished visual Gallery view with cinematic generated covers, media URL fallback, Editorial/Compact density, new gallery cards, and full record-page integration.
- Phase 12: Record Block Editor. Database records open as full Studio block-editor pages — the same block engine, slash menu, mobile toolbar, and 14 block types used in the page editor. Records store a `blocks[]` array. Template blocks auto-populate on first open.
- Phase 13: Workspace Engine Unification — Record UX + Studio Polish. Records now feel like true first-class workspace documents: cinematic database-colored cover strip, large serif title at the top of the page, collapsible properties panel, and actions moved to a natural bottom row. Studio Command Center gains 22px section gaps, 24px pulse card padding, improved section-title breathing room, and tighter rhythm throughout.
- Phase 14: Templates 2.0 + Record/Page Polish. Record templates upgraded to rich structured workspace starters with callout openers, writing prompts, and granular task items for all four database types. Page template library grows to 7 types — adding Client Brief, Content Calendar, and Sprint Plan with full block structures. Command Center Templates section gets a premium new card component (`studioTemplateCard`) with section-preview chips showing the actual document structure. Record editor receives refined spacing and breathing room.
- Phase 15: Calendar + Timeline Workspace System. Two fully functional time-based database views — Calendar and Timeline — added to the existing 4-view switcher, bringing the total to 6 views. Calendar renders a monthly grid with database-type-colored record pills, today highlighting, and prev/next/today month navigation. Timeline groups records chronologically by month with progress bars for date-ranged records. Intelligent date field detection (`calendarDateFieldFor`) falls back gracefully through due/start/date/createdAt. Studio polish pass adds section grouping backgrounds, tightens database sheet spacing, and refines the quick-create grid.
- Phase 16: Advanced Database Engine + Spatial Rhythm Refinement. Four relational workspace features added: Relations (cross-database linked record pills with a searchable picker sheet), Rollups (aggregated values from linked records — count/sum/avg/min/max/percent), Formulas (computed field values — concat/sum/days_remaining), and Grouped List View (accordion-style groups by any status/select field with collapsible sections and a group-by selector). Seed databases gain relation fields: Projects→Clients, Meetings→Projects. Spatial rhythm normalization pass aligns card radius (20px), shadow, and padding across all Studio sections using the Templates section as the reference standard.
- Phase 17: Workspace Intelligence + Linked Workspace Experience. Studio becomes contextual and alive: workspace health functions (`workspaceUpcoming`, `workspaceOverdue`, `workspaceStale`, `workspaceNeedsAttention`) scan all databases and surface due-date and stale signals. Two new Command Center sections — Upcoming and Needs Attention — appear conditionally with color-coded urgency cards. Studio Pulse ribbon shows live overdue/upcoming counts. Record health badges appear inline on list-view cards. Related Work panel in record pages shows linked records across all relation fields with health badges. New `linked-database` block type (15th block type) embeds a compact database view — with inline record rows and health indicators — directly inside any page or record. Database block upgraded to show inline record previews with health badges.

See `docs/PHASE1_BLOCK_ENGINE.md`, `docs/PHASE2_SLASH_TOOLBAR.md`, `docs/PHASE3_PAGE_TREE_DRAWER.md`, `docs/PHASE3_5_PERSISTENCE_SEARCH_ARCHIVE.md`, `docs/PHASE4_DATABASE_CORE.md`, `docs/PHASE4_5_SHELL_ALIGNMENT.md`, `docs/PHASE5_STUDIO_MODULE_MOUNT.md`, `docs/PHASE6_SHARED_SHELL_FOUNDATION.md`, `docs/PHASE7A_DATABASE_LIST_TABLE.md`, `docs/PHASE8_STUDIO_COMMAND_CENTER.md`, `docs/PHASE9_RECORD_PAGES_SAVED_VIEWS.md`, `docs/PHASE10_BOARD_VIEW.md`, `docs/PHASE11_GALLERY_VIEW.md`, `docs/PHASE12_RECORD_BLOCK_EDITOR.md`, `docs/PHASE13_WORKSPACE_ENGINE_UNIFICATION.md`, `docs/PHASE14_TEMPLATES2.md`, `docs/PHASE15_CALENDAR_TIMELINE.md`, `docs/PHASE16_ADVANCED_DATABASE.md`, and `docs/PHASE17_WORKSPACE_INTELLIGENCE.md`.

## Verify that nothing was removed

```bash
npm run verify:lossless
```

The verification script compares only the preserved legacy files against the recorded checksums in `docs/source-checksums.json`.

## Migration rule

Future refactors should move code gradually from the preserved originals into modular files only after confirming that the original behavior and UI are still intact.
