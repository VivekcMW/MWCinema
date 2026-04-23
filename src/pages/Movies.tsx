import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Film,
  Flame,
  Megaphone,
  Search
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  StatCard,
  Tabs
} from '../components/ui';
import { films, weekSessions, Session } from '../data/mock';
import { adsForSession } from '../data/adPlacements';
import { SessionAdsTooltip } from '../components/ui/AdTooltip';

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

function parseClock(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})([ap])$/i);
  if (!m) return 0;
  let hr = parseInt(m[1], 10) % 12;
  const min = parseInt(m[2], 10);
  if (m[3].toLowerCase() === 'p') hr += 12;
  return hr * 60 + min;
}
function rangeOf(s: Session) {
  let start = parseClock(s.start);
  let end = parseClock(s.end);
  if (end <= start) end += 24 * 60;
  return { start, end };
}
function fillPct(s: Session) {
  const total = s.preShow60.total + s.preShow30.total;
  const booked = s.preShow60.booked + s.preShow30.booked;
  return Math.round((booked / total) * 100);
}
function tone(pct: number): 'green' | 'amber' | 'red' {
  if (pct >= 90) return 'red';
  if (pct >= 60) return 'amber';
  return 'green';
}

const DAY_START = 10 * 60;
const DAY_END = 26 * 60;
const SPAN = DAY_END - DAY_START;
const HOUR_W = 96;
const LABEL_W = 220;

function useMinute() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;
  return minutes < 4 * 60 ? minutes + 24 * 60 : minutes;
}

