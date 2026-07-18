import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import NotificationsDrawer from '../../components/layout/NotificationsDrawer.jsx';
import { useStudentsLoader } from '../../features/shared/useStudentsLoader.js';
import { useAlertsLoader } from '../../features/shared/useAlertsLoader.js';

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
  // Carga la cartera de estudiantes una vez tras la autenticación, para
  // todos los roles y cualquier ruta de entrada.
  useStudentsLoader();
  // Alertas reales de n8n (tabla alerts), refrescadas cada minuto
  useAlertsLoader();

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      {/* Barra lateral por rol (visible en pantallas grandes) */}
      <Sidebar />

      {/* Columna de contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>

        <footer className="border-t border-slate-200 py-6 px-6 bg-white/60">
          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 text-sm">VIGÍA</span>
              <span>·</span>
              <span>Sistema de Alerta Temprana Académica</span>
              <span>·</span>
              <span>UTP 2026-I</span>
            </div>
            <div className="flex items-center gap-4">
              <span>v2.0.0 · React + Recharts</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-risk-low rounded-full animate-pulse" />
                Sistema operativo
              </span>
            </div>
          </div>
        </footer>
      </div>

      <NotificationsDrawer />
    </div>
  );
}
