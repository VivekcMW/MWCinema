import { Bell, HelpCircle, ChevronDown, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFeedStatus, refreshFeed } from '../../data/cinemaMeta';

function FeedPill() {
  const [status, setStatus] = useState(getFeedStatus());
  const [open, setOpen] = useState(false);
  // tick "last synced" label every minute
  useEffect(() => {
    const t = setInterval(() => setStatus(getFeedStatus()), 60_000);
    return () => clearInterval(t);
  }, []);

  const anyStale = status.sources.some((s) => s.status !== 'healthy');
  const diff = Math.max(
    0,
    Math.round((Date.now() - status.lastSyncedAt.getTime()) / 60_000)
  );
  const ago = diff === 0 ? 'just now' : `${diff}m ago`;

  return (
    <div className="relative">
      <button
        data-testid="feed-pill"
        onClick={() => {
          setStatus(refreshFeed());
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`hidden md:inline-flex items-center gap-2 h-8 px-2.5 rounded-full border text-[11px] font-medium transition-colors ${
          anyStale
            ? 'bg-mw-amber-500/10 text-mw-amber-500 border-mw-amber-500/40 hover:bg-mw-amber-500/20'
            : 'bg-mw-green-500/10 text-mw-green-500 border-mw-green-500/40 hover:bg-mw-green-500/20'
        }`}
        title="Click to refresh cinema feeds"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${anyStale ? 'bg-mw-amber-500' : 'bg-mw-green-500'} animate-pulse`}
        />
        Feed: {anyStale ? 'Stale' : 'Healthy'}
        <span className="text-mw-gray-500 font-normal">· {ago}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 z-50 rounded-mw-sm bg-white border border-mw-gray-200 shadow-xl p-3">
          <p className="text-[11px] text-mw-gray-500 mb-2">
            Last synced {ago}
          </p>
          <ul className="space-y-1.5 text-[12px]">
            {status.sources.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="text-mw-gray-800">{s.name}</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    s.status === 'healthy'
                      ? 'text-mw-green-500'
                      : s.status === 'stale'
                        ? 'text-mw-amber-500'
                        : 'text-mw-red-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      s.status === 'healthy'
                        ? 'bg-mw-green-500'
                        : s.status === 'stale'
                          ? 'bg-mw-amber-500'
                          : 'bg-mw-red-500'
                    }`}
                  />
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-mw-gray-400 mt-2">
            Click the pill to trigger a manual sync.
          </p>
        </div>
      )}
    </div>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  return (
    <header className="h-14 bg-white border-b border-mw-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile hamburger + left spacer */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-mw-sm hover:bg-mw-gray-100 text-mw-gray-600 flex items-center justify-center -ml-1 mr-1"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block w-10" />
      </div>

      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-1 md:gap-2">
        <FeedPill />
        <button className="hidden sm:inline-flex items-center gap-1 h-9 px-2 rounded-mw-sm text-sm text-mw-gray-700 hover:bg-mw-gray-100">
          <span className="font-medium">ENG</span>
          <ChevronDown size={14} />
        </button>
        <button className="hidden sm:flex w-9 h-9 rounded-mw-sm hover:bg-mw-gray-100 text-mw-gray-600 items-center justify-center">
          <HelpCircle size={18} />
        </button>
        <button className="w-9 h-9 rounded-mw-sm hover:bg-mw-gray-100 text-mw-gray-600 flex items-center justify-center relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mw-orange-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-mw-gray-200">
          <div className="w-8 h-8 rounded-full bg-mw-blue-500 text-white text-xs font-semibold flex items-center justify-center">
            VC
          </div>
          <div className="leading-tight min-w-0 hidden sm:block">
            <p className="text-[13px] font-semibold text-mw-gray-900 truncate">Vivek C.</p>
            <p className="text-[11px] text-mw-gray-500 truncate">Media Planner</p>
          </div>
          <ChevronDown size={14} className="text-mw-gray-500 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

