# Phase 23: Collaboration Foundations + Shared Workspace Architecture

## Summary

Phase 23 begins Parallel's evolution from a personal workspace into a shared workspace platform. Seven collaboration systems are introduced: a collaborator identity layer, an attribution system, comments and discussion, an activity feed, mentions and references, sharing and permission foundations, and a full stabilization audit. The user-facing product is unchanged in terms of navigation, shell, and feature access — collaboration surfaces integrate *into* existing views rather than replacing them.

No UI was redesigned. No features were removed. All Phase 1–22 systems confirmed intact.

---

## Part 1 — Collaborator Identity Layer

### New file: `systems/collaboration/collaborators.js`

Workspace-aware identity layer. Currently single-user with a mock team for attribution and seeded activity/comment data.

**Collaborator model:**

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Stable identifier (`collab-amara`, etc.) |
| `displayName` | string | Shown in bylines, avatars, comments |
| `email` | string \| null | Placeholder for auth integration |
| `avatarUrl` | string \| null | null = initials avatar |
| `role` | string | `owner` \| `editor` \| `commenter` \| `viewer` |
| `joinedAt` | ISO string | When they joined the workspace |
| `lastActiveAt` | ISO string | Placeholder for presence system |
| `isLocal` | boolean | true = device-only identity (not cloud auth) |
| `color` | object | `{ bg, color }` for initials avatar rendering |

**Role constants:** `ROLES.OWNER`, `ROLES.EDITOR`, `ROLES.COMMENTER`, `ROLES.VIEWER`

**Seed collaborators (mock team):**

| ID | Name | Role |
|---|---|---|
| `collab-amara` | Amara | Owner (matches onboarding name) |
| `collab-kaia` | Kaia | Editor |
| `collab-jad` | Jad | Editor |
| `collab-rami` | Rami | Commenter |
| `collab-maya` | Maya | Viewer |

**Public API:**

| Method | Purpose |
|---|---|
| `ParallelCollaborators.all` | All workspace collaborators |
| `ParallelCollaborators.owner` | Workspace owner (from onboarding name) |
| `ParallelCollaborators.me` | Current active user (= owner until auth) |
| `ParallelCollaborators.get(id)` | Look up by ID |
| `ParallelCollaborators.byName(name)` | Case-insensitive name lookup |
| `ParallelCollaborators.resolve(idOrName)` | ID or name → collaborator |
| `ParallelCollaborators.displayName(idOrName)` | Safe display name string |
| `ParallelCollaborators.avatarHtml(idOrName, size)` | HTML string for inline avatar chip |
| `ParallelCollaborators.initials(name)` | Two-letter initials |
| `ParallelCollaborators.avatarColor(id)` | Warm editorial avatar background/color pair |
| `ParallelCollaborators.register(opts)` | Add/update a collaborator (future auth) |

**Avatar color palette:** 6 warm editorial colors — sage, lilac, peach, sky, rose, amber. Deterministically assigned from collaborator ID hash.

**Future extension points:**
- `ownerId` → auth token user ID
- `members[]` → team membership list
- `plan` → billing/feature gates
- `capabilities.*` → per-plan feature flags

---

## Part 2 — Attribution System

### Entity factory updates (both `apps/app/index.html` and `apps/studio/index.html`)

All core entities now carry attribution metadata:

| Field | Type | Default | Purpose |
|---|---|---|---|
| `createdBy` | string \| null | Current user ID | Who created this entity |
| `updatedBy` | string \| null | Current user ID | Who last updated this entity |
| `lastEditedBy` | string \| null | Current user ID | Who last edited (for byline display) |

**Entities upgraded:**

| Entity | Factory | Normalize |
|---|---|---|
| Pages | `makePage()` | `normalizePage()` |
| Databases | `makeDatabase()` | `normalizeDatabase()` |
| Records | `makeDatabaseRecord()` | `normalizeDatabaseRecord()` |

**Seed data attribution:**

All seed pages and records now carry explicit `createdBy` and `updatedBy` collaborator IDs matching the workspace team.

### Sharing metadata (architecture-only)

Pages and records now also carry `sharingMeta`:

```js
{
  isPublic:        false,
  shareToken:      null,     // generated on first share
  permissionLevel: 'owner',
  sharedWith:      [],       // future: [{ collaboratorId, role }]
}
```

### Attribution UX

Record editor byline now shows:

```
[avatar] Created by Amara · [avatar] Edited by Kaia
```

Rendered via `renderRecordAttribution(record)` — appears below the date/time byline in the record title section. Degrades gracefully when no attribution data is present.

---

## Part 3 — Comments + Discussion System

### New file: `systems/collaboration/comments.js`

Lightweight threaded comments on records and pages.

