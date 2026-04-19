/**
 * DIGITAL SAFETY HUB — report.js
 * Report & Emergency Guide. 5-step stepper, state portals accordion.
 *
 * FIX: Moved reportInitialised = true to AFTER the container existence
 * check. Previously the flag was set before the check, so if the DOM
 * wasn't ready yet (timing issue from DOMContentLoaded bug), the flag
 * would be set to true on a failed init and block all future retries.
 */
'use strict';

import { showToast } from './main.js';

/* ============================================================
   STATE PORTALS DATA
   ============================================================ */
const STATE_PORTALS = [
  { name: 'Andhra Pradesh', url: 'https://appolice.gov.in/' },
  { name: 'Assam',          url: 'https://assampolice.gov.in/' },
  { name: 'Bihar',          url: 'https://biharpolice.bih.nic.in/' },
  { name: 'Delhi',          url: 'https://delhipolice.gov.in/' },
  { name: 'Gujarat',        url: 'https://gujaratpolice.gov.in/' },
  { name: 'Haryana',        url: 'https://haryanapolice.gov.in/' },
  { name: 'Karnataka',      url: 'https://ksp.gov.in/' },
  { name: 'Kerala',         url: 'https://keralapolice.gov.in/' },
  { name: 'Madhya Pradesh', url: 'https://mppolice.gov.in/' },
  { name: 'Maharashtra',    url: 'https://mahapolice.gov.in/' },
  { name: 'Odisha',         url: 'https://odishapolice.gov.in/' },
  { name: 'Punjab',         url: 'https://punjabpolice.gov.in/' },
  { name: 'Rajasthan',      url: 'https://police.rajasthan.gov.in/' },
  { name: 'Tamil Nadu',     url: 'https://www.tnpolice.gov.in/' },
  { name: 'Telangana',      url: 'https://www.tspolice.gov.in/' },
  { name: 'Uttar Pradesh',  url: 'https://uppolice.gov.in/' },
  { name: 'Uttarakhand',    url: 'https://uttarakhandpolice.uk.gov.in/' },
  { name: 'West Bengal',    url: 'https://www.wbpolice.gov.in/' }
];

/* ============================================================
   STEPPER DATA
   ============================================================ */
