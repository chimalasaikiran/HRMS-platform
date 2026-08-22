function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function todayISO(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatHHMM(date = new Date()) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function parseHHMM(str) {
  const [h, m] = String(str).split(':').map(Number);
  return h * 60 + m;
}

function minutesToHHMM(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function eachDateInclusive(startDate, endDate) {
  const out = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur <= end) {
    out.push(todayISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function monthRange(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end, year: y, month: m, daysInMonth: lastDay };
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = {
  round2,
  todayISO,
  formatHHMM,
  parseHHMM,
  minutesToHHMM,
  eachDateInclusive,
  monthRange,
  currentMonth,
};
