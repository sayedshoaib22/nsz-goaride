'use strict';

const fs = require('fs');
const path = require('path');
const { buildCalendar } = require('./lib/festival-seed');

const rootDir = path.resolve(__dirname, '..');
const calendarPath = path.join(rootDir, 'data', 'festivals.json');
const logPath = path.join(rootDir, 'data', 'festival-sync-log.json');
const TIMEZONE = 'Asia/Kolkata';

const ALIASES = [
  { id: 'new-year', names: ['english new year', "new year's day", 'new year day'] },
  { id: 'lohri', names: ['lohri'] },
  { id: 'makar-sankranti', names: ['makara sankranti', 'makar sankranti', 'pongal', 'thai pongal'] },
  { id: 'republic-day', names: ['republic day'] },
  { id: 'vasant-panchami', names: ['vasant panchami', 'basant panchami', 'sri panchami'] },
  { id: 'valentines-day', names: ["valentine's day", 'valentines day'] },
  { id: 'maha-shivratri', names: ['maha shivaratri', 'maha shivratri'] },
  { id: 'ramadan', names: ['ramadan start', 'ramadan', 'first day of ramadan'] },
  { id: 'holika-dahan', names: ['holika dahan', 'holika dahana', 'chhoti holi'] },
  { id: 'holi', names: ['holi', 'rangwali holi'] },
  { id: 'ugadi-gudi-padwa', names: ['ugadi', 'gudi padwa', 'gudi padava', 'chaitra sukladi'] },
  { id: 'eid-ul-fitr', names: ['eid-ul-fitr', 'id-ul-fitr', 'ramzan eid', 'ramzan id', 'eid al-fitr'] },
  { id: 'good-friday', names: ['good friday'] },
  { id: 'easter', names: ['easter', 'easter day', 'easter sunday'] },
  { id: 'ram-navami', names: ['rama navami', 'ram navami'] },
  { id: 'mahavir-jayanti', names: ['mahavir jayanti'] },
  { id: 'baisakhi', names: ['baisakhi', 'vaisakhi'] },
  { id: 'buddha-purnima', names: ['buddha purnima', 'vesak'] },
  { id: 'eid-ul-adha', names: ['eid-ul-adha', 'id-ul-zuha', 'bakrid', 'bakrid (eid-ul-adha)'] },
  { id: 'muharram', names: ['muharram', 'ashura'] },
  { id: 'rath-yatra', names: ['rath yatra', 'rathayatra'] },
  { id: 'guru-purnima', names: ['guru purnima'] },
  { id: 'independence-day', names: ['independence day'] },
  { id: 'milad-un-nabi', names: ['milad un-nabi', 'milad-un-nabi', 'id-e-milad', "prophet mohammad's birthday"] },
  { id: 'onam', names: ['onam', 'thiru onam'] },
  { id: 'raksha-bandhan', names: ['raksha bandhan', 'rakhi'] },
  { id: 'janmashtami', names: ['janmashtami', 'krishna janmashtami'] },
  { id: 'ganesh-chaturthi', names: ['ganesh chaturthi', 'vinayaka chaturthi'] },
  { id: 'gandhi-jayanti', names: ['mahatma gandhi jayanti', "mahatma gandhi's birthday", 'gandhi jayanti'] },
  { id: 'navratri', names: ['navratri begins', 'sharad navratri', 'first day of sharad navratri'] },
  { id: 'durga-puja', names: ['durga puja', 'first day of durga puja festivities', 'maha saptami'] },
  { id: 'dussehra', names: ['dussehra', 'vijayadashami', 'vijaya dashami'] },
  { id: 'karwa-chauth', names: ['karwa chauth', 'karva chauth', 'karaka chaturthi'] },
  { id: 'dhanteras', names: ['dhanteras', 'dhanatrayodashi'] },
  { id: 'diwali', names: ['diwali', 'deepavali', 'lakshmi puja'] },
  { id: 'govardhan-puja', names: ['govardhan puja', 'annakut'] },
  { id: 'bhai-dooj', names: ['bhaiya dooj', 'bhai dooj', 'bhai duj'] },
  { id: 'chhath-puja', names: ['chhath puja', 'chhat puja'] },
  { id: 'guru-nanak-jayanti', names: ['guru nanak jayanti', "guru nanak's birthday"] },
  { id: 'christmas', names: ['christmas', 'christmas day'] }
];

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function iso(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function nowStamp() {
  return new Date().toISOString();
}

function istDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function westernEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[*]/g, '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchFestivalId(name) {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  const paddedName = ` ${normalized} `;
  for (const alias of ALIASES) {
    for (const candidate of alias.names) {
      const normalizedCandidate = normalizeName(candidate);
      if (paddedName.includes(` ${normalizedCandidate} `)) return alias.id;
    }
  }
  return null;
}

