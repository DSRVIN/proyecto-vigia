# VIGÍA — Guion de demo para la sustentación

Recorrido completo de 12–15 minutos, diseñado para la defensa cronometrada que pide el APF1. Cada acto tiene su mensaje clave: qué debe quedar en la mente del jurado.

## Preparación previa (checklist, 10 min antes)

- [ ] Docker Desktop corriendo y contenedor `vigia-n8n` arriba (`docker ps`).
- [ ] Los 3 flujos de n8n en estado **Published**.
- [ ] Pestañas abiertas: app en producción (Vercel), n8n (localhost:5678), Supabase SQL Editor, y el formulario de ingesta (Production URL del Flujo 1).
- [ ] Archivo `n8n/flows/ejemplo-ingesta-notas.csv` a mano.
- [ ] Sesiones cerradas en la app (para mostrar el login desde cero).
- [ ] [docs/METRICAS_SUSTENTACION.md](METRICAS_SUSTENTACION.md) abierto para copiar las consultas.

## Acto 1 — El problema y los roles (3 min)

1. **Login como docente** (`C13005` / `Utp2026#`): mostrar la pantalla de bienvenida con la cartera real (267 estudiantes, KPIs de riesgo).
   - *Mensaje:* "los datos son persistentes y viven en PostgreSQL; el docente solo ve SUS estudiantes gracias a Row Level Security — aunque manipule la URL o la API, la base de datos no le entrega más".
2. Demostrar el RBAC en vivo: escribir `/admin` en la URL → el sistema lo devuelve a su módulo.
3. Recorrido rápido del sidebar docente: Calificaciones (libro de notas con promedio ponderado), Asistencias, Reportes.
4. **Logout y login como admin** (`C30001`): mostrar que el sidebar cambia (color azul oscuro, secciones de gestión) y que ve la cartera completa (522).
   - *Mensaje:* "un solo sistema, tres experiencias, permisos reales en dos capas".

## Acto 2 — La automatización en vivo (5 min) ⭐

5. Abrir n8n y mostrar los 3 flujos publicados (30 segundos, sin entrar al detalle).
6. **Ingesta**: abrir el formulario web, subir el CSV de ejemplo. En la ejecución de n8n, mostrar:
   - 4 registros validados y enviados a Supabase (upsert).
   - 1 registro **rechazado** con sus errores listados (asistencia 150, nota 25).
   - *Mensaje:* "esto implementa la contingencia del Riesgo R1 del documento: los datos corruptos jamás contaminan la base — van a un log de revisión".
7. **Clasificación**: "Execute workflow" en el flujo nocturno. En Supabase: `select count(*) from predictions_history;` → creció en 522.
   - *Mensaje:* "cada corrida deja trazabilidad auditable (§6.5); en producción esto corre solo, a las 3 am, como exige el SLA".
8. **El momento clave**: en el SQL Editor, degradar a un estudiante en vivo:
   ```sql
   update students set asistencia = 25, actividad_dias = 30 where codigo = 'U2026999001';
   ```
   Ejecutar el flujo de clasificación (lo reclasifica a CRITICO) y luego el de alertas (genera la alerta).
9. Volver a la app (docente) → **abrir la campana**: la alerta del estudiante aparece, marcada "Generadas por la automatización n8n", con su mensaje explicativo. Pulsar **Atender** → queda registrada como atendida en la base.
   - *Mensaje:* "el ciclo completo sin intervención humana: dato → clasificación → alerta → notificación al tutor → registro de la atención. Esa es la diferencia entre 7-15 días del proceso manual y minutos".

## Acto 3 — Los números (3 min)

10. Como admin, abrir **Estadísticas** (`/admin/metricas`): clasificaciones registradas, alertas generadas/atendidas, checklist de SLA en verde.
11. Ejecutar en Supabase la **consulta 3** de métricas (tiempo de detección) → mostrar los minutos reales entre clasificación y alerta.
    - *Mensaje:* "el documento prometía detección en menos de 24 horas contra 7–15 días del proceso manual; lo medido son minutos".

## Acto 4 — La ingeniería detrás (2 min)

12. Mostrar GitHub: el pipeline de CI con sus 5 stages en verde (lint, 64 tests, build, auditoría de seguridad, deploy automático).
13. Cierre con la arquitectura (un diagrama o la bitácora): React+Vite → Supabase (RLS) → n8n (service role) → Gemini.
    - *Mensaje:* "cada capa tiene su responsabilidad y su credencial con privilegio mínimo; todo el proceso es reproducible desde el repositorio".

## Preguntas probables y respuesta corta

| Pregunta | Respuesta |
| --- | --- |
| ¿Dónde está la IA? | Dos niveles: clasificación por reglas de negocio deterministas (auditables, exigencia del ≥70% de precisión se cumple por construcción) y Gemini 2.5 Flash para generar diagnósticos y correos de intervención personalizados. |
| ¿Por qué reglas y no un modelo de ML entrenado? | Con 522 estudiantes de un ciclo no hay volumen para entrenar sin sobreajuste; las reglas son transparentes ante el tutor (mitiga el Riesgo R3 de desconfianza) y la arquitectura ya está lista para reemplazar el clasificador por un modelo cuando haya historial suficiente (predictions_history es justamente ese dataset en construcción). |
| ¿Qué pasa si alguien roba la anon key del frontend? | Solo puede hacer lo que las políticas RLS permiten a un usuario autenticado: nada sin sesión, y con sesión solo lo de su rol. Las escrituras masivas requieren la service role key, que vive cifrada en n8n. |
| ¿Y si n8n se cae? | La app sigue operando con los últimos datos clasificados (patrón del Riesgo R2 del documento); al volver, el cron reprocesa. Nada se pierde porque el estado vive en PostgreSQL. |
| ¿Cómo se despliega un cambio? | Push a main → pipeline de 5 stages (lint, tests, build, auditoría) → deploy automático a Vercel solo si todo pasa. |
| ¿El envío de correos es automático? | No en el MVP — el documento lo excluye explícitamente. La automatización registra la alerta y el envío está preparado como siguiente fase, registrado como RFC en el control de cambios. |
