import React from 'react';
import { Session } from '../../data/mock';
import { adsForSession, DayAdSummary } from '../../data/adPlacements';

function StatusDot({ status }: { status: 'Live' | 'Scheduled' | 'Pending' }) {
  const cls =
    status === 'Live'
      ? 'bg-mw-green-500'
      : status === 'Scheduled'
        ? 'bg-mw-blue-500'
        : 'bg-mw-amber-500';
  return <span className={`w-1.5 h-1.5 rounded-full ${cls}`} />;
}

interface SessionTooltipProps {
  session: Session;
  align?: 'left' | 'center' | 'right';
  placement?: 'top' | 'bottom';
}

/**
 * Hover tooltip showing the ads placed in a single session.
 * Use inside a parent with `group` class and `relative` positioning.
 * Parent should NOT have `overflow-hidden` if you want the full panel visible.
 */
export function SessionAdsTooltip({
  session,
  align = 'left',
  placement = 'top'
}: SessionTooltipProps) {
  const ads = adsForSession(session);
  const total60 = session.preShow60.total;
  const booked60 = session.preShow60.booked;
  const total30 = session.preShow30.total;
  const booked30 = session.preShow30.booked;

  const posClass =
    placement === 'top'
      ? 'bottom-full mb-2'
      : 'top-full mt-2';
  const alignClass =
    align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : align === 'right'
        ? 'right-0'
        : 'left-0';

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute ${posClass} ${alignClass} z-50 w-72 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150`}
    >
      <div className="rounded-mw-sm bg-white shadow-xl border border-mw-gray-200 p-3 text-left">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-mw-gray-900 truncate">
              {session.film}
            </p>
            <p className="text-[11px] text-mw-gray-500 truncate">
              {session.screen} · {session.day} · {session.start} – {session.end}
            </p>
          </div>
          <span className="text-[10px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-2 py-0.5 whitespace-nowrap">
            {ads.length} ad{ads.length === 1 ? '' : 's'} placed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2 text-[11px]">
          <div className="rounded-mw-sm bg-mw-gray-50 px-2 py-1.5">
            <p className="text-mw-gray-500">60s pre-show</p>
            <p className="font-semibold text-mw-gray-900">
              {booked60}/{total60} booked
            </p>
          </div>
          <div className="rounded-mw-sm bg-mw-gray-50 px-2 py-1.5">
            <p className="text-mw-gray-500">30s pre-show</p>
            <p className="font-semibold text-mw-gray-900">
              {booked30}/{total30} booked
            </p>
          </div>
        </div>

        {ads.length === 0 ? (
          <p className="text-[11px] text-mw-gray-500 italic">
            No ads placed yet — slot is open.
          </p>
        ) : (
          <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {ads.map((a, i) => (
              <li
                key={`${a.brand}-${i}`}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <StatusDot status={a.status} />
                  <span className="font-medium text-mw-gray-900 truncate">
                    {a.brand}
                  </span>
                </span>
                <span className="text-mw-gray-500 whitespace-nowrap">
                  {a.duration} · {a.position === '60s pre-show' ? '60s' : '30s'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface DayTooltipProps {
  date: Date;
  summary: DayAdSummary;
  align?: 'left' | 'center' | 'right';
  placement?: 'top' | 'bottom';
}

/**
 * Hover tooltip showing the aggregated ads placed across a day
 * (used in Month/Year calendar cells).
 */
export function DayAdsTooltip({
  date,
  summary,
  align = 'center',
  placement = 'top'
}: DayTooltipProps) {
  const label = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
  const posClass =
    placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignClass =
    align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : align === 'right'
        ? 'right-0'
        : 'left-0';

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute ${posClass} ${alignClass} z-50 w-60 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150`}
    >
      <div className="rounded-mw-sm bg-white shadow-xl border border-mw-gray-200 p-3 text-left">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[12px] font-semibold text-mw-gray-900">{label}</p>
          <span className="text-[10px] font-semibold text-mw-blue-600 bg-mw-blue-100 rounded-full px-2 py-0.5">
            {summary.total} ads
          </span>
        </div>
        <p className="text-[11px] text-mw-gray-500 mb-2">
          Across {summary.sessions} session{summary.sessions === 1 ? '' : 's'}
        </p>
        {summary.top.length === 0 ? (
          <p className="text-[11px] text-mw-gray-500 italic">
            No ads placed on this day.
          </p>
        ) : (
          <ul className="space-y-1">
            {summary.top.map((t) => (
              <li
                key={t.brand}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="font-medium text-mw-gray-900 truncate">
                  {t.brand}
                </span>
                <span className="text-mw-gray-500">
                  {t.count} spot{t.count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
