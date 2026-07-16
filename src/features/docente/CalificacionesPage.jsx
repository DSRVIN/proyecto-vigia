import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel } from '../../components/layout/PageShell.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import { getEvalConfig } from '../../data/dataset.js';
import { MIN_APPROVAL } from '../../services/metrics.service.js';

function gradeColor(value) {
  if (value == null) return 'text-slate-300';
  if (value >= MIN_APPROVAL) return 'text-risk-low';
  if (value >= 10) return 'text-risk-medium';
  return 'text-risk-critical';
}

export default function CalificacionesPage() {
  const { state } = useApp();
  const { students, courses } = state;
  const [cursoId, setCursoId] = useState(courses[0]?.id || '');
  const [search, setSearch] = useState('');

  const evals = useMemo(() => getEvalConfig(cursoId), [cursoId]);

  const rows = useMemo(() => {
    return students
      .filter((s) => s.cursoId === cursoId)
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(search.toLowerCase()) ||
          s.codigo.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [students, cursoId, search]);

  const aprobados = rows.filter((s) => s.notaFinal >= MIN_APPROVAL).length;

  return (
    <PageShell
      eyebrow="Académico"
      title="Calificaciones"
      description="Libro de notas por curso con el promedio ponderado calculado según los pesos de cada evaluación."
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo} · {c.nombre}
            </option>
          ))}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="sm:ml-auto text-xs font-bold text-slate-500">
          {rows.length} estudiantes · {aprobados} aprobados
        </div>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Estudiante
              </th>
              {evals.map((e) => (
                <th
                  key={e.key}
                  className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 text-center"
                >
                  {e.label}
                  <span className="block text-[10px] text-slate-400 font-bold">
                    {(e.weight * 100).toFixed(0)}%
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 text-center">
                Promedio
              </th>
              <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 text-center">
                Riesgo
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.codigo} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <p className="font-bold text-slate-800">{s.nombre}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.codigo}</p>
                </td>
                {evals.map((e) => {
                  const v = s.grades?.[e.key];
                  return (
                    <td
                      key={e.key}
                      className={`px-3 py-3 text-center font-black font-mono ${gradeColor(v)}`}
                    >
                      {v == null ? '—' : v.toFixed(1)}
                    </td>
                  );
                })}
                <td
                  className={`px-4 py-3 text-center font-black font-mono text-base ${gradeColor(s.notaFinal)}`}
                >
                  {s.notaFinal?.toFixed(1) ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <RiskBadge level={s.riesgo} size="xs" />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={evals.length + 3} className="px-5 py-10 text-center text-slate-400">
                  No hay estudiantes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>

      <p className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-4">
        <Download size={13} /> La última evaluación pendiente se muestra con “—”. El promedio usa
        las notas ya registradas.
      </p>
    </PageShell>
  );
}
