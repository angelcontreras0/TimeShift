const { DateTime } = luxon;

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const detectedZone = document.getElementById('detectedZone');
const form = document.getElementById('converterForm');
const input = document.getElementById('timeInput');
const resultCard = document.getElementById('resultCard');
const errorBox = document.getElementById('errorBox');
const originTime = document.getElementById('originTime');
const originZone = document.getElementById('originZone');
const originDate = document.getElementById('originDate');
const localTime = document.getElementById('localTime');
const localZoneEl = document.getElementById('localZone');
const localDate = document.getElementById('localDate');
const worldGrid = document.getElementById('worldGrid');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');

const aliases = {
  ET: 'America/New_York', EST: 'America/New_York', EDT: 'America/New_York',
  PT: 'America/Los_Angeles', PST: 'America/Los_Angeles', PDT: 'America/Los_Angeles',
  CT: 'America/Chicago', CST: 'America/Chicago', CDT: 'America/Chicago',
  MT: 'America/Denver', MST: 'America/Denver', MDT: 'America/Denver',
  GMT: 'Etc/GMT', UTC: 'UTC',
  JST: 'Asia/Tokyo', KST: 'Asia/Seoul',
  CET: 'Europe/Paris', CEST: 'Europe/Paris'
};

const names = [
  ['new york', 'America/New_York', 'New York'],
  ['nueva york', 'America/New_York', 'Nueva York'],
  ['los angeles', 'America/Los_Angeles', 'Los Angeles'],
  ['california', 'America/Los_Angeles', 'California'],
  ['chicago', 'America/Chicago', 'Chicago'],
  ['denver', 'America/Denver', 'Denver'],
  ['london', 'Europe/London', 'London'],
  ['londres', 'Europe/London', 'Londres'],
  ['madrid', 'Europe/Madrid', 'Madrid'],
  ['españa', 'Europe/Madrid', 'España'],
  ['spain', 'Europe/Madrid', 'Spain'],
  ['tokyo', 'Asia/Tokyo', 'Tokyo'],
  ['tokio', 'Asia/Tokyo', 'Tokio'],
  ['japan', 'Asia/Tokyo', 'Japan'],
  ['japón', 'Asia/Tokyo', 'Japón'],
  ['seoul', 'Asia/Seoul', 'Seoul'],
  ['seúl', 'Asia/Seoul', 'Seúl'],
  ['mexico city', 'America/Mexico_City', 'Ciudad de México'],
  ['ciudad de méxico', 'America/Mexico_City', 'Ciudad de México'],
  ['hermosillo', 'America/Hermosillo', 'Hermosillo'],
  ['argentina', 'America/Argentina/Buenos_Aires', 'Argentina'],
  ['buenos aires', 'America/Argentina/Buenos_Aires', 'Buenos Aires'],
  ['são paulo', 'America/Sao_Paulo', 'São Paulo'],
  ['sao paulo', 'America/Sao_Paulo', 'São Paulo'],
  ['paris', 'Europe/Paris', 'Paris'],
  ['berlin', 'Europe/Berlin', 'Berlin'],
  ['dubai', 'Asia/Dubai', 'Dubai'],
  ['sydney', 'Australia/Sydney', 'Sydney']
];

const worldClocks = [
  ['Tu hora', localZone],
  ['New York', 'America/New_York'],
  ['Los Angeles', 'America/Los_Angeles'],
  ['Madrid', 'Europe/Madrid'],
  ['London', 'Europe/London'],
  ['Tokyo', 'Asia/Tokyo'],
  ['Seoul', 'Asia/Seoul'],
  ['Buenos Aires', 'America/Argentina/Buenos_Aires']
];

function zoneLabel(zone) {
  const pretty = zone.replaceAll('_', ' ').split('/').pop();
  return pretty || zone;
}

