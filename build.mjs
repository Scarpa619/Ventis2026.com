// Build script for Venti's Aperitivo Bar ("The Printed Menu, Alive").
// Node only, no packages. Reads data/menu.json (next to this file if present, otherwise
// ../../data/menu.json), renders src/template.html, src/og.html and src/icon.html, and
// writes index.html, og.html, icon.html plus the standalone SVG art in assets/.
// Run: node build.mjs
//
// The build checks its own output before writing anything: exactly one h1, no root relative
// URLs, no dashes in the copy (visible text, alt, title, aria-label and content attributes,
// and the JSON-LD strings), a meta description of 160 characters or fewer, and no unfilled
// placeholders. On any failure it prints what is wrong and exits with a non zero code, so a
// broken page cannot be published quietly.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const localData = join(here, 'data', 'menu.json');
const dataPath = existsSync(localData) ? localData : join(here, '..', '..', 'data', 'menu.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

const SITE_URL = 'https://ventis2026.com/';
const OG_IMAGE = SITE_URL + 'assets/og.png';
const YEAR = 2026;

const r = data.restaurant;

// ---------- helpers ----------

// Escape text for HTML. ASCII specials become named entities; everything outside ASCII
// (the ù in ragù, the à in Specialità, the © sign, an emoji) becomes a numeric entity for its
// whole code point, so a character outside the Basic Multilingual Plane is one reference, not two.
const esc = (s) => String(s)
  .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  .replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`);

const attr = esc;

// Italian words inside English sentences (Perfetto!, Grazie) get lang="it" so a screen reader
// says them in Italian (WCAG 3.1.2, language of parts). Only the brief's copy bank words:
// names and words being defined, like aperitivo, stay English. Takes escaped text.
const ITALIAN_WORDS = ['Perfetto', 'Grazie', 'Salute', 'Cin Cin', 'A presto'];
const italian = (escaped) => escaped.replace(new RegExp(`\\b(${ITALIAN_WORDS.join('|')})\\b`, 'g'), '<span lang="it">$1</span>');

const money = (n) => `<span class="vh">$</span>${esc(n)}`;
const leader = () => '<span class="leader" aria-hidden="true"></span>';
const mapsHint = '<span class="vh"> (opens Google Maps in a new tab)</span>';

// Small line icons for buttons and the phone quick bar. They inherit currentColor.
const ico = (paths) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const ICONS = {
  phone: ico('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>'),
  pin: ico('<path d="M12 22s7-7.1 7-12.5A7 7 0 0 0 5 9.5C5 14.9 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.6"/>'),
  menu: ico('<path d="M7 3v7a2.5 2.5 0 0 0 5 0V3M9.5 3v18"/><path d="M17 3c-2 2-2.5 6-2.5 8.5 0 1.5.5 2 2.5 2v7.5"/><path d="M17 3v10.5"/>'),
  download: ico('<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>'),
};

// ---------- SVG art, drawn in code ----------

const LEAF = 'M0 0C12-12 30-14 44-3C30 5 12 7 0 0Z';
const LEAVES = [
  [30.8, 91.5, -88, 1],
  [41.9, 82.5, 4, 0.9],
  [56.6, 70.5, -84, 1],
  [77.2, 52.8, -80, 1],
  [95, 37.3, -4, 1],
  [111.5, 22.8, -76, 0.9],
  [126, 10, -40, 0.8],
];
const STEM = 'M14 104C40 86 76 54 126 10';
const OLIVE_STEMS = ['M77 54L85 66', 'M79 52L100 58'];
const OLIVES = [[102, 60], [86, 71]];
const SPRIG_VIEWBOX = '-6 -28 176 142';

function sprigInner(colors) {
  const tf = ([x, y, rot, s]) => `translate(${x} ${y}) rotate(${rot})${s !== 1 ? ` scale(${s})` : ''}`;
  let k = 0;
  const lines = [`<path d="${STEM}" stroke-width="3" pathLength="1" style="--k:${k++}"/>`]
    .concat(LEAVES.map((l) => `<path d="${LEAF}" transform="${tf(l)}" pathLength="1" style="--k:${k++}"/>`))
    .concat(OLIVE_STEMS.map((d) => `<path d="${d}" stroke-width="2" pathLength="1" style="--k:${k++}"/>`))
    .join('');
  const fills = LEAVES.map((l) => `<path d="${LEAF}" transform="${tf(l)}"/>`).join('');
  const olives = OLIVES.map(([x, y]) =>
    `<g class="sprig__olive"><circle cx="${x}" cy="${y}" r="10"/><ellipse class="sprig__shine" cx="${x - 3.5}" cy="${y - 4}" rx="3" ry="1.8"/></g>`).join('');
  const green = colors ? '#16533A' : 'currentColor';
  const shine = colors ? ' fill="#F5EFDD" fill-opacity=".6"' : '';
  return `<g class="sprig__lines" fill="none" stroke="${green}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${lines}</g>` +
    `<g class="sprig__fills" fill="${green}">${fills}</g>` +
    `<g class="sprig__olives" fill="#A21E28">${olives.replace(/class="sprig__shine"/g, `class="sprig__shine"${shine}`)}</g>`;
}

