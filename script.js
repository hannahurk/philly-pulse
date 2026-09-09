// Philly Pulse — a sign that puts the answer to "does weather/AQI vary
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

function cToF(c) {
  return Math.round((c * 9) / 5 + 32);
}

function weatherUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code`;
}

function aqiUrl(lat, lon) {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
}

function aqiCategory(aqi) {
  if (aqi <= 50) return { label: 'Good', cls: 'good' };
  if (aqi <= 100) return { label: 'Moderate', cls: 'moderate' };
  if (aqi <= 150) return { label: 'Unhealthy (sensitive groups)', cls: 'sensitive' };
  if (aqi <= 200) return { label: 'Unhealthy', cls: 'unhealthy' };
  if (aqi <= 300) return { label: 'Very unhealthy', cls: 'very-unhealthy' };
  return { label: 'Hazardous', cls: 'hazardous' };
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
        <div class="pin-temp" id="temp-${spot.key}">&mdash;<span class="unit">&deg;F</span></div>
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
    document.getElementById(`temp-${spot.key}`).innerHTML = `${temp}<span class="unit">&deg;F</span>`;
    document.getElementById(`feels-${spot.key}`).textContent = `Feels ${feels}° · ${label}`;
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
}

// ---------- boot ----------

tickClock();
setInterval(tickClock, 30000);

buildPins();
refreshAll();
setInterval(refreshAll, REFRESH_MS);
