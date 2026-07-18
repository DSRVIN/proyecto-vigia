import { useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useApp } from '../../context/AppContext.jsx';

const POLL_MS = 60_000;

/**
 * Carga las alertas reales generadas por n8n (tabla alerts) y las
 * refresca cada minuto — así una alerta creada por la automatización
 * aparece en la campana sin recargar la página. Si la tabla aún no
 * existe (migración 004 pendiente) falla en silencio y la campana
 * usa su modo de demostración derivado de los estudiantes.
 */
export function useAlertsLoader() {
  const { state, actions } = useApp();
  const codigo = state.currentUser?.codigo;

  useEffect(() => {
    if (!codigo) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('id, student_codigo, student_nombre, riesgo, mensaje, atendida, created_at')
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        if (!cancelled && data) actions.setAlerts(data);
      } catch (err) {
        console.warn('[VIGÍA] Tabla alerts no disponible (modo demo):', err.message);
      }
    };

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);
}

/** Marca una alerta como atendida en Supabase (RLS lo permite a autenticados). */
export async function atenderAlerta(id) {
  const { error } = await supabase.from('alerts').update({ atendida: true }).eq('id', id);
  if (error) throw error;
}
