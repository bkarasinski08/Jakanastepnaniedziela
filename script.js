// script.js - main page controller + popups
document.getElementById('year').textContent = new Date().getFullYear();

const btnGodzina = document.getElementById('tab-godzina');
const btnGra = document.getElementById('tab-gra');
const themeSwitcher = document.getElementById('themeSwitcher');

// friendly ripple effect for all .tab buttons
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height)*1.2;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(()=>ripple.remove(), 700);
  });
});

// theme: remember + system preference
const stored = localStorage.getItem('site-theme');
if(stored) document.body.classList.add(stored);
else {
  if(window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches) document.body.classList.add('dark');
  else document.body.classList.add('dark'); // default dark
}
if(document.body.classList.contains('light')) themeSwitcher.checked = true;
themeSwitcher.addEventListener('change', ()=>{
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
  localStorage.setItem('site-theme', document.body.classList.contains('light')?'light':'dark');
  // soft glow animation
  document.body.animate([{filter:'brightness(1.08)'},{filter:'brightness(1)'}],{duration:420,fill:'both'});
});

// open clock popup
btnGodzina.addEventListener('click', openClockWindow);
btnGra.addEventListener('click', openGameWindow);

function openClockWindow(){
  const w = window.open('', 'godzinaWindow', 'width=920,height=720');
  if(!w){ alert('Popup został zablokowany — zezwól na wyskakujące okna dla tej strony.'); return; }
  const html = `<!doctype html>
  <html lang="pl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Godziny świata</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}body{font-family:Montserrat,system-ui;margin:0;background:#081018;color:#eef6ff;-webkit-font-smoothing:antialiased}
    h1{text-align:center;color:#00b3ff;padding:18px 10px;margin:0;text-shadow:0 6px 20px rgba(0,179,255,0.14)}
    .frame{max-width:920px;margin:18px auto;background:rgba(255,255,255,0.03);border-radius:14px;padding:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.04)}
    .search{width:100%;display:block;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:inherit;font-size:15px;margin-bottom:14px;box-sizing:border-box}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;max-height:62vh;overflow:auto;padding:6px}
    .item{padding:10px;border-radius:10px;background:rgba(0,179,255,0.06);text-align:center}
    .name{font-weight:600;color:#00b3ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .time{font-weight:800;font-size:18px;margin-top:6px}
    @keyframes openAnim{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
    .frame{animation:openAnim .42s ease both}
  </style></head><body>
    <h1>Godziny świata</h1>
    <div class="frame">
      <input id="search" class="search" placeholder="Szukaj strefy czasowej..." />
      <div id="list" class="grid" aria-live="polite"></div>
    </div>
    <script>
      const list = document.getElementById('list'), search = document.getElementById('search');
      const tzs = (typeof Intl.supportedValuesOf==='function') ? Intl.supportedValuesOf('timeZone') : ['UTC','Europe/Warsaw','Europe/London','America/New_York','Asia/Tokyo'];
      const entries = tzs.map(tz => {
        const display = tz.replace(/\//g,' / ').replace(/_/g,' ');
        const el = document.createElement('div'); el.className='item'; el.dataset.tz = tz;
        el.innerHTML = '<div class="name">'+display+'</div><div class="time">--:--:--</div>';
        return el;
      });
      function render(q=''){ list.innerHTML=''; q = q.trim().toLowerCase(); entries.filter(e=> !q || e.dataset.tz.toLowerCase().includes(q) || e.querySelector('.name').textContent.toLowerCase().includes(q)).forEach(e=>list.appendChild(e));}
      render();
      function update(){
        const now = new Date();
        entries.forEach(e=>{
          try{
            const fmt = new Intl.DateTimeFormat([], { timeZone: e.dataset.tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
            e.querySelector('.time').textContent = fmt.format(now);
          }catch(err){}
        });
      }
      update(); setInterval(update, 1000);
      search.addEventListener('input', (ev)=> render(ev.target.value));
    <\/script>
  </body></html>`;
  w.document.write(html); w.document.close();
}

