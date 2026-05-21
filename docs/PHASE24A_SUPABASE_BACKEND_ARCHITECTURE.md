# Phase 24A: Supabase Backend Architecture + Schema Readiness

## Summary

Phase 24A prepares Parallel for a real Supabase backend without disrupting the working local-first product. The frontend workspace engine is now backend-ready, schema-documented, migration-ready, auth-ready, and sync-ready — while remaining fully operational in local mode with no Supabase credentials required.

No UI was redesigned. No localStorage keys were removed or modified. No forced login was added. All Phase 1–23 systems confirmed intact.

---

## What Was Built

### Part 1 — Supabase Project Structure

| Path | Type | Purpose |
|---|---|---|
| `systems/backend/backend-config.js` | New JS module | Configuration and credential management |
| `systems/backend/supabase-client.js` | New JS module | Safe Supabase JS client wrapper |
| `backend/supabase/schema.sql` | New SQL | Complete 13-table database schema |
| `backend/supabase/rls.sql` | New SQL | Row Level Security policies for all tables |
| `backend/supabase/seed.sql` | New SQL | Demo workspace seed data |
| `backend/supabase/README.md` | New docs | Step-by-step Supabase setup guide |

---

## Part 2 — Database Schema

13 tables covering all Parallel data surfaces:

### `profiles`
User identity metadata extending Supabase Auth's `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = auth.users.id |
| `display_name` | text | Shown in bylines, avatars, comments |
| `email` | text | Optional — mirrors auth.users.email |
| `avatar_url` | text | null = use initials avatar |
| `role_default` | text | owner / editor / commenter / viewer |
| `color` | jsonb | `{ bg, color }` for initials avatar |
| `is_local` | boolean | true = device-only identity (pre-auth) |

### `workspaces`
One workspace per team or individual.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Maps from `px_workspace_id` on first sync |
| `name` | text | Maps from `px_workspace_name` |
| `mode` | text | agency / creator / product / personal |
| `owner_id` | uuid FK → profiles | |
| `schema_version` | integer | Matches `px_schema_version` |
| `settings` | jsonb | Onboarding state, capabilities, etc. |
| `sync_enabled` | boolean | false until Phase 24C |

### `workspace_members`
Membership and role per user per workspace.

| Column | Type | Notes |
|---|---|---|
| `workspace_id` | uuid FK | |
| `user_id` | uuid FK → profiles | |
| `role` | text | owner / editor / commenter / viewer |
| `joined_at` | timestamptz | |
| `last_active_at` | timestamptz | Placeholder for presence (Phase 24E+) |

### `pages`
All page-type entities: docs, meeting notes, templates, canvases.

Key columns: `id`, `workspace_id`, `parent_id`, `title`, `type`, `icon`, `cover`, `sort_order`, `archived`, `metadata` (jsonb), `sharing_meta` (jsonb), `version`, `created_by`, `updated_by`, `last_edited_by`, `deleted_at`

### `blocks`
Content blocks within pages and record page bodies.

Key columns: `id`, `workspace_id`, `page_id`, `record_id`, `parent_block_id`, `type`, `content` (jsonb), `sort_order`, `version`

Block types supported: p, h1, h2, h3, bullet, numbered, todo, callout, quote, code, divider, image, link-preview, embed, columns, table, database, linked-database

### `databases`
Database definitions: property schema, saved views, settings.

Key columns: `id`, `workspace_id`, `title`, `icon`, `description`, `db_schema` (jsonb), `views` (jsonb), `settings` (jsonb), `template`, `version`

### `database_records`
Individual records within databases.

Key columns: `id`, `workspace_id`, `database_id`, `title`, `icon`, `properties` (jsonb), `blocks` (jsonb), `metadata` (jsonb), `sharing_meta` (jsonb), `version`, `created_by`, `updated_by`, `last_edited_by`

### `record_relations`
Many-to-many links between records across databases.

Key columns: `source_record_id`, `target_record_id`, `relation_field_id`, `relation_type`

### `comments`
Threaded comments on records and pages.

