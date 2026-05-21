# Phase 19: Onboarding + Product Readiness

## Summary

Phase 19 transforms Parallel from a powerful-but-opaque system into a **welcoming, self-explanatory, emotionally guided workspace**. New users are greeted by a cinematic 3-step onboarding flow that sets their workspace mode and name. Every empty state across all six database views is now a premium, calm, and helpful moment. A personalized Getting Started card appears after first-run and guides users toward their first meaningful actions — then quietly disappears when dismissed.

All changes apply identically to both `apps/app/index.html` and `apps/studio/index.html`. No existing systems were modified, removed, or destabilized.

---

## Part 1 — First-Run Experience

### Onboarding Overlay

A fullscreen onboarding overlay (`position:absolute;inset:0;z-index:9000`) sits as the last child of the `.screen` div in both files. It appears only when `localStorage.getItem('px_v19_setup')` is not set — meaning it fires once per device, on the first visit.

**Detection logic:**
```js
const PX_ONBOARD_KEY = 'px_v19_setup';

function initOnboarding() {
  if (localStorage.getItem(PX_ONBOARD_KEY)) return; // already seen
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.getElementById('onboardingOverlay').classList.add('active')
  ));
}
```

The double `requestAnimationFrame` ensures the initial page render completes before the overlay fades in — preventing a flash during load.

### Onboarding Steps

Three steps, each with `animation:onboardStepIn var(--dur-md) var(--cinematic)` on activation:

**Step 1 — Welcome**
- Sparkles mark with sage gradient
- Headline: "A workspace for the way you think."
- Subtext: "Calm by design. Powerful when you need it. Personal always."
- CTA: "Begin" → advances to step 2

**Step 2 — Workspace Mode**
- Four mode tiles in a 2×2 grid:
  - **Agency** — client projects, teams & creative delivery
  - **Creator** — content, audience & publishing flow
  - **Product** — features, sprints & team delivery
  - **Personal OS** — life, goals, habits & thinking space
- Mode selection: `onboardSelectMode(el)` adds `.selected` class + sets `_obMode`
- CTA: "Continue" → advances to step 3

**Step 3 — Name**
- User mark with sage gradient
- Single name input: `autocomplete="given-name"`, max 32 chars
- Auto-focuses 240ms after step activation
- CTA: "Open my workspace" + ghost "Skip for now"

### Completion

`finishOnboarding()`:
1. Reads the name input (if filled)
2. Writes `px_v19_setup = 'complete'` to localStorage
3. Writes `px_v19_name = name` (if provided)
4. Writes `px_v19_mode = mode` (if selected)
5. Fades out the overlay (680ms)
6. Calls `renderStudioCommandCenter()` to refresh with personalized data

### Navigation Functions

Exposed to `window`:
- `onboardStep(n)` — switches to step n
- `onboardSelectMode(el)` — marks mode tile as selected
- `finishOnboarding()` — completes onboarding
- `dismissGettingStarted()` — dismisses the Getting Started card

---

## Part 2 — Personalized Command Center

The Studio Pulse now uses the onboarded user's name:

