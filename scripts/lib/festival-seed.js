'use strict';

const TIMEZONE = 'Asia/Kolkata';
const VERIFIED_AT = '2026-11-07';

const SRC = {
  drik: {
    name: 'drik-panchang',
    url: 'https://www.drikpanchang.com/calendars/indian/indiancalendar.html'
  },
  drikHindu: {
    name: 'drik-panchang',
    url: 'https://www.drikpanchang.com/calendars/hindu/hinducalendar.html'
  },
  imd: {
    name: 'imd-rashtriya-panchanga',
    url: 'https://mausam.imd.gov.in/imd_latest/contents/rashtriy_panchang.php'
  },
  indiaPost: {
    name: 'india-post-goi',
    url: 'https://www.indiapost.gov.in/holidays-list'
  },
  timeanddate: {
    name: 'timeanddate',
    url: 'https://www.timeanddate.com/holidays/india/2026'
  },
  tirth: {
    name: 'tirth-panchang',
    url: 'https://www.tirth.com/astro/festivals/2027'
  },
  isid: {
    name: 'isid-delhi-holiday-list',
    url: 'https://www.isid.ac.in/holiday2026.html'
  },
  datetimeonline: {
    name: 'datetimeonline',
    url: 'https://www.datetimeonline.com/holidays/india/2027'
  },
  tirth: {
    name: 'tirth-panchang',
    url: 'https://www.tirth.com/astro/festivals/2027'
  },
  computus: {
    name: 'western-computus',
    url: 'https://en.wikipedia.org/wiki/Date_of_Easter'
  },
};

function occ(date, status, sources, extra) {
  const item = {
    date,
    status,
    moonDependent: false,
    sources: sources.map((source) => ({
      name: source.name,
      url: source.url,
      retrievedAt: VERIFIED_AT
    })),
    verifiedAt: status === 'verified' ? VERIFIED_AT : null,
    lastCheckedAt: VERIFIED_AT,
    notes: ''
  };
  return Object.assign(item, extra || {});
}

const themes = {
  diwali: {
    id: 'diwali',
    label: 'Diwali',
    colors: {
      orange: '#e8a317',
      orange2: '#c4890c',
      tan: '#f3d27a',
      rust: '#b45309',
      glow: 'rgba(232, 163, 23, .18)'
    },
    decorations: ['diyas', 'string-lights', 'sparks'],
    animations: ['diya-glow', 'light-twinkle']
  },
  christmas: {
    id: 'christmas',
    label: 'Christmas',
    colors: {
      orange: '#c62f2f',
      orange2: '#9f1e1e',
      tan: '#d4af37',
      rust: '#165b33',
      glow: 'rgba(198, 47, 47, .14)'
    },
    decorations: ['snow', 'baubles', 'garland'],
    animations: ['snowfall']
  },
  holi: {
    id: 'holi',
    label: 'Holi',
    colors: {
      orange: '#ff3d8a',
      orange2: '#ff7a18',
      tan: '#ffe566',
      rust: '#7c4dff',
      glow: 'rgba(255, 61, 138, .16)'
    },
    decorations: ['color-clouds', 'gulal'],
    animations: ['color-drift']
  },
  eid: {
    id: 'eid',
    label: 'Eid',
    colors: {
      orange: '#0e8f6b',
      orange2: '#0b6b51',
      tan: '#d4af37',
      rust: '#14532d',
      glow: 'rgba(14, 143, 107, .16)'
    },
    decorations: ['crescent', 'lanterns'],
    animations: ['lantern-sway']
  },
  independence: {
    id: 'independence',
    label: 'Independence Day',
    colors: {
      orange: '#ff671f',
      orange2: '#046a38',
      tan: '#ffffff',
      rust: '#06038d',
      glow: 'rgba(255, 103, 31, .14)'
    },
    decorations: ['tricolor-bunting', 'ashoka'],
    animations: ['flag-wave']
  },
  ganesh: {
    id: 'ganesh',
    label: 'Ganesh Chaturthi',
    colors: {
      orange: '#e85d04',
      orange2: '#dc2f02',
      tan: '#ffba08',
      rust: '#9d0208',
      glow: 'rgba(232, 93, 4, .16)'
    },
    decorations: ['marigolds', 'modak-lights'],
    animations: ['garland-sway']
  },
  navratri: {
    id: 'navratri',
    label: 'Navratri',
    colors: {
      orange: '#d00000',
      orange2: '#e85d04',
      tan: '#ffba08',
      rust: '#6a040f',
      glow: 'rgba(208, 0, 0, .14)'
    },
    decorations: ['navratri-ribbon', 'dandiya-dots'],
    animations: ['ribbon-shift']
  },
  newyear: {
    id: 'newyear',
    label: 'New Year',
    colors: {
      orange: '#ff6b1a',
      orange2: '#7c3aed',
      tan: '#fbbf24',
      rust: '#1d4ed8',
      glow: 'rgba(124, 58, 237, .16)'
    },
    decorations: ['sparks', 'countdown-glints'],
    animations: ['sparkle']
  },
  festive: {
    id: 'festive',
    label: 'Festive',
    colors: {
      orange: '#ff6b1a',
      orange2: '#e55a0a',
      tan: '#e0b15a',
      rust: '#c94a1a',
      glow: 'rgba(255, 107, 26, .14)'
    },
    decorations: ['soft-lights'],
    animations: ['soft-glow']
  }
};

