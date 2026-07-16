import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const ROLE_LABEL = {
  DOCENTE: 'Docente',
  CALLCENTER: 'Agente de Retención',
  ADMIN: 'Administrador General',
};

function Toggle({ label, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { state } = useApp();
  const user = state.currentUser || {};

  return (
    <PageShell
      eyebrow="Sistema"
      title="Configuración"
      description="Datos de tu cuenta y preferencias del sistema VIGÍA."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil (datos reales de la sesión) */}
        <Panel className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-2xl mb-3">
              {(user.nombre || 'U')
                .split(' ')
                .filter((w) => w.length > 2 && !w.includes('.'))
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase() || 'U'}
            </div>
            <h3 className="text-lg font-black text-slate-900">{user.nombre || 'Usuario'}</h3>
            <span className="mt-1 text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              {ROLE_LABEL[user.role] || 'Usuario'}
            </span>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            {[
              ['Código', user.codigo],
              ['Correo', user.email || `${user.codigo?.toLowerCase()}@utp.edu.pe`],
              ['Cargo', user.cargo || '—'],
              ['Departamento', user.departamento || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold">{k}</span>
                <span className="text-slate-800 font-bold text-right">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Preferencias */}
        <div className="lg:col-span-2 space-y-6">
          <DemoNote>
            Las preferencias se guardan localmente en esta demostración. La persistencia por usuario
            se habilitará con la tabla de configuración en Supabase.
          </DemoNote>

          <Panel className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-3">
              <Bell size={16} className="text-brand-700" /> Notificaciones
            </h3>
            <div className="divide-y divide-slate-50">
              <Toggle label="Alertas de riesgo crítico en tiempo real" defaultOn />
              <Toggle label="Resumen diario por correo" defaultOn />
              <Toggle label="Notificaciones de nuevos mensajes" />
              <Toggle label="Recordatorios de intervención pendiente" defaultOn />
            </div>
          </Panel>

          <Panel className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-3">
              <Palette size={16} className="text-brand-700" /> Apariencia
            </h3>
            <div className="divide-y divide-slate-50">
              <Toggle label="Modo compacto en tablas" />
              <Toggle label="Animaciones de interfaz" defaultOn />
            </div>
          </Panel>

          <Panel className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 mb-3">
              <Shield size={16} className="text-brand-700" /> Seguridad
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider cursor-not-allowed"
              >
                <User size={14} /> Cambiar contraseña
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-risk-low">
                <Check size={14} /> Sesión segura (HTTPS)
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
