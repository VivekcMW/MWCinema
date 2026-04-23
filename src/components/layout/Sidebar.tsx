import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Monitor,
  Film,
  CalendarRange,
  Megaphone,
  Plug,
  BarChart3,
  Upload,
  Clapperboard,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface Section {
  title?: string;
  items: { to: string; label: string; icon: React.ReactNode; end?: boolean }[];
}

const sections: Section[] = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} />, end: true }]
  },
  {
    title: 'Inventory',
    items: [
      { to: '/theaters', label: 'Theaters', icon: <Building2 size={16} /> },
      { to: '/screens', label: 'Screens', icon: <Monitor size={16} /> },
      { to: '/movies', label: 'Now Playing', icon: <Film size={16} /> },
      { to: '/ad-slots', label: 'Ad Slots', icon: <CalendarRange size={16} /> },
      { to: '/inventory/import', label: 'Import Schedule', icon: <Upload size={16} /> }
    ]
  },
  {
    title: 'Campaigns',
    items: [
      { to: '/campaigns', label: 'All Campaigns', icon: <Megaphone size={16} /> }
    ]
  },
  {
    title: 'Integrations',
    items: [{ to: '/dsp', label: 'DSP Connectors', icon: <Plug size={16} /> }]
  },
  {
    title: 'Analytics',
    items: [{ to: '/reports', label: 'Reports', icon: <BarChart3 size={16} /> }]
  }
];

export function Sidebar({
  open = false,
  onClose,
  collapsed = false,
  onToggleCollapsed
}: {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
} = {}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-mw-gray-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 shrink-0 bg-white border-r border-mw-gray-200 flex flex-col h-screen transition-[transform,width] duration-200 ease-out ${
          collapsed ? 'w-16' : 'w-60'
        } ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className={`h-14 flex items-center gap-2 border-b border-mw-gray-200 ${collapsed ? 'px-3 justify-center' : 'px-5'}`}>
          <div className="w-8 h-8 rounded-mw-sm bg-mw-blue-500 text-white flex items-center justify-center shrink-0">
            <Clapperboard size={18} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-mw-gray-900 leading-none">CinemaAds</p>
              <p className="text-[11px] text-mw-gray-500 mt-0.5">Moving Walls</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden text-mw-gray-400 hover:text-mw-gray-700 p-1"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <nav className={`flex-1 overflow-y-auto py-4 space-y-5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {sections.map((s, i) => (
            <div key={i}>
              {s.title && !collapsed && (
                <p className="px-2 pb-2 text-[11px] font-semibold text-mw-gray-400 uppercase tracking-wider">
                  {s.title}
                </p>
              )}
              {s.title && collapsed && i > 0 && (
                <div className="mx-2 mb-2 border-t border-mw-gray-200" />
              )}
              <ul className="space-y-0.5">
                {s.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      end={it.end}
                      onClick={onClose}
                      title={collapsed ? it.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center h-9 rounded-mw-sm text-[13px] transition-colors ${
                          collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
                        } ${
                          isActive
                            ? 'bg-mw-blue-50 text-mw-blue-600 font-semibold'
                            : 'text-mw-gray-700 hover:bg-mw-gray-100 hover:text-mw-gray-900'
                        }`
                      }
                    >
                      {it.icon}
                      {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapsed}
          className="hidden lg:flex items-center justify-center gap-2 h-10 border-t border-mw-gray-200 text-mw-gray-500 hover:text-mw-gray-900 hover:bg-mw-gray-50 text-xs font-medium"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={14} /> : <><ChevronsLeft size={14} /> Collapse</>}
        </button>
      </aside>
    </>
  );
}
