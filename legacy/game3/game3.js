let playerName = '';
let modeName = 'easy', showTime = 2000, numCount = 3;
let score = 0, correctCount = 0, streak = 0, bestStreak = 0;
let nums = [], correct = 0;
let answerTimer = null, answerTimeLeft = 10;
let gameStarted = false;

// ─── VALIDATION ───
function validateName(name) {
  if (!name) return "Ismingizni kiriting!";
  if (name.length < 2) return "Ism kamida 2 harf bo'lishi kerak!";
  if (!/^[a-zA-ZА-Яа-яЎўҚқҒғҲҳ\s'-]+$/u.test(name)) return "Faqat harflardan foydalaning!";
  return null;
}

function showNameError(msg) {
  let el = document.getElementById('name-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'name-error';
    el.style.cssText = 'color:var(--rose);font-size:12px;font-weight:700;letter-spacing:1px;margin-top:6px;';
    document.getElementById('name-inp').parentNode.appendChild(el);
  }
  el.textContent = msg ? '⚠ ' + msg : '';
  document.getElementById('name-inp').style.borderColor = msg ? 'var(--rose)' : '';
}

function selectMode(btn, mode, time, count) {
  document.querySelectorAll('.mode-card').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  modeName = mode; showTime = time; numCount = count;
}

function initGame() {
  const rawName = document.getElementById('name-inp').value.trim();
  const err = validateName(rawName);
  if (err) { showNameError(err); document.getElementById('name-inp').focus(); return; }
  showNameError(null);

  playerName = rawName;
  score = 0; correctCount = 0; streak = 0; bestStreak = 0;
  gameStarted = false;

  document.getElementById('g-player-name').textContent = playerName;
  document.getElementById('g-score').textContent = 0;
  document.getElementById('stat-correct').textContent = 0;
  document.getElementById('stat-streak').textContent = 0;
  document.getElementById('stat-best').textContent = 0;
  document.getElementById('nums-display').textContent = 'Tayyor?';
  document.getElementById('nums-display').className = 'nums-display';
  document.getElementById('ans-row').style.display = 'none';
  document.getElementById('timer-bar-wrap').style.display = 'none';
  document.getElementById('fb-banner').textContent = '';
  document.getElementById('fb-banner').className = 'feedback-banner';
  document.getElementById('start-section').style.display = 'block';
  document.getElementById('start-inst').textContent = "Tayyor bo'lsang, boshlash tugmasini bos";
  document.getElementById('go-btn').textContent = '▶ BOSHLASH';
  showScreen('screen-game');
}

function nextRound() {
  gameStarted = true;
  document.getElementById('start-section').style.display = 'none';
  document.getElementById('ans-row').style.display = 'none';
  document.getElementById('timer-bar-wrap').style.display = 'none';
  document.getElementById('fb-banner').textContent = '';
  document.getElementById('fb-banner').className = 'feedback-banner';
  clearInterval(answerTimer);

  // Generate nums (single digits for clarity)
  nums = [];
  for (let i = 0; i < numCount; i++) nums.push(Math.floor(Math.random() * 10));
  correct = nums.reduce((a,b) => a+b, 0);

  const disp = document.getElementById('nums-display');
  disp.className = 'nums-display';
  disp.textContent = nums.join('  +  ');

  setTimeout(() => {
    disp.classList.add('fading');
    setTimeout(() => {
      disp.className = 'nums-display question';
      disp.style.opacity = '';
      disp.textContent = '???';
      disp.classList.remove('fading');
      showAnswerInput();
    }, 400);
  }, showTime - 400);
}

function showAnswerInput() {
  document.getElementById('ans-row').style.display = 'flex';
  document.getElementById('timer-bar-wrap').style.display = 'block';
  const inp = document.getElementById('num-inp');
  inp.value = ''; inp.className = 'num-input'; inp.focus();
  answerTimeLeft = 10;
  updateTimerBar();
  answerTimer = setInterval(() => {
    answerTimeLeft -= 0.1;
    updateTimerBar();
    if (answerTimeLeft <= 0) {
      clearInterval(answerTimer);
      timeOut();
    }
  }, 100);
}

function updateTimerBar() {
  const pct = Math.max(0, answerTimeLeft / 10);
  const fill = document.getElementById('timer-fill');
  fill.style.width = (pct * 100) + '%';
  fill.style.background = pct > 0.5 ? 'var(--brain)' : pct > 0.25 ? '#ef8c28' : 'var(--rose)';
  document.getElementById('timer-text').textContent = Math.ceil(answerTimeLeft) + 's';
}

function timeOut() {
  streak = 0;
  updateStats();
  showFeedback(false, `⏱ Vaqt tugadi! Javob: ${correct}`);
  document.getElementById('num-inp').className = 'num-input wrong';
  setTimeout(() => nextRound(), 1200);
}

function checkAnswer() {
  clearInterval(answerTimer);
  const inp = document.getElementById('num-inp');
  const val = parseInt(inp.value);
  if (inp.value === '') return;

  if (val === correct) {
    score += 10 + streak * 2;
    correctCount++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    inp.className = 'num-input correct';
    const bonus = streak > 2 ? `🔥 Ketma-ket ${streak}ta! +${10+streak*2} ball` : `✓ To'g'ri! +${10+streak*2} ball`;
    showFeedback(true, bonus);
  } else {
    streak = 0;
    inp.className = 'num-input wrong';
    showFeedback(false, `✗ Xato! Javob: ${correct}`);
  }

  document.getElementById('g-score').textContent = score;
  updateStats();

  document.getElementById('ans-row').style.display = 'none';
  document.getElementById('timer-bar-wrap').style.display = 'none';
  document.getElementById('start-section').style.display = 'block';
  document.getElementById('start-inst').textContent = '';
  document.getElementById('go-btn').textContent = '▶ KEYINGISI';
}

function updateStats() {
  document.getElementById('stat-correct').textContent = correctCount;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-best').textContent = bestStreak;
}

function showFeedback(ok, msg) {
  const el = document.getElementById('fb-banner');
  el.textContent = msg;
  el.className = 'feedback-banner ' + (ok ? 'correct' : 'wrong');
}

function finishSession() {
  clearInterval(answerTimer);
  const modeLabels = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' };
  const grade = score >= 200 ? '🧠 Dahosiz miya!' :
                score >= 100 ? '⭐ Ajoyib natija!' :
                score >= 50  ? "📈 Yaxshi harakat!" :
                               "💪 Ko'proq mashq kerak";
  const icon = score >= 200 ? '🏆' : score >= 100 ? '⭐' : score >= 50 ? '📊' : '💪';

  document.getElementById('sess-icon').textContent = icon;
  document.getElementById('sess-name').textContent = playerName;
  document.getElementById('sess-score').textContent = score;
  document.getElementById('sess-grade').textContent = grade;

  const lb = JSON.parse(localStorage.getItem('brain-lb') || '[]');
  lb.push({ name: playerName, score, mode: modeLabels[modeName] });
  lb.sort((a,b) => b.score - a.score);
  if (lb.length > 10) lb.pop();
  localStorage.setItem('brain-lb', JSON.stringify(lb));

  renderLb();
  showScreen('screen-lb');
}

function renderLb() {
  const lb = JSON.parse(localStorage.getItem('brain-lb') || '[]');
  const rows = document.getElementById('lb-rows');
  const medals = ['🥇','🥈','🥉'];
  rows.innerHTML = lb.length ? lb.map((e,i) => `
    <div class="lb-entry ${i<3?'top':''}">
      <span class="lb-rank">${medals[i]||i+1}</span>
      <span class="lb-uname">${e.name}</span>
      <span class="lb-mode">${e.mode||''}</span>
      <span class="lb-pts">${e.score}</span>
    </div>
  `).join('') : '<p style="text-align:center;color:var(--dim);padding:20px;font-size:13px">Hali natija yo\'q</p>';
}

function clearLb() {
  if (confirm("Barcha natijalarni o'chirmoqchimisiz?")) {
    localStorage.removeItem('brain-lb');
    renderLb();
  }
}
function playAgain() { initGame(); }
function goMenu() { showScreen('screen-menu'); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('screen-game').classList.contains('active')) {
      if (document.getElementById('ans-row').style.display !== 'none') checkAnswer();
      else if (gameStarted && document.getElementById('go-btn').offsetParent !== null) nextRound();
    } else if (document.getElementById('screen-menu').classList.contains('active')) {
      initGame();
    }
  }
});
