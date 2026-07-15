import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.jsx';
import { router } from './router.jsx';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
