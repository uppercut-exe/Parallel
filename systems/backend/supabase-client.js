/* ─────────────────────────────────────────────────────────────────────────
   Parallel Supabase Client — Phase 24A: Supabase Architecture

   Safe wrapper around the Supabase JS SDK.

   Design principles:
     - NEVER crash if Supabase is not configured or SDK is not loaded
     - NEVER force login or block the app
     - NEVER make network calls unless isActive is true
     - Always falls back gracefully to local-only mode
     - All public methods are safe to call in local mode (they no-op or
       return sensible defaults)

   Loading the SDK:
     The Supabase JS v2 SDK is NOT bundled here. To activate cloud mode:
       1. Add the CDN script BEFORE this file in index.html:
          <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
       2. Set real credentials in backend-config.js

   Depends on: backend-config.js (must load first)

   Future extension points (Phase 24B+):
     - Auth session management (signIn, signOut, onAuthStateChange)
     - Realtime subscriptions (subscribe, unsubscribe)
     - Storage helpers (upload, download, getPublicUrl)
     - RPC calls for server-side functions
────────────────────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  var _client = null;
  var _initialized = false;
  var _initAttempted = false;

  /* ── Initialize the Supabase client ────────────────────────────────── */
  function init() {
    if (_initAttempted) return;
    _initAttempted = true;

    var config = global.ParallelBackendConfig;
    if (!config || !config.isConfigured()) {
      console.info('[Parallel] Backend not configured — running in local mode.');
      return;
    }

    var lib = global.supabase;
    if (!lib || typeof lib.createClient !== 'function') {
      console.info('[Parallel] Supabase SDK not loaded — running in local mode.');
      console.info('[Parallel] To enable cloud mode, add the Supabase CDN script to index.html.');
      return;
    }

    try {
      _client = lib.createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken:  true,
          persistSession:    true,
          detectSessionInUrl: false,  // do not interfere with hash-routing
        },
      });
      _initialized = true;
      console.info('[Parallel] Supabase client initialised — cloud mode active.');
    } catch (e) {
      console.warn('[Parallel] Supabase client init failed:', e);
    }
  }

  /* ── Non-blocking health check ──────────────────────────────────────── */
  function healthCheck() {
    var client = getClient();
    if (!client) {
      return Promise.resolve({ ok: false, latencyMs: 0, error: 'Not configured' });
    }
    var start = Date.now();
    return client
      .from(global.ParallelBackendConfig.TABLES.workspaces)
      .select('id')
      .limit(1)
      .then(function (res) {
        return { ok: !res.error, latencyMs: Date.now() - start, error: res.error || null };
      })
      .catch(function (err) {
        return { ok: false, latencyMs: Date.now() - start, error: err.message || String(err) };
      });
  }

  /* ── getClient: returns the Supabase client or null ────────────────── */
  function getClient() {
    if (!_initAttempted) init();
    return _client;
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  var ParallelSupabaseClient = {

    /** Whether a Supabase client is active (credentials set + SDK loaded) */
    get isActive() { if (!_initAttempted) init(); return _initialized && _client !== null; },

    /** 'local' | 'cloud' */
    get mode() { return this.isActive ? 'cloud' : 'local'; },

    /** Whether backend credentials are configured (even if SDK is missing) */
    isConfigured: function () {
      return !!(global.ParallelBackendConfig && global.ParallelBackendConfig.isConfigured());
    },

    /**
     * Get the Supabase JS client, or null if not available.
     * Always safe to call — returns null in local mode.
     */
    getClient: getClient,

    /**
     * Non-blocking health check.
     * Resolves with { ok: boolean, latencyMs: number, error: string|null }.
     * Never throws.
     */
    healthCheck: healthCheck,

    /** Whether a backend is reachable (same as isActive for now). */
    get backendAvailable() { return this.isActive; },

    /**
     * Safe helper: run a query only when active, otherwise return fallback.
     * Usage: ParallelSupabaseClient.query(c => c.from('pages').select('*'), [])
     */
    query: function (fn, fallback) {
      var client = getClient();
      if (!client) return Promise.resolve(fallback !== undefined ? fallback : null);
      try {
        var result = fn(client);
        return result && typeof result.then === 'function'
          ? result.catch(function () { return fallback !== undefined ? fallback : null; })
          : Promise.resolve(result);
      } catch (e) {
        console.warn('[Parallel] Supabase query error:', e);
        return Promise.resolve(fallback !== undefined ? fallback : null);
      }
    },
  };

  global.ParallelSupabaseClient = ParallelSupabaseClient;

})(window);
