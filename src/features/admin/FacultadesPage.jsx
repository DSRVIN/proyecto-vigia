import React, { useMemo } from 'react';
import { Building2, Users, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

// Agrupación de carreras en facultades UTP
const FACULTADES = {
  Ingeniería: ['Ingeniería de Sistemas', 'Ingeniería Civil'],
  Negocios: ['Administración', 'Contabilidad', 'Marketing'],
  Humanidades: ['Derecho', 'Psicología'],
};

export default function FacultadesPage() {
  const { state } = useApp();

  const stats = useMemo(() => {
    return Object.entries(FACULTADES).map(([facultad, carreras]) => {
      const est = state.students.filter((s) => carreras.includes(s.carrera));
      const criticos = est.filter((s) => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO').length;
      const retencion =
        est.length > 0 ? Math.round(((est.length - criticos) / est.length) * 100) : 0;
      return { facultad, carreras, total: est.length, criticos, retencion };
    });
  }, [state.students]);

  return (
    <PageShell
      eyebrow="Gestión"
      title="Facultades"
      description="Distribución de estudiantes y nivel de retención proyectado por facultad."
    >
      <DemoNote>
        Agrupación derivada de las carreras de la cartera cargada. Al integrar el SIU se reflejará
        la estructura organizacional completa de la universidad.
      </DemoNote>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((f) => (
          <Panel key={f.facultad} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                <Building2 size={19} className="text-brand-700" />
              </div>
              <h3 className="text-base font-black text-slate-900">{f.facultad}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Users size={14} /> Estudiantes
                </span>
                <span className="text-lg font-black text-slate-900">{f.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <TrendingUp size={14} /> Retención proy.
                </span>
                <span className="text-lg font-black text-risk-low">{f.retencion}%</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>En riesgo</span>
                  <span>{f.criticos}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-risk-critical rounded-full"
                    style={{ width: `${f.total > 0 ? (f.criticos / f.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Carreras
              </p>
              <p className="text-xs text-slate-600 font-semibold">{f.carreras.join(' · ')}</p>
            </div>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
