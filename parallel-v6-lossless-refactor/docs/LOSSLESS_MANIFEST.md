# Lossless Manifest

This package was rebuilt to avoid the previous mistake of simplifying the app.

## Preserved files

The uploaded app and studio HTML files are copied directly into `legacy/` and remain the byte-for-byte preserved archive:

- `legacy/parallel-app-v5.html`
- `legacy/parallel-studio.html`

The runnable app entries live under `apps/`. `apps/app/index.html` is now the integrated Parallel product experience with Studio mounted as a true module inside the shared global shell. `apps/studio/index.html` remains a standalone Studio preview/development harness with the Studio Block Engine, interaction polish, page tree, workspace drawer, local persistence, archive/search/restore, database core, and shared Phase 6 shell metadata, so it is intentionally no longer byte-for-byte identical to the preserved Studio source.

The preserved legacy files remain the only byte-for-byte checksum targets. Shell alignment, module mounting, and shared shell extraction must not mutate files under `legacy/`.

## No line removal policy

No line from the `legacy/` source files should be deleted or rewritten. The modular folders and runnable app entries are allowed to evolve when feature work happens, while the legacy files remain available as the lossless reference.

## Extracted references

For easier future migration, the package also includes extracted copies of the original style, script, and body blocks:

- `styles/app.original.css`
- `styles/studio.original.css`
- `systems/interactions/app.original.js`
- `systems/interactions/studio.original.js`
- `modules/home/app.original-body.html`
- `modules/studio/studio.original-body.html`

These are extracted references only. The complete original files remain preserved.
