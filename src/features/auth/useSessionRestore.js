import { useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useApp } from '../../context/AppContext.jsx';
import { buildTeacherProfile } from './profile.js';

/**
 * Restaura la sesión persistida de Supabase al recargar la página.
 * Supabase guarda el token en localStorage, pero el estado de la app
 * vive en memoria: sin este hook, cada recarga devolvía al login aunque
 * la sesión siguiera siendo válida. Mientras se resuelve, authReady
 * permanece en false y RequireAuth muestra un loader en vez de redirigir.
 */
export function useSessionRestore() {
  const { actions } = useApp();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user && !cancelled) {
          const email = (user.email || '').toLowerCase();
          let profileRow = null;
          try {
            const { data: p } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            profileRow = p;
          } catch {
            // sin fila de perfil: buildTeacherProfile usa el fallback
          }
          if (!cancelled) {
            actions.loginSuccess(user, buildTeacherProfile(user, profileRow, email));
            return; // LOGIN_SUCCESS ya marca authReady
          }
        }
      } catch (err) {
        console.warn('[VIGÍA] No se pudo restaurar la sesión:', err.message);
      }
      if (!cancelled) actions.authReady();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
