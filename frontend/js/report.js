/**
 * DIGITAL SAFETY HUB — report.js
 * Renders the Report & Emergency Guide page.
 * Drives a 5-step stepper with checkboxes, portal links,
 * and a state-wise accordion for local cybercrime portals.
 *
 * Called by main.js initReport() when report view is shown.
 */

'use strict';

/* ============================================================
   STEPPER DATA
   Each step has: title, icon, body (HTML string)
   ============================================================ */
const REPORT_STEPS = [
  {
    title: 'What happened to you?',
    icon:  '1',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">
        Select the type of cybercrime you experienced:
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);" id="crime-type-grid">
        ${[
          ['financial',   '💸', 'Financial Fraud (UPI / Bank / Card)'],
          ['phishing',    '🎣', 'Phishing / Fake Link'],
          ['harassment',  '😡', 'Online Harassment / Threat'],
          ['social',      '📱', 'Social Media Fraud'],
          ['fake_call',   '📞', 'Fake Call (Bank / KYC / Police)'],
          ['other',       '❓', 'Other']
        ].map(([id, icon, label]) => `
          <button class="crime-type-btn" data-type="${id}"
            style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);
                   background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md);
                   color:var(--text-secondary);font-size:var(--text-sm);font-family:var(--font-body);
                   cursor:pointer;text-align:left;transition:all 150ms ease;"
            onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='var(--glass-border)';this.style.color='var(--text-secondary)'}"
            onclick="selectCrimeType('${id}', this)">
            <span>${icon}</span> ${label}
          </button>
        `).join('')}
      </div>
      <p id="crime-type-hint" style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-3);display:none;">
        ✅ Selected. Scroll down to Step 2.
      </p>
    `
  },
  {
    title: 'Gather this information first',
    icon:  '2',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">
        Collect these before filing. Check off each item as you find it:
      </p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="checklist">
        ${[
          ['ss',     '📷', 'Screenshot of the conversation, message, or call log'],
          ['txn',    '🧾', 'Transaction ID or bank reference number (if money was lost)'],
          ['number', '📞', 'Phone number or UPI ID of the scammer'],
          ['dt',     '📅', 'Date and time of the incident'],
          ['amount', '💰', 'Amount lost (write ₹0 if no money was lost)']
        ].map(([id, icon, label]) => `
          <label style="display:flex;align-items:flex-start;gap:var(--space-3);cursor:pointer;" id="check-${id}">
            <input type="checkbox" style="width:18px;height:18px;accent-color:var(--accent);flex-shrink:0;margin-top:2px;"
                   onchange="toggleCheckItem('${id}', this)" />
            <span style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;transition:color 150ms;">
              ${icon} ${label}
            </span>
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
    icon:  '3',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">
        India's official cybercrime complaint portal. Accepts all types of complaints.
      </p>

      <!-- Primary portal card -->
      <div style="background:var(--accent-dim);border:1px solid rgba(29,185,84,0.3);
                  border-radius:var(--radius-md);padding:var(--space-5);margin-bottom:var(--space-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);">
          <div>
            <p style="font-weight:700;color:var(--accent);margin-bottom:var(--space-1);">🏛️ cybercrime.gov.in</p>
            <p style="font-size:var(--text-sm);color:var(--text-muted);">Government of India — Official Portal</p>
          </div>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Open Portal →
          </a>
        </div>
      </div>

      <!-- How to fill the form -->
      <p style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
                color:var(--text-muted);margin-bottom:var(--space-3);">How to fill the form</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        ${[
          'Select <strong>"Report Other Cyber Crime"</strong> for most fraud cases',
          'Fill your state, incident date, and a clear description of what happened',
          'Attach the screenshot you collected in Step 2',
          '<strong>Save your complaint reference number</strong> — you will need it to track status'
        ].map((tip, i) => `
          <div style="display:flex;gap:var(--space-3);align-items:flex-start;">
            <span style="width:22px;height:22px;background:var(--accent);color:var(--text-on-accent);
                         border-radius:50%;display:flex;align-items:center;justify-content:center;
                         font-size:var(--text-xs);font-weight:700;flex-shrink:0;">${i + 1}</span>
            <span style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;">${tip}</span>
          </div>
        `).join('')}
      </div>
    `
  },
  {
    title: 'Also report to these portals',
    icon:  '4',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">
        Depending on your case, these additional authorities can act faster on specific fraud types:
      </p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);">
        ${[
          {
            name:  'Sanchar Saathi — Chakshu',
            desc:  'Report fraud calls, SMS, and unwanted communication. Run by DoT.',
            url:   'https://sancharsaathi.gov.in/sfc/',
            tag:   'Spam Calls / SMS',
            color: 'var(--info-dim)',
            border:'var(--info)'
          },
          {
            name:  'RBI Sachet Portal',
            desc:  'Unauthorised collection of funds, illegal money schemes, and banking fraud.',
            url:   'https://sachet.rbi.org.in/',
            tag:   'Banking Fraud',
            color: 'var(--warning-dim)',
            border:'var(--warning)'
          },
          {
            name:  'CEIR — Stolen Device',
            desc:  'Block a stolen mobile phone to prevent misuse. Managed by DoT.',
            url:   'https://ceir.sancharsaathi.gov.in/',
            tag:   'Stolen Phone',
            color: 'var(--danger-dim)',
            border:'var(--danger)'
          },
          {
            name:  'TAFCOP Portal',
            desc:  'Check how many SIM cards are registered on your Aadhaar and deactivate unknown ones.',
            url:   'https://tafcop.sancharsaathi.gov.in/',
            tag:   'SIM Fraud',
            color: 'var(--accent-dim)',
            border:'var(--accent)'
          }
        ].map(p => `
          <div style="background:${p.color};border:1px solid ${p.border}33;border-radius:var(--radius-md);
                      padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;
                      gap:var(--space-4);flex-wrap:wrap;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:4px;">
                <span style="font-weight:700;font-size:var(--text-sm);color:var(--text-primary);">${p.name}</span>
                <span class="badge" style="background:${p.color};color:${p.border};border-color:${p.border}33;
                      font-size:10px;">${p.tag}</span>
              </div>
              <p style="font-size:var(--text-xs);color:var(--text-muted);margin:0;">${p.desc}</p>
            </div>
            <a href="${p.url}" target="_blank" rel="noopener noreferrer"
               class="btn btn-glass btn-sm" style="flex-shrink:0;">Open →</a>
          </div>
        `).join('')}
      </div>
    `
  },
  {
    title: 'Track your complaint',
    icon:  '5',
    body: `
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-5);">
        Use the reference number you received when filing the complaint.
      </p>
      <div style="background:var(--glass-bg);border:1px solid var(--glass-border);
                  border-radius:var(--radius-md);padding:var(--space-5);margin-bottom:var(--space-5);">
        <p style="font-weight:600;margin-bottom:var(--space-2);">📋 Track on NCRP (National Cybercrime Reporting Portal)</p>
        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-4);">
          Log in to cybercrime.gov.in → "Check Complaint Status" → Enter your reference number.
        </p>
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          Track on NCRP →
        </a>
      </div>

      <!-- State portals accordion -->
      <div class="accordion" id="state-portals-accordion">
        <button class="accordion-trigger" onclick="toggleAccordion('state-portals-accordion')">
          <span class="accordion-trigger-text">🗺️ Find Your State Cybercrime Portal</span>
          <span class="accordion-chevron">▾</span>
        </button>
        <div class="accordion-body">
          <div class="accordion-body-inner">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-2);">
              ${STATE_PORTALS.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener noreferrer"
                   style="font-size:var(--text-sm);color:var(--accent);padding:var(--space-1) 0;">
                  ${s.name} →
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp share -->
      <div style="margin-top:var(--space-6);text-align:center;">
        <p style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-3);">
          Know someone who was scammed? Share this guide:
        </p>
        <button class="btn btn-glass" onclick="shareReportGuide()">
          📲 Share This Guide on WhatsApp
        </button>
      </div>
    `
  }
];


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
   STEPPER RENDERER — called once when report view opens
   ============================================================ */
