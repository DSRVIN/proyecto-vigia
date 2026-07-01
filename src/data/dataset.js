// ============================================================
// VIGÍA - Dataset de prueba: 30 estudiantes con datos variados
// Motor de cálculo académico UTP
// ============================================================

import { calcPromedio, notaVisual, calcRiesgo, notaNecesariaPC4, ROUND_THRESHOLD, MIN_APPROVAL } from '../services/metrics.service.js';

export { notaNecesariaPC4, ROUND_THRESHOLD, MIN_APPROVAL };

// Génera historial de actividad mensual
function genActividad(base) {
  return [
    { mes: 'Feb', accesos: base + Math.floor(Math.random() * 10) },
    { mes: 'Mar', accesos: base - Math.floor(Math.random() * 8) },
    { mes: 'Abr', accesos: base - Math.floor(Math.random() * 15) },
    { mes: 'May', accesos: Math.max(0, base - Math.floor(Math.random() * 20)) },
  ];
}

// Generación dinámica de estudiantes para balancear datos realistas
const firstNames = ['Valentina', 'Andrés', 'Sofía', 'Diego', 'Camila', 'Rodrigo', 'Luciana', 'Sebastián', 'Isabella', 'Emiliano', 'Daniela', 'Matías', 'Valeria', 'Nicolás', 'Natalia', 'Tomás', 'Renata', 'Felipe', 'Ariana', 'Santiago', 'Mariana', 'Alejandro', 'Gabriela', 'Joaquín', 'Catalina', 'Maximiliano', 'Fernanda', 'Ignacio', 'Bruno', 'Ximena', 'Mateo', 'Emma', 'Lucas', 'Martina', 'Leonardo', 'Mia', 'Hugo', 'Zoe', 'Martín', 'Alma'];
const lastNames = ['Quispe', 'Rojas', 'Mamani', 'Condori', 'Huanca', 'Pilco', 'Torres', 'Alvarez', 'Salazar', 'Flores', 'Vargas', 'Medina', 'Paz', 'Mendoza', 'Chávez', 'Ramos', 'Morales', 'Cabrera', 'Cáceres', 'Paredes', 'Romero', 'Sánchez', 'Herrera', 'Gutiérrez', 'Reyes', 'Castillo', 'Peña', 'Villanueva', 'Cruz', 'López', 'Vega', 'Espinoza', 'Acosta', 'Mendívil', 'Aguilar', 'Toro', 'Delgado', 'Montoya', 'Fuentes', 'Ríos'];
const careers = ['Ingeniería de Sistemas', 'Administración', 'Contabilidad', 'Derecho', 'Ingeniería Civil', 'Psicología', 'Marketing'];

function generateStudent(courseId, profile) {
  const code = 'U' + (20 + Math.floor(Math.random() * 4)) + Math.floor(100000 + Math.random() * 900000);
  const nombre = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const carrera = careers[Math.floor(Math.random() * careers.length)];
  const ciclo = ['2do', '4to', '6to', '8vo'][Math.floor(Math.random() * 4)];
  
  let PC1, PC2, PC3, asistencia, actividadDias;
  if (profile === 'good') {
    PC1 = 14 + Math.floor(Math.random() * 7);
    PC2 = 14 + Math.floor(Math.random() * 7);
    PC3 = 14 + Math.floor(Math.random() * 7);
    asistencia = 85 + Math.floor(Math.random() * 16);
    actividadDias = 1 + Math.floor(Math.random() * 4);
  } else if (profile === 'average') {
    PC1 = 11 + Math.floor(Math.random() * 4);
    PC2 = 11 + Math.floor(Math.random() * 4);
    PC3 = 11 + Math.floor(Math.random() * 4);
    asistencia = 75 + Math.floor(Math.random() * 11);
    actividadDias = 3 + Math.floor(Math.random() * 5);
  } else if (profile === 'risk_attendance') {
    PC1 = 12 + Math.floor(Math.random() * 6);
    PC2 = 12 + Math.floor(Math.random() * 6);
    PC3 = 12 + Math.floor(Math.random() * 6);
    asistencia = 50 + Math.floor(Math.random() * 15);
    actividadDias = 5 + Math.floor(Math.random() * 8);
  } else if (profile === 'risk_grades') {
    PC1 = 5 + Math.floor(Math.random() * 5);
    PC2 = 5 + Math.floor(Math.random() * 5);
    PC3 = 5 + Math.floor(Math.random() * 5);
    asistencia = 70 + Math.floor(Math.random() * 20);
    actividadDias = 5 + Math.floor(Math.random() * 10);
  } else { // critical_abandonment
    PC1 = 0 + Math.floor(Math.random() * 6);
    PC2 = 0 + Math.floor(Math.random() * 6);
    PC3 = 0 + Math.floor(Math.random() * 6);
    asistencia = 20 + Math.floor(Math.random() * 30);
    actividadDias = 15 + Math.floor(Math.random() * 20);
  }

  return { codigo: code, nombre, carrera, ciclo, PC1, PC2, PC3, PC4: null, asistencia, actividadDias, cursoId: courseId };
}

