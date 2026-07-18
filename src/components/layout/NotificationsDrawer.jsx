import React, { useMemo, useState } from 'react';
import { X, AlertTriangle, TrendingDown, Clock, ChevronRight, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { ROLES } from '../../features/auth/roles.js';
import { atenderAlerta } from '../../features/shared/useAlertsLoader.js';

/** "Hace X min/h/d" a partir de un timestamp ISO. */
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.floor(diffMs / 60000));
  if (min < 1) return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} d`;
}

const RISK_STYLE = {
  CRITICO: {
    title: 'Riesgo Crítico de Deserción',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  ALTO: {
    title: 'Riesgo Alto de Deserción',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
};

export default function NotificationsDrawer() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const role = state.currentUser?.role;
  const canOpenCourse = role === ROLES.DOCENTE || role === ROLES.ADMIN;
  const { isNotificationsOpen, students, courses, alerts } = state;
  const [attending, setAttending] = useState(null);

  // Modo real: la tabla alerts (poblada por n8n) tiene registros
  const usingDbAlerts = alerts.length > 0;

  // ── Alertas reales de n8n ──────────────────────────────────
  const dbNotifications = useMemo(() => {
    return alerts
      .filter((a) => !a.atendida)
      .slice(0, 25)
      .map((a) => {
        const student = students.find((s) => s.codigo === a.student_codigo) || null;
        const style = RISK_STYLE[a.riesgo] || RISK_STYLE.ALTO;
        return {
          id: `db-${a.id}`,
          dbId: a.id,
          student,
          nombre: a.student_nombre || student?.nombre || a.student_codigo,
          codigo: a.student_codigo,
          mensaje: a.mensaje,
          icon: AlertTriangle,
          time: timeAgo(a.created_at),
          ...style,
        };
      });
  }, [alerts, students]);

  // ── Modo demostración (derivado del estado, sin tabla alerts) ──
  const derivedNotifications = useMemo(() => {
    if (usingDbAlerts) return [];
    const out = [];
    const sorted = [...students].sort((a, b) => a.promedio - b.promedio);
    sorted.forEach((student, index) => {
      const course = courses.find((c) => c.id === student.cursoId);
      const courseName = course ? course.nombre : student.cursoId;
      if (student.riesgo === 'CRITICO' && !student.intervenido) {
        out.push({
          id: `crit-${student.codigo}`,
          student,
          nombre: student.nombre,
          codigo: student.codigo,
          mensaje: `Promedio ${student.notaFinal} y asistencia ${student.asistencia}% en ${courseName}.`,
          icon: AlertTriangle,
          time: `Hace ${index * 15 + 5} min`,
          ...RISK_STYLE.CRITICO,
        });
      } else if (student.riesgo === 'ALTO' && !student.intervenido) {
        out.push({
          id: `alto-${student.codigo}`,
          student,
          nombre: student.nombre,
          codigo: student.codigo,
          mensaje: `Promedio ${student.notaFinal} y asistencia ${student.asistencia}% en ${courseName}.`,
          icon: TrendingDown,
          time: `Hace ${index * 20 + 10} min`,
          ...RISK_STYLE.ALTO,
        });
      }
    });
    return out.slice(0, 15);
  }, [usingDbAlerts, students, courses]);

  const notifications = usingDbAlerts ? dbNotifications : derivedNotifications;

  const handleAtender = async (alert) => {
    if (alert.dbId) {
      setAttending(alert.dbId);
      try {
        await atenderAlerta(alert.dbId);
        actions.markAlertAtendida(alert.dbId);
      } catch (err) {
        console.error('No se pudo marcar la alerta como atendida:', err.message);
      } finally {
        setAttending(null);
      }
    }
    if (alert.student) actions.markIntervened(alert.student.codigo);
  };

  if (!isNotificationsOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={actions.toggleNotifications}
      />

      {/* Side Panel Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] glass-panel border-l border-slate-700/50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
        style={{ animation: 'slideInRight 0.3s forwards' }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Centro de Alertas
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              {usingDbAlerts ? (
                <>
                  <Workflow size={12} className="text-brand-300" />
                  Generadas por la automatización n8n
                </>
              ) : (
                'Alertas derivadas del estado académico'
              )}
            </p>
          </div>
          <button
            onClick={actions.toggleNotifications}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-emerald-500/50" />
              </div>
              <p className="font-medium text-slate-400">No hay alertas pendientes</p>
              <p className="text-sm">Todos los estudiantes están bajo control.</p>
            </div>
          ) : (
            notifications.map((alert, i) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${alert.border} ${alert.bg} flex flex-col gap-3 animate-fade-in group hover:bg-slate-800/80 transition-colors`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <alert.icon size={16} className={alert.color} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${alert.color}`}>
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                    <Clock size={10} />
                    {alert.time}
                  </div>
                </div>

                {/* Student Info */}
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {alert.nombre}
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{alert.codigo}</p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{alert.mensaje}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-1 pt-3 border-t border-slate-700/30">
                  <button
                    onClick={() => {
                      actions.toggleNotifications();
                      const course = courses.find((c) => c.id === alert.student?.cursoId);
                      if (course && canOpenCourse) {
                        navigate(`/docente/curso/${course.id}`);
                      }
                    }}
                    className="flex-1 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Ver detalle <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleAtender(alert)}
                    disabled={attending === alert.dbId}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700/50 transition-colors disabled:opacity-50"
                  >
                    {attending === alert.dbId ? 'Atendiendo…' : 'Atender'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