function htmlText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ');
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'NSZGoaRideFestivalSync/1.0' },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return response.text();
}

function parseIndiaPost(html, year) {
  const found = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  const nameRegex = /<td\b[^>]*data-column-key="name"[^>]*>([\s\S]*?)<\/td>/i;
  const dateRegex = /<td\b[^>]*data-column-key="date"[^>]*>([\s\S]*?)<\/td>/i;
  const calendarDateRegex = /(\d{1,2})[-\s]+(January|February|March|April|May|June|July|August|September|October|November|December)[-\s]+(\d{4})/i;
  let match;
  while ((match = rowRegex.exec(html))) {
    const nameMatch = nameRegex.exec(match[1]);
    const dateMatch = dateRegex.exec(match[1]);
    const parsedDate = dateMatch && calendarDateRegex.exec(htmlText(dateMatch[1]));
    if (!nameMatch || !parsedDate) continue;
    const parsedYear = Number(parsedDate[3]);
    if (parsedYear !== year) continue;
    const name = htmlText(nameMatch[1]);
    const id = matchFestivalId(name);
    if (!id) continue;
    found.push({
      id,
      date: iso(parsedYear, MONTHS[parsedDate[2].toLowerCase()], Number(parsedDate[1])),
      source: 'india-post-goi',
      sourceUrl: 'https://www.indiapost.gov.in/holidays-list'
    });
  }
  return found;
}

function parseDrik(html, year) {
  const found = [];
  const entryRegex = /<a\b[^>]*class="[^"]*\bdpEvent\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  const nameRegex = /<div\b[^>]*class="[^"]*\bdpEventName\b[^"]*"[^>]*>([^<]+)<\/div>/i;
  const dateRegex = /<div\b[^>]*class="[^"]*\bdpEventGregDate\b[^"]*"[^>]*>([^<]+)<\/div>/i;
  const calendarDateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/i;
  let match;
  while ((match = entryRegex.exec(html))) {
    const nameMatch = nameRegex.exec(match[1]);
    const dateMatch = dateRegex.exec(match[1]);
    const parsedDate = dateMatch && calendarDateRegex.exec(htmlText(dateMatch[1]));
    if (!nameMatch || !parsedDate) continue;
    const parsedYear = Number(parsedDate[3]);
    if (parsedYear !== year) continue;
    const name = htmlText(nameMatch[1]);
    if (/^ramadan$/i.test(name)) continue;
    const id = matchFestivalId(name);
    if (!id) continue;
    found.push({
      id,
      date: iso(parsedYear, MONTHS[parsedDate[1].toLowerCase()], Number(parsedDate[2])),
      source: 'drik-panchang',
      sourceUrl: `https://www.drikpanchang.com/calendars/indian/indiancalendar.html?year=${year}`
    });
  }
  return found;
}

function parseTirth(html, year) {
  const found = [];
  const scripts = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const datePattern = new RegExp(`,?\\s+(\\d{1,2})\\s+(January|February|March|April|May|June|July|August|September|October|November|December)\\s+${year}\\b`, 'i');

  for (const script of scripts) {
    if (!script[1].includes('"ItemList"')) continue;
    const data = JSON.parse(script[1]);
    if (data['@type'] !== 'ItemList' || !String(data.name || '').includes(String(year))) continue;
    for (const item of data.itemListElement || []) {
      const label = String(item.name || '');
      const dateMatch = datePattern.exec(label);
      if (!dateMatch) continue;
      const festivalName = label.slice(0, dateMatch.index).replace(/[,\s]+$/, '');
      const id = matchFestivalId(festivalName);
      if (!id) continue;
      found.push({
        id,
        date: iso(year, MONTHS[dateMatch[2].toLowerCase()], Number(dateMatch[1])),
        source: 'tirth-panchang',
        sourceUrl: `https://www.tirth.com/astro/festivals/${year}`
      });
    }
  }
  return found;
}