```js
const userName = localStorage.getItem('px_v19_name') || 'Amara';
// Pulse focus line:
`${userName}'s workspace is holding ${topProjectName} in focus.`
```

After onboarding, the greeting updates from "Amara Studio is holding…" to e.g. "Dan's workspace is holding Lumena Brand Identity in focus."

---

## Part 3 — Getting Started Card

A warm, dismissible card that appears on the Command Center after first-run completion. Shown when:
- `px_v19_setup` is set (onboarding complete)
- `px_v19_gs_dismissed` is NOT set

The card shows 4 contextual step suggestions based on the user's chosen mode:

| Mode | Steps shown |
|---|---|
| Agency | Open Projects · Add client · Log meeting · Link project to client |
| Creator | Content Calendar · Add idea · Write page · Try template |
| Product | Board view · Sprint Plan · Timeline · Linked database block |
| Personal | Set goal · Daily reflection · Plan on Calendar · Use template |
| (default) | Explore databases · Write page · Board view · Connect databases |

Each step row has a hover animation (`translateX(2px)`) matching the workspace surface pattern from Phase 18.

**Dismissal:**
```js
function dismissGettingStarted() {
  localStorage.setItem('px_v19_gs_dismissed', '1');
  document.getElementById('gettingStartedCard')?.remove();
}
```

Removing the DOM element directly gives instant feedback; the localStorage flag prevents it returning on next render.

---

## Part 4 — Empty State System

All six database views and the grouped list view now use the `.db-empty-rich` component system instead of the plain `.db-empty` text. Every empty state has:

1. **Icon** — `.db-empty-ico` — a soft glass card with a contextual Tabler icon
2. **Heading** — `.db-empty-h` — short, honest, human
3. **Sub** — `.db-empty-sub` — calm one-line explanation
4. **Action button** — `.db-empty-act` — sage-colored, hover-lifts, creates a new record

### Empty States by View

| View | Icon | Heading | Sub |
|---|---|---|---|
| List | `ti-list-details` | Nothing here yet | No records match this view. Clear the filters or create the first one. |
| Table | `ti-table` | Empty table | No records match the current filters. Try clearing them or add a new row. |
| Board | `ti-layout-kanban` | Board is empty | Add a card to any column and Studio will keep it in place. |
| Gallery | `ti-photo` | (context-aware) | Every record becomes a visual card with a generated cover. |
| Calendar | `ti-calendar-off` | Nothing scheduled this month | Records with date fields will appear here as calendar pills. |
| Timeline | `ti-chart-gantt` | Nothing to plan yet | Add records with date fields and they'll flow into the timeline. |
| Timeline (no months) | `ti-chart-gantt` | Nothing to show yet | Records with date fields will appear here grouped by month. |
| Grouped List | `ti-layout-list` | No groups to show | No records match this view. Try adjusting filters or create a new record. |
| Grouped List (no sections) | `ti-layout-list` | Nothing grouped here yet | Records will appear in groups once they have the selected field filled in. |

---

## Part 5 — New CSS Classes

### Onboarding
```css
.onboarding-overlay          /* full-screen overlay, absolute inset */
.onboarding-step             /* display:none; .active → display:flex + animation */
.onboarding-ambient          /* radial gradient ambient decoration */
.onboarding-mark             /* icon container — glass card */
.onboarding-pre              /* section label, uppercase, letter-spaced */
.onboarding-h                /* large serif headline */
.onboarding-sub              /* calm descriptive paragraph */
.onboarding-dots             /* step indicator pills */
.onboarding-dot              /* individual dot — expands to 18px when .active */
.onboarding-modes            /* 2×2 grid of workspace mode tiles */
.onboarding-mode             /* individual mode tile — hover lift + selected border */
.onboarding-mode.mode-agency/.mode-creator/.mode-product/.mode-personal
.onboarding-mode-ico         /* tone-colored icon container */
.onboarding-mode-name        /* mode label */
.onboarding-mode-desc        /* mode description */
.onboarding-name-field       /* text input, full-width, sage focus ring */
.onboarding-btn              /* sage CTA button with shadow elevation */
.onboarding-btn-ghost        /* text ghost skip button */
@keyframes onboardStepIn     /* from translateY(14px) opacity:0 */
```

### Rich Empty States
```css
.db-empty-rich               /* centered flex column */
.db-empty-ico                /* glass card icon container */
.db-empty-h                  /* heading — medium weight */
.db-empty-sub                /* description text */
.db-empty-act                /* sage create button */
```

### Getting Started Card
```css
.getting-started-card        /* glass card with sage gradient */
.getting-started-head        /* flex row with icon + text + close */
.getting-started-ico         /* sage icon container */
.getting-started-lbl         /* card title */
.getting-started-sub         /* card sub */
.getting-started-close       /* dismiss button */
.getting-started-steps       /* column of step rows */
.gs-step                     /* individual step row — hover slide right */
.gs-step-ico                 /* sage step icon */
.gs-step-lbl                 /* step label */
```

### Contextual Tips (scaffolded for future use)
```css
.workspace-tip               /* sage-tinted tip row */
.workspace-tip-ico           /* sage icon */
.workspace-tip-text          /* tip copy */
```

---

## Data Flow

### First-run detection
```
App loads
  → initOnboarding()
    → checks localStorage.getItem('px_v19_setup')
    → if null: shows overlay after double rAF
    → if set: does nothing
```

### Onboarding completion
```
User taps "Open my workspace"
  → finishOnboarding()
    → writes px_v19_setup, px_v19_name, px_v19_mode
    → fades out overlay (680ms)
    → renderStudioCommandCenter()
      → reads px_v19_name for personalized greeting
      → calls studioGettingStartedCard()
        → reads px_v19_mode for contextual steps
        → returns card HTML (or '' if dismissed)
```

### Empty state flow
```
renderDbList/Table/Board/Gallery/Calendar/Timeline(database, records)
  → if records.length === 0
    → return richEmptyState HTML (icon + heading + sub + action)
  → else → normal view render
```

---

## localStorage Keys

| Key | Value | Purpose |
|---|---|---|
| `px_v19_setup` | `'complete'` | First-run flag — prevents repeat onboarding |
| `px_v19_name` | User's name string | Personalized greeting throughout |
| `px_v19_mode` | `'agency'` / `'creator'` / `'product'` / `'personal'` | Getting Started card content |
| `px_v19_gs_dismissed` | `'1'` | Prevents Getting Started card from reappearing |

All keys use `px_v19_` prefix to avoid conflicts with existing studio/database storage.

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second shell, no second dock, no second footer
- Dock order unchanged: Studio / Tasks / + / Home / You
- All existing views, editors, databases, and Phase 18 interactions unchanged
