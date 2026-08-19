import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import type { Cita } from '@/lib/types';
import {
  buildPublicCheckinUrl,
  generateQrDataUrl,
  buildWhatsAppMessage,
  openWhatsApp,
  openEmail,
  downloadDataUrl,
} from '@/lib/qr';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { Boton } from '@/kit/componentes/Boton/Boton';

export function QRSuccessDialog({
  cita,
  open,
  onOpenChange,
}: {
  cita: Cita | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (cita && open) {
      setQrUrl('');
      const t = setTimeout(async () => {
        const url = await generateQrDataUrl(buildPublicCheckinUrl(cita));
        setQrUrl(url);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [cita, open]);

  if (!cita) return null;

  const handleWhatsApp = () => {
    if (qrUrl) downloadDataUrl(qrUrl, `QR-${cita.nmeropo}.png`);
    openWhatsApp('', buildWhatsAppMessage(cita));
  };

  const handleEmail = () => {
    if (qrUrl) downloadDataUrl(qrUrl, `QR-${cita.nmeropo}.png`);
    openEmail(
      cita.transportista.emailcontacto,
      `Confirmación de Cita — ${cita.nmeropo} — Nexteer Automotive`,
      buildWhatsAppMessage(cita),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={520}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Cita creada exitosamente
        </DialogTitle>
        <ModalHeader
          title="Cita Creada Exitosamente"
          subtitle="Comparta la información de la cita y continúe el flujo operativo"
          accentColor="#6ABF4B"
          onClose={() => onOpenChange(false)}
        />

        <div style={{ padding: '28px 32px' }}>
          {/* Two-column body */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, marginBottom: 24 }}>
            {/* Left: QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {qrUrl ? (
                <motion.img
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reduceMotion ? { duration: 0 } : undefined}
                  src={qrUrl}
                  alt="QR Code"
                  style={{ width: 176, height: 176, borderRadius: 8, border: '1px solid #EEEEEE', backgroundColor: '#FFFFFF', padding: 4 }}
                />
              ) : (
                <div style={{ width: 176, height: 176, borderRadius: 8, backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: '#808285' }}>Generando QR...</span>
                </div>
              )}
              <span style={{ fontSize: 11, color: '#808285' }}>QR público de check-in</span>
            </div>

            {/* Right: details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', alignSelf: 'center', fontSize: 13 }}>
              <DetailItem label="Referencia" value={cita.nmeropo} />
              <DetailItem label="Fecha" value={cita.fechaprogramada} />
              <DetailItem label="Horario" value={`${cita.inicioventana}–${cita.finventana}`} />
              <DetailItem label="Dock" value={cita.dock.nombredock} />
              <div style={{ gridColumn: 'span 2' }}>
                <DetailItem label="Transportista" value={cita.transportista.nombrecompaa} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Boton variante="secundario" onClick={handleWhatsApp} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 16, color: '#25D366' }} />
              WhatsApp
            </Boton>
            <Boton variante="secundario" onClick={handleEmail} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 16, color: '#02B3E1' }} />
              Correo
            </Boton>
            <Boton variante="secundario" onClick={() => onOpenChange(false)} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 16, color: '#808285' }} />
              Cerrar
            </Boton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#808285', margin: 0 }}>{label}</p>
      <p style={{ fontWeight: 700, color: '#000000', margin: 0 }}>{value}</p>
    </div>
  );
}
