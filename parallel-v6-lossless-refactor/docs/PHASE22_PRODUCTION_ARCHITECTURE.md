# Phase 22: Production Architecture + Sync Foundations

## Summary

Phase 22 transforms Parallel's internal architecture toward production readiness without changing any user-facing product surface. All six goals (persistence cleanup, sync-ready entities, auth readiness, migration safety, offline foundations, preservation audit) are addressed through clean architecture additions that apply transparently on app boot.

No UI was changed. No features were added or removed. The app behaves identically to Phase 21 from the user's perspective, but the data model and persistence layer are now structured for a real backend.

---

## Part 1 — Persistence Architecture Cleanup

### New file: `systems/persistence/persistence-layer.js`

Central abstraction for all workspace storage. Currently backed by localStorage. Designed so that replacing this with a backend API or CRDT sync engine requires only changing the read/write methods.

**API surface:**

| Method | Purpose |
|---|---|
| `ParallelPersistence.KEYS` | Canonical registry of every localStorage key the app uses |
| `ParallelPersistence.SCHEMA_VERSION` | Current migration schema version (2) |
| `ParallelPersistence.initialize()` | Run startup migrations before `loadStudioState()` |
| `ParallelPersistence.workspaceId()` | Get or create the stable workspace identifier |
| `ParallelPersistence.read(key, fallback)` | Safe JSON read from localStorage (never throws) |
| `ParallelPersistence.write(key, value)` | Safe JSON write to localStorage (never throws) |
| `ParallelPersistence.entityMeta()` | Generate sync-ready metadata for new entities |
| `ParallelPersistence.bumpVersion(entity)` | Increment entity version and set syncPending |
| `ParallelPersistence.queueOp(state, op)` | Add to the pending operations queue |

**Key registry — all localStorage keys in one place:**

```
parallel.studio.phase4.v2   — core workspace state (pages, documents, databases, records)
parallel.studio.phase3_5.v1 — legacy key (still migrated from)
px_schema_version           — migration schema version (Phase 22: new)
px_workspace_id             — stable workspace UUID (Phase 22: new)
px_workspace_name           — optional custom workspace name (Phase 22: new)
px_v19_setup                — onboarding complete flag
px_v19_name                 — user's name from onboarding
px_v19_mode                 — workspace mode (agency/creator/product/personal)
px_v19_gs_dismissed         — Getting Started card dismissed
```

---

## Part 2 — Sync-Ready Entity Model

All core entities now carry sync-ready metadata fields, added transparently via their `make*` and `normalize*` factory functions.

### New fields on every entity

| Field | Type | Default | Purpose |
|---|---|---|---|
| `workspaceId` | string | stable UUID | Routes to the right workspace in a multi-tenant backend |
| `ownerId` | string \| null | `null` | Authenticated user ID (null until auth is wired) |
| `version` | integer | `1` | Incremented on every meaningful update; enables conflict detection |
| `lastSyncedAt` | ISO string \| null | `null` | Timestamp of last successful backend sync |
| `syncPending` | boolean | `false` | True when local changes haven't been sent to backend |

### Entities upgraded

| Entity | Factory updated | Normalize updated | Serialize updated |
|---|---|---|---|
| Pages | `makePage()` | `normalizePage()` | `serializePage()` (passthrough) |
| Databases | `makeDatabase()` | `normalizeDatabase()` | `serializeDatabase()` (passthrough) |
| Records | `makeDatabaseRecord()` | `normalizeDatabaseRecord()` | `serializeDatabaseRecord()` (passthrough) |
| Blocks | `makeBlock()` | `normalizeBlock()` | `serializeBlock()` |

### Entity shape (post-Phase 22)

**Page:**
```js
{
  id, title, type, icon, parentId, children, workspaceId,
  favorite, archived, createdAt, updatedAt, lastOpenedAt,
  blockIds, metadata,
  // Phase 22 additions:
  ownerId: null, version: 1, lastSyncedAt: null, syncPending: false
}
```

**Database:**
```js
{
  id, title, icon, description, workspaceId, parentPageId,
  schema, recordIds, defaultView, views, createdAt, updatedAt, metadata,
  // Phase 22 additions:
  ownerId: null, version: 1, lastSyncedAt: null, syncPending: false
}
```

**Record:**
```js
{
  id, databaseId, title, icon, properties, pageId, blockIds, blocks,
  createdAt, updatedAt, archived, metadata,
  // Phase 22 additions:
  workspaceId: '<stable-uuid>', ownerId: null,
  version: 1, lastSyncedAt: null, syncPending: false
}
```

**Block:**
```js
{
  id, type, content, children, checked, metadata, collapsed,
  createdAt, updatedAt,
  // Phase 22 addition:
  version: 1
}
```

