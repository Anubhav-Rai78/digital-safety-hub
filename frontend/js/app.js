/**
 * DIGITAL SAFETY HUB — app.js
 * Single entry point. Imports everything, wires ALL buttons and events.
 *
 * FIX: Removed DOMContentLoaded wrapper.
 * ES module scripts are deferred by spec — DOM is already ready when this
 * executes. Wrapping in DOMContentLoaded caused all addEventListener calls
 * to land on null because imports hadn't resolved yet.
 */
'use strict';

import {
  showView, initTheme, initHamburger, initModals,
  openDecisionTree, closeDecisionTree, renderDecisionStep,
  toggleAegis, sendAegisMessage, askAegis,
  loadCommunityStats, showToast, openModal, closeModal
} from './main.js';
import { startQuiz, nextQuestion, restartQuiz, shareResult } from './quiz.js';
import { initScams, submitScamReport, renderHomeThreatCards } from './scams.js';
import { initSimulate, resetSimulator, startScenario }       from './simulate.js';
import { openVerifyTool }                                     from './verify.js';
import { initReport }                                         from './report.js';

/* ============================================================
   VIEW CHANGE HANDLER
   ============================================================ */
const _viewInitMap = {
  scams:    () => initScams(),
  simulate: () => initSimulate(),
  report:   () => initReport(),
  home:     () => loadCommunityStats(),
  quiz:     () => {},
  verify:   () => {}
};

function navigateTo(viewId) {
  showView(viewId);
  closeDrawerSafe();
  if (_viewInitMap[viewId]) _viewInitMap[viewId]();
}

function closeDrawerSafe() {
  const drawer = document.getElementById('nav-drawer');
  const btn    = document.getElementById('hamburger-btn');
  if (drawer) drawer.classList.remove('open');
  if (btn)    btn.setAttribute('aria-expanded', 'false');
}

/* ============================================================
   BOOT — runs at module top level, no DOMContentLoaded needed
   ============================================================ */
initTheme();
initHamburger();
initModals();
wireNav();
wireHome();
wireQuiz();
wireAegis();
wireVerify();
wireReport();
wireDecisionTree();
wireModalCloseButtons();
wireSimulator();
renderHomeThreatCards();
navigateTo('home');

console.log('%c🛡️ Digital Safety Hub v1.0', 'color:#1DB954;font-weight:bold;font-size:14px;');
console.log('%cBuilt for India. Protecting against digital fraud.', 'color:#888;font-size:12px;');

/* ============================================================
   NAV
   ============================================================ */
function wireNav() {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-view'));
    });
  });
}

/* ============================================================
   HOME
   ============================================================ */
function wireHome() {
  document.querySelector('[data-cta="quiz"]')
    ?.addEventListener('click', () => navigateTo('quiz'));

  document.querySelector('[data-cta="scam-check"]')
    ?.addEventListener('click', openDecisionTree);

  document.querySelectorAll('[data-quick-tool]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-quick-tool')));
  });

  document.querySelector('[data-cta="view-scams"]')
    ?.addEventListener('click', () => navigateTo('scams'));
}

/* ============================================================
   QUIZ
   ============================================================ */
function wireQuiz() {
  document.getElementById('quiz-start-btn')
    ?.addEventListener('click', startQuiz);

  document.getElementById('quiz-next-btn')
    ?.addEventListener('click', nextQuestion);

  document.getElementById('quiz-restart-btn')
    ?.addEventListener('click', restartQuiz);

  document.getElementById('quiz-share-btn')
    ?.addEventListener('click', shareResult);

  document.getElementById('quiz-name-input')
    ?.addEventListener('keypress', (e) => { if (e.key === 'Enter') startQuiz(); });
}

/* ============================================================
   SIMULATOR
   FIX: Use event delegation on the parent container so the button
   works even when #sim-back-picker-btn is inside a .hidden element
   at page load (querySelector returns null on hidden elements in
   some browsers, and DOMContentLoaded timing made it unreliable).
   The third inline script tag in index.html is also removed.
   ============================================================ */
function wireSimulator() {
  document.getElementById('scenario-active')
    ?.addEventListener('click', (e) => {
      if (e.target.closest('#sim-back-picker-btn')) {
        resetSimulator();
      }
    });
}

/* ============================================================
   AEGIS AI CHAT
   ============================================================ */
function wireAegis() {
  document.getElementById('aegis-eye')
    ?.addEventListener('click', toggleAegis);

  document.getElementById('aegis-eye')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggleAegis();
    });

  document.getElementById('close-aegis-btn')
    ?.addEventListener('click', toggleAegis);

  document.getElementById('send-ai-btn')
    ?.addEventListener('click', sendAegisMessage);

  document.getElementById('ai-input')
    ?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAegisMessage(); });
}

/* ============================================================
   VERIFY TOOLS
   ============================================================ */
function wireVerify() {
  document.querySelectorAll('[data-verify-tool]').forEach(btn => {
    btn.addEventListener('click', () => openVerifyTool(btn.getAttribute('data-verify-tool')));
  });
}

/* ============================================================
   REPORT MODAL
   ============================================================ */
function wireReport() {
  document.getElementById('submit-scam-report-btn')
    ?.addEventListener('click', submitScamReport);
}

/* ============================================================
   DECISION TREE FAB
   ============================================================ */
function wireDecisionTree() {
  document.querySelector('.fab-decision')
    ?.addEventListener('click', openDecisionTree);

  document.getElementById('close-decision-modal')
    ?.addEventListener('click', closeDecisionTree);
}

/* ============================================================
   GENERIC MODAL CLOSE BUTTONS
   ============================================================ */
function wireModalCloseButtons() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close-modal')));
  });
}

/* ============================================================
   WINDOW BRIDGE — for dynamically rendered HTML
   (decision tree innerHTML buttons can't use addEventListener)
   ============================================================ */
window._dsh = {
  showView:          navigateTo,
  renderDecisionStep,
  closeDecisionTree,
  askAegis,
  startScenario,
  resetSimulator,
  showToast,
  openModal,
  closeModal
};