const REPORT_STEPS = [
  {
    title: 'What happened to you?',
    icon: '1',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">Select the type of cybercrime you experienced:</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);" id="crime-type-grid">
        ${[
          ['financial',  '💸', 'Financial Fraud (UPI / Bank / Card)'],
          ['phishing',   '🎣', 'Phishing / Fake Link'],
          ['harassment', '😡', 'Online Harassment / Threat'],
          ['social',     '📱', 'Social Media Fraud'],
          ['fake_call',  '📞', 'Fake Call (Bank / KYC / Police)'],
          ['other',      '❓', 'Other']
        ].map(([id, icon, label]) => `
          <button class="crime-type-btn" data-type="${id}"
            style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md);color:var(--text-secondary);font-size:var(--text-sm);font-family:var(--font-body);cursor:pointer;text-align:left;transition:all 150ms ease;">
            <span>${icon}</span> ${label}
          </button>
        `).join('')}
      </div>
      <p id="crime-type-hint" style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-3);display:none;">✅ Selected. Scroll down to Step 2.</p>
    `
  },
  {
    title: 'Gather this information first',
    icon: '2',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">Collect these before filing. Check off each item as you find it:</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="checklist">
        ${[
          ['ss',     '📷', 'Screenshot of the conversation, message, or call log'],
          ['txn',    '🧾', 'Transaction ID or bank reference number (if money was lost)'],
          ['number', '📞', 'Phone number or UPI ID of the scammer'],
          ['dt',     '📅', 'Date and time of the incident'],
          ['amount', '💰', 'Amount lost (write ₹0 if no money was lost)']
        ].map(([id, icon, label]) => `
          <label style="display:flex;align-items:flex-start;gap:var(--space-3);cursor:pointer;" id="check-${id}">
            <input type="checkbox" class="checklist-checkbox" data-item="${id}" style="width:18px;height:18px;accent-color:var(--accent);flex-shrink:0;margin-top:2px;" />
            <span style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;transition:color 150ms;">${icon} ${label}</span>
          </label>
        `).join('')}
      </div>
      <div id="checklist-progress" style="margin-top:var(--space-4);">
        <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
          <span style="font-size:var(--text-xs);color:var(--text-muted);">Evidence gathered</span>
          <span id="checklist-count" style="font-size:var(--text-xs);font-weight:600;color:var(--text-primary);">0 / 5</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" id="checklist-bar" style="width:0%;transition:width 0.4s ease;"></div></div>
      </div>
    `
  },
  {
    title: 'File your primary complaint',
    icon: '3',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">India's official cybercrime complaint portal.</p>
      <div style="background:var(--accent-dim);border:1px solid rgba(29,185,84,0.3);border-radius:var(--radius-md);padding:var(--space-5);margin-bottom:var(--space-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);">
          <div>
            <p style="font-weight:700;color:var(--accent);margin-bottom:var(--space-1);">🏛️ cybercrime.gov.in</p>
            <p style="font-size:var(--text-sm);color:var(--text-muted);">Government of India — Official Portal</p>
          </div>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Open Portal →</a>
        </div>
      </div>
      <p style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-3);">How to fill the form</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        ${['Select <strong>"Report Other Cyber Crime"</strong> for most fraud cases', 'Fill your state, incident date, and a clear description of what happened', 'Attach the screenshot you collected in Step 2', '<strong>Save your complaint reference number</strong> — you will need it to track status'].map((tip, i) => `
          <div style="display:flex;gap:var(--space-3);align-items:flex-start;">
            <span style="width:22px;height:22px;background:var(--accent);color:var(--text-on-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:700;flex-shrink:0;">${i + 1}</span>
            <span style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;">${tip}</span>
          </div>
        `).join('')}
      </div>
    `
  },
  {
    title: 'Also report to these portals',
    icon: '4',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">Depending on your case, these additional authorities can act faster on specific fraud types:</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        ${[
          { name: 'Sanchar Saathi — Chakshu', desc: 'Report fraud calls, SMS, and unwanted communication. Run by DoT.', url: 'https://sancharsaathi.gov.in/sfc/', tag: 'Spam Calls / SMS', color: 'var(--info-dim)', border: 'var(--info)' },
          { name: 'RBI Sachet Portal', desc: 'Unauthorised collection of funds, illegal money schemes, and banking fraud.', url: 'https://sachet.rbi.org.in/', tag: 'Banking Fraud', color: 'var(--warning-dim)', border: 'var(--warning)' },
          { name: 'CEIR — Stolen Device', desc: 'Block a stolen mobile phone to prevent misuse. Managed by DoT.', url: 'https://ceir.sancharsaathi.gov.in/', tag: 'Stolen Phone', color: 'var(--danger-dim)', border: 'var(--danger)' },
          { name: 'TAFCOP Portal', desc: 'Check how many SIM cards are registered on your Aadhaar and deactivate unknown ones.', url: 'https://tafcop.sancharsaathi.gov.in/', tag: 'SIM Fraud', color: 'var(--accent-dim)', border: 'var(--accent)' }
        ].map(p => `
          <div style="background:${p.color};border:1px solid ${p.border}33;border-radius:var(--radius-md);padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:4px;">
                <span style="font-weight:700;font-size:var(--text-sm);color:var(--text-primary);">${p.name}</span>
                <span class="badge" style="background:${p.color};color:${p.border};border-color:${p.border}33;font-size:10px;">${p.tag}</span>
              </div>
              <p style="font-size:var(--text-xs);color:var(--text-muted);margin:0;">${p.desc}</p>
            </div>
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn btn-glass btn-sm" style="flex-shrink:0;">Open →</a>
          </div>
        `).join('')}
      </div>
    `
  },
  {
    title: 'Track your complaint',
    icon: '5',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">Use the reference number you received when filing the complaint.</p>
      <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:var(--space-5);margin-bottom:var(--space-5);">
        <p style="font-weight:600;margin-bottom:var(--space-2);">📋 Track on NCRP</p>
        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">Log in to cybercrime.gov.in → "Check Complaint Status" → Enter your reference number.</p>
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Track on NCRP →</a>
      </div>
      <div class="accordion" id="state-portals-accordion">
        <button class="accordion-trigger" id="state-accordion-btn">
          <span class="accordion-trigger-text">🗺️ Find Your State Cybercrime Portal</span>
          <span class="accordion-chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="accordion-body-inner">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-2);">
              ${STATE_PORTALS.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="font-size:var(--text-sm);color:var(--accent);padding:var(--space-1) 0;">${s.name} →</a>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:var(--space-6);text-align:center;">
        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-3);">Know someone who was scammed? Share this guide:</p>
        <button class="btn btn-glass" id="share-report-guide-btn">📲 Share This Guide on WhatsApp</button>
      </div>
    `
  }
];

/* ============================================================
   STATE
   ============================================================ */
let reportInitialised = false;
let checkedItems      = 0;

/* ============================================================
   INIT
   FIX: reportInitialised = true is now set AFTER the container
   check. Previously it was set before, meaning a failed init
   (container not found yet) would permanently block retries.
   ============================================================ */
