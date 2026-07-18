import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import { useSessionRestore } from '../features/auth/useSessionRestore.js';
import { router } from './router.jsx';

// Restaura la sesión persistida de Supabase antes de que el router
// decida si redirige al login (necesita vivir dentro del provider).
function AuthBootstrap({ children }) {
  useSessionRestore();
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </AppProvider>
  );
}
