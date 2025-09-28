const tradingSundays = {
  2025: ['2025-01-26','2025-03-30','2025-06-29','2025-08-31','2025-12-14','2025-12-21','2025-12-28'],
  2026: ['2026-01-25','2026-03-29','2026-06-28','2026-08-30','2026-12-13','2026-12-20','2026-12-27'],
  2027: ['2027-01-31','2027-03-28','2027-06-27','2027-08-29','2027-12-12','2027-12-19'],
  2028: ['2028-01-30','2028-03-26','2028-06-25','2028-08-27','2028-12-10','2028-12-17','2028-12-24','2028-12-31'],
  2029: ['2029-01-28','2029-03-25','2029-06-24','2029-08-26','2029-12-16','2029-12-23','2029-12-30'],
  2030: ['2030-01-27','2030-03-31','2030-06-30','2030-08-25','2030-12-15','2030-12-22','2030-12-29']
};

function getNextSunday(date = new Date()) {
  const day = date.getDay();
  const diff = (7 - day) % 7;
  const nextSunday = new Date(date);
  nextSunday.setDate(date.getDate() + diff);
  return nextSunday;
}

function getNextTradingSunday(date = new Date()) {
  let current = new Date(date);
  while (true) {
    const nextSunday = getNextSunday(current);
    const formatted = nextSunday.toISOString().slice(0, 10);
    for (const year in tradingSundays) {
      if (tradingSundays[year].includes(formatted)) return nextSunday;
    }
    current = new Date(nextSunday);
    current.setDate(nextSunday.getDate() + 1);
  }
}

function updateCountdown(targetDate) {
  const now = new Date();
  const totalSeconds = Math.floor((targetDate - now) / 1000);

  if (totalSeconds <= 0) {
    document.querySelector("#countdown").innerHTML = "<div>To już dziś!</div>";
    return;
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.querySelector("#days").innerText = days;
  document.querySelector("#hours").innerText = hours;
  document.querySelector("#minutes").innerText = minutes;
  document.querySelector("#seconds").innerText = seconds;
}

function renderSundayList() {
  const listDiv = document.getElementById("sundayList");
  const ul = document.createElement("ul");

  for (const year in tradingSundays) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${year}:</strong> ${tradingSundays[year].join(", ")}`;
    ul.appendChild(li);
  }

  listDiv.appendChild(ul);
}

document.addEventListener("DOMContentLoaded", () => {
  const nextSunday = getNextSunday();
  const formatted = nextSunday.toISOString().slice(0, 10);

  let isTrading = false;
  for (const year in tradingSundays) {
    if (tradingSundays[year].includes(formatted)) isTrading = true;
  }

  document.getElementById("result").innerText = isTrading ? "HANDLOWA" : "NIEHANDLOWA";

  const nextTrading = getNextTradingSunday();
  updateCountdown(nextTrading);
  setInterval(() => updateCountdown(nextTrading), 1000);

  renderSundayList();
});
