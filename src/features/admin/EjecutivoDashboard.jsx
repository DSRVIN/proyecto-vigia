import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  ReceiptText,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

/** Recaudación mensual: ingresos por pensiones de mar → dic (2026-I y 2026-II) */
const recaudacionMensual = [
  { mes: 'Mar', ingresos: 284_500, gastos: 142_300 },
  { mes: 'Abr', ingresos: 310_200, gastos: 155_800 },
  { mes: 'May', ingresos: 298_700, gastos: 148_200 },
  { mes: 'Jun', ingresos: 325_400, gastos: 161_500 },
  { mes: 'Jul', ingresos: 342_100, gastos: 168_700 },
  { mes: 'Ago', ingresos: 318_900, gastos: 159_400 },
  { mes: 'Sep', ingresos: 356_200, gastos: 175_300 },
  { mes: 'Oct', ingresos: 371_800, gastos: 183_600 },
  { mes: 'Nov', ingresos: 348_500, gastos: 172_100 },
  { mes: 'Dic', ingresos: 289_300, gastos: 144_900 },
];

/** Distribución del estado de deuda (alumnos) */
const estadoDeuda = [
  { name: 'Al día', value: 1_248, color: '#cbd5e1' },
  { name: 'Deuda < 30 días', value: 312, color: '#93c5fd' },
  { name: 'Deuda 30-60 días', value: 187, color: '#3b82f6' },
  { name: 'Deuda > 60 días', value: 94, color: '#1e40af' },
];

/** Movimientos financieros históricos */
const movimientosFinancieros = [
  {
    id: 'TXN-1041',
    fecha: '2026-07-08',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 18_400,
    descripcion: 'Pago masivo cuota Julio — 52 alumnos',
  },
  {
    id: 'TXN-1040',
    fecha: '2026-07-07',
    tipo: 'gasto',
    categoria: 'Servicios',
    monto: 3_850,
    descripcion: 'Factura electricidad campus norte',
  },
  {
    id: 'TXN-1039',
    fecha: '2026-07-05',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 7_200,
    descripcion: 'Cobro cuota atrasada — 20 alumnos',
  },
  {
    id: 'TXN-1038',
    fecha: '2026-07-03',
    tipo: 'gasto',
    categoria: 'Operativo',
    monto: 12_600,
    descripcion: 'Planilla docentes contrato parcial',
  },
  {
    id: 'TXN-1037',
    fecha: '2026-07-01',
    tipo: 'gasto',
    categoria: 'Ajuste',
    monto: 4_100,
    descripcion: 'Redondeo contable — conciliación bancaria',
  },
  {
    id: 'TXN-1036',
    fecha: '2026-06-28',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 42_300,
    descripcion: 'Recaudación quincenal — 120 alumnos',
  },
  {
    id: 'TXN-1035',
    fecha: '2026-06-25',
    tipo: 'gasto',
    categoria: 'Servicios',
    monto: 5_200,
    descripcion: 'Mantenimiento infraestructura TI',
  },
  {
    id: 'TXN-1034',
    fecha: '2026-06-22',
    tipo: 'gasto',
    categoria: 'Operativo',
    monto: 8_900,
    descripcion: 'Materiales y suministros de aula',
  },
  {
    id: 'TXN-1033',
    fecha: '2026-06-20',
    tipo: 'ingreso',
    categoria: 'Matrícula',
    monto: 31_500,
    descripcion: 'Matrículas ciclo 2026-II — 90 alumnos',
  },
  {
    id: 'TXN-1032',
    fecha: '2026-06-18',
    tipo: 'gasto',
    categoria: 'Ajuste',
    monto: 2_700,
    descripcion: 'Ajuste por devolución parcial ciclo anterior',
  },
  {
    id: 'TXN-1031',
    fecha: '2026-06-15',
    tipo: 'gasto',
    categoria: 'Servicios',
    monto: 1_980,
    descripcion: 'Licencias software plataforma Canvas',
  },
  {
    id: 'TXN-1030',
    fecha: '2026-06-12',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 38_700,
    descripcion: 'Recaudación quincenal — 110 alumnos',
  },
  {
    id: 'TXN-1029',
    fecha: '2026-06-10',
    tipo: 'gasto',
    categoria: 'Operativo',
    monto: 14_200,
    descripcion: 'Planilla administrativa mensual',
  },
  {
    id: 'TXN-1028',
    fecha: '2026-06-07',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 9_600,
    descripcion: 'Cobro tardío — 27 alumnos mora',
  },
  {
    id: 'TXN-1027',
    fecha: '2026-06-05',
    tipo: 'gasto',
    categoria: 'Servicios',
    monto: 6_400,
    descripcion: 'Agua, gas y servicios varios',
  },
  {
    id: 'TXN-1026',
    fecha: '2026-06-02',
    tipo: 'ingreso',
    categoria: 'Matrícula',
    monto: 15_750,
    descripcion: 'Matrículas tardías ciclo 2026-II',
  },
  {
    id: 'TXN-1025',
    fecha: '2026-05-30',
    tipo: 'gasto',
    categoria: 'Ajuste',
    monto: 1_500,
    descripcion: 'Ajuste contable fin de ciclo',
  },
  {
    id: 'TXN-1024',
    fecha: '2026-05-28',
    tipo: 'ingreso',
    categoria: 'Pensión',
    monto: 44_800,
    descripcion: 'Recaudación cierre Mayo — 127 alumnos',
  },
  {
    id: 'TXN-1023',
    fecha: '2026-05-25',
    tipo: 'gasto',
    categoria: 'Operativo',
    monto: 9_500,
    descripcion: 'Honorarios docentes tiempo completo',
  },
  {
    id: 'TXN-1022',
    fecha: '2026-05-20',
    tipo: 'gasto',
    categoria: 'Servicios',
    monto: 4_300,
    descripcion: 'Servicio de seguridad campus',
  },
];

