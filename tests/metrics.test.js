// tests/metrics.test.js
// Pruebas de la lógica de métricas académicas usada por el dashboard:
// promedios ponderados, redondeo institucional, nota necesaria y
// clasificación de riesgo operativa (calcRiesgo).
import { describe, test, expect } from 'vitest';
import {
  calcPromedio,
  notaVisual,
  calcNotaNecesaria,
  calcRiesgo,
  getEvalConfig,
  MIN_APPROVAL,
  ROUND_THRESHOLD,
} from '../src/services/metrics.service';

describe('calcPromedio — promedio ponderado por evaluaciones', () => {
  const evals = getEvalConfig('SIST101'); // PC1 20%, PC2 20%, PF 30%, EF 30%

  test('Calcula el promedio ponderado con todas las notas', () => {
    const grades = { pc1: 15, pc2: 15, proyectoFinal: 15, examenFinal: 15 };
    expect(calcPromedio(grades, evals)).toBeCloseTo(15);
  });

  test('Trata las notas faltantes como 0', () => {
    const grades = { pc1: 20 };
    expect(calcPromedio(grades, evals)).toBeCloseTo(4);
  });

  test('Los pesos de cada curso suman 1', () => {
    const cursos = ['SIST101', 'SIST105', 'EDUC201', 'EDUC209'];
    for (const id of cursos) {
      const total = getEvalConfig(id).reduce((s, e) => s + e.weight, 0);
      expect(total).toBeCloseTo(1);
    }
  });
});

describe('notaVisual — redondeo institucional', () => {
  test(`Redondea al mínimo aprobatorio (${MIN_APPROVAL}) desde el umbral ${ROUND_THRESHOLD}`, () => {
    expect(notaVisual(11.5)).toBe(MIN_APPROVAL);
    expect(notaVisual(ROUND_THRESHOLD)).toBe(MIN_APPROVAL);
  });

  test('No redondea por debajo del umbral', () => {
    expect(notaVisual(11.44)).toBeCloseTo(11.44);
  });

  test('No altera promedios ya aprobatorios', () => {
    expect(notaVisual(14.238)).toBeCloseTo(14.24);
  });
});

describe('calcNotaNecesaria — nota requerida en la última evaluación', () => {
  const evals = getEvalConfig('SIST101');

  test('Retorna 0 si el alumno ya aseguró la aprobación', () => {
    const grades = { pc1: 20, pc2: 20, proyectoFinal: 20 };
    expect(calcNotaNecesaria(grades, evals)).toBe(0);
  });

  test('Retorna null si la aprobación es matemáticamente imposible (> 20)', () => {
    const grades = { pc1: 0, pc2: 0, proyectoFinal: 0 };
    expect(calcNotaNecesaria(grades, evals)).toBeNull();
  });

  test('Calcula la nota mínima necesaria en el examen final', () => {
    const grades = { pc1: 12, pc2: 12, proyectoFinal: 12 };
    // Parcial acumulado = 12*0.2 + 12*0.2 + 12*0.3 = 8.4 → falta (11.45-8.4)/0.3
    const needed = calcNotaNecesaria(grades, evals);
    expect(needed).toBeCloseTo(10.17, 1);
  });

  test('Retorna null si no hay evaluaciones configuradas', () => {
    expect(calcNotaNecesaria({}, [])).toBeNull();
  });
});

describe('calcRiesgo — clasificación operativa del dashboard', () => {
  test('CRITICO por promedio < 8, asistencia < 50% o inactividad > 21 días', () => {
    expect(calcRiesgo(7, 90, 0)).toBe('CRITICO');
    expect(calcRiesgo(15, 45, 0)).toBe('CRITICO');
    expect(calcRiesgo(15, 90, 25)).toBe('CRITICO');
  });

  test('ALTO por promedio < 10, asistencia < 65% o inactividad > 14 días', () => {
    expect(calcRiesgo(9, 90, 0)).toBe('ALTO');
    expect(calcRiesgo(15, 60, 0)).toBe('ALTO');
    expect(calcRiesgo(15, 90, 15)).toBe('ALTO');
  });

  test('MEDIO por promedio < 12 o asistencia < 75%', () => {
    expect(calcRiesgo(11, 90, 0)).toBe('MEDIO');
    expect(calcRiesgo(15, 70, 0)).toBe('MEDIO');
  });

  test('BAJO cuando todos los indicadores son saludables', () => {
    expect(calcRiesgo(15, 90, 2)).toBe('BAJO');
  });
});