function parseTimeanddate(html, year) {
  const found = [];
  const regex = /(\d{4})-(\d{2})-(\d{2})[^<]{0,120}(New Year|Lohri|Makar Sankranti|Pongal|Republic Day|Vasant Panchami|Valentine|Maha Shivaratri|Ramadan|Holika|Holi|Ugadi|Gudi Padwa|Ramzan|Eid|Good Friday|Easter|Rama Navami|Mahavir|Vaisakhi|Buddha Purnima|Bakrid|Muharram|Rath Yatra|Guru Purnima|Independence Day|Milad|Onam|Raksha Bandhan|Janmashtami|Ganesh Chaturthi|Gandhi|Navratri|Durga Puja|Dussehra|Karaka Chaturthi|Karva Chauth|Diwali|Govardhan|Bhai Duj|Chhat Puja|Guru Nanak|Christmas)[^<]{0,80}/gi;
  let match;
  while ((match = regex.exec(html))) {
    const id = matchFestivalId(match[4]);
    if (!id) continue;
    found.push({
      id,
      date: `${match[1]}-${match[2]}-${match[3]}`,
      source: 'timeanddate',
      sourceUrl: `https://www.timeanddate.com/holidays/india/${year}`
    });
  }
  return found;
}

function christianDates(year) {
  const easter = westernEaster(year);
  const easterDate = new Date(Date.UTC(year, easter.month - 1, easter.day));
  const friday = new Date(easterDate);
  friday.setUTCDate(friday.getUTCDate() - 2);
  return [
    {
      id: 'easter',
      date: iso(year, easter.month, easter.day),
      source: 'western-computus',
      sourceUrl: 'https://en.wikipedia.org/wiki/Date_of_Easter'
    },
    {
      id: 'good-friday',
      date: iso(year, friday.getUTCMonth() + 1, friday.getUTCDate()),
      source: 'western-computus',
      sourceUrl: 'https://en.wikipedia.org/wiki/Date_of_Easter'
    }
  ];
}

function nationalFixed(year) {
  return [
    { id: 'republic-day', date: iso(year, 1, 26), source: 'goi-fixed', sourceUrl: 'https://www.india.gov.in/' },
    { id: 'independence-day', date: iso(year, 8, 15), source: 'goi-fixed', sourceUrl: 'https://www.india.gov.in/' },
    { id: 'gandhi-jayanti', date: iso(year, 10, 2), source: 'goi-fixed', sourceUrl: 'https://www.india.gov.in/' },
    { id: 'christmas', date: iso(year, 12, 25), source: 'goi-fixed', sourceUrl: 'https://www.india.gov.in/' },
    { id: 'new-year', date: iso(year, 1, 1), source: 'civil-fixed', sourceUrl: 'https://www.india.gov.in/' },
    { id: 'valentines-day', date: iso(year, 2, 14), source: 'civil-fixed', sourceUrl: 'https://www.timeanddate.com/holidays/india/' }
  ];
}

