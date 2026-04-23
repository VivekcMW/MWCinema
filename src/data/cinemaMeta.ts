/**
 * Extended cinema metadata for BDD acceptance scenarios:
 * hierarchical location, cinema type, audience packages,
 * programmatic eligibility and feed-status model.
 *
 * Keeps the existing mock.ts untouched — this is additive.
 */

import { cinemas, films, weekSessions } from './mock';

/* ------------------------------------------------------------------ */
/* Location hierarchy: Country → Emirate → City → Zone → Theater       */
/* ------------------------------------------------------------------ */

export type Zone = 'City Center' | 'Suburb' | 'Small Town';
export type CinemaType =
  | 'Standard'
  | 'Premium'
  | 'Luxury'
  | 'Ultra-Luxury'
  | 'IMAX'
  | '4DX'
  | 'Bean Bag';

export interface TheaterMeta {
  code: string;          // matches cinemas[].code
  country: 'United Arab Emirates';
  emirate: string;       // Dubai / Abu Dhabi / Sharjah / Al Ain …
  city: string;
  zone: Zone;
  types: CinemaType[];   // formats/categories supported
  programmatic: boolean;
}

/**
 * Enriched theater metadata. Codes match the existing `cinemas` array,
 * plus a handful of synthetic entries to demonstrate "small town" / zone
 * targeting even though the base mock only had 4 cinemas.
 */
export const theaterMeta: TheaterMeta[] = [
  {
    code: '0037',
    country: 'United Arab Emirates',
    emirate: 'Abu Dhabi',
    city: 'Al Ain',
    zone: 'Suburb',
    types: ['Standard', 'Premium'],
    programmatic: true
  },
  {
    code: '0041',
    country: 'United Arab Emirates',
    emirate: 'Dubai',
    city: 'Dubai',
    zone: 'City Center',
    types: ['Standard', 'Luxury', 'IMAX', '4DX'],
    programmatic: true
  },
  {
    code: '0029',
    country: 'United Arab Emirates',
    emirate: 'Dubai',
    city: 'Dubai',
    zone: 'City Center',
    types: ['Standard', 'Premium'],
    programmatic: false
  },
  {
    code: '0015',
    country: 'United Arab Emirates',
    emirate: 'Abu Dhabi',
    city: 'Abu Dhabi',
    zone: 'City Center',
    types: ['Standard', 'IMAX', 'Ultra-Luxury'],
    programmatic: true
  },
  // Synthetic small-town / suburb entries for BDD demo
  {
    code: '0052',
    country: 'United Arab Emirates',
    emirate: 'Fujairah',
    city: 'Dibba Al-Fujairah',
    zone: 'Small Town',
    types: ['Standard'],
    programmatic: false
  },
  {
    code: '0058',
    country: 'United Arab Emirates',
    emirate: 'Ras Al Khaimah',
    city: 'Khor Khwair',
    zone: 'Small Town',
    types: ['Standard', 'Bean Bag'],
    programmatic: true
  },
  {
    code: '0061',
    country: 'United Arab Emirates',
    emirate: 'Sharjah',
    city: 'Kalba',
    zone: 'Small Town',
    types: ['Standard'],
    programmatic: false
  },
  {
    code: '0070',
    country: 'United Arab Emirates',
    emirate: 'Dubai',
    city: 'Dubai',
    zone: 'Suburb',
    types: ['Standard', 'Premium'],
    programmatic: true
  }
];

/** Synthetic theater names so the non-mock codes are displayable. */
export const theaterNameByCode: Record<string, string> = {
  ...Object.fromEntries(cinemas.map((c) => [c.code, c.name])),
  '0052': 'Dibba Cinema City',
  '0058': 'RAK Mall Cinemas',
  '0061': 'Kalba Town Cinema',
  '0070': 'Marina Mall Dubai'
};

export function getTheaterName(code: string): string {
  return theaterNameByCode[code] ?? code;
}

export function getTheaterMeta(code: string): TheaterMeta | undefined {
  return theaterMeta.find((t) => t.code === code);
}

/** All unique values for filter dropdowns. */
export const EMIRATES = Array.from(
  new Set(theaterMeta.map((t) => t.emirate))
).sort();
export const CITIES = Array.from(
  new Set(theaterMeta.map((t) => t.city))
).sort();
export const ZONES: Zone[] = ['City Center', 'Suburb', 'Small Town'];
export const CINEMA_TYPES: CinemaType[] = [
  'Standard',
  'Premium',
  'Luxury',
  'Ultra-Luxury',
  'IMAX',
  '4DX',
  'Bean Bag'
];

/* ------------------------------------------------------------------ */
/* Filter helper used by StepTargeting + DSP                           */
/* ------------------------------------------------------------------ */

export interface LocationFilter {
  emirates?: string[];
  cities?: string[];
  zones?: Zone[];
  types?: CinemaType[];
  theaterCodes?: string[];
  programmaticOnly?: boolean;
}

