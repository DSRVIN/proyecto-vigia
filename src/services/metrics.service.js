export const MIN_APPROVAL = 12;
export const ROUND_THRESHOLD = 11.45;

export const COURSE_EVALUATIONS = {
  SIST101: [
    { key: 'pc1', label: 'PC1', weight: 0.2 },
    { key: 'pc2', label: 'PC2', weight: 0.2 },
    { key: 'proyectoFinal', label: 'Proyecto Final', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.3 },
  ],
  SIST102: [
    { key: 'avance1', label: 'Avance Proyecto 1', weight: 0.15 },
    { key: 'avance2', label: 'Avance Proyecto 2', weight: 0.15 },
    { key: 'proyectoFinal', label: 'Proyecto Final', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  SIST103: [
    { key: 'laboratorio', label: 'Laboratorio', weight: 0.15 },
    { key: 'pc1', label: 'PC1', weight: 0.2 },
    { key: 'pc2', label: 'PC2', weight: 0.2 },
    { key: 'proyectoBD', label: 'Proyecto BD', weight: 0.45 },
  ],
  SIST104: [
    { key: 'avance1', label: 'Avance 1', weight: 0.1 },
    { key: 'avance2', label: 'Avance 2', weight: 0.2 },
    { key: 'sustentacion', label: 'Sustentación', weight: 0.3 },
    { key: 'informeFinal', label: 'Informe Final', weight: 0.4 },
  ],
  SIST105: [
    { key: 'prototipo1', label: 'Prototipo 1', weight: 0.15 },
    { key: 'prototipo2', label: 'Prototipo 2', weight: 0.2 },
    { key: 'pc', label: 'PC', weight: 0.25 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  SIST106: [
    { key: 'ejercicios', label: 'Ejercicios', weight: 0.1 },
    { key: 'pc1', label: 'PC1', weight: 0.2 },
    { key: 'pc2', label: 'PC2', weight: 0.2 },
    { key: 'proyecto', label: 'Proyecto', weight: 0.5 },
  ],
  SIST107: [
    { key: 'participacion', label: 'Participación', weight: 0.1 },
    { key: 'trabajoParcial', label: 'Trabajo Parcial', weight: 0.2 },
    { key: 'trabajoFinal', label: 'Trabajo Final', weight: 0.3 },
    { key: 'examen', label: 'Examen', weight: 0.4 },
  ],
  SIST108: [
    { key: 'foros', label: 'Foros', weight: 0.1 },
    { key: 'pc', label: 'PC', weight: 0.2 },
    { key: 'trabajoAplicativo', label: 'Trabajo Aplicativo', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  SIST109: [
    { key: 'talleres', label: 'Talleres', weight: 0.1 },
    { key: 'pc1', label: 'PC1', weight: 0.2 },
    { key: 'pc2', label: 'PC2', weight: 0.25 },
    { key: 'proyectoWeb', label: 'Proyecto Web', weight: 0.45 },
  ],
  EDUC201: [
    { key: 'avanceTeorico', label: 'Avance Marco Teórico', weight: 0.15 },
    { key: 'avanceMetodologia', label: 'Avance Metodología', weight: 0.15 },
    { key: 'informeFinal', label: 'Informe Final', weight: 0.3 },
    { key: 'examen', label: 'Examen', weight: 0.4 },
  ],
  EDUC202: [
    { key: 'practicas', label: 'Prácticas', weight: 0.15 },
    { key: 'pc1', label: 'PC1', weight: 0.2 },
    { key: 'pc2', label: 'PC2', weight: 0.25 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  EDUC203: [
    { key: 'foros', label: 'Foros', weight: 0.1 },
    { key: 'trabajoGrupal', label: 'Trabajo Grupal', weight: 0.2 },
    { key: 'pc', label: 'PC', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  EDUC204: [
    { key: 'avance1', label: 'Avance 1', weight: 0.15 },
    { key: 'avance2', label: 'Avance 2', weight: 0.15 },
    { key: 'disenoFinal', label: 'Diseño Final', weight: 0.3 },
    { key: 'examen', label: 'Examen', weight: 0.4 },
  ],
  EDUC205: [
    { key: 'practicas', label: 'Prácticas', weight: 0.1 },
    { key: 'proyectoAula', label: 'Proyecto Aula', weight: 0.2 },
    { key: 'pc', label: 'PC', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  EDUC206: [
    { key: 'trabajoParcial', label: 'Trabajo Parcial', weight: 0.2 },
    { key: 'trabajoFinal', label: 'Trabajo Final', weight: 0.25 },
    { key: 'examenParcial', label: 'Examen Parcial', weight: 0.25 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.3 },
  ],
  EDUC207: [
    { key: 'participacion', label: 'Participación', weight: 0.1 },
    { key: 'trabajoAplicativo', label: 'Trabajo Aplicativo', weight: 0.2 },
    { key: 'pc', label: 'PC', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
  EDUC208: [
    { key: 'avanceCap1', label: 'Avance Capítulo I', weight: 0.15 },
    { key: 'avanceCap2', label: 'Avance Capítulo II', weight: 0.15 },
    { key: 'borradorTesis', label: 'Borrador Tesis', weight: 0.3 },
    { key: 'sustentacion', label: 'Sustentación', weight: 0.4 },
  ],
  EDUC209: [
    { key: 'debates', label: 'Debates', weight: 0.1 },
    { key: 'ensayo', label: 'Ensayo', weight: 0.2 },
    { key: 'pc', label: 'PC', weight: 0.3 },
    { key: 'examenFinal', label: 'Examen Final', weight: 0.4 },
  ],
};

export function getEvalConfig(courseId) {
  return COURSE_EVALUATIONS[courseId] || COURSE_EVALUATIONS.SIST101;
}

export function calcPromedio(grades, evals) {
  return evals.reduce((sum, e) => sum + (grades[e.key] || 0) * e.weight, 0);
}

export function notaVisual(promedio) {
  if (promedio >= ROUND_THRESHOLD && promedio < MIN_APPROVAL) return MIN_APPROVAL;
  return Math.round(promedio * 100) / 100;
}

export function calcNotaNecesaria(grades, evals) {
  if (!evals || evals.length === 0) return null;
  const lastEval = evals[evals.length - 1];
  const prevEvals = evals.slice(0, -1);
  const parcial = prevEvals.reduce((sum, e) => sum + (grades[e.key] || 0) * e.weight, 0);
  const needed = (ROUND_THRESHOLD - parcial) / lastEval.weight;
  if (needed <= 0) return 0;
  if (needed > 20) return null;
  return Math.ceil(needed * 100) / 100;
}

export function calcRiesgo(promedio, asistencia, actividadDias) {
  if (promedio < 8 || asistencia < 50 || actividadDias > 21) return 'CRITICO';
  if (promedio < 10 || asistencia < 65 || actividadDias > 14) return 'ALTO';
  if (promedio < 12 || asistencia < 75) return 'MEDIO';
  return 'BAJO';
}
