import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import type {
  AuditLog,
  DashboardSummary,
  Dj1948Batch,
  MarketCode,
  NuamUser,
  QualificationMarket,
  QualificationStatus,
  TaxQualification,
  UserRole,
} from '../types/nuam.ts';

interface StoredUser extends NuamUser {
  passwordHash: string;
}

export const realtimeBus = new EventEmitter();

const connectionString =
  process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';

let pool: Pool | null = null;
if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 3000,
    });
    pool.on('error', (err) => {
      console.warn('Supabase/PostgreSQL pool error — fallback en memoria activo:', err.message);
    });
  } catch (err) {
    console.warn('No se pudo inicializar Pool de PostgreSQL, usando memoria:', err);
    pool = null;
  }
}

let pgReadyPromise: Promise<boolean> | null = null;

function makeHash(seed: string): string {
  return '#' + crypto.createHash('sha256').update(seed).digest('hex').slice(0, 7).toUpperCase();
}

const DEFAULT_HASH = bcrypt.hashSync('nuam2026!', 10);

const ADMIN_ID = '11111111-1111-4111-8111-111111111101';
const OPERADOR_ID = '11111111-1111-4111-8111-111111111102';
const CONSULTOR_ID = '11111111-1111-4111-8111-111111111103';

const memoryStore: {
  users: StoredUser[];
  qualifications: TaxQualification[];
  batches: Dj1948Batch[];
  auditLogs: AuditLog[];
} = {
  users: [
    {
      id: ADMIN_ID,
      email: 'admin@nuam.com',
      fullName: 'Administrador NUAM',
      role: 'admin',
      market: 'REGIONAL',
      active: true,
      lastLoginAt: new Date('2026-10-31T10:00:55.000Z').toISOString(),
      createdAt: new Date('2026-01-10T09:00:00.000Z').toISOString(),
      passwordHash: DEFAULT_HASH,
    },
    {
      id: OPERADOR_ID,
      email: 'operador@nuam.com',
      fullName: 'Operador Tributario',
      role: 'operador',
      market: 'CL',
      active: true,
      lastLoginAt: new Date('2026-10-30T15:47:07.000Z').toISOString(),
      createdAt: new Date('2026-02-14T11:30:00.000Z').toISOString(),
      passwordHash: DEFAULT_HASH,
    },
    {
      id: CONSULTOR_ID,
      email: 'consultor@nuam.com',
      fullName: 'Consultor Regional',
      role: 'consultor',
      market: 'PE',
      active: true,
      lastLoginAt: new Date('2026-10-29T18:15:00.000Z').toISOString(),
      createdAt: new Date('2026-03-05T14:20:00.000Z').toISOString(),
      passwordHash: DEFAULT_HASH,
    },
  ],
  qualifications: [
    {
      id: '22222222-2222-4222-8222-222222222101',
      emisor: 'Banco de Chile S.A.',
      rutEmisor: '97.004.000-5',
      mercado: 'CL',
      ejercicio: 2024,
      tipoRenta: 'Dividendos Ordinarios DJ1948',
      montoBruto: 185400000,
      factor8: 0.273972,
      factor10: 0.145,
      factor15: 0.05,
      estado: 'VIGENTE',
      ownerId: ADMIN_ID,
      createdByName: 'Administrador NUAM',
      createdAt: new Date('2026-10-12T10:15:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T12:00:00.000Z').toISOString(),
    },
    {
      id: '22222222-2222-4222-8222-222222222102',
      emisor: 'Credicorp Ltd. (BVL)',
      rutEmisor: '20100047218',
      mercado: 'PE',
      ejercicio: 2024,
      tipoRenta: 'Dividendos Acciones Comunes',
      montoBruto: 142800000,
      factor8: 0.05,
      factor10: 0.295,
      factor15: 0.0,
      estado: 'VIGENTE',
      ownerId: OPERADOR_ID,
      createdByName: 'Operador Tributario',
      createdAt: new Date('2026-10-15T14:20:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T13:45:00.000Z').toISOString(),
    },
    {
      id: '22222222-2222-4222-8222-222222222103',
      emisor: 'Ecopetrol S.A.',
      rutEmisor: '899.999.068-1',
      mercado: 'CO',
      ejercicio: 2024,
      tipoRenta: 'Distribución Utilidades Gravadas',
      montoBruto: 210500000,
      factor8: 0.1,
      factor10: 0.35,
      factor15: 0.075,
      estado: 'VIGENTE',
      ownerId: ADMIN_ID,
      createdByName: 'Administrador NUAM',
      createdAt: new Date('2026-10-18T09:30:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T14:10:00.000Z').toISOString(),
    },
    {
      id: '22222222-2222-4222-8222-222222222104',
      emisor: 'Falabella S.A.',
      rutEmisor: '90.749.000-9',
      mercado: 'CL',
      ejercicio: 2025,
      tipoRenta: 'Retiros y Dividendos Preferentes',
      montoBruto: 96200000,
      factor8: 0.273972,
      factor10: 0.12,
      factor15: 0.04,
      estado: 'VIGENTE',
      ownerId: OPERADOR_ID,
      createdByName: 'Operador Tributario',
      createdAt: new Date('2026-10-20T16:40:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T15:00:00.000Z').toISOString(),
    },
    {
      id: '22222222-2222-4222-8222-222222222105',
      emisor: 'Bancolombia S.A.',
      rutEmisor: '890.903.938-8',
      mercado: 'CO',
      ejercicio: 2026,
      tipoRenta: 'Dividendos No Gravados BVC',
      montoBruto: 118900000,
      factor8: 0.0,
      factor10: 0.2,
      factor15: 0.05,
      estado: 'BORRADOR',
      ownerId: OPERADOR_ID,
      createdByName: 'Operador Tributario',
      createdAt: new Date('2026-10-28T11:05:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T16:20:00.000Z').toISOString(),
    },
  ],
  batches: [
    {
      id: '33333333-3333-4333-8333-333333333101',
      displayId: 1,
      fileName: 'DJ1948_2024_RETIROS.csv',
      ejercicio: 2024,
      processType: 'Declaración Jurada 1948 (Retiros y Dividendos Distribuidos)',
      processedCount: 450,
      successCount: 450,
      errorCount: 0,
      estado: 'EXITOSO',
      ownerId: OPERADOR_ID,
      uploadedByName: 'Operador Tributario',
      createdAt: new Date('2026-10-30T16:47:07.000Z').toISOString(),
    },
    {
      id: '33333333-3333-4333-8333-333333333102',
      displayId: 2,
      fileName: 'DJ1948_2025_BVC_BVL.csv',
      ejercicio: 2025,
      processType: 'Calificación de Factores Bursátiles NUAM',
      processedCount: 180,
      successCount: 178,
      errorCount: 2,
      estado: 'CON_ERRORES',
      ownerId: ADMIN_ID,
      uploadedByName: 'Administrador NUAM',
      createdAt: new Date('2026-10-30T18:10:12.000Z').toISOString(),
    },
  ],
  auditLogs: [
    {
      id: '44444444-4444-4444-8444-444444444101',
      action: 'LOGIN',
      module: 'USUARIO',
      userName: 'Administrador NUAM',
      userId: ADMIN_ID,
      ipAddress: '127.0.0.1',
      hashCode: '#MTI3LJAU',
      detail: 'Inicio de sesión JWT verificado para plaza REGIONAL.',
      createdAt: new Date('2026-10-31T10:00:55.000Z').toISOString(),
    },
    {
      id: '44444444-4444-4444-8444-444444444102',
      action: 'CARGA_MASIVA',
      module: 'CARGA_ARCHIVO',
      userName: 'Operador Tributario',
      userId: OPERADOR_ID,
      ipAddress: '192.168.1.45',
      hashCode: '#MTKYLJE2',
      detail: 'Procesado lote DJ1948_2024_RETIROS.csv (450 exitosos / 0 errores).',
      createdAt: new Date('2026-10-30T16:47:07.000Z').toISOString(),
    },
  ],
};

