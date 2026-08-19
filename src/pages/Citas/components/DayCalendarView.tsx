import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import { TIME_SLOTS } from '@/lib/constants';
import type { Cita } from '@/lib/types';
import { CitaStatusCard } from '@/components/CitaStatusCard';

export function DayCalendarView({
  citas,
  docks,
  dateStr,
}: {
  citas: Cita[];
  docks: { id: string; nombredock: string }[];
  dateStr: string;
}) {
  void dateStr;
  const [expanded, setExpanded] = useState(false);
  const [expandHover, setExpandHover] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nowSlotIdx = TIME_SLOTS.findIndex((s, i) => {
    const next = TIME_SLOTS[i + 1];
    return nowStr >= s && (!next || nowStr < next);
  });
  const slotHeight = 48;
  const headerOffset = 52;
  const nowTop = nowSlotIdx >= 0 ? headerOffset + nowSlotIdx * slotHeight + slotHeight / 2 : -1;

  const nowLine = nowSlotIdx >= 0 ? (
    <div
      className="pointer-events-none absolute left-0 right-0 flex items-center"
      style={{ top: nowTop, zIndex: 10 }}
    >
      <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#DC0202', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      <div style={{ marginLeft: 2, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#FFFFFF', borderRadius: 4, backgroundColor: '#DC0202', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        {nowStr}
      </div>
      <div style={{ height: 2, flex: 1, backgroundColor: '#DC0202' }} />
    </div>
  ) : null;

  const grid = (
    <div className="relative">
      {nowLine}
      <div className="grid" style={{ gridTemplateColumns: `60px repeat(${docks.length}, 1fr)` }}>
        <div style={{ padding: 12, borderBottom: '2px solid #E0E0E0', backgroundColor: '#F7F7F7' }} />
        {docks.map((d) => (
          <div key={d.id} className="flex items-center justify-center" style={{ padding: 12, borderBottom: '2px solid #E0E0E0', borderLeft: '1px solid #E0E0E0', backgroundColor: '#F7F7F7', gap: 6 }}>
            <FontAwesomeIcon icon={faTruck} style={{ fontSize: 14, color: '#02B3E1' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.nombredock}</span>
          </div>
        ))}

        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="contents">
            <div style={{ padding: 8, borderBottom: '1px solid #F0F0F0', backgroundColor: '#F7F7F7', fontSize: 12, fontWeight: 700, color: '#808285' }}>
              {slot}
            </div>
            {docks.map((dock) => {
              const slotCitas = citas.filter(
                (c) =>
                  c.dock.id === dock.id &&
                  c.inicioventana <= slot &&
                  c.finventana > slot,
              );
              return (
                <div
                  key={dock.id + slot}
                  style={{ minHeight: 48, borderBottom: '1px solid #F5F5F5', borderLeft: '1px solid #F5F5F5', padding: 4 }}
                >
                  {slotCitas.map((c) => (
                    <CitaStatusCard key={c.id} cita={c} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (scrollRef.current && nowTop > 0) {
      scrollRef.current.scrollTop = Math.max(0, nowTop - 200);
    }
  }, [nowTop, expanded]);

  if (expanded) {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ zIndex: 50, backgroundColor: '#FFFFFF', padding: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', margin: 0 }}>Schedule de Docks - Vista Completa</h2>
          <button
            onClick={() => setExpanded(false)}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            className="flex items-center"
            style={{ gap: 8, padding: '8px 16px', borderRadius: 6, backgroundColor: closeHover ? '#EEEEEE' : '#F5F5F5', color: '#000000', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background-color 0.15s' }}
          >
            <FontAwesomeIcon icon={faCompress} style={{ fontSize: 14 }} />
            Cerrar
          </button>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', borderRadius: 8, backgroundColor: '#FFFFFF' }}>
          {grid}
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 8, backgroundColor: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div className="flex justify-end" style={{ borderBottom: '1px solid #F0F0F0', padding: '8px 12px' }}>
        <button
          onClick={() => setExpanded(true)}
          onMouseEnter={() => setExpandHover(true)}
          onMouseLeave={() => setExpandHover(false)}
          className="flex items-center"
          style={{ gap: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: expandHover ? '#000000' : '#808285', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >
          <FontAwesomeIcon icon={faExpand} style={{ fontSize: 12 }} />
          Expandir
        </button>
      </div>
      <div ref={scrollRef} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {grid}
      </div>
    </div>
  );
}
