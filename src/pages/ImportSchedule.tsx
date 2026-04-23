import { useMemo, useRef, useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, Edit3, Check, X as XIcon } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, DataTable, Drawer, Input, PageHeader } from '../components/ui';
import type { Column } from '../components/ui';
import { cinemas, weekSessions } from '../data/mock';
import type { Session } from '../data/mock';

interface ImportRow {
  id: string;
  file: string;
  theaterName: string;
  screens: number;
  premiumCategory: 'Standard' | 'Premium' | 'Gold' | 'Platinum';
  address: string;
  country: string;
  state: string;
  district: string;
  pincode: string;
  status: 'Parsed' | 'Imported' | 'Error';
  // retained for preview drawer
  week: string;
  sessions: number;
  uploaded: string;
}

const initialRows: ImportRow[] = [
  {
    id: '1',
    file: 'VOX_AlJimi_W01_2026.pdf',
    theaterName: 'Al Jimi Mall',
    screens: 8,
    premiumCategory: 'Premium',
    address: 'Al Jimi Mall, Al Ain',
    country: 'UAE',
    state: 'Abu Dhabi',
    district: 'Al Ain',
    pincode: '64321',
    status: 'Imported',
    week: '01 Jan – 08 Jan 2026',
    sessions: 184,
    uploaded: 'Today, 10:12 AM'
  },
  {
    id: '2',
    file: 'VOX_MOE_W01_2026.pdf',
    theaterName: 'Mall of the Emirates',
    screens: 14,
    premiumCategory: 'Platinum',
    address: 'Sheikh Zayed Rd, Al Barsha 1, Dubai',
    country: 'UAE',
    state: 'Dubai',
    district: 'Al Barsha',
    pincode: '12345',
    status: 'Imported',
    week: '01 Jan – 08 Jan 2026',
    sessions: 312,
    uploaded: 'Today, 10:10 AM'
  },
  {
    id: '3',
    file: 'VOX_YasMall_W52_2025.pdf',
    theaterName: 'Yas Mall',
    screens: 12,
    premiumCategory: 'Gold',
    address: 'Yas Island, Abu Dhabi',
    country: 'UAE',
    state: 'Abu Dhabi',
    district: 'Yas Island',
    pincode: '55040',
    status: 'Parsed',
    week: '25 Dec – 01 Jan 2026',
    sessions: 268,
    uploaded: 'Yesterday'
  }
];

interface GuessedLocation {
  theaterName: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  premiumCategory: ImportRow['premiumCategory'];
}

function guessLocation(name: string): GuessedLocation {
  const n = name.toLowerCase();
  if (n.includes('aljimi') || n.includes('al_jimi') || n.includes('jimi'))
    return {
      theaterName: 'Al Jimi Mall',
      address: 'Al Jimi Mall, Al Ain',
      state: 'Abu Dhabi',
      district: 'Al Ain',
      pincode: '64321',
      premiumCategory: 'Premium'
    };
  if (n.includes('moe') || n.includes('emirates'))
    return {
      theaterName: 'Mall of the Emirates',
      address: 'Sheikh Zayed Rd, Al Barsha 1, Dubai',
      state: 'Dubai',
      district: 'Al Barsha',
      pincode: '12345',
      premiumCategory: 'Platinum'
    };
  if (n.includes('yas'))
    return {
      theaterName: 'Yas Mall',
      address: 'Yas Island, Abu Dhabi',
      state: 'Abu Dhabi',
      district: 'Yas Island',
      pincode: '55040',
      premiumCategory: 'Gold'
    };
  if (n.includes('deira'))
    return {
      theaterName: 'City Centre Deira',
      address: 'City Centre Deira, Port Saeed, Dubai',
      state: 'Dubai',
      district: 'Deira',
      pincode: '29425',
      premiumCategory: 'Standard'
    };
  return {
    theaterName: 'Unknown theater',
    address: '—',
    state: '—',
    district: '—',
    pincode: '—',
    premiumCategory: 'Standard'
  };
}

function guessWeek(): string {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return `${fmt(now)} – ${fmt(end)} ${end.getFullYear()}`;
}

