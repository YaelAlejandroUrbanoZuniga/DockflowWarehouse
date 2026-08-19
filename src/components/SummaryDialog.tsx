import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTruck, faMapMarkerAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { motion, useReducedMotion } from 'motion/react';
import type { Cita } from '@/lib/types';
import { ESTADO_UI } from '@/lib/ui-map';
import { getStageTimes, getTotalTime, formatDuration } from '@/lib/cita-utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { ContenedorScroll } from '@/kit/componentes/ContenedorScroll/ContenedorScroll';

export function SummaryDialog({
  cita,
  open,
  onOpenChange,
}: {
  cita: Cita | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  if (!cita) return null;
  const stages = getStageTimes(cita);
  const total = getTotalTime(cita);
  const ui = ESTADO_UI[3];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={480}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Resumen de Cita Finalizada
        </DialogTitle>
        <ModalHeader title="Resumen de Cita Finalizada" subtitle={cita.nmeropo} accentColor={ui.color} onClose={() => onOpenChange(false)} />

        <ContenedorScroll maxHeight="60vh">
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Total time */}
            <div style={{ borderRadius: 8, backgroundColor: `${ui.color}1A`, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: ui.color }}>{formatDuration(total)}</div>
              <div style={{ fontSize: 13, color: ui.color }}>Tiempo total en patio</div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, backgroundColor: '#F5F5F5', padding: 12 }}>
                <FontAwesomeIcon icon={faTruck} style={{ fontSize: 14, color: '#808285' }} />
                <div>
                  <div style={{ fontSize: 11, color: '#808285' }}>Transportista</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cita.transportista.nombrecompaa}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, backgroundColor: '#F5F5F5', padding: 12 }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 14, color: '#808285' }} />
                <div>
                  <div style={{ fontSize: 11, color: '#808285' }}>Dock</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>{cita.dock.nombredock}</div>
                </div>
              </div>
            </div>

            {/* Delay flag */}
            {cita.islate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, backgroundColor: '#DC02021A', padding: 12, fontSize: 13, color: '#DC0202' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 14 }} />
                Cita marcada como retrasada
              </div>
            )}

            {/* Stage times */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#484848' }}>
                <FontAwesomeIcon icon={faClock} style={{ fontSize: 14 }} />
                Tiempo por etapa
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stages.map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, border: '1px solid #EEEEEE', padding: '8px 12px' }}
                  >
                    <span style={{ fontSize: 13, color: '#808285' }}>{stage.estado}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>{formatDuration(stage.minutos)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ContenedorScroll>
      </DialogContent>
    </Dialog>
  );
}
