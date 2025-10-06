document.getElementById('year').textContent = new Date().getFullYear();
const btn = document.getElementById('tab-godzina');
btn.addEventListener('click', () => {
  btn.classList.add('active');
  openClockWindow();
  setTimeout(() => btn.classList.remove('active'), 800);
});

function openClockWindow() {
  const w = window.open('', 'godzinaWindow', 'width=900,height=700');
  if (!w) {
    alert('Zezwól na wyskakujące okna!');
    return;
  }
  const html = `<!doctype html><html lang='pl'><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/>
  <title>Godziny świata</title>
  <link href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap' rel='stylesheet'>
  <style>
  body {
    background: radial-gradient(circle at 20% 20%, #0e0e14 0%, #040406 100%);
    color: #f5f7fa;
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    padding: 20px;
  }
  h1 {
    text-align: center;
    color: #00b3ff;
    text-shadow: 0 0 20px rgba(0,179,255,0.6);
    font-size: clamp(26px, 4vw, 42px);
  }
  .frame {
    margin: 30px auto;
    max-width: 860px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 0 30px rgba(0,179,255,0.2);
  }
  .search {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #f5f7fa;
    outline: none;
    margin-bottom: 20px;
    font-size: 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
    max-height: 60vh;
    overflow: auto;
  }
  .item {
    background: rgba(0,179,255,0.08);
    border-radius: 12px;
    padding: 10px 14px;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,179,255,0.15);
  }
  .name {
    font-weight: 600;
    color: #00b3ff;
    font-size: 14px;
  }
  .time {
    font-weight: 800;
    font-size: 20px;
    color: white;
    margin-top: 6px;
  }
  </style></head><body>
  <h1>Godziny świata</h1>
  <div class='frame'>
    <input id='search' class='search' placeholder='Szukaj strefy czasowej...'/>
    <div id='list' class='grid'></div>
  </div>
  <script>
    const list = document.getElementById('list');
    const search = document.getElementById('search');

    function getTimeZones() {
      if (typeof Intl.supportedValuesOf === 'function') {
        return Intl.supportedValuesOf('timeZone');
      }
      return ['UTC','Europe/Warsaw','America/New_York','Asia/Tokyo','Australia/Sydney'];
    }

    const tzs = getTimeZones();
    const els = tzs.map(tz => {
      const displayName = tz.replaceAll('/', ' / ').replaceAll('_', ' ');
      const e = document.createElement('div');
      e.className = 'item';
      e.dataset.tz = tz;
      e.innerHTML = \`<div class='name'>\${displayName}</div><div class='time'>--:--:--</div>\`;
      return e;
    });

    function render(filter = '') {
      list.innerHTML = '';
      const f = filter.toLowerCase();
      els.filter(e => !f || e.dataset.tz.toLowerCase().includes(f)).forEach(e => list.appendChild(e));
    }

    render();

    function update() {
      const now = new Date();
      els.forEach(e => {
        try {
          const fmt = new Intl.DateTimeFormat([], {
            timeZone: e.dataset.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          e.querySelector('.time').textContent = fmt.format(now);
        } catch {}
      });
    }

    setInterval(update, 1000);
    update();

    search.addEventListener('input', e => render(e.target.value));
  <\/script></body></html>`;
  w.document.write(html);
  w.document.close();
}
