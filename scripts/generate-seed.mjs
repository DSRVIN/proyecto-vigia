// scripts/generate-seed.mjs
// Genera supabase/seed.sql de forma DETERMINISTA (PRNG con semilla fija),
// reutilizando las funciones reales de metrics.service para que el promedio,
// la nota final y el riesgo sembrados coincidan exactamente con la app.
//
// Uso:  node scripts/generate-seed.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  getEvalConfig,
  calcPromedio,
  notaVisual,
  calcRiesgo,
  calcNotaNecesaria,
} from '../src/services/metrics.service.js';
import { getCoursesForTeacher } from '../src/data/dataset.js';

// ── PRNG determinista (mulberry32) ───────────────────────────
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260716);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

const firstNames = [
  'Valentina',
  'Andrés',
  'Sofía',
  'Diego',
  'Camila',
  'Rodrigo',
  'Luciana',
  'Sebastián',
  'Isabella',
  'Emiliano',
  'Daniela',
  'Matías',
  'Valeria',
  'Nicolás',
  'Natalia',
  'Tomás',
  'Renata',
  'Felipe',
  'Ariana',
  'Santiago',
  'Mariana',
  'Alejandro',
  'Gabriela',
  'Joaquín',
  'Catalina',
  'Maximiliano',
  'Fernanda',
  'Ignacio',
  'Bruno',
  'Ximena',
  'Mateo',
  'Emma',
  'Lucas',
  'Martina',
  'Leonardo',
  'Mía',
  'Hugo',
  'Zoe',
  'Martín',
  'Alma',
];
const lastNames = [
  'Quispe',
  'Rojas',
  'Mamani',
  'Condori',
  'Huanca',
  'Pilco',
  'Torres',
  'Álvarez',
  'Salazar',
  'Flores',
  'Vargas',
  'Medina',
  'Paz',
  'Mendoza',
  'Chávez',
  'Ramos',
  'Morales',
  'Cabrera',
  'Cáceres',
  'Paredes',
  'Romero',
  'Sánchez',
  'Herrera',
  'Gutiérrez',
  'Reyes',
  'Castillo',
  'Peña',
  'Villanueva',
  'Cruz',
  'López',
  'Vega',
  'Espinoza',
  'Acosta',
  'Aguilar',
  'Toro',
  'Delgado',
  'Montoya',
  'Fuentes',
  'Ríos',
];
const careers = [
  'Ingeniería de Sistemas',
  'Administración',
  'Contabilidad',
  'Derecho',
  'Ingeniería Civil',
  'Psicología',
  'Marketing',
];
const ciclos = ['2do', '4to', '6to', '8vo'];

// Distribución de perfiles de riesgo (suma = 1)
const PROFILE_WEIGHTS = [
  ['good', 0.4],
  ['average', 0.3],
  ['risk_attendance', 0.1],
  ['risk_grades', 0.12],
  ['critical', 0.08],
];

function profileForIndex(i, total) {
  // Reparte los perfiles de forma estable según la posición del alumno.
  const ratio = (i + 0.5) / total;
  let acc = 0;
  for (const [name, w] of PROFILE_WEIGHTS) {
    acc += w;
    if (ratio <= acc) return name;
  }
  return 'good';
}

function baseGradeFor(profile) {
  if (profile === 'good') return between(14, 20);
  if (profile === 'average') return between(11, 14);
  if (profile === 'risk_attendance') return between(12, 17);
  if (profile === 'risk_grades') return between(5, 9);
  return between(0, 5); // critical
}

function attendanceFor(profile) {
  if (profile === 'good') return { asist: between(85, 100), dias: between(1, 4) };
  if (profile === 'average') return { asist: between(75, 85), dias: between(3, 7) };
  if (profile === 'risk_attendance') return { asist: between(50, 64), dias: between(5, 12) };
  if (profile === 'risk_grades') return { asist: between(70, 88), dias: between(5, 14) };
  return { asist: between(20, 49), dias: between(15, 34) }; // critical
}

