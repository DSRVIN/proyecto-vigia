import React from 'react';
import { Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip } from 'recharts';

/**
 * Tarjeta KPI del sistema: título con ayuda (i), cifra principal, zona
 * opcional de detalle (mini-gráfico o indicadores) y pie separado por
 * una línea. Si recibe onClick, el cuerpo es un botón; el pie queda fuera
 * para que pueda contener su propia acción sin anidar botones.
 */
export default function StatCard({
  title,
  value,
  info,
  children,
  footer,
  onClick,
  centered = false,
  valueClass = 'text-slate-900',
}) {
  const Body = onClick ? 'button' : 'div';
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.09)] transition-shadow flex flex-col min-w-0">
      <Body
        {...(onClick ? { type: 'button', onClick } : {})}
        className={`flex-1 flex flex-col w-full p-5 pb-4 text-left ${
          centered ? 'items-center justify-center text-center' : ''
        } ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div
          className={`flex items-start gap-2 w-full ${centered ? 'justify-center' : 'justify-between'}`}
        >
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {info && !centered && (
            <span title={info} className="text-slate-300 flex-shrink-0">
              <Info size={16} />
            </span>
          )}
        </div>
        <p
          className={`mt-1.5 text-[28px] leading-tight sm:text-3xl font-semibold tracking-tight tabular-nums ${valueClass}`}
        >
          {value}
        </p>
        {children && <div className="mt-3 w-full">{children}</div>}
      </Body>
      {footer && (
        <div className="mx-5 py-3 border-t border-slate-100 text-sm text-slate-700 font-medium">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Línea "etiqueta · valor ●" para proporciones dentro de una tarjeta. */
export function RatioLine({ label, value, tone = 'neutral' }) {
  const dot = {
    bad: 'bg-risk-critical',
    warn: 'bg-risk-high',
    good: 'bg-risk-low',
    neutral: 'bg-brand-500',
  }[tone];
  return (
    <p className="flex items-center gap-2 text-sm text-slate-500 leading-7">
      <span>{label}</span>
      <span className="font-semibold text-slate-800 tabular-nums">{value}</span>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
    </p>
  );
}

function MiniTooltip({ active, payload, label, labelKey }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-[11px] rounded-md px-2 py-1 shadow-lg">
      <p className="font-bold">{labelKey ? row[labelKey] : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="opacity-80">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/** Mini gráfico de áreas superpuestas (sin ejes), para tarjetas KPI. */
export function MiniArea({ id, data, series, labelKey, height = 64 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.35} />
              </linearGradient>
            ))}
          </defs>
          <Tooltip content={<MiniTooltip labelKey={labelKey} />} cursor={false} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={1.5}
              fill={`url(#${id}-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Mini gráfico de barras (sin ejes), para tarjetas KPI. */
export function MiniBars({ data, dataKey, name, labelKey, color = '#3b82f6', height = 64 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <Tooltip content={<MiniTooltip labelKey={labelKey} />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Pie de tarjeta con acción secundaria (p. ej. "Riesgo alto · 88 →"). */
export function FooterLink({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 text-sm text-slate-700 hover:text-brand-700 transition-colors"
    >
      <span>
        {label} <span className="font-semibold tabular-nums">{value}</span>
      </span>
      <span aria-hidden="true" className="text-slate-400">
        →
      </span>
    </button>
  );
}
