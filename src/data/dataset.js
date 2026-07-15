import {
  calcPromedio,
  notaVisual,
  calcRiesgo,
  calcNotaNecesaria,
  getEvalConfig,
  ROUND_THRESHOLD,
  MIN_APPROVAL,
} from '../services/metrics.service.js';

export { ROUND_THRESHOLD, MIN_APPROVAL, getEvalConfig };

function genActividad(base) {
  return [
    { mes: 'Feb', accesos: base + Math.floor(Math.random() * 10) },
    { mes: 'Mar', accesos: base - Math.floor(Math.random() * 8) },
    { mes: 'Abr', accesos: base - Math.floor(Math.random() * 15) },
    { mes: 'May', accesos: Math.max(0, base - Math.floor(Math.random() * 20)) },
  ];
}

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
  'Mia',
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
  'Alvarez',
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
  'Mendívil',
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

function generateStudent(courseId, profile) {
  const code =
    'U' + (20 + Math.floor(Math.random() * 4)) + Math.floor(100000 + Math.random() * 900000);
  const nombre = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const carrera = careers[Math.floor(Math.random() * careers.length)];
  const ciclo = ['2do', '4to', '6to', '8vo'][Math.floor(Math.random() * 4)];

  const evals = getEvalConfig(courseId);
  const grades = {};

  evals.forEach((e) => {
    let base;
    if (profile === 'good') {
      base = 14 + Math.floor(Math.random() * 7);
    } else if (profile === 'average') {
      base = 11 + Math.floor(Math.random() * 4);
    } else if (profile === 'risk_attendance') {
      base = 12 + Math.floor(Math.random() * 6);
    } else if (profile === 'risk_grades') {
      base = 5 + Math.floor(Math.random() * 5);
    } else {
      base = 0 + Math.floor(Math.random() * 6);
    }
    grades[e.key] = Math.min(20, Math.max(0, base));
  });

  // La última evaluación está pendiente (aún no realizada)
  const lastKey = evals[evals.length - 1].key;
  grades[lastKey] = null;

  let asistencia, actividadDias;
  if (profile === 'good') {
    asistencia = 85 + Math.floor(Math.random() * 16);
    actividadDias = 1 + Math.floor(Math.random() * 4);
  } else if (profile === 'average') {
    asistencia = 75 + Math.floor(Math.random() * 11);
    actividadDias = 3 + Math.floor(Math.random() * 5);
  } else if (profile === 'risk_attendance') {
    asistencia = 50 + Math.floor(Math.random() * 15);
    actividadDias = 5 + Math.floor(Math.random() * 8);
  } else if (profile === 'risk_grades') {
    asistencia = 70 + Math.floor(Math.random() * 20);
    actividadDias = 5 + Math.floor(Math.random() * 10);
  } else {
    asistencia = 20 + Math.floor(Math.random() * 30);
    actividadDias = 15 + Math.floor(Math.random() * 20);
  }

  return {
    codigo: code,
    nombre,
    carrera,
    ciclo,
    grades,
    asistencia,
    actividadDias,
    cursoId: courseId,
  };
}

const courseProfilesC13005 = [
  {
    id: 'SIST101',
    counts: { good: 10, average: 15, risk_attendance: 2, risk_grades: 4, critical_abandonment: 1 },
  },
  {
    id: 'SIST102',
    counts: { good: 5, average: 10, risk_attendance: 1, risk_grades: 12, critical_abandonment: 2 },
  },
  {
    id: 'SIST103',
    counts: { good: 15, average: 8, risk_attendance: 0, risk_grades: 2, critical_abandonment: 0 },
  },
  {
    id: 'SIST104',
    counts: { good: 8, average: 12, risk_attendance: 5, risk_grades: 8, critical_abandonment: 3 },
  },
  {
    id: 'SIST105',
    counts: { good: 12, average: 10, risk_attendance: 3, risk_grades: 3, critical_abandonment: 1 },
  },
  {
    id: 'SIST106',
    counts: { good: 9, average: 11, risk_attendance: 2, risk_grades: 5, critical_abandonment: 2 },
  },
  {
    id: 'SIST107',
    counts: { good: 14, average: 7, risk_attendance: 4, risk_grades: 1, critical_abandonment: 0 },
  },
  {
    id: 'SIST108',
    counts: { good: 6, average: 8, risk_attendance: 5, risk_grades: 6, critical_abandonment: 5 },
  },
  {
    id: 'SIST109',
    counts: { good: 11, average: 14, risk_attendance: 1, risk_grades: 3, critical_abandonment: 1 },
  },
];

