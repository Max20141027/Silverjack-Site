# SilverJack Lift Systems — website redesign

Static site, no build tooling required to host: upload the folder as-is.

- `index.html` — home (About, Application, Models, Key differences, Quality, Service, Optimization, Locations, Contact)
- `rentals.html` — Rentals
- `design.html` — Design inquiry form
- `assets/` — CSS, JS, images, PDF downloads
- `src/` + `build.py` — page bodies and the shared header/footer. Edit `src/*.body.html`, then run `python3 build.py`.

## Forms
Both forms currently open the visitor's email app addressed to ryan.mobbs@silverjack.ca with the answers filled in.
To post to a form backend instead, add `data-endpoint="https://…"` to the `<form>` tag; `assets/js/main.js` will POST the fields there.

All copy, specifications, photos and documents come from silverjack.ca.
