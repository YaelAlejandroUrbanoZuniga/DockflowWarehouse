import { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faMapMarkerAlt,
  faClock,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import {
  citasAtom,
  transportistasAtom,
  currentUserAtom,
  activeAlmacenIdAtom,
} from '@/lib/store';
import { ESTADOS, ROLE_PERMISSIONS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import type { Cita, EstadoKey, Transportista } from '@/lib/types';
import {
  isDelayed,
  getMinutesSince,
  formatDuration,
  getDetentionInfo,
} from '@/lib/cita-utils';
import { StatusChangeDialog } from '@/components/StatusChangeDialog';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';

const TODAY = new Date().toISOString().slice(0, 10);

export function OperadorPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [allCitas, setCitas] = useAtom(citasAtom);
  const activeAlmacenId = useAtomValue(activeAlmacenIdAtom);
  const citas = allCitas.filter((c) => c.almacenId === activeAlmacenId);
  const transportistas = useAtomValue(transportistasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; cita: Cita | null; target: EstadoKey }>({
    open: false,
    cita: null,
    target: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  void tick;

  if (!perms.canViewOperador) {
    return (
      <div>
        <Tarjeta style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 14, color: '#808285', margin: 0 }}>No tiene permisos para acceder al panel de operador</p>
        </Tarjeta>
      </div>
    );
  }

  const todayCitas = citas.filter((c) => c.fechaprogramada === TODAY);
  const pendingAuth = todayCitas.filter((c) => c.estadoKey === 7);
  const enRampa = todayCitas.filter((c) => c.estadoKey === 8);
  const descargando = todayCitas.filter((c) => c.estadoKey === 2);

  const handleConfirm = () => {
    const { cita, target } = statusDialog;
    if (!cita) return;
    setCitas((prev) =>
      prev.map((c) => {
        if (c.id !== cita.id) return c;
        const now = new Date().toISOString();
        return {
          ...c,
          estadoKey: target,
          historial: [
            ...c.historial,
            {
              estadoKey: target,
              estadoNombre: ESTADOS[target].nombre,
              timestamp: now,
              usuarioNombre: currentUser.nombrecompleto,
            },
          ],
        };
      }),
    );
    toast.success(`Estado cambiado a: ${ESTADOS[target].nombre}`);
    setStatusDialog({ open: false, cita: null, target: 0 });
  };

  const columns: { estadoKey: EstadoKey; title: string; citas: Cita[] }[] = [
    { estadoKey: 7, title: 'Esp. Autorización', citas: pendingAuth },
    { estadoKey: 8, title: 'En Rampa', citas: enRampa },
    { estadoKey: 2, title: 'Descargando', citas: descargando },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Panel de Operador</h1>
        <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>Gestión de andenes en tiempo real</p>
      </div>

      {/* Alert banner */}
      {pendingAuth.length > 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
        >
          <Tarjeta style={{ marginBottom: 24, borderLeft: '4px solid #E3650B' }}>
            <div className="flex items-center" style={{ gap: 8, fontSize: 14, fontWeight: 600, color: '#E3650B', marginBottom: 8 }}>
              <FontAwesomeIcon icon={ESTADO_UI[7].icon} style={{ fontSize: 16 }} />
              {pendingAuth.length} cita(s) en espera de autorización
            </div>
            <div className="flex flex-col" style={{ gap: 4 }}>
              {pendingAuth.map((c) => {
                const mins = getMinutesSince(c.autorizacionTimestamp);
                const isRed = mins > 30;
                const isYellow = mins > 15 && mins <= 30;
                const timerColor = isRed ? '#DC0202' : isYellow ? '#D4A017' : '#6ABF4B';
                const timerBg = isRed ? '#DC02021A' : isYellow ? '#D4A0171A' : '#6ABF4B1A';
                return (
                  <div key={c.id} className="flex items-center" style={{ gap: 8, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: '#000000' }}>{c.nmeropo}</span>
                    <span style={{ color: '#808285' }}>{c.transportista.nombrecompaa}</span>
                    <span style={{ color: '#D1D3D4' }}>·</span>
                    <span style={{
                      padding: '1px 8px', borderRadius: 10, fontWeight: 700,
                      color: timerColor, backgroundColor: timerBg,
                    }}>
                      {formatDuration(mins)}
                    </span>
                    {isRed && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        color: '#FFFFFF', backgroundColor: '#DC0202',
                        animation: 'pulse 2s infinite',
                      }}>
                        DELAY
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Tarjeta>
        </motion.div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16 }}>
        {columns.map((col) => {
          const ui = ESTADO_UI[col.estadoKey];
          return (
            <div key={col.estadoKey} style={{ backgroundColor: '#EEEEEE', borderRadius: 12, padding: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${ui.color}1A` }}>
                    <FontAwesomeIcon icon={ui.icon} style={{ fontSize: 14, color: ui.color }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{col.title}</span>
                </div>
                <Insignia estado="archived">{col.citas.length}</Insignia>
              </div>

              <div className="flex flex-col" style={{ gap: 8 }}>
                {col.citas.length === 0 ? (
                  <div style={{ fontSize: 12, fontWeight: 400, color: '#808285', textAlign: 'center', padding: '16px 0' }}>
                    Sin citas
                  </div>
                ) : (
                  col.citas.map((c) => (
                    <KanbanCard
                      key={c.id}
                      cita={c}
                      colEstadoKey={col.estadoKey}
                      perms={perms}
                      transportistas={transportistas}
                      onNavigate={() => navigate(`/citas/${c.id}`)}
                      onChangeStatus={(target) => setStatusDialog({ open: true, cita: c, target })}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <StatusChangeDialog
        cita={statusDialog.cita}
        targetEstado={statusDialog.target}
        open={statusDialog.open}
        onOpenChange={(v) => setStatusDialog({ ...statusDialog, open: v })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function KanbanCard({
  cita,
  colEstadoKey,
  perms,
  transportistas,
  onNavigate,
  onChangeStatus,
}: {
  cita: Cita;
  colEstadoKey: EstadoKey;
  perms: (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS];
  transportistas: Transportista[];
  onNavigate: () => void;
  onChangeStatus: (target: EstadoKey) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = useState(false);
  const delayed = isDelayed(cita);
  const transportista = transportistas.find((t) => t.id === cita.transportista.id);
  const detention = getDetentionInfo(cita, transportista);
  const mins = getMinutesSince(cita.actualstarttime);
  const billingActive = detention.billableMinutes > 0;

  const nextKey: EstadoKey = colEstadoKey === 7 ? 8 : colEstadoKey === 8 ? 2 : 3;
  const canChange = nextKey === 8 ? perms.canChangeEnRampa : nextKey === 2 ? perms.canAuthorizeDescarga : perms.canEditCitas;

  return (
    <motion.div
      layout={!reduceMotion}
      onClick={onNavigate}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
        boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{cita.nmeropo}</span>
        {delayed && (
          <span style={{
            padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
            color: '#FFFFFF', backgroundColor: '#DC0202',
            animation: 'pulse 2s infinite',
          }}>
            DELAY
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#000000', marginBottom: 4 }}>{cita.transportista.nombrecompaa}</div>
      <div className="flex items-center" style={{ gap: 8, fontSize: 12, color: '#808285', marginBottom: 8 }}>
        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 11 }} />
        {cita.dock.nombredock}
        <FontAwesomeIcon icon={faClock} style={{ fontSize: 11 }} />
        {cita.inicioventana}-{cita.finventana}
      </div>

      {cita.actualstarttime && (
        <div style={{
          borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 12,
          backgroundColor: billingActive ? '#DC02020D' : '#EEEEEE',
          color: billingActive ? '#DC0202' : '#808285',
        }}>
          <div className="flex items-center" style={{ gap: 4 }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: 11 }} />
            {formatDuration(mins)} en patio
          </div>
          {billingActive && (
            <div className="flex items-center" style={{ gap: 4, marginTop: 2, fontWeight: 700 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 11 }} />
              {formatDuration(detention.billableMinutes)} — ${detention.charge.toFixed(0)} MXN
            </div>
          )}
        </div>
      )}

      {canChange && (
        <Boton
          onClick={(e) => {
            e.stopPropagation();
            onChangeStatus(nextKey);
          }}
          style={{ width: '100%', justifyContent: 'center', padding: '6px 0', fontSize: 12 }}
        >
          {ESTADOS[nextKey].nombre}
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
        </Boton>
      )}
    </motion.div>
  );
}