export default function ImportSchedule() {
  const [rows, setRows] = useState<ImportRow[]>(initialRows);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted = Array.from(files).filter((f) =>
      /\.(pdf|csv)$/i.test(f.name) && f.size <= 20 * 1024 * 1024
    );
    if (accepted.length === 0) {
      setToast('Only PDF or CSV files up to 20MB are accepted');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const newRows: ImportRow[] = accepted.map((f) => {
      const loc = guessLocation(f.name);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file: f.name,
        theaterName: loc.theaterName,
        screens: 6 + Math.floor(Math.random() * 10),
        premiumCategory: loc.premiumCategory,
        address: loc.address,
        country: 'UAE',
        state: loc.state,
        district: loc.district,
        pincode: loc.pincode,
        status: 'Parsed',
        week: guessWeek(),
        sessions: 150 + Math.floor(Math.random() * 200),
        uploaded: 'Just now'
      };
    });
    setRows((prev) => [...newRows, ...prev]);
    setToast(`${accepted.length} file${accepted.length === 1 ? '' : 's'} parsed successfully`);
    setTimeout(() => setToast(null), 3000);
  };

  const cols: Column<ImportRow>[] = [
    {
      key: 'file',
      header: 'File',
      render: (r) => (
        <button
          onClick={() => setPreview(r)}
          className="flex items-center gap-2 text-left hover:text-mw-blue-600"
        >
          <FileText size={14} className="text-mw-gray-400 shrink-0" />
          <span className="font-medium underline-offset-2 hover:underline whitespace-nowrap">
            {r.file}
          </span>
        </button>
      )
    },
    {
      key: 'theaterName',
      header: 'Theater name',
      render: (r) => (
        <span className="font-medium text-mw-gray-900 whitespace-nowrap">
          {r.theaterName}
        </span>
      )
    },
    {
      key: 'screens',
      header: 'No. of screens',
      className: 'text-center',
      render: (r) => <span className="tabular-nums">{r.screens}</span>
    },
    {
      key: 'premiumCategory',
      header: 'Premium category',
      render: (r) => (
        <Badge
          tone={
            r.premiumCategory === 'Platinum'
              ? 'blue'
              : r.premiumCategory === 'Gold'
              ? 'amber'
              : r.premiumCategory === 'Premium'
              ? 'teal'
              : 'gray'
          }
        >
          {r.premiumCategory}
        </Badge>
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (r) => (
        <span className="text-mw-gray-700 whitespace-nowrap">{r.address}</span>
      )
    },
    { key: 'country', header: 'Country' },
    { key: 'state', header: 'State' },
    { key: 'district', header: 'District' },
    {
      key: 'pincode',
      header: 'Pincode',
      render: (r) => <span className="tabular-nums">{r.pincode}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge tone={r.status === 'Imported' ? 'green' : r.status === 'Parsed' ? 'blue' : 'red'}>
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          {r.status === 'Parsed' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<CheckCircle2 size={13} />}
              onClick={() =>
                setRows((prev) =>
                  prev.map((row) =>
                    row.id === r.id ? { ...row, status: 'Imported' } : row
                  )
                )
              }
            >
              Import
            </Button>
          )}
          <button
            onClick={() =>
              setRows((prev) => prev.filter((row) => row.id !== r.id))
            }
            className="w-7 h-7 rounded-mw-sm text-mw-gray-500 hover:text-mw-red-500 hover:bg-mw-gray-100 flex items-center justify-center"
            aria-label="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <>
      <PageHeader
        title="Import schedule"
        subtitle="Upload the Vista 'Weekly Session by Screen' export to refresh ad slot inventory"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Import schedule' }]}
      />

      {toast && (
        <div className="mb-4 rounded-mw bg-mw-blue-50 border border-mw-blue-100 text-mw-blue-700 text-sm px-4 py-2.5">
          {toast}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader title="Upload file" subtitle="PDF or CSV from Vista (visWeeklySessionByScreen)" />
        <CardBody>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-mw p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-mw-blue-500 bg-mw-blue-50'
                : 'border-mw-gray-300 hover:border-mw-blue-500 hover:bg-mw-gray-50'
            }`}
          >
            <Upload size={28} className="mx-auto text-mw-gray-400 mb-3" />
            <p className="text-sm font-medium text-mw-gray-900">
              {dragging ? 'Release to upload' : 'Drop file here to parse'}
            </p>
            <p className="text-xs text-mw-gray-500 mt-1">PDF, CSV · max 20MB</p>
            <Button
              className="mt-4"
              leftIcon={<Upload size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose file
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
            <StepCard num="1" title="Upload" desc="Vista weekly PDF / CSV" />
            <StepCard num="2" title="Parse" desc="Extract sessions by screen, film, time" />
            <StepCard num="3" title="Generate slots" desc="Pre-show 60s / 30s per session" />
            <StepCard num="4" title="Publish" desc="Inventory visible in Ad Slots" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent imports" subtitle="Last 30 days" />
        <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
      </Card>

      <ImportPreviewDrawer row={preview} onClose={() => setPreview(null)} />
    </>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="border border-mw-gray-200 rounded-mw p-3 flex gap-3 items-start">
      <span className="w-7 h-7 rounded-full bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
        {num}
      </span>
      <div>
        <p className="text-sm font-medium text-mw-gray-900">{title}</p>
        <p className="text-xs text-mw-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const SAMPLE_FILMS = ['Zootropolis 2', 'Avatar: Fire and Ash', 'Anaconda', 'SpongeBob', 'Tala2ni'];
const SAMPLE_TIMES = ['10:30a', '1:15p', '3:45p', '6:15p', '8:40p', '10:45p'];

function buildPreviewSessions(row: ImportRow): Session[] {
  const cinema = cinemas.find((c) => c.name === row.theaterName);
  const real = cinema
    ? weekSessions.filter((s) => s.cinema === cinema.code)
    : [];
  if (real.length > 0) return real;

  // Synthesize sample rows for cinemas we don't have weekSessions for
  const count = Math.min(row.sessions, 24);
  return Array.from({ length: count }).map((_, i) => {
    const screen = `Screen ${(i % row.screens) + 1}`;
    const film = SAMPLE_FILMS[i % SAMPLE_FILMS.length];
    const start = SAMPLE_TIMES[i % SAMPLE_TIMES.length];
    const total = 8;
    const booked = (i * 3) % (total + 1);
    return {
      id: `${row.id}-${i}`,
      cinema: cinema?.code ?? row.theaterName,
      screen,
      film,
      rating: 'PG',
      language: 'English',
      day: 'Thu',
      start,
      end: start,
      preShow60: { total, booked },
      preShow30: { total: total * 2, booked: booked * 2 }
    } as Session;
  });
}

function ImportPreviewDrawer({
  row,
  onClose
}: {
  row: ImportRow | null;
  onClose: () => void;
}) {
  const initialSessions = useMemo(() => (row ? buildPreviewSessions(row) : []), [row]);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Session>>({});

  useEffect(() => {
    setSessions(initialSessions);
    setEditingId(null);
    setDraft({});
  }, [initialSessions]);

  const startEdit = (s: Session) => {
    setEditingId(s.id);
    setDraft({ ...s });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };
  const saveEdit = () => {
    if (!editingId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? {
              ...s,
              screen: (draft.screen as string) ?? s.screen,
              film: (draft.film as string) ?? s.film,
              start: (draft.start as string) ?? s.start,
              language: (draft.language as Session['language']) ?? s.language
            }
          : s
      )
    );
    cancelEdit();
  };
  const remove = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancelEdit();
  };

  const cols: Column<Session>[] = [
    {
      key: 'screen',
      header: 'Screen',
      render: (s) =>
        editingId === s.id ? (
          <Input
            value={(draft.screen as string) ?? ''}
            onChange={(e) => setDraft({ ...draft, screen: e.target.value })}
          />
        ) : (
          <span className="font-medium text-mw-gray-900">{s.screen}</span>
        )
    },
    {
      key: 'start',
      header: 'Time',
      render: (s) =>
        editingId === s.id ? (
          <Input
            value={(draft.start as string) ?? ''}
            onChange={(e) => setDraft({ ...draft, start: e.target.value })}
          />
        ) : (
          <span className="whitespace-nowrap">{s.start}</span>
        )
    },
    {
      key: 'film',
      header: 'Film',
      render: (s) =>
        editingId === s.id ? (
          <Input
            value={(draft.film as string) ?? ''}
            onChange={(e) => setDraft({ ...draft, film: e.target.value })}
          />
        ) : (
          s.film
        )
    },
    {
      key: 'language',
      header: 'Lang',
      render: (s) => <span className="text-mw-gray-500">{s.language}</span>
    },
    {
      key: 'preShow60',
      header: '60s',
      render: (s) => (
        <span className="text-mw-gray-700">
          {s.preShow60.booked}/{s.preShow60.total}
        </span>
      )
    },
    {
      key: 'preShow30',
      header: '30s',
      render: (s) => (
        <span className="text-mw-gray-700">
          {s.preShow30.booked}/{s.preShow30.total}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center gap-1 justify-end">
          {editingId === s.id ? (
            <>
              <button
                onClick={saveEdit}
                className="w-7 h-7 rounded-mw-sm text-mw-blue-600 hover:bg-mw-blue-50 flex items-center justify-center"
                aria-label="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelEdit}
                className="w-7 h-7 rounded-mw-sm text-mw-gray-500 hover:bg-mw-gray-100 flex items-center justify-center"
                aria-label="Cancel"
              >
                <XIcon size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(s)}
                className="w-7 h-7 rounded-mw-sm text-mw-gray-500 hover:text-mw-blue-600 hover:bg-mw-gray-100 flex items-center justify-center"
                aria-label="Edit"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => remove(s.id)}
                className="w-7 h-7 rounded-mw-sm text-mw-gray-500 hover:text-mw-red-500 hover:bg-mw-gray-100 flex items-center justify-center"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <Drawer
      open={!!row}
      onClose={onClose}
      title={row?.file ?? ''}
      subtitle={row ? `${row.theaterName} · ${row.week}` : undefined}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <p className="text-xs text-mw-gray-500">
            {sessions.length} sessions
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      {row && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-mw-gray-900">Parsed sessions</p>
            <Badge tone={row.status === 'Imported' ? 'green' : row.status === 'Parsed' ? 'blue' : 'red'}>
              {row.status}
            </Badge>
          </div>
          <div className="border border-mw-gray-200 rounded-mw overflow-hidden">
            <DataTable
              columns={cols}
              rows={sessions}
              rowKey={(s) => s.id}
              empty="No sessions remaining"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}
