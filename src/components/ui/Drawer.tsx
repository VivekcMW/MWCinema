import { ReactNode, useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}

const MIN_WIDTH = 320;

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'md' }: Props) {
  const defaultWidth = width === 'lg' ? 560 : 420;
  const [current, setCurrent] = useState<number>(defaultWidth);
  const [maximized, setMaximized] = useState(false);
  const draggingRef = useRef(false);
  const preMaxRef = useRef<number>(defaultWidth);

  // Reset width each time drawer opens / size preset changes
  useEffect(() => {
    if (open) {
      setCurrent(defaultWidth);
      setMaximized(false);
    }
  }, [open, defaultWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const max = Math.round(window.innerWidth * 0.95);
      const next = Math.min(Math.max(window.innerWidth - e.clientX, MIN_WIDTH), max);
      setCurrent(next);
      setMaximized(false);
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  };

  const toggleMaximize = () => {
    if (maximized) {
      setCurrent(preMaxRef.current);
      setMaximized(false);
    } else {
      preMaxRef.current = current;
      setCurrent(Math.round(window.innerWidth * 0.95));
      setMaximized(true);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-mw-gray-900/40" onClick={onClose} />
      <aside
        className="relative ml-auto h-full bg-white shadow-mw-pop flex flex-col max-w-[95vw]"
        style={{ width: `${current}px` }}
      >
        {/* Resize handle */}
        <div
          onMouseDown={startDrag}
          onDoubleClick={toggleMaximize}
          title="Drag to resize · double-click to toggle max width"
          className="group absolute left-0 top-0 bottom-0 w-1.5 -ml-0.5 cursor-ew-resize hover:bg-mw-blue-500/30 active:bg-mw-blue-500/50 z-10"
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-5 h-10 rounded-r-md bg-white border border-mw-gray-200 shadow-sm flex items-center justify-center text-mw-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={12} />
          </div>
        </div>

        <header className="flex items-start justify-between px-5 py-4 border-b border-mw-gray-200">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-mw-gray-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-mw-gray-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <button
              onClick={toggleMaximize}
              className="text-mw-gray-400 hover:text-mw-gray-700 p-1"
              aria-label={maximized ? 'Restore size' : 'Maximize'}
              title={maximized ? 'Restore size' : 'Maximize'}
            >
              {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="text-mw-gray-400 hover:text-mw-gray-700 p-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="border-t border-mw-gray-200 px-5 py-3 bg-mw-gray-50">{footer}</footer>}
      </aside>
    </div>
  );
}
