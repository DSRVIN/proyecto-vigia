-- ============================================================
-- VIGÍA — Migración 002: Roles de usuario (RBAC)
-- Ejecutar en: Dashboard → SQL Editor → New query → Run
--
-- Requisito previo: crear en Authentication → Users (con
-- "Auto Confirm User") los usuarios demo de los nuevos roles:
--   c20001@utp.edu.pe  (Call Center)   contraseña Utp2026#
--   c30001@utp.edu.pe  (Administrador) contraseña Utp2026#
-- ============================================================

-- ── Columna de rol en profiles ───────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'DOCENTE'
  check (role in ('DOCENTE', 'CALLCENTER', 'ADMIN'));

-- ── Perfiles para los usuarios demo de los nuevos roles ──────
insert into public.profiles (id, codigo, nombre, email, cargo, departamento, role)
select
  u.id,
  upper(split_part(u.email, '@', 1)),
  case
    when u.email = 'c20001@utp.edu.pe' then 'Lic. María Torres Vega'
    when u.email = 'c30001@utp.edu.pe' then 'Ing. Jorge Ramírez Soto'
  end,
  u.email,
  case
    when u.email = 'c20001@utp.edu.pe' then 'Agente de Retención'
    when u.email = 'c30001@utp.edu.pe' then 'Administrador General'
  end,
  case
    when u.email = 'c20001@utp.edu.pe' then 'Consejería Estudiantil'
    when u.email = 'c30001@utp.edu.pe' then 'Dirección de Tecnología Educativa'
  end,
  case
    when u.email = 'c20001@utp.edu.pe' then 'CALLCENTER'
    when u.email = 'c30001@utp.edu.pe' then 'ADMIN'
  end
from auth.users u
where u.email in ('c20001@utp.edu.pe', 'c30001@utp.edu.pe')
on conflict (id) do nothing;

-- Si los perfiles ya existían, asegurar el rol correcto
update public.profiles set role = 'CALLCENTER' where email = 'c20001@utp.edu.pe';
update public.profiles set role = 'ADMIN' where email = 'c30001@utp.edu.pe';

-- Los docentes demo permanecen con el rol por defecto DOCENTE
update public.profiles
  set role = 'DOCENTE'
  where email in ('c13005@utp.edu.pe', 'c13007@utp.edu.pe');
