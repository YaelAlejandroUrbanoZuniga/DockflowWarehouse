import type { Cita } from '@/lib/types';

export function DockAvailability({
  docks,
  occupiedSlots,
  selectedDockId,
}: {
  docks: { id: string; nombredock: string }[];
  occupiedSlots: { dockId: string; slots: Cita[] }[];
  selectedDockId: string;
}) {
  return (
    <div style={{ marginTop: 8, padding: 12, borderRadius: 6, backgroundColor: '#F7F7F7' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#808285' }}>
          Disponibilidad por Dock
        </span>
        <div className="flex items-center" style={{ gap: 12, fontSize: 10, color: '#808285' }}>
          <span className="flex items-center" style={{ gap: 4 }}>
            <span style={{ display: 'inline-block', width: 12, height: 8, borderRadius: 2, backgroundColor: '#E0E0E0' }} /> Libre
          </span>
          <span className="flex items-center" style={{ gap: 4 }}>
            <span style={{ display: 'inline-block', width: 12, height: 8, borderRadius: 2, backgroundColor: '#DC0202' }} /> Ocupado
          </span>
        </div>
      </div>
      {occupiedSlots.map((occ, idx) => {
        const dock = docks.find((d) => d.id === occ.dockId);
        if (!dock) return null;
        const isSelected = occ.dockId === selectedDockId;
        const isLast = idx === occupiedSlots.length - 1;
        return (
          <div key={occ.dockId} style={{ marginBottom: isLast ? 0 : 12 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 500, color: isSelected ? '#DC0202' : '#000000' }}>
                {dock.nombredock}
              </span>
              <span style={{ color: '#808285' }}>{occ.slots.length} citas</span>
            </div>
            <div className="flex" style={{ gap: 2 }}>
              {Array.from({ length: 24 }, (_, h) => {
                const hourLabel = `${String(h).padStart(2, '0')}:00`;
                const hourEnd = `${String(h + 1).padStart(2, '0')}:00`;
                const occupied = occ.slots.some(
                  (c) => c.inicioventana < hourEnd && c.finventana > hourLabel,
                );
                return (
                  <div key={h} style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        height: 20,
                        borderRadius: 2,
                        backgroundColor: occupied ? '#DC0202' : '#E0E0E0',
                      }}
                      title={`${hourLabel}–${hourEnd} ${occupied ? '(ocupado)' : '(libre)'}`}
                    />
                    <span
                      style={{ display: 'inline-block', marginTop: 2, fontSize: 9, lineHeight: 1, color: occupied ? '#DC0202' : '#808285', fontWeight: occupied ? 700 : 400 }}
                    >
                      {h}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
