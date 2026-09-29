import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import docenteHero from '../../assets/roles/docente.png';
import { BookOpen, ChevronRight, Calendar, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import StatCard, {
  RatioLine,
  MiniArea,
  MiniBars,
  FooterLink,
} from '../../components/ui/StatCard.jsx';

// ── Agregados por curso (base de tarjetas, gráfico y ranking) ────
function useCourseStats(students, courses) {
  return useMemo(
    () =>
      courses.map((c) => {
        const cs = students.filter((s) => s.cursoId === c.id);
        const n = cs.length;
        const criticos = cs.filter((s) => s.riesgo === 'CRITICO').length;
        const altos = cs.filter((s) => s.riesgo === 'ALTO').length;
        const avg = (fn) => (n > 0 ? cs.reduce((acc, s) => acc + fn(s), 0) / n : 0);
        return {
          id: c.id,
          code: c.codigo,
          short: c.codigo.replace(/^[A-Z]+/, ''),
          nombre: c.nombre,
          total: n,
          criticos,
          altos,
          riesgo: criticos + altos,
          sinRiesgo: n - criticos - altos,
          promedio: Number(avg((s) => s.notaFinal ?? 0).toFixed(1)),
          asistencia: Math.round(avg((s) => s.asistencia ?? 0)),
        };
      }),
    [students, courses]
  );
}

// ── Tarjeta de curso ─────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
      <Icon size={14} className={color} />
      <span className="text-xs text-slate-600">{label}:</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}

