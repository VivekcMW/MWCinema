import {
  BarChart,
  Card,
  CardBody,
  CardHeader,
  DoughnutChart,
  LineChart,
  PageHeader,
  StatCard,
  mwPalette
} from '../components/ui';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

export default function Reports() {
  const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'];
  const revenue = [42, 58, 65, 71, 68, 82, 75, 88];
  const impressions = [820, 910, 1040, 1120, 1080, 1280, 1210, 1410];

  return (
    <>
      <PageHeader title="Reports" subtitle="Performance across cinemas, campaigns and formats" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total impressions" value="12.4M" helper="+18% vs last month" icon={<Users size={20} />} tone="blue" />
        <StatCard label="Revenue" value="$237K" helper="+12% vs last month" icon={<DollarSign size={20} />} tone="teal" />
        <StatCard label="CPM" value="$34" helper="Network average" icon={<TrendingUp size={20} />} tone="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader title="Weekly revenue" subtitle="Last 8 weeks" />
          <CardBody>
            <BarChart
              height={260}
              data={{
                labels: weeks,
                datasets: [
                  {
                    label: 'Revenue ($K)',
                    data: revenue,
                    backgroundColor: mwPalette.blue,
                    borderRadius: 6,
                    barThickness: 22
                  }
                ]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Impressions trend" subtitle="Delivered per week, across all formats" />
          <CardBody>
            <LineChart
              height={240}
              data={{
                labels: weeks,
                datasets: [
                  {
                    label: 'Impressions (K)',
                    data: impressions,
                    borderColor: mwPalette.blue,
                    backgroundColor: mwPalette.blueSoft,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: mwPalette.blue
                  }
                ]
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Revenue by advertiser" />
          <CardBody>
            <DoughnutChart
              height={240}
              data={{
                labels: ['Emirates', 'PepsiCo', 'Netflix', 'Apple', 'Others'],
                datasets: [
                  {
                    data: [88, 61, 45, 30, 13],
                    backgroundColor: [
                      mwPalette.blue,
                      mwPalette.teal,
                      mwPalette.orange,
                      mwPalette.amber,
                      mwPalette.gray
                    ],
                    borderWidth: 0
                  }
                ]
              }}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

