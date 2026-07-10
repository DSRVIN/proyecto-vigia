import React from 'react';
import { Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

/**
 * EjecutivoModule
 * Botón del header que abre el Panel Ejecutivo (BI Dashboard).
 * Respeta las clases Tailwind del resto de botones del Header.
 */
export default function EjecutivoModule() {
  const { actions } = useApp();

  return (
    <button
      onClick={actions.goEjecutivo}
      className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
    >
      <Briefcase size={14} />
      EJECUTIVO
    </button>
  );
}
