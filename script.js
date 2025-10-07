/* v6 Deluxe main script: theme, open windows, sounds, ripple, confetti, game AI (minimax), scoreboard, and nice UI behaviors */

document.getElementById('year').textContent = new Date().getFullYear();

// THEME: default to system preference; body has class dark by default in HTML
const switcher = document.getElementById('themeSwitcher');
function applyTheme(pref){
  if(pref === 'light'){ document.body.classList.remove('dark'); document.body.classList.add('light'); switcher.checked = true; }
  else { document.body.classList.remove('light'); document.body.classList.add('dark'); switcher.checked = false; }
}
// auto detect
const saved = localStorage.getItem('site-theme');
if(saved) applyTheme(saved);
else {
  const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(prefers);
}

switcher.addEventListener('change', () => {
  const next = switcher.checked ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('site-theme', next);
  // small glow effect
  document.documentElement.style.transition = 'background-color .45s ease, color .45s ease, filter .45s ease';
  document.body.animate([{filter:'brightness(1.05)'},{filter:'brightness(1)'}],{duration:350});
});

// RIPPLE on buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab, button, .cell, .tab-opening');
  if(!btn) return;
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = size + 'px';
  r.style.left = (e.clientX - rect.left - size/2) + 'px';
  r.style.top = (e.clientY - rect.top - size/2) + 'px';
  r.style.background = getComputedStyle(btn).backgroundColor || 'rgba(255,255,255,0.18)';
  btn.appendChild(r);
  setTimeout(()=> r.remove(), 700);
});

// SOUNDS: simple click and win using WebAudio (no external files)
function playClick(){ try{ const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.02; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05); }catch(e){} }
function playWin(){ try{ const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain(); o.type='triangle'; o2.type='sine'; o.frequency.value=440; o2.frequency.value=660; g.gain.value=0.03; o.connect(g); o2.connect(g); g.connect(ctx.destination); o.start(); o2.start(); o.stop(ctx.currentTime + 0.22); o2.stop(ctx.currentTime + 0.22);}catch(e){} }

// small helper for tab animations
function animateButton(btn){
  btn.classList.add('tab-opening');
  setTimeout(()=>btn.classList.remove('tab-opening'), 500);
  playClick();
}

// OPEN CLOCK WINDOW (fixed search bar width, responsive, no overflow)
document.getElementById('tab-godzina').addEventListener('click', function(){ animateButton(this); openClockWindow(); });

