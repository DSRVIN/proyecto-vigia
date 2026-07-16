import React, { useMemo } from 'react';
import { PhoneCall, Mail, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const ACCIONES = [
  { icon: PhoneCall, label: 'Llamada realizada', color: 'text-brand-700', bg: 'bg-brand-50' },
  { icon: CheckCircle2, label: 'Compromiso de pago', color: 'text-risk-low', bg: 'bg-emerald-50' },
  { icon: Mail, label: 'Correo enviado', color: 'text-slate-600', bg: 'bg-slate-100' },
  { icon: XCircle, label: 'Sin respuesta', color: 'text-risk-critical', bg: 'bg-red-50' },
  { icon: CalendarClock, label: 'Reprogramado', color: 'text-risk-medium', bg: 'bg-amber-50' },
];

export default function HistorialPage() {
  const { state } = useApp();

  const eventos = useMemo(() => {
    return state.students.slice(0, 18).map((s, i) => {
      const a = ACCIONES[i % ACCIONES.length];
      return {
        ...a,
        estudiante: s.nombre,
        codigo: s.codigo,
        hora: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
        agente: i % 2 === 0 ? 'M. Torres' : 'J. Ramírez',
      };
    });
  }, [state.students]);

  return (
    <PageShell
      eyebrow="Seguimiento"
      title="Historial de Gestión"
      description="Registro cronológico de las acciones de contacto realizadas por el equipo de retención."
    >
      <DemoNote>
        Bitácora de demostración construida sobre la cartera real. Cada acción de contacto quedará
        registrada automáticamente al conectar la telefonía y el correo.
      </DemoNote>

      <Panel className="p-6">
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-slate-200" />
          <div className="space-y-5">
            {eventos.map((e, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 h-[18px] w-[18px] rounded-full ${e.bg} border-2 border-white ring-1 ring-slate-200 flex items-center justify-center`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${e.color.replace('text-', 'bg-')}`} />
                </div>
                <div className={`h-9 w-9 rounded-lg ${e.bg} flex items-center justify-center`}>
                  <e.icon size={16} className={e.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-800">{e.label}</p>
                    <span className="text-[11px] font-bold text-slate-400">{e.hora}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    {e.estudiante} · {e.codigo} · Agente: {e.agente}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
