import { X } from 'lucide-react';

interface Props {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-mw-blue-50 border border-mw-blue-100 text-[11px] font-medium text-mw-blue-700">
      {label}
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full hover:bg-mw-blue-100 flex items-center justify-center"
        aria-label={`Remove ${label}`}
      >
        <X size={11} />
      </button>
    </span>
  );
}
