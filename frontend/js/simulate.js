/**
 * DIGITAL SAFETY HUB — simulate.js
 * Scam scenario simulator. Imports scenarios from content.js.
 */
'use strict';

import { SCENARIOS } from './content.js';
import { showView }  from './main.js';

/* ============================================================
   STATE
   ============================================================ */
const SIM = {
  scenario:     null,
  stepIndex:    0,
  correctCount: 0,
  totalChoices: 0,
  isEnded:      false
};

const DIFFICULTY_BADGE = {
  easy:   { label: 'Easy',   class: 'badge-low' },
  medium: { label: 'Medium', class: 'badge-medium' },
  hard:   { label: 'Hard',   class: 'badge-high' }
};

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ============================================================
   INIT
   ============================================================ */
export function initSimulate() {
  renderScenarioPicker();
}

/* ============================================================
   SCENARIO PICKER
   ============================================================ */
function renderScenarioPicker() {
  const container = document.getElementById('scenario-cards');
  if (!container || container.children.length > 0) return;

  SCENARIOS.forEach((scenario, i) => {
    const diff = DIFFICULTY_BADGE[scenario.difficulty] || DIFFICULTY_BADGE.easy;
    const card = document.createElement('article');
    card.className = 'glass-card stagger-child';
    card.style.cursor = 'pointer';
    card.style.animationDelay = (i * 0.08) + 's';
    card.style.animation = 'fadeUp 0.4s ease both';

    const firstMsg = scenario.steps.find(s => s.type === 'incoming');
    const preview  = firstMsg ? escapeHtml(firstMsg.text.substring(0, 80)) + (firstMsg.text.length > 80 ? '…' : '') : 'Practice your response to this real scam tactic.';

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
        <span style="font-size:2.2rem;" aria-hidden="true">${scenario.icon}</span>
        <span class="badge ${diff.class}">${diff.label}</span>
      </div>
      <h4 style="font-size:var(--text-base);margin-bottom:var(--space-2);">${escapeHtml(scenario.title)}</h4>
      <p style="font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-4);">${preview}</p>
      <button class="btn btn-primary btn-sm" style="width:100%;">▶ Start Scenario</button>
    `;

    card.addEventListener('click', () => startScenario(scenario.id));
    container.appendChild(card);
  });
}

/* ============================================================
   START
   ============================================================ */
export function startScenario(scenarioId) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  SIM.scenario     = scenario;
  SIM.stepIndex    = 0;
  SIM.correctCount = 0;
  SIM.totalChoices = 0;
  SIM.isEnded      = false;

  document.getElementById('scenario-picker').classList.add('hidden');
  document.getElementById('scenario-active').classList.remove('hidden');

  const titleEl  = document.getElementById('sim-title');
  const callerEl = document.getElementById('sim-caller-name');
  const statusEl = document.getElementById('sim-caller-status');
  if (titleEl)  titleEl.textContent  = scenario.title;
  if (callerEl) callerEl.textContent = scenario.caller_name;
  if (statusEl) statusEl.textContent = scenario.caller_status;

  clearChat();

  const endEl = document.getElementById('sim-end');
  if (endEl) endEl.classList.add('hidden');

  advanceScenario();
}

/* ============================================================
   ADVANCE
   ============================================================ */
function advanceScenario() {
  if (!SIM.scenario || SIM.isEnded) return;
  const steps = SIM.scenario.steps;
  if (SIM.stepIndex >= steps.length) { endScenario(); return; }

  const step = steps[SIM.stepIndex];
  if (step.type === 'incoming') {
    appendBubble(step.text, 'incoming');
    SIM.stepIndex++;
    setTimeout(advanceScenario, 1200);
  } else if (step.type === 'outgoing') {
    appendBubble(step.text, 'outgoing');
    SIM.stepIndex++;
    setTimeout(advanceScenario, 900);
  } else if (step.type === 'choice') {
    SIM.totalChoices++;
    renderChoices(step.choices);
  }
}

/* ============================================================
   CHAT BUBBLES
   ============================================================ */
function appendBubble(text, direction) {
  const messagesEl = document.getElementById('sim-messages');
  if (!messagesEl) return;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${direction}`;
  bubble.innerHTML = `${escapeHtml(text)}<div class="bubble-time">${nowTime()}</div>`;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function clearChat() {
  const messagesEl = document.getElementById('sim-messages');
  const choicesEl  = document.getElementById('sim-choices');
  const conseqEl   = document.getElementById('sim-consequence');
  if (messagesEl) messagesEl.innerHTML = '';
  if (choicesEl)  choicesEl.innerHTML  = '';
  if (conseqEl)   { conseqEl.style.display = 'none'; conseqEl.innerHTML = ''; }
}

/* ============================================================
   CHOICES
   ============================================================ */
function renderChoices(choices) {
  const choicesEl = document.getElementById('sim-choices');
  if (!choicesEl) return;
  choicesEl.innerHTML = `<p style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-2);">Your response:</p>`;
  choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-glass btn-full';
    btn.style.cssText = 'text-align:left;justify-content:flex-start;padding:var(--space-3) var(--space-4);height:auto;min-height:48px;white-space:normal;line-height:1.5;';
    btn.innerHTML = `<span style="margin-right:var(--space-2);opacity:0.5;">${idx + 1}.</span> ${escapeHtml(choice.text)}`;
    btn.addEventListener('click', () => handleChoice(choice));
    choicesEl.appendChild(btn);
  });
}

function handleChoice(choice) {
  appendBubble(choice.text, 'outgoing');
  const choicesEl = document.getElementById('sim-choices');
  if (choicesEl) choicesEl.innerHTML = '';
  if (choice.isCorrect) SIM.correctCount++;
  showConsequence(choice);
  SIM.stepIndex++;
}

/* ============================================================
   CONSEQUENCE
   ============================================================ */
function showConsequence(choice) {
  const conseqEl = document.getElementById('sim-consequence');
  if (!conseqEl) return;
  const isCorrect = choice.isCorrect;
  const bgColor   = isCorrect ? 'var(--accent-dim)' : 'var(--danger-dim)';
  const border    = isCorrect ? 'var(--accent)'     : 'var(--danger)';

  conseqEl.style.display = 'block';
  conseqEl.innerHTML = `
    <div style="background:${bgColor};border-top:2px solid ${border};padding:var(--space-4);animation:fadeUp 0.3s ease;">
      <p style="font-weight:700;margin-bottom:var(--space-2);color:${border};">${isCorrect ? '✅ You handled it right:' : '❌ What just happened:'}</p>
      <p style="font-size:var(--text-sm);margin-bottom:var(--space-3);color:var(--text-secondary);line-height:1.6;">${escapeHtml(choice.consequence)}</p>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6;padding:var(--space-3);background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border);">💡 <strong>Lesson:</strong> ${escapeHtml(choice.explanation)}</p>
      <button class="btn btn-primary btn-sm" style="margin-top:var(--space-4);" id="dismiss-consequence-btn">Continue →</button>
    </div>
  `;
  document.getElementById('dismiss-consequence-btn')?.addEventListener('click', dismissConsequence);
  conseqEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function dismissConsequence() {
  const conseqEl = document.getElementById('sim-consequence');
  if (conseqEl) { conseqEl.style.display = 'none'; conseqEl.innerHTML = ''; }
  advanceScenario();
}

/* ============================================================
   END
   ============================================================ */
function endScenario() {
  SIM.isEnded = true;
  const choicesEl = document.getElementById('sim-choices');
  const conseqEl  = document.getElementById('sim-consequence');
  const endEl     = document.getElementById('sim-end');
  if (choicesEl) choicesEl.innerHTML = '';
  if (conseqEl)  { conseqEl.style.display = 'none'; conseqEl.innerHTML = ''; }
  if (!endEl)    return;

  endEl.classList.remove('hidden');

  const allCorrect = SIM.correctCount === SIM.totalChoices;
  const isGood     = SIM.correctCount >= Math.ceil(SIM.totalChoices * 0.6);
  const pct        = SIM.totalChoices > 0 ? Math.round((SIM.correctCount / SIM.totalChoices) * 100) : 0;

  const bgColor = allCorrect ? 'var(--accent-dim)' : isGood ? 'var(--warning-dim)' : 'var(--danger-dim)';
  const border  = allCorrect ? 'var(--accent)'     : isGood ? 'var(--warning)'     : 'var(--danger)';
  const icon    = allCorrect ? '🎉' : isGood ? '🤔' : '😟';
  const title   = allCorrect ? 'You Stayed Safe!' : isGood ? 'Almost — but careful!' : 'You Were Scammed';
  const subtitle = allCorrect
    ? 'You made every right choice. Share this scenario to help others practice.'
    : isGood
    ? `You got ${SIM.correctCount}/${SIM.totalChoices} choices right. Review the lessons above.`
    : `${SIM.correctCount}/${SIM.totalChoices} correct. Read the explanations above and try again.`;

  endEl.innerHTML = `
    <div style="background:${bgColor};border:2px solid ${border};border-radius:var(--radius-card);padding:var(--space-8);text-align:center;animation:fadeUp 0.4s ease,scaleIn 0.4s ease;">
      <div style="font-size:3rem;margin-bottom:var(--space-4);">${icon}</div>
      <h3 style="font-size:var(--text-xl);margin-bottom:var(--space-3);">${title}</h3>
      <div style="font-family:var(--font-display);font-size:var(--text-2xl);font-weight:800;color:${border};letter-spacing:-0.03em;margin-bottom:var(--space-2);">
        ${SIM.correctCount}<span style="font-size:0.5em;font-weight:400;opacity:0.6;">/${SIM.totalChoices}</span>
      </div>
      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-muted);margin-bottom:var(--space-4);">correct choices</div>
      <div class="progress-bar" style="max-width:280px;margin:0 auto var(--space-5);">
        <div class="progress-fill" style="width:${pct}%;background:${border};transition:width 1s ease;"></div>
      </div>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);max-width:380px;margin:0 auto var(--space-6);line-height:1.6;">${subtitle}</p>
      <div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" id="sim-retry-btn">🔄 Try Again</button>
        <button class="btn btn-glass"   id="sim-back-btn">← Pick Another</button>
        ${!allCorrect ? `<button class="btn btn-glass" id="sim-report-btn">📋 Report Guide →</button>` : ''}
      </div>
    </div>
  `;

  document.getElementById('sim-retry-btn')?.addEventListener('click', () => startScenario(SIM.scenario.id));
  document.getElementById('sim-back-btn')?.addEventListener('click', resetSimulator);
  document.getElementById('sim-report-btn')?.addEventListener('click', () => showView('report'));
}

/* ============================================================
   RESET
   ============================================================ */
export function resetSimulator() {
  SIM.scenario = null;
  SIM.isEnded  = false;
  clearChat();
  document.getElementById('scenario-active').classList.add('hidden');
  document.getElementById('scenario-picker').classList.remove('hidden');
  const endEl = document.getElementById('sim-end');
  if (endEl) endEl.classList.add('hidden');
}

/* ============================================================
   UTILITY
   ============================================================ */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}