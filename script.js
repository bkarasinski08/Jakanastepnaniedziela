// Lista niedziel handlowych na lata 2025 - 2030 (format RRRR-MM-DD)
// Daty 2026-2030 są PRZEWIDYWANE na podstawie obowiązującego prawa.
const TRADING_SUNDAYS = [
  // --- 2025 ---
  '2025-01-26', // Ostatnia w styczniu
  '2025-04-13', // Niedziela Palmowa
  '2025-04-27', // Ostatnia w kwietniu
  '2025-06-29', // Ostatnia w czerwcu
  '2025-08-31', // Ostatnia w sierpniu
  '2025-12-14', // 2. niedziela przed BN
  '2025-12-21', // 1. niedziela przed BN
  
  // --- 2026 ---
  '2026-01-25', 
  '2026-03-29', // Niedziela Palmowa
  '2026-04-26',
  '2026-06-28',
  '2026-08-30',
  '2026-12-13', 
  '2026-12-20', 

  // --- 2027 ---
  '2027-01-31', 
  '2027-03-21', // Niedziela Palmowa
  '2027-04-25',
  '2027-06-27',
  '2027-08-29',
  '2027-12-12', 
  '2027-12-19',

  // --- 2028 ---
  '2028-01-30', 
  '2028-04-09', // Niedziela Palmowa
  '2028-04-30',
  '2028-06-25',
  '2028-08-27',
  '2028-12-10', 
  '2028-12-17',

  // --- 2029 ---
  '2029-01-28', 
  '2029-03-25', // Niedziela Palmowa
  '2029-04-29',
  '2029-06-24',
  '2029-08-26',
  '2029-12-09', 
  '2029-12-16',

  // --- 2030 ---
  '2030-01-27', 
  '2030-04-14', // Niedziela Palmowa
  '2030-04-28',
  '2030-06-30',
  '2030-08-25',
  '2030-12-15', 
  '2030-12-22',
];

// --- FUNKCJE OBSŁUGI DAT (BEZ ZMIAN W LOGICE, TYLKO KOSMETYKA) ---

function getNextSundayDate(date = new Date()) {
  const day = date.getDay(); // 0 = niedziela
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

function getNextTradingSunday(date = new Date()) {
  let nextSun = getNextSundayDate(date);
  nextSun.setHours(0, 0, 0, 0);

  // Ustawienie max limitu szukania na 6 lat (do 2031) dla bezpieczeństwa
  const maxYear = new Date().getFullYear() + 6; 

  while (nextSun.getFullYear() <= maxYear) {
    if (isTradingSunday(nextSun)) {
      // Sprawdzenie, czy ta handlowa nie jest dzisiaj, ale godzina już minęła
      const isToday = nextSun.toDateString() === new Date().toDateString();
      if (!isToday || (isToday && new Date().getHours() < 23)) {
          return nextSun;
      }
    }
    
    // Przechodzimy do następnej niedzieli
    nextSun.setDate(nextSun.getDate() + 7);
  }
  return null;
}

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('pl-PL', options).format(date);
}

// --- FUNKCJE AKTUALIZACJI DOM ---

function updateSundayStatus() {
  const nextSunday = getNextSundayDate();
  const isTrading = isTradingSunday(nextSunday);
  const resultDiv = document.getElementById('result');
  
  document.getElementById('next-sunday-date').innerText = formatDate(nextSunday);
  resultDiv.innerText = isTrading ? 'HANDLOWA' : 'NIEHANDLOWA';
  
  // Dynamiczne klasy dla stylizacji
  resultDiv.classList.toggle('trading', isTrading);
  resultDiv.classList.toggle('non-trading', !isTrading);
}

let nextTradingDate = null;
function updateCountdown() {
  if (!nextTradingDate) return;
  
  const now = new Date().getTime();
  const targetTime = nextTradingDate.getTime();
  const diff = targetTime - now;

  const countdownElement = document.getElementById('countdown');

  if (diff <= 0) {
    countdownElement.innerHTML = "To **już dziś**! Czas na zakupy.";
    // Koniec odliczania, zatrzymaj interwał
    clearInterval(window.countdownInterval); 
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownElement.innerHTML = 
    `Zostało: <strong>${days}</strong> dni ${hours}h ${minutes}m ${seconds}s`;
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Ustawienie statusu najbliższej niedzieli
  updateSundayStatus();
  
  // 2. Ustalenie daty najbliższej handlowej i jej wyświetlenie
  nextTradingDate = getNextTradingSunday();
  
  if (nextTradingDate) {
      document.getElementById('trading-sunday-date').innerText = formatDate(nextTradingDate);
      
      // 3. Uruchomienie licznika
      updateCountdown();
      window.countdownInterval = setInterval(updateCountdown, 1000); // Zapisujemy interwał
  } else {
      document.getElementById('trading-sunday-date').innerText = "Brak dat w kalendarzu na najbliższe lata.";
      document.getElementById('countdown').innerHTML = "Kalendarz niedziel handlowych wymaga aktualizacji.";
  }
});
