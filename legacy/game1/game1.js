const TOTAL = 20;
let questions = [], current = 0, score = 0, wrongCount = 0;
let difficulty = 'easy';
let timerInterval = null, timeLeft = 15, maxTime = 15;
let playerName = '';

// ─── DIFFICULTY SELECTION ───
function selectDiff(btn, diff) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  difficulty = diff;
}

// ─── QUESTION GENERATION ───
function generateQuestion() {
  let a, b, op, ans;
  if (difficulty === 'easy') {
    a = Math.floor(Math.random() * 11);
    b = Math.floor(Math.random() * 11);
    op = '+'; ans = a + b;
  } else if (difficulty === 'medium') {
    a = Math.floor(Math.random() * 21);
    b = Math.floor(Math.random() * 21);
    op = Math.random() > 0.5 ? '+' : '−';
    ans = op === '+' ? a + b : a - b;
  } else {
    const ops = ['+', '−', '×'];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '×') {
      a = Math.floor(Math.random() * 13);
      b = Math.floor(Math.random() * 13);
      ans = a * b;
    } else {
      a = Math.floor(Math.random() * 51);
      b = Math.floor(Math.random() * 51);
      ans = op === '+' ? a + b : a - b;
    }
  }
  return { q: `${a} ${op} ${b}`, a: ans };
}

function generateQuestions() {
  questions = [];
  for (let i = 0; i < TOTAL; i++) questions.push(generateQuestion());
}

// ─── VALIDATION ───
function validateName(name) {
  if (!name) return "Ismingizni kiriting!";
  if (name.length < 2) return "Ism kamida 2 harf bo'lishi kerak!";
  if (!/^[a-zA-ZА-Яа-яЎўҚқҒғҲҳ\s'-]+$/u.test(name)) return "Faqat harflardan foydalaning!";
  return null;
}

// ─── GAME FLOW ───
function startTest() {
  const rawName = document.getElementById('name-input').value.trim();
  const nameError = validateName(rawName);
  if (nameError) {
    showNameError(nameError);
    document.getElementById('name-input').focus();
    return;
  }
  playerName = rawName;
  hideNameError();
  localStorage.setItem('currentUser', playerName);
  current = 0; score = 0; wrongCount = 0;
  maxTime = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 12 : 15;
  generateQuestions();
  showScreen('screen-game');
  document.getElementById('display-name').textContent = playerName;
  showQuestion();
}

function showQuestion() {
  if (current >= TOTAL) { finishTest(); return; }
  const q = questions[current];
  document.getElementById('question-text').textContent = q.q + ' = ?';
  document.getElementById('q-counter').textContent = `${current + 1} / ${TOTAL}`;
  document.getElementById('remaining-count').textContent = TOTAL - current;
  document.getElementById('progress-fill').style.width = (current / TOTAL * 100) + '%';
  const inp = document.getElementById('answer-input');
  inp.value = '';
  inp.className = 'answer-input';
  inp.focus();
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = maxTime;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeExpired();
    }
  }, 1000);
}

function updateTimerUI() {
  document.getElementById('timer-display').textContent = timeLeft;
  const ring = document.getElementById('timer-ring');
  const pct = timeLeft / maxTime;
  ring.style.strokeDashoffset = 201 * (1 - pct);
  if (pct > 0.5) ring.style.stroke = 'var(--violet)';
  else if (pct > 0.25) ring.style.stroke = 'var(--amber)';
  else ring.style.stroke = 'var(--rose)';
}

function timeExpired() {
  wrongCount++;
  document.getElementById('wrong-count').textContent = wrongCount;
  showFeedback(false, `Vaqt tugadi! Javob: ${questions[current].a}`);
  setTimeout(() => { current++; showQuestion(); }, 1200);
}