const courseProfilesC13007 = [
  {
    id: 'EDUC201',
    counts: { good: 8, average: 12, risk_attendance: 3, risk_grades: 5, critical_abandonment: 2 },
  },
  {
    id: 'EDUC202',
    counts: { good: 11, average: 9, risk_attendance: 2, risk_grades: 4, critical_abandonment: 1 },
  },
  {
    id: 'EDUC203',
    counts: { good: 6, average: 14, risk_attendance: 4, risk_grades: 3, critical_abandonment: 1 },
  },
  {
    id: 'EDUC204',
    counts: { good: 13, average: 8, risk_attendance: 1, risk_grades: 2, critical_abandonment: 0 },
  },
  {
    id: 'EDUC205',
    counts: { good: 7, average: 10, risk_attendance: 5, risk_grades: 6, critical_abandonment: 3 },
  },
  {
    id: 'EDUC206',
    counts: { good: 10, average: 11, risk_attendance: 2, risk_grades: 3, critical_abandonment: 1 },
  },
  {
    id: 'EDUC207',
    counts: { good: 9, average: 13, risk_attendance: 3, risk_grades: 4, critical_abandonment: 2 },
  },
  {
    id: 'EDUC208',
    counts: { good: 12, average: 7, risk_attendance: 2, risk_grades: 5, critical_abandonment: 1 },
  },
  {
    id: 'EDUC209',
    counts: { good: 5, average: 11, risk_attendance: 4, risk_grades: 7, critical_abandonment: 3 },
  },
];

function generateStudentsFromProfiles(profiles) {
  const students = [];
  profiles.forEach((cp) => {
    Object.keys(cp.counts).forEach((profile) => {
      for (let i = 0; i < cp.counts[profile]; i++) {
        students.push(generateStudent(cp.id, profile));
      }
    });
  });
  return students;
}

const rawStudentsC13005 = generateStudentsFromProfiles(courseProfilesC13005);
const rawStudentsC13007 = generateStudentsFromProfiles(courseProfilesC13007);

export function enrichStudentData(student, forceRefresh = false) {
  if (student.academic && student.detalle_pagos && !forceRefresh) return student;

  const codeVal = parseInt(student.codigo?.replace(/\D/g, '') || '0', 10);

  const isPaid =
    student.estado_pago?.toUpperCase() === 'PAGADO' ||
    student.estado_pago?.toUpperCase() === 'PAGO' ||
    (student.estado_pago === undefined && codeVal % 3 !== 0);

  const normalizedEstadoPago = isPaid ? 'PAGADO' : 'PENDIENTE';

  const detalle_pagos = isPaid
    ? {
        cuotas_vencidas: 0,
        monto_pendiente: 0.0,
        proximo_vencimiento: '2026-07-30',
      }
    : {
        cuotas_vencidas: (codeVal % 2) + 1,
        monto_pendiente: ((codeVal % 3) + 1) * 350.0,
        proximo_vencimiento: '2026-06-30',
      };

  const asistVal = student.asistencia ?? 75;
  const asistencia_global = Number((asistVal / 100).toFixed(2));

  const inactividadDias = student.actividadDias ?? 5;
  const actividad_campus = inactividadDias > 14 ? 'Baja' : inactividadDias > 7 ? 'Media' : 'Alta';

  const career = student.carrera || 'Ingeniería de Sistemas';
  let academicCursos;

  const avg = student.promedio ?? 11.5;

  const generateCourseGrade = (courseName) => {
    let grade = avg + (Math.random() * 4 - 2);
    grade = Math.max(0, Math.min(20, Number(grade.toFixed(1))));

    let courseAsist = asistencia_global + (Math.random() * 0.1 - 0.05);
    courseAsist = Math.max(0, Math.min(1.0, Number(courseAsist.toFixed(2))));

    const actLevels = ['Baja', 'Media', 'Alta'];
    let actIndex = actLevels.indexOf(actividad_campus);
    if (Math.random() > 0.7) {
      actIndex = Math.max(0, Math.min(2, actIndex + (Math.random() > 0.5 ? 1 : -1)));
    }
    const actividad_virtual = actLevels[actIndex];

    return {
      nombre: courseName,
      nota: grade,
      asistencia: courseAsist,
      actividad_virtual,
    };
  };

  if (career.toLowerCase().includes('ing')) {
    academicCursos = [
      generateCourseGrade('Cálculo Aplicado a la Física 1'),
      generateCourseGrade('Principios de Algoritmos'),
      generateCourseGrade('Matemática para Ingenieros 1'),
    ];
  } else if (
    career.toLowerCase().includes('admin') ||
    career.toLowerCase().includes('cont') ||
    career.toLowerCase().includes('mark')
  ) {
    academicCursos = [
      generateCourseGrade('Contabilidad General'),
      generateCourseGrade('Macroeconomía'),
      generateCourseGrade('Administración para los Negocios'),
    ];
  } else {
    academicCursos = [
      generateCourseGrade('Comprensión y Redacción de Textos 1'),
      generateCourseGrade('Introducción al Derecho'),
    ];
  }

  const promedio_general =
    student.promedio ??
    Number((academicCursos.reduce((acc, c) => acc + c.nota, 0) / academicCursos.length).toFixed(1));

  return {
    ...student,
    estado_pago: normalizedEstadoPago,
    detalle_pagos,
    academic: {
      promedio_general: Number(promedio_general.toFixed(1)),
      asistencia_global,
      actividad_campus,
      cursos: academicCursos,
    },
  };
}

