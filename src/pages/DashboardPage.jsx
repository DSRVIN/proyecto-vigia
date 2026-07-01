import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Users, Clock, AlertTriangle, TrendingUp, Star, ChevronRight, Calendar, Award } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { supabase } from '../supabaseClient';
import { STUDENTS_INITIAL, enrichStudentData } from '../data/dataset.js';

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

  const courseStudents = useMemo(
    () => state.students.filter(s => s.cursoId === course.id),
    [state.students, course.id]
  );

  const stats = useMemo(() => {
    const total = courseStudents.length;
    const criticos = courseStudents.filter(s => s.riesgo === 'CRITICO').length;
    const altos = courseStudents.filter(s => s.riesgo === 'ALTO').length;
    const aprobados = courseStudents.filter(s => s.notaFinal >= 12).length;
    const promedio = total > 0
      ? (courseStudents.reduce((acc, s) => acc + s.promedio, 0) / total).toFixed(1)
      : '—';
    const asistenciaAvg = total > 0
      ? Math.round(courseStudents.reduce((acc, s) => acc + s.asistencia, 0) / total)
      : 0;
    return { total, criticos, altos, aprobados, promedio, asistenciaAvg };
  }, [courseStudents]);

  const riskLevel = stats.criticos > 3 ? 'CRITICO' : stats.criticos > 0 || stats.altos > 2 ? 'ALTO' : stats.altos > 0 ? 'MEDIO' : 'BAJO';
  const healthPct = stats.total > 0 ? Math.round((stats.aprobados / stats.total) * 100) : 0;

  return (
    <div
      onClick={() => onClick(course)}
      className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer group hover:border-[#d32f2f]/40 hover:shadow-xl transition-all duration-300 active:scale-[0.99] hover:-translate-y-1 shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
              {course.codigo} · {course.seccion}
            </span>
            <RiskBadge level={riskLevel} size="xs" />
          </div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-[#d32f2f] transition-colors leading-snug">
            {course.nombre}
          </h3>
        </div>
        <div className="ml-3 p-2.5 rounded-xl bg-red-50 border border-red-100 group-hover:bg-red-100 transition-all flex-shrink-0">
          <BookOpen size={20} className="text-[#d32f2f]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <StatPill icon={Calendar} label="Horario" value={course.horario} color="text-slate-700" />
        <StatPill icon={Award} label="Créditos" value={`${course.creditos} cr`} color="text-violet-700" />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 border border-slate-200 rounded-xl py-3 mb-5 shadow-inner">
        <div>
          <p className="text-lg font-black text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Alumnos</p>
        </div>
        <div>
          <p className={`text-lg font-black ${stats.criticos > 0 ? 'text-[#d32f2f]' : 'text-slate-400'}`}>{stats.criticos}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Críticos</p>
        </div>
        <div>
          <p className="text-lg font-black text-slate-900">{stats.promedio}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Promedio</p>
        </div>
        <div>
          <p className={`text-lg font-black ${stats.asistenciaAvg < 65 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {stats.asistenciaAvg}%
          </p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Asist.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-bold">Salud académica del aula</span>
          <span className={`font-black ${healthPct >= 70 ? 'text-emerald-600' : healthPct >= 50 ? 'text-amber-600' : 'text-[#d32f2f]'}`}>
            {healthPct}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              healthPct >= 70 ? 'bg-gradient-to-r from-emerald-600 to-teal-500' :
              healthPct >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-[#d32f2f] to-red-400'
            }`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-[#d32f2f] font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Ver sección completa <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

// Banners de KPIs Globales
function GlobalKPIs() {
  const { state, actions } = useApp();

  const stats = useMemo(() => {
    const total = state.students.length;
    const criticos = state.students.filter(s => s.riesgo === 'CRITICO').length;
    const altos = state.students.filter(s => s.riesgo === 'ALTO').length;
    const aprobados = state.students.filter(s => s.notaFinal >= 12).length;
    const abandono = state.students.filter(s => s.actividadDias > 14).length;
    return { total, criticos, altos, aprobados, abandono };
  }, [state.students]);

  const kpis = [
    { label: 'Total Estudiantes', value: stats.total, icon: Users, color: 'text-slate-900', badgeColor: 'text-blue-600 bg-blue-50 border-blue-100', filterId: 'ALL' },
    { label: 'Riesgo Crítico', value: stats.criticos, icon: AlertTriangle, color: 'text-[#d32f2f]', badgeColor: 'text-[#d32f2f] bg-red-50 border-red-100', filterId: 'CRITICO' },
    { label: 'Riesgo Alto', value: stats.altos, icon: TrendingUp, color: 'text-amber-600', badgeColor: 'text-amber-600 bg-amber-50 border-amber-100', filterId: 'ALTO' },
    { label: 'Posible Abandono', value: stats.abandono, icon: Clock, color: 'text-violet-600', badgeColor: 'text-violet-600 bg-violet-50 border-violet-100', filterId: 'ABANDONO' },
    { label: 'Aprobados', value: stats.aprobados, icon: Star, color: 'text-emerald-600', badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', filterId: 'APROBADOS' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {kpis.map((kpi, i) => (
        <div 
          key={kpi.label} 
          onClick={() => actions.setKPIFilter(kpi.filterId)}
          className="rounded-xl p-4 border border-slate-200 bg-white animate-fade-in cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-md"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-black uppercase tracking-wider leading-tight group-hover:text-slate-900 transition-colors">{kpi.label}</p>
            <div className={`p-1.5 rounded-lg border ${kpi.badgeColor}`}>
              <kpi.icon size={14} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard Principal ───────────────────────────────────────
export default function DashboardPage() {
  const { state, actions } = useApp();
  const { teacher, courses, currentUser } = state; // Se añadió currentUser aquí
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('students')
          .select('*, grades(pc1, pc2, pc3, pc4, promedio, nota_final, riesgo, necesita_pc4)');

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          const mapped = data.map(st => {
            const rawGrades = Array.isArray(st.grades) ? st.grades[0] : st.grades;
            const cleanGrades = {
              PC1: rawGrades?.pc1 ?? 0,
              PC2: rawGrades?.pc2 ?? 0,
              PC3: rawGrades?.pc3 ?? 0,
              PC4: rawGrades?.pc4 ?? 0,
            };
            const baseStudent = {
              ...st,
              cursoId: st.curso_id,
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
              necesitaPC4: rawGrades?.necesita_pc4 ?? null,
            };
            return enrichStudentData(baseStudent);
          });
          actions.setStudents(mapped);
        } else {
          console.log('No students in database, seeding with mock data');
          actions.setStudents(STUDENTS_INITIAL);
        }
      } catch (err) {
        console.error('Error fetching students, falling back to mock data:', err);
        actions.setStudents(STUDENTS_INITIAL);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Banner de Bienvenida Dinámico */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#d32f2f] font-black uppercase tracking-widest mb-1">
                Bienvenido de vuelta
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {/* Nombre dinámico tomado del currentUser */}
                {currentUser?.nombre ? `Docente ${currentUser.nombre}` : 'Dashboard Académico'}
              </h1>
              <p className="text-slate-600 text-xs mt-1.5 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                {teacher.departamento || 'Dirección de Tecnología Educativa'} <span className="text-slate-300">·</span> {teacher.cargo || 'Docente'} <span className="text-slate-300">·</span> <span className="text-[#d32f2f] font-black">Ciclo 2026-I</span>
              </p>
            </div>
          </div>
        </div>

        <GlobalKPIs />

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Mis Secciones</h2>
            <p className="text-sm text-slate-600 font-bold">{courses.length} cursos asignados este ciclo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <div key={course.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
              <CourseCard course={course} onClick={actions.selectCourse} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}