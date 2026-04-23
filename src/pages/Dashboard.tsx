import {
  Building2,
  Monitor,
  Megaphone,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Flame,
  CircleCheck,
  CircleAlert,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DoughnutChart,
  LineChart,
  PageHeader,
  StatCard,
  mwPalette
} from '../components/ui';
import { activity, topMovies } from '../data/mock';

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of inventory, campaigns, and revenue across the network"
        actions={
          <>
            <Link to="/inventory/import">
              <Button variant="secondary" leftIcon={<TrendingUp size={16} />}>
                Import schedule
              </Button>
            </Link>
            <Link to="/campaigns/new">
              <Button leftIcon={<Plus size={16} />}>Plan new campaign</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total theaters" value={13} helper="Active in network" icon={<Building2 size={20} />} tone="blue" />
        <StatCard label="Total screens" value={37} helper="Across all theaters" icon={<Monitor size={20} />} tone="teal" />
        <StatCard label="Active campaigns" value={5} helper="Currently delivering" icon={<Megaphone size={20} />} tone="orange" />
        <StatCard label="Total revenue" value="$237,000" helper="This month" icon={<DollarSign size={20} />} tone="blue" />
      </div>

      {/* Trend & format mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Impressions & revenue trend"
            subtitle="Last 7 days across the network"
          />
          <CardBody>
            <LineChart
              height={260}
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    label: 'Impressions (K)',
                    data: [180, 220, 265, 240, 320, 410, 380],
                    borderColor: mwPalette.blue,
                    backgroundColor: mwPalette.blueSoft,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: mwPalette.blue
                  },
                  {
                    label: 'Revenue ($K)',
                    data: [22, 28, 31, 29, 38, 46, 43],
                    borderColor: mwPalette.orange,
                    backgroundColor: mwPalette.orangeSoft,
                    tension: 0.35,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: mwPalette.orange
                  }
                ]
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Format mix" subtitle="Booked slots by format" />
          <CardBody>
            <DoughnutChart
              height={240}
              data={{
                labels: ['Pre-show 60s', 'Pre-show 30s', 'Lobby loop', 'Programmatic', 'Noovie'],
                datasets: [
                  {
                    data: [312, 288, 140, 514, 30],
                    backgroundColor: [
                      mwPalette.blue,
                      mwPalette.teal,
                      mwPalette.orange,
                      mwPalette.amber,
                      mwPalette.purple
                    ],
                    borderWidth: 0
                  }
                ]
              }}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top movies by demand"
            subtitle="Movies driving the most ad slot bookings this week"
            action={
              <Link to="/movies" className="text-xs text-mw-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            }
          />
          <CardBody className="divide-y divide-mw-gray-100 p-0">
            {topMovies.map((m) => (
              <div key={m.code} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-mw bg-mw-blue-100 text-mw-blue-700 text-xs font-bold flex items-center justify-center">
                    {m.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-mw-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-mw-gray-500">
                      {m.genre} • {m.rating} • {m.screens} screens
                    </p>
                  </div>
                </div>
                <Badge tone={m.demand === 'High' ? 'orange' : 'gray'} icon={<Flame size={12} />}>
                  {m.demand} demand
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="Latest platform events and bookings" />
          <CardBody className="p-0">
            <ul className="divide-y divide-mw-gray-100">
              {activity.map((a, i) => (
                <li key={i} className="px-5 py-3 flex gap-3">
                  <span
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      a.tone === 'green'
                        ? 'bg-mw-green-100 text-mw-green-500'
                        : a.tone === 'red'
                        ? 'bg-mw-red-100 text-mw-red-500'
                        : a.tone === 'amber'
                        ? 'bg-mw-amber-100 text-mw-amber-500'
                        : a.tone === 'orange'
                        ? 'bg-mw-orange-100 text-mw-orange-600'
                        : 'bg-mw-blue-100 text-mw-blue-600'
                    }`}
                  >
                    {a.tone === 'green' ? (
                      <CircleCheck size={14} />
                    ) : a.tone === 'red' || a.tone === 'amber' || a.tone === 'orange' ? (
                      <CircleAlert size={14} />
                    ) : (
                      <Info size={14} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-mw-gray-800">{a.text}</p>
                    <p className="text-xs text-mw-gray-500 mt-0.5">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
