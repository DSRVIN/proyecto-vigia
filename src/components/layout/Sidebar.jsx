import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Bell,
  ShieldAlert,
  BarChart3,
  Calendar,
  MessageSquare,
  FolderOpen,
  Settings,
  Phone,
  Users,
  Ticket,
  History,
  Building2,
  ShieldCheck,
  LineChart,
  Plug,
  Monitor,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES } from '../../features/auth/roles.js';

/**
 * Barra lateral de navegación por rol.
 * Los tres roles comparten la misma estructura visual (logo, grupos con
 * etiqueta, tarjeta informativa inferior); solo cambian iconos, nombres
 * y el color del ítem activo (azul para docente/call center, azul oscuro
 * para administrador).
 *
 * Los ítems sin funcionalidad implementada se muestran deshabilitados con
 * el chip "Pronto": comunican el roadmap del producto sin simular features.
 */

const NAV_BY_ROLE = {
  [ROLES.DOCENTE]: [
    { items: [{ label: 'Inicio', icon: Home, to: '/docente' }] },
    {
      title: 'Académico',
      items: [
        { label: 'Mis Secciones', icon: BookOpen, to: '/docente' },
        { label: 'Estudiantes', icon: GraduationCap, to: '/docente/kpi/ALL' },
        { label: 'Asistencias', icon: ClipboardCheck, soon: true },
        { label: 'Calificaciones', icon: FileText, soon: true },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { label: 'Alertas', icon: Bell, action: 'alerts' },
        { label: 'Riesgo Académico', icon: ShieldAlert, to: '/docente/kpi/CRITICO' },
        { label: 'Reportes', icon: BarChart3, soon: true },
      ],
    },
    {
      title: 'Organización',
      items: [
        { label: 'Calendario', icon: Calendar, soon: true },
        { label: 'Mensajería', icon: MessageSquare, soon: true },
        { label: 'Recursos', icon: FolderOpen, soon: true },
      ],
    },
    {
      title: 'Sistema',
      items: [{ label: 'Configuración', icon: Settings, soon: true }],
    },
  ],
  [ROLES.CALLCENTER]: [
    { items: [{ label: 'Inicio', icon: Home, to: '/callcenter' }] },
    {
      title: 'Operaciones',
      items: [
        { label: 'Llamadas', icon: Phone, soon: true },
        { label: 'Casos', icon: Users, to: '/callcenter' },
        { label: 'Tickets', icon: Ticket, soon: true },
        { label: 'Conversaciones', icon: MessageSquare, soon: true },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { label: 'Indicadores', icon: BarChart3, soon: true },
        { label: 'Historial', icon: History, soon: true },
        { label: 'Agenda', icon: Calendar, soon: true },
      ],
    },
    {
      title: 'Sistema',
      items: [{ label: 'Configuración', icon: Settings, soon: true }],
    },
  ],
  [ROLES.ADMIN]: [
    { items: [{ label: 'Dashboard', icon: Home, to: '/admin' }] },
    {
      title: 'Gestión',
      items: [
        { label: 'Usuarios', icon: Users, soon: true },
        { label: 'Docentes', icon: GraduationCap, soon: true },
        { label: 'Estudiantes', icon: ClipboardCheck, to: '/admin' },
        { label: 'Facultades', icon: Building2, soon: true },
        { label: 'Cursos', icon: BookOpen, to: '/admin' },
      ],
    },
    {
      title: 'Administración',
      items: [
        { label: 'Roles y permisos', icon: ShieldCheck, soon: true },
        { label: 'Reportes', icon: BarChart3, to: '/admin/ejecutivo' },
        { label: 'Estadísticas', icon: LineChart, to: '/admin/ejecutivo' },
      ],
    },
    {
      title: 'Plataforma',
      items: [
        { label: 'Notificaciones', icon: Bell, action: 'alerts' },
        { label: 'Integraciones', icon: Plug, soon: true },
        { label: 'Configuración', icon: Settings, soon: true },
      ],
    },
  ],
};

// Color del ítem activo por rol (admin usa el azul oscuro institucional)
const ACTIVE_CLASS = {
  [ROLES.DOCENTE]: 'bg-brand-600',
  [ROLES.CALLCENTER]: 'bg-brand-600',
  [ROLES.ADMIN]: 'bg-brand-900',
};

