/**
 * DIGITAL SAFETY HUB — quiz.js
 * Full quiz engine. Imports data and API — no globals.
 */
'use strict';

import { QUIZ_QUESTIONS }                from './content.js';
import { submitQuizResult, getQuizStats } from './api.js';
import { showToast }                     from './main.js';

/* ============================================================
   STATE
   ============================================================ */
const QUIZ = {
  questions:     [],
  currentIndex:  0,
  score:         0,
  userName:      '',
  answered:      false,
  timerInterval: null,
  timeLeft:      20,
  breakdown:     {},
  TOTAL:         10,
  TIME_PER_Q:    20
};

const TIERS = {
  risk:     { min: 0,  max: 3,  label: '🔴 At Risk',  cssClass: 'tier-risk',     icon: '😟' },
  aware:    { min: 4,  max: 7,  label: '🟡 Aware',    cssClass: 'tier-aware',    icon: '🤔' },
  guardian: { min: 8,  max: 10, label: '🟢 Guardian', cssClass: 'tier-guardian', icon: '🛡️' }
};

/* ============================================================
   PUBLIC API
   ============================================================ */
export function startQuiz() {
  const nameInput = document.getElementById('quiz-name-input');
  QUIZ.userName   = nameInput ? nameInput.value.trim() : '';
  QUIZ.currentIndex  = 0;
  QUIZ.score         = 0;
  QUIZ.answered      = false;
  QUIZ.breakdown     = {};
  QUIZ.questions     = shuffleArray([...QUIZ_QUESTIONS]).slice(0, QUIZ.TOTAL);

  document.getElementById('quiz-entry').classList.add('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-active').classList.remove('hidden');

  renderQuestion();
}

export function nextQuestion() {
  QUIZ.currentIndex++;
  if (QUIZ.currentIndex >= QUIZ.TOTAL) endQuiz();
  else renderQuestion();
}

export function restartQuiz() {
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-active').classList.add('hidden');
  document.getElementById('quiz-entry').classList.remove('hidden');
  const nameInput = document.getElementById('quiz-name-input');
  if (nameInput) nameInput.value = '';
}

export function shareResult() {
  const tier = getTier(QUIZ.score);
  const name = QUIZ.userName ? `, ${QUIZ.userName}` : '';
  const text = `🛡️ I scored ${QUIZ.score}/10 on India's Digital Safety Quiz${name}! `
    + `My tier: ${tier.label}. `
    + `Test yourself — it could protect you from being scammed: Digital Safety Hub`;
  if (navigator.share) {
    navigator.share({ title: 'Digital Safety Quiz Result', text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

/* ============================================================
   RENDER QUESTION
   ============================================================ */
function renderQuestion() {
  const q = QUIZ.questions[QUIZ.currentIndex];
  if (!q) { endQuiz(); return; }

  QUIZ.answered = false;
  const current = QUIZ.currentIndex + 1;
  const pct     = ((current - 1) / QUIZ.TOTAL) * 100;

  const progressLabel = document.getElementById('quiz-progress-label');
  if (progressLabel) progressLabel.textContent = `Question ${current} of ${QUIZ.TOTAL}`;

  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressBar) progressBar.style.width = pct + '%';

  const categoryBadge = document.getElementById('quiz-category-badge');
  if (categoryBadge) categoryBadge.textContent = q.category;

  const questionText = document.getElementById('quiz-question-text');
  if (questionText) questionText.textContent = q.q;

  const explanBox = document.getElementById('quiz-explanation-box');
  if (explanBox) { explanBox.className = 'quiz-explanation'; explanBox.textContent = ''; }

  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) nextBtn.classList.add('hidden');

  const ringFill = document.getElementById('ring-fill-el');
  if (ringFill) { ringFill.classList.remove('warning', 'danger'); ringFill.style.strokeDashoffset = '0'; }

  const optionsBox = document.getElementById('quiz-options-container');
  if (optionsBox) {
    optionsBox.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.setAttribute('data-idx', idx);
      btn.innerHTML = `<span class="option-letter">${letters[idx]}</span><span>${escapeHtml(optText)}</span>`;
      btn.addEventListener('click', () => selectAnswer(idx));
      optionsBox.appendChild(btn);
    });
  }

  if (!QUIZ.breakdown[q.category]) QUIZ.breakdown[q.category] = { correct: 0, total: 0 };
  QUIZ.breakdown[q.category].total++;

  startTimer();
}

