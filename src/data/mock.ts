export interface Session {
  id: string;
  cinema: string;
  screen: string;
  film: string;
  rating: string;
  language: 'English' | 'Arabic';
  day: 'Thu' | 'Fri' | 'Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed';
  start: string;
  end: string;
  // slot inventory per session
  preShow60: { total: number; booked: number };
  preShow30: { total: number; booked: number };
}

export const cinemas = [
  { code: '0037', name: 'Al Jimi Mall', city: 'Al Ain', screens: 8, lng: 55.7601, lat: 24.2076 },
  { code: '0041', name: 'Mall of the Emirates', city: 'Dubai', screens: 14, lng: 55.2009, lat: 25.1181 },
  { code: '0029', name: 'City Centre Deira', city: 'Dubai', screens: 10, lng: 55.3317, lat: 25.2528 },
  { code: '0015', name: 'Yas Mall', city: 'Abu Dhabi', screens: 12, lng: 54.6065, lat: 24.4887 }
];

export const films = [
  { title: 'Zootropolis 2', rating: 'PG', genre: 'Family', language: 'English', demand: 'High' },
  { title: 'Avatar: Fire and Ash', rating: 'PG-13', genre: 'Sci-Fi', language: 'English', demand: 'High' },
  { title: 'Anaconda', rating: 'R', genre: 'Thriller', language: 'English', demand: 'Standard' },
  { title: 'The SpongeBob Movie', rating: 'PG', genre: 'Family', language: 'English', demand: 'Standard' },
  { title: 'Tala2ni [arabic]', rating: 'PG-13', genre: 'Drama', language: 'Arabic', demand: 'Standard' },
  { title: 'Kharitat ras al sana', rating: 'PG', genre: 'Comedy', language: 'Arabic', demand: 'Standard' }
];

// Sessions sampled from the VOX weekly PDF — Al Jimi Mall
export const weekSessions: Session[] = [
  // Screen 1
  s('s1-1', '0037', 'Screen 1', 'Zootropolis 2', 'PG', 'English', 'Thu', '1:15p', '3:25p', 8, 4),
  s('s1-2', '0037', 'Screen 1', 'Zootropolis 2', 'PG', 'English', 'Thu', '3:45p', '5:55p', 8, 7),
  s('s1-3', '0037', 'Screen 1', 'Zootropolis 2', 'PG', 'English', 'Thu', '6:15p', '8:25p', 8, 8),
  s('s1-4', '0037', 'Screen 1', 'SpongeBob', 'PG', 'English', 'Thu', '8:40p', '10:30p', 8, 3),
  s('s1-5', '0037', 'Screen 1', 'Zootropolis 2', 'PG', 'English', 'Thu', '10:45p', '12:55a', 8, 1),
  // Screen 2
  s('s2-1', '0037', 'Screen 2', 'Zootropolis 2', 'PG', 'English', 'Thu', '2:15p', '4:25p', 8, 6),
  s('s2-2', '0037', 'Screen 2', 'Zootropolis 2', 'PG', 'English', 'Thu', '4:45p', '6:55p', 8, 8),
  s('s2-3', '0037', 'Screen 2', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '7:10p', '10:45p', 8, 8),
  s('s2-4', '0037', 'Screen 2', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '11:00p', '2:35a', 8, 2),
  // Screen 3
  s('s3-1', '0037', 'Screen 3', 'Anaconda', 'R', 'English', 'Thu', '12:35p', '2:35p', 6, 3),
  s('s3-2', '0037', 'Screen 3', 'Tala2ni', 'PG-13', 'Arabic', 'Thu', '5:05p', '7:10p', 6, 5),
  s('s3-3', '0037', 'Screen 3', 'SpongeBob', 'PG', 'English', 'Thu', '7:25p', '9:15p', 6, 2),
  s('s3-4', '0037', 'Screen 3', 'Tala2ni', 'PG-13', 'Arabic', 'Thu', '9:30p', '11:35p', 6, 4),
  // Screen 6 (Avatar dedicated)
  s('s6-1', '0037', 'Screen 6', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '10:30a', '2:05p', 8, 5),
  s('s6-2', '0037', 'Screen 6', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '2:20p', '5:55p', 8, 7),
  s('s6-3', '0037', 'Screen 6', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '6:10p', '9:45p', 8, 8),
  s('s6-4', '0037', 'Screen 6', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '10:00p', '1:35a', 8, 2),
  // Screen 7
  s('s7-1', '0037', 'Screen 7', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '1:00p', '4:35p', 8, 4),
  s('s7-2', '0037', 'Screen 7', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '5:00p', '8:35p', 8, 8),
  s('s7-3', '0037', 'Screen 7', 'Avatar: Fire and Ash', 'PG-13', 'English', 'Thu', '9:00p', '12:35a', 8, 6)
];

