import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { useModalTransition } from '../../hooks/useModalTransition';
import { zIndex } from '../../tokens/layout';

interface Props {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  confirmDisabled?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', confirmColor = '#DC0202', confirmDisabled = false, children, onCancel, onConfirm }: Props) {
  const { requestClose, overlayClass, panelClass } = useModalTransition(onCancel);
  return (
    <div onClick={requestClose} className={overlayClass} style={{ position: 'fixed', inset: 0, zIndex: zIndex.modal, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} className={panelClass} role="dialog" aria-modal="true" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.20)', overflow: 'hidden', width: 420 }}>
        <ModalHeader title={title} accentColor={confirmColor} onClose={requestClose} />
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', gap: 12, margin: '0 0 20px' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 18, color: confirmColor, flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#808285', lineHeight: 1.6 }}>{message}</div>
          </div>
          {children}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: children ? 20 : 0 }}>
            <button onClick={requestClose} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: '1px solid #D1D3D4', borderRadius: 6, backgroundColor: '#FFFFFF', color: '#000000', cursor: 'pointer', transition: 'background-color 0.12s' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F5F5')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}>
              {cancelLabel}
            </button>
            <button onClick={() => { if (!confirmDisabled) onConfirm(); }} disabled={confirmDisabled} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, backgroundColor: confirmColor, color: '#FFFFFF', cursor: confirmDisabled ? 'not-allowed' : 'pointer', opacity: confirmDisabled ? 0.45 : 1, transition: 'box-shadow 0.15s' }} onMouseEnter={e => { if (!confirmDisabled) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.18)'; }} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