// ─── CÁLCULOS (REGLAS DE NEGOCIO) ────────────────────────────────────────────

const totalIngresos = movimientosFinancieros
  .filter((m) => m.tipo === 'ingreso' && m.categoria !== 'Ajuste')
  .reduce((acc, m) => acc + m.monto, 0);

const totalGastos = movimientosFinancieros
  .filter((m) => m.tipo === 'gasto' && m.categoria !== 'Ajuste')
  .reduce((acc, m) => acc + m.monto, 0);

const recaudacionTotal = recaudacionMensual.reduce((acc, m) => acc + m.ingresos, 0);
const totalDeuda = estadoDeuda
  .filter((d) => d.name !== 'Al día')
  .reduce((acc, d) => acc + d.value * 350, 0); // S/. 350 promedio por deudor

const utilidadNeta = totalIngresos - totalGastos;
const margenGanancia = ((utilidadNeta / totalIngresos) * 100).toFixed(1);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n) => {
  if (n >= 1_000_000) return `S/. ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `S/. ${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

const TIPO_COLORS = { ingreso: '#1e40af', gasto: '#64748b', Ajuste: '#cbd5e1' };
const CATEGORIA_COLORS = {
  Pensión: '#1e40af',
  Matrícula: '#3b82f6',
  Servicios: '#93c5fd',
  Operativo: '#64748b',
  Ajuste: '#cbd5e1',
};

// Custom tooltip for AreaChart
function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500 capitalize">{p.name}</span>
          </span>
          <span className="font-bold text-slate-800">{fmtShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Custom tooltip for PieChart
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} alumnos</p>
      <p className="text-slate-500">{fmt(payload[0].value * 350)} en riesgo</p>
    </div>
  );
}

