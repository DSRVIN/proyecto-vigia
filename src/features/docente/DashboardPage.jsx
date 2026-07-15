import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  Star,
  ChevronRight,
  Calendar,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import { supabase } from '../../supabaseClient';
import {
  STUDENTS_INITIAL,
  enrichStudentData,
  getStudentsForTeacher,
  getEvalConfig,
} from '../../data/dataset.js';

// Componente de píldora de estadísticas
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
      <Icon size={14} className={color} />
      <span className="text-xs text-slate-600">{label}:</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}

// Tarjeta de Curso
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
      className={`bg-white border border-slate-200 border-l-4 ${accentBorder} rounded-[20px] p-6 cursor-pointer group hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 active:scale-[0.99] hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
              {course.codigo} · {course.seccion}
            </span>
            <RiskBadge level={riskLevel} size="xs" />
          </div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
            {course.nombre}
          </h3>
        </div>
        <div className="ml-3 h-11 w-11 rounded-full bg-brand-50 border border-brand-100 group-hover:bg-brand-100 transition-all flex-shrink-0 flex items-center justify-center">
          <BookOpen size={19} className="text-brand-700" />
        </div>
      </div>

      <div
        className={`flex flex-wrap gap-2 transition-all duration-300 ${isExpanded ? 'mb-5' : 'mb-0'}`}
      >
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
          isExpanded ? 'opacity-100 mt-4' : 'opacity-0 pointer-events-none'
        }`}
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 mb-5 shadow-inner">
            <div>
              <p className="text-lg font-black text-slate-900">{stats.total}</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Alumnos
              </p>
            </div>
            <div>
              <p
                className={`text-lg font-black ${stats.criticos > 0 ? 'text-risk-critical' : 'text-slate-400'}`}
              >
                {stats.criticos}
              </p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Críticos
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{stats.promedio}</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Promedio
              </p>
            </div>
            <div>
              <p
                className={`text-lg font-black ${stats.asistenciaAvg < 65 ? 'text-amber-600' : 'text-emerald-600'}`}
              >
                {stats.asistenciaAvg}%
              </p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Asist.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-bold">Salud académica del aula</span>
              <span
                className={`font-black ${healthPct >= 70 ? 'text-emerald-600' : healthPct >= 50 ? 'text-amber-600' : 'text-risk-critical'}`}
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
              className="text-xs text-brand-700 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            >
              Ver sección completa <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ilustración decorativa del hero: docente frente a laptop con analítica.
// Tonos suaves de marca para no competir con el título.
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 360 150"
      className="hidden lg:block w-[340px] h-auto opacity-90"
      aria-hidden="true"
    >
      {/* fondo */}
      <ellipse cx="190" cy="132" rx="150" ry="14" fill="#dbeafe" opacity="0.6" />
      {/* pantalla con gráfico */}
      <rect x="228" y="28" width="104" height="72" rx="8" fill="#ffffff" stroke="#bfdbfe" />
      <rect x="242" y="72" width="12" height="18" rx="2" fill="#93c5fd" />
      <rect x="260" y="60" width="12" height="30" rx="2" fill="#3b82f6" />
      <rect x="278" y="48" width="12" height="42" rx="2" fill="#1e40af" />
      <polyline
        points="240,52 262,42 284,46 314,34"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="314" cy="34" r="3" fill="#2563eb" />
      <rect x="272" y="100" width="16" height="14" fill="#dbeafe" />
      <rect x="252" y="114" width="56" height="5" rx="2.5" fill="#bfdbfe" />
      {/* persona */}
      <circle cx="150" cy="52" r="16" fill="#1e3a8a" />
      <path d="M118 128c0-24 14-40 32-40s32 16 32 40z" fill="#2563eb" />
      {/* laptop */}
      <rect x="96" y="96" width="60" height="34" rx="4" fill="#1e40af" />
      <rect x="88" y="126" width="76" height="6" rx="3" fill="#93c5fd" />
      {/* planta */}
      <rect x="30" y="106" width="18" height="24" rx="3" fill="#bfdbfe" />
      <path
        d="M39 106c-2-12-12-16-16-14 2 8 8 12 16 14zm0 0c2-14 12-18 16-16-2 9-8 14-16 16z"
        fill="#3b82f6"
      />
      {/* taza */}
      <rect x="196" y="116" width="14" height="14" rx="3" fill="#93c5fd" />
    </svg>
  );
}

