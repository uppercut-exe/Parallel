# Phase 1 Studio Block Engine

This package includes the Phase 1 block editor foundation in `apps/studio/index.html`.

The legacy source remains preserved in `legacy/parallel-studio.html`, so the lossless archive history is still available while the runnable Studio entrypoint carries the new editor foundation.

## Added

- Data-backed Studio blocks with ids, type, content, children, checked state, metadata, and timestamps.
- Rendering for paragraph, h1, h2, h3, todo, quote, callout, divider, code, image placeholder, toggle, bullet list, and numbered list blocks.
- Slash command insertion menu.
- Floating block action menu.
- Add, duplicate, transform, move up, move down, delete, todo toggle, and toggle collapse foundations.
- Mobile-friendly glass menu styling that preserves the Parallel visual identity.

## Manual Test

1. Run `npm install` and `npm run dev`.
2. Open the integrated Parallel app, then enter Studio from the dock. The standalone Studio preview remains available by dev path when isolated testing is needed.
3. Open Brand Brief from the project docs.
4. Type `/todo` in a block and press Enter.
5. Use the block action dots to duplicate, transform, move, and delete a block.
6. Toggle todo checkboxes and confirm project navigation, templates, canvas, dock, and command palette still work.
