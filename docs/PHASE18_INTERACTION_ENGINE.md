# Phase 18: Interaction Engine + Workspace Fluidity

## Summary

Phase 18 transforms Parallel Studio from a powerful workspace system into a **fluid premium operating experience**. Every transition, animation, hover state, and microinteraction has been upgraded to use a unified cinematic motion language. Nothing was redesigned — the same UI, the same structure, the same warm palette — but it now moves the way a native iOS premium app moves.

All changes apply identically to both `apps/app/index.html` and `apps/studio/index.html`.

---

## Part 1 — Motion System

### New CSS Custom Properties

Two new easing tokens and one duration token added to `:root` in both files:

```css
--cinematic: cubic-bezier(0.16, 1, 0.3, 1)   /* smooth decelerate — natural entrances */
--decelerate: cubic-bezier(0, 0, 0.2, 1)       /* pure decelerate — exits and fades */
--dur-2xs: 80ms                                 /* micro-interactions, icon swaps */
```

These sit alongside the existing `--spring`, `--ease`, `--gentle` tokens and extend the duration scale downward with `--dur-2xs`.

### Page Transitions

`.page{}` — upgraded from `var(--ease)` to `var(--cinematic)`, travel distance increased from `translateY(14px)` to `translateY(18px)`, scale tightened to `0.990`, and `will-change: transform, opacity` added for GPU promotion:

```css
/* Before */
transform: translateY(14px) scale(0.992);
transition: opacity var(--dur-md) var(--ease), transform var(--dur-md) var(--ease);

/* After */
transform: translateY(18px) scale(0.990);
transition: opacity var(--dur-md) var(--cinematic), transform var(--dur-md) var(--cinematic);
will-change: transform, opacity;
```

### Sub-page Transitions

`.sub{}` — direction changed from horizontal (`translateX(28px)`) to vertical (`translateY(20px)`) for a more native iOS emerge feel. Easing upgraded from the hardcoded `cubic-bezier(0.34,1.1,0.64,1)` spring to `var(--cinematic)`. `will-change` added. Open-state identity transform updated to match:

```css
/* Before */
transform: translateX(28px) scale(0.968);
.sub.open { transform: translateX(0) scale(1); }

/* After */
transform: translateY(20px) scale(0.972);
.sub.open { transform: translateY(0) scale(1); }
```

### JS Fix — `studioShowSub`

The previous implementation set `opacity` and `transform` as inline `!important` styles immediately after adding the `.open` class, which bypassed the CSS transition entirely. Fixed by removing those two inline overrides so the CSS transition fires naturally:

```js
/* Before — transitions were bypassed */
el.classList.add('open');
el.style.setProperty('opacity', '1', 'important');       // ← blocked transition
el.style.setProperty('transform', 'translateX(0) scale(1)', 'important'); // ← blocked transition

/* After — transitions fire correctly */
el.style.removeProperty('opacity');
el.style.removeProperty('transform');
el.classList.add('open');
el.style.setProperty('pointer-events', 'all', 'important'); // kept for immediate interactivity
```

---

## Part 2 — Sheet + Modal Fluidity

All floating sheets and overlays upgraded to `var(--cinematic)` easing with deeper resting offsets:

| Element | Before | After |
|---|---|---|
| `.create-sheet` | `cubic-bezier(0.34,1.2,0.64,1)` | `var(--cinematic)` |
| `.page-action-sheet` | `translateY(8px) scale(.98)` · `var(--spring)` | `translateY(12px) scale(.976)` · `var(--cinematic)` |
| `.database-action-sheet` | `translateY(10px) scale(.98)` · `var(--spring)` | `translateY(14px) scale(.974)` · `var(--cinematic)` |
| `.floating-block-menu` etc. | `translateY(8px) scale(0.98)` · `var(--spring)` | `translateY(10px) scale(0.976)` · `var(--cinematic)` |
| `.relation-picker-sheet` | `.32s var(--spring)` | `var(--dur-md) var(--cinematic)` |

---

## Part 3 — Block Animation Upgrade

`blockBloom` and `blockGlide` keyframes upgraded to `var(--cinematic)` with more expressive travel:

```css
/* Before */
.block.is-new { animation: blockBloom .42s var(--spring); }
@keyframes blockBloom {
  from { opacity: 0; transform: translateY(8px) scale(0.992); }
}

/* After */
.block.is-new { animation: blockBloom .46s var(--cinematic); }
@keyframes blockBloom {
  from { opacity: 0; transform: translateY(12px) scale(0.988); }
}
```

```css
/* Before */
.block.is-moved { animation: blockGlide .36s var(--spring); }
@keyframes blockGlide { from { transform: translateY(7px); } }

/* After */
.block.is-moved { animation: blockGlide .38s var(--cinematic); }
@keyframes blockGlide { from { transform: translateY(10px); } }
```