---

## Part 3 — Auth/User Workspace Readiness

### New file: `systems/workspace/workspace.js`

Workspace identity and capability layer. Currently single-user, single-workspace, fully offline.

**API surface:**

| Property | Type | Value |
|---|---|---|
| `ParallelWorkspace.id` | string | Stable `ws_<uuid>` from `ParallelPersistence.workspaceId()` |
| `ParallelWorkspace.name` | string | `px_workspace_name` → `px_v19_name` → `'My Workspace'` |
| `ParallelWorkspace.mode` | string | `px_v19_mode` (agency/creator/product/personal) |
| `ParallelWorkspace.owner` | object | `{ id, name, ownerId: null, isLocal: true }` |
| `ParallelWorkspace.isCloudLinked` | boolean | Always `false` (until sync layer) |
| `ParallelWorkspace.hasPendingSync` | boolean | `syncMeta.pendingOpsCount > 0` |
| `ParallelWorkspace.schemaVersion` | integer | `parseInt(px_schema_version)` |
| `ParallelWorkspace.capabilities` | object | Feature flags per capability |
| `ParallelWorkspace.summary` | object | Debug/status snapshot |

**Capabilities object:**
```js
{
  offlineSupport:  true,   // always
  cloudSync:       false,  // Phase 26+: WebSocket/REST sync
  collaboration:   false,  // Phase 28+: multi-user real-time
  versionHistory:  false,  // Phase 27+: entity revision log
  aiFeatures:      true,   // Phase 20+
  multiWorkspace:  false,  // future
}
```

**Auth extension points:**
- `ownerId` on every entity is `null` until auth is wired
- `ParallelWorkspace.owner.ownerId` is `null` — will be populated by auth token
- `ParallelWorkspace.isCloudLinked` → `false` → change to check auth token presence
- `workspaceId` is already a stable UUID suitable for multi-tenant backend routing

---

## Part 4 — Migration Safety Layer

### Migration system

Registered in `systems/persistence/persistence-layer.js`.

**How it works:**
1. On page load, `ParallelPersistence.initialize()` runs before `loadStudioState()`
2. It reads `px_schema_version` from localStorage
3. If version < `SCHEMA_VERSION` (currently 2), applicable migrations run in order
4. Each migration mutates the raw parsed JSON state in place
5. Mutated state is written back to `parallel.studio.phase4.v2`
6. `px_schema_version` is updated to current version
7. `loadStudioState()` then reads the already-migrated data

**Migration safety guarantees:**
- Never runs if `px_schema_version >= SCHEMA_VERSION` — idempotent
- Never runs if there is no saved state — first-time users skip migrations
- Each migration wrapped in try/catch — failure is logged and skipped, not fatal
- State is only written back if at least one migration made changes
- The state format version (`version:2` in the saved JSON) is unchanged — `loadStudioState`'s existing version check still works

**Registered migrations:**

| Migration | From → To | What it adds |
|---|---|---|
| v1 → v2 | schema v1 → v2 | Adds sync-ready fields to all pages, databases, and records in saved state. Adds `syncMeta` and `pendingOps[]` at the top level. |

**Migration logging:**
- `console.log('[Parallel Migration] Applied: <label>')`
- `console.log('[Parallel] Workspace migrated to schema v<n>')`
- `console.warn(...)` on failure (app continues normally)

**Adding future migrations:**
```js
// In persistence-layer.js, after the existing registerMigration call:
registerMigration(2, 3, 'v2→v3: Description', function(state, wsId) {
  // mutate state
  return true; // or false if nothing changed
});
// Then increment SCHEMA_VERSION = 3
```

---

## Part 5 — Offline + Conflict Strategy Foundation

### Sync metadata on every entity

All entities now carry:
- `version: integer` — increment via `ParallelPersistence.bumpVersion(entity)` on every meaningful update
- `syncPending: boolean` — set to `true` by `bumpVersion()`, cleared to `false` by sync layer on success
- `lastSyncedAt: ISO string | null` — set by sync layer to confirm delivery

### Top-level workspace sync state

Every `writeStudioState()` now includes in the saved JSON:

```js
{
  syncMeta: {
    schemaVersion: 2,
    workspaceId: 'ws_<uuid>',
    lastSyncedAt: null,         // ISO timestamp once sync is live
    pendingOpsCount: 0,         // length of pendingOps[]
    syncEnabled: false,         // true once sync layer connects
  },
  pendingOps: []                // future: list of unsynced operations
}
```

### Pending operations queue

`ParallelPersistence.queueOp(state, op)` appends to `state.pendingOps[]`. Currently no-op from the user's perspective. Future sync layer will:
1. Monitor `syncMeta.pendingOpsCount > 0`
2. Drain the queue via WebSocket/REST
3. Set `syncPending = false` and `lastSyncedAt` on affected entities