Key columns: `entity_type`, `entity_id`, `parent_id`, `author_id`, `body`, `mentions` (jsonb), `resolved_at`

### `activity_events`
Immutable workspace audit log. Append-only.

Key columns: `actor_id`, `event_type`, `entity_type`, `entity_id`, `entity_title`, `database_id`, `metadata` (jsonb)

### `assets`
Supabase Storage file references.

Key columns: `workspace_id`, `owner_id`, `storage_path`, `bucket`, `file_name`, `mime_type`, `file_size`, `metadata` (jsonb)

### `ai_outputs`
Audit trail for AI-generated content. Append-only.

Key columns: `entity_type`, `entity_id`, `action_type`, `input_hash`, `output_text`, `model`, `actor_id`

### `sync_operations`
Pending operation queue for offline-first sync (drained in Phase 24D+).

Key columns: `client_id`, `operation_type`, `entity_type`, `entity_id`, `base_version`, `payload` (jsonb), `applied_at`, `conflict_info` (jsonb)

---

## Part 3 — Row Level Security

RLS is enabled on all 13 tables. Three helper functions power all policies:

| Function | Returns | Purpose |
|---|---|---|
| `my_workspace_role(ws_id)` | text | Role of current user in workspace |
| `is_workspace_member(ws_id)` | boolean | True if current user is a member |
| `can_edit_workspace(ws_id)` | boolean | True if role is owner or editor |

### Policy summary by role

| Action | Owner | Editor | Commenter | Viewer |
|---|---|---|---|---|
| Read workspace content | ✅ | ✅ | ✅ | ✅ |
| Create/edit pages, records, blocks | ✅ | ✅ | ✗ | ✗ |
| Add comments | ✅ | ✅ | ✅ | ✗ |
| Edit own comments | ✅ | ✅ | ✅ | ✗ |
| Resolve any comment | ✅ | ✅ | ✗ | ✗ |
| Manage workspace members | ✅ | ✗ | ✗ | ✗ |
| Delete workspace | ✅ | ✗ | ✗ | ✗ |
| Hard-delete content | ✅ | ✗ | ✗ | ✗ |

Activity events and AI outputs are append-only — no update or delete policies.

---

## Part 4 — Local → Cloud Migration Mapping

### localStorage keys → Supabase tables

| localStorage Key | Structure | Supabase Table | Migration Notes |
|---|---|---|---|
| `parallel.studio.phase4.v2`.pages[] | Array of page objects | `pages` + `blocks` | blocks[] extracted to `blocks` table; page body blocks use `page_id` FK |
| `parallel.studio.phase4.v2`.databases[] | Array of database objects | `databases` | `schema` → `db_schema`; `views` → `views` jsonb |
| `parallel.studio.phase4.v2`.databaseRecords{} | Object keyed by record ID | `database_records` | `properties{}` maps directly to `properties` jsonb |
| `parallel.studio.phase4.v2`.blocks{} | Flat block map keyed by block ID | `blocks` | Use `page_id` or `record_id` FK; parse parent-child via `parentId` |
| `px_workspace_id` | String UUID | `workspaces.id` | Map on first cloud save; store mapping locally |
| `px_workspace_name` | String | `workspaces.name` | |
| `px_v19_name` | String | `profiles.display_name` | |
| `px_v19_mode` | String | `workspaces.mode` | |
| `px_v19_setup` | Boolean | `workspaces.settings.onboardingDone` | |
| `px_v19_gs_dismissed` | Boolean | `workspaces.settings.gettingStartedDismissed` | |
| `px_schema_version` | Integer | `workspaces.schema_version` | |
| `px_activity_v1` | Object keyed by event ID | `activity_events` | Convert event IDs to UUIDs; map collaborator IDs to profile UUIDs |
| `px_comments_v1` | Object keyed by comment ID | `comments` | `resolved` boolean → `resolved_at` timestamptz (null when active) |

### Entity sync metadata (already on all entities from Phase 22)

