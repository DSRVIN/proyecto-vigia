import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { buildTeacherProfile } from './profile.js';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (identifier, password) => {
    setLoading(true);
    setError(null);

    try {
      let email = identifier.trim();

      // If the identifier is a code (e.g. C13005), lowercase and append domain
      if (!email.includes('@')) {
        email = `${email.toLowerCase()}@utp.edu.pe`;
      } else {
        email = email.toLowerCase();
      }

      // Strict security filter: validate institutional domain
      if (!email.endsWith('@utp.edu.pe')) {
        throw new Error(
          'Acceso denegado: Solo el dominio institucional "@utp.edu.pe" está autorizado.'
        );
      }

      // Supabase Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Credenciales incorrectas.');
      }

      const user = authData.user;

      // Query teacher profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Advertencia al consultar perfil:', profileError.message);
      }

      // Construcción del perfil unificada con la restauración de sesión
      const teacherProfile = buildTeacherProfile(user, profile, email);

      setLoading(false);
      return { user, profile: teacherProfile };
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setLoading(false);
  };

  return { signIn, signOut, loading, error };
}
