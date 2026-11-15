import { useCallback, useEffect, useState } from 'react';
import { AppShell, type NavSection } from './components/AppShell.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { Dj1948View } from './components/Dj1948View.tsx';
import { LoginView } from './components/LoginView.tsx';
import {
  PresentDj1948Modal,
  QualificationModal,
} from './components/QualificationModal.tsx';
import { QualificationsView } from './components/QualificationsView.tsx';
import { RealtimeReportsView } from './components/RealtimeReportsView.tsx';
import { UsersAdminView } from './components/UsersAdminView.tsx';
import {
  ROLE_DEFINITIONS,
  clearStoredSession,
  getApiUrl,
  loadStoredSession,
  nuamApi,
  saveStoredSession,
} from './lib/api.ts';
import { subscribeSupabaseRealtime } from './lib/supabase.ts';
import type {
  AuditLog,
  AuthSession,
  DashboardSummary,
  Dj1948Batch,
  NuamUser,
  RoleDefinition,
  TaxQualification,
} from './types/nuam.ts';

const EMPTY_SUMMARY: DashboardSummary = {
  totalCalificaciones: 0,
  vigentes: 0,
  borrador: 0,
  presentadas: 0,
  cargasDj1948: 0,
  yoyGrowthPct: 0,
  totalMontoBruto: 0,
  byMarket: [
    { market: 'CL', label: 'Santiago (CL)', count: 0, montoTotal: 0 },
    { market: 'PE', label: 'Lima (PE)', count: 0, montoTotal: 0 },
    { market: 'CO', label: 'Colombia (CO)', count: 0, montoTotal: 0 },
  ],
  byYear: [
    { year: 2023, vigentes: 0, borrador: 0, presentadas: 0 },
    { year: 2024, vigentes: 0, borrador: 0, presentadas: 0 },
    { year: 2025, vigentes: 0, borrador: 0, presentadas: 0 },
    { year: 2026, vigentes: 0, borrador: 0, presentadas: 0 },
  ],
};

