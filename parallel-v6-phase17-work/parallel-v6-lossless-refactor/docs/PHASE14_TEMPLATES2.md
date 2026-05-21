# Phase 14: Templates 2.0 + Record/Page Polish

## Summary

Phase 14 upgrades the Studio template system from minimal stubs to rich, structured workspace starters. Record templates now feel like true Notion-style workspace documents — every template type auto-populates with callout openers, writing prompts, granular task items, and meaningful section structure. Page templates grow from 4 to 7 types with full structured block content. The Studio Command Center Templates section gets a premium new card component with section preview chips. Phase 14 also applies a refined spacing polish pass to the record editor layout.

## What Changed

### Record Templates — Rich Structured Block Content

`recordTemplateBlocks(database)` now returns deeply structured block arrays for each database type.

**Projects**
- Callout opener: frames the project with intent
- Overview, Goals (3 todos: outcome, audience, constraints)
- Timeline (3 todos: kick-off, review gate, completion)
- Next Actions (2 todos), Notes

**Meetings**
- Callout opener: capture what matters
- Agenda (2 todos), Notes (with writing prompt)
- Decisions (2 todos), Action Items (2 todos with owner/date format)
- Follow-up (writing prompt)

**Content**
- Callout opener: hook before writing
- Hook, Angle (both with writing prompts)
- Outline (3 todos: opening/middle/close)
- Visual Direction, Draft, Publishing Notes (3 todos: platform/assets/scheduled)

**Clients**
- Callout opener: calm client profile
- About, Contact Notes (both with writing prompts)
- Current Work (2 todos), Deliverables (2 todos with format/date)
- Follow-ups (2 todos)

**Default**
- Callout opener, Notes, Next Actions (2 todos)

### Page Templates — 7 Types with Full Block Structure

`studioTemplateBlocks(kind, title)` upgraded and expanded:

| Kind | New? | Key Sections |
|---|---|---|
| `projectBrief` | Upgraded | Overview, Goals, Timeline, References, Open Questions |
| `meeting` | Upgraded | Agenda, Notes, Decisions, Action Items, Follow-up |
| `doc` | Upgraded | Context, Key Points, Next Steps |
| `brand` | Upgraded | Principles, Voice & Tone, Visual Language, References |
| `clientBrief` | **New** | About Client, Engagement, Contact Notes, Deliverables, Open Questions, Follow-ups |
| `contentCalendar` | **New** | Monthly Themes, Upcoming Posts, In Production, Review & Learning, Evergreen Ideas |
| `sprintPlan` | **New** | Sprint Goal, Committed Work, Scope Risks, Definition of Done, Retrospective |

### Template Card Component — `studioTemplateCard()`

New rendering function replacing `studioItemCard` for the Templates section:

```js
studioTemplateCard({title, desc, icon, tone, action, sections: []})
```

Renders a `.tmpl2-card` with:
- Colored icon badge (`.tmpl2-ico`)
- Title + "Template · Creates a real page" label
- Description paragraph (`.tmpl2-desc`)
- Section preview chips (`.tmpl2-section`) showing the actual document sections

### Templates Section — 6 Cards

Command Center Templates section now shows 6 templates (up from 4) using the new card component:

1. **Project Brief** — lilac — Overview, Goals, Timeline, References, Open Questions
2. **Client Brief** — sage — About, Engagement, Deliverables, Follow-ups
3. **Meeting Notes** — peach — Agenda, Decisions, Action Items, Follow-up
4. **Content Calendar** — sky — Themes, Upcoming, In Production, Review
5. **Sprint Plan** — sage — Goal, Committed Work, Risks, Definition of Done
6. **Brand System** — lilac — Principles, Voice & Tone, Visual Language, References

### New Template Actions in `runStudioHomeAction()`

| Action | Template Kind | Title |
|---|---|---|
| `template-client-brief` | `clientBrief` | Client Brief |
| `template-content-calendar` | `contentCalendar` | Content Calendar |
| `template-sprint-plan` | `sprintPlan` | Sprint Plan |

The existing `template-client` action now also uses `clientBrief` (was `projectBrief`).

### Record Editor — Phase 14 Spacing Refinements

Additive CSS overrides:

| Property | Change |
|---|---|
| `.rec-page-cover` height | 92px → 96px |
| `.rec-title-input` font-size | 27px → 28px |
| `.rec-title-input` letter-spacing | −0.025em → −0.028em |
| `.rec-title-section` padding | 0 16px → 0 18px 2px |
| `.rec-byline` margin-top | 2px → 3px |
| `.rec-props-section` margin-top | 0px → 12px |
| `.rec-props-toggle` padding | 10px 14px → 11px 14px |
| `.rec-page-actions` padding | 14px 16px 2px → 16px 16px 4px |

### Quick-Create Grid Refinement

`.studio-quick-card` gets `flex:1 1 calc(33.33% - 6px)` so the 5-card grid wraps naturally at 3+2 without overflow.

## New CSS Classes

```css
.tmpl2-card          — glass card container with spring press animation
.tmpl2-head          — flex row: icon + info
.tmpl2-ico           — 40×40 rounded icon badge
.tmpl2-info          — title + label column
.tmpl2-title         — 14px semibold card title
.tmpl2-label         — 11px muted type label
.tmpl2-desc          — 12.5px description paragraph
.tmpl2-preview       — flex-wrap container for section chips
.tmpl2-section       — pill chip for a template section name
```

## Data Flow

No data-model changes. All changes are:
- `recordTemplateBlocks(database)` → richer `Block[]` on first record open via `ensureRecordBlocks`
- `studioTemplateBlocks(kind, title)` → richer `Block[]` on page creation via `createStudioPageFromTemplate`
- `studioTemplateCard()` → pure rendering, no data side effects

Existing records and pages are **not** affected — templates only apply to newly created records/pages (via the `record.blocks.length === 0` guard in `ensureRecordBlocks`).

## Works In Both Shells

All changes applied identically to:
- `apps/app/index.html` — integrated Parallel app
- `apps/studio/index.html` — standalone Studio dev harness

## Lossless Compliance

- `legacy/` files untouched
- All existing database views, page editor, shell/dock, persistence, and block engine continue to work unchanged
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second editor, no second dock, no second footer introduced

## What's Next

- **Record relations** — cross-database relations surfaced in the record properties panel
- **Template gallery deep-link** — `s-templates` sub connected to real template data
- **AI block suggestions** — context-aware content suggestions in the block editor
- **Publishing** — make record pages shareable as read-only Studio links
- **Variable substitution** — template blocks that auto-fill with record property values
