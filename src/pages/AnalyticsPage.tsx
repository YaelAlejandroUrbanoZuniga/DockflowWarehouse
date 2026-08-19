import { useState, useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faMapMarkerAlt,
  faDollarSign,
  faCalendarDays,
  faChartBar,
  faChartLine,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { citasActivasAtom, transportistasAtom, docksActivosAtom } from '@/lib/store';
import { SectionHeader } from '@/components/SectionHeader';
import { getDetentionInfo, formatDuration } from '@/lib/cita-utils';
import { TarjetaKPI } from '@/kit/componentes/TarjetaKPI/TarjetaKPI';
import { Tarjeta } from '@/kit/componentes/Tarjeta/Tarjeta';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useTableSort, sortIcon } from '@/kit/hooks/useTableSort';
import type { SortableValue, SortDirection } from '@/kit/hooks/useTableSort';

type RangeMode = 'dia' | 'semana' | 'mes' | 'personalizado';

export function AnalyticsPage() {
  const toast = useToast();
  const citas = useAtomValue(citasActivasAtom);
  const transportistas = useAtomValue(transportistasAtom);
  const docks = useAtomValue(docksActivosAtom);
  const reduceMotion = useReducedMotion();
  const [range, setRange] = useState<RangeMode>('semana');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59);
    let start = new Date(now);
    start.setHours(0, 0, 0);
    if (range === 'semana') start.setDate(start.getDate() - 7);
    if (range === 'mes') start.setMonth(start.getMonth() - 1);
    if (range === 'personalizado' && customStart) {
      start = new Date(customStart);
      if (customEnd) end.setTime(new Date(customEnd).getTime() + 86400000);
    }
    return { startDate: start, endDate: end };
  }, [range, customStart, customEnd]);

  const filteredCitas = useMemo(() => {
    return citas.filter((c) => {
      const cd = new Date(c.fechaprogramada);
      if (cd < startDate || cd > endDate) return false;
      if (carrierFilter !== 'all' && c.transportista.id !== carrierFilter) return false;
      return true;
    });
  }, [citas, startDate, endDate, carrierFilter]);

  const kpis = useMemo(() => {
    const total = filteredCitas.length;
    const onTime = filteredCitas.filter((c) => !c.islate).length;
    const onTimePct = total > 0 ? Math.round((onTime / total) * 100) : 0;
    const descargas = filteredCitas.filter((c) => c.actualstarttime && c.actualendtime);
    const avgDescarga = descargas.length > 0
      ? Math.round(descargas.reduce((acc, c) => {
          const det = getDetentionInfo(c, transportistas.find((t) => t.id === c.transportista.id));
          return acc + det.totalMinutes;
        }, 0) / descargas.length)
      : 0;
    const esperaCitas = filteredCitas.filter((c) => c.autorizacionTimestamp);
    const avgEspera = esperaCitas.length > 0
      ? Math.round(esperaCitas.reduce((acc, c) => {
          const start = new Date(c.actualstarttime || c.autorizacionTimestamp!).getTime();
          const end = new Date(c.autorizacionTimestamp!).getTime();
          return acc + Math.max(0, Math.round((end - start) / 60000));
        }, 0) / esperaCitas.length)
      : 0;
    const cancelled = filteredCitas.filter((c) => c.estadoKey === 5).length;
    const cancelPct = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    return { total, onTimePct, avgDescarga, avgEspera, cancelPct };
  }, [filteredCitas, transportistas]);

  const byCarrier = useMemo(() => {
    return transportistas.map((t) => {
      const tCitas = filteredCitas.filter((c) => c.transportista.id === t.id);
      const onTime = tCitas.filter((c) => !c.islate).length;
      const onTimePct = tCitas.length > 0 ? Math.round((onTime / tCitas.length) * 100) : 0;
      const cancelled = tCitas.filter((c) => c.estadoKey === 5).length;
      const detentions = tCitas
        .filter((c) => c.actualstarttime)
        .map((c) => getDetentionInfo(c, t))
        .reduce((acc, d) => ({ charge: acc.charge + d.charge, mins: acc.mins + d.billableMinutes }), { charge: 0, mins: 0 });
      return {
        ...t,
        totalCitas: tCitas.length,
        onTimePct,
        cancelled,
        detentionCharge: detentions.charge,
        detentionMins: detentions.mins,
      };
    });
  }, [filteredCitas, transportistas]);

  const byDock = useMemo(() => {
    return docks.map((d) => {
      const dCitas = filteredCitas.filter((c) => c.dock.id === d.id);
      const finalized = dCitas.filter((c) => c.estadoKey === 3).length;
      const avgTime = dCitas.filter((c) => c.actualstarttime && c.actualendtime);
      const avg = avgTime.length > 0
        ? Math.round(avgTime.reduce((acc, c) => acc + getDetentionInfo(c).totalMinutes, 0) / avgTime.length)
        : 0;
      return { ...d, total: dCitas.length, finalized, avgTime: avg };
    });
  }, [filteredCitas, docks]);

  const dailyTrend = useMemo(() => {
    const map: Record<string, { date: string; total: number; finalized: number; delayed: number }> = {};
    filteredCitas.forEach((c) => {
      const d = c.fechaprogramada;
      if (!map[d]) map[d] = { date: d, total: 0, finalized: 0, delayed: 0 };
      map[d].total++;
      if (c.estadoKey === 3) map[d].finalized++;
      if (c.islate || c.estadoKey === 4) map[d].delayed++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredCitas]);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => String(row[h])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const getCarrierValue = useCallback((row: typeof byCarrier[number], key: string): SortableValue => {
    switch (key) {
      case 'nombre': return row.nombrecompaa;
      case 'citas': return row.totalCitas;
      case 'ontime': return row.onTimePct;
      case 'cancel': return row.cancelled;
      default: return null;
    }
  }, []);

  const getDetentionValue = useCallback((row: typeof byCarrier[number], key: string): SortableValue => {
    switch (key) {
      case 'nombre': return row.nombrecompaa;
      case 'horas': return row.horasLibres;
      case 'tarifa': return row.tarifadetencion;
      case 'minfact': return row.detentionMins;
      case 'cargo': return row.detentionCharge;
      default: return null;
    }
  }, []);

  const carrierSort = useTableSort(byCarrier, getCarrierValue);
  const detentionSort = useTableSort(byCarrier, getDetentionValue);

  const kpiCards: { label: string; value: string | number; icon: IconDefinition; color: string }[] = [
    { label: 'Total Citas',  value: kpis.total,                     icon: faChartBar,     color: '#DC0202' },
    { label: 'On-Time %',    value: `${kpis.onTimePct}%`,           icon: faCircleCheck,  color: '#6ABF4B' },
    { label: 'Avg Descarga', value: formatDuration(kpis.avgDescarga), icon: faClock,       color: '#02B3E1' },
    { label: 'Avg Espera',   value: formatDuration(kpis.avgEspera), icon: faChartLine,    color: '#D4A017' },
    { label: 'Cancelación %',value: `${kpis.cancelPct}%`,           icon: faCircleXmark,  color: '#808285' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.1 }}>Analytics</h1>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#808285', margin: '4px 0 0' }}>Indicadores operativos y desempeño</p>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center" style={{ gap: 12, marginBottom: 24 }}>
        <RangeSelector value={range} onChange={setRange} />

        {range === 'personalizado' && (
          <div className="flex items-center" style={{ gap: 8 }}>
            <CampoTexto
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{ width: 150 }}
            />
            <span style={{ color: '#D1D3D4' }}>—</span>
            <CampoTexto
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{ width: 150 }}
            />
          </div>
        )}

        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #D1D3D4',
            borderRadius: 6,
            fontSize: 13,
            color: '#000000',
            outline: 'none',
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="all">Todos los transportistas</option>
          {transportistas.map((t) => (
            <option key={t.id} value={t.id}>{t.nombrecompaa}</option>
          ))}
        </select>
      </div>

      {/* KPI cards - 5 cards across */}
      <div className="grid grid-cols-3 sm:grid-cols-5" style={{ gap: 12, marginBottom: 24 }}>
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
          >
            <TarjetaKPI icon={kpi.icon} color={kpi.color} label={kpi.label} value={kpi.value} />
          </motion.div>
        ))}
      </div>

      {/* Por Transportista */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader
          icon={faTruck}
          title="Por Transportista"
          action={
            <ExportButton onClick={() => exportCSV(byCarrier as unknown as Record<string, unknown>[], 'por_transportista.csv')} />
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          <Tarjeta style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th align="left" sortKey="nombre" activeKey={carrierSort.sortKey} direction={carrierSort.sortDirection} onSort={carrierSort.toggleSort}>Transportista</Th>
                    <Th align="right" sortKey="citas" activeKey={carrierSort.sortKey} direction={carrierSort.sortDirection} onSort={carrierSort.toggleSort}>Citas</Th>
                    <Th align="right" sortKey="ontime" activeKey={carrierSort.sortKey} direction={carrierSort.sortDirection} onSort={carrierSort.toggleSort}>On-Time</Th>
                    <Th align="right" sortKey="cancel" activeKey={carrierSort.sortKey} direction={carrierSort.sortDirection} onSort={carrierSort.toggleSort}>Cancel.</Th>
                  </tr>
                </thead>
                <tbody>
                  {carrierSort.sortedRows.map((t) => (
                    <HoverRow key={t.id}>
                      <Td fontWeight={700}>{t.nombrecompaa}</Td>
                      <Td align="right" fontWeight={600}>{t.totalCitas}</Td>
                      <Td align="right" fontWeight={600}>{t.onTimePct}%</Td>
                      <Td align="right" fontWeight={600}>{t.cancelled}</Td>
                    </HoverRow>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
          <Tarjeta>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byCarrier} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                <XAxis dataKey="nombrecompaa" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="totalCitas" fill="#DC0202" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Tarjeta>
        </div>
      </div>

      {/* Por Dock */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader
          icon={faMapMarkerAlt}
          title="Por Dock"
          action={
            <ExportButton onClick={() => exportCSV(byDock as unknown as Record<string, unknown>[], 'por_dock.csv')} />
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            {byDock.map((d) => (
              <Tarjeta key={d.id}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#000000', marginBottom: 8 }}>{d.nombredock}</div>
                <DockStatRow label="Total" value={String(d.total)} />
                <DockStatRow label="Finalizadas" value={String(d.finalized)} valueColor="#6ABF4B" />
                <DockStatRow label="Avg tiempo" value={formatDuration(d.avgTime)} />
              </Tarjeta>
            ))}
          </div>
          <Tarjeta>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byDock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                <XAxis dataKey="nombredock" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#02B3E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="finalized" fill="#6ABF4B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Tarjeta>
        </div>
      </div>

      {/* Tendencia Diaria */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader
          icon={faCalendarDays}
          title="Tendencia Diaria"
          action={
            <ExportButton onClick={() => exportCSV(dailyTrend as unknown as Record<string, unknown>[], 'tendencia_diaria.csv')} />
          }
        />
        <Tarjeta>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#DC0202" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="finalized" stroke="#6ABF4B" strokeWidth={2} name="Finalizadas" />
              <Line type="monotone" dataKey="delayed" stroke="#D4A017" strokeWidth={2} name="Retrasadas" />
            </LineChart>
          </ResponsiveContainer>
        </Tarjeta>
      </div>

      {/* Detención y Cargos */}
      <div>
        <SectionHeader
          icon={faDollarSign}
          title="Detención y Cargos"
          subtitle="Cálculo de tiempos de detención facturables"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          <Tarjeta style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th align="left" sortKey="nombre" activeKey={detentionSort.sortKey} direction={detentionSort.sortDirection} onSort={detentionSort.toggleSort}>Transportista</Th>
                    <Th align="right" sortKey="horas" activeKey={detentionSort.sortKey} direction={detentionSort.sortDirection} onSort={detentionSort.toggleSort}>Hrs Libres</Th>
                    <Th align="right" sortKey="tarifa" activeKey={detentionSort.sortKey} direction={detentionSort.sortDirection} onSort={detentionSort.toggleSort}>Tarifa</Th>
                    <Th align="right" sortKey="minfact" activeKey={detentionSort.sortKey} direction={detentionSort.sortDirection} onSort={detentionSort.toggleSort}>Min Fact.</Th>
                    <Th align="right" sortKey="cargo" activeKey={detentionSort.sortKey} direction={detentionSort.sortDirection} onSort={detentionSort.toggleSort}>Cargo MXN</Th>
                  </tr>
                </thead>
                <tbody>
                  {detentionSort.sortedRows.map((t) => (
                    <HoverRow key={t.id}>
                      <Td fontWeight={700}>{t.nombrecompaa}</Td>
                      <Td align="right" fontWeight={600}>{t.horasLibres}h</Td>
                      <Td align="right" fontWeight={600}>${t.tarifadetencion}</Td>
                      <Td align="right" fontWeight={600}>{t.detentionMins}</Td>
                      <Td align="right" fontWeight={700} color="#DC0202">${t.detentionCharge.toFixed(0)}</Td>
                    </HoverRow>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
          <Tarjeta>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byCarrier}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                <XAxis dataKey="nombrecompaa" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="detentionCharge" fill="#D4A017" radius={[4, 4, 0, 0]} name="Cargo MXN" />
              </BarChart>
            </ResponsiveContainer>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

const RANGE_LABELS: Record<RangeMode, string> = {
  dia: 'Día',
  semana: 'Semana',
  mes: 'Mes',
  personalizado: 'Personalizado',
};

function RangeSelector({ value, onChange }: { value: RangeMode; onChange: (v: RangeMode) => void }) {
  return (
    <div className="flex" style={{ borderRadius: 8, backgroundColor: '#FFFFFF', padding: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {(['dia', 'semana', 'mes', 'personalizado'] as RangeMode[]).map((m) => (
        <RangeTab key={m} label={RANGE_LABELS[m]} active={value === m} onClick={() => onChange(m)} />
      ))}
    </div>
  );
}

function RangeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.12s, color 0.12s',
        backgroundColor: active ? '#DC0202' : (hover ? '#EEEEEE' : 'transparent'),
        color: active ? '#FFFFFF' : '#808285',
      }}
    >
      {label}
    </button>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        gap: 6,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#808285',
        border: '1px solid #D1D3D4',
        borderRadius: 6,
        backgroundColor: hover ? '#F5F5F5' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
      }}
    >
      <FontAwesomeIcon icon={faFileExport} style={{ fontSize: 11 }} />
      CSV
    </button>
  );
}

function Th({
  children,
  align = 'left',
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  sortKey?: string;
  activeKey?: string | null;
  direction?: SortDirection;
  onSort?: (key: string) => void;
}) {
  const ordenable = Boolean(sortKey);
  const info = ordenable ? sortIcon(sortKey!, activeKey ?? null, direction ?? null) : null;
  return (
    <th
      onClick={ordenable ? () => onSort!(sortKey!) : undefined}
      style={{
        padding: '12px 16px',
        textAlign: align,
        fontSize: 13,
        fontWeight: 700,
        color: '#000000',
        backgroundColor: activeKey === sortKey ? '#EEEEEE' : '#F7F7F7',
        borderBottom: '0.5px solid #D1D3D4',
        cursor: ordenable ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="flex items-center" style={{ gap: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {children}
        {info && <FontAwesomeIcon icon={info.icon} style={{ fontSize: 10, color: info.color }} />}
      </span>
    </th>
  );
}

function HoverRow({ children }: { children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: hover ? '#F5F5F5' : undefined, transition: 'background-color 0.12s' }}
    >
      {children}
    </tr>
  );
}

function Td({
  children,
  align = 'left',
  fontWeight,
  color,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  fontWeight?: number;
  color?: string;
}) {
  return (
    <td style={{
      padding: '10px 16px',
      textAlign: align,
      fontSize: 13,
      fontWeight: fontWeight ?? 400,
      color: color ?? '#000000',
      borderBottom: '1px solid #EEEEEE',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </td>
  );
}

function DockStatRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between" style={{ fontSize: 12, marginBottom: 4 }}>
      <span style={{ color: '#808285' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? '#000000' }}>{value}</span>
    </div>
  );
}
