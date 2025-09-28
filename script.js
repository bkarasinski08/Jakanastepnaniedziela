  /* ========= Lista niedziel handlowych (źródła: zestawienia 2025-2030) =========
   Daty przygotowane na podstawie publicznych kalendarzy niedziel handlowych.
   Źródła (przykładowe): kalendarzdni.pl, kalendarzswiat.pl, galerialimonka.pl, czydzisjesthandlowaniedziela.pl
   Dokładne strony cytowane w opisie po kodzie.
*/

// --- Lista dat (format YYYY-MM-DD) dla 2025-2030 ---
const tradingSundays = [
  // 2025
  "2025-01-26","2025-04-13","2025-04-27","2025-06-29","2025-08-31","2025-12-07","2025-12-14","2025-12-21",
  // 2026
  "2026-01-25","2026-03-29","2026-04-26","2026-06-28","2026-08-30","2026-12-06","2026-12-13","2026-12-20",
  // 2027
  "2027-01-31","2027-03-21","2027-04-25","2027-06-27","2027-08-29","2027-12-05","2027-12-12","2027-12-19",
  // 2028
  "2028-01-30","2028-04-09","2028-04-23","2028-06-25","2028-08-27","2028-12-03","2028-12-10","2028-12-17","2028-12-24",
  // 2029
  "2029-01-28","2029-03-25","2029-04-29","2029-06-24","2029-08-26","2029-12-16","2029-12-23",
  // 2030
  "2030-01-27","2030-04-14","2030-04-28","2030-06-23","2030-08-25","2030-12-15","2030-12-22"
].map(d => new Date(d + "T00:00:00+01:00")); // treat as Europe/Warsaw-ish local midnight

// --- Utility: find next trading sunday after now ---
function findNextTradingSunday(now = new Date()){
  // normalize now to local
  for (let d of tradingSundays){
    if (d.getTime() > now.getTime()){
      return d;
    }
  }
  return null; // none found in list
}

// --- Countdown rendering ---
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const nextDateText = document.getElementById('nextDateText');
const listEl = document.getElementById('niedzieleList');

function formatDatePolish(d){
  return d.toLocaleDateString('pl-PL', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
}
function updateDatesList(){
  listEl.innerHTML = '';
  tradingSundays.forEach(d=>{
    const li = document.createElement('li');
    li.textContent = formatDatePolish(d);
    listEl.appendChild(li);
  });
}
updateDatesList();

let target = findNextTradingSunday(new Date());

function updateCountdown(){
  const now = new Date();
  if (!target){
    cdDays.textContent='--';cdHours.textContent='--';cdMins.textContent='--';cdSecs.textContent='--';
    nextDateText.textContent = "Brak kolejnych dat w liście (2025–2030).";
    return;
  }
  let diff = target.getTime() - now.getTime();
  if (diff <= 0){
    // wybierz następny z listy
    target = findNextTradingSunday(new Date(now.getTime() + 1000));
    updateCountdown();
    return;
  }
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  cdDays.textContent = String(days).padStart(2,'0');
  cdHours.textContent = String(hours).padStart(2,'0');
  cdMins.textContent = String(mins).padStart(2,'0');
  cdSecs.textContent = String(secs).padStart(2,'0');
  nextDateText.textContent = formatDatePolish(target);
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ================== Zakładki ================== */
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>{p.classList.remove('active');p.setAttribute('aria-hidden','true')});
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    const panel = document.getElementById(tab);
    panel.classList.add('active');
    panel.setAttribute('aria-hidden','false');
  });
});

/* ================== Tryb jasny/ciemny ================== */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(dark){
  if (dark) document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
}
themeToggle.addEventListener('change', (e)=>applyTheme(e.target.checked));
// Domyślnie jasny (checkbox false)
// Jeśli chcesz zapamiętać w localStorage: można dodać później

/* ================== Kółko i krzyżyk (Tic-Tac-Toe) ================== */
const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const gameStatus = document.getElementById('gameStatus');
const newGameBtn = document.getElementById('newGameBtn');
const gameModeSelect = document.getElementById('gameMode');
const player1MarkSelect = document.getElementById('player1Mark');

let boardState = Array(9).fill(null); // 'X' or 'O' or null
let currentPlayer = 'X';
let gameActive = true;

function lines(){
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
}