/* ============================================================
   TIMER
   ============================================================ */
function startTimer() {
  clearInterval(QUIZ.timerInterval);
  QUIZ.timeLeft = QUIZ.TIME_PER_Q;
  updateTimerUI(QUIZ.timeLeft);
  QUIZ.timerInterval = setInterval(() => {
    QUIZ.timeLeft--;
    updateTimerUI(QUIZ.timeLeft);
    if (QUIZ.timeLeft <= 0) {
      clearInterval(QUIZ.timerInterval);
      if (!QUIZ.answered) { QUIZ.answered = true; showTimeoutFeedback(); }
    }
  }, 1000);
}

function updateTimerUI(secs) {
  const numEl    = document.getElementById('quiz-timer-num');
  const ringFill = document.getElementById('ring-fill-el');
  if (numEl) numEl.textContent = secs;
  if (ringFill) {
    ringFill.style.strokeDashoffset = 126 - (secs / QUIZ.TIME_PER_Q) * 126;
    ringFill.classList.remove('warning', 'danger');
    if (secs <= 5)       ringFill.classList.add('danger');
    else if (secs <= 10) ringFill.classList.add('warning');
  }
}

function showTimeoutFeedback() {
  const q         = QUIZ.questions[QUIZ.currentIndex];
  const explanBox = document.getElementById('quiz-explanation-box');
  const nextBtn   = document.getElementById('quiz-next-btn');

  disableOptions();
  document.querySelectorAll('.quiz-option').forEach(btn => {
    if (parseInt(btn.getAttribute('data-idx')) === q.correct) btn.classList.add('correct');
  });

  if (explanBox) {
    explanBox.className   = 'quiz-explanation show wrong-exp';
    explanBox.textContent = `⏱️ Time's up! The correct answer was: "${q.options[q.correct]}". ${q.explanation}`;
  }
  if (nextBtn) nextBtn.classList.remove('hidden');
}

/* ============================================================
   ANSWER SELECTION
   ============================================================ */
