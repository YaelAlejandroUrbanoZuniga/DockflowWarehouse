import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { zIndex } from '../../tokens/layout';

export type TipoToast = 'success' | 'error' | 'warning' | 'info';

interface ToastEntry {
  id: number;
  tipo: TipoToast;
  titulo: string;
  mensaje?: string;
  closing: boolean;
}

const CONFIG: Record<TipoToast, { color: string; icon: IconDefinition; duracion: number }> = {
  success: { color: '#6ABF4B', icon: faCheckCircle, duracion: 4000 },
  error:   { color: '#DC0202', icon: faTimesCircle, duracion: 6000 },
  warning: { color: '#D4A017', icon: faExclamationTriangle, duracion: 6000 },
  info:    { color: '#02B3E1', icon: faInfoCircle, duracion: 4000 },
};

interface ValorContexto {
  success: (titulo: string, mensaje?: string) => void;
  validationError: (titulo: string, mensaje?: string) => void;
  systemError: (mensaje?: string) => void;
  info: (titulo: string, mensaje?: string) => void;
  warning: (titulo: string, mensaje?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ValorContexto | null>(null);

export function useToast(): ValorContexto {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const show = useCallback((tipo: TipoToast, titulo: string, mensaje?: string) => {
    const id = ++nextId.current;
    setToasts(prev => [{ id, tipo, titulo, mensaje, closing: false }, ...prev]);
    const timer = setTimeout(() => dismiss(id), CONFIG[tipo].duracion);
    timers.current.set(id, timer);
  }, [dismiss]);

  const value: ValorContexto = {
    success: (titulo, mensaje) => show('success', titulo, mensaje),
    validationError: (titulo, mensaje) => show('warning', titulo, mensaje),
    systemError: (mensaje) => show('error', 'Error del sistema', mensaje ?? 'Ocurrió un error inesperado. Intente de nuevo.'),
    info: (titulo, mensaje) => show('info', titulo, mensaje),
    warning: (titulo, mensaje) => show('warning', titulo, mensaje),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: zIndex.toast, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none', maxWidth: 380 }}>
        {toasts.map(t => {
          const cfg = CONFIG[t.tipo];
          return (
            <div key={t.id} className={`toast-item${t.closing ? ' is-closing' : ''}`} style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14)', borderLeft: `4px solid ${cfg.color}`, minWidth: 280 }}>
              <FontAwesomeIcon icon={cfg.icon} style={{ color: cfg.color, fontSize: 18, marginTop: 1, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#000000' }}>{t.titulo}</p>
                {t.mensaje && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#808285' }}>{t.mensaje}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 13, color: '#808285' }} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
