import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEnvelope,
  faPhone,
  faUser,
  faClock,
  faDollarSign,
  faShareNodes,
  faPenToSquare,
  faCalendarDays,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { transportistasAtom, citasAtom, currentUserAtom } from '@/lib/store';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import type { Transportista } from '@/lib/types';
import {
  getPunctualityRate,
  getCancellationRate,
  getDetentionInfo,
} from '@/lib/cita-utils';
import { EstadoBadge } from '@/components/EstadoBadge';
import { ScheduleShareDialog } from '@/components/ScheduleShareDialog';
import { SectionHeader } from '@/components/SectionHeader';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { EmptyState } from '@/kit/componentes/EmptyState/EmptyState';
import { TarjetaKPI } from '@/kit/componentes/TarjetaKPI/TarjetaKPI';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';

const TODAY = new Date().toISOString().slice(0, 10);

export function TransportistaDetailPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [transportistas, setTransportistas] = useAtom(transportistasAtom);
  const citas = useAtomValue(citasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const reduceMotion = useReducedMotion();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const transportista = transportistas.find((t) => t.id === id);

  if (!transportista) {
    return (
      <div>
        <Tarjeta style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 14, color: '#808285', margin: '0 0 8px' }}>Transportista no encontrado</p>
          <Link to="/transportistas" style={{ fontSize: 13, fontWeight: 600, color: '#DC0202' }}>
            Volver
          </Link>
        </Tarjeta>
      </div>
    );
  }

  const tCitas = citas.filter((c) => c.transportista.id === transportista.id);
  const punctuality = getPunctualityRate(citas, transportista.id);
  const cancellation = getCancellationRate(citas, transportista.id);
  const todayCount = tCitas.filter((c) => c.fechaprogramada === TODAY).length;
  const totalDetention = tCitas
    .filter((c) => c.actualstarttime)
    .reduce((acc, c) => acc + getDetentionInfo(c, transportista).charge, 0);

  return (
    <div>
      {/* Back link */}
      <BackButton onClick={() => navigate('/transportistas')} />

      {/* Page header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>{transportista.nombrecompaa}</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>RFC: {transportista.rfc}</p>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {perms.canManageTransportistas && (
            <Boton variante="secundario" onClick={() => setShowEdit(true)}>
              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
              Editar
            </Boton>
          )}
          <Boton variante="secundario" onClick={() => setShowShare(true)}>
            <FontAwesomeIcon icon={faShareNodes} style={{ fontSize: 13 }} />
            Compartir
          </Boton>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ marginBottom: 24 }}>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0 }}>
          <TarjetaKPI icon={faCalendarDays} color="#6ABF4B" label="Puntualidad" value={`${punctuality}%`} />
        </motion.div>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.05 }}>
          <TarjetaKPI icon={faCalendarDays} color="#808285" label="Cancelación" value={`${cancellation}%`} />
        </motion.div>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.1 }}>
          <TarjetaKPI icon={faCalendarDays} color="#DC0202" label="Citas Hoy" value={todayCount} />
        </motion.div>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: 0.15 }}>
          <TarjetaKPI icon={faDollarSign} color="#D4A017" label="Total Detención" value={`${totalDetention.toFixed(0)} MXN`} />
        </motion.div>
      </div>

      {/* Contact info */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader icon={faUser} title="Información de Contacto" />
        <Tarjeta>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 12 }}>
            <ContactRow icon={faUser} label="Contacto:" value={transportista.nombrecontacto} />
            <ContactRow icon={faEnvelope} label="Email:" value={transportista.emailcontacto} />
            <ContactRow icon={faPhone} label="Teléfono:" value={transportista.telefonocontacto} />
            <ContactRow icon={faClock} label="Horas Libres:" value={`${transportista.horasLibres}h`} />
            <ContactRow icon={faDollarSign} label="Tarifa Detención:" value={`$${transportista.tarifadetencion} MXN/h`} />
          </div>
        </Tarjeta>
      </div>

      {/* Citas history */}
      <div>
        <SectionHeader icon={faCalendarDays} title={`Historial de Citas (${tCitas.length})`} />
        <Tarjeta style={{ padding: 0 }}>
          {tCitas.length === 0 ? (
            <EmptyState icon={faInbox} title="Sin citas registradas." description="Este transportista todavía no tiene citas en el sistema." />
          ) : (
            <div>
              {tCitas
                .sort((a, b) => b.fechaprogramada.localeCompare(a.fechaprogramada))
                .map((c) => {
                  const detention = getDetentionInfo(c, transportista);
                  const ui = ESTADO_UI[c.estadoKey];
                  return (
                    <CitaHistoryRow key={c.id} citaId={c.id} po={c.nmeropo} fecha={c.fechaprogramada} hora={c.inicioventana} dock={c.dock.nombredock} estadoKey={c.estadoKey} icon={ui.icon} iconColor={ui.color} detentionCharge={detention.charge} />
                  );
                })}
            </div>
          )}
        </Tarjeta>
      </div>

      <ScheduleShareDialog
        citas={tCitas}
        transportistas={transportistas}
        open={showShare}
        onOpenChange={setShowShare}
        dateLabel={transportista.nombrecompaa}
      />

      {showEdit && (
        <EditTransportistaModal
          transportista={transportista}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            setTransportistas((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            toast.success('Transportista actualizado');
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BackButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{ gap: 6, marginBottom: 16, fontSize: 13, fontWeight: 500, color: hover ? '#DC0202' : '#0084C0', transition: 'color 0.12s', background: 'none', border: 'none', cursor: 'pointer' }}
    >
      <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} />
      Volver
    </button>
  );
}