---

## Part 4 — Writing Rhythm

Block typography gains breathing room:

```css
.block-p   { line-height: 1.78; padding: 4px 0; }   /* was 1.72 / 3px */
.block-h1  { padding: 12px 0 5px; line-height: 1.22; } /* was 10px / 1.25 */
.block-h2  { padding: 10px 0 4px; line-height: 1.28; } /* was 8px / 1.3 */
.block-h3  { padding: 8px 0 3px;  line-height: 1.33; } /* was 7px / 1.35 */
.block     { margin: 4px 0; }                          /* was 3px */
```

---

## Part 5 — Focus Mode

When a block is active, the canvas enters focus mode — non-active blocks dim to draw attention to the editing surface:

```css
.blocks-focused .block { opacity: 0.52; transition: opacity var(--dur-sm) var(--cinematic); }
.blocks-focused .block.is-active { opacity: 1; }
```

Toggled in `renderStudioBlocks` in both files:

```js
canvas.classList.toggle('blocks-focused', !!activeBlockId);
```

A drag handle affordance is also defined (`.block-drag-handle`) — visible on hover at 50% opacity, `cursor: grab`, ready for a future drag-to-reorder implementation.

---

## Part 6 — Microinteraction Layer

### Card Hover Elevation

All interactive cards gain consistent lift-and-scale on hover via `var(--cinematic)`:

| Card class | Hover effect |
|---|---|
| `.studio-home-card` | `translateY(-2px) scale(1.008)` + elevated shadow |
| `.tmpl2-card` | `translateY(-2px) scale(1.008)` + elevated shadow |
| `.studio-quick-card` | `translateY(-2px) scale(1.01)` + elevated shadow |
| `.db-record-card` | `translateY(-1px)` + `box-shadow` |
| `.db-gallery-card` | `translateY(-2px)` + `box-shadow` |
| `.db-board-card` | `translateY(-1px)` + `box-shadow` |

### Workspace Surface Hover

Upcoming, Needs Attention, and Related Work rows slide subtly right on hover:

```css
.ws-upcoming-item:hover { background: rgba(255,255,255,.82); transform: translateX(2px); }
.ws-needs-item:hover    { background: rgba(255,255,255,.82); transform: translateX(2px); }
.rec-related-row:hover  { background: rgba(255,255,255,.72); transform: translateX(2px); }
```

### Database Controls

- `.db-action-btn:hover` — lifts background to `.92` opacity and adds shadow
- `.db-sheet-close:hover` — darkens background, `:active` scales to `0.88`
- `.db-view-tab` — transition upgraded to `var(--cinematic)` for all four properties

### View Content Fade

A `@keyframes viewFadeUp` animation fires when a view container mounts — giving each view switch a subtle `translateY(8px) → 0` + fade entrance:

```css
@keyframes viewFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.db-list, .db-table-wrap, .db-board-wrap, .db-gallery-wrap,
.db-grouped-list, .db-calendar-wrap, .db-timeline-wrap {
  animation: viewFadeUp var(--dur-md) var(--cinematic);
}
```

### Input Focus Rings

`.db-search`, `.relation-picker-search`, and `.inp-field` gain a sage-tinted `2.5px` focus ring:

```css
.db-search:focus {
  box-shadow: 0 0 0 2.5px rgba(107,143,113,.28), inset 0 1px 3px rgba(0,0,0,.04);
  border-color: rgba(107,143,113,.36);
}
```

### Relation Picker Row

`.relation-picker-row:hover` slides `translateX(2px)` matching the workspace surface pattern.

### Workspace Drawer

`.workspace-drawer` transition upgraded to `var(--cinematic)`.

---

## Part 7 — Reduced Motion

A comprehensive `@media(prefers-reduced-motion:reduce)` override collapses all animation and transition durations to `0.01ms` and disables block entry animations:

```css
@media(prefers-reduced-motion:reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  .block.is-new, .block.is-moved { animation: none; }
}
```

---

## New CSS Classes

```css
/* Drag handle */
.block-drag-handle

/* Focus mode */
.blocks-focused  (applied to canvas element)
```

All other Phase 18 styles are augmentations of existing classes — no new HTML structure required.

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced
- Dock order unchanged: Studio / Tasks / + / Home / You

---

## What's Next

- **Drag-to-reorder blocks** — the `.block-drag-handle` affordance is defined; wire up drag events
- **Spring physics on board cards** — stagger entrance when board view opens
- **Haptic-style press feedback** — coordinate with native wrapper for taptic engine calls
- **Skeleton loading states** — shimmer placeholders while databases hydrate
- **View transition API** — upgrade page switches to use the native View Transitions API when supported
