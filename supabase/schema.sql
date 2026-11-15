-- NUAM Plataforma Tributaria - Esquema PostgreSQL y Políticas RLS para Supabase

create extension if not exists "pgcrypto";

-- 1. Tabla de Usuarios Corporativos y Roles RBAC
create table if not exists public.nuam_users (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique,
  email text unique not null,
  full_name text not null,
  role text not null default 'consultor' check (role in ('admin', 'operador', 'consultor')),
  market text not null default 'REGIONAL' check (market in ('CL', 'PE', 'CO', 'REGIONAL')),
  active boolean not null default true,
  password_hash text not null default '',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabla de Calificaciones Tributarias (Santiago, Lima, Colombia)
create table if not exists public.tax_qualifications (
  id uuid primary key default gen_random_uuid(),
  emisor text not null,
  rut_emisor text not null,
  mercado text not null check (mercado in ('CL', 'PE', 'CO')),
  ejercicio integer not null check (ejercicio between 2020 and 2035),
  tipo_renta text not null,
  monto_bruto numeric(16,2) not null default 0,
  factor_8 numeric(8,6) not null default 0,
  factor_10 numeric(8,6) not null default 0,
  factor_15 numeric(8,6) not null default 0,
  estado text not null default 'BORRADOR' check (estado in ('VIGENTE', 'BORRADOR', 'PRESENTADO')),
  owner_id text not null,
  created_by_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Tabla de Lotes Carga Masiva DJ1948
create table if not exists public.dj1948_batches (
  id uuid primary key default gen_random_uuid(),
  display_id serial,
  file_name text not null,
  ejercicio integer not null check (ejercicio between 2020 and 2035),
  process_type text not null,
  processed_count integer not null default 0,
  success_count integer not null default 0,
  error_count integer not null default 0,
  estado text not null default 'EXITOSO' check (estado in ('EXITOSO', 'CON_ERRORES', 'PROCESANDO')),
  owner_id text not null,
  uploaded_by_name text not null,
  created_at timestamptz not null default now()
);

-- 4. Bitácora Inmutable de Auditoría y Trazabilidad
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  module text not null,
  user_name text not null,
  user_id text not null,
  ip_address text not null default '127.0.0.1',
  hash_code text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.nuam_users enable row level security;
alter table public.tax_qualifications enable row level security;
alter table public.dj1948_batches enable row level security;
alter table public.audit_logs enable row level security;

-- Políticas de lectura y escritura basadas en usuario autenticado en Supabase Auth
create policy "Usuarios autenticados leen su perfil o admin lee todos"
  on public.nuam_users for select
  to authenticated
  using (auth.uid() = auth_uid or exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role = 'admin'
  ));

create policy "Solo admin gestiona usuarios"
  on public.nuam_users for all
  to authenticated
  using (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role = 'admin'
  ))
  with check (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role = 'admin'
  ));

create policy "Usuarios autenticados leen calificaciones"
  on public.tax_qualifications for select
  to authenticated
  using (true);

create policy "Admin y Operador crean/actualizan calificaciones"
  on public.tax_qualifications for insert
  to authenticated
  with check (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role in ('admin', 'operador')
  ));

create policy "Admin y Operador editan calificaciones"
  on public.tax_qualifications for update
  to authenticated
  using (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role in ('admin', 'operador')
  ));

create policy "Solo Admin elimina calificaciones"
  on public.tax_qualifications for delete
  to authenticated
  using (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role = 'admin'
  ));

create policy "Usuarios autenticados leen lotes DJ1948"
  on public.dj1948_batches for select
  to authenticated
  using (true);

create policy "Admin y Operador cargan lotes DJ1948"
  on public.dj1948_batches for insert
  to authenticated
  with check (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role in ('admin', 'operador')
  ));

create policy "Solo Admin elimina lotes DJ1948"
  on public.dj1948_batches for delete
  to authenticated
  using (exists (
    select 1 from public.nuam_users u where u.auth_uid = auth.uid() and u.role = 'admin'
  ));

create policy "Usuarios autenticados leen auditoria"
  on public.audit_logs for select
  to authenticated
  using (true);

create policy "Usuarios autenticados registran auditoria"
  on public.audit_logs for insert
  to authenticated
  with check (auth.uid() is not null);

-- Habilitar Supabase Realtime para reportes en vivo
alter publication supabase_realtime add table public.tax_qualifications;
alter publication supabase_realtime add table public.dj1948_batches;
alter publication supabase_realtime add table public.audit_logs;
