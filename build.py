#!/usr/bin/env python3
"""Assemble the static pages from src/*.body.html. Run: python3 build.py"""
import pathlib
ROOT = pathlib.Path(__file__).parent
ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"/></svg>'
UP = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 17L17 5M8 5h9v9"/></svg>'
def ticker(items): return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
TICKER = ticker(["Hydraulic rod lift technology", "Well head equipment", "Variable power packs", "Hydraulic cylinders", "Optimization controller", "Remote communications"])
RTICKER = ticker(["Rent / lease to own", "Units ready to go", "Full service department", "Optimization team", "Remote access"])
PAGES = {
    "index": ("SilverJack Lift Systems | Hydraulic Rod Lift Technology",
              "SilverJack hydraulic lift systems: the SJ150 and SJ300 long stroke pumping units with built-in optimization, remote monitoring and SCADA Access.", ""),
    "rentals": ("SilverJack Rentals | SilverJack Lift Systems",
                "Rent or lease to own a SilverJack hydraulic lift system, backed by a full service department, optimization team and remote access.", "rentals"),
    "design": ("SilverJack Inquiry Form | SilverJack Lift Systems",
               "Tell us about your well and let us select the right pumping solution for you.", "design"),
}
def page(name, title, desc, current, body):
    h = "" if name == "index" else "index.html"
    cur = lambda k: ' aria-current="page"' if current == k else ''
    return f'''<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0c1a27">
<link rel="icon" href="assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="SilverJack Lift Systems home"><img src="assets/img/silverjack-logo.png" alt="SilverJack Lift Systems" width="538" height="215"></a>
    <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu"><i></i><i></i></button>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="{h}#about">About</a>
      <a href="{h}#application">Application</a>
      <a href="{h}#models">Models</a>
      <a href="{h}#optimization">Optimization</a>
      <a href="{h}#contact">Contact</a>
      <span class="nav-sep"></span>
      <a href="assets/docs/TCB-SilverJack-Flyer.pdf" target="_blank" rel="noopener">Brochure</a>
      <a href="rentals.html"{cur("rentals")}>Rentals</a>
      <a class="btn btn-sand" href="design.html">Design</a>
    </nav>
  </div>
</header>
<main id="main">
{body}
</main>
<section class="cta">
  <div class="wrap">
    <p class="display h2 split">Let us select the right pumping solution for you</p>
    <div class="actions" data-reveal>
      <a class="btn btn-sand" href="design.html">Start a design {ARROW}</a>
      <a class="btn btn-glass" href="tel:18773614363">1-877-361-4363</a>
    </div>
  </div>
</section>
<footer class="site-footer">
  <div class="wrap">
    <img class="logo" src="assets/img/silverjack-logo.png" alt="SilverJack Lift Systems" width="538" height="215" loading="lazy">
    <nav aria-label="Footer">
      <a href="{h}#about">About</a><a href="{h}#application">Application</a><a href="{h}#models">Models</a><a href="{h}#optimization">Optimization</a><a href="{h}#contact">Contact</a><a href="design.html">Design</a><a href="rentals.html">Rentals</a>
    </nav>
    <p class="legal">Copyright | <a href="https://tcbmanufacturing.com" target="_blank" rel="noopener">TCB Manufacturing</a></p>
  </div>
  <div class="wordmark" aria-hidden="true"><span>SilverJack Lift Systems</span><span>SilverJack Lift Systems</span><span>SilverJack Lift Systems</span></div>
</footer>
<script src="assets/js/site.js"></script>
</body>
</html>
'''
import re
from PIL import Image
def dims(m):
    tag = m.group(0)
    if " width=" in tag: return tag
    w, h = Image.open(ROOT / m.group(1)).size
    return tag[:-1] + f' width="{w}" height="{h}">'
for name, (title, desc, cur) in PAGES.items():
    body = (ROOT / "src" / f"{name}.body.html").read_text().replace("{{arrow}}", ARROW).replace("{{up}}", UP).replace("{{ticker}}", TICKER).replace("{{rticker}}", RTICKER)
    html = re.sub(r'<img src="(assets/img/[^"]+)"[^>]*>', dims, page(name, title, desc, cur, body))
    (ROOT / f"{name}.html").write_text(html)
    print("built", name + ".html")
