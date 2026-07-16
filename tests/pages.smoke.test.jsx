// @vitest-environment jsdom
// Smoke test: cada página de módulo debe montarse sin lanzar excepción,
// incluso con el estado inicial vacío (students/courses/currentUser sin
// datos) — el camino más propenso a fallos de acceso a datos nulos.
import React from 'react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../src/context/AppContext.jsx';

// Recharts mide el contenedor con ResponsiveContainer; en jsdom no hay
// layout, así que lo silenciamos para que el render no dependa del tamaño.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

import CalificacionesPage from '../src/features/docente/CalificacionesPage.jsx';
import AsistenciasPage from '../src/features/docente/AsistenciasPage.jsx';
import ReportesPage from '../src/features/docente/ReportesPage.jsx';
import CalendarioPage from '../src/features/docente/CalendarioPage.jsx';
import MensajeriaPage from '../src/features/docente/MensajeriaPage.jsx';
import RecursosPage from '../src/features/docente/RecursosPage.jsx';
import LlamadasPage from '../src/features/callcenter/LlamadasPage.jsx';
import TicketsPage from '../src/features/callcenter/TicketsPage.jsx';
import ConversacionesPage from '../src/features/callcenter/ConversacionesPage.jsx';
import IndicadoresPage from '../src/features/callcenter/IndicadoresPage.jsx';
import HistorialPage from '../src/features/callcenter/HistorialPage.jsx';
import AgendaPage from '../src/features/callcenter/AgendaPage.jsx';
import UsuariosPage from '../src/features/admin/UsuariosPage.jsx';
import DocentesPage from '../src/features/admin/DocentesPage.jsx';
import FacultadesPage from '../src/features/admin/FacultadesPage.jsx';
import RolesPermisosPage from '../src/features/admin/RolesPermisosPage.jsx';
import IntegracionesPage from '../src/features/admin/IntegracionesPage.jsx';
import ConfiguracionPage from '../src/features/shared/ConfiguracionPage.jsx';
import Sidebar from '../src/components/layout/Sidebar.jsx';

const PAGES = {
  CalificacionesPage,
  AsistenciasPage,
  ReportesPage,
  CalendarioPage,
  MensajeriaPage,
  RecursosPage,
  LlamadasPage,
  TicketsPage,
  ConversacionesPage,
  IndicadoresPage,
  HistorialPage,
  AgendaPage,
  UsuariosPage,
  DocentesPage,
  FacultadesPage,
  RolesPermisosPage,
  IntegracionesPage,
  ConfiguracionPage,
  Sidebar,
};

afterEach(cleanup);

describe('Smoke test de páginas de módulo', () => {
  for (const [name, Page] of Object.entries(PAGES)) {
    test(`${name} se monta sin errores`, () => {
      expect(() =>
        render(
          <MemoryRouter>
            <AppProvider>
              <Page />
            </AppProvider>
          </MemoryRouter>
        )
      ).not.toThrow();
    });
  }
});
