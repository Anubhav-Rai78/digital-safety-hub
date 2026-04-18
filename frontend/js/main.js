/**
 * DIGITAL SAFETY HUB — main.js
 * Handles: Navigation, Theme Toggle, Modals, Decision Tree FAB,
 *          Toast Notifications, Aegis AI Chat, Community Stats
 *
 * BACKEND URL: Update BACKEND_URL below to your Render URL.
 * This is the only place you need to change it.
 */

'use strict';

/* ============================================================
   CONFIG — change these if your URLs change
   ============================================================ */
window.BACKEND_URL = 'https://digital-safety-hub.onrender.com';

// Supabase config — filled from your .env equivalents
// These are the PUBLIC anon keys (safe to expose in frontend)
window.SUPABASE_URL = 'https://mctvxykemmmpqofocvoy.supabase.co';  // e.g. https://abcdef.supabase.co
window.SUPABASE_ANON_KEY = 'sb_publishable_b6NR63xNYzyXO-nGbhpaaQ_LCi7ZMee'; // your supabase anon/public key


/* ============================================================
   NAVIGATION — SPA View Switcher
   ============================================================ */
window.showView = function (viewId) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  // Show target
  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav link active states
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewId);
  });

  // Trigger view-specific init
  const viewInits = {
    scams:    () => { if (window.initScams)    window.initScams(); },
    simulate: () => { if (window.initSimulate) window.initSimulate(); },
    report:   () => { if (window.initReport)   window.initReport(); },
    quiz:     () => { /* quiz inits on start button */ },
    home:     () => { loadCommunityStats(); }
  };

  if (viewInits[viewId]) viewInits[viewId]();
};


/* ============================================================
   THEME TOGGLE
   ============================================================ */
const THEME_KEY = 'dsh_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  // Sync toggle checkbox
  const checkbox = document.getElementById('theme-checkbox');
  if (checkbox) checkbox.checked = (theme === 'dark');

  // Notify visuals.js to update Three.js particle color
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
}

// Toggle handler
document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('theme-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      const newTheme = checkbox.checked ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
  initTheme();
});


/* ============================================================
   HAMBURGER MENU
   ============================================================ */
window.closeDrawer = function () {
  const drawer = document.getElementById('nav-drawer');
  const btn    = document.getElementById('hamburger-btn');
  if (drawer) drawer.classList.remove('open');
  if (btn)    btn.setAttribute('aria-expanded', 'false');
};

document.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('nav-drawer');

  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (drawer && drawer.classList.contains('open')) {
      if (!drawer.contains(e.target) && !btn.contains(e.target)) {
        closeDrawer();
      }
    }
  });
});


/* ============================================================
   MODAL HELPERS
   ============================================================ */
window.openModal = function (id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function (id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      closeModal(m.id);
    });
    if (document.getElementById('aegis-chat') &&
        !document.getElementById('aegis-chat').classList.contains('hidden')) {
      toggleAegis();
    }
  }
});


/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
window.showToast = function (message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
};


/* ============================================================
   DECISION TREE — "Is this a scam?" FAB
   ============================================================ */
const DECISION_TREE = {
  start: {
    q: 'Did they ask for your OTP, PIN, password, or CVV?',
    yes: 'scam_otp',
    no: 'step2'
  },
  step2: {
    q: 'Did they send you a link and ask you to click it urgently?',
    yes: 'scam_phishing',
    no: 'step3'
  },
  step3: {
    q: 'Are they claiming to be from a bank, government, police, or courier?',
    yes: 'scam_impersonation',
    no: 'step4'
  },
  step4: {
    q: 'Did they offer a job, prize, or investment with guaranteed returns?',
    yes: 'scam_job_lottery',
    no: 'verdict_safe'
  },
  scam_otp: {
    verdict: 'scam',
    title: '🚨 This is a SCAM',
    message: 'No legitimate bank, government body, or service will ever ask for your OTP, PIN, or password. Hang up immediately. Do not share anything.',
    action: 'report'
  },
  scam_phishing: {
    verdict: 'scam',
    title: '🚨 This is a Phishing Attempt',
    message: 'Scammers use urgency to make you click without thinking. Do not click the link. Screenshot and report it.',
    action: 'report'
  },
  scam_impersonation: {
    verdict: 'scam',
    title: '🚨 This is an Impersonation Scam',
    message: 'Fake police, fake bank officials, and "digital arrest" calls are among India\'s fastest growing scams. Hang up. Call the official number directly.',
    action: 'report'
  },
  scam_job_lottery: {
    verdict: 'scam',
    title: '🚨 This is a Job / Lottery Scam',
    message: 'Legitimate jobs and lotteries never require upfront fees or deposits. Anyone asking for money before giving you a job or prize is a scammer.',
    action: 'report'
  },
  verdict_safe: {
    verdict: 'safe',
    title: '✅ Probably Safe — Stay Alert',
    message: 'No obvious red flags detected. But always verify the caller\'s identity through official channels before sharing any personal or financial information.',
    action: 'verify'
  }
};

