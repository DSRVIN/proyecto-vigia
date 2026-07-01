/**
 * Sistema de Mensajería Institucional UTP - VIGÍA
 * Simula el despacho de alertas y correos de retención académica.
 */

/**
 * Simula el envío de un correo electrónico personalizado a un estudiante.
 * Imprime un log estructurado con el asunto y el cuerpo del mensaje en la consola.
 * 
 * @param {Object} student - El objeto del estudiante destinatario.
 * @param {string} asunto - El asunto final del correo electrónico.
 * @param {string} cuerpo - El cuerpo final del correo electrónico (editable).
 * @returns {Promise<{success: boolean, messageId: string}>} Resultado simulado de la operación.
 */
export async function enviarCorreoEstudiante({ student, asunto, cuerpo }) {
  // Simular latencia de red para la acción de envío (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Log estructurado en consola para validación y auditoría técnica
  console.log('%c────────────────────────────────────────────────────────', 'color: #3b82f6; font-weight: bold;');
  console.log('%c📨 [SIMULADOR CORREO INSTITUCIONAL UTP - DESPACHO EXITOSO]', 'color: #10b981; font-weight: bold; font-size: 11px;');
  console.log(`%cFecha/Hora: %c${new Date().toLocaleString()}`, 'color: #94a3b8; font-weight: bold;', 'color: #e2e8f0;');
  console.log(`%cDestinatario: %c${student.nombre} (${student.email || `${student.codigo.toLowerCase()}@utp.edu.pe`})`, 'color: #94a3b8; font-weight: bold;', 'color: #e2e8f0;');
  console.log(`%cCódigo U: %c${student.codigo} | Carrera: ${student.carrera || 'N/A'}`, 'color: #94a3b8; font-weight: bold;', 'color: #e2e8f0;');
  console.log(`%cAsunto: %c${asunto}`, 'color: #94a3b8; font-weight: bold;', 'color: #3b82f6; font-weight: bold;');
  console.log('%c--------------------------------------------------------', 'color: #475569;');
  console.log(`%cCuerpo del Correo:\n%c${cuerpo}`, 'color: #94a3b8; font-weight: bold;', 'color: #cbd5e1;');
  console.log('%c────────────────────────────────────────────────────────', 'color: #3b82f6; font-weight: bold;');

  return {
    success: true,
    messageId: `msg_utp_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
  };
}
