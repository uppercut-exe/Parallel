# Phase 4.5 Global Shell Alignment

Phase 4.5 was a shell-alignment pass, not full Studio integration into the main app runtime. Phase 5 now builds on that work by mounting Studio inside `apps/app/index.html`.

## Canonical Dock Order

The global Parallel dock order is:

```text
HOME / TASKS / + / STUDIO / YOU
```

This was the recommended product direction for Phase 4.5. Phase 7A supersedes the current product shell with:

```text
STUDIO / TASKS / + / HOME / YOU
```

## What Changed

- Studio no longer uses a different bottom dock order.
- The Studio runnable entry keeps the same global dock order and plus button language as the main app.
- In the main app, `TASKS` preserves the existing Timeline behavior while the product naming migrates.
- In the main app during Phase 4.5, `STUDIO` opened the shell-aligned Studio module preview instead of mounting Studio inline.
- Focus remains preserved through existing focus entry points, quick actions, and focus logic, but is not part of the canonical dock order in this pass.
- The central plus button remains shell-level UI and adapts its menu to the active surface.
- Launcher copy in Phase 4.5 distinguished the main Parallel shell from the shell-aligned Studio module preview instead of presenting two separate products; Phase 5 updates the primary launcher entry to the integrated Parallel experience.
- Documentation now distinguishes Phase 4.5 shell alignment from the later Phase 5 module mount.

## What Remains Studio-Specific

Studio keeps its internal workspace drawer, page tree, editor header, block editor, slash menu, mobile toolbar, transform sheet, database block, database preview, page search, archive restore, and local persistence.

## Temporary Boundary

`apps/app/index.html` and `apps/studio/index.html` are still separate runnable HTML entries, but after Phase 5 they have different purposes: `apps/app/index.html` is the integrated product experience and `apps/studio/index.html` is a standalone Studio preview/dev harness.

## Safe Migration Note

Replacing the main app's Timeline/Focus dock slots directly with brand-new Tasks/Studio modules would be risky in this pass because Timeline and Focus already carry working behavior. Phase 4.5 therefore aligns the visible dock identity while preserving existing behavior:

- `TASKS` uses the existing Timeline page and renderer.
- `STUDIO` navigated to the Studio module preview in Phase 4.5; Phase 5 changes this to an in-place mounted Studio module.
- Focus remains accessible from current focus cards, quick actions, and existing functions.

## Regression Surface

Any future shell work must verify:

- Main app loaded with `HOME / TASKS / + / STUDIO / YOU` during Phase 4.5; current shell verification should use `STUDIO / TASKS / + / HOME / YOU`.
- Studio preview loads with the same dock order.
- Studio editor, slash menu, mobile toolbar, page drawer, persistence, archive/search/restore, database block, create database, and new record actions continue to work.
- Legacy files under `legacy/` remain byte-for-byte preserved.
