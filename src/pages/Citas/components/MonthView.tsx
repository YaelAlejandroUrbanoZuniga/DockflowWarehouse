import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ESTADO_UI } from '@/lib/ui-map';
import type { Cita } from '@/lib/types';
import { getCitasForDate } from '@/lib/cita-utils';
import { formatDate, isSameDay, WEEKDAYS, MONTHS } from '../utils';

export function MonthView({
  month,
  citas,
  selectedDate,
  onDayClick,
  onPrevMonth,
  onNextMonth,
}: {
  month: Date;
  citas: Cita[];
  selectedDate: Date;
  onDayClick: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ borderRadius: 8, backgroundColor: '#FFFFFF', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <button
          onClick={onPrevMonth}
          onMouseEnter={() => setPrevHover(true)}
          onMouseLeave={() => setPrevHover(false)}
          style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: prevHover ? '#F5F5F5' : 'transparent', transition: 'background-color 0.15s' }}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 14, color: '#808285' }} />
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#000000' }}>
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          onClick={onNextMonth}
          onMouseEnter={() => setNextHover(true)}
          onMouseLeave={() => setNextHover(false)}
          style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: nextHover ? '#F5F5F5' : 'transparent', transition: 'background-color 0.15s' }}
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14, color: '#808285' }} />
        </button>
      </div>
      <div className="grid grid-cols-7" style={{ gap: 4 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ paddingBottom: 8, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#808285' }}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          return <MonthDayCell key={i} date={d} citas={citas} selectedDate={selectedDate} onDayClick={onDayClick} />;
        })}
      </div>
    </div>
  );
}

function MonthDayCell({
  date,
  citas,
  selectedDate,
  onDayClick,
}: {
  date: Date;
  citas: Cita[];
  selectedDate: Date;
  onDayClick: (d: Date) => void;
}) {
  const [hover, setHover] = useState(false);
  const ds = formatDate(date);
  const dayCitas = getCitasForDate(citas, ds);
  const isSel = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, new Date());

  return (
    <button
      onClick={() => onDayClick(date)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minHeight: 80,
        padding: 8,
        textAlign: 'left',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isSel ? 'rgba(220,2,2,0.05)' : hover ? '#F5F5F5' : 'transparent',
        boxShadow: isSel ? 'inset 0 0 0 2px #DC0202' : 'none',
        transition: 'background-color 0.15s',
      }}
    >
      <div style={{ marginBottom: 4, fontSize: 14, fontWeight: 700, color: isToday ? '#DC0202' : '#000000' }}>
        {date.getDate()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dayCitas.slice(0, 3).map((c) => {
          const ui = ESTADO_UI[c.estadoKey];
          return (
            <div
              key={c.id}
              className="flex items-center"
              style={{
                gap: 4,
                borderRadius: 4,
                borderLeft: `3px solid ${ui.color}`,
                backgroundColor: '#FFFFFF',
                padding: '2px 4px',
                fontSize: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontWeight: 600, color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nmeropo}</span>
            </div>
          );
        })}
        {dayCitas.length > 3 && (
          <div style={{ fontSize: 10, color: '#808285' }}>+{dayCitas.length - 3}</div>
        )}
      </div>
    </button>
  );
}
