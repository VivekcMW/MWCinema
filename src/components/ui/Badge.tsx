import { ReactNode } from 'react';

type Tone = 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'amber' | 'gray';

const toneCls: Record<Tone, string> = {
  blue: 'bg-mw-blue-100 text-mw-blue-700',
  teal: 'bg-mw-teal-100 text-mw-teal-600',
  orange: 'bg-mw-orange-100 text-mw-orange-600',
  green: 'bg-mw-green-100 text-mw-green-500',
  red: 'bg-mw-red-100 text-mw-red-500',
  amber: 'bg-mw-amber-100 text-mw-amber-500',
  gray: 'bg-mw-gray-100 text-mw-gray-700'
};

export function Badge({
  tone = 'gray',
  children,
  icon
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className={`mw-badge ${toneCls[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
