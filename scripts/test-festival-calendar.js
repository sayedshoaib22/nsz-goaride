'use strict';

const fs = require('fs');
const path = require('path');
const engine = require('../js/festival-theme.js');
const { buildCalendar } = require('./lib/festival-seed');
const updater = require('./update-festival-calendar');

const livePath = path.join(__dirname, '..', 'data', 'festivals.json');
const calendar = fs.existsSync(livePath)
  ? JSON.parse(fs.readFileSync(livePath, 'utf8'))
  : buildCalendar();
const cases = [
  ['2026-11-06', null],
  ['2026-11-07', 'diwali'],
  ['2026-11-08', 'diwali'],
  ['2026-11-12', 'diwali'],
  ['2026-11-13', null],
  ['2026-12-25', 'christmas'],
  ['2027-01-01', 'new-year'],
  ['2027-03-10', null],
  ['2027-03-21', 'holika-dahan'],
  ['2027-03-22', 'holi'],
  ['2027-05-17', null],
  ['2027-08-24', null],
  ['2027-08-25', null],
  ['2027-08-15', 'independence-day'],
  ['2026-03-21', 'eid-ul-fitr']
];

let failed = 0;
const festivalById = new Map(calendar.festivals.map((festival) => [festival.id, festival]));
const requiredDates = [
  ['diwali', 2026, '2026-11-08', 'verified'],
  ['govardhan-puja', 2026, '2026-11-10', 'verified'],
  ['bhai-dooj', 2026, '2026-11-11', 'verified'],
  ['chhath-puja', 2026, '2026-11-15', 'verified'],
  ['guru-nanak-jayanti', 2026, '2026-11-24', 'verified'],
  ['christmas', 2026, '2026-12-25', 'verified'],
  ['lohri', 2027, '2027-01-14', 'verified'],
  ['makar-sankranti', 2027, '2027-01-15', 'verified'],
  ['republic-day', 2027, '2027-01-26', 'verified'],
  ['vasant-panchami', 2027, '2027-02-11', 'verified'],
  ['maha-shivratri', 2027, '2027-03-06', 'verified'],
  ['eid-ul-fitr', 2027, '2027-03-10', 'provisional'],
  ['holika-dahan', 2027, '2027-03-21', 'verified'],
  ['holi', 2027, '2027-03-22', 'verified'],
  ['good-friday', 2027, '2027-03-26', 'verified'],
  ['easter', 2027, '2027-03-28', 'verified'],
  ['ugadi-gudi-padwa', 2027, '2027-04-07', 'verified'],
  ['baisakhi', 2027, '2027-04-14', 'verified'],
  ['ram-navami', 2027, '2027-04-15', 'verified'],
  ['mahavir-jayanti', 2027, '2027-04-19', 'verified'],
  ['eid-ul-adha', 2027, '2027-05-17', 'provisional'],
  ['buddha-purnima', 2027, '2027-05-20', 'verified'],
  ['janmashtami', 2027, '2027-08-25', 'provisional'],
  ['dussehra', 2027, '2027-10-09', 'verified'],
  ['diwali', 2027, '2027-10-29', 'verified'],
  ['govardhan-puja', 2027, '2027-10-30', 'verified'],
  ['bhai-dooj', 2027, '2027-10-31', 'verified'],
  ['chhath-puja', 2027, '2027-11-04', 'verified'],
  ['guru-nanak-jayanti', 2027, '2027-11-14', 'verified'],
  ['christmas', 2027, '2027-12-25', 'verified']
];

for (const [iso, expected] of cases) {
  const active = engine.resolveActiveFestival(calendar, iso);
  const actual = active ? active.festival.id : null;
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL ${iso}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`PASS ${iso} -> ${expected || 'normal NSZ theme'}`);
  }
}

for (const [id, year, expectedDate, expectedStatus] of requiredDates) {
  const occurrence = festivalById.get(id)?.occurrences?.[year];
  if (!occurrence || occurrence.date !== expectedDate || occurrence.status !== expectedStatus) {
    failed += 1;
    console.error(`FAIL ${id} ${year}: expected ${expectedDate} (${expectedStatus}), got ${occurrence ? `${occurrence.date} (${occurrence.status})` : 'missing'}`);
  }
}

const drikFindings = updater.parseDrik(
  '<a class="dpEvent"><div class="dpEventInfo"><div class="dpEventName">Lohri</div><div class="dpEventGregDate">January 14, 2027, Thursday</div></div></a>',
  2027
);
if (!drikFindings.some((finding) => finding.id === 'lohri' && finding.date === '2027-01-14')) {
  failed += 1;
  console.error('FAIL Drik date parser did not read Lohri 2027.');
}

const tirthFindings = updater.parseTirth(
  '<script type="application/ld+json">{"@type":"ItemList","name":"Major Hindu festivals 2027","itemListElement":[{"name":"Holi, 22 March 2027"}]}</script>',
  2027
);
if (!tirthFindings.some((finding) => finding.id === 'holi' && finding.date === '2027-03-22')) {
  failed += 1;
  console.error('FAIL Tirth date parser did not read Holi 2027.');
}

