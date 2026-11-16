import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { AnimatedH1 } from './AnimatedH1.tsx';
import { nuamApi } from '../lib/api.ts';
import type { AuthSession } from '../types/nuam.ts';

interface LoginViewProps {
  externalError?: string | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthenticated: (session: AuthSession, rememberMe: boolean) => void;
}

const NuamLogoMark: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div
    className={`${className} rounded-[4px] bg-[#E65A28] flex items-center justify-center shrink-0`}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <rect
        x="12"
        y="4.2"
        width="11"
        height="11"
        transform="rotate(45 12 4.2)"
        stroke="#FFFFFF"
        strokeWidth="2.1"
      />
    </svg>
  </div>
);

export const LoginView: React.FC<LoginViewProps> = ({
  externalError,
  darkMode,
  onToggleDarkMode,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const performLogin = async (targetEmail: string, targetPassword: string) => {
    setError(null);
    setLoading(true);
    try {
      const session = await nuamApi.login(targetEmail, targetPassword);
      onAuthenticated(session, rememberMe);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo validar las credenciales en el servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await nuamApi.forgotPassword(forgotEmail);
      setForgotStatus(res.message);
    } catch (err) {
      setForgotStatus(
        err instanceof Error ? err.message : 'No se pudo enviar la solicitud.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const displayError = error || externalError;

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12">
      {/* Left Split Panel: Dark Carbon Grid */}
      <section className="lg:col-span-6 nuam-carbon-grid text-white px-6 sm:px-10 lg:px-12 py-8 flex flex-col justify-between min-h-[420px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[#1C1F26]">
        {/* Top Row: Brand & Regional Markets */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NuamLogoMark className="w-9 h-9" />
            <div>
              <div className="font-display font-bold text-lg tracking-tight text-white leading-none">
                nuam
              </div>
              <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-400 uppercase mt-1 leading-none">
                MERCADO INTEGRADO REGIONAL
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-zinc-300 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SANTIAGO · LIMA · COLOMBIA</span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="my-12 lg:my-auto max-w-xl">
          <AnimatedH1 className="font-display text-4xl sm:text-5xl xl:text-[58px] font-extrabold tracking-[-0.03em] leading-[1.03]">
            <span className="block text-white">Un mercado</span>
            <span className="block text-white">claro</span>
            <span className="block text-[#E65A28]">mueve la</span>
            <span className="block text-[#E65A28]">región.</span>
          </AnimatedH1>

          <p className="mt-7 text-sm sm:text-[15px] text-zinc-400 leading-relaxed max-w-md">
            Plataforma centralizada de cumplimiento tributario, validación de factores DJ1948 y
            compensación transfronteriza institucional.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-2 rounded-[2px] border border-zinc-800 bg-zinc-900/70 font-mono text-xs text-zinc-300">
              Bolsa de Santiago
            </span>
            <span className="px-3.5 py-2 rounded-[2px] border border-zinc-800 bg-zinc-900/70 font-mono text-xs text-zinc-300">
              BVL Lima
            </span>
            <span className="px-3.5 py-2 rounded-[2px] border border-zinc-800 bg-zinc-900/70 font-mono text-xs text-zinc-300">
              BVC Colombia
            </span>
          </div>
        </div>

        {/* Bottom Technical Footer */}
        <div className="pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.12em] text-zinc-500 uppercase">
          <span>SISTEMA TRIBUTARIO v2.4</span>
          <span>AUTENTICACIÓN SHA-256 / JWT RBAC</span>
        </div>
      </section>

      {/* Right Split Panel: Warm Parchment / Terminal Login */}
      <section className="lg:col-span-6 bg-[#F7F3ED] dark:bg-[#0D1016] text-[#111317] dark:text-slate-100 px-6 sm:px-10 lg:px-14 py-8 flex flex-col justify-between min-h-[540px] lg:min-h-screen transition-colors">
        {/* Top Row: Console Brand & Theme Toggle */}
        <div className="max-w-[460px] w-full mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <NuamLogoMark className="w-7 h-7" />
              <div>
                <div className="font-display font-bold text-sm text-[#111317] dark:text-white leading-none">
                  nuam tributario
                </div>
                <div className="text-[11px] text-[#6B665F] dark:text-slate-400 mt-0.5 leading-none">
                  consola de operaciones
                </div>
              </div>
            </div>
            <div className="mt-4 font-mono text-[11px] font-bold tracking-[0.14em] text-[#D45120] dark:text-[#E65A28] uppercase">
              ACCESO PRIVADO
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Alternar modo de color"
            className="w-9 h-9 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#151921] text-[#3A3733] dark:text-amber-400 hover:bg-[#EFE9DF] dark:hover:bg-[#1D222D] flex items-center justify-center cursor-pointer transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Authentication Form */}
        <div className="max-w-[460px] w-full mx-auto my-10">
          <h2 className="font-display text-3xl sm:text-[36px] font-extrabold tracking-[-0.025em] leading-[1.1] text-[#111317] dark:text-white">
            Vuelve a poner las cosas en orden.
          </h2>
          <p className="mt-3 text-sm text-[#5C5852] dark:text-slate-400 leading-relaxed">
            Consulta dividendos, retenciones DJ1948 y auditoría fiscal desde un solo lugar
            centralizado.
          </p>

          {displayError && (
            <div
              role="alert"
              className="mt-5 p-3 rounded-[2px] border border-red-300 dark:border-red-900/70 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#111317] dark:text-slate-300 mb-2"
              >
                USUARIO / CORREO
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@nuam.com"
                className="w-full h-11 px-3.5 rounded-[2px] border border-[#2A2927] dark:border-[#2E3442] bg-[#EAE6DF] dark:bg-[#151921] text-sm text-[#111317] dark:text-white placeholder:text-[#8B857C] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E65A28] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-[#111317] dark:text-slate-300 mb-2"
              >
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••"
                  className="w-full h-11 pl-3.5 pr-10 rounded-[2px] border border-[#2A2927] dark:border-[#2E3442] bg-[#EAE6DF] dark:bg-[#151921] text-sm text-[#111317] dark:text-white placeholder:text-[#8B857C] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E65A28] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4742] dark:text-slate-400 hover:text-[#111317] dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs text-[#4A4742] dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-[2px] border-[#8B857C] accent-[#1665D8] cursor-pointer"
                />
                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotStatus(null);
                  setForgotOpen(true);
                }}
                className="text-xs font-bold text-[#111317] dark:text-[#E65A28] hover:underline cursor-pointer"
              >
                ¿Olvidó contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-[2px] bg-[#111317] dark:bg-[#E65A28] hover:bg-[#242830] dark:hover:bg-[#D14D1E] disabled:opacity-60 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{loading ? 'Validando acceso...' : 'Entrar al estudio'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Bottom Footer */}
        <div className="max-w-[460px] w-full mx-auto pt-5 border-t border-[#E2DDD4] dark:border-[#1F242D] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B665F] dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>NUAM Exchange 2026</span>
          </span>
          <span className="font-mono text-[11px]">Santiago · Lima · Colombia</span>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[2px] bg-[#FBF8F3] dark:bg-[#11141A] border border-[#DDD6CB] dark:border-[#232833] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-[#111317] dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#E65A28]" />
                <span>Recuperación de Contraseña</span>
              </h3>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded-[2px] text-[#6B665F] hover:bg-[#EFE9DF] dark:hover:bg-[#1D222D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5C5852] dark:text-slate-400 mb-4 leading-relaxed">
              Ingrese su correo institucional registrado en NUAM para recibir instrucciones de
              restablecimiento seguro.
            </p>
            {forgotStatus && (
              <div className="mb-4 p-3 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotStatus}</span>
              </div>
            )}
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="ejemplo@nuam.com"
                className="w-full h-10 px-3 rounded-[2px] border border-[#2A2927] dark:border-[#2E3442] bg-[#EAE6DF] dark:bg-[#151921] text-xs text-[#111317] dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#2A303D] text-xs font-medium text-[#3A3733] dark:text-slate-300 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 rounded-[2px] bg-[#111317] dark:bg-[#E65A28] hover:bg-[#242830] dark:hover:bg-[#D14D1E] text-white text-xs font-semibold cursor-pointer"
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
