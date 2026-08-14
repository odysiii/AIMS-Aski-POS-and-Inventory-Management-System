import { useContext, useEffect } from 'react';
import { ToastContext } from './Toast';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/** Dismisses any lingering toasts when the caller unmounts. */
export function useAutoDismiss() {
  const { dismiss } = useToast();
  useEffect(() => () => dismiss(), [dismiss]);
}