// Inline sprig: inherits currentColor, so it can be recolored per context.
const sprig = (cls = '') =>
  `<svg class="sprig${cls ? ' ' + cls : ''}" viewBox="${SPRIG_VIEWBOX}" aria-hidden="true" focusable="false">${sprigInner(false)}</svg>`;

// Standalone sprig file with the brand colors baked in.
const sprigFile = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SPRIG_VIEWBOX}" width="176" height="142">${sprigInner(true)}</svg>\n`;

const tricolor = (extra = '', reveal = false) =>
  `<span class="tricolor${extra ? ' ' + extra : ''}"${reveal ? ' data-reveal' : ''} aria-hidden="true"><i></i><i></i><i></i></span>`;

const tricolorFile = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 10" width="150" height="10">' +
  '<rect x="0" y="0" width="50" height="10" fill="#16533A"/>' +
  '<rect x="50.5" y="0.5" width="49" height="9" fill="#FFFFFF" stroke="#CDC3B0"/>' +
  '<rect x="100" y="0" width="50" height="10" fill="#A21E28"/></svg>\n';

const faviconSvg = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" fill="#F5EFDD"/>' +
  '<rect x="4" y="4" width="56" height="56" fill="none" stroke="#16533A" stroke-width="2"/>' +
  '<rect x="1" y="1" width="6" height="6" fill="#A21E28"/><rect x="57" y="1" width="6" height="6" fill="#A21E28"/>' +
  '<rect x="1" y="57" width="6" height="6" fill="#A21E28"/><rect x="57" y="57" width="6" height="6" fill="#A21E28"/>' +
  '<path d="M11 19h17l6.5 20L46 19h9L38.5 51h-9z" fill="#A21E28"/>' +
  '<path d="M24 17c6-6 14-9 24-8" fill="none" stroke="#16533A" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M30 13c1-5 5-8 11-7-1 5-5 7-11 7z" fill="#16533A"/>' +
  '<path d="M37 13c5-2 10-1 12 3-5 2-10 1-12-3z" fill="#16533A"/>' +
  '<circle cx="33" cy="16" r="2.6" fill="#A21E28"/>' +
  '</svg>\n';

const ribbonTailLeft = '<svg class="ribbon__tail ribbon__tail--l" viewBox="0 0 48 56" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M48 0H0l14 28L0 56h48z"/></svg>';
const ribbonTailRight = '<svg class="ribbon__tail ribbon__tail--r" viewBox="0 0 48 56" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0h48L34 28l14 28H0z"/></svg>';