export function filterTheaters(f: LocationFilter): TheaterMeta[] {
  return theaterMeta.filter((t) => {
    if (f.emirates?.length && !f.emirates.includes(t.emirate)) return false;
    if (f.cities?.length && !f.cities.includes(t.city)) return false;
    if (f.zones?.length && !f.zones.includes(t.zone)) return false;
    if (f.types?.length && !f.types.some((ty) => t.types.includes(ty)))
      return false;
    if (f.theaterCodes?.length && !f.theaterCodes.includes(t.code))
      return false;
    if (f.programmaticOnly && !t.programmatic) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Audience packages                                                   */
/* ------------------------------------------------------------------ */

export interface AudiencePackage {
  id: string;
  name: string;
  description: string;
  genres: string[];           // maps to Film.genre
  cinemaTypes: CinemaType[];  // preferred formats
  dayparts: string[];
  estReach: string;
}

export const AUDIENCE_PACKAGES: AudiencePackage[] = [
  {
    id: 'families',
    name: 'Families',
    description: 'Parents with children, weekend matinee skew.',
    genres: ['Family', 'Animation', 'Comedy'],
    cinemaTypes: ['Standard', 'Premium'],
    dayparts: ['Matinee', 'Evening'],
    estReach: '1.2M'
  },
  {
    id: 'youth',
    name: 'Youth',
    description: 'Ages 16–24, late shows, action/sci-fi skew.',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    cinemaTypes: ['Standard', 'IMAX', '4DX'],
    dayparts: ['Evening', 'Late Night'],
    estReach: '980K'
  },
  {
    id: 'affluent',
    name: 'Affluent',
    description: 'High income, luxury formats, weekday prime.',
    genres: ['Drama', 'Sci-Fi'],
    cinemaTypes: ['Luxury', 'Ultra-Luxury'],
    dayparts: ['Evening', 'Prime'],
    estReach: '320K'
  },
  {
    id: 'arabic-speakers',
    name: 'Arabic Speakers',
    description: 'Native language content across all formats.',
    genres: ['Drama', 'Comedy'],
    cinemaTypes: ['Standard', 'Premium'],
    dayparts: ['Evening'],
    estReach: '640K'
  }
];

export function packageById(id: string): AudiencePackage | undefined {
  return AUDIENCE_PACKAGES.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* Dynamic ad-slot model (programmatic + tiered pricing)               */
/* ------------------------------------------------------------------ */

export type SlotType =
  | 'pre-show-60' // 60s pre-show, tier 1 (closest to feature → most expensive)
  | 'pre-show-30' // 30s pre-show, tier 2
  | 'interval';   // mid-film (market dependent), tier 3

export interface DynamicAdSlot {
  id: string;
  sessionId: string;
  cinemaCode: string;
  type: SlotType;
  priceTier: 1 | 2 | 3;
  basePrice: number; // AED per play
  programmatic: boolean;
  startsAt: string;  // local time string, inherited from session
}

export const TIER_PRICING: Record<SlotType, { tier: 1 | 2 | 3; price: number }> = {
  'pre-show-60': { tier: 1, price: 2800 },
  'pre-show-30': { tier: 2, price: 1600 },
  interval:      { tier: 3, price: 900 }
};

/**
 * Deterministically generate dynamic slots for all current sessions.
 * Reflects the "slots are derived from live showtimes" requirement —
 * in production this would come from the cinema feed.
 */
export function generateSlotsForWeek(): DynamicAdSlot[] {
  const slots: DynamicAdSlot[] = [];
  for (const s of weekSessions) {
    const meta = getTheaterMeta(s.cinema);
    const prog = meta?.programmatic ?? false;
    // Every session gets 60s + 30s. Intervals only for long (>= 2h20m) films.
    (['pre-show-60', 'pre-show-30'] as SlotType[]).forEach((t) => {
      slots.push({
        id: `${s.id}-${t}`,
        sessionId: s.id,
        cinemaCode: s.cinema,
        type: t,
        priceTier: TIER_PRICING[t].tier,
        basePrice: TIER_PRICING[t].price,
        programmatic: prog,
        startsAt: s.start
      });
    });
    if (/Avatar/.test(s.film)) {
      slots.push({
        id: `${s.id}-interval`,
        sessionId: s.id,
        cinemaCode: s.cinema,
        type: 'interval',
        priceTier: 3,
        basePrice: TIER_PRICING.interval.price,
        programmatic: prog,
        startsAt: s.start
      });
    }
  }
  return slots;
}

export const dynamicSlots: DynamicAdSlot[] = generateSlotsForWeek();

export function slotsForSession(sessionId: string): DynamicAdSlot[] {
  return dynamicSlots.filter((s) => s.sessionId === sessionId);
}

/* ------------------------------------------------------------------ */
/* Film → screens mapping (for movie-based targeting)                  */
/* ------------------------------------------------------------------ */

export interface ScreenPlayingFilm {
  cinemaCode: string;
  cinemaName: string;
  screen: string;
  sessionCount: number;
  nextShow: string;
}

export function screensPlayingFilm(filmTitle: string): ScreenPlayingFilm[] {
  const map = new Map<string, ScreenPlayingFilm>();
  for (const s of weekSessions) {
    if (!s.film.toLowerCase().includes(filmTitle.toLowerCase())) continue;
    const key = `${s.cinema}-${s.screen}`;
    const existing = map.get(key);
    if (existing) {
      existing.sessionCount += 1;
    } else {
      map.set(key, {
        cinemaCode: s.cinema,
        cinemaName: getTheaterName(s.cinema),
        screen: s.screen,
        sessionCount: 1,
        nextShow: s.start
      });
    }
  }
  return Array.from(map.values());
}

export const ALL_FILM_TITLES = Array.from(
  new Set([...films.map((f) => f.title), ...weekSessions.map((s) => s.film)])
).sort();

/* ------------------------------------------------------------------ */
/* Feed status (simulates real-time ingest)                            */
/* ------------------------------------------------------------------ */

export interface FeedStatus {
  lastSyncedAt: Date;
  sources: { name: string; status: 'healthy' | 'stale' | 'down' }[];
}

let lastSync = new Date();
export function getFeedStatus(): FeedStatus {
  return {
    lastSyncedAt: lastSync,
    sources: [
      { name: 'VOX Cinemas feed', status: 'healthy' },
      { name: 'Reel Cinemas feed', status: 'healthy' },
      { name: 'Novo Cinemas feed', status: 'stale' }
    ]
  };
}
export function refreshFeed(): FeedStatus {
  lastSync = new Date();
  return getFeedStatus();
}
