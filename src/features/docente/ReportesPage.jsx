import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel } from '../../components/layout/PageShell.jsx';
import { MIN_APPROVAL } from '../../services/metrics.service.js';

const RISK_COLORS = {
  CRITICO: '#dc2626',
  ALTO: '#ea580c',
  MEDIO: '#d97706',
  BAJO: '#059669',
};

export default function ReportesPage() {
  const { state } = useApp();
  const { students, courses } = state;

  const riskDist = useMemo(() => {
    const counts = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAJO: 0 };
    students.forEach((s) => {
      counts[s.riesgo] = (counts[s.riesgo] || 0) + 1;
    });
    return [
      { name: 'Crítico', key: 'CRITICO', value: counts.CRITICO },
      { name: 'Alto', key: 'ALTO', value: counts.ALTO },
      { name: 'Medio', key: 'MEDIO', value: counts.MEDIO },
      { name: 'Bajo', key: 'BAJO', value: counts.BAJO },
    ];
  }, [students]);

  const byCourse = useMemo(() => {
    return courses.map((c) => {
      const cs = students.filter((s) => s.cursoId === c.id);
      const avg =
        cs.length > 0 ? cs.reduce((acc, s) => acc + (s.notaFinal ?? 0), 0) / cs.length : 0;
      const asist =
        cs.length > 0 ? cs.reduce((acc, s) => acc + (s.asistencia ?? 0), 0) / cs.length : 0;
      return {
        curso: c.codigo,
        nombre: c.nombre,
        promedio: Number(avg.toFixed(1)),
        asistencia: Math.round(asist),
        alumnos: cs.length,
      };
    });
  }, [students, courses]);

  const total = students.length;
  const aprobados = students.filter((s) => s.notaFinal >= MIN_APPROVAL).length;
  const tasaAprobacion = total > 0 ? Math.round((aprobados / total) * 100) : 0;

  return (
    <PageShell
      eyebrow="Seguimiento"
      title="Reportes"
      description="Resumen analítico del desempeño académico de tus secciones: distribución de riesgo, promedios y asistencia por curso."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Estudiantes', value: total, color: 'text-slate-900' },
          { label: 'Tasa de Aprobación', value: `${tasaAprobacion}%`, color: 'text-risk-low' },
          {
            label: 'En Riesgo Alto/Crítico',
            value: riskDist[0].value + riskDist[1].value,
            color: 'text-risk-critical',
          },
          { label: 'Cursos', value: courses.length, color: 'text-brand-700' },
        ].map((k) => (
          <Panel key={k.label} className="p-5">
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
              {k.label}
            </p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Panel className="p-5 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-900 mb-4">Distribución de Riesgo</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={riskDist}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {riskDist.map((d) => (
                  <Cell key={d.key} fill={RISK_COLORS[d.key]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {riskDist.map((d) => (
              <span
                key={d.key}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: RISK_COLORS[d.key] }}
                />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <h3 className="text-sm font-black text-slate-900 mb-4">Promedio por Curso</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCourse} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="curso" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(v) => [v, 'Promedio']}
                labelFormatter={(l) => byCourse.find((c) => c.curso === l)?.nombre || l}
              />
              <Bar dataKey="promedio" radius={[4, 4, 0, 0]}>
                {byCourse.map((c) => (
                  <Cell
                    key={c.curso}
                    fill={
                      c.promedio >= MIN_APPROVAL
                        ? '#1e40af'
                        : c.promedio >= 10
                          ? '#d97706'
                          : '#dc2626'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['Curso', 'Alumnos', 'Promedio', 'Asistencia'].map((h) => (
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
            {byCourse.map((c) => (
              <tr key={c.curso} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <p className="font-bold text-slate-800">{c.nombre}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{c.curso}</p>
                </td>
                <td className="px-5 py-3 font-bold text-slate-600">{c.alumnos}</td>
                <td
                  className={`px-5 py-3 font-black font-mono ${c.promedio >= MIN_APPROVAL ? 'text-risk-low' : 'text-risk-critical'}`}
                >
                  {c.promedio}
                </td>
                <td className="px-5 py-3 font-bold text-slate-600">{c.asistencia}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </PageShell>
  );
}
