import React, { useMemo, useState } from 'react';
import { Send, Search } from 'lucide-react';
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

export default function MensajeriaPage() {
  const { state } = useApp();

  // Conversaciones derivadas de los estudiantes en riesgo (contactables)
  const conversaciones = useMemo(() => {
    return state.students
      .filter((s) => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO')
      .slice(0, 12)
      .map((s, i) => ({
        ...s,
        preview:
          i % 3 === 0
            ? 'Gracias profesor, coordino la tutoría.'
            : i % 3 === 1
              ? 'No pude asistir por temas de salud.'
              : 'Entendido, revisaré el material.',
        hora: `${9 + (i % 8)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}`,
        noLeidos: i % 4 === 0 ? (i % 3) + 1 : 0,
      }));
  }, [state.students]);

  const [activo, setActivo] = useState(conversaciones[0] || null);
  const [texto, setTexto] = useState('');

  return (
    <PageShell
      eyebrow="Organización"
      title="Mensajería"
      description="Canal de comunicación directa con estudiantes para coordinar tutorías y seguimiento."
    >
      <DemoNote>
        Interfaz de demostración. El envío real de mensajes se habilitará al conectar el canal
        institucional (correo UTP / WhatsApp Business) mediante n8n.
      </DemoNote>

      <Panel className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[520px]">
          {/* Lista de conversaciones */}
          <div className="border-r border-slate-100 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Buscar conversación…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversaciones.map((c) => (
                <button
                  key={c.codigo}
                  onClick={() => setActivo(c)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    activo?.codigo === c.codigo ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                    {initials(c.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-800 truncate">{c.nombre}</p>
                      <span className="text-[10px] text-slate-400 font-bold">{c.hora}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.preview}</p>
                  </div>
                  {c.noLeidos > 0 && (
                    <span className="h-5 w-5 bg-brand-600 rounded-full text-[10px] flex items-center justify-center text-white font-black flex-shrink-0">
                      {c.noLeidos}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Panel de conversación */}
          <div className="flex flex-col">
            {activo ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-black text-xs">
                    {initials(activo.nombre)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{activo.nombre}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {activo.codigo} · {activo.cursoId}
                    </p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                  <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-slate-700 shadow-sm">
                    Hola {activo.nombre.split(' ')[0]}, noté que tu asistencia bajó. ¿Todo bien?
                  </div>
                  <div className="max-w-[70%] ml-auto bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm shadow-sm">
                    {activo.preview}
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    disabled
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed"
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
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-semibold">
                Selecciona una conversación
              </div>
            )}
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
