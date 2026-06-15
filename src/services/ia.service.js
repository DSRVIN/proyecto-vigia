import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = apiKey && apiKey !== 'TU_LLAVE_AQUI' ? new GoogleGenerativeAI(apiKey) : null;

export async function generarMensajeIntervencion(student) {
  if (!genAI) {
    // Mocked fallback response for local development when API key is not configured
    return `Hola ${student.nombre}, te saludamos de parte de Retención Estudiantil de la UTP. Esperamos que estés muy bien en este ciclo ${student.ciclo || '2026-I'}. Queremos recordarte que cuentas con tutorías gratuitas para apoyarte académicamente. Asimismo, si tienes algún saldo pendiente (${student.estado_pago || 'Pendiente'}), por favor no dudes en contactarnos para brindarte facilidades de pago. ¡Estamos para ayudarte!`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Eres un asesor de retención estudiantil de la UTP. Redacta un mensaje de WhatsApp corto, empático y persuasivo (máximo 4 líneas) para el alumno ${student.nombre}. Su ciclo es ${student.ciclo || '2026-I'}, tiene un riesgo ${student.riesgo} y su estado de pago es ${student.estado_pago}. Si debe, invítalo sutilmente a regularizar. Si tiene riesgo académico, ofrécele tutorías. Usa un tono formal pero cercano.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI message:', error);
    throw error;
  }
}