async function islamicGuess(year) {
  const lookups = [
    { id: 'ramadan', hijri: (hy) => `01-09-${hy}` },
    { id: 'eid-ul-fitr', hijri: (hy) => `01-10-${hy}` },
    { id: 'eid-ul-adha', hijri: (hy) => `10-12-${hy}` },
    { id: 'muharram', hijri: (hy) => `10-01-${hy}` },
    { id: 'milad-un-nabi', hijri: (hy) => `12-03-${hy}` }
  ];
  const hijriYears = [year - 579, year - 578];
  const requests = hijriYears.flatMap((hy) => lookups.map(async (lookup) => {
    try {
      const url = `https://api.aladhan.com/v1/hToG/${lookup.hijri(hy)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`${url} -> ${response.status}`);
      const payload = await response.json();
      const g = payload && payload.data && payload.data.gregorian;
      if (!g || Number(g.year) !== year) return null;
      return {
        id: lookup.id,
        date: iso(Number(g.year), Number(g.month.number), Number(g.day)),
        source: 'aladhan',
        sourceUrl: url,
        moonDependent: true
      };
    } catch (error) {
      return { error: String(error.message || error), source: 'aladhan' };
    }
  }));
  const results = await Promise.all(requests);
  return results.filter(Boolean);
}

const TRUST = {
  'india-post-goi': 90,
  'goi-fixed': 95,
  'drik-panchang': 80,
  'western-computus': 95,
  'civil-fixed': 75,
  timeanddate: 60,
  'tirth-panchang': 60,
  datetimeonline: 45,
  aladhan: 20
};

function isOfficial(source) {
  return ['india-post-goi', 'goi-fixed', 'western-computus'].includes(source);
}

function mergeFindings(calendar, findings, log) {
  const byFestival = new Map(calendar.festivals.map((festival) => [festival.id, festival]));
  const grouped = {};
  findings.forEach((item) => {
    if (!item.id || !isValidIsoDate(item.date) || !TRUST[item.source]) {
      if (item.id || item.date) {
        log.push({
          at: nowStamp(),
          action: 'rejected-finding',
          reason: 'invalid-date-or-untrusted-source',
          finding: item
        });
      }
      return;
    }
    const year = item.date.slice(0, 4);
    const key = `${item.id}:${year}`;
    grouped[key] = grouped[key] || [];
    grouped[key].push(item);
  });

  Object.entries(grouped).forEach(([key, rows]) => {
    const [id, year] = key.split(':');
    const festival = byFestival.get(id);
    if (!festival) return;
    const existing = (festival.occurrences && festival.occurrences[year]) || null;
    const uniqueDates = [...new Set(rows.map((row) => row.date))];
    const official = rows.filter((row) => isOfficial(row.source));
    const officialDates = [...new Set(official.map((row) => row.date))];
    const agreedOfficial = officialDates.length === 1 ? officialDates[0] : null;
    const twoPlusAgree = uniqueDates
      .map((date) => ({
        date,
        sources: [...new Set(rows.filter((row) => row.date === date).map((row) => row.source))]
      }))
      .map((group) => ({
        ...group,
        count: group.sources.filter((source) => TRUST[source] >= 55).length
      }))
      .sort((a, b) => b.count - a.count)[0];
    const moonDependent = Boolean(festival.moonDependent || rows.some((row) => row.moonDependent) || (existing && existing.moonDependent));
    let nextDate = null;
    let nextStatus = 'provisional';

    if (officialDates.length > 1) {
      log.push({
        at: nowStamp(),
        festival: id,
        year,
        action: 'kept-existing',
        reason: 'conflicting-official-dates',
        sources: official.map((row) => ({ source: row.source, date: row.date }))
      });
      return;
    }

    const competingConsensus = twoPlusAgree && twoPlusAgree.count >= 2
      ? uniqueDates.filter((date) => {
        const sources = [...new Set(rows.filter((row) => row.date === date).map((row) => row.source))];
        return sources.filter((source) => TRUST[source] >= 55).length === twoPlusAgree.count;
      })
      : [];
    if (!agreedOfficial && competingConsensus.length > 1) {
      log.push({
        at: nowStamp(),
        festival: id,
        year,
        action: 'kept-existing',
        reason: 'conflicting-source-dates',
        sources: rows.map((row) => ({ source: row.source, date: row.date }))
      });
      return;
    }

    if (agreedOfficial) {
      nextDate = agreedOfficial;
      nextStatus = 'verified';
    } else if (twoPlusAgree && twoPlusAgree.count >= 2 &&
      (!moonDependent || twoPlusAgree.sources.filter((source) => source !== 'aladhan').length >= 2)) {
      nextDate = twoPlusAgree.date;
      nextStatus = 'verified';
    } else if (!existing && twoPlusAgree) {
      nextDate = twoPlusAgree.date;
      nextStatus = 'provisional';
    }

    if (!nextDate) {
      log.push({ at: nowStamp(), festival: id, year, action: 'kept-existing', reason: 'no-consensus', sources: rows });
      return;
    }

    if (existing && existing.status === 'verified' && existing.date !== nextDate) {
      const incomingOfficial = Boolean(agreedOfficial && nextDate === agreedOfficial);
      if (!incomingOfficial) {
        log.push({
          at: nowStamp(),
          festival: id,
          year,
          action: 'blocked-overwrite',
          reason: 'verified-date-protected',
          existing: existing.date,
          incoming: nextDate,
          sources: rows.map((row) => row.source)
        });
        existing.lastCheckedAt = istDate();
        return;
      }
    }
    if (existing && existing.status === 'verified' &&
      existing.date === nextDate && nextStatus !== 'verified') {
      existing.lastCheckedAt = istDate();
      log.push({
        at: nowStamp(),
        festival: id,
        year,
        action: 'kept-existing',
        reason: 'verified-status-protected',
        date: existing.date,
        sources: rows.map((row) => row.source)
      });
      return;
    }

    festival.occurrences = festival.occurrences || {};
    const previous = festival.occurrences[year] || {};
    festival.occurrences[year] = {
      date: nextDate,
      start: previous.start,
      end: previous.end,
      status: nextStatus,
      moonDependent,
      sources: rows.map((row) => ({
        name: row.source,
        url: row.sourceUrl,
        retrievedAt: istDate()
      })),
      verifiedAt: nextStatus === 'verified' ? istDate() : previous.verifiedAt || null,
      lastCheckedAt: istDate(),
      notes: previous.notes || (moonDependent ? 'Moon-sighting dependent date. Keep the last verified or gazetted value until a stronger source agrees.' : '')
    };
    log.push({
      at: nowStamp(),
      festival: id,
      year,
      action: existing ? 'updated' : 'added',
      date: nextDate,
      status: nextStatus
    });
  });
}

async function collect(year) {
  const findings = [...nationalFixed(year), ...christianDates(year)];
  const jobs = [
    fetchText(`https://www.drikpanchang.com/calendars/indian/indiancalendar.html?year=${year}`)
      .then((html) => parseDrik(html, year))
      .catch((error) => [{ error: error.message, source: 'drik-panchang' }]),
    fetchText(`https://www.tirth.com/astro/festivals/${year}`)
      .then((html) => {
        const findings = parseTirth(html, year);
        return findings.length ? findings : [{
          sourceCheck: {
            source: 'tirth-panchang',
            year,
            status: 'no-dated-items-found'
          }
        }];
      })
      .catch((error) => [{ error: error.message, source: 'tirth-panchang' }]),
    fetchText('https://mausam.imd.gov.in/imd_latest/contents/rashtriy_panchang.php')
      .then((html) => [{
        sourceCheck: {
          source: 'imd-rashtriya-panchanga',
          year,
          status: new RegExp(`\\b${year}\\b`).test(html) ? 'year-mentioned' : 'year-calendar-not-listed'
        }
      }])
      .catch((error) => [{ error: error.message, source: 'imd-rashtriya-panchanga' }]),
    fetchText('https://www.indiapost.gov.in/holidays-list')
      .then((html) => parseIndiaPost(html, year))
      .catch((error) => [{ error: error.message, source: 'india-post-goi' }]),
    fetchText(`https://www.timeanddate.com/holidays/india/${year}`)
      .then((html) => parseTimeanddate(html, year))
      .catch((error) => [{ error: error.message, source: 'timeanddate' }]),
    islamicGuess(year).catch((error) => [{ error: error.message, source: 'aladhan' }])
  ];
  const results = await Promise.all(jobs);
  results.forEach((rows) => {
    rows.forEach((row) => {
      if (row && row.id) findings.push(row);
    });
  });
  const errors = results.flat().filter((row) => row && row.error);
  const checks = results.flat().filter((row) => row && row.sourceCheck);
  return {
    findings,
    errors,
    checks,
    failedSources: new Set(errors.map((error) => error.source)).size,
    totalSources: jobs.length
  };
}

async function main() {
  const seedOnly = process.argv.includes('--seed-only');
  const calendar = seedOnly || !fs.existsSync(calendarPath)
    ? buildCalendar()
    : loadJson(calendarPath, buildCalendar());
  const logFile = loadJson(logPath, { entries: [] });
  const runLog = [];

  if (!calendar.festivals || !calendar.festivals.length) {
    Object.assign(calendar, buildCalendar());
  }

  let successfulSources = 0;
  let failedSources = 0;
  if (!seedOnly) {
    const yearNow = Number(new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric' }).format(new Date()));
    for (const year of [yearNow, yearNow + 1]) {
      const collected = await collect(year);
      successfulSources += collected.totalSources - collected.failedSources;
      failedSources += collected.failedSources;
      collected.errors.forEach((error) => runLog.push({ at: nowStamp(), action: 'source-error', ...error }));
      collected.checks.forEach((check) => runLog.push({
        at: nowStamp(),
        action: 'source-check',
        ...check.sourceCheck
      }));
      mergeFindings(calendar, collected.findings, runLog);
    }
  }

  calendar.timezone = TIMEZONE;
  calendar.lastSyncAt = nowStamp();
  calendar.lastSyncStatus = seedOnly
    ? 'seeded'
    : successfulSources === 0
      ? 'failed'
      : failedSources > 0
        ? 'partial'
        : 'synced';
  writeJson(calendarPath, calendar);
  logFile.entries = [...runLog, ...(logFile.entries || [])].slice(0, 500);
  logFile.lastRunAt = nowStamp();
  writeJson(logPath, logFile);
  console.log(`Festival calendar ${calendar.lastSyncStatus} -> ${calendarPath}`);
  if (!seedOnly && successfulSources === 0) {
    throw new Error('All festival date sources failed; the last verified calendar was retained.');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  parseDrik,
  parseTirth,
  parseIndiaPost,
  parseTimeanddate,
  matchFestivalId,
  isValidIsoDate,
  mergeFindings,
  westernEaster
};
