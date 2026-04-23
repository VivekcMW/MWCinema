import { Badge, Button, Card, CardBody, CardHeader, PageHeader } from '../components/ui';
import { Plug, CheckCircle2, Plus, MapPin } from 'lucide-react';
import { theaterMeta, getTheaterName } from '../data/cinemaMeta';

const dsps = [
  { name: 'The Trade Desk', status: 'Connected', campaigns: 12, lastSync: '5 min ago', tone: 'green' as const },
  { name: 'Google DV360', status: 'Connected', campaigns: 8, lastSync: '12 min ago', tone: 'green' as const },
  { name: 'Amazon DSP', status: 'Connected', campaigns: 4, lastSync: '1 hr ago', tone: 'green' as const },
  { name: 'Xandr', status: 'Not connected', campaigns: 0, lastSync: '—', tone: 'gray' as const },
  { name: 'Yahoo DSP', status: 'Error', campaigns: 2, lastSync: '3 hr ago', tone: 'red' as const },
  { name: 'MediaMath', status: 'Not connected', campaigns: 0, lastSync: '—', tone: 'gray' as const }
];

export default function DSP() {
  return (
    <>
      <PageHeader
        title="DSP connectors"
        subtitle="Programmatic demand integrations"
        breadcrumbs={[{ label: 'Integrations' }, { label: 'DSP Connectors' }]}
        actions={<Button leftIcon={<Plus size={16} />}>Add DSP</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dsps.map((d) => (
          <Card key={d.name}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-mw bg-mw-blue-100 text-mw-blue-600 flex items-center justify-center">
                    <Plug size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-mw-gray-900">{d.name}</h3>
                    <p className="text-xs text-mw-gray-500">Last sync: {d.lastSync}</p>
                  </div>
                </div>
                <Badge tone={d.tone}>{d.status}</Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-mw-gray-100">
                <span className="text-xs text-mw-gray-500">{d.campaigns} active campaigns</span>
                <Button variant="secondary" size="sm">
                  {d.status === 'Connected' ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Programmatic-eligible inventory"
          subtitle="Only these theaters are exposed to connected DSPs. Direct-sale theaters are excluded."
          action={
            <Badge tone="green" icon={<CheckCircle2 size={10} />}>
              {theaterMeta.filter((t) => t.programmatic).length} of {theaterMeta.length} theaters
            </Badge>
          }
        />
        <CardBody>
          <div
            data-testid="programmatic-inventory"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {theaterMeta
              .filter((t) => t.programmatic)
              .map((t) => (
                <div
                  key={t.code}
                  className="flex items-center justify-between rounded-mw-sm border border-mw-gray-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-mw-gray-900 truncate">
                      {getTheaterName(t.code)}
                    </p>
                    <p className="text-[11px] text-mw-gray-500 flex items-center gap-1 truncate">
                      <MapPin size={10} />
                      {t.emirate} · {t.zone}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1 max-w-[50%]">
                    {t.types.slice(0, 2).map((ty) => (
                      <span
                        key={ty}
                        className="text-[10px] font-medium text-mw-blue-600 bg-mw-blue-100 rounded-full px-1.5 py-0.5"
                      >
                        {ty}
                      </span>
                    ))}
                    {t.types.length > 2 && (
                      <span className="text-[10px] text-mw-gray-500">+{t.types.length - 2}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-3 border-t border-mw-gray-100">
            <p className="text-[11px] text-mw-gray-500 mb-2">
              Excluded from programmatic (direct-sale only):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {theaterMeta
                .filter((t) => !t.programmatic)
                .map((t) => (
                  <span
                    key={t.code}
                    className="inline-flex items-center gap-1 text-[11px] text-mw-gray-600 bg-mw-gray-100 rounded-full px-2 py-0.5"
                  >
                    {getTheaterName(t.code)}
                  </span>
                ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
