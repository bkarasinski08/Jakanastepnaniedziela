/* script.js - obsługa przycisku Godzina */
function zpad(n, len = 2) { return String(n).padStart(len, '0'); }
document.getElementById('year').textContent = new Date().getFullYear();
const btnGodzina = document.getElementById('tab-godzina');
btnGodzina.addEventListener('click', () => { btnGodzina.classList.add('opening'); setTimeout(() => btnGodzina.classList.remove('opening'), 700); openClockWindow(); });
function openClockWindow() {
  const popup = window.open('', 'godzinaWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=920,height=720');
  if (!popup) { alert('Zezwól na popupy!'); return; }
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Godziny — Najdziwniejsza strona</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#071018; --panel:#0f1620; --muted:#9fb0bf; --accent:#7fb8ff; --glass:rgba(255,255,255,0.03); --radius:12px; }
    *{box-sizing:border-box}html,body{height:100%;margin:0;font-family:'Poppins';background:linear-gradient(180deg,#03060a 0%,#071018 100%);color:#ecf6ff}
    header{text-align:center;padding:20px}header h1{margin:0;font-size:22px;font-weight:800;color:#fff;-webkit-text-stroke:1.5px #000}
    .search{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:var(--panel);color:inherit;min-width:260px;outline:none}
    .frame{margin:12px auto;padding:14px;border-radius:14px;background:rgba(255,255,255,0.02);width:92%;max-width:880px;box-shadow:0 18px 50px rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.03)}
    .tz-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;max-height:58vh;overflow:auto;padding:6px}
    .tz-item{padding:10px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03)}
    .tz-name{font-weight:600;font-size:13px;color:#eaf6ff;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .tz-time{font-weight:800;font-size:18px;color:#fff}.tz-sub{font-size:12px;color:var(--muted)}
  </style></head><body>
  <header><h1>Godziny świata</h1><input id="tzSearch" class="search" placeholder="Szukaj strefy..."/></header>
  <div class="frame"><div id="list" class="tz-list"></div></div>
  <script>
    const tzContainer=document.getElementById('list');const search=document.getElementById('tzSearch');
    function getTimeZones(){if(typeof Intl.supportedValuesOf==='function'){return Intl.supportedValuesOf('timeZone');}return ['UTC','Europe/Warsaw','America/New_York','Asia/Tokyo','Australia/Sydney'];}
    const tzs=getTimeZones();const entries=tzs.map(tz=>{const e=document.createElement('div');e.className='tz-item';e.dataset.tz=tz;e.innerHTML=\`<div class="tz-name">\${tz}</div><div class="tz-time">--:--:--</div><div class="tz-sub"></div>\`;return e;});
    function renderAll(f=''){tzContainer.innerHTML='';const q=f.toLowerCase();entries.filter(e=>!q||e.dataset.tz.toLowerCase().includes(q)).forEach(e=>tzContainer.appendChild(e));}
    renderAll();function update(){const n=new Date();entries.forEach(el=>{const tz=el.dataset.tz;try{const fmt=new Intl.DateTimeFormat([], {timeZone:tz,hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});el.querySelector('.tz-time').textContent=fmt.format(n);}catch{el.querySelector('.tz-time').textContent='—';}});}update();setInterval(update,1000);
    search.addEventListener('input',e=>renderAll(e.target.value));
  <\/script></body></html>`;
  popup.document.write(html); popup.document.close();
}