function sqlStr(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlNum(v) {
  return v === null || v === undefined ? 'null' : Number(v);
}
function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function buildStudents() {
  const rows = [];
  let counter = 0;

  const teachers = [
    { codigo: 'C13005', courses: getCoursesForTeacher('C13005') },
    { codigo: 'C13007', courses: getCoursesForTeacher('C13007') },
  ];

  for (const { codigo: docenteCodigo, courses } of teachers) {
    for (const course of courses) {
      const evals = getEvalConfig(course.id);
      const total = course.alumnos || 30;
      for (let i = 0; i < total; i++) {
        const profile = profileForIndex(i, total);
        const nombre = `${pick(firstNames)} ${pick(lastNames)} ${pick(lastNames)}`;
        const carrera = pick(careers);
        const ciclo = pick(ciclos);
        const { asist, dias } = attendanceFor(profile);

        // Notas por evaluación; la última queda pendiente (null)
        const notas = {};
        evals.forEach((e, j) => {
          if (j === evals.length - 1) {
            notas[e.key] = null;
          } else {
            const g = Math.max(0, Math.min(20, baseGradeFor(profile)));
            notas[e.key] = g;
          }
        });

        const promedio = Number(calcPromedio(notas, evals).toFixed(2));
        const notaFinal = notaVisual(promedio);
        const notaNecesaria = calcNotaNecesaria(notas, evals);
        const riesgo = calcRiesgo(promedio, asist, dias);

        counter += 1;
        const codigoAlumno = `U2026${100000 + counter}`;
        const codeVal = 100000 + counter;
        const pagado = codeVal % 3 !== 0;
        const cuotas = pagado ? 0 : (codeVal % 2) + 1;
        const monto = pagado ? 0 : ((codeVal % 3) + 1) * 350;

        rows.push({
          codigo: codigoAlumno,
          nombre,
          email: `${codigoAlumno.toLowerCase()}@utp.edu.pe`,
          carrera,
          ciclo,
          curso_id: course.id,
          docente_codigo: docenteCodigo,
          asistencia: asist,
          actividad_dias: dias,
          estado_pago: pagado ? 'PAGADO' : 'PENDIENTE',
          monto_pendiente: monto,
          cuotas_vencidas: cuotas,
          notas,
          promedio,
          nota_final: notaFinal,
          nota_necesaria: notaNecesaria,
          riesgo,
        });
      }
    }
  }
  return rows;
}

function toSql(rows) {
  const cols = [
    'codigo',
    'nombre',
    'email',
    'carrera',
    'ciclo',
    'curso_id',
    'docente_codigo',
    'asistencia',
    'actividad_dias',
    'estado_pago',
    'monto_pendiente',
    'cuotas_vencidas',
    'notas',
    'promedio',
    'nota_final',
    'nota_necesaria',
    'riesgo',
  ];
  const lines = [];
  lines.push('-- ============================================================');
  lines.push('-- VIGÍA — Seed de estudiantes (generado por scripts/generate-seed.mjs)');
  lines.push(`-- ${rows.length} estudiantes · determinista · NO editar a mano`);
  lines.push('-- Ejecutar DESPUÉS de setup.sql y migraciones 002 y 003.');
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('delete from public.students;');
  lines.push('');

  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    lines.push(`insert into public.students (${cols.join(', ')}) values`);
    const values = chunk.map((r) => {
      const vals = [
        sqlStr(r.codigo),
        sqlStr(r.nombre),
        sqlStr(r.email),
        sqlStr(r.carrera),
        sqlStr(r.ciclo),
        sqlStr(r.curso_id),
        sqlStr(r.docente_codigo),
        sqlNum(r.asistencia),
        sqlNum(r.actividad_dias),
        sqlStr(r.estado_pago),
        sqlNum(r.monto_pendiente),
        sqlNum(r.cuotas_vencidas),
        sqlJson(r.notas),
        sqlNum(r.promedio),
        sqlNum(r.nota_final),
        sqlNum(r.nota_necesaria),
        sqlStr(r.riesgo),
      ];
      return `  (${vals.join(', ')})`;
    });
    lines.push(values.join(',\n') + ';');
    lines.push('');
  }
  return lines.join('\n');
}

const rows = buildStudents();
const sql = toSql(rows);
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed.sql');
writeFileSync(outPath, sql, 'utf8');

// Resumen por rol/riesgo para control
const byRisk = rows.reduce((acc, r) => ((acc[r.riesgo] = (acc[r.riesgo] || 0) + 1), acc), {});
console.log(`Seed generado: ${rows.length} estudiantes → supabase/seed.sql`);
console.log('Distribución de riesgo:', byRisk);
