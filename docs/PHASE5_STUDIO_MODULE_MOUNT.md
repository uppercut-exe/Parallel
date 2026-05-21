# Phase 5 Studio Module Mount

Phase 5 mounts Studio as a true module inside `apps/app/index.html`.

## Product State

Parallel now has one primary product shell:

```text
STUDIO / TASKS / + / HOME / YOU
```

Tapping `STUDIO` in the main app dock switches to the Studio module in place. Phase 7A moves Studio to the first dock slot and removes the public launcher choice, so Studio no longer behaves like a separate product entry from the main app shell.

## What Was Integrated

- Studio home/project surfaces are mounted inside the main app page stack.
- Studio editor, workspace drawer, page tree, slash menu, mobile editing toolbar, transform sheet, archive/search/restore, database core, database block, create database, and new record flows are available inside the main app.
- The global app dock remains single and consistent.
- The global plus button remains single and changes to Studio create actions only when Studio is the active module.
- Studio uses the main app phone shell, status bar, ambient background, bottom dock, and module transition rhythm.

## What Remains Standalone

`apps/studio/index.html` remains intentionally available as a standalone Studio preview and development harness. It is useful for comparison, isolated Studio testing, and safer future migrations.

`legacy/parallel-studio.html` remains the byte-for-byte preserved original source archive.

## Temporary Duplication

Studio CSS, markup, and engine logic are currently duplicated between the integrated app entry and the standalone Studio harness. This is deliberate for Phase 5: mounting Studio safely was prioritized over a risky shared-module extraction.

Phase 6 now extracts only the stable shell foundation into `systems/shell/shared-shell.js`. Studio block, page, persistence, and database engines still remain local until their future view systems are safer to modularize.

## Persistence

The mounted Studio module and standalone Studio preview intentionally share the current Studio localStorage key:

```text
parallel.studio.phase4.v2
```

This keeps page tree state, active page, blocks, favorites, recents, archive state, databases, records, and database blocks continuous between the integrated product experience and the preview harness during the transition.

## Known Boundaries

- `TASKS` still maps to the existing Timeline implementation while the Tasks module migration continues.
- Focus remains preserved through existing entry points, but it is not a global dock item in the canonical Phase 5 shell.
- Studio has been mounted in the app shell, but shared code extraction is still future work.

## Recommended Phase 7

Continue the extraction gradually, starting only where verification is strong:

- Studio block/data model module
- Studio page tree and persistence module
- Studio database registry module
- optional shared overlay controller

Each extraction should keep `legacy/` untouched and continue to pass `node tools/verify-lossless.mjs`.