| Local Field | Supabase Equivalent | Phase 24C handling |
|---|---|---|
| `workspaceId` | `workspace_id` | Maps local UUID to Supabase workspace UUID |
| `ownerId` | `created_by` | Populated from auth.uid() on first sync |
| `version` | `version` | Conflict detection: reject if server version > base_version |
| `lastSyncedAt` | `last_synced_at` | Stamped after each successful push |
| `syncPending` | Derived from `sync_operations` | True when pending ops exist |

### Collaborator ID mapping

Local collaborator IDs (`collab-amara`, `collab-kaia`, etc.) must be mapped to Supabase profile UUIDs on first sign-in. The mapping is:

```
collab-amara → auth.uid() of the owner (Amara's real user ID)
collab-kaia  → profiles.id of Kaia (invited via Supabase Auth)
collab-jad   → profiles.id of Jad
collab-rami  → profiles.id of Rami
collab-maya  → profiles.id of Maya
```

In single-user Phase 24A/24B, all `collab-*` IDs resolve to the owner's auth.uid().

---

## Part 5 — Supabase Client Foundation

### `systems/backend/backend-config.js`

Configuration module. Exports `ParallelBackendConfig`:

| Property/Method | Type | Description |
|---|---|---|
| `url` | string | Supabase project URL |
| `anonKey` | string | Supabase public anon key |
| `isConfigured()` | boolean | True when real credentials are present |
| `mode` | string | `'local'` \| `'cloud'` |
| `statusLabel` | string | `'Local workspace'` \| `'Cloud ready'` |
| `configure(url, key)` | method | Override credentials at runtime |
| `TABLES` | object | Frozen table name constants |

### `systems/backend/supabase-client.js`

Safe client wrapper. Exports `ParallelSupabaseClient`:

| Property/Method | Type | Description |
|---|---|---|
| `isActive` | boolean | True when Supabase SDK loaded + credentials set |
| `mode` | string | `'local'` \| `'cloud'` |
| `isConfigured()` | boolean | Credentials set (even if SDK not loaded) |
| `getClient()` | Supabase \| null | Raw client, or null in local mode |
| `healthCheck()` | Promise | `{ ok, latencyMs, error }` |
| `query(fn, fallback)` | Promise | Safe query wrapper; returns fallback in local mode |
| `backendAvailable` | boolean | Whether backend is reachable |

**Local mode guarantee:** Every method is safe to call when Supabase is not configured. `getClient()` returns null; `query()` returns the fallback; `healthCheck()` resolves with `{ ok: false }`. No exceptions are thrown.

---

## Part 6 — Backend Readiness UI

A single subtle chip is injected into the Studio Pulse ribbon:

```
[⊙] Local workspace     (when no Supabase credentials are set)
[☁] Cloud ready         (when credentials are set and SDK is loaded)
```

CSS class: `.backend-status-chip` (sage-tinted in local mode, lilac-tinted in cloud mode)

The chip requires no user interaction. It is informational only and does not open a login screen or modal.

---

## Part 7 — Migration Strategy (Deferred Phases)

### Phase 24B — Auth + User Profile
- Supabase Auth sign-up / sign-in flow
- `profiles` table populated on first sign-in via Auth hook
- Session token stored securely (Supabase handles this)
- App detects auth state; `ParallelWorkspace.owner` becomes the real authenticated user
- `collab-amara` → `auth.uid()` mapping completed

### Phase 24C — Cloud Save / Load
- First real Supabase reads and writes
- On first cloud push: localStorage state is serialised and uploaded
- ID mapping: local `workspaceId` string → Supabase UUID
- Subsequent saves write to both localStorage (offline safety) and Supabase
- `last_synced_at` stamped after each successful push

### Phase 24D — Sync Queue + Conflict Handling
- `sync_operations` table drained by a sync worker
- Conflict detection via `version` field (local vs server)
- Resolution strategies: last-write-wins (default), or manual merge for comments
- `pendingOps[]` in localStorage maps to `sync_operations` rows

### Phase 24E — Realtime Collaboration
- Supabase Realtime subscriptions on `pages`, `database_records`, `comments`
- Presence indicators using `workspace_members.last_active_at`
- Awareness overlays in the record editor (cursor positions, who is editing)
- Activity feed becomes live (push from `activity_events` subscription)