function selectAnswer(selectedIdx) {
  if (QUIZ.answered) return;
  QUIZ.answered = true;
  clearInterval(QUIZ.timerInterval);

  const q         = QUIZ.questions[QUIZ.currentIndex];
  const isCorrect = selectedIdx === q.correct;
  const explanBox = document.getElementById('quiz-explanation-box');
  const nextBtn   = document.getElementById('quiz-next-btn');

  disableOptions();
  document.querySelectorAll('.quiz-option').forEach(btn => {
    const idx = parseInt(btn.getAttribute('data-idx'));
    if (idx === q.correct)                     btn.classList.add('correct');
    else if (idx === selectedIdx && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) { QUIZ.score++; QUIZ.breakdown[q.category].correct++; }

  if (explanBox) {
    explanBox.className   = `quiz-explanation show ${isCorrect ? 'correct-exp' : 'wrong-exp'}`;
    explanBox.textContent = q.explanation;
  }
  if (nextBtn) nextBtn.classList.remove('hidden');
}

function disableOptions() {
  document.querySelectorAll('.quiz-option').forEach(btn => { btn.disabled = true; });
}

/* ============================================================
   END QUIZ
   ============================================================ */
async function endQuiz() {
  clearInterval(QUIZ.timerInterval);
  document.getElementById('quiz-active').classList.add('hidden');
  document.getElementById('quiz-result').classList.remove('hidden');

  const tier = getTier(QUIZ.score);
  renderScoreBadge(tier);

  try {
    await submitQuizResult(QUIZ.userName, QUIZ.score, QUIZ.TOTAL);
  } catch (e) {
    console.warn('Could not submit quiz result:', e.message);
  }

  loadResultChart();
}

/* ============================================================
   SCORE BADGE
   ============================================================ */
function renderScoreBadge(tier) {
  const container = document.getElementById('quiz-score-display');
  if (!container) return;

  let weakCat    = '';
  let lowestRatio = 1;
  Object.entries(QUIZ.breakdown).forEach(([cat, data]) => {
    const ratio = data.total > 0 ? data.correct / data.total : 1;
    if (ratio < lowestRatio) { lowestRatio = ratio; weakCat = cat; }
  });

  const greeting = QUIZ.userName ? `Well done, ${escapeHtml(QUIZ.userName)}!` : 'Quiz complete!';
  const tierMessages = {
    risk:     `Your digital safety awareness needs attention. Focus especially on <strong>${escapeHtml(weakCat)}</strong> scenarios.`,
    aware:    `You have solid knowledge but gaps remain. Brush up on <strong>${escapeHtml(weakCat)}</strong>.`,
    guardian: `Excellent awareness! You can identify most scams. Share this quiz to help others.`
  };

  container.innerHTML = `
    <div class="score-result ${tier.cssClass}">
      <div style="font-size:3.5rem;margin-bottom:var(--space-4);">${tier.icon}</div>
      <div class="score-big">${QUIZ.score}<span style="font-size:0.5em;font-weight:400;opacity:0.6;">/10</span></div>
      <div style="font-size:var(--text-lg);font-weight:700;margin:var(--space-3) 0;">${tier.label}</div>
      <p style="font-size:var(--text-base);font-weight:600;margin-bottom:var(--space-2);">${greeting}</p>
      <p style="font-size:var(--text-sm);color:var(--text-secondary);max-width:380px;margin:0 auto;line-height:1.6;">${tierMessages[tier.key]}</p>
      <div style="margin-top:var(--space-6);text-align:left;width:100%;max-width:380px;">
        <p style="font-size:var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-3);">Score by Category</p>
        ${Object.entries(QUIZ.breakdown).map(([cat, data]) => {
          const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
          const barColor = pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
          return `
            <div style="margin-bottom:var(--space-3);">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:var(--text-xs);color:var(--text-secondary);">${escapeHtml(cat)}</span>
                <span style="font-size:var(--text-xs);font-weight:600;color:var(--text-primary);">${data.correct}/${data.total}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%;background:${barColor};transition:width 0.8s ease;"></div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

/* ============================================================
   COMMUNITY CHART
   ============================================================ */
async function loadResultChart() {
  const chartEl  = document.getElementById('quiz-result-chart');
  const fallback = document.getElementById('quiz-result-fallback');
  if (!chartEl) return;

  try {
    const data = await getQuizStats();
    if (!data || data.total_takers === 0) {
      if (fallback) fallback.style.display = 'block';
      chartEl.style.display = 'none';
      return;
    }

    if (fallback) fallback.style.display = 'none';

    const isDark      = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor   = isDark ? '#B3B3B3' : '#374151';
    const accentColor = isDark ? '#1DB954'  : '#0D7A3E';
    const dist        = data.distribution || {};
    const sorted = Object.entries(dist).sort(([a], [b]) => parseInt(a) - parseInt(b));

    const chart = new ApexCharts(chartEl, {
      chart: { type: 'bar', height: 180, background: 'transparent', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 700 } },
      series: [{ name: 'People', data: sorted.map(([, v]) => v) }],
      xaxis: { categories: sorted.map(([k]) => `${k}/10`), labels: { style: { colors: textColor, fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: textColor } } },
      fill:  { colors: [accentColor] },
      dataLabels: { enabled: false },
      grid: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: v => `${v} people` } },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      annotations: {
        xaxis: [{ x: `${QUIZ.score}/10`, borderColor: accentColor, label: { text: 'You', style: { color: accentColor, background: 'transparent', fontSize: '11px', fontWeight: 700 } } }]
      }
    });
    chart.render();

    window.addEventListener('themechange', ({ detail }) => {
      const d = detail.theme === 'dark';
      chart.updateOptions({
        xaxis:   { labels: { style: { colors: d ? '#B3B3B3' : '#374151' } } },
        fill:    { colors: [d ? '#1DB954' : '#0D7A3E'] },
        grid:    { borderColor: d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
        tooltip: { theme: d ? 'dark' : 'light' }
      });
    });
  } catch (e) {
    console.warn('Could not load community stats:', e.message);
    if (fallback) { fallback.textContent = '📊 Community stats temporarily unavailable.'; fallback.style.display = 'block'; }
    chartEl.style.display = 'none';
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
function getTier(score) {
  if (score <= 3) return { ...TIERS.risk,     key: 'risk' };
  if (score <= 7) return { ...TIERS.aware,    key: 'aware' };
  return             { ...TIERS.guardian, key: 'guardian' };
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('✅ Result copied to clipboard!'))
    .catch(() => showToast('Could not copy. Try manually.'));
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}