function CourseCard({ course, onClick }) {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const courseStudents = useMemo(
    () => state.students.filter((s) => s.cursoId === course.id),
    [state.students, course.id]
  );

  const stats = useMemo(() => {
    const total = courseStudents.length;
    const criticos = courseStudents.filter((s) => s.riesgo === 'CRITICO').length;
    const altos = courseStudents.filter((s) => s.riesgo === 'ALTO').length;
    const aprobados = courseStudents.filter((s) => s.notaFinal >= 12).length;
    const promedio =
      total > 0 ? (courseStudents.reduce((acc, s) => acc + s.promedio, 0) / total).toFixed(1) : '—';
    const asistenciaAvg =
      total > 0 ? Math.round(courseStudents.reduce((acc, s) => acc + s.asistencia, 0) / total) : 0;
    return { total, criticos, altos, aprobados, promedio, asistenciaAvg };
  }, [courseStudents]);

  const riskLevel =
    stats.criticos > 3
      ? 'CRITICO'
      : stats.criticos > 0 || stats.altos > 2
        ? 'ALTO'
        : stats.altos > 0
          ? 'MEDIO'
          : 'BAJO';
  const healthPct = stats.total > 0 ? Math.round((stats.aprobados / stats.total) * 100) : 0;

  // El borde izquierdo codifica el estado de riesgo del curso (semáforo)
  const accentBorder = {
    CRITICO: 'border-l-risk-critical',
    ALTO: 'border-l-risk-high',
    MEDIO: 'border-l-risk-medium',
    BAJO: 'border-l-risk-low',
  }[riskLevel];

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      onDoubleClick={() => onClick(course)}
      className={`bg-white border border-slate-100 border-l-4 ${accentBorder} rounded-2xl p-5 sm:p-6 cursor-pointer group shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition-all duration-300 active:scale-[0.99] sm:hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
              {course.codigo} · {course.seccion}
            </span>
            <RiskBadge level={riskLevel} size="xs" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
            {course.nombre}
          </h3>
        </div>
        <div className="ml-3 h-10 w-10 rounded-full bg-brand-50 border border-brand-100 group-hover:bg-brand-100 transition-all flex-shrink-0 flex items-center justify-center">
          <BookOpen size={18} className="text-brand-700" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatPill icon={Calendar} label="Horario" value={course.horario} color="text-slate-700" />
        <StatPill
          icon={Award}
          label="Créditos"
          value={`${course.creditos} cr`}
          color="text-brand-700"
        />
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 mt-5' : 'opacity-0 pointer-events-none'
        }`}
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-2 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 mb-5">
            {[
              { v: stats.total, l: 'Alumnos', c: 'text-slate-900' },
              {
                v: stats.criticos,
                l: 'Críticos',
                c: stats.criticos > 0 ? 'text-risk-critical' : 'text-slate-400',
              },
              { v: stats.promedio, l: 'Promedio', c: 'text-slate-900' },
              {
                v: `${stats.asistenciaAvg}%`,
                l: 'Asist.',
                c: stats.asistenciaAvg < 65 ? 'text-risk-medium' : 'text-risk-low',
              },
            ].map((x) => (
              <div key={x.l}>
                <p className={`text-lg font-black ${x.c}`}>{x.v}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  {x.l}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-bold">Salud académica del aula</span>
              <span
                className={`font-black ${healthPct >= 70 ? 'text-risk-low' : healthPct >= 50 ? 'text-risk-medium' : 'text-risk-critical'}`}
              >
                {healthPct}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  healthPct >= 70
                    ? 'bg-risk-low'
                    : healthPct >= 50
                      ? 'bg-risk-medium'
                      : 'bg-risk-critical'
                }`}
                style={{ width: `${healthPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(course);
              }}
              className="text-xs text-brand-700 font-black uppercase tracking-wider transition-transform flex items-center gap-1"
            >
              Ver sección completa <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjetas KPI ─────────────────────────────────────────────────
function KpiCards({ students, byCourse }) {
  const navigate = useNavigate();
  const s = useMemo(() => {
    const total = students.length;
    const criticos = students.filter((x) => x.riesgo === 'CRITICO').length;
    const altos = students.filter((x) => x.riesgo === 'ALTO').length;
    const aprobados = students.filter((x) => x.notaFinal >= 12).length;
    const abandono = students.filter((x) => x.actividadDias > 14).length;
    const bajo70 = students.filter((x) => (x.asistencia ?? 0) < 70).length;
    const asist =
      total > 0 ? Math.round(students.reduce((a, x) => a + (x.asistencia ?? 0), 0) / total) : 0;
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
    return { total, criticos, altos, aprobados, abandono, bajo70, asist, pct };
  }, [students]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-6">
      <StatCard
        title="Total estudiantes"
        info="Estudiantes asignados en tus secciones del ciclo"
        value={s.total}
        onClick={() => navigate('/docente/kpi/ALL')}
        footer={
          <FooterLink
            label="Posible abandono"
            value={s.abandono}
            onClick={() => navigate('/docente/kpi/ABANDONO')}
          />
        }
      >
        <RatioLine label="En riesgo crítico" value={`${s.pct(s.criticos)}%`} tone="bad" />
        <RatioLine label="En riesgo alto" value={`${s.pct(s.altos)}%`} tone="warn" />
      </StatCard>

      <StatCard
        title="Riesgo crítico"
        info="Estudiantes clasificados en riesgo crítico de deserción"
        value={s.criticos}
        valueClass="text-risk-critical"
        onClick={() => navigate('/docente/kpi/CRITICO')}
        footer={
          <FooterLink
            label="Riesgo alto"
            value={s.altos}
            onClick={() => navigate('/docente/kpi/ALTO')}
          />
        }
      >
        <MiniArea
          id="kpi-riesgo"
          data={byCourse}
          labelKey="code"
          series={[
            { key: 'sinRiesgo', name: 'Sin riesgo', color: '#93c5fd' },
            { key: 'altos', name: 'Alto', color: '#ea580c' },
            { key: 'criticos', name: 'Crítico', color: '#dc2626' },
          ]}
        />
      </StatCard>

      <StatCard
        title="Asistencia promedio"
        info="Asistencia media de la cartera, por curso"
        value={`${s.asist}%`}
        onClick={() => navigate('/docente/asistencias')}
        footer={
          <span>
            Bajo 70% <span className="font-semibold tabular-nums">{s.bajo70}</span> estudiantes
          </span>
        }
      >
        <MiniBars data={byCourse} dataKey="asistencia" name="Asistencia %" labelKey="code" />
      </StatCard>

      <StatCard
        title="Tasa de aprobación"
        value={`${s.pct(s.aprobados)}%`}
        valueClass="text-risk-low"
        centered
        onClick={() => navigate('/docente/kpi/APROBADOS')}
      >
        <p className="text-sm text-slate-500">
          {s.aprobados} de {s.total} estudiantes
        </p>
      </StatCard>
    </div>
  );
}

// ── Panel de análisis con pestañas (gráfico + ranking) ───────────
const TABS = [
  {
    id: 'riesgo',
    label: 'Riesgo',
    chartTitle: 'Estudiantes en riesgo por curso',
    rankTitle: 'Cursos con más riesgo',
    series: [
      { key: 'riesgo', name: 'Crítico + Alto', color: '#1d4ed8' },
      { key: 'sinRiesgo', name: 'Medio + Bajo', color: '#93c5fd' },
    ],
    rankKey: 'riesgo',
    desc: true,
    fmt: (v) => `${v} est.`,
  },
  {
    id: 'rendimiento',
    label: 'Rendimiento',
    chartTitle: 'Promedio por curso',
    rankTitle: 'Mejores promedios',
    series: [{ key: 'promedio', name: 'Promedio', color: '#3b82f6' }],
    ref: { y: 12, label: 'Aprobatorio 12' },
    domain: [0, 20],
    rankKey: 'promedio',
    desc: true,
    fmt: (v) => v.toFixed(1),
  },
  {
    id: 'asistencia',
    label: 'Asistencia',
    chartTitle: 'Asistencia promedio por curso',
    rankTitle: 'Menor asistencia',
    series: [{ key: 'asistencia', name: 'Asistencia %', color: '#3b82f6' }],
    ref: { y: 70, label: 'Mínimo 70%' },
    domain: [0, 100],
    rankKey: 'asistencia',
    desc: false,
    fmt: (v) => `${v}%`,
  },
];

function AnalyticsPanel({ byCourse }) {
  const navigate = useNavigate();
  const [tabId, setTabId] = useState('riesgo');
  const tab = TABS.find((t) => t.id === tabId);

  const ranking = useMemo(
    () =>
      [...byCourse]
        .filter((c) => c.total > 0)
        .sort((a, b) =>
          tab.desc ? b[tab.rankKey] - a[tab.rankKey] : a[tab.rankKey] - b[tab.rankKey]
        )
        .slice(0, 7),
    [byCourse, tab]
  );

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] mb-8">
      <div className="flex items-end justify-between gap-3 px-2 sm:px-5 border-b border-slate-100">
        <div className="flex overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === tabId}
              onClick={() => setTabId(t.id)}
              className={`px-4 py-4 text-[15px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                t.id === tabId
                  ? 'border-brand-500 text-brand-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline-flex mb-3 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5">
          Ciclo 2026-I · {byCourse.length} cursos
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-8 p-5 sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-base font-semibold text-slate-800">{tab.chartTitle}</h3>
            <div className="flex items-center gap-3">
              {tab.series.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCourse} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="short"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={tab.domain || [0, 'auto']}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  labelFormatter={(_, p) =>
                    p?.[0] ? `${p[0].payload.code} · ${p[0].payload.nombre}` : ''
                  }
                />
                {tab.ref && (
                  <ReferenceLine
                    y={tab.ref.y}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{
                      value: tab.ref.label,
                      position: 'insideTopRight',
                      fontSize: 10,
                      fill: '#dc2626',
                    }}
                  />
                )}
                {tab.series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800 mb-3">{tab.rankTitle}</h3>
          <ol className="space-y-0.5">
            {ranking.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => navigate(`/docente/curso/${c.id}`)}
                  className="w-full flex items-center gap-3 py-2 px-1 rounded-lg text-left hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      i < 3 ? 'bg-[#0f1b3d] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-700">{c.nombre}</span>
                  <span className="text-sm font-semibold text-slate-800 tabular-nums">
                    {tab.fmt(c[tab.rankKey])}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ── Dashboard Principal ──────────────────────────────────────────
export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { teacher, courses, currentUser, students } = state;
  // La cartera de estudiantes la carga AppLayout (useStudentsLoader) una
  // sola vez tras la autenticación, para todos los roles y rutas.
  const byCourse = useCourseStats(students, courses);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 pb-12">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        {/* Bienvenida: texto + ilustración (la ilustración solo en escritorio) */}
        <div className="mb-6 sm:mb-8 animate-fade-in grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-brand-700 font-black uppercase tracking-widest mb-1">
              Bienvenido de vuelta
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {currentUser?.nombre ? `Docente ${currentUser.nombre}` : 'Dashboard Académico'}
            </h1>
            <p className="text-slate-600 text-xs mt-2 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit max-w-full shadow-sm">
              {teacher.departamento || 'Dirección de Tecnología Educativa'}{' '}
              <span className="text-slate-300">·</span> {teacher.cargo || 'Docente'}{' '}
              <span className="text-slate-300">·</span>{' '}
              <span className="text-brand-700 font-black">Ciclo 2026-I</span>
            </p>
          </div>
          <img
            src={docenteHero}
            alt=""
            aria-hidden="true"
            className="hidden lg:block w-[260px] xl:w-[300px] h-auto mix-blend-multiply"
          />
        </div>

        <KpiCards students={students} byCourse={byCourse} />
        <AnalyticsPanel byCourse={byCourse} />

        <div className="mb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Mis Secciones</h2>
          <p className="text-sm text-slate-500 font-semibold">
            {courses.length} cursos asignados este ciclo · toca una tarjeta para ver su resumen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {courses.map((course, i) => (
            <div
              key={course.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-in"
            >
              <CourseCard course={course} onClick={(c) => navigate(`/docente/curso/${c.id}`)} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
