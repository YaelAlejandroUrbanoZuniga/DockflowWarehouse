import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faFileLines,
  faEnvelope,
  faQrcode,
  faCommentDots,
  faPrint,
  faBarcode,
  faDownload,
  faCircleXmark,
  faClock,
  faTruck,
  faBoxOpen,
  faMapMarkerAlt,
  faUser,
  faCalendarDays,
  faCubes,
  faNoteSticky,
  faClockRotateLeft,
  faShieldHalved,
  faCircleCheck,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import {
  citasAtom,
  transportistasAtom,
  currentUserAtom,
} from '@/lib/store';
import { ESTADOS, FLOW_ORDER, ROLE_PERMISSIONS } from '@/lib/constants';
import { ESTADO_UI } from '@/lib/ui-map';
import type { EstadoKey } from '@/lib/types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  getNextEstado,
  canTransitionTo,
  getTotalTime,
  formatDuration,
  getDetentionInfo,
  isDelayed,
} from '@/lib/cita-utils';
import { EstadoBadge } from '@/components/EstadoBadge';
import { StatusChangeDialog } from '@/components/StatusChangeDialog';
import { SummaryDialog } from '@/components/SummaryDialog';
import { WhatsAppShareDialog } from '@/components/WhatsAppShareDialog';
import { QRSuccessDialog } from '@/components/QRSuccessDialog';
import { SectionHeader } from '@/components/SectionHeader';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { Boton } from '@/kit/componentes/Boton/Boton';
import {
  buildPublicCheckinUrl,
  generateQrDataUrl,
  buildWhatsAppMessage,
  downloadDataUrl,
  openEmail,
} from '@/lib/qr';