function enrichRawStudents(rawStudents) {
  return rawStudents.map((s) => {
    const evals = getEvalConfig(s.cursoId);
    const currentGrades = {};
    evals.forEach((e) => {
      currentGrades[e.key] = s.grades[e.key] ?? 0;
    });

    const promedio = calcPromedio(currentGrades, evals);
    const necesita = calcNotaNecesaria(currentGrades, evals);
    const riesgo = calcRiesgo(promedio, s.asistencia, s.actividadDias);
    const ultimaEval = evals[evals.length - 1];

    return enrichStudentData({
      ...s,
      grades: currentGrades,
      promedio,
      notaFinal: notaVisual(promedio),
      riesgo,
      notaNecesaria: necesita,
      notaNecesariaLabel: necesita !== null ? ultimaEval.label : ultimaEval.label,
      notaNecesariaKey: ultimaEval.key,
      notaNecesariaWeight: ultimaEval.weight,
      actividadMensual: genActividad(Math.floor(30 - s.actividadDias * 0.8)),
      email: `${s.codigo.toLowerCase()}@utp.edu.pe`,
      foto: null,
      intervenido: false,
      estado_pago: Math.random() > 0.3 ? 'Pagado' : 'Pendiente',
    });
  });
}

export const STUDENTS_INITIAL = enrichRawStudents(rawStudentsC13005);
const STUDENTS_C13007 = enrichRawStudents(rawStudentsC13007);

export const COURSES_INITIAL = [
  {
    id: 'SIST101',
    nombre: 'Algoritmos y Estructuras de Datos',
    codigo: 'SIST101',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Lun/Mié 08:00-10:00',
    aula: 'H-201',
    alumnos: 32,
    creditos: 4,
  },
  {
    id: 'SIST102',
    nombre: 'Ingeniería de Software I',
    codigo: 'SIST102',
    seccion: 'G02',
    ciclo: '2026-I',
    horario: 'Mar/Jue 10:00-12:00',
    aula: 'H-305',
    alumnos: 30,
    creditos: 3,
  },
  {
    id: 'SIST103',
    nombre: 'Base de Datos Avanzado',
    codigo: 'SIST103',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Vie 14:00-18:00',
    aula: 'Lab-102',
    alumnos: 25,
    creditos: 4,
  },
  {
    id: 'SIST104',
    nombre: 'Curso Integrador II: Sistemas',
    codigo: 'SIST104',
    seccion: 'G03',
    ciclo: '2026-I',
    horario: 'Lun 18:00-22:00',
    aula: 'Lab-205',
    alumnos: 36,
    creditos: 4,
  },
  {
    id: 'SIST105',
    nombre: 'Interacción Hombre-Máquina',
    codigo: 'SIST105',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Mié/Vie 10:00-12:00',
    aula: 'H-402',
    alumnos: 29,
    creditos: 3,
  },
  {
    id: 'SIST106',
    nombre: 'Herramientas del Prototipo',
    codigo: 'SIST106',
    seccion: 'G02',
    ciclo: '2026-I',
    horario: 'Mar 14:00-17:00',
    aula: 'Lab-301',
    alumnos: 29,
    creditos: 3,
  },
  {
    id: 'SIST107',
    nombre: 'Innovación y Transformación Digital',
    codigo: 'SIST107',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Jue 18:00-21:00',
    aula: 'H-501',
    alumnos: 26,
    creditos: 3,
  },
  {
    id: 'SIST108',
    nombre: 'Gestión del Servicio TI',
    codigo: 'SIST108',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Sab 08:00-11:00',
    aula: 'H-203',
    alumnos: 30,
    creditos: 3,
  },
  {
    id: 'SIST109',
    nombre: 'Hojas de Estilo en Cascada Avanzada',
    codigo: 'SIST109',
    seccion: 'G04',
    ciclo: '2026-I',
    horario: 'Lun/Mié 14:00-16:00',
    aula: 'Lab-105',
    alumnos: 30,
    creditos: 3,
  },
];