---

## Part 8 — Stabilization + Preservation Audit

### All Phase 1–23 features confirmed intact

| System | Status |
|---|---|
| Global shell — one footer, one plus button, dock order: Studio/Tasks/+/Home/You | ✅ |
| Studio Command Center (all sections) | ✅ |
| Onboarding Phase 19 — 3-step flow, name, mode, getting started | ✅ |
| Ask Parallel AI sheet Phase 20 | ✅ |
| AI Actions on records — Summarize, Next Steps, Break Down, Agenda | ✅ |
| Workspace Intelligence card | ✅ |
| Page tree, block editor, slash menu, transform menu | ✅ |
| All 6 database views: List, Table, Board, Gallery, Calendar, Timeline | ✅ |
| Grouped List view | ✅ |
| Record editor: properties, relations, rollups, formulas, block body | ✅ |
| Phase 17 workspace intelligence (Upcoming, Needs Attention) | ✅ |
| Phase 18 cinematic motion tokens | ✅ |
| Phase 22 persistence layer + workspace identity | ✅ |
| Phase 23 collaboration: comments, activity, attributions, avatars | ✅ |
| localStorage persistence — data persists after refresh | ✅ |
| App opens with no Supabase credentials — local mode fully functional | ✅ |
| Legacy files untouched — lossless verification passes | ✅ |

### localStorage safety audit

No existing keys were modified or deleted in Phase 24A.

| Key | Phase | Phase 24A change |
|---|---|---|
| `parallel.studio.phase4.v2` | Phase 4 | Unchanged |
| `px_schema_version` | Phase 22 | Unchanged |
| `px_workspace_id` | Phase 22 | Unchanged |
| `px_workspace_name` | Phase 22 | Unchanged |
| `px_v19_*` | Phase 19 | Unchanged |
| `px_activity_v1` | Phase 23 | Unchanged |
| `px_comments_v1` | Phase 23 | Unchanged |

No new localStorage keys were introduced in Phase 24A.

---

## Files Added / Changed

| File | Type | Description |
|---|---|---|
| `systems/backend/backend-config.js` | New | Supabase configuration + credential management |
| `systems/backend/supabase-client.js` | New | Safe Supabase JS client wrapper |
| `backend/supabase/schema.sql` | New | Complete 13-table database schema |
| `backend/supabase/rls.sql` | New | Row Level Security policies |
| `backend/supabase/seed.sql` | New | Demo workspace seed data |
| `backend/supabase/README.md` | New | Supabase setup guide |
| `apps/app/index.html` | Modified | Script tags, Phase 24A CSS, backend status chip, JS block |
| `apps/studio/index.html` | Modified | Same changes mirrored |
| `docs/PHASE24A_SUPABASE_BACKEND_ARCHITECTURE.md` | New | This file |
| `README.md` | Modified | Phase 24A entry added |

---

## Remaining Deferred Work

1. **No real auth** — `ParallelSupabaseClient` returns null client until credentials are set and the SDK is loaded. Phase 24B adds sign-in flow.

2. **No cloud reads or writes** — All data is still in localStorage. Phase 24C adds the first real cloud persistence.

3. **Local ID ↔ UUID mapping not yet built** — Phase 24C must map `px_workspace_id` string to a Supabase UUID and persist the mapping locally.

4. **Collaborator IDs not yet resolved to auth UUIDs** — `collab-amara` remains a local string ID. Phase 24B resolves this by mapping to `auth.uid()`.

5. **No Storage bucket provisioning** — `assets` table is defined but no Supabase Storage bucket exists yet. Phase 24C creates the bucket and wires file upload.

6. **Supabase SDK not loaded** — The CDN script is not included in `index.html` by default (would be a dead network request without real credentials). Add it when credentials are set.

7. **`sync_operations` queue not drained** — The local `pendingOps[]` queue exists but is never sent to Supabase. Phase 24D adds the sync worker.

8. **No RLS for Storage bucket** — Supabase Storage bucket policies are separate from table RLS and must be configured in the Dashboard. Documented in `backend/supabase/README.md`.