const glassSvg = () =>
  '<svg class="glass" viewBox="0 0 120 170" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M24 18c0-5 72-5 72 0c0 5-72 5-72 0z" pathLength="1" style="--k:0"/>' +
  '<path d="M24 18c0 52 20 74 36 78c16-4 36-26 36-78" pathLength="1" style="--k:1"/>' +
  '<path d="M31 44q29 9 58 0" pathLength="1" style="--k:2"/>' +
  '<path d="M60 96v44" pathLength="1" style="--k:3"/>' +
  '<path d="M32 146c0-6 56-6 56 0c0 5-56 5-56 0z" pathLength="1" style="--k:4"/>' +
  '<circle cx="50" cy="62" r="3" pathLength="1" style="--k:5"/><circle cx="66" cy="72" r="2.2" pathLength="1" style="--k:6"/>' +
  '<circle cx="71" cy="54" r="2.6" pathLength="1" style="--k:7"/><circle cx="56" cy="80" r="1.8" pathLength="1" style="--k:8"/>' +
  '</svg>';

// The double rule frame of the printed menu, as separate lines so it can draw itself:
// top, right, bottom, left, then the inner rule, then (on green frames) the red corners.
const frameLines = (corners) =>
  ['t', 'r', 'b', 'l'].map((s) => `<i class="box__line box__line--${s}" aria-hidden="true"></i>`).join('') +
  '<i class="box__inner" aria-hidden="true"></i>' +
  (corners ? cornerSquares('box__corner') : '');

const cornerSquares = (cls) =>
  ['tl', 'tr', 'bl', 'br'].map((c) => `<i class="${cls} ${cls}--${c}" aria-hidden="true"></i>`).join('');

// ---------- lockups ----------

function lockup({ tag = 'div', cls = '', href = null, id = '' } = {}) {
  const open = href ? `<a class="lockup ${cls}" href="${attr(href)}"${id ? ` id="${id}"` : ''}>` : `<${tag} class="lockup ${cls}"${id ? ` id="${id}"` : ''}>`;
  const close = href ? '</a>' : `</${tag}>`;
  return open +
    `<span class="lockup__mark">${sprig('lockup__sprig')}` +
    `<span class="lockup__rule lockup__rule--l" aria-hidden="true"></span>` +
    `<span class="lockup__name">${esc(r.shortName)}</span>` +
    `<span class="lockup__rule lockup__rule--r" aria-hidden="true"></span></span>` +
    `<span class="lockup__descriptor">${esc(r.descriptor)}</span>` +
    close;
}

// ---------- sections ----------

function header() {
  const links = [['#menu', 'Menu'], ['#platter', 'Platter'], ['#brunch', 'Brunch'], ['#cantina', 'Drinks'], ['#hours', 'Hours']];
  return `<header class="site-header" id="site-header">
  <div class="site-header__inner">
    <button class="site-header__toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="site-header__bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="site-header__toggle-label">Sections</span>
    </button>
    ${lockup({ href: '#top', cls: 'lockup--small site-header__brand' })}
    <nav class="site-nav" id="site-nav" aria-label="Sections of this page">
      <ul class="site-nav__list">
        ${links.map(([h, t]) => `<li><a class="site-nav__link" href="${h}">${t}</a></li>`).join('\n        ')}
        <li class="site-nav__extra"><a class="site-nav__link" href="${attr(r.links.directions)}" target="_blank" rel="noopener">Get Directions${mapsHint}</a></li>
      </ul>
    </nav>
    <a class="btn btn--red btn--header" href="tel:${attr(r.phoneTel)}">${ICONS.phone}<span>Call</span><span class="vh"> ${esc(r.phoneDisplay)}</span></a>
  </div>
  <div class="progress" aria-hidden="true"><div class="progress__fill"><i></i><i></i><i></i></div></div>
</header>`;
}