async function ensurePgReady(): Promise<boolean> {
  if (!pool) return false;
  if (!pgReadyPromise) {
    pgReadyPromise = (async () => {
      try {
        await pool.query(`
          create extension if not exists "pgcrypto";
          create table if not exists public.nuam_users (
            id uuid primary key default gen_random_uuid(),
            email text unique not null,
            full_name text not null,
            role text not null,
            market text not null,
            active boolean not null default true,
            password_hash text not null default '',
            last_login_at timestamptz,
            created_at timestamptz not null default now()
          );
          alter table public.nuam_users add column if not exists password_hash text not null default '';
          create table if not exists public.tax_qualifications (
            id uuid primary key default gen_random_uuid(),
            emisor text not null,
            rut_emisor text not null,
            mercado text not null,
            ejercicio integer not null,
            tipo_renta text not null,
            monto_bruto numeric(16,2) not null,
            factor_8 numeric(10,6) not null default 0,
            factor_10 numeric(10,6) not null default 0,
            factor_15 numeric(10,6) not null default 0,
            estado text not null,
            owner_id text not null,
            created_by_name text not null,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          );
          create table if not exists public.dj1948_batches (
            id uuid primary key default gen_random_uuid(),
            display_id integer not null,
            file_name text not null,
            ejercicio integer not null,
            process_type text not null,
            processed_count integer not null,
            success_count integer not null,
            error_count integer not null,
            estado text not null,
            owner_id text not null,
            uploaded_by_name text not null,
            created_at timestamptz not null default now()
          );
          create table if not exists public.audit_logs (
            id uuid primary key default gen_random_uuid(),
            action text not null,
            module text not null,
            user_name text not null,
            user_id text not null,
            ip_address text not null,
            hash_code text not null,
            detail text not null,
            created_at timestamptz not null default now()
          );
        `);

        for (const u of memoryStore.users) {
          await pool.query(
            `insert into public.nuam_users (id, email, full_name, role, market, active, password_hash, last_login_at, created_at)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (email) do nothing`,
            [u.id, u.email, u.fullName, u.role, u.market, u.active, u.passwordHash, u.lastLoginAt, u.createdAt]
          );
        }

        const { rows } = await pool.query('select count(*)::int as cnt from public.tax_qualifications');
        if (Number(rows[0]?.cnt ?? 0) === 0) {
          for (const q of memoryStore.qualifications) {
            await pool.query(
              `insert into public.tax_qualifications (id, emisor, rut_emisor, mercado, ejercicio, tipo_renta, monto_bruto, factor_8, factor_10, factor_15, estado, owner_id, created_by_name, created_at, updated_at)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) on conflict (id) do nothing`,
              [q.id, q.emisor, q.rutEmisor, q.mercado, q.ejercicio, q.tipoRenta, q.montoBruto, q.factor8, q.factor10, q.factor15, q.estado, q.ownerId, q.createdByName, q.createdAt, q.updatedAt]
            );
          }
          for (const b of memoryStore.batches) {
            await pool.query(
              `insert into public.dj1948_batches (id, display_id, file_name, ejercicio, process_type, processed_count, success_count, error_count, estado, owner_id, uploaded_by_name, created_at)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (id) do nothing`,
              [b.id, b.displayId, b.fileName, b.ejercicio, b.processType, b.processedCount, b.successCount, b.errorCount, b.estado, b.ownerId, b.uploadedByName, b.createdAt]
            );
          }
          for (const a of memoryStore.auditLogs) {
            await pool.query(
              `insert into public.audit_logs (id, action, module, user_name, user_id, ip_address, hash_code, detail, created_at)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do nothing`,
              [a.id, a.action, a.module, a.userName, a.userId, a.ipAddress, a.hashCode, a.detail, a.createdAt]
            );
          }
        }
        return true;
      } catch (err) {
        console.warn('Supabase/PostgreSQL no disponible, usando almacenamiento en memoria:', err);
        return false;
      }
    })();
  }
  return pgReadyPromise;
}

