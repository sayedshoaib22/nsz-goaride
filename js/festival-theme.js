(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.NSZFestivalEngine = api;
  if (typeof document !== 'undefined') {
    api.autoStart();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const TIMEZONE = 'Asia/Kolkata';
  const LAYER_ID = 'nsz-festival-layer';
  const STYLE_ID = 'nsz-festival-runtime-style';
  const DEFAULT_THEME_COLOR = '#ff6b1a';
  const SCRIPT_BASE = (function () {
    if (typeof document === 'undefined') return '';
    const script = document.currentScript || document.querySelector('script[src*="festival-theme.js"]');
    if (script && script.src) return script.src.replace(/\/js\/festival-theme\.js(?:\?.*)?$/i, '');
    return '';
  })();

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toIsoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseIsoDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }

  function addDays(iso, days) {
    const parts = parseIsoDate(iso);
    if (!parts) return iso;
    const utc = Date.UTC(parts.year, parts.month - 1, parts.day + days);
    const next = new Date(utc);
    return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
  }

  function compareIso(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  function isInInclusiveRange(iso, start, end) {
    return compareIso(iso, start) >= 0 && compareIso(iso, end) <= 0;
  }

  function zonedYmd(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const map = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });
    return `${map.year}-${map.month}-${map.day}`;
  }

  function occurrenceWindow(festival, occurrence) {
    const date = occurrence.date;
    const start = occurrence.start || addDays(date, -(festival.leadDays || 0));
    const end = occurrence.end || addDays(date, festival.trailDays || 0);
    return { start, end };
  }

  function resolveActiveFestival(calendar, isoDate) {
    if (!calendar || !Array.isArray(calendar.festivals)) return null;
    const matches = [];
    calendar.festivals.forEach((festival) => {
      if (!festival || festival.enabled === false) return;
      const occurrences = festival.occurrences || {};
      Object.keys(occurrences).forEach((year) => {
        const occurrence = occurrences[year];
        if (!occurrence || !occurrence.date || occurrence.status !== 'verified') return;
        const window = occurrenceWindow(festival, occurrence);
        if (!isInInclusiveRange(isoDate, window.start, window.end)) return;
        matches.push({
          festival,
          occurrence,
          year,
          window,
          priority: Number(festival.priority) || 0
        });
      });
    });
    if (!matches.length) return null;
    matches.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return compareIso(b.occurrence.date, a.occurrence.date);
    });
    return matches[0];
  }

  function resolveTheme(calendar, active) {
    if (!active) return null;
    const themes = calendar.themes || {};
    return themes[active.festival.theme] || themes.festive || null;
  }

  function calendarUrls() {
    const base = SCRIPT_BASE;
    const urls = [];
    if (base) urls.push(`${base}/data/festivals.json`);
    urls.push('data/festivals.json', '../data/festivals.json', '/data/festivals.json');
    return urls;
  }

  async function loadCalendar() {
    let lastError = null;
    for (const url of calendarUrls()) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) continue;
        const data = await response.json();
        if (data && Array.isArray(data.festivals)) return data;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) console.warn('NSZ festival calendar fetch failed', lastError);
    return null;
  }

  function ensureLayer() {
    let layer = document.getElementById(LAYER_ID);
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function clearTheme(body) {
    if (!body) return;
    Array.from(body.classList).forEach((name) => {
      if (name === 'festival-theme' || name.startsWith('festival-theme--')) {
        body.classList.remove(name);
      }
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', meta.getAttribute('data-nsz-original-theme-color') || DEFAULT_THEME_COLOR);
    const layer = document.getElementById(LAYER_ID);
    if (layer) layer.replaceChildren();
    document.getElementById(STYLE_ID)?.remove();
  }

  function applyThemeColors(theme) {
    const colors = theme.colors || {};
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (!meta.getAttribute('data-nsz-original-theme-color')) {
        meta.setAttribute('data-nsz-original-theme-color', meta.getAttribute('content') || DEFAULT_THEME_COLOR);
      }
      meta.setAttribute('content', colors.orange || DEFAULT_THEME_COLOR);
    }
  }

  function buildDecorations(themeId) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = window.innerWidth < 720 ? 8 : 14;
    const bits = [];
    bits.push(`<div class="nsz-festival-badge"><span>${escapeHtml(themeId.replace(/-/g, ' '))}</span></div>`);

    if (themeId === 'diwali') {
      bits.push('<div class="nsz-lights nsz-lights--top"></div>');
      bits.push('<div class="nsz-diya-row">');
      for (let i = 0; i < Math.min(count, 10); i += 1) bits.push('<span class="nsz-diya"></span>');
      bits.push('</div>');
    } else if (themeId === 'christmas') {
      bits.push('<div class="nsz-garland"></div>');
      if (!reduced) {
        bits.push('<div class="nsz-snow">');
        for (let i = 0; i < count; i += 1) {
          bits.push(`<span class="nsz-flake" style="left:${(i * 7.1) % 100}%;animation-delay:${(i % 7) * 0.35}s"></span>`);
        }
        bits.push('</div>');
      }
    } else if (themeId === 'holi') {
      bits.push('<div class="nsz-holi-wash"></div>');
      bits.push('<span class="nsz-gulal nsz-gulal--a"></span><span class="nsz-gulal nsz-gulal--b"></span><span class="nsz-gulal nsz-gulal--c"></span>');
    } else if (themeId === 'eid') {
      bits.push('<div class="nsz-crescent"></div>');
      bits.push('<div class="nsz-lanterns"><span></span><span></span><span></span></div>');
    } else if (themeId === 'independence') {
      bits.push('<div class="nsz-tricolor"></div>');
    } else if (themeId === 'ganesh') {
      bits.push('<div class="nsz-marigold"></div>');
    } else if (themeId === 'navratri') {
      bits.push('<div class="nsz-navratri-ribbon"></div>');
    } else if (themeId === 'newyear') {
      bits.push('<div class="nsz-sparks">');
      for (let i = 0; i < 9; i += 1) bits.push('<span></span>');
      bits.push('</div>');
    } else {
      bits.push('<div class="nsz-lights nsz-lights--soft"></div>');
    }
    return bits.join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyActive(calendar, now) {
    const body = document.body;
    if (!body) return null;
    if (document.documentElement.hasAttribute('data-nsz-festival-off')) {
      clearTheme(body);
      return null;
    }
    const isoDate = zonedYmd(now, calendar.timezone || TIMEZONE);
    const active = resolveActiveFestival(calendar, isoDate);
    if (!active) {
      clearTheme(body);
      body.removeAttribute('data-festival');
      body.removeAttribute('data-festival-name');
      return null;
    }
    const theme = resolveTheme(calendar, active);
    const themeId = (theme && theme.id) || active.festival.theme || 'festive';
    Array.from(body.classList).forEach((name) => {
      if (name === 'festival-theme' || name.startsWith('festival-theme--')) body.classList.remove(name);
    });
    body.classList.add('festival-theme', `festival-theme--${themeId}`);
    body.setAttribute('data-festival', active.festival.id);
    body.setAttribute('data-festival-name', active.festival.name);
    if (theme) applyThemeColors(theme);
    const layer = ensureLayer();
    layer.innerHTML = buildDecorations(themeId);
    const badge = layer.querySelector('.nsz-festival-badge span');
    if (badge) badge.textContent = active.festival.name;
    return { isoDate, active, theme };
  }

  function msUntilNextIstMidnight(now) {
    const iso = zonedYmd(now, TIMEZONE);
    const next = addDays(iso, 1);
    const nextParts = parseIsoDate(next);
    const target = Date.parse(`${nextParts.year}-${pad(nextParts.month)}-${pad(nextParts.day)}T00:00:05+05:30`);
    return Math.max(15000, target - now.getTime());
  }

  async function start() {
    if (typeof document === 'undefined') return;
    const calendar = await loadCalendar();
    if (!calendar) return;
    const run = () => applyActive(calendar, new Date());
    const boot = () => {
      run();
      window.setTimeout(() => {
        run();
        window.setTimeout(boot, msUntilNextIstMidnight(new Date()));
      }, msUntilNextIstMidnight(new Date()));
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }
  }

  function autoStart() {
    if (typeof document === 'undefined') return;
    start();
  }

  return {
    TIMEZONE,
    toIsoDate,
    addDays,
    zonedYmd,
    occurrenceWindow,
    resolveActiveFestival,
    resolveTheme,
    applyActive,
    start,
    autoStart
  };
});
