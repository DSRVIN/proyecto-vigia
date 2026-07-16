-- ============================================================
-- VIGÍA — Migración 003: Datos reales + RLS por rol
-- Ejecutar en: Dashboard → SQL Editor → New query → Run
--
-- Prepara la tabla students para almacenar la clasificación real
-- (notas por evaluación, promedio, riesgo) y reemplaza la política
-- permisiva por control de acceso por rol a nivel de base de datos.
-- ============================================================

-- ── Columnas para la clasificación académica ─────────────────
alter table public.students
  add column if not exists docente_codigo text,
  add column if not exists notas jsonb default '{}'::jsonb,
  add column if not exists promedio numeric,
  add column if not exists nota_final numeric,
  add column if not exists nota_necesaria numeric,
  add column if not exists riesgo text default 'BAJO'
    check (riesgo in ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
  add column if not exists monto_pendiente numeric default 0,
  add column if not exists cuotas_vencidas integer default 0;

create index if not exists students_docente_idx on public.students (docente_codigo);

-- ── Trazabilidad: historial de predicciones de riesgo ────────
-- Cada reclasificación (p. ej. el batch nocturno de n8n) deja registro,
-- habilitando la métrica de "tiempo de detección" del documento (6.5).
create table if not exists public.predictions_history (
  id bigint generated always as identity primary key,
  student_codigo text not null,
  riesgo text not null check (riesgo in ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
  promedio numeric,
  asistencia numeric,
  fuente text default 'sistema',
  created_at timestamptz default now()
);

create index if not exists predictions_student_idx
  on public.predictions_history (student_codigo, created_at desc);

-- ── RLS: control de acceso por rol ───────────────────────────
-- Se reemplaza la política permisiva (que dejaba a todo autenticado
-- leer todos los estudiantes) por una scoping por rol:
--   DOCENTE     → solo estudiantes de sus cursos (docente_codigo)
--   CALLCENTER  → toda la cartera (gestión de retención)
--   ADMIN       → todo
drop policy if exists "Los docentes autenticados leen estudiantes" on public.students;

create policy "Lectura de estudiantes por rol"
  on public.students for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('ADMIN', 'CALLCENTER')
          or (p.role = 'DOCENTE' and p.codigo = public.students.docente_codigo)
        )
    )
  );

-- El call center puede actualizar el estado de pago durante la gestión.
drop policy if exists "Call center actualiza estado de pago" on public.students;
create policy "Call center actualiza estado de pago"
  on public.students for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('ADMIN', 'CALLCENTER')
    )
  );

-- Historial de predicciones: lectura para usuarios autenticados.
alter table public.predictions_history enable row level security;
drop policy if exists "Lectura de historial de predicciones" on public.predictions_history;
create policy "Lectura de historial de predicciones"
  on public.predictions_history for select
  to authenticated
  using (true);

-- NOTA: las escrituras masivas (seed, ingesta y clasificación por lotes)
-- se realizan con la service_role key (omite RLS), reservada al backend/n8n.
