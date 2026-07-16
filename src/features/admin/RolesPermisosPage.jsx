import React from 'react';
import { Check, Minus, ShieldCheck, GraduationCap, Headphones, Settings } from 'lucide-react';
import PageShell, { Panel } from '../../components/layout/PageShell.jsx';

// Matriz de acceso real del sistema (refleja los guards de src/app/router.jsx)
const MODULOS = [
  { modulo: 'Dashboard docente', docente: true, callcenter: false, admin: true },
  { modulo: 'Secciones y calificaciones', docente: true, callcenter: false, admin: true },
  { modulo: 'Asistencias y reportes', docente: true, callcenter: false, admin: true },
  { modulo: 'Centro de retención', docente: false, callcenter: true, admin: true },
  { modulo: 'Llamadas y tickets', docente: false, callcenter: true, admin: true },
  { modulo: 'Panel administrativo (CRUD)', docente: false, callcenter: false, admin: true },
  { modulo: 'Panel ejecutivo (BI)', docente: false, callcenter: false, admin: true },
  { modulo: 'Gestión de usuarios', docente: false, callcenter: false, admin: true },
  { modulo: 'Roles y permisos', docente: false, callcenter: false, admin: true },
];

const ROLES_META = [
  {
    key: 'docente',
    label: 'Docente',
    icon: GraduationCap,
    desc: 'Gestión académica de sus secciones asignadas.',
    color: 'text-brand-700',
  },
  {
    key: 'callcenter',
    label: 'Call Center',
    icon: Headphones,
    desc: 'Retención y seguimiento de la cartera de estudiantes.',
    color: 'text-brand-700',
  },
  {
    key: 'admin',
    label: 'Administrador',
    icon: Settings,
    desc: 'Control total del sistema y configuración.',
    color: 'text-brand-900',
  },
];

function Cell({ allowed }) {
  return allowed ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
      <Check size={14} className="text-risk-low" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
      <Minus size={14} className="text-slate-300" />
    </span>
  );
}

export default function RolesPermisosPage() {
  return (
    <PageShell
      eyebrow="Administración"
      title="Roles y Permisos"
      description="Matriz de control de acceso (RBAC) del sistema. El rol vive en profiles.role de Supabase y se aplica con guards de ruta y políticas RLS."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {ROLES_META.map((r) => (
          <Panel key={r.key} className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                <r.icon size={18} className={r.color} />
              </div>
              <h3 className="text-sm font-black text-slate-900">{r.label}</h3>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">{r.desc}</p>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                Módulo
              </th>
              {ROLES_META.map((r) => (
                <th
                  key={r.key}
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 text-center"
                >
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULOS.map((m) => (
              <tr key={m.modulo} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-bold text-slate-700">{m.modulo}</td>
                <td className="px-4 py-3 text-center">
                  <Cell allowed={m.docente} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell allowed={m.callcenter} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell allowed={m.admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <p className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-4">
        <ShieldCheck size={14} className="text-risk-low" /> La autorización se aplica en dos capas:
        guards de React Router en el frontend y políticas Row Level Security en Supabase.
      </p>
    </PageShell>
  );
}
