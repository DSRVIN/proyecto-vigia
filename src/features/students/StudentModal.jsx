import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Activity,
  Clock,
  Award,
  BarChart2,
  Zap,
  Brain,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useApp } from '../../context/AppContext.jsx';
import RiskBadge from '../../components/ui/RiskBadge.jsx';
import { getEvalConfig, ROUND_THRESHOLD, MIN_APPROVAL } from '../../data/dataset.js';
import {
  generarMensajeIntervencion,
  obtenerIntervencionFallback,
} from '../../services/ia.service.js';
import { enviarCorreoEstudiante } from '../../services/messaging.service.js';

function getAIRecommendations(student) {
  if (!student) return [];
  const nombreCorto = student.nombre ? student.nombre.split(' ')[0] : 'El estudiante';
  const actividadDias = student.actividadDias ?? 0;
  const asistencia = student.asistencia ?? 0;
  const promedio = student.promedio ?? 0;
  const necesitaVal = student.notaNecesaria ?? 0;
  const necesitaLabel = student.notaNecesariaLabel || 'la evaluación final';

  const recs = {
    CRITICO: [
      {
        tipo: 'Intervención Urgente',
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        border: 'border-red-200',
        texto: `${nombreCorto} presenta patrones de abandono silencioso: ${actividadDias} días sin actividad registrada y ${asistencia}% de asistencia. Se recomienda contacto inmediato vía correo institucional y coordinación con bienestar estudiantil.`,
      },
      {
        tipo: 'Plan de Recuperación',
        icon: TrendingUp,
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        border: 'border-amber-200',
        texto: `Para recuperar la situación académica, el estudiante necesita obtener ${necesitaVal ? necesitaVal.toFixed(1) : 'N/A'} en ${necesitaLabel}. Proponer sesiones de tutoría individualizadas y refuerzo en los temas de mayor dificultad.`,
      },
      {
        tipo: 'Análisis Predictivo IA',
        icon: Brain,
        color: 'text-violet-600',
        bg: 'bg-violet-50 border-violet-200',
        border: 'border-violet-200',
        texto:
          'El modelo predictivo indica 87% de probabilidad de abandono si no se interviene en los próximos 7 días. Patrón consistente con "Silencio Digital": reducción gradual de accesos al campus virtual.',
      },
    ],
    ALTO: [
      {
        tipo: 'Monitoreo Activo',
        icon: Activity,
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        border: 'border-amber-200',
        texto: `Promedio actual ${promedio.toFixed(1)} está por debajo del mínimo aprobatorio. Asistencia del ${asistencia}% es recuperable. Recomendar plan de estudio intensivo para ${necesitaLabel}.`,
      },
      {
        tipo: 'Análisis Predictivo IA',
        icon: Brain,
        color: 'text-violet-600',
        bg: 'bg-violet-50 border-violet-200',
        border: 'border-violet-200',
        texto:
          'Probabilidad de recuperación: 62% con intervención temprana. Se detectó disminución progresiva del rendimiento en los últimos 2 períodos de evaluación.',
      },
    ],
    MEDIO: [
      {
        tipo: 'Seguimiento Preventivo',
        icon: Zap,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200',
        border: 'border-yellow-200',
        texto: `El rendimiento está en zona de alerta. Con ${necesitaVal !== null ? necesitaVal.toFixed(1) : 'menos de 12'} en ${necesitaLabel} puede aprobar el curso. Motivar la participación activa en las sesiones de práctica.`,
      },
    ],
    BAJO: [
      {
        tipo: 'Rendimiento Óptimo',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200',
        border: 'border-emerald-200',
        texto: `Excelente desempeño académico. Promedio de ${promedio.toFixed(1)} con ${asistencia}% de asistencia. Candidato para programa de alumnos destacados y apoyo entre pares.`,
      },
    ],
  };
  return recs[student.riesgo] || recs.BAJO;
}

function GradeBar({ label, value, weight, max = 20 }) {
  const pct = (value / max) * 100;
  const color =
    value >= 12
      ? 'from-emerald-500 to-teal-400'
      : value >= 10
        ? 'from-amber-500 to-yellow-400'
        : 'from-red-600 to-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 font-bold">
          {label} ({(weight * 100).toFixed(0)}%)
        </span>
        <span
          className={`font-bold font-mono ${value >= 12 ? 'text-emerald-600' : value >= 10 ? 'text-amber-600' : 'text-red-500'}`}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-md">
        <p className="text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-blue-600 font-black">{payload[0].value} accesos</p>
      </div>
    );
  }
  return null;
};