### Conflict detection (ready)

Because every entity has a monotonically increasing `version`:
- A backend can detect conflicts by comparing `entity.version` against the server's stored version
- If `local.version < server.version`, the server's changes won the race
- If `local.version == server.version + 1`, the local change can be fast-path applied
- If diverged, a merge policy (last-write-wins, server-wins, or manual) can be applied

### Offline durability (unchanged but confirmed)

The existing `persistStudioState()` path remains unchanged. The 160ms debounce writes full state on every meaningful user action. No data is lost on browser close.

---

## Part 6 — Stabilization + Preservation Audit

### All existing features confirmed intact

| System | Status |
|---|---|
| Global shell — one footer, one plus button, dock order: Studio/Tasks/+/Home/You | ✅ |
| Studio Command Center (all sections) | ✅ |
| Onboarding (Phase 19) — 3-step flow, name, mode, getting started | ✅ |
| Ask Parallel AI sheet (Phase 20) — open, close, backdrop dismiss | ✅ |
| Workspace Intelligence card | ✅ |
| Page tree, page opening, block editor, slash menu, transform menu | ✅ |
| All 6 database views: List, Table, Board, Gallery, Calendar, Timeline | ✅ |
| Grouped List view | ✅ |
| Record editor: properties, relations, rollups, formulas, block body, AI actions | ✅ |
| Phase 17 workspace intelligence (Upcoming, Needs Attention) | ✅ |
| Phase 18 cinematic motion tokens | ✅ |
| localStorage persistence — data persists after refresh | ✅ |

### localStorage safety audit

| Key | Phase introduced | Phase 22 change |
|---|---|---|
| `parallel.studio.phase4.v2` | Phase 4 | Now includes `syncMeta` and `pendingOps` fields (backward compatible — `loadStudioState` ignores unknown fields) |
| `parallel.studio.phase3_5.v1` | Phase 3.5 | Read for legacy migration, not written |
| `px_v19_setup` | Phase 19 | Unchanged |
| `px_v19_name` | Phase 19 | Unchanged |
| `px_v19_mode` | Phase 19 | Unchanged |
| `px_v19_gs_dismissed` | Phase 19 | Unchanged |
| `px_schema_version` | **Phase 22** | New — migration version tracking |
| `px_workspace_id` | **Phase 22** | New — stable workspace UUID |
| `px_workspace_name` | **Phase 22** | New — optional custom workspace name |

---

## Files Added / Changed

| File | Type | Description |
|---|---|---|
| `systems/persistence/persistence-layer.js` | New | Central persistence abstraction with migration system |
| `systems/workspace/workspace.js` | New | Workspace identity and capabilities layer |
| `apps/app/index.html` | Modified | Script tags, entity factories/normalizers updated |
| `apps/studio/index.html` | Modified | Same changes mirrored |
| `docs/PHASE22_PRODUCTION_ARCHITECTURE.md` | New | This file |
| `README.md` | Modified | Phase 22 entry added to Studio Phase History |

---

## Lossless Compliance

- `legacy/` files untouched
- `npm run verify:lossless` passes (both legacy checksums intact)
- No second shell, no second dock, no second footer
- Dock order unchanged: Studio / Tasks / + / Home / You
- All existing views, editors, databases, and Phase 1–21 systems unchanged
- No existing localStorage keys changed or deleted
- Three new localStorage keys added (`px_schema_version`, `px_workspace_id`, `px_workspace_name`)
- No external dependencies or network calls

---

## Remaining Known Issues (for future phases)

1. **`bumpVersion()` not yet called automatically** — must be called explicitly on each update. A future phase should integrate this into `updateDatabaseRecord`, `updatePage`, etc. This is intentional deferral: wiring it everywhere in this phase would have been hundreds of changes with risk.

2. **`pendingOps` array is always empty** — populated but never drained. Requires real sync layer (Phase 26+).

3. **`syncPending` always `false` after write** — `writeStudioState` resets `syncMeta.pendingOpsCount` to 0 on every save. Once real sync is wired, `writeStudioState` should preserve the sync state rather than resetting it.

4. **`workspaceId` on seed data defaults to `ws-amara`** — The seed databases and records at parse time use `makeDatabase({id:'db-projects',...})` without explicit `workspaceId`. `makeDatabase`'s default now calls `ParallelPersistence.workspaceId()` which has already run `ensureWorkspaceId()`, so this is correct. But on truly first run (no `px_workspace_id` in localStorage), the seed data is created with the freshly generated ID. ✅

5. **Version history** — entity `version` increments but previous versions are not stored. Requires dedicated history storage (Phase 27+).