let reportInitialised = false;
let checkedItems      = 0;

window.initReport = function () {
  if (reportInitialised) return;
  reportInitialised = true;

  const container = document.getElementById('report-stepper');
  if (!container) return;

  REPORT_STEPS.forEach((step, i) => {
    const isFirst = i === 0;
    const item = document.createElement('div');
    item.className = `step-item ${isFirst ? 'active' : ''}`;
    item.id = `step-item-${i}`;

    item.innerHTML = `
      <!-- Connector line -->
      ${i < REPORT_STEPS.length - 1 ? '<div class="step-line"></div>' : ''}

      <!-- Marker -->
      <div class="step-marker">${step.icon}</div>

      <!-- Content -->
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-body">
          ${step.body}
          ${i < REPORT_STEPS.length - 1 ? `
            <button class="btn btn-primary btn-sm" style="margin-top:var(--space-5);"
                    onclick="advanceStep(${i + 1})">
              Next Step →
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.appendChild(item);
  });
};

window.advanceStep = function (toIndex) {
  // Mark previous as done
  const prev = document.getElementById(`step-item-${toIndex - 1}`);
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('done');
    const marker = prev.querySelector('.step-marker');
    if (marker) marker.textContent = '✓';
    const line = prev.querySelector('.step-line');
    if (line) line.style.background = 'var(--accent)';
  }

  // Activate next
  const next = document.getElementById(`step-item-${toIndex}`);
  if (next) {
    next.classList.add('active');
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


/* ============================================================
   CRIME TYPE SELECTOR
   ============================================================ */
window.selectCrimeType = function (type, btn) {
  // Deselect others
  document.querySelectorAll('.crime-type-btn').forEach(b => {
    b.classList.remove('selected');
    b.style.borderColor = 'var(--glass-border)';
    b.style.color = 'var(--text-secondary)';
    b.style.background = 'var(--glass-bg)';
  });

  // Select clicked
  btn.classList.add('selected');
  btn.style.borderColor = 'var(--accent)';
  btn.style.color = 'var(--accent)';
  btn.style.background = 'var(--accent-dim)';

  const hint = document.getElementById('crime-type-hint');
  if (hint) hint.style.display = 'block';
};


/* ============================================================
   CHECKLIST TRACKER
   ============================================================ */
window.toggleCheckItem = function (id, checkbox) {
  const label = document.getElementById('check-' + id);
  const span  = label ? label.querySelector('span') : null;

  if (checkbox.checked) {
    checkedItems++;
    if (span) {
      span.style.color = 'var(--accent)';
      span.style.textDecoration = 'line-through';
      span.style.opacity = '0.7';
    }
  } else {
    checkedItems = Math.max(0, checkedItems - 1);
    if (span) {
      span.style.color = 'var(--text-secondary)';
      span.style.textDecoration = 'none';
      span.style.opacity = '1';
    }
  }

  const countEl = document.getElementById('checklist-count');
  const barEl   = document.getElementById('checklist-bar');
  if (countEl) countEl.textContent = `${checkedItems} / 5`;
  if (barEl)   barEl.style.width   = (checkedItems / 5 * 100) + '%';
};


/* ============================================================
   ACCORDION TOGGLE (state portals)
   ============================================================ */
window.toggleAccordion = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open');
};


/* ============================================================
   WHATSAPP SHARE
   ============================================================ */
window.shareReportGuide = function () {
  const text = '🆘 Need to report a cybercrime in India? '
    + 'This step-by-step guide walks you through it — '
    + 'from gathering evidence to filing on cybercrime.gov.in and calling 1930.\n\n'
    + 'Digital Safety Hub 🛡️';

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};