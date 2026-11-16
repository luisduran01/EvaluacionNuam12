import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronRight,
  FileSpreadsheet,
  FolderUp,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Send,
  Sun,
  Users,
  X,
} from 'lucide-react';
import avatarAdminImg from '../assets/images/avatar_admin_nuam_1794755964385.jpg';
import type { AuditLog, AuthSession } from '../types/nuam.ts';

export type NavSection =
  | 'dashboard'
  | 'qualifications'
  | 'dj1948'
  | 'reports'
  | 'users';

interface AppShellProps {
  session: AuthSession;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewQualification: () => void;
  onOpenPresentModal: () => void;
  onLogout: () => void;
  recentAlerts: AuditLog[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  children: React.ReactNode;
}

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Panel Ejecutivo',
  qualifications: 'Calificaciones',
  dj1948: 'Carga DJ1948',
  reports: 'Reportes en Vivo',
  users: 'Usuarios y Roles',
};

export const AppShell: React.FC<AppShellProps> = ({
  session,
  activeSection,
  onSelectSection,
  darkMode,
  onToggleDarkMode,
  onOpenNewQualification,
  onOpenPresentModal,
  onLogout,
  recentAlerts,
  searchQuery,
  onSearchQueryChange,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Panel Ejecutivo', icon: LayoutDashboard },
    { id: 'qualifications', label: 'Calificaciones', icon: FileSpreadsheet },
    { id: 'dj1948', label: 'Carga DJ1948', icon: FolderUp },
    { id: 'reports', label: 'Reportes en Vivo', icon: Activity },
    { id: 'users', label: 'Usuarios y Roles', icon: Users },
  ];

  const roleLabel =
    session.user.role === 'admin'
      ? 'ADMINISTRADOR'
      : session.user.role === 'operador'
        ? 'OPERADOR'
        : 'CONSULTOR';

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0E1B2E] dark:bg-[#0B0D10] text-slate-100 border-r border-[#1E2E46] dark:border-[#1E222A]">
      {/* Brand Lockup */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 dark:border-[#1E222A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#E65A28] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <rect
                x="12"
                y="4.2"
                width="11"
                height="11"
                transform="rotate(45 12 4.2)"
                stroke="#FFFFFF"
                strokeWidth="2.2"
              />
            </svg>
          </div>
          <div>
            <div className="font-display font-extrabold text-sm tracking-wide text-white leading-none">
              NUAM
            </div>
            <div className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase mt-1 leading-none">
              TERMINAL TRIBUTARIA
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-2 rounded-[2px] text-slate-400 hover:bg-white/10"
          aria-label="Cerrar menú"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="px-3 mb-3 font-mono text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          MÓDULOS OPERATIVOS
        </div>
        <nav className="space-y-1" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[2px] font-mono text-xs transition-colors cursor-pointer whitespace-nowrap border ${
                  active
                    ? 'bg-[#162742] dark:bg-[#151921] text-white border-[#243B5E] dark:border-[#242934] border-l-2 border-l-[#E65A28] font-semibold'
                    : 'text-slate-300 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#E65A28]' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-3.5 border-t border-white/10 dark:border-[#1E222A] space-y-2.5">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-[2px] border border-white/10 dark:border-[#1E222A] bg-[#132238] dark:bg-[#12151B] hover:bg-[#192D4A] dark:hover:bg-[#181C24] font-mono text-[10px] tracking-[0.08em] uppercase text-slate-200 cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className="truncate">
              {darkMode ? 'MODO TERMINAL (DARK)' : 'MODO BEIGE & MARINO'}
            </span>
          </span>
          <span
            className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              darkMode ? 'bg-[#E65A28] justify-end' : 'bg-slate-600 justify-start'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-white" />
          </span>
        </button>

        <div className="px-3 py-2 rounded-[2px] border border-white/10 dark:border-[#1E222A] bg-[#132238] dark:bg-[#12151B] flex items-center justify-between font-mono text-[11px] text-slate-300">
          <span className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>SESIÓN JWT</span>
          </span>
          <span className="tabular-nums text-emerald-400 font-semibold">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        {/* User Profile Footer */}
        <div className="pt-2.5 border-t border-white/10 dark:border-[#1E222A] flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {!avatarFailed ? (
              <img
                src={avatarAdminImg}
                alt={session.user.fullName}
                onError={() => setAvatarFailed(true)}
                className="w-8 h-8 rounded-[2px] object-cover border border-white/15 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-[2px] bg-[#E65A28] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {session.user.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {session.user.fullName}
              </div>
              <div className="font-mono text-[10px] text-slate-400 truncate uppercase">
                {roleLabel} · {session.user.market}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="p-2 rounded-[2px] text-slate-400 hover:text-[#E65A28] hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F3ED] dark:bg-[#0B0D10] text-[#111317] dark:text-slate-100">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 sticky top-0 z-30 bg-[#FBF8F3]/95 dark:bg-[#0F1217]/95 backdrop-blur-xs border-b border-[#E2DCD2] dark:border-[#1E222A] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] text-[#3A3733] dark:text-slate-200 hover:bg-[#EFE9DF] dark:hover:bg-[#151921] shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Context */}
            <div className="hidden xl:flex items-center gap-1.5 font-mono text-xs text-[#6B665F] dark:text-slate-400 shrink-0 mr-2">
              <span className="font-bold text-[#111827] dark:text-white">NUAM</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8B857C]" />
              <span>{SECTION_TITLES[activeSection]}</span>
            </div>

            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-[#8B857C] dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onFocus={() => setCommandOpen(false)}
                placeholder="Buscar emisores, usuarios o eventos... (Ctrl + K)"
                className="w-full h-9 pl-9 pr-3 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#F5F0E8] dark:bg-[#151921] font-mono text-xs text-[#111317] dark:text-slate-100 placeholder:text-[#8B857C] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E65A28]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="sm:hidden p-2 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] text-[#3A3733] dark:text-slate-300"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Cambiar a modo Beige & Marino' : 'Cambiar a modo Terminal Dark'}
              aria-label="Alternar tema"
              className="w-9 h-9 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#151921] text-[#3A3733] dark:text-amber-400 hover:bg-[#EFE9DF] dark:hover:bg-[#1B202A] flex items-center justify-center cursor-pointer shrink-0"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                aria-label="Notificaciones"
                className="relative w-9 h-9 rounded-[2px] border border-[#DDD6CB] dark:border-[#232833] bg-[#FBF8F3] dark:bg-[#151921] text-[#3A3733] dark:text-slate-200 hover:bg-[#EFE9DF] dark:hover:bg-[#1B202A] flex items-center justify-center cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4" />
                {recentAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-[2px] bg-[#E65A28] text-white font-mono text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {Math.min(recentAlerts.length, 9)}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-[2px] bg-[#FBF8F3] dark:bg-[#11141A] border border-[#DFD8CD] dark:border-[#232833] shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5DFD5] dark:border-[#1F242D]">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111317] dark:text-white">
                      Actividad Reciente
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="font-mono text-[11px] text-[#6B665F] hover:text-[#111317] dark:hover:text-white cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentAlerts.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-[2px] border border-[#E5DFD5] dark:border-[#1F242D] bg-[#F5F0E8] dark:bg-[#161A22] text-xs"
                      >
                        <div className="font-mono text-[11px] font-semibold text-[#111317] dark:text-slate-100">
                          {item.action} · {item.module}
                        </div>
                        <div className="text-[#5C5852] dark:text-slate-400 mt-0.5 line-clamp-2">
                          {item.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session.permissions.presentDj1948 && (
              <button
                type="button"
                onClick={onOpenPresentModal}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[2px] bg-[#0E1B2E] dark:bg-[#1A1F29] border border-[#0E1B2E] dark:border-[#2A303D] hover:bg-[#162742] dark:hover:bg-[#232936] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Presentar DJ1948</span>
              </button>
            )}

            {session.permissions.createQualification && (
              <button
                type="button"
                onClick={onOpenNewQualification}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[2px] bg-[#E65A28] hover:bg-[#D14D1E] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Calificación</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Ctrl+K Quick Navigation Modal */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2px] bg-[#FBF8F3] dark:bg-[#11141A] border border-[#DFD8CD] dark:border-[#232833] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5DFD5] dark:border-[#1F242D]">
              <Search className="w-4 h-4 text-[#8B857C]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Ir a módulo o filtrar emisores y usuarios..."
                className="flex-1 bg-transparent font-mono text-xs text-[#111317] dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="font-mono text-xs text-[#6B665F] hover:text-[#111317] dark:hover:text-white cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-2 divide-y divide-[#EFE9DF] dark:divide-[#1F242D]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectSection(item.id);
                      setCommandOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left font-mono text-xs text-[#3A3733] dark:text-slate-200 hover:bg-[#EFE9DF] dark:hover:bg-[#161A22] rounded-[2px] cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[#E65A28]" />
                    <span>Ir a {item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
