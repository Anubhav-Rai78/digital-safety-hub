/**
 * DIGITAL SAFETY HUB — scams.js
 * Scam Encyclopedia. Imports data from content.js and API from api.js.
 */
'use strict';

import { SCAM_DATA }                              from './content.js';
import { submitTip }                              from './api.js';
import { showView, openModal, closeModal, showToast } from './main.js';

/* ============================================================
   STATE
   ============================================================ */
let activeFilter  = 'all';
let searchQuery   = '';
let expandedCards = new Set();

const FILTER_LABELS = {
  all:        '🔍 All Scams',
  otp:        '🔢 OTP Scam',
  upi:        '💳 UPI Fraud',
  phishing:   '🎣 Phishing',
  fake_calls: '📞 Fake Calls',
  fake_news:  '📰 Fake News',
  kyc_sim:    '📱 KYC / SIM',
  job_scam:   '💼 Job Scam',
  lottery:    '🎰 Lottery'
};

/* ============================================================
   INIT
   ============================================================ */
export function initScams() {
  renderFilterChips();
  renderScamCards();
  attachSearchListener();
}

/* ============================================================
   FILTER CHIPS
   ============================================================ */
function renderFilterChips() {
  const container = document.getElementById('scam-filters');
  if (!container || container.children.length > 0) return;

  Object.entries(FILTER_LABELS).forEach(([key, label]) => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (key === 'all' ? ' active' : '');
    chip.textContent = label;
    chip.setAttribute('data-filter', key);
    chip.setAttribute('aria-pressed', key === 'all' ? 'true' : 'false');
    chip.addEventListener('click', () => setFilter(key));
    container.appendChild(chip);
  });
}

function setFilter(key) {
  activeFilter = key;
  expandedCards.clear();
  document.querySelectorAll('#scam-filters .chip').forEach(chip => {
    const isActive = chip.getAttribute('data-filter') === key;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });
  renderScamCards();
}

/* ============================================================
   SEARCH
   ============================================================ */
function attachSearchListener() {
  const input = document.getElementById('scam-search');
  if (!input || input._attached) return;
  input._attached = true;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    expandedCards.clear();
    renderScamCards();
  });
}

function scamMatchesSearch(scam) {
  if (!searchQuery) return true;
  const haystack = [scam.title, scam.summary, scam.how, scam.example, ...(scam.red_flags || []), ...(scam.do || []), ...(scam.dont || [])].join(' ').toLowerCase();
  return haystack.includes(searchQuery);
}

/* ============================================================
   CARD RENDERER
   ============================================================ */
function renderScamCards() {
  const container = document.getElementById('scam-cards');
  const noResults = document.getElementById('scam-no-results');
  if (!container) return;

  const filtered = SCAM_DATA.filter(scam =>
    (activeFilter === 'all' || scam.category === activeFilter) && scamMatchesSearch(scam)
  );

  if (noResults) noResults.classList.toggle('hidden', filtered.length > 0);
  container.innerHTML = '';
  filtered.forEach((scam, i) => container.appendChild(buildScamCard(scam, i)));
}

