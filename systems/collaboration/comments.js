/* ─────────────────────────────────────────────────────────────────────────
   Parallel Comments + Discussion System — Phase 23: Collaboration Foundations

   Lightweight threaded comments on records and pages.
   Comments feel calm, editorial, and integrated — not a chat product.

   Storage: localStorage key px_comments_v1
   Structure: flat list keyed by entityId

   Future: sync to backend, WebSocket real-time delivery, reactions
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  var COMMENTS_KEY = 'px_comments_v1';

  /* ── Comment factory ────────────────────────────────────────────────── */
  function makeComment(opts) {
    var me = global.ParallelCollaborators ? global.ParallelCollaborators.me : null;
    var now = new Date().toISOString();
    return {
      id:         'cmt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      entityId:   opts.entityId,
      entityKind: opts.entityKind || 'record',  // 'record' | 'page'
      parentId:   opts.parentId || null,         // null = top-level comment
      authorId:   (me && me.id)   || opts.authorId   || null,
      authorName: (me && me.displayName) || opts.authorName || 'You',
      body:       opts.body || '',
      mentions:   opts.mentions || [],           // array of collaborator ids
      createdAt:  opts.createdAt || now,
      updatedAt:  opts.updatedAt || now,
      resolved:   !!opts.resolved,
    };
  }

  /* ── Persistence ────────────────────────────────────────────────────── */
  var _store = null;  // { [commentId]: comment }

  function load() {
    if (_store) return _store;
    try {
      var raw = localStorage.getItem(COMMENTS_KEY);
      _store = raw ? JSON.parse(raw) : {};
    } catch (e) { _store = {}; }
    return _store;
  }

  function save() {
    try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(_store || {})); } catch (e) {}
  }

  /* ── Mention parsing ────────────────────────────────────────────────── */
  function parseMentions(body) {
    var found = [];
    var re = /@(\w[\w ]*\w|\w)/g;
    var m;
    while ((m = re.exec(body)) !== null) {
      var name = m[1];
      var c = global.ParallelCollaborators && global.ParallelCollaborators.byName(name);
      if (c) found.push(c.id);
    }
    return found;
  }

  /* ── Render mention-aware body ──────────────────────────────────────── */
  function renderBody(body) {
    if (!body) return '';
    // Replace @Name with a styled chip
    var escaped = body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return escaped.replace(/@([\w][\w ]*)(?=\s|$|[^a-z])/gi, function(match, name) {
      var c = global.ParallelCollaborators && global.ParallelCollaborators.byName(name.trim());
      return c
        ? '<span class="mention-chip">@' + name.trim() + '</span>'
        : match.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    });
  }

  /* ── Seed comments for demo workspace ──────────────────────────────── */
  function seedIfEmpty() {
    var store = load();
    if (Object.keys(store).length > 0) return;
    var now = Date.now();
    var seeds = [
      makeComment({ entityId: 'rec-project-lumena', entityKind: 'record', authorId: 'collab-kaia',  authorName: 'Kaia',  body: "Love the direction so far. The lilac is perfect — don't soften it too much.", createdAt: new Date(now - 7200000).toISOString(), updatedAt: new Date(now - 7200000).toISOString() }),
      makeComment({ entityId: 'rec-project-lumena', entityKind: 'record', authorId: 'collab-amara', authorName: 'Amara', body: '@Kaia agreed — we'll keep the lilac as the anchor and soften the secondary palette instead.', createdAt: new Date(now - 5400000).toISOString(), updatedAt: new Date(now - 5400000).toISOString() }),
      makeComment({ entityId: 'rec-project-lumena', entityKind: 'record', authorId: 'collab-rami',  authorName: 'Rami',  body: 'Should we finalize the typography scale before the next review?', createdAt: new Date(now - 1800000).toISOString(), updatedAt: new Date(now - 1800000).toISOString() }),
      makeComment({ entityId: 'rec-project-noura',  entityKind: 'record', authorId: 'collab-jad',   authorName: 'Jad',   body: 'Onboarding flow is locked in. Moving to the prototype next.', createdAt: new Date(now - 3600000).toISOString(), updatedAt: new Date(now - 3600000).toISOString() }),
      makeComment({ entityId: 'pg-brand-brief',     entityKind: 'page',   authorId: 'collab-amara', authorName: 'Amara', body: 'This is the source of truth for the brand. @Kaia and @Rami please review before Thursday.', createdAt: new Date(now - 86400000).toISOString(), updatedAt: new Date(now - 86400000).toISOString() }),
    ];
    seeds.forEach(function(c) { store[c.id] = c; });
    save();
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelComments = {

    /** Add a new comment. Returns the new comment object. */
    add: function(entityId, entityKind, body, opts) {
      var store = load();
      var mentions = parseMentions(body);
      var comment = makeComment({
        entityId:   entityId,
        entityKind: entityKind || 'record',
        authorId:   opts && opts.authorId,
        authorName: opts && opts.authorName,
        parentId:   opts && opts.parentId,
        body:       body,
        mentions:   mentions,
      });
      store[comment.id] = comment;
      save();

      // Track in activity feed
      if (global.ParallelActivity) {
        global.ParallelActivity.track(global.ParallelActivity.TYPES.COMMENT_ADDED, {
          entityId:    entityId,
          entityKind:  entityKind,
          entityTitle: opts && opts.entityTitle,
        });
      }

      return comment;
    },

    /** Get all comments for an entity, sorted oldest-first */
    forEntity: function(entityId) {
      var store = load();
      return Object.values(store)
        .filter(function(c) { return c.entityId === entityId && !c.resolved; })
        .sort(function(a, b) { return a.createdAt.localeCompare(b.createdAt); });
    },

    /** Resolve / dismiss a comment */
    resolve: function(commentId) {
      var store = load();
      if (store[commentId]) { store[commentId].resolved = true; save(); }
    },

    /** Delete a comment */
    remove: function(commentId) {
      var store = load();
      delete store[commentId];
      save();
    },

    /** Count active comments for an entity */
    count: function(entityId) {
      var store = load();
      return Object.values(store).filter(function(c) { return c.entityId === entityId && !c.resolved; }).length;
    },

    /** Render the comment body with mention chips */
    renderBody: renderBody,

    /** Render the full comments section HTML for a record/page */
    sectionHtml: function(entityId, entityKind, entityTitle) {
      var collab = global.ParallelCollaborators;
      var comments = this.forEntity(entityId);
      var me = collab ? collab.me : null;
      var meInitial = me ? collab.initials(me.displayName) : '?';
      var meColor = me ? collab.avatarColor(me.id) : { bg: '#dde8de', color: '#4a6e50' };

      var rows = comments.length ? comments.map(function(c) {
        var avatar  = collab ? collab.avatarHtml(c.authorId || c.authorName, 28) : '';
        var name    = collab ? collab.displayName(c.authorId || c.authorName) : (c.authorName || 'Someone');
        var time    = global.ParallelActivity ? global.ParallelActivity.timeAgo(c.createdAt) : '';
        var bodyHtml = renderBody(c.body);
        return '<div class="comment-row" data-comment-id="' + c.id + '">' +
          '<div class="comment-avatar">' + avatar + '</div>' +
          '<div class="comment-main">' +
            '<div class="comment-header">' +
              '<span class="comment-author">' + _esc(name) + '</span>' +
              '<span class="comment-time">' + _esc(time) + '</span>' +
              '<button class="comment-resolve" onclick="resolveComment(\'' + c.id + '\')" type="button" aria-label="Resolve"><i class="ti ti-check"></i></button>' +
            '</div>' +
            '<div class="comment-body">' + bodyHtml + '</div>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="comments-empty">No comments yet. Start the conversation.</div>';

      var escapedEntityId    = _esc(entityId);
      var escapedEntityKind  = _esc(entityKind || 'record');
      var escapedEntityTitle = _esc(entityTitle || '');

      return '<div class="comments-section" id="comments-' + escapedEntityId + '">' +
        '<div class="comments-header">' +
          '<i class="ti ti-message-circle"></i>' +
          '<span class="comments-title">Discussion</span>' +
          (comments.length ? '<span class="comments-count">' + comments.length + '</span>' : '') +
        '</div>' +
        '<div class="comments-list">' + rows + '</div>' +
        '<div class="comment-composer">' +
          '<span class="composer-avatar" style="background:' + meColor.bg + ';color:' + meColor.color + ';">' + _esc(meInitial) + '</span>' +
          '<div class="composer-input-wrap">' +
            '<textarea class="composer-input" placeholder="Add a comment… @mention to notify" rows="1" id="composer-input-' + escapedEntityId + '" oninput="autoResizeComposer(this)"></textarea>' +
          '</div>' +
          '<button class="composer-send" onclick="submitComment(\'' + escapedEntityId + '\',\'' + escapedEntityKind + '\',\'' + escapedEntityTitle + '\')" type="button" aria-label="Send"><i class="ti ti-send"></i></button>' +
        '</div>' +
      '</div>';
    },

    /** Seed seed comments if the workspace is fresh */
    seedIfEmpty: seedIfEmpty,
  };

  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.ParallelComments = ParallelComments;

})(window);
