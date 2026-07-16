import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Settings, LayoutDashboard, Headphones, Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES, roleHome } from '../../features/auth/roles.js';

// Módulos navegables desde el header, restringidos por rol.
// Solo el ADMIN ve la barra completa; docente y call center
// operan dentro de su propio módulo.
const NAV_LINKS = [
  { to: '/docente', label: 'DOCENTE', icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { to: '/callcenter', label: 'CALL CENTER', icon: Headphones, roles: [ROLES.ADMIN] },
  { to: '/admin/ejecutivo', label: 'EJECUTIVO', icon: Briefcase, roles: [ROLES.ADMIN] },
  { to: '/admin', label: 'ADMIN', icon: Settings, roles: [ROLES.ADMIN] },
];

export default function Header() {
  const { state, actions } = useApp();
  const { currentUser } = state;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const role = currentUser?.role;
  const home = roleHome(role);
  const criticalCount = state.students.filter((s) => s.riesgo === 'CRITICO').length;

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(role));

  const handleLogout = () => {
    actions.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* En pantallas grandes el logo vive en el sidebar */}
            <div
              className="flex items-center gap-1 cursor-pointer select-none lg:hidden"
              onClick={() => navigate(home)}
            >
              <div className="flex gap-0.5">
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">
                  U
                </span>
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">
                  T
                </span>
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">
                  P
                </span>
              </div>
              <span className="text-[#d32f2f] font-black text-xl mx-1">+</span>
              <span className="text-slate-900 font-black text-xl tracking-tight">VIGÍA</span>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3">
              <button
                onClick={actions.toggleNotifications}
                className="relative p-2 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Bell size={18} />
                {criticalCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-risk-critical rounded-full text-[10px] flex items-center justify-center text-white font-black">
                    {criticalCount}
                  </span>
                )}
              </button>

              {visibleLinks.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <React.Fragment key={to}>
                    <div className="h-10 w-px bg-brand-200" />
                    <button
                      onClick={() => navigate(to)}
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                        active
                          ? 'bg-brand-700 text-white'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  </React.Fragment>
                );
              })}

              <div className="h-10 w-px bg-brand-200" />

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs select-none">
                  {(currentUser.nombre || 'U')
                    .split(' ')
                    .filter((w) => w.length > 2 && !w.includes('.'))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </div>
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-black text-slate-900">
                    {currentUser.nombre || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">
                    {currentUser.codigo} · {role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-px bg-slate-200" />
    </header>
  );
}
