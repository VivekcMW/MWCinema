import { ReactNode } from 'react';
import { Card } from './Card';

interface Props {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: 'blue' | 'teal' | 'orange' | 'gray';
}

const iconBg: Record<NonNullable<Props['tone']>, string> = {
  blue: 'bg-mw-blue-100 text-mw-blue-600',
  teal: 'bg-mw-teal-100 text-mw-teal-600',
  orange: 'bg-mw-orange-100 text-mw-orange-600',
  gray: 'bg-mw-gray-100 text-mw-gray-600'
};

export function StatCard({ label, value, helper, icon, tone = 'blue' }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-mw-gray-500">{label}</p>
          <p className="mt-1.5 text-[22px] leading-tight font-semibold text-mw-blue-500">{value}</p>
          {helper && <p className="mt-1 text-[11px] text-mw-gray-500">{helper}</p>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-mw-sm flex items-center justify-center ${iconBg[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
