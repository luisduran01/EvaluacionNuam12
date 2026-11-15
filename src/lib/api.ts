import type {
  AuditLog,
  AuthSession,
  DashboardSummary,
  Dj1948Batch,
  MarketCode,
  NuamUser,
  RoleDefinition,
  TaxQualification,
  UserRole,
} from '../types/nuam.ts';

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) || '').replace(/\/$/, '');
const SESSION_KEY = 'nuam_jwt_session';

let memorySessionFallback: AuthSession | null = null;

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Administrador',
    description:
      'Control total de usuarios, roles RBAC, calificaciones tributarias, DJ1948 y bitácora regional.',
    permissions: {
      viewDashboard: true,
      createQualification: true,
      editQualification: true,
      deleteQualification: true,
      uploadDj1948: true,
      presentDj1948: true,
      exportReports: true,
      manageUsers: true,
    },
  },
  operador: {
    role: 'operador',
    label: 'Operador',
    description:
      'Gestión operativa de calificaciones tributarias, carga masiva DJ1948 y emisión de reportes.',
    permissions: {
      viewDashboard: true,
      createQualification: true,
      editQualification: true,
      deleteQualification: false,
      uploadDj1948: true,
      presentDj1948: true,
      exportReports: true,
      manageUsers: false,
    },
  },
  consultor: {
    role: 'consultor',
    label: 'Consultor',
    description:
      'Acceso de solo lectura a métricas consolidadas, trazabilidad en tiempo real y exportación CSV.',
    permissions: {
      viewDashboard: true,
      createQualification: false,
      editQualification: false,
      deleteQualification: false,
      uploadDj1948: false,
      presentDj1948: false,
      exportReports: true,
      manageUsers: false,
    },
  },
};

export function loadStoredSession(): AuthSession | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.accessToken && parsed?.user) {
        memorySessionFallback = parsed;
        return parsed;
      }
    }
  } catch {
    // Web storage may be restricted in sandboxed iframes
  }
  return memorySessionFallback;
}

export function saveStoredSession(session: AuthSession, rememberMe: boolean): void {
  memorySessionFallback = session;
  const payload = JSON.stringify(session);
  try {
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Fallback to in-memory session when storage is blocked
  }
}

export function clearStoredSession(): void {
  memorySessionFallback = null;
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage restriction errors
  }
}

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function downloadDj1948TemplateCsv(): void {
  const csv = [
    'EMISOR;RUT_EMISOR;MERCADO;EJERCICIO;TIPO_RENTA;MONTO_BRUTO;FACTOR_8;FACTOR_10;FACTOR_15;ESTADO',
    'Banco de Chile;97.004.000-5;CL;2024;Dividendos Ordinarios DJ1948;120000000;0.273972;0.145;0.05;VIGENTE',
    'Credicorp Ltd.;20100047218;PE;2024;Dividendos Acciones Comunes;85000000;0.05;0.295;0.0;VIGENTE',
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_dj1948_nuam.csv';
  link.click();
  URL.revokeObjectURL(url);
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { token?: string; refreshToken?: string; onRefreshed?: (s: AuthSession) => void } = {}
): Promise<T> {
  const { token, refreshToken, onRefreshed, headers, ...rest } = options;
  const doFetch = (bearer?: string) =>
    fetch(getApiUrl(path), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(headers || {}),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(getApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const nextSession = (await refreshRes.json()) as AuthSession;
      onRefreshed?.(nextSession);
      res = await doFetch(nextSession.accessToken);
    }
  }

  const parsed = (await parseJsonSafe(res)) as Record<string, unknown> | null;

  if (!res.ok) {
    const errMsg =
      (parsed && typeof parsed.error === 'string' && parsed.error) ||
      (parsed && typeof parsed.detail === 'string' && parsed.detail) ||
      `Error de servidor (${res.status})`;
    throw new Error(errMsg);
  }

  if (parsed && typeof parsed.rawText === 'string' && parsed.rawText.trim().startsWith('<')) {
    throw new Error('El endpoint API no respondió JSON. Verifique que el servidor backend esté activo.');
  }

  return parsed as T;
}

export const nuamApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    return requestJson<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
  },
  forgotPassword(email: string) {
    return requestJson<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  },
  logout(session: AuthSession) {
    return requestJson<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
      token: session.accessToken,
    });
  },
  getSummary(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<DashboardSummary>('/api/dashboard/summary', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  getQualifications(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<TaxQualification[]>('/api/qualifications', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  createQualification(
    session: AuthSession,
    payload: Partial<TaxQualification>,
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<TaxQualification>('/api/qualifications', {
      method: 'POST',
      body: JSON.stringify(payload),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  updateQualification(
    session: AuthSession,
    id: string,
    payload: Partial<TaxQualification>,
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<TaxQualification>(`/api/qualifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  deleteQualification(
    session: AuthSession,
    id: string,
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<{ ok: boolean }>(`/api/qualifications/${id}`, {
      method: 'DELETE',
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  getBatches(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<Dj1948Batch[]>('/api/dj1948/batches', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  uploadDj1948(
    session: AuthSession,
    payload: { fileName: string; ejercicio: number; processType: string; content: string },
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<Dj1948Batch>('/api/dj1948/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  deleteBatch(session: AuthSession, id: string, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<{ ok: boolean }>(`/api/dj1948/batches/${id}`, {
      method: 'DELETE',
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  presentDj1948(session: AuthSession, year: number, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<{ presentedCount: number; folio: string }>('/api/dj1948/present', {
      method: 'POST',
      body: JSON.stringify({ year }),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  getAuditLogs(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<AuditLog[]>('/api/audit', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  getUsers(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<NuamUser[]>('/api/users', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  createUser(
    session: AuthSession,
    payload: {
      email: string;
      fullName: string;
      role: UserRole;
      market: MarketCode;
      password?: string;
    },
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<NuamUser>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  updateUser(
    session: AuthSession,
    id: string,
    payload: Partial<{
      fullName: string;
      role: UserRole;
      market: MarketCode;
      active: boolean;
      password?: string;
    }>,
    onRefreshed?: (s: AuthSession) => void
  ) {
    return requestJson<NuamUser>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  deleteUser(session: AuthSession, id: string, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<{ ok: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
  getRoles(session: AuthSession, onRefreshed?: (s: AuthSession) => void) {
    return requestJson<RoleDefinition[]>('/api/roles', {
      token: session.accessToken,
      refreshToken: session.refreshToken,
      onRefreshed,
    });
  },
};
