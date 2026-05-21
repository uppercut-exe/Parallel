/* ─────────────────────────────────────────────────────────────────────────
   Parallel Backend Configuration — Phase 24A: Supabase Architecture

   Single source of truth for backend connection settings.
   Currently ships with placeholder values so the app runs fully offline.

   To enable cloud mode:
     1. Create a Supabase project at https://supabase.com
     2. Copy your Project URL and anon key from Project Settings > API
     3. Replace the placeholder values below with your real credentials
     4. Load the Supabase JS SDK CDN script before this file in index.html

   The app never crashes, logs in, or blocks the user if credentials are
   missing — it simply continues in local-only mode.

   Future extension:
     - Pull from environment variables at build time (Phase 24B+)
     - Multi-project support for workspace switching
     - Feature flags driven by plan/capability API
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  var PLACEHOLDER_URL = 'SUPABASE_URL';
  var PLACEHOLDER_KEY = 'SUPABASE_ANON_KEY';

  /* ── Runtime configuration ──────────────────────────────────────────── */
  var _cfg = {
    url:     PLACEHOLDER_URL,
    anonKey: PLACEHOLDER_KEY,
  };

  /* ── Detect whether real credentials are present ───────────────────── */
  function isConfigured() {
    return (
      _cfg.url !== PLACEHOLDER_URL &&
      _cfg.anonKey !== PLACEHOLDER_KEY &&
      _cfg.url.startsWith('https://') &&
      _cfg.anonKey.length > 20
    );
  }

  /* ── Table name constants ────────────────────────────────────────────
     Centralised here so renaming a table only requires one change.
  ────────────────────────────────────────────────────────────────────── */
  var TABLES = Object.freeze({
    profiles:         'profiles',
    workspaces:       'workspaces',
    workspaceMembers: 'workspace_members',
    pages:            'pages',
    blocks:           'blocks',
    databases:        'databases',
    records:          'database_records',
    relations:        'record_relations',
    comments:         'comments',
    activity:         'activity_events',
    assets:           'assets',
    aiOutputs:        'ai_outputs',
    syncOps:          'sync_operations',
  });

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelBackendConfig = {

    TABLES: TABLES,

    /** Supabase project URL (placeholder until credentials are set) */
    get url()     { return _cfg.url; },

    /** Supabase public anon key (placeholder until credentials are set) */
    get anonKey() { return _cfg.anonKey; },

    /** Whether real Supabase credentials have been supplied */
    isConfigured: isConfigured,

    /** 'local' | 'cloud' */
    get mode() { return isConfigured() ? 'cloud' : 'local'; },

    /** Human-readable status for the backend status chip */
    get statusLabel() { return isConfigured() ? 'Cloud ready' : 'Local workspace'; },

    /** Override credentials at runtime (for future auth integration) */
    configure: function (url, anonKey) {
      if (typeof url === 'string' && url.startsWith('https://')) {
        _cfg.url     = url;
        _cfg.anonKey = anonKey || PLACEHOLDER_KEY;
        console.info('[Parallel] Backend configured:', url);
      } else {
        console.warn('[Parallel] Invalid backend URL — remaining in local mode.');
      }
    },
  };

  global.ParallelBackendConfig = ParallelBackendConfig;

})(window);
