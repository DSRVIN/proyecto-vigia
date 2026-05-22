import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Search, Filter, Users, AlertTriangle, Clock, TrendingUp, Award,
  ArrowLeft, BarChart2, Activity, ChevronUp, ChevronDown, SortAsc
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge, { RISK_CONFIG } from '../components/ui/RiskBadge.jsx';
import { SkeletonStudentRow, SkeletonKPI } from '../components/ui/Skeleton.jsx';

const StudentModal = lazy(() => import('../components/students/StudentModal.jsx'));

// ── KPI Card Adaptado al Estilo Claro ─────────────────────────
function KPICard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-fade-in flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</p>
          <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('400', '50/70').replace('300', '50/70')}`}>
            <Icon size={16} className={color.includes('blue-300') ? 'text-blue-600' : color} />
          </div>
        </div>
        <p className={`text-3xl font-black ${color.includes('blue-300') ? 'text-blue-600' : color}`}>{value}</p>
      </div>
      {sub && <p className="text-xs text-slate-500 font-medium mt-1.5">{sub}</p>}
    </div>
  );
}

// ── Recharts Custom Tooltip Claro ────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-blue-600 font-black">{payload[0].value} alumnos</p>
      </div>
    );
  }
  return null;
};

// ── Charts Panel Adaptado ─────────────────────────────────────
function ChartsPanel({ students }) {
  const riskDist = useMemo(() => {
    const counts = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAJO: 0 };
    students.forEach(s => { counts[s.riesgo] = (counts[s.riesgo] || 0) + 1; });
    return [
      { name: 'Crítico', value: counts.CRITICO, fill: '#d32f2f' },
      { name: 'Alto', value: counts.ALTO, fill: '#f59e0b' },
      { name: 'Medio', value: counts.MEDIO, fill: '#eab308' },
      { name: 'Bajo', value: counts.BAJO, fill: '#22c55e' },
    ];
  }, [students]);

  const gradeDist = useMemo(() => {
    const buckets = [
      { rango: '0-5', count: 0 }, { rango: '6-8', count: 0 },
      { rango: '9-11', count: 0 }, { rango: '12-14', count: 0 },
      { rango: '15-17', count: 0 }, { rango: '18-20', count: 0 },
    ];
    students.forEach(s => {
      const p = s.promedio;
      if (p <= 5) buckets[0].count++;
      else if (p <= 8) buckets[1].count++;
      else if (p <= 11) buckets[2].count++;
      else if (p <= 14) buckets[3].count++;
      else if (p <= 17) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  }, [students]);

  const avgAsistencia = students.length > 0
    ? Math.round(students.reduce((a, s) => a + s.asistencia, 0) / students.length)
    : 0;

  const asistenciaData = [{ name: 'Asistencia', value: avgAsistencia, fill: avgAsistencia >= 75 ? '#22c55e' : avgAsistencia >= 65 ? '#f59e0b' : '#d32f2f' }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
      {/* Risk distribution donut */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> Distribución de Riesgo
        </h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 flex-1">
            {riskDist.map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: r.fill }} />
                  <span className="text-slate-500 font-medium">{r.name}</span>
                </div>
                <span className="font-black text-slate-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade distribution bars */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <BarChart2 size={14} className="text-blue-600" /> Distribución de Promedios
        </h3>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={gradeDist} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="rango" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} width={20} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]}>
              {gradeDist.map((entry, i) => (
                <Cell key={i} fill={entry.rango.startsWith('12') || entry.rango.startsWith('15') || entry.rango.startsWith('18') ? '#22c55e' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance radial */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 self-start flex items-center gap-2">
          <Activity size={14} className="text-violet-600" /> Asistencia Promedio
        </h3>
        <div className="relative">
          <ResponsiveContainer width={130} height={130}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" startAngle={90} endAngle={-270} data={asistenciaData}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${avgAsistencia >= 75 ? 'text-emerald-600' : avgAsistencia >= 65 ? 'text-amber-600' : 'text-[#d32f2f]'}`}>
              {avgAsistencia}%
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">del aula</span>
          </div>
        </div>
        <p className="text-xs text-center font-bold text-slate-500 mt-1">
          {avgAsistencia >= 75 ? '✓ Asistencia saludable' : avgAsistencia >= 65 ? '⚠ Asistencia en riesgo' : '⛔ Asistencia crítica'}
        </p>
      </div>
    </div>
  );
}

