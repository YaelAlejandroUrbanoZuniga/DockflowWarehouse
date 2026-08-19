import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { almacenesAtom, activeAlmacenIdAtom } from '@/lib/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlmacenSwitcherDialog({ open, onOpenChange }: Props) {
  const almacenes = useAtomValue(almacenesAtom);
  const activeId = useAtomValue(activeAlmacenIdAtom);
  const setActiveId = useSetAtom(activeAlmacenIdAtom);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={440}>
        <ModalHeader
          title="Cambiar de almacén"
          subtitle="Selecciona la planta que quieres ver"
          accentColor="#DC0202"
          onClose={() => onOpenChange(false)}
        />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {almacenes.filter(a => a.activo).map(almacen => {
            const isActive = almacen.id === activeId;
            const isHovered = almacen.id === hoveredId;
            return (
              <button
                key={almacen.id}
                onClick={() => handleSelect(almacen.id)}
                onMouseEnter={() => setHoveredId(almacen.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 8,
                  border: isActive ? '2px solid #DC0202' : '1px solid #D1D3D4',
                  backgroundColor: isHovered ? '#F5F5F5' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  background: 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>
                    {almacen.nombre}
                  </div>
                  {almacen.ubicacion && (
                    <div style={{ fontSize: 12, fontWeight: 400, color: '#808285', marginTop: 2 }}>
                      {almacen.ubicacion}
                    </div>
                  )}
                </div>
                {isActive && (
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14, color: '#DC0202', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
