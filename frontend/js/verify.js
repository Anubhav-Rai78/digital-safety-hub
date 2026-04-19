/**
 * DIGITAL SAFETY HUB — verify.js
 * Verify Tools Hub. Opens third-party tools with user input pre-filled.
 */
'use strict';

import { showToast } from './main.js';

const VERIFY_TOOLS = {
  virustotal:   (q) => q ? `https://www.virustotal.com/gui/url/${btoa(q).replace(/=/g, '')}` : 'https://www.virustotal.com/gui/home/url',
  urlscan:      (q) => q ? `https://urlscan.io/?q=${encodeURIComponent(q)}` : 'https://urlscan.io/',
  safebrowsing: (q) => q ? `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(q)}` : 'https://transparencyreport.google.com/safe-browsing/search',
  factcheck:    (q) => q ? `https://www.google.com/search?q=${encodeURIComponent(q + ' fact check site:factcheck.org OR site:snopes.com OR site:altnews.in OR site:boomlive.in')}` : 'https://toolbox.google.com/factcheck/explorer',
  boomlive:     (q) => q ? `https://www.boomlive.in/search?query=${encodeURIComponent(q)}` : 'https://www.boomlive.in',
  altnews:      (q) => q ? `https://www.altnews.in/?s=${encodeURIComponent(q)}` : 'https://www.altnews.in',
  truecaller:   (q) => q ? `https://www.truecaller.com/search/in/${encodeURIComponent(q.replace(/\D/g, ''))}` : 'https://www.truecaller.com',
  tafcop:       ()  => 'https://tafcop.sancharsaathi.gov.in/',
};

const TOOL_INPUT_MAP = {
  virustotal:   'verify-url-input',
  urlscan:      'verify-url-input',
  safebrowsing: 'verify-url-input',
  factcheck:    'verify-news-input',
  boomlive:     'verify-news-input',
  altnews:      'verify-news-input',
  truecaller:   'verify-phone-input',
  tafcop:       'verify-phone-input',
};

const TOOL_NAMES = {
  virustotal:   'VirusTotal',
  urlscan:      'URLScan.io',
  safebrowsing: 'Google Safe Browsing',
  factcheck:    'Google Fact Check',
  boomlive:     'BoomLive',
  altnews:      'AltNews',
  truecaller:   'Truecaller',
  tafcop:       'TAFCOP Portal',
};

export function openVerifyTool(toolKey) {
  const inputId = TOOL_INPUT_MAP[toolKey];
  const inputEl = inputId ? document.getElementById(inputId) : null;
  const query   = inputEl ? inputEl.value.trim() : '';
  const urlFn   = VERIFY_TOOLS[toolKey];

  if (!urlFn) { showToast('Tool not found. Please try another.'); return; }

  window.open(urlFn(query), '_blank', 'noopener,noreferrer');
  showToast(`✅ Opened ${TOOL_NAMES[toolKey] || toolKey} in a new tab.`);
}