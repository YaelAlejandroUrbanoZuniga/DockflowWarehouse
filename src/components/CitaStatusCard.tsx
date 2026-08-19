import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faUser, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import type { Cita } from '@/lib/types';
import { ESTADO_UI } from '@/lib/ui-map';
import {
  isDelayed,
  getLlegadaSemaphore,
  getAlmacenSemaphore,
  getLlegadaLabel,
  LLEGADA_COLORS,
  ALMACEN_COLORS,
  LLEGADA_LABELS,
} from '@/lib/cita-utils';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { EstadoBadge } from './EstadoBadge';

function formatCheckin(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function CitaStatusCard({ cita }: { cita: Cita }) {
  const navigate = useNavigate();
  const delayed = isDelayed(cita);
  const ui = ESTADO_UI[cita.estadoKey];

  const isProgramada = cita.estadoKey === 0;
  const isEnProceso = [1, 7, 8, 2].includes(cita.estadoKey);

  const llegadaSem = getLlegadaSemaphore(cita);
  const almacenSem = getAlmacenSemaphore(cita);
  const llegadaLabel = getLlegadaLabel(cita);

  return (
    <Tarjeta
      onClick={() => navigate(`/citas/${cita.id}`)}
      style={{ borderTop: `4px solid ${ui.color}`, padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <EstadoBadge estadoKey={cita.estadoKey} delay={delayed} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#000000' }}>{cita.nmeropo}</span>
      </div>

      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#333333' }}>
        {cita.transportista.nombrecompaa}
      </div>

      {isProgramada && (
        <div style={{ marginBottom: 8 }}>
          <LlegadaSemaphore sem={llegadaSem} />
        </div>
      )}

      {isEnProceso && llegadaLabel && (
        <div style={{ marginBottom: 8 }}>
          <ArrivalStamp label={llegadaLabel.label} level={llegadaLabel.level} />
        </div>
      )}

      {isEnProceso && (
        <div style={{ marginBottom: 8 }}>
          <AlmacenSemaphore sem={almacenSem} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="flex items-center" style={{ gap: 6, fontSize: 12, color: '#808285' }}>
          <FontAwesomeIcon icon={faClock} style={{ fontSize: 12 }} />
          <span>
            {cita.inicioventana} - {cita.finventana}
          </span>
          {cita.actualstarttime && (
            <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 4, backgroundColor: 'rgba(106,191,75,0.1)', padding: '1px 6px', fontWeight: 600, color: '#6ABF4B' }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 12 }} />
              {formatCheckin(cita.actualstarttime)}
            </span>
          )}
        </div>
        <div className="flex items-center" style={{ gap: 6, fontSize: 12, color: '#808285' }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 12 }} />
          <span style={{ borderRadius: 4, backgroundColor: '#F5F5F5', padding: '1px 6px', fontWeight: 500, color: '#333333' }}>
            {cita.dock.nombredock}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6, fontSize: 12, color: '#808285' }}>
          <FontAwesomeIcon icon={faUser} style={{ fontSize: 12 }} />
          {cita.nombreconductor || 'N/A'}
        </div>
      </div>
    </Tarjeta>
  );
}

function LlegadaSemaphore({ sem }: { sem: ReturnType<typeof getLlegadaSemaphore> }) {
  const colors = LLEGADA_COLORS[sem.level];
  return (
    <div className="flex items-center" style={{ gap: 8, padding: '6px 10px', borderRadius: 4, backgroundColor: colors.bg }}>
      <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, backgroundColor: colors.solidBg }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
        {LLEGADA_LABELS[sem.level]}
      </span>
      {sem.minutes > 0 && (
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 500, color: '#808285' }}>
          +{formatDuration(sem.minutes)}
        </span>
      )}
    </div>
  );
}

function AlmacenSemaphore({ sem }: { sem: ReturnType<typeof getAlmacenSemaphore> }) {
  const colors = ALMACEN_COLORS[sem.level];
  return (
    <div className="flex items-center" style={{ gap: 8, padding: '6px 10px', borderRadius: 4, backgroundColor: colors.bg }}>
      <FontAwesomeIcon icon={faClock} style={{ fontSize: 14, color: colors.text }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
        {sem.label}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 500, color: '#808285' }}>
        {formatDuration(sem.minutes)}
      </span>
    </div>
  );
}

function ArrivalStamp({ label, level }: { label: string; level: 'green' | 'yellow' | 'red' }) {
  const colors = LLEGADA_COLORS[level];
  return (
    <div className="flex items-center" style={{ gap: 6, padding: '4px 8px', borderRadius: 4, border: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: colors.solidBg }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>
        Llego: {label}
      </span>
    </div>
  );
}
