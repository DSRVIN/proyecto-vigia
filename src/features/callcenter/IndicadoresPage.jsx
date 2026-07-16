import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const SEMANAS = [
  { semana: 'S1', contactadas: 42, resueltas: 28 },
  { semana: 'S2', contactadas: 55, resueltas: 39 },
  { semana: 'S3', contactadas: 48, resueltas: 35 },
  { semana: 'S4', contactadas: 63, resueltas: 51 },
  { semana: 'S5', contactadas: 58, resueltas: 47 },
  { semana: 'S6', contactadas: 71, resueltas: 60 },
];

export default function IndicadoresPage() {
  const { state } = useApp();

  const porEstado = useMemo(() => {
    const pagados = state.students.filter((s) => s.estado_pago === 'PAGADO').length;
    const pendientes = state.students.length - pagados;
    return [
      { estado: 'Al día', valor: pagados },
      { estado: 'Con deuda', valor: pendientes },
    ];
  }, [state.students]);

  const intervenidos = state.students.filter((s) => s.intervenido).length;
  const tasaResolucion =
    state.students.length > 0 ? Math.round((intervenidos / state.students.length) * 100) : 0;

  return (
    <PageShell
      eyebrow="Seguimiento"
      title="Indicadores de Gestión"
      description="Métricas de desempeño del equipo de retención: contacto, resolución y estado de cartera."
    >
      <DemoNote>
        La evolución semanal usa datos referenciales de demostración; el estado de cartera y la tasa
        de resolución derivan de los datos reales de los estudiantes.
      </DemoNote>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tasa de Resolución', value: `${tasaResolucion}%`, color: 'text-risk-low' },
          { label: 'Nivel de Servicio', value: '92%', color: 'text-brand-700' },
          { label: 'Tiempo Prom.', value: '4m 32s', color: 'text-slate-900' },
          { label: 'Satisfacción', value: '4.6/5', color: 'text-slate-900' },
        ].map((k) => (
          <Panel key={k.label} className="p-5">
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider">
              {k.label}
            </p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4">Evolución Semanal de Gestión</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={SEMANAS} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="contactadas"
                stroke="#1e40af"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Contactadas"
              />
              <Line
                type="monotone"
                dataKey="resueltas"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Resueltas"
              />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4">Estado de Cartera</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porEstado} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="estado" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                <Cell fill="#1e40af" />
                <Cell fill="#64748b" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </PageShell>
  );
}