export function isDatabasePostgres(): boolean {
  return Boolean(pool);
}

function stripPassword(u: StoredUser): NuamUser {
  const { passwordHash: _pw, ...safe } = u;
  return safe;
}

function verifyStoredPassword(password: string, hash: string): boolean {
  if (!hash) {
    return password === 'nuam2026!';
  }
  if (bcrypt.compareSync(password, hash)) {
    return true;
  }
  return false;
}

export async function authenticateUser(email: string, password: string): Promise<NuamUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  try {
    if (await ensurePgReady()) {
      const res = await pool!.query(
        'select * from public.nuam_users where lower(email) = $1 limit 1',
        [normalized]
      );
      const row = res.rows[0];
      if (!row) return null;
      const valid = verifyStoredPassword(password, row.password_hash || '');
      if (!valid) return null;
      const now = new Date().toISOString();
      if (!row.password_hash) {
        const hashed = bcrypt.hashSync(password, 10);
        await pool!.query(
          'update public.nuam_users set last_login_at = $1, password_hash = $2 where id = $3',
          [now, hashed, row.id]
        );
      } else {
        await pool!.query('update public.nuam_users set last_login_at = $1 where id = $2', [
          now,
          row.id,
        ]);
      }
      return {
        id: String(row.id),
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        market: row.market,
        active: Boolean(row.active),
        lastLoginAt: now,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }
  } catch (err) {
    console.warn('Error consultando PostgreSQL en login, intentando memoria:', err);
  }

  const found = memoryStore.users.find((u) => u.email.toLowerCase() === normalized);
  if (!found || !verifyStoredPassword(password, found.passwordHash)) return null;
  found.lastLoginAt = new Date().toISOString();
  return stripPassword(found);
}

