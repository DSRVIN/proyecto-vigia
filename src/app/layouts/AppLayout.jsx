import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import NotificationsDrawer from '../../components/layout/NotificationsDrawer.jsx';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Cargando módulo...</p>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-800/60 mt-16 py-6 px-6">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold gradient-text text-sm">VIGÍA</span>
            <span>·</span>
            <span>Sistema de Alerta Temprana Académica</span>
            <span>·</span>
            <span>UTP 2026-I</span>
          </div>
          <div className="flex items-center gap-4">
            <span>v2.0.0 · React + Recharts</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sistema operativo
            </span>
          </div>
        </div>
      </footer>

      <NotificationsDrawer />
    </div>
  );
}
