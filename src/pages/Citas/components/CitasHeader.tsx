import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faPlus } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Boton } from '@/kit/componentes/Boton/Boton';
import { Insignia } from '@/kit/componentes/Insignia/Insignia';

interface SummaryCard {
  label: string;
  value: number;
  icon: IconDefinition;
  color: string;
}

export function CitasHeader({
  selectedDate,
  summaryCards,
  canCreate,
  onShare,
  onCreate,
}: {
  selectedDate: Date;
  summaryCards: SummaryCard[];
  canCreate: boolean;
  onShare: () => void;
  onCreate: () => void;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Citas</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>
            {selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center" style={{ gap: 8, marginTop: 8 }}>
            {summaryCards.map((s) => (
              <Insignia key={s.label} estado="info">
                <FontAwesomeIcon icon={s.icon} style={{ fontSize: 11, marginRight: 4 }} />
                {s.value} {s.label}
              </Insignia>
            ))}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Boton variante="secundario" onClick={onShare}>
            <FontAwesomeIcon icon={faShareNodes} style={{ fontSize: 13 }} />
            Compartir
          </Boton>
          {canCreate && (
            <Boton onClick={onCreate}>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />
              Nueva Cita
            </Boton>
          )}
        </div>
      </div>
    </div>
  );
}
