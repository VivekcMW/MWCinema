import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Link2,
  MapPin,
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Zap
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
  MapMarker,
  MapView,
  PageHeader,
  Select,
  Stepper,
  Tabs
} from '../components/ui';
import { cinemas as seedCinemas } from '../data/mock';

type Theater = {
  code: string;
  name: string;
  city: string;
  screens: number;
  lng: number;
  lat: number;
  premiumCategory?: 'Standard' | 'Premium' | 'Gold' | 'Platinum';
  country?: string;
  district?: string;
  pincode?: string;
  address?: string;
  status?: 'Active' | 'Draft';
};

const EMIRATE_OPTIONS = [
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Al Ain', label: 'Al Ain' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' }
];

const CITY_COORDS: Record<string, { lng: number; lat: number }> = {
  'Abu Dhabi': { lng: 54.3773, lat: 24.4539 },
  Dubai: { lng: 55.2708, lat: 25.2048 },
  Sharjah: { lng: 55.4033, lat: 25.3463 },
  'Al Ain': { lng: 55.7447, lat: 24.1913 },
  Ajman: { lng: 55.5136, lat: 25.4052 },
  'Ras Al Khaimah': { lng: 55.9754, lat: 25.8007 },
  Fujairah: { lng: 56.3269, lat: 25.1288 },
  'Umm Al Quwain': { lng: 55.5533, lat: 25.5647 }
};

const FORMAT_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'IMAX', label: 'IMAX' },
  { value: 'Gold', label: 'Gold Class' },
  { value: '4DX', label: '4DX' },
  { value: 'VIP', label: 'VIP' }
];

type ScreenRow = { id: number; name: string; format: string; seats: number };

const STEPS = [
  { label: 'Property', description: 'Basic details' },
  { label: 'Screens', description: 'Screen inventory' },
  { label: 'Review', description: 'Confirm & save' }
];