// The framed hours tag under the hero buttons: both hours lines and the brunch line,
// all from the data file. On phones it collapses to two stacked hours lines.
function hoursTag() {
  const b = data.brunch;
  const sunday = r.hours.find((h) => h.days.includes('Sunday')) || r.hours[r.hours.length - 1];
  const rows = r.hours.map((h) =>
    `<div class="hours-tag__row"><dt class="hours-tag__days">${esc(h.label)}</dt><dd class="hours-tag__time">${esc(h.open)} to ${esc(h.close)}</dd></div>`).join('\n        ');
  return `<div class="hours-tag" data-enter style="--t:1040">
      ${cornerSquares('hours-tag__corner')}
      <dl class="hours-tag__list">
        ${rows}
      </dl>
      <a class="hours-tag__brunch" href="#brunch"><span class="hours-tag__days">${esc(b.name)},</span> <span class="hours-tag__time">doors open at ${esc(sunday.open)}</span></a>
    </div>`;
}

function hero() {
  return `<section class="hero" id="top" aria-label="Welcome">
  <div class="hero__inner">
    ${lockup({ tag: 'h1', cls: 'lockup--hero' })}
    <span class="hero__sentinel" id="hero-sentinel" aria-hidden="true"></span>
    <p class="hero__tagline" data-enter style="--t:640">${esc(r.tagline)}</p>
    <p class="hero__tagline hero__tagline--second" data-enter style="--t:720">${esc(r.taglineSecond)}</p>
    ${tricolor('hero__tricolor')}
    <div class="hero__actions">
      <a class="btn btn--call btn--big" href="tel:${attr(r.phoneTel)}" data-enter style="--t:860">Call ${esc(r.phoneDisplay)}</a>
      <a class="btn btn--green btn--big" href="${attr(r.links.directions)}" target="_blank" rel="noopener" data-enter style="--t:920">Get Directions${mapsHint}</a>
      <a class="btn btn--outline btn--big" href="#menu" data-enter style="--t:980">See the Menu</a>
    </div>
    ${hoursTag()}
  </div>
</section>`;
}

function platter() {
  const s = data.specialty;
  return `<section class="platter" id="platter" aria-labelledby="platter-title" tabindex="-1">
  <div class="wrap">
    <div class="platter__box box box--red" data-reveal data-frame>
      ${frameLines(false)}
      <h2 class="platter__title" id="platter-title"><span class="script platter__eyebrow" lang="it">${esc(s.eyebrow)}</span><span class="platter__name">${esc(s.name)}</span></h2>
      <span class="badge badge--red platter__badge">${money(s.price)}</span>
      <p class="platter__desc">${esc(s.description)}</p>
      <p class="platter__note">${italian(esc(s.note))}</p>
    </div>
  </div>
</section>`;
}

const secTitle = (it, en, { tag = 'h3', id = '', cls = '' } = {}) =>
  `<${tag} class="sec-title ${cls}"${id ? ` id="${id}"` : ''} data-reveal><span class="sec-title__it" lang="it">${esc(it)}</span> <span class="sec-title__en">${esc(en)}</span></${tag}>`;

function dishList(items) {
  return `<ul class="dishes" data-reveal>
${items.map((it, i) => `        <li class="dish" style="--i:${i}">
          <div class="dish__row"><span class="dish__name">${esc(it.name)}</span>${leader()}<span class="price">${money(it.price)}</span></div>
          <p class="dish__desc">${esc(it.description)}</p>
        </li>`).join('\n')}
      </ul>`;
}

