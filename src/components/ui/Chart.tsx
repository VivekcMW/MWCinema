import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

/**
 * Default Chart.js options tuned for the MW design system.
 * Reusable across pages — pass `options` to override.
 */
export const mwChartDefaults: ChartOptions<'line' | 'bar' | 'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
        boxHeight: 6,
        color: '#64748b',
        font: { family: 'Poppins', size: 11 }
      }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleFont: { family: 'Poppins', size: 12, weight: 600 },
      bodyFont: { family: 'Poppins', size: 11 },
      padding: 10,
      cornerRadius: 8,
      displayColors: true
    }
  }
};

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
}
export function LineChart({ data, options, height = 260 }: LineChartProps) {
  return (
    <div style={{ height }}>
      <Line
        data={data}
        options={{
          ...(mwChartDefaults as ChartOptions<'line'>),
          ...options,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            ...(options?.scales || {})
          }
        }}
      />
    </div>
  );
}

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
}
export function BarChart({ data, options, height = 260 }: BarChartProps) {
  return (
    <div style={{ height }}>
      <Bar
        data={data}
        options={{
          ...(mwChartDefaults as ChartOptions<'bar'>),
          ...options,
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            ...(options?.scales || {})
          }
        }}
      />
    </div>
  );
}

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  height?: number;
}
export function DoughnutChart({ data, options, height = 220 }: DoughnutChartProps) {
  return (
    <div style={{ height }}>
      <Doughnut
        data={data}
        options={{
          ...(mwChartDefaults as ChartOptions<'doughnut'>),
          cutout: '68%',
          ...options
        }}
      />
    </div>
  );
}

/** MW chart palette — matches design tokens */
export const mwPalette = {
  blue: '#1d65af',
  blueSoft: 'rgba(29,101,175,0.15)',
  teal: '#14b8a6',
  tealSoft: 'rgba(20,184,166,0.15)',
  orange: '#ff8a00',
  orangeSoft: 'rgba(255,138,0,0.15)',
  red: '#dc2626',
  redSoft: 'rgba(220,38,38,0.15)',
  amber: '#f59e0b',
  purple: '#a855f7',
  gray: '#94a3b8'
};