export function initReport() {
  if (reportInitialised) return;

  const container = document.getElementById('report-stepper');
  if (!container) return; // don't set flag — allow retry next time

  reportInitialised = true; // only set after we confirmed container exists

  REPORT_STEPS.forEach((step, i) => {
    const item = document.createElement('div');
    item.className = `step-item ${i === 0 ? 'active' : ''}`;
    item.id = `step-item-${i}`;
    item.innerHTML = `
      ${i < REPORT_STEPS.length - 1 ? '<div class="step-line"></div>' : ''}
      <div class="step-marker">${step.icon}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-body">
          ${step.body}
          ${i < REPORT_STEPS.length - 1 ? `<button class="btn btn-primary btn-sm" style="margin-top:var(--space-5);" data-advance="${i + 1}">Next Step →</button>` : ''}
        </div>
      </div>
    `;
    container.appendChild(item);
  });

  // Wire advance buttons
  container.querySelectorAll('[data-advance]').forEach(btn => {
    btn.addEventListener('click', () => advanceStep(parseInt(btn.getAttribute('data-advance'))));
  });

  // Wire crime type buttons
  container.querySelectorAll('.crime-type-btn').forEach(btn => {
    btn.addEventListener('mouseover', () => {
      if (!btn.classList.contains('selected')) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.color       = 'var(--accent)';
      }
    });
    btn.addEventListener('mouseout', () => {
      if (!btn.classList.contains('selected')) {
        btn.style.borderColor = 'var(--glass-border)';
        btn.style.color       = 'var(--text-secondary)';
      }
    });
    btn.addEventListener('click', () => selectCrimeType(btn));
  });

  // Wire checklist
  container.querySelectorAll('.checklist-checkbox').forEach(cb => {
    cb.addEventListener('change', () => toggleCheckItem(cb.getAttribute('data-item'), cb));
  });

  // Wire accordion
  document.getElementById('state-accordion-btn')
    ?.addEventListener('click', () => {
      document.getElementById('state-portals-accordion')?.classList.toggle('open');
    });

  // Wire WhatsApp share
  document.getElementById('share-report-guide-btn')
    ?.addEventListener('click', shareReportGuide);
}

/* ============================================================
   STEPPER ADVANCE
   ============================================================ */
function advanceStep(toIndex) {
  const prev = document.getElementById(`step-item-${toIndex - 1}`);
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('done');
    const marker = prev.querySelector('.step-marker');
    if (marker) marker.textContent = '✓';
    const line = prev.querySelector('.step-line');
    if (line) line.style.background = 'var(--accent)';
  }
  const next = document.getElementById(`step-item-${toIndex}`);
  if (next) {
    next.classList.add('active');
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ============================================================
   CRIME TYPE
   ============================================================ */
function selectCrimeType(btn) {
  document.querySelectorAll('.crime-type-btn').forEach(b => {
    b.classList.remove('selected');
    b.style.borderColor = 'var(--glass-border)';
    b.style.color       = 'var(--text-secondary)';
    b.style.background  = 'var(--glass-bg)';
  });
  btn.classList.add('selected');
  btn.style.borderColor = 'var(--accent)';
  btn.style.color       = 'var(--accent)';
  btn.style.background  = 'var(--accent-dim)';
  const hint = document.getElementById('crime-type-hint');
  if (hint) hint.style.display = 'block';
}

/* ============================================================
   CHECKLIST
   ============================================================ */
function toggleCheckItem(id, checkbox) {
  const label = document.getElementById('check-' + id);
  const span  = label?.querySelector('span');
  if (checkbox.checked) {
    checkedItems++;
    if (span) {
      span.style.color          = 'var(--accent)';
      span.style.textDecoration = 'line-through';
      span.style.opacity        = '0.7';
    }
  } else {
    checkedItems = Math.max(0, checkedItems - 1);
    if (span) {
      span.style.color          = 'var(--text-secondary)';
      span.style.textDecoration = 'none';
      span.style.opacity        = '1';
    }
  }
  const countEl = document.getElementById('checklist-count');
  const barEl   = document.getElementById('checklist-bar');
  if (countEl) countEl.textContent = `${checkedItems} / 5`;
  if (barEl)   barEl.style.width   = (checkedItems / 5 * 100) + '%';
}

/* ============================================================
   SHARE
   ============================================================ */
function shareReportGuide() {
  const text = '🆘 Need to report a cybercrime in India? This step-by-step guide walks you through it — from gathering evidence to filing on cybercrime.gov.in and calling 1930.\n\nDigital Safety Hub 🛡️';
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}