function FooterCard({ role, students, onAlerts, navigate }) {
  if (role === ROLES.CALLCENTER) {
    const pendientes = students.filter(
      (s) => (s.riesgo === 'CRITICO' || s.riesgo === 'ALTO') && !s.intervenido
    ).length;
    const atendidas = students.filter((s) => s.intervenido).length;
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-300 mb-3">
          <BarChart3 size={14} /> Resumen del día
        </p>
        <div className="space-y-1.5 text-xs text-slate-300 font-bold mb-4">
          <p className="flex justify-between">
            <span>Llamadas atendidas</span>
            <span className="text-white">{atendidas}</span>
          </p>
          <p className="flex justify-between">
            <span>Casos pendientes</span>
            <span className="text-white">{pendientes}</span>
          </p>
          <p className="flex justify-between">
            <span>Tiempo promedio</span>
            <span className="text-white">4m 32s</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/callcenter')}
          className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors"
        >
          Ver panel
        </button>
      </div>
    );
  }

  if (role === ROLES.ADMIN) {
    const services = ['Servicios activos', 'Base de datos', 'API', 'Integraciones'];
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-300 mb-3">
          <Monitor size={14} /> Estado del sistema
        </p>
        <div className="space-y-1.5 text-xs text-slate-300 font-bold mb-4">
          {services.map((s) => (
            <p key={s} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-risk-low flex-shrink-0" /> {s}
            </p>
          ))}
        </div>
        <button
          onClick={() => navigate('/admin/ejecutivo')}
          className="w-full py-2 bg-brand-900 hover:bg-brand-800 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors border border-white/10"
        >
          Ver monitoreo
        </button>
      </div>
    );
  }

  // DOCENTE (por defecto)
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-300 mb-2">
        <Lightbulb size={14} /> Consejo del día
      </p>
      <p className="text-xs text-slate-300 font-bold leading-relaxed mb-4">
        Revisa las alertas de riesgo crítico y acompaña a tus estudiantes a tiempo.
      </p>
      <button
        onClick={onAlerts}
        className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors"
      >
        Ver alertas
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const role = state.currentUser?.role;
  const sections = NAV_BY_ROLE[role] || NAV_BY_ROLE[ROLES.DOCENTE];
  const activeClass = ACTIVE_CLASS[role] || ACTIVE_CLASS[ROLES.DOCENTE];

  const handleItem = (item) => {
    if (item.soon) return;
    if (item.action === 'alerts') {
      actions.toggleNotifications();
      return;
    }
    if (item.to) navigate(item.to);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0f1b3d] text-white sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div
        className="flex items-center gap-1 px-5 h-16 cursor-pointer select-none flex-shrink-0"
        onClick={() => navigate('/')}
      >
        <div className="flex gap-0.5">
          {['U', 'T', 'P'].map((l) => (
            <span
              key={l}
              className="bg-white/10 text-white w-6 h-6 flex items-center justify-center rounded-sm font-black text-xs border border-white/20"
            >
              {l}
            </span>
          ))}
        </div>
        <span className="text-[#ff5252] font-black text-lg mx-1">+</span>
        <span className="text-white font-black text-lg tracking-tight">VIGÍA</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {sections.map((section, si) => (
          <div key={section.title || si}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = !item.soon && item.to && pathname === item.to;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItem(item)}
                    disabled={item.soon}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold transition-colors text-left ${
                      active
                        ? `${activeClass} text-white`
                        : item.soon
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.soon && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                        Pronto
                      </span>
                    )}
                    {item.action === 'alerts' &&
                      state.students.filter((s) => s.riesgo === 'CRITICO').length > 0 && (
                        <span className="h-5 min-w-5 px-1 bg-risk-critical rounded-full text-[10px] flex items-center justify-center text-white font-black">
                          {state.students.filter((s) => s.riesgo === 'CRITICO').length}
                        </span>
                      )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Tarjeta informativa inferior */}
      <div className="px-3 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
        <FooterCard
          role={role}
          students={state.students}
          onAlerts={actions.toggleNotifications}
          navigate={navigate}
        />
      </div>
    </aside>
  );
}
