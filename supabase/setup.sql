-- ============================================================
-- VIGÍA — Esquema inicial de Supabase
-- Ejecutar en: Dashboard → SQL Editor → New query → Run
--
-- Requisito previo: crear los usuarios docentes en
-- Authentication → Users (c13005@utp.edu.pe, c13007@utp.edu.pe)
-- ============================================================

-- ── Perfiles de docentes (vinculados a Supabase Auth) ────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  codigo text unique not null,
  nombre text,
  email text,
  cargo text default 'Docente Titular',
  departamento text default 'Ing. de Sistemas',
  avatar text,
  role text not null default 'DOCENTE' check (role in ('DOCENTE', 'CALLCENTER', 'ADMIN')),
  created_at timestamptz default now()
);

-- ── Estudiantes ──────────────────────────────────────────────
create table if not exists public.students (
  id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null,
  email text,
  carrera text,
  ciclo text,
  curso_id text not null,
  asistencia numeric default 75,
  actividad_dias integer default 5,
  estado_pago text default 'PAGADO',
  created_at timestamptz default now()
);

create index if not exists students_curso_idx on public.students (curso_id);

-- ── Calificaciones y clasificación de riesgo ─────────────────
create table if not exists public.grades (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  pc1 numeric,
  pc2 numeric,
  pc3 numeric,
  pc4 numeric,
  promedio numeric,
  nota_final numeric,
  riesgo text default 'BAJO' check (riesgo in ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
  necesita_pc4 numeric,
  updated_at timestamptz default now(),
  unique (student_id)
);

-- ── Seguridad: RLS (solo usuarios autenticados pueden leer) ──
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.grades enable row level security;

create policy "Los usuarios autenticados leen su propio perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Los docentes autenticados leen estudiantes"
  on public.students for select
  to authenticated
  using (true);

create policy "Los docentes autenticados leen calificaciones"
  on public.grades for select
  to authenticated
  using (true);

-- Escrituras: reservadas al backend (service_role via n8n),
-- que omite RLS por diseño. No se crean políticas de insert/update
-- para el rol authenticated hasta definir el módulo de carga.

-- ── Perfiles de los docentes demo ────────────────────────────
-- Se vinculan por email a los usuarios ya creados en Auth.
insert into public.profiles (id, codigo, nombre, email, cargo, departamento)
select
  u.id,
  upper(split_part(u.email, '@', 1)),
  case
    when u.email = 'c13005@utp.edu.pe' then 'Dr. Carlos Mendoza Paredes'
    when u.email = 'c13007@utp.edu.pe' then 'Mg. Andrea Salazar Rojas'
    else 'Dr. Docente UTP'
  end,
  u.email,
  'Docente Titular',
  'Ing. de Sistemas'
from auth.users u
where u.email in ('c13005@utp.edu.pe', 'c13007@utp.edu.pe')
on conflict (id) do nothing;