export async function getUserById(id: string): Promise<NuamUser | null> {
  try {
    if (await ensurePgReady()) {
      const res = await pool!.query('select * from public.nuam_users where id::text = $1 limit 1', [
        id,
      ]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: String(row.id),
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        market: row.market,
        active: Boolean(row.active),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }
  } catch {
    // Fallback to memoryStore below
  }
  const found = memoryStore.users.find((u) => u.id === id);
  return found ? stripPassword(found) : null;
}

export async function listUsers(): Promise<NuamUser[]> {
  if (await ensurePgReady()) {
    const res = await pool!.query('select * from public.nuam_users order by created_at desc');
    return res.rows.map((row) => ({
      id: String(row.id),
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      market: row.market,
      active: Boolean(row.active),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
  return memoryStore.users.map(stripPassword);
}

export async function createUser(input: {
  email: string;
  fullName: string;
  role: UserRole;
  market: MarketCode;
  password?: string;
}): Promise<NuamUser> {
  const email = input.email.trim().toLowerCase();
  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(input.password || 'nuam2026!', 10);
  const createdAt = new Date().toISOString();

  if (await ensurePgReady()) {
    await pool!.query(
      `insert into public.nuam_users (id, email, full_name, role, market, active, password_hash, created_at)
       values ($1,$2,$3,$4,$5,true,$6,$7)`,
      [id, email, input.fullName, input.role, input.market, passwordHash, createdAt]
    );
    return {
      id,
      email,
      fullName: input.fullName,
      role: input.role,
      market: input.market,
      active: true,
      lastLoginAt: null,
      createdAt,
    };
  }

  if (memoryStore.users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('Ya existe un usuario con ese correo institucional.');
  }
  const created: StoredUser = {
    id,
    email,
    fullName: input.fullName,
    role: input.role,
    market: input.market,
    active: true,
    lastLoginAt: null,
    createdAt,
    passwordHash,
  };
  memoryStore.users.unshift(created);
  return stripPassword(created);
}

export async function updateUser(
  id: string,
  patch: Partial<{ fullName: string; role: UserRole; market: MarketCode; active: boolean; password?: string }>
): Promise<NuamUser> {
  if (await ensurePgReady()) {
    const existing = await getUserById(id);
    if (!existing) throw new Error('Usuario no encontrado.');
    const next = {
      fullName: patch.fullName ?? existing.fullName,
      role: patch.role ?? existing.role,
      market: patch.market ?? existing.market,
      active: patch.active ?? existing.active,
    };
    if (patch.password) {
      const hash = bcrypt.hashSync(patch.password, 10);
      await pool!.query(
        'update public.nuam_users set full_name=$1, role=$2, market=$3, active=$4, password_hash=$5 where id::text=$6',
        [next.fullName, next.role, next.market, next.active, hash, id]
      );
    } else {
      await pool!.query(
        'update public.nuam_users set full_name=$1, role=$2, market=$3, active=$4 where id::text=$5',
        [next.fullName, next.role, next.market, next.active, id]
      );
    }
    return { ...existing, ...next };
  }

  const target = memoryStore.users.find((u) => u.id === id);
  if (!target) throw new Error('Usuario no encontrado.');
  if (patch.fullName !== undefined) target.fullName = patch.fullName;
  if (patch.role !== undefined) target.role = patch.role;
  if (patch.market !== undefined) target.market = patch.market;
  if (patch.active !== undefined) target.active = patch.active;
  if (patch.password) target.passwordHash = bcrypt.hashSync(patch.password, 10);
  return stripPassword(target);
}

export async function deleteUser(id: string): Promise<void> {
  if (await ensurePgReady()) {
    await pool!.query('delete from public.nuam_users where id::text = $1', [id]);
    return;
  }
  memoryStore.users = memoryStore.users.filter((u) => u.id !== id);
}

export async function listQualifications(): Promise<TaxQualification[]> {
  if (await ensurePgReady()) {
    const res = await pool!.query('select * from public.tax_qualifications order by updated_at desc');
    return res.rows.map((r) => ({
      id: String(r.id),
      emisor: r.emisor,
      rutEmisor: r.rut_emisor,
      mercado: r.mercado,
      ejercicio: Number(r.ejercicio),
      tipoRenta: r.tipo_renta,
      montoBruto: Number(r.monto_bruto),
      factor8: Number(r.factor_8),
      factor10: Number(r.factor_10),
      factor15: Number(r.factor_15),
      estado: r.estado,
      ownerId: r.owner_id,
      createdByName: r.created_by_name,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }
  return [...memoryStore.qualifications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createQualification(
  payload: Partial<TaxQualification>,
  actor: { id: string; fullName: string }
): Promise<TaxQualification> {
  const now = new Date().toISOString();
  const item: TaxQualification = {
    id: crypto.randomUUID(),
    emisor: String(payload.emisor || 'Emisor NUAM'),
    rutEmisor: String(payload.rutEmisor || '99.999.999-K'),
    mercado: (payload.mercado as QualificationMarket) || 'CL',
    ejercicio: Number(payload.ejercicio || 2024),
    tipoRenta: String(payload.tipoRenta || 'Dividendos Ordinarios DJ1948'),
    montoBruto: Number(payload.montoBruto || 0),
    factor8: Number(payload.factor8 || 0),
    factor10: Number(payload.factor10 || 0),
    factor15: Number(payload.factor15 || 0),
    estado: (payload.estado as QualificationStatus) || 'VIGENTE',
    ownerId: actor.id,
    createdByName: actor.fullName,
    createdAt: now,
    updatedAt: now,
  };

  if (await ensurePgReady()) {
    await pool!.query(
      `insert into public.tax_qualifications (id, emisor, rut_emisor, mercado, ejercicio, tipo_renta, monto_bruto, factor_8, factor_10, factor_15, estado, owner_id, created_by_name, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [item.id, item.emisor, item.rutEmisor, item.mercado, item.ejercicio, item.tipoRenta, item.montoBruto, item.factor8, item.factor10, item.factor15, item.estado, item.ownerId, item.createdByName, item.createdAt, item.updatedAt]
    );
  } else {
    memoryStore.qualifications.unshift(item);
  }
  realtimeBus.emit('sync', { type: 'qualification_created', id: item.id });
  return item;
}

export async function updateQualification(
  id: string,
  patch: Partial<TaxQualification>
): Promise<TaxQualification> {
  const now = new Date().toISOString();
  if (await ensurePgReady()) {
    const all = await listQualifications();
    const existing = all.find((x) => x.id === id);
    if (!existing) throw new Error('Calificación no encontrada.');
    const merged: TaxQualification = { ...existing, ...patch, id, updatedAt: now };
    await pool!.query(
      `update public.tax_qualifications set emisor=$1, rut_emisor=$2, mercado=$3, ejercicio=$4, tipo_renta=$5, monto_bruto=$6, factor_8=$7, factor_10=$8, factor_15=$9, estado=$10, updated_at=$11 where id::text=$12`,
      [merged.emisor, merged.rutEmisor, merged.mercado, merged.ejercicio, merged.tipoRenta, merged.montoBruto, merged.factor8, merged.factor10, merged.factor15, merged.estado, merged.updatedAt, id]
    );
    realtimeBus.emit('sync', { type: 'qualification_updated', id });
    return merged;
  }

  const idx = memoryStore.qualifications.findIndex((q) => q.id === id);
  if (idx === -1) throw new Error('Calificación no encontrada.');
  memoryStore.qualifications[idx] = { ...memoryStore.qualifications[idx], ...patch, id, updatedAt: now };
  realtimeBus.emit('sync', { type: 'qualification_updated', id });
  return memoryStore.qualifications[idx];
}

export async function deleteQualification(id: string): Promise<void> {
  if (await ensurePgReady()) {
    await pool!.query('delete from public.tax_qualifications where id::text = $1', [id]);
  } else {
    memoryStore.qualifications = memoryStore.qualifications.filter((q) => q.id !== id);
  }
  realtimeBus.emit('sync', { type: 'qualification_deleted', id });
}

export async function listBatches(): Promise<Dj1948Batch[]> {
  if (await ensurePgReady()) {
    const res = await pool!.query('select * from public.dj1948_batches order by created_at desc');
    return res.rows.map((r) => ({
      id: String(r.id),
      displayId: Number(r.display_id),
      fileName: r.file_name,
      ejercicio: Number(r.ejercicio),
      processType: r.process_type,
      processedCount: Number(r.processed_count),
      successCount: Number(r.success_count),
      errorCount: Number(r.error_count),
      estado: r.estado,
      ownerId: r.owner_id,
      uploadedByName: r.uploaded_by_name,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
  return [...memoryStore.batches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function processDj1948Csv(
  payload: { fileName: string; ejercicio: number; processType: string; content: string },
  actor: { id: string; fullName: string }
): Promise<Dj1948Batch> {
  const lines = payload.content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const dataLines = lines.length > 1 && lines[0].toUpperCase().includes('EMISOR') ? lines.slice(1) : lines;

  let successCount = 0;
  let errorCount = 0;

  for (const row of dataLines) {
    const sep = row.includes(';') ? ';' : ',';
    const cols = row.split(sep).map((c) => c.trim());
    if (cols.length < 6 || !cols[0]) {
      errorCount += 1;
      continue;
    }
    const market = (['CL', 'PE', 'CO'].includes(cols[2].toUpperCase())
      ? cols[2].toUpperCase()
      : 'CL') as QualificationMarket;
    const status = (cols[9] && ['VIGENTE', 'BORRADOR', 'PRESENTADO'].includes(cols[9].toUpperCase())
      ? cols[9].toUpperCase()
      : 'VIGENTE') as QualificationStatus;

    await createQualification(
      {
        emisor: cols[0],
        rutEmisor: cols[1],
        mercado: market,
        ejercicio: Number(cols[3]) || payload.ejercicio,
        tipoRenta: cols[4],
        montoBruto: Number(cols[5]) || 0,
        factor8: Number(cols[6]) || 0,
        factor10: Number(cols[7]) || 0,
        factor15: Number(cols[8]) || 0,
        estado: status,
      },
      actor
    );
    successCount += 1;
  }

  const existingBatches = await listBatches();
  const nextDisplayId = existingBatches.reduce((m, b) => Math.max(m, b.displayId), 0) + 1;
  const batch: Dj1948Batch = {
    id: crypto.randomUUID(),
    displayId: nextDisplayId,
    fileName: payload.fileName,
    ejercicio: payload.ejercicio,
    processType: payload.processType,
    processedCount: successCount + errorCount,
    successCount,
    errorCount,
    estado: errorCount === 0 ? 'EXITOSO' : 'CON_ERRORES',
    ownerId: actor.id,
    uploadedByName: actor.fullName,
    createdAt: new Date().toISOString(),
  };

  if (await ensurePgReady()) {
    await pool!.query(
      `insert into public.dj1948_batches (id, display_id, file_name, ejercicio, process_type, processed_count, success_count, error_count, estado, owner_id, uploaded_by_name, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [batch.id, batch.displayId, batch.fileName, batch.ejercicio, batch.processType, batch.processedCount, batch.successCount, batch.errorCount, batch.estado, batch.ownerId, batch.uploadedByName, batch.createdAt]
    );
  } else {
    memoryStore.batches.unshift(batch);
  }

  realtimeBus.emit('sync', { type: 'batch_uploaded', id: batch.id });
  return batch;
}

export async function deleteBatch(id: string): Promise<void> {
  if (await ensurePgReady()) {
    await pool!.query('delete from public.dj1948_batches where id::text = $1', [id]);
  } else {
    memoryStore.batches = memoryStore.batches.filter((b) => b.id !== id);
  }
  realtimeBus.emit('sync', { type: 'batch_deleted', id });
}

export async function presentDj1948ByYear(year: number): Promise<{ presentedCount: number; folio: string }> {
  const folio = `DJ1948-${year}-${Math.floor(100000 + Math.random() * 899999)}`;
  let presentedCount = 0;

  if (await ensurePgReady()) {
    const res = await pool!.query(
      `update public.tax_qualifications set estado='PRESENTADO', updated_at=$1 where ejercicio=$2 and estado='VIGENTE' returning id`,
      [new Date().toISOString(), year]
    );
    presentedCount = res.rowCount || 0;
  } else {
    const now = new Date().toISOString();
    memoryStore.qualifications.forEach((q) => {
      if (q.ejercicio === year && q.estado === 'VIGENTE') {
        q.estado = 'PRESENTADO';
        q.updatedAt = now;
        presentedCount += 1;
      }
    });
  }

  realtimeBus.emit('sync', { type: 'dj1948_presented', folio });
  return { presentedCount, folio };
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  if (await ensurePgReady()) {
    const res = await pool!.query('select * from public.audit_logs order by created_at desc limit 50');
    return res.rows.map((r) => ({
      id: String(r.id),
      action: r.action,
      module: r.module,
      userName: r.user_name,
      userId: r.user_id,
      ipAddress: r.ip_address,
      hashCode: r.hash_code,
      detail: r.detail,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
  return [...memoryStore.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function appendAuditLog(entry: {
  action: string;
  module: string;
  userName: string;
  userId: string;
  ipAddress?: string;
  detail: string;
}): Promise<AuditLog> {
  const createdAt = new Date().toISOString();
  const log: AuditLog = {
    id: crypto.randomUUID(),
    action: entry.action,
    module: entry.module,
    userName: entry.userName,
    userId: entry.userId,
    ipAddress: entry.ipAddress || '127.0.0.1',
    hashCode: makeHash(`${entry.action}:${entry.module}:${entry.userId}:${createdAt}`),
    detail: entry.detail,
    createdAt,
  };

  try {
    if (await ensurePgReady()) {
      await pool!.query(
        `insert into public.audit_logs (id, action, module, user_name, user_id, ip_address, hash_code, detail, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [log.id, log.action, log.module, log.userName, log.userId, log.ipAddress, log.hashCode, log.detail, log.createdAt]
      );
      realtimeBus.emit('sync', { type: 'audit_log', id: log.id });
      return log;
    }
  } catch (err) {
    console.warn('No se pudo registrar auditoría en PostgreSQL, guardando en memoria:', err);
  }
  memoryStore.auditLogs.unshift(log);
  realtimeBus.emit('sync', { type: 'audit_log', id: log.id });
  return log;
}

export async function computeDashboardSummary(): Promise<DashboardSummary> {
  const quals = await listQualifications();
  const batches = await listBatches();

  const marketMeta: Array<{ market: QualificationMarket; label: string }> = [
    { market: 'CL', label: 'Santiago (CL)' },
    { market: 'PE', label: 'Lima (PE)' },
    { market: 'CO', label: 'Colombia (CO)' },
  ];

  const byMarket = marketMeta.map(({ market, label }) => {
    const list = quals.filter((q) => q.mercado === market);
    return {
      market,
      label,
      count: list.length,
      montoTotal: list.reduce((sum, q) => sum + Number(q.montoBruto || 0), 0),
    };
  });

  const byYear = [2023, 2024, 2025, 2026].map((year) => {
    const list = quals.filter((q) => q.ejercicio === year);
    return {
      year,
      vigentes: list.filter((q) => q.estado === 'VIGENTE').length,
      borrador: list.filter((q) => q.estado === 'BORRADOR').length,
      presentadas: list.filter((q) => q.estado === 'PRESENTADO').length,
    };
  });

  return {
    totalCalificaciones: quals.length,
    vigentes: quals.filter((q) => q.estado === 'VIGENTE').length,
    borrador: quals.filter((q) => q.estado === 'BORRADOR').length,
    presentadas: quals.filter((q) => q.estado === 'PRESENTADO').length,
    cargasDj1948: batches.length,
    yoyGrowthPct: 20,
    totalMontoBruto: quals.reduce((sum, q) => sum + Number(q.montoBruto || 0), 0),
    byMarket,
    byYear,
  };
}