const governmentFindings = updater.parseIndiaPost(
  '<tr><td data-column-key="name">Diwali (Deepavali)</td><td data-column-key="date">08-November-2026</td></tr>' +
    '<tr><td data-column-key="name">Mahatma Gandhi&#x27;s Birthday</td><td data-column-key="date">02-October-2026</td></tr>' +
    '<tr><td data-column-key="name">Guru Nanak&#x27;s Birthday</td><td data-column-key="date">24-November-2026</td></tr>',
  2026
);
if (!governmentFindings.some((finding) => finding.id === 'diwali' && finding.date === '2026-11-08')) {
  failed += 1;
  console.error('FAIL India Post date parser did not read Diwali 2026.');
}
if (!governmentFindings.some((finding) => finding.id === 'gandhi-jayanti' && finding.date === '2026-10-02') ||
  !governmentFindings.some((finding) => finding.id === 'guru-nanak-jayanti' && finding.date === '2026-11-24')) {
  failed += 1;
  console.error('FAIL India Post parser did not decode official holiday names.');
}
if (updater.matchFestivalId("Bank's Holiday") !== null) {
  failed += 1;
  console.error('FAIL festival alias matching misclassified a non-festival holiday.');
}
const ambiguousLunarEvent = updater.parseDrik(
  '<a class="dpEvent"><div class="dpEventName">Ramadan</div><div class="dpEventGregDate">March 10, 2027, Wednesday</div></a>',
  2027
);
if (ambiguousLunarEvent.some((finding) => finding.id === 'ramadan')) {
  failed += 1;
  console.error('FAIL an ambiguous Ramadan observance was treated as the start of Ramadan.');
}

const mergeCalendar = {
  festivals: [{
    id: 'eid-ul-fitr',
    moonDependent: true,
    occurrences: {
      2027: { date: '2027-03-10', status: 'verified', moonDependent: true }
    }
  }]
};
const mergeLog = [];
updater.mergeFindings(mergeCalendar, [
  { id: 'eid-ul-fitr', date: '2027-03-11', source: 'drik-panchang' },
  { id: 'eid-ul-fitr', date: '2027-03-11', source: 'drik-panchang' }
], mergeLog);
if (mergeCalendar.festivals[0].occurrences[2027].date !== '2027-03-10' ||
  mergeLog.some((entry) => entry.action === 'updated')) {
  failed += 1;
  console.error('FAIL duplicate findings from one source overwrote a verified moon-sighting date.');
}

const provisionalMergeCalendar = {
  festivals: [{
    id: 'eid-ul-fitr',
    moonDependent: true,
    occurrences: {
      2027: { date: '2027-03-10', status: 'verified', moonDependent: true }
    }
  }]
};
updater.mergeFindings(provisionalMergeCalendar, [
  { id: 'eid-ul-fitr', date: '2027-03-10', source: 'drik-panchang' },
  { id: 'eid-ul-fitr', date: '2027-03-10', source: 'timeanddate' }
], []);
if (provisionalMergeCalendar.festivals[0].occurrences[2027].status !== 'verified') {
  failed += 1;
  console.error('FAIL a verified date was downgraded to provisional.');
}

const moonVerifiedCalendar = {
  festivals: [{
    id: 'eid-ul-fitr',
    moonDependent: true,
    occurrences: {}
  }]
};
updater.mergeFindings(moonVerifiedCalendar, [
  { id: 'eid-ul-fitr', date: '2027-03-10', source: 'drik-panchang', moonDependent: true },
  { id: 'eid-ul-fitr', date: '2027-03-10', source: 'timeanddate', moonDependent: true }
], []);
if (moonVerifiedCalendar.festivals[0].occurrences[2027]?.status !== 'verified') {
  failed += 1;
  console.error('FAIL two independent trusted sources did not verify a lunar date.');
}

const conflictingCalendar = {
  festivals: [{
    id: 'eid-ul-fitr',
    moonDependent: true,
    occurrences: {
      2027: { date: '2027-03-10', status: 'verified', moonDependent: true }
    }
  }]
};
const conflictingLog = [];
updater.mergeFindings(conflictingCalendar, [
  { id: 'eid-ul-fitr', date: '2027-03-11', source: 'drik-panchang' },
  { id: 'eid-ul-fitr', date: '2027-03-11', source: 'timeanddate' },
  { id: 'eid-ul-fitr', date: '2027-03-12', source: 'tirth-panchang' },
  { id: 'eid-ul-fitr', date: '2027-03-12', source: 'timeanddate' }
], conflictingLog);
if (conflictingCalendar.festivals[0].occurrences[2027].date !== '2027-03-10' ||
  !conflictingLog.some((entry) => entry.reason === 'conflicting-source-dates')) {
  failed += 1;
  console.error('FAIL conflicting trusted dates changed a verified occurrence.');
}

if (failed) {
  process.exit(1);
}
console.log('Festival calendar tests passed.');
