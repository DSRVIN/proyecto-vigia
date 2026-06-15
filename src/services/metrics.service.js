// Pesos de evaluación UTP
export const WEIGHTS = { PC1: 0.20, PC2: 0.20, PC3: 0.20, PC4: 0.40 };
export const MIN_APPROVAL = 12;
export const ROUND_THRESHOLD = 11.45;

// Calcula promedio ponderado
export function calcPromedio(grades) {
  const { PC1, PC2, PC3, PC4 } = grades;
  return PC1 * WEIGHTS.PC1 + PC2 * WEIGHTS.PC2 + PC3 * WEIGHTS.PC3 + PC4 * WEIGHTS.PC4;
}

// Nota visual (aplica redondeo si >= 11.45)
export function notaVisual(promedio) {
  if (promedio >= ROUND_THRESHOLD && promedio < MIN_APPROVAL) return MIN_APPROVAL;
  return Math.round(promedio * 100) / 100;
}

// Proyecta qué nota necesita en PC4 para alcanzar 11.5 acumulado
export function notaNecesariaPC4(grades) {
  const { PC1, PC2, PC3 } = grades;
  const parcial = PC1 * WEIGHTS.PC1 + PC2 * WEIGHTS.PC2 + PC3 * WEIGHTS.PC3;
  // 11.5 = parcial + PC4 * 0.40 => PC4 = (11.5 - parcial) / 0.40
  const needed = (11.5 - parcial) / 0.40;
  if (needed <= 0) return 0;
  if (needed > 20) return null; // Matemáticamente imposible
  return Math.ceil(needed * 100) / 100;
}

// Determina estado de riesgo
export function calcRiesgo(promedio, asistencia, actividadDias) {
  if (promedio < 8 || asistencia < 50 || actividadDias > 21) return 'CRITICO';
  if (promedio < 10 || asistencia < 65 || actividadDias > 14) return 'ALTO';
  if (promedio < 12 || asistencia < 75) return 'MEDIO';
  return 'BAJO';
}