// open game popup (X and O as emoji)
function openGameWindow(){
  const w = window.open('', 'graWindow', 'width=880,height=880');
  if(!w){ alert('Popup został zablokowany — zezwól na wyskakujące okna dla tej strony.'); return; }
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Gra X i O</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}body{font-family:Montserrat,system-ui;margin:0;background:#071018;color:#eef6ff;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px}
    h1{margin:6px 0 12px;color:#00b3ff;text-shadow:0 8px 30px rgba(0,179,255,0.12)}
    .menu{display:flex;gap:10px;align-items:center;margin:8px 0}
    select,button{padding:10px 12px;border-radius:10px;border:none;background:#00b3ff;color:white;cursor:pointer;font-weight:600}
    select{background:#0e1218;color:#eef6ff}
    .board{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(420px,88vw);margin-top:14px}
    .cell{aspect-ratio:1/1;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;font-size:48px;border-radius:12px;cursor:pointer;transition:all .18s}
    .cell:hover{transform:translateY(-4px)}
    .cell.win{background:linear-gradient(90deg,rgba(0,200,150,0.18),rgba(0,179,255,0.18));box-shadow:0 18px 40px rgba(0,179,255,0.12)}
    .status{margin-top:14px;font-weight:700}
    @media (max-width:420px){ .cell{font-size:34px} select,button{padding:8px 10px} }
  </style></head><body>
    <h1>Gra ❌ i ⭕</h1>
    <div class="menu">
      <select id="mode"><option value="pvp">Gracz vs Gracz</option><option value="bot">Gracz vs Bot</option></select>
      <select id="difficulty"><option value="easy">Łatwy</option><option value="medium">Średni</option><option value="hard">Trudny</option><option value="hardcore">Hardcore</option></select>
      <button id="restart">Restart</button>
    </div>
    <div class="board" id="board" role="grid" aria-label="Plansza kółko i krzyżyk"></div>
    <div class="status" id="status" aria-live="polite"></div>

    <script>
    // small WebAudio helper for clicks and victory
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AudioCtx ? new AudioCtx() : null;
    function tone(freq, time=0.06, type='sine'){ if(!audioCtx) return; const o=audioCtx.createOscillator(); const g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=0.0001; o.connect(g); g.connect(audioCtx.destination); g.gain.linearRampToValueAtTime(0.12,audioCtx.currentTime+0.003); o.start(); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime + time); setTimeout(()=>{o.stop()}, time*1000+30); }

    // game
    const boardEl = document.getElementById('board'), statusEl = document.getElementById('status');
    let board = Array(9).fill(null), current = '❌', over=false;
    const mode = document.getElementById('mode'), difficulty = document.getElementById('difficulty');

    function render(){
      boardEl.innerHTML = '';
      board.forEach((v,i)=>{
        const c = document.createElement('div'); c.className='cell'; c.dataset.idx=i; c.textContent = v||''; c.addEventListener('click', ()=>onCell(i));
        boardEl.appendChild(c);
      });
    }

    function onCell(i){
      if(board[i] || over) return;
      playClick();
      makeMove(i,current);
    }

    function makeMove(i, player){
      board[i] = player;
      render();
      const win = checkWin(player);
      if(win){ over=true; showWin(win, player); return; }
      if(board.every(Boolean)){ over=true; statusEl.textContent='Remis!'; tone(220,0.25,'sawtooth'); return; }
      current = (player==='❌') ? '⭕' : '❌';
      if(mode.value==='bot' && current==='⭕' && !over){
        setTimeout(()=> botPlay(), 350);
      }
    }

    function botPlay(){
      const diff = difficulty.value;
      let idx = 0;
      if(diff==='easy') idx = randomMove();
      else if(diff==='medium') idx = mediumMove();
      else if(diff==='hard') idx = hardMove();
      else idx = minimax(board,'⭕').index;
      makeMove(idx, '⭕');
    }

    function randomMove(){ const empt = board.map((v,i)=>v?null:i).filter(x=>x!==null); return empt[Math.floor(Math.random()*empt.length)]; }

    function mediumMove(){
      // try win, try block, else random
      for(let i=0;i<9;i++){ if(!board[i]){ board[i]='⭕'; if(checkWin('⭕')){ board[i]=null; return i } board[i]=null } }
      for(let i=0;i<9;i++){ if(!board[i]){ board[i]='❌'; if(checkWin('❌')){ board[i]=null; return i } board[i]=null } }
      return randomMove();
    }

    function hardMove(){
      // small probability to make a mistake
      if(Math.random() < 0.25) return randomMove();
      // otherwise minimax-like heuristics
      for(let i=0;i<9;i++){ if(!board[i]){ board[i]='⭕'; if(checkWin('⭕')){ board[i]=null; return i } board[i]=null } }
      for(let i=0;i<9;i++){ if(!board[i]){ board[i]='❌'; if(checkWin('❌')){ board[i]=null; return i } board[i]=null } }
      // center, corners, sides priority
      const order = [4,0,2,6,8,1,3,5,7];
      for(const k of order) if(!board[k]) return k;
      return randomMove();
    }

    function checkWin(p){
      const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(const w of wins){ const [a,b,c]=w; if(board[a]===p && board[b]===p && board[c]===p) return w; }
      return null;
    }

    function showWin(cells, player){
      // highlight cells
      const cellEls = Array.from(boardEl.children);
      cells.forEach(i=>{ cellEls[i].classList.add('win'); });
      statusEl.textContent = player + ' wygrał!';
      // victory tones
      tone(440,0.12,'sine'); setTimeout(()=>tone(660,0.14,'sine'),140); setTimeout(()=>tone(880,0.18,'sine'),320);
      // simple confetti-like small colored dots (no external lib)
      emitVictoryParticles(cells);
    }

    function emitVictoryParticles(cells){
      const rect = boardEl.getBoundingClientRect();
      const container = document.createElement('div'); container.style.position='fixed'; container.style.left='0'; container.style.top='0'; container.style.width='100%'; container.style.height='100%'; container.style.pointerEvents='none';
      document.body.appendChild(container);
      for(let i=0;i<45;i++){
        const d = document.createElement('div'); d.style.position='absolute'; d.style.width='8px'; d.style.height='8px'; d.style.borderRadius='50%';
        d.style.left=(50+ (Math.random()-0.5)*60)+'%'; d.style.top=(30+ Math.random()*40)+'%';
        d.style.background = ['#00b3ff','#7afcff','#ffb86b','#7dffb2'][Math.floor(Math.random()*4)];
        d.style.opacity='0.95'; d.style.transform='translateY(0) scale(1)';
        container.appendChild(d);
        const dx = (Math.random()-0.5)*200; const dy = - (60 + Math.random()*300);
        d.animate([{transform:'translate(0,0) scale(1)', opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(0.7)', opacity:0}],{duration:1200+Math.random()*800, easing:'cubic-bezier(.2,.8,.2,1)'});
        setTimeout(()=>d.remove(),1700);
      }
      setTimeout(()=>container.remove(),1800);
    }

    function minimax(newBoard, player){
      const avail = newBoard.map((v,i)=>v?null:i).filter(x=>x!==null);
      if(checkWin('❌')) return {score:-10};
      if(checkWin('⭕')) return {score:10};
      if(avail.length===0) return {score:0};
      const moves = [];
      for(let i=0;i<avail.length;i++){
        const move = {};
        move.index = avail[i];
        newBoard[avail[i]] = player;
        const result = (player==='⭕') ? minimax(newBoard,'❌') : minimax(newBoard,'⭕');
        move.score = result.score;
        newBoard[avail[i]] = null;
        moves.push(move);
      }
      let bestMove;
      if(player==='⭕'){
        let best=-9999;
        for(let i=0;i<moves.length;i++){ if(moves[i].score>best){ best = moves[i].score; bestMove = i; } }
      } else {
        let best=9999;
        for(let i=0;i<moves.length;i++){ if(moves[i].score<best){ best = moves[i].score; bestMove = i; } }
      }
      return moves[bestMove];
    }

    function playClick(){ tone(880,0.03,'sine'); }

    document.getElementById('restart').addEventListener('click', ()=>{ board = Array(9).fill(null); current='❌'; over=false; statusEl.textContent=''; render(); playClick(); });

    render();
    </script>
  </body></html>`;
  w.document.write(html); w.document.close();
}