export default function StudentModal({ student, onClose }) {
  const { actions } = useApp();

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showAIEditor, setShowAIEditor] = useState(false);
  const [toast, setToast] = useState(null);

  if (!student) return null;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerateAI = async () => {
    setIsLoadingAI(true);
    setShowAIEditor(true);
    setAiComment('');
    setEmailSubject('');
    setEmailBody('');

    try {
      const result = await generarMensajeIntervencion(student);
      setAiComment(result.comentario || 'Diagnóstico no disponible.');
      setEmailSubject(result.correo_personalizado?.asunto || 'Acompañamiento Académico UTP');
      setEmailBody(result.correo_personalizado?.cuerpo || '');
    } catch (error) {
      console.error('Error generando propuesta en modal estudiante:', error);
      const fallback = obtenerIntervencionFallback(student);
      setAiComment(fallback.comentario);
      setEmailSubject(fallback.correo_personalizado.asunto);
      setEmailBody(fallback.correo_personalizado.cuerpo);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await enviarCorreoEstudiante({
        student,
        asunto: emailSubject,
        cuerpo: emailBody,
      });
      actions.markIntervened(student.codigo);
      showToast(`¡Correo enviado exitosamente a ${student.nombre}!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast('Error al enviar el correo. Por favor, intente nuevamente.', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const evals = getEvalConfig(student.cursoId);
  const recs = getAIRecommendations(student);
  const grades = student.grades || {};
  const promedio = student.promedio ?? 0;
  const needsRounding = promedio >= ROUND_THRESHOLD && promedio < MIN_APPROVAL;
  const necesitaProyeccion = student.notaNecesaria;
  const necesitaLabel =
    student.notaNecesariaLabel || evals[evals.length - 1]?.label || 'Evaluación Final';
  const necesitaWeight = student.notaNecesariaWeight || evals[evals.length - 1]?.weight || 0;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-in relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#990000] to-red-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {student.nombre
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <h2 className="font-black text-slate-900 leading-tight text-base">
                {student.nombre}
              </h2>
              <p className="text-xs text-slate-500 font-mono font-bold">
                {student.codigo} · {student.carrera}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={student.riesgo} size="sm" pulse={student.riesgo === 'CRITICO'} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Promedio',
                value: promedio.toFixed(2),
                sub: needsRounding ? '→ 12 (visual)' : '',
                color:
                  promedio >= 12
                    ? 'text-emerald-600'
                    : promedio >= 10
                      ? 'text-amber-600'
                      : 'text-[#d32f2f]',
              },
              {
                label: 'Nota Final',
                value: student.notaFinal,
                sub: needsRounding ? '⟳ Redondeado' : 'Sin redondeo',
                color: student.notaFinal >= 12 ? 'text-emerald-600' : 'text-[#d32f2f]',
              },
              {
                label: 'Asistencia',
                value: `${student.asistencia}%`,
                sub: student.asistencia < 65 ? 'Deficiente' : 'Aceptable',
                color:
                  student.asistencia >= 75
                    ? 'text-emerald-600'
                    : student.asistencia >= 65
                      ? 'text-amber-600'
                      : 'text-[#d32f2f]',
              },
              {
                label: 'Inactividad',
                value: `${student.actividadDias}d`,
                sub: student.actividadDias > 14 ? 'Abandono Silencioso' : 'Normal',
                color:
                  student.actividadDias > 21
                    ? 'text-[#d32f2f]'
                    : student.actividadDias > 14
                      ? 'text-amber-600'
                      : 'text-emerald-600',
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center shadow-sm"
              >
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{m.label}</p>
                {m.sub && (
                  <p className={`text-[10px] mt-0.5 ${m.color} opacity-80 font-bold`}>{m.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Projection for last evaluation */}
          {necesitaProyeccion !== null && necesitaProyeccion > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={15} className="text-blue-600" />
                <span className="text-xs font-black text-blue-800 uppercase tracking-wider">
                  Proyección — Motor UTP
                </span>
              </div>
              <p className="text-xs text-blue-950 font-medium">
                Para alcanzar el <strong className="text-blue-900">11.5 acumulado</strong> (mínimo
                aprobatorio con redondeo), el estudiante necesita obtener al menos{' '}
                <strong
                  className={`text-base font-black ${necesitaProyeccion > 15 ? 'text-red-600' : necesitaProyeccion > 12 ? 'text-amber-600' : 'text-emerald-600'}`}
                >
                  {necesitaProyeccion.toFixed(1)}
                </strong>{' '}
                en {necesitaLabel} (peso: {(necesitaWeight * 100).toFixed(0)}%).
              </p>
              {necesitaProyeccion > 18 && (
                <p className="text-[11px] text-red-600 font-bold mt-1.5">
                  ⚠ La nota requerida supera el 18/20 — recuperación muy difícil.
                </p>
              )}
            </div>
          )}
          {necesitaProyeccion === null && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm">
              <p className="text-xs text-red-700 font-bold flex items-center gap-1.5">
                ⛔ <strong>Matemáticamente imposible aprobar:</strong> Incluso con 20/20 en{' '}
                {necesitaLabel}, no alcanzaría el mínimo de 11.5.
              </p>
            </div>
          )}

          {/* Dynamic grades breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Award size={14} className="text-violet-600" /> Detalle de Notas — {student.cursoId}
            </h3>
            {evals.map((e) => (
              <GradeBar key={e.key} label={e.label} value={grades[e.key] || 0} weight={e.weight} />
            ))}
          </div>

          {/* Academic & Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Financial Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock size={14} className="text-amber-500" /> Estado de Pagos
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Estado General:</span>
                  <span
                    className={`font-black uppercase ${student.estado_pago === 'PAGADO' ? 'text-emerald-600' : 'text-orange-600'}`}
                  >
                    {student.estado_pago || 'PENDIENTE'}
                  </span>
                </div>
                {student.estado_pago !== 'PAGADO' && student.detalle_pagos ? (
                  <div className="space-y-1.5 pt-1 border-t border-slate-200/50">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Cuotas Vencidas:</span>
                      <span className="font-black text-slate-800 font-mono">
                        {student.detalle_pagos.cuotas_vencidas}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Monto Pendiente:</span>
                      <span className="font-black text-slate-800 font-mono">
                        S/. {student.detalle_pagos.monto_pendiente.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Próximo Vencimiento:</span>
                      <span className="font-black text-slate-800 font-mono">
                        {student.detalle_pagos.proximo_vencimiento}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    ✓ Estudiante al día en sus cuotas del ciclo.
                  </div>
                )}
              </div>
            </div>

            {/* Critical Courses */}
            {student.academic && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen size={14} className="text-blue-600" /> Cursos Críticos
                </h3>
                <div className="space-y-2.5">
                  {student.academic.cursos.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-0.5 border-b border-slate-200/60 pb-1.5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 truncate max-w-[170px]">{c.nombre}</span>
                        <span
                          className={`font-mono font-black ${c.nota >= 12 ? 'text-emerald-600' : 'text-red-500'}`}
                        >
                          {c.nota.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Asist: {Math.round(c.asistencia * 100)}%</span>
                        <span>Canvas: {c.actividad_virtual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-4">
              <Activity size={14} className="text-blue-600" /> Evolución de Actividad en Campus
              Virtual
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={student.actividadMensual}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="accesos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#actGrad)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI INTERVENTION GENERATOR INTEGRATION */}
          <div className="border-t border-slate-200/80 pt-4 space-y-4">
            {!showAIEditor ? (
              <button
                onClick={handleGenerateAI}
                className="group relative w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Brain size={14} className="group-hover:animate-pulse" />
                Generar Intervención Inteligente con IA
              </button>
            ) : isLoadingAI ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 text-center shadow-inner">
                <Loader2 size={32} className="text-[#990000] animate-spin" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider animate-pulse">
                  Generando propuesta con Gemini 2.5 Flash...
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-violet-600" />
                    <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider">
                      Diagnóstico IA del Asesor
                    </h4>
                  </div>
                  <p className="text-xs text-violet-950 font-medium leading-relaxed">{aiComment}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Asunto del Correo de Retención
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Cuerpo del Correo (Editable)
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-medium leading-relaxed outline-none transition-all shadow-inner resize-y font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAIEditor(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all border border-slate-200"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        ENVIANDO CORREO...
                      </>
                    ) : (
                      <>
                        <Mail size={12} />
                        ENVIAR CORREO
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Static Recommendations */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Brain size={14} className="text-violet-600" /> Alertas Predictivas de Riesgo
            </h3>
            {recs.map((rec, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border shadow-sm ${rec.bg} animate-fade-in`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <rec.icon size={14} className={rec.color} />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${rec.color}`}>
                    {rec.tipo}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec.texto}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {!showAIEditor && (
            <div className="flex gap-2 pt-2 border-t border-slate-200/60">
              <button
                onClick={() =>
                  window.open(
                    `mailto:${student.email || `${student.codigo.toLowerCase()}@utp.edu.pe`}?subject=Seguimiento Académico VIGÍA&body=Estimado/a ${student.nombre},%0D%0A%0D%0ALe contactamos desde el Área de Acompañamiento Académico UTP...`,
                    '_blank'
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Mail size={13} />
                Email directo
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black uppercase tracking-wider transition-all border border-slate-300"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-slate-900 border border-slate-700/50 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 animate-slide-in">
          <div
            className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          </div>
          <div className="min-w-[200px]">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Notificación
            </p>
            <p className="text-sm font-bold text-slate-100">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