function s(
  id: string,
  cinema: string,
  screen: string,
  film: string,
  rating: string,
  language: 'English' | 'Arabic',
  day: Session['day'],
  start: string,
  end: string,
  total60: number,
  booked60: number
): Session {
  return {
    id,
    cinema,
    screen,
    film,
    rating,
    language,
    day,
    start,
    end,
    preShow60: { total: total60, booked: booked60 },
    preShow30: { total: total60 * 2, booked: Math.min(total60 * 2, booked60 * 2) }
  };
}

export const campaigns = [
  {
    id: 'CMP-1029',
    name: 'Netflix Thriller Launch',
    advertiser: 'Netflix',
    status: 'Pending Approval',
    budget: 45000,
    spent: 0,
    start: '2026-01-01',
    end: '2026-01-14',
    spots: 840,
    fill: 0
  },
  {
    id: 'CMP-1028',
    name: 'Pepsi Ramadan',
    advertiser: 'PepsiCo',
    status: 'Live',
    budget: 92000,
    spent: 61400,
    start: '2025-12-20',
    end: '2026-01-20',
    spots: 2100,
    fill: 67
  },
  {
    id: 'CMP-1027',
    name: 'Emirates Premium Economy',
    advertiser: 'Emirates',
    status: 'Live',
    budget: 120000,
    spent: 88000,
    start: '2025-12-15',
    end: '2026-01-31',
    spots: 1800,
    fill: 73
  },
  {
    id: 'CMP-1026',
    name: 'Apple Vision Teaser',
    advertiser: 'Apple',
    status: 'Scheduled',
    budget: 30000,
    spent: 0,
    start: '2026-02-01',
    end: '2026-02-14',
    spots: 540,
    fill: 0
  },
  {
    id: 'CMP-1025',
    name: 'Careem Everything App',
    advertiser: 'Careem',
    status: 'Completed',
    budget: 18000,
    spent: 18000,
    start: '2025-11-01',
    end: '2025-11-30',
    spots: 420,
    fill: 100
  },
  {
    id: 'CMP-1024',
    name: 'ADCB Wealth',
    advertiser: 'ADCB',
    status: 'Draft',
    budget: 25000,
    spent: 0,
    start: '2026-02-15',
    end: '2026-03-15',
    spots: 0,
    fill: 0
  }
];

export const topMovies = [
  { code: 'AV', title: 'Avatar: Fire and Ash', genre: 'Sci-Fi', rating: 'PG-13', screens: 14, demand: 'High' },
  { code: 'ZO', title: 'Zootropolis 2', genre: 'Family', rating: 'PG', screens: 12, demand: 'High' },
  { code: 'SP', title: 'SpongeBob Movie', genre: 'Family', rating: 'PG', screens: 9, demand: 'Standard' },
  { code: 'AN', title: 'Anaconda', genre: 'Thriller', rating: 'R', screens: 6, demand: 'Standard' },
  { code: 'TA', title: 'Tala2ni', genre: 'Drama', rating: 'PG-13', screens: 6, demand: 'Standard' },
  { code: 'KH', title: 'Kharitat Ras Al Sana', genre: 'Comedy', rating: 'PG', screens: 5, demand: 'Standard' }
];

export const activity = [
  { text: 'TTD connector synced 12 campaigns successfully', time: 'Apr 22, 3:25 PM', tone: 'green' as const },
  { text: 'AMC Boston Common has been added to the platform', time: 'Apr 22, 1:10 PM', tone: 'blue' as const },
  { text: 'Screen 2 at Al Jimi Mall — Avatar slots fully sold out', time: 'Apr 21, 8:45 PM', tone: 'orange' as const },
  { text: 'Netflix Thriller Launch campaign requires approval', time: 'Apr 21, 4:12 PM', tone: 'amber' as const },
  { text: 'Overlapping ad bookings detected for Screen 3, Al Jimi Mall', time: 'Apr 21, 11:20 AM', tone: 'red' as const }
];

export const formatFillRates = [
  { label: 'Pre-show 60s', booked: 312, total: 774 },
  { label: 'Pre-show 30s', booked: 288, total: 586 },
  { label: 'Lobby loop', booked: 140, total: 340 },
  { label: 'Programmatic', booked: 514, total: 929 },
  { label: 'Noovie trivia', booked: 30, total: 80 }
];
