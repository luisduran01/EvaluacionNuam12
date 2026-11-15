export type UserRole = 'admin' | 'operador' | 'consultor';
export type MarketCode = 'CL' | 'PE' | 'CO' | 'REGIONAL';
export type QualificationMarket = 'CL' | 'PE' | 'CO';
export type QualificationStatus = 'VIGENTE' | 'BORRADOR' | 'PRESENTADO';
export type BatchStatus = 'EXITOSO' | 'CON_ERRORES' | 'PROCESANDO';

export interface NuamUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  market: MarketCode;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface TaxQualification {
  id: string;
  emisor: string;
  rutEmisor: string;
  mercado: QualificationMarket;
  ejercicio: number;
  tipoRenta: string;
  montoBruto: number;
  factor8: number;
  factor10: number;
  factor15: number;
  estado: QualificationStatus;
  ownerId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dj1948Batch {
  id: string;
  displayId: number;
  fileName: string;
  ejercicio: number;
  processType: string;
  processedCount: number;
  successCount: number;
  errorCount: number;
  estado: BatchStatus;
  ownerId: string;
  uploadedByName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  userName: string;
  userId: string;
  ipAddress: string;
  hashCode: string;
  detail: string;
  createdAt: string;
}

export interface RoleDefinition {
  role: UserRole;
  label: string;
  description: string;
  permissions: {
    viewDashboard: boolean;
    createQualification: boolean;
    editQualification: boolean;
    deleteQualification: boolean;
    uploadDj1948: boolean;
    presentDj1948: boolean;
    exportReports: boolean;
    manageUsers: boolean;
  };
}

export interface DashboardSummary {
  totalCalificaciones: number;
  vigentes: number;
  borrador: number;
  presentadas: number;
  cargasDj1948: number;
  yoyGrowthPct: number;
  totalMontoBruto: number;
  byMarket: Array<{
    market: QualificationMarket;
    label: string;
    count: number;
    montoTotal: number;
  }>;
  byYear: Array<{
    year: number;
    vigentes: number;
    borrador: number;
    presentadas: number;
  }>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: NuamUser;
  permissions: RoleDefinition['permissions'];
}
