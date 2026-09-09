// Philly Weather — a sign that puts the answer to "does weather/AQI vary
// across Philly neighborhoods?" on the wall: live temperature per
// neighborhood (which genuinely does vary block to block) next to a single
// citywide AQI reading (which, at the resolution free data offers, does not).
//
// Weather: Open-Meteo forecast API, no key required.
// Air quality: Open-Meteo Air Quality API, no key required — note its model
// grid is roughly 11km, coarser than the distance between these
// neighborhoods, which is exactly why AQI is shown once for the whole city
// rather than once per pin (see README for detail).

// Colors are original accents inspired by the color-coded feel of a
// neighborhood boundary map a user shared — one distinct hue per
// neighborhood — not a copy of that map's actual (light, pastel) palette.
// Each was checked to clear WCAG AA against the sign's black background.
const LANDMARKS = [
  { key: 'fairmount', name: 'Fairmount', lat: 39.9656, lon: -75.1810, x: 24, y: 6, color: '#c48ee0' },
  { key: 'fishtown', name: 'Fishtown', lat: 39.9700, lon: -75.1290, x: 86, y: 6, edgeRight: true, color: '#8f9ff0' },
  { key: 'logansquare', name: 'Logan Square', lat: 39.9581, lon: -75.1723, x: 28, y: 24, color: '#5ed9c0' },
  { key: 'northernliberties', name: 'Northern Liberties', lat: 39.9720, lon: -75.1340, x: 90, y: 24, edgeRight: true, color: '#b8e05a' },
  { key: 'univcity', name: 'University City', lat: 39.9550, lon: -75.1930, x: 6, y: 42, color: '#6fb8e8' },
  { key: 'oldcity', name: 'Old City', lat: 39.9525, lon: -75.1450, x: 92, y: 42, edgeRight: true, color: '#f0a851' },
  { key: 'rittenhouse', name: 'Rittenhouse Square', lat: 39.9490, lon: -75.1719, x: 30, y: 60, color: '#f2df6a' },
  { key: 'societyhill', name: 'Society Hill', lat: 39.9445, lon: -75.1410, x: 90, y: 60, edgeRight: true, color: '#f0806a' },
  { key: 'gayborhood', name: 'Gayborhood', lat: 39.9450, lon: -75.1620, x: 50, y: 78, color: '#ef5da5' },
  { key: 'pointbreeze', name: 'Point Breeze', lat: 39.9180, lon: -75.1850, x: 24, y: 94, edgeBottom: true, color: '#e88fc0' },
];

const AQI_POINT = { lat: 39.9526, lon: -75.1652 }; // central Philly, used as the one citywide reading

const REFRESH_MS = 5 * 60 * 1000; // conditions don't change fast enough to warrant more often

const WEATHER_LABELS = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog',
  51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Rain', 63: 'Rain', 65: 'Rain',
  66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Snow', 73: 'Snow', 75: 'Snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Rain showers',
  85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

// Original line-art icons (not a copied icon set) — single-stroke SVGs that
// inherit currentColor, so each renders in that neighborhood's own accent
// color. Mapped from WMO weather codes to one of seven icon keys.
const WEATHER_ICON_KEY = {
  0: 'sun', 1: 'sun', 2: 'partlyCloudy', 3: 'cloud',
  45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'snow', 86: 'snow',
  95: 'thunder', 96: 'thunder', 99: 'thunder',
};

const WEATHER_ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.6" fill="currentColor" stroke="none"/><path d="M12 2.2v2.6M12 19.2v2.6M2.2 12h2.6M19.2 12h2.6M5.3 5.3l1.8 1.8M17 17l1.8 1.8M5.3 18.7l1.8-1.8M17 7l1.8-1.8"/></svg>',
  partlyCloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.3" cy="7.6" r="3.3" fill="currentColor" stroke="none"/><path d="M8.3 2.4v1.3M3.1 7.6h1.3M4.4 4.1l.95.95M12.2 4.1l-.95.95" stroke-width="1.3"/><path d="M9 19.5h8a3.6 3.6 0 0 0 .4-7.17A5 5 0 0 0 8.3 10.8 3.6 3.6 0 0 0 9 19.5Z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.1 9.5 4 4 0 0 0 7 18Z"/></svg>',
  fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M2.5 12h19M4 16h12M6 20h9"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10a4 4 0 0 0 .4-7.97A5.5 5.5 0 0 0 6.6 6.4 4 4 0 0 0 7 15Z"/><path d="M8 18.5l-1.2 2.5M12.3 18.5l-1.2 2.5M16.6 18.5l-1.2 2.5"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10a4 4 0 0 0 .4-7.97A5.5 5.5 0 0 0 6.6 6.4 4 4 0 0 0 7 15Z"/><path d="M8 18v4M6.3 19l3.4 2M9.7 19l-3.4 2M16 18v4M14.3 19l3.4 2M17.7 19l-3.4 2"/></svg>',
  thunder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14h10a4 4 0 0 0 .4-7.97A5.5 5.5 0 0 0 6.6 5.4 4 4 0 0 0 7 14Z"/><path d="M13 14.5l-3.2 5.2h2.6l-1.8 4"/></svg>',
};

