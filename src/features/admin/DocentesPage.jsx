import React, { useMemo } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter((w) => w.length > 2 && !w.includes('.'))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const DOCENTES = [
  {
    codigo: 'C13005',
    nombre: 'Dr. Carlos Mendoza Paredes',
    dep: 'Ingeniería de Sistemas',
    cursos: 9,
    cargo: 'Docente Titular',
  },
  {
    codigo: 'C13007',
    nombre: 'Mg. Andrea Salazar Rojas',
    dep: 'Educación',
    cursos: 9,
    cargo: 'Docente Titular',
  },
];

export default function DocentesPage() {
  const { state } = useApp();

  // Distribución de riesgo de la cartera del docente actualmente cargado
  const riesgoActual = useMemo(() => {
    const criticos = state.students.filter(
      (s) => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO'
    ).length;
    return { total: state.students.length, criticos };
  }, [state.students]);

  return (
    <PageShell
      eyebrow="Gestión"
      title="Docentes"
      description="Plana docente registrada en el sistema y su carga académica del ciclo."
    >
      <DemoNote>
        Listado de la plana docente demo. Al integrar el sistema académico institucional (SIU) se
        cargarán todos los docentes y su asignación real de cursos.
      </DemoNote>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DOCENTES.map((d, i) => (
          <Panel key={d.codigo} className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                {initials(d.nombre)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900">{d.nombre}</h3>
                <p className="text-xs text-slate-500 font-mono">{d.codigo}</p>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  {d.cargo} · {d.dep}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <BookOpen size={18} className="text-brand-700" />
                <div>
                  <p className="text-lg font-black text-slate-900">{d.cursos}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    Cursos
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <Users size={18} className="text-brand-700" />
                <div>
                  <p className="text-lg font-black text-slate-900">{i === 0 ? 267 : 250}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    Estudiantes
                  </p>
                </div>
              </div>
            </div>
            {i === 0 && (
              <p className="text-xs text-slate-500 font-bold mt-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {riesgoActual.criticos} de {riesgoActual.total} estudiantes en riesgo alto/crítico
                (cartera cargada actualmente).
              </p>
            )}
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
