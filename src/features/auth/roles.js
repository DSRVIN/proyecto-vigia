/**
 * Definición central de roles del sistema (RBAC).
 * El rol canónico vive en la tabla `profiles` de Supabase;
 * aquí solo se define la semántica de acceso del frontend.
 * El ADMIN tiene acceso a todos los módulos.
 */

export const ROLES = {
  DOCENTE: 'DOCENTE',
  CALLCENTER: 'CALLCENTER',
  ADMIN: 'ADMIN',
};

const ROLE_HOME = {
  [ROLES.DOCENTE]: '/docente',
  [ROLES.CALLCENTER]: '/callcenter',
  [ROLES.ADMIN]: '/admin',
};

/** Ruta de inicio según el rol del usuario. */
export function roleHome(role) {
  return ROLE_HOME[role] || ROLE_HOME[ROLES.DOCENTE];
}

/** ¿Puede este rol acceder a un módulo restringido a `allowedRoles`? */
export function canAccess(role, allowedRoles) {
  if (role === ROLES.ADMIN) return true;
  return allowedRoles.includes(role);
}

/** Normaliza el rol que llega del perfil (columna opcional en BD antiguas). */
export function normalizeRole(role) {
  const upper = String(role || '').toUpperCase();
  return ROLES[upper] ? upper : ROLES.DOCENTE;
}
