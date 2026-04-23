import { Session, weekSessions } from './mock';

export interface AdPlacement {
  advertiser: string;
  brand: string;
  position: '60s pre-show' | '30s pre-show';
  duration: '15s' | '30s' | '45s' | '60s';
  status: 'Live' | 'Scheduled' | 'Pending';
}

const ADVERTISERS: { advertiser: string; brand: string }[] = [
  { advertiser: 'Emirates Airlines', brand: 'Emirates' },
  { advertiser: 'Etihad Airways', brand: 'Etihad' },
  { advertiser: 'Lulu Hypermarket', brand: 'Lulu' },
  { advertiser: 'Carrefour UAE', brand: 'Carrefour' },
  { advertiser: 'Noon.com', brand: 'Noon' },
  { advertiser: 'Samsung Gulf', brand: 'Samsung' },
  { advertiser: 'Apple UAE', brand: 'Apple' },
  { advertiser: 'Coca-Cola MENA', brand: 'Coca-Cola' },
  { advertiser: 'Pepsi Middle East', brand: 'Pepsi' },
  { advertiser: 'Chalhoub Group', brand: 'Level Shoes' },
  { advertiser: 'Majid Al Futtaim', brand: 'Mall of the Emirates' },
  { advertiser: 'Damac Properties', brand: 'DAMAC' },
  { advertiser: 'Emaar Properties', brand: 'Emaar' },
  { advertiser: 'Dubai Tourism', brand: 'Visit Dubai' },
  { advertiser: 'Etisalat by e&', brand: 'Etisalat' },
  { advertiser: 'du Telecom', brand: 'du' }
];

const STATUSES: AdPlacement['status'][] = ['Live', 'Scheduled', 'Pending'];
const DURATIONS: AdPlacement['duration'][] = ['15s', '30s', '45s', '60s'];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function adsForSession(s: Session): AdPlacement[] {
  const booked = s.preShow60.booked + s.preShow30.booked;
  if (booked === 0) return [];
  const seed = hash(s.id);
  const ads: AdPlacement[] = [];
  for (let i = 0; i < Math.min(booked, 6); i++) {
    const a = ADVERTISERS[(seed + i * 7) % ADVERTISERS.length];
    const inSixty = i < s.preShow60.booked;
    ads.push({
      advertiser: a.advertiser,
      brand: a.brand,
      position: inSixty ? '60s pre-show' : '30s pre-show',
      duration: DURATIONS[(seed + i * 3) % DURATIONS.length],
      status: STATUSES[(seed + i) % STATUSES.length]
    });
  }
  return ads;
}

export interface DayAdSummary {
  total: number;
  top: { advertiser: string; brand: string; count: number }[];
  sessions: number;
}

export function adsForDay(date: Date): DayAdSummary {
  // Deterministic daily sample built from weekSessions
  const seed = date.getFullYear() * 1000 + date.getMonth() * 40 + date.getDate();
  const sampleSize = (seed % 10) + 6; // 6..15 sessions represented
  const sessions = weekSessions.slice(0, sampleSize);
  const counts = new Map<string, { advertiser: string; brand: string; count: number }>();
  let total = 0;
  sessions.forEach((s, idx) => {
    const ads = adsForSession(s);
    ads.forEach((a, i) => {
      if ((i + idx + seed) % 2 !== 0) return;
      total += 1;
      const key = a.brand;
      const prev = counts.get(key);
      if (prev) prev.count += 1;
      else counts.set(key, { advertiser: a.advertiser, brand: a.brand, count: 1 });
    });
  });
  const top = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return { total, top, sessions: sessions.length };
}