const festivals = [
  {
    id: 'new-year',
    name: 'New Year',
    theme: 'newyear',
    priority: 88,
    enabled: true,
    leadDays: 1,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-01-01', 'verified', [SRC.timeanddate, SRC.indiaPost]),
      2027: occ('2027-01-01', 'verified', [SRC.drik, SRC.datetimeonline])
    }
  },
  {
    id: 'lohri',
    name: 'Lohri',
    theme: 'festive',
    priority: 55,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-01-13', 'verified', [SRC.timeanddate]),
      2027: occ('2027-01-14', 'verified', [SRC.drik])
    }
  },
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti / Pongal',
    theme: 'festive',
    priority: 62,
    enabled: true,
    leadDays: 0,
    trailDays: 1,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-01-14', 'verified', [SRC.drikHindu, SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-01-15', 'verified', [SRC.drik])
    }
  },
  {
    id: 'republic-day',
    name: 'Republic Day',
    theme: 'independence',
    priority: 80,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-01-26', 'verified', [SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-01-26', 'verified', [SRC.drik])
    }
  },
  {
    id: 'vasant-panchami',
    name: 'Vasant Panchami',
    theme: 'festive',
    priority: 50,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-01-23', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-02-11', 'verified', [SRC.drik])
    }
  },
  {
    id: 'valentines-day',
    name: "Valentine's Day",
    theme: 'holi',
    priority: 40,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-02-14', 'verified', [SRC.timeanddate]),
      2027: occ('2027-02-14', 'verified', [SRC.datetimeonline])
    }
  },
  {
    id: 'maha-shivratri',
    name: 'Maha Shivratri',
    theme: 'festive',
    priority: 70,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-02-15', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-03-06', 'verified', [SRC.drik])
    }
  },
  {
    id: 'ramadan',
    name: 'Ramadan',
    theme: 'eid',
    priority: 35,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: true,
    occurrences: {
      2026: occ('2026-02-19', 'verified', [SRC.timeanddate], {
        moonDependent: true,
        end: '2026-03-20',
        notes: 'Civil start date from Timeanddate; moon sighting can shift the first fast by a day. Theme stays low-priority so Holi and Eid can override.'
      }),
      2027: occ('2027-02-09', 'provisional', [SRC.datetimeonline], {
        moonDependent: true,
        end: '2027-03-09',
        notes: 'Expected start. Moon-sighting dependent; Eid-ul-Fitr 2027 is still provisional.'
      })
    }
  },
  {
    id: 'holika-dahan',
    name: 'Holika Dahan',
    theme: 'holi',
    priority: 84,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-03-03', 'verified', [SRC.timeanddate, SRC.isid]),
      2027: occ('2027-03-21', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'holi',
    name: 'Holi',
    theme: 'holi',
    priority: 90,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-03-04', 'verified', [SRC.drikHindu, SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-03-22', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'ugadi-gudi-padwa',
    name: 'Ugadi / Gudi Padwa',
    theme: 'festive',
    priority: 60,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-03-19', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-04-07', 'verified', [SRC.drik])
    }
  },
  {
    id: 'eid-ul-fitr',
    name: 'Eid-ul-Fitr',
    theme: 'eid',
    priority: 86,
    enabled: true,
    leadDays: 0,
    trailDays: 1,
    moonDependent: true,
    occurrences: {
      2026: occ('2026-03-21', 'verified', [SRC.indiaPost, SRC.isid, SRC.timeanddate], {
        moonDependent: true,
        notes: 'Published on the India Post 2026 gazetted list. Local moon sighting can still move the celebration by a day.'
      }),
      2027: occ('2027-03-10', 'provisional', [SRC.drik], {
        moonDependent: true,
        notes: 'Provisional civil date. Do not treat as final until moon sighting or a gazetted list confirms it.'
      })
    }
  },
  {
    id: 'good-friday',
    name: 'Good Friday',
    theme: 'festive',
    priority: 58,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-04-03', 'verified', [SRC.indiaPost, SRC.computus, SRC.timeanddate]),
      2027: occ('2027-03-26', 'verified', [SRC.drik, SRC.computus])
    }
  },
  {
    id: 'easter',
    name: 'Easter',
    theme: 'festive',
    priority: 58,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-04-05', 'verified', [SRC.computus, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-03-28', 'verified', [SRC.drik, SRC.computus])
    }
  },
  {
    id: 'ram-navami',
    name: 'Ram Navami',
    theme: 'festive',
    priority: 65,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-03-26', 'verified', [SRC.drikHindu, SRC.indiaPost, SRC.timeanddate], {
        notes: 'Smarta date used by Indian civil calendars. ISKCON observance is 27 March 2026.'
      }),
      2027: occ('2027-04-15', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'mahavir-jayanti',
    name: 'Mahavir Jayanti',
    theme: 'festive',
    priority: 60,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-03-31', 'verified', [SRC.indiaPost, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-04-19', 'verified', [SRC.drik], {
        notes: 'Confirm against the 2027 gazetted circular when published.'
      })
    }
  },
  {
    id: 'baisakhi',
    name: 'Baisakhi',
    theme: 'festive',
    priority: 55,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-04-14', 'verified', [SRC.timeanddate, SRC.isid]),
      2027: occ('2027-04-14', 'verified', [SRC.drik])
    }
  },
  {
    id: 'buddha-purnima',
    name: 'Buddha Purnima',
    theme: 'festive',
    priority: 62,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-05-01', 'verified', [SRC.indiaPost, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-05-20', 'verified', [SRC.drik])
    }
  },
  {
    id: 'eid-ul-adha',
    name: 'Eid-ul-Adha',
    theme: 'eid',
    priority: 86,
    enabled: true,
    leadDays: 0,
    trailDays: 1,
    moonDependent: true,
    occurrences: {
      2026: occ('2026-05-27', 'verified', [SRC.indiaPost, SRC.isid], {
        moonDependent: true,
        notes: 'India Post gazetted date is 27 May 2026. Timeanddate lists 28 May; moon sighting can shift the day.'
      }),
      2027: occ('2027-05-17', 'provisional', [SRC.drik], {
        moonDependent: true,
        notes: 'Provisional. Keep 16 May as a possible local moon-sighting date until a gazetted list is issued.'
      })
    }
  },
  {
    id: 'muharram',
    name: 'Muharram',
    theme: 'eid',
    priority: 60,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: true,
    occurrences: {
      2026: occ('2026-06-26', 'verified', [SRC.indiaPost, SRC.timeanddate, SRC.isid], {
        moonDependent: true
      }),
      2027: occ('2027-06-16', 'provisional', [SRC.datetimeonline], {
        moonDependent: true,
        notes: 'Expected Ashura date. Confirm against moon sighting and the 2027 gazetted list.'
      })
    }
  },
  {
    id: 'rath-yatra',
    name: 'Rath Yatra',
    theme: 'festive',
    priority: 55,
    enabled: true,
    leadDays: 0,
    trailDays: 1,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-07-16', 'verified', [SRC.timeanddate, SRC.isid]),
      2027: occ('2027-07-05', 'verified', [SRC.datetimeonline, SRC.tirth])
    }
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima',
    theme: 'festive',
    priority: 50,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-07-29', 'verified', [SRC.timeanddate]),
      2027: occ('2027-07-18', 'verified', [SRC.datetimeonline])
    }
  },
  {
    id: 'independence-day',
    name: 'Independence Day',
    theme: 'independence',
    priority: 82,
    enabled: true,
    leadDays: 1,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-08-15', 'verified', [SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-08-15', 'verified', [SRC.datetimeonline])
    }
  },
  {
    id: 'milad-un-nabi',
    name: 'Milad-un-Nabi',
    theme: 'eid',
    priority: 64,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: true,
    occurrences: {
      2026: occ('2026-08-26', 'verified', [SRC.indiaPost, SRC.timeanddate, SRC.isid], {
        moonDependent: true
      }),
      2027: occ('2027-08-15', 'provisional', [SRC.datetimeonline], {
        moonDependent: true,
        notes: 'Expected 12 Rabi al-Awwal date, overlapping Independence Day. Moon-sighting dependent; Independence Day theme has higher priority.'
      })
    }
  },
  {
    id: 'onam',
    name: 'Onam',
    theme: 'festive',
    priority: 68,
    enabled: true,
    leadDays: 2,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-08-26', 'verified', [SRC.timeanddate, SRC.isid], {
        notes: 'Thiruvonam day.'
      }),
      2027: occ('2027-09-12', 'verified', [SRC.datetimeonline])
    }
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    theme: 'festive',
    priority: 70,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-08-28', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-08-17', 'verified', [SRC.tirth, SRC.datetimeonline])
    }
  },
  {
    id: 'janmashtami',
    name: 'Janmashtami',
    theme: 'festive',
    priority: 72,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-09-04', 'verified', [SRC.indiaPost, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-08-25', 'provisional', [SRC.drik, SRC.tirth], {
        notes: 'Drik lists 25 August while Tirth lists 24 August 2027; keep the fallback but do not publish until the tradition/location-specific date is resolved.'
      })
    }
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    theme: 'ganesh',
    priority: 78,
    enabled: true,
    leadDays: 0,
    trailDays: 4,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-09-14', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-09-04', 'verified', [SRC.tirth, SRC.datetimeonline])
    }
  },
  {
    id: 'gandhi-jayanti',
    name: 'Gandhi Jayanti',
    theme: 'independence',
    priority: 74,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-10-02', 'verified', [SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-10-02', 'verified', [SRC.datetimeonline])
    }
  },
  {
    id: 'navratri',
    name: 'Navratri',
    theme: 'navratri',
    priority: 76,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-10-11', 'verified', [SRC.drik, SRC.timeanddate], {
        end: '2026-10-19',
        notes: 'Sharad Navratri. Dussehra follows on 20 October 2026.'
      }),
      2027: occ('2027-09-30', 'verified', [SRC.tirth, SRC.datetimeonline], {
        end: '2027-10-08'
      })
    }
  },
  {
    id: 'durga-puja',
    name: 'Durga Puja',
    theme: 'navratri',
    priority: 77,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-10-17', 'verified', [SRC.timeanddate], {
        end: '2026-10-20'
      }),
      2027: occ('2027-10-05', 'verified', [SRC.datetimeonline], {
        end: '2027-10-09'
      })
    }
  },
  {
    id: 'dussehra',
    name: 'Dussehra',
    theme: 'navratri',
    priority: 79,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-10-20', 'verified', [SRC.indiaPost, SRC.drik, SRC.timeanddate]),
      2027: occ('2027-10-09', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'karwa-chauth',
    name: 'Karwa Chauth',
    theme: 'festive',
    priority: 58,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-10-29', 'verified', [SRC.drikHindu, SRC.timeanddate, SRC.isid]),
      2027: occ('2027-10-18', 'verified', [SRC.tirth, SRC.datetimeonline])
    }
  },
  {
    id: 'dhanteras',
    name: 'Dhanteras',
    theme: 'diwali',
    priority: 88,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-06', 'verified', [SRC.drikHindu, SRC.timeanddate], {
        start: '2026-11-07',
        end: '2026-11-12'
      }),
      2027: occ('2027-10-27', 'verified', [SRC.tirth])
    }
  },
  {
    id: 'diwali',
    name: 'Diwali',
    theme: 'diwali',
    priority: 100,
    enabled: true,
    leadDays: 1,
    trailDays: 4,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-08', 'verified', [SRC.drik, SRC.indiaPost], {
        start: '2026-11-07',
        end: '2026-11-12',
        notes: 'Lakshmi Puja on 8 November 2026. Site theme window is 7–12 November 2026 IST; normal NSZ theme resumes on 13 November 2026.'
      }),
      2027: occ('2027-10-29', 'verified', [SRC.drik, SRC.tirth], {
        start: '2027-10-28',
        end: '2027-11-02'
      })
    }
  },
  {
    id: 'govardhan-puja',
    name: 'Govardhan Puja',
    theme: 'diwali',
    priority: 92,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-10', 'verified', [SRC.drik], {
        notes: 'Drik Panchang lists 10 November 2026. Some civil calendars list 9 November; the verified panchang date is retained.'
      }),
      2027: occ('2027-10-30', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'bhai-dooj',
    name: 'Bhai Dooj',
    theme: 'diwali',
    priority: 91,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-11', 'verified', [SRC.drik, SRC.timeanddate]),
      2027: occ('2027-10-31', 'verified', [SRC.drik])
    }
  },
  {
    id: 'chhath-puja',
    name: 'Chhath Puja',
    theme: 'festive',
    priority: 70,
    enabled: true,
    leadDays: 1,
    trailDays: 1,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-15', 'verified', [SRC.drikHindu, SRC.timeanddate], {
        notes: 'Main evening arghya on 15 November 2026. Theme window starts 14 November so the Diwali special can restore the NSZ theme on 13 November.'
      }),
      2027: occ('2027-11-04', 'verified', [SRC.drik, SRC.tirth])
    }
  },
  {
    id: 'guru-nanak-jayanti',
    name: 'Guru Nanak Jayanti',
    theme: 'festive',
    priority: 72,
    enabled: true,
    leadDays: 0,
    trailDays: 0,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-11-24', 'verified', [SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-11-14', 'verified', [SRC.drik])
    }
  },
  {
    id: 'christmas',
    name: 'Christmas',
    theme: 'christmas',
    priority: 90,
    enabled: true,
    leadDays: 2,
    trailDays: 1,
    moonDependent: false,
    occurrences: {
      2026: occ('2026-12-25', 'verified', [SRC.indiaPost, SRC.timeanddate]),
      2027: occ('2027-12-25', 'verified', [SRC.drik])
    }
  }
];

