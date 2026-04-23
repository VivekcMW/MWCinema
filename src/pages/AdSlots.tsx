import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Film,
  Globe2,
  Link2,
  Megaphone,
  Plug,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Drawer,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  StatCard,
  Tabs,
  FilterChip
} from '../components/ui';
import { weekSessions, Session } from '../data/mock';
import { adsForSession, adsForDay } from '../data/adPlacements';
import { SessionAdsTooltip, DayAdsTooltip } from '../components/ui/AdTooltip';
import { slotsForSession } from '../data/cinemaMeta';

/* ------------------------------------------------------------------ */
/* Country / timezone model                                            */
/* ------------------------------------------------------------------ */

interface Market {
  code: string;
  label: string;
  flag: string;
  tz: string;
  currency: string;
  cpm: number; // reference CPM for cost calc
}

const MARKETS: Market[] = [
  { code: 'AE', label: 'United Arab Emirates', flag: '🇦🇪', tz: 'Asia/Dubai', currency: 'AED', cpm: 34 },
  { code: 'IN', label: 'India', flag: '🇮🇳', tz: 'Asia/Kolkata', currency: 'INR', cpm: 12 },
  { code: 'US', label: 'United States', flag: '🇺🇸', tz: 'America/New_York', currency: 'USD', cpm: 42 },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', tz: 'Europe/London', currency: 'GBP', cpm: 28 },
  { code: 'SG', label: 'Singapore', flag: '🇸🇬', tz: 'Asia/Singapore', currency: 'SGD', cpm: 25 }
];

/* ------------------------------------------------------------------ */
/* Time utilities                                                      */
/* Parses mock times like "1:15p" / "12:35a" → minutes since 0:00      */
/* ------------------------------------------------------------------ */

function parseClock(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})([ap])$/i);
  if (!m) return 0;
  let hr = parseInt(m[1], 10) % 12;
  const min = parseInt(m[2], 10);
  if (m[3].toLowerCase() === 'p') hr += 12;
  return hr * 60 + min;
}

const DAY_START = 10 * 60; // 10:00
const DAY_END = 26 * 60; // 02:00 next day
const TIMELINE_SPAN = DAY_END - DAY_START; // 960 minutes

function sessionRange(s: Session) {
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
function availabilityTone(pct: number): 'green' | 'amber' | 'red' {
  if (pct >= 90) return 'red';
  if (pct >= 60) return 'amber';
  return 'green';
}

/* ------------------------------------------------------------------ */
/* Live clock hook                                                     */
/* ------------------------------------------------------------------ */

function useClock(tz: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const timeStr = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(now),
    [now, tz]
  );
  const dateStr = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(now),
    [now, tz]
  );
  const tzTimeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  const [h, m] = tzTimeStr.split(':').map(Number);
  const minutes = h * 60 + m;
  return { now, timeStr, dateStr, minutes };
}

const DAYS: Session['day'][] = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

/* ------------------------------------------------------------------ */

