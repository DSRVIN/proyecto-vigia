import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = apiKey && apiKey !== 'TU_LLAVE_AQUI' ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Función de contingencia (fallback local) que genera un diagnóstico y correo personalizados
 * altamente detallados y extensos en JavaScript si la API de Gemini no está disponible.
 */
export function obtenerIntervencionFallback(student) {
  const isPending = student.estado_pago === 'PENDIENTE' || (student.detalle_pagos && student.detalle_pagos.cuotas_vencidas > 0);
  const lowGrades = student.promedio < 12 || (student.academic?.promedio_general !== undefined && student.academic.promedio_general < 12);
  const lowAttendance = student.asistencia < 70 || (student.academic?.asistencia_global !== undefined && student.academic.asistencia_global < 0.7);

  // 1. Diagnóstico detallado
  let comentario = `Análisis de Retención (Soporte Local): El estudiante ${student.nombre} (${student.codigo}), matriculado en el ciclo ${student.ciclo || '2do'} de la carrera ${student.carrera || 'Ingeniería'}, se encuentra clasificado con nivel de riesgo ${student.riesgo}. `;
  if (lowGrades) {
    comentario += `Registra un promedio general acumulado de ${student.academic?.promedio_general ?? student.promedio} sobre 20, ubicándose en zona de alerta académica. `;
  }
  if (lowAttendance) {
    comentario += `Su asistencia global del ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}% está por debajo del límite institucional del 70%, exponiéndose a inhabilitación. `;
  }
  if (isPending) {
    comentario += `Financieramente, registra un estado PENDIENTE con ${student.detalle_pagos?.cuotas_vencidas || 1} cuota(s) vencida(s) y un monto acumulado por regularizar de S/. ${student.detalle_pagos?.monto_pendiente || 350.00}. `;
  } else {
    comentario += `Se encuentra al día en sus compromisos financieros. `;
  }
  comentario += `Se sugiere canalizar acompañamiento académico inmediato y facilidades de pago sutiles.`;

  // 2. Asunto institucional
  let asunto = `Acompañamiento Académico y Soporte Estudiantil UTP - Ciclo 2026-I`;
  if (student.riesgo === 'CRITICO' || student.riesgo === 'ALTO') {
    asunto = `🚨 Plan de Apoyo Académico Personalizado UTP - Código U: ${student.codigo}`;
  }

  // 3. Cuerpo del Correo Extenso (3-4 párrafos estructurados)
  let cuerpo = `Estimado/a ${student.nombre},\n\n`;
  cuerpo += `Espero que te encuentres muy bien al recibir este mensaje. Te escribimos de parte de la Oficina de Retención y Acompañamiento Estudiantil de la Universidad Tecnológica del Perú (UTP). Nuestro principal compromiso es brindarte las herramientas y el soporte necesarios para que alcances tus metas profesionales y continúes con éxito tu formación en el ciclo actual.\n\n`;
  
  cuerpo += `Al revisar tu expediente académico del ciclo actual, hemos notado algunos indicadores clave que requieren atención. Tu promedio general se registra en ${student.academic?.promedio_general ?? student.promedio} y tu porcentaje de asistencia global es del ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}%. Específicamente, en tu desglose de asignaturas críticas, observamos el siguiente estado:\n`;
  
  if (student.academic?.cursos && student.academic.cursos.length > 0) {
    student.academic.cursos.forEach(c => {
      cuerpo += `  · ${c.nombre} ➔ Nota actual: ${c.nota.toFixed(1)} | Asistencia: ${Math.round(c.asistencia * 100)}% | Actividad Canvas: ${c.actividad_virtual}\n`;
    });
  } else {
    cuerpo += `  · Desglose de asignaturas: Promedio actual ${student.promedio} (PC1, PC2 y PC3 registradas).\n`;
  }
  cuerpo += `Queremos recordarte que la UTP dispone de un ecosistema completo de apoyo gratuito para ti. Te invitamos a programar tutorías individuales de refuerzo, participar en los talleres de nivelación grupal y solicitar asesoría psicopedagógica personalizada. Puedes acceder a todos estos servicios sin costo alguno a través de tu portal Canvas o reservando tu cupo desde la App UTP+.\n\n`;

  if (isPending) {
    cuerpo += `Por otro lado, visualizamos en el sistema un saldo administrativo pendiente correspondiente a ${student.detalle_pagos?.cuotas_vencidas || 1} cuota(s) vencida(s) por un monto de S/. ${student.detalle_pagos?.monto_pendiente || 350.00} (próximo vencimiento programado para el ${student.detalle_pagos?.proximo_vencimiento || '2026-06-30'}). Entendemos que pueden surgir imprevistos económicos en el camino; por ello, la universidad pone a tu disposición facilidades de refinanciamiento, convenios especiales y planes de pago fraccionados para que puedas regularizar tu estado de manera cómoda y sin recargos. Por favor, respóndenos a este correo o contacta con el Centro de Atención al Estudiante (CAE) para asesorarte paso a paso en el trámite.\n\n`;
  }

  cuerpo += `Tu educación es nuestra absoluta prioridad y estamos aquí para acompañarte en cada paso de tu vida universitaria. Si presentas cualquier tipo de consulta, dificultad tecnológica, académica o administrativa, quedamos a tu entera disposición para conversar o agendar una llamada de orientación personalizada.\n\n`;
  cuerpo += `¡Te enviamos nuestros mejores deseos para tus próximas evaluaciones!\n\n`;
  cuerpo += `Atentamente,\n\n`;
  cuerpo += `Coordinación de Acompañamiento y Retención Estudiantil UTP\n`;
  cuerpo += `Universidad Tecnológica del Perú\n`;
  cuerpo += `Contacto: soporte.retencion@utp.edu.pe`;

  return {
    comentario,
    correo_personalizado: {
      asunto,
      cuerpo
    }
  };
}

