'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, XIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info';
export type ToastState = { msg: string; type: ToastType } | null;

interface ToastProps {
  toast: ToastState;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 200); }, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm shadow-xl text-white transition-all duration-200 max-w-sm ${styles[toast.type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      {toast.type === 'success' ? (
        <CheckIcon size={16} />
      ) : toast.type === 'error' ? (
        <XIcon size={16} />
      ) : null}
      <span className="flex-1">{toast.msg}</span>
      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 200); }} className="opacity-70 hover:opacity-100 ml-1">
        <XIcon size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  function showToast(msg: string, type: ToastType = 'info') {
    setToast({ msg, type });
  }

  function dismiss() {
    setToast(null);
  }

  return { toast, showToast, dismiss };
}
