import { normalizeRole } from './roles.js';

/**
 * Construye el perfil de usuario de la app a partir del usuario de
 * Supabase Auth y (si existe) su fila en la tabla profiles. Se usa en
 * dos lugares: el login (useAuth) y la restauración de sesión al
 * recargar la página (useSessionRestore) — una sola fuente de verdad.
 */
export function buildTeacherProfile(user, profileRow, email) {
  const teacherCode = (email || '').split('@')[0].toUpperCase();

  let defaultNombre = 'Dr. Docente UTP';
  if (teacherCode === 'C13007') {
    defaultNombre = 'Mg. Andrea Salazar Rojas';
  } else if (teacherCode === 'C13005') {
    defaultNombre = 'Dr. Carlos Mendoza Paredes';
  }

  if (profileRow) {
    return {
      ...profileRow,
      nombre:
        !profileRow.nombre || profileRow.nombre === 'Dr. Docente UTP'
          ? defaultNombre
          : profileRow.nombre,
      role: normalizeRole(profileRow.role),
    };
  }

  return {
    codigo: teacherCode,
    nombre: user?.user_metadata?.nombre || defaultNombre,
    email,
    cargo: 'Docente Titular',
    departamento: 'Ing. de Sistemas',
    avatar: null,
    role: normalizeRole(user?.user_metadata?.role),
  };
}
