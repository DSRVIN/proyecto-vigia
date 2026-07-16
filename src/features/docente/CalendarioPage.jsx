import React, { useMemo } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
const DAY_FULL = {
  Lun: 'Lunes',
  Mar: 'Martes',
  Mié: 'Miércoles',
  Jue: 'Jueves',
  Vie: 'Viernes',
  Sab: 'Sábado',
};

/** Extrae los días y la franja horaria de un texto tipo "Lun/Mié 08:00-10:00". */
function parseHorario(horario = '') {
  const match = horario.match(/([\d:]+-[\d:]+)/);
  const franja = match ? match[1] : '';
  const dias = DAYS.filter((d) => horario.includes(d));
  return { dias, franja };
}

export default function CalendarioPage() {
  const { state } = useApp();
  const { courses } = state;

  const porDia = useMemo(() => {
    const map = Object.fromEntries(DAYS.map((d) => [d, []]));
    courses.forEach((c) => {
      const { dias, franja } = parseHorario(c.horario);
      dias.forEach((d) => map[d].push({ ...c, franja }));
    });
    DAYS.forEach((d) => map[d].sort((a, b) => a.franja.localeCompare(b.franja)));
    return map;
  }, [courses]);

  return (
    <PageShell
      eyebrow="Organización"
      title="Calendario Académico"
      description="Horario semanal de tus secciones para el ciclo 2026-I, generado a partir de los cursos asignados."
    >
      <DemoNote>
        Vista de horario basada en tus cursos reales. La sincronización con Google Calendar /
        Outlook forma parte del roadmap de integraciones.
      </DemoNote>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DAYS.map((d) => (
          <Panel key={d} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900">{DAY_FULL[d]}</h3>
              <span className="text-[11px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                {porDia[d].length} clases
              </span>
            </div>
            <div className="space-y-2">
              {porDia[d].length === 0 && (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">Sin clases</p>
              )}
              {porDia[d].map((c) => (
                <div
                  key={c.id}
                  className="border-l-4 border-brand-500 bg-slate-50 rounded-r-lg px-3 py-2"
                >
                  <p className="text-sm font-black text-slate-800 leading-tight">{c.nombre}</p>
                  <p className="text-[11px] font-mono text-slate-400 mb-1">
                    {c.codigo} · {c.seccion}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {c.franja}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.aula}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
