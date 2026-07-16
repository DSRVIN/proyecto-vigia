import { useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES } from '../auth/roles.js';
import { getEvalConfig, getStudentsForTeacher, enrichStudentData } from '../../data/dataset.js';

const ACTIVIDAD_DEMO = [
  { mes: 'Feb', accesos: 20 },
  { mes: 'Mar', accesos: 18 },
  { mes: 'Abr', accesos: 15 },
  { mes: 'May', accesos: 10 },
];

const COLUMNS =
  'codigo, nombre, email, carrera, ciclo, curso_id, docente_codigo, asistencia, ' +
  'actividad_dias, estado_pago, monto_pendiente, cuotas_vencidas, notas, promedio, ' +
  'nota_final, nota_necesaria, riesgo';

/** Convierte una fila de Supabase al modelo de estudiante de la app. */
export function mapDbStudent(st) {
  const cursoId = st.curso_id || 'SIST101';
  const evals = getEvalConfig(cursoId);
  const ultima = evals[evals.length - 1];
  return enrichStudentData({
    codigo: st.codigo,
    nombre: st.nombre,
    email: st.email || `${st.codigo?.toLowerCase()}@utp.edu.pe`,
    carrera: st.carrera,
    ciclo: st.ciclo,
    cursoId,
    grades: st.notas || {},
    asistencia: st.asistencia ?? 75,
    actividadDias: st.actividad_dias ?? 5,
    estado_pago: st.estado_pago,
    promedio: st.promedio ?? 0,
    notaFinal: st.nota_final ?? 0,
    riesgo: st.riesgo || 'BAJO',
    notaNecesaria: st.nota_necesaria ?? null,
    notaNecesariaLabel: ultima?.label || 'Evaluación Final',
    notaNecesariaKey: ultima?.key || null,
    notaNecesariaWeight: ultima?.weight || 0,
    actividadMensual: ACTIVIDAD_DEMO,
  });
}

/** Cartera de demostración si la base de datos aún no está sembrada. */
function fallbackMock(user) {
  if (user?.role === ROLES.DOCENTE) return getStudentsForTeacher(user.codigo);
  // Call center y admin gestionan la cartera completa de la sede
  return [...getStudentsForTeacher('C13005'), ...getStudentsForTeacher('C13007')];
}

/**
 * Carga los estudiantes una sola vez tras la autenticación, para CUALQUIER
 * rol y ruta de entrada (arregla el caso en que un usuario Call Center o
 * Admin entraba directo a su módulo con el contexto vacío). Las políticas
 * RLS de Supabase filtran por rol, así que la misma consulta devuelve solo
 * lo que cada usuario puede ver. Si la BD está vacía o falla, usa la
 * cartera de demostración para que la app siga siendo navegable.
 */
export function useStudentsLoader() {
  const { state, actions } = useApp();
  const codigo = state.currentUser?.codigo;

  useEffect(() => {
    if (!codigo) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.from('students').select(COLUMNS);
        if (error) throw error;
        if (data && data.length > 0) {
          if (!cancelled) actions.setStudents(data.map(mapDbStudent));
          return;
        }
        if (!cancelled) actions.setStudents(fallbackMock(state.currentUser));
      } catch (err) {
        console.warn('[VIGÍA] No se pudo leer students de Supabase, usando demo:', err.message);
        if (!cancelled) actions.setStudents(fallbackMock(state.currentUser));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);
}