function buildScamCard(scam, index) {
  const isExpanded = expandedCards.has(scam.id);
  const card = document.createElement('article');
  card.className = 'scam-card' + (isExpanded ? ' expanded' : '');
  card.setAttribute('data-scam-id', scam.id);
  card.style.animationDelay = (index * 0.05) + 's';
  card.style.animation = 'fadeUp 0.4s ease both';

  card.innerHTML = `
    <div class="scam-card-top">
      <div style="display:flex;align-items:flex-start;gap:var(--space-3);flex:1;">
        <span class="scam-icon" aria-hidden="true">${scam.icon}</span>
        <div>
          <h3 style="font-size:var(--text-md);margin-bottom:var(--space-2);">${escapeHtml(scam.title)}</h3>
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin:0;line-height:1.5;">${escapeHtml(scam.summary)}</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2);flex-shrink:0;">
        <span class="badge badge-${scam.risk}">${scam.risk.toUpperCase()} RISK</span>
        <span class="expand-label" style="font-size:var(--text-xs);color:var(--text-muted);">${isExpanded ? '▲ Collapse' : '▼ Expand'}</span>
      </div>
    </div>
    <div class="scam-card-body">
      <div style="margin-bottom:var(--space-5);">
        <p class="scam-section-label">How It Works</p>
        <p style="font-size:var(--text-sm);line-height:1.65;">${escapeHtml(scam.how)}</p>
      </div>
      <div style="margin-bottom:var(--space-5);padding:var(--space-4);background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border);">
        <p class="scam-section-label">🇮🇳 Real India Example</p>
        <p style="font-size:var(--text-sm);line-height:1.65;font-style:italic;">"${escapeHtml(scam.example)}"</p>
      </div>
      <div style="margin-bottom:var(--space-5);">
        <p class="scam-section-label">⚠️ Red Flags</p>
        <div class="red-flags">${scam.red_flags.map(f => `<div class="red-flag-item">${escapeHtml(f)}</div>`).join('')}</div>
      </div>
      <div class="grid-2" style="gap:var(--space-4);margin-bottom:var(--space-5);">
        <div style="background:var(--accent-dim);border:1px solid rgba(29,185,84,0.25);border-radius:var(--radius-md);padding:var(--space-4);">
          <p class="scam-section-label" style="color:var(--accent);">✅ Do This</p>
          <ul style="display:flex;flex-direction:column;gap:var(--space-2);">
            ${scam.do.map(d => `<li style="font-size:var(--text-sm);color:var(--text-secondary);display:flex;gap:var(--space-2);"><span style="flex-shrink:0;">→</span>${escapeHtml(d)}</li>`).join('')}
          </ul>
        </div>
        <div style="background:var(--danger-dim);border:1px solid rgba(255,77,77,0.25);border-radius:var(--radius-md);padding:var(--space-4);">
          <p class="scam-section-label" style="color:var(--danger);">❌ Never Do</p>
          <ul style="display:flex;flex-direction:column;gap:var(--space-2);">
            ${scam.dont.map(d => `<li style="font-size:var(--text-sm);color:var(--text-secondary);display:flex;gap:var(--space-2);"><span style="flex-shrink:0;">✗</span>${escapeHtml(d)}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;" class="scam-actions">
        <button class="btn btn-glass btn-sm" data-action="share">📲 Share Warning</button>
        <button class="btn btn-glass btn-sm" data-action="report">📋 I Faced This</button>
        <button class="btn btn-primary btn-sm" data-action="aegis">🤖 Ask Aegis AI</button>
      </div>
    </div>
  `;

  card.querySelector('.scam-card-top').addEventListener('click', () => toggleScamCard(scam.id));
  card.querySelector('[data-action="share"]').addEventListener('click',  () => shareScamWarning(scam.id));
  card.querySelector('[data-action="report"]').addEventListener('click', () => openScamReport(scam.id, scam.title));
  card.querySelector('[data-action="aegis"]').addEventListener('click',  () => {
    import('./main.js').then(m => m.askAegis(scam.title));
  });

  return card;
}

/* ============================================================
   TOGGLE EXPAND
   ============================================================ */
function toggleScamCard(scamId) {
  const card = document.querySelector(`[data-scam-id="${scamId}"]`);
  if (!card) return;
  const isExpanded = expandedCards.has(scamId);
  if (isExpanded) {
    expandedCards.delete(scamId);
    card.classList.remove('expanded');
    const label = card.querySelector('.expand-label');
    if (label) label.textContent = '▼ Expand';
  } else {
    expandedCards.add(scamId);
    card.classList.add('expanded');
    const label = card.querySelector('.expand-label');
    if (label) label.textContent = '▲ Collapse';
  }
}

/* ============================================================
   HOME PAGE THREAT PREVIEW
   ============================================================ */
export function renderHomeThreatCards() {
  const container = document.getElementById('home-threat-cards');
  if (!container) return;

  const top3 = SCAM_DATA.filter(s => s.risk === 'high').slice(0, 3);
  top3.forEach((scam, i) => {
    const card = document.createElement('article');
    card.className = 'glass-card stagger-child';
    card.style.cursor = 'pointer';
    card.style.animationDelay = (i * 0.1) + 's';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Learn about ${scam.title}`);
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
        <span style="font-size:2rem;" aria-hidden="true">${scam.icon}</span>
        <span class="badge badge-high">HIGH RISK</span>
      </div>
      <h4 style="font-size:var(--text-base);margin-bottom:var(--space-2);">${escapeHtml(scam.title)}</h4>
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin:0;">${escapeHtml(scam.summary)}</p>
      <div style="margin-top:var(--space-4);font-size:var(--text-xs);color:var(--accent);font-weight:600;">Learn more →</div>
    `;
    card.addEventListener('click', () => {
      showView('scams');
      setTimeout(() => {
        toggleScamCard(scam.id);
        const el = document.querySelector(`[data-scam-id="${scam.id}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
    container.appendChild(card);
  });
}

/* ============================================================
   SHARE + REPORT
   ============================================================ */
function shareScamWarning(scamId) {
  const scam = SCAM_DATA.find(s => s.id === scamId);
  if (!scam) return;
  const text = `⚠️ Alert: *${scam.title}* is spreading across India!\n\n${scam.summary}\n\n🚩 Key red flag: ${scam.red_flags[0]}\n\n✅ Remember: ${scam.do[0]}\n\nStay safe 🛡️ | Full guide: Digital Safety Hub`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function openScamReport(scamId, scamTitle) {
  const typeInput = document.getElementById('report-scam-type');
  const desc      = document.getElementById('report-description');
  const success   = document.getElementById('report-modal-success');
  if (typeInput) typeInput.value = scamTitle;
  if (desc)      desc.value     = '';
  if (success)   success.classList.add('hidden');
  openModal('report-modal');
}

export async function submitScamReport() {
  const scamType = document.getElementById('report-scam-type')?.value;
  const desc     = document.getElementById('report-description')?.value;
  const btn      = document.querySelector('#report-modal .btn-primary');
  const success  = document.getElementById('report-modal-success');

  if (btn) { btn.classList.add('loading'); btn.disabled = true; }
  try {
    await submitTip(scamType, desc);
    if (success) success.classList.remove('hidden');
    setTimeout(() => closeModal('report-modal'), 2000);
  } catch (e) {
    showToast('Could not submit. Please try again.');
  } finally {
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
  }
}

/* ============================================================
   UTILITY
   ============================================================ */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}