function menu() {
  const p = data.primi;
  const groups = data.sections.map((s, i) => `
      <section class="dish-group" aria-labelledby="${s.id}-title">
        ${secTitle(s.italian, s.english, { id: `${s.id}-title` })}
        ${dishList(s.items)}
      </section>${i < data.sections.length - 1 ? '\n      <hr class="hair">' : ''}`).join('');

  return `<section class="menu" id="menu" aria-labelledby="menu-title" tabindex="-1">
  <div class="wrap">
    <header class="menu__head">
      <div class="menu__heading">
        <h2 class="menu__title" id="menu-title">Menu</h2>
        <p class="menu__motto" lang="it">Mangia. Bevi. Ripeti.</p>
      </div>
      <a class="btn btn--outline btn--small" href="${attr(r.links.menuPdf)}" download>${ICONS.download}<span>Printed menu (PDF)</span></a>
    </header>
    <div class="rule-double" data-reveal aria-hidden="true"></div>
    <div class="two-col">
      <div class="two-col__col">
        <section class="dish-group" aria-labelledby="primi-title">
          <div class="sec-head" data-reveal>
            ${secTitle(p.italian, p.english, { id: 'primi-title' }).replace(' data-reveal', '')}
            ${leader()}
            <span class="price">${money(p.price)}</span>
          </div>
          <p class="dish-group__note">${esc(p.note)}</p>
          <ul class="pastas" data-reveal>
            ${p.pastas.map((n, i) => `<li class="pastas__item" style="--i:${i}">${esc(n)}</li>`).join('\n            ')}
          </ul>
          <div class="sauces" data-reveal>
            <h4 class="script sauces__title">${esc(p.sauces.title)}</h4>
            <ul class="sauces__list">
              ${p.sauces.options.map((o) => `<li class="sauces__item"><span class="sauces__name">${esc(o.name)}</span><span class="sauces__desc">${esc(o.description)}</span></li>`).join('\n              ')}
            </ul>
          </div>
        </section>
      </div>
      <div class="two-col__col">${groups}
      </div>
    </div>
  </div>
</section>`;
}

function brunch() {
  const b = data.brunch;
  return `<section class="brunch" id="brunch" aria-labelledby="brunch-title" tabindex="-1">
  <div class="wrap wrap--narrow">
    ${secTitle('La Domenica', 'Sunday', { tag: 'h2', id: 'brunch-title', cls: 'sec-title--h2 sec-title--center' })}
    <div class="brunch__box box box--green" data-frame>
      ${frameLines(true)}
      <div class="ribbon" data-reveal>
        <div class="ribbon__wrap">
          ${ribbonTailLeft}
          <div class="ribbon__band"><h3 class="ribbon__text">${esc(b.name)}</h3><span class="badge badge--ivory">${money(b.price)}</span></div>
          ${ribbonTailRight}
        </div>
      </div>
      <p class="brunch__desc">${esc(b.description)}</p>
      <p class="brunch__note">${esc(b.note)}</p>
    </div>
  </div>
</section>`;
}

function cantina() {
  const beer = data.beer;
  const wine = data.wine;
  const beerGroups = beer.groups.map((g, gi) => `
        <div class="drink-group" data-reveal style="--i:${gi}">
          <div class="dish__row"><h4 class="dish__name">${esc(g.name)}</h4>${leader()}<span class="price">${money(g.price)}</span></div>
          <ul class="plain">
            ${g.items.map((n) => `<li>${esc(n)}</li>`).join('\n            ')}
          </ul>
        </div>`).join('');
  const tiers = `<ul class="dishes dishes--tight" data-reveal>
${wine.tiers.map((t, i) => `          <li class="dish" style="--i:${i}"><div class="dish__row"><span class="dish__name">${esc(t.name)}</span>${leader()}<span class="price">${money(t.price)}</span></div></li>`).join('\n')}
        </ul>`;
  const varietals = `<ul class="varietals">
${wine.varietals.map((v) => `          <li class="varietal"><span class="varietal__name">${esc(v.name)}</span><span class="varietal__producers">${esc(v.producers.join(', '))}</span></li>`).join('\n')}
        </ul>`;

  return `<section class="cantina" id="cantina" aria-labelledby="cantina-title" tabindex="-1">
  <div class="wrap">
    <header class="cantina__head">
      ${secTitle('La Cantina', 'The Cellar', { tag: 'h2', id: 'cantina-title', cls: 'sec-title--h2' })}
      <p class="cantina__tagline">${esc(r.drinksTagline)}</p>
    </header>
    <div class="rule-double" data-reveal aria-hidden="true"></div>
    <div class="two-col">
      <div class="two-col__col">
        ${secTitle(beer.italian, beer.english, { id: 'birra-title' })}${beerGroups}
      </div>
      <div class="two-col__col">
        ${secTitle(wine.italian, wine.english, { id: 'vino-title' })}
        ${tiers}
        ${varietals}
      </div>
    </div>
  </div>
</section>`;
}

