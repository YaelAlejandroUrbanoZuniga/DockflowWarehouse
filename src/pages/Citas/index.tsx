import { AnimatePresence, useReducedMotion } from 'motion/react';
import { QRSuccessDialog } from '@/components/QRSuccessDialog';
import { ScheduleShareDialog } from '@/components/ScheduleShareDialog';
import { useCitas } from './useCitas';
import { addDays } from './utils';
import { CitasHeader } from './components/CitasHeader';
import { MiniCalendarCard } from './components/MiniCalendarCard';
import { ViewToggle } from './components/ViewToggle';
import { DayCalendarView } from './components/DayCalendarView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';
import { CreateAppointmentPanel } from './components/CreateAppointmentPanel';

export function CitasPage() {
  const reduceMotion = useReducedMotion();
  const ctx = useCitas();

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <CitasHeader
        selectedDate={ctx.selectedDate}
        summaryCards={ctx.summaryCards}
        canCreate={ctx.perms.canCreateCitas}
        onShare={() => ctx.setShowScheduleShare(true)}
        onCreate={() => ctx.setShowCreate(true)}
      />

      <div className="flex flex-col lg:flex-row" style={{ marginBottom: 24, gap: 16 }}>
        <MiniCalendarCard
          calendarMonth={ctx.calendarMonth}
          setCalendarMonth={ctx.setCalendarMonth}
          selectedDate={ctx.selectedDate}
          citas={ctx.citas}
          onDateClick={(d) => ctx.setSelectedDate(d)}
          search={ctx.search}
          setSearch={ctx.setSearch}
        />
      </div>

      <ViewToggle
        viewMode={ctx.viewMode}
        setViewMode={ctx.setViewMode}
        selectedDate={ctx.selectedDate}
        setSelectedDate={ctx.setSelectedDate}
      />

      {ctx.viewMode === 'day' && (
        <DayCalendarView
          citas={ctx.filteredDayCitas}
          docks={ctx.docks}
          dateStr={ctx.dateStr}
        />
      )}

      {ctx.viewMode === 'week' && (
        <WeekView
          weekDates={ctx.weekDates}
          citas={ctx.citas}
          selectedDate={ctx.selectedDate}
          onDayClick={(d) => {
            ctx.setSelectedDate(d);
            ctx.setViewMode('day');
          }}
        />
      )}

      {ctx.viewMode === 'month' && (
        <MonthView
          month={ctx.calendarMonth}
          citas={ctx.citas}
          selectedDate={ctx.selectedDate}
          onDayClick={(d) => {
            ctx.setSelectedDate(d);
            ctx.setViewMode('day');
          }}
          onPrevMonth={() => ctx.setCalendarMonth(addDays(ctx.calendarMonth, -30))}
          onNextMonth={() => ctx.setCalendarMonth(addDays(ctx.calendarMonth, 30))}
        />
      )}

      <AnimatePresence initial={reduceMotion ? false : undefined}>
        {ctx.showCreate && (
          <CreateAppointmentPanel
            docks={ctx.docks}
            transportistas={ctx.transportistas}
            citas={ctx.citas}
            selectedDate={ctx.dateStr}
            onClose={() => ctx.setShowCreate(false)}
            onCreate={ctx.handleCreateCita}
          />
        )}
      </AnimatePresence>

      <QRSuccessDialog
        cita={ctx.qrDialogCita}
        open={!!ctx.qrDialogCita}
        onOpenChange={(v) => !v && ctx.setQrDialogCita(null)}
      />

      <ScheduleShareDialog
        citas={ctx.dayCitas}
        transportistas={ctx.transportistas}
        open={ctx.showScheduleShare}
        onOpenChange={ctx.setShowScheduleShare}
        dateLabel={ctx.selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
      />
    </div>
  );
}