// Custom Pie label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
      fontSize={10}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, trend, accentClass, bgClass }) {
  const isPositive = trend >= 0;
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden`}
    >
      {/* Accent stripe */}
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <div className="flex items-start justify-between mt-1">
        <div className={`p-2.5 rounded-xl ${bgClass}`}>
          <Icon size={18} className="text-current" />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'}`}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
          {label}
        </p>
      </div>
      {sub && <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">{sub}</p>}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function EjecutivoDashboard() {
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', dir: 'desc' });

  // ── Sorted + filtered movements (most recent first by default, RULE: exclude Ajuste filter only on display)
  const movimientosOrdenados = useMemo(() => {
    const filtered =
      filterCategoria === 'Todos'
        ? [...movimientosFinancieros]
        : movimientosFinancieros.filter((m) => m.categoria === filterCategoria);

    return filtered.sort((a, b) => {
      const valA = sortConfig.key === 'monto' ? a.monto : a[sortConfig.key];
      const valB = sortConfig.key === 'monto' ? b.monto : b[sortConfig.key];
      if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filterCategoria, sortConfig]);

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'fecha' ? 'desc' : 'asc' }
    );
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortConfig.dir === 'asc' ? (
      <ChevronUp size={12} className="text-slate-600" />
    ) : (
      <ChevronDown size={12} className="text-slate-600" />
    );
  };

  const categorias = ['Todos', ...new Set(movimientosFinancieros.map((m) => m.categoria))];

  // Totals for the bottom of the table
  const totalIngresosTabla = movimientosOrdenados
    .filter((m) => m.tipo === 'ingreso')
    .reduce((a, m) => a + m.monto, 0);
  const totalGastosTabla = movimientosOrdenados
    .filter((m) => m.tipo === 'gasto')
    .reduce((a, m) => a + m.monto, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panel Ejecutivo</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Inteligencia de Negocios · Ciclos{' '}
              <span className="font-bold text-slate-700">2026-I / 2026-II</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Clock size={13} className="text-slate-400" />
            <span>Última actualización:</span>
            <span className="font-bold text-slate-600">
              {new Date().toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* ── KPI Cards — grid 12 cols ── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Recaudación Total — 3 cols */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <KPICard
              icon={DollarSign}
              label="Recaudación Total"
              value={fmtShort(recaudacionTotal)}
              sub={`${recaudacionMensual.length} meses acumulados · Ciclos 2026-I / II`}
              trend={+8.3}
              accentClass="bg-brand-600"
              bgClass="bg-brand-50 text-brand-600"
            />
          </div>

          {/* Cuentas por Cobrar — 3 cols */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <KPICard
              icon={AlertCircle}
              label="Cuentas por Cobrar"
              value={fmtShort(totalDeuda)}
              sub={`${estadoDeuda.slice(1).reduce((a, d) => a + d.value, 0)} alumnos con deuda activa`}
              trend={-4.1}
              accentClass="bg-slate-500"
              bgClass="bg-amber-50 text-amber-600"
            />
          </div>

          {/* Utilidad Neta — 3 cols  (SIN categoría "Ajuste") */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <KPICard
              icon={TrendingUp}
              label="Utilidad Neta"
              value={fmtShort(utilidadNeta)}
              sub="Ingresos − Gastos (excluye ajustes contables)"
              trend={+12.7}
              accentClass="bg-brand-800"
              bgClass="bg-brand-50 text-brand-800"
            />
          </div>

          {/* Margen de Ganancia — 3 cols */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <KPICard
              icon={Percent}
              label="Margen de Ganancia"
              value={`${margenGanancia}%`}
              sub="Sobre total de ingresos acumulados del ciclo"
              trend={+2.4}
              accentClass="bg-slate-700"
              bgClass="bg-brand-50 text-brand-700"
            />
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Area Chart — 8 cols */}
          <div className="col-span-12 xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Ingresos vs. Gastos
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Evolución mensual Mar–Dic 2026</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  Gastos
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={recaudacionMensual}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  width={42}
                />
                <Tooltip content={<AreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="ingresos"
                  stroke="#1e40af"
                  strokeWidth={2.5}
                  fill="url(#gradIngresos)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  name="gastos"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#gradGastos)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart — 4 cols */}
          <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Estado de Deuda
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribución por antigüedad</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={estadoDeuda}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {estadoDeuda.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <ul className="space-y-1.5 mt-2">
              {estadoDeuda.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {d.value.toLocaleString('es-PE')} alumnos
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Movimientos Financieros ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ReceiptText size={15} className="text-slate-400" />
                Historial de Movimientos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {movimientosOrdenados.length} transacciones · ordenado por más reciente
              </p>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-slate-400 flex-shrink-0" />
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategoria(cat)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    filterCategoria === cat
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    { key: 'id', label: 'ID', w: 'w-24' },
                    { key: 'fecha', label: 'Fecha', w: 'w-28' },
                    { key: 'tipo', label: 'Tipo', w: 'w-20' },
                    { key: 'categoria', label: 'Categoría', w: 'w-28' },
                    { key: 'descripcion', label: 'Descripción', w: 'w-auto' },
                    { key: 'monto', label: 'Monto', w: 'w-32' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.key !== 'descripcion' && toggleSort(col.key)}
                      className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 ${col.w} ${col.key !== 'descripcion' ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key !== 'descripcion' && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movimientosOrdenados.map((m) => {
                  const esAjuste = m.categoria === 'Ajuste';
                  return (
                    <tr
                      key={m.id}
                      className={`group transition-colors hover:bg-slate-50 ${esAjuste ? 'opacity-60' : ''}`}
                    >
                      {/* ID */}
                      <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">{m.id}</td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            m.tipo === 'ingreso'
                              ? 'bg-brand-50 text-brand-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.tipo === 'ingreso' ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                          {m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] text-white"
                          style={{ background: CATEGORIA_COLORS[m.categoria] ?? '#94a3b8' }}
                        >
                          {m.categoria}
                        </span>
                      </td>

                      {/* Descripción */}
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {m.descripcion}
                      </td>

                      {/* Monto */}
                      <td
                        className={`px-4 py-3 font-black tabular-nums text-right ${
                          m.tipo === 'ingreso' ? 'text-brand-800' : 'text-slate-600'
                        }`}
                      >
                        {m.tipo === 'ingreso' ? '+' : '-'}
                        {fmt(m.monto)}
                        {esAjuste && (
                          <span className="ml-1 text-[9px] font-normal text-slate-400 align-middle">
                            (ajuste)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider text-right"
                  >
                    Subtotales (filtro activo)
                  </td>
                  <td className="px-4 py-3 text-right space-y-0.5">
                    <div className="text-brand-800 font-black text-xs">
                      +{fmt(totalIngresosTabla)}
                    </div>
                    <div className="text-slate-600 font-black text-xs">
                      −{fmt(totalGastosTabla)}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Datos simulados · Panel Ejecutivo VIGÍA · UTP 2026
        </p>
      </div>
    </div>
  );
}
