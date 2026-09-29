import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Settings, LayoutDashboard, Headphones, Briefcase, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES, roleHome } from '../../features/auth/roles.js';
import { supabase } from '../../supabaseClient.js';

// Accesos directos a los módulos, solo para el ADMIN y solo en pantallas
// anchas (en el resto viven en la sección "Vistas" del menú lateral).
const NAV_LINKS = [
  { to: '/docente', label: 'Docente', icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { to: '/callcenter', label: 'Call Center', icon: Headphones, roles: [ROLES.ADMIN] },
  { to: '/admin/ejecutivo', label: 'Ejecutivo', icon: Briefcase, roles: [ROLES.ADMIN] },
  { to: '/admin', label: 'Admin', icon: Settings, roles: [ROLES.ADMIN] },
];

const ROLE_LABEL = {
  DOCENTE: 'Docente',
  CALLCENTER: 'Call Center',
  ADMIN: 'Administrador',
};

function initialsOf(nombre = '') {
  return (
    nombre
      .split(' ')
      .filter((w) => w.length > 2 && !w.includes('.'))
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

export default function Header() {
  const { state, actions } = useApp();
  const { currentUser } = state;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const role = currentUser?.role;
  const home = roleHome(role);
  // Contador de la campana: alertas reales de n8n sin atender; si la tabla
  // aún no está sembrada, cae al conteo de estudiantes críticos (demo)
  const alertCount =
    state.alerts.length > 0
      ? state.alerts.filter((a) => !a.atendida).length
      : state.students.filter((s) => s.riesgo === 'CRITICO').length;

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(role));

  // Escritorio: alterna el modo compacto del menú; móvil: abre el cajón
  const handleMenu = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) actions.toggleSidebarCollapsed();
    else actions.toggleSidebar();
  };

  const handleLogout = async () => {
    // Cierra también la sesión persistida de Supabase (no solo el estado local)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error al cerrar sesión de Supabase:', err.message);
    }
    actions.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="h-16 px-3 sm:px-6 flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleMenu}
          aria-label="Menú"
          className="p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* En móvil el logo vive aquí (el menú lateral está oculto) */}
        <button onClick={() => navigate(home)} className="flex items-center gap-2 lg:hidden">
          <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-md" />
          <span className="font-black text-slate-900 tracking-tight">VIGÍA</span>
        </button>

        {currentUser && (
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {visibleLinks.length > 0 && (
              <nav className="hidden xl:flex items-center gap-1 mr-2">
                {visibleLinks.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to;
                  return (
                    <button
                      key={to}
                      onClick={() => navigate(to)}
                      className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  );
                })}
              </nav>
            )}

            <button
              onClick={actions.toggleNotifications}
              aria-label="Alertas"
              className="relative p-2.5 rounded-full text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 bg-risk-critical rounded-full text-[10px] leading-none flex items-center justify-center text-white font-black ring-2 ring-white">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>

            <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="h-9 w-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs select-none ring-2 ring-brand-100">
                {initialsOf(currentUser.nombre)}
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-bold text-slate-900 max-w-[180px] truncate">
                  {currentUser.nombre || 'Usuario'}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {currentUser.codigo} · {ROLE_LABEL[role] || role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="p-2.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
