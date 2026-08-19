import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { ESTADO_UI } from '@/lib/ui-map';
import type { Cita } from '@/lib/types';
import { getCitasForDate } from '@/lib/cita-utils';
import { formatDate, isSameDay, WEEKDAYS } from '../utils';

export function WeekView({
  weekDates,
  citas,
  selectedDate,
  onDayClick,
}: {
  weekDates: Date[];
  citas: Cita[];
  selectedDate: Date;
  onDayClick: (d: Date) => void;
}) {
  return (
    <div className="grid grid-cols-7" style={{ gap: 8 }}>
      {weekDates.map((d) => {
        const ds = formatDate(d);
        const dayCitas = getCitasForDate(citas, ds);
        const isSel = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, new Date());
        return (
          <WeekDayCard
            key={ds}
            date={d}
            dayCitas={dayCitas}
            isSel={isSel}
            isToday={isToday}
            onDayClick={onDayClick}
          />
        );
      })}
    </div>
  );
}

function WeekDayCard({
  date,
  dayCitas,
  isSel,
  isToday,
  onDayClick,
}: {
  date: Date;
  dayCitas: Cita[];
  isSel: boolean;
  isToday: boolean;
  onDayClick: (d: Date) => void;
}) {
  const [hoveredCita, setHoveredCita] = useState<string | null>(null);

  return (
    <div
      style={{
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        boxShadow: isSel ? 'inset 0 0 0 2px #DC0202' : '0 1px 4px rgba(0,0,0,0.08)',
        padding: 12,
      }}
    >
      <button
        onClick={() => onDayClick(date)}
        style={{ marginBottom: 8, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#808285' }}>
          {WEEKDAYS[date.getDay()]}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: isToday ? '#DC0202' : '#000000' }}>
          {date.getDate()}
        </div>
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {dayCitas.length === 0 ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: '#808285', textAlign: 'center', padding: '16px 0' }}>Sin citas</div>
        ) : (
          dayCitas
            .sort((a, b) => a.inicioventana.localeCompare(b.inicioventana))
            .slice(0, 4)
            .map((c) => {
              const ui = ESTADO_UI[c.estadoKey];
              const isHovered = hoveredCita === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onDayClick(date)}
                  onMouseEnter={() => setHoveredCita(c.id)}
                  onMouseLeave={() => setHoveredCita(null)}
                  style={{
                    cursor: 'pointer',
                    padding: 6,
                    fontSize: 10,
                    borderRadius: 6,
                    borderTop: `3px solid ${ui.color}`,
                    backgroundColor: '#FFFFFF',
                    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.13)' : '0 1px 4px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 4, fontWeight: 700, color: '#000000' }}>
                    <FontAwesomeIcon icon={ui.icon} style={{ fontSize: 10, color: ui.color }} />
                    {c.nmeropo}
                  </div>
                  <div className="flex items-center" style={{ gap: 4, marginTop: 2, color: '#808285' }}>
                    <FontAwesomeIcon icon={faClock} style={{ fontSize: 8 }} />
                    {c.inicioventana}
                  </div>
                </div>
              );
            })
        )}
        {dayCitas.length > 4 && (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#808285' }}>
            +{dayCitas.length - 4} más
          </div>
        )}
      </div>
    </div>
  );
}
