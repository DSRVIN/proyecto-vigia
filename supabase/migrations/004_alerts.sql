-- ============================================================
-- VIGÍA — Migración 004: Tabla de alertas (automatización n8n)
-- Ejecutar en: Dashboard → SQL Editor → New query → Run
--
-- El flujo de n8n "Alertas de riesgo" inserta aquí una alerta
-- cuando detecta un estudiante en riesgo crítico sin alerta
-- reciente. La app las lee para el centro de notificaciones.
-- ============================================================

create table if not exists public.alerts (
  id bigint generated always as identity primary key,
  student_codigo text not null,
  student_nombre text,
  riesgo text not null check (riesgo in ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
  mensaje text,
  atendida boolean not null default false,
  fuente text default 'n8n',
  created_at timestamptz default now()
);

create index if not exists alerts_student_idx
  on public.alerts (student_codigo, created_at desc);

-- RLS: los usuarios autenticados leen y pueden marcar como atendida;
-- la inserción queda reservada al backend (service_role via n8n).
alter table public.alerts enable row level security;

drop policy if exists "Lectura de alertas" on public.alerts;
create policy "Lectura de alertas"
  on public.alerts for select
  to authenticated
  using (true);

drop policy if exists "Marcar alerta como atendida" on public.alerts;
create policy "Marcar alerta como atendida"
  on public.alerts for update
  to authenticated
  using (true)
  with check (true);