function readDarkModePreference(): boolean {
  try {
    return localStorage.getItem('nuam_dark_mode') === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [rememberSession, setRememberSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => readDarkModePreference());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [qualifications, setQualifications] = useState<TaxQualification[]>([]);
  const [batches, setBatches] = useState<Dj1948Batch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<NuamUser[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>(() => Object.values(ROLE_DEFINITIONS));
  const [loadingData, setLoadingData] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());
  const [searchQuery, setSearchQuery] = useState('');

  const [qualModalOpen, setQualModalOpen] = useState(false);
  const [editingQual, setEditingQual] = useState<TaxQualification | null>(null);
  const [presentModalOpen, setPresentModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('nuam_dark_mode', String(darkMode));
    } catch {
      // Ignore storage access restrictions
    }
  }, [darkMode]);

  const handleTokenRefresh = useCallback(
    (nextSession: AuthSession) => {
      setSession(nextSession);
      saveStoredSession(nextSession, rememberSession);
    },
    [rememberSession]
  );

  const fetchAllData = useCallback(
    async (activeSession: AuthSession) => {
      setLoadingData(true);
      try {
        const [sumRes, qualRes, batchRes, auditRes, usersRes, rolesRes] = await Promise.all([
          nuamApi.getSummary(activeSession, handleTokenRefresh),
          nuamApi.getQualifications(activeSession, handleTokenRefresh),
          nuamApi.getBatches(activeSession, handleTokenRefresh),
          nuamApi.getAuditLogs(activeSession, handleTokenRefresh),
          nuamApi.getUsers(activeSession, handleTokenRefresh),
          nuamApi.getRoles(activeSession, handleTokenRefresh),
        ]);
        setSummary(sumRes);
        setQualifications(qualRes);
        setBatches(batchRes);
        setAuditLogs(auditRes);
        setUsers(usersRes);
        setRoles(rolesRes);
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('401') || message.toLowerCase().includes('expirada')) {
          clearStoredSession();
          setSession(null);
          setAuthError('Su sesión JWT ha expirado. Ingrese nuevamente.');
        }
      } finally {
        setLoadingData(false);
      }
    },
    [handleTokenRefresh]
  );

  useEffect(() => {
    if (!session) return;
    void fetchAllData(session);

    let eventSource: EventSource | null = null;
    try {
      const streamUrl = getApiUrl(
        `/api/reports/stream?token=${encodeURIComponent(session.accessToken)}`
      );
      eventSource = new EventSource(streamUrl);
      eventSource.addEventListener('update', () => {
        void fetchAllData(session);
      });
    } catch {
      // Fallback gracefully if EventSource unavailable
    }

    const unsubSupabase = subscribeSupabaseRealtime(() => {
      void fetchAllData(session);
    });

    return () => {
      eventSource?.close();
      unsubSupabase();
    };
  }, [session?.accessToken, fetchAllData]);

  const handleAuthenticated = (newSession: AuthSession, remember: boolean) => {
    setAuthError(null);
    setRememberSession(remember);
    saveStoredSession(newSession, remember);
    setSession(newSession);
    setActiveSection('dashboard');
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await nuamApi.logout(session);
      } catch {
        // Ignore network errors on logout
      }
    }
    clearStoredSession();
    setSession(null);
    setSummary(null);
    setQualifications([]);
    setBatches([]);
    setAuditLogs([]);
    setUsers([]);
  };

  if (!session) {
    return (
      <LoginView
        externalError={authError}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <>
      <AppShell
        session={session}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onOpenNewQualification={() => {
          setEditingQual(null);
          setQualModalOpen(true);
        }}
        onOpenPresentModal={() => setPresentModalOpen(true)}
        onLogout={handleLogout}
        recentAlerts={auditLogs}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      >
        {activeSection === 'dashboard' && (
          <DashboardView
            summary={summary}
            auditLogs={auditLogs}
            loading={loadingData}
            onRefresh={() => void fetchAllData(session)}
            searchQuery={searchQuery}
          />
        )}

        {activeSection === 'qualifications' && (
          <QualificationsView
            items={qualifications}
            permissions={session.permissions}
            searchQuery={searchQuery}
            onOpenNew={() => {
              setEditingQual(null);
              setQualModalOpen(true);
            }}
            onEdit={(q) => {
              setEditingQual(q);
              setQualModalOpen(true);
            }}
            onApprove={async (q) => {
              await nuamApi.updateQualification(
                session,
                q.id,
                { estado: 'VIGENTE' },
                handleTokenRefresh
              );
              await fetchAllData(session);
            }}
            onDelete={async (q) => {
              await nuamApi.deleteQualification(session, q.id, handleTokenRefresh);
              await fetchAllData(session);
            }}
          />
        )}

        {activeSection === 'dj1948' && (
          <Dj1948View
            batches={batches}
            permissions={session.permissions}
            onRefresh={() => void fetchAllData(session)}
            onUpload={async (payload) => {
              await nuamApi.uploadDj1948(session, payload, handleTokenRefresh);
              await fetchAllData(session);
            }}
            onDeleteBatch={async (batch) => {
              await nuamApi.deleteBatch(session, batch.id, handleTokenRefresh);
              await fetchAllData(session);
            }}
          />
        )}

        {activeSection === 'reports' && (
          <RealtimeReportsView
            summary={summary ?? EMPTY_SUMMARY}
            qualifications={qualifications}
            batches={batches}
            auditLogs={auditLogs}
            activeUsersCount={users.filter((u) => u.active).length || 1}
            lastSyncedAt={lastSyncedAt}
            onTriggerSync={() => void fetchAllData(session)}
          />
        )}

        {activeSection === 'users' && (
          <UsersAdminView
            users={users}
            roles={roles}
            currentUserId={session.user.id}
            permissions={session.permissions}
            searchQuery={searchQuery}
            onCreateUser={async (payload) => {
              await nuamApi.createUser(session, payload, handleTokenRefresh);
              await fetchAllData(session);
            }}
            onUpdateUser={async (id, payload) => {
              await nuamApi.updateUser(session, id, payload, handleTokenRefresh);
              await fetchAllData(session);
            }}
            onDeleteUser={async (user) => {
              await nuamApi.deleteUser(session, user.id, handleTokenRefresh);
              await fetchAllData(session);
            }}
          />
        )}
      </AppShell>

      <QualificationModal
        open={qualModalOpen}
        editing={editingQual}
        onClose={() => {
          setQualModalOpen(false);
          setEditingQual(null);
        }}
        onSave={async (payload) => {
          if (editingQual) {
            await nuamApi.updateQualification(session, editingQual.id, payload, handleTokenRefresh);
          } else {
            await nuamApi.createQualification(session, payload, handleTokenRefresh);
          }
          await fetchAllData(session);
        }}
      />

      <PresentDj1948Modal
        open={presentModalOpen}
        onClose={() => setPresentModalOpen(false)}
        onPresent={async (year) => {
          const result = await nuamApi.presentDj1948(session, year, handleTokenRefresh);
          await fetchAllData(session);
          return result;
        }}
      />
    </>
  );
}
