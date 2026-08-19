import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBuilding,
  faGear,
  faDatabase,
  faMapMarkerAlt,
  faClock,
  faFloppyDisk,
  faPenToSquare,
  faPowerOff,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';
import { docksAtom, transportistasAtom, citasAtom, activeAlmacenIdAtom } from '@/lib/store';
import { NEXTEER_ADDRESS } from '@/lib/constants';
import { SectionHeader } from '@/components/SectionHeader';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { TarjetaKPI } from '@/kit/componentes/TarjetaKPI/TarjetaKPI';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { ConfirmDialog } from '@/kit/componentes/ConfirmDialog/ConfirmDialog';
import type { Dock } from '@/lib/types';

export function ConfiguracionPage() {
  const toast = useToast();
  const [allDocks, setDocks] = useAtom(docksAtom);
  const transportistas = useAtomValue(transportistasAtom);
  const allCitas = useAtomValue(citasAtom);
  const activeAlmacenId = useAtomValue(activeAlmacenIdAtom);
  const docks = allDocks.filter((d) => d.almacenId === activeAlmacenId);
  const citas = allCitas.filter((c) => c.almacenId === activeAlmacenId);
  const [editingDock, setEditingDock] = useState<string | null>(null);
  const [confirmandoToggle, setConfirmandoToggle] = useState<Dock | null>(null);
  const [editValues, setEditValues] = useState<{ nombre: string; desc: string; cap: number }>({
    nombre: '',
    desc: '',
    cap: 8,
  });

  const startEdit = (id: string) => {
    const d = docks.find((x) => x.id === id);
    if (d) {
      setEditingDock(id);
      setEditValues({ nombre: d.nombredock, desc: d.descripcion, cap: d.capacidaddiaria });
    }
  };

  const saveDock = () => {
    if (!editingDock) return;
    setDocks((prev) =>
      prev.map((d) =>
        d.id === editingDock
          ? { ...d, nombredock: editValues.nombre, descripcion: editValues.desc, capacidaddiaria: editValues.cap }
          : d,
      ),
    );
    toast.success('Dock actualizado');
    setEditingDock(null);
  };

  const toggleDock = (id: string) => {
    const wasActive = allDocks.find((d) => d.id === id)?.estactivo;
    setDocks((prev) => prev.map((d) => (d.id === id ? { ...d, estactivo: !d.estactivo } : d)));
    toast.success(wasActive ? 'Dock desactivado' : 'Dock activado');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Configuración</h1>
        <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>Parámetros del sistema</p>
      </div>

      {/* Facility info */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader icon={faBuilding} title="Información de Planta" />
        <Tarjeta>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#DC02021A', flexShrink: 0 }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 18, color: '#DC0202' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>Nexteer Automotive Querétaro</div>
              <div style={{ fontSize: 13, color: '#808285' }}>{NEXTEER_ADDRESS}</div>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* Docks */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader icon={faGear} title="Configuración de Docks" />
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          {docks.map((d) => (
            <Tarjeta key={d.id}>
              {editingDock === d.id ? (
                <div className="flex flex-col" style={{ gap: 12 }}>
                  <CampoTexto
                    type="text"
                    value={editValues.nombre}
                    onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })}
                    placeholder="Nombre del dock"
                  />
                  <CampoTexto
                    type="text"
                    value={editValues.desc}
                    onChange={(e) => setEditValues({ ...editValues, desc: e.target.value })}
                    placeholder="Descripción"
                  />
                  <CampoTexto
                    type="number"
                    value={editValues.cap}
                    onChange={(e) => setEditValues({ ...editValues, cap: Number(e.target.value) })}
                    placeholder="Capacidad diaria"
                  />
                  <div className="flex" style={{ gap: 8 }}>
                    <Boton variante="secundario" onClick={() => setEditingDock(null)} style={{ flex: 1, justifyContent: 'center' }}>
                      Cancelar
                    </Boton>
                    <Boton onClick={saveDock} style={{ flex: 1, justifyContent: 'center' }}>
                      <FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 13 }} />
                      Guardar
                    </Boton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{d.nombredock}</span>
                    <Insignia estado={d.estactivo ? 'active' : 'archived'}>
                      {d.estactivo ? 'Activo' : 'Inactivo'}
                    </Insignia>
                  </div>
                  <p style={{ fontSize: 13, color: '#808285', margin: '0 0 8px' }}>{d.descripcion}</p>
                  <div className="flex items-center" style={{ gap: 6, marginBottom: 12, fontSize: 12, color: '#808285' }}>
                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 12 }} />
                    Capacidad diaria: <span style={{ fontWeight: 600, color: '#000000' }}>{d.capacidaddiaria}</span>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <DockActionButton icon={faPenToSquare} label="Editar" onClick={() => startEdit(d.id)} />
                    <DockActionButton icon={faPowerOff} label={d.estactivo ? 'Desactivar' : 'Activar'} onClick={() => setConfirmandoToggle(d)} />
                  </div>
                </>
              )}
            </Tarjeta>
          ))}
        </div>
      </div>

      {confirmandoToggle && (
        <ConfirmDialog
          title={confirmandoToggle.estactivo ? '¿Desactivar dock?' : '¿Activar dock?'}
          message={
            <>
              Estás a punto de {confirmandoToggle.estactivo ? 'desactivar' : 'activar'}{' '}
              <strong style={{ color: '#000000' }}>{confirmandoToggle.nombredock}</strong>.{' '}
              {confirmandoToggle.estactivo
                ? 'Dejará de estar disponible para programar citas nuevas.'
                : 'Volverá a estar disponible para programar citas.'}
            </>
          }
          confirmLabel={confirmandoToggle.estactivo ? 'Desactivar' : 'Activar'}
          confirmColor={confirmandoToggle.estactivo ? '#DC0202' : '#6ABF4B'}
          onCancel={() => setConfirmandoToggle(null)}
          onConfirm={() => {
            toggleDock(confirmandoToggle.id);
            setConfirmandoToggle(null);
          }}
        />
      )}

      {/* Data summary */}
      <div>
        <SectionHeader icon={faDatabase} title="Resumen de Datos" />
        <div className="grid grid-cols-3" style={{ gap: 16 }}>
          <TarjetaKPI icon={faDatabase} color="#DC0202" label="Citas" value={citas.length} />
          <TarjetaKPI icon={faGear} color="#DC0202" label="Docks" value={docks.length} />
          <TarjetaKPI icon={faTruck} color="#DC0202" label="Transportistas" value={transportistas.length} />
        </div>
      </div>
    </div>
  );
}

function DockActionButton({ icon, label, onClick }: { icon: IconDefinition; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-center"
      style={{
        flex: 1,
        gap: 6,
        padding: '6px 0',
        fontSize: 12,
        fontWeight: 600,
        color: '#808285',
        border: '1px solid #D1D3D4',
        borderRadius: 6,
        backgroundColor: hover ? '#F5F5F5' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
      {label}
    </button>
  );
}
