import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON_MAP: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const MAX_VISIBLE = 5;
const EXIT_DURATION = 280; // matches CSS toast-slide-out duration

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_DURATION);
    // Clear any pending auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration: number = 3000) => {
      const id = crypto.randomUUID();
      const toast: ToastItem = { id, message, type, duration, exiting: false };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Enforce max visible — remove oldest first (they are at start of array)
        while (next.length > MAX_VISIBLE) {
          const oldest = next.shift();
          if (oldest) {
            const timer = timersRef.current.get(oldest.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(oldest.id);
            }
          }
        }
        return next;
      });

      // Auto-dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
          timersRef.current.delete(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="toast-container">
          {toasts.map((toast) => {
            const Icon = ICON_MAP[toast.type];
            return (
              <div
                key={toast.id}
                className={`toast-item toast-item--${toast.type}${toast.exiting ? ' toast-exiting' : ''}`}
                role="alert"
              >
                <span className="toast-icon">
                  <Icon size={18} />
                </span>
                <span className="toast-message">{toast.message}</span>
                <button
                  className="toast-close"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close notification"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