const courseProfiles = [
  { id: 'SIST101', counts: { good: 10, average: 15, risk_attendance: 2, risk_grades: 4, critical_abandonment: 1 } },
  { id: 'SIST102', counts: { good: 5, average: 10, risk_attendance: 1, risk_grades: 12, critical_abandonment: 2 } },
  { id: 'SIST103', counts: { good: 15, average: 8, risk_attendance: 0, risk_grades: 2, critical_abandonment: 0 } },
  { id: 'SIST104', counts: { good: 8, average: 12, risk_attendance: 5, risk_grades: 8, critical_abandonment: 3 } },
  { id: 'SIST105', counts: { good: 12, average: 10, risk_attendance: 3, risk_grades: 3, critical_abandonment: 1 } },
  { id: 'SIST106', counts: { good: 9, average: 11, risk_attendance: 2, risk_grades: 5, critical_abandonment: 2 } },
  { id: 'SIST107', counts: { good: 14, average: 7, risk_attendance: 4, risk_grades: 1, critical_abandonment: 0 } },
  { id: 'SIST108', counts: { good: 6, average: 8, risk_attendance: 5, risk_grades: 6, critical_abandonment: 5 } },
  { id: 'SIST109', counts: { good: 11, average: 14, risk_attendance: 1, risk_grades: 3, critical_abandonment: 1 } },
];

const rawStudents = [];
courseProfiles.forEach(cp => {
  Object.keys(cp.counts).forEach(profile => {
    for (let i = 0; i < cp.counts[profile]; i++) {
      rawStudents.push(generateStudent(cp.id, profile));
    }
  });
});

// Procesa y enriquece los datos
export function enrichStudentData(student, forceRefresh = false) {
  if (student.academic && student.detalle_pagos && !forceRefresh) return student;

  const codeVal = parseInt(student.codigo?.replace(/\D/g, '') || '0', 10);
  
  // 1. Payment status and details (normalize to PENDIENTE or PAGADO)
  const isPaid = student.estado_pago?.toUpperCase() === 'PAGADO' || 
                 student.estado_pago?.toUpperCase() === 'PAGO' ||
                 (student.estado_pago === undefined && codeVal % 3 !== 0);
                 
  const normalizedEstadoPago = isPaid ? 'PAGADO' : 'PENDIENTE';

  const detalle_pagos = isPaid ? {
    cuotas_vencidas: 0,
    monto_pendiente: 0.00,
    proximo_vencimiento: '2026-07-30'
  } : {
    cuotas_vencidas: (codeVal % 2) + 1, // 1 or 2 overdue cuotas
    monto_pendiente: ((codeVal % 3) + 1) * 350.00, // 350, 700, or 1050
    proximo_vencimiento: '2026-06-30'
  };

  // 2. Academic general statistics
  const asistVal = student.asistencia ?? 75;
  const asistencia_global = Number((asistVal / 100).toFixed(2));
  
  const inactividadDias = student.actividadDias ?? 5;
  const actividad_campus = inactividadDias > 14 ? 'Baja' : inactividadDias > 7 ? 'Media' : 'Alta';

  // 3. Courses selection depending on student's career
  const career = student.carrera || 'Ingeniería de Sistemas';
  let academicCursos = [];
  
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
      actividad_virtual
    };
  };

  if (career.toLowerCase().includes('ing')) {
    academicCursos = [
      generateCourseGrade('Cálculo Aplicado a la Física 1'),
      generateCourseGrade('Principios de Algoritmos'),
      generateCourseGrade('Matemática para Ingenieros 1')
    ];
  } else if (career.toLowerCase().includes('admin') || career.toLowerCase().includes('cont') || career.toLowerCase().includes('mark')) {
    academicCursos = [
      generateCourseGrade('Contabilidad General'),
      generateCourseGrade('Macroeconomía'),
      generateCourseGrade('Administración para los Negocios')
    ];
  } else {
    academicCursos = [
      generateCourseGrade('Comprensión y Redacción de Textos 1'),
      generateCourseGrade('Introducción al Derecho')
    ];
  }

  const promedio_general = student.promedio ?? Number((academicCursos.reduce((acc, c) => acc + c.nota, 0) / academicCursos.length).toFixed(1));

  return {
    ...student,
    estado_pago: normalizedEstadoPago,
    detalle_pagos,
    academic: {
      promedio_general: Number(promedio_general.toFixed(1)),
      asistencia_global,
      actividad_campus,
      cursos: academicCursos
    }
  };
}

