/* ─────────────────────────────────────────────────────────────────────────
   Parallel Sharing + Permission Foundations — Phase 23

   Architecture-only layer. Does NOT implement public sharing yet.
   Prepares data model and placeholder APIs for Phase 26+ sharing features.

   Permission model:
     owner      — full control, can manage members
     editor     — can create, edit, and delete content
     commenter  — can comment but not edit content
     viewer     — read-only access

   Entity sharing fields (added to pages + databases):
     isPublic:       boolean  — false until sharing is activated
     shareToken:     string   — opaque token for future share links
     permissionLevel: string  — 'owner' | 'editor' | 'commenter' | 'viewer'
     sharedWith:     array    — list of { collaboratorId, role } grants
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  var PERMISSION_LEVELS = {
    OWNER:     'owner',
    EDITOR:    'editor',
    COMMENTER: 'commenter',
    VIEWER:    'viewer',
  };

  /* ── Generate a share token placeholder ─────────────────────────────── */
  function generateShareToken() {
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    var token = '';
    for (var i = 0; i < 12; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)); }
    return token;
  }

  /* ── Default sharing metadata for a new entity ──────────────────────── */
  function defaultSharingMeta() {
    return {
      isPublic:        false,
      shareToken:      null,     // generated on first share
      permissionLevel: PERMISSION_LEVELS.OWNER,
      sharedWith:      [],       // future: [{ collaboratorId, role }]
    };
  }

  /* ── Merge sharing fields onto an entity safely ─────────────────────── */
  function normalizeSharingMeta(entity) {
    if (!entity) return entity;
    if (!entity.sharingMeta) {
      entity.sharingMeta = defaultSharingMeta();
    } else {
      entity.sharingMeta.isPublic        = entity.sharingMeta.isPublic        || false;
      entity.sharingMeta.shareToken      = entity.sharingMeta.shareToken      || null;
      entity.sharingMeta.permissionLevel = entity.sharingMeta.permissionLevel || PERMISSION_LEVELS.OWNER;
      entity.sharingMeta.sharedWith      = entity.sharingMeta.sharedWith      || [];
    }
    return entity;
  }

  /* ── Check effective permission for current user ────────────────────── */
  function effectivePermission(entity) {
    // Phase 23: always owner (single-user mode)
    // Phase 26+: resolve from entity.sharingMeta.sharedWith + auth token
    return PERMISSION_LEVELS.OWNER;
  }

  function canEdit(entity)    { var p = effectivePermission(entity); return p === 'owner' || p === 'editor'; }
  function canComment(entity) { var p = effectivePermission(entity); return p === 'owner' || p === 'editor' || p === 'commenter'; }
  function canView(entity)    { return true; } // always in single-user mode

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelSharing = {

    LEVELS: PERMISSION_LEVELS,

    /** Return default sharing metadata for a new entity */
    defaultMeta: defaultSharingMeta,

    /** Normalize sharing fields onto an existing entity in-place */
    normalize: normalizeSharingMeta,

    /** Check if the current user can edit an entity */
    canEdit: canEdit,

    /** Check if the current user can comment on an entity */
    canComment: canComment,

    /** Check if the current user can view an entity */
    canView: canView,

    /** Activate sharing on an entity (Phase 26+: push to backend) */
    enableSharing: function(entity) {
      normalizeSharingMeta(entity);
      if (!entity.sharingMeta.shareToken) {
        entity.sharingMeta.shareToken = generateShareToken();
      }
      entity.sharingMeta.isPublic = true;
      // Future: queue a sync op to publish share settings
      return entity;
    },

    /** Disable public sharing on an entity */
    disableSharing: function(entity) {
      normalizeSharingMeta(entity);
      entity.sharingMeta.isPublic = false;
      return entity;
    },

    /** Add a collaborator grant to an entity */
    addGrant: function(entity, collaboratorId, role) {
      normalizeSharingMeta(entity);
      var existing = entity.sharingMeta.sharedWith.find(function(g) { return g.collaboratorId === collaboratorId; });
      if (existing) { existing.role = role; } else { entity.sharingMeta.sharedWith.push({ collaboratorId: collaboratorId, role: role }); }
      return entity;
    },

    /** Permission label for display */
    levelLabel: function(level) {
      var labels = { owner: 'Owner', editor: 'Can edit', commenter: 'Can comment', viewer: 'Can view' };
      return labels[level] || level;
    },
  };

  global.ParallelSharing = ParallelSharing;

})(window);
