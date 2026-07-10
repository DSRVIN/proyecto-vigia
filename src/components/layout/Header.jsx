import React from 'react';
import { Bell, LogOut, Settings, LayoutDashboard, ChevronRight, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import EjecutivoModule from './EjecutivoModule.jsx';

export default function Header() {
  const { state, actions } = useApp();
  const { currentUser, currentView, selectedCourse } = state;

  const criticalCount = state.students.filter(s => s.riesgo === 'CRITICO').length;
  
  const isDashboard = currentView === 'dashboard';
  const toggleButtonLabel = isDashboard ? 'Vista Admin' : 'Volver al Dashboard';
  const ToggleIcon = isDashboard ? Settings : LayoutDashboard;

  const getBreadcrumb = () => {
    if (currentView === 'dashboard') return null;
    if (currentView === 'admin') return [{ label: 'Dashboard', action: actions.goDashboard }, { label: 'Panel Administrativo' }];
    if (currentView === 'callcenter') return [{ label: 'Dashboard', action: actions.goDashboard }, { label: 'Call Center' }];
    if (currentView === 'ejecutivo') return [{ label: 'Dashboard', action: actions.goDashboard }, { label: 'Panel Ejecutivo' }];
    if (currentView === 'section' && selectedCourse) return [
      { label: 'Dashboard', action: actions.goDashboard },
      { label: selectedCourse.nombre }
    ];
    return null;
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer select-none" onClick={actions.goDashboard}>
              <div className="flex gap-0.5">
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">U</span>
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">T</span>
                <span className="bg-slate-900 text-white w-7 h-7 flex items-center justify-center rounded-sm font-black text-sm border border-slate-950">P</span>
              </div>
              <span className="text-[#d32f2f] font-black text-xl mx-1">+</span>
              <span className="text-slate-900 font-black text-xl tracking-tight">VIGÍA</span>
            </div>

            {breadcrumb && (
              <div className="hidden md:flex items-center gap-2 ml-4 text-sm font-bold text-slate-400 border-l border-slate-200 pl-4">
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
                    {crumb.action ? (
                      <button onClick={crumb.action} className="hover:text-blue-600 transition-colors">{crumb.label}</button>
                    ) : (
                      <span className="text-slate-700">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {currentUser && (
            <div className="flex items-center gap-4">
              <button onClick={actions.toggleNotifications} className="relative p-2 text-slate-500 hover:text-[#d32f2f] hover:bg-red-50 rounded-lg transition-colors">
                <Bell size={18} />
                {criticalCount > 0 && <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#d32f2f] rounded-full text-[10px] flex items-center justify-center text-white font-black">{criticalCount}</span>}
              </button>

              <div className="h-6 w-px bg-slate-300" />

              <EjecutivoModule />

              <button onClick={actions.goCallCenter} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                <Headphones size={14} />
                CALL CENTER
              </button>

              <button onClick={isDashboard ? actions.goAdmin : actions.goDashboard} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                <ToggleIcon size={14} />
                {toggleButtonLabel}
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  {/* AQUÍ TOMA EL NOMBRE REAL DEL USUARIO */}
                  <p className="text-xs font-black text-slate-900">{currentUser.nombre || 'Usuario'}</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">{currentUser.codigo}</p>
                </div>
                <button onClick={actions.logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-slate-900 to-[#d32f2f]" />
    </header>
  );
}