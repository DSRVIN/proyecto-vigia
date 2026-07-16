import React, { useMemo } from 'react';
import { Clock, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const DIAS = ['Hoy', 'Mañana', 'Miércoles'];

export default function AgendaPage() {
  const { state } = useApp();

  const agenda = useMemo(() => {
    const pendientes = state.students
      .filter((s) => (s.riesgo === 'CRITICO' || s.riesgo === 'ALTO') && !s.intervenido)
      .slice(0, 12);
    return DIAS.map((dia, di) => ({
      dia,
      citas: pendientes.slice(di * 4, di * 4 + 4).map((s, i) => ({
        ...s,
        hora: `${9 + i * 2}:00`,
      })),
    }));
  }, [state.students]);

  return (
    <PageShell
      eyebrow="Seguimiento"
      title="Agenda de Contacto"
      description="Llamadas de retención programadas para los próximos días."
    >
      <DemoNote>
        Agenda de demostración generada a partir de los estudiantes en riesgo. La programación
        automática de rellamadas se habilitará con la integración de telefonía.
      </DemoNote>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agenda.map((d) => (
          <Panel key={d.dia} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">{d.dia}</h3>
              <span className="text-[11px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                {d.citas.length} citas
              </span>
            </div>
            <div className="space-y-3">
              {d.citas.map((c) => (
                <div
                  key={c.codigo}
                  className="flex items-center gap-3 border-l-4 border-brand-500 bg-slate-50 rounded-r-lg px-3 py-2"
                >
                  <div className="text-center">
                    <Clock size={13} className="text-slate-400 mx-auto" />
                    <p className="text-[11px] font-black text-slate-600 mt-0.5">{c.hora}</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-[11px] flex-shrink-0">
                    {initials(c.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800 truncate">{c.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.codigo}</p>
                  </div>
                  <PhoneCall size={14} className="text-brand-600 flex-shrink-0" />
                </div>
              ))}
              {d.citas.length === 0 && (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">Sin citas</p>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
