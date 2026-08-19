import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import type { Cita, Transportista } from '@/lib/types';
import { ESTADOS } from '@/lib/constants';
import { openWhatsApp, openEmail } from '@/lib/qr';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { Boton } from '@/kit/componentes/Boton/Boton';

export function ScheduleShareDialog({
  citas,
  transportistas,
  open,
  onOpenChange,
  dateLabel,
}: {
  citas: Cita[];
  transportistas: Transportista[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dateLabel: string;
}) {
  const [carrierId, setCarrierId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  useEffect(() => {
    if (open) {
      setCarrierId('all');
      setStatusFilter('all');
      setChannel('whatsapp');
    }
  }, [open]);

  const filtered = citas.filter(c => {
    if (carrierId !== 'all' && c.transportista.id !== carrierId) return false;
    if (statusFilter !== 'all' && c.estadoKey !== Number(statusFilter)) return false;
    return true;
  });

  const buildScheduleMessage = (carrierName: string): string => {
    const lines = filtered.map(
      c => `• ${c.nmeropo} | ${c.inicioventana}-${c.finventana} | ${c.dock.nombredock} | ${ESTADOS[c.estadoKey].nombre}`,
    );
    return (
      `📅 PROGRAMACIÓN DE CITAS — NEXTEER AUTOMOTIVE\n` +
      `Período: ${dateLabel}\n` +
      (carrierName !== 'Todos' ? `Transportista: ${carrierName}\n` : '') +
      `\n${lines.join('\n')}`
    );
  };

  const handleSend = () => {
    const carrier = transportistas.find(t => t.id === carrierId);
    const carrierName = carrier?.nombrecompaa || 'Todos';
    const msg = buildScheduleMessage(carrierName);
    if (channel === 'whatsapp') {
      openWhatsApp('', msg);
    } else {
      const email = carrier?.emailcontacto || '';
      openEmail(email, `Programación de Citas — ${dateLabel} — Nexteer`, msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={480}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Compartir Programación
        </DialogTitle>
        <ModalHeader title="Compartir Programación" subtitle={dateLabel} accentColor="#DC0202" onClose={() => onOpenChange(false)} />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Transportista */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>Transportista</label>
            <select
              value={carrierId}
              onChange={e => setCarrierId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D3D4', borderRadius: 6, fontSize: 13, color: '#000000', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
            >
              <option value="all">Todos</option>
              {transportistas.map(t => (
                <option key={t.id} value={t.id}>{t.nombrecompaa}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>Filtrar por estado</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D3D4', borderRadius: 6, fontSize: 13, color: '#000000', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
            >
              <option value="all">Todos</option>
              {Object.values(ESTADOS).map(e => (
                <option key={e.key} value={e.key}>{e.nombre}</option>
              ))}
            </select>
          </div>

          {/* Channel */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#484848', display: 'block', marginBottom: 4 }}>Canal</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => setChannel('whatsapp')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s',
                  border: channel === 'whatsapp' ? '2px solid #25D366' : '1px solid #D1D3D4',
                  backgroundColor: channel === 'whatsapp' ? '#25D3660D' : '#FFFFFF',
                  color: channel === 'whatsapp' ? '#25D366' : '#484848',
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 14 }} />
                WhatsApp
              </button>
              <button
                onClick={() => setChannel('email')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s',
                  border: channel === 'email' ? '2px solid #02B3E1' : '1px solid #D1D3D4',
                  backgroundColor: channel === 'email' ? '#02B3E10D' : '#FFFFFF',
                  color: channel === 'email' ? '#02B3E1' : '#484848',
                }}
              >
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14 }} />
                Email
              </button>
            </div>
          </div>

          <div style={{ borderRadius: 8, backgroundColor: '#F5F5F5', padding: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: '#484848' }}>{filtered.length} citas seleccionadas</span>
          </div>

          <Boton onClick={handleSend} style={{ width: '100%', justifyContent: 'center' }}>
            Enviar Programación
          </Boton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
