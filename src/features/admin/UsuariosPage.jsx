import React, { useMemo, useState } from 'react';
import { Search, UserPlus, ShieldCheck } from 'lucide-react';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter((w) => w.length > 2 && !w.includes('.'))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Usuarios del sistema (los mismos que existen en Supabase Auth)
const USUARIOS = [
  {
    codigo: 'C13005',
    nombre: 'Dr. Carlos Mendoza Paredes',
    role: 'DOCENTE',
    dep: 'Ing. de Sistemas',
    estado: 'Activo',
  },
  {
    codigo: 'C13007',
    nombre: 'Mg. Andrea Salazar Rojas',
    role: 'DOCENTE',
    dep: 'Educación',
    estado: 'Activo',
  },
  {
    codigo: 'C20001',
    nombre: 'Lic. María Torres Vega',
    role: 'CALLCENTER',
    dep: 'Consejería Estudiantil',
    estado: 'Activo',
  },
  {
    codigo: 'C30001',
    nombre: 'Ing. Jorge Ramírez Soto',
    role: 'ADMIN',
    dep: 'Dir. Tecnología Educativa',
    estado: 'Activo',
  },
];

const ROLE_BADGE = {
  DOCENTE: 'bg-brand-50 text-brand-700 border-brand-100',
  CALLCENTER: 'bg-amber-50 text-risk-medium border-amber-100',
  ADMIN: 'bg-brand-900/10 text-brand-900 border-brand-200',
};

export default function UsuariosPage() {
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () =>
      USUARIOS.filter(
        (u) =>
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.codigo.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <PageShell
      eyebrow="Gestión"
      title="Usuarios del Sistema"
      description="Cuentas con acceso a VIGÍA, sincronizadas con Supabase Auth y su rol asignado."
      actions={
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 text-white text-xs font-black uppercase tracking-wider opacity-70 cursor-not-allowed"
        >
          <UserPlus size={15} /> Nuevo usuario
        </button>
      }
    >
      <DemoNote>
        Alta y edición de usuarios requieren la service role key en el backend (se gestionará vía
        n8n). Este listado refleja las cuentas reales de Supabase Auth.
      </DemoNote>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Usuarios', value: USUARIOS.length },
          { label: 'Docentes', value: USUARIOS.filter((u) => u.role === 'DOCENTE').length },
          { label: 'Call Center', value: USUARIOS.filter((u) => u.role === 'CALLCENTER').length },
          { label: 'Administradores', value: USUARIOS.filter((u) => u.role === 'ADMIN').length },
        ].map((k) => (
          <Panel key={k.label} className="p-5">
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
              {k.label}
            </p>
            <p className="text-3xl font-black mt-1 text-slate-900">{k.value}</p>
          </Panel>
        ))}
      </div>

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuario…"
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              {['Usuario', 'Código', 'Rol', 'Departamento', 'Estado'].map((h) => (
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
            {rows.map((u) => (
              <tr key={u.codigo} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs">
                      {initials(u.nombre)}
                    </div>
                    <span className="font-bold text-slate-800">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-slate-500">{u.codigo}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${ROLE_BADGE[u.role]}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600 font-semibold">{u.dep}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-risk-low">
                    <ShieldCheck size={13} /> {u.estado}
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
