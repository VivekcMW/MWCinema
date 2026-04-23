import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        {breadcrumbs && (
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-mw-gray-500 mb-2">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-mw-gray-700 font-medium' : ''}>
                  {b.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[20px] leading-tight font-semibold text-mw-gray-900">{title}</h1>
        {subtitle && <p className="text-[13px] text-mw-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
    </div>
  );
}
