/* Venti's Aperitivo Bar. Vanilla JavaScript, no libraries.
   Everything on the page is visible without this file; it only adds the entrance,
   the scroll moments, the condensing header, the tricolor progress line, smooth anchor
   scrolling and the small screen navigation. No scroll handler reads layout:
   IntersectionObserver does the watching, and the one scroll listener (a fallback for
   browsers without CSS scroll driven animations) reads only window.scrollY. */
(function () {
  'use strict';

  /* The inline script in the page head adds the js class before the first paint, so the
     finished page never flashes before the entrance hides it. If this file had not run within
     a few seconds, that script took the class off again and the page showed itself without
     motion; in that case the entrance and the scroll moments are skipped, never replayed. */
  var html = document.documentElement;
  var late = html.getAttribute('data-js') === 'late';
  html.setAttribute('data-js', 'running');
  if (!late) html.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noMotion = reduceMotion || late;
  var supportsIO = 'IntersectionObserver' in window;
  var header = document.getElementById('site-header');

  /* ---- Scroll moments: leaders draw, badges pop, the ribbon unfurls, titles slide in. Once each.
          The framed boxes draw themselves, starting while the box is still 240 px below the
          viewport, so a reader scrolling at a normal pace never meets a half drawn frame.
          The observers are armed by the entrance (see start below): on a phone the platter box
          is inside the first screen, and its frame and badge wait their turn instead of
          competing with the wordmark. Anything already scrolled past when an observer looks is
          marked at once, so a restored scroll position never leaves a row without its price. ---- */
  var reveals = document.querySelectorAll('[data-reveal]');
  var frames = document.querySelectorAll('[data-frame]');
  var showAll = function () {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
    Array.prototype.forEach.call(frames, function (el) { el.classList.add('is-drawn'); });
  };
  var watch = function (elements, className, rootMargin) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          e.target.classList.add(className);
          observer.unobserve(e.target);
        }
      });
    }, { rootMargin: rootMargin, threshold: 0 });
    Array.prototype.forEach.call(elements, function (el) { observer.observe(el); });
  };
  var armed = false;
  var arm = function () {
    if (armed) return;
    armed = true;
    if (supportsIO && !noMotion) {
      watch(reveals, 'is-in', '0px 0px -5% 0px');
      watch(frames, 'is-drawn', '0px 0px 240px 0px');
    } else {
      showAll();
    }
  };

  /* ---- The page prints itself: start the entrance once the fonts are in, at most 600 ms after
          this runs, or 1,200 ms if only the wordmark's face is still on its way, so the wordmark
          never rises in a stand in font. The last piece lands 1.52 s after the start; the settle
          class then frees the animations, and the scroll moments are armed as the hours tag
          lands. ---- */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    html.classList.add('is-ready');
    window.setTimeout(function () { html.classList.add('is-settled'); }, 1600);
    if (noMotion) arm(); else window.setTimeout(arm, 1100);
  }
  if (document.fonts && document.fonts.ready && !noMotion) {
    document.fonts.ready.then(start, start);
    window.setTimeout(function () {
      var wordmarkReady = !document.fonts.check || document.fonts.check('900 1em "Playfair Display"');
      if (wordmarkReady) start(); else window.setTimeout(start, 600);
    }, 600);
  } else {
    start();
  }

  /* ---- Header: reveal the small wordmark and a hairline once the big wordmark has scrolled away. ---- */
  var sentinel = document.getElementById('hero-sentinel');
  if (header && sentinel && supportsIO) {
    var headerBottom = Math.round(header.getBoundingClientRect().bottom);
    var condense = new IntersectionObserver(function (entries) {
      var e = entries[0];
      var above = e.boundingClientRect.top < headerBottom;
      header.classList.toggle('is-condensed', !e.isIntersecting && above);
    }, { rootMargin: '-' + headerBottom + 'px 0px 0px 0px' });
    condense.observe(sentinel);
  } else if (header) {
    header.classList.add('is-condensed');
  }

  /* ---- Current section in the navigation, marked with aria-current and an underline. ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav__link[href^="#"]'));
  if (supportsIO && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var first = null;
      sections.forEach(function (s) { if (!first && visible[s.id]) first = s; });
      links.forEach(function (a) {
        var on = first && a.getAttribute('href') === '#' + first.id;
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { current.observe(s); });
  }

  /* ---- Smooth scrolling for in page links, done here rather than in CSS so that
          programmatic scrolls (and screenshot tools) stay instant. ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    var behavior = reduceMotion ? 'auto' : 'smooth';
    if (id === 'top') {
      window.scrollTo({ top: 0, left: 0, behavior: behavior });
    } else {
      target.scrollIntoView({ behavior: behavior, block: 'start' });
    }
    if (window.history && history.pushState) history.pushState(null, '', '#' + id);
    if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  });

  /* ---- Small screen navigation. The panel closes on a link, on Escape, on a click outside,
          and when keyboard focus moves on past it, so it never covers the next focus ring. ---- */
  var toggle = header && header.querySelector('.site-header__toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      header.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
    });
    header.addEventListener('focusout', function (e) {
      if (header.classList.contains('is-open') && e.relatedTarget && !header.contains(e.relatedTarget)) setOpen(false);
    });
  }

  /* ---- The tricolor progress line. Browsers with CSS scroll driven animations run it in
          CSS. Elsewhere this fallback reads only window.scrollY, once per animation frame,
          against a page height measured on load and resize, never per frame. ---- */
  var fill = document.querySelector('.progress__fill');
  var cssDriven = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  if (fill && !cssDriven) {
    var max = 1;
    var ticking = false;
    var measure = function () {
      max = Math.max(1, html.scrollHeight - window.innerHeight);
    };
    var paint = function () {
      ticking = false;
      var progress = Math.min(1, Math.max(0, window.scrollY / max));
      fill.style.clipPath = 'inset(0 ' + ((1 - progress) * 100).toFixed(2) + '% 0 0)';
    };
    var request = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(paint); }
    };
    measure();
    paint();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { measure(); request(); });
    window.addEventListener('load', function () { measure(); request(); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { measure(); request(); }).observe(document.body);
    }
  }
})();
