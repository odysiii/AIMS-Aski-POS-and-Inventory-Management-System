import { createContext, useCallback, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

// Exported so useToast (in a sibling file) can consume it.
// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext(null);

let nextId = 1;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warn: AlertTriangle,
  info: Info,
};

const TONES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warn:    'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-slate-50 border-slate-200 text-slate-800',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, opts = {}) => {
      const id = nextId++;
      const type = opts.type || 'info';
      const duration = opts.duration ?? 3500;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (m, o) => push(m, { ...o, type: 'success' }),
      error:   (m, o) => push(m, { ...o, type: 'error' }),
      warn:    (m, o) => push(m, { ...o, type: 'warn' }),
      info:    (m, o) => push(m, { ...o, type: 'info' }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 shadow-lg text-xs font-semibold min-w-[240px] max-w-sm ${TONES[t.type]}`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="p-0.5 hover:opacity-70"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