function parseInput(raw) {
  const text = raw.trim();
  if (!text) throw new Error('Escribe una hora, por ejemplo: 9:00 AM ET');

  let zone = null;
  let zoneName = null;
  let working = text;
  const lower = text.toLowerCase();

  const named = names.find(([needle]) => lower.includes(needle));
  if (named) {
    zone = named[1];
    zoneName = named[2];
    working = working.replace(new RegExp(named[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim();
  }

  if (!zone) {
    const tokens = working.toUpperCase().match(/\b[A-Z]{2,5}\b/g) || [];
    const token = tokens.reverse().find(t => aliases[t]);
    if (token) {
      zone = aliases[token];
      zoneName = token;
      working = working.replace(new RegExp(`\\b${token}\\b`, 'i'), '').trim();
    }
  }

  if (!zone) throw new Error('No reconocí la zona horaria. Prueba con ET, PT, JST, España, Tokyo, London, etc.');

  const nowInZone = DateTime.now().setZone(zone);
  const normalized = working
    .replace(/\s+/g, ' ')
    .replace(/\.(?=\s*(AM|PM))/ig, '')
    .trim();

  const formats = [
    'h:mm a', 'h a', 'hh:mm a', 'hh a',
    'H:mm', 'HH:mm',
    'M/d/yyyy h:mm a', 'M/d/yyyy H:mm',
    'd/M/yyyy h:mm a', 'd/M/yyyy H:mm',
    'yyyy-MM-dd h:mm a', 'yyyy-MM-dd H:mm'
  ];

  let parsed = null;
  for (const fmt of formats) {
    const dt = DateTime.fromFormat(normalized, fmt, { zone, locale: 'en-US' });
    if (dt.isValid) {
      parsed = dt;
      break;
    }
  }

  if (!parsed) {
    const loose = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (loose) {
      let hour = Number(loose[1]);
      const minute = Number(loose[2] || 0);
      const meridiem = loose[3]?.toLowerCase();
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
      parsed = nowInZone.set({ hour, minute, second: 0, millisecond: 0 });
    }
  }

  if (!parsed || !parsed.isValid) throw new Error('No pude entender la hora. Prueba algo como 9:00 AM ET o 18:30 España.');

  if (!/\d{4}/.test(normalized)) {
    parsed = parsed.set({ year: nowInZone.year, month: nowInZone.month, day: nowInZone.day });
  }

  return { parsed, zone, zoneName: zoneName || zoneLabel(zone), original: text };
}

function formatTime(dt) {
  return dt.toLocaleString({ hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dt) {
  return dt.setLocale('es').toLocaleString({ weekday: 'short', day: 'numeric', month: 'short' });
}

function convert(raw, save = true) {
  try {
    const { parsed, zone, zoneName, original } = parseInput(raw);
    const local = parsed.setZone(localZone);

    originTime.textContent = formatTime(parsed);
    originZone.textContent = `${zoneName} · ${parsed.offsetNameShort || zone}`;
    originDate.textContent = formatDate(parsed);

    localTime.textContent = formatTime(local);
    localZoneEl.textContent = `${zoneLabel(localZone)} · ${local.offsetNameShort || localZone}`;
    localDate.textContent = formatDate(local);

    errorBox.classList.add('hidden');
    resultCard.classList.remove('hidden');

    if (save) addHistory({ query: original, result: formatTime(local), source: zoneName, local: zoneLabel(localZone) });
  } catch (err) {
    resultCard.classList.add('hidden');
    errorBox.textContent = err.message || 'No pude convertir esa hora.';
    errorBox.classList.remove('hidden');
  }
}

function updateWorldClocks() {
  const now = DateTime.now();
  worldGrid.innerHTML = worldClocks.map(([city, zone]) => {
    const dt = now.setZone(zone);
    return `
      <article class="world-card">
        <div class="world-city">${city}</div>
        <div class="world-zone">${zone}</div>
        <div class="world-time">${formatTime(dt)}</div>
        <div class="world-date">${formatDate(dt)}</div>
      </article>`;
  }).join('');
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('timeshift-history') || '[]'); }
  catch { return []; }
}

function addHistory(item) {
  const history = getHistory().filter(x => x.query !== item.query);
  history.unshift(item);
  localStorage.setItem('timeshift-history', JSON.stringify(history.slice(0, 6)));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    historySection.classList.add('hidden');
    return;
  }
  historySection.classList.remove('hidden');
  historyList.innerHTML = history.map(item => `
    <button class="history-item" type="button" data-query="${item.query.replaceAll('"', '&quot;')}">
      <div>
        <div class="history-query">${item.query}</div>
        <div class="history-meta">${item.source} → ${item.local}</div>
      </div>
      <div class="history-result">${item.result}</div>
    </button>`).join('');

  historyList.querySelectorAll('[data-query]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.query;
      convert(btn.dataset.query, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  convert(input.value);
});

document.querySelectorAll('[data-example]').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.example;
    convert(btn.dataset.example);
  });
});

clearHistory.addEventListener('click', () => {
  localStorage.removeItem('timeshift-history');
  renderHistory();
});

detectedZone.textContent = `${zoneLabel(localZone)} · ${localZone}`;
updateWorldClocks();
setInterval(updateWorldClocks, 30_000);
renderHistory();

const params = new URLSearchParams(location.search);
const q = params.get('q');
if (q) {
  input.value = q;
  convert(q, false);
}
