// @vitest-environment jsdom
// Verifica el camino de render CON datos (el que ve producción): monta
// cada página con una cartera de estudiantes y cursos representativa y
// comprueba que no lanza y que pinta contenido real.
import React from 'react';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getEvalConfig } from '../src/data/dataset.js';

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

// Cartera de prueba: cursos reales + estudiantes con todos los campos que
// consumen las páginas (grades, riesgo, asistencia, pagos, intervención).
const courses = [
  {
    id: 'SIST101',
    codigo: 'SIST101',
    nombre: 'Algoritmos',
    seccion: 'G01',
    horario: 'Lun/Mié 08:00-10:00',
    aula: 'H-201',
    creditos: 4,
    ciclo: '2026-I',
  },
  {
    id: 'SIST102',
    codigo: 'SIST102',
    nombre: 'Ingeniería de Software',
    seccion: 'G02',
    horario: 'Vie 14:00-18:00',
    aula: 'H-305',
    creditos: 3,
    ciclo: '2026-I',
  },
];

function makeStudent(i) {
  const cursoId = i % 2 === 0 ? 'SIST101' : 'SIST102';
  const evals = getEvalConfig(cursoId);
  const grades = {};
  evals.forEach((e, j) => (grades[e.key] = j === evals.length - 1 ? null : 10 + ((i + j) % 8)));
  const riesgo = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'][i % 4];
  const pend = i % 3 === 0;
  return {
    codigo: `U2026${1000 + i}`,
    nombre: `Estudiante Prueba ${i} Apellido`,
    carrera: 'Ingeniería de Sistemas',
    ciclo: '4to',
    cursoId,
    grades,
    promedio: 9 + (i % 10),
    notaFinal: 9 + (i % 10),
    asistencia: 55 + ((i * 7) % 45),
    actividadDias: (i * 3) % 25,
    riesgo,
    estado_pago: pend ? 'PENDIENTE' : 'PAGADO',
    detalle_pagos: { cuotas_vencidas: pend ? 2 : 0, monto_pendiente: pend ? 700 : 0 },
    intervenido: i % 5 === 0,
    email: `u2026${1000 + i}@utp.edu.pe`,
  };
}

const students = Array.from({ length: 24 }, (_, i) => makeStudent(i));

const mockState = {
  students,
  courses,
  currentUser: {
    codigo: 'C13005',
    nombre: 'Dr. Carlos Mendoza Paredes',
    role: 'DOCENTE',
    cargo: 'Docente Titular',
    departamento: 'Ing. de Sistemas',
    email: 'c13005@utp.edu.pe',
  },
  teacher: { departamento: 'Ing. de Sistemas', cargo: 'Docente Titular' },
};

vi.mock('../src/context/AppContext.jsx', () => ({
  useApp: () => ({ state: mockState, actions: { toggleNotifications: () => {} } }),
  AppProvider: ({ children }) => children,
}));

import CalificacionesPage from '../src/features/docente/CalificacionesPage.jsx';
import AsistenciasPage from '../src/features/docente/AsistenciasPage.jsx';
import ReportesPage from '../src/features/docente/ReportesPage.jsx';
import CalendarioPage from '../src/features/docente/CalendarioPage.jsx';
import LlamadasPage from '../src/features/callcenter/LlamadasPage.jsx';
import TicketsPage from '../src/features/callcenter/TicketsPage.jsx';
import IndicadoresPage from '../src/features/callcenter/IndicadoresPage.jsx';
import HistorialPage from '../src/features/callcenter/HistorialPage.jsx';
import AgendaPage from '../src/features/callcenter/AgendaPage.jsx';
import UsuariosPage from '../src/features/admin/UsuariosPage.jsx';
import FacultadesPage from '../src/features/admin/FacultadesPage.jsx';
import RolesPermisosPage from '../src/features/admin/RolesPermisosPage.jsx';

afterEach(cleanup);

function renderPage(Page) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>
  );
}

describe('Render con datos poblados', () => {
  const cases = [
    ['Calificaciones', CalificacionesPage, /Calificaciones/i],
    ['Asistencias', AsistenciasPage, /Asistencias/i],
    ['Reportes', ReportesPage, /Reportes/i],
    ['Calendario', CalendarioPage, /Calendario/i],
    ['Llamadas', LlamadasPage, /Cola de Llamadas/i],
    ['Tickets', TicketsPage, /Tickets/i],
    ['Indicadores', IndicadoresPage, /Indicadores/i],
    ['Historial', HistorialPage, /Historial/i],
    ['Agenda', AgendaPage, /Agenda/i],
    ['Usuarios', UsuariosPage, /Usuarios/i],
    ['Facultades', FacultadesPage, /Facultades/i],
    ['Roles', RolesPermisosPage, /Roles/i],
  ];
  for (const [name, Page, heading] of cases) {
    test(`${name} renderiza su encabezado con datos`, () => {
      renderPage(Page);
      expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    });
  }

  test('Calificaciones lista estudiantes de la cartera', () => {
    renderPage(CalificacionesPage);
    expect(screen.getAllByText(/Estudiante Prueba/).length).toBeGreaterThan(0);
  });

  test('Usuarios muestra los cuatro roles demo', () => {
    renderPage(UsuariosPage);
    expect(screen.getByText('Ing. Jorge Ramírez Soto')).toBeTruthy();
  });
});
