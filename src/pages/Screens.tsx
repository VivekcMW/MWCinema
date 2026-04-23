import { useMemo, useRef, useState } from 'react';
import {
  Monitor,
  Plus,
  Download,
  Search,
  LayoutGrid,
  List as ListIcon,
  Volume2,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Edit3,
  MoreVertical,
  Film as FilmIcon,
  RefreshCw,
  Upload,
  FileSpreadsheet,
  Link2,
  Zap,
  Check,
  SlidersHorizontal,
  X as XIcon
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Drawer,
  Field,
  Input,
  LineChart,
  PageHeader,
  ProgressBar,
  Select,
  StatCard,
  Tabs,
  FilterChip
} from '../components/ui';
import type { Column } from '../components/ui';
import { cinemas, weekSessions } from '../data/mock';

/* ------------------------------------------------------------------ */
/* Types + mock data                                                   */
/* ------------------------------------------------------------------ */

type ScreenFormat = 'Standard' | 'Premium' | 'IMAX' | '4DX';
type ScreenStatus = 'Active' | 'Maintenance' | 'Offline';
type SoundSystem = 'Dolby Atmos' | 'DTS:X' | '7.1 Surround';
type Projection = 'RGB Laser' | 'Laser' | 'Xenon';
type Seating = 'Stadium' | 'Recliner' | 'Flat';

interface Screen {
  id: string;
  name: string;
  cinemaCode: string;
  cinema: string;
  city: string;
  capacity: number;
  format: ScreenFormat;
  status: ScreenStatus;
  sound: SoundSystem;
  projection: Projection;
  resolution: '2K' | '4K';
  seating: Seating;
  lastShow: string;
  uptime: number;
  techIssues: number;
  adSuccess: number;
}

const FORMATS: ScreenFormat[] = ['Standard', 'Premium', 'IMAX', '4DX'];
const STATUSES: ScreenStatus[] = ['Active', 'Maintenance', 'Offline'];

function makeScreens(): Screen[] {
  const out: Screen[] = [];
  let idSeed = 1;
  cinemas.forEach((c) => {
    for (let n = 1; n <= c.screens; n++) {
      const isImax = n === 2 || n === 6;
      const isPremium = n === 7;
      const is4dx = c.screens >= 12 && n === c.screens;
      const format: ScreenFormat = is4dx
        ? '4DX'
        : isImax
          ? 'IMAX'
          : isPremium
            ? 'Premium'
            : 'Standard';
      const capacity =
        format === 'IMAX'
          ? 240 + ((n * 7) % 40)
          : format === 'Premium'
            ? 120 + ((n * 3) % 30)
            : format === '4DX'
              ? 96
              : 140 + ((n * 11) % 60);
      const status: ScreenStatus =
        n === c.screens && c.code === '0037'
          ? 'Maintenance'
          : n === 3 && c.code === '0029'
            ? 'Offline'
            : 'Active';
      out.push({
        id: `SCR-${idSeed++}`,
        name: `Screen ${n}`,
        cinemaCode: c.code,
        cinema: c.name,
        city: c.city,
        capacity,
        format,
        status,
        sound:
          format === 'IMAX'
            ? 'Dolby Atmos'
            : format === 'Premium'
              ? 'DTS:X'
              : '7.1 Surround',
        projection:
          format === 'IMAX' || format === '4DX'
            ? 'RGB Laser'
            : format === 'Premium'
              ? 'Laser'
              : 'Xenon',
        resolution: format === 'IMAX' || format === 'Premium' ? '4K' : '2K',
        seating:
          format === 'Premium' || format === '4DX' ? 'Recliner' : 'Stadium',
        lastShow: `Today, ${1 + (n % 9)}:${(15 * n) % 60 === 0 ? '00' : ((15 * n) % 60).toString().padStart(2, '0')}p`,
        uptime: 94 + ((n * 7) % 6) + (status === 'Offline' ? -15 : 0),
        techIssues:
          status === 'Offline' ? 3 : status === 'Maintenance' ? 1 : (n * 2) % 2,
        adSuccess: status === 'Active' ? 96 + (n % 4) : 72
      });
    }
  });
  return out;
}

const ALL_SCREENS = makeScreens();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatTone(f: ScreenFormat): 'orange' | 'teal' | 'blue' | 'gray' {
  if (f === 'IMAX') return 'orange';
  if (f === 'Premium') return 'teal';
  if (f === '4DX') return 'blue';
  return 'gray';
}

function statusTone(s: ScreenStatus): 'green' | 'amber' | 'red' {
  if (s === 'Active') return 'green';
  if (s === 'Maintenance') return 'amber';
  return 'red';
}