// ── Top 5 Critical Adaptado ───────────────────────────────────
function Top5Critical({ students, onSelect }) {
  const top5 = useMemo(() =>
    [...students]
      .filter(s => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO')
      .sort((a, b) => a.promedio - b.promedio)
      .slice(0, 5),
    [students]
  );

  if (top5.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest mb-3 flex items-center gap-2">
        <AlertTriangle size={14} /> Top 5 Alumnos en Riesgo Crítico
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {top5.map((s, i) => (
          <button
            key={s.codigo}
            onClick={() => onSelect(s)}
            className="bg-white rounded-xl p-4 border border-red-100 hover:border-red-300 shadow-sm transition-all text-left group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#d32f2f] to-red-700 flex items-center justify-center text-white text-xs font-black shadow-sm">
                {i + 1}
              </div>
              <RiskBadge level={s.riesgo} size="xs" />
            </div>
            <p className="text-xs font-black text-slate-800 leading-tight mb-1 group-hover:text-slate-900 truncate">
              {s.nombre.split(' ').slice(0, 2).join(' ')}
            </p>
            <p className="text-xs font-mono font-bold text-slate-400">{s.codigo}</p>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <p className="text-lg font-black text-[#d32f2f] font-mono">{s.promedio.toFixed(1)}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">promedio</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Student Row Adaptado ──────────────────────────────────────
function StudentRow({ student, onSelect, index }) {
  const isAbandono = student.actividadDias > 14;
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5 shadow-sm
        ${student.riesgo === 'CRITICO'
          ? 'border-red-200 hover:border-[#d32f2f] bg-red-50/40 hover:bg-red-50'
          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
        } animate-fade-in`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onSelect(student)}
    >
      {/* Avatar */}
      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm
        ${student.riesgo === 'CRITICO' ? 'bg-gradient-to-br from-[#d32f2f] to-red-700' :
          student.riesgo === 'ALTO' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
          student.riesgo === 'MEDIO' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
          'bg-gradient-to-br from-emerald-500 to-teal-600'}`}
      >
        {student.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
      </div>

      {/* Name + code */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-slate-800 group-hover:text-slate-900 truncate">{student.nombre}</p>
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
        <p className="text-xs font-mono font-bold text-slate-400">{student.codigo}</p>
      </div>

      {/* Risk */}
      <div className="hidden sm:block flex-shrink-0">
        <RiskBadge level={student.riesgo} size="xs" pulse={student.riesgo === 'CRITICO'} />
      </div>

      {/* PC grades */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {['PC1', 'PC2', 'PC3'].map(pc => (
          <div key={pc} className="text-center w-10">
            <p className={`text-xs font-black font-mono ${student.grades[pc] >= 12 ? 'text-emerald-600' : student.grades[pc] >= 10 ? 'text-amber-600' : 'text-[#d32f2f]'}`}>
              {student.grades[pc]}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{pc}</p>
          </div>
        ))}
      </div>

      {/* Promedio */}
      <div className="text-right flex-shrink-0 w-16">
        <p className={`text-base font-black font-mono leading-tight ${student.notaFinal >= 12 ? 'text-emerald-600' : student.notaFinal >= 10 ? 'text-amber-600' : 'text-[#d32f2f]'}`}>
          {student.notaFinal}
        </p>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">promedio</p>
      </div>

      {/* Attendance */}
      <div className="hidden lg:block text-right flex-shrink-0 w-14">
        <p className={`text-sm font-black font-mono leading-tight ${student.asistencia >= 75 ? 'text-emerald-600' : student.asistencia >= 65 ? 'text-amber-600' : 'text-[#d32f2f]'}`}>
          {student.asistencia}%
        </p>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">asist.</p>
      </div>
    </div>
  );
}

// ── Main Section Page ─────────────────────────────────────────
export default function SectionPage() {
  const { state, actions } = useApp();
  const { selectedCourse, students } = state;

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [sortField, setSortField] = useState('riesgo');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Lazy loading states
  const [showList, setShowList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  const courseStudents = useMemo(
    () => students.filter(s => s.cursoId === selectedCourse?.id),
    [students, selectedCourse]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = courseStudents;

    if (q) {
      list = list.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.codigo.toLowerCase().includes(q)
      );
    }

    if (filterRisk !== 'ALL') {
      list = list.filter(s => s.riesgo === filterRisk);
    }

    const riskOrder = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortField === 'riesgo') { va = riskOrder[a.riesgo]; vb = riskOrder[b.riesgo]; }
      else if (sortField === 'nombre') { va = a.nombre; vb = b.nombre; return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va); }
      else if (sortField === 'promedio') { va = a.promedio; vb = b.promedio; }
      else if (sortField === 'asistencia') { va = a.asistencia; vb = b.asistencia; }
      else { va = 0; vb = 0; }
      return sortAsc ? va - vb : vb - va;
    });

    return list;
  }, [courseStudents, search, filterRisk, sortField, sortAsc]);

  const kpis = useMemo(() => ({
    total: courseStudents.length,
    criticos: courseStudents.filter(s => s.riesgo === 'CRITICO').length,
    altos: courseStudents.filter(s => s.riesgo === 'ALTO').length,
    abandono: courseStudents.filter(s => s.actividadDias > 14).length,
    aprobados: courseStudents.filter(s => s.notaFinal >= 12).length,
    promedio: courseStudents.length > 0
      ? (courseStudents.reduce((a, s) => a + s.promedio, 0) / courseStudents.length).toFixed(1)
      : '—',
  }), [courseStudents]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }) => sortField === field
    ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : <SortAsc size={12} className="opacity-30" />;

  const handleToggleList = () => {
    if (!showList) {
      setShowList(true);
      setIsListLoading(true);
      setTimeout(() => setIsListLoading(false), 800);
    } else {
      setShowList(false);
    }
  };

  if (!selectedCourse) return null;

  return (
    <div className="min-h-screen bg-slate-100 max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 text-slate-900">
      {/* Back + title */}
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div>
          <button
            onClick={actions.goDashboard}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 mb-3 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
          >
            <ArrowLeft size={15} /> Volver al Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{selectedCourse.nombre}</h1>
          <p className="text-sm font-bold text-slate-500 mt-0.5">
            {selectedCourse.codigo} · Sección {selectedCourse.seccion} · {selectedCourse.ciclo}
            <span className="mx-2 text-slate-300">·</span>
            {selectedCourse.horario}
            <span className="mx-2 text-slate-300">·</span>
            {selectedCourse.aula}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KPICard label="Alumnos" value={kpis.total} icon={Users} color="text-blue-600" sub="matriculados" />
        <KPICard label="Críticos" value={kpis.criticos} icon={AlertTriangle} color="text-[#d32f2f]" sub="intervención urgente" />
        <KPICard label="Riesgo Alto" value={kpis.altos} icon={TrendingUp} color="text-amber-500" sub="seguimiento activo" />
        <KPICard label="Abandono" value={kpis.abandono} icon={Clock} color="text-violet-600" sub="+14 días inactivos" />
        <KPICard label="Aprobados" value={kpis.aprobados} icon={Award} color="text-emerald-600" sub="nota ≥ 12" />
        <KPICard label="Promedio" value={kpis.promedio} icon={BarChart2} color="text-blue-500" sub="grupo" />
      </div>

      {/* Charts */}
      <ChartsPanel students={courseStudents} />

      {/* Top 5 Critical */}
      <Top5Critical students={courseStudents} onSelect={setSelectedStudent} />

      {/* Student list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* List header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Lista Completa de Alumnos
              <span className="text-sm font-bold text-slate-400">({filtered.length} de {courseStudents.length})</span>
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {['ALL', 'CRITICO', 'ALTO', 'MEDIO', 'BAJO'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRisk(r)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all border ${
                      filterRisk === r
                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-black shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 border-transparent bg-transparent'
                    }`}
                  >
                    {r === 'ALL' ? 'Todos' : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          {showList && (
            <div className="relative mt-4 animate-fade-in">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código U (ej. U21317697)..."
                className="w-full bg-white border border-slate-200 focus:border-blue-500/60 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Sort buttons */}
          {showList && (
            <div className="flex items-center gap-2 mt-3.5 animate-fade-in">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Ordenar:</span>
              {[['riesgo', 'Riesgo'], ['promedio', 'Promedio'], ['asistencia', 'Asistencia'], ['nombre', 'Nombre']].map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all border ${
                    sortField === field 
                      ? 'text-blue-600 bg-blue-50 border-blue-200' 
                      : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  {label} <SortIcon field={field} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List body */}
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50/30 min-h-[300px] flex flex-col justify-center">
          {!showList ? (
            <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                <Users size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Lista de Alumnos Oculta</h3>
              <p className="text-sm font-bold text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
                Para optimizar el rendimiento, la lista completa de {courseStudents.length} alumnos se carga bajo demanda.
              </p>
              <button 
                onClick={handleToggleList}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] active:scale-95 shadow-md"
              >
                Cargar lista completa
              </button>
            </div>
          ) : isListLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(6)].map((_, i) => <SkeletonStudentRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex-1 flex flex-col items-center justify-center">
              <Search size={32} className="mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="font-bold text-sm">No se encontraron alumnos</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Intente con otro término de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-1 px-1">
                <button 
                  onClick={handleToggleList}
                  className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 font-black uppercase tracking-wider"
                >
                  Ocultar lista <ChevronUp size={12} />
                </button>
              </div>
              {filtered.map((s, i) => (
                <StudentRow key={s.codigo} student={s} onSelect={setSelectedStudent} index={i} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Student modal */}
      {selectedStudent && (
        <Suspense fallback={null}>
          <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </Suspense>
      )}
    </div>
  );
}