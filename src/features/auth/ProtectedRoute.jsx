import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { canAccess, roleHome } from './roles.js';

/** Bloquea el árbol de rutas si no hay sesión iniciada. */
export function RequireAuth() {
  const { state } = useApp();
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
