import React, { useEffect, useState, useMemo } from 'react';
import { Activity, Bell, CheckCircle2, Clock, Database, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import { supabase } from '../../supabaseClient.js';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const RISK_COLORS = { CRITICO: '#dc2626', ALTO: '#ea580c', MEDIO: '#d97706', BAJO: '#059669' };

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Métricas operativas del sistema, calculadas sobre las tablas reales:
 *  - predictions_history: corridas del clasificador (trazabilidad, APF1 §6.5)
 *  - alerts: alertas generadas/atendidas por la automatización
 * Son los números que sustentan los SLA del documento (detección < 24h).
 */
export default function MetricasPage() {
  const { state } = useApp();
  const [data, setData] = useState({ loading: true, predicciones: [], alertas: [] });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pred, al] = await Promise.all([
          supabase
            .from('predictions_history')
            .select('riesgo, fuente, created_at')
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase
            .from('alerts')
            .select('id, riesgo, atendida, created_at')
            .order('created_at', { ascending: false })
            .limit(1000),
        ]);
        if (!cancelled) {
          setData({ loading: false, predicciones: pred.data || [], alertas: al.data || [] });
        }
      } catch (err) {
        console.warn('[VIGÍA] Métricas no disponibles:', err.message);
        if (!cancelled) setData({ loading: false, predicciones: [], alertas: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const load = () => {
    setData((d) => ({ ...d, loading: true }));
    setRefreshTick((t) => t + 1);
  };

  const m = useMemo(() => {
    const { predicciones, alertas } = data;
    const ultimaCorrida = predicciones[0]?.created_at || null;
    const porRiesgo = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAJO: 0 };
    state.students.forEach((s) => {
      porRiesgo[s.riesgo] = (porRiesgo[s.riesgo] || 0) + 1;
    });
    const atendidas = alertas.filter((a) => a.atendida).length;
    const pendientes = alertas.length - atendidas;
    const tasaAtencion = alertas.length > 0 ? Math.round((atendidas / alertas.length) * 100) : 0;
    return {
      totalPredicciones: predicciones.length,
      ultimaCorrida,
      totalAlertas: alertas.length,
      atendidas,
      pendientes,
      tasaAtencion,
      ultimaAlerta: alertas[0]?.created_at || null,
      riesgoChart: Object.entries(porRiesgo).map(([k, v]) => ({ nivel: k, cantidad: v })),
    };
  }, [data, state.students]);

  const hayDatos = m.totalPredicciones > 0 || m.totalAlertas > 0;

  return (
    <PageShell
      eyebrow="Administración"
      title="Métricas del Sistema"
      description="Indicadores operativos calculados sobre la trazabilidad real: corridas del clasificador (predictions_history) y alertas de la automatización (alerts)."
      actions={
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-all shadow-sm"
        >
          <RefreshCw size={14} className={data.loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      }
    >
      {!hayDatos && !data.loading && (
        <DemoNote>
          Aún no hay registros en predictions_history ni alerts. Ejecuta los flujos de n8n
          (clasificación nocturna y alertas) para que estas métricas cobren vida.
        </DemoNote>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Clasificaciones Registradas',
            value: m.totalPredicciones,
            sub: 'En predictions_history',
            icon: Database,
            color: 'text-brand-700',
          },
          {
            label: 'Alertas Generadas',
            value: m.totalAlertas,
            sub: 'Por la automatización n8n',
            icon: Bell,
            color: 'text-risk-critical',
          },
          {
            label: 'Alertas Atendidas',
            value: `${m.atendidas} (${m.tasaAtencion}%)`,
            sub: `${m.pendientes} pendientes`,
            icon: CheckCircle2,
            color: 'text-risk-low',
          },
          {
            label: 'Última Corrida',
            value: m.ultimaCorrida ? fmtDate(m.ultimaCorrida).split(',')[0] : '—',
            sub: m.ultimaCorrida ? fmtDate(m.ultimaCorrida) : 'Sin corridas aún',
            icon: Clock,
            color: 'text-slate-900',
          },
        ].map((k) => (
          <Panel key={k.label} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-wider leading-tight">
                {k.label}
              </p>
              <k.icon size={16} className={k.color} />
            </div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 font-bold mt-1">{k.sub}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-4">
            <Activity size={15} className="text-brand-700" /> Distribución Actual de Riesgo
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={m.riesgoChart} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="nivel" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {m.riesgoChart.map((d) => (
                  <Cell key={d.nivel} fill={RISK_COLORS[d.nivel]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-slate-400 font-bold mt-2">
            Cartera visible para tu rol: {state.students.length} estudiantes.
          </p>
        </Panel>

        <Panel className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-4">
            <Clock size={15} className="text-brand-700" /> Cumplimiento de SLA (APF1)
          </h3>
          <div className="space-y-3">
            {[
              {
                sla: 'Tiempo de detección < 24 h',
                estado: m.ultimaAlerta
                  ? `Última alerta: ${fmtDate(m.ultimaAlerta)}`
                  : 'Sin alertas registradas aún',
                ok: Boolean(m.ultimaAlerta),
              },
              {
                sla: 'Procesamiento batch en madrugada (3:00 am)',
                estado: m.ultimaCorrida
                  ? `Última clasificación: ${fmtDate(m.ultimaCorrida)}`
                  : 'Sin corridas registradas aún',
                ok: Boolean(m.ultimaCorrida),
              },
              {
                sla: 'Trazabilidad de predicciones (§6.5)',
                estado: `${m.totalPredicciones} registros históricos`,
                ok: m.totalPredicciones > 0,
              },
              {
                sla: 'Monitoreo 24/7 de la cartera',
                estado: 'Flujo de alertas cada 15 minutos (n8n)',
                ok: m.totalAlertas > 0,
              },
            ].map((r) => (
              <div
                key={r.sla}
                className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0"
              >
                <span
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${r.ok ? 'bg-risk-low' : 'bg-slate-300'}`}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.sla}</p>
                  <p className="text-xs text-slate-500 font-semibold">{r.estado}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
