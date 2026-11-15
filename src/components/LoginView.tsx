import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Globe2,
  KeyRound,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import tradingFloorImg from '../assets/images/nuam_trading_floor_1794755963674.jpg';
import { nuamApi } from '../lib/api.ts';
import type { AuthSession } from '../types/nuam.ts';

interface LoginViewProps {
  externalError?: string | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthenticated: (session: AuthSession, rememberMe: boolean) => void;
}

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
  const [imgFailed, setImgFailed] = useState(false);

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
    <div className="min-h-screen w-full bg-[#F4F6F9] dark:bg-[#060B14] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top 3-Zone Corporate Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1528]/95 backdrop-blur-xs">
        <div className="max-w-[1360px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#0B1528] dark:bg-blue-600 text-white font-display font-bold text-lg flex items-center justify-center">
              N
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
                NUAM
              </span>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 dark:text-slate-400 uppercase block mt-1 leading-none">
                Plataforma Tributaria
              </span>
            </div>
          </a>

          {/* Center Navigation */}
          <nav
            aria-label="Navegación corporativa"
            className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-600 dark:text-slate-300"
          >
            <a href="#plataforma" className="hover:text-slate-950 dark:hover:text-white whitespace-nowrap transition-colors">
              Plataforma
            </a>
            <a href="#jurisdicciones" className="hover:text-slate-950 dark:hover:text-white whitespace-nowrap transition-colors">
              Jurisdicciones
            </a>
            <a href="#cumplimiento" className="hover:text-slate-950 dark:hover:text-white whitespace-nowrap transition-colors">
              Cumplimiento DJ1948
            </a>
            <a href="#seguridad" className="hover:text-slate-950 dark:hover:text-white whitespace-nowrap transition-colors">
              Seguridad y RBAC
            </a>
          </nav>

          {/* Right Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Alternar modo de color"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <a
              href="#acceso-corporativo"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
            >
              <span>Acceso Corporativo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Executive Hero + Authentication Workbench */}
      <main id="top" className="flex-1">
        <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#091120]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Institutional Narrative & Visual */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.16em] text-blue-700 dark:text-blue-400 uppercase mb-3">
                  Holding Bursátil Regional · Santiago · Lima · Colombia
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                  Infraestructura Tributaria Regional para Mercados Integrados
                </h1>
                <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Centralice la gestión de calificaciones tributarias, la validación de factores
                  bursátiles y la presentación consolidada de Declaraciones Juradas DJ1948 bajo
                  trazabilidad institucional continua.
                </p>
              </div>

              {/* Trading Floor Photograph Container */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0B1528] relative aspect-[16/9]">
                {!imgFailed ? (
                  <img
                    src={tradingFloorImg}
                    alt="Centro de Operaciones Bursátiles NUAM Santiago Lima Colombia"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B1528] via-slate-900 to-blue-950 flex flex-col items-center justify-center p-8 text-center text-white">
                    <Building2 className="w-10 h-10 text-blue-400 mb-3" />
                    <p className="font-display text-base font-semibold">
                      Centro de Operaciones NUAM Exchange
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Integración de Santiago (CL), Lima (PE) y Colombia (CO)
                    </p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#060B14]/90 via-[#060B14]/45 to-transparent px-5 py-4 flex items-end justify-between gap-4">
                  <div className="text-white">
                    <div className="text-xs font-semibold tracking-wide">
                      Mesa de Compensación y Cumplimiento Fiscal
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Supervisión operativa en tiempo real para emisores y custodios regionales
                    </div>
                  </div>
                  <div className="hidden sm:block text-right font-mono text-[11px] text-slate-200 tabular-nums shrink-0">
                    CL · PE · CO
                  </div>
                </div>
              </div>

              {/* Clean 3-Metric Hairline Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-200 dark:border-slate-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 bg-[#F8FAFC] dark:bg-[#0D1524]">
                <div className="p-4">
                  <div className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                    3 PLAZAS
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    Santiago, Lima y Bogotá
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    SII · SUNAT · DIAN homologados
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                    DJ1948 / ART. 14
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    Carga Masiva Validada
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Factores 8, 10 y 15 de 6 decimales
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                    JWT + RBAC
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    Auditoría Inmutable
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Django REST + PostgreSQL Supabase
                  </div>
                </div>
              </div>
            </div>

            {/* Right Corporate Login Card */}
            <div id="acceso-corporativo" className="lg:col-span-5 flex flex-col justify-center">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-7 sm:p-9 shadow-sm">
                <div className="pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 dark:text-slate-400 uppercase">
                    Portal de Autenticación Segura
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white tracking-tight mt-1">
                    Acceso Corporativo
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ingrese sus credenciales institucionales asignadas para acceder a la consola.
                  </p>
                </div>

                {displayError && (
                  <div
                    role="alert"
                    className="mb-5 p-3.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{displayError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Correo Institucional
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@nuam.com"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingrese su contraseña"
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span>Mantener sesión activa</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStatus(null);
                        setForgotOpen(true);
                      }}
                      className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    {loading ? 'Validando Credenciales...' : 'Ingresar a la Plataforma'}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Acceso restringido a cuentas corporativas autorizadas mediante tokens JWT
                      HS256 y control de permisos por rol (RBAC).
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    <span>Django REST + Supabase PostgreSQL</span>
                    <span>TLS / JWT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Capabilities Section */}
        <section id="plataforma" className="max-w-[1360px] mx-auto px-4 sm:px-8 py-14">
          <div className="max-w-2xl mb-10">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-blue-700 dark:text-blue-400 uppercase">
              Arquitectura Operativa
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white tracking-tight mt-2">
              Gobierno Tributario End-to-End para Emisores y Custodios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-semibold text-slate-400">01</span>
                <FileSpreadsheet className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
                Calificaciones Tributarias
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Registro, edición y aprobación normativa de dividendos ordinarios, preferentes y
                factores 8, 10 y 15 por ejercicio tributario.
              </p>
            </article>

            <article id="cumplimiento" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-semibold text-slate-400">02</span>
                <Globe2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
                Carga Masiva DJ1948
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Validación automática de archivos planos CSV y TXT delimitados, control de errores
                por fila y emisión consolidada de folios oficiales.
              </p>
            </article>

            <article id="seguridad" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1524] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-semibold text-slate-400">03</span>
                <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
                Reportes en Tiempo Real y RBAC
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Bitácora de auditoría criptográfica en PostgreSQL con difusión Server-Sent Events y
                perfiles diferenciados para Administrador, Operador y Consultor.
              </p>
            </article>
          </div>
        </section>

        {/* Jurisdictions Coverage */}
        <section
          id="jurisdicciones"
          className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#091120]"
        >
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-blue-700 dark:text-blue-400 uppercase">
                  Cobertura Regional
                </div>
                <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white mt-1.5">
                  Tres Mercados, Un Estándar Fiscal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Operación unificada sobre emisores listados en las tres bolsas que conforman el
                  mercado integrado NUAM.
                </p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1524]">
                  <div className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    CHILE · CL
                  </div>
                  <div className="font-display font-bold text-sm text-slate-950 dark:text-white mt-1">
                    Bolsa de Santiago
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Normativa SII · Formulario DJ1948 y créditos IDPC Art. 14
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1524]">
                  <div className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    PERÚ · PE
                  </div>
                  <div className="font-display font-bold text-sm text-slate-950 dark:text-white mt-1">
                    Bolsa de Valores de Lima
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Normativa SUNAT · Retenciones de dividendos RUC emisores
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1524]">
                  <div className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    COLOMBIA · CO
                  </div>
                  <div className="font-display font-bold text-sm text-slate-950 dark:text-white mt-1">
                    Bolsa de Valores de Colombia
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Normativa DIAN · Distribución de utilidades gravadas y no gravadas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-[#0B1528] text-slate-300">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white tracking-tight">NUAM</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Plataforma Corporativa de Gestión Tributaria Regional
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Santiago · Lima · Colombia — Arquitectura Django + Supabase PostgreSQL
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Recuperación de Contraseña Corporativa</span>
              </h3>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Ingrese su correo institucional registrado en NUAM para recibir instrucciones de
              restablecimiento seguro.
            </p>
            {forgotStatus && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
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
                placeholder="usuario@nuam.com"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
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
