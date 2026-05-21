/* ─────────────────────────────────────────────────────────────────────────
   Parallel Persistence Layer — Phase 22: Production Architecture

   Central abstraction for all workspace storage. Currently backed by
   localStorage. Designed so that replacing this with a backend API or
   CRDT sync engine only requires changing the read/write methods.

   API:
     ParallelPersistence.KEYS               — all storage key constants
     ParallelPersistence.SCHEMA_VERSION     — current migration schema version
     ParallelPersistence.workspaceId()      — stable workspace identifier
     ParallelPersistence.read(key, fb)      — safe JSON read from localStorage
     ParallelPersistence.write(key, val)    — safe JSON write to localStorage
     ParallelPersistence.entityMeta()       — sync-ready metadata for new entities
     ParallelPersistence.bumpVersion(e)     — increment entity version on update
     ParallelPersistence.queueOp(state, op) — add to pending operations queue
     ParallelPersistence.initialize()       — run startup migrations (call first)

   Migration registry:
     Migrations run once on app boot if the stored schema version is behind
     the current SCHEMA_VERSION. Each migration receives the raw state object
     and the stable workspaceId, mutates it in place, and returns true.
     The migrated state is written back to localStorage before loadStudioState()
     reads it, so normalize functions see already-upgraded data.

   Sync-ready entity shape (all entities after Phase 22):
     { workspaceId, ownerId, version, lastSyncedAt, syncPending }

   Offline / conflict foundation:
     - version: integer, incremented on every meaningful update
     - syncPending: true when local changes haven't been sent to backend
     - lastSyncedAt: ISO timestamp of last successful backend sync (null locally)
     - pendingOps[]: append-only queue for future backend sync operations
     - syncMeta: top-level workspace sync status summary

   Future extension points:
     - Replace safeRead/safeWrite with API calls in a subclass or adapter
     - Drain pendingOps[] with real WebSocket or REST sync
     - Use workspaceId for multi-tenant backend routing
     - Use ownerId once an auth layer is wired
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  /* ── Schema version ────────────────────────────────────────────────────
     Increment this when a new migration is registered. The stored value
     in px_schema_version tracks what version the user's data is at.
  ────────────────────────────────────────────────────────────────────── */
  var SCHEMA_VERSION = 2;

  /* ── Storage key registry ──────────────────────────────────────────────
     Single source of truth for every localStorage key the app uses.
     Import this from the persistence layer rather than scattering string
     literals. Frozen so no code can accidentally add keys at runtime.
  ────────────────────────────────────────────────────────────────────── */
  var KEYS = Object.freeze({
    // Core workspace state (matches shared-shell.js constants)
    studio:             'parallel.studio.phase4.v2',
    legacyStudio:       ['parallel.studio.phase3_5.v1'],
    // Migration tracking
    schemaVersion:      'px_schema_version',
    // Workspace identity (Phase 22)
    workspaceId:        'px_workspace_id',
    workspaceName:      'px_workspace_name',
    // Onboarding (Phase 19)
    onboardSetup:       'px_v19_setup',
    onboardName:        'px_v19_name',
    onboardMode:        'px_v19_mode',
    onboardGsDismissed: 'px_v19_gs_dismissed',
  });

  /* ── Safe storage helpers ──────────────────────────────────────────────
     All localStorage access goes through these. Never throws; always
     returns fallback on error so the app degrades gracefully.
  ────────────────────────────────────────────────────────────────────── */
  function safeRead(key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Parallel] Storage read error:', key, e);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Parallel] Storage write error:', key, e);
      return false;
    }
  }

  function rawGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function rawSet(key, value) {
    try { localStorage.setItem(key, String(value)); return true; } catch (e) { return false; }
  }

  /* ── Workspace identity ────────────────────────────────────────────────
     Generate a stable workspace UUID on first run. Persists across
     sessions and survives app restarts. Will map to a cloud workspace
     reference once a backend is connected.
  ────────────────────────────────────────────────────────────────────── */
  function ensureWorkspaceId() {
    var id = rawGet(KEYS.workspaceId);
    if (!id) {
      id = 'ws_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      rawSet(KEYS.workspaceId, id);
    }
    return id;
  }

  /* ── Migration registry ────────────────────────────────────────────────
     Migrations are registered here and run in from-version order.
     Each migration function receives (state, workspaceId) and should:
       1. Mutate state in place
       2. Return true if changes were made, false if nothing needed doing
  ────────────────────────────────────────────────────────────────────── */
  var _migrations = [];

  function registerMigration(from, to, label, fn) {
    _migrations.push({ from: from, to: to, label: label, fn: fn });
  }

  /* ── Migration v1 → v2: Sync-ready entity metadata ────────────────────
     Adds workspaceId, ownerId, version, lastSyncedAt, syncPending to
     every page, database, and record. Also adds syncMeta and pendingOps
     at the top level of the workspace state.
  ────────────────────────────────────────────────────────────────────── */
  registerMigration(1, 2, 'v1→v2: Sync-ready entity metadata', function (state, wsId) {
    if (!state || typeof state !== 'object') return false;
    var changed = false;

    // Pages
    if (Array.isArray(state.pages)) {
      state.pages.forEach(function (p) {
        if (!p) return;
        if (!p.workspaceId)            { p.workspaceId = wsId;  changed = true; }
        if (p.ownerId === undefined)   { p.ownerId = null;       changed = true; }
        if (!p.version)                { p.version = 1;          changed = true; }
        if (p.lastSyncedAt === undefined) { p.lastSyncedAt = null; changed = true; }
        if (p.syncPending === undefined)  { p.syncPending = false; changed = true; }
      });
    }

    // Databases
    if (Array.isArray(state.databases)) {
      state.databases.forEach(function (db) {
        if (!db) return;
        if (!db.workspaceId)            { db.workspaceId = wsId; changed = true; }
        if (db.ownerId === undefined)   { db.ownerId = null;      changed = true; }
        if (!db.version)                { db.version = 1;         changed = true; }
        if (db.lastSyncedAt === undefined) { db.lastSyncedAt = null; changed = true; }
        if (db.syncPending === undefined)  { db.syncPending = false; changed = true; }
      });
    }

    // Records
    if (state.databaseRecords && typeof state.databaseRecords === 'object') {
      Object.values(state.databaseRecords).forEach(function (r) {
        if (!r) return;
        if (!r.workspaceId)            { r.workspaceId = wsId;  changed = true; }
        if (r.ownerId === undefined)   { r.ownerId = null;       changed = true; }
        if (!r.version)                { r.version = 1;          changed = true; }
        if (r.lastSyncedAt === undefined) { r.lastSyncedAt = null; changed = true; }
        if (r.syncPending === undefined)  { r.syncPending = false; changed = true; }
      });
    }

    // Top-level sync metadata
    if (!state.syncMeta) {
      state.syncMeta = {
        schemaVersion:  SCHEMA_VERSION,
        workspaceId:    wsId,
        lastSyncedAt:   null,
        pendingOpsCount: 0,
        syncEnabled:    false,
      };
      changed = true;
    }

    // Pending operations queue
    if (!Array.isArray(state.pendingOps)) {
      state.pendingOps = [];
      changed = true;
    }

    return changed;
  });

  /* ── Migration runner ──────────────────────────────────────────────────
     Reads the current schema version, applies any outstanding migrations
     in order, writes migrated state back to localStorage, then updates
     the schema version key. Only runs when version < SCHEMA_VERSION.
  ────────────────────────────────────────────────────────────────────── */
  function runMigrations() {
    var currentVersion = parseInt(rawGet(KEYS.schemaVersion) || '1', 10);
    if (currentVersion >= SCHEMA_VERSION) return;

    var wsId = ensureWorkspaceId();
    var rawStr = rawGet(KEYS.studio);
    if (!rawStr) {
      // No saved state yet — just stamp the version
      rawSet(KEYS.schemaVersion, String(SCHEMA_VERSION));
      return;
    }

    var state;
    try {
      state = JSON.parse(rawStr);
    } catch (e) {
      console.warn('[Parallel] Could not parse state for migration:', e);
      rawSet(KEYS.schemaVersion, String(SCHEMA_VERSION));
      return;
    }

    var version = currentVersion;
    var anyChanged = false;

    _migrations
      .filter(function (m) { return m.from >= version && m.to <= SCHEMA_VERSION; })
      .sort(function (a, b) { return a.from - b.from; })
      .forEach(function (m) {
        try {
          var changed = m.fn(state, wsId);
          if (changed !== false) {
            version = m.to;
            anyChanged = true;
            console.log('[Parallel Migration] Applied:', m.label);
          }
        } catch (e) {
          console.warn('[Parallel Migration] Failed:', m.label, e);
        }
      });

    if (anyChanged) {
      try {
        rawSet(KEYS.studio, JSON.stringify(state));
        console.log('[Parallel] Workspace migrated to schema v' + version);
      } catch (e) {
        console.warn('[Parallel] Could not write migrated state:', e);
      }
    }

    rawSet(KEYS.schemaVersion, String(SCHEMA_VERSION));
  }

  /* ── Public API ────────────────────────────────────────────────────── */
  var ParallelPersistence = {

    SCHEMA_VERSION: SCHEMA_VERSION,
    KEYS: KEYS,

    /**
     * Run startup migrations. Call this before loadStudioState() so that
     * normalize functions see already-upgraded entity shapes.
     */
    initialize: function () {
      try {
        ensureWorkspaceId();
        runMigrations();
      } catch (e) {
        console.warn('[Parallel] Persistence init failed:', e);
      }
    },

    /**
     * Get or create a stable workspace identifier.
     * Survives page reloads. Will map to cloud workspace ID in production.
     */
    workspaceId: function () {
      return ensureWorkspaceId();
    },

    /**
     * Safe JSON read from localStorage.
     * Returns fallback (default: null) on parse error or missing key.
     */
    read: safeRead,

    /**
     * Safe JSON write to localStorage.
     * Returns true on success, false on QuotaExceededError or other errors.
     */
    write: safeWrite,

    /**
     * Generate sync-ready metadata for a new entity.
     * Spread into entity objects at creation time.
     *
     * @example
     * const record = { id, title, ...ParallelPersistence.entityMeta() };
     */
    entityMeta: function () {
      return {
        workspaceId:  ensureWorkspaceId(),
        ownerId:      null,    // future: authenticated user ID
        version:      1,       // incremented on every meaningful update
        lastSyncedAt: null,    // ISO timestamp of last backend sync
        syncPending:  false,   // true when local changes await backend
      };
    },

    /**
     * Increment an entity's version counter and mark it as sync-pending.
     * Call this whenever a record, page, or database is meaningfully updated.
     *
     * @param {object} entity — page, record, or database object
     * @returns the same entity (mutated in place)
     */
    bumpVersion: function (entity) {
      if (entity && typeof entity === 'object') {
        entity.version    = (entity.version || 1) + 1;
        entity.syncPending = true;
        entity.updatedAt  = new Date().toISOString();
      }
      return entity;
    },

    /**
     * Append a pending operation to the state's pendingOps queue.
     * No-op now; a real sync layer will drain this queue via WebSocket/REST.
     *
     * @param {object} state  — top-level workspace state object
     * @param {object} op     — operation descriptor { type, entityId, ... }
     */
    queueOp: function (state, op) {
      if (!state || typeof state !== 'object') return;
      if (!Array.isArray(state.pendingOps)) state.pendingOps = [];
      state.pendingOps.push(Object.assign({
        id:       'op_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        queuedAt: new Date().toISOString(),
      }, op));
      if (state.syncMeta) {
        state.syncMeta.pendingOpsCount = state.pendingOps.length;
      }
    },
  };

  global.ParallelPersistence = ParallelPersistence;

  // Auto-initialize on load: ensure workspace ID exists immediately
  // (before the inline script runs, so entities created at parse time get the right ID)
  ensureWorkspaceId();

})(window);