window.openDecisionTree = function () {
  renderDecisionStep('start');
  openModal('decision-modal');
};

window.closeDecisionTree = function () {
  closeModal('decision-modal');
};

function renderDecisionStep(stepId) {
  const step = DECISION_TREE[stepId];
  const container = document.getElementById('decision-tree-content');
  if (!container || !step) return;

  // Verdict screen
  if (step.verdict) {
    const isScam = step.verdict === 'scam';
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-4) 0;">
        <div style="font-size:2.5rem;margin-bottom:var(--space-4);">${isScam ? '🚨' : '✅'}</div>
        <h3 style="margin-bottom:var(--space-3);color:${isScam ? 'var(--danger)' : 'var(--accent)'};">${step.title}</h3>
        <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-6);">${step.message}</p>
        <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;">
          ${isScam
            ? `<button class="btn btn-danger" onclick="closeDecisionTree();showView('report');">Report This Now →</button>`
            : `<button class="btn btn-glass" onclick="closeDecisionTree();showView('verify');">Learn to Verify →</button>`
          }
          <button class="btn btn-glass" onclick="renderDecisionStep('start')">Check Another</button>
        </div>
      </div>
    `;
    return;
  }

  // Question screen
  container.innerHTML = `
    <p style="font-size:var(--text-md);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-5);line-height:1.5;">${step.q}</p>
    <div style="display:flex;flex-direction:column;gap:var(--space-3);">
      <button class="btn btn-danger btn-full" onclick="renderDecisionStep('${step.yes}')">
        Yes
      </button>
      <button class="btn btn-glass btn-full" onclick="renderDecisionStep('${step.no}')">
        No
      </button>
    </div>
    <button class="btn btn-glass btn-sm" style="margin-top:var(--space-4);" onclick="renderDecisionStep('start')">
      ← Start over
    </button>
  `;
}


/* ============================================================
   AEGIS AI CHAT
   ============================================================ */
window.toggleAegis = function () {
  const chat = document.getElementById('aegis-chat');
  if (!chat) return;
  const isHidden = chat.classList.toggle('hidden');

  // Add greeting on first open
  if (!isHidden) {
    const history = document.getElementById('chat-history');
    if (history && history.children.length === 0) {
      appendBotMsg('👋 I am Aegis, your AI Digital Safety Guardian. Paste any suspicious message, SMS, or ask me anything about scams in India.');
    }
  }
};

window.askAegis = function (topic) {
  document.getElementById('aegis-chat').classList.remove('hidden');
  const input = document.getElementById('ai-input');
  if (input) {
    input.value = `Analyze the risk of "${topic}" scams in India.`;
    sendAegisMessage();
  }
};

window.sendAegisMessage = async function () {
  const input   = document.getElementById('ai-input');
  const history = document.getElementById('chat-history');
  if (!input || !history) return;

  const query = input.value.trim();
  if (!query) return;

  // User bubble
  appendUserMsg(query);
  input.value = '';
  history.scrollTop = history.scrollHeight;

  // Thinking bubble
  const thinkingId = 'thinking-' + Date.now();
  const thinkDiv = document.createElement('div');
  thinkDiv.id = thinkingId;
  thinkDiv.className = 'chat-msg bot-msg';
  thinkDiv.textContent = '⏳ Consulting Aegis Fortress…';
  history.appendChild(thinkDiv);
  history.scrollTop = history.scrollHeight;

  try {
    const response = await fetch(`${window.BACKEND_URL}/api/analyze?text=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(response.status === 429 ? '429' : 'offline');

    const data = await response.json();
    thinkDiv.textContent = data.reply || 'Analysis complete but no data returned.';

  } catch (err) {
    if (err.message === '429') {
      thinkDiv.textContent = '🛡️ Aegis is cooling down (API quota). Please wait 60 seconds.';
    } else {
      thinkDiv.textContent = '⚠️ Cannot reach Aegis backend. Make sure the Render service is running.';
    }
    thinkDiv.style.color = 'var(--danger)';
  }

  history.scrollTop = history.scrollHeight;
};

