import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faPlus,
  faEnvelope,
  faPhone,
  faUser,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  transportistasAtom,
  citasAtom,
  currentUserAtom,
} from '@/lib/store';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import type { Transportista } from '@/lib/types';
import { getPunctualityRate, getCancellationRate } from '@/lib/cita-utils';
import { SectionHeader } from '@/components/SectionHeader';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';

const TODAY = new Date().toISOString().slice(0, 10);

export function TransportistasPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [transportistas, setTransportistas] = useAtom(transportistasAtom);
  const citas = useAtomValue(citasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const reduceMotion = useReducedMotion();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (t: Transportista) => {
    if (editingId) {
      setTransportistas((prev) => prev.map((x) => (x.id === editingId ? t : x)));
      toast.success('Transportista actualizado');
    } else {
      setTransportistas((prev) => [...prev, { ...t, id: `t${Date.now()}` }]);
      toast.success('Transportista creado');
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleToggleActive = (id: string) => {
    setTransportistas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estactivo: !t.estactivo } : t)),
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Transportistas</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>
            {transportistas.length} carriers registrados
          </p>
        </div>
        {perms.canManageTransportistas && (
          <Boton onClick={() => { setEditingId(null); setShowForm(true); }}>
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />
            Nuevo Transportista
          </Boton>
        )}
      </div>

      <SectionHeader icon={faTruck} title="Directorio de Transportistas" />

      {/* Grid */}
      {transportistas.length === 0 ? (
        <EmptyState
          icon={faTruck}
          title="No hay transportistas"
          description="Crea un nuevo transportista para comenzar."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {transportistas.map((t, i) => {
            const punctuality = getPunctualityRate(citas, t.id);
            const cancellation = getCancellationRate(citas, t.id);
            const todayCount = citas.filter(
              (c) => c.transportista.id === t.id && c.fechaprogramada === TODAY,
            ).length;
            return (
              <motion.div
                key={t.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
              >
                <TransportistaCard
                  transportista={t}
                  punctuality={punctuality}
                  cancellation={cancellation}
                  todayCount={todayCount}
                  canManage={perms.canManageTransportistas}
                  onNavigate={() => navigate(`/transportistas/${t.id}`)}
                  onEdit={() => { setEditingId(t.id); setShowForm(true); }}
                  onToggleActive={() => handleToggleActive(t.id)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      {showForm && (
        <TransportistaForm
          transportista={editingId ? transportistas.find((t) => t.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function TransportistaCard({
  transportista: t,
  punctuality,
  cancellation,
  todayCount,
  canManage,
  onNavigate,
  onEdit,
  onToggleActive,
}: {
  transportista: Transportista;
  punctuality: number;
  cancellation: number;
  todayCount: number;
  canManage: boolean;
  onNavigate: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const [cardHover, setCardHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);

  return (
    <div
      onClick={onNavigate}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        cursor: 'pointer',
        boxShadow: cardHover ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: t.estactivo ? '#DC02021A' : '#EEEEEE',
            }}
          >
            <FontAwesomeIcon
              icon={faTruck}
              style={{ fontSize: 18, color: t.estactivo ? '#DC0202' : '#808285' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{t.nombrecompaa}</div>
            <div style={{ fontSize: 12, color: '#808285' }}>{t.rfc}</div>
          </div>
        </div>
        <FontAwesomeIcon
          icon={t.estactivo ? faCircleCheck : faCircleXmark}
          style={{ fontSize: 18, color: t.estactivo ? '#6ABF4B' : '#D1D3D4' }}
        />
      </div>

      {/* Contact details */}
      <div className="flex flex-col" style={{ gap: 6 }}>
        <DetailRow icon={faUser} text={t.nombrecontacto} />
        <DetailRow icon={faEnvelope} text={t.emailcontacto} />
        <DetailRow icon={faPhone} text={t.telefonocontacto} />
        <DetailRow icon={faClock} text={`${t.horasLibres}h libres · $${t.tarifadetencion}/h detención`} />
      </div>

      {/* Stats */}
      <div className="flex" style={{ gap: 8, marginTop: 12 }}>
        <StatBox value={`${punctuality}%`} label="Puntualidad" color="#6ABF4B" />
        <StatBox value={`${cancellation}%`} label="Cancelación" color="#808285" />
        <StatBox value={String(todayCount)} label="Citas Hoy" color="#DC0202" />
      </div>

      {/* Actions */}
      {canManage && (
        <div className="flex" style={{ gap: 8, marginTop: 12 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
            className="flex flex-1 items-center justify-center"
            style={{
              gap: 6,
              padding: '6px 0',
              fontSize: 12,
              fontWeight: 600,
              color: '#808285',
              border: '1px solid #D1D3D4',
              borderRadius: 6,
              backgroundColor: editHover ? '#F5F5F5' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.12s',
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 11 }} />
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            onMouseEnter={() => setToggleHover(true)}
            onMouseLeave={() => setToggleHover(false)}
            className="flex-1"
            style={{
              padding: '6px 0',
              fontSize: 12,
              fontWeight: 600,
              color: t.estactivo ? '#DC0202' : '#6ABF4B',
              border: `1px solid ${t.estactivo ? '#DC020240' : '#6ABF4B40'}`,
              borderRadius: 6,
              backgroundColor: toggleHover ? (t.estactivo ? '#DC02020D' : '#6ABF4B0D') : '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.12s',
            }}
          >
            {t.estactivo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, text }: { icon: typeof faUser; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: 6, fontSize: 12, color: '#808285' }}>
      <FontAwesomeIcon icon={icon} style={{ fontSize: 11, width: 12 }} />
      <span>{text}</span>
    </div>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center"
      style={{
        borderRadius: 8,
        padding: 8,
        backgroundColor: `${color}0D`,
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 10, color }}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form dialog                                                         */
/* ------------------------------------------------------------------ */

function TransportistaForm({
  transportista,
  onClose,
  onSave,
}: {
  transportista?: Transportista;
  onClose: () => void;
  onSave: (t: Transportista) => void;
}) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const [form, setForm] = useState<Transportista>(
    transportista || {
      id: '',
      nombrecompaa: '',
      rfc: '',
      nombrecontacto: '',
      emailcontacto: '',
      telefonocontacto: '',
      estactivo: true,
      horasLibres: 2,
      tarifadetencion: 500,
    },
  );
  const [checkHover, setCheckHover] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombrecompaa || !form.rfc) {
      toast.validationError('Complete los campos requeridos');
      return;
    }
    onSave(form);
  };

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.30)', zIndex: 40 }}
        onClick={onClose}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        className="fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          width: '100%',
          maxWidth: 440,
          maxHeight: '85vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={transportista ? 'Editar Transportista' : 'Nuevo Transportista'}
          accentColor="#DC0202"
          onClose={onClose}
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col"
          style={{ minHeight: 0 }}
        >
          {/* Scrollable body */}
          <div
            className="flex-1"
            style={{ overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <CampoTexto
              label="Nombre Compañía *"
              type="text"
              value={form.nombrecompaa}
              onChange={(e) => setForm({ ...form, nombrecompaa: e.target.value })}
              required
            />
            <CampoTexto
              label="RFC *"
              type="text"
              value={form.rfc}
              onChange={(e) => setForm({ ...form, rfc: e.target.value })}
              required
            />
            <CampoTexto
              label="Nombre Contacto"
              type="text"
              value={form.nombrecontacto}
              onChange={(e) => setForm({ ...form, nombrecontacto: e.target.value })}
            />
            <CampoTexto
              label="Email Contacto"
              type="email"
              value={form.emailcontacto}
              onChange={(e) => setForm({ ...form, emailcontacto: e.target.value })}
            />
            <CampoTexto
              label="Teléfono Contacto"
              type="tel"
              value={form.telefonocontacto}
              onChange={(e) => setForm({ ...form, telefonocontacto: e.target.value })}
            />

            {/* Detention parameters */}
            <div style={{
              borderRadius: 8,
              border: '1px solid #D1D3D4',
              padding: 16,
            }}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#808285',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 12px',
              }}>
                Parámetros de Detención
              </p>
              <div className="grid grid-cols-2" style={{ gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <CampoTexto
                    label="Horas Libres"
                    type="number"
                    min={0}
                    value={String(form.horasLibres)}
                    onChange={(e) => setForm({ ...form, horasLibres: Number(e.target.value) })}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    fontSize: 11,
                    color: '#808285',
                    pointerEvents: 'none',
                  }}>h</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <CampoTexto
                    label="Tarifa Detención"
                    type="number"
                    min={0}
                    value={String(form.tarifadetencion)}
                    onChange={(e) => setForm({ ...form, tarifadetencion: Number(e.target.value) })}
                    style={{ paddingLeft: 20 }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: 10,
                    bottom: 10,
                    fontSize: 11,
                    color: '#808285',
                    pointerEvents: 'none',
                  }}>$</span>
                  <span style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    fontSize: 11,
                    color: '#808285',
                    pointerEvents: 'none',
                  }}>MXN/h</span>
                </div>
              </div>
            </div>

            {/* Active checkbox */}
            <label
              className="flex items-center"
              style={{ gap: 8, fontSize: 13, color: '#000000', cursor: 'pointer' }}
              onMouseEnter={() => setCheckHover(true)}
              onMouseLeave={() => setCheckHover(false)}
            >
              <span style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${form.estactivo ? '#DC0202' : '#D1D3D4'}`,
                backgroundColor: form.estactivo ? '#DC0202' : (checkHover ? '#F5F5F5' : '#FFFFFF'),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.12s, border-color 0.12s',
                flexShrink: 0,
              }}>
                {form.estactivo && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={form.estactivo}
                onChange={(e) => setForm({ ...form, estactivo: e.target.checked })}
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
              />
              Activo
            </label>
          </div>

          {/* Fixed footer */}
          <div className="flex" style={{ gap: 8, padding: '16px 32px', borderTop: '1px solid #D1D3D4' }}>
            <Boton variante="secundario" type="button" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancelar
            </Boton>
            <Boton type="submit" style={{ flex: 1, justifyContent: 'center' }}>
              Guardar
            </Boton>
          </div>
        </form>
      </motion.div>
    </>
  );
}
