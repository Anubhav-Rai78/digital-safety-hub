/**
 * DIGITAL SAFETY HUB — main.js
 * Navigation, Theme, Modals, Decision Tree, Toast, Aegis Chat, Community Stats.
 * All functions exported — wired by app.js.
 *
 * showView does NOT call view-specific inits here.
 * app.js handles that because it has all the imports.
 */

'use strict';

import { BACKEND_URL, getQuizStats } from './api.js';

/* ============================================================
   NAVIGATION
   ============================================================ */
export function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewId);
  });
  // View-specific inits are dispatched from app.js via onViewChange
}

/* ============================================================
   THEME
   ============================================================ */
const THEME_KEY = 'dsh_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const checkbox = document.getElementById('theme-checkbox');
  if (checkbox) checkbox.checked = (theme === 'dark');
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function initTheme() {
  const saved     = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);

  const checkbox = document.getElementById('theme-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => applyTheme(checkbox.checked ? 'dark' : 'light'));
  }
}

/* ============================================================
   HAMBURGER
   ============================================================ */
export function closeDrawer() {
  const drawer = document.getElementById('nav-drawer');
  const btn    = document.getElementById('hamburger-btn');
  if (drawer) drawer.classList.remove('open');
  if (btn)    btn.setAttribute('aria-expanded', 'false');
}

export function initHamburger() {
  const btn    = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('nav-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') &&
        !drawer.contains(e.target) &&
        !btn.contains(e.target)) {
      closeDrawer();
    }
  });
}

/* ============================================================
   MODALS
   ============================================================ */
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

export function initModals() {
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
      const chat = document.getElementById('aegis-chat');
      if (chat && !chat.classList.contains('hidden')) toggleAegis();
    }
  });
}

/* ============================================================
   TOAST
   ============================================================ */
export function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ============================================================
   DECISION TREE
   ============================================================ */
const DECISION_TREE = {
  start:             { q: 'Did they ask for your OTP, PIN, password, or CVV?',                           yes: 'scam_otp',          no: 'step2'        },
  step2:             { q: 'Did they send you a link and ask you to click it urgently?',                  yes: 'scam_phishing',     no: 'step3'        },
  step3:             { q: 'Are they claiming to be from a bank, government, police, or courier?',        yes: 'scam_impersonation',no: 'step4'        },
  step4:             { q: 'Did they offer a job, prize, or investment with guaranteed returns?',          yes: 'scam_job_lottery',  no: 'verdict_safe' },
  scam_otp:          { verdict: 'scam', title: '🚨 This is a SCAM',              message: 'No legitimate bank, government body, or service will ever ask for your OTP, PIN, or password. Hang up immediately. Do not share anything.' },
  scam_phishing:     { verdict: 'scam', title: '🚨 This is a Phishing Attempt',  message: 'Scammers use urgency to make you click without thinking. Do not click the link. Screenshot and report it.' },
  scam_impersonation:{ verdict: 'scam', title: '🚨 This is an Impersonation Scam',message: 'Fake police, fake bank officials, and "digital arrest" calls are among India\'s fastest growing scams. Hang up. Call the official number directly.' },
  scam_job_lottery:  { verdict: 'scam', title: '🚨 This is a Job / Lottery Scam', message: 'Legitimate jobs and lotteries never require upfront fees. Anyone asking for money before giving you a job or prize is a scammer.' },
  verdict_safe:      { verdict: 'safe', title: '✅ Probably Safe — Stay Alert',   message: 'No obvious red flags detected. Always verify the caller\'s identity through official channels before sharing any personal or financial information.' }
};

export function openDecisionTree() {
  renderDecisionStep('start');
  openModal('decision-modal');
}

export function closeDecisionTree() {
  closeModal('decision-modal');
}

