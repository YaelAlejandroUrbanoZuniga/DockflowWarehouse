import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { addDays, type ViewMode } from '../utils';

const MODE_LABELS: Record<ViewMode, string> = { day: 'Día', week: 'Semana', month: 'Mes' };

export function ViewToggle({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
}: {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}) {
  const [hoveredMode, setHoveredMode] = useState<ViewMode | null>(null);
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const [todayHover, setTodayHover] = useState(false);

  return (
    <div className="flex items-center" style={{ marginBottom: 16, gap: 8 }}>
      {(['day', 'week', 'month'] as ViewMode[]).map((m) => {
        const isActive = viewMode === m;
        const isHovered = hoveredMode === m && !isActive;
        return (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            onMouseEnter={() => setHoveredMode(m)}
            onMouseLeave={() => setHoveredMode(null)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 6,
              border: isActive ? 'none' : '1px solid #D1D3D4',
              backgroundColor: isActive ? '#DC0202' : isHovered ? '#F5F5F5' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {MODE_LABELS[m]}
          </button>
        );
      })}
      <div className="flex items-center" style={{ marginLeft: 'auto', gap: 8 }}>
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          onMouseEnter={() => setPrevHover(true)}
          onMouseLeave={() => setPrevHover(false)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #D1D3D4', backgroundColor: prevHover ? '#F5F5F5' : '#FFFFFF', cursor: 'pointer', transition: 'background-color 0.15s' }}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 14, color: '#808285' }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>
          {selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          onMouseEnter={() => setNextHover(true)}
          onMouseLeave={() => setNextHover(false)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #D1D3D4', backgroundColor: nextHover ? '#F5F5F5' : '#FFFFFF', cursor: 'pointer', transition: 'background-color 0.15s' }}
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14, color: '#808285' }} />
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          onMouseEnter={() => setTodayHover(true)}
          onMouseLeave={() => setTodayHover(false)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D3D4', fontSize: 12, fontWeight: 600, color: '#808285', backgroundColor: todayHover ? '#F5F5F5' : '#FFFFFF', cursor: 'pointer', transition: 'background-color 0.15s' }}
        >
          Hoy
        </button>
      </div>
    </div>
  );
}
