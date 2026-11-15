import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronRight,
  Clock,
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
  qualifications: 'Calificaciones Tributarias',
  dj1948: 'Carga Masiva DJ1948',
  reports: 'Reportes en Tiempo Real',
  users: 'Usuarios y Roles RBAC',
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
      ? 'Administrador'
      : session.user.role === 'operador'
        ? 'Operador'
        : 'Consultor';

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1528] dark:bg-[#070D1A] text-slate-100 border-r border-slate-800/90">
      {/* Corporate Brand Lockup */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-display font-bold text-lg flex items-center justify-center">
            N
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-tight text-white leading-none">
              NUAM
            </div>
            <div className="text-[10px] font-semibold tracking-[0.14em] text-blue-400 mt-1 leading-none">
              MERCADO INTEGRADO
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
          aria-label="Cerrar menú"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="px-3 mb-2.5 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Módulos Corporativos
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-2.5">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/70 text-xs font-medium text-slate-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{darkMode ? 'Tema Claro' : 'Modo Oscuro'}</span>
          </span>
          <span
            className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
              darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-white" />
          </span>
        </button>

        <div className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sesión JWT</span>
          </span>
          <span className="font-mono tabular-nums text-slate-100">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        {/* User Profile Footer */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {!avatarFailed ? (
              <img
                src={avatarAdminImg}
                alt={session.user.fullName}
                onError={() => setAvatarFailed(true)}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {session.user.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {session.user.fullName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {roleLabel} · {session.user.market}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] dark:bg-[#060B14] text-slate-900 dark:text-slate-100">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enterprise Top Bar */}
        <header className="h-16 sticky top-0 z-30 bg-white/95 dark:bg-[#0D1524]/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Context */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 mr-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">NUAM</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{SECTION_TITLES[activeSection]}</span>
            </div>

            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onFocus={() => setCommandOpen(false)}
                placeholder="Buscar emisores, usuarios o eventos... (Ctrl + K)"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="sm:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar tema"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                aria-label="Notificaciones"
                className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4" />
                {recentAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {Math.min(recentAlerts.length, 9)}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Actividad Reciente
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentAlerts.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 text-xs"
                      >
                        <div className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                          {item.action} · {item.module}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Presentar DJ1948</span>
              </button>
            )}

            {session.permissions.createQualification && (
              <button
                type="button"
                onClick={onOpenNewQualification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B1528] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#0D1524] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Ir a módulo o filtrar emisores y usuarios..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-2 divide-y divide-slate-100 dark:divide-slate-800">
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
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
