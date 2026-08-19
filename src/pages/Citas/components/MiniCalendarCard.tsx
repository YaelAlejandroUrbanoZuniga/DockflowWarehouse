import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import type { Cita } from '@/lib/types';
import { formatDate, isSameDay, addDays, WEEKDAYS, MONTHS } from '../utils';

export function MiniCalendarCard({
  calendarMonth,
  setCalendarMonth,
  selectedDate,
  citas,
  onDateClick,
  search,
  setSearch,
}: {
  calendarMonth: Date;
  setCalendarMonth: (d: Date) => void;
  selectedDate: Date;
  citas: Cita[];
  onDateClick: (d: Date) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const [clearHover, setClearHover] = useState(false);

  return (
    <Tarjeta style={{ width: 320 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
          {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
        </span>
        <div className="flex" style={{ gap: 4 }}>
          <button
            onClick={() => setCalendarMonth(addDays(calendarMonth, -30))}
            onMouseEnter={() => setPrevHover(true)}
            onMouseLeave={() => setPrevHover(false)}
            style={{ padding: 4, border: 'none', borderRadius: 4, cursor: 'pointer', color: '#808285', backgroundColor: prevHover ? '#F5F5F5' : 'transparent', transition: 'background-color 0.15s' }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 14 }} />
          </button>
          <button
            onClick={() => setCalendarMonth(addDays(calendarMonth, 30))}
            onMouseEnter={() => setNextHover(true)}
            onMouseLeave={() => setNextHover(false)}
            style={{ padding: 4, border: 'none', borderRadius: 4, cursor: 'pointer', color: '#808285', backgroundColor: nextHover ? '#F5F5F5' : 'transparent', transition: 'background-color 0.15s' }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>
      <MiniCalendar
        month={calendarMonth}
        selectedDate={selectedDate}
        citas={citas}
        onDateClick={onDateClick}
      />
      <div className="relative" style={{ marginTop: 12 }}>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={{ fontSize: 14, color: '#808285', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cita..."
          style={{
            width: '100%',
            paddingLeft: 36,
            paddingRight: search ? 34 : 16,
            paddingTop: 8,
            paddingBottom: 8,
            border: '1px solid #E0E0E0',
            borderRadius: 6,
            fontSize: 13,
            color: '#000000',
            backgroundColor: '#FFFFFF',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            onMouseEnter={() => setClearHover(true)}
            onMouseLeave={() => setClearHover(false)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: clearHover ? '#000000' : '#808285', transition: 'color 0.15s' }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
          </button>
        )}
      </div>
    </Tarjeta>
  );
}

function MiniCalendar({
  month,
  selectedDate,
  citas,
  onDateClick,
}: {
  month: Date;
  selectedDate: Date;
  citas: Cita[];
  onDateClick: (d: Date) => void;
}) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }

  return (
    <div className="grid grid-cols-7" style={{ gap: 4, textAlign: 'center' }}>
      {WEEKDAYS.map((w) => (
        <div key={w} style={{ fontSize: 10, fontWeight: 600, color: '#808285' }}>
          {w}
        </div>
      ))}
      {cells.map((d, i) => {
        if (!d) return <div key={i} />;
        return <MiniDayButton key={i} date={d} citas={citas} selectedDate={selectedDate} onDateClick={onDateClick} />;
      })}
    </div>
  );
}

function MiniDayButton({
  date,
  citas,
  selectedDate,
  onDateClick,
}: {
  date: Date;
  citas: Cita[];
  selectedDate: Date;
  onDateClick: (d: Date) => void;
}) {
  const [hover, setHover] = useState(false);
  const ds = formatDate(date);
  const hasCitas = citas.some((c) => c.fechaprogramada === ds);
  const isSelected = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, new Date());

  return (
    <button
      onClick={() => onDateClick(date)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative"
      style={{
        aspectRatio: '1',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: isSelected ? '#DC0202' : hover ? '#F5F5F5' : 'transparent',
        color: isSelected ? '#FFFFFF' : '#000000',
        boxShadow: isToday && !isSelected ? 'inset 0 0 0 1px #DC0202' : 'none',
        transition: 'background-color 0.15s',
      }}
    >
      {date.getDate()}
      {hasCitas && (
        <span
          className="absolute"
          style={{ bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#FFFFFF' : '#DC0202' }}
        />
      )}
    </button>
  );
}
