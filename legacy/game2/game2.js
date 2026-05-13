let p1 = '', p2 = '', targetPos = 10;
let activeOps = ['+'];
let pos1 = 0, pos2 = 0, currentTurn = 1;
let wins = {};
let qa = null, qb = null, qOp = null, qAns = null;

// ─── VALIDATION ───
function validatePlayerName(name, playerNum) {
  if (!name) return `${playerNum}-o'yinchi ismini kiriting!`;
  if (name.length < 2) return "Ism kamida 2 harf bo'lishi kerak!";
  if (!/^[a-zA-ZА-Яа-яЎўҚқҒғҲҳ\s'-]+$/u.test(name)) return "Faqat harflardan foydalaning!";
  return null;
}

function showFieldError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (msg) {
    input.style.borderColor = 'var(--rose)';
    err.textContent = '⚠ ' + msg;
  } else {
    input.style.borderColor = '';
    err.textContent = '';
  }
}

// ─── SETUP ───
function toggleOp(btn) {
  const op = btn.dataset.op;
  if (activeOps.includes(op)) {
    if (activeOps.length === 1) return; // Keep at least one
    activeOps = activeOps.filter(o => o !== op);
    btn.classList.remove('active');
  } else {
    activeOps.push(op);
    btn.classList.add('active');
  }
}

function setTarget(btn, val) {
  document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  targetPos = val;
}

function startGame() {
  const n1 = document.getElementById('p1-name').value.trim();
  const n2 = document.getElementById('p2-name').value.trim();

  const err1 = validatePlayerName(n1, 1);
  const err2 = validatePlayerName(n2, 2);
  showFieldError('p1-name', 'p1-err', err1);
  showFieldError('p2-name', 'p2-err', err2);

  if (err1 || err2) return;

  // Check same name
  if (n1.toLowerCase() === n2.toLowerCase()) {
    showFieldError('p2-name', 'p2-err', "Ikki o'yinchi ismi har xil bo'lsin!");
    return;
  }

  p1 = n1; p2 = n2;
  wins[p1] = wins[p1] || 0;
  wins[p2] = wins[p2] || 0;
  pos1 = 0; pos2 = 0; currentTurn = 1;

  buildTracks();
  document.getElementById('p1-track-name').textContent = p1.length > 8 ? p1.slice(0,7)+'…' : p1;
  document.getElementById('p2-track-name').textContent = p2.length > 8 ? p2.slice(0,7)+'…' : p2;
  updateUI();
  newQuestion();
  showScreen('screen-game');
}

function buildTracks() {
  ['track-p1','track-p2'].forEach(id => {
    const t = document.getElementById(id);
    t.innerHTML = '';
    for (let i = 0; i < targetPos; i++) {
      const c = document.createElement('div');
      c.className = 'cell';
      t.appendChild(c);
    }
  });
}

function updateUI() {
  const tb = document.getElementById('turn-bar');
  const tn = document.getElementById('turn-name');
  tb.className = 'turn-bar ' + (currentTurn === 1 ? 't1' : 't2');
  tn.className = 'turn-player ' + (currentTurn === 1 ? 'c1' : 'c2');
  tn.textContent = currentTurn === 1 ? p1 : p2;

  const okBtn = document.getElementById('ok-btn');
  okBtn.className = 'btn-ok ' + (currentTurn === 1 ? 'o1' : 'o2');

  const inp = document.getElementById('ans-inp');
  inp.className = 'ans-input ' + (currentTurn === 1 ? 'a1' : 'a2');

  const qDisp = document.getElementById('q-display');
  qDisp.className = 'q-display ' + (currentTurn === 1 ? 't1' : 't2');

  document.getElementById('s1-wins').textContent = wins[p1] || 0;
  document.getElementById('s2-wins').textContent = wins[p2] || 0;
  document.getElementById('s1-name').textContent = p1.length > 6 ? p1.slice(0,5)+'…' : p1;
  document.getElementById('s2-name').textContent = p2.length > 6 ? p2.slice(0,5)+'…' : p2;

  updateCells('track-p1', pos1, 'f1');
  updateCells('track-p2', pos2, 'f2');
  document.getElementById('pos-p1').textContent = `${pos1}/${targetPos}`;
  document.getElementById('pos-p2').textContent = `${pos2}/${targetPos}`;
}

function updateCells(id, pos, cls) {
  const cells = document.getElementById(id).children;
  for (let i = 0; i < cells.length; i++) {
    cells[i].className = 'cell' + (i < pos ? ` ${cls}` : '') + (i === pos - 1 && pos > 0 ? ' pulse' : '');
  }
}

function newQuestion() {
  qOp = activeOps[Math.floor(Math.random() * activeOps.length)];
  if (qOp === '×') {
    qa = Math.floor(Math.random() * 13);
    qb = Math.floor(Math.random() * 13);
    qAns = qa * qb;
  } else if (qOp === '+') {
    qa = Math.floor(Math.random() * 21);
    qb = Math.floor(Math.random() * 21);
    qAns = qa + qb;
  } else {
    qa = Math.floor(Math.random() * 30);
    qb = Math.floor(Math.random() * (qa + 1));
    qAns = qa - qb;
  }
  document.getElementById('q-text').textContent = `${qa} ${qOp} ${qb} = ?`;
  const inp = document.getElementById('ans-inp');
  inp.value = '';
  inp.className = 'ans-input ' + (currentTurn === 1 ? 'a1' : 'a2');
  inp.focus();
  document.getElementById('feed-line').textContent = '';
  document.getElementById('feed-line').className = 'feed-line';
}

function checkAnswer() {
  const inp = document.getElementById('ans-inp');
  const val = parseInt(inp.value);
  if (inp.value === '') return;

  const ok = val === qAns;
  if (ok) {
    if (currentTurn === 1) pos1++;
    else pos2++;
    inp.className = 'ans-input correct';
    showFeed(true, "✓ To'g'ri!");
  } else {
    inp.className = 'ans-input wrong';
    showFeed(false, `✗ Xato! Javob: ${qAns}`);
  }

  updateUI();

  if (pos1 >= targetPos) { setTimeout(() => winGame(1), 600); return; }
  if (pos2 >= targetPos) { setTimeout(() => winGame(2), 600); return; }

  currentTurn = currentTurn === 1 ? 2 : 1;
  setTimeout(() => { updateUI(); newQuestion(); }, 700);
}

function showFeed(ok, msg) {
  const el = document.getElementById('feed-line');
  el.textContent = msg;
  el.className = 'feed-line ' + (ok ? 'ok' : 'fail');
}

function winGame(who) {
  const winner = who === 1 ? p1 : p2;
  wins[winner] = (wins[winner] || 0) + 1;

  document.getElementById('win-name').textContent = winner;
  document.getElementById('win-name').className = 'win-name ' + (who === 1 ? 'w1' : 'w2');
  document.getElementById('win-sub').textContent = `Barcha ${targetPos} bosqichni zabt etdi!`;

  updateLeaderboard();
  launchConfetti(who === 1 ? '#f59e0b' : '#22d3ee');
  showScreen('screen-win');
}

function updateLeaderboard() {
  const rows = document.getElementById('lb-rows');
  const sorted = Object.entries(wins).sort((a,b) => b[1]-a[1]);
  rows.innerHTML = sorted.map(([name, w], i) => `
    <div class="lb-row">
      <span class="lb-rank ${i===0?'gold':''}">${i===0?'🥇':i===1?'🥈':'🥉'}</span>
      <span class="lb-name">${name}</span>
      <span class="lb-wins">${w} yutish</span>
    </div>
  `).join('');
}

function rematch() {
  pos1 = 0; pos2 = 0; currentTurn = 1;
  buildTracks(); updateUI(); newQuestion();
  showScreen('screen-game');
}
function showSetup() { showScreen('screen-setup'); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('screen-game').classList.contains('active')) {
    checkAnswer();
  }
});

function launchConfetti(color) {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = [color, '#ffffff', '#8b5cf6', color+'99', '#f43f5e'];
  const pieces = Array.from({length:120}, () => ({
    x: Math.random() * canvas.width, y: -10,
    r: Math.random() * 7 + 3,
    c: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random()-.5)*4, vy: Math.random()*3+2,
    rot: Math.random()*360, rv: (Math.random()-.5)*8
  }));
  let fr;
  (function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
      ctx.restore();
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.rv; p.vy+=0.06;
    });
    if (pieces.some(p => p.y < canvas.height)) fr = requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  })();
  setTimeout(() => { cancelAnimationFrame(fr); ctx.clearRect(0,0,canvas.width,canvas.height); }, 4500);
}
