import { useState, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useToast } from '@/kit/componentes/Toast/Toast';
import {
  citasAtom,
  docksAtom,
  transportistasAtom,
  currentUserAtom,
  activeAlmacenIdAtom,
} from '@/lib/store';
import { ESTADOS, ROLE_PERMISSIONS } from '@/lib/constants';
import type { Cita, CitaInput } from '@/lib/types';
import { getCitasForDate } from '@/lib/cita-utils';
import { generateSignedToken } from '@/lib/qr';
import { formatDate, startOfWeek, addDays, type ViewMode } from './utils';
import {
  faCalendarCheck,
  faClock,
  faChartLine,
  faCircleCheck,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

export function useCitas() {
  const toast = useToast();
  const [allCitas, setCitas] = useAtom(citasAtom);
  const allDocks = useAtomValue(docksAtom);
  const activeAlmacenId = useAtomValue(activeAlmacenIdAtom);
  const citas = allCitas.filter((c) => c.almacenId === activeAlmacenId);
  const docks = allDocks.filter((d) => d.almacenId === activeAlmacenId);
  const transportistas = useAtomValue(transportistasAtom);
  const currentUser = useAtomValue(currentUserAtom)!;
  const perms = ROLE_PERMISSIONS[currentUser.role];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [qrDialogCita, setQrDialogCita] = useState<Cita | null>(null);
  const [showScheduleShare, setShowScheduleShare] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const dateStr = formatDate(selectedDate);
  const dayCitas = getCitasForDate(citas, dateStr);

  const filteredDayCitas = useMemo(() => {
    if (!search) return dayCitas;
    const q = search.toLowerCase();
    return dayCitas.filter(
      (c) =>
        c.nmeropo.toLowerCase().includes(q) ||
        c.transportista.nombrecompaa.toLowerCase().includes(q) ||
        c.numerocaja.toLowerCase().includes(q) ||
        c.nombreconductor?.toLowerCase().includes(q),
    );
  }, [dayCitas, search]);

  const stats = {
    total: dayCitas.length,
    programadas: dayCitas.filter((c) => c.estadoKey === 0).length,
    enProceso: dayCitas.filter((c) => [1, 7, 8, 2].includes(c.estadoKey)).length,
    finalizadas: dayCitas.filter((c) => c.estadoKey === 3).length,
    salidas: dayCitas.filter((c) => c.estadoKey === 6).length,
  };

  const summaryCards = [
    { label: 'Total',        value: stats.total,       icon: faCalendarCheck, color: '#DC0202' },
    { label: 'Programadas',  value: stats.programadas, icon: faClock,          color: '#02B3E1' },
    { label: 'En Proceso',   value: stats.enProceso,   icon: faChartLine,       color: '#D4A017' },
    { label: 'Finalizadas',  value: stats.finalizadas, icon: faCircleCheck,     color: '#6ABF4B' },
    { label: 'Salidas',      value: stats.salidas,     icon: faRightFromBracket, color: '#6B7280' },
  ];

  const weekStart = startOfWeek(selectedDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleCreateCita = async (input: CitaInput) => {
    const transportista = transportistas.find((t) => t.id === input.transportistaId);
    const dock = docks.find((d) => d.id === input.dockId);
    if (!transportista || !dock) {
      toast.validationError('Transportista o Dock no válido');
      return;
    }

    const newCita: Cita = {
      id: `c${Date.now()}`,
      nmeropo: input.nmeropo,
      almacenId: dock.almacenId,
      dock: { id: dock.id, nombredock: dock.nombredock },
      transportista: {
        id: transportista.id,
        nombrecompaa: transportista.nombrecompaa,
        emailcontacto: transportista.emailcontacto,
      },
      creadopor: { id: currentUser.id, nombrecompleto: currentUser.nombrecompleto },
      estadoKey: 0,
      fechaprogramada: input.fecha,
      inicioventana: input.horaInicio,
      finventana: input.horaFin,
      numerocaja: input.numerocaja,
      nombreconductor: input.nombreconductor,
      placascamin: input.placascamin,
      mercanca: input.mercanca,
      notas: input.notas,
      islate: false,
      historial: [
        {
          estadoKey: 0,
          estadoNombre: ESTADOS[0].nombre,
          timestamp: new Date().toISOString(),
          usuarioNombre: currentUser.nombrecompleto,
        },
      ],
    };

    const token = await generateSignedToken(newCita);
    newCita.qrToken = token;

    setCitas((prev) => [...prev, newCita]);
    setShowCreate(false);
    setQrDialogCita(newCita);
    toast.success('Cita creada exitosamente');
  };

  return {
    citas,
    docks,
    transportistas,
    currentUser,
    perms,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    search,
    setSearch,
    showCreate,
    setShowCreate,
    qrDialogCita,
    setQrDialogCita,
    showScheduleShare,
    setShowScheduleShare,
    calendarMonth,
    setCalendarMonth,
    dateStr,
    dayCitas,
    filteredDayCitas,
    summaryCards,
    weekDates,
    handleCreateCita,
  };
}
