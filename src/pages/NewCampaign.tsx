import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Upload,
  Film,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Target as TargetIcon,
  Sparkles,
  X
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  Stepper
} from '../components/ui';
import { weekSessions, cinemas } from '../data/mock';
import {
  AUDIENCE_PACKAGES,
  packageById,
  CINEMA_TYPES,
  ZONES,
  CITIES,
  screensPlayingFilm,
  ALL_FILM_TITLES
} from '../data/cinemaMeta';

const steps = [
  { label: 'Brief', description: 'Campaign basics' },
  { label: 'Targeting', description: 'Audience & geo' },
  { label: 'Screen', description: 'Select screens' },
  { label: 'Creative', description: 'Upload assets' },
  { label: 'Review', description: 'Submit for approval' }
];

const DURATION_OPTIONS: { value: string; label: string; seconds: number }[] = [
  { value: '15s', label: '15 seconds', seconds: 15 },
  { value: '30s', label: '30 seconds', seconds: 30 },
  { value: '45s', label: '45 seconds', seconds: 45 },
  { value: '60s', label: '60 seconds', seconds: 60 },
  { value: '1m', label: '1 minute', seconds: 60 },
  { value: '2m', label: '2 minutes', seconds: 120 },
  { value: '3m', label: '3 minutes', seconds: 180 },
  { value: '4m', label: '4 minutes', seconds: 240 },
  { value: '5m', label: '5 minutes', seconds: 300 }
];

const EMIRATE_OPTIONS = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abudhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
  { value: 'rak', label: 'Ras Al Khaimah' },
  { value: 'fujairah', label: 'Fujairah' },
  { value: 'uaq', label: 'Umm Al Quwain' },
  { value: 'alain', label: 'Al Ain' }
];

const THEATER_OPTIONS = [
  { value: 'aljimi', label: 'Al Jimi Mall' },
  { value: 'moe', label: 'Mall of the Emirates' },
  { value: 'deira', label: 'City Centre Deira' },
  { value: 'yas', label: 'Yas Mall' }
];

const GENRE_OPTIONS = [
  { value: 'scifi', label: 'Sci-Fi' },
  { value: 'family', label: 'Family' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'action', label: 'Action' },
  { value: 'horror', label: 'Horror' },
  { value: 'romance', label: 'Romance' },
  { value: 'animation', label: 'Animation' },
  { value: 'documentary', label: 'Documentary' }
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'blockbuster', label: 'Blockbuster' },
  { value: 'indie', label: 'Independent' },
  { value: 'regional', label: 'Regional' },
  { value: 'bollywood', label: 'Bollywood' },
  { value: 'hollywood', label: 'Hollywood' }
];

const GOAL_OPTIONS = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'reach', label: 'Reach' },
  { value: 'adplay', label: 'AdPlay' }
];

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'English & Arabic' },
  { value: 'en', label: 'English only' },
  { value: 'ar', label: 'Arabic only' }
];

const DAYPART_OPTIONS = [
  { value: 'prime', label: 'Prime time (6pm – 11pm)' },
  { value: 'matinee', label: 'Matinee (11am – 5pm)' },
  { value: 'late', label: 'Late night (11pm+)' },
  { value: 'all', label: 'All day' }
];

interface CreativeFile {
  name: string;
  sizeMb: number;
  duration: string;
}

interface CampaignDraft {
  name: string;
  advertiser: string;
  flightStart: string;
  flightEnd: string;
  budget: number;
  durations: string[];
  goal: string;
  country: string;
  emirates: string[];
  cities: string[];
  zones: string[];
  cinemaTypes: string[];
  theaters: string[];
  genres: string[];
  categories: string[];
  rating: string;
  language: string;
  daypart: string;
  audiencePackage: string; // '' | package id
  movieTargetMode: boolean;
  targetedMovie: string;
  bundle: string;
  pickedSlots: string[];
  creatives: CreativeFile[];
}

const BUNDLE_OPTIONS = [
  { value: 'scifi', title: 'Prime-time Sci-Fi bundle', theaters: 4, sessions: 124, spots: 840, reach: '1.2M', cpm: 38, recommended: true },
  { value: 'family', title: 'Family daypart bundle', theaters: 3, sessions: 98, spots: 620, reach: '820K', cpm: 32, recommended: false },
  { value: 'arabic', title: 'Arabic language bundle', theaters: 2, sessions: 56, spots: 340, reach: '410K', cpm: 29, recommended: false }
];

