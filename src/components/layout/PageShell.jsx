import React from 'react';
import { Info } from 'lucide-react';

/**
 * Contenedor estándar de página interna: hero (eyebrow + título +
 * descripción + acciones) sobre el fondo claro del sistema. Todas las
 * páginas de módulo lo reutilizan para mantener jerarquía y espaciado
 * idénticos a los dashboards principales.
 */
export default function PageShell({ eyebrow, title, description, actions, children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-12">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in">
          <div>
            {eyebrow && (
              <p className="text-xs text-brand-700 font-black uppercase tracking-widest mb-1">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-600 mt-1.5 font-semibold max-w-2xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}

/** Tarjeta blanca estándar con sombra suave del sistema. */
export function Panel({ className = '', children }) {
  return (
    <div className={`bg-white rounded-[20px] shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

/**
 * Aviso honesto: marca las vistas cuyos datos son referenciales (demo)
 * porque dependen de integraciones aún no conectadas (telefonía, correo,
 * mensajería). Comunica el roadmap sin simular que ya operan.
 */
export function DemoNote({ children }) {
  return (
    <div className="flex items-start gap-2 text-xs font-bold text-brand-800 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 mb-6">
      <Info size={15} className="flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