function cToF(c) {
  return Math.round((c * 9) / 5 + 32);
}

function weatherUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code`;
}

function aqiUrl(lat, lon) {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
}

// Official EPA AQI scale — ranges and definitions verbatim from
// airnow.gov, used here as the reference for both the current-condition
// blurb and the always-visible six-tier legend.
const AQI_SCALE = [
  { cls: 'good', range: '0–50', label: 'Good',
    def: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
  { cls: 'moderate', range: '51–100', label: 'Moderate',
    def: 'Acceptable air quality. However, there may be a risk for some people, particularly those unusually sensitive to air pollution.' },
  { cls: 'sensitive', range: '101–150', label: 'Unhealthy for Sensitive Groups',
    def: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' },
  { cls: 'unhealthy', range: '151–200', label: 'Unhealthy',
    def: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects.' },
  { cls: 'very-unhealthy', range: '201–300', label: 'Very Unhealthy',
    def: 'Health alert: the risk of health effects is increased for everyone.' },
  { cls: 'hazardous', range: '301+', label: 'Hazardous',
    def: 'Health warning of emergency conditions: everyone is more likely to be affected.' },
];

function aqiCategory(aqi) {
  if (aqi <= 50) return AQI_SCALE[0];
  if (aqi <= 100) return AQI_SCALE[1];
  if (aqi <= 150) return AQI_SCALE[2];
  if (aqi <= 200) return AQI_SCALE[3];
  if (aqi <= 300) return AQI_SCALE[4];
  return AQI_SCALE[5];
}

function renderAqiScale(activeCls) {
  const el = document.getElementById('aqiScale');
  el.innerHTML = AQI_SCALE.map((e) => `
    <div class="aqi-scale-item ${e.cls}${e.cls === activeCls ? ' active' : ''}">
      <span class="aqi-scale-dot"></span>
      <span class="aqi-scale-range">${e.range}</span>
      <span class="aqi-scale-label">${e.label}</span>
    </div>
  `).join('');
}

// ---------- pins ----------

function buildPins() {
  const container = document.getElementById('pins');
  container.innerHTML = '';
  LANDMARKS.forEach((spot) => {
    const pin = document.createElement('div');
    pin.className = 'pin' + (spot.edgeRight ? ' edge-right' : '') + (spot.edgeBottom ? ' edge-bottom' : '');
    pin.style.left = spot.x + '%';
    pin.style.top = spot.y + '%';
    pin.style.setProperty('--pin-color', spot.color);
    pin.innerHTML = `
      <div class="pin-dot"></div>
      <div class="pin-card">
        <div class="pin-name">${spot.name}</div>
        <div class="pin-main">
          <div class="pin-temp" id="temp-${spot.key}">&mdash;<span class="unit">&deg;F</span></div>
          <div class="pin-icon" id="icon-${spot.key}"></div>
        </div>
        <div class="pin-feels" id="feels-${spot.key}">&mdash;</div>
      </div>
    `;
    container.appendChild(pin);
  });
}

async function loadWeatherFor(spot) {
  try {
    const res = await fetch(weatherUrl(spot.lat, spot.lon));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const cur = data.current;
    const temp = cToF(cur.temperature_2m);
    const feels = cToF(cur.apparent_temperature);
    const label = WEATHER_LABELS[cur.weather_code] || '';
    const iconKey = WEATHER_ICON_KEY[cur.weather_code];
    document.getElementById(`temp-${spot.key}`).innerHTML = `${temp}<span class="unit">&deg;F</span>`;
    document.getElementById(`feels-${spot.key}`).textContent = `Feels ${feels}° · ${label}`;
    document.getElementById(`icon-${spot.key}`).innerHTML = WEATHER_ICONS[iconKey] || '';
  } catch (err) {
    console.error(`Weather fetch failed for ${spot.name}:`, err);
    document.getElementById(`temp-${spot.key}`).textContent = '—';
    document.getElementById(`feels-${spot.key}`).textContent = 'Unavailable';
  }
}

async function loadAllWeather() {
  await Promise.all(LANDMARKS.map(loadWeatherFor));
  document.getElementById('stage').classList.add('loaded');
}

async function loadAQI() {
  const banner = document.getElementById('aqiBanner');
  try {
    const res = await fetch(aqiUrl(AQI_POINT.lat, AQI_POINT.lon));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const aqi = Math.round(data.current.us_aqi);
    const cat = aqiCategory(aqi);
    banner.className = 'aqi-banner ' + cat.cls;
    document.getElementById('aqiValue').textContent = aqi;
    document.getElementById('aqiCat').textContent = cat.label;
    document.getElementById('aqiDef').textContent = cat.def;
    renderAqiScale(cat.cls);
  } catch (err) {
    console.error('AQI fetch failed:', err);
    document.getElementById('aqiValue').textContent = '—';
    document.getElementById('aqiCat').textContent = 'Unavailable';
  }
}

function stampUpdated() {
  const now = new Date();
  document.getElementById('updatedAt').textContent =
    'Updated ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

async function refreshAll() {
  await Promise.all([loadAllWeather(), loadAQI()]);
  stampUpdated();
}

// ---------- clock ----------

function tickClock() {
  const now = new Date();
  document.getElementById('clockTime').textContent =
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  document.getElementById('clockDate').textContent =
    now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  updateDayNight();
}

// ---------- day / night theme ----------
//
// Direct sunlight turns a black screen into a mirror, so the sign switches
// to a bright, high-contrast light theme during the day and back to the
// dark theme (better for low light) at night — timed to Philadelphia's
// actual sunrise/sunset via the same Open-Meteo API that powers the
// weather, not a fixed hour range.

let sunrise = null;
let sunset = null;

function sunTimesUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=America%2FNew_York`;
}

