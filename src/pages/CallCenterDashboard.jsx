import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Zap, Loader2, MessageCircle, Mail, X, Search, CheckCircle, FileSpreadsheet, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { generarMensajeIntervencion } from '../services/ia.service.js';
import { enrichStudentData } from '../data/dataset.js';
import { enviarCorreoEstudiante } from '../services/messaging.service.js';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function CallCenterDashboard() {
  const { state } = useApp();
  const { students } = state;

  // Filters and calculations
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [intervenedIds, setIntervenedIds] = useState(new Set());

  // Modal and AI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [aiComment, setAiComment] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [toast, setToast] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const totalStudents = students?.length || 0;
  const pendingPayments = students?.filter(s => s.estado_pago === 'PENDIENTE' || (!s.estado_pago && parseInt(s.codigo.replace(/\D/g, ''), 10) % 3 === 0)).length || 0;
  const criticalRisk = students?.filter(s => s.riesgo === 'CRITICO' || s.riesgo === 'ALTO').length || 0;

  const filteredStudents = (students || [])
    .filter(student => {
      const estadoPago = student.estado_pago || (parseInt(student.codigo.replace(/\D/g, ''), 10) % 3 === 0 ? 'PENDIENTE' : 'PAGADO');
      if (activeFilter === 'DEBT') {
        return estadoPago === 'PENDIENTE';
      }
      if (activeFilter === 'RISK') {
        return student.riesgo === 'CRITICO' || student.riesgo === 'ALTO';
      }
      return true;
    })
    .filter(s =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte VIGIA');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Ciclo', key: 'ciclo', width: 15 },
      { header: 'Promedio', key: 'promedio', width: 15 },
      { header: 'Asistencia', key: 'asistencia', width: 15 },
      { header: 'Riesgo', key: 'riesgo', width: 15 },
      { header: 'Pago', key: 'pago', width: 15 },
      { header: 'Estado de Gestión', key: 'gestion', width: 20 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD32F2F' }
      };
      cell.font = {
        name: 'Segoe UI',
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    filteredStudents.forEach((student) => {
      const estadoPago = student.estado_pago || (parseInt(student.codigo.replace(/\D/g, ''), 10) % 3 === 0 ? 'PENDIENTE' : 'PAGADO');
      const estadoGestion = intervenedIds.has(student.codigo) ? 'Gestionado' : 'Pendiente';
      
      worksheet.addRow({
        codigo: student.codigo,
        nombre: student.nombre,
        ciclo: student.ciclo || '2026-I',
        promedio: typeof student.promedio === 'number' ? Math.round(student.promedio * 100) / 100 : student.promedio,
        asistencia: `${student.asistencia}%`,
        riesgo: student.riesgo,
        pago: estadoPago,
        gestion: estadoGestion
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.alignment = { vertical: 'middle' };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Reporte_Intervenciones_UTP.xlsx');
  };

  const handleIntervene = async (student) => {
    // Enrich student details from DB or INITIAL dataset
    const enriched = enrichStudentData(student);
    
    setSelectedStudent(enriched);
    setIsModalOpen(true);
    setIsLoadingAI(true);
    setAiComment('');
    setEmailSubject('');
    setEmailBody('');
 
    try {
      const result = await generarMensajeIntervencion(enriched);
      setAiComment(result.comentario || 'Diagnóstico no disponible.');
      setEmailSubject(result.correo_personalizado?.asunto || 'Acompañamiento Académico UTP');
      setEmailBody(result.correo_personalizado?.cuerpo || '');
    } catch (error) {
      console.error('Error al generar el diagnóstico de la IA:', error);
      showToast('Error al conectar con la IA. Se utilizará contingencia local.', 'error');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedStudent) return;
    setIsSendingEmail(true);
    try {
      await enviarCorreoEstudiante({
        student: selectedStudent,
        asunto: emailSubject,
        cuerpo: emailBody
      });
      setIntervenedIds(prev => {
        const next = new Set(prev);
        next.add(selectedStudent.codigo);
        return next;
      });
      showToast(`¡Correo enviado exitosamente a ${selectedStudent.nombre}!`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error enviando correo:', error);
      showToast('Error al enviar el correo. Por favor, intente nuevamente.', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedStudent) return;
    // Simular envío de WhatsApp imprimiendo log en consola
    console.log('--- ENVÍO DE ALERTA WHATSAPP ---');
    console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);
    console.log(`Destinatario: ${selectedStudent.nombre} (${selectedStudent.codigo})`);
    console.log(`Mensaje Corto: Hola ${selectedStudent.nombre.split(' ')[0]}, te enviamos tu plan académico personalizado al correo institucional.`);
    console.log('--------------------------------');

    setIntervenedIds(prev => {
      const next = new Set(prev);
      next.add(selectedStudent.codigo);
      return next;
    });
    showToast(`¡Alerta de WhatsApp enviada a ${selectedStudent.nombre}!`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-[#d32f2f] font-black uppercase tracking-widest mb-1">
              Módulo de Retención
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Panel Administrativo - Seguimiento de Retención
            </h1>
            <p className="text-slate-600 text-xs mt-1.5 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
              Gestión de llamadas y compromisos de pago <span className="text-slate-300">·</span> <span className="text-[#d32f2f] font-black">Ciclo 2026-I</span>
            </p>
          </div>
          <div>
            <button
              onClick={exportarExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <FileSpreadsheet size={16} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Bloque A: Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Total Asignados</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Pendientes de Pago</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{pendingPayments}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Riesgo Crítico / Alto</p>
            <p className="text-2xl font-black text-[#d32f2f] mt-1">{criticalRisk}</p>
          </div>
        </div>

        {/* Bloque B: Botones de Filtro Rápido y Búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              Todos los Alumnos
            </button>
            <button
              onClick={() => setActiveFilter('DEBT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === 'DEBT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              Solo Deudores
            </button>
            <button
              onClick={() => setActiveFilter('RISK')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === 'RISK'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              Riesgo Académico
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full bg-white text-slate-800"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ciclo</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asistencia</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Riesgo</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado Pago</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents && filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const estadoPago = student.estado_pago || (parseInt(student.codigo.replace(/\D/g, ''), 10) % 3 === 0 ? 'PENDIENTE' : 'PAGADO');
                    const isPagado = estadoPago === 'PAGADO';
                    const isIntervened = intervenedIds.has(student.codigo);

                    return (
                      <tr key={student.codigo} className={`transition-colors ${isIntervened ? 'bg-slate-50 opacity-80' : 'hover:bg-slate-50/80'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-700">
                          {student.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{student.nombre}</div>
                          <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                          {student.ciclo || '2026-I'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-black ${student.promedio >= 12 ? 'text-emerald-600' : 'text-[#d32f2f]'}`}>
                            {typeof student.promedio === 'number' ? Math.round(student.promedio * 100) / 100 : student.promedio}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                          {student.asistencia}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RiskBadge level={student.riesgo} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide border uppercase inline-flex items-center ${
                            isPagado 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {estadoPago}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isIntervened ? (
                            <button
                              disabled
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed font-bold text-xs uppercase tracking-wider transition-all"
                            >
                              <CheckCircle size={12} />
                              GESTIONADO
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIntervene(student)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.97]"
                            >
                              <Zap size={12} />
                              INTERVENIR
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No hay estudiantes registrados o cargando datos...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal for AI Intervention Message */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Propuesta de Intervención Inteligente</h3>
                {selectedStudent && (
                  <p className="text-xs text-slate-500 font-bold">
                    Estudiante: {selectedStudent.nombre} ({selectedStudent.codigo}) · {selectedStudent.carrera}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={36} className="text-[#d32f2f] animate-spin" />
                  <p className="text-sm text-slate-600 font-black uppercase tracking-wider animate-pulse">Generando propuesta con Gemini 2.5 Flash...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedStudent && (
                    <>
                      {/* Desglose Académico y Financiero */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Panel Académico */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                          <h4 className="font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            <BookOpen size={12} className="text-blue-600" /> Resumen Académico
                          </h4>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Promedio</span>
                              <span className={`text-xs font-black ${selectedStudent.promedio >= 12 ? 'text-emerald-600' : 'text-red-600'}`}>{typeof selectedStudent.promedio === 'number' ? Math.round(selectedStudent.promedio * 100) / 100 : selectedStudent.promedio}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Asistencia</span>
                              <span className="text-xs font-black text-slate-800 font-mono">{Math.round((selectedStudent.academic?.asistencia_global ?? 0.75) * 100)}%</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Canvas</span>
                              <span className="text-xs font-black text-slate-800">{selectedStudent.academic?.actividad_campus || 'Media'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Panel Financiero */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                          <h4 className="font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            <Clock size={12} className="text-amber-500" /> Resumen Financiero
                          </h4>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Estado</span>
                              <span className={`text-xs font-black uppercase ${selectedStudent.estado_pago === 'PAGADO' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {selectedStudent.estado_pago}
                              </span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Vencidas</span>
                              <span className="text-xs font-black text-slate-800 font-mono">{selectedStudent.detalle_pagos?.cuotas_vencidas ?? 0}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                              <span className="text-[9px] text-slate-400 font-bold block">Pendiente</span>
                              <span className="text-xs font-black text-slate-800 font-mono">S/.{selectedStudent.detalle_pagos?.monto_pendiente ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Comentario de Diagnóstico */}
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-violet-600" />
                      <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider">Diagnóstico IA del Asesor</h4>
                    </div>
                    <p className="text-xs text-violet-950 font-medium leading-relaxed">
                      {aiComment}
                    </p>
                  </div>

                  {/* Asunto Editable */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Asunto del Correo</label>
                    <input 
                      type="text" 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold outline-none transition-all shadow-inner"
                    />
                  </div>

                  {/* Cuerpo del Correo Editable */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cuerpo del Mensaje (Editable)</label>
                    <textarea 
                      value={emailBody} 
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={9}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-medium leading-relaxed outline-none transition-all shadow-inner resize-y font-mono animate-fade-in"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isLoadingAI && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <MessageCircle size={12} />
                  ENVIAR WHATSAPP
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      ENVIANDO...
                    </>
                  ) : (
                    <>
                      <Mail size={12} />
                      ENVIAR CORREO
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-slate-900 border border-slate-700/50 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          </div>
          <div className="min-w-[200px]">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Notificación</p>
            <p className="text-sm font-bold text-slate-100">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white transition-colors text-xs font-bold">✕</button>
        </div>
      )}
    </div>
  );
}
