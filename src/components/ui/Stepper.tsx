import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}
interface Props {
  steps: Step[];
  current: number; // 0-based
}

export function Stepper({ steps, current }: Props) {
  return (
    <ol className="flex items-center w-full">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.label} className="flex-1 flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                  done
                    ? 'bg-mw-blue-500 border-mw-blue-500 text-white'
                    : active
                    ? 'bg-white border-mw-blue-500 text-mw-blue-600'
                    : 'bg-white border-mw-gray-300 text-mw-gray-400'
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <div className="hidden md:block">
                <p
                  className={`text-xs font-semibold ${
                    active ? 'text-mw-blue-600' : done ? 'text-mw-gray-700' : 'text-mw-gray-400'
                  }`}
                >
                  {s.label}
                </p>
                {s.description && (
                  <p className="text-[11px] text-mw-gray-500">{s.description}</p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${done ? 'bg-mw-blue-500' : 'bg-mw-gray-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
