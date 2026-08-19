import { useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faClock,
  faCircleCheck,
  faRightFromBracket,
  faTruck,
  faChartLine,
  faShieldHalved,
  faChevronDown,
  faBolt,
  faTriangleExclamation,
  faMapMarkerAlt,
  faGauge,
  faBrain,
  faWandMagicSparkles,
  faClockRotateLeft,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import {
  citasActivasAtom,
  docksActivosAtom,
  currentUserAtom,
} from '@/lib/store';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import {
  getCitasForDate,
  getMinutesSince,
  formatDuration,
  getSemaphorePriority,
} from '@/lib/cita-utils';
import { CitaStatusCard } from '@/components/CitaStatusCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { TarjetaKPI } from '@/kit/componentes/TarjetaKPI/TarjetaKPI';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';
import { useCitaActions } from '@/hooks/use-cita-actions';
import type { Cita } from '@/lib/types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { generatePredictions, type DayPrediction } from '@/lib/predictions';

const TODAY = new Date().toISOString().slice(0, 10);

export function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const currentUser = useAtomValue(currentUserAtom)!;
  const citas = useAtomValue(citasActivasAtom);
  const docks = useAtomValue(docksActivosAtom);
  const { checkDelayAlerts } = useCitaActions();
  const [tick, setTick] = useState(0);

  const perms = ROLE_PERMISSIONS[currentUser.role];
  const todayCitas = getCitasForDate(citas, TODAY);

  useEffect(() => {
    checkDelayAlerts();
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  void tick;

  const stats = {
    total: todayCitas.length,
    programadas: todayCitas.filter((c) => c.estadoKey === 0).length,
    enProceso: todayCitas.filter(
      (c) => [1, 7, 8, 2].includes(c.estadoKey),
    ).length,
    finalizadas: todayCitas.filter((c) => c.estadoKey === 3).length,
    salidas: todayCitas.filter((c) => c.estadoKey === 6).length,
  };

  const programacionCitas = todayCitas
    .filter((c) => c.estadoKey === 0)
    .sort((a, b) => getSemaphorePriority(a) - getSemaphorePriority(b));

  const enProcesoCitas = todayCitas
    .filter((c) => [1, 7, 8, 2].includes(c.estadoKey))
    .sort((a, b) => getSemaphorePriority(a) - getSemaphorePriority(b));

  const terminadasCitas = todayCitas
    .filter((c) => [3, 6, 5].includes(c.estadoKey))
    .sort((a, b) => getSemaphorePriority(a) - getSemaphorePriority(b));

  const pendingAuth = todayCitas.filter((c) => c.estadoKey === 7);

  const recentCheckins = todayCitas
    .filter((c) => c.actualstarttime)
    .sort(
      (a, b) =>
        new Date(b.actualstarttime!).getTime() -
        new Date(a.actualstarttime!).getTime(),
    )
    .slice(0, 5);

  const prediction: DayPrediction = useMemo(
    () => generatePredictions(todayCitas),
    [todayCitas],
  );

  const statCards: { label: string; value: number; icon: IconDefinition; color: string }[] = [
    { label: 'Total Hoy',   value: stats.total,       icon: faCalendarDays,      color: '#DC0202' },
    { label: 'Programadas', value: stats.programadas,  icon: faClock,             color: '#02B3E1' },
    { label: 'En Proceso',  value: stats.enProceso,    icon: faChartLine,         color: '#D4A017' },
    { label: 'Finalizadas', value: stats.finalizadas,  icon: faCircleCheck,       color: '#6ABF4B' },
    { label: 'Salidas',     value: stats.salidas,      icon: faRightFromBracket,  color: '#808285' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Hola, {currentUser.nombrecompleto}</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>{currentUser.email}</p>
          <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
            <Insignia estado="info">{ROLE_LABELS[currentUser.role]}</Insignia>
            {pendingAuth.length > 0 && (
              <Insignia estado="warning">{pendingAuth.length} en autorización</Insignia>
            )}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
        </div>
      </div>

      {/* Stat KPI cards - 5 cards: first row of 4, second row has the 5th */}
      {/* Since max 4 per row and we have exactly 5, use a 5-col grid on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-5" style={{ gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
          >
            <TarjetaKPI icon={s.icon} color={s.color} label={s.label} value={s.value} />
          </motion.div>
        ))}
      </div>

      {/* Pending auth alert banner */}
      {pendingAuth.length > 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
        >
          <Tarjeta style={{ marginBottom: 24, borderLeft: '4px solid #E3650B' }}>
            <div className="flex items-center" style={{ gap: 12 }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 18, color: '#E3650B' }} />
              <div className="flex-1">
                <div style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
                  {pendingAuth.length} cita(s) en espera de autorización
                </div>
                <div style={{ fontSize: 12, color: '#808285', marginTop: 2 }}>
                  {pendingAuth.map((c) => {
                    const mins = getMinutesSince(c.autorizacionTimestamp);
                    return `${c.nmeropo} (${formatDuration(mins)})`;
                  }).join(', ')}
                </div>
              </div>
              {perms.canAuthorizeDescarga && (
                <Link to="/operador" style={{ textDecoration: 'none' }}>
                  <Boton style={{ fontSize: 12, padding: '6px 12px' }}>
                    Ver Panel
                  </Boton>
                </Link>
              )}
            </div>
          </Tarjeta>
        </motion.div>
      )}

      {/* Collapsible sections */}
      <CollapsibleSection
        title="Programación"
        subtitle="Citas programadas (sin check-in)"
        icon={faClock}
        defaultOpen
        citas={programacionCitas}
      />

      <CollapsibleSection
        title="En Proceso"
        subtitle="Llegada, Esp. Autorización, En Rampa, Descargando"
        icon={faChartLine}
        defaultOpen
        citas={enProcesoCitas}
      />

      <CollapsibleSection
        title="Terminadas"
        subtitle="Finalizada, Salida, Cancelada"
        icon={faCircleCheck}
        defaultOpen={false}
        citas={terminadasCitas}
      />

      {/* Resumen por Dock */}
      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <SectionHeader
          icon={faMapMarkerAlt}
          title="Resumen por Dock"
          subtitle="Ocupación de andenes"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {docks.map((dock) => {
            const dockCitas = todayCitas.filter((c) => c.dock.id === dock.id);
            const ocupadas = dockCitas.filter((c) =>
              [1, 7, 8, 2].includes(c.estadoKey),
            ).length;
            const pct = dock.capacidaddiaria > 0
              ? Math.round((dockCitas.length / dock.capacidaddiaria) * 100)
              : 0;
            const barColor = pct > 80 ? '#DC0202' : pct > 50 ? '#D4A017' : '#6ABF4B';
            return (
              <DockCard
                key={dock.id}
                nombre={dock.nombredock}
                descripcion={dock.descripcion}
                total={dockCitas.length}
                capacidad={dock.capacidaddiaria}
                ocupadas={ocupadas}
                finalizadas={dockCitas.filter((c) => c.estadoKey === 3).length}
                pct={pct}
                barColor={barColor}
              />
            );
          })}
        </div>
      </div>

      {/* Check-ins Recientes */}
      <div>
        <SectionHeader
          icon={faGauge}
          title="Check-ins Recientes"
          subtitle="Últimas llegadas registradas"
        />
        <Tarjeta style={{ padding: 0 }}>
          {recentCheckins.length === 0 ? (
            <EmptyState icon={faClockRotateLeft} title="Sin check-ins recientes." description="Los check-ins de las últimas horas aparecerán aquí." />
          ) : (
            <div>
              {recentCheckins.map((c) => {
                const mins = getMinutesSince(c.actualstarttime);
                const ui = ESTADO_UI[c.estadoKey];
                return (
                  <CheckinRow
                    key={c.id}
                    id={c.id}
                    po={c.nmeropo}
                    transportista={c.transportista.nombrecompaa}
                    dock={c.dock.nombredock}
                    conductor={c.nombreconductor || 'N/A'}
                    mins={mins}
                    icon={ui.icon}
                    iconColor={ui.color}
                  />
                );
              })}
            </div>
          )}
        </Tarjeta>
      </div>

      {/* Predicciones IA */}
      <div style={{ marginTop: 24 }}>
        <SectionHeader
          icon={faBrain}
          title="Predicciones IA"
          subtitle="Análisis predictivo de tiempos de espera"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16 }}>
          <div
            style={{
              borderRadius: 12,
              padding: 20,
              background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
            }}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 16, color: '#02B3E1' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.60)' }}>Insight del Día</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.90)' }}>
              {prediction.insight}
            </p>
            <div className="flex" style={{ gap: 12, marginTop: 16 }}>
              <div className="flex-1" style={{ borderRadius: 8, padding: 12, backgroundColor: 'rgba(255,255,255,0.10)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>Hora Pico</div>
                <div className="flex items-center" style={{ gap: 6, marginTop: 4 }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 14, color: '#D4A017' }} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#D4A017' }}>{prediction.peakHour}</span>
                </div>
              </div>
              <div className="flex-1" style={{ borderRadius: 8, padding: 12, backgroundColor: 'rgba(255,255,255,0.10)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>Mejor Horario</div>
                <div className="flex items-center" style={{ gap: 6, marginTop: 4 }}>
                  <FontAwesomeIcon icon={faBolt} style={{ fontSize: 14, color: '#6ABF4B' }} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#6ABF4B' }}>{prediction.bestHour}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 12, borderRadius: 8, padding: 12, backgroundColor: 'rgba(255,255,255,0.10)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>Espera promedio</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>{prediction.avgDayWait} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen,
  citas,
}: {
  title: string;
  subtitle: string;
  icon: IconDefinition;
  defaultOpen: boolean;
  citas: Cita[];
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [hover, setHover] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex items-center justify-between"
        style={{
          width: '100%',
          marginBottom: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          opacity: hover ? 0.85 : 1,
          transition: 'opacity 0.12s',
        }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#DC0202',
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ fontSize: 16, color: '#FFFFFF' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#000000' }}>
              {title}
              <span style={{ marginLeft: 8 }}>
                <Insignia estado="archived">{citas.length}</Insignia>
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#808285' }}>{subtitle}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}>
          <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 14, color: '#808285' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {citas.length === 0 ? (
              <EmptyState icon={faInbox} title="Sin citas." description="No hay citas en este estado por ahora." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 12 }}>
                {citas.map((c) => (
                  <CitaStatusCard key={c.id} cita={c} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DockCard({
  nombre,
  descripcion,
  total,
  capacidad,
  ocupadas,
  finalizadas,
  pct,
  barColor,
}: {
  nombre: string;
  descripcion: string;
  total: number;
  capacidad: number;
  ocupadas: number;
  finalizadas: number;
  pct: number;
  barColor: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Tarjeta>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <FontAwesomeIcon icon={faTruck} style={{ fontSize: 16, color: '#808285' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{nombre}</span>
        </div>
        <span style={{ fontSize: 11, color: '#808285' }}>{descripcion}</span>
      </div>
      <div className="flex items-center justify-between" style={{ marginBottom: 8, fontSize: 13 }}>
        <span style={{ color: '#808285' }}>Ocupación</span>
        <span style={{ fontWeight: 600, color: '#000000' }}>
          {total}/{capacidad}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 20, backgroundColor: '#EEEEEE', overflow: 'hidden' }}>
        <motion.div
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={reduceMotion ? { duration: 0 } : undefined}
          style={{ height: '100%', borderRadius: 20, backgroundColor: barColor }}
        />
      </div>
      <div className="flex items-center" style={{ gap: 8, marginTop: 8, fontSize: 11 }}>
        <Insignia estado="info">{ocupadas} en uso</Insignia>
        <Insignia estado="active">{finalizadas} finalizadas</Insignia>
      </div>
    </Tarjeta>
  );
}

/* ------------------------------------------------------------------ */

function CheckinRow({
  id,
  po,
  transportista,
  dock,
  conductor,
  mins,
  icon,
  iconColor,
}: {
  id: string;
  po: string;
  transportista: string;
  dock: string;
  conductor: string;
  mins: number;
  icon: IconDefinition;
  iconColor: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`/citas/${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-between"
      style={{
        padding: 16,
        borderBottom: '1px solid #EEEEEE',
        textDecoration: 'none',
        backgroundColor: hover ? '#F5F5F5' : '#FFFFFF',
        transition: 'background-color 0.12s',
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: `${iconColor}1A`,
          }}
        >
          <FontAwesomeIcon icon={icon} style={{ fontSize: 18, color: iconColor }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{po}</div>
          <div style={{ fontSize: 12, color: '#808285' }}>
            {transportista} · {dock}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>
          {formatDuration(mins)} atrás
        </div>
        <div style={{ fontSize: 11, color: '#808285' }}>{conductor}</div>
      </div>
    </Link>
  );
}
