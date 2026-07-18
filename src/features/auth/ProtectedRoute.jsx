import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { canAccess, roleHome } from './roles.js';

/** Bloquea el árbol de rutas si no hay sesión iniciada. */
export function RequireAuth() {
  const { state } = useApp();

  // Aún no sabemos si hay sesión persistida: no redirigir todavía
  if (!state.authReady) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Restaurando sesión…</p>
        </div>
      </div>
    );
  }

  if (state.authState !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/**
 * Restringe un grupo de rutas a los roles indicados.
 * Un usuario con rol insuficiente es redirigido a su módulo de inicio,
 * nunca a una pantalla de error: el acceso indebido simplemente no existe
 * para él (la capa de seguridad real son las políticas RLS en Supabase).
 */
export function RequireRole({ allowed }) {
  const { state } = useApp();
  const role = state.currentUser?.role;
  if (!canAccess(role, allowed)) {
    return <Navigate to={roleHome(role)} replace />;
  }
  return <Outlet />;
}