function checkWinner(b){
  for (const [a,b1,c] of lines()){
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if (b.every(x=>x!==null)) return 'tie';
  return null;
}

function renderBoard(){
  cells.forEach((cell,i)=>{
    cell.textContent = boardState[i] || '';
    cell.classList.toggle('disabled', !gameActive || boardState[i]);
  });
  const winner = checkWinner(boardState);
  if (winner === 'tie'){
    gameStatus.textContent = "Remis! Kliknij 'Nowa gra' żeby zagrać ponownie.";
    gameActive = false;
  } else if (winner){
    gameStatus.textContent = `Wygrał ${winner}!`;
    gameActive = false;
  } else {
    gameStatus.textContent = `Ruch: ${currentPlayer}`;
  }
}

function makeMove(idx, mark){
  if (!gameActive || boardState[idx]) return false;
  boardState[idx] = mark;
  return true;
}

/* ===== Simple but solid Minimax for the bot ===== */
function minimax(b, playerMark, maximizing){
  const result = checkWinner(b);
  if (result === playerMark) return {score: 10};
  if (result && result !== playerMark && result !== 'tie') return {score: -10};
  if (result === 'tie') return {score: 0};

  const avail = b.map((v,i)=>v===null?i:null).filter(x=>x!==null);
  let best;
  if (maximizing){
    best = {score: -Infinity};
    for (const i of avail){
      b[i] = playerMark;
      const res = minimax(b, playerMark, false);
      b[i] = null;
      if (res.score > best.score) best = {score: res.score, index: i};
    }
  } else {
    const opponent = (playerMark === 'X') ? 'O' : 'X';
    best = {score: Infinity};
    for (const i of avail){
      b[i] = opponent;
      const res = minimax(b, playerMark, true);
      b[i] = null;
      if (res.score < best.score) best = {score: res.score, index: i};
    }
  }
  return best;
}

function botMove(){
  // bot plays as the opposite of player1Mark if player chose X for player1
  const player1Mark = player1MarkSelect.value;
  const humanMark = player1Mark;
  const botMark = (humanMark === 'X') ? 'O' : 'X';

  // If board empty, take center if possible
  if (boardState.every(v=>v===null)){
    makeMove(4, botMark);
    return;
  }

  const copy = boardState.slice();
  const best = minimax(copy, botMark, true);
  if (typeof best.index === 'number') makeMove(best.index, botMark);
  else {
    // fallback: choose random free
    const free = boardState.map((v,i)=>v===null?i:null).filter(x=>x!==null);
    if (free.length) makeMove(free[0], botMark);
  }
}

cells.forEach(c=>{
  c.addEventListener('click', (e)=>{
    const idx = parseInt(c.dataset.index,10);
    if (!gameActive) return;
    if (boardState[idx]) return;
    const mode = gameModeSelect.value;
    const player1Mark = player1MarkSelect.value;
    // Determine whose turn it is based on currentPlayer
    if (mode === 'pvp'){
      if (makeMove(idx, currentPlayer)){
        const res = checkWinner(boardState);
        if (!res){
          currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        }
        renderBoard();
      }
    } else { // vs AI
      // human is player1Mark. If it's human turn, place human mark and then bot moves.
      const humanMark = player1Mark;
      const botMark = humanMark === 'X' ? 'O' : 'X';

      // determine whose move it is: count marks
      const humanCount = boardState.filter(v=>v===humanMark).length;
      const botCount = boardState.filter(v=>v===botMark).length;
      const humanTurn = (humanCount === botCount) || (humanCount < botCount);

      if (!humanTurn) return; // not human turn
      if (makeMove(idx, humanMark)){
        renderBoard();
        // bot move after slight delay
        setTimeout(()=>{
          if (checkWinner(boardState)) return;
          botMove();
          renderBoard();
        }, 400);
      }
    }
  });

  // keyboard accessibility
  c.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault(); c.click();
    }
  });
});

newGameBtn.addEventListener('click', ()=>{
  boardState = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  renderBoard();

  // If mode is AI and bot should start (i.e., player chose O as player1), let bot move first
  const mode = gameModeSelect.value;
  const player1Mark = player1MarkSelect.value;
  if (mode === 'ai' && player1Mark === 'O'){
    setTimeout(()=>{ botMove(); renderBoard(); }, 300);
  }
});

// If mode or player mark changes, start new game
gameModeSelect.addEventListener('change', ()=> newGameBtn.click());
player1MarkSelect.addEventListener('change', ()=> newGameBtn.click());

// initialize
newGameBtn.click();
renderBoard();