export function CitaDetailPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [citas, setCitas] = useAtom(citasAtom);
  const transportistas = useAtomValue(transportistasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const perms = ROLE_PERMISSIONS[currentUser.role];

  const [statusDialog, setStatusDialog] = useState<{ open: boolean; target: EstadoKey }>({
    open: false,
    target: 0,
  });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const cita = citas.find((c) => c.id === id);

  if (!cita) {
    return (
      <div>
        <Tarjeta style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 14, color: '#808285', margin: '0 0 8px' }}>Cita no encontrada</p>
          <Link to="/citas" style={{ fontSize: 13, fontWeight: 600, color: '#DC0202', textDecoration: 'none' }}>
            Volver a Citas
          </Link>
        </Tarjeta>
      </div>
    );
  }

  const transportista = transportistas.find((t) => t.id === cita.transportista.id);
  const nextEstado = getNextEstado(cita.estadoKey);
  const delayed = isDelayed(cita);

  const canChangeToNext = (target: EstadoKey): boolean => {
    if (target === 8) return perms.canChangeEnRampa;
    if (target === 2) return perms.canAuthorizeDescarga;
    if (target === 3) return perms.canEditCitas;
    if (target === 1) return perms.canCheckIn;
    if (target === 6) return perms.canCheckOut;
    return perms.canEditCitas;
  };

  const handleStatusConfirm = () => {
    const target = statusDialog.target;
    setCitas((prev) =>
      prev.map((c) => {
        if (c.id !== cita.id) return c;
        const now = new Date().toISOString();
        const updated = {
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
        } as typeof c;

        if (target === 1) {
          updated.actualstarttime = now;
          updated.autorizacionTimestamp = now;
          updated.estadoKey = 7;
          updated.historial.push({
            estadoKey: 7,
            estadoNombre: ESTADOS[7].nombre,
            timestamp: now,
            usuarioNombre: 'Sistema',
            nota: 'Auto-transición tras Llegada',
          });
        }
        if (target === 3) {
          updated.actualendtime = now;
        }
        if (target === 7 && !updated.autorizacionTimestamp) {
          updated.autorizacionTimestamp = now;
        }
        return updated;
      }),
    );
    toast.success(`Estado cambiado a: ${ESTADOS[target].nombre}`);
    setStatusDialog({ open: false, target: 0 });

    if (target === 3) {
      setTimeout(() => setSummaryOpen(true), 300);
    }
  };

  const handleCancel = () => {
    setCitas((prev) =>
      prev.map((c) =>
        c.id === cita.id
          ? {
              ...c,
              estadoKey: 5,
              historial: [
                ...c.historial,
                {
                  estadoKey: 5,
                  estadoNombre: ESTADOS[5].nombre,
                  timestamp: new Date().toISOString(),
                  usuarioNombre: currentUser.nombrecompleto,
                  nota: 'Cita cancelada',
                },
              ],
            }
          : c,
      ),
    );
    toast.success('Cita cancelada');
  };

  const handleDownloadQR = async () => {
    const url = await generateQrDataUrl(buildPublicCheckinUrl(cita));
    downloadDataUrl(url, `QR_${cita.nmeropo}.png`);
  };

  const handleEmailQR = async () => {
    const url = await generateQrDataUrl(buildPublicCheckinUrl(cita));
    downloadDataUrl(url, `QR_${cita.nmeropo}.png`);
    openEmail(
      cita.transportista.emailcontacto,
      `QR Check-In — ${cita.nmeropo} — Nexteer`,
      buildWhatsAppMessage(cita),
    );
  };

  const handlePrintQR = async () => {
    const url = await generateQrDataUrl(buildPublicCheckinUrl(cita));
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<img src="${url}" style="width:300px"/><p>${cita.nmeropo}</p>`);
      w.document.close();
      w.print();
    }
  };

  const handleDownloadPdf = () => {
    toast.info('Función de PDF próximamente');
  };

  const toolbarActions: { icon: IconDefinition; title: string; onClick: () => void; visible: boolean }[] = [
    { icon: faFileLines,  title: 'Descargar PDF', onClick: handleDownloadPdf,              visible: true },
    { icon: faEnvelope,   title: 'Email PDF',     onClick: handleDownloadPdf,              visible: true },
    { icon: faEnvelope,   title: 'Email QR',      onClick: handleEmailQR,                  visible: true },
    { icon: faQrcode,     title: 'Mostrar QR',    onClick: () => setQrOpen(true),          visible: true },
    { icon: faCommentDots,title: 'WhatsApp',      onClick: () => setWhatsappOpen(true),    visible: true },
    { icon: faPrint,      title: 'Imprimir QR',   onClick: handlePrintQR,                  visible: true },
    { icon: faDownload,   title: 'Descargar QR',  onClick: handleDownloadQR,               visible: true },
    { icon: faBarcode,    title: 'Escanear QR',   onClick: () => navigate(`/checkin-public/${cita.id}`), visible: perms.canCheckIn },
  ];

  return (
    <div>
      {/* Back link */}
      <BackButton onClick={() => navigate('/citas')} />

      {/* Page header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>{cita.nmeropo}</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>
            {cita.fechaprogramada} · {cita.inicioventana} - {cita.finventana}
          </p>
          <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
            <EstadoBadge estadoKey={cita.estadoKey} size="lg" delay={delayed} />
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 4 }}>
          {toolbarActions.filter((a) => a.visible).map((a, i) => (
            <ToolbarIconButton key={i} icon={a.icon} title={a.title} onClick={a.onClick} />
          ))}
        </div>
      </div>

      {/* Flow stepper */}
      <Tarjeta style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#808285', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px' }}>
          Flujo de Estado
        </p>
        <div className="flex items-center" style={{ overflowX: 'auto' }}>
          {FLOW_ORDER.map((estadoKey, i) => {
            const cfg = ESTADOS[estadoKey];
            const ui = ESTADO_UI[estadoKey];
            const currentIdx = FLOW_ORDER.indexOf(cita.estadoKey);
            const isPast = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isCancelled = cita.estadoKey === 5;

            const circleColor = isPast ? '#6ABF4B' : isCurrent ? ui.color : '#D1D3D4';
            const circleBg = isPast ? '#6ABF4B1A' : isCurrent ? `${ui.color}1A` : '#EEEEEE';

            return (
              <div key={estadoKey} className="flex items-center">
                <div className="flex flex-col items-center" style={{ gap: 6, opacity: isCancelled && !isCurrent ? 0.4 : 1 }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `2px solid ${circleColor}`,
                      backgroundColor: circleBg,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isPast ? (
                      <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 18, color: '#6ABF4B' }} />
                    ) : (
                      <FontAwesomeIcon icon={ui.icon} style={{ fontSize: 18, color: isCurrent ? ui.color : '#D1D3D4' }} />
                    )}
                  </div>
                  <span style={{
                    whiteSpace: 'nowrap',
                    fontSize: 10,
                    fontWeight: 600,
                    color: isCurrent ? ui.color : '#808285',
                  }}>
                    {cfg.nombre}
                  </span>
                </div>
                {i < FLOW_ORDER.length - 1 && (
                  <div style={{
                    margin: '0 4px',
                    height: 2,
                    width: 48,
                    backgroundColor: i < currentIdx ? '#6ABF4B' : '#EEEEEE',
                    borderRadius: 2,
                    flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </Tarjeta>

      {/* Action buttons */}
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 24 }}>
        {nextEstado && canTransitionTo(cita.estadoKey, nextEstado) && canChangeToNext(nextEstado) && (
          <Boton onClick={() => setStatusDialog({ open: true, target: nextEstado })}>
            Cambiar a: {ESTADOS[nextEstado].nombre}
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
          </Boton>
        )}

        {cita.estadoKey === 3 && perms.canCheckOut && (
          <Boton
            variante="secundario"
            onClick={() => setStatusDialog({ open: true, target: 6 })}
          >
            <FontAwesomeIcon icon={faBarcode} style={{ fontSize: 13 }} />
            Check-Out con QR
          </Boton>
        )}

        {perms.canCancelCitas && cita.estadoKey !== 5 && cita.estadoKey !== 6 && (
          <Boton variante="peligro" onClick={handleCancel}>
            <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: 13 }} />
            Cancelar
          </Boton>
        )}
      </div>

      {/* Info sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Información General */}
        <div>
          <SectionHeader icon={faFileLines} title="Información General" />
          <Tarjeta>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon={faCubes} label="Número PO" value={cita.nmeropo} />
              <InfoRow icon={faMapMarkerAlt} label="Dock" value={cita.dock.nombredock} />
              <InfoRow icon={faCalendarDays} label="Fecha" value={cita.fechaprogramada} />
              <InfoRow icon={faClock} label="Ventana" value={`${cita.inicioventana} - ${cita.finventana}`} />
              <InfoRow icon={faCubes} label="Número de Caja" value={cita.numerocaja} />
              {cita.placascamin && <InfoRow icon={faTruck} label="Placas" value={cita.placascamin} />}
              {cita.mercanca && <InfoRow icon={faBoxOpen} label="Mercancía" value={cita.mercanca} />}
              {cita.notas && <InfoRow icon={faNoteSticky} label="Notas" value={cita.notas} />}
            </div>
          </Tarjeta>
        </div>

        {/* Transportista */}
        <div>
          <SectionHeader icon={faTruck} title="Transportista" />
          <Tarjeta>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon={faTruck} label="Compañía" value={cita.transportista.nombrecompaa} />
              <InfoRow icon={faEnvelope} label="Email" value={cita.transportista.emailcontacto} />
              {transportista && <InfoRow icon={faUser} label="Contacto" value={transportista.nombrecontacto} />}
              {transportista && <InfoRow icon={faClock} label="Horas Libres" value={`${transportista.horasLibres}h`} />}
              {transportista && <InfoRow icon={faDollarSign} label="Tarifa Detención" value={`$${transportista.tarifadetencion} MXN/h`} />}
              {cita.nombreconductor && <InfoRow icon={faUser} label="Conductor" value={cita.nombreconductor} />}
              {cita.telfonoconductor && <InfoRow icon={faUser} label="Teléfono" value={cita.telfonoconductor} />}
            </div>
          </Tarjeta>
        </div>

        {/* Detention info */}
        {cita.actualstarttime && (
          <div>
            <SectionHeader icon={faClock} title="Tiempo y Detención" />
            <Tarjeta>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow icon={faClock} label="Tiempo total" value={formatDuration(getTotalTime(cita))} />
                <InfoRow icon={faClock} label="Tiempo facturable" value={formatDuration(getDetentionInfo(cita, transportista).billableMinutes)} />
                <InfoRow icon={faDollarSign} label="Cargo de detención" value={`${getDetentionInfo(cita, transportista).charge.toFixed(0)} MXN`} />
                {delayed && (
                  <div
                    className="flex items-center"
                    style={{
                      gap: 8,
                      borderRadius: 8,
                      backgroundColor: '#DC02021A',
                      padding: 8,
                      fontSize: 12,
                      color: '#DC0202',
                    }}
                  >
                    <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 12 }} />
                    Espera {'>'} 30 min — marcada como retrasada
                  </div>
                )}
              </div>
            </Tarjeta>
          </div>
        )}

        {/* Historial de Eventos */}
        <div className="lg:col-span-2">
          <SectionHeader icon={faClockRotateLeft} title="Historial de Eventos" />
          <Tarjeta>
            <div>
              {cita.historial
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
                )
                .map((evt, i) => {
                  const ui = ESTADO_UI[evt.estadoKey];
                  const isLast = i === cita.historial.length - 1;
                  return (
                    <div key={i} className="flex" style={{ gap: 12 }}>
                      <div className="flex flex-col items-center">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: `${ui.color}1A`,
                            flexShrink: 0,
                          }}
                        >
                          <FontAwesomeIcon icon={ui.icon} style={{ fontSize: 14, color: ui.color }} />
                        </div>
                        {!isLast && (
                          <div style={{ width: 2, flex: 1, backgroundColor: '#EEEEEE' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
                          {evt.estadoNombre}
                        </div>
                        <div style={{ fontSize: 12, color: '#808285' }}>
                          {new Date(evt.timestamp).toLocaleString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {evt.usuarioNombre}
                        </div>
                        {evt.nota && (
                          <div style={{ marginTop: 2, fontSize: 12, fontStyle: 'italic', color: '#808285' }}>
                            {evt.nota}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Tarjeta>
        </div>
      </div>

      {/* Dialogs */}
      <StatusChangeDialog
        cita={cita}
        targetEstado={statusDialog.target}
        open={statusDialog.open}
        onOpenChange={(v) => setStatusDialog({ ...statusDialog, open: v })}
        onConfirm={handleStatusConfirm}
      />
      <SummaryDialog
        cita={cita}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
      <WhatsAppShareDialog
        cita={cita}
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
      />
      <QRSuccessDialog
        cita={cita}
        open={qrOpen}
        onOpenChange={setQrOpen}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function BackButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: hover ? '#DC0202' : '#0084C0',
        transition: 'color 0.12s',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        marginBottom: 16,
      }}
    >
      <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} />
      Volver
    </button>
  );
}

function ToolbarIconButton({ icon, title, onClick }: { icon: IconDefinition; title: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
      className="flex items-center justify-center"
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        color: '#808285',
        backgroundColor: hover ? '#EEEEEE' : 'transparent',
        transition: 'background-color 0.12s',
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: 15 }} />
    </button>
  );
}

function InfoRow({ icon, label, value }: { icon: IconDefinition; label: string; value: string }) {
  return (
    <div className="flex items-center" style={{ gap: 10, fontSize: 13 }}>
      <FontAwesomeIcon icon={icon} style={{ fontSize: 14, color: '#808285', flexShrink: 0 }} />
      <span style={{ color: '#808285' }}>{label}:</span>
      <span style={{ fontWeight: 600, color: '#000000' }}>{value}</span>
    </div>
  );
}
