import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, AlertTriangle, Mail, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Particles() {
  return null;
}

function EyeLogoBig() {
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/UTP-logo.svg/960px-UTP-logo.svg.png"
      alt="UTP"
      className="mx-auto w-16 h-16 object-contain"
    />
  );
}

// ── Login Form ────────────────────────────────────────────────
function LoginForm() {
  const { actions } = useApp();
  const { signIn, loading, error: authError } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [codeError, setCodeError] = useState('');

  const validateCode = (val) => {
    if (!val) { setCodeError(''); return; }
    if (val.includes('@')) {
      if (!val.endsWith('@utp.edu.pe')) {
        setCodeError('El correo institucional debe terminar en @utp.edu.pe');
      } else {
        setCodeError('');
      }
    } else {
      if (!/^C/.test(val)) setCodeError('Solo identificadores con prefijo "C" o correos @utp.edu.pe son autorizados.');
      else if (!/^C\d{1,5}$/.test(val)) setCodeError('Formato: C seguido de 5 dígitos (ej. C13005)');
      else setCodeError('');
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    const processedVal = val.includes('@') ? val : val.toUpperCase();
    setCodigo(processedVal);
    validateCode(processedVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !password || codeError || loading) return;

    try {
      const { user, profile } = await signIn(codigo, password);
      actions.loginSuccess(user, profile);
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Alerta de información del cuadro de diseño */}
      <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5">
        <Shield size={16} className="text-blue-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong>Información importante:</strong> Use su código docente con prefijo "C" o su correo institucional.
        </p>
      </div>

      {/* Error de Backend */}
      {authError && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 animate-fade-in">
          <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">{authError}</p>
        </div>
      )}

      {/* Input de Código */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Código Docente o Correo
        </label>
        <div className="relative">
          <input
            type="text"
            value={codigo}
            onChange={handleCodeChange}
            placeholder="C13005"
            disabled={loading}
            className={`input-glow w-full rounded-xl px-4 py-3.5 placeholder-slate-400
              font-mono text-sm tracking-wider outline-none transition-all
              ${codeError ? 'border-red-500! focus:border-red-600!' : ''}`}
          />
          {codigo && !codeError && (codigo.includes('@') ? codigo.endsWith('@utp.edu.pe') : /^C\d{5}$/.test(codigo)) && (
            <CheckCircle2 size={16} className="absolute right-4 top-4 text-emerald-600" />
          )}
          {codeError && (
            <XCircle size={16} className="absolute right-4 top-4 text-red-500" />
          )}
        </div>
        {codeError && <p className="text-xs text-red-600 font-medium mt-1">{codeError}</p>}
      </div>

      {/* Input de Password */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            className="input-glow w-full rounded-xl px-4 py-3.5 pr-12 text-sm outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Botón Guinda Institucional */}
      <button
        type="submit"
        disabled={!codigo || !password || !!codeError || loading}
        className="btn-shine w-full py-3.5 rounded-xl bg-utp-red hover:bg-utp-hover
          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all
          flex items-center justify-center gap-2 shadow-md shadow-red-900/10 mt-2 active:scale-[0.99]"
      >
        {loading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Shield size={16} />
        )}
        {loading ? 'Autenticando...' : 'Acceder al Sistema VIGÍA'}
        {!loading && <ArrowRight size={16} />}
      </button>

      {/* Demo hint */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Demo: <span className="text-slate-800 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">C13005</span> o <span className="text-slate-800 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">C13007</span> / <span className="text-slate-800 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">Utp2026#</span>
        </p>
      </div>
    </form>
  );
}

// ── Recovery Form ─────────────────────────────────────────────
function RecoveryForm() {
  const { state, actions } = useApp();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mb-3">
          <Mail size={22} className="text-utp-red" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Verificación de Identidad</h3>
        <p className="text-xs text-slate-500 mt-1">
          Se simuló el envío de un código de 6 dígitos a:
        </p>
        <p className="text-xs font-semibold text-utp-red mt-0.5">{state.recoveryEmail}</p>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 mb-2.5 uppercase tracking-wider font-semibold">
          📧 Correo Simulado — Código de Verificación
        </p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-bold text-slate-800 tracking-widest">
            {state.recoveryCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Válido por 10 minutos · UTP Sistema Académico</p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
          Ingresar código de verificación
        </label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="• • • • • •"
          maxLength={6}
          className="input-glow w-full rounded-xl px-4 py-3 font-mono text-xl tracking-widest text-center outline-none transition-all"
        />
        {state.recoveryError && (
          <p className="text-xs text-red-600 font-medium mt-1">{state.recoveryError}</p>
        )}
      </div>

      <button
        onClick={() => actions.verifyRecovery(code)}
        disabled={code.length !== 6}
        className="btn-shine w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
          disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all
          flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <CheckCircle2 size={16} />
        Verificar y Restaurar Acceso
      </button>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const { state } = useApp();
  const isRecovery = state.authState === 'recovery';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Particles />

      <div className="relative w-full max-w-[420px] animate-fade-in">
        
        {/* Cuadro del Formulario Blanco / Hueso */}
        <div className="glass-card rounded-3xl p-7 sm:p-8">

          {/* Header Corporativo Actualizado */}
          <div className="text-center mb-7">
            <EyeLogoBig />
            
            {/* Nuevo diseño de UTP + VIGÍA */}
            <div className="flex items-center justify-center gap-1 mt-5">
              {/* Contenedores independientes para U T P */}
              <div className="flex gap-1">
                <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-sm font-black text-lg leading-none">
                  U
                </span>
                <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-sm font-black text-lg leading-none">
                  T
                </span>
                <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-sm font-black text-lg leading-none">
                  P
                </span>
              </div>

              {/* El signo + en Rojo */}
              <span className="text-red-600 font-black text-2xl mx-1.5">
                +
              </span>

              {/* VIGÍA en Negro */}
              <span className="text-black font-black text-2xl tracking-tight">
                VIGÍA
              </span>
            </div>

            <p className="text-slate-500 text-xs mt-2 font-medium">Sistema de Alerta Temprana Académica</p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-10 bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTP · 2026-I</span>
              <div className="h-px w-10 bg-slate-200" />
            </div>
          </div>

          {/* Form */}
          {isRecovery ? <RecoveryForm /> : <LoginForm />}
        </div>

        {/* Footer externo */}
        <p className="text-center text-[11px] text-slate-300 mt-6 tracking-wide font-medium drop-shadow-sm">
          Universidad Tecnológica del Perú · Dirección de Tecnología Educativa
        </p>
      </div>
    </div>
  );
}