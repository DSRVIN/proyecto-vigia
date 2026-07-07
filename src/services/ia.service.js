import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = apiKey && apiKey !== 'TU_LLAVE_AQUI' ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Función de contingencia (fallback local) que genera un diagnóstico y correo
 * concisos y directos si la API de Gemini no está disponible.
 */
export function obtenerIntervencionFallback(student) {
  const isPending = student.estado_pago === 'PENDIENTE' || (student.detalle_pagos && student.detalle_pagos.cuotas_vencidas > 0);
  const lowGrades = student.promedio < 12 || (student.academic?.promedio_general !== undefined && student.academic.promedio_general < 12);
  const lowAttendance = student.asistencia < 70 || (student.academic?.asistencia_global !== undefined && student.academic.asistencia_global < 0.7);

  // 1. Diagnóstico breve (2-3 oraciones)
  let comentario = `${student.nombre} (${student.codigo}) presenta riesgo ${student.riesgo} con promedio ${student.academic?.promedio_general ?? student.promedio} y asistencia del ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}%.`;
  if (lowGrades) comentario += ` Notas por debajo del mínimo aprobatorio.`;
  if (lowAttendance) comentario += ` Asistencia bajo el 70% requerido.`;
  if (isPending) comentario += ` Tiene ${student.detalle_pagos?.cuotas_vencidas || 1} cuota(s) pendiente(s) por S/.${student.detalle_pagos?.monto_pendiente || 350.00}.`;
  comentario += ` Se recomienda intervención inmediata.`;

  // 2. Asunto corto
  let asunto = `UTP - Apoyo Académico Personalizado`;
  if (student.riesgo === 'CRITICO' || student.riesgo === 'ALTO') {
    asunto = `UTP - Plan de Apoyo Urgente - ${student.codigo}`;
  }

  // 3. Cuerpo del correo conciso (máx. 8-10 líneas)
  const firstName = student.nombre.split(' ')[0];
  let cuerpo = `Hola ${firstName},\n\n`;
  cuerpo += `Desde la UTP queremos apoyarte para que logres tus metas este ciclo. Estos son tus indicadores actuales:\n`;
  cuerpo += `  · Promedio: ${student.academic?.promedio_general ?? student.promedio}\n`;
  cuerpo += `  · Asistencia: ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}%\n`;
  if (isPending) {
    cuerpo += `  · Pago pendiente: S/.${student.detalle_pagos?.monto_pendiente || 350.00} (contáctanos para facilidades)\n`;
  }
  cuerpo += `\nTienes acceso gratuito a tutorías y talleres de refuerzo desde Canvas o la App UTP+. Responde este correo o agenda una cita con nosotros.\n\n`;
  cuerpo += `Saludos,\nCoordinación de Retención Estudiantil UTP`;

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
Actúa como Asesor de Retención Estudiantil de la UTP. Genera un diagnóstico BREVE y un correo CORTO para retener al alumno.

Datos del Alumno:
- Nombre: ${student.nombre}
- Código: ${student.codigo}
- Ciclo: ${student.ciclo || '2do'} | Carrera: ${student.carrera || 'Ingeniería'}
- Riesgo: ${student.riesgo}
- Promedio: ${student.academic?.promedio_general ?? student.promedio ?? 'N/A'}
- Asistencia: ${Math.round((student.academic?.asistencia_global ?? (student.asistencia / 100)) * 100)}%
- Estado Pago: ${student.estado_pago} | Cuotas vencidas: ${student.detalle_pagos?.cuotas_vencidas ?? 0} | Monto: S/.${student.detalle_pagos?.monto_pendiente ?? 0}
- Cursos:
${(student.academic?.cursos || []).map(c => `  · ${c.nombre}: Nota ${c.nota}, Asist. ${Math.round(c.asistencia * 100)}%`).join('\n')}

INSTRUCCIONES DE FORMATO (MUY IMPORTANTE):
1. "comentario": Diagnóstico de MÁXIMO 3 oraciones. Directo y sin rodeos.
2. "correo_personalizado":
   - "asunto": Máximo 10 palabras, institucional.
   - "cuerpo": Máximo 8-10 líneas. Estructura: saludo breve → datos clave en viñetas → si hay deuda mencionarla sutilmente → ofrecer tutorías/talleres → cierre corto. Usa \\n para saltos de línea. NO hagas párrafos largos.

Devuelve SOLO este JSON:
{
  "comentario": "...",
  "correo_personalizado": {
    "asunto": "...",
    "cuerpo": "..."
  }
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