function submitAnswer() {
  clearInterval(timerInterval);
  const inp = document.getElementById('answer-input');
  const val = parseInt(inp.value);
  if (inp.value === '') return;
  const correct = val === questions[current].a;
  if (correct) {
    score++;
    document.getElementById('correct-count').textContent = score;
    inp.className = 'answer-input correct';
    showFeedback(true, "✓ To'g'ri!");
  } else {
    wrongCount++;
    document.getElementById('wrong-count').textContent = wrongCount;
    inp.className = 'answer-input wrong';
    showFeedback(false, `✗ Xato! Javob: ${questions[current].a}`);
  }
  document.getElementById('live-score').textContent = `${score} to'g'ri`;
  setTimeout(() => { current++; showQuestion(); }, 800);
}

function showFeedback(ok, msg) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = 'feedback ' + (ok ? 'correct' : 'wrong');
}

function finishTest() {
  clearInterval(timerInterval);
  const pct = score / TOTAL;
  let icon = pct >= 0.9 ? '🏆' : pct >= 0.7 ? '⭐' : pct >= 0.5 ? '📊' : '💪';
  let grade = pct >= 0.9 ? 'Ajoyib! Siz matematik dahosiz!' :
              pct >= 0.7 ? 'Yaxshi natija! Davom eting!' :
              pct >= 0.5 ? "O'rta daraja. Ko'proq mashq qiling." :
              "Ko'proq o'rganish kerak. Harakat qiling!";

  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-name').textContent = playerName;
  document.getElementById('res-correct').textContent = score;
  document.getElementById('result-grade').textContent = grade;

  if (pct >= 0.8) launchConfetti();

  const diffNames = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' };
  const history = JSON.parse(localStorage.getItem('results') || '[]');
  history.unshift({ name: playerName, score, diff: diffNames[difficulty], date: new Date().toLocaleDateString('uz') });
  if (history.length > 10) history.pop();
  localStorage.setItem('results', JSON.stringify(history));

  loadHistory('result-history');
  showScreen('screen-result');
}

function loadHistory(id) {
  const history = JSON.parse(localStorage.getItem('results') || '[]');
  const list = document.getElementById(id);
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML = '<p style="color:var(--dim);font-size:13px;text-align:center;padding:12px">Hali natija yo\'q</p>';
    return;
  }
  list.innerHTML = '';
  history.forEach(r => {
    const li = document.createElement('div');
    li.className = 'history-item';
    li.innerHTML = `<span class="h-name">${r.name}</span><span class="h-diff">${r.diff||''}</span><span class="h-score">${r.score}/20</span>`;
    list.appendChild(li);
  });
}

function clearResults() {
  if (confirm("Barcha natijalarni o'chirmoqchimisiz?")) {
    localStorage.removeItem('results');
    loadHistory('menu-history');
    loadHistory('result-history');
  }
}

function showMenu() { showScreen('screen-menu'); loadHistory('menu-history'); }
function restartTest() { startTest(); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function showNameError(msg) {
  let el = document.getElementById('name-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'name-error';
    el.style.cssText = 'color:var(--rose);font-size:12px;font-weight:700;letter-spacing:1px;margin-top:6px;padding-left:4px;';
    document.getElementById('name-input').parentNode.appendChild(el);
  }
  el.textContent = '⚠ ' + msg;
  document.getElementById('name-input').style.borderColor = 'var(--rose)';
}

function hideNameError() {
  const el = document.getElementById('name-error');
  if (el) el.textContent = '';
  document.getElementById('name-input').style.borderColor = '';
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('screen-game').classList.contains('active')) {
      submitAnswer();
    } else if (document.getElementById('screen-menu').classList.contains('active')) {
      startTest();
    }
  }
});

// ─── CONFETTI ───
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#8b5cf6','#a78bfa','#22d3ee','#f59e0b','#10b981','#f43f5e'];
  const pieces = Array.from({length: 130}, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 6 + 3,
    c: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    rot: Math.random() * 360,
    rv: (Math.random() - 0.5) * 8
  }));
  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.rv; p.vy += 0.05;
    });
    if (pieces.some(p => p.y < canvas.height)) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
  setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 4500);
}

// Init
loadHistory('menu-history');
