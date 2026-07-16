import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel } from '../../components/layout/PageShell.jsx';

function asistColor(pct) {
  if (pct >= 85) return 'text-risk-low';
  if (pct >= 70) return 'text-risk-medium';
  return 'text-risk-critical';
}

function barColor(pct) {
  if (pct >= 85) return 'bg-risk-low';
  if (pct >= 70) return 'bg-risk-medium';
  return 'bg-risk-critical';
}

export default function AsistenciasPage() {
  const { state } = useApp();
  const { students, courses } = state;
  const [cursoId, setCursoId] = useState('ALL');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return students
      .filter((s) => cursoId === 'ALL' || s.cursoId === cursoId)
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(search.toLowerCase()) ||
          s.codigo.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (a.asistencia ?? 0) - (b.asistencia ?? 0));
  }, [students, cursoId, search]);

  const promedioAsist =
    rows.length > 0
      ? Math.round(rows.reduce((acc, s) => acc + (s.asistencia ?? 0), 0) / rows.length)
      : 0;
  const criticos = rows.filter((s) => (s.asistencia ?? 0) < 70).length;

  return (
    <PageShell
      eyebrow="Académico"
      title="Asistencias"
      description="Porcentaje de asistencia por estudiante y días de inactividad en el campus virtual. Ordenado de menor a mayor asistencia para priorizar."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Panel className="p-5">
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
            Asistencia Promedio
          </p>
          <p className={`text-3xl font-black mt-1 ${asistColor(promedioAsist)}`}>
            {promedioAsist}%
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">Bajo 70%</p>
          <p className="text-3xl font-black mt-1 text-risk-critical">{criticos}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
            Total Estudiantes
          </p>
          <p className="text-3xl font-black mt-1 text-slate-900">{rows.length}</p>
        </Panel>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="ALL">Todos los cursos</option>
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
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Estudiante
              </th>
              <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Curso
              </th>
              <th className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 w-64">
                Asistencia
              </th>
              <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 text-center">
                Inactividad
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const pct = s.asistencia ?? 0;
              const dias = s.actividadDias ?? 0;
              return (
                <tr key={s.codigo} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-800">{s.nombre}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.codigo}</p>
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-slate-500">{s.cursoId}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-black font-mono w-10 ${asistColor(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-black ${dias > 14 ? 'text-risk-critical' : dias > 7 ? 'text-risk-medium' : 'text-slate-400'}`}
                    >
                      {dias} días
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </PageShell>
  );
}
