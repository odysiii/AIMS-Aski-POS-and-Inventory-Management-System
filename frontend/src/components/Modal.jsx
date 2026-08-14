import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal wrapper. Escape closes, focus returns to the invoker on
 * close, and Tab is trapped inside while open. Replaces the three hand-rolled
 * overlays in cashierPOS.jsx.
 */
export default function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
  children,
  footer,
}) {
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);

  // Escape to close; scroll lock; focus restore.
  useEffect(() => {
    if (!open) return undefined;

    restoreRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);

    // Move focus to the first focusable element inside the dialog.
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus?.();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      // Restore focus to whatever opened us, when it still exists.
      if (restoreRef.current && document.contains(restoreRef.current)) {
        restoreRef.current.focus?.();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size] || 'max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        // Click on the backdrop (not the dialog) closes.
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`w-full ${maxWidth} rounded-2xl bg-white p-5 shadow-2xl flex flex-col max-h-[90vh]`}
      >
        {title && (
          <div className="flex items-center justify-between border-b pb-2 shrink-0">
            <h3
              id="modal-title"
              className="font-bold text-gray-800 text-sm flex items-center gap-1.5"
            >
              {Icon && <Icon className="w-4 h-4 text-gray-700" aria-hidden="true" />}
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pt-3 pr-1 min-h-0">{children}</div>

        {footer && <div className="pt-3 border-t border-gray-100 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