function ContactRow({ icon, label, value }: { icon: typeof faUser; label: string; value: string }) {
  return (
    <div className="flex items-center" style={{ gap: 8, fontSize: 13 }}>
      <FontAwesomeIcon icon={icon} style={{ fontSize: 14, color: '#808285' }} />
      <span style={{ color: '#808285' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#000000' }}>{value}</span>
    </div>
  );
}

function CitaHistoryRow({
  citaId,
  po,
  fecha,
  hora,
  dock,
  estadoKey,
  icon,
  iconColor,
  detentionCharge,
}: {
  citaId: string;
  po: string;
  fecha: string;
  hora: string;
  dock: string;
  estadoKey: import('@/lib/types').EstadoKey;
  icon: typeof faCalendarDays;
  iconColor: string;
  detentionCharge: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`/citas/${citaId}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-between"
      style={{
        padding: 16,
        borderBottom: '1px solid #EEEEEE',
        backgroundColor: hover ? '#F5F5F5' : '#FFFFFF',
        transition: 'background-color 0.12s',
        textDecoration: 'none',
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <div
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${iconColor}1A` }}
        >
          <FontAwesomeIcon icon={icon} style={{ fontSize: 18, color: iconColor }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{po}</div>
          <div style={{ fontSize: 12, color: '#808285' }}>{fecha} · {hora} · {dock}</div>
        </div>
      </div>
      <div className="flex items-center" style={{ gap: 12 }}>
        {detentionCharge > 0 && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#D4A017' }}>${detentionCharge.toFixed(0)} MXN</span>
        )}
        <EstadoBadge estadoKey={estadoKey} size="sm" />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Edit modal                                                          */
/* ------------------------------------------------------------------ */

function EditTransportistaModal({
  transportista,
  onClose,
  onSave,
}: {
  transportista: Transportista;
  onClose: () => void;
  onSave: (t: Transportista) => void;
}) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const [form, setForm] = useState<Transportista>(transportista);
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
        <ModalHeader title="Editar Transportista" accentColor="#DC0202" onClose={onClose} />

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col" style={{ minHeight: 0 }}>
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
            <div style={{ borderRadius: 8, border: '1px solid #D1D3D4', padding: 16 }}>
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
