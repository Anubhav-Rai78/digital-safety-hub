/**
 * DIGITAL SAFETY HUB — api.js
 * All API calls in one place.
 * Uses your Render backend as a proxy to Supabase.
 *
 * Functions exposed on window:
 *   submitQuizResult(name, score, breakdown)  → saves to supabase quiz_results
 *   getQuizStats()                            → returns community stats
 *   submitTip(scamType, description)          → saves scam report tip
 *   getTipCounts()                            → returns tip count per category
 *
 * BACKEND_URL is set in main.js (window.BACKEND_URL).
 * These functions read from there so you only change it once.
 */

'use strict';

/* ============================================================
   HELPER — generic fetch with timeout and error normalisation
   ============================================================ */
async function apiFetch(path, options = {}) {
  const base = window.BACKEND_URL || 'https://digital-safety-hub.onrender.com';
  const url  = base.replace(/\/$/, '') + path;

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}`);
    }

    return await res.json();

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
    throw err;
  }
}


/* ============================================================
   QUIZ RESULTS
   ============================================================ */

/**
 * Submit a completed quiz result to Supabase via backend.
 * @param {string} name       - User's name (optional, can be empty string)
 * @param {number} score      - Score out of 10
 * @param {Object} breakdown  - { category: correct_count } — used for weak area detection
 * @returns {Promise<Object>}
 */
window.submitQuizResult = async function (name, score, breakdown) {
  return apiFetch('/api/quiz-submit', {
    method: 'POST',
    body: JSON.stringify({
      name:      name || 'Anonymous',
      score:     score,
      breakdown: breakdown || {}
    })
  });
};

/**
 * Get community quiz stats for the dashboard and result screen.
 * Returns: { count, avg_score, guardian_count, distribution }
 * distribution = { "0-3": N, "4-6": N, "7-8": N, "9-10": N }
 */
window.getQuizStats = async function () {
  return apiFetch('/api/quiz-stats');
};


/* ============================================================
   SCAM TIPS / REPORTS
   ============================================================ */

/**
 * Submit an anonymous scam tip from the report modal on scam cards.
 * @param {string} scamType   - Scam category name
 * @param {string} description - Optional user description
 */
window.submitTip = async function (scamType, description) {
  return apiFetch('/api/tip-submit', {
    method: 'POST',
    body: JSON.stringify({
      scam_type:   scamType || 'Unknown',
      description: description || ''
    })
  });
};

/**
 * Get tip counts per scam category.
 * Returns: { otp: 14, upi: 8, phishing: 22, ... }
 */
window.getTipCounts = async function () {
  return apiFetch('/api/tip-counts');
};


/* ============================================================
   DIRECT SUPABASE CLIENT (fallback / future use)
   Only used if you want to query Supabase directly from frontend
   without going through the backend. Requires supabase-js CDN.
   Left here for future expansion — not used by default.
   ============================================================ */
window.getSupabaseClient = function () {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not set in main.js');
    return null;
  }

  // Only works if supabase-js CDN is loaded
  if (typeof window.supabase !== 'undefined') {
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  return null;
};