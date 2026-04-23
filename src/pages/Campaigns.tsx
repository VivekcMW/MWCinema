import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  DataTable,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  Tabs
} from '../components/ui';
import type { Column } from '../components/ui';
import { campaigns } from '../data/mock';
import { useState } from 'react';

type Campaign = (typeof campaigns)[number];

const statusTone: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'teal'> = {
  Live: 'green',
  'Pending Approval': 'amber',
  Scheduled: 'blue',
  Draft: 'gray',
  Completed: 'teal'
};

const cols: Column<Campaign>[] = [
  {
    key: 'name',
    header: 'Campaign',
    render: (r) => (
      <div>
        <p className="font-medium text-mw-gray-900">{r.name}</p>
        <p className="text-xs text-mw-gray-500">
          {r.id} · {r.advertiser}
        </p>
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <Badge tone={statusTone[r.status] || 'gray'}>{r.status}</Badge>
  },
  {
    key: 'flight',
    header: 'Flight',
    render: (r) => (
      <span className="text-mw-gray-700 text-xs">
        {r.start} → {r.end}
      </span>
    )
  },
  {
    key: 'budget',
    header: 'Budget',
    render: (r) => (
      <div>
        <p className="font-medium text-mw-gray-900">${r.budget.toLocaleString()}</p>
        <p className="text-xs text-mw-gray-500">${r.spent.toLocaleString()} spent</p>
      </div>
    )
  },
  { key: 'spots', header: 'Spots', render: (r) => r.spots.toLocaleString() },
  {
    key: 'fill',
    header: 'Delivery',
    className: 'w-48',
    render: (r) => <ProgressBar value={r.fill} tone="blue" showLabel />
  },
  {
    key: 'actions',
    header: '',
    render: () => (
      <button className="text-mw-gray-400 hover:text-mw-gray-700">
        <MoreHorizontal size={16} />
      </button>
    )
  }
];

export default function Campaigns() {
  const [tab, setTab] = useState('all');
  const filtered =
    tab === 'all' ? campaigns : campaigns.filter((c) => c.status.toLowerCase().includes(tab));

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="Manage all media plans in one place"
        actions={
          <Link to="/campaigns/new">
            <Button leftIcon={<Plus size={16} />}>New campaign</Button>
          </Link>
        }
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Search">
            <Input leftIcon={<Search size={14} />} placeholder="Campaign name or ID" />
          </Field>
          <Field label="Advertiser">
            <Select
              options={[
                { value: 'all', label: 'All advertisers' },
                { value: 'netflix', label: 'Netflix' },
                { value: 'pepsi', label: 'PepsiCo' },
                { value: 'emirates', label: 'Emirates' }
              ]}
            />
          </Field>
          <Field label="Cinema">
            <Select
              options={[
                { value: 'all', label: 'All cinemas' },
                { value: 'aljimi', label: 'Al Jimi Mall' }
              ]}
            />
          </Field>
          <Field label="Flight">
            <Select
              options={[
                { value: 'month', label: 'This month' },
                { value: 'quarter', label: 'This quarter' },
                { value: 'custom', label: 'Custom…' }
              ]}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <div className="px-5 pt-3">
          <Tabs
            tabs={[
              { label: 'All', value: 'all', count: campaigns.length },
              { label: 'Live', value: 'live', count: campaigns.filter((c) => c.status === 'Live').length },
              { label: 'Pending', value: 'pending', count: campaigns.filter((c) => c.status === 'Pending Approval').length },
              { label: 'Scheduled', value: 'scheduled', count: campaigns.filter((c) => c.status === 'Scheduled').length },
              { label: 'Draft', value: 'draft', count: campaigns.filter((c) => c.status === 'Draft').length },
              { label: 'Completed', value: 'completed', count: campaigns.filter((c) => c.status === 'Completed').length }
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <DataTable columns={cols} rows={filtered} rowKey={(r) => r.id} />
      </Card>
    </>
  );
}
