interface Tab {
  label: string;
  value: string;
  count?: number;
}
interface Props {
  tabs: Tab[];
  value: string;
  onChange: (v: string) => void;
}

export function Tabs({ tabs, value, onChange }: Props) {
  return (
    <div className="border-b border-mw-gray-200">
      <nav className="flex gap-1">
        {tabs.map((t) => {
          const active = t.value === value;
          return (
            <button
              key={t.value}
              onClick={() => onChange(t.value)}
              className={`px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                active
                  ? 'border-mw-blue-500 text-mw-blue-600'
                  : 'border-transparent text-mw-gray-500 hover:text-mw-gray-800'
              }`}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span
                  className={`text-xs px-1.5 rounded-full ${
                    active ? 'bg-mw-blue-100 text-mw-blue-600' : 'bg-mw-gray-100 text-mw-gray-600'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