function aperitivo() {
  return `<section class="aperitivo" aria-labelledby="aperitivo-title">
  <div class="wrap wrap--narrow aperitivo__inner">
    <div class="aperitivo__art" data-reveal>${glassSvg()}</div>
    <div class="aperitivo__text">
      <h2 class="aperitivo__word" id="aperitivo-title"><span class="aperitivo__it">aperitivo</span> <span class="aperitivo__say">(ah peh ree TEE voh):</span></h2>
      <p class="aperitivo__def">The Italian ritual of a good glass and a little something to eat as the evening begins. Consider this your invitation.</p>
      <p class="script aperitivo__salute" lang="it">Salute!</p>
    </div>
  </div>
</section>`;
}

function visit() {
  const a = r.address;
  return `<section class="visit" id="hours" aria-labelledby="visit-title" tabindex="-1">
  <div class="wrap">
    ${secTitle('Vieni a Trovarci', 'Come See Us', { tag: 'h2', id: 'visit-title', cls: 'sec-title--h2' })}
    <div class="rule-double" data-reveal aria-hidden="true"></div>
    <div class="visit__grid">
      <div class="visit__info">
        <h3 class="visit__h">Hours</h3>
        <dl class="hours">
          ${r.hours.map((h) => `<div class="hours__row"><dt class="hours__days">${esc(h.label)}</dt><dd class="hours__time">${esc(h.open)} to ${esc(h.close)}</dd></div>`).join('\n          ')}
        </dl>
        <h3 class="visit__h">Visit or Call</h3>
        <address class="visit__address">
          <p class="visit__line">${esc(a.street)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}</p>
          <p class="visit__line"><a class="visit__phone" href="tel:${attr(r.phoneTel)}">${esc(r.phoneDisplay)}</a></p>
          <p class="visit__line"><a class="visit__email" href="mailto:${attr(r.email)}">${esc(r.email)}</a></p>
        </address>
        <a class="btn btn--green btn--big" href="${attr(r.links.directions)}" target="_blank" rel="noopener">Get Directions${mapsHint}</a>
      </div>
      <div class="visit__map">
        <p class="visit__map-note" aria-hidden="true">${esc(a.street)}, ${esc(a.city)}</p>
        <iframe class="visit__iframe" src="${attr(r.links.mapEmbed)}" title="Map showing ${attr(r.name)} at ${attr(a.street)}, ${attr(a.city)}, ${attr(a.state)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </div>
</section>`;
}

