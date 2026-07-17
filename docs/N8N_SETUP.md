# VIGÍA — Guía de configuración de n8n (Fase 3B)

n8n es la capa de automatización de VIGÍA: ingesta de notas por lotes, reclasificación nocturna de riesgo con trazabilidad, y alertas automáticas. Corre self-hosted en Docker, en tu propia máquina.

## 1. Levantar n8n

Requisito: Docker Desktop corriendo.

```bash
cd proyecto-vigia/n8n
docker compose up -d
```

- Interfaz: **http://localhost:5678**
- Los datos (flujos, credenciales, ejecuciones) persisten en el volumen `n8n_data` aunque detengas el contenedor (`docker compose down`).

## 2. Configuración inicial (una sola vez)

1. **Cuenta de administrador**: al abrir http://localhost:5678 por primera vez, n8n pide crear la cuenta del propietario (correo, nombre y contraseña — es una cuenta local de tu instancia, no un servicio externo).
2. **Credencial de Supabase**: en n8n → **Credentials → Add credential → Supabase API**:
   - **Name**: `Supabase VIGIA (service role)` — usa este nombre exacto: los flujos importados la referencian así.
   - **Host**: `https://goxrpvizleicftnmsgrd.supabase.co`
   - **Service Role Secret**: la *service role key* de tu proyecto (Dashboard de Supabase → Settings → API Keys → `service_role`). Aquí es donde esa clave privilegiada debe vivir: cifrada en n8n, del lado del servidor — nunca en el frontend.
3. **Migración 004**: ejecuta [supabase/migrations/004_alerts.sql](../supabase/migrations/004_alerts.sql) en el SQL Editor de Supabase — crea la tabla `alerts` que usa el flujo de alertas.

## 3. Los tres flujos

Ya vienen importados (si necesitas reimportarlos: `docker exec vigia-n8n n8n import:workflow --separate --input=/flows`). Al abrir cada uno, verifica que los nodos HTTP tengan asignada la credencial `Supabase VIGIA (service role)` y **actívalos** con el interruptor superior derecho.

### Flujo 1 — Ingesta de notas (CSV)

**Qué hace:** implementa la carga por lotes que define el MVP del documento APF1, con la validación automática de la contingencia del Riesgo R1: los registros corruptos se separan en un log para revisión manual en vez de contaminar la base.

- **Disparador:** formulario web con carga de archivo. Con el flujo activo, la URL del formulario aparece en el nodo "Formulario de carga" (pestaña Production URL).
- **Validaciones:** código/nombre/curso no vacíos, curso existente, docente con formato `C#####`, asistencia 0–100, notas 0–20. Calcula promedio ponderado (mismos pesos por curso que la app) y clasifica el riesgo con la misma regla `calcRiesgo`.
- **Destino:** upsert en `students` (clave `codigo` — actualiza si existe, inserta si es nuevo).
- **Demo:** usa [n8n/flows/ejemplo-ingesta-notas.csv](../n8n/flows/ejemplo-ingesta-notas.csv) — incluye 4 registros válidos y 1 inválido (asistencia 150, nota 25) para mostrar el rechazo en vivo.

### Flujo 2 — Clasificación nocturna de riesgo

**Qué hace:** el "procesamiento automático durante la madrugada" que el documento define en el SLA (sección 5.1).

- **Disparador:** cron diario a las 3:00 am (hora de Lima). También se puede ejecutar manualmente con "Execute workflow" para la demo.
- **Lógica:** lee toda la cartera, recalcula el riesgo de cada estudiante, escribe **un registro por estudiante** en `predictions_history` (la trazabilidad de la sección 6.5 — de aquí sale la métrica de "tiempo de detección") y actualiza `students.riesgo` solo en los que cambiaron.

### Flujo 3 — Alertas de riesgo crítico

**Qué hace:** detección proactiva — la brecha entre "el dato existe" y "alguien se entera".

- **Disparador:** cada 15 minutos.
- **Lógica:** busca estudiantes en riesgo `CRITICO`, descarta los que ya tienen una alerta en las últimas 24 h (anti-duplicados) e inserta la alerta en la tabla `alerts` con un mensaje explicativo (promedio, asistencia, curso, docente).
- **Roadmap:** el nodo final deshabilitado marca dónde se conectará el envío real por correo/WhatsApp. Nota de gobernanza: el envío automático excede el alcance del MVP del APF1 ("no ejecutará acciones automatizadas directas"), por lo que activarlo debe registrarse como RFC en la matriz de control de cambios (sección 13).

## 4. Demo sugerida para la sustentación (5 minutos)

1. Abre el formulario del Flujo 1 y sube el CSV de ejemplo → muestra en la ejecución los 4 registros insertados y el rechazado con sus errores.
2. Ejecuta manualmente el Flujo 2 → muestra en Supabase (`select count(*) from predictions_history`) que quedó el historial.
3. En el SQL Editor, baja las notas de un estudiante a riesgo crítico → ejecuta el Flujo 3 → muestra la alerta nueva en `alerts` con su mensaje.
4. Cierra con la app: el estudiante modificado aparece reclasificado en el dashboard del docente.

## 5. Comandos útiles

```bash
docker compose up -d        # levantar
docker compose down         # detener (datos persisten)
docker compose logs -f n8n  # ver logs en vivo
docker exec vigia-n8n n8n import:workflow --separate --input=/flows   # reimportar flujos
```

## Seguridad

- La **service role key** vive únicamente en las credenciales cifradas de n8n. No está en ningún archivo del repositorio (los JSON de los flujos solo referencian la credencial por nombre).
- n8n corre en `localhost` sin exposición a internet. Si más adelante se expone (p. ej. para recibir webhooks de Supabase), debe ponerse detrás de HTTPS y autenticación.
