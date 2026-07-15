import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Search, Users, ArrowLeft, SortAsc, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { SkeletonStudentRow } from '../components/ui/Skeleton.jsx';

const StudentModal = lazy(() => import('../components/students/StudentModal.jsx'));

// ── Student Row Adaptado al Estilo Claro ───────────────────────
function StudentRow({ student, courseName, onSelect, index }) {
  const isAbandono = student.actividadDias > 14;
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5 shadow-sm
        ${
          student.riesgo === 'CRITICO'
            ? 'border-red-300 hover:border-[#d32f2f] bg-red-50/50 hover:bg-red-50'
            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
        } animate-fade-in`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onSelect(student)}
    >
      {/* Avatar */}
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm
        ${
          student.riesgo === 'CRITICO'
            ? 'bg-gradient-to-br from-[#d32f2f] to-red-700'
            : student.riesgo === 'ALTO'
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : student.riesgo === 'MEDIO'
                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {student.nombre
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')}
      </div>

      {/* Name + code */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-slate-800 group-hover:text-slate-900 truncate transition-colors">
            {student.nombre}
          </p>
          {isAbandono && (
            <span className="text-xs px-1.5 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 rounded font-black uppercase tracking-wider flex-shrink-0">
              Abandono
            </span>
          )}
          {student.intervenido && (
            <span className="text-xs px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-black uppercase tracking-wider flex-shrink-0">
              ✓ Interv.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs font-mono text-slate-500 font-bold">{student.codigo}</p>
          <span className="text-slate-300 text-xs">•</span>
          <p className="text-xs text-slate-600 font-medium truncate">{courseName}</p>
        </div>
      </div>

      {/* Risk */}
      <div className="hidden sm:block flex-shrink-0">
        <RiskBadge level={student.riesgo} size="xs" pulse={student.riesgo === 'CRITICO'} />
      </div>

      {/* Promedio */}
      <div className="text-right flex-shrink-0 w-16">
        <p
          className={`text-base font-black font-mono leading-tight ${student.notaFinal >= 12 ? 'text-emerald-600' : student.notaFinal >= 10 ? 'text-amber-600' : 'text-[#d32f2f]'}`}
        >
          {student.notaFinal}
        </p>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">prom</p>
      </div>

      {/* Attendance */}
      <div className="hidden lg:block text-right flex-shrink-0 w-14">
        <p
          className={`text-sm font-black font-mono leading-tight ${student.asistencia >= 75 ? 'text-emerald-600' : student.asistencia >= 65 ? 'text-amber-600' : 'text-[#d32f2f]'}`}
        >
          {student.asistencia}%
        </p>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">asist</p>
      </div>
    </div>
  );
}

export default function KPIStudentsPage() {
  const { state, actions } = useApp();
  const { students, courses, kpiFilter } = state;

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('riesgo');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Lazy loading states
  const [showList, setShowList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  const kpiTitle = useMemo(() => {
    switch (kpiFilter) {
      case 'CRITICO':
        return 'Riesgo Crítico';
      case 'ALTO':
        return 'Riesgo Alto';
      case 'ABANDONO':
        return 'Posible Abandono';
      case 'APROBADOS':
        return 'Estudiantes Aprobados';
      default:
        return 'Todos los Estudiantes';
    }
  }, [kpiFilter]);

  const kpiDescription = useMemo(() => {
    switch (kpiFilter) {
      case 'CRITICO':
        return 'Alumnos con promedio menor a 12 o inactividad crítica detectada.';
      case 'ALTO':
        return 'Alumnos con promedio en el umbral de riesgo o baja asistencia acumulada.';
      case 'ABANDONO':
        return 'Alumnos sin actividad registrada en la plataforma por más de 14 días.';
      case 'APROBADOS':
        return 'Alumnos con rendimiento académico satisfactorio.';
      default:
        return 'Listado completo de estudiantes sin filtros específicos.';
    }
  }, [kpiFilter]);

  const baseFilteredStudents = useMemo(() => {
    let list = students;
    if (kpiFilter === 'CRITICO') list = list.filter((s) => s.riesgo === 'CRITICO');
    else if (kpiFilter === 'ALTO') list = list.filter((s) => s.riesgo === 'ALTO');
    else if (kpiFilter === 'ABANDONO') list = list.filter((s) => s.actividadDias > 14);
    else if (kpiFilter === 'APROBADOS') list = list.filter((s) => s.notaFinal >= 12);
    return list;
  }, [students, kpiFilter]);

  const filteredAndSorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = baseFilteredStudents;

    if (q) {
      list = list.filter(
        (s) => s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q)
      );
    }

    const riskOrder = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortField === 'riesgo') {
        va = riskOrder[a.riesgo];
        vb = riskOrder[b.riesgo];
      } else if (sortField === 'nombre') {
        va = a.nombre;
        vb = b.nombre;
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      } else if (sortField === 'promedio') {
        va = a.notaFinal;
        vb = b.notaFinal;
      } else if (sortField === 'asistencia') {
        va = a.asistencia;
        vb = b.asistencia;
      } else {
        va = 0;
        vb = 0;
      }
      return sortAsc ? va - vb : vb - va;
    });

    return list;
  }, [baseFilteredStudents, search, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortAsc ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : (
      <SortAsc size={12} className="opacity-30" />
    );

  const handleToggleList = () => {
    if (!showList) {
      setShowList(true);
      setIsListLoading(true);
      setTimeout(() => setIsListLoading(false), 600);
    } else {
      setShowList(false);
    }
  };

  const getCourseName = (cursoId) => {
    const c = courses.find((course) => course.id === cursoId);
    return c ? c.nombre : 'Desconocido';
  };

  return (
    <div className="min-h-screen bg-slate-100 max-w-screen-xl mx-auto px-4 sm:px-6 py-8 text-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-in">
        <div>
          <button
            onClick={actions.goDashboard}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-900 mb-4 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl w-fit shadow-sm"
          >
            <ArrowLeft size={15} /> Volver al Dashboard
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-black bg-red-50 border border-red-200 text-[#d32f2f] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Filtro VIGÍA
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            Métricas: {kpiTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <p className="text-sm font-bold text-slate-600">{kpiDescription}</p>
            <div className="hidden sm:flex items-center gap-2 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d32f2f] animate-pulse" />
              <p className="text-xs font-black text-[#d32f2f] uppercase tracking-wider">
                {baseFilteredStudents.length} alumnos bajo este criterio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student list Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-[#d32f2f]" />
              Alumnos Detectados
              <span className="text-sm font-bold text-slate-500">({filteredAndSorted.length})</span>
            </h2>
          </div>

          {/* Search & Sort UI */}
          {showList && (
            <div className="animate-fade-in space-y-3.5">
              {/* Search input clear style */}
              <div className="relative mt-4">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o código U..."
                  className="w-full bg-white border border-slate-200 focus:border-[#d32f2f]/60 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort controls aligned to red theme */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
                  Ordenar:
                </span>
                {[
                  ['riesgo', 'Riesgo'],
                  ['promedio', 'Promedio'],
                  ['asistencia', 'Asistencia'],
                  ['nombre', 'Nombre'],
                ].map(([field, label]) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all border ${
                      sortField === field
                        ? 'text-[#d32f2f] bg-red-50 border-red-200 font-black'
                        : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    {label} <SortIcon field={field} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List Body */}
        <div className="p-4 space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar min-h-[350px] flex flex-col bg-slate-50/30">
          {!showList ? (
            <div className="flex-1 flex flex-col items-center justify-center py-14 px-4 text-center animate-fade-in">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-5 border border-red-100 shadow-md">
                <Users size={32} className="text-[#d32f2f]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2.5">Vista Segura Activada</h3>
              <p className="text-sm font-bold text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                Para resguardar el rendimiento analítico, el reporte analítico de los{' '}
                <span className="text-[#d32f2f] font-black">
                  {filteredAndSorted.length} alumnos
                </span>{' '}
                se procesa bajo demanda.
              </p>
              <button
                onClick={handleToggleList}
                className="group relative px-8 py-3 bg-[#d32f2f] hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Cargar lista analítica
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </button>
            </div>
          ) : isListLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(5)].map((_, i) => (
                <SkeletonStudentRow key={i} />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-14 text-slate-500 flex-1 flex flex-col items-center justify-center">
              <Search size={32} className="mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="font-bold text-sm">
                No se encontraron alumnos con los filtros actuales
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-1 px-2">
                <button
                  onClick={handleToggleList}
                  className="text-xs text-slate-400 hover:text-[#d32f2f] transition-colors flex items-center gap-1.5 font-black uppercase tracking-wider"
                >
                  Contraer lista <ChevronUp size={12} />
                </button>
              </div>
              {filteredAndSorted.map((s, i) => (
                <StudentRow
                  key={s.codigo}
                  student={s}
                  courseName={getCourseName(s.cursoId)}
                  onSelect={setSelectedStudent}
                  index={i}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Student Modal rendering */}
      {selectedStudent && (
        <Suspense fallback={null}>
          <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </Suspense>
      )}
    </div>
  );
}