async function loadSunTimes() {
  try {
    const res = await fetch(sunTimesUrl(AQI_POINT.lat, AQI_POINT.lon));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    sunrise = new Date(data.daily.sunrise[0]);
    sunset = new Date(data.daily.sunset[0]);
  } catch (err) {
    console.error('Sunrise/sunset fetch failed:', err);
  }
  updateDayNight();
}

function updateDayNight() {
  const now = new Date();
  // Before real sunrise/sunset data loads, guess from the clock so the
  // first paint isn't stuck in the wrong theme; once loaded, the real
  // times take over and this guess is never consulted again.
  const isDay = sunrise && sunset
    ? now >= sunrise && now < sunset
    : now.getHours() >= 7 && now.getHours() < 19;
  document.body.classList.toggle('is-day', isDay);
}

// ---------- idle / wake cycle ----------
//
// Simulates a motion sensor with mouse/touch/keyboard activity — same
// conceit as the "Look Up" sign's idle/wake cycle. Swap the listeners
// below for a real PIR/ultrasonic sensor signal on a physical install.

const IDLE_TIMEOUT_MS = 15000; // linger long enough to read a few neighborhoods
const AWAKE_FOOTNOTE = '';
const IDLE_FOOTNOTE = '· movement wakes this sign ·';

let idleTimer = null;

function wake() {
  document.body.classList.remove('is-idle');
  document.getElementById('footnote').textContent = AWAKE_FOOTNOTE;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(goIdle, IDLE_TIMEOUT_MS);
}

function goIdle() {
  document.body.classList.add('is-idle');
  document.getElementById('footnote').textContent = IDLE_FOOTNOTE;
}

function startIdleCycle() {
  ['mousemove', 'touchstart', 'touchmove', 'keydown', 'click', 'scroll'].forEach((evt) => {
    window.addEventListener(evt, wake, { passive: true });
  });
  wake();
}

// ---------- boot ----------

tickClock();
setInterval(tickClock, 30000);

loadSunTimes();
setInterval(loadSunTimes, 6 * 60 * 60 * 1000); // sunrise/sunset shift daily, recheck a few times a day

buildPins();
refreshAll();
setInterval(refreshAll, REFRESH_MS);
startIdleCycle();