const INITIAL_DRAFT: CampaignDraft = {
  name: 'Emirates Winter 2026',
  advertiser: 'Emirates Airlines',
  flightStart: '2026-05-01',
  flightEnd: '2026-05-31',
  budget: 45000,
  durations: ['30s'],
  goal: 'impressions',
  country: 'uae',
  emirates: ['dubai', 'abudhabi'],
  cities: [],
  zones: [],
  cinemaTypes: [],
  theaters: ['aljimi', 'moe', 'deira', 'yas'],
  genres: [],
  categories: ['all'],
  rating: 'all',
  language: 'all',
  daypart: 'prime',
  audiencePackage: '',
  movieTargetMode: false,
  targetedMovie: '',
  bundle: 'scifi',
  pickedSlots: [],
  creatives: [{ name: 'emirates_winter_30s.mp4', sizeMb: 32, duration: '30 seconds' }]
};

function labelsFor(values: string[], options: { value: string; label: string }[]) {
  return values
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);
}

export default function NewCampaign() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<CampaignDraft>(INITIAL_DRAFT);
  const [campaignId] = useState(
    () => `CMP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const update = <K extends keyof CampaignDraft>(k: K, v: CampaignDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  if (submitted) {
    return <SubmittedView campaignId={campaignId} />;
  }

  return (
    <>
      <PageHeader
        title="Plan new campaign"
        subtitle="Create a booking across theaters in 5 steps"
        breadcrumbs={[{ label: 'Campaigns' }, { label: 'New' }]}
        actions={
          <>
            <Link to="/campaigns">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button variant="secondary">Save as draft</Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardBody>
          <Stepper steps={steps} current={step} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 0 && <StepBrief draft={draft} update={update} />}
          {step === 1 && <StepTargeting draft={draft} update={update} />}
          {step === 2 && <StepInventory draft={draft} update={update} />}
          {step === 3 && <StepCreative draft={draft} />}
          {step === 4 && <StepReview draft={draft} />}

          <div className="flex justify-between">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft size={16} />}
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button rightIcon={<ArrowRight size={16} />} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button
                leftIcon={<Check size={16} />}
                onClick={() => setSubmitted(true)}
              >
                Submit for approval
              </Button>
            )}
          </div>
        </div>

        <SummaryPanel draft={draft} />
      </div>
    </>
  );
}

function SubmittedView({ campaignId }: { campaignId: string }) {
  return (
    <>
      <PageHeader
        title="Campaign submitted"
        subtitle="Your campaign is queued for review"
        breadcrumbs={[{ label: 'Campaigns' }, { label: 'New' }, { label: 'Submitted' }]}
      />
      <Card>
        <CardBody className="py-12">
          <div className="max-w-xl mx-auto text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-mw-teal-500/15 flex items-center justify-center mb-4">
              <Check className="text-mw-teal-500" size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-semibold text-mw-gray-900">
              Submitted for approval
            </h2>
            <p className="mt-2 text-sm text-mw-gray-600">
              Your campaign has been sent to the operations team for review.
              You will be notified once it is approved, typically within
              2 business hours.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-mw border border-mw-gray-200 bg-mw-gray-50 px-4 py-3">
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wide text-mw-gray-500">
                  Campaign ID
                </p>
                <p className="text-sm font-semibold text-mw-gray-900">
                  {campaignId}
                </p>
              </div>
              <div className="h-8 w-px bg-mw-gray-200" />
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wide text-mw-gray-500">
                  Status
                </p>
                <Badge tone="orange">Pending approval</Badge>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to="/campaigns">
                <Button variant="secondary">View all campaigns</Button>
              </Link>
              <Link to="/campaigns/new">
                <Button leftIcon={<Sparkles size={14} />} onClick={() => window.location.reload()}>
                  Plan another campaign
                </Button>
              </Link>
            </div>

            <ol className="mt-10 text-left space-y-3 border-t border-mw-gray-200 pt-6">
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-mw-teal-500/15 text-mw-teal-500 flex items-center justify-center shrink-0">
                  <Check size={14} />
                </span>
                <div>
                  <p className="font-medium text-mw-gray-900">Submitted</p>
                  <p className="text-xs text-mw-gray-500">
                    Brief, targeting, inventory and creative captured.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-mw-orange-500/15 text-mw-orange-500 flex items-center justify-center shrink-0 text-[11px] font-semibold">
                  2
                </span>
                <div>
                  <p className="font-medium text-mw-gray-900">
                    Operations review
                  </p>
                  <p className="text-xs text-mw-gray-500">
                    Inventory conflicts and creative specs are validated.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-mw-gray-100 text-mw-gray-500 flex items-center justify-center shrink-0 text-[11px] font-semibold">
                  3
                </span>
                <div>
                  <p className="font-medium text-mw-gray-900">Go live</p>
                  <p className="text-xs text-mw-gray-500">
                    Campaign activates on the scheduled start date.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

function StepBrief({
  draft,
  update
}: Readonly<{ draft: CampaignDraft; update: <K extends keyof CampaignDraft>(k: K, v: CampaignDraft[K]) => void }>) {
  return (
    <Card>
      <CardHeader title="Campaign brief" subtitle="Name, advertiser, dates and budget" />
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Campaign name">
          <Input
            placeholder="e.g. Netflix Thriller Launch"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </Field>
        <Field label="Advertiser / Brand">
          <Input
            placeholder="Brand name"
            value={draft.advertiser}
            onChange={(e) => update('advertiser', e.target.value)}
          />
        </Field>
        <Field label="Flight start">
          <Input
            type="date"
            value={draft.flightStart}
            onChange={(e) => update('flightStart', e.target.value)}
          />
        </Field>
        <Field label="Flight end">
          <Input
            type="date"
            value={draft.flightEnd}
            onChange={(e) => update('flightEnd', e.target.value)}
          />
        </Field>
        <Field label="Total budget (USD)">
          <Input
            type="number"
            placeholder="0"
            value={String(draft.budget)}
            onChange={(e) => update('budget', Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Creative duration">
          <MultiCheckDropdown
            placeholder="Select durations"
            options={DURATION_OPTIONS}
            defaultSelected={draft.durations}
            onChange={(v) => update('durations', v)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Goal type">
            <Select
              options={GOAL_OPTIONS}
              value={draft.goal}
              onChange={(e) => update('goal', e.target.value)}
            />
          </Field>
        </div>
      </CardBody>
    </Card>
  );
}

function StepTargeting({
  draft,
  update
}: Readonly<{ draft: CampaignDraft; update: <K extends keyof CampaignDraft>(k: K, v: CampaignDraft[K]) => void }>) {
  const zoneOptions = ZONES.map((z) => ({ value: z, label: z }));
  const typeOptions = CINEMA_TYPES.map((t) => ({ value: t, label: t }));
  const cityOptions = CITIES.map((c) => ({ value: c, label: c }));
  const audienceOptions = [
    { value: '', label: 'None — build targeting manually' },
    ...AUDIENCE_PACKAGES.map((p) => ({ value: p.id, label: `${p.name} · ~${p.estReach}` }))
  ];
  const movieOptions = [
    { value: '', label: 'Select a movie…' },
    ...ALL_FILM_TITLES.map((t) => ({ value: t, label: t }))
  ];

  const onSelectPackage = (id: string) => {
    update('audiencePackage', id);
    const pkg = packageById(id);
    if (!pkg) return;
    // Map package into the Targeting state for live preview
    const genreLower = pkg.genres.map((g) => g.toLowerCase());
    update('genres', genreLower);
    update('cinemaTypes', pkg.cinemaTypes);
    if (pkg.dayparts[0]) update('daypart', pkg.dayparts[0].toLowerCase());
  };

  const matchedScreens = draft.movieTargetMode && draft.targetedMovie
    ? screensPlayingFilm(draft.targetedMovie)
    : [];

  return (
    <Card>
      <CardHeader title="Targeting" subtitle="Audience, geography, cinema type and daypart" />
      <CardBody className="space-y-5">
        {/* Audience package */}
        <div className="rounded-mw border border-mw-blue-100 bg-mw-blue-50/40 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-mw-sm bg-mw-blue-500 text-white flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-mw-gray-900">Audience package</p>
              <p className="text-xs text-mw-gray-600 mb-2">
                Start from a predefined audience — genres, formats and daypart auto-fill below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Package">
                  <Select
                    value={draft.audiencePackage}
                    onChange={(e) => onSelectPackage(e.target.value)}
                    options={audienceOptions}
                  />
                </Field>
                {draft.audiencePackage && (
                  <div className="text-xs text-mw-gray-700 self-end pb-2">
                    {packageById(draft.audiencePackage)?.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Movie-based targeting */}
        <div className="rounded-mw border border-mw-gray-200 p-4">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.movieTargetMode}
              onChange={(e) => update('movieTargetMode', e.target.checked)}
              className="accent-mw-blue-500"
            />
            <Film size={14} className="text-mw-gray-500" />
            <span className="text-sm font-semibold text-mw-gray-900">
              Target by movie
            </span>
            <span className="text-xs text-mw-gray-500">
              Reach every screen currently playing a chosen title
            </span>
          </label>
          {draft.movieTargetMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Movie">
                <Select
                  value={draft.targetedMovie}
                  onChange={(e) => update('targetedMovie', e.target.value)}
                  options={movieOptions}
                />
              </Field>
              <div className="self-end pb-2">
                <Badge tone="blue">
                  {matchedScreens.length} screens match
                </Badge>
              </div>
              {matchedScreens.length > 0 && (
                <div className="sm:col-span-2 rounded-mw-sm bg-mw-gray-50 border border-mw-gray-200 p-3 max-h-40 overflow-y-auto">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[12px]">
                    {matchedScreens.map((m) => (
                      <li key={`${m.cinemaCode}-${m.screen}`} className="flex justify-between">
                        <span className="text-mw-gray-800 truncate">
                          {m.cinemaName} · {m.screen}
                        </span>
                        <span className="text-mw-gray-500 whitespace-nowrap ml-2">
                          {m.sessionCount} sessions
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location + type grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Country">
            <Select
              options={[{ value: 'uae', label: 'United Arab Emirates' }]}
              value={draft.country}
              onChange={(e) => update('country', e.target.value)}
            />
          </Field>
          <Field label="Emirate">
            <MultiCheckDropdown
              placeholder="Select emirates"
              options={EMIRATE_OPTIONS}
              defaultSelected={draft.emirates}
              onChange={(v) => update('emirates', v)}
            />
          </Field>
          <Field label="City">
            <MultiCheckDropdown
              placeholder="All cities"
              options={cityOptions}
              defaultSelected={draft.cities}
              onChange={(v) => update('cities', v)}
            />
          </Field>
          <Field label="Zone">
            <MultiCheckDropdown
              placeholder="All zones (city-centre / suburb / small-town)"
              options={zoneOptions}
              defaultSelected={draft.zones}
              onChange={(v) => update('zones', v)}
            />
          </Field>
          <Field label="Cinema type">
            <MultiCheckDropdown
              placeholder="All formats"
              options={typeOptions}
              defaultSelected={draft.cinemaTypes}
              onChange={(v) => update('cinemaTypes', v)}
            />
          </Field>
          <Field label="Theaters (specific)">
            <MultiCheckDropdown
              placeholder="Select theaters"
              options={THEATER_OPTIONS}
              defaultSelected={draft.theaters}
              onChange={(v) => update('theaters', v)}
            />
          </Field>
          <Field label="Film genres">
            <MultiCheckDropdown
              placeholder="Select genres"
              options={GENRE_OPTIONS}
              defaultSelected={draft.genres}
              onChange={(v) => update('genres', v)}
            />
          </Field>
          <Field label="Movie target category">
            <MultiCheckDropdown
              placeholder="Select categories"
              options={CATEGORY_OPTIONS}
              defaultSelected={draft.categories}
              onChange={(v) => update('categories', v)}
            />
          </Field>
          <Field label="Language">
            <Select
              options={LANGUAGE_OPTIONS}
              value={draft.language}
              onChange={(e) => update('language', e.target.value)}
            />
          </Field>
          <Field label="Daypart">
            <Select
              options={DAYPART_OPTIONS}
              value={draft.daypart}
              onChange={(e) => update('daypart', e.target.value)}
            />
          </Field>
        </div>
      </CardBody>
    </Card>
  );
}

function StepInventory({
  draft,
  update
}: Readonly<{ draft: CampaignDraft; update: <K extends keyof CampaignDraft>(k: K, v: CampaignDraft[K]) => void }>) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const picked = useMemo(() => new Set(draft.pickedSlots), [draft.pickedSlots]);

  return (
    <Card>
      <CardHeader
        title="Screen selection"
        subtitle="Pick a recommended bundle or build a custom plan"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            Open slot picker
            {picked.size > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-mw-blue-500 text-white text-[10px] font-semibold">
                {picked.size}
              </span>
            )}
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {picked.size > 0 && (
          <div className="rounded-mw border border-mw-blue-500/30 bg-mw-blue-50 p-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-mw-blue-600">
                {picked.size} custom slot{picked.size === 1 ? '' : 's'} selected
              </span>
              <span className="text-mw-gray-600">
                {' '}
                · bundles below are disabled
              </span>
            </div>
            <button
              onClick={() => update('pickedSlots', [])}
              className="text-xs font-medium text-mw-gray-500 hover:text-mw-gray-800"
            >
              Clear selection
            </button>
          </div>
        )}
        {BUNDLE_OPTIONS.map((r) => (
          <label
            key={r.value}
            className={`block border border-mw-gray-200 rounded-mw p-4 transition-colors ${
              picked.size > 0
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-mw-blue-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="bundle"
                checked={draft.bundle === r.value}
                disabled={picked.size > 0}
                onChange={() => update('bundle', r.value)}
                className="mt-1 accent-mw-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-mw-gray-900">{r.title}</p>
                  {r.recommended && (
                    <Badge tone="blue" icon={<Sparkles size={10} />}>
                      Recommended
                    </Badge>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs text-mw-gray-600">
                  <div>
                    <p className="text-[11px] text-mw-gray-400">Theaters</p>
                    <p className="font-semibold text-mw-gray-900">{r.theaters}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-mw-gray-400">Sessions</p>
                    <p className="font-semibold text-mw-gray-900">{r.sessions}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-mw-gray-400">Spots</p>
                    <p className="font-semibold text-mw-gray-900">{r.spots}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-mw-gray-400">Est. reach</p>
                    <p className="font-semibold text-mw-gray-900">{r.reach}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-mw-gray-400">CPM</p>
                    <p className="font-semibold text-mw-gray-900">${r.cpm}</p>
                  </div>
                </div>
              </div>
            </div>
          </label>
        ))}
      </CardBody>
      <SlotPickerDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={picked}
        onApply={(sel) => {
          update('pickedSlots', Array.from(sel));
          setPickerOpen(false);
        }}
      />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Slot Picker                                                         */
/* ------------------------------------------------------------------ */

function parseClock(t: string): number {
  const m = /^(\d{1,2}):(\d{2})([ap])$/i.exec(t);
  if (!m) return 0;
  let hr = Number.parseInt(m[1], 10) % 12;
  const min = Number.parseInt(m[2], 10);
  if (m[3].toLowerCase() === 'p') hr += 12;
  return hr * 60 + min;
}
function fillPct(s: (typeof weekSessions)[number]) {
  const total = s.preShow60.total + s.preShow30.total;
  const booked = s.preShow60.booked + s.preShow30.booked;
  return Math.round((booked / total) * 100);
}
function daypart(s: (typeof weekSessions)[number]): 'matinee' | 'prime' | 'late' {
  const start = parseClock(s.start);
  if (start < 17 * 60) return 'matinee';
  if (start < 23 * 60) return 'prime';
  return 'late';
}

function SlotPickerDrawer({
  open,
  onClose,
  selected,
  onApply
}: {
  open: boolean;
  onClose: () => void;
  selected: Set<string>;
  onApply: (s: Set<string>) => void;
}) {
  const [draft, setDraft] = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState('');
  const [cinema, setCinema] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [part, setPart] = useState<string>('all');
  const [films, setFilms] = useState<string[]>([]);
  const [screenSel, setScreenSel] = useState<string[]>([]);

  // Sync draft with incoming selection when drawer re-opens
  useMemo(() => {
    if (open) setDraft(new Set(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cinemaNameByCode = useMemo(() => {
    const m = new Map<string, string>();
    cinemas.forEach((c) => m.set(c.code, c.name));
    return m;
  }, []);

  const filmOptions = useMemo(
    () =>
      Array.from(new Set(weekSessions.map((s) => s.film)))
        .sort((a, b) => a.localeCompare(b))
        .map((f) => ({ value: f, label: f })),
    []
  );
  const screenOptions = useMemo(() => {
    const pool =
      cinema === 'all'
        ? weekSessions
        : weekSessions.filter((s) => s.cinema === cinema);
    return Array.from(new Set(pool.map((s) => s.screen)))
      .sort((a, b) => a.localeCompare(b))
      .map((s) => ({ value: s, label: s }));
  }, [cinema]);

  const filtered = useMemo(() => {
    return weekSessions.filter((s) => {
      if (
        search &&
        !s.film.toLowerCase().includes(search.toLowerCase()) &&
        !s.screen.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (cinema !== 'all' && s.cinema !== cinema) return false;
      if (language !== 'all' && s.language !== language) return false;
      if (part !== 'all' && daypart(s) !== part) return false;
      if (films.length > 0 && !films.includes(s.film)) return false;
      if (screenSel.length > 0 && !screenSel.includes(s.screen)) return false;
      return true;
    });
  }, [search, cinema, language, part, films, screenSel]);

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    const allIds = filtered.map((s) => s.id);
    const allSelected = allIds.every((id) => draft.has(id));
    setDraft((prev) => {
      const next = new Set(prev);
      if (allSelected) allIds.forEach((id) => next.delete(id));
      else allIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const visibleAllPicked =
    filtered.length > 0 && filtered.every((s) => draft.has(s.id));

  const pickedList = weekSessions.filter((s) => draft.has(s.id));
  const totalSpots = pickedList.length * 2; // 60s + 30s position
  const estReach = pickedList.reduce(
    (a, s) => a + Math.round(120 * (1 - fillPct(s) / 100) + 40),
    0
  );
  const estCost = pickedList.reduce((a, s) => {
    const base = daypart(s) === 'prime' ? 380 : daypart(s) === 'matinee' ? 220 : 140;
    return a + base;
  }, 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Slot picker"
      subtitle="Hand-pick individual sessions across cinemas"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <div className="text-xs text-mw-gray-500 text-right leading-tight">
            <div>
              <span className="font-semibold text-mw-gray-900">
                {draft.size}
              </span>{' '}
              sessions · {totalSpots} spots
            </div>
            <div>
              Est. reach {estReach.toLocaleString()} · USD{' '}
              {estCost.toLocaleString()}
            </div>
          </div>
          <Button
            onClick={() => onApply(draft)}
            disabled={draft.size === 0}
            leftIcon={<Check size={14} />}
          >
            Apply selection
          </Button>
        </div>
      }
    >
      <div className="space-y-3 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by film or screen"
          leftIcon={<Search size={14} />}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Field label="Theater">
            <Select
              value={cinema}
              onChange={(e) => {
                setCinema(e.target.value);
                setScreenSel([]);
              }}
              options={[
                { value: 'all', label: 'All theaters' },
                ...cinemas.map((c) => ({ value: c.code, label: c.name }))
              ]}
            />
          </Field>
          <Field label="Language">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'all', label: 'Any' },
                { value: 'English', label: 'English' },
                { value: 'Arabic', label: 'Arabic' }
              ]}
            />
          </Field>
          <Field label="Daypart">
            <Select
              value={part}
              onChange={(e) => setPart(e.target.value)}
              options={[
                { value: 'all', label: 'Any' },
                { value: 'matinee', label: 'Matinee' },
                { value: 'prime', label: 'Prime' },
                { value: 'late', label: 'Late night' }
              ]}
            />
          </Field>
          <Field label="Movies">
            <MultiCheckDropdown
              key={`films-${filmOptions.length}`}
              placeholder="All movies"
              options={filmOptions}
              defaultSelected={films}
              onChange={setFilms}
            />
          </Field>
          <Field label="Screens">
            <MultiCheckDropdown
              key={`screens-${cinema}-${screenOptions.length}`}
              placeholder="All screens"
              options={screenOptions}
              defaultSelected={screenSel}
              onChange={setScreenSel}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-mw-gray-500">
          {filtered.length} session{filtered.length === 1 ? '' : 's'} match
        </p>
        <button
          onClick={toggleAllVisible}
          disabled={filtered.length === 0}
          className="text-xs font-semibold text-mw-blue-600 hover:text-mw-blue-700 disabled:text-mw-gray-400 disabled:cursor-not-allowed"
        >
          {visibleAllPicked ? 'Deselect visible' : 'Select all visible'}
        </button>
      </div>

      <div className="rounded-mw-sm border border-mw-gray-200 overflow-hidden">
        <div className="max-h-[calc(100vh-440px)] min-h-[300px] overflow-y-auto divide-y divide-mw-gray-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-mw-gray-900">
                No sessions match your filters
              </p>
              <p className="text-xs text-mw-gray-500 mt-1">
                Try clearing or broadening the filters.
              </p>
            </div>
          ) : (
            filtered.map((s) => {
              const pct = fillPct(s);
              const picked = draft.has(s.id);
              const tone =
                pct >= 90 ? 'red' : pct >= 60 ? 'orange' : 'teal';
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    picked ? 'bg-mw-blue-50' : 'hover:bg-mw-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={picked}
                    onChange={() => toggle(s.id)}
                    className="accent-mw-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-mw-gray-900 truncate">
                        {s.film}
                      </p>
                      <Badge tone="gray">{s.rating}</Badge>
                      <Badge tone="blue">{s.language}</Badge>
                    </div>
                    <p className="text-[11px] text-mw-gray-500 truncate">
                      {cinemaNameByCode.get(s.cinema) ?? s.cinema} · {s.screen}{' '}
                      · {s.day} · {s.start} – {s.end}
                    </p>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-mw-gray-500">Filled</span>
                      <span className="font-semibold text-mw-gray-900">
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar value={pct} tone={tone as 'red' | 'orange' | 'teal'} />
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      {draft.size > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-mw-gray-900 mb-2">
            Selected ({draft.size})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {pickedList.slice(0, 30).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-mw-blue-100 text-mw-blue-600 text-[11px] font-medium px-2 py-0.5"
              >
                {s.film.slice(0, 18)}
                {s.film.length > 18 ? '…' : ''} · {s.start}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(s.id);
                  }}
                  className="hover:text-mw-blue-700"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {pickedList.length > 30 && (
              <span className="text-[11px] text-mw-gray-500 self-center">
                +{pickedList.length - 30} more
              </span>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function StepCreative({ draft }: Readonly<{ draft: CampaignDraft }>) {
  const durationLabels = labelsFor(draft.durations, DURATION_OPTIONS);
  return (
    <Card>
      <CardHeader
        title="Creative"
        subtitle={
          durationLabels.length > 0
            ? `Upload videos for: ${durationLabels.join(', ')}`
            : 'Upload videos for each selected duration'
        }
      />
      <CardBody>
        <div className="border-2 border-dashed border-mw-gray-300 rounded-mw p-10 text-center">
          <Upload size={28} className="mx-auto text-mw-gray-400 mb-3" />
          <p className="text-sm font-medium text-mw-gray-900">Drop files to upload</p>
          <p className="text-xs text-mw-gray-500 mt-1">MP4, MOV up to 500MB · 1920×1080 · 24/25/30 fps</p>
          <Button variant="secondary" className="mt-4" leftIcon={<Upload size={14} />}>
            Choose files
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {draft.creatives.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between border border-mw-gray-200 rounded-mw p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-mw bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center">
                  <Film size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-mw-gray-500">
                    {c.sizeMb} MB · {c.duration} · 1920×1080
                  </p>
                </div>
              </div>
              <Badge tone="green" icon={<Check size={12} />}>
                Approved
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function bundleFor(value: string) {
  return BUNDLE_OPTIONS.find((b) => b.value === value);
}

function StepReview({ draft }: Readonly<{ draft: CampaignDraft }>) {
  const durationLabels = labelsFor(draft.durations, DURATION_OPTIONS);
  const emirateLabels = labelsFor(draft.emirates, EMIRATE_OPTIONS);
  const theaterLabels = labelsFor(draft.theaters, THEATER_OPTIONS);
  const genreLabels = labelsFor(draft.genres, GENRE_OPTIONS);
  const categoryLabels = labelsFor(draft.categories, CATEGORY_OPTIONS);
  const goalLabel = GOAL_OPTIONS.find((g) => g.value === draft.goal)?.label ?? '—';
  const languageLabel = LANGUAGE_OPTIONS.find((l) => l.value === draft.language)?.label ?? '—';
  const daypartLabel = DAYPART_OPTIONS.find((d) => d.value === draft.daypart)?.label ?? '—';
  const bundle = bundleFor(draft.bundle);

  const useCustom = draft.pickedSlots.length > 0;
  const screenValue = useCustom
    ? `Custom · ${draft.pickedSlots.length} session${draft.pickedSlots.length === 1 ? '' : 's'} · ${draft.pickedSlots.length * 2} spots`
    : bundle
      ? `${bundle.title} · ${bundle.sessions} sessions · ${bundle.spots} spots`
      : 'No bundle selected';

  const cpm = bundle?.cpm ?? 35;
  const spots = useCustom ? draft.pickedSlots.length * 2 : bundle?.spots ?? 0;
  const impressions = Math.round((draft.budget / cpm) * 1000);

  const joinOrEmpty = (arr: string[], fallback = '—') =>
    arr.length === 0 ? fallback : arr.join(', ');

  return (
    <Card>
      <CardHeader title="Review & submit" subtitle="Confirm details before sending for approval" />
      <CardBody className="space-y-5 text-sm">
        <ReviewGroup title="Campaign brief">
          <Row label="Campaign" value={draft.name || '—'} />
          <Row label="Advertiser" value={draft.advertiser || '—'} />
          <Row label="Flight" value={`${formatDate(draft.flightStart)} – ${formatDate(draft.flightEnd)}`} />
          <Row label="Total budget" value={`$${draft.budget.toLocaleString()}`} />
          <Row label="Creative duration" value={joinOrEmpty(durationLabels)} />
          <Row label="Goal type" value={goalLabel} />
          <Row label="Movie target category" value={joinOrEmpty(categoryLabels, 'Any')} />
        </ReviewGroup>

        <ReviewGroup title="Targeting">
          <Row label="Country" value="United Arab Emirates" />
          <Row label="Emirates" value={joinOrEmpty(emirateLabels)} />
          <Row label="Cities" value={joinOrEmpty(draft.cities, 'Any')} />
          <Row label="Zones" value={joinOrEmpty(draft.zones, 'Any')} />
          <Row label="Cinema type" value={joinOrEmpty(draft.cinemaTypes, 'Any')} />
          <Row label="Theaters" value={joinOrEmpty(theaterLabels)} />
          {draft.audiencePackage && (
            <Row
              label="Audience package"
              value={`${packageById(draft.audiencePackage)?.name ?? '—'} · ~${packageById(draft.audiencePackage)?.estReach ?? '—'} reach`}
            />
          )}
          {draft.movieTargetMode && draft.targetedMovie && (
            <Row
              label="Movie target"
              value={`${draft.targetedMovie} · ${screensPlayingFilm(draft.targetedMovie).length} screens`}
            />
          )}
          <Row label="Film genres" value={joinOrEmpty(genreLabels, 'Any')} />
          <Row label="Language" value={languageLabel} />
          <Row label="Daypart" value={daypartLabel} />
        </ReviewGroup>

        <ReviewGroup title="Screen selection">
          <Row label="Selection mode" value={useCustom ? 'Custom slot picker' : 'Recommended bundle'} />
          <Row label="Plan" value={screenValue} />
          {!useCustom && bundle && (
            <Row label="Coverage" value={`${bundle.theaters} theaters · Est. reach ${bundle.reach}`} />
          )}
        </ReviewGroup>

        <ReviewGroup title="Creative">
          <Row
            label="Files"
            value={
              draft.creatives.length === 0
                ? 'No files uploaded'
                : draft.creatives.map((c) => c.name).join(', ')
            }
          />
        </ReviewGroup>

        <ReviewGroup title="Estimates">
          <Row label="Est. CPM" value={`$${cpm}`} />
          <Row label="Total spots" value={spots.toLocaleString()} />
          <Row label="Est. impressions" value={impressions.toLocaleString()} />
        </ReviewGroup>
      </CardBody>
    </Card>
  );
}

function ReviewGroup({
  title,
  children
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-semibold text-mw-blue-600 mb-2">
        {title}
      </p>
      <div className="space-y-3 border border-mw-gray-200 rounded-mw p-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-start justify-between gap-4 pb-3 border-b border-mw-gray-100 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-mw-gray-500 font-semibold">{label}</span>
      <span className="text-mw-gray-900 font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

function SummaryPanel({ draft }: Readonly<{ draft: CampaignDraft }>) {
  const bundle = bundleFor(draft.bundle);
  const useCustom = draft.pickedSlots.length > 0;
  const spots = useCustom ? draft.pickedSlots.length * 2 : bundle?.spots ?? 0;
  const cpm = bundle?.cpm ?? 35;
  const goalLabel = GOAL_OPTIONS.find((g) => g.value === draft.goal)?.label ?? '—';
  const langShort =
    draft.language === 'en' ? 'EN' : draft.language === 'ar' ? 'AR' : 'EN/AR';
  const dayShort =
    draft.daypart === 'prime' ? 'Prime' : draft.daypart === 'matinee' ? 'Matinee' : draft.daypart === 'late' ? 'Late' : 'All day';
  const projected = draft.budget > 0 && cpm > 0 ? Math.round((draft.budget / cpm) * 1000) : 0;
  const utilization = Math.min(100, Math.round((spots / 1000) * 100));

  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader title="Plan summary" />
        <CardBody className="space-y-3 text-sm">
          <SummaryRow
            icon={<Calendar size={14} />}
            label="Flight"
            value={`${formatDate(draft.flightStart)} – ${formatDate(draft.flightEnd)}`}
          />
          <SummaryRow
            icon={<MapPin size={14} />}
            label="Theaters"
            value={`${draft.theaters.length} selected`}
          />
          <SummaryRow
            icon={<TargetIcon size={14} />}
            label="Audience"
            value={`${dayShort} · ${langShort}`}
          />
          <SummaryRow
            icon={<Sparkles size={14} />}
            label="Goal"
            value={goalLabel}
          />
          <SummaryRow icon={<Film size={14} />} label="Spots" value={spots.toLocaleString()} />
          <SummaryRow
            icon={<DollarSign size={14} />}
            label="Budget"
            value={`$${draft.budget.toLocaleString()}`}
          />
          <div className="pt-3 border-t border-mw-gray-100">
            <p className="text-xs text-mw-gray-500 mb-2">Budget utilization</p>
            <ProgressBar value={utilization} tone="blue" showLabel />
          </div>
          <div className="text-[11px] text-mw-gray-500">
            Est. impressions: {projected.toLocaleString()}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Validation" />
        <CardBody className="space-y-2 text-sm">
          <ValidRow ok text="Creative duration matches selected slots" />
          <ValidRow ok text="Budget within advertiser limit" />
          <ValidRow text="Approval required: Netflix competitive exclusion" warn />
        </CardBody>
      </Card>
    </aside>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-mw-gray-500">
        {icon}
        {label}
      </span>
      <span className="font-medium text-mw-gray-900">{value}</span>
    </div>
  );
}

function ValidRow({ text, ok, warn }: { text: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
          ok ? 'bg-mw-green-100 text-mw-green-500' : warn ? 'bg-mw-amber-100 text-mw-amber-500' : 'bg-mw-gray-100 text-mw-gray-500'
        }`}
      >
        <Check size={12} />
      </span>
      <p className="text-mw-gray-700">{text}</p>
    </div>
  );
}

interface MultiCheckOption {
  value: string;
  label: string;
}

function MultiCheckDropdown({
  options,
  defaultSelected = [],
  placeholder = 'Select',
  onChange
}: Readonly<{
  options: MultiCheckOption[];
  defaultSelected?: string[];
  placeholder?: string;
  onChange?: (values: string[]) => void;
}>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = (v: string) =>
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const allSelected = selected.length === options.length;
  const label =
    selected.length === 0
      ? placeholder
      : allSelected
        ? `All (${options.length})`
        : selected.length === 1
          ? options.find((o) => o.value === selected[0])?.label ?? placeholder
          : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-mw-gray-300 rounded-mw text-sm bg-white hover:border-mw-blue-500 focus:outline-none focus:border-mw-blue-500"
      >
        <span className={selected.length === 0 ? 'text-mw-gray-500' : 'text-mw-gray-900'}>
          {label}
        </span>
        <ChevronDown size={16} className={`text-mw-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-mw-gray-200 rounded-mw shadow-lg max-h-64 overflow-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b border-mw-gray-100 text-xs">
            <button
              type="button"
              className="text-mw-blue-500 hover:text-mw-blue-600"
              onClick={() => setSelected(options.map((o) => o.value))}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-mw-gray-500 hover:text-mw-gray-900"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
          {options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-mw-blue-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="accent-mw-blue-500"
                />
                <span className="text-mw-gray-900">{o.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