**Comment model:**

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique comment ID (`cmt-…`) |
| `entityId` | string | Record or page ID this comment belongs to |
| `entityKind` | string | `'record'` \| `'page'` |
| `parentId` | string \| null | For future reply threading |
| `authorId` | string | Collaborator ID |
| `authorName` | string | Display name fallback |
| `body` | string | Comment text (may include @mentions) |
| `mentions` | string[] | Array of mentioned collaborator IDs |
| `createdAt` | ISO string | Creation timestamp |
| `updatedAt` | ISO string | Last edit timestamp |
| `resolved` | boolean | Resolved/dismissed flag |

**Storage:** `px_comments_v1` (localStorage, flat object keyed by comment ID)

**Public API:**

| Method | Purpose |
|---|---|
| `ParallelComments.add(entityId, kind, body, opts)` | Create a comment + track in activity feed |
| `ParallelComments.forEntity(entityId)` | Get active comments, oldest-first |
| `ParallelComments.resolve(commentId)` | Mark resolved (hidden from view) |
| `ParallelComments.remove(commentId)` | Delete permanently |
| `ParallelComments.count(entityId)` | Count active comments |
| `ParallelComments.renderBody(body)` | Render body with @mention chips |
| `ParallelComments.sectionHtml(entityId, kind, title)` | Full comment section HTML |
| `ParallelComments.seedIfEmpty()` | Seed demo comments for fresh workspace |

**Mention parsing:** `@Name` in comment body is matched against `ParallelCollaborators.byName()` and rendered as `.mention-chip` pills.

**UX placement:** Comments section appears in the record editor between the AI actions bar and the page actions row. Styled as a calm, spacious glass card — editorial and integrated, not chat-like.

**Seeded demo comments:**
- 3 comments on `rec-project-lumena` (Lumena Brand Identity)
- 1 comment on `rec-project-noura` (Noura App MVP)
- 1 comment on `pg-brand-brief` (Lumena Brand Brief page)

---

## Part 4 — Activity Feed + Operational History

### New file: `systems/collaboration/activity.js`

Ambient workspace activity log. Tracks meaningful actions as lightweight events.

**Event model:**

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique event ID (`evt-…`) |
| `type` | string | Event type constant |
| `actorId` | string | Collaborator ID who did the action |
| `actorName` | string | Display name fallback |
| `entityId` | string | The page/record/database affected |
| `entityKind` | string | `'page'` \| `'record'` \| `'database'` \| `'comment'` |
| `entityTitle` | string | Human-readable entity name |
| `databaseId` | string \| null | Parent database for record events |
| `meta` | object | Type-specific extra data (e.g. status from/to) |
| `createdAt` | ISO string | When this happened |

**Event types:**

`page_created`, `page_updated`, `page_archived`, `record_created`, `record_updated`, `record_archived`, `status_changed`, `comment_added`, `relation_added`, `database_created`, `ai_summary`, `date_changed`, `workspace_setup`

**Storage:** `px_activity_v1` (localStorage, capped at 120 events)

**Public API:**

| Method | Purpose |
|---|---|
| `ParallelActivity.track(type, opts)` | Record a new event |
| `ParallelActivity.recent(limit)` | Newest events first |
| `ParallelActivity.forEntity(entityId, limit)` | Events for a specific entity |
| `ParallelActivity.sinceHours(hours)` | Events in the last N hours |
| `ParallelActivity.timeAgo(isoString)` | Human-readable time string |
| `ParallelActivity.rowHtml(evt)` | Render one activity row as HTML |
| `ParallelActivity.seedIfEmpty()` | Seed 8 demo events for fresh workspace |

**Activity triggers wired in this phase:**
- `createPage()` → `trackPageCreated(page)`
- `createDatabaseRecord()` → `trackRecordCreated(record, database)`
- `renderAiActionBlock()` → `trackAiAction(record)`

**UX placement:** "Recent Activity" section appears at the bottom of the Studio Command Center — below Templates. Shows up to 8 most recent events as avatar + name + verb + entity title + time-ago.

---

## Part 5 — Mentions + References

**Mention parsing** is built into the comments system (`parseMentions()` in `comments.js`). Any `@Name` in a comment body is matched against collaborator names.

**Rendered as:** `.mention-chip` — soft lilac pill inline in comment body.

**Example:** `@Kaia agreed — keep the lilac.` renders as `[@Kaia] agreed — keep the lilac.` with the mention highlighted.

---

## Part 6 — Sharing + Permission Foundations

### New file: `systems/collaboration/sharing.js`

Architecture-only layer. No public sharing UI is implemented yet.

**Permission levels:** `owner`, `editor`, `commenter`, `viewer`

**Public API:**

