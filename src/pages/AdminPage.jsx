import React, { useState, useMemo } from 'react';
import {
  Users, BookOpen, BarChart2, Plus, Trash2, Edit3, Save, X,
  AlertTriangle, Shield, ArrowLeft, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';

// ── Tab button (Botones estilizados sobre fondo gris) ────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all uppercase tracking-wider border ${
        active
          ? 'bg-[#d32f2f] border-[#b71c1c] text-white shadow-lg shadow-red-200' 
          : 'text-slate-600 border-transparent hover:text-[#d32f2f] hover:bg-white transition-all'
      }`}
    >
      <Icon size={15} />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-md font-black font-mono ${active ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600 border border-slate-300'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Input field helper ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black text-slate-700 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

// Inputs integrados (Gris claro para contrastar dentro de los recuadros blancos)
const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-[#d32f2f] focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner";

// ── Students Tab ────────────────────────────────────────────────────────────
function StudentsTab() {
  const { state, actions } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ codigo: '', nombre: '', carrera: '', ciclo: '', asistencia: 75, actividadDias: 5, PC1: 0, PC2: 0, PC3: 0, PC4: 0, cursoId: state.courses[0]?.id || '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return state.students.filter(s =>
      s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q)
    );
  }, [state.students, search]);

  const handleAdd = () => {
    if (!form.codigo || !form.nombre) return;
    actions.addStudent({ ...form, PC1: +form.PC1, PC2: +form.PC2, PC3: +form.PC3, PC4: +form.PC4, asistencia: +form.asistencia, actividadDias: +form.actividadDias });
    setShowAdd(false);
    setForm({ codigo: '', nombre: '', carrera: '', ciclo: '', asistencia: 75, actividadDias: 5, PC1: 0, PC2: 0, PC3: 0, PC4: 0, cursoId: state.courses[0]?.id || '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código U..." className={`${inputCls} bg-white`} />
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md">
          <Plus size={15} /> Agregar Alumno
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xl animate-fade-in space-y-4">
          <h3 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> Nuevo Estudiante</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Código U"><input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} placeholder="U23123456" className={inputCls} /></Field>
            <Field label="Nombre completo"><input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre Apellido" className={inputCls} /></Field>
            <Field label="Carrera"><input value={form.carrera} onChange={e => setForm(p => ({ ...p, carrera: e.target.value }))} placeholder="Ingeniería de Sistemas" className={inputCls} /></Field>
            <Field label="Ciclo"><input value={form.ciclo} onChange={e => setForm(p => ({ ...p, ciclo: e.target.value }))} placeholder="2do" className={inputCls} /></Field>
            <Field label="Asistencia %"><input type="number" min="0" max="100" value={form.asistencia} onChange={e => setForm(p => ({ ...p, asistencia: e.target.value }))} className={inputCls} /></Field>
            <Field label="Días inactivo"><input type="number" min="0" value={form.actividadDias} onChange={e => setForm(p => ({ ...p, actividadDias: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC1"><input type="number" min="0" max="20" value={form.PC1} onChange={e => setForm(p => ({ ...p, PC1: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC2"><input type="number" min="0" max="20" value={form.PC2} onChange={e => setForm(p => ({ ...p, PC2: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC3"><input type="number" min="0" max="20" value={form.PC3} onChange={e => setForm(p => ({ ...p, PC3: e.target.value }))} className={inputCls} /></Field>
            <Field label="PC4"><input type="number" min="0" max="20" value={form.PC4} onChange={e => setForm(p => ({ ...p, PC4: e.target.value }))} className={inputCls} /></Field>
            <Field label="Curso">
              <select value={form.cursoId} onChange={e => setForm(p => ({ ...p, cursoId: e.target.value }))} className={`${inputCls} bg-slate-50`}>
                {state.courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"><Save size={14} /> Guardar</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-300">Cancelar</button>
          </div>
        </div>
      )}

      {/* Recuadro de la Tabla Blanco sobre Fondo Gris */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Código', 'Nombre', 'Riesgo', 'PC1', 'PC2', 'PC3', 'PC4', 'Promedio', 'Asist.', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(s => (
              <StudentRow key={s.codigo} student={s} editing={editing} setEditing={setEditing} actions={actions} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-14 text-slate-400 text-xs font-bold uppercase tracking-wider bg-white">
            No se encontraron estudiantes
          </div>
        )}
      </div>
    </div>
  );
}

function StudentRow({ student: s, editing, setEditing, actions }) {
  const isEditing = editing === s.codigo;
  const [vals, setVals] = useState({ PC1: s.grades.PC1, PC2: s.grades.PC2, PC3: s.grades.PC3, PC4: s.grades.PC4, asistencia: s.asistencia, actividadDias: s.actividadDias });

  const handleSave = () => {
    actions.updateStudent(s.codigo, {
      grades: { PC1: +vals.PC1, PC2: +vals.PC2, PC3: +vals.PC3, PC4: +vals.PC4 },
      PC1: +vals.PC1, PC2: +vals.PC2, PC3: +vals.PC3, PC4: +vals.PC4,
      asistencia: +vals.asistencia,
      actividadDias: +vals.actividadDias,
    });
    setEditing(null);
  };

  const miniInput = (field) => (
    <input
      type="number" min="0" max={field === 'asistencia' ? 100 : 20}
      value={vals[field]}
      onChange={e => setVals(p => ({ ...p, [field]: e.target.value }))}
      className="w-14 bg-white border border-red-300 focus:border-[#d32f2f] rounded px-2 py-1 text-xs text-slate-900 outline-none text-center font-bold font-mono shadow-inner"
    />
  );

  return (
    <tr className={`transition-all ${isEditing ? 'bg-red-50/60' : 'hover:bg-slate-50/80'}`}>
      <td className="px-4 py-3.5 font-mono text-xs text-slate-600 font-bold">{s.codigo}</td>
      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{s.nombre.split(' ').slice(0, 3).join(' ')}</td>
      <td className="px-4 py-3.5"><RiskBadge level={s.riesgo} size="xs" /></td>
      <td className="px-4 py-3.5">{isEditing ? miniInput('PC1') : <span className={`font-black font-mono ${s.grades.PC1 >= 12 ? 'text-emerald-600' : 'text-red-600'}`}>{s.grades.PC1}</span>}</td>
      <td className="px-4 py-3.5">{isEditing ? miniInput('PC2') : <span className={`font-black font-mono ${s.grades.PC2 >= 12 ? 'text-emerald-600' : 'text-red-600'}`}>{s.grades.PC2}</span>}</td>
      <td className="px-4 py-3.5">{isEditing ? miniInput('PC3') : <span className={`font-black font-mono ${s.grades.PC3 >= 12 ? 'text-emerald-600' : 'text-red-600'}`}>{s.grades.PC3}</span>}</td>
      <td className="px-4 py-3.5">{isEditing ? miniInput('PC4') : <span className={`font-black font-mono ${s.grades.PC4 >= 12 ? 'text-emerald-600' : 'text-slate-400'}`}>{s.grades.PC4 || '—'}</span>}</td>
      <td className="px-4 py-3.5 font-black font-mono text-sm">
        <span className={s.notaFinal >= 12 ? 'text-emerald-600' : s.notaFinal >= 10 ? 'text-amber-600' : 'text-red-600'}>{s.notaFinal}</span>
      </td>
      <td className="px-4 py-3.5">{isEditing ? miniInput('asistencia') : <span className={`font-black font-mono ${s.asistencia >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.asistencia}%</span>}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all"><Save size={13} /></button>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"><X size={13} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(s.codigo)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"><Edit3 size={13} /></button>
              <button onClick={() => { if (confirm(`¿Eliminar a ${s.nombre}?`)) actions.deleteStudent(s.codigo); }} className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-[#d32f2f] hover:bg-red-100 transition-all"><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Courses Tab ─────────────────────────────────────────────────────────────
function CoursesTab() {
  const { state, actions } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: '', nombre: '', codigo: '', seccion: '', ciclo: '2026-I', horario: '', aula: '', alumnos: 0, creditos: 3 });
  const [editForm, setEditForm] = useState({});

  const handleAdd = () => {
    if (!form.id || !form.nombre) return;
    actions.addCourse(form);
    setShowAdd(false);
    setForm({ id: '', nombre: '', codigo: '', seccion: '', ciclo: '2026-I', horario: '', aula: '', alumnos: 0, creditos: 3 });
  };

  const startEdit = (c) => { setEditing(c.id); setEditForm({ ...c }); };
  const saveEdit = () => { actions.updateCourse(editing, editForm); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md">
          <Plus size={15} /> Agregar Curso
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xl animate-fade-in space-y-4">
          <h3 className="text-xs font-black text-[#d32f2f] uppercase tracking-widest">Nuevo Curso</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[ ['id', 'ID único'], ['nombre', 'Nombre del curso'], ['codigo', 'Código'], ['seccion', 'Sección'], ['ciclo', 'Ciclo'], ['horario', 'Horario'], ['aula', 'Aula'] ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
              </Field>
            ))}
            <Field label="Créditos"><input type="number" value={form.creditos} onChange={e => setForm(p => ({ ...p, creditos: +e.target.value }))} className={inputCls} /></Field>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"><Save size={14} /> Guardar</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-300">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {state.courses.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-lg transition-all">
            {editing === c.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[ ['nombre', 'Nombre'], ['seccion', 'Sección'], ['horario', 'Horario'], ['aula', 'Aula'], ['ciclo', 'Ciclo'] ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input value={editForm[key] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
                    </Field>
                  ))}
                  <Field label="Créditos"><input type="number" value={editForm.creditos} onChange={e => setEditForm(p => ({ ...p, creditos: +e.target.value }))} className={inputCls} /></Field>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"><Save size={13} /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-300">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono bg-red-50 px-2 py-0.5 rounded-md text-[#d32f2f] font-bold border border-red-100">{c.codigo}</span>
                    <span className="text-slate-300 font-bold">·</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sección {c.seccion}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base tracking-tight">{c.nombre}</h3>
                  <p className="text-xs font-bold text-slate-600 mt-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                    {c.horario} <span className="text-slate-300">·</span> {c.aula} <span className="text-slate-300">·</span> {c.creditos} créditos
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(c)} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all shadow-sm"><Edit3 size={14} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar este curso?')) actions.deleteCourse(c.id); }} className="p-2 rounded-xl bg-red-50 border border-red-200 text-[#d32f2f] hover:bg-red-100 transition-all shadow-sm"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Grades Tab ──────────────────────────────────────────────────────────────
function GradesTab() {
  const { state, actions } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(state.courses[0]?.id || '');
  const [saving, setSaving] = useState(null);

  const courseStudents = useMemo(
    () => state.students.filter(s => s.cursoId === selectedCourse),
    [state.students, selectedCourse]
  );

  const handleGradeChange = (codigo, pc, value) => {
    const num = Math.min(20, Math.max(0, +value));
    const student = state.students.find(s => s.codigo === codigo);
    if (!student) return;
    const newGrades = { ...student.grades, [pc]: num };
    actions.updateStudent(codigo, { grades: newGrades, [pc]: num });
    setSaving(codigo);
    setTimeout(() => setSaving(null), 800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
        <div className="flex-1">
          <Field label="Seleccionar Curso">
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={`${inputCls} bg-slate-50 max-w-md`}>
              {state.courses.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.seccion}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl h-fit sm:mb-0.5">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-800 font-bold">Los cambios se reflejan en el Dashboard en tiempo real</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Alumno</th>
              <th className="text-left px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Código</th>
              {['PC1 (20%)', 'PC2 (20%)', 'PC3 (20%)', 'PC4 (40%)'].map(h => (
                <th key={h} className="text-center px-4 py-3.5 text-xs font-black text-[#d32f2f] uppercase tracking-widest">{h}</th>
              ))}
              <th className="text-center px-4 py-3.5 text-xs font-black text-emerald-600 uppercase tracking-widest">Promedio</th>
              <th className="text-center px-4 py-3.5 text-xs font-black text-slate-500 uppercase tracking-widest">Riesgo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courseStudents.map(s => (
              <tr key={s.codigo} className={`transition-all ${saving === s.codigo ? 'bg-emerald-50' : 'hover:bg-slate-50/80'}`}>
                <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{s.nombre.split(' ').slice(0, 2).join(' ')}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-600 font-bold">{s.codigo}</td>
                {['PC1', 'PC2', 'PC3', 'PC4'].map(pc => (
                  <td key={pc} className="px-3 py-2 text-center">
                    <input
                      type="number" min="0" max="20" step="0.5"
                      defaultValue={s.grades[pc]}
                      onBlur={e => handleGradeChange(s.codigo, pc, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGradeChange(s.codigo, pc, e.target.value)}
                      className={`w-16 text-center bg-slate-50 border rounded-xl px-2 py-1.5 text-sm font-mono font-black outline-none transition-all shadow-inner
                        ${s.grades[pc] >= 12 ? 'border-emerald-200 text-emerald-600' : s.grades[pc] >= 10 ? 'border-amber-200 text-amber-600' : 'border-red-200 text-red-600'}
                        focus:border-[#d32f2f] focus:bg-white`}
                    />
                  </td>
                ))}
                <td className="px-4 py-3.5 text-center font-black text-base font-mono">
                  <span className={s.notaFinal >= 12 ? 'text-emerald-600' : s.notaFinal >= 10 ? 'text-amber-600' : 'text-red-600'}>
                    {s.notaFinal}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <RiskBadge level={s.riesgo} size="xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courseStudents.length === 0 && (
          <div className="text-center py-14 text-slate-400 text-xs font-bold uppercase tracking-wider bg-white">
            No hay estudiantes en este curso
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Page (Fondo Gris Suave con Recuadros Blancos) ─────────────────
export default function AdminPage() {
  const { state, actions } = useApp();
  const { adminTab } = state;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button onClick={actions.goDashboard} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 mb-4 transition-colors bg-white border border-slate-200 px-3 py-2 rounded-xl w-fit shadow-sm">
          <ArrowLeft size={15} /> Volver al Dashboard
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={16} className="text-[#d32f2f]" />
              <span className="text-[10px] font-black bg-red-50 border border-red-200 text-[#d32f2f] px-2.5 py-0.5 rounded-md uppercase tracking-widest">Panel Protegido</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Panel Administrativo</h1>
            <p className="text-xs text-slate-600 mt-1 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
              CRUD completo <span className="text-slate-300">·</span> Propagación en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl w-fit shadow-md">
            <div className="h-2 w-2 bg-[#d32f2f] rounded-full animate-pulse" />
            <span className="text-xs text-[#d32f2f] font-black font-mono uppercase tracking-wider">Modo Admin — {state.teacher?.codigo || 'Docente'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Contenedor (Blanco Sólido) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-white rounded-2xl border border-slate-200 w-fit shadow-lg">
        <TabBtn active={adminTab === 'students'} onClick={() => actions.setAdminTab('students')} icon={Users} label="Estudiantes" count={state.students.length} />
        <TabBtn active={adminTab === 'courses'} onClick={() => actions.setAdminTab('courses')} icon={BookOpen} label="Cursos" count={state.courses.length} />
        <TabBtn active={adminTab === 'grades'} onClick={() => actions.setAdminTab('grades')} icon={BarChart2} label="Notas en Vivo" />
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {adminTab === 'students' && <StudentsTab />}
        {adminTab === 'courses' && <CoursesTab />}
        {adminTab === 'grades' && <GradesTab />}
      </div>
    </div>
  );
}