function footer() {
  const a = r.address;
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer__signoff" data-reveal>
      <span class="footer__hair" aria-hidden="true"></span>
      <p class="script footer__grazie">${italian(esc(r.signoff))}</p>
      <span class="footer__hair" aria-hidden="true"></span>
    </div>
    ${tricolor('footer__tricolor', true)}
    ${lockup({ cls: 'lockup--footer' })}
    <p class="footer__line">${esc(a.street)}, ${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}</p>
    <p class="footer__line"><a href="tel:${attr(r.phoneTel)}">${esc(r.phoneDisplay)}</a></p>
    <p class="footer__line"><a href="mailto:${attr(r.email)}">${esc(r.email)}</a></p>
    <p class="footer__copy">&#169; ${YEAR} ${esc(r.name)}</p>
  </div>
</footer>`;
}

// The quick bar pinned to the bottom of phone screens: Call, Directions, Menu.
function quickbar() {
  return `<nav class="quickbar" aria-label="Call, directions and menu">
  <a class="quickbar__link" href="tel:${attr(r.phoneTel)}">${ICONS.phone}<span>Call</span><span class="vh"> ${esc(r.phoneDisplay)}</span></a>
  <a class="quickbar__link" href="${attr(r.links.directions)}" target="_blank" rel="noopener">${ICONS.pin}<span>Directions</span>${mapsHint}</a>
  <a class="quickbar__link" href="#menu">${ICONS.menu}<span>Menu</span></a>
</nav>`;
}

// ---------- head: meta and JSON-LD ----------

const title = `${r.name} | Italian Restaurant and Aperitivo Bar in ${r.address.city}, ${r.address.state}`;
const description = `${r.cuisine} restaurant and aperitivo bar in ${r.address.city}, ${r.address.state}. ${data.specialty.name}, pasta plates, salads, beer and wine, and ${data.brunch.name}.`;

function jsonLd() {
  const item = (name, desc, price) => ({
    '@type': 'MenuItem', name, ...(desc ? { description: desc } : {}),
    offers: { '@type': 'Offer', price: String(price), priceCurrency: 'USD' },
  });
  const p = data.primi;
  const sauceNames = p.sauces.options.map((o) => o.name);
  const sauceText = `${p.note} ${p.sauces.title}: ${sauceNames.slice(0, -1).join(', ')} or ${sauceNames.slice(-1)}.`;
  const sections = [
    { '@type': 'MenuSection', name: data.specialty.eyebrow, hasMenuItem: [item(data.specialty.name, data.specialty.description, data.specialty.price)] },
    { '@type': 'MenuSection', name: `${p.italian} / ${p.english}`, description: p.note, hasMenuItem: p.pastas.map((n) => item(n, sauceText, p.price)) },
    ...data.sections.map((s) => ({ '@type': 'MenuSection', name: `${s.italian} / ${s.english}`, hasMenuItem: s.items.map((it) => item(it.name, it.description, it.price)) })),
    { '@type': 'MenuSection', name: 'La Domenica / Sunday', hasMenuItem: [item(data.brunch.name, `${data.brunch.description} ${data.brunch.note}`, data.brunch.price)] },
    { '@type': 'MenuSection', name: `${data.beer.italian} / ${data.beer.english}`, hasMenuItem: data.beer.groups.flatMap((g) => g.items.map((n) => item(n, g.name, g.price))) },
    // The printed menu lists the two prices and then the varietals with their producers; it never
    // says which producer pours at which price, so the varietals describe the section, not a tier.
    { '@type': 'MenuSection', name: `${data.wine.italian} / ${data.wine.english}`, description: data.wine.varietals.map((v) => `${v.name} (${v.producers.join(', ')})`).join('; '), hasMenuItem: data.wine.tiers.map((t) => item(t.name, '', t.price)) },
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    url: SITE_URL,
    image: OG_IMAGE,
    telephone: r.phoneTel,
    email: r.email,
    servesCuisine: r.cuisine,
    priceRange: r.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address.street,
      addressLocality: r.address.city,
      addressRegion: r.address.stateCode,
      postalCode: r.address.zip,
      addressCountry: r.address.country,
    },
    openingHoursSpecification: r.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
    hasMenu: { '@type': 'Menu', name: `${r.name} Menu`, url: SITE_URL + '#menu', hasMenuSection: sections },
  };
  return JSON.stringify(ld, null, 2).replace(/</g, '\\u003c');
}

function headMeta() {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${attr(description)}">`,
    `<link rel="canonical" href="${SITE_URL}">`,
    `<meta name="theme-color" content="#16533A">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${attr(r.name)}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(description)}">`,
    `<meta property="og:url" content="${SITE_URL}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${attr(r.name)} wordmark with an olive sprig on ivory paper, with the tagline ${attr(r.tagline)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${attr(title)}">`,
    `<meta name="twitter:description" content="${attr(description)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
  ].join('\n  ');
}

// ---------- render ----------

function render(template, map) {
  return template.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in map)) throw new Error(`No value for placeholder {{${key}}}`);
    return map[key];
  });
}

const tpl = readFileSync(join(here, 'src', 'template.html'), 'utf8');
const html = render(tpl, {
  head: headMeta(),
  jsonld: jsonLd(),
  header: header(),
  hero: hero(),
  platter: platter(),
  menu: menu(),
  brunch: brunch(),
  cantina: cantina(),
  aperitivo: aperitivo(),
  visit: visit(),
  footer: footer(),
  quickbar: quickbar(),
});

const ogTpl = readFileSync(join(here, 'src', 'og.html'), 'utf8');
const ogHtml = render(ogTpl, {
  lockup: lockup({ cls: 'lockup--og' }),
  tagline: esc(r.tagline),
  address: `${esc(r.address.street)}, ${esc(r.address.city)}, ${esc(r.address.state)} ${esc(r.address.zip)}`,
  phone: esc(r.phoneDisplay),
  tricolor: tricolor(),
});

const iconTpl = readFileSync(join(here, 'src', 'icon.html'), 'utf8');
const iconHtml = render(iconTpl, { icon: faviconSvg().trim() });

// ---------- self checks: the build refuses to write a page that breaks the brief ----------

function check(page) {
  const problems = [];
  const decode = (s) => s
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const around = (text, index, len) => text.slice(Math.max(0, index - 28), index + len + 28).replace(/\s+/g, ' ').trim();
  const dashScan = (text, where) => {
    const tests = [
      [/[‒–—―]/g, 'em or en dash'],
      [/\S+-\S+/g, 'hyphenated word'],
      [/\s-\s/g, 'spaced hyphen'],
    ];
    for (const [re, label] of tests) {
      for (const m of text.matchAll(re)) problems.push(`${label} in ${where}: "${around(text, m.index, m[0].length)}"`);
    }
  };

  // 1. Visible text, with scripts and styles removed and entities decoded.
  const visible = decode(page.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
  dashScan(visible, 'visible text');

  // 2. The attributes people and assistive tech read. URLs and the viewport meta are skipped:
  //    hyphens inside URLs, file names, CSS classes and attribute names are fine.
  for (const m of page.matchAll(/\s(?:alt|title|aria-label|content)="([^"]*)"/g)) {
    const value = decode(m[1]);
    if (/^https?:\/\//.test(value) || value.includes('device-width')) continue;
    dashScan(value, 'an attribute');
  }

  // 3. Every string inside the JSON-LD.
  const ldMatch = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ldMatch) problems.push('no JSON-LD block found');
  else {
    const walk = (v) => {
      if (typeof v === 'string') { if (!/^https?:\/\//.test(v)) dashScan(v, 'the JSON-LD'); }
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    try { walk(JSON.parse(ldMatch[1])); } catch (e) { problems.push(`JSON-LD does not parse: ${e.message}`); }
  }

  // 4. Structure and URLs.
  const h1s = (page.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`expected exactly one h1, found ${h1s}`);
  for (const m of page.matchAll(/\s(?:href|src|content)="\/[^"]*"/g)) problems.push(`root relative URL: ${m[0].trim()}`);
  if (description.length > 160) problems.push(`meta description is ${description.length} characters; it must be 160 or fewer`);
  const left = page.match(/\{\{\w+\}\}/g);
  if (left) problems.push(`unfilled placeholders: ${left.join(', ')}`);
  return problems;
}

const problems = check(html);
if (problems.length) {
  console.error('BUILD FAILED. Nothing was written. Fix these and run node build.mjs again:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

writeFileSync(join(here, 'index.html'), html);
writeFileSync(join(here, 'og.html'), ogHtml);
writeFileSync(join(here, 'icon.html'), iconHtml);
writeFileSync(join(here, 'assets', 'olive-sprig.svg'), sprigFile());
writeFileSync(join(here, 'assets', 'tricolor.svg'), tricolorFile());
writeFileSync(join(here, 'assets', 'favicon.svg'), faviconSvg());

console.log(`Built index.html (${(html.length / 1024).toFixed(1)} KB), og.html and icon.html from ${dataPath}`);
console.log(`Checks passed: one h1, relative URLs only, no dashes in copy, meta description ${description.length} characters`);
