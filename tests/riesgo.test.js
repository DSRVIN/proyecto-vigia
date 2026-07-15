// tests/riesgo.test.js
// Pruebas de la función clasificarRiesgo() — lógica central de VIGÍA
// Casos definidos en el documento APF1, sección 15.2
import { describe, test, expect } from 'vitest';
import { clasificarRiesgo } from '../src/lib/clasificarRiesgo';

describe('Módulo de Clasificación de Riesgo Académico', () => {
  // ── Caso 1: Riesgo Alto ────────────────────────────────────
  test('Debe retornar ALTO si inasistencia > 30% y logins < 3/semana', () => {
    const alumno = { inasistencia: 0.45, loginsSemanales: 2, participacionForos: 0 };
    expect(clasificarRiesgo(alumno)).toBe('Alto');
  });

  // ── Caso 2: Riesgo Medio ───────────────────────────────────
  test('Debe retornar MEDIO si inasistencia está entre 15-30%', () => {
    const alumno = { inasistencia: 0.22, loginsSemanales: 5, participacionForos: 1 };
    expect(clasificarRiesgo(alumno)).toBe('Medio');
  });

  // ── Caso 3: Riesgo Bajo ────────────────────────────────────
  test('Debe retornar BAJO si inasistencia < 15% y logins regulares', () => {
    const alumno = { inasistencia: 0.08, loginsSemanales: 10, participacionForos: 3 };
    expect(clasificarRiesgo(alumno)).toBe('Bajo');
  });

  // ── Caso 4: Participación en foros = 0 sube el riesgo ─────
  test('Foros = 0 debe incrementar el nivel de riesgo base', () => {
    const alumno = { inasistencia: 0.1, loginsSemanales: 8, participacionForos: 0 };
    const nivel = clasificarRiesgo(alumno);
    expect(['Medio', 'Alto']).toContain(nivel);
  });

  // ── Caso 5: Datos incompletos / edge case ──────────────────
  test('Debe manejar datos nulos sin lanzar excepción', () => {
    const alumno = { inasistencia: null, loginsSemanales: undefined, participacionForos: 0 };
    expect(() => clasificarRiesgo(alumno)).not.toThrow();
  });
});