export default function Theaters() {
  const [list, setList] = useState<Theater[]>(() =>
    seedCinemas.map((c) => ({ ...c }))
  );
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const mergeTheaters = (incoming: Theater[]) => {
    setList((prev) => {
      const existing = new Set(prev.map((p) => p.code));
      const toAdd = incoming.filter((t) => !existing.has(t.code));
      return [...toAdd, ...prev];
    });
  };

  return (
    <>
      <PageHeader
        title="Theaters"
        subtitle="Cinema properties across the network"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Theaters' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={<Upload size={16} />}
              onClick={() => setBulkOpen(true)}
            >
              Bulk import
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
              Add theater
            </Button>
          </div>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Network map" subtitle="Cinema locations across the UAE" />
        <CardBody className="p-0">
          <MapView
            height={380}
            initialViewState={{ longitude: 55.0, latitude: 24.7, zoom: 6.5 }}
          >
            {list.map((c) => (
              <MapMarker
                key={c.code}
                longitude={c.lng}
                latitude={c.lat}
                anchor="bottom"
              >
                <div className="flex flex-col items-center -translate-y-1">
                  <div className="px-2 py-1 rounded-mw-sm bg-white border border-mw-gray-200 shadow-mw-card text-[11px] font-semibold text-mw-gray-900 whitespace-nowrap">
                    {c.name}
                  </div>
                  <div className="w-3 h-3 rounded-full bg-mw-blue-500 border-2 border-white shadow-mw-card -mt-0.5" />
                </div>
              </MapMarker>
            ))}
          </MapView>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((c) => (
          <Card key={c.code}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-mw-gray-500 font-medium">#{c.code}</p>
                  <h3 className="text-lg font-semibold text-mw-gray-900">
                    {c.name}
                  </h3>
                  <p className="text-xs text-mw-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {c.city}, {c.country ?? 'UAE'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={c.status === 'Draft' ? 'gray' : 'green'}>
                    {c.status ?? 'Active'}
                  </Badge>
                  {c.premiumCategory && c.premiumCategory !== 'Standard' && (
                    <Badge
                      tone={
                        c.premiumCategory === 'Platinum'
                          ? 'blue'
                          : c.premiumCategory === 'Gold'
                          ? 'amber'
                          : 'teal'
                      }
                    >
                      {c.premiumCategory}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-mw-gray-100">
                <Stat label="Screens" value={c.screens} />
                <Stat label="Weekly sessions" value={c.screens * 28} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <AddTheaterDrawer
        open={open}
        onClose={() => setOpen(false)}
        existingCodes={list.map((c) => c.code)}
        onCreate={(t) => {
          setList((prev) => [t, ...prev]);
          setOpen(false);
        }}
      />

      <BulkImportDrawer
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        existingCodes={list.map((c) => c.code)}
        onImport={(rows) => {
          mergeTheaters(rows);
          setBulkOpen(false);
        }}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] text-mw-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-base font-semibold text-mw-gray-900 mt-1">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add Theater wizard                                                  */
/* ------------------------------------------------------------------ */

function AddTheaterDrawer({
  open,
  onClose,
  existingCodes,
  onCreate
}: {
  open: boolean;
  onClose: () => void;
  existingCodes: string[];
  onCreate: (t: Theater) => void;
}) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState<string>('Dubai');
  const [address, setAddress] = useState('');
  const [operator, setOperator] = useState('VOX Cinemas');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');
  const [premiumCategory, setPremiumCategory] = useState<Theater['premiumCategory']>('Standard');
  const [country, setCountry] = useState('UAE');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [lng, setLng] = useState<string>(String(CITY_COORDS.Dubai.lng));
  const [lat, setLat] = useState<string>(String(CITY_COORDS.Dubai.lat));
  const [screens, setScreens] = useState<ScreenRow[]>([
    { id: 1, name: 'Screen 1', format: 'Standard', seats: 180 },
    { id: 2, name: 'Screen 2', format: 'Standard', seats: 180 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setStep(0);
    setCode('');
    setName('');
    setCity('Dubai');
    setAddress('');
    setOperator('VOX Cinemas');
    setStatus('Active');
    setPremiumCategory('Standard');
    setCountry('UAE');
    setDistrict('');
    setPincode('');
    setLng(String(CITY_COORDS.Dubai.lng));
    setLat(String(CITY_COORDS.Dubai.lat));
    setScreens([
      { id: 1, name: 'Screen 1', format: 'Standard', seats: 180 },
      { id: 2, name: 'Screen 2', format: 'Standard', seats: 180 }
    ]);
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 150);
  };

  const onCityChange = (v: string) => {
    setCity(v);
    const coords = CITY_COORDS[v];
    if (coords) {
      setLng(String(coords.lng));
      setLat(String(coords.lat));
    }
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!code.trim()) e.code = 'Property code is required';
    else if (!/^\d{4}$/.exec(code.trim())) e.code = 'Use a 4-digit code';
    else if (existingCodes.includes(code.trim()))
      e.code = 'This code already exists';
    if (!name.trim()) e.name = 'Theater name is required';
    if (!city) e.city = 'Select an emirate';
    const lngN = Number(lng);
    const latN = Number(lat);
    if (Number.isNaN(lngN) || lngN < 51 || lngN > 57)
      e.lng = 'Longitude out of UAE range';
    if (Number.isNaN(latN) || latN < 22 || latN > 27)
      e.lat = 'Latitude out of UAE range';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (screens.length === 0) e.screens = 'Add at least one screen';
    screens.forEach((s) => {
      if (!s.name.trim()) e[`s-${s.id}-name`] = 'Required';
      if (!Number.isFinite(s.seats) || s.seats <= 0)
        e[`s-${s.id}-seats`] = 'Invalid';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const addScreen = () => {
    setScreens((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [
        ...prev,
        {
          id: nextId,
          name: `Screen ${prev.length + 1}`,
          format: 'Standard',
          seats: 180
        }
      ];
    });
  };
  const removeScreen = (id: number) =>
    setScreens((prev) => prev.filter((s) => s.id !== id));
  const updateScreen = (id: number, patch: Partial<ScreenRow>) =>
    setScreens((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const totalSeats = useMemo(
    () => screens.reduce((a, s) => a + (Number(s.seats) || 0), 0),
    [screens]
  );
  const premiumScreens = useMemo(
    () => screens.filter((s) => s.format !== 'Standard').length,
    [screens]
  );

  const handleSubmit = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onCreate({
        code: code.trim(),
        name: name.trim(),
        city,
        screens: screens.length,
        lng: Number(lng),
        lat: Number(lat),
        premiumCategory,
        country,
        district: district.trim(),
        pincode: pincode.trim(),
        address: address.trim(),
        status
      });
      setSubmitting(false);
      reset();
    }, 500);
  };

  const isLast = step === STEPS.length - 1;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Add theater"
      subtitle="Register a new cinema property"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={step === 0 ? handleClose : goBack}
            leftIcon={step === 0 ? undefined : <ChevronLeft size={14} />}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="text-xs text-mw-gray-500">
            Step {step + 1} of {STEPS.length}
          </div>
          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              leftIcon={<Check size={14} />}
            >
              {submitting ? 'Saving…' : 'Create theater'}
            </Button>
          ) : (
            <Button onClick={goNext} rightIcon={<ChevronRight size={14} />}>
              Continue
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-5">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Property code" hint="Unique 4-digit identifier">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 0051"
                maxLength={4}
              />
              {errors.code && (
                <p className="text-[11px] text-mw-red-500 mt-1">{errors.code}</p>
              )}
            </Field>
            <Field label="Status">
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Active' | 'Draft')
                }
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Draft', label: 'Draft' }
                ]}
              />
            </Field>
          </div>

          <Field label="Theater name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mall of the Emirates"
              leftIcon={<Building2 size={14} />}
            />
            {errors.name && (
              <p className="text-[11px] text-mw-red-500 mt-1">{errors.name}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Emirate">
              <Select
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                options={EMIRATE_OPTIONS}
              />
              {errors.city && (
                <p className="text-[11px] text-mw-red-500 mt-1">{errors.city}</p>
              )}
            </Field>
            <Field label="Operator">
              <Select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                options={[
                  { value: 'VOX Cinemas', label: 'VOX Cinemas' },
                  { value: 'Novo Cinemas', label: 'Novo Cinemas' },
                  { value: 'Reel Cinemas', label: 'Reel Cinemas' },
                  { value: 'Roxy Cinemas', label: 'Roxy Cinemas' },
                  { value: 'Cinemacity', label: 'Cinemacity' }
                ]}
              />
            </Field>
          </div>

          <Field label="Street address" hint="Mall name, road, or landmark">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sheikh Zayed Road, Dubai"
              leftIcon={<MapPin size={14} />}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. UAE"
              />
            </Field>
            <Field label="Premium category">
              <Select
                value={premiumCategory ?? 'Standard'}
                onChange={(e) =>
                  setPremiumCategory(e.target.value as Theater['premiumCategory'])
                }
                options={[
                  { value: 'Standard', label: 'Standard' },
                  { value: 'Premium', label: 'Premium' },
                  { value: 'Gold', label: 'Gold' },
                  { value: 'Platinum', label: 'Platinum' }
                ]}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="District">
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Al Barsha"
              />
            </Field>
            <Field label="Pincode">
              <Input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 12345"
              />
            </Field>
          </div>

          {Number.isFinite(Number(lng)) && Number.isFinite(Number(lat)) && (
            <div className="rounded-mw-sm overflow-hidden border border-mw-gray-200">
              <MapView
                height={180}
                initialViewState={{
                  longitude: Number(lng),
                  latitude: Number(lat),
                  zoom: 11
                }}
              >
                <MapMarker
                  longitude={Number(lng)}
                  latitude={Number(lat)}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center -translate-y-1">
                    <div className="px-2 py-1 rounded-mw-sm bg-mw-blue-500 text-white text-[11px] font-semibold whitespace-nowrap shadow-mw-card">
                      {name || 'New theater'}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-mw-blue-500 border-2 border-white shadow-mw-card -mt-0.5" />
                  </div>
                </MapMarker>
              </MapView>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-mw-gray-900">
                Screen inventory
              </p>
              <p className="text-xs text-mw-gray-500">
                Add each screen with its format and seat capacity
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={addScreen}
              leftIcon={<Plus size={14} />}
            >
              Add screen
            </Button>
          </div>

          {errors.screens && (
            <p className="text-[12px] text-mw-red-500">{errors.screens}</p>
          )}

          <div className="space-y-2">
            {screens.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-12 gap-2 items-start rounded-mw-sm border border-mw-gray-200 bg-mw-gray-50/40 p-3"
              >
                <div className="col-span-1 flex items-center justify-center h-9">
                  <span className="w-7 h-7 rounded-full bg-white border border-mw-gray-200 flex items-center justify-center text-[11px] font-semibold text-mw-gray-600">
                    {i + 1}
                  </span>
                </div>
                <div className="col-span-5">
                  <Input
                    value={s.name}
                    onChange={(e) => updateScreen(s.id, { name: e.target.value })}
                    placeholder="Screen name"
                    leftIcon={<Monitor size={14} />}
                  />
                  {errors[`s-${s.id}-name`] && (
                    <p className="text-[11px] text-mw-red-500 mt-1">
                      {errors[`s-${s.id}-name`]}
                    </p>
                  )}
                </div>
                <div className="col-span-3">
                  <Select
                    value={s.format}
                    onChange={(e) =>
                      updateScreen(s.id, { format: e.target.value })
                    }
                    options={FORMAT_OPTIONS}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={1}
                    value={s.seats}
                    onChange={(e) =>
                      updateScreen(s.id, {
                        seats: Number.parseInt(e.target.value, 10) || 0
                      })
                    }
                    placeholder="Seats"
                  />
                  {errors[`s-${s.id}-seats`] && (
                    <p className="text-[11px] text-mw-red-500 mt-1">
                      {errors[`s-${s.id}-seats`]}
                    </p>
                  )}
                </div>
                <div className="col-span-1 flex items-center justify-end h-9">
                  <button
                    onClick={() => removeScreen(s.id)}
                    className="text-mw-gray-400 hover:text-mw-red-500 transition-colors"
                    aria-label="Remove screen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-mw-gray-200">
            <SummaryStat label="Screens" value={screens.length} />
            <SummaryStat label="Premium" value={premiumScreens} />
            <SummaryStat label="Total seats" value={totalSeats} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-mw-sm border border-mw-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-mw-gray-50 border-b border-mw-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-mw-gray-500">#{code}</p>
                <p className="text-sm font-semibold text-mw-gray-900">{name}</p>
              </div>
              <Badge tone={status === 'Active' ? 'green' : 'gray'}>
                {status}
              </Badge>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <ReviewRow label="Operator" value={operator} />
              <ReviewRow label="City" value={`${city}, UAE`} />
              <ReviewRow label="Address" value={address || '—'} />
              <ReviewRow
                label="Coordinates"
                value={`${Number(lng).toFixed(4)}, ${Number(lat).toFixed(4)}`}
              />
              <ReviewRow label="Screens" value={String(screens.length)} />
              <ReviewRow label="Total seats" value={String(totalSeats)} />
              <ReviewRow
                label="Premium formats"
                value={
                  premiumScreens > 0
                    ? screens
                        .filter((s) => s.format !== 'Standard')
                        .map((s) => s.format)
                        .join(', ')
                    : 'None'
                }
              />
            </div>
          </div>

          <div className="rounded-mw-sm border border-mw-gray-200">
            <div className="px-4 py-2 border-b border-mw-gray-200 text-xs font-semibold text-mw-gray-600 uppercase tracking-wide">
              Screens
            </div>
            <div className="divide-y divide-mw-gray-100">
              {screens.map((s) => (
                <div
                  key={s.id}
                  className="px-4 py-2 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-mw-gray-400" />
                    <span className="font-medium text-mw-gray-900">
                      {s.name}
                    </span>
                    <Badge tone={s.format === 'Standard' ? 'gray' : 'blue'}>
                      {s.format}
                    </Badge>
                  </div>
                  <span className="text-xs text-mw-gray-500">
                    {s.seats} seats
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-mw-gray-500">
            By creating this theater, it becomes available for scheduling across
            Ad Slots and Campaigns.
          </p>
        </div>
      )}
    </Drawer>
  );
}

function SummaryStat({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-mw-sm border border-mw-gray-200 bg-white p-3">
      <p className="text-[11px] text-mw-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-semibold text-mw-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-mw-gray-500">{label}</span>
      <span className="text-sm font-medium text-mw-gray-900 text-right">
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk import (Excel / CSV / API)                                     */
/* ------------------------------------------------------------------ */

type ParsedRow = {
  ok: boolean;
  error?: string;
  theater: Theater;
};

const CSV_TEMPLATE =
  'code,name,city,screens,lng,lat\n' +
  '0051,Reel Cinemas Dubai Mall,Dubai,22,55.2796,25.1972\n' +
  '0062,Novo IMG Worlds,Dubai,10,55.3030,25.0705\n';

const API_PRESETS = [
  {
    id: 'vox',
    name: 'VOX Cinemas API',
    endpoint: 'https://api.voxcinemas.com/v2/locations',
    rows: 14
  },
  {
    id: 'novo',
    name: 'Novo Cinemas API',
    endpoint: 'https://partners.novocinemas.com/theaters',
    rows: 8
  },
  {
    id: 'reel',
    name: 'Reel Cinemas API',
    endpoint: 'https://api.reelcinemas.com/v1/sites',
    rows: 5
  }
];

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (key: string) => header.indexOf(key);
  const iCode = idx('code');
  const iName = idx('name');
  const iCity = idx('city');
  const iScreens = idx('screens');
  const iLng = idx('lng');
  const iLat = idx('lat');

  return lines.slice(1).map((line, rowIdx) => {
    const cols = line.split(',').map((c) => c.trim());
    const code = iCode >= 0 ? cols[iCode] : '';
    const name = iName >= 0 ? cols[iName] : '';
    const city = iCity >= 0 ? cols[iCity] : '';
    const screens = iScreens >= 0 ? Number.parseInt(cols[iScreens], 10) : 0;
    const lng = iLng >= 0 ? Number.parseFloat(cols[iLng]) : Number.NaN;
    const lat = iLat >= 0 ? Number.parseFloat(cols[iLat]) : Number.NaN;

    const t: Theater = { code, name, city, screens, lng, lat };
    let error: string | undefined;
    if (!code) error = `Row ${rowIdx + 2}: missing code`;
    else if (!/^\d{3,5}$/.exec(code)) error = `Row ${rowIdx + 2}: invalid code`;
    else if (!name) error = `Row ${rowIdx + 2}: missing name`;
    else if (!city) error = `Row ${rowIdx + 2}: missing city`;
    else if (!Number.isFinite(screens) || screens <= 0)
      error = `Row ${rowIdx + 2}: invalid screens count`;
    else if (!Number.isFinite(lng) || lng < 51 || lng > 57)
      error = `Row ${rowIdx + 2}: longitude out of UAE range`;
    else if (!Number.isFinite(lat) || lat < 22 || lat > 27)
      error = `Row ${rowIdx + 2}: latitude out of UAE range`;

    return { ok: !error, error, theater: t };
  });
}

function BulkImportDrawer({
  open,
  onClose,
  existingCodes,
  onImport
}: {
  open: boolean;
  onClose: () => void;
  existingCodes: string[];
  onImport: (rows: Theater[]) => void;
}) {
  const [mode, setMode] = useState<'file' | 'api'>('file');
  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [apiPreset, setApiPreset] = useState<string>('vox');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState(API_PRESETS[0].endpoint);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('file');
    setFileName('');
    setRows([]);
    setDragOver(false);
    setApiPreset('vox');
    setApiKey('');
    setEndpoint(API_PRESETS[0].endpoint);
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
      const text = String(reader.result || '');
      // naive .xlsx handling: if it's binary, we fall back to demo data
      if (file.name.toLowerCase().endsWith('.csv')) {
        setRows(parseCsv(text));
      } else {
        // demo behaviour for xlsx — seed with template rows
        setRows(parseCsv(CSV_TEMPLATE));
      }
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
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theaters-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPreset = (id: string) => {
    setApiPreset(id);
    const p = API_PRESETS.find((x) => x.id === id);
    if (p) setEndpoint(p.endpoint);
  };

  const runApiSync = () => {
    setSyncing(true);
    setRows([]);
    setTimeout(() => {
      const preset = API_PRESETS.find((p) => p.id === apiPreset) ?? API_PRESETS[0];
      const samples: Theater[] = [
        { code: '0051', name: 'Reel Cinemas Dubai Mall', city: 'Dubai', screens: 22, lng: 55.2796, lat: 25.1972 },
        { code: '0062', name: 'Novo IMG Worlds', city: 'Dubai', screens: 10, lng: 55.303, lat: 25.0705 },
        { code: '0073', name: 'VOX Grand Hyatt', city: 'Abu Dhabi', screens: 8, lng: 54.4957, lat: 24.4138 },
        { code: '0084', name: 'VOX Mirdif City Centre', city: 'Dubai', screens: 12, lng: 55.4205, lat: 25.2168 },
        { code: '0095', name: 'Reel Cinemas JBR', city: 'Dubai', screens: 9, lng: 55.1421, lat: 25.0787 },
        { code: '0106', name: 'Novo Sharjah City Centre', city: 'Sharjah', screens: 7, lng: 55.4033, lat: 25.3463 },
        { code: '0117', name: 'VOX Al Hamra Mall', city: 'Ras Al Khaimah', screens: 6, lng: 55.9754, lat: 25.8007 },
        { code: '0128', name: 'Cinemacity Fujairah', city: 'Fujairah', screens: 5, lng: 56.3269, lat: 25.1288 }
      ].slice(0, preset.rows);
      setRows(
        samples.map((t) => ({ ok: true, theater: t }))
      );
      setSyncing(false);
    }, 900);
  };

  const validRows = rows.filter((r) => r.ok);
  const invalidRows = rows.filter((r) => !r.ok);
  const duplicateCodes = new Set(
    validRows
      .map((r) => r.theater.code)
      .filter((c) => existingCodes.includes(c))
  );
  const importable = validRows.filter((r) => !duplicateCodes.has(r.theater.code));

  const runImport = () => {
    if (importable.length === 0) return;
    setImporting(true);
    setTimeout(() => {
      onImport(importable.map((r) => r.theater));
      setImporting(false);
      reset();
    }, 400);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Bulk import theaters"
      subtitle="Upload a spreadsheet or sync directly from a provider API"
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <div className="text-xs text-mw-gray-500">
            {rows.length > 0 && (
              <span>
                {importable.length} ready · {invalidRows.length} invalid ·{' '}
                {duplicateCodes.size} duplicate
              </span>
            )}
          </div>
          <Button
            onClick={runImport}
            disabled={importing || importable.length === 0}
            leftIcon={<Check size={14} />}
          >
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
              <p className="text-sm font-semibold text-mw-gray-900">
                Spreadsheet upload
              </p>
              <p className="text-xs text-mw-gray-500">
                Accepts .csv and .xlsx with columns: code, name, city, screens,
                lng, lat
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              leftIcon={<Download size={14} />}
            >
              Template
            </Button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-mw-sm border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragOver
                ? 'border-mw-blue-500 bg-mw-blue-50'
                : 'border-mw-gray-300 bg-mw-gray-50/50 hover:border-mw-blue-500'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center mb-3">
              <FileSpreadsheet size={18} />
            </div>
            <p className="text-sm font-semibold text-mw-gray-900">
              {fileName ? fileName : 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-mw-gray-500 mt-1">
              .csv, .xlsx up to 2 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
              }}
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
              options={API_PRESETS.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          <Field label="Endpoint">
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              leftIcon={<Link2 size={14} />}
            />
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
            {syncing ? 'Syncing…' : 'Fetch theaters'}
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-mw-gray-900">
              Preview · {rows.length} rows
            </p>
            <button
              onClick={() => {
                setRows([]);
                setFileName('');
              }}
              className="text-xs text-mw-gray-500 hover:text-mw-gray-800"
            >
              Clear
            </button>
          </div>

          {invalidRows.length > 0 && (
            <div className="mb-3 rounded-mw-sm border border-mw-amber-500/40 bg-mw-amber-100/40 p-3">
              <p className="text-xs font-semibold text-mw-gray-900 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-mw-amber-500" />
                {invalidRows.length} row
                {invalidRows.length === 1 ? '' : 's'} have errors and will be
                skipped
              </p>
              <ul className="mt-1.5 space-y-0.5 text-[11px] text-mw-gray-600 list-disc list-inside">
                {invalidRows.slice(0, 3).map((r) => (
                  <li key={r.error}>{r.error}</li>
                ))}
                {invalidRows.length > 3 && (
                  <li>…and {invalidRows.length - 3} more</li>
                )}
              </ul>
            </div>
          )}

          <div className="rounded-mw-sm border border-mw-gray-200 overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-mw-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-mw-gray-600">
                      Code
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-mw-gray-600">
                      Name
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-mw-gray-600">
                      City
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-mw-gray-600">
                      Screens
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-mw-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mw-gray-100">
                  {rows.map((r, i) => {
                    const dup =
                      r.ok && duplicateCodes.has(r.theater.code);
                    const cls = !r.ok
                      ? 'bg-mw-red-100/30'
                      : dup
                        ? 'bg-mw-amber-100/30'
                        : '';
                    return (
                      <tr key={`${r.theater.code}-${i}`} className={cls}>
                        <td className="px-3 py-2 font-mono text-mw-gray-800">
                          {r.theater.code || '—'}
                        </td>
                        <td className="px-3 py-2 text-mw-gray-900 font-medium">
                          {r.theater.name || '—'}
                        </td>
                        <td className="px-3 py-2 text-mw-gray-600">
                          {r.theater.city || '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-mw-gray-800">
                          {Number.isFinite(r.theater.screens)
                            ? r.theater.screens
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!r.ok ? (
                            <Badge tone="red">Error</Badge>
                          ) : dup ? (
                            <Badge tone="orange">Duplicate</Badge>
                          ) : (
                            <Badge tone="green">Ready</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
