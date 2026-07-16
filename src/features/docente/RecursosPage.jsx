import React from 'react';
import { FileText, Video, Download, BookMarked, GraduationCap, ClipboardList } from 'lucide-react';
import PageShell, { Panel, DemoNote } from '../../components/layout/PageShell.jsx';

const RECURSOS = [
  {
    icon: ClipboardList,
    titulo: 'Protocolo de Intervención Temprana',
    tipo: 'PDF · 12 págs',
    desc: 'Guía paso a paso para acompañar a estudiantes en riesgo de deserción.',
  },
  {
    icon: Video,
    titulo: 'Uso del Dashboard VIGÍA',
    tipo: 'Video · 8 min',
    desc: 'Tutorial de las funciones principales del panel del docente.',
  },
  {
    icon: BookMarked,
    titulo: 'Guía de Tutoría Académica UTP',
    tipo: 'PDF · 24 págs',
    desc: 'Lineamientos institucionales para sesiones de consejería estudiantil.',
  },
  {
    icon: FileText,
    titulo: 'Plantilla de Plan de Recuperación',
    tipo: 'DOCX · Editable',
    desc: 'Formato para estructurar el plan de mejora de un estudiante.',
  },
  {
    icon: GraduationCap,
    titulo: 'Buenas Prácticas de Retención',
    tipo: 'PDF · 16 págs',
    desc: 'Casos de éxito y estrategias validadas por bienestar estudiantil.',
  },
  {
    icon: Video,
    titulo: 'Interpretación del Nivel de Riesgo',
    tipo: 'Video · 5 min',
    desc: 'Cómo leer la clasificación de la IA y priorizar intervenciones.',
  },
];

export default function RecursosPage() {
  return (
    <PageShell
      eyebrow="Organización"
      title="Recursos"
      description="Material de apoyo, guías y plantillas para el acompañamiento académico de tus estudiantes."
    >
      <DemoNote>
        Biblioteca de referencia. La descarga de archivos se habilitará al conectar el repositorio
        documental institucional.
      </DemoNote>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {RECURSOS.map((r) => (
          <Panel key={r.titulo} className="p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="h-11 w-11 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                <r.icon size={19} className="text-brand-700" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {r.tipo}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-800 leading-snug mb-1">{r.titulo}</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed flex-1">{r.desc}</p>
            <button
              disabled
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider cursor-not-allowed"
            >
              <Download size={14} /> Descargar
            </button>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
