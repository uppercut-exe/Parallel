/* ─────────────────────────────────────────────────────────────────────────
   Parallel Collaborator Identity Layer — Phase 23: Collaboration Foundations

   Manages people-aware identity within a workspace. Currently single-user
   with mock collaborator data for attribution, comments, and activity.

   Designed to extend to real multi-user auth without rewrites:
     - collaboratorId  → cloud user ID from auth layer
     - role            → driven by backend permission API
     - avatarUrl       → user profile photo URL

   Depends on: persistence-layer.js, workspace.js (must load first)
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  /* ── Role constants ────────────────────────────────────────────────── */
  var ROLES = {
    OWNER:     'owner',
    EDITOR:    'editor',
    COMMENTER: 'commenter',
    VIEWER:    'viewer'
  };

  /* ── Avatar color palette (warm, editorial) ─────────────────────────── */
  var AVATAR_COLORS = [
    { bg: '#dde8de', color: '#4a6e50' },  // sage
    { bg: '#e8e4f0', color: '#7060a8' },  // lilac
    { bg: '#f2e8dc', color: '#9a5c28' },  // peach
    { bg: '#dce8f4', color: '#3a5f90' },  // sky
    { bg: '#f8dce4', color: '#9a3858' },  // rose
    { bg: '#f0e4b8', color: '#8a6820' },  // amber
  ];

  function avatarColorFor(id) {
    var hash = 0;
    for (var i = 0; i < id.length; i++) { hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff; }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  function initials(displayName) {
    var parts = (displayName || 'U').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0][0] || 'U').toUpperCase();
  }

  /* ── Collaborator factory ───────────────────────────────────────────── */
  function makeCollaborator(opts) {
    var now = new Date().toISOString();
    return {
      id:           opts.id,
      displayName:  opts.displayName || 'Unknown',
      email:        opts.email || null,
      avatarUrl:    opts.avatarUrl || null,    // null = use initials avatar
      role:         ROLES[opts.role] || opts.role || ROLES.EDITOR,
      joinedAt:     opts.joinedAt || now,
      lastActiveAt: opts.lastActiveAt || now,
      isLocal:      !!opts.isLocal,            // true = device-only identity
      color:        avatarColorFor(opts.id),
    };
  }

  /* ── Seed collaborators (mock workspace team) ───────────────────────── */
  // The owner is derived from onboarding. Collaborators are mock for now
  // and will be replaced by real team data when auth is wired.
  var _seedCollaborators = [
    makeCollaborator({ id: 'collab-amara', displayName: 'Amara',   role: 'OWNER',  joinedAt: '2026-01-10T09:00:00Z', lastActiveAt: '2026-05-21T14:30:00Z', isLocal: true }),
    makeCollaborator({ id: 'collab-kaia',  displayName: 'Kaia',    role: 'EDITOR', joinedAt: '2026-01-15T10:00:00Z', lastActiveAt: '2026-05-20T16:00:00Z' }),
    makeCollaborator({ id: 'collab-jad',   displayName: 'Jad',     role: 'EDITOR', joinedAt: '2026-02-01T11:00:00Z', lastActiveAt: '2026-05-19T09:45:00Z' }),
    makeCollaborator({ id: 'collab-rami',  displayName: 'Rami',    role: 'COMMENTER', joinedAt: '2026-03-05T08:30:00Z', lastActiveAt: '2026-05-18T11:15:00Z' }),
    makeCollaborator({ id: 'collab-maya',  displayName: 'Maya',    role: 'VIEWER', joinedAt: '2026-04-12T14:00:00Z', lastActiveAt: '2026-05-17T15:00:00Z' }),
  ];

  var _collaborators = {};
  _seedCollaborators.forEach(function(c) { _collaborators[c.id] = c; });

  /* ── Resolve workspace owner from onboarding data ───────────────────── */
  function resolveOwner() {
    try {
      var name = localStorage.getItem('px_v19_name') || 'Amara';
      var wsId = (global.ParallelPersistence && global.ParallelPersistence.workspaceId()) || 'ws_local';
      var ownerId = 'owner_' + wsId;
      if (!_collaborators[ownerId]) {
        _collaborators[ownerId] = makeCollaborator({
          id: ownerId,
          displayName: name,
          role: 'OWNER',
          isLocal: true,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        });
      } else {
        _collaborators[ownerId].displayName = name;
      }
      return _collaborators[ownerId];
    } catch (e) { return _collaborators['collab-amara']; }
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelCollaborators = {

    ROLES: ROLES,

    /** All collaborators in the workspace */
    get all() { return Object.values(_collaborators); },

    /** Workspace owner (matches onboarding name) */
    get owner() { return resolveOwner(); },

    /** Current active user (same as owner until auth is wired) */
    get me() { return resolveOwner(); },

    /** Look up a collaborator by id */
    get: function(id) { return _collaborators[id] || null; },

    /** Find collaborator by display name (case-insensitive) */
    byName: function(name) {
      if (!name) return null;
      var ln = name.toLowerCase();
      return Object.values(_collaborators).find(function(c) { return c.displayName.toLowerCase() === ln; }) || null;
    },

    /** Resolve id → collaborator, falling back to name → lookup */
    resolve: function(idOrName) {
      return this.get(idOrName) || this.byName(idOrName) || null;
    },

    /** Display name for an id/name string */
    displayName: function(idOrName) {
      var c = this.resolve(idOrName);
      return c ? c.displayName : (idOrName || 'Unknown');
    },

    /** Initials for avatar */
    initials: initials,

    /** Avatar color for a collaborator id */
    avatarColor: avatarColorFor,

    /** Render a small avatar chip (HTML string) */
    avatarHtml: function(idOrName, size) {
      size = size || 24;
      var c = this.resolve(idOrName);
      var name = c ? c.displayName : (idOrName || '?');
      var clr = c ? c.color : avatarColorFor(idOrName || '?');
      var ini = initials(name);
      return '<span class="collab-avatar" style="width:' + size + 'px;height:' + size + 'px;background:' + clr.bg + ';color:' + clr.color + ';font-size:' + Math.round(size * 0.42) + 'px;" title="' + name + '">' + ini + '</span>';
    },

    /** Role label for display */
    roleLabel: function(role) {
      var labels = { owner: 'Owner', editor: 'Editor', commenter: 'Commenter', viewer: 'Viewer' };
      return labels[role] || role;
    },

    /** Add or update a collaborator (for future auth integration) */
    register: function(opts) {
      var c = makeCollaborator(opts);
      _collaborators[c.id] = c;
      return c;
    },
  };

  global.ParallelCollaborators = ParallelCollaborators;

})(window);
