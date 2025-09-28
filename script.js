// Rozbudowany kalendarz niedziel handlowych na lata 2025 - 2030 (RRRR-MM-DD)
// Daty przewidziane są na podstawie obecnego prawa.
const TRADING_SUNDAYS = [
  // --- 2025 --- (Aktualne daty na rok bieżący)
  '2025-01-26', 
  '2025-04-13', // Niedziela Palmowa
  '2025-04-27',
  '2025-06-29',
  '2025-08-31',
  '2025-12-14', 
  '2025-12-21', 
  
  // --- 2026 ---
  '2026-01-25', 
  '2026-03-29', 
  '2026-04-26',
  '2026-06-28',
  '2026-08-30',
  '2026-12-13', 
  '2026-12-20', 

  // --- 2027 ---
  '2027-01-31', 
  '2027-03-21', 
  '2027-04-25',
  '2027-06-27',
  '2027-08-29',
  '2027-12-12', 
  '2027-12-19',

  // --- 2028 ---
  '2028-01-30', 
  '2028-04-09', 
  '2028-04-30',
  '2028-06-25',
  '2028-08-27',
  '2028-12-10', 
  '2028-12-17',

  // --- 2029 ---
  '2029-01-28', 
  '2029-03-25', 
  '2029-04-29',
  '2029-06-24',
  '2029-08-26',
  '2029-12-09', 
  '2029-12-16',

  // --- 2030 ---
  '2030-01-27', 
  '2030-04-14', 
  '2030-04-28',
  '2030-06-30',
  '2030-08-25',
  '2030-12-15', 
  '2030-12-22',
];


// --- FUNKCJE POMOCNICZE ---

// Używamy Date do pracy z datami w JS.
function getNextSundayDate(date = new Date()) {
  const day = date.getDay(); 
  const diff = (7 - day) % 7;
  const nextSunday = new Date(date);
  nextSunday.setDate(date.getDate() + diff);
  nextSunday.setHours(0, 0, 0, 0); 
  return nextSunday;
}

function isTradingSunday(date) {
  const formatted = date.toISOString().slice(0, 10);
  return TRADING_SUNDAYS.includes(formatted);
}

function getNextTradingSunday() {
  const now = new Date();
  const nowFormatted = now.toISOString().slice(0, 10);

  // Filtrujemy tylko daty w przyszłości (lub dzisiejszą)
  const futureSundays = TRADING_SUNDAYS.filter(dateStr => dateStr >= nowFormatted);
  
  if (futureSundays.length > 0) {
    const nextDate = new Date(futureSundays[0]);
    nextDate.setHours(0, 0, 0, 0); 
    return nextDate;
  }
  return null;
}

// Funkcja formatująca datę
function formatDate(date, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat('pl-PL', options).format(date);
}

// --- LOGIKA WIDOKU I AKTUALIZACJI ---

function updateSundayStatus() {
  const now = new Date();
  const nextSunday = getNextSundayDate(now);
  const isTrading = isTradingSunday(nextSunday);
  const resultDiv = document.getElementById('result');
  const todayMessage = document.getElementById('today-info');
  
  document.getElementById('next-sunday-date').innerText = formatDate(nextSunday);
  resultDiv.innerText = isTrading ? 'HANDLOWA' : 'NIEHANDLOWA';
  
  // Dynamiczne klasy dla stylizacji CSS
  resultDiv.classList.toggle('handlowa', isTrading);
  resultDiv.classList.toggle('niehandlowa', !isTrading);

  // Dodatkowa informacja, jeśli dziś jest niedziela handlowa
  if (nextSunday.toDateString() === now.toDateString() && isTrading) {
      todayMessage.innerText = 'UWAGA: Dziś jest niedziela handlowa!';
  } else {
      todayMessage.innerText = '';
  }
}

let nextTradingDate = null;
function updateCountdown() {
  if (!nextTradingDate) return;
  
  const now = new Date().getTime();
  const targetTime = nextTradingDate.getTime();
  let diff = targetTime - now;

  // Wstrzymanie licznika, jeśli minął czas
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = `<span class="value" style="font-size: 1.5rem;">ZAKUPY TERAZ!</span>`;
    clearInterval(window.countdownInterval); 
    return;
  }
  
  // Zaawansowane obliczenia czasu
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);

  // Dynamiczne aktualizowanie poszczególnych spanów
  document.getElementById('days-val').innerText = days;
  document.getElementById('hours-val').innerText = hours;
  document.getElementById('minutes-val').innerText = minutes;
  document.getElementById('seconds-val').innerText = seconds;
}


function generateTradingList() {
    const listElement = document.getElementById('trading-list');
    listElement.innerHTML = '';
    
    const now = new Date();
    const nowFormatted = now.toISOString().slice(0, 10);
    let count = 0;
    
    // Pokażemy maksymalnie 15 najbliższych dat
    TRADING_SUNDAYS.forEach(dateStr => {
        if (dateStr >= nowFormatted && count < 15) {
            const date = new Date(dateStr);
            const formattedDate = formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
            
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${formattedDate}</span> <strong>${date.getFullYear()}</strong>`;
            listElement.appendChild(listItem);
            count++;
        }
    });

    if (count === 0) {
         listElement.innerHTML = `<li>Brak nadchodzących niedziel handlowych w kalendarzu.</li>`;
    }
}


// --- INICJALIZACJA ---

document.addEventListener('DOMContentLoaded', () => {
  
  updateSundayStatus();
  
  nextTradingDate = getNextTradingSunday();
  
  if (nextTradingDate) {
      document.getElementById('trading-sunday-date').innerText = formatDate(nextTradingDate);
      
      updateCountdown();
      window.countdownInterval = setInterval(updateCountdown, 1000);
  } else {
      document.getElementById('trading-sunday-date').innerText = "Brak nadchodzącej niedzieli handlowej w kalendarzu.";
  }
  
  generateTradingList();
});