| Method | Purpose |
|---|---|
| `ParallelSharing.defaultMeta()` | Default sharing metadata object |
| `ParallelSharing.normalize(entity)` | Merge sharing fields onto entity |
| `ParallelSharing.canEdit(entity)` | Check edit permission |
| `ParallelSharing.canComment(entity)` | Check comment permission |
| `ParallelSharing.canView(entity)` | Check view permission |
| `ParallelSharing.enableSharing(entity)` | Activate public sharing (Phase 26+) |
| `ParallelSharing.disableSharing(entity)` | Disable public sharing |
| `ParallelSharing.addGrant(entity, id, role)` | Add a collaborator grant |
| `ParallelSharing.levelLabel(level)` | Human-readable permission label |

**Current behavior:** All operations return `owner` level (single-user mode). The architecture is ready for Phase 26+ real sharing.

---

## Part 7 — Stabilization + Preservation Audit

### All Phase 1–22 features confirmed intact

| System | Status |
|---|---|
| Global shell — one footer, one plus button, dock order: Studio/Tasks/+/Home/You | ✅ |
| Studio Command Center (all sections) | ✅ |
| Onboarding (Phase 19) — 3-step flow, name, mode, getting started | ✅ |
| Ask Parallel AI sheet (Phase 20) — open, close, backdrop dismiss | ✅ |
| AI Actions on records — Summarize, Next Steps, Break Down, Agenda | ✅ |
| Workspace Intelligence card | ✅ |
| Page tree, page opening, block editor, slash menu, transform menu | ✅ |
| All 6 database views: List, Table, Board, Gallery, Calendar, Timeline | ✅ |
| Grouped List view | ✅ |
| Record editor: properties, relations, rollups, formulas, block body | ✅ |
| Phase 17 workspace intelligence (Upcoming, Needs Attention) | ✅ |
| Phase 18 cinematic motion tokens | ✅ |
| Phase 22 persistence layer + workspace identity | ✅ |
| localStorage persistence — data persists after refresh | ✅ |
| Legacy files untouched — lossless verification passes | ✅ |

### localStorage safety audit

| Key | Phase | Phase 23 change |
|---|---|---|
| `parallel.studio.phase4.v2` | Phase 4 | Unchanged — attribution fields on entities are forward-compatible |
| `px_schema_version` | Phase 22 | Unchanged |
| `px_workspace_id` | Phase 22 | Unchanged |
| `px_workspace_name` | Phase 22 | Unchanged |
| `px_v19_*` | Phase 19 | Unchanged |
| `px_activity_v1` | **Phase 23** | New — activity event log |
| `px_comments_v1` | **Phase 23** | New — comment store |

---

## Files Added / Changed

| File | Type | Description |
|---|---|---|
| `systems/collaboration/collaborators.js` | New | Collaborator identity layer |
| `systems/collaboration/activity.js` | New | Activity feed + operational history |
| `systems/collaboration/comments.js` | New | Comments + discussion system |
| `systems/collaboration/sharing.js` | New | Sharing + permission foundations |
| `apps/app/index.html` | Modified | Script tags, CSS, factory updates, record editor, command center, Phase 23 JS |
| `apps/studio/index.html` | Modified | Same changes mirrored |
| `docs/PHASE23_COLLABORATION_FOUNDATIONS.md` | New | This file |
| `README.md` | Modified | Phase 23 entry added to Studio Phase History |

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second shell, no second dock, no second footer
- Dock order unchanged: Studio / Tasks / + / Home / You
- All existing views, editors, databases, and Phase 1–22 systems unchanged
- No existing localStorage keys changed or deleted
- Two new localStorage keys added (`px_activity_v1`, `px_comments_v1`)
- No external dependencies or network calls

---

## Remaining Known Limitations (for future phases)

1. **No real-time collaboration** — all collaboration data is local. Multi-user sync requires Phase 26+ WebSocket layer.

2. **`updatedBy` not automatically bumped** — must be called explicitly on each meaningful update. Phase 24 should integrate `bumpVersion()` and attribution stamps into `updateDatabaseRecord`, `updatePage`, etc.

3. **Comments not shown in page editor** — currently only in the record editor. Page-level comments (e.g. on `pg-brand-brief`) are stored but need a page-editor comment panel in a future phase.

4. **Activity feed not persisted across schema migrations** — `px_activity_v1` is not included in the Phase 22 migration system. Adding it to future migrations ensures continuity.

5. **No mention notifications** — `mentions[]` array is populated on comment add but no notification surface exists yet. Phase 25+ should add an inbox or notification dot.

6. **Sharing tokens are never sent** — `shareToken` is generated locally but no backend exists to honor it. Phase 26+ will wire this to a real sharing API.