// Banners de KPIs Globales
function GlobalKPIs() {
  const { state } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = state.students.length;
    const criticos = state.students.filter((s) => s.riesgo === 'CRITICO').length;
    const altos = state.students.filter((s) => s.riesgo === 'ALTO').length;
    const aprobados = state.students.filter((s) => s.notaFinal >= 12).length;
    const abandono = state.students.filter((s) => s.actividadDias > 14).length;
    return { total, criticos, altos, aprobados, abandono };
  }, [state.students]);

  const kpis = [
    {
      label: 'Total Estudiantes',
      value: stats.total,
      sub: 'Estudiantes asignados',
      icon: Users,
      color: 'text-slate-900',
      badgeColor: 'text-brand-600 bg-brand-50 border-brand-100',
      filterId: 'ALL',
    },
    {
      label: 'Riesgo Crítico',
      value: stats.criticos,
      sub: 'Estudiantes',
      icon: AlertTriangle,
      color: 'text-risk-critical',
      badgeColor: 'text-risk-critical bg-red-50 border-red-100',
      filterId: 'CRITICO',
    },
    {
      label: 'Riesgo Alto',
      value: stats.altos,
      sub: 'Estudiantes',
      icon: TrendingUp,
      color: 'text-amber-600',
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-100',
      filterId: 'ALTO',
    },
    {
      label: 'Posible Abandono',
      value: stats.abandono,
      sub: 'Estudiantes',
      icon: Clock,
      color: 'text-brand-700',
      badgeColor: 'text-brand-700 bg-brand-50 border-brand-100',
      filterId: 'ABANDONO',
    },
    {
      label: 'Aprobados',
      value: stats.aprobados,
      sub: 'Estudiantes',
      icon: Star,
      color: 'text-emerald-600',
      badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      filterId: 'APROBADOS',
    },
  ];

  return (
    <div className="bg-white rounded-[22px] px-4 py-7 shadow-[0_8px_24px_rgba(15,23,42,0.08)] mb-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-stretch divide-y sm:divide-y-0 divide-slate-100">
        {kpis.map((kpi, i) => (
          <React.Fragment key={kpi.label}>
            {i > 0 && <div className="hidden sm:block w-px bg-brand-200 self-center h-12" />}
            <button
              onClick={() => navigate(`/docente/kpi/${kpi.filterId}`)}
              className="flex-1 flex items-center gap-4 px-5 py-3 sm:py-1 text-left cursor-pointer group bg-transparent border-0 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                className={`h-11 w-11 rounded-full border flex items-center justify-center flex-shrink-0 ${kpi.badgeColor}`}
              >
                <kpi.icon size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider leading-tight truncate">
                  {kpi.label}
                </p>
                <p className={`text-3xl font-black leading-tight ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-slate-400 font-bold">{kpi.sub}</p>
              </div>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard Principal ───────────────────────────────────────
export default function DashboardPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const { teacher, courses, currentUser } = state; // Se añadió currentUser aquí

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const courseIds = courses.map((c) => c.id);

        if (courseIds.length > 0) {
          const { data, error: dbError } = await supabase
            .from('students')
            .select('*, grades(pc1, pc2, pc3, pc4, promedio, nota_final, riesgo, necesita_pc4)')
            .in('curso_id', courseIds);

          if (dbError) throw dbError;

          if (data && data.length > 0) {
            const mapped = data.map((st) => {
              const rawGrades = Array.isArray(st.grades) ? st.grades[0] : st.grades || {};
              const cursoId = st.curso_id || 'SIST101';
              const evals = getEvalConfig(cursoId);
              const cleanGrades = {};
              evals.forEach((e) => {
                cleanGrades[e.key] = rawGrades?.[e.key] ?? rawGrades?.[e.key] ?? 0;
              });
              const baseStudent = {
                ...st,
                cursoId,
                promedio: rawGrades?.promedio ?? 0,
                notaFinal: rawGrades?.nota_final ?? 0,
                riesgo: rawGrades?.riesgo ?? 'BAJO',
                email: st.email || `${st.codigo?.toLowerCase()}@utp.edu.pe`,
                grades: cleanGrades,
                asistencia: st.asistencia ?? 75,
                actividadDias: st.actividad_dias ?? st.actividadDias ?? 5,
                actividadMensual: st.actividadMensual || [
                  { mes: 'Feb', accesos: 20 },
                  { mes: 'Mar', accesos: 18 },
                  { mes: 'Abr', accesos: 15 },
                  { mes: 'May', accesos: 10 },
                ],
                notaNecesaria: rawGrades?.nota_necesaria ?? rawGrades?.necesita_pc4 ?? null,
                notaNecesariaLabel: evals[evals.length - 1]?.label || 'Evaluación Final',
                notaNecesariaKey: evals[evals.length - 1]?.key || null,
                notaNecesariaWeight: evals[evals.length - 1]?.weight || 0,
              };
              return enrichStudentData(baseStudent);
            });
            actions.setStudents(mapped);
            return;
          }
        }

        console.log(
          'No students in database or no courses, seeding with mock data for',
          currentUser?.codigo
        );
        actions.setStudents(getStudentsForTeacher(currentUser?.codigo));
      } catch (err) {
        console.error('Error fetching students, falling back to mock data:', err);
        actions.setStudents(getStudentsForTeacher(currentUser?.codigo));
      }
    };

    fetchStudents();
  }, [currentUser?.codigo, courses, actions]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 pb-12">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Hero de bienvenida: texto + ilustración */}
        <div className="mb-10 animate-fade-in grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <p className="text-xs text-brand-700 font-black uppercase tracking-widest mb-1">
              Bienvenido de vuelta
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentUser?.nombre ? `Docente ${currentUser.nombre}` : 'Dashboard Académico'}
            </h1>
            <p className="text-slate-600 text-xs mt-2 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
              {teacher.departamento || 'Dirección de Tecnología Educativa'}{' '}
              <span className="text-slate-300">·</span> {teacher.cargo || 'Docente'}{' '}
              <span className="text-slate-300">·</span>{' '}
              <span className="text-brand-700 font-black">Ciclo 2026-I</span>
            </p>
          </div>
          <HeroIllustration />
        </div>

        <GlobalKPIs />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Mis Secciones</h2>
            <p className="text-sm text-slate-600 font-bold">
              {courses.length} cursos asignados este ciclo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div
              key={course.id}
              style={{ animationDelay: `${i * 80}ms` }}
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
