import React from 'react';
import { Database, Bot, Cloud, Workflow, CheckCircle2, Clock } from 'lucide-react';
import PageShell, { Panel } from '../../components/layout/PageShell.jsx';

const INTEGRACIONES = [
  {
    icon: Database,
    nombre: 'Supabase',
    desc: 'Base de datos PostgreSQL, autenticación y control de acceso por filas (RLS).',
    estado: 'Conectado',
    activo: true,
  },
  {
    icon: Bot,
    nombre: 'Google Gemini 2.5 Flash',
    desc: 'Generación de diagnósticos y correos de intervención personalizados con IA.',
    estado: 'Conectado',
    activo: true,
  },
  {
    icon: Cloud,
    nombre: 'Vercel',
    desc: 'Despliegue continuo y hosting del frontend con previews por cada cambio.',
    estado: 'Conectado',
    activo: true,
  },
  {
    icon: Workflow,
    nombre: 'n8n',
    desc: 'Automatización: ingesta de notas por lotes, clasificación nocturna y alertas.',
    estado: 'En roadmap',
    activo: false,
  },
];

export default function IntegracionesPage() {
  return (
    <PageShell
      eyebrow="Plataforma"
      title="Integraciones"
      description="Servicios externos conectados a VIGÍA y automatizaciones previstas en el roadmap."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {INTEGRACIONES.map((it) => (
          <Panel key={it.nombre} className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${it.activo ? 'bg-brand-50 border border-brand-100' : 'bg-slate-100'}`}
              >
                <it.icon size={22} className={it.activo ? 'text-brand-700' : 'text-slate-400'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-900">{it.nombre}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full ${
                      it.activo ? 'bg-emerald-50 text-risk-low' : 'bg-amber-50 text-risk-medium'
                    }`}
                  >
                    {it.activo ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {it.estado}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">
                  {it.desc}
                </p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
