/**
 * Clasificación de riesgo académico según las reglas de negocio del
 * documento APF1 (sección 3.4.1):
 *  - Inasistencia > 30%  → riesgo Medio o Alto.
 *  - Logins semanales por debajo del umbral → el riesgo aumenta.
 *  - Participación en foros igual a 0 → el riesgo se incrementa.
 *
 * @param {object} alumno
 * @param {number|null} alumno.inasistencia        Fracción 0–1 (0.45 = 45% de inasistencia).
 * @param {number|null} alumno.loginsSemanales     Inicios de sesión por semana en la plataforma.
 * @param {number|null} alumno.participacionForos  Participaciones en foros en el periodo.
 * @returns {'Alto'|'Medio'|'Bajo'} Nivel de riesgo del estudiante.
 */

export const UMBRAL_LOGINS_SEMANALES = 3;
export const INASISTENCIA_ALTA = 0.3;
export const INASISTENCIA_MEDIA = 0.15;

export function clasificarRiesgo(alumno) {
  const inasistencia = Number(alumno?.inasistencia) || 0;
  const logins = Number(alumno?.loginsSemanales) || 0;
  const foros = Number(alumno?.participacionForos) || 0;

  // Puntaje base según inasistencia: 0 = bajo, 1 = medio, 2 = alto
  let puntaje;
  if (inasistencia > INASISTENCIA_ALTA) {
    puntaje = 2;
  } else if (inasistencia >= INASISTENCIA_MEDIA) {
    puntaje = 1;
  } else {
    puntaje = 0;
  }

  // Baja interacción con la plataforma incrementa el riesgo
  if (logins < UMBRAL_LOGINS_SEMANALES) puntaje += 1;
  if (foros === 0) puntaje += 1;

  if (puntaje >= 2) return 'Alto';
  if (puntaje === 1) return 'Medio';
  return 'Bajo';
}
