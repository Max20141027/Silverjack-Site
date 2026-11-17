(function () {
  var doc = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  doc.classList.add('js');

  /* ---------- page curtain ---------- */
  var curtain = document.createElement('div');
  curtain.className = 'curtain';
  document.body.appendChild(curtain);
  if (!reduce) curtain.classList.add('out');
  window.addEventListener('pageshow', function (e) { if (e.persisted) { curtain.className = 'curtain'; } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!/^(index|rentals|design)\.html$/.test(href)) return;
    e.preventDefault();
    curtain.className = 'curtain in';
    setTimeout(function () { location.href = href; }, 430);
  });

  /* ---------- header, progress bar ---------- */
  var header = $('.site-header');
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  var lastY = 0;
  function onScrollChrome() {
    var y = scrollY;
    header.classList.toggle('solid', y > 60);
    header.classList.toggle('away', y > 500 && y > lastY && !header.classList.contains('menu-open'));
    lastY = y;
    var max = doc.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }

  var menuBtn = $('.menu-btn'), nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- split headings into words ---------- */
  function splitWords(el, cls) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            if (cls === 'inner') { var s = document.createElement('span'); s.textContent = part; s.style.setProperty('--d', i); w.appendChild(s); }
            else w.textContent = part;
            i++; frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
  }
  $$('.split').forEach(function (el) { splitWords(el, 'inner'); });
  $$('.statement p').forEach(function (el) { splitWords(el); });

  /* ---------- reveal on scroll ---------- */
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (c, i) {
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
      c.style.setProperty('--d', i);
    });
  });
  var targets = $$('[data-reveal], .split, .scale');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        $$('[data-count]', en.target).concat(en.target.hasAttribute('data-count') ? [en.target] : []).forEach(count);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
    $$('[data-count]').forEach(function (c) { if (!c.closest('[data-reveal]')) io.observe(c); });
  } else targets.forEach(function (t) { t.classList.add('in'); });

  /* ---------- count-up numbers ---------- */
  function count(el) {
    if (el._done) return; el._done = true;
    var to = parseFloat(el.getAttribute('data-count'));
    if (reduce) return;
    var t0 = performance.now(), dur = 1600;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- scroll-driven pieces ---------- */
  var parallax = $$('[data-parallax]');
  var statement = $('.statement');
  var words = statement ? $$('.w', statement) : [];
  var reel = $('.reel'), track = $('.reel-track');
  var reelOn = false, reelDist = 0;
  function layoutReel() {
    if (!reel) return;
    reelOn = !reduce && innerWidth > 900 && innerHeight > 560;
    reel.classList.toggle('pinned', reelOn);
    if (reelOn) {
      track.scrollLeft = 0;
      reelDist = Math.max(0, track.scrollWidth - innerWidth);
      reel.style.height = (innerHeight + reelDist) + 'px';
    } else { reel.style.height = ''; track.style.transform = ''; }
  }
  function onScroll() {
    onScrollChrome();
    var vh = innerHeight;
    if (!reduce) parallax.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var mid = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = 'translate3d(0,' + (mid * parseFloat(el.getAttribute('data-parallax')) * 100).toFixed(1) + 'px,0)';
    });
    if (words.length) {
      var sr = statement.getBoundingClientRect();
      var p = (vh * 0.85 - sr.top) / (sr.height + vh * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    }
    if (reelOn) {
      var rr = reel.getBoundingClientRect();
      var rp = Math.max(0, Math.min(1, -rr.top / (rr.height - vh)));
      track.style.transform = 'translate3d(' + (-rp * reelDist).toFixed(1) + 'px,0,0)';
    }
  }
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', function () { layoutReel(); onScroll(); });
  addEventListener('load', function () { layoutReel(); onScroll(); });
  if (track) $$('img', track).forEach(function (im) { im.addEventListener('load', function () { layoutReel(); onScroll(); }); });
  layoutReel(); onScroll();

  /* ---------- applications accordion ---------- */
  var apps = $$('.app'), stage = $$('.app-stage img');
  function openApp(i) {
    apps.forEach(function (a, j) {
      a.classList.toggle('open', i === j);
      $('.app-btn', a).setAttribute('aria-expanded', i === j ? 'true' : 'false');
    });
    stage.forEach(function (im, j) { im.classList.toggle('on', i === j); });
  }
  apps.forEach(function (a, i) {
    $('.app-btn', a).addEventListener('click', function () { openApp(a.classList.contains('open') && innerWidth <= 900 ? -1 : i); });
  });
  if (apps.length) openApp(0);

  /* ---------- model switch ---------- */
  var sw = $('.switch');
  if (sw) {
    sw.hidden = false;
    var mbtns = $$('button', sw), models = $$('.model'), ghost = $('.ghost');
    var pick = function (i) {
      sw.setAttribute('data-on', i);
      mbtns.forEach(function (b, j) { b.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
      models.forEach(function (m, j) {
        m.hidden = i !== j; m.classList.remove('swap-in');
        if (i === j) { void m.offsetWidth; m.classList.add('swap-in'); $$('[data-count]', m).forEach(function (c) { c._done = false; count(c); }); }
      });
      if (ghost) ghost.textContent = i ? 'SJ300' : 'SJ150';
    };
    mbtns.forEach(function (b, i) { b.addEventListener('click', function () { pick(i); }); });
    models.forEach(function (m, j) { m.hidden = j !== 0; });
  }

  /* ---------- working model of the lift: 1" of cylinder = 2" of rod ---------- */
  var mech = $('#mech');
  if (mech) {
    var el = function (id) { return mech.querySelector('#' + id); };
    var ram = el('m-ram'), sheave = el('m-sheave'), spokes = el('m-spokes'), cabL = el('m-cab-l'), cabR = el('m-cab-r'),
        carrier = el('m-carrier'), rod = el('m-rod'), mkC = el('m-mk-c'), mkR = el('m-mk-r');
    var outC = $('#out-cyl'), outR = $('#out-rod');
    var draw = function (h) {              // h: cylinder extension, 0..150 (px == inches)
      var sy = 240 - h, cy = 440 - 2 * h;
      ram.setAttribute('y', sy); ram.setAttribute('height', 262 - sy);
      sheave.setAttribute('transform', 'translate(162 ' + sy + ')');
      spokes.setAttribute('transform', 'rotate(' + (h * 2.6) + ')');
      cabL.setAttribute('y2', sy); cabR.setAttribute('y1', sy); cabR.setAttribute('y2', cy);
      carrier.setAttribute('transform', 'translate(184 ' + cy + ')');
      rod.setAttribute('y1', cy);
      mkC.setAttribute('transform', 'translate(0 ' + (-h) + ')');
      mkR.setAttribute('transform', 'translate(0 ' + (-2 * h) + ')');
      outC.textContent = Math.round(h) + '"'; outR.textContent = Math.round(2 * h) + '"';
    };
    if (reduce) draw(150);
    else {
      var visible = false, start = null;
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(mech);
      var loop = function (now) {
        if (!visible) { start = null; return; }
        if (start === null) start = now - (mech._t || 0);
        mech._t = now - start;
        draw(75 * (1 - Math.cos((mech._t / 9000) * 2 * Math.PI)));
        requestAnimationFrame(loop);
      };
      draw(0);
    }
  }

  /* ---------- optimization cycle ---------- */
  var ring = $('.ring');
  if (ring) {
    var steps = $$('.steps li'), nodes = $$('.node', ring), word = $('.ring-center b'), arc = $('.arc', ring);
    var cur = 0, turns = 0, timer;
    var go = function (i, user) {
      if (i === 0 && cur === steps.length - 1) turns++;   // keep rotating forward
      cur = i;
      arc.style.setProperty('--i', turns * 4 + i);
      steps.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      nodes.forEach(function (n, j) { n.classList.toggle('on', j === i); });
      word.textContent = steps[i].textContent.trim();
      word.classList.remove('tick'); void word.offsetWidth; word.classList.add('tick');
    };
    var play = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { go((cur + 1) % steps.length); }, 2400); };
    steps.forEach(function (s, i) { s.addEventListener('click', function () { go(i, true); play(); }); });
    go(0); play();
  }

  /* ---------- scenario tabs ---------- */
  $$('[role="tablist"].tabs').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); }
      });
    });
  });

  /* ---------- forms: POST to data-endpoint if set, otherwise open the visitor's email app ---------- */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('.form-status', form), data = new FormData(form), lines = [], seen = {};
      data.forEach(function (value, key) {
        if (!String(value).trim()) return;
        if (seen[key]) { lines[seen[key] - 1] += ', ' + value; return; }
        lines.push(key + ': ' + value); seen[key] = lines.length;
      });
      var say = function (msg) { status.textContent = msg; status.hidden = false; };
      var to = form.getAttribute('data-mailto'), endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); form.reset(); say('Message sent. We will be in touch shortly.'); })
          .catch(function () { say('The message could not be sent. Please call 1-877-361-4363 or email ' + to + '.'); });
        return;
      }
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'SilverJack inquiry') + '&body=' + encodeURIComponent(lines.join('\n'));
      say('Your email app should open with your answers filled in. If it does not, email ' + to + ' or call 1-877-361-4363.');
    });
  });
})();