function buildCalendar() {
  return {
    version: 1,
    timezone: TIMEZONE,
    generatedAt: `${VERIFIED_AT}T00:00:00+05:30`,
    lastSyncAt: `${VERIFIED_AT}T00:00:00+05:30`,
    lastSyncStatus: 'seeded',
    policy: {
      neverOverwriteVerifiedWithUnreliable: true,
      moonSightingRequiresGazettedOrTwoTrustedSources: true,
      fallbackToLastVerified: true
    },
    sources: [
      { id: 'drik-panchang', name: 'Drik Panchang Indian Calendar', url: SRC.drik.url, trust: 'high' },
      { id: SRC.imd.name, name: 'IMD Rashtriya Panchanga', url: SRC.imd.url, trust: 'high' },
      { id: 'india-post-goi', name: 'Government of India / India Post holiday list', url: SRC.indiaPost.url, trust: 'official' },
      { id: 'timeanddate', name: 'Timeanddate India holidays', url: 'https://www.timeanddate.com/holidays/india/', trust: 'medium' },
      { id: SRC.tirth.name, name: 'Tirth Hindu festival calendar', url: SRC.tirth.url, trust: 'medium' },
      { id: 'aladhan', name: 'Aladhan Islamic calendar', url: 'https://aladhan.com/islamic-calendar-api', trust: 'medium-moon' },
      { id: 'western-computus', name: 'Western Easter computus', url: SRC.computus.url, trust: 'official-christian' }
    ],
    themes,
    festivals
  };
}

module.exports = { TIMEZONE, VERIFIED_AT, SRC, buildCalendar, themes };
