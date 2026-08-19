import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWarehouse,
  faMapMarkerAlt,
  faTruck,
  faCalendarDay,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { almacenesAtom, activeAlmacenIdAtom, currentUserAtom, docksAtom, citasAtom } from '@/lib/store';
import { getCitasForDate } from '@/lib/cita-utils';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';

const TODAY = new Date().toISOString().slice(0, 10);

export function SelectAlmacenPage() {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserAtom);
  const almacenes = useAtomValue(almacenesAtom);
  const docks = useAtomValue(docksAtom);
  const citas = useAtomValue(citasAtom);
  const setActiveAlmacenId = useSetAtom(activeAlmacenIdAtom);

  const reduceMotion = useReducedMotion();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role !== 'superuser' && currentUser.role !== 'coordinador') {
    return <Navigate to="/" replace />;
  }

  const handleSelect = (almacenId: string) => {
    setActiveAlmacenId(almacenId);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#EEEEEE' }}>
      <div className="w-full" style={{ maxWidth: 896 }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
          className="text-center"
          style={{ marginBottom: 32 }}
        >
          <div className="mx-auto flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#DC0202', marginBottom: 16 }}>
            <FontAwesomeIcon icon={faWarehouse} style={{ fontSize: 28, color: '#FFFFFF' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Seleccionar Almacén</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>
            Elige el almacén para tu sesión de trabajo
          </p>
        </motion.div>

        {almacenes.length === 0 ? (
          <EmptyState
            icon={faWarehouse}
            title="No hay almacenes disponibles"
            description="Contacta al administrador para configurar almacenes."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            {almacenes.map((alm, i) => {
              const almDocks = docks.filter((d) => d.almacenId === alm.id && d.estactivo);
              const almCitas = citas.filter((c) => c.almacenId === alm.id);
              const todayCount = getCitasForDate(almCitas, TODAY).length;
              return (
                <motion.div
                  key={alm.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
                >
                  <AlmacenCard
                    nombre={alm.nombre}
                    ubicacion={alm.ubicacion}
                    docksActivos={almDocks.length}
                    citasHoy={todayCount}
                    onSelect={() => handleSelect(alm.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AlmacenCard({
  nombre,
  ubicacion,
  docksActivos,
  citasHoy,
  onSelect,
}: {
  nombre: string;
  ubicacion?: string;
  docksActivos: number;
  citasHoy: number;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Tarjeta
      onClick={onSelect}
      style={{
        border: hover ? '2px solid #DC0202' : '1px solid #D1D3D4',
        padding: 24,
      }}
    >
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DC02021A' }}>
          <FontAwesomeIcon icon={faWarehouse} style={{ fontSize: 18, color: '#DC0202' }} />
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{ fontSize: 18, color: hover ? '#DC0202' : '#D1D3D4', transition: 'color 0.15s' }}
        />
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000000', margin: 0 }}>{nombre}</h3>
      {ubicacion && (
        <div className="flex items-center" style={{ gap: 4, marginTop: 4 }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 12, color: '#808285' }} />
          <span style={{ fontSize: 12, color: '#808285' }}>{ubicacion}</span>
        </div>
      )}

      <div className="flex" style={{ gap: 16, marginTop: 16 }}>
        <div className="flex items-center" style={{ gap: 4 }}>
          <FontAwesomeIcon icon={faTruck} style={{ fontSize: 14, color: '#808285' }} />
          <span style={{ fontSize: 12, color: '#808285' }}>{docksActivos} docks activos</span>
        </div>
        <div className="flex items-center" style={{ gap: 4 }}>
          <FontAwesomeIcon icon={faCalendarDay} style={{ fontSize: 14, color: '#808285' }} />
          <span style={{ fontSize: 12, color: '#808285' }}>{citasHoy} citas hoy</span>
        </div>
      </div>
    </Tarjeta>
  );
}
