import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { motion, useReducedMotion } from 'motion/react';
import type { Cita, EstadoKey } from '@/lib/types';
import { ESTADOS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import { ConfirmDialog } from '@/kit/componentes/ConfirmDialog/ConfirmDialog';

export function StatusChangeDialog({
  cita,
  targetEstado,
  open,
  onOpenChange,
  onConfirm,
  extraNote,
}: {
  cita: Cita | null;
  targetEstado: EstadoKey;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  extraNote?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (!cita || !open) return null;

  const current = ESTADOS[cita.estadoKey];
  const target = ESTADOS[targetEstado];
  const currentUI = ESTADO_UI[cita.estadoKey];
  const targetUI = ESTADO_UI[targetEstado];

  const body = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: `${currentUI.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={currentUI.icon} style={{ fontSize: 28, color: currentUI.color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#808285' }}>{current.nombre}</span>
        </div>

        <motion.div initial={reduceMotion ? false : { x: -5 }} animate={reduceMotion ? {} : { x: [0, 8, 0] }} transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 1.2 }}>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 22, color: '#808285' }} />
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: `${targetUI.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={targetUI.icon} style={{ fontSize: 28, color: targetUI.color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#808285' }}>{target.nombre}</span>
        </div>
      </div>

      <div style={{ borderRadius: 8, backgroundColor: '#F5F5F5', padding: 12, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#000000' }}>{cita.nmeropo}</div>
        <div style={{ fontSize: 13, color: '#808285' }}>{cita.transportista.nombrecompaa}</div>
        {extraNote && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, color: '#D4A017' }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 12 }} />
            {extraNote}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ConfirmDialog
      title="Confirmar Cambio de Estado"
      message={body}
      confirmLabel="Confirmar"
      cancelLabel="Cancelar"
      confirmColor={targetUI.color}
      onCancel={() => onOpenChange(false)}
      onConfirm={onConfirm}
    />
  );
}