function health(s: Screen): { tone: 'green' | 'amber' | 'red'; label: string } {
  if (s.status === 'Offline' || s.uptime < 90)
    return { tone: 'red', label: 'Critical' };
  if (s.status === 'Maintenance' || s.techIssues > 0 || s.uptime < 97)
    return { tone: 'amber', label: 'Warning' };
  return { tone: 'green', label: 'Healthy' };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Screens() {
  const [list, setList] = useState<Screen[]>(ALL_SCREENS);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [cinemaCode, setCinemaCode] = useState('all');
  const [format, setFormat] = useState<'all' | ScreenFormat>('all');
  const [status, setStatus] = useState<'all' | ScreenStatus>('all');
  const [selected, setSelected] = useState<Screen | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Screen | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return list.filter((s) => {
      if (
        search &&
        !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.cinema.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (cinemaCode !== 'all' && s.cinemaCode !== cinemaCode) return false;
      if (format !== 'all' && s.format !== format) return false;
      if (status !== 'all' && s.status !== status) return false;
      return true;
    });
  }, [list, search, cinemaCode, format, status]);

  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((s) => s.status === 'Active').length;
    const premium = list.filter(
      (s) => s.format !== 'Standard'
    ).length;
    return { total, active, premium };
  }, [list]);

  const handleUpsert = (s: Screen, isNew: boolean) => {
    if (isNew) setList((prev) => [s, ...prev]);
    else setList((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    setAddOpen(false);
    setEditing(null);
  };

  const activeFilterCount =
    (cinemaCode !== 'all' ? 1 : 0) +
    (format !== 'all' ? 1 : 0) +
    (status !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setCinemaCode('all');
    setFormat('all');
    setStatus('all');
  };

  const exportCsv = () => {
    const rows = [
      [
        'ID',
        'Screen',
        'Cinema',
        'City',
        'Format',
        'Capacity',
        'Status',
        'Uptime %',
        'Ad success %'
      ].join(',')
    ];
    filtered.forEach((s) => {
      rows.push(
        [
          s.id,
          s.name,
          s.cinema,
          s.city,
          s.format,
          s.capacity,
          s.status,
          s.uptime,
          s.adSuccess
        ].join(',')
      );
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screens.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Screens"
        subtitle="All screens across cinemas with live health & playback signals"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Screens' }]}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Download size={14} />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Upload size={14} />}
              onClick={() => setBulkOpen(true)}
            >
              Bulk import
            </Button>
            <Button
              leftIcon={<Plus size={14} />}
              onClick={() => setAddOpen(true)}
            >
              Add screen
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total screens"
          value={stats.total}
          icon={<Monitor size={18} />}
        />
        <StatCard
          label="Active now"
          value={stats.active}
          helper={`${stats.total - stats.active} offline / maintenance`}
          icon={<CheckCircle2 size={18} />}
          tone="teal"
        />
        <StatCard
          label="Premium / IMAX / 4DX"
          value={stats.premium}
          helper={`${Math.round((stats.premium / stats.total) * 100)}% of fleet`}
          icon={<FilmIcon size={18} />}
          tone="gray"
        />
      </div>

      {/* Filters toolbar */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by screen or cinema"
                leftIcon={<Search size={14} />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setFiltersOpen(true)}
              >
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-white text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-mw-gray-500 hover:text-mw-gray-800 inline-flex items-center gap-1"
                >
                  <XIcon size={12} />
                  Clear
                </button>
              )}
              <div className="flex gap-1 rounded-mw-sm border border-mw-gray-200 p-1 ml-auto lg:ml-2">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 h-8 rounded-mw-sm text-xs font-medium flex items-center gap-1.5 ${
                    view === 'grid'
                      ? 'bg-mw-blue-500 text-white'
                      : 'text-mw-gray-600 hover:bg-mw-gray-100'
                  }`}
                >
                  <LayoutGrid size={13} />
                  Grid
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`px-3 h-8 rounded-mw-sm text-xs font-medium flex items-center gap-1.5 ${
                    view === 'table'
                      ? 'bg-mw-blue-500 text-white'
                      : 'text-mw-gray-600 hover:bg-mw-gray-100'
                  }`}
                >
                  <ListIcon size={13} />
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="pt-3 mt-3 border-t border-mw-gray-200 flex flex-wrap gap-1.5">
              {cinemaCode !== 'all' && (
                <FilterChip
                  label={`Cinema: ${cinemas.find((c) => c.code === cinemaCode)?.name ?? cinemaCode}`}
                  onRemove={() => setCinemaCode('all')}
                />
              )}
              {format !== 'all' && (
                <FilterChip
                  label={`Format: ${format}`}
                  onRemove={() => setFormat('all')}
                />
              )}
              {status !== 'all' && (
                <FilterChip
                  label={`Status: ${status}`}
                  onRemove={() => setStatus('all')}
                />
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        subtitle="Narrow down the screens list"
        width="md"
        footer={
          <div className="flex items-center justify-between">
            <button
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="text-xs font-medium text-mw-gray-500 hover:text-mw-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
            <Button onClick={() => setFiltersOpen(false)}>
              Show {filtered.length} screen{filtered.length === 1 ? '' : 's'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Field label="Cinema">
            <Select
              value={cinemaCode}
              onChange={(e) => setCinemaCode(e.target.value)}
              options={[
                { value: 'all', label: 'All cinemas' },
                ...cinemas.map((c) => ({ value: c.code, label: c.name }))
              ]}
            />
          </Field>
          <div>
            <p className="text-[11px] font-medium text-mw-gray-500 mb-1.5">
              Format
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...FORMATS] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 h-8 rounded-full text-xs font-medium border transition-colors ${
                    format === f
                      ? 'bg-mw-blue-500 text-white border-mw-blue-500'
                      : 'bg-white text-mw-gray-600 border-mw-gray-200 hover:border-mw-blue-500'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-mw-gray-500 mb-1.5">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...STATUSES] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 h-8 rounded-full text-xs font-medium border transition-colors ${
                    status === st
                      ? 'bg-mw-blue-500 text-white border-mw-blue-500'
                      : 'bg-white text-mw-gray-600 border-mw-gray-200 hover:border-mw-blue-500'
                  }`}
                >
                  {st === 'all' ? 'Any' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Monitor className="mx-auto text-mw-gray-300" size={40} />
            <p className="mt-3 text-sm font-semibold text-mw-gray-900">
              No screens match your filters
            </p>
            <p className="text-xs text-mw-gray-500 mt-1">
              Try broadening the filters or clearing the search.
            </p>
          </CardBody>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ScreenCard
              key={s.id}
              screen={s}
              onOpen={() => setSelected(s)}
              onEdit={() => setEditing(s)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <DataTable
            columns={tableCols(setSelected)}
            rows={filtered}
            rowKey={(r) => r.id}
          />
        </Card>
      )}

      <ScreenDetailDrawer
        screen={selected}
        onClose={() => setSelected(null)}
        onEdit={(s) => {
          setSelected(null);
          setEditing(s);
        }}
      />

      <EditScreenDrawer
        open={addOpen || editing !== null}
        initial={editing}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
        }}
        onSave={(s, isNew) => handleUpsert(s, isNew)}
      />

      <BulkImportScreensDrawer
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        existingIds={list.map((s) => s.id)}
        existingKeys={list.map((s) => `${s.cinemaCode}::${s.name.toLowerCase()}`)}
        onImport={(rows) => {
          setList((prev) => [...rows, ...prev]);
          setBulkOpen(false);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Screen card (grid view)                                             */
/* ------------------------------------------------------------------ */

function ScreenCard({
  screen,
  onOpen,
  onEdit
}: {
  screen: Screen;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const h = health(screen);
  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-mw shadow-mw-card border border-mw-gray-100 hover:border-mw-blue-500 hover:shadow-mw-pop transition-all overflow-hidden group"
    >
      {/* Hero strip */}
      <div className="h-20 bg-mw-blue-500 relative flex items-center justify-center">
        <Monitor className="text-white/90" size={38} />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Badge tone={formatTone(screen.format)}>{screen.format}</Badge>
        </div>
        <div className="absolute bottom-2 left-3 text-white">
          <p className="text-[11px] uppercase tracking-wide opacity-80">
            {screen.cinema}
          </p>
          <p className="text-base font-semibold leading-tight">{screen.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                h.tone === 'green'
                  ? 'bg-mw-green-500'
                  : h.tone === 'amber'
                    ? 'bg-mw-amber-500'
                    : 'bg-mw-red-500'
              }`}
            />
            <span className="text-xs font-medium text-mw-gray-700">
              {h.label}
            </span>
          </div>
          <Badge tone={statusTone(screen.status)}>{screen.status}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-[10px] text-mw-gray-400 uppercase">Capacity</p>
            <p className="font-semibold text-mw-gray-900">{screen.capacity}</p>
          </div>
          <div>
            <p className="text-[10px] text-mw-gray-400 uppercase">Uptime 30d</p>
            <p className="font-semibold text-mw-gray-900">{screen.uptime}%</p>
          </div>
          <div>
            <p className="text-[10px] text-mw-gray-400 uppercase">Ad success</p>
            <p className="font-semibold text-mw-gray-900">{screen.adSuccess}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-mw-gray-100">
          <div className="flex items-center gap-1 text-[11px] text-mw-gray-500">
            <Clock size={11} />
            {screen.lastShow}
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onEdit();
              }
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-mw-gray-400 hover:text-mw-blue-600"
          >
            <Edit3 size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Table columns                                                       */
/* ------------------------------------------------------------------ */

function tableCols(onOpen: (s: Screen) => void): Column<Screen>[] {
  return [
    {
      key: 'name',
      header: 'Screen',
      render: (r) => (
        <button
          onClick={() => onOpen(r)}
          className="flex items-center gap-2 text-left"
        >
          <Monitor size={14} className="text-mw-gray-400" />
          <div>
            <p className="font-medium text-mw-gray-900 hover:text-mw-blue-600">
              {r.name}
            </p>
            <p className="text-[11px] text-mw-gray-500">{r.id}</p>
          </div>
        </button>
      )
    },
    {
      key: 'cinema',
      header: 'Cinema',
      render: (r) => (
        <div>
          <p className="text-sm text-mw-gray-900">{r.cinema}</p>
          <p className="text-[11px] text-mw-gray-500">{r.city}</p>
        </div>
      )
    },
    {
      key: 'format',
      header: 'Format',
      render: (r) => <Badge tone={formatTone(r.format)}>{r.format}</Badge>
    },
    { key: 'capacity', header: 'Capacity' },
    {
      key: 'uptime',
      header: 'Uptime',
      render: (r) => (
        <span
          className={`text-xs font-semibold ${
            r.uptime >= 97
              ? 'text-mw-green-500'
              : r.uptime >= 90
                ? 'text-mw-amber-500'
                : 'text-mw-red-500'
          }`}
        >
          {r.uptime}%
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>
    },
    {
      key: 'actions' as keyof Screen,
      header: '',
      className: 'w-10',
      render: (r) => (
        <button
          onClick={() => onOpen(r)}
          className="text-mw-gray-400 hover:text-mw-blue-600"
        >
          <MoreVertical size={14} />
        </button>
      )
    }
  ];
}

/* ------------------------------------------------------------------ */
/* Detail drawer                                                       */
/* ------------------------------------------------------------------ */

function ScreenDetailDrawer({
  screen,
  onClose,
  onEdit
}: {
  screen: Screen | null;
  onClose: () => void;
  onEdit: (s: Screen) => void;
}) {
  const [tab, setTab] = useState('overview');

  if (!screen) return null;
  const h = health(screen);

  const sessionsForScreen = weekSessions.filter(
    (s) => s.cinema === screen.cinemaCode && s.screen === screen.name
  );

  // Fake 30-day ad playback trend
  const trend = Array.from({ length: 30 }, (_, i) => {
    const base = screen.adSuccess;
    const jitter =
      screen.status === 'Active'
        ? Math.round(Math.sin(i / 3) * 2)
        : Math.round(Math.sin(i / 2) * 6 - 4);
    return Math.min(100, Math.max(60, base + jitter));
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${screen.cinema} · ${screen.name}`}
      subtitle={`${screen.format} · ${screen.city}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-mw-gray-500">{screen.id}</span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button leftIcon={<Edit3 size={14} />} onClick={() => onEdit(screen)}>
              Edit screen
            </Button>
          </div>
        </div>
      }
    >
      {/* Top strip */}
      <div className="rounded-mw bg-mw-blue-500 p-5 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide opacity-80">
              {screen.cinema}
            </p>
            <h3 className="text-2xl font-semibold">{screen.name}</h3>
            <div className="mt-2 flex gap-2">
              <Badge tone={formatTone(screen.format)}>{screen.format}</Badge>
              <Badge tone={statusTone(screen.status)}>{screen.status}</Badge>
              <Badge tone={h.tone === 'red' ? 'red' : h.tone === 'amber' ? 'amber' : 'green'}>
                {h.label}
              </Badge>
            </div>
          </div>
          <Monitor size={56} className="opacity-30" />
        </div>
      </div>

      <Tabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Ad playback', value: 'playback' },
          { label: 'Technical', value: 'tech' },
          {
            label: 'Schedule',
            value: 'schedule',
            count: sessionsForScreen.length
          }
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="pt-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Capacity" value={screen.capacity} />
              <MiniStat label="Uptime 30d" value={`${screen.uptime}%`} />
              <MiniStat label="Ad success" value={`${screen.adSuccess}%`} />
              <MiniStat
                label="Tech issues"
                value={screen.techIssues}
                tone={screen.techIssues > 0 ? 'red' : 'default'}
              />
              <MiniStat label="Last show" value={screen.lastShow} />
            </div>

            <div>
              <p className="text-xs font-semibold text-mw-gray-900 mb-2">
                Specifications
              </p>
              <div className="rounded-mw border border-mw-gray-200 divide-y divide-mw-gray-100">
                <SpecRow
                  icon={<Volume2 size={14} />}
                  label="Sound"
                  value={screen.sound}
                />
                <SpecRow
                  icon={<Cpu size={14} />}
                  label="Projection"
                  value={`${screen.projection} · ${screen.resolution}`}
                />
                <SpecRow
                  icon={<LayoutGrid size={14} />}
                  label="Seating"
                  value={screen.seating}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'playback' && (
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Ad playback success"
                subtitle="Last 30 days, daily %"
              />
              <CardBody>
                <LineChart
                  height={220}
                  data={{
                    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
                    datasets: [
                      {
                        label: 'Success %',
                        data: trend,
                        borderColor: '#1D65AF',
                        backgroundColor: 'rgba(29,101,175,0.15)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    scales: { y: { min: 60, max: 100 } },
                    plugins: { legend: { display: false } }
                  }}
                />
              </CardBody>
            </Card>

            <div>
              <p className="text-xs font-semibold text-mw-gray-900 mb-2">
                Recent incidents
              </p>
              <div className="rounded-mw border border-mw-gray-200 divide-y divide-mw-gray-100">
                {screen.techIssues === 0 ? (
                  <div className="p-4 text-center text-xs text-mw-gray-500">
                    No incidents logged in the last 30 days
                  </div>
                ) : (
                  Array.from({ length: screen.techIssues }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 text-xs"
                    >
                      <AlertTriangle
                        size={14}
                        className="text-mw-red-500 mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-mw-gray-900">
                          Playback drop detected
                        </p>
                        <p className="text-mw-gray-500">
                          {i === 0
                            ? 'Today · 14:22 · 60s pre-show spot truncated'
                            : 'Yesterday · 19:05 · Codec fallback to H.264'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'tech' && (
          <div className="space-y-3 text-sm">
            <div className="rounded-mw border border-mw-gray-200 divide-y divide-mw-gray-100">
              <SpecRow
                icon={
                  screen.status === 'Offline' ? (
                    <WifiOff size={14} />
                  ) : (
                    <Wifi size={14} />
                  )
                }
                label="Network"
                value={
                  screen.status === 'Offline'
                    ? 'Disconnected'
                    : 'Online · 1 Gbps'
                }
              />
              <SpecRow
                icon={<Cpu size={14} />}
                label="Projector"
                value={
                  screen.format === 'IMAX'
                    ? 'Christie CP4450-RGB'
                    : 'Barco DP4K-32B'
                }
              />
              <SpecRow
                icon={<Clock size={14} />}
                label="Lamp hours"
                value={`${2400 + screen.capacity * 3} hrs`}
              />
              <SpecRow
                icon={<CalendarIcon size={14} />}
                label="Last maintenance"
                value="12 Apr 2026"
              />
              <SpecRow
                icon={<CheckCircle2 size={14} />}
                label="Firmware"
                value="v4.8.2"
              />
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-2">
            {sessionsForScreen.length === 0 ? (
              <div className="p-6 text-center text-xs text-mw-gray-500 border border-mw-gray-200 rounded-mw">
                No sessions mapped to this screen in the current week
              </div>
            ) : (
              sessionsForScreen.map((s) => {
                const filled =
                  (s.preShow60.booked + s.preShow30.booked) /
                  (s.preShow60.total + s.preShow30.total);
                const pct = Math.round(filled * 100);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 border border-mw-gray-200 rounded-mw"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-mw-gray-900 truncate">
                          {s.film}
                        </p>
                        <Badge tone="gray">{s.rating}</Badge>
                        <Badge tone="blue">{s.language}</Badge>
                      </div>
                      <p className="text-[11px] text-mw-gray-500">
                        {s.day} · {s.start} – {s.end}
                      </p>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-mw-gray-500">Filled</span>
                        <span className="font-semibold text-mw-gray-900">
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar
                        value={pct}
                        tone={pct >= 80 ? 'orange' : pct >= 50 ? 'teal' : 'blue'}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

function MiniStat({
  label,
  value,
  tone = 'default'
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'red';
}) {
  return (
    <div className="border border-mw-gray-200 rounded-mw-sm p-3">
      <p className="text-[10px] uppercase tracking-wide text-mw-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          tone === 'red' ? 'text-mw-red-500' : 'text-mw-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm">
      <span className="text-mw-gray-400">{icon}</span>
      <span className="text-mw-gray-500 w-32">{label}</span>
      <span className="font-medium text-mw-gray-900">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Edit / Add drawer                                                   */
/* ------------------------------------------------------------------ */

function EditScreenDrawer({
  open,
  initial,
  onClose,
  onSave
}: {
  open: boolean;
  initial: Screen | null;
  onClose: () => void;
  onSave: (s: Screen, isNew: boolean) => void;
}) {
  const isNew = initial === null;
  const [form, setForm] = useState<Partial<Screen>>({});

  useMemo(() => {
    if (!open) return;
    if (initial) {
      setForm(initial);
    } else {
      setForm({
        name: '',
        cinemaCode: cinemas[0].code,
        capacity: 150,
        format: 'Standard',
        status: 'Active',
        sound: '7.1 Surround',
        projection: 'Xenon',
        resolution: '2K',
        seating: 'Stadium'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  if (!open) return null;

  const update = <K extends keyof Screen>(k: K, v: Screen[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const cinemaObj = cinemas.find((c) => c.code === form.cinemaCode);
    const next: Screen = {
      id: initial?.id ?? `SCR-${Date.now()}`,
      name: form.name ?? 'Screen',
      cinemaCode: form.cinemaCode ?? cinemas[0].code,
      cinema: cinemaObj?.name ?? '',
      city: cinemaObj?.city ?? '',
      capacity: Number(form.capacity ?? 150),
      format: (form.format as ScreenFormat) ?? 'Standard',
      status: (form.status as ScreenStatus) ?? 'Active',
      sound: (form.sound as SoundSystem) ?? '7.1 Surround',
      projection: (form.projection as Projection) ?? 'Xenon',
      resolution: (form.resolution as '2K' | '4K') ?? '2K',
      seating: (form.seating as Seating) ?? 'Stadium',
      lastShow: initial?.lastShow ?? '—',
      uptime: initial?.uptime ?? 99,
      techIssues: initial?.techIssues ?? 0,
      adSuccess: initial?.adSuccess ?? 98
    };
    onSave(next, isNew);
  };

  const valid = !!form.name && !!form.cinemaCode && Number(form.capacity) > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? 'Add screen' : 'Edit screen'}
      subtitle={
        isNew
          ? 'Register a new screen in the network'
          : `Update details for ${initial?.name}`
      }
      width="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!valid}>
            {isNew ? 'Add screen' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Cinema">
          <Select
            value={form.cinemaCode ?? cinemas[0].code}
            onChange={(e) => update('cinemaCode', e.target.value)}
            options={cinemas.map((c) => ({
              value: c.code,
              label: `${c.name} (${c.city})`
            }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Screen name">
            <Input
              value={form.name ?? ''}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Screen 9"
            />
          </Field>
          <Field label="Capacity">
            <Input
              type="number"
              value={form.capacity ?? 0}
              onChange={(e) => update('capacity', Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Format">
            <Select
              value={form.format ?? 'Standard'}
              onChange={(e) =>
                update('format', e.target.value as ScreenFormat)
              }
              options={FORMATS.map((f) => ({ value: f, label: f }))}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status ?? 'Active'}
              onChange={(e) =>
                update('status', e.target.value as ScreenStatus)
              }
              options={STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Sound">
            <Select
              value={form.sound ?? '7.1 Surround'}
              onChange={(e) => update('sound', e.target.value as SoundSystem)}
              options={[
                { value: 'Dolby Atmos', label: 'Dolby Atmos' },
                { value: 'DTS:X', label: 'DTS:X' },
                { value: '7.1 Surround', label: '7.1 Surround' }
              ]}
            />
          </Field>
          <Field label="Projection">
            <Select
              value={form.projection ?? 'Xenon'}
              onChange={(e) =>
                update('projection', e.target.value as Projection)
              }
              options={[
                { value: 'RGB Laser', label: 'RGB Laser' },
                { value: 'Laser', label: 'Laser' },
                { value: 'Xenon', label: 'Xenon' }
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Resolution">
            <Select
              value={form.resolution ?? '2K'}
              onChange={(e) =>
                update('resolution', e.target.value as '2K' | '4K')
              }
              options={[
                { value: '2K', label: '2K' },
                { value: '4K', label: '4K' }
              ]}
            />
          </Field>
          <Field label="Seating">
            <Select
              value={form.seating ?? 'Stadium'}
              onChange={(e) => update('seating', e.target.value as Seating)}
              options={[
                { value: 'Stadium', label: 'Stadium' },
                { value: 'Recliner', label: 'Recliner' },
                { value: 'Flat', label: 'Flat' }
              ]}
            />
          </Field>
        </div>
      </div>
    </Drawer>
  );
}


/* ------------------------------------------------------------------ */
/* Bulk import                                                         */
/* ------------------------------------------------------------------ */

interface ParsedScreenRow {
  ok: boolean;
  error?: string;
  screen: Screen;
}

const SCREENS_CSV_TEMPLATE =
  'cinema_code,name,capacity,format,sound,projection,resolution,seating,status\n' +
  '0041,Screen 15,180,Standard,7.1 Surround,Xenon,2K,Stadium,Active\n' +
  '0041,Screen 16,240,IMAX,Dolby Atmos,RGB Laser,4K,Stadium,Active\n' +
  '0015,Screen 13,96,4DX,Dolby Atmos,RGB Laser,4K,Recliner,Active\n';

const SCREEN_API_PRESETS = [
  { id: 'vista', name: 'Vista POS · Screens', endpoint: 'https://api.vistapos.com/v3/screens', rows: 12 },
  { id: 'ncr', name: 'NCR Cinema · Sites', endpoint: 'https://partners.ncrcinema.com/screens', rows: 8 },
  { id: 'inbox', name: 'Inbox Cinema POS', endpoint: 'https://api.inboxcinema.io/v1/screens', rows: 5 }
];

function parseScreensCsv(text: string): ParsedScreenRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const iCode = idx('cinema_code');
  const iName = idx('name');
  const iCap = idx('capacity');
  const iFmt = idx('format');
  const iSnd = idx('sound');
  const iProj = idx('projection');
  const iRes = idx('resolution');
  const iSeat = idx('seating');
  const iStatus = idx('status');

  return lines.slice(1).map((line, rowIdx) => {
    const cols = line.split(',').map((c) => c.trim());
    const code = iCode >= 0 ? cols[iCode] : '';
    const name = iName >= 0 ? cols[iName] : '';
    const capacity = iCap >= 0 ? Number.parseInt(cols[iCap], 10) : 0;
    const format = (iFmt >= 0 ? cols[iFmt] : 'Standard') as ScreenFormat;
    const sound = (iSnd >= 0 ? cols[iSnd] : '7.1 Surround') as SoundSystem;
    const projection = (iProj >= 0 ? cols[iProj] : 'Xenon') as Projection;
    const resolution = (iRes >= 0 ? cols[iRes] : '2K') as '2K' | '4K';
    const seating = (iSeat >= 0 ? cols[iSeat] : 'Stadium') as Seating;
    const status = (iStatus >= 0 ? cols[iStatus] : 'Active') as ScreenStatus;

    const cinema = cinemas.find((c) => c.code === code);
    let error: string | undefined;
    if (!code) error = `Row ${rowIdx + 2}: missing cinema_code`;
    else if (!cinema) error = `Row ${rowIdx + 2}: unknown cinema ${code}`;
    else if (!name) error = `Row ${rowIdx + 2}: missing screen name`;
    else if (!Number.isFinite(capacity) || capacity <= 0) error = `Row ${rowIdx + 2}: invalid capacity`;
    else if (!FORMATS.includes(format)) error = `Row ${rowIdx + 2}: invalid format ${format}`;
    else if (!STATUSES.includes(status)) error = `Row ${rowIdx + 2}: invalid status ${status}`;

    const screen: Screen = {
      id: `SCR-${Date.now()}-${rowIdx}`,
      name,
      cinemaCode: code,
      cinema: cinema?.name ?? '',
      city: cinema?.city ?? '',
      capacity,
      format,
      status,
      sound,
      projection,
      resolution,
      seating,
      lastShow: '—',
      uptime: 99,
      techIssues: 0,
      adSuccess: 98
    };

    return { ok: !error, error, screen };
  });
}

function BulkImportScreensDrawer({
  open,
  onClose,
  existingKeys,
  onImport
}: {
  open: boolean;
  onClose: () => void;
  existingIds: string[];
  existingKeys: string[];
  onImport: (rows: Screen[]) => void;
}) {
  const [mode, setMode] = useState<'file' | 'api'>('file');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedScreenRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [apiPreset, setApiPreset] = useState('vista');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState(SCREEN_API_PRESETS[0].endpoint);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('file');
    setFileName('');
    setRows([]);
    setDragOver(false);
    setApiPreset('vista');
    setApiKey('');
    setEndpoint(SCREEN_API_PRESETS[0].endpoint);
    setSyncing(false);
    setImporting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 150);
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      if (file.name.toLowerCase().endsWith('.csv')) setRows(parseScreensCsv(text));
      else setRows(parseScreensCsv(SCREENS_CSV_TEMPLATE));
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  };

  const downloadTemplate = () => {
    const blob = new Blob([SCREENS_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screens-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (id: string) => {
    setApiPreset(id);
    const p = SCREEN_API_PRESETS.find((x) => x.id === id);
    if (p) setEndpoint(p.endpoint);
  };

  const runApiSync = () => {
    setSyncing(true);
    setRows([]);
    setTimeout(() => {
      const preset = SCREEN_API_PRESETS.find((p) => p.id === apiPreset) ?? SCREEN_API_PRESETS[0];
      const samples = [
        { cinemaCode: '0041', name: 'Screen 15', capacity: 180, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0041', name: 'Screen 16', capacity: 240, format: 'IMAX', sound: 'Dolby Atmos', projection: 'RGB Laser', resolution: '4K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0015', name: 'Screen 13', capacity: 96, format: '4DX', sound: 'Dolby Atmos', projection: 'RGB Laser', resolution: '4K', seating: 'Recliner', status: 'Active' },
        { cinemaCode: '0029', name: 'Screen 11', capacity: 160, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0029', name: 'Screen 12', capacity: 128, format: 'Premium', sound: 'DTS:X', projection: 'Laser', resolution: '4K', seating: 'Recliner', status: 'Active' },
        { cinemaCode: '0037', name: 'Screen 9', capacity: 150, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0015', name: 'Screen 14', capacity: 210, format: 'IMAX', sound: 'Dolby Atmos', projection: 'RGB Laser', resolution: '4K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0041', name: 'Screen 17', capacity: 124, format: 'Premium', sound: 'DTS:X', projection: 'Laser', resolution: '4K', seating: 'Recliner', status: 'Maintenance' },
        { cinemaCode: '0029', name: 'Screen 13', capacity: 170, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0037', name: 'Screen 10', capacity: 140, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0015', name: 'Screen 15', capacity: 180, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' },
        { cinemaCode: '0041', name: 'Screen 18', capacity: 200, format: 'Standard', sound: '7.1 Surround', projection: 'Xenon', resolution: '2K', seating: 'Stadium', status: 'Active' }
      ].slice(0, preset.rows);

      const parsed: ParsedScreenRow[] = samples.map((r, i) => {
        const cinema = cinemas.find((c) => c.code === r.cinemaCode);
        return {
          ok: true,
          screen: {
            id: `SCR-${Date.now()}-api-${i}`,
            name: r.name,
            cinemaCode: r.cinemaCode,
            cinema: cinema?.name ?? '',
            city: cinema?.city ?? '',
            capacity: r.capacity ?? 150,
            format: (r.format as ScreenFormat) ?? 'Standard',
            status: (r.status as ScreenStatus) ?? 'Active',
            sound: (r.sound as SoundSystem) ?? '7.1 Surround',
            projection: (r.projection as Projection) ?? 'Xenon',
            resolution: (r.resolution as '2K' | '4K') ?? '2K',
            seating: (r.seating as Seating) ?? 'Stadium',
            lastShow: '—',
            uptime: 99,
            techIssues: 0,
            adSuccess: 98
          }
        };
      });
      setRows(parsed);
      setSyncing(false);
    }, 900);
  };

  const validRows = rows.filter((r) => r.ok);
  const invalidRows = rows.filter((r) => !r.ok);
  const duplicateKeys = new Set(
    validRows
      .map((r) => `${r.screen.cinemaCode}::${r.screen.name.toLowerCase()}`)
      .filter((k) => existingKeys.includes(k))
  );
  const importable = validRows.filter(
    (r) => !duplicateKeys.has(`${r.screen.cinemaCode}::${r.screen.name.toLowerCase()}`)
  );

  const runImport = () => {
    if (importable.length === 0) return;
    setImporting(true);
    setTimeout(() => {
      onImport(importable.map((r) => r.screen));
      setImporting(false);
      reset();
    }, 400);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Bulk import screens"
      subtitle="Upload a CSV or sync directly from a cinema POS API"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <div className="text-xs text-mw-gray-500">
            {rows.length > 0 && (
              <span>
                {importable.length} ready · {invalidRows.length} invalid · {duplicateKeys.size} duplicate
              </span>
            )}
          </div>
          <Button onClick={runImport} disabled={importing || importable.length === 0} leftIcon={<Check size={14} />}>
            {importing ? 'Importing…' : `Import ${importable.length || ''}`}
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <Tabs
          tabs={[
            { label: 'Upload file', value: 'file' },
            { label: 'API sync', value: 'api' }
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'file' | 'api')}
        />
      </div>

      {mode === 'file' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-mw-gray-900">Spreadsheet upload</p>
              <p className="text-xs text-mw-gray-500">
                Columns: cinema_code, name, capacity, format, sound, projection, resolution, seating, status
              </p>
            </div>
            <Button variant="secondary" onClick={downloadTemplate} leftIcon={<Download size={14} />}>
              Template
            </Button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-mw-sm border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragOver ? 'border-mw-blue-500 bg-mw-blue-50' : 'border-mw-gray-300 bg-mw-gray-50/50 hover:border-mw-blue-500'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center mb-3">
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-sm font-semibold text-mw-gray-900">
              {fileName || 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-mw-gray-500 mt-1">.csv, .xlsx up to 2 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }}
            />
          </div>
        </div>
      )}

      {mode === 'api' && (
        <div className="space-y-4">
          <Field label="Provider">
            <Select
              value={apiPreset}
              onChange={(e) => loadPreset(e.target.value)}
              options={SCREEN_API_PRESETS.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          <Field label="Endpoint">
            <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} leftIcon={<Link2 size={14} />} />
          </Field>
          <Field label="API key" hint="Stored encrypted, never exposed to client">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_•••••"
            />
          </Field>
          <Button
            onClick={runApiSync}
            disabled={syncing}
            leftIcon={syncing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
          >
            {syncing ? 'Syncing…' : 'Fetch screens'}
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-mw-gray-900">Preview · {rows.length} rows</p>
            <button
              onClick={() => { setRows([]); setFileName(''); }}
              className="text-xs text-mw-gray-500 hover:text-mw-gray-800"
            >
              Clear
            </button>
          </div>

          {invalidRows.length > 0 && (
            <div className="mb-3 rounded-mw-sm border border-mw-amber-500/40 bg-mw-amber-100/40 p-3">
              <p className="text-xs font-semibold text-mw-gray-900 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-mw-amber-500" />
                {invalidRows.length} row{invalidRows.length === 1 ? '' : 's'} could not be imported
              </p>
              <ul className="mt-1 text-[11px] text-mw-gray-600 list-disc pl-5 space-y-0.5 max-h-24 overflow-y-auto">
                {invalidRows.slice(0, 6).map((r, i) => (<li key={i}>{r.error}</li>))}
                {invalidRows.length > 6 && (<li>+{invalidRows.length - 6} more</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-mw-sm border border-mw-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-mw-gray-50 text-left text-[11px] text-mw-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Cinema</th>
                  <th className="px-3 py-2">Screen</th>
                  <th className="px-3 py-2">Format</th>
                  <th className="px-3 py-2">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mw-gray-100">
                {rows.slice(0, 40).map((r, i) => {
                  const k = `${r.screen.cinemaCode}::${r.screen.name.toLowerCase()}`;
                  const isDup = duplicateKeys.has(k);
                  const tone = !r.ok ? 'red' : isDup ? 'amber' : 'green';
                  const label = !r.ok ? 'Error' : isDup ? 'Duplicate' : 'Ready';
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <Badge tone={tone as 'red' | 'amber' | 'green'}>{label}</Badge>
                      </td>
                      <td className="px-3 py-2">{r.screen.cinema || r.screen.cinemaCode}</td>
                      <td className="px-3 py-2">{r.screen.name}</td>
                      <td className="px-3 py-2">{r.screen.format}</td>
                      <td className="px-3 py-2">{r.screen.capacity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 40 && (
              <div className="px-3 py-2 text-[11px] text-mw-gray-500 bg-mw-gray-50 border-t border-mw-gray-100">
                Showing first 40 of {rows.length} rows
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
