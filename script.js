// Lista niedziel handlowych na dany rok (format RRRR-MM-DD)
const TRADING_SUNDAYS = [
  '2025-01-26',
  '2025-03-30',
  '2025-06-29',
  '2025-08-31',
  '2025-12-14',
  '2025-12-21',
  '2025-12-28',
];

// Funkcja pomocnicza: Znajduje datę najbliższej niedzieli (wliczając dzisiejszą, jeśli jest niedziela)
function getNextSundayDate(date = new Date()) {
  const day = date.getDay(); // 0 = niedziela
  const diff = (7 - day) % 7;
  const nextSunday = new Date(date);
  nextSunday.setDate(date.getDate() + diff);
  
  // Jeśli jest to już niedziela, zwróć ją. W przeciwnym razie, znajdź następną.
  if (day === 0 && diff === 0) {
    return nextSunday; // Zwraca dzisiejszą datę
  }
  
  return nextSunday;
}

// Funkcja pomocnicza: Sprawdza, czy dana data jest niedzielą handlową
function isTradingSunday(date) {
  const formatted = date.toISOString().slice(0, 10);
  return TRADING_SUNDAYS.includes(formatted);
}

// Funkcja: Znajduje najbliższą niedzielę handlową
function getNextTradingSunday(date = new Date()) {
  let current = new Date(date);
  
  // Zaczynamy od jutra, aby nie zaliczyć dzisiejszej, jeśli minęła.
  // Lepszym podejściem jest zacząć od najbliższej niedzieli.
  let nextSun = getNextSundayDate(current);

  while (true) {
    if (isTradingSunday(nextSun)) {
      return nextSun;
    }
    // Przechodzimy do następnej niedzieli po bieżąco sprawdzonej
    nextSun.setDate(nextSun.getDate() + 7);
    
    // Zabezpieczenie na wypadek braku dat w tablicy (teoretyczne)
    if (nextSun.getFullYear() > current.getFullYear() + 1) {
        return null; // Brak handlowej w najbliższym czasie
    }
  }
}

// Funkcja: Formatuje datę na ładny polski ciąg
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('pl-PL', options).format(date);
}

// Funkcja: Aktualizuje status najbliższej niedzieli
function updateSundayStatus() {
  const now = new Date();
  const nextSunday = getNextSundayDate(now);
  const isTrading = isTradingSunday(nextSunday);
  
  document.getElementById('next-sunday-date').innerText = formatDate(nextSunday);
  document.getElementById('result').innerText = isTrading ? 'HANDLOWA' : 'NIEHANDLOWA';
  
  // Dodanie klasy do animacji/stylu
  const resultDiv = document.getElementById('result');
  resultDiv.classList.toggle('trading', isTrading);
}

// Funkcja: Aktualizuje licznik do najbliższej handlowej
let nextTradingDate = null;
function updateCountdown() {
  if (!nextTradingDate) return;
  
  const now = new Date().getTime();
  const targetTime = nextTradingDate.getTime();
  const diff = targetTime - now;

  const countdownElement = document.getElementById('countdown');

  if (diff <= 0) {
    countdownElement.innerHTML = "To **już dziś**! Udanych zakupów!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownElement.innerHTML = 
    `Zostało: <strong>${days}d</strong> ${hours}h ${minutes}m ${seconds}s`;
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
      setInterval(updateCountdown, 1000);
  } else {
      document.getElementById('trading-sunday-date').innerText = "Brak dat w kalendarzu.";
      document.getElementById('countdown').innerHTML = "Kalendarz niedziel handlowych do aktualizacji.";
  }
});
