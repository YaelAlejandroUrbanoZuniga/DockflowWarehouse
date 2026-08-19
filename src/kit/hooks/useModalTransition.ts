import { useCallback, useEffect, useState } from 'react';

const EXIT_MS = 200;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export function useModalTransition(onClose: () => void) {
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    if (!closing) return;
    if (prefersReducedMotion()) { onClose(); return; }
    const t = setTimeout(onClose, EXIT_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  return {
    closing,
    requestClose,
    overlayClass: `modal-overlay${closing ? ' is-closing' : ''}`,
    panelClass: `modal-panel${closing ? ' is-closing' : ''}`,
  };
}
