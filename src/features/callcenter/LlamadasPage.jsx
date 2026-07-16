import React, { useMemo } from 'react';
import { Phone, PhoneCall, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function LlamadasPage() {
  const { state } = useApp();

  const cola = useMemo(() => {
    return state.students
      .filter((s) => (s.riesgo === 'CRITICO' || s.riesgo === 'ALTO') && !s.intervenido)
      .sort((a, b) => (a.riesgo === 'CRITICO' ? -1 : 1) - (b.riesgo === 'CRITICO' ? -1 : 1))
      .slice(0, 15);
  }, [state.students]);

  const atendidas = state.students.filter((s) => s.intervenido).length;

  return (
    <PageShell
      eyebrow="Operaciones"
      title="Cola de Llamadas"
      description="Estudiantes en riesgo priorizados para contacto telefónico de retención."
    >
      <DemoNote>
        Cola generada a partir de los estudiantes en riesgo sin intervenir. La marcación automática
        se habilitará al integrar la central telefónica (VoIP) vía n8n.
      </DemoNote>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'En cola', value: cola.length, icon: Phone, color: 'text-risk-critical' },
          { label: 'Activas', value: 3, icon: PhoneCall, color: 'text-brand-700' },
          { label: 'Atendidas hoy', value: atendidas, icon: CheckCircle2, color: 'text-risk-low' },
          { label: 'Tiempo prom.', value: '4m 32s', icon: Clock, color: 'text-slate-900' },
        ].map((k) => (
          <Panel key={k.label} className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
              <k.icon size={19} className={k.color} />
            </div>
            <div>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
                {k.label}
              </p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Próximas llamadas</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {cola.map((s, i) => (
            <div key={s.codigo} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60">
              <span className="text-xs font-black text-slate-300 w-6">{i + 1}</span>
              <div className="h-10 w-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                {initials(s.nombre)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{s.nombre}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {s.codigo} · {s.cursoId}
                </p>
              </div>
              <RiskBadge level={s.riesgo} size="xs" />
              <span className="hidden sm:block text-xs font-bold text-slate-500 w-28 text-right">
                {s.detalle_pagos?.cuotas_vencidas > 0
                  ? `${s.detalle_pagos.cuotas_vencidas} cuota(s)`
                  : 'Al día'}
              </span>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-black uppercase tracking-wider opacity-70 cursor-not-allowed"
              >
                <PhoneCall size={13} /> Llamar
              </button>
            </div>
          ))}
          {cola.length === 0 && (
            <p className="px-5 py-10 text-center text-slate-400 text-sm font-semibold">
              No hay llamadas pendientes en la cola.
            </p>
          )}
        </div>
      </Panel>
    </PageShell>
  );
}
