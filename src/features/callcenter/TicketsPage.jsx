import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const ESTADOS = {
  Abierto: 'bg-brand-50 text-brand-700 border-brand-100',
  'En proceso': 'bg-amber-50 text-risk-medium border-amber-100',
  Resuelto: 'bg-emerald-50 text-risk-low border-emerald-100',
};

const TIPOS = ['Compromiso de pago', 'Consulta académica', 'Reprogramación', 'Reclamo', 'Beca'];

export default function TicketsPage() {
  const { state } = useApp();
  const [filtro, setFiltro] = useState('TODOS');

  const tickets = useMemo(() => {
    return state.students.slice(0, 20).map((s, i) => {
      const estado = s.intervenido ? 'Resuelto' : i % 3 === 0 ? 'En proceso' : 'Abierto';
      return {
        id: `TK-${1000 + i}`,
        estudiante: s.nombre,
        codigo: s.codigo,
        tipo: TIPOS[i % TIPOS.length],
        estado,
        prioridad: s.riesgo === 'CRITICO' ? 'Alta' : s.riesgo === 'ALTO' ? 'Media' : 'Baja',
      };
    });
  }, [state.students]);

  const filtrados = filtro === 'TODOS' ? tickets : tickets.filter((t) => t.estado === filtro);

  return (
    <PageShell
      eyebrow="Operaciones"
      title="Tickets de Atención"
      description="Solicitudes y compromisos registrados durante la gestión de retención."
    >
      <DemoNote>
        Tickets de demostración generados sobre la cartera real. La integración con la mesa de ayuda
        (Jira Service Management) está en el roadmap.
      </DemoNote>

      <div className="flex flex-wrap gap-2 mb-5">
        {['TODOS', 'Abierto', 'En proceso', 'Resuelto'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
              filtro === f
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['Ticket', 'Estudiante', 'Tipo', 'Prioridad', 'Estado'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-mono font-bold text-brand-700">{t.id}</td>
                <td className="px-5 py-3">
                  <p className="font-bold text-slate-800">{t.estudiante}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{t.codigo}</p>
                </td>
                <td className="px-5 py-3 text-slate-600 font-semibold">{t.tipo}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-black ${t.prioridad === 'Alta' ? 'text-risk-critical' : t.prioridad === 'Media' ? 'text-risk-medium' : 'text-slate-400'}`}
                  >
                    {t.prioridad}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${ESTADOS[t.estado]}`}
                  >
                    {t.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </PageShell>
  );
}
