import React, { useMemo, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

function initials(nombre = '') {
  return nombre
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const CANALES = ['WhatsApp', 'Correo', 'SMS'];

export default function ConversacionesPage() {
  const { state } = useApp();

  const chats = useMemo(
    () =>
      state.students
        .filter((s) => s.detalle_pagos?.cuotas_vencidas > 0)
        .slice(0, 10)
        .map((s, i) => ({
          ...s,
          canal: CANALES[i % CANALES.length],
          preview:
            i % 2 === 0
              ? 'Puedo pagar la próxima semana.'
              : 'Necesito información sobre el fraccionamiento.',
        })),
    [state.students]
  );

  const [activo, setActivo] = useState(chats[0] || null);

  return (
    <PageShell
      eyebrow="Operaciones"
      title="Conversaciones"
      description="Historial de mensajería multicanal con estudiantes de la cartera de retención."
    >
      <DemoNote>
        Conversaciones de demostración. La mensajería omnicanal (WhatsApp Business, correo, SMS) se
        habilitará mediante flujos de n8n.
      </DemoNote>

      <Panel className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[500px]">
          <div className="border-r border-slate-100 overflow-y-auto">
            {chats.map((c) => (
              <button
                key={c.codigo}
                onClick={() => setActivo(c)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-slate-50 hover:bg-slate-50 ${
                  activo?.codigo === c.codigo ? 'bg-brand-50' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  {initials(c.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800 truncate">{c.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{c.preview}</p>
                </div>
                <span className="text-[9px] font-black uppercase text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                  {c.canal}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            {activo ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs">
                    {initials(activo.nombre)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{activo.nombre}</p>
                    <p className="text-[11px] text-slate-400">vía {activo.canal}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                  <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-slate-700 shadow-sm">
                    Hola {activo.nombre.split(' ')[0]}, le contactamos por su compromiso de pago
                    pendiente.
                  </div>
                  <div className="max-w-[70%] ml-auto bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm shadow-sm">
                    {activo.preview}
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    placeholder="Escribe un mensaje…"
                    disabled
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm disabled:cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="p-2.5 bg-brand-600 text-white rounded-xl opacity-60 cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <MessageSquare size={32} />
                <span className="text-sm font-semibold">Sin conversaciones activas</span>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
