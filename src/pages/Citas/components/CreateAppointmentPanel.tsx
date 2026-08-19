import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { ModalHeader } from '@/kit/componentes/ModalHeader/ModalHeader';
import { ContenedorScroll } from '@/kit/componentes/ContenedorScroll/ContenedorScroll';
import { Boton } from '@/kit/componentes/Boton/Boton';
import type { Cita, CitaInput } from '@/lib/types';
import { CreateFormFields } from './CreateFormFields';

export function CreateAppointmentPanel({
  docks,
  transportistas,
  citas,
  selectedDate,
  onClose,
  onCreate,
}: {
  docks: { id: string; nombredock: string }[];
  transportistas: { id: string; nombrecompaa: string }[];
  citas: Cita[];
  selectedDate: string;
  onClose: () => void;
  onCreate: (input: CitaInput) => void;
}) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const [form, setForm] = useState<CitaInput>({
    nmeropo: '',
    numerocaja: '',
    transportistaId: '',
    dockId: '',
    fecha: selectedDate,
    horaInicio: '08:00',
    horaFin: '09:00',
    nombreconductor: '',
    placascamin: '',
    sello: '',
    mercanca: '',
    notas: '',
  });

  const handleHoraInicio = (val: string) => {
    const [h, m] = val.split(':').map(Number);
    const endH = h + 1;
    const endVal = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setForm((prev) => ({ ...prev, horaInicio: val, horaFin: endVal }));
  };

  const occupiedSlots = docks.map((dock) => {
    const dockCitas = citas.filter(
      (c) => c.dock.id === dock.id && c.fechaprogramada === form.fecha,
    );
    return { dockId: dock.id, slots: dockCitas };
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.nmeropo || !form.numerocaja || !form.transportistaId || !form.dockId) {
      toast.validationError('Complete los campos requeridos');
      return;
    }

    const now = new Date();
    const citaDateTime = new Date(`${form.fecha}T${form.horaInicio}`);
    if (citaDateTime < now) {
      toast.validationError('No se pueden crear citas en el pasado');
      return;
    }

    const overlap = citas.find(
      (c) =>
        c.dock.id === form.dockId &&
        c.fechaprogramada === form.fecha &&
        c.estadoKey !== 5 &&
        form.horaInicio < c.finventana &&
        form.horaFin > c.inicioventana,
    );
    if (overlap) {
      toast.validationError(
        `Conflicto de horario: ya existe una cita en ${overlap.dock.nombredock} de ${overlap.inicioventana} a ${overlap.finventana}`,
      );
      return;
    }

    onCreate(form);
  };

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 40, backgroundColor: 'rgba(0,0,0,0.30)' }}
        onClick={onClose}
      />
      <motion.div
        initial={reduceMotion ? false : { x: '100%' }}
        animate={{ x: 0 }}
        exit={reduceMotion ? undefined : { x: '100%' }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 flex flex-col"
        style={{ zIndex: 50, height: '100vh', width: '100%', maxWidth: 448, backgroundColor: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        <ModalHeader title="Nueva Cita" accentColor="#DC0202" onClose={onClose} rounded={false} />

        <ContenedorScroll maxHeight="75vh" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
            <CreateFormFields
              form={form}
              setForm={setForm}
              docks={docks}
              transportistas={transportistas}
              citas={citas}
              occupiedSlots={occupiedSlots}
              onHoraInicio={handleHoraInicio}
            />
          </form>
        </ContenedorScroll>

        <div style={{ borderTop: '1px solid #E0E0E0', padding: 16 }}>
          <div className="flex justify-end" style={{ gap: 8 }}>
            <Boton variante="secundario" onClick={onClose}>
              Cancelar
            </Boton>
            <Boton onClick={() => handleSubmit()}>
              Crear Cita
            </Boton>
          </div>
        </div>
      </motion.div>
    </>
  );
}