export const STUDENTS_INITIAL = rawStudents.map(s => {
  const grades = { PC1: s.PC1, PC2: s.PC2, PC3: s.PC3, PC4: s.PC4 ?? 0 };
  const promedio = calcPromedio({ ...grades, PC4: grades.PC4 });
  const riesgo = calcRiesgo(promedio, s.asistencia, s.actividadDias);
  
  return enrichStudentData({
    ...s,
    grades,
    promedio,
    notaFinal: notaVisual(promedio),
    riesgo,
    necesitaPC4: notaNecesariaPC4({ PC1: s.PC1, PC2: s.PC2, PC3: s.PC3 }),
    actividadMensual: genActividad(Math.floor(30 - s.actividadDias * 0.8)),
    email: `${s.codigo.toLowerCase()}@utp.edu.pe`,
    foto: null,
    intervenido: false,
    estado_pago: Math.random() > 0.3 ? 'Pagado' : 'Pendiente',
  });
});

// Cursos del docente
export const COURSES_INITIAL = [
  { id: 'SIST101', nombre: 'Algoritmos y Estructuras de Datos', codigo: 'SIST101', seccion: 'G01', ciclo: '2026-I', horario: 'Lun/Mié 08:00-10:00', aula: 'H-201', alumnos: 32, creditos: 4 },
  { id: 'SIST102', nombre: 'Ingeniería de Software I', codigo: 'SIST102', seccion: 'G02', ciclo: '2026-I', horario: 'Mar/Jue 10:00-12:00', aula: 'H-305', alumnos: 30, creditos: 3 },
  { id: 'SIST103', nombre: 'Base de Datos Avanzado', codigo: 'SIST103', seccion: 'G01', ciclo: '2026-I', horario: 'Vie 14:00-18:00', aula: 'Lab-102', alumnos: 25, creditos: 4 },
  { id: 'SIST104', nombre: 'Curso Integrador II: Sistemas', codigo: 'SIST104', seccion: 'G03', ciclo: '2026-I', horario: 'Lun 18:00-22:00', aula: 'Lab-205', alumnos: 36, creditos: 4 },
  { id: 'SIST105', nombre: 'Interacción Hombre-Máquina', codigo: 'SIST105', seccion: 'G01', ciclo: '2026-I', horario: 'Mié/Vie 10:00-12:00', aula: 'H-402', alumnos: 29, creditos: 3 },
  { id: 'SIST106', nombre: 'Herramientas del Prototipo', codigo: 'SIST106', seccion: 'G02', ciclo: '2026-I', horario: 'Mar 14:00-17:00', aula: 'Lab-301', alumnos: 29, creditos: 3 },
  { id: 'SIST107', nombre: 'Innovación y Transformación Digital', codigo: 'SIST107', seccion: 'G01', ciclo: '2026-I', horario: 'Jue 18:00-21:00', aula: 'H-501', alumnos: 26, creditos: 3 },
  { id: 'SIST108', nombre: 'Gestión del Servicio TI', codigo: 'SIST108', seccion: 'G01', ciclo: '2026-I', horario: 'Sab 08:00-11:00', aula: 'H-203', alumnos: 30, creditos: 3 },
  { id: 'SIST109', nombre: 'Hojas de Estilo en Cascada Avanzada', codigo: 'SIST109', seccion: 'G04', ciclo: '2026-I', horario: 'Lun/Mié 14:00-16:00', aula: 'Lab-105', alumnos: 30, creditos: 3 },
];

// Docente
export const TEACHER = {
  codigo: 'C13005',
  nombre: 'Dr. Carlos Mendoza Paredes',
  email: 'c13005@utp.edu.pe',
  cargo: 'Docente Titular',
  departamento: 'Ing. de Sistemas',
  avatar: null,
};
