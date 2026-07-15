// tests/roles.test.js
// Pruebas de la semántica de acceso por rol (RBAC del frontend)
import { describe, test, expect } from 'vitest';
import { ROLES, roleHome, canAccess, normalizeRole } from '../src/features/auth/roles';

describe('roleHome — módulo de inicio según rol', () => {
  test('Cada rol aterriza en su propio módulo', () => {
    expect(roleHome(ROLES.DOCENTE)).toBe('/docente');
    expect(roleHome(ROLES.CALLCENTER)).toBe('/callcenter');
    expect(roleHome(ROLES.ADMIN)).toBe('/admin');
  });

  test('Un rol desconocido o ausente cae al módulo docente', () => {
    expect(roleHome(undefined)).toBe('/docente');
    expect(roleHome('OTRO')).toBe('/docente');
  });
});

describe('canAccess — matriz de acceso', () => {
  test('El ADMIN accede a todos los módulos', () => {
    expect(canAccess(ROLES.ADMIN, [ROLES.DOCENTE])).toBe(true);
    expect(canAccess(ROLES.ADMIN, [ROLES.CALLCENTER])).toBe(true);
    expect(canAccess(ROLES.ADMIN, [])).toBe(true);
  });

  test('El DOCENTE solo accede a su módulo', () => {
    expect(canAccess(ROLES.DOCENTE, [ROLES.DOCENTE])).toBe(true);
    expect(canAccess(ROLES.DOCENTE, [ROLES.CALLCENTER])).toBe(false);
    expect(canAccess(ROLES.DOCENTE, [])).toBe(false);
  });

  test('El CALLCENTER solo accede a su módulo', () => {
    expect(canAccess(ROLES.CALLCENTER, [ROLES.CALLCENTER])).toBe(true);
    expect(canAccess(ROLES.CALLCENTER, [ROLES.DOCENTE])).toBe(false);
  });
});

describe('normalizeRole — tolerancia a datos de BD antiguas', () => {
  test('Normaliza mayúsculas/minúsculas', () => {
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('Callcenter')).toBe('CALLCENTER');
  });

  test('Rol nulo o inválido cae a DOCENTE', () => {
    expect(normalizeRole(null)).toBe('DOCENTE');
    expect(normalizeRole(undefined)).toBe('DOCENTE');
    expect(normalizeRole('SUPERUSER')).toBe('DOCENTE');
  });
});
