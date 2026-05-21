/* ─────────────────────────────────────────────────────────────────────────
   Parallel Workspace Identity Layer — Phase 22: Production Architecture

   Manages workspace-level identity and capabilities. Currently a single
   local workspace per device. Designed to extend to cloud-connected,
   multi-workspace, multi-user contexts without rewrites.

   Depends on: persistence-layer.js (must load first)

   Currently:
     - Single workspace, single user, fully offline
     - Identity = stable local UUID from ParallelPersistence.workspaceId()
     - Owner = placeholder derived from onboarding name

   Future extension points:
     - workspaceId      → cloud workspace reference
     - ownerId          → authenticated user ID from auth layer
     - members[]        → team membership list
     - plan             → billing plan / feature gates
     - capabilities.*   → feature flags per plan or beta rollout

   All properties are read-only getters so the object can be used as a
   safe, observable view into localStorage state without risk of mutation.
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  function safeGet(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }

  var ParallelWorkspace = {

    /**
     * Stable workspace identifier.
     * Generated once on first run, survives reloads.
     * Will become the cloud workspace routing key in production.
     */
    get id() {
      return (global.ParallelPersistence && global.ParallelPersistence.workspaceId())
        || safeGet('px_workspace_id', 'ws_local');
    },

    /**
     * Workspace display name.
     * Falls back through: custom name → onboarding name → default.
     * Can be set to update px_workspace_name.
     */
    get name() {
      return safeGet('px_workspace_name', null)
        || safeGet('px_v19_name', null)
        || 'My Workspace';
    },
    set name(value) {
      try { localStorage.setItem('px_workspace_name', value); } catch (e) {}
    },

    /**
     * Workspace mode: agency | creator | product | personal.
     * Set during Phase 19 onboarding. Drives contextual defaults.
     */
    get mode() {
      return safeGet('px_v19_mode', 'personal');
    },

    /**
     * Local owner identity placeholder.
     * Replaced by authenticated user profile once auth is wired.
     * isLocal: true means this is a device-only identity.
     */
    get owner() {
      var wsId = global.ParallelPersistence
        ? global.ParallelPersistence.workspaceId()
        : safeGet('px_workspace_id', 'local');
      return {
        id:      'user_' + wsId,
        name:    safeGet('px_v19_name', 'User'),
        ownerId: null,    // future: populated by auth system
        isLocal: true,
      };
    },

    /**
     * Whether this workspace is connected to a cloud backend.
     * Always false until the sync layer is wired (Phase 26+).
     */
    get isCloudLinked() { return false; },

    /**
     * Whether the workspace has local changes not yet synced.
     * Reads syncMeta.pendingOpsCount from the saved state.
     */
    get hasPendingSync() {
      try {
        var raw = localStorage.getItem('parallel.studio.phase4.v2');
        if (!raw) return false;
        var state = JSON.parse(raw);
        return !!(state && state.syncMeta && state.syncMeta.pendingOpsCount > 0);
      } catch (e) { return false; }
    },

    /**
     * Workspace schema version from the migration system.
     */
    get schemaVersion() {
      var v = parseInt(localStorage.getItem('px_schema_version') || '1', 10);
      return isNaN(v) ? 1 : v;
    },

    /**
     * Workspace capability flags.
     * Used for conditional feature rendering and future plan-gating.
     *
     * Future: these will be driven by the user's plan and beta flags
     * returned from the auth/billing API.
     */
    get capabilities() {
      return {
        offlineSupport:  true,
        cloudSync:       false,   // Phase 26+: WebSocket / REST sync
        collaboration:   false,   // Phase 28+: multi-user real-time
        versionHistory:  false,   // Phase 27+: entity revision log
        aiFeatures:      true,
        multiWorkspace:  false,   // future: workspace switcher
      };
    },

    /**
     * Compact workspace summary for debug or status UI.
     */
    get summary() {
      return {
        id:           this.id,
        name:         this.name,
        mode:         this.mode,
        schemaVersion: this.schemaVersion,
        isCloudLinked: this.isCloudLinked,
        hasPendingSync: this.hasPendingSync,
      };
    },
  };

  global.ParallelWorkspace = ParallelWorkspace;

})(window);