const COURSES_C13007 = [
  {
    id: 'EDUC201',
    nombre: 'Metodología de la Investigación Científica',
    codigo: 'EDUC201',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Lun/Mié 08:00-10:00',
    aula: 'H-101',
    alumnos: 30,
    creditos: 4,
  },
  {
    id: 'EDUC202',
    nombre: 'Estadística Aplicada a la Educación',
    codigo: 'EDUC202',
    seccion: 'G02',
    ciclo: '2026-I',
    horario: 'Mar/Jue 10:00-12:00',
    aula: 'H-203',
    alumnos: 27,
    creditos: 3,
  },
  {
    id: 'EDUC203',
    nombre: 'Psicología del Aprendizaje',
    codigo: 'EDUC203',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Vie 14:00-18:00',
    aula: 'H-305',
    alumnos: 28,
    creditos: 4,
  },
  {
    id: 'EDUC204',
    nombre: 'Diseño Curricular por Competencias',
    codigo: 'EDUC204',
    seccion: 'G03',
    ciclo: '2026-I',
    horario: 'Lun 18:00-21:00',
    aula: 'H-402',
    alumnos: 24,
    creditos: 3,
  },
  {
    id: 'EDUC205',
    nombre: 'Tecnología Educativa e Innovación',
    codigo: 'EDUC205',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Mié/Vie 10:00-12:00',
    aula: 'Lab-201',
    alumnos: 31,
    creditos: 3,
  },
  {
    id: 'EDUC206',
    nombre: 'Evaluación del Rendimiento Académico',
    codigo: 'EDUC206',
    seccion: 'G02',
    ciclo: '2026-I',
    horario: 'Mar 14:00-17:00',
    aula: 'H-104',
    alumnos: 27,
    creditos: 3,
  },
  {
    id: 'EDUC207',
    nombre: 'Gestión y Liderazgo Educativo',
    codigo: 'EDUC207',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Jue 18:00-21:00',
    aula: 'H-503',
    alumnos: 31,
    creditos: 3,
  },
  {
    id: 'EDUC208',
    nombre: 'Seminario de Tesis I',
    codigo: 'EDUC208',
    seccion: 'G01',
    ciclo: '2026-I',
    horario: 'Sab 08:00-12:00',
    aula: 'H-301',
    alumnos: 27,
    creditos: 4,
  },
  {
    id: 'EDUC209',
    nombre: 'Ética y Responsabilidad Social Universitaria',
    codigo: 'EDUC209',
    seccion: 'G04',
    ciclo: '2026-I',
    horario: 'Lun/Mié 14:00-16:00',
    aula: 'H-202',
    alumnos: 30,
    creditos: 3,
  },
];

export const TEACHER = {
  codigo: 'C13005',
  nombre: 'Dr. Carlos Mendoza Paredes',
  email: 'c13005@utp.edu.pe',
  cargo: 'Docente Titular',
  departamento: 'Ing. de Sistemas',
  avatar: null,
};

const TEACHER_C13007 = {
  codigo: 'C13007',
  nombre: 'Mg. Andrea Salazar Rojas',
  email: 'c13007@utp.edu.pe',
  cargo: 'Docente Titular',
  departamento: 'Ing. de Sistemas',
  avatar: null,
};

export function getCoursesForTeacher(codigo) {
  const code = (codigo || '').toUpperCase();
  if (code === 'C13007') return COURSES_C13007;
  return COURSES_INITIAL;
}

export function getStudentsForTeacher(codigo) {
  const code = (codigo || '').toUpperCase();
  if (code === 'C13007') return STUDENTS_C13007;
  return STUDENTS_INITIAL;
}
