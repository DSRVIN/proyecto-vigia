import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { RequireAuth, RequireRole } from '../features/auth/ProtectedRoute.jsx';
import { ROLES, roleHome } from '../features/auth/roles.js';
import LoginPage from '../features/auth/LoginPage.jsx';
import AppLayout from './layouts/AppLayout.jsx';

// Carga diferida por módulo (code-splitting por rol)
const DashboardPage = lazy(() => import('../features/docente/DashboardPage.jsx'));
const SectionPage = lazy(() => import('../features/docente/SectionPage.jsx'));
const KPIStudentsPage = lazy(() => import('../features/docente/KPIStudentsPage.jsx'));
const CallCenterDashboard = lazy(() => import('../features/callcenter/CallCenterDashboard.jsx'));
const AdminPage = lazy(() => import('../features/admin/AdminPage.jsx'));
const EjecutivoDashboard = lazy(() => import('../features/admin/EjecutivoDashboard.jsx'));

/** Redirige la raíz al módulo de inicio del rol de la sesión. */
function RoleHomeRedirect() {
  const { state } = useApp();
  return <Navigate to={roleHome(state.currentUser?.role)} replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <RoleHomeRedirect /> },
          {
            element: <RequireRole allowed={[ROLES.DOCENTE]} />,
            children: [
              { path: '/docente', element: <DashboardPage /> },
              { path: '/docente/curso/:cursoId', element: <SectionPage /> },
              { path: '/docente/kpi/:filter', element: <KPIStudentsPage /> },
            ],
          },
          {
            element: <RequireRole allowed={[ROLES.CALLCENTER]} />,
            children: [{ path: '/callcenter', element: <CallCenterDashboard /> }],
          },
          {
            element: <RequireRole allowed={[]} />, // solo ADMIN
            children: [
              { path: '/admin', element: <AdminPage /> },
              { path: '/admin/ejecutivo', element: <EjecutivoDashboard /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
