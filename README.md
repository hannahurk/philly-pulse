# Philly Pulse

A sign that answers a real question — does weather and air quality actually
vary across Philadelphia neighborhoods? — by putting live numbers from ten
real neighborhoods on one screen: Fairmount, Fishtown, Logan Square, Northern
Liberties, University City, Old City, Rittenhouse Square, Society Hill,
Gayborhood, and Point Breeze.

## Live data

- **Temperature & conditions** — [Open-Meteo](https://open-meteo.com/), one call per neighborhood, no API key required. This genuinely varies neighborhood to neighborhood.
- **Air quality (AQI)** — [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api), no API key required. Shown once, prominently, at the top — see below for why.
- **Clock** — the viewer's local system time, not tied to any API.

Both refresh every 5 minutes.

## Interaction — screen wake on movement

There's no touchscreen. Mouse, touch, and keyboard activity stand in for a
real motion/PIR sensor — the same conceit as the "Look Up" sign's idle/wake
cycle. After 15 seconds with no activity, the sign dims; any movement wakes
it back up.

## Why AQI is shown once, not per neighborhood

Open-Meteo's air-quality model runs on an ~11km grid — coarser than the
distance between most of these neighborhoods. Querying it per-neighborhood
just returns the same number many times over, which would be a *worse*
answer than being upfront: temperature is hyperlocal enough to show real
variation here; day-to-day ambient AQI, at the resolution free data offers,
isn't. (Genuinely hyperlocal AQI exists —
[PurpleAir](https://www2.purpleair.com/)'s crowd-sourced sensor network can
show real block-to-block differences near highways and industrial corridors
— but that requires a free API key tied to an individual account, so it's
a natural next step rather than day-one scope.)

## A note on temperature resolution, too

Even temperature has a floor: Open-Meteo's forecast model also snaps to a
grid (roughly a third of a mile per cell here), and two of these
neighborhoods are close enough in real life to land in the very same cell —
Logan Square and Old City, and Rittenhouse Square and the Gayborhood, each
show identical numbers as a result. That's not a bug; it's the same lesson
as the AQI one, just at a finer scale — model resolution runs out eventually,
even for the metric that's genuinely hyperlocal at city scale.

## Weather icons

Seven original line-art icons (sun, partly cloudy, cloud, fog, rain, snow,
thunderstorm), mapped from Open-Meteo's WMO weather codes and rendered
inline as SVG — no icon font or external asset. Each inherits
`currentColor`, so it renders in that neighborhood's own accent color
rather than one flat icon color for every pin.

## The map

The background is an original abstraction, not a copy of any reference map —
a loose street grid, a subtle neighborhood-patchwork texture, and a curve
standing in for the Schuylkill's bend around University City. Each
neighborhood pin gets its own accent color — inspired by the color-coded
feel of a real neighborhood boundary map a user shared for reference, but
using original brightened hues (not that map's actual palette) chosen to
clear WCAG contrast against the sign's black background.

## Accessibility

- **Contrast**: true black/white base palette, re-verified after every color
  change. All ten neighborhood accent colors and all six AQI tiers clear
  4.5:1 against black (most clear 6.5:1+); borders were thickened and
  brightened so element boundaries read clearly, not just body text.
- **Font sizes**: no text on the sign renders below 12px at any viewport
  size — several labels that used to bottom out at 9–10px on narrow screens
  were raised.
- **Color is never the only signal**: AQI severity always pairs its color
  with a text category label (Good, Moderate, etc.), and each neighborhood
  pin pairs its color with its name, never color alone.
- Animations respect `prefers-reduced-motion`.

## Running it

Plain static site, no build step, no API key.

```
python3 -m http.server 8000
```

## Files

- `index.html` — markup, including the SVG map background
- `style.css` — dark theme, pin/card layout, portrait-friendly responsive rules
- `script.js` — landmark data, weather/AQI fetching, clock, pin rendering
