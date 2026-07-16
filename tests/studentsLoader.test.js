// tests/studentsLoader.test.js
// Verifica la transformación de una fila de Supabase (esquema real) al
// modelo de estudiante que consume la app.
import { describe, test, expect, vi } from 'vitest';

// El hook importa supabaseClient (usa import.meta.env); lo mockeamos para
// aislar la función pura mapDbStudent sin arrancar el cliente real.
vi.mock('../src/supabaseClient.js', () => ({ supabase: {} }));

import { mapDbStudent } from '../src/features/shared/useStudentsLoader.js';

const dbRow = {
  codigo: 'U2026100001',
  nombre: 'Ignacio Castillo Villanueva',
  email: 'u2026100001@utp.edu.pe',
  carrera: 'Ingeniería de Sistemas',
  ciclo: '8vo',
  curso_id: 'SIST101',
  docente_codigo: 'C13005',
  asistencia: 45,
  actividad_dias: 20,
  estado_pago: 'PENDIENTE',
  monto_pendiente: 700,
  cuotas_vencidas: 2,
  notas: { pc1: 8, pc2: 7, proyectoFinal: 6, examenFinal: null },
  promedio: 6.3,
  nota_final: 6.3,
  nota_necesaria: null,
  riesgo: 'CRITICO',
};

describe('mapDbStudent — fila de Supabase → modelo de la app', () => {
  const s = mapDbStudent(dbRow);

  test('Renombra las columnas snake_case a camelCase', () => {
    expect(s.cursoId).toBe('SIST101');
    expect(s.actividadDias).toBe(20);
    expect(s.notaFinal).toBe(6.3);
  });

  test('Usa las notas por evaluación (jsonb) como grades', () => {
    expect(s.grades.pc1).toBe(8);
    expect(s.grades.examenFinal).toBeNull();
  });

  test('Preserva la clasificación de riesgo de la base de datos', () => {
    expect(s.riesgo).toBe('CRITICO');
    expect(s.promedio).toBe(6.3);
  });

  test('enrichStudentData completa academic y detalle_pagos', () => {
    expect(s.academic).toBeDefined();
    expect(s.academic.asistencia_global).toBeCloseTo(0.45);
    expect(s.detalle_pagos).toBeDefined();
    expect(s.estado_pago).toBe('PENDIENTE');
  });

  test('Etiqueta la última evaluación pendiente del curso', () => {
    expect(s.notaNecesariaLabel).toBe('Examen Final');
    expect(s.notaNecesariaKey).toBe('examenFinal');
  });
});
