/**
 * DIGITAL SAFETY HUB — api.js
 * Single API client. Every function is exported.
 * No window.* — imported by app.js and other modules.
 *
 * Endpoints match main.py exactly:
 *   POST /v1/quiz/submit
 *   GET  /v1/quiz/stats
 *   POST /v1/tips/submit
 *   GET  /v1/tips/count
 *   GET  /api/analyze
 *   GET  /v1/health
 */

'use strict';

export const BACKEND_URL = 'https://digital-safety-hub.onrender.com';

/* ============================================================
   HELPER
   ============================================================ */
async function apiFetch(path, options = {}) {
  const url        = BACKEND_URL.replace(/\/$/, '') + path;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
    throw err;
  }
}

/* ============================================================
   QUIZ
   ============================================================ */
export async function submitQuizResult(name, score, total = 10) {
  return apiFetch('/v1/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ name: name || null, score, total })
  });
}

export async function getQuizStats() {
  return apiFetch('/v1/quiz/stats');
}

/* ============================================================
   COMMUNITY TIPS
   ============================================================ */
export async function submitTip(scamType, description) {
  return apiFetch('/v1/tips/submit', {
    method: 'POST',
    body: JSON.stringify({ scam_type: scamType || 'unknown', description: description || '' })
  });
}

export async function getTipCounts() {
  return apiFetch('/v1/tips/count');
}

/* ============================================================
   HEALTH
   ============================================================ */
export async function checkBackendHealth() {
  return apiFetch('/v1/health');
}