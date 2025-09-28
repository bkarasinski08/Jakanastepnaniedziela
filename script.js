/* SCRIPT: Poprawiona wersja z lepszym wyglądem, poprawną czcionką i dopracowaną logiką gry oraz odliczaniem. */

(() => {
  "use strict";

  /* ------------------ Lista niedziel handlowych 2025-2030 ------------------
     Daty przygotowane i zgrupowane jako [rok, miesiąc, dzień].
     (Miesiące podawane 1..12 dla czytelności - potem tworzymy Date(y, m-1, d))
  -------------------------------------------------------------------------*/
  const tradingSundaysRaw = [
    // 2025
    [2025,1,26],[2025,4,13],[2025,4,27],[2025,6,29],[2025,8,31],[2025,12,7],[2025,12,14],[2025,12,21],
    // 2026
    [2026,1,25],[2026,3,29],[2026,4,26],[2026,6,28],[2026,8,30],[2026,12,6],[2026,12,13],[2026,12,20],
    // 2027
    [2027,1,31],[2027,3,21],[2027,4,25],[2027,6,27],[2027,8,29],[2027,12,5],[2027,12,12],[2027,12,19],
    // 2028
    [2028,1,30],[2028,4,9],[2028,4,23],[2028,6,25],[2028,8,27],[2028,12,3],[2028,12,10],[2028,12,17],[2028,12,24],
    // 2029
    [2029,1,28],[2029,3,25],[2029,4,29],[2029,6,24],[2029,8,26],[2029,12,16],[2029,12,23],
    // 2030
    [2030,1,27],[2030,4,14],[2030,4,28],[2030,6,23],[2030,8,25],[2030,12,15],[2030,12,22]
  ];

  // Convert to Date objects in the user's local timezone (new Date(year, monthIndex, day))
  const tradingSundays = tradingSundaysRaw.map(([y,m,d]) => new Date(y, m-1, d, 0, 0, 0));

  /* ---------- DOM elements ---------- */
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');
  const nextDateText = document.getElementById('nextDateText');
  const listEl = document.getElementById('niedzieleList');

  function formatDatePolish(d){
    return d.toLocaleDateString('pl-PL', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
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

  function findNextTradingSunday(now = new Date()){
    for (let d of tradingSundays){
      if (d.getTime() > now.getTime()) return d;
    }
    return null;
  }

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

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- Tabs ---------- */
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p=>{p.classList.remove('active');p.setAttribute('aria-hidden','true')});
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      const panel = document.getElementById(tab);
      panel.classList.add('active');
      panel.setAttribute('aria-hidden','false');
    });
  });

  /* ---------- Theme (zapisywanie preferencji) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(dark){
    if (dark) document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  // Load saved
  const savedTheme = localStorage.getItem('site-theme') || 'light';
  applyTheme(savedTheme === 'dark');
  themeToggle.checked = (savedTheme === 'dark');

  themeToggle.addEventListener('change', (e)=>{
    const dark = e.target.checked;
    applyTheme(dark);
    localStorage.setItem('site-theme', dark ? 'dark' : 'light');
  });

  /* ---------- Kółko i krzyżyk ---------- */
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const gameStatus = document.getElementById('gameStatus');
  const newGameBtn = document.getElementById('newGameBtn');
  const gameModeSelect = document.getElementById('gameMode');
  const player1MarkSelect = document.getElementById('player1Mark');

  let boardState = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameActive = true;

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinner(b){
    for (const [a,b1,c] of WIN_LINES){
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (b.every(x => x !== null)) return 'tie';
    return null;
  }

  function renderBoard(){
    cells.forEach((cell,i)=>{
      cell.textContent = boardState[i] || '';
      cell.classList.toggle('disabled', !gameActive || boardState[i]);
    });
    const winner = checkWinner(boardState);
    if (winner === 'tie'){
      gameStatus.textContent = "Remis! Kliknij 'Nowa gra'.";
      gameActive = false;
    } else if (winner){
      gameStatus.textContent = `Wygrał ${winner}!`;
      gameActive = false;
    } else {
      // whose move?
      if (gameModeSelect.value === 'pvp') {
        gameStatus.textContent = `Ruch: ${currentPlayer}`;
      } else {
        const humanMark = player1MarkSelect.value;
        const botMark = humanMark === 'X' ? 'O' : 'X';
        const humanCount = boardState.filter(v=>v===humanMark).length;
        const botCount = boardState.filter(v=>v===botMark).length;
        const humanTurn = (humanCount === botCount);
        gameStatus.textContent = humanTurn ? `Twoja tura (${humanMark})` : `Tura bota (${botMark})`;
      }
    }
  }

  function makeMove(idx, mark){
    if (!gameActive || boardState[idx]) return false;
    boardState[idx] = mark;
    return true;
  }

  /* Minimax implementation (optimal bot) */
  function minimax(newBoard, player, humanMark, botMark){
    const winner = checkWinner(newBoard);
    if (winner === botMark) return {score: 10};
    if (winner === humanMark) return {score: -10};
    if (winner === 'tie') return {score: 0};

    const avail = newBoard.map((v,i)=>v===null?i:null).filter(x=>x!==null);
    const moves = [];

    for (const i of avail){
      const move = {index: i};
      newBoard[i] = player;
      const nextPlayer = (player === 'X') ? 'O' : 'X';
      const result = minimax(newBoard, nextPlayer, humanMark, botMark);
      move.score = result.score;
      newBoard[i] = null;
      moves.push(move);
    }

    // If the current 'player' is botMark, maximize; else minimize
    let bestMove;
    if (player === botMark){
      let bestScore = -Infinity;
      for (const m of moves){
        if (m.score > bestScore){ bestScore = m.score; bestMove = m; }
      }
    } else {
      let bestScore = Infinity;
      for (const m of moves){
        if (m.score < bestScore){ bestScore = m.score; bestMove = m; }
      }
    }
    return bestMove;
  }

  function botMove(){
    const humanMark = player1MarkSelect.value;
    const botMark = humanMark === 'X' ? 'O' : 'X';

    // If empty, take center if available
    if (boardState.every(v => v === null)){
      makeMove(4, botMark);
      return;
    }

    const copy = boardState.slice();
    const best = minimax(copy, botMark, humanMark, botMark);
    if (best && typeof best.index === 'number'){
      makeMove(best.index, botMark);
    } else {
      const free = boardState.map((v,i)=>v===null?i:null).filter(x=>x!==null);
      if (free.length) makeMove(free[0], botMark);
    }
  }

  // Cell interaction
  cells.forEach(c=>{
    c.addEventListener('click', ()=>{
      const idx = parseInt(c.dataset.index, 10);
      if (!gameActive) return;
      if (boardState[idx]) return;

      const mode = gameModeSelect.value;
      if (mode === 'pvp'){
        if (makeMove(idx, currentPlayer)){
          const result = checkWinner(boardState);
          if (!result) currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
          renderBoard();
        }
      } else {
        // vs AI
        const humanMark = player1MarkSelect.value;
        const botMark = humanMark === 'X' ? 'O' : 'X';
        // determine if it's human's turn
        const humanCount = boardState.filter(v=>v===humanMark).length;
        const botCount = boardState.filter(v=>v===botMark).length;
        const humanTurn = (humanCount === botCount);
        if (!humanTurn) return;
        if (makeMove(idx, humanMark)){
          renderBoard();
          // bot moves shortly after
          setTimeout(()=>{
            if (checkWinner(boardState)) return;
            botMove();
            renderBoard();
          }, 320);
        }
      }
    });

    c.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); }
    });
  });

  newGameBtn.addEventListener('click', ()=>{
    boardState = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    renderBoard();

    // If mode is AI and human selected O => bot should start
    if (gameModeSelect.value === 'ai' && player1MarkSelect.value === 'O'){
      setTimeout(()=>{ botMove(); renderBoard(); }, 300);
    }
  });

  gameModeSelect.addEventListener('change', ()=> newGameBtn.click());
  player1MarkSelect.addEventListener('change', ()=> newGameBtn.click());

  // Initialize game UI
  newGameBtn.click();
  renderBoard();

})();