export function renderDecisionStep(stepId) {
  const step      = DECISION_TREE[stepId];
  const container = document.getElementById('decision-tree-content');
  if (!container || !step) return;

  if (step.verdict) {
    const isScam = step.verdict === 'scam';
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-4) 0;">
        <div style="font-size:2.5rem;margin-bottom:var(--space-4);">${isScam ? '🚨' : '✅'}</div>
        <h3 style="margin-bottom:var(--space-3);color:${isScam ? 'var(--danger)' : 'var(--accent)'};">${step.title}</h3>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-6);">${step.message}</p>
        <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;">
          <button class="btn ${isScam ? 'btn-danger' : 'btn-glass'}" id="_dt_action">
            ${isScam ? 'Report This Now →' : 'Learn to Verify →'}
          </button>
          <button class="btn btn-glass" id="_dt_restart">Check Another</button>
        </div>
      </div>
    `;
    document.getElementById('_dt_action')?.addEventListener('click', () => {
      closeDecisionTree();
      // Use the global bridge set by app.js
      window._dsh?.showView(isScam ? 'report' : 'verify');
    });
    document.getElementById('_dt_restart')?.addEventListener('click', () => renderDecisionStep('start'));
    return;
  }

  container.innerHTML = `
    <p style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-5);line-height:1.5;">${step.q}</p>
    <div style="display:flex;flex-direction:column;gap:var(--space-3);">
      <button class="btn btn-danger btn-full" id="_dt_yes">Yes</button>
      <button class="btn btn-glass btn-full"  id="_dt_no">No</button>
    </div>
    <button class="btn btn-glass btn-sm" style="margin-top:var(--space-4);" id="_dt_back">← Start over</button>
  `;
  document.getElementById('_dt_yes')?. addEventListener('click', () => renderDecisionStep(step.yes));
  document.getElementById('_dt_no')?.addEventListener('click',  () => renderDecisionStep(step.no));
  document.getElementById('_dt_back')?.addEventListener('click',() => renderDecisionStep('start'));
}

/* ============================================================
   AEGIS AI CHAT
   ============================================================ */
export function toggleAegis() {
  const chat = document.getElementById('aegis-chat');
  if (!chat) return;
  const isHidden = chat.classList.toggle('hidden');
  if (!isHidden) {
    const history = document.getElementById('chat-history');
    if (history && history.children.length === 0) {
      appendBotMsg('👋 I am Aegis, your AI Digital Safety Guardian. Paste any suspicious message, SMS, or ask me anything about scams in India.');
    }
  }
}

export function askAegis(topic) {
  const chat  = document.getElementById('aegis-chat');
  const input = document.getElementById('ai-input');
  if (chat)  chat.classList.remove('hidden');
  if (input) { input.value = `Analyze the risk of "${topic}" scams in India.`; sendAegisMessage(); }
}

export async function sendAegisMessage() {
  const input   = document.getElementById('ai-input');
  const history = document.getElementById('chat-history');
  if (!input || !history) return;

  const query = input.value.trim();
  if (!query) return;

  appendUserMsg(query);
  input.value = '';
  history.scrollTop = history.scrollHeight;

  const thinkDiv = document.createElement('div');
  thinkDiv.className   = 'chat-msg bot-msg';
  thinkDiv.textContent = '⏳ Consulting Aegis Fortress…';
  history.appendChild(thinkDiv);
  history.scrollTop = history.scrollHeight;

  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze?text=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(response.status === 429 ? '429' : 'offline');
    const data = await response.json();
    thinkDiv.textContent = data.reply || 'Analysis complete but no data returned.';
  } catch (err) {
    thinkDiv.textContent = err.message === '429'
      ? '🛡️ Aegis is cooling down (API quota). Please wait 60 seconds.'
      : '⚠️ Cannot reach Aegis backend. Make sure the Render service is running.';
    thinkDiv.style.color = 'var(--danger)';
  }
  history.scrollTop = history.scrollHeight;
}

function appendUserMsg(text) {
  const history = document.getElementById('chat-history');
  if (!history) return;
  const div = document.createElement('div');
  div.className   = 'chat-msg user-msg';
  div.textContent = text;
  history.appendChild(div);
}

function appendBotMsg(text) {
  const history = document.getElementById('chat-history');
  if (!history) return;
  const div = document.createElement('div');
  div.className   = 'chat-msg bot-msg';
  div.textContent = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

/* ============================================================
   COMMUNITY STATS
   ============================================================ */
export async function loadCommunityStats() {
  const elTakers    = document.getElementById('stat-takers');
  const elAvg       = document.getElementById('stat-avg');
  const elGuardians = document.getElementById('stat-guardians');
  const elFallback  = document.getElementById('stats-fallback');
  const elChart     = document.getElementById('stats-chart');
  if (!elTakers) return;

  try {
    const data = await getQuizStats();
    if (!data || data.total_takers === 0) {
      if (elFallback) elFallback.style.display = 'block';
      if (elChart)    elChart.style.display    = 'none';
      return;
    }
    if (elFallback) elFallback.style.display = 'none';

    const guardianCount = Object.entries(data.distribution || {})
      .filter(([score]) => parseInt(score) >= 8)
      .reduce((sum, [, count]) => sum + count, 0);

    animateCount(elTakers,    0, data.total_takers, 1200);
    animateCount(elAvg,       0, data.avg_score,    1000, true);
    animateCount(elGuardians, 0, guardianCount,      1200);

    if (elChart && typeof ApexCharts !== 'undefined' && data.distribution) {
      elChart.style.display = 'block';
      renderStatsChart(elChart, data.distribution);
    }
  } catch (e) {
    console.warn('Community stats unavailable:', e.message);
    if (elFallback) {
      elFallback.textContent   = '📊 Community stats temporarily unavailable.';
      elFallback.style.display = 'block';
    }
  }
}

function animateCount(el, from, to, duration, isDecimal = false) {
  if (!el) return;
  const start = performance.now();
  function step(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const val      = from + (to - from) * eased;
    el.textContent = isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderStatsChart(container, distribution) {
  const isDark      = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor   = isDark ? '#B3B3B3' : '#374151';
  const accentColor = isDark ? '#1DB954'  : '#0D7A3E';

  const sorted = Object.entries(distribution).sort(([a], [b]) => parseInt(a) - parseInt(b));

  const chart = new ApexCharts(container, {
    chart: { type: 'bar', height: 160, background: 'transparent', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
    series: [{ name: 'People', data: sorted.map(([, v]) => v) }],
    xaxis: { categories: sorted.map(([k]) => `Score ${k}`), labels: { style: { colors: textColor, fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: textColor } } },
    fill:  { colors: [accentColor] },
    dataLabels: { enabled: false },
    grid: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: v => `${v} people` } },
    plotOptions: { bar: { borderRadius: 6 } }
  });
  chart.render();

  window.addEventListener('themechange', ({ detail }) => {
    const d = detail.theme === 'dark';
    chart.updateOptions({
      chart: { background: 'transparent' },
      xaxis: { labels: { style: { colors: d ? '#B3B3B3' : '#374151' } } },
      fill:  { colors: [d ? '#1DB954' : '#0D7A3E'] },
      grid:  { borderColor: d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      tooltip: { theme: d ? 'dark' : 'light' }
    });
  });
}