export default function AdSlots() {
  const [market, setMarket] = useState<Market>(MARKETS[0]);
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);

  // Filter state (grouped so we can count + reset)
  const defaultFilters = {
    search: '',
    cinema: 'aljimi',
    format: 'all',
    language: 'all',
    availability: 'all'
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [programmaticOnly, setProgrammaticOnly] = useState(false);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.cinema !== defaultFilters.cinema ? 1 : 0) +
    (filters.format !== 'all' ? 1 : 0) +
    (filters.language !== 'all' ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  const clock = useClock(market.tz);

  const screens = Array.from(new Set(weekSessions.map((s) => s.screen))).sort();

  // Shift early-morning (pre-4 AM) minutes onto the same timeline day
  const nowMin =
    clock.minutes < 4 * 60 ? clock.minutes + 24 * 60 : clock.minutes;

  const nowPlaying = weekSessions.filter((s) => {
    const { start, end } = sessionRange(s);
    return nowMin >= start && nowMin <= end;
  });

  const totalAvailable = weekSessions.reduce(
    (acc, s) =>
      acc +
      (s.preShow60.total - s.preShow60.booked) +
      (s.preShow30.total - s.preShow30.booked),
    0
  );

  return (
    <>
      <PageHeader
        title="Ad Slots"
        subtitle="Schedule, preview, and buy cinema inventory in real time"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Ad Slots' }]}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Upload size={16} />}
              onClick={() => setBulkOpen(true)}
            >
              Bulk upload
            </Button>
            <Link to="/campaigns/new">
              <Button leftIcon={<Plus size={16} />}>Plan campaign</Button>
            </Link>
          </>
        }
      />

      {/* Live status strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-mw-gray-500">Local time</p>
              <p className="mt-1.5 text-[22px] leading-tight font-semibold text-mw-blue-500">
                {clock.timeStr}
              </p>
              <p className="mt-1 text-[11px] text-mw-gray-500">{clock.dateStr}</p>
            </div>
            <div className="w-9 h-9 rounded-mw-sm bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
        </Card>
        <StatCard
          label="Market"
          value={`${market.flag} ${market.code}`}
          helper={`${market.tz} · ${market.currency}`}
          icon={<Globe2 size={18} />}
          tone="teal"
        />
        <StatCard
          label="Now playing"
          value={nowPlaying.length}
          helper={`${new Set(nowPlaying.map((s) => s.screen)).size} screens live`}
          icon={<Film size={18} />}
          tone="orange"
        />
        <StatCard
          label="Slots available"
          value={totalAvailable}
          helper="Across this week"
          icon={<Megaphone size={18} />}
          tone="blue"
        />
      </div>

      {/* View switcher + legend */}
      <Card>
        <div className="px-5 pt-3 flex flex-wrap items-center justify-between gap-3">
          <Tabs
            tabs={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
              { label: 'Year', value: 'year' }
            ]}
            value={view}
            onChange={(v) => setView(v as typeof view)}
          />
          <div className="flex items-center gap-3 text-xs text-mw-gray-500">
            <button
              data-testid="programmatic-toggle"
              onClick={() => setProgrammaticOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11px] font-medium transition-colors ${
                programmaticOnly
                  ? 'bg-mw-blue-500 text-white border-mw-blue-500'
                  : 'bg-white text-mw-gray-700 border-mw-gray-300 hover:border-mw-blue-500'
              }`}
              title="Show only programmatically-available inventory"
            >
              <Plug size={12} />
              Programmatic only
            </button>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-green-500" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-amber-500" /> Partial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-red-500" /> Sold out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-mw-red-500" /> Now
            </span>
          </div>
        </div>

        <div className="p-5">
          {programmaticOnly && (
            <div className="mb-3 rounded-mw-sm border border-mw-blue-200 bg-mw-blue-50 text-mw-blue-600 text-[12px] font-medium px-3 py-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plug size={14} />
                Programmatic-only view · sessions from non-programmatic theaters are hidden.
              </span>
              <button
                onClick={() => setProgrammaticOnly(false)}
                className="text-[11px] font-semibold hover:underline"
              >
                Clear
              </button>
            </div>
          )}
          {(() => {
            const filterSlot = (
              <FilterToolbarSlot
                activeCount={activeFilterCount}
                onOpen={() => setFiltersOpen(true)}
                filters={filters}
                defaultFilters={defaultFilters}
                onChange={setFilters}
                onClearAll={() => setFilters(defaultFilters)}
              />
            );
            return (
              <>
                {view === 'day' && (
                  <DayTimeline
                    screens={screens}
                    nowMin={nowMin}
                    onSelect={setSelected}
                    dateStr={clock.dateStr}
                    filterSlot={filterSlot}
                  />
                )}
                {view === 'week' && (
                  <WeekGrid
                    screens={screens}
                    onSelect={setSelected}
                    nowMin={nowMin}
                    tz={market.tz}
                    filterSlot={filterSlot}
                  />
                )}
                {view === 'month' && (
                  <MonthHeatmap
                    currency={market.currency}
                    onPickDay={() => setView('day')}
                    filterSlot={filterSlot}
                  />
                )}
                {view === 'year' && (
                  <YearSummary
                    currency={market.currency}
                    filterSlot={filterSlot}
                  />
                )}
              </>
            );
          })()}
        </div>
      </Card>

      <ScheduleDrawer
        session={selected}
        market={market}
        onClose={() => setSelected(null)}
      />

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        market={market}
        onMarketChange={setMarket}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        activeCount={activeFilterCount}
      />

      <BulkAdSlotDrawer
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* DAY — horizontal timeline                                            */
/* ------------------------------------------------------------------ */

const LABEL_COL_WIDTH = 140; // px — sticky screen-name column
const HOUR_COL_WIDTH = 88; // px — each hour column
const ROW_HEIGHT = 72; // px — per-screen row height

function DayTimeline({
  screens,
  nowMin,
  onSelect,
  dateStr,
  filterSlot
}: {
  screens: string[];
  nowMin: number;
  onSelect: (s: Session) => void;
  dateStr: string;
  filterSlot?: React.ReactNode;
}) {
  const [cursor, setCursor] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START; m < DAY_END; m += 60) out.push(m);
    return out;
  }, []);

  const timelineWidth = hours.length * HOUR_COL_WIDTH; // px
  const totalWidth = LABEL_COL_WIDTH + timelineWidth;

  // Auto scroll to current time on first render
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (nowMin >= DAY_START && nowMin <= DAY_END) {
      const offsetPx =
        LABEL_COL_WIDTH + ((nowMin - DAY_START) / TIMELINE_SPAN) * timelineWidth;
      el.scrollLeft = Math.max(0, offsetPx - el.clientWidth / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowPct =
    nowMin >= DAY_START && nowMin <= DAY_END
      ? ((nowMin - DAY_START) / TIMELINE_SPAN) * 100
      : null;

  // Readable now-timestamp for the pill
  const nowLabel = (() => {
    if (nowPct === null) return '';
    const totalMin = nowMin % (24 * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    return `${hr12}:${m.toString().padStart(2, '0')} ${suffix}`;
  })();

  const sessionsByScreen = useMemo(() => {
    const map = new Map<string, Session[]>();
    screens.forEach((sc) => map.set(sc, []));
    weekSessions.forEach((s) => {
      if (map.has(s.screen)) map.get(s.screen)!.push(s);
    });
    return map;
  }, [screens]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-mw-sm border border-mw-gray-300 bg-white overflow-hidden">
            <button
              onClick={() => setCursor((c) => c - 1)}
              className="w-9 h-9 text-mw-gray-600 hover:bg-mw-gray-50 flex items-center justify-center border-r border-mw-gray-200"
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 h-9 text-sm text-mw-gray-800">
              <CalendarDays size={14} className="text-mw-gray-500" />
              <span className="font-medium whitespace-nowrap">
                {cursor === 0
                  ? dateStr
                  : `${dateStr} (${cursor > 0 ? '+' : ''}${cursor}d)`}
              </span>
            </div>
            <button
              onClick={() => setCursor((c) => c + 1)}
              className="w-9 h-9 text-mw-gray-600 hover:bg-mw-gray-50 flex items-center justify-center border-l border-mw-gray-200"
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCursor(0)}
              className="h-9 px-3 text-sm font-medium text-mw-blue-600 hover:bg-mw-blue-50 border-l border-mw-gray-200"
            >
              Today
            </button>
          </div>
          {filterSlot}
        </div>
        <p className="text-xs text-mw-gray-500">
          {screens.length} screens · {hours.length}h window
          <span className="text-mw-gray-400"> · 10 AM – 2 AM</span>
        </p>
      </div>

      {/* Scrollable timeline surface */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto rounded-mw-sm border border-mw-gray-200 bg-white"
      >
        <div style={{ width: totalWidth }}>
          {/* Hour axis */}
          <div
            className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-mw-gray-200"
            style={{ paddingLeft: LABEL_COL_WIDTH }}
          >
            <div
              className="relative h-9"
              style={{ width: timelineWidth }}
            >
              {hours.map((m, i) => (
                <div
                  key={m}
                  className="absolute inset-y-0 flex items-end pb-1.5 pl-2"
                  style={{ left: i * HOUR_COL_WIDTH, width: HOUR_COL_WIDTH }}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-mw-gray-600 tracking-wide">
                      {formatHour(m)}
                    </span>
                  </div>
                </div>
              ))}
              {/* Hour tick marks */}
              {hours.map((_, i) => (
                <div
                  key={`tick-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-mw-gray-200"
                  style={{ left: i * HOUR_COL_WIDTH }}
                />
              ))}
            </div>
          </div>

          {/* Timeline body */}
          <div className="relative">
            {/* NOW vertical indicator — only over timeline area */}
            {nowPct !== null && (
              <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{
                  left: LABEL_COL_WIDTH + (nowPct / 100) * timelineWidth
                }}
              >
                <div className="w-px h-full bg-mw-red-500/80 shadow-[0_0_0_1px_rgba(220,38,38,0.15)]" />
                <div className="absolute top-1 -translate-x-1/2 flex items-center gap-1 bg-mw-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-mw-card whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {nowLabel}
                </div>
              </div>
            )}

            {screens.map((screen, idx) => {
              const zebra = idx % 2 === 1;
              return (
                <div
                  key={screen}
                  className={`relative flex border-b border-mw-gray-100 ${
                    zebra ? 'bg-mw-gray-50/40' : 'bg-white'
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Sticky screen label */}
                  <div
                    className="sticky left-0 z-[5] flex items-center px-4 border-r border-mw-gray-200 bg-inherit"
                    style={{ width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-mw-gray-900 leading-tight">
                        {screen}
                      </p>
                      <p className="text-[10px] text-mw-gray-500 mt-0.5">
                        {sessionsByScreen.get(screen)?.length || 0} sessions
                      </p>
                    </div>
                  </div>

                  {/* Timeline lane */}
                  <div
                    className="relative flex-1"
                    style={{ width: timelineWidth, minWidth: timelineWidth }}
                  >
                    {/* Hour gridlines */}
                    {hours.map((_, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 bottom-0 w-px ${
                          i === 0 ? 'bg-transparent' : 'bg-mw-gray-100'
                        }`}
                        style={{ left: i * HOUR_COL_WIDTH }}
                      />
                    ))}
                    {/* Half-hour subtle gridlines */}
                    {hours.map((_, i) => (
                      <div
                        key={`half-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-mw-gray-100/50"
                        style={{ left: i * HOUR_COL_WIDTH + HOUR_COL_WIDTH / 2 }}
                      />
                    ))}

                    {/* Session blocks */}
                    {(sessionsByScreen.get(screen) || []).map((s) => {
                      const { start, end } = sessionRange(s);
                      if (end <= DAY_START || start >= DAY_END) return null;
                      const leftPct =
                        ((Math.max(start, DAY_START) - DAY_START) / TIMELINE_SPAN);
                      const widthPct =
                        (Math.min(end, DAY_END) - Math.max(start, DAY_START)) /
                        TIMELINE_SPAN;
                      const pct = fillPct(s);
                      const t = availabilityTone(pct);

                      const tone =
                        t === 'red'
                          ? {
                              bg: 'bg-mw-red-100',
                              accent: 'bg-mw-red-500',
                              text: 'text-mw-red-500',
                              border: 'border-mw-red-500/30 hover:border-mw-red-500'
                            }
                          : t === 'amber'
                            ? {
                                bg: 'bg-mw-amber-100',
                                accent: 'bg-mw-amber-500',
                                text: 'text-mw-amber-500',
                                border: 'border-mw-amber-500/30 hover:border-mw-amber-500'
                              }
                            : {
                                bg: 'bg-mw-green-100',
                                accent: 'bg-mw-green-500',
                                text: 'text-mw-green-500',
                                border: 'border-mw-green-500/30 hover:border-mw-green-500'
                              };

                      const free =
                        s.preShow60.total - s.preShow60.booked +
                        (s.preShow30.total - s.preShow30.booked);
                      const adsCount = adsForSession(s).length;

                      return (
                        <button
                          key={s.id}
                          onClick={() => onSelect(s)}
                          className={`group absolute top-2 bottom-2 rounded-md border ${tone.bg} ${tone.border} text-left transition-all duration-150 hover:shadow-mw-card hover:-translate-y-[1px] hover:z-30 focus:outline-none focus:ring-2 focus:ring-mw-blue-500 focus:ring-offset-1`}
                          style={{
                            left: `${leftPct * 100}%`,
                            width: `calc(${widthPct * 100}% - 4px)`
                          }}
                        >
                          {/* Left accent bar */}
                          <span
                            className={`absolute left-0 top-0 bottom-0 w-0.5 ${tone.accent}`}
                          />
                          <div className="h-full pl-2 pr-1.5 py-1 flex flex-col justify-between overflow-hidden">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-mw-gray-900 truncate leading-tight">
                                {s.film}
                              </p>
                              <p className="text-[10px] text-mw-gray-600 truncate leading-tight mt-0.5">
                                {s.start} – {s.end}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] font-semibold ${tone.text}`}
                              >
                                {pct}%
                              </span>
                              {adsCount > 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-1.5 py-0.5">
                                  <Megaphone size={8} />
                                  {adsCount}
                                </span>
                              ) : (
                                <span className="text-[10px] text-mw-gray-500">
                                  {free} free
                                </span>
                              )}
                            </div>
                          </div>
                          <SessionAdsTooltip session={s} align="left" placement="top" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-[11px] text-mw-gray-400 mt-3 flex items-center gap-1.5">
        <Sparkles size={11} /> Click any session to pick a slot, upload creative,
        and schedule.
      </p>
    </div>
  );
}

function formatHour(min: number) {
  const h = Math.floor(min / 60) % 24;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12} ${suffix}`;
}

/* ------------------------------------------------------------------ */
/* WEEK — Google Calendar style time grid                               */
/* ------------------------------------------------------------------ */

const WEEK_TIME_COL = 64; // px
const WEEK_HOUR_HEIGHT = 56; // px per hour

function WeekGrid({
  screens,
  onSelect,
  nowMin,
  tz,
  filterSlot
}: {
  screens: string[];
  onSelect: (s: Session) => void;
  nowMin: number;
  tz: string;
  filterSlot?: React.ReactNode;
}) {
  // Active screen filter (week can get busy — one screen at a time)
  const [activeScreen, setActiveScreen] = useState<string>(screens[0] || '');
  useEffect(() => {
    if (!screens.includes(activeScreen) && screens[0]) setActiveScreen(screens[0]);
  }, [screens, activeScreen]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Hours to render as horizontal bands
  const hours = useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START; m < DAY_END; m += 60) out.push(m);
    return out;
  }, []);
  const gridHeight = hours.length * WEEK_HOUR_HEIGHT;

  // Today's short weekday in the market timezone, mapped to DAYS index
  const todayIdx = useMemo(() => {
    const wd = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short'
    }).format(new Date()) as Session['day'];
    const idx = DAYS.indexOf(wd);
    return idx;
  }, [tz]);

  // Auto-scroll to current time on first render
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || nowMin < DAY_START || nowMin > DAY_END) return;
    const y =
      ((nowMin - DAY_START) / TIMELINE_SPAN) * gridHeight - el.clientHeight / 3;
    el.scrollTop = Math.max(0, y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowPct =
    nowMin >= DAY_START && nowMin <= DAY_END
      ? (nowMin - DAY_START) / TIMELINE_SPAN
      : null;
  const nowLabel = (() => {
    if (nowPct === null) return '';
    const totalMin = nowMin % (24 * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    return `${hr12}:${m.toString().padStart(2, '0')} ${suffix}`;
  })();

  const sessions = weekSessions.filter((s) => s.screen === activeScreen);

  // Build week date labels relative to today in market tz
  const weekDates = useMemo(() => {
    const now = new Date();
    const base = new Date(
      new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)
    ); // yyyy-mm-dd midnight local
    // Position base at start of DAYS week (same weekday as DAYS[0])
    const baseIdx = todayIdx >= 0 ? todayIdx : 0;
    return DAYS.map((_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + (i - baseIdx));
      return d.getDate();
    });
  }, [todayIdx, tz]);

  return (
    <div>
      {/* Screen filter chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-mw-gray-500 uppercase tracking-wide mr-1">
          Screen
        </span>
        {screens.map((s) => {
          const active = s === activeScreen;
          return (
            <button
              key={s}
              onClick={() => setActiveScreen(s)}
              className={`px-3 h-8 rounded-mw-sm text-xs font-medium border transition-colors ${
                active
                  ? 'bg-mw-blue-500 text-white border-mw-blue-500'
                  : 'bg-white text-mw-gray-700 border-mw-gray-300 hover:border-mw-blue-500'
              }`}
            >
              {s}
            </button>
          );
        })}
        <div className="ml-auto">{filterSlot}</div>
      </div>

      <div
        ref={scrollRef}
        className="relative overflow-auto rounded-mw-sm border border-mw-gray-200 bg-white"
        style={{ maxHeight: 620 }}
      >
        <div style={{ minWidth: 900 }}>
          {/* Day header row */}
          <div
            className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm grid border-b border-mw-gray-200"
            style={{ gridTemplateColumns: `${WEEK_TIME_COL}px repeat(7, 1fr)` }}
          >
            <div className="h-14 border-r border-mw-gray-200" />
            {DAYS.map((d, i) => {
              const isToday = i === todayIdx;
              return (
                <div
                  key={d}
                  className={`h-14 flex flex-col items-center justify-center border-r border-mw-gray-200 last:border-r-0 ${
                    isToday ? 'bg-mw-blue-50' : ''
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      isToday ? 'text-mw-blue-600' : 'text-mw-gray-500'
                    }`}
                  >
                    {d}
                  </span>
                  <span
                    className={`mt-0.5 text-[18px] leading-none font-semibold ${
                      isToday
                        ? 'bg-mw-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center'
                        : 'text-mw-gray-800'
                    }`}
                  >
                    {weekDates[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time grid body */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `${WEEK_TIME_COL}px repeat(7, 1fr)`,
              height: gridHeight
            }}
          >
            {/* Left time axis */}
            <div className="relative border-r border-mw-gray-200">
              {hours.map((m, i) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 text-[10px] text-mw-gray-500 font-medium pr-2 text-right"
                  style={{ top: i * WEEK_HOUR_HEIGHT - 6 }}
                >
                  {i === 0 ? '' : formatHour(m)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day, dayIdx) => {
              const isToday = dayIdx === todayIdx;
              return (
                <div
                  key={day}
                  className={`relative border-r border-mw-gray-200 last:border-r-0 ${
                    isToday ? 'bg-mw-blue-50/30' : ''
                  }`}
                >
                  {/* Horizontal hour lines */}
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-mw-gray-100"
                      style={{ top: i * WEEK_HOUR_HEIGHT }}
                    />
                  ))}
                  {/* Half-hour dashed line */}
                  {hours.map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute left-0 right-0 border-t border-dashed border-mw-gray-100"
                      style={{ top: i * WEEK_HOUR_HEIGHT + WEEK_HOUR_HEIGHT / 2 }}
                    />
                  ))}

                  {/* Session blocks */}
                  {sessions.map((s) => {
                    const { start, end } = sessionRange(s);
                    if (end <= DAY_START || start >= DAY_END) return null;
                    const top =
                      ((Math.max(start, DAY_START) - DAY_START) / TIMELINE_SPAN) *
                      gridHeight;
                    const height =
                      ((Math.min(end, DAY_END) - Math.max(start, DAY_START)) /
                        TIMELINE_SPAN) *
                      gridHeight;
                    const pct = fillPct(s);
                    const t = availabilityTone(pct);
                    const tone =
                      t === 'red'
                        ? { bg: 'bg-mw-red-100', accent: 'bg-mw-red-500', text: 'text-mw-red-500', border: 'border-mw-red-500/30 hover:border-mw-red-500' }
                        : t === 'amber'
                          ? { bg: 'bg-mw-amber-100', accent: 'bg-mw-amber-500', text: 'text-mw-amber-500', border: 'border-mw-amber-500/30 hover:border-mw-amber-500' }
                          : { bg: 'bg-mw-green-100', accent: 'bg-mw-green-500', text: 'text-mw-green-500', border: 'border-mw-green-500/30 hover:border-mw-green-500' };

                    return (
                      <button
                        key={s.id + day}
                        onClick={() => onSelect(s)}
                        className={`group absolute left-1 right-1 rounded-md border ${tone.bg} ${tone.border} text-left transition-all duration-150 hover:shadow-mw-card hover:-translate-y-[1px] hover:z-30 focus:outline-none focus:ring-2 focus:ring-mw-blue-500`}
                        style={{ top, height: Math.max(height - 2, 22) }}
                      >
                        <span
                          className={`absolute left-0 top-0 bottom-0 w-0.5 ${tone.accent}`}
                        />
                        <div className="pl-2 pr-1 py-1 h-full flex flex-col overflow-hidden">
                          <p className="text-[11px] font-semibold text-mw-gray-900 truncate leading-tight">
                            {s.film}
                          </p>
                          <p className="text-[10px] text-mw-gray-600 truncate leading-tight mt-0.5">
                            {s.start} – {s.end}
                          </p>
                          {height > 54 && (
                            <div className="mt-auto flex items-center justify-between gap-1">
                              <span
                                className={`text-[10px] font-semibold ${tone.text}`}
                              >
                                {pct}% booked
                              </span>
                              {adsForSession(s).length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-1.5 py-0.5">
                                  <Megaphone size={8} />
                                  {adsForSession(s).length}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <SessionAdsTooltip session={s} align="left" placement="top" />
                      </button>
                    );
                  })}

                  {/* NOW line — only on today */}
                  {isToday && nowPct !== null && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: nowPct * gridHeight }}
                    >
                      <div className="relative h-0">
                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-mw-red-500 ring-2 ring-white shadow-mw-card" />
                        <div className="h-0.5 w-full bg-mw-red-500" />
                        <div className="absolute right-1 -top-6 text-[10px] font-semibold text-white bg-mw-red-500 px-1.5 py-0.5 rounded shadow-mw-card flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {nowLabel}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-mw-gray-400 mt-3 flex items-center gap-1.5">
        <Sparkles size={11} /> Showing <span className="font-medium text-mw-gray-600">{activeScreen}</span> for the full week. Click any session to schedule.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MONTH — calendar heatmap                                             */
/* ------------------------------------------------------------------ */

type MonthCell = {
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
};

function buildMonthGrid(anchor: Date): MonthCell[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const cells: MonthCell[] = [];

  // Leading days from previous month
  if (startDay > 0) {
    const daysInPrev = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const date = new Date(year, month - 1, d);
      cells.push(makeCell(date, false, todayKey));
    }
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push(makeCell(date, true, todayKey));
  }

  // Trailing days from next month — pad to 6 rows (42 cells) so the grid
  // height stays constant month-to-month
  let nextDay = 1;
  while (cells.length < 42) {
    const date = new Date(year, month + 1, nextDay++);
    cells.push(makeCell(date, false, todayKey));
  }

  return cells;
}

function makeCell(date: Date, inMonth: boolean, todayKey: string): MonthCell {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const dow = date.getDay();
  return {
    date,
    day: date.getDate(),
    inMonth,
    isToday: key === todayKey,
    isWeekend: dow === 0 || dow === 6
  };
}

function MonthHeatmap({
  currency,
  onPickDay,
  filterSlot
}: {
  currency: string;
  onPickDay: (date: Date) => void;
  filterSlot?: React.ReactNode;
}) {
  const [anchor, setAnchor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  const cells = useMemo(() => buildMonthGrid(anchor), [anchor]);

  // Deterministic mock booking % per date, month-aware so navigation changes the map
  const fillFor = (date: Date) => {
    const seed =
      (date.getFullYear() * 73 +
        (date.getMonth() + 1) * 31 +
        date.getDate() * 17) %
      90;
    return Math.max(8, seed + 5);
  };
  const sessionsFor = (date: Date) => {
    const dow = date.getDay();
    const base = dow === 0 || dow === 6 ? 38 : 24;
    return base + ((date.getDate() * 7) % 9);
  };

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
      }).format(anchor),
    [anchor]
  );

  const prev = () =>
    setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1));
  const next = () =>
    setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1));
  const today = () => {
    const t = new Date();
    setAnchor(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  // Month summary
  const monthDays = cells.filter((c) => c.inMonth);
  const avgOpenPct = monthDays.length
    ? Math.round(
        monthDays.reduce((a, c) => a + (100 - fillFor(c.date)), 0) /
          monthDays.length
      )
    : 0;
  const totalSessions = monthDays.reduce(
    (a, c) => a + sessionsFor(c.date),
    0
  );
  const est = Math.round(totalSessions * avgOpenPct * 0.12);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-mw-sm border border-mw-gray-300 bg-white overflow-hidden">
            <button
              onClick={prev}
            className="w-9 h-9 text-mw-gray-600 hover:bg-mw-gray-50 flex items-center justify-center border-r border-mw-gray-200"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 px-3 h-9 text-sm text-mw-gray-800">
            <CalendarDays size={14} className="text-mw-gray-500" />
            <span className="font-semibold whitespace-nowrap">{monthLabel}</span>
          </div>
          <button
            onClick={next}
            className="w-9 h-9 text-mw-gray-600 hover:bg-mw-gray-50 flex items-center justify-center border-l border-mw-gray-200"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={today}
            className="h-9 px-3 text-sm font-medium text-mw-blue-600 hover:bg-mw-blue-50 border-l border-mw-gray-200"
          >
            Today
          </button>
          </div>
          {filterSlot}
        </div>

        <div className="flex items-center gap-4 text-xs text-mw-gray-500">
          <span>
            Sessions{' '}
            <span className="font-semibold text-mw-gray-800">{totalSessions}</span>
          </span>
          <span>
            Opportunity{' '}
            <span className="font-semibold text-mw-gray-800">
              {currency} {est.toLocaleString()}
            </span>
          </span>
          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-green-500" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-amber-500" /> Partial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mw-red-500" /> Sold out
            </span>
          </div>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border border-mw-gray-200 rounded-t-mw-sm bg-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div
            key={d}
            className={`h-10 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wide ${
              i === 0 || i === 6 ? 'text-mw-blue-600' : 'text-mw-gray-500'
            } ${i < 6 ? 'border-r border-mw-gray-200' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid body — clean calendar cells with corner availability dot */}
      <div className="grid grid-cols-7 border-x border-b border-mw-gray-200 rounded-b-mw-sm overflow-hidden bg-white">
        {cells.map((c, i) => {
          const pct = fillFor(c.date);
          const sessions = sessionsFor(c.date);
          const daySummary = c.inMonth ? adsForDay(c.date) : null;
          const tone = availabilityTone(pct);
          const dotClass =
            tone === 'red'
              ? 'bg-mw-red-500'
              : tone === 'amber'
                ? 'bg-mw-amber-500'
                : 'bg-mw-green-500';
          const row = Math.floor(i / 7);
          const col = i % 7;
          return (
            <button
              key={i}
              onClick={() => onPickDay(c.date)}
              className={`group relative min-h-[104px] p-2.5 text-left flex flex-col transition-colors focus:outline-none focus:z-10 hover:z-20 ${
                col < 6 ? 'border-r border-mw-gray-100' : ''
              } ${row < 5 ? 'border-b border-mw-gray-100' : ''} ${
                c.inMonth
                  ? 'bg-white hover:bg-mw-blue-50/40'
                  : 'bg-mw-gray-50/40 hover:bg-mw-gray-50'
              }`}
            >
              {/* Header row: date number + availability dot */}
              <div className="flex items-start justify-between">
                <span
                  className={`text-[13px] font-semibold inline-flex items-center justify-center leading-none ${
                    c.isToday
                      ? 'bg-mw-blue-500 text-white rounded-full w-7 h-7'
                      : c.inMonth
                        ? c.isWeekend
                          ? 'text-mw-blue-600'
                          : 'text-mw-gray-900'
                        : 'text-mw-gray-400'
                  }`}
                >
                  {c.day}
                </span>
                {c.inMonth && (
                  <span
                    className={`w-2 h-2 rounded-full ${dotClass} mt-1.5 ring-2 ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]`}
                  />
                )}
              </div>

              {/* Footer: % and shows + ads */}
              {c.inMonth && (
                <div className="mt-auto space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        tone === 'red'
                          ? 'text-mw-red-500'
                          : tone === 'amber'
                            ? 'text-mw-amber-500'
                            : 'text-mw-green-500'
                      }`}
                    >
                      {pct}%
                    </span>
                    <span className="text-mw-gray-500">{sessions} shows</span>
                  </div>
                  {daySummary && daySummary.total > 0 && (
                    <div className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-1.5 py-0.5">
                      <Megaphone size={8} />
                      {daySummary.total} ads
                    </div>
                  )}
                </div>
              )}
              {c.inMonth && daySummary && (
                <DayAdsTooltip
                  date={c.date}
                  summary={daySummary}
                  align={col >= 5 ? 'right' : col <= 1 ? 'left' : 'center'}
                  placement={row >= 4 ? 'top' : 'bottom'}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-mw-gray-400 mt-3 flex items-center gap-1.5">
        <Sparkles size={11} /> Click any day to jump into its hour-by-hour timeline.
      </p>
    </div>
  );
}

function heatColor(pct: number) {
  if (pct >= 80) return 'rgba(220,38,38,0.18)';
  if (pct >= 60) return 'rgba(245,158,11,0.18)';
  if (pct >= 40) return 'rgba(20,184,166,0.15)';
  if (pct >= 20) return 'rgba(29,101,175,0.10)';
  return 'rgba(148,163,184,0.10)';
}

/* ------------------------------------------------------------------ */
/* YEAR — 12 month cards                                                */
/* ------------------------------------------------------------------ */

function YearSummary({
  currency,
  filterSlot
}: {
  currency: string;
  filterSlot?: React.ReactNode;
}) {
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2026, i, 1))
  );
  const fills = [42, 51, 58, 63, 67, 71, 74, 69, 62, 58, 65, 78];
  const revenue = fills.map((f) => Math.round(f * 3.6));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 h-9 px-3 rounded-mw-sm border border-mw-gray-300 bg-white text-sm text-mw-gray-800">
            <CalendarDays size={14} className="text-mw-gray-500" />
            <span className="font-semibold">2026</span>
          </div>
          {filterSlot}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((m, i) => (
          <div
            key={m}
            className="rounded-mw-sm border border-mw-gray-200 p-4 hover:border-mw-blue-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-mw-gray-900">{m} 2026</p>
              <Badge
                tone={fills[i] >= 70 ? 'orange' : fills[i] >= 50 ? 'teal' : 'blue'}
              >
                {fills[i]}%
              </Badge>
            </div>
            <ProgressBar
              value={fills[i]}
              tone={fills[i] >= 70 ? 'orange' : fills[i] >= 50 ? 'teal' : 'blue'}
            />
            <div className="mt-3 flex items-center justify-between text-[11px] text-mw-gray-500">
              <span>Revenue</span>
              <span className="font-semibold text-mw-gray-800">
                {currency} {revenue[i]}K
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule drawer                                                      */
/* ------------------------------------------------------------------ */

function ScheduleDrawer({
  session,
  market,
  onClose
}: {
  session: Session | null;
  market: Market;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<'60s' | '30s'>('60s');
  const [position, setPosition] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setFormat('60s');
    setPosition(null);
    setFile(null);
  }, [session?.id]);

  if (!session) return null;

  const formatData = format === '60s' ? session.preShow60 : session.preShow30;
  const estImpressions = 182;
  const cost = Math.round((estImpressions / 1000) * market.cpm * (format === '60s' ? 2 : 1));

  return (
    <Drawer
      open={!!session}
      onClose={onClose}
      title={session.film}
      subtitle={`${session.screen} · ${session.day} ${session.start} – ${session.end}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-mw-gray-500">
            {file ? (
              <span className="text-mw-green-500 font-medium">Creative ready</span>
            ) : (
              'No creative yet'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              leftIcon={<Sparkles size={16} />}
              disabled={position === null || !file}
            >
              Schedule &amp; publish
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="Rating" value={session.rating} />
          <InfoRow label="Language" value={session.language} />
          <InfoRow label="Cinema" value="Al Jimi Mall" />
          <InfoRow label="Market" value={`${market.flag} ${market.label}`} />
        </div>

        {/* Dynamic slot inventory generated from this session */}
        <div>
          <p className="text-xs text-mw-gray-500 mb-2 uppercase tracking-wide font-semibold">
            Dynamic ad slots for this session
          </p>
          <div className="space-y-1.5">
            {slotsForSession(session.id).map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-mw-sm border border-mw-gray-200 bg-mw-gray-50/60 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    tone={slot.priceTier === 1 ? 'blue' : slot.priceTier === 2 ? 'teal' : 'gray'}
                  >
                    Tier {slot.priceTier}
                  </Badge>
                  <span className="text-sm font-medium text-mw-gray-900 truncate">
                    {slot.type === 'pre-show-60'
                      ? 'Pre-show 60s'
                      : slot.type === 'pre-show-30'
                        ? 'Pre-show 30s'
                        : 'Interval'}
                  </span>
                  {slot.programmatic && (
                    <Badge tone="green">Programmatic</Badge>
                  )}
                </div>
                <span className="text-sm font-semibold text-mw-gray-900 whitespace-nowrap">
                  AED {slot.basePrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-mw-gray-500 mt-2">
            Tier 1 sits closest to the feature and is priced highest. Interval slots appear only on long-runtime films.
          </p>
        </div>

        <div>
          <p className="text-xs text-mw-gray-500 mb-2 uppercase tracking-wide font-semibold">
            1. Choose format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['60s', '30s'] as const).map((f) => {
              const d = f === '60s' ? session.preShow60 : session.preShow30;
              const active = format === f;
              return (
                <button
                  key={f}
                  onClick={() => {
                    setFormat(f);
                    setPosition(null);
                  }}
                  className={`text-left p-3 rounded-mw-sm border transition-colors ${
                    active
                      ? 'border-mw-blue-500 bg-mw-blue-50'
                      : 'border-mw-gray-200 hover:border-mw-blue-500'
                  }`}
                >
                  <p className="text-sm font-semibold text-mw-gray-900">Pre-show {f}</p>
                  <p className="text-[11px] text-mw-gray-500 mt-0.5">
                    {d.total - d.booked} of {d.total} slots free
                  </p>
                  <div className="mt-2">
                    <ProgressBar
                      value={Math.round((d.booked / d.total) * 100)}
                      tone={active ? 'blue' : 'teal'}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-mw-gray-500 mb-2 uppercase tracking-wide font-semibold">
            2. Pick slot position
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: formatData.total }, (_, i) => {
              const booked = i < formatData.booked;
              const active = position === i;
              return (
                <button
                  key={i}
                  disabled={booked}
                  onClick={() => setPosition(i)}
                  className={`h-10 rounded-md text-[11px] font-semibold transition-colors border ${
                    booked
                      ? 'bg-mw-gray-100 text-mw-gray-400 border-mw-gray-200 cursor-not-allowed line-through'
                      : active
                        ? 'bg-mw-blue-500 text-white border-mw-blue-500'
                        : 'bg-white text-mw-gray-700 border-mw-gray-300 hover:border-mw-blue-500'
                  }`}
                >
                  #{i + 1}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-mw-gray-500 mt-2">
            Position #1 plays closest to the feature; later positions trade off for price.
          </p>
        </div>

        <div>
          <p className="text-xs text-mw-gray-500 mb-2 uppercase tracking-wide font-semibold">
            3. Upload creative
          </p>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-mw-gray-300 rounded-mw-sm p-6 cursor-pointer hover:border-mw-blue-500 hover:bg-mw-blue-50 transition-colors">
            <Upload size={22} className="text-mw-gray-400" />
            <p className="text-sm text-mw-gray-700">
              {file ? file.name : 'Click to upload MP4 / MOV'}
            </p>
            <p className="text-[11px] text-mw-gray-500">
              {format === '60s' ? '60 seconds' : '30 seconds'} · Max 250 MB · 1920×1080 recommended
            </p>
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div>
          <p className="text-xs text-mw-gray-500 mb-2 uppercase tracking-wide font-semibold">
            4. Estimated performance
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-mw-sm border border-mw-gray-200 p-3 text-center">
              <p className="text-[20px] font-semibold text-mw-blue-500">{estImpressions}</p>
              <p className="text-[11px] text-mw-gray-500">Seats</p>
            </div>
            <div className="rounded-mw-sm border border-mw-gray-200 p-3 text-center">
              <p className="text-[20px] font-semibold text-mw-teal-600">74%</p>
              <p className="text-[11px] text-mw-gray-500">Avg occupancy</p>
            </div>
            <div className="rounded-mw-sm border border-mw-gray-200 p-3 text-center">
              <p className="text-[20px] font-semibold text-mw-orange-600">
                {market.currency} {cost}
              </p>
              <p className="text-[11px] text-mw-gray-500">Est. cost</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-mw-gray-500">{label}</p>
      <p className="font-medium text-mw-gray-900">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filters — side drawer + active chips                                */
/* ------------------------------------------------------------------ */

type FilterState = {
  search: string;
  cinema: string;
  format: string;
  language: string;
  availability: string;
};

const CINEMA_OPTIONS = [
  { value: 'aljimi', label: 'Al Jimi Mall' },
  { value: 'moe', label: 'Mall of the Emirates' },
  { value: 'deira', label: 'City Centre Deira' },
  { value: 'yas', label: 'Yas Mall' }
];
const FORMAT_OPTIONS = [
  { value: 'all', label: 'All formats' },
  { value: '60s', label: 'Pre-show 60s' },
  { value: '30s', label: 'Pre-show 30s' },
  { value: 'lobby', label: 'Lobby loop' },
  { value: 'prog', label: 'Programmatic' }
];
const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'partial', label: 'Partially booked' },
  { value: 'sold', label: 'Sold out' }
];

function cinemaLabel(v: string) {
  return CINEMA_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function formatLabel(v: string) {
  return FORMAT_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function availabilityLabel(v: string) {
  return AVAILABILITY_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

function FilterToolbarSlot({
  activeCount,
  onOpen,
  filters,
  defaultFilters,
  onChange,
  onClearAll
}: {
  activeCount: number;
  onOpen: () => void;
  filters: FilterState;
  defaultFilters: FilterState;
  onChange: (f: FilterState) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-mw-sm border border-mw-gray-300 bg-white text-sm font-medium text-mw-gray-800 hover:border-mw-blue-500 hover:text-mw-blue-600 transition-colors"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-mw-blue-500 text-white text-[10px] font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      {filters.search && (
        <FilterChip
          label={`Search: ${filters.search}`}
          onRemove={() => onChange({ ...filters, search: '' })}
        />
      )}
      {filters.cinema !== defaultFilters.cinema && (
        <FilterChip
          label={`Cinema: ${cinemaLabel(filters.cinema)}`}
          onRemove={() =>
            onChange({ ...filters, cinema: defaultFilters.cinema })
          }
        />
      )}
      {filters.format !== 'all' && (
        <FilterChip
          label={`Format: ${formatLabel(filters.format)}`}
          onRemove={() => onChange({ ...filters, format: 'all' })}
        />
      )}
      {filters.language !== 'all' && (
        <FilterChip
          label={`Language: ${
            filters.language === 'en' ? 'English' : 'Arabic'
          }`}
          onRemove={() => onChange({ ...filters, language: 'all' })}
        />
      )}
      {filters.availability !== 'all' && (
        <FilterChip
          label={`Availability: ${availabilityLabel(filters.availability)}`}
          onRemove={() => onChange({ ...filters, availability: 'all' })}
        />
      )}
      {activeCount > 0 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-mw-blue-600 hover:text-mw-blue-700"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function FiltersDrawer({
  open,
  onClose,
  market,
  onMarketChange,
  filters,
  onChange,
  onReset,
  activeCount
}: {
  open: boolean;
  onClose: () => void;
  market: Market;
  onMarketChange: (m: Market) => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      subtitle={
        activeCount > 0
          ? `${activeCount} active filter${activeCount === 1 ? '' : 's'}`
          : 'Refine the inventory you see'
      }
      width="md"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            disabled={activeCount === 0}
            className="text-sm font-medium text-mw-blue-600 hover:text-mw-blue-700 disabled:text-mw-gray-400 disabled:cursor-not-allowed"
          >
            Reset all
          </button>
          <Button onClick={onClose}>Apply</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Field label="Market">
          <Select
            value={market.code}
            onChange={(e) =>
              onMarketChange(
                MARKETS.find((m) => m.code === e.target.value) || MARKETS[0]
              )
            }
            options={MARKETS.map((m) => ({
              value: m.code,
              label: `${m.flag}  ${m.label}`
            }))}
          />
          <p className="text-[11px] text-mw-gray-500 mt-1.5">
            {market.tz} · Currency {market.currency} · Ref CPM {market.currency}{' '}
            {market.cpm}
          </p>
        </Field>

        <Field label="Search">
          <Input
            placeholder="Film, screen, or cinema"
            leftIcon={<Search size={14} />}
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
        </Field>

        <Field label="Cinema">
          <Select
            value={filters.cinema}
            onChange={(e) => set('cinema', e.target.value)}
            options={CINEMA_OPTIONS}
          />
        </Field>

        <Field label="Format">
          <Select
            value={filters.format}
            onChange={(e) => set('format', e.target.value)}
            options={FORMAT_OPTIONS}
          />
        </Field>

        <Field label="Language">
          <Select
            value={filters.language}
            onChange={(e) => set('language', e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'Arabic' }
            ]}
          />
        </Field>

        <Field label="Availability">
          <Select
            value={filters.availability}
            onChange={(e) => set('availability', e.target.value)}
            options={AVAILABILITY_OPTIONS}
          />
        </Field>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk upload (CSV + API)                                             */
/* ------------------------------------------------------------------ */

interface BulkRow {
  cinema: string;
  screen: string;
  date: string;
  start: string;
  end: string;
  film: string;
  preShow60Total: number;
  preShow60Booked: number;
  preShow30Total: number;
  preShow30Booked: number;
  error?: string;
}

const AD_SLOT_CSV_TEMPLATE =
  'cinema,screen,date,start,end,film,preShow60_total,preShow60_booked,preShow30_total,preShow30_booked\n' +
  'aljimi,Screen 1,2026-05-02,10:30a,12:45p,Dune Part Three,4,2,6,3\n' +
  'aljimi,Screen 2,2026-05-02,1:00p,3:10p,Inside Out 3,4,4,6,5\n' +
  'moe,Screen 4,2026-05-02,7:15p,9:40p,The Batman II,4,1,6,2\n';

const AD_SLOT_API_PRESETS: {
  id: string;
  label: string;
  endpoint: string;
  rows: number;
}[] = [
  {
    id: 'vox',
    label: 'VOX Cinemas · /v2/inventory/slots',
    endpoint: 'https://api.voxcinemas.com/v2/inventory/slots',
    rows: 8
  },
  {
    id: 'novo',
    label: 'Novo Cinemas · /public/ads/slots',
    endpoint: 'https://novocinemas.com/public/ads/slots',
    rows: 6
  },
  {
    id: 'reel',
    label: 'Reel Cinemas · /inventory/v1/adslots',
    endpoint: 'https://reelcinemas.com/inventory/v1/adslots',
    rows: 5
  }
];

function parseAdSlotCsv(text: string): BulkRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const need = [
    'cinema',
    'screen',
    'date',
    'start',
    'end',
    'film',
    'preshow60_total',
    'preshow60_booked',
    'preshow30_total',
    'preshow30_booked'
  ];
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const row: BulkRow = {
      cinema: cols[idx('cinema')] ?? '',
      screen: cols[idx('screen')] ?? '',
      date: cols[idx('date')] ?? '',
      start: cols[idx('start')] ?? '',
      end: cols[idx('end')] ?? '',
      film: cols[idx('film')] ?? '',
      preShow60Total: Number(cols[idx('preshow60_total')] ?? 0),
      preShow60Booked: Number(cols[idx('preshow60_booked')] ?? 0),
      preShow30Total: Number(cols[idx('preshow30_total')] ?? 0),
      preShow30Booked: Number(cols[idx('preshow30_booked')] ?? 0)
    };
    const missing = need.filter((k) => idx(k) === -1);
    if (missing.length) row.error = `Missing column: ${missing[0]}`;
    else if (!row.cinema || !row.screen || !row.film) row.error = 'Incomplete row';
    else if (row.preShow60Booked > row.preShow60Total) row.error = 'Pre-show 60 over-booked';
    else if (row.preShow30Booked > row.preShow30Total) row.error = 'Pre-show 30 over-booked';
    return row;
  });
}

function BulkAdSlotDrawer({
  open,
  onClose
}: Readonly<{ open: boolean; onClose: () => void }>) {
  const [mode, setMode] = useState<'csv' | 'api'>('csv');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [preset, setPreset] = useState(AD_SLOT_API_PRESETS[0].id);
  const [endpoint, setEndpoint] = useState(AD_SLOT_API_PRESETS[0].endpoint);
  const [apiKey, setApiKey] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('csv');
    setFileName('');
    setRows([]);
    setDragOver(false);
    setPreset(AD_SLOT_API_PRESETS[0].id);
    setEndpoint(AD_SLOT_API_PRESETS[0].endpoint);
    setApiKey('');
    setSyncing(false);
    setImporting(false);
    setImported(0);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 150);
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    setImported(0);
    file.text().then((text) => {
      if (file.name.toLowerCase().endsWith('.csv')) {
        setRows(parseAdSlotCsv(text));
      } else {
        setRows(parseAdSlotCsv(AD_SLOT_CSV_TEMPLATE));
      }
    });
  };

  const onDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  };

  const downloadTemplate = () => {
    const blob = new Blob([AD_SLOT_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ad-slots-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (id: string) => {
    setPreset(id);
    const p = AD_SLOT_API_PRESETS.find((x) => x.id === id);
    if (p) setEndpoint(p.endpoint);
  };

  const runApiSync = () => {
    setSyncing(true);
    setRows([]);
    setImported(0);
    setTimeout(() => {
      const p =
        AD_SLOT_API_PRESETS.find((x) => x.id === preset) ??
        AD_SLOT_API_PRESETS[0];
      const screensPool = ['Screen 1', 'Screen 3', 'Screen 5', 'Screen 7'];
      const filmsPool = ['Dune Part Three', 'Inside Out 3', 'The Batman II', 'Mission: Horizon'];
      const cinemaPool = ['aljimi', 'moe', 'yas', 'deira'];
      const sample: BulkRow[] = Array.from({ length: p.rows }, (_, i) => ({
        cinema: cinemaPool[i % cinemaPool.length],
        screen: screensPool[i % screensPool.length],
        date: '2026-05-02',
        start: `${9 + i}:00a`,
        end: `${11 + i}:15a`,
        film: filmsPool[i % filmsPool.length],
        preShow60Total: 4,
        preShow60Booked: i % 4,
        preShow30Total: 6,
        preShow30Booked: (i * 2) % 6
      }));
      setRows(sample);
      setSyncing(false);
    }, 900);
  };

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  const runImport = () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setTimeout(() => {
      setImported(validRows.length);
      setImporting(false);
    }, 500);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Bulk upload ad slots"
      subtitle="Upload a CSV or sync directly from a provider API"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handleClose}>
            {imported > 0 ? 'Done' : 'Cancel'}
          </Button>
          <div className="text-xs text-mw-gray-500">
            {rows.length > 0 && (
              <span>
                {validRows.length} ready · {invalidRows.length} invalid
              </span>
            )}
          </div>
          <Button
            onClick={runImport}
            disabled={importing || validRows.length === 0 || imported > 0}
            leftIcon={<Check size={14} />}
          >
            {(() => {
              if (importing) return 'Importing…';
              if (imported > 0) return `Imported ${imported}`;
              return `Import ${validRows.length || ''}`;
            })()}
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <Tabs
          tabs={[
            { label: 'CSV upload', value: 'csv' },
            { label: 'API sync', value: 'api' }
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v as 'csv' | 'api');
            setRows([]);
            setImported(0);
          }}
        />
      </div>

      {mode === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-mw-gray-500">
              Columns: cinema, screen, date, start, end, film, preShow60_total,
              preShow60_booked, preShow30_total, preShow30_booked
            </p>
            <button
              onClick={downloadTemplate}
              className="text-xs font-medium text-mw-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <Download size={12} /> Template.csv
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`w-full rounded-mw border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragOver
                ? 'border-mw-blue-500 bg-mw-blue-50'
                : 'border-mw-gray-300 hover:border-mw-blue-500 hover:bg-mw-blue-50/50'
            }`}
          >
            <FileSpreadsheet
              size={28}
              className="mx-auto text-mw-gray-400 mb-2"
            />
            <p className="text-sm font-medium text-mw-gray-800">
              {fileName || 'Drop CSV file here or click to browse'}
            </p>
            <p className="text-[11px] text-mw-gray-500 mt-1">
              Accepted: .csv · up to 5 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
              }}
            />
          </button>
        </div>
      )}

      {mode === 'api' && (
        <div className="space-y-4">
          <Field label="Provider">
            <Select
              value={preset}
              onChange={(e) => loadPreset(e.target.value)}
              options={AD_SLOT_API_PRESETS.map((p) => ({
                value: p.id,
                label: p.label
              }))}
            />
          </Field>
          <Field label="Endpoint" hint="GET — JSON array of slot objects">
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              leftIcon={<Link2 size={14} />}
            />
          </Field>
          <Field label="API key" hint="Sent as Authorization: Bearer …">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_••••••••••"
              type="password"
            />
          </Field>
          <Button
            variant="secondary"
            onClick={runApiSync}
            disabled={syncing}
            leftIcon={<Plug size={14} />}
          >
            {syncing ? 'Syncing…' : 'Sync slots'}
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-5 rounded-mw border border-mw-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-mw-gray-50 border-b border-mw-gray-200 flex items-center justify-between">
            <p className="text-xs font-semibold text-mw-gray-700">
              Preview · {rows.length} rows
            </p>
            <button
              onClick={() => {
                setRows([]);
                setFileName('');
                setImported(0);
              }}
              className="text-[11px] text-mw-gray-500 hover:text-mw-red-500 inline-flex items-center gap-1"
            >
              <Trash2 size={11} /> Clear
            </button>
          </div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-white border-b border-mw-gray-200 sticky top-0">
                <tr className="text-mw-gray-500">
                  <th className="text-left font-semibold px-3 py-2">Cinema</th>
                  <th className="text-left font-semibold px-3 py-2">Screen</th>
                  <th className="text-left font-semibold px-3 py-2">Date</th>
                  <th className="text-left font-semibold px-3 py-2">Time</th>
                  <th className="text-left font-semibold px-3 py-2">Film</th>
                  <th className="text-left font-semibold px-3 py-2">60s</th>
                  <th className="text-left font-semibold px-3 py-2">30s</th>
                  <th className="text-left font-semibold px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.cinema}-${r.screen}-${r.start}-${i}`}
                    className={`border-b border-mw-gray-100 ${
                      r.error ? 'bg-mw-red-100/30' : ''
                    }`}
                  >
                    <td className="px-3 py-1.5 text-mw-gray-800">{r.cinema}</td>
                    <td className="px-3 py-1.5 text-mw-gray-800">{r.screen}</td>
                    <td className="px-3 py-1.5 text-mw-gray-600">{r.date}</td>
                    <td className="px-3 py-1.5 text-mw-gray-600">
                      {r.start}–{r.end}
                    </td>
                    <td className="px-3 py-1.5 text-mw-gray-800">{r.film}</td>
                    <td className="px-3 py-1.5 text-mw-gray-600">
                      {r.preShow60Booked}/{r.preShow60Total}
                    </td>
                    <td className="px-3 py-1.5 text-mw-gray-600">
                      {r.preShow30Booked}/{r.preShow30Total}
                    </td>
                    <td className="px-3 py-1.5">
                      {r.error ? (
                        <Badge tone="red">{r.error}</Badge>
                      ) : (
                        <Badge tone="green">Ready</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {imported > 0 && (
        <div className="mt-4 rounded-mw border border-mw-green-500/30 bg-mw-green-100/40 px-4 py-3 text-xs text-mw-gray-700 flex items-center gap-2">
          <Check size={14} className="text-mw-green-500" />
          Successfully imported {imported} ad slot
          {imported === 1 ? '' : 's'} from {mode === 'csv' ? fileName || 'CSV' : 'API'}.
        </div>
      )}
    </Drawer>
  );
}