function formatHour(min: number) {
  const h = Math.floor(min / 60) % 24;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12} ${suffix}`;
}

type FilmRow = {
  title: string;
  rating: string;
  genre: string;
  language: 'English' | 'Arabic';
  demand: string;
  sessions: Session[];
  screens: number;
  live: number;
};

/* ------------------------------------------------------------------ */

export default function Movies() {
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState<'all' | 'English' | 'Arabic'>('all');
  const [demand, setDemand] = useState<'all' | 'High' | 'Standard'>('all');

  const nowMin = useMinute();

  const filmRows = useMemo<FilmRow[]>(() => {
    return films
      .map((f) => {
        const key = f.title.toLowerCase().slice(0, 8);
        const sessions = weekSessions.filter((s) =>
          s.film.toLowerCase().startsWith(key)
        );
        const screensSet = new Set(sessions.map((s) => s.screen));
        const live = sessions.filter((s) => {
          const { start, end } = rangeOf(s);
          return nowMin >= start && nowMin <= end;
        }).length;
        return {
          title: f.title,
          rating: f.rating,
          genre: f.genre,
          language: f.language as 'English' | 'Arabic',
          demand: f.demand,
          sessions,
          screens: screensSet.size,
          live
        };
      })
      .filter((f) => {
        if (search && !f.title.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (lang !== 'all' && f.language !== lang) return false;
        if (demand !== 'all' && f.demand !== demand) return false;
        return true;
      });
  }, [search, lang, demand, nowMin]);

  const liveNow = weekSessions.filter((s) => {
    const { start, end } = rangeOf(s);
    return nowMin >= start && nowMin <= end;
  }).length;
  const screensLive = new Set(
    weekSessions
      .filter((s) => {
        const { start, end } = rangeOf(s);
        return nowMin >= start && nowMin <= end;
      })
      .map((s) => s.screen)
  ).size;

  return (
    <>
      <PageHeader
        title="Now Playing"
        subtitle="Currently scheduled films across the network"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Now Playing' }]}
        actions={
          <Link to="/ad-slots">
            <Button leftIcon={<Film size={16} />}>Go to Ad Slots</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Films on screen"
          value={films.length}
          helper={`${screensLive} screens live`}
          icon={<Film size={18} />}
          tone="blue"
        />
        <StatCard
          label="Live sessions"
          value={liveNow}
          helper="Playing right now"
          icon={<Clock size={18} />}
          tone="orange"
        />
        <StatCard
          label="High demand"
          value={films.filter((f) => f.demand === 'High').length}
          helper="Priority inventory"
          icon={<Flame size={18} />}
          tone="orange"
        />
      </div>

      <Card>
        <div className="px-5 pt-3 flex flex-wrap items-center justify-between gap-3">
          <Tabs
            tabs={[
              { label: 'Timeline', value: 'timeline' },
              { label: 'List', value: 'list', count: filmRows.length }
            ]}
            value={view}
            onChange={(v) => setView(v as typeof view)}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search film"
                leftIcon={<Search size={14} />}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 sm:w-40">
                <Select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as typeof lang)}
                  options={[
                    { value: 'all', label: 'All languages' },
                    { value: 'English', label: 'English' },
                    { value: 'Arabic', label: 'Arabic' }
                  ]}
                />
              </div>
              <div className="flex-1 sm:w-36">
                <Select
                  value={demand}
                  onChange={(e) => setDemand(e.target.value as typeof demand)}
                  options={[
                    { value: 'all', label: 'Any demand' },
                    { value: 'High', label: 'High' },
                    { value: 'Standard', label: 'Standard' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {view === 'timeline' ? (
            <TimelineView filmRows={filmRows} nowMin={nowMin} />
          ) : (
            <ListView filmRows={filmRows} />
          )}
        </div>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline view                                                       */
/* ------------------------------------------------------------------ */

function TimelineView({
  filmRows,
  nowMin
}: {
  filmRows: FilmRow[];
  nowMin: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START; m < DAY_END; m += 60) out.push(m);
    return out;
  }, []);
  const timelineWidth = hours.length * HOUR_W;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (nowMin >= DAY_START && nowMin <= DAY_END) {
      const offset =
        LABEL_W + ((nowMin - DAY_START) / SPAN) * timelineWidth - el.clientWidth / 2;
      el.scrollLeft = Math.max(0, offset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowPct =
    nowMin >= DAY_START && nowMin <= DAY_END ? (nowMin - DAY_START) / SPAN : null;

  if (filmRows.length === 0) {
    return (
      <EmptyState
        message="No films match your filters"
        hint="Try clearing search or changing language/demand."
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="relative overflow-x-auto rounded-mw-sm border border-mw-gray-200 bg-white"
    >
      <div style={{ width: LABEL_W + timelineWidth }}>
        {/* Hour axis */}
        <div
          className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-mw-gray-200"
          style={{ paddingLeft: LABEL_W }}
        >
          <div className="relative h-9" style={{ width: timelineWidth }}>
            {hours.map((m, i) => (
              <div
                key={m}
                className="absolute inset-y-0 flex items-end pb-1.5 pl-2"
                style={{ left: i * HOUR_W, width: HOUR_W }}
              >
                <span className="text-[11px] font-semibold text-mw-gray-600">
                  {formatHour(m)}
                </span>
              </div>
            ))}
            {hours.map((_, i) => (
              <div
                key={`t-${i}`}
                className="absolute top-0 bottom-0 w-px bg-mw-gray-200"
                style={{ left: i * HOUR_W }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative">
          {nowPct !== null && (
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: LABEL_W + nowPct * timelineWidth }}
            >
              <div className="w-px h-full bg-mw-red-500/80" />
              <div className="absolute top-1 -translate-x-1/2 flex items-center gap-1 bg-mw-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-mw-card whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                NOW
              </div>
            </div>
          )}

          {filmRows.map((f, idx) => {
            const zebra = idx % 2 === 1;
            return (
              <div
                key={f.title}
                className={`flex border-b border-mw-gray-100 ${
                  zebra ? 'bg-mw-gray-50/40' : 'bg-white'
                }`}
                style={{ minHeight: 76 }}
              >
                {/* Sticky label */}
                <div
                  className="sticky left-0 z-[5] flex items-center gap-3 px-4 border-r border-mw-gray-200 bg-inherit"
                  style={{ width: LABEL_W, minWidth: LABEL_W }}
                >
                  <div className="w-9 h-12 rounded-md bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center shrink-0">
                    <Film size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-mw-gray-900 truncate leading-tight">
                      {f.title}
                    </p>
                    <p className="text-[11px] text-mw-gray-500 truncate">
                      {f.genre} · {f.rating} · {f.language}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {f.demand === 'High' && (
                        <Badge tone="orange" icon={<Flame size={10} />}>
                          High
                        </Badge>
                      )}
                      {f.live > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-mw-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-mw-red-500 animate-pulse" />
                          {f.live} live
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline lane */}
                <div
                  className="relative flex-1"
                  style={{ width: timelineWidth, minWidth: timelineWidth }}
                >
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 bottom-0 w-px ${
                        i === 0 ? 'bg-transparent' : 'bg-mw-gray-100'
                      }`}
                      style={{ left: i * HOUR_W }}
                    />
                  ))}
                  {f.sessions.map((s) => {
                    const { start, end } = rangeOf(s);
                    if (end <= DAY_START || start >= DAY_END) return null;
                    const left =
                      ((Math.max(start, DAY_START) - DAY_START) / SPAN) *
                      timelineWidth;
                    const width =
                      ((Math.min(end, DAY_END) - Math.max(start, DAY_START)) /
                        SPAN) *
                      timelineWidth;
                    const pct = fillPct(s);
                    const t = tone(pct);
                    const cls =
                      t === 'red'
                        ? {
                            bg: 'bg-mw-red-100',
                            accent: 'bg-mw-red-500',
                            border: 'border-mw-red-500/30 hover:border-mw-red-500',
                            text: 'text-mw-red-500'
                          }
                        : t === 'amber'
                          ? {
                              bg: 'bg-mw-amber-100',
                              accent: 'bg-mw-amber-500',
                              border:
                                'border-mw-amber-500/30 hover:border-mw-amber-500',
                              text: 'text-mw-amber-500'
                            }
                          : {
                              bg: 'bg-mw-green-100',
                              accent: 'bg-mw-green-500',
                              border:
                                'border-mw-green-500/30 hover:border-mw-green-500',
                              text: 'text-mw-green-500'
                            };
                    return (
                      <Link
                        key={s.id}
                        to="/ad-slots"
                        className={`group absolute top-2 bottom-2 rounded-md border ${cls.bg} ${cls.border} transition-all hover:shadow-mw-card hover:-translate-y-[1px] hover:z-30 focus:outline-none focus:ring-2 focus:ring-mw-blue-500`}
                        style={{ left, width: Math.max(width - 4, 40) }}
                      >
                        <span
                          className={`absolute left-0 top-0 bottom-0 w-0.5 ${cls.accent}`}
                        />
                        <div className="h-full pl-2 pr-1.5 py-1 flex flex-col justify-between overflow-hidden">
                          <p className="text-[11px] font-semibold text-mw-gray-900 leading-tight truncate">
                            {s.screen}
                          </p>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-mw-gray-600">
                              {s.start}
                            </span>
                            <span className={`text-[10px] font-semibold ${cls.text}`}>
                              {pct}%
                            </span>
                          </div>
                          {adsForSession(s).length > 0 && (
                            <span className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-1 py-0.5">
                              <Megaphone size={8} />
                              {adsForSession(s).length}
                            </span>
                          )}
                        </div>
                        <SessionAdsTooltip session={s} align="left" placement="top" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List view                                                           */
/* ------------------------------------------------------------------ */

function ListView({ filmRows }: { filmRows: FilmRow[] }) {
  if (filmRows.length === 0) {
    return (
      <EmptyState
        message="No films match your filters"
        hint="Try clearing search or changing language/demand."
      />
    );
  }
  return (
    <DataTable<FilmRow>
      columns={[
        {
          key: 'title',
          header: 'Film',
          render: (r) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 rounded-md bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center shrink-0">
                <Film size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-mw-gray-900 truncate">
                  {r.title}
                </p>
                <p className="text-[11px] text-mw-gray-500 truncate">
                  {r.genre} · {r.language}
                </p>
              </div>
            </div>
          )
        },
        {
          key: 'rating',
          header: 'Rating',
          render: (r) => <Badge tone="gray">{r.rating}</Badge>
        },
        {
          key: 'demand',
          header: 'Demand',
          render: (r) =>
            r.demand === 'High' ? (
              <Badge tone="orange" icon={<Flame size={10} />}>
                High
              </Badge>
            ) : (
              <Badge tone="gray">Standard</Badge>
            )
        },
        {
          key: 'screens',
          header: 'Screens',
          render: (r) => (
            <span className="font-semibold text-mw-gray-900">{r.screens}</span>
          )
        },
        {
          key: 'sessions',
          header: 'Sessions',
          render: (r) => <span className="text-mw-gray-800">{r.sessions.length}</span>
        },
        {
          key: 'live',
          header: 'Live now',
          render: (r) =>
            r.live > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-mw-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-mw-red-500 animate-pulse" />
                {r.live}
              </span>
            ) : (
              <span className="text-mw-gray-400 text-xs">—</span>
            )
        },
        {
          key: 'actions',
          header: '',
          render: () => (
            <Link
              to="/ad-slots"
              className="text-xs font-semibold text-mw-blue-600 hover:text-mw-blue-700"
            >
              Plan ads →
            </Link>
          )
        }
      ]}
      rows={filmRows}
      rowKey={(r) => r.title}
    />
  );
}

/* ------------------------------------------------------------------ */

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="text-center py-14">
      <div className="w-12 h-12 mx-auto rounded-full bg-mw-gray-100 text-mw-gray-400 flex items-center justify-center mb-3">
        <Film size={20} />
      </div>
      <p className="text-sm font-semibold text-mw-gray-900">{message}</p>
      <p className="text-xs text-mw-gray-500 mt-1">{hint}</p>
    </div>
  );
}
