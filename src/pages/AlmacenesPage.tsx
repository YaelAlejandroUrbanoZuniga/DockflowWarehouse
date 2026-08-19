import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWarehouse,
  faPlus,
  faPenToSquare,
  faMapMarkerAlt,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { almacenesAtom, docksAtom, usersAtom } from '@/lib/store';
import type { Almacen } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';
import { useToast } from '@/kit/componentes/Toast/Toast';

export function AlmacenesPage() {
  const toast = useToast();
  const [almacenes, setAlmacenes] = useAtom(almacenesAtom);
  const docks = useAtomValue(docksAtom);
  const users = useAtomValue(usersAtom);
  const reduceMotion = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Almacen | null>(null);
  const [form, setForm] = useState({ nombre: '', ubicacion: '', activo: true });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', ubicacion: '', activo: true });
    setModalOpen(true);
  };

  const openEdit = (alm: Almacen) => {
    setEditing(alm);
    setForm({ nombre: alm.nombre, ubicacion: alm.ubicacion ?? '', activo: alm.activo });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      toast.validationError('El nombre es requerido');
      return;
    }
    if (editing) {
      setAlmacenes((prev) =>
        prev.map((a) =>
          a.id === editing.id
            ? { ...a, nombre: form.nombre, ubicacion: form.ubicacion, activo: form.activo }
            : a,
        ),
      );
      toast.success('Almacén actualizado');
    } else {
      const newAlm: Almacen = {
        id: `alm-${Date.now()}`,
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        activo: form.activo,
      };
      setAlmacenes((prev) => [...prev, newAlm]);
      toast.success('Almacén creado');
    }
    setModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Almacenes</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>Administra los almacenes del sistema</p>
        </div>
        <Boton onClick={openCreate}>
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />
          Nuevo Almacén
        </Boton>
      </div>

      {/* Grid or empty state */}
      {almacenes.length === 0 ? (
        <EmptyState
          icon={faWarehouse}
          title="No hay almacenes"
          description="Crea un nuevo almacén para comenzar."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {almacenes.map((alm, i) => {
            const almDocks = docks.filter((d) => d.almacenId === alm.id);
            const almUsers = users.filter((u) => u.almacenId === alm.id);
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
                  docksCount={almDocks.length}
                  usersCount={almUsers.length}
                  activo={alm.activo}
                  onEdit={() => openEdit(alm)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent maxWidth={420}>
          <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            {editing ? 'Editar Almacén' : 'Nuevo Almacén'}
          </DialogTitle>
          <ModalHeader
            title={editing ? 'Editar Almacén' : 'Nuevo Almacén'}
            accentColor="#DC0202"
            onClose={() => setModalOpen(false)}
          />
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CampoTexto
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del almacén"
            />
            <CampoTexto
              label="Ubicación"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              placeholder="Dirección o ubicación"
            />
            <ToggleRow
              checked={form.activo}
              onChange={(v) => setForm({ ...form, activo: v })}
              label="Activo"
            />
            <div className="flex" style={{ gap: 8, justifyContent: 'flex-end' }}>
              <Boton variante="secundario" onClick={() => setModalOpen(false)}>
                Cancelar
              </Boton>
              <Boton onClick={handleSave}>
                {editing ? 'Guardar' : 'Crear'}
              </Boton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlmacenCard({
  nombre,
  ubicacion,
  docksCount,
  usersCount,
  activo,
  onEdit,
}: {
  nombre: string;
  ubicacion?: string;
  docksCount: number;
  usersCount: number;
  activo: boolean;
  onEdit: () => void;
}) {
  const [editHover, setEditHover] = useState(false);

  return (
    <Tarjeta>
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DC02021A' }}>
          <FontAwesomeIcon icon={faWarehouse} style={{ fontSize: 18, color: '#DC0202' }} />
        </div>
        <button
          onClick={onEdit}
          onMouseEnter={() => setEditHover(true)}
          onMouseLeave={() => setEditHover(false)}
          style={{
            padding: 8, borderRadius: 6, border: 'none', cursor: 'pointer',
            backgroundColor: editHover ? '#F5F5F5' : 'transparent',
            transition: 'background-color 0.12s',
          }}
          aria-label="Editar"
        >
          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 14, color: editHover ? '#000000' : '#808285', transition: 'color 0.12s' }} />
        </button>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000000', margin: 0 }}>{nombre}</h3>
      {ubicacion && (
        <div className="flex items-center" style={{ gap: 4, marginTop: 4 }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: 12, color: '#808285' }} />
          <span style={{ fontSize: 12, color: '#808285' }}>{ubicacion}</span>
        </div>
      )}

      <div className="flex items-center" style={{ gap: 16, marginTop: 16 }}>
        <div className="flex items-center" style={{ gap: 4 }}>
          <FontAwesomeIcon icon={faBuilding} style={{ fontSize: 13, color: '#808285' }} />
          <span style={{ fontSize: 12, color: '#808285' }}>{docksCount} docks</span>
        </div>
        <span style={{ fontSize: 12, color: '#808285' }}>{usersCount} usuarios</span>
        <Insignia estado={activo ? 'active' : 'archived'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Insignia>
      </div>
    </Tarjeta>
  );
}

function ToggleRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="flex items-center" style={{ gap: 12 }}>
      <button
        onClick={() => onChange(!checked)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
          backgroundColor: checked ? '#DC0202' : hover ? '#D1D3D4' : '#EEEEEE',
          transition: 'background-color 0.15s',
          position: 'relative',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FFFFFF',
          transition: 'left 0.15s',
        }} />
      </button>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#484848' }}>{label}</span>
    </div>
  );
}
