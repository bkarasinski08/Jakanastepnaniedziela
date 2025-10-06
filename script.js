document.getElementById('year').textContent = new Date().getFullYear();

const btnGodzina = document.getElementById('tab-godzina');
const btnGra = document.getElementById('tab-gra');
const switcher = document.getElementById('themeSwitcher');

switcher.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

btnGodzina.addEventListener('click', () => openClockWindow());
btnGra.addEventListener('click', () => openGameWindow());

// ==================== OKNO Z GODZINAMI ====================
function openClockWindow() {
  const w = window.open('', 'godzinaWindow', 'width=900,height=700');
  if (!w) { alert('Zezwól na wyskakujące okna!'); return; }
  const html = `<!doctype html><html lang='pl'><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'/>
  <title>Godziny świata</title>
  <link href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap' rel='stylesheet'>
  <style>
  body { background:#0e0e14; color:#f5f7fa; font-family:'Montserrat',sans-serif; margin:0; padding:20px; }
  h1 { text-align:center; color:#00b3ff; text-shadow:0 0 20px rgba(0,179,255,0.6); font-size:clamp(26px,4vw,42px); }
  .frame { margin:30px auto; max-width:860px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:20px; box-shadow:0 0 30px rgba(0,179,255,0.2); }
  .search { width:calc(100% - 8px); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#f5f7fa; outline:none; margin-bottom:20px; font-size:16px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; max-height:60vh; overflow:auto; }
  .item { background:rgba(0,179,255,0.08); border-radius:12px; padding:10px 14px; text-align:center; box-shadow:0 0 10px rgba(0,179,255,0.15); }
  .name{font-weight:600;color:#00b3ff;font-size:14px;}
  .time{font-weight:800;font-size:20px;color:white;margin-top:6px;}
  </style></head><body>
  <h1>Godziny świata</h1>
  <div class='frame'>
    <input id='search' class='search' placeholder='Szukaj strefy czasowej...'/>
    <div id='list' class='grid'></div>
  </div>
  <script>
  const list=document.getElementById('list');
  const search=document.getElementById('search');
  const tzs=(typeof Intl.supportedValuesOf==='function')?Intl.supportedValuesOf('timeZone'):['UTC','Europe/Warsaw','America/New_York','Asia/Tokyo','Australia/Sydney'];
  const els=tzs.map(tz=>{const name=tz.replaceAll('/', ' / ').replaceAll('_',' ');const e=document.createElement('div');e.className='item';e.dataset.tz=tz;e.innerHTML=\`<div class='name'>\${name}</div><div class='time'>--:--:--</div>\`;return e;});
  function render(f=''){list.innerHTML='';f=f.toLowerCase();els.filter(e=>!f||e.dataset.tz.toLowerCase().includes(f)).forEach(e=>list.appendChild(e));}
  render();
  function update(){const now=new Date();els.forEach(e=>{try{const fmt=new Intl.DateTimeFormat([], {timeZone:e.dataset.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});e.querySelector('.time').textContent=fmt.format(now);}catch{}});}
  setInterval(update,1000);update();
  search.addEventListener('input',e=>render(e.target.value));
  <\/script></body></html>`;
  w.document.write(html);
  w.document.close();
}

// ==================== OKNO GRY W KÓŁKO I KRZYŻYK ====================
function openGameWindow() {
  const w = window.open('', 'graWindow', 'width=800,height=800');
  if (!w) { alert('Zezwól na wyskakujące okna!'); return; }
  const html = `<!doctype html><html lang='pl'><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'/>
  <title>Gra X i O</title>
  <link href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap' rel='stylesheet'>
  <style>
  body{background:#0e0e14;color:#f5f7fa;font-family:'Montserrat',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;}
  h1{color:#00b3ff;text-shadow:0 0 20px rgba(0,179,255,0.6);}
  .board{display:grid;grid-template-columns:repeat(3,100px);grid-gap:8px;margin-top:20px;}
  .cell{width:100px;height:100px;font-size:48px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border-radius:12px;cursor:pointer;transition:all .2s;}
  .cell:hover{background:rgba(0,179,255,0.2);}
  .menu{margin-bottom:20px;text-align:center;}
  select,button{padding:10px 16px;border-radius:10px;border:none;background:#00b3ff;color:white;cursor:pointer;font-size:16px;margin:5px;}
  select{background:#121218;color:#f5f7fa;}
  .status{margin-top:15px;font-weight:600;}
  </style></head><body>
  <h1>Gra X i O</h1>
  <div class='menu'>
    <select id='mode'>
      <option value='pvp'>Gracz vs Gracz</option>
      <option value='bot'>Gracz vs Bot</option>
    </select>
    <select id='difficulty'>
      <option value='easy'>Łatwy</option>
      <option value='medium'>Średni</option>
      <option value='hard'>Trudny</option>
      <option value='hardcore'>Hardcore</option>
    </select>
    <button id='restart'>Restart</button>
  </div>
  <div class='board' id='board'></div>
  <div class='status' id='status'></div>
  <script>
  const boardEl=document.getElementById('board');
  const statusEl=document.getElementById('status');
  let board=Array(9).fill(null);
  let current='X';
  let gameOver=false;

  function render(){boardEl.innerHTML='';board.forEach((v,i)=>{const cell=document.createElement('div');cell.className='cell';cell.textContent=v||'';cell.onclick=()=>makeMove(i);boardEl.appendChild(cell);});}

  function makeMove(i){if(board[i]||gameOver)return;board[i]=current;render();if(checkWin(current)){statusEl.textContent=current+' wygrał!';gameOver=true;return;}if(board.every(Boolean)){statusEl.textContent='Remis!';gameOver=true;return;}current=current==='X'?'O':'X';if(mode.value==='bot'&&current==='O')botMove();}

  function botMove(){const diff=difficulty.value;let idx;if(diff==='easy'){idx=randomMove();}else if(diff==='medium'){idx=findBestMove(0.3);}else if(diff==='hard'){idx=findBestMove(0.7);}else{idx=findBestMove(1);}makeMove(idx);}
  function randomMove(){const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);return empty[Math.floor(Math.random()*empty.length)];}
  function findBestMove(accuracy){if(Math.random()>accuracy)return randomMove();for(let i=0;i<9;i++){if(!board[i]){board[i]='O';if(checkWin('O')){board[i]=null;return i;}board[i]=null;}}for(let i=0;i<9;i++){if(!board[i]){board[i]='X';if(checkWin('X')){board[i]=null;return i;}board[i]=null;}}return randomMove();}
  function checkWin(p){const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return wins.some(([a,b,c])=>board[a]===p&&board[b]===p&&board[c]===p);}
  document.getElementById('restart').onclick=()=>{board=Array(9).fill(null);current='X';gameOver=false;statusEl.textContent='';render();}
  render();
  const mode=document.getElementById('mode');const difficulty=document.getElementById('difficulty');
  <\/script></body></html>`;
  w.document.write(html);
  w.document.close();
}
