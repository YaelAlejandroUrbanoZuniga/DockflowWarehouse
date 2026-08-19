import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { TIME_SLOTS } from '@/lib/constants';
import { CampoTexto } from '@/kit/componentes/CampoTexto/CampoTexto';
import type { Cita, CitaInput } from '@/lib/types';
import { DockAvailability } from './DockAvailability';

const SELECT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #D1D3D4',
  borderRadius: 6,
  fontSize: 13,
  color: '#000000',
  outline: 'none',
  boxSizing: 'border-box' as const,
  backgroundColor: '#FFFFFF',
};

export function CreateFormFields({
  form,
  setForm,
  docks,
  transportistas,
  citas,
  occupiedSlots,
  onHoraInicio,
}: {
  form: CitaInput;
  setForm: React.Dispatch<React.SetStateAction<CitaInput>>;
  docks: { id: string; nombredock: string }[];
  transportistas: { id: string; nombrecompaa: string }[];
  citas: Cita[];
  occupiedSlots: { dockId: string; slots: Cita[] }[];
  onHoraInicio: (val: string) => void;
}) {
  const suggestion = useMemo(() => {
    if (!form.dockId || !form.fecha) return null;
    const dockCitas = citas.filter(
      (c) => c.dock.id === form.dockId && c.fechaprogramada === form.fecha,
    );
    const hourSlots = Array.from({ length: 24 }, (_, h) =>
      `${String(h).padStart(2, '0')}:00`,
    );
    for (const slot of hourSlots) {
      const [h] = slot.split(':').map(Number);
      if (h >= 22) break;
      const slotEnd = `${String(h + 1).padStart(2, '0')}:00`;
      const blocked = dockCitas.some(
        (c) => c.inicioventana < slotEnd && c.finventana > slot,
      );
      if (!blocked) return { start: slot, end: slotEnd };
    }
    return null;
  }, [form.dockId, form.fecha, citas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel label="Número PO" required />
        <CampoTexto
          value={form.nmeropo}
          onChange={(e) => setForm({ ...form, nmeropo: e.target.value })}
          placeholder="PO-2024-XXXX"
          required
        />
      </div>

      <div>
        <FieldLabel label="Número de Caja" required />
        <CampoTexto
          value={form.numerocaja}
          onChange={(e) => setForm({ ...form, numerocaja: e.target.value })}
          placeholder="CAJA-XXX"
          required
        />
      </div>

      <div>
        <FieldLabel label="Transportista" required />
        <select
          value={form.transportistaId}
          onChange={(e) => setForm({ ...form, transportistaId: e.target.value })}
          style={SELECT_STYLE}
          required
        >
          <option value="">Seleccionar...</option>
          {transportistas.map((t) => (
            <option key={t.id} value={t.id}>{t.nombrecompaa}</option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel label="Dock" required />
        <select
          value={form.dockId}
          onChange={(e) => setForm({ ...form, dockId: e.target.value })}
          style={SELECT_STYLE}
          required
        >
          <option value="">Seleccionar...</option>
          {docks.map((d) => (
            <option key={d.id} value={d.id}>{d.nombredock}</option>
          ))}
        </select>

        {form.dockId && form.fecha && (
          <div className="flex items-center" style={{ marginTop: 8, gap: 8, padding: 8, borderRadius: 6, backgroundColor: 'rgba(106,191,75,0.08)', color: '#6ABF4B', fontSize: 12 }}>
            <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: 12, flexShrink: 0 }} />
            {suggestion ? (
              <>
                Horario sugerido:{' '}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      horaInicio: suggestion.start,
                      horaFin: suggestion.end,
                    }))
                  }
                  style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
                >
                  {suggestion.start} – {suggestion.end}
                </button>
              </>
            ) : (
              <span>No hay horarios disponibles para este dock en la fecha seleccionada.</span>
            )}
          </div>
        )}

        {form.fecha && (
          <DockAvailability
            docks={docks}
            occupiedSlots={occupiedSlots}
            selectedDockId={form.dockId}
          />
        )}
      </div>

      <div>
        <FieldLabel label="Fecha" required />
        <CampoTexto
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2" style={{ gap: 12 }}>
        <div>
          <FieldLabel label="Hora inicio" required />
          <CampoTexto
            list="time-slots"
            value={form.horaInicio}
            onChange={(e) => onHoraInicio(e.target.value)}
            required
          />
          <datalist id="time-slots">
            {TIME_SLOTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <FieldLabel label="Hora fin" required />
          <CampoTexto
            list="time-slots"
            value={form.horaFin}
            onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center" style={{ gap: 8, padding: 8, borderRadius: 6, backgroundColor: 'rgba(2,179,225,0.08)', color: '#02B3E1', fontSize: 12 }}>
        <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 12 }} />
        Duración: {form.horaFin} - {form.horaInicio} (
        {(() => {
          const [sh, sm] = form.horaInicio.split(':').map(Number);
          const [eh, em] = form.horaFin.split(':').map(Number);
          const mins = (eh * 60 + em) - (sh * 60 + sm);
          return `${mins} min`;
        })()})
      </div>

      <div>
        <FieldLabel label="Conductor (opcional)" />
        <CampoTexto
          value={form.nombreconductor}
          onChange={(e) => setForm({ ...form, nombreconductor: e.target.value })}
          placeholder="Nombre del conductor"
        />
      </div>

      <div>
        <FieldLabel label="Placas (opcional)" />
        <CampoTexto
          value={form.placascamin}
          onChange={(e) => setForm({ ...form, placascamin: e.target.value })}
          placeholder="Placas del camión"
        />
      </div>

      <div>
        <FieldLabel label="Sello (opcional)" />
        <CampoTexto
          value={form.sello}
          onChange={(e) => setForm({ ...form, sello: e.target.value })}
          placeholder="Número de sello"
        />
      </div>

      <div>
        <FieldLabel label="Mercancía (opcional)" />
        <CampoTexto
          value={form.mercanca}
          onChange={(e) => setForm({ ...form, mercanca: e.target.value })}
          placeholder="Tipo de mercancía"
        />
      </div>

      <div>
        <FieldLabel label="Notas (opcional)" />
        <textarea
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          placeholder="Notas adicionales"
          rows={2}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #D1D3D4',
            borderRadius: 6,
            fontSize: 13,
            color: '#000000',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#484848', marginBottom: 4 }}>
      {label} {required && <span style={{ color: '#DC0202' }}>*</span>}
    </label>
  );
}
