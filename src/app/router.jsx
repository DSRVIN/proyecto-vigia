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
const CalificacionesPage = lazy(() => import('../features/docente/CalificacionesPage.jsx'));
const AsistenciasPage = lazy(() => import('../features/docente/AsistenciasPage.jsx'));
const ReportesPage = lazy(() => import('../features/docente/ReportesPage.jsx'));
const CalendarioPage = lazy(() => import('../features/docente/CalendarioPage.jsx'));
const MensajeriaPage = lazy(() => import('../features/docente/MensajeriaPage.jsx'));
const RecursosPage = lazy(() => import('../features/docente/RecursosPage.jsx'));

const CallCenterDashboard = lazy(() => import('../features/callcenter/CallCenterDashboard.jsx'));
const LlamadasPage = lazy(() => import('../features/callcenter/LlamadasPage.jsx'));
const TicketsPage = lazy(() => import('../features/callcenter/TicketsPage.jsx'));
const ConversacionesPage = lazy(() => import('../features/callcenter/ConversacionesPage.jsx'));
const IndicadoresPage = lazy(() => import('../features/callcenter/IndicadoresPage.jsx'));
const HistorialPage = lazy(() => import('../features/callcenter/HistorialPage.jsx'));
const AgendaPage = lazy(() => import('../features/callcenter/AgendaPage.jsx'));

const AdminPage = lazy(() => import('../features/admin/AdminPage.jsx'));
const EjecutivoDashboard = lazy(() => import('../features/admin/EjecutivoDashboard.jsx'));
const UsuariosPage = lazy(() => import('../features/admin/UsuariosPage.jsx'));
const DocentesPage = lazy(() => import('../features/admin/DocentesPage.jsx'));
const FacultadesPage = lazy(() => import('../features/admin/FacultadesPage.jsx'));
const RolesPermisosPage = lazy(() => import('../features/admin/RolesPermisosPage.jsx'));
const IntegracionesPage = lazy(() => import('../features/admin/IntegracionesPage.jsx'));

const ConfiguracionPage = lazy(() => import('../features/shared/ConfiguracionPage.jsx'));

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
              { path: '/docente/calificaciones', element: <CalificacionesPage /> },
              { path: '/docente/asistencias', element: <AsistenciasPage /> },
              { path: '/docente/reportes', element: <ReportesPage /> },
              { path: '/docente/calendario', element: <CalendarioPage /> },
              { path: '/docente/mensajeria', element: <MensajeriaPage /> },
              { path: '/docente/recursos', element: <RecursosPage /> },
              { path: '/docente/configuracion', element: <ConfiguracionPage /> },
            ],
          },
          {
            element: <RequireRole allowed={[ROLES.CALLCENTER]} />,
            children: [
              { path: '/callcenter', element: <CallCenterDashboard /> },
              { path: '/callcenter/llamadas', element: <LlamadasPage /> },
              { path: '/callcenter/tickets', element: <TicketsPage /> },
              { path: '/callcenter/conversaciones', element: <ConversacionesPage /> },
              { path: '/callcenter/indicadores', element: <IndicadoresPage /> },
              { path: '/callcenter/historial', element: <HistorialPage /> },
              { path: '/callcenter/agenda', element: <AgendaPage /> },
              { path: '/callcenter/configuracion', element: <ConfiguracionPage /> },
            ],
          },
          {
            element: <RequireRole allowed={[]} />, // solo ADMIN
            children: [
              { path: '/admin', element: <AdminPage /> },
              { path: '/admin/ejecutivo', element: <EjecutivoDashboard /> },
              { path: '/admin/usuarios', element: <UsuariosPage /> },
              { path: '/admin/docentes', element: <DocentesPage /> },
              { path: '/admin/facultades', element: <FacultadesPage /> },
              { path: '/admin/roles', element: <RolesPermisosPage /> },
              { path: '/admin/integraciones', element: <IntegracionesPage /> },
              { path: '/admin/configuracion', element: <ConfiguracionPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
