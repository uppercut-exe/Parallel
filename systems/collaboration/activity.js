/* ─────────────────────────────────────────────────────────────────────────
   Parallel Activity Feed — Phase 23: Collaboration Foundations

   Tracks workspace operational history as an ambient, calm feed.
   Events are stored in localStorage and surfaced in the Studio Command
   Center and record pages.

   Designed to extend to a real event stream when sync is wired:
     - push events to a backend append-only log
     - drain and merge on reconnect

   Depends on: persistence-layer.js, collaborators.js
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  var ACTIVITY_KEY = 'px_activity_v1';
  var MAX_EVENTS   = 120;   // cap to avoid unbounded growth

  /* ── Event type catalog ─────────────────────────────────────────────── */
  var EVENT_TYPES = {
    PAGE_CREATED:       'page_created',
    PAGE_UPDATED:       'page_updated',
    PAGE_ARCHIVED:      'page_archived',
    RECORD_CREATED:     'record_created',
    RECORD_UPDATED:     'record_updated',
    RECORD_ARCHIVED:    'record_archived',
    STATUS_CHANGED:     'status_changed',
    COMMENT_ADDED:      'comment_added',
    RELATION_ADDED:     'relation_added',
    DATABASE_CREATED:   'database_created',
    AI_SUMMARY:         'ai_summary',
    DATE_CHANGED:       'date_changed',
    WORKSPACE_SETUP:    'workspace_setup',
  };

  /* ── Icon + copy map for events ─────────────────────────────────────── */
  var EVENT_META = {
    page_created:     { icon: 'ti-file-plus',     verb: 'created a page' },
    page_updated:     { icon: 'ti-pencil',         verb: 'updated a page' },
    page_archived:    { icon: 'ti-archive',        verb: 'archived a page' },
    record_created:   { icon: 'ti-circle-plus',    verb: 'added a record' },
    record_updated:   { icon: 'ti-pencil',         verb: 'updated a record' },
    record_archived:  { icon: 'ti-archive',        verb: 'archived a record' },
    status_changed:   { icon: 'ti-circle-dot',     verb: 'changed status' },
    comment_added:    { icon: 'ti-message-circle', verb: 'left a comment' },
    relation_added:   { icon: 'ti-link',           verb: 'linked a record' },
    database_created: { icon: 'ti-database',       verb: 'created a database' },
    ai_summary:       { icon: 'ti-sparkles',       verb: 'ran an AI action' },
    date_changed:     { icon: 'ti-calendar',       verb: 'updated a date' },
    workspace_setup:  { icon: 'ti-settings',       verb: 'set up the workspace' },
  };

  /* ── In-memory event store (loaded from localStorage on init) ───────── */
  var _events = [];
  var _loaded = false;

  function safeRead() {
    try {
      var raw = localStorage.getItem(ACTIVITY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function safeWrite(events) {
    try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events)); } catch (e) {}
  }

  function ensureLoaded() {
    if (!_loaded) { _events = safeRead(); _loaded = true; }
  }

  /* ── Activity event factory ─────────────────────────────────────────── */
  function makeEvent(type, opts) {
    var me = global.ParallelCollaborators ? global.ParallelCollaborators.me : null;
    return {
      id:         'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type:       type,
      actorId:    (me && me.id) || opts.actorId || null,
      actorName:  (me && me.displayName) || opts.actorName || null,
      entityId:   opts.entityId || null,
      entityKind: opts.entityKind || null,   // 'page' | 'record' | 'database' | 'comment'
      entityTitle: opts.entityTitle || null,
      databaseId: opts.databaseId || null,
      meta:       opts.meta || {},           // type-specific extra data
      createdAt:  new Date().toISOString(),
    };
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelActivity = {

    TYPES: EVENT_TYPES,

    /** Record a new activity event */
    track: function(type, opts) {
      ensureLoaded();
      var evt = makeEvent(type, opts || {});
      _events.unshift(evt);
      if (_events.length > MAX_EVENTS) _events = _events.slice(0, MAX_EVENTS);
      safeWrite(_events);
      return evt;
    },

    /** Get recent events (newest first) */
    recent: function(limit) {
      ensureLoaded();
      return (limit ? _events.slice(0, limit) : _events.slice());
    },

    /** Get events for a specific entity */
    forEntity: function(entityId, limit) {
      ensureLoaded();
      var filtered = _events.filter(function(e) { return e.entityId === entityId; });
      return limit ? filtered.slice(0, limit) : filtered;
    },

    /** Get events from the last N hours */
    sinceHours: function(hours) {
      ensureLoaded();
      var cutoff = new Date(Date.now() - hours * 3600000).toISOString();
      return _events.filter(function(e) { return e.createdAt >= cutoff; });
    },

    /** Human-readable time ago string */
    timeAgo: function(isoString) {
      var ms = Date.now() - new Date(isoString).getTime();
      var s = Math.floor(ms / 1000);
      if (s < 60)  return 'just now';
      var m = Math.floor(s / 60);
      if (m < 60)  return m + 'm ago';
      var h = Math.floor(m / 60);
      if (h < 24)  return h + 'h ago';
      var d = Math.floor(h / 24);
      if (d < 7)   return d + 'd ago';
      return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    },

    /** Icon for an event type */
    icon: function(type) {
      return (EVENT_META[type] && EVENT_META[type].icon) || 'ti-activity';
    },

    /** Verb phrase for an event type */
    verb: function(type) {
      return (EVENT_META[type] && EVENT_META[type].verb) || 'did something';
    },

    /** Render one activity row as HTML */
    rowHtml: function(evt) {
      var collab = global.ParallelCollaborators;
      var name   = (collab && collab.displayName(evt.actorId || evt.actorName)) || evt.actorName || 'Someone';
      var avatar = collab ? collab.avatarHtml(evt.actorId || evt.actorName, 24) : '';
      var icon   = this.icon(evt.type);
      var verb   = this.verb(evt.type);
      var title  = evt.entityTitle || '';
      var time   = this.timeAgo(evt.createdAt);
      return '<div class="activity-row">' +
        '<div class="activity-avatar">' + avatar + '</div>' +
        '<div class="activity-body">' +
          '<span class="activity-actor">' + _esc(name) + '</span> ' +
          '<span class="activity-verb">' + _esc(verb) + '</span>' +
          (title ? ' <span class="activity-entity">' + _esc(title) + '</span>' : '') +
        '</div>' +
        '<span class="activity-time">' + _esc(time) + '</span>' +
      '</div>';
    },

    /** Seed initial activity events for a fresh workspace */
    seedIfEmpty: function() {
      ensureLoaded();
      if (_events.length > 0) return;
      var now = Date.now();
      var seed = [
        { type: EVENT_TYPES.PAGE_CREATED,   actorId: 'collab-amara', actorName: 'Amara', entityId: 'pg-brand-brief',       entityKind: 'page',     entityTitle: 'Lumena Brand Brief',         createdAt: new Date(now - 8640000*2).toISOString() },
        { type: EVENT_TYPES.RECORD_CREATED, actorId: 'collab-amara', actorName: 'Amara', entityId: 'rec-project-lumena',   entityKind: 'record',   entityTitle: 'Lumena Brand Identity',      createdAt: new Date(now - 8640000*2 + 300000).toISOString() },
        { type: EVENT_TYPES.RECORD_CREATED, actorId: 'collab-jad',   actorName: 'Jad',   entityId: 'rec-project-noura',    entityKind: 'record',   entityTitle: 'Noura App MVP',              createdAt: new Date(now - 8640000).toISOString() },
        { type: EVENT_TYPES.STATUS_CHANGED, actorId: 'collab-kaia',  actorName: 'Kaia',  entityId: 'rec-project-lumena',   entityKind: 'record',   entityTitle: 'Lumena Brand Identity',      meta: { from: 'Exploring', to: 'In Progress' }, createdAt: new Date(now - 7200000).toISOString() },
        { type: EVENT_TYPES.PAGE_UPDATED,   actorId: 'collab-kaia',  actorName: 'Kaia',  entityId: 'pg-client-notes',      entityKind: 'page',     entityTitle: 'Client Presentation Notes',  createdAt: new Date(now - 5400000).toISOString() },
        { type: EVENT_TYPES.RECORD_CREATED, actorId: 'collab-rami',  actorName: 'Rami',  entityId: 'rec-meeting-lumena-review', entityKind: 'record', entityTitle: 'Lumena review',            createdAt: new Date(now - 3600000).toISOString() },
        { type: EVENT_TYPES.COMMENT_ADDED,  actorId: 'collab-amara', actorName: 'Amara', entityId: 'rec-project-lumena',   entityKind: 'record',   entityTitle: 'Lumena Brand Identity',      createdAt: new Date(now - 1800000).toISOString() },
        { type: EVENT_TYPES.AI_SUMMARY,     actorId: 'collab-amara', actorName: 'Amara', entityId: 'rec-project-lumena',   entityKind: 'record',   entityTitle: 'Lumena Brand Identity',      createdAt: new Date(now - 900000).toISOString() },
      ];
      seed.forEach(function(s) {
        _events.push({ id: 'evt-seed-' + Math.random().toString(36).slice(2), type: s.type, actorId: s.actorId, actorName: s.actorName, entityId: s.entityId, entityKind: s.entityKind, entityTitle: s.entityTitle, databaseId: s.databaseId || null, meta: s.meta || {}, createdAt: s.createdAt });
      });
      _events.sort(function(a, b) { return b.createdAt.localeCompare(a.createdAt); });
      safeWrite(_events);
    },
  };

  /* private escape helper local to this module */
  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.ParallelActivity = ParallelActivity;

})(window);