function openClockWindow(){
  const w = window.open('', 'godzinaWindow', 'width=920,height=720');
  if(!w) return alert('Zezwól wyskakujące okna (popup).');
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <title>Godziny świata</title>
  <style>
    :root{--accent:#00b3ff;--panel:#0f1620;--muted:#9fb0bf}
    html,body{height:100%;margin:0;font-family:Montserrat,system-ui;background:linear-gradient(180deg,#071022 0%,#020205 100%);color:#eef7ff}
    h1{text-align:center;color:var(--accent);text-shadow:0 0 18px rgba(0,179,255,0.5);padding-top:18px}
    .frame{max-width:940px;margin:18px auto;background:rgba(255,255,255,0.02);border-radius:14px;padding:16px;border:1px solid rgba(255,255,255,0.04);box-shadow:0 18px 40px rgba(0,0,0,0.6);overflow:hidden}
    #search{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:inherit;font-size:16px;margin-bottom:14px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;max-height:65vh;overflow:auto;padding-bottom:8px}
    .item{background:rgba(0,179,255,0.06);border-radius:10px;padding:10px;text-align:center;box-shadow:0 8px 18px rgba(0,0,0,0.45)}
    .name{font-weight:700;color:var(--accent);font-size:13px}
    .time{font-weight:800;font-size:18px;margin-top:6px}
    @media (max-width:420px){ .grid{grid-template-columns:repeat(2,1fr)} #search{font-size:14px} }
  </style>
  </head><body>
  <h1>Godziny świata</h1>
  <div class="frame">
    <input id="search" placeholder="Szukaj strefy czasowej..." />
    <div id="list" class="grid" aria-live="polite"></div>
  </div>
  <script>
    const list = document.getElementById('list');
    const search = document.getElementById('search');
    function getTimeZones(){ if(typeof Intl.supportedValuesOf==='function') return Intl.supportedValuesOf('timeZone'); return ['UTC','Europe/Warsaw','Europe/London','America/New_York','Asia/Tokyo','Australia/Sydney']; }
    const tzs = getTimeZones();
    const els = tzs.map(tz=>{ const name = tz.replaceAll('/',' / ').replaceAll('_',' '); const e = document.createElement('div'); e.className='item'; e.dataset.tz=tz; e.innerHTML = `<div class="name">${name}</div><div class="time">--:--:--</div>`; return e; });
    function render(filter=''){ list.innerHTML=''; const f=filter.trim().toLowerCase(); els.filter(e=>!f||e.dataset.tz.toLowerCase().includes(f)).forEach(e=>list.appendChild(e)); }
    render();
    function update(){ const now = new Date(); els.forEach(e=>{ try{ const fmt = new Intl.DateTimeFormat([], {timeZone:e.dataset.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}); e.querySelector('.time').textContent = fmt.format(now); }catch{} }); }
    update(); setInterval(update,1000);
    search.addEventListener('input',e=>render(e.target.value));
  <\/script>
  </body></html>`;
  w.document.write(html); w.document.close();
}

// OPEN GAME WINDOW
document.getElementById('tab-gra').addEventListener('click', function(){ animateButton(this); openGameWindow(); });

function openGameWindow(){
  const w = window.open('', 'graWindow', 'width=900,height=860');
  if(!w) return alert('Zezwól wyskakujące okna (popup).');
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <title>Gra X i O</title>
  <style>
    :root{--accent:#00b3ff}
    html,body{height:100%;margin:0;font-family:Montserrat,system-ui;background:linear-gradient(180deg,#071022,#020205);color:#eef7ff;display:flex;flex-direction:column;align-items:center;justify-content:center}
    h1{color:var(--accent);text-shadow:0 0 18px rgba(0,179,255,0.45);margin-bottom:10px}
    .container{width:94%;max-width:680px;background:rgba(255,255,255,0.02);border-radius:14px;padding:16px;border:1px solid rgba(255,255,255,0.04);box-shadow:0 18px 40px rgba(0,0,0,0.55)}
    .menu{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px}
    select,button{padding:10px 14px;border-radius:10px;border:none;background:var(--accent);color:#fff;cursor:pointer;font-weight:700}
    select{background:#0f1720;color:#eef7ff;border:1px solid rgba(255,255,255,0.04)}
    .board{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:480px;margin:10px auto}
    .cell{aspect-ratio:1/1;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:48px;border-radius:12px;cursor:pointer;transition:all .16s;user-select:none}
    .cell:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(0,179,255,0.08)}
    .status{margin-top:10px;text-align:center;font-weight:700}
    .line{position:absolute;height:6px;background:linear-gradient(90deg,rgba(255,255,255,0.06),#00b3ff);border-radius:6px;transform-origin:center;box-shadow:0 8px 32px rgba(0,179,255,0.2)}
    .controls{display:flex;gap:8px;justify-content:center;margin-top:8px}
    .score{display:flex;gap:12px;justify-content:center;margin-top:8px;color:#dfefff}
    @media (max-width:480px){ .cell{font-size:36px} select,button{padding:8px 10px} }
  </style>
  </head><body>
  <h1>Gra ❌ i ⭕</h1>
  <div class="container" role="application">
    <div class="menu">
      <select id="mode"><option value="pvp">Gracz vs Gracz</option><option value="bot">Gracz vs Bot</option></select>
      <select id="difficulty"><option value="easy">Łatwy</option><option value="medium">Średni</option><option value="hard">Trudny</option><option value="hardcore">Hardcore</option></select>
      <button id="restart">Restart</button>
    </div>
    <div class="board" id="board" aria-label="Plansza 3x3"></div>
    <div class="status" id="status">Ruch: ❌</div>
    <div class="controls"><button id="undo">Cofnij</button><button id="toggle-sounds">Dźwięki: ON</button></div>
    <div class="score" id="scoreboard"><div id="pWins">Gracz: 0</div><div id="bWins">Bot: 0</div><div id="draws">Remisy: 0</div></div>
  </div>

  <canvas id="confetti" style="position:fixed;left:0;top:0;pointer-events:none;z-index:9999"></canvas>

  <script>
    // small helpers
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const modeSel = document.getElementById('mode');
    const diffSel = document.getElementById('difficulty');
    const restartBtn = document.getElementById('restart');
    const undoBtn = document.getElementById('undo');
    const soundToggle = document.getElementById('toggle-sounds');
    const pWinsEl = document.getElementById('pWins');
    const bWinsEl = document.getElementById('bWins');
    const drawsEl = document.getElementById('draws');
    let soundOn = true;

    // scoreboard in localStorage
    const scoreKey = 'xo_score_v6';
    const loadScore = ()=> JSON.parse(localStorage.getItem(scoreKey) || '{"p":0,"b":0,"d":0}');
    const saveScore = s => localStorage.setItem(scoreKey, JSON.stringify(s));
    let score = loadScore();
    function renderScore(){ pWinsEl.textContent = 'Gracz: ' + score.p; bWinsEl.textContent = 'Bot: ' + score.b; drawsEl.textContent = 'Remisy: ' + score.d; }
    renderScore();

    // game state
    let board = Array(9).fill(null);
    let current = '❌'; // player always starts as X (❌)
    let gameOver = false;
    let history = [];

    // funny bot comments
    const botComments = {
      win: ['Ha! Zgarnąłem to!', 'Brawo mi!', 'Ładny ruch — od bota.', 'Wygrana!'],
      lose: ['Ups... nie tym razem.', 'Dobra robota!', 'Muszę się poprawić...', 'Dobrze zagrane!'],
      draw: ['Remis — będzie rewanż?', 'Okej, remis!', 'Napięta walka.']
    };

    function playClickTone(){ if(!soundOn) return; try{ const ctx=new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=900; g.gain.value=0.02; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.04);}catch(e){} }
    function playWinTone(){ if(!soundOn) return; try{ const ctx=new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const o2=ctx.createOscillator(); const g=ctx.createGain(); o.type='triangle'; o2.type='sine'; o.frequency.value=440; o2.frequency.value=660; g.gain.value=0.03; o.connect(g); o2.connect(g); g.connect(ctx.destination); o.start(); o2.start(); o.stop(ctx.currentTime+0.22); o2.stop(ctx.currentTime+0.22);}catch(e){} }

    // render board
    function render(){
      boardEl.innerHTML='';
      board.forEach((v,i)=>{
        const c = document.createElement('div');
        c.className='cell';
        c.dataset.i = i;
        c.textContent = v || '';
        c.addEventListener('click', ()=> handleCellClick(i));
        boardEl.appendChild(c);
      });
    }

    function handleCellClick(i){
      if(gameOver) return;
      if(board[i]) return;
      history.push(board.slice());
      board[i] = current;
      playClickTone();
      render();
      if(checkWin(current)){
        endGame(current);
        return;
      }
      if(board.every(Boolean)){ drawGame(); return; }
      current = current === '❌' ? '⭕' : '❌';
      statusEl.textContent = 'Ruch: ' + current;
      if(modeSel.value === 'bot' && current === '⭕'){
        setTimeout(botMove, 360);
      }
    }

    function botMove(){
      const diff = diffSel.value;
      let idx = -1;
      if(diff === 'easy') idx = randomMove();
      else if(diff === 'medium') idx = smartMove(0.45);
      else if(diff === 'hard') idx = smartMove(0.85);
      else idx = minimaxDecision();
      if(idx === undefined || idx === null) idx = randomMove();
      board[idx] = current;
      playClickTone();
      render();
      if(checkWin(current)){ endGame(current); return; }
      if(board.every(Boolean)){ drawGame(); return; }
      current = '❌';
      statusEl.textContent = 'Ruch: ' + current;
    }

    function randomMove(){ const empty = board.map((v,i)=>v?null:i).filter(x=>x!==null); return empty[Math.floor(Math.random()*empty.length)]; }

    function smartMove(chance){
      if(Math.random() > chance) return randomMove();
      // try win
      for(let i=0;i<9;i++){ if(!board[i]){ board[i] = '⭕'; if(checkWin('⭕')){ board[i] = null; return i;} board[i] = null; } }
      // block opponent
      for(let i=0;i<9;i++){ if(!board[i]){ board[i] = '❌'; if(checkWin('❌')){ board[i] = null; return i;} board[i] = null; } }
      return randomMove();
    }

    // minimax for hardcore (returns index)
    function minimaxDecision(){
      const copy = board.slice();
      const result = minimax(copy, '⭕');
      return result.index;
    }

    function minimax(bd, player){
      const avail = bd.map((v,i)=>v?null:i).filter(x=>x!==null);
      if(checkStaticWin(bd, '❌')) return {score:-10};
      if(checkStaticWin(bd, '⭕')) return {score:10};
      if(avail.length === 0) return {score:0};
      const moves = [];
      for(let i=0;i<avail.length;i++){
        const move = {};
        move.index = avail[i];
        bd[avail[i]] = player;
        if(player === '⭕'){
          const r = minimax(bd, '❌');
          move.score = r.score;
        } else {
          const r = minimax(bd, '⭕');
          move.score = r.score;
        }
        bd[avail[i]] = null;
        moves.push(move);
      }
      let bestMove;
      if(player === '⭕'){
        let best = -Infinity; for(let i=0;i<moves.length;i++){ if(moves[i].score > best){ best = moves[i].score; bestMove = i; } }
      } else {
        let best = Infinity; for(let i=0;i<moves.length;i++){ if(moves[i].score < best){ best = moves[i].score; bestMove = i; } }
      }
      return moves[bestMove];
    }

    function checkStaticWin(bd, p){
      const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      return wins.some(([a,b,c]) => bd[a]===p && bd[b]===p && bd[c]===p);
    }

    function checkWin(p){
      return checkStaticWin(board, p);
    }

    // end game
    function endGame(p){
      gameOver = true;
      statusEl.textContent = p + ' wygrał!';
      playWinTone();
      highlightWinningLine(p);
      // update score
      if(modeSel.value === 'bot'){
        if(p === '❌'){ score.p++; saveScore(score); renderScore(); showBotComment('lose'); }
        else { score.b++; saveScore(score); renderScore(); showBotComment('win'); }
      } else { // pvp - attribute to whichever symbol (player1/player2)
        showBotComment('win');
      }
      // confetti for player win only (if human won)
      if(p === '❌') startConfetti();
      // small glow
      setTimeout(()=> stopConfetti(), 2500);
    }

    function drawGame(){
      gameOver = true; statusEl.textContent = 'Remis!';
      score.d++; saveScore(score); renderScore();
      showBotComment('draw');
    }

    // highlight winning line
    function highlightWinningLine(p){
      const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(const [a,b,c] of wins){
        if(board[a]===p && board[b]===p && board[c]===p){
          // add animation to those cells
          const cells = document.querySelectorAll('.cell');
          [a,b,c].forEach(i=>{
            const el = cells[i];
            if(!el) return;
            el.animate([{boxShadow:'0 0 8px rgba(255,255,255,0.02)'},{boxShadow:'0 0 26px rgba(0,179,255,0.35)'},{boxShadow:'0 0 10px rgba(0,179,255,0.18)'}],{duration:900,iterations:3});
          });
          // draw a line (visual) - simple horizontal/vertical/diag handling
          drawLine(a,b,c);
        }
      }
    }

    function drawLine(a,b,c){
      const coords = Array.from(document.querySelectorAll('.cell')).map(el=>el.getBoundingClientRect());
      if(!coords[a]) return;
      const canvas = document.getElementById('confetti');
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const rectA = coords[a]; const rectC = coords[c];
      const x1 = rectA.left + rectA.width/2; const y1 = rectA.top + rectA.height/2;
      const x2 = rectC.left + rectC.width/2; const y2 = rectC.top + rectC.height/2;
      ctx.strokeStyle = 'rgba(0,179,255,0.9)'; ctx.lineWidth = 8; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      // fade out the line
      setTimeout(()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); }, 900);
    }

    // confetti (simple)
    let confettiTimer = null;
    function startConfetti(){
      const canvas = document.getElementById('confetti');
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const pieces = [];
      for(let i=0;i<120;i++){ pieces.push({x:Math.random()*canvas.width,y:Math.random()*-canvas.height,vy:2+Math.random()*6,angle:Math.random()*360,spin:Math.random()*10,color:`hsl(${Math.random()*60+180},90%,60%)`,r:4+Math.random()*8}) }
      confettiTimer = setInterval(()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(const p of pieces){ p.y += p.vy; p.x += Math.sin(p.angle*Math.PI/180)*2; p.angle += p.spin*0.1; ctx.fillStyle=p.color; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r,p.r/1.6,p.angle*Math.PI/180,0,Math.PI*2); ctx.fill(); }
      }, 16);
    }
    function stopConfetti(){ if(confettiTimer){ clearInterval(confettiTimer); confettiTimer=null; const canvas = document.getElementById('confetti'); if(canvas) canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height); } }

    // undo & restart
    restartBtn.addEventListener('click', ()=>{ board = Array(9).fill(null); current='❌'; gameOver=false; history=[]; statusEl.textContent = 'Ruch: ' + current; render(); });
    undoBtn.addEventListener('click', ()=>{ if(history.length){ board = history.pop(); current = (board.filter(Boolean).length % 2 === 0) ? '❌' : '⭕'; gameOver=false; statusEl.textContent='Ruch: '+current; render(); } });

    soundToggle.addEventListener('click', ()=>{ soundOn = !soundOn; soundToggle.textContent = 'Dźwięki: ' + (soundOn? 'ON':'OFF'); });

    function showBotComment(type){
      const arr = botComments[type] || [];
      const txt = arr[Math.floor(Math.random()*arr.length)] || '';
      statusEl.textContent = txt;
      // restore a bit later if game continues
      setTimeout(()=>{ if(!gameOver) statusEl.textContent = 'Ruch: ' + current; }, 2200);
    }

    // check keyboard accessibility
    document.addEventListener('keydown',(e)=>{ if(e.key === 'r') restartBtn.click(); });

    // initialization
    render();

    // make sure cells scale on resize
    window.addEventListener('resize', ()=>{ const canvas = document.getElementById('confetti'); if(canvas){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; } });

  <\/script>
  </body></html>`;

  w.document.write(html); w.document.close();
}

// small confetti canvas on main page for wins from popup (kept minimal)
const mainConfettiCanvas = document.getElementById('confettiCanvas');
if(mainConfettiCanvas){ mainConfettiCanvas.width = window.innerWidth; mainConfettiCanvas.height = window.innerHeight; }
window.addEventListener('resize', ()=>{ if(mainConfettiCanvas){ mainConfettiCanvas.width = window.innerWidth; mainConfettiCanvas.height = window.innerHeight; } });

// play click sound on tab open globally
document.querySelectorAll('.tab').forEach(el=> el.addEventListener('click', ()=> playClick()));

// Accessibility: prevent pinch zoom (meta viewport already set) - also prevent double tap zoom on mobile
let lastTouch = 0;
document.addEventListener('touchend', function(e){ const t = new Date().getTime(); if(t - lastTouch <= 300){ e.preventDefault(); } lastTouch = t; }, {passive:false});

// Done