function appendUserMsg(text) {
  const history = document.getElementById('chat-history');
  const div = document.createElement('div');
  div.className = 'chat-msg user-msg';
  div.textContent = text;
  history.appendChild(div);
}

function appendBotMsg(text) {
  const history = document.getElementById('chat-history');
  if (!history) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot-msg';
  div.textContent = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

// Event listeners for Aegis input
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('send-ai-btn')?.addEventListener('click', window.sendAegisMessage);
  document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.sendAegisMessage();
  });
});


/* ============================================================
   COMMUNITY STATS — Loads from Supabase quiz_results table
   ============================================================ */
async function loadCommunityStats() {
  const elTakers    = document.getElementById('stat-takers');
  const elAvg       = document.getElementById('stat-avg');
  const elGuardians = document.getElementById('stat-guardians');
  const elFallback  = document.getElementById('stats-fallback');
  const elChart     = document.getElementById('stats-chart');

  if (!elTakers) return;

  try {
    // Call our backend proxy endpoint to get quiz stats
    const res = await fetch(`${window.BACKEND_URL}/api/quiz-stats`);
    if (!res.ok) throw new Error('Stats unavailable');
    const data = await res.json();

    if (!data || data.count === 0) {
      if (elFallback) elFallback.style.display = 'block';
      if (elChart)    elChart.style.display = 'none';
      return;
    }

    if (elFallback) elFallback.style.display = 'none';

    // Animate numbers counting up
    animateCount(elTakers,    0, data.count, 1200);
    animateCount(elAvg,       0, data.avg_score, 1000, true);
    animateCount(elGuardians, 0, data.guardian_count, 1200);

    // Distribution bar chart with ApexCharts
    if (elChart && typeof ApexCharts !== 'undefined' && data.distribution) {
      elChart.style.display = 'block';
      renderStatsChart(elChart, data.distribution);
    }

  } catch (e) {
    console.warn('Community stats unavailable:', e.message);
    if (elFallback) {
      elFallback.textContent = '📊 Community stats temporarily unavailable.';
      elFallback.style.display = 'block';
    }
  }
}

function animateCount(el, from, to, duration, isDecimal = false) {
  if (!el) return;
  const start = performance.now();
  function step(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const val = from + (to - from) * eased;
    el.textContent = isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderStatsChart(container, distribution) {
  // distribution = { "0-3": 10, "4-6": 25, "7-8": 40, "9-10": 30 }
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#B3B3B3' : '#374151';
  const accentColor = isDark ? '#1DB954' : '#0D7A3E';

  const labels = Object.keys(distribution);
  const values = Object.values(distribution);

  const chart = new ApexCharts(container, {
    chart: {
      type: 'bar',
      height: 160,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 }
    },
    series: [{ name: 'People', data: values }],
    xaxis: {
      categories: labels.map(l => `Score ${l}`),
      labels: { style: { colors: textColor, fontSize: '11px' } }
    },
    yaxis: { labels: { style: { colors: textColor } } },
    fill: { colors: [accentColor] },
    dataLabels: { enabled: false },
    grid: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: v => `${v} people` }
    },
    plotOptions: { bar: { borderRadius: 6 } }
  });

  chart.render();

  // Re-render if theme changes
  window.addEventListener('themechange', ({ detail }) => {
    const d = detail.theme === 'dark';
    chart.updateOptions({
      chart: { background: 'transparent' },
      xaxis: { labels: { style: { colors: d ? '#B3B3B3' : '#374151' } } },
      fill: { colors: [d ? '#1DB954' : '#0D7A3E'] },
      grid: { borderColor: d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      tooltip: { theme: d ? 'dark' : 'light' }
    });
  });
}


/* ============================================================
   APP INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Show home view and load stats
  showView('home');
  loadCommunityStats();

  console.log('%c🛡️ Digital Safety Hub v1.0', 'color:#1DB954;font-weight:bold;font-size:14px;');
  console.log('%cBuilt for India. Protecting against digital fraud.', 'color:#888;font-size:12px;');
});