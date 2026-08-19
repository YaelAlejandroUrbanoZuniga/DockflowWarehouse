import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import type { Cita } from '@/lib/types';
import {
  buildPublicCheckinUrl,
  generateQrDataUrl,
  buildWhatsAppMessage,
  buildReminderMessage,
  buildQrCheckInMessage,
  downloadDataUrl,
  openWhatsApp,
} from '@/lib/qr';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { Boton } from '@/kit/componentes/Boton/Boton';

type Template = 'detalles' | 'recordatorio' | 'qr';

const TEMPLATES: { key: Template; label: string; desc: string }[] = [
  { key: 'detalles', label: 'Detalles Completos', desc: 'Información completa de la cita' },
  { key: 'recordatorio', label: 'Recordatorio', desc: 'Recordatorio de cita próxima' },
  { key: 'qr', label: 'Con QR Check-In', desc: 'Mensaje con QR para check-in' },
];

export function WhatsAppShareDialog({
  cita,
  open,
  onOpenChange,
}: {
  cita: Cita | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [template, setTemplate] = useState<Template>('detalles');
  const [phone, setPhone] = useState('+52');
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (cita && open) {
      setPhone('+52');
      setTemplate('detalles');
      generateQrDataUrl(buildPublicCheckinUrl(cita)).then(setQrUrl);
    }
  }, [cita, open]);

  if (!cita) return null;

  const getMessage = () => {
    switch (template) {
      case 'recordatorio':
        return buildReminderMessage(cita);
      case 'qr':
        return buildQrCheckInMessage(cita);
      default:
        return buildWhatsAppMessage(cita);
    }
  };

  const handleSend = () => {
    if (template === 'qr' && qrUrl) {
      downloadDataUrl(qrUrl, `QR_${cita.nmeropo}.png`);
    }
    openWhatsApp(phone, getMessage());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={480}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Compartir por WhatsApp
        </DialogTitle>
        <ModalHeader title="Compartir por WhatsApp" accentColor="#DC0202" onClose={() => onOpenChange(false)} />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Template picker */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 8 }}>
              Plantilla de mensaje
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEMPLATES.map(t => {
                const selected = template === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTemplate(t.key)}
                    style={{
                      width: '100%', textAlign: 'left', borderRadius: 8, padding: 12, cursor: 'pointer',
                      border: selected ? '2px solid #DC0202' : '1px solid #D1D3D4',
                      backgroundColor: selected ? '#DC02020D' : '#FFFFFF',
                      transition: 'border-color 0.12s, background-color 0.12s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: '#808285' }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <CampoTexto
            label="Número de teléfono"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
          />

          <div style={{ borderRadius: 8, backgroundColor: '#F5F5F5', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#808285', marginBottom: 4 }}>Vista previa:</div>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#484848', margin: 0 }}>{getMessage()}</pre>
          </div>

          {template === 'qr' && qrUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, backgroundColor: '#6ABF4B1A', padding: 12 }}>
              <img src={qrUrl} alt="QR" style={{ width: 64, height: 64, borderRadius: 6 }} />
              <div style={{ fontSize: 12, color: '#484848' }}>
                El QR se descargará automáticamente para adjuntarlo al mensaje.
              </div>
            </div>
          )}

          <Boton onClick={handleSend} style={{ width: '100%', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faDownload} style={{ fontSize: 14 }} />
            Descargar QR y Abrir WhatsApp
          </Boton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
