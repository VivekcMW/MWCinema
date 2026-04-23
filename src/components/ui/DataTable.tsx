import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-mw-gray-50 border-b border-mw-gray-200">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-5 py-3 text-left text-xs font-semibold text-mw-gray-600 uppercase tracking-wide ${c.className || ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-mw-gray-500">
                {empty ?? 'No records found'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={`border-b border-mw-gray-100 ${onRowClick ? 'cursor-pointer hover:bg-mw-blue-50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-3 text-mw-gray-700 ${c.className || ''}`}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
