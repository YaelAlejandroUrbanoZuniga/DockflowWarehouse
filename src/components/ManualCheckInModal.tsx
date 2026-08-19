import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAtomValue } from 'jotai';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { citasAtom, currentUserAtom } from '@/lib/store';
import { ESTADO_UI } from '@/lib/ui-map';
import { getCitasForDate } from '@/lib/cita-utils';
import { useCitaActions } from '@/hooks/use-cita-actions';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import { ContenedorScroll } from '@/kit/componentes/ContenedorScroll/ContenedorScroll';
import { Boton } from '@/kit/componentes/Boton/Boton';
import type { Cita } from '@/lib/types';

const TODAY = new Date().toISOString().slice(0, 10);

export function ManualCheckInModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const citas = useAtomValue(citasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const { updateCitaEstado } = useCitaActions();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

  const todayCitas = useMemo(() => getCitasForDate(citas, TODAY), [citas]);

  const filtered = useMemo(() => {
    if (!search) return todayCitas;
    const q = search.toLowerCase();
    return todayCitas.filter(
      c =>
        c.nmeropo.toLowerCase().includes(q) ||
        c.transportista.nombrecompaa.toLowerCase().includes(q),
    );
  }, [todayCitas, search]);

  const handleConfirm = () => {
    if (!selectedCita) {
      toast.validationError('Seleccione una cita');
      return;
    }
    updateCitaEstado(selectedCita.id, 1, currentUser.nombrecompleto);
    setSelectedCita(null);
    setSearch('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCita(null);
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={480}>
        <DialogTitle style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Check-In Manual
        </DialogTitle>
        <ModalHeader
          title="Check-In Manual"
          subtitle="Busca una cita por número PO o nombre del transportista"
          accentColor="#DC0202"
          onClose={handleClose}
        />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#808285', zIndex: 1 }} />
            <CampoTexto
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por PO o transportista..."
              autoFocus
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Results */}
          <ContenedorScroll maxHeight="256px">
            {filtered.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#808285' }}>
                No se encontraron citas
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filtered.map(c => {
                  const ui = ESTADO_UI[c.estadoKey];
                  const isSelected = selectedCita?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCita(c)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', borderRadius: 8, padding: 12, cursor: 'pointer', transition: 'all 0.12s',
                        border: isSelected ? '2px solid #DC0202' : '1px solid transparent',
                        backgroundColor: isSelected ? '#DC02020D' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${ui.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FontAwesomeIcon icon={ui.icon} style={{ fontSize: 14, color: ui.color }} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>{c.nmeropo}</div>
                        <div style={{ fontSize: 12, color: '#808285', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.transportista.nombrecompaa} · {c.dock.nombredock} · {c.inicioventana}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ContenedorScroll>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Boton variante="secundario" onClick={handleClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancelar
            </Boton>
            <Boton onClick={handleConfirm} disabled={!selectedCita} style={{ flex: 1, justifyContent: 'center' }}>
              Confirmar Check-In
            </Boton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