export async function generarMensajeIntervencion(student) {
  if (!genAI) {
    console.warn('API Key de Gemini no configurada o inválida. Usando contingencia local.');
    return obtenerIntervencionFallback(student);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
Actúa como un Asesor de Retención Estudiantil de la Universidad Tecnológica del Perú (UTP).
Tu objetivo es realizar un diagnóstico de la situación académica y financiera del estudiante y proponer un correo electrónico formal, motivador e institucional, altamente detallado y personalizado para retener al alumno y brindarle ayuda académica.

Información del Alumno:
- Nombre: ${student.nombre}
- Código U: ${student.codigo}
- Ciclo: ${student.ciclo || '2do'}
- Carrera: ${student.carrera || 'Ingeniería'}
- Riesgo Académico (VIGÍA): ${student.riesgo}
- Estado de Pago: ${student.estado_pago}
- Cuotas Vencidas: ${student.detalle_pagos?.cuotas_vencidas ?? 0}
- Monto Pendiente de Pago: S/. ${student.detalle_pagos?.monto_pendiente ?? 0}
- Próximo Vencimiento de Pago: ${student.detalle_pagos?.proximo_vencimiento ?? 'N/A'}
- Promedio General: ${student.academic?.promedio_general ?? student.promedio ?? 'N/A'}
- Asistencia Global: ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}%
- Actividad en Campus Virtual (Canvas): ${student.academic?.actividad_campus ?? 'N/A'}

Cursos Críticos del estudiante y sus notas actuales:
${(student.academic?.cursos || []).map(c => `- ${c.nombre}: Nota ${c.nota}, Asistencia ${Math.round(c.asistencia * 100)}%, Actividad virtual: ${c.actividad_virtual}`).join('\n')}

Reglas de Negocio de la UTP para Cursos Críticos (por facultad):
- Ingeniería: Cálculo Aplicado a la Física 1 y 2, Matemática para Ingenieros 1 y 2, Principios de Algoritmos, Estructuras de Datos.
- Gestión/Negocios: Contabilidad General, Macroeconomía, Administración para los Negocios.
- Humanidades/Derecho: Comprensión y Redacción de Textos 1 y 2, Introducción al Derecho.

Tareas de Análisis:
1. Diagnóstico Automatizado: Analiza detalladamente si el alumno tiene notas en zona de riesgo (< 12), asistencia baja (< 70% o < 0.70) o baja interacción en Canvas (actividad_virtual o actividad_campus = "Baja").
2. Detección Financiera: Identifica si su estado de pago es PENDIENTE o registra cuotas vencidas en su desglose. Si es así, debes idear una forma empática y sutil de recordárselo sin sonar punitivo ni coercitivo, ofreciendo opciones de refinanciación o facilidades de pago que otorga la universidad.

Propuesta de Correo Electrónico (REQUERIMIENTO DE LARGA EXTENSIÓN):
Redacta un asunto formal, motivador e institucional, y un cuerpo de correo estructurado con saltos de línea (\\n) que tenga entre 3 y 4 párrafos completos (al menos 15-20 líneas en total).
El correo debe ser sumamente cercano, empático y profesional, e incluir obligatoriamente los siguientes datos del estudiante:
- Saludo personalizado por su nombre.
- Mencionar su carrera, ciclo, promedio general y asistencia global.
- Incluir un listado o viñeta con cada uno de sus cursos críticos en riesgo, mostrando la nota, asistencia y actividad virtual de cada uno de ellos de manera clara.
- Si su estado es PENDIENTE de pago, mencionar de manera empática y sutil que registra un pendiente de ${student.detalle_pagos?.cuotas_vencidas || 1} cuota(s) por un monto de S/. ${student.detalle_pagos?.monto_pendiente || 350.00}, y recordarle que la UTP brinda opciones de refinanciación y facilidades de pago para apoyarle en imprevistos.
- Ofrecer y explicar detalladamente los servicios gratuitos de la UTP: tutorías individuales semanales, talleres de reforzamiento académico y sesiones psicopedagógicas, indicándole que puede reservarlos por Canvas o UTP+.
- Cierre motivador alentándole a continuar su carrera e invitándole a responder el correo o agendar una cita.

Devuelve la respuesta ESTRICTAMENTE en formato JSON plano con la siguiente estructura:
{
  "comentario": "Diagnóstico académico y financiero detallado del asesor sobre la situación del alumno...",
  "correo_personalizado": {
    "asunto": "Asunto empático e institucional de la UTP...",
    "cuerpo": "Cuerpo del correo formateado con saltos de línea (usa \\n), personalizado con los datos específicos y cursos afectados..."
  }
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Validar y parsear la respuesta JSON
    try {
      const parsed = JSON.parse(text);
      if (parsed.comentario && parsed.correo_personalizado && parsed.correo_personalizado.asunto && parsed.correo_personalizado.cuerpo) {
        return parsed;
      }
      throw new Error('Formato JSON incompleto.');
    } catch (parseError) {
      console.error('Error parseando JSON de Gemini:', parseError, 'Texto recibido:', text);
      return obtenerIntervencionFallback(student);
    }
  } catch (error) {
    console.error('Error en la llamada a la API de Gemini:', error);
    return obtenerIntervencionFallback(student);
  }
}
