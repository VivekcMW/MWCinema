interface Props {
  value: number; // 0 - 100
  tone?: 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'amber';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const fill: Record<NonNullable<Props['tone']>, string> = {
  blue: 'bg-mw-blue-500',
  teal: 'bg-mw-teal-500',
  orange: 'bg-mw-orange-500',
  green: 'bg-mw-green-500',
  red: 'bg-mw-red-500',
  amber: 'bg-mw-amber-500'
};

export function ProgressBar({ value, tone = 'blue', showLabel, size = 'md' }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-mw-gray-200 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        <div className={`${fill[tone]} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-mw-gray-600 w-10 text-right">{pct}%</span>}
    </div>
  );
}
