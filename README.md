# Philly Pulse

A sign that answers a real question — does weather and air quality actually
vary across Philadelphia neighborhoods? — by putting live numbers from five
landmarks on one screen: the Zoo, the Art Museum, University City, City Hall,
and Old City.

## Live data

- **Temperature & conditions** — [Open-Meteo](https://open-meteo.com/), one call per landmark, no API key required. This genuinely varies neighborhood to neighborhood.
- **Air quality (AQI)** — [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api), no API key required.
- **Clock** — the viewer's local system time, not tied to any API.

Both refresh every 5 minutes.

## Why AQI is shown once, not per landmark

Open-Meteo's air-quality model runs on an ~11km grid — coarser than the
distance between these five landmarks (all within about 3 miles of each
other). Querying it per-landmark just returns the same number five times,
which would be a *worse* answer than being upfront: temperature is
hyperlocal enough to show real variation here; day-to-day ambient AQI, at
the resolution free data offers, isn't. (Genuinely hyperlocal AQI exists —
[PurpleAir](https://www2.purpleair.com/)'s crowd-sourced sensor network can
show real block-to-block differences near highways and industrial corridors
— but that requires a free API key tied to an individual account, so it's
a natural next step rather than day-one scope.)

## The map

The background is an original abstraction, not a copy of any reference map —
a loose street grid plus a curve standing in for the Schuylkill's bend around
University City, styled to match the dark, single-accent-color language of
the other signs in this series.

## Accessibility

Built to pass WCAG AA contrast: every text/background pairing was checked
(4.5:1+ for body text; the one color that didn't — the "hazardous" AQI tier
— was corrected). Severity is never conveyed by color alone — the numeric
AQI value is always paired with a text category label (Good, Moderate,
etc.). Animations respect `prefers-reduced-motion`.

## Running it

Plain static site, no build step, no API key.

```
python3 -m http.server 8000
```

## Files

- `index.html` — markup, including the SVG map background
- `style.css` — dark theme, pin/card layout, portrait-friendly responsive rules
- `script.js` — landmark data, weather/AQI fetching, clock, pin rendering
