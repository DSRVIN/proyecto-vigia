# VIGÍA — Plan de pruebas de rigor

Ejercicio de preparación para la sustentación: recorrer el sistema completo verificando cada comportamiento, hasta poder explicar **qué hace, por qué y qué pasaría si falla**. Marca cada casilla solo cuando puedas explicar el resultado sin leer la nota.

Convención: ✅ = resultado esperado. 💬 = lo que debes poder explicar con soltura.

---

## Suite 1 — Autenticación y sesión

- [ ] **1.1** Entrar a la URL de producción sin sesión → ✅ redirige a `/login`.
  💬 El guard `RequireAuth` intercepta cualquier ruta protegida; espera a `authReady` antes de decidir (por eso a veces se ve "Restaurando sesión…").
- [ ] **1.2** Login con código inválido (`X999`) → ✅ el formulario rechaza el formato antes de llamar a Supabase.
- [ ] **1.3** Login con `C13005` + contraseña incorrecta → ✅ error de credenciales (viene de Supabase Auth, no de la app).
- [ ] **1.4** Login correcto y **recargar la página (F5)** → ✅ la sesión se mantiene; no vuelve al login.
  💬 Supabase guarda el token en localStorage; el hook `useSessionRestore` lo revalida y reconstruye el perfil al arrancar.
- [ ] **1.5** Logout y luego F5 → ✅ permanece en login (la sesión de Supabase se cerró de verdad, no solo el estado en memoria).

## Suite 2 — Control de acceso por rol (RBAC)

- [ ] **2.1** Como `C13005` (docente), escribir a mano `/admin` en la URL → ✅ rebota a `/docente` sin pantalla de error.
- [ ] **2.2** Como `C13005`, escribir `/callcenter` → ✅ mismo rebote.
- [ ] **2.3** Como `C20001` (call center), escribir `/docente` → ✅ rebota a `/callcenter`.
- [ ] **2.4** Como `C30001` (admin) → ✅ accede a TODOS los módulos y ve la barra de navegación completa en el header.
- [ ] **2.5** La prueba fuerte: como docente, contar los estudiantes (267) y como admin (522).
  💬 No es un filtro del frontend: la política RLS en PostgreSQL compara `profiles.codigo` con `students.docente_codigo`; la misma consulta devuelve datos distintos según quién la hace. Aunque alguien use la anon key directamente contra la API, obtiene lo mismo.

## Suite 3 — Datos reales y persistencia

- [ ] **3.1** Recargar el dashboard 2–3 veces → ✅ los mismos nombres y cifras siempre (antes eran aleatorios por `Math.random`).
- [ ] **3.2** En Calificaciones, verificar un promedio a mano: tomar un estudiante, multiplicar cada nota por su peso y comparar.
  💬 Los pesos por curso viven en `metrics.service.js`; el seed se generó con esas mismas funciones, por eso base y app nunca discrepan.
- [ ] **3.3** En Supabase, editar la nota de un estudiante y recargar la app → ✅ el cambio se refleja.
- [ ] **3.4** Nota con umbral: un promedio de 11.5 se muestra como 12 → 💬 regla institucional `ROUND_THRESHOLD` (11.45): redondeo al mínimo aprobatorio.

## Suite 4 — Automatización n8n

- [ ] **4.1** Formulario de ingesta: subir el CSV de ejemplo → ✅ 4 upserts + 1 rechazado.
  💬 El rechazado trae asistencia 150 y nota 25; la validación implementa la contingencia del Riesgo R1 (datos corruptos nunca llegan a la base — van al log).
- [ ] **4.2** Verificar el estudiante nuevo (`U2026999001`) en la app como docente → ✅ aparece en SIST101.
- [ ] **4.3** Ejecutar la clasificación nocturna manualmente → ✅ `predictions_history` crece exactamente en 522.
- [ ] **4.4** Caso "no hay cambios": ejecutar clasificación dos veces seguidas → ✅ la rama "Actualizar riesgo" no se ejecuta la segunda vez.
  💬 No es un error: significa que ningún estudiante cambió de nivel — la lógica del flujo y la de la app son idénticas.
- [ ] **4.5** El ciclo completo: degradar un estudiante por SQL (`asistencia=25, actividad_dias=30`), correr clasificación y alertas → ✅ alerta nueva en la tabla `alerts`.
- [ ] **4.6** Abrir la campana en la app → ✅ la alerta aparece con la nota "Generadas por la automatización n8n" y el mensaje explicativo.
- [ ] **4.7** Pulsar **Atender** → ✅ desaparece de pendientes; en Supabase `atendida = true`.
- [ ] **4.8** Apagar el contenedor (`docker compose down`), verificar que la app sigue operando → ✅ funciona con los últimos datos.
  💬 Patrón del Riesgo R2 del APF1: si el servicio de procesamiento cae, el sistema muestra la última clasificación persistida. Volver a levantar con `docker compose up -d`.

## Suite 5 — Métricas y trazabilidad

- [ ] **5.1** Como admin, abrir Estadísticas (`/admin/metricas`) → ✅ contadores reales y checklist de SLA.
- [ ] **5.2** Ejecutar las consultas 2 y 3 de [METRICAS_SUSTENTACION.md](METRICAS_SUSTENTACION.md) → ✅ trazabilidad por corrida y minutos de detección.
- [ ] **5.3** Poder responder: *¿de dónde sale el "tiempo de detección"?*
  💬 Diferencia entre el timestamp de la clasificación (predictions_history) y el de la alerta (alerts) del mismo estudiante — medible, no estimado.

## Suite 6 — Calidad de ingeniería

- [ ] **6.1** En GitHub Actions, abrir el último run → ✅ 5 stages en verde + deploy.
- [ ] **6.2** Poder explicar cada stage en una frase (lint/format, tests+cobertura, build+presupuesto de tamaño, auditoría de vulnerabilidades, deploy condicionado).
- [ ] **6.3** Correr localmente `npm test` → ✅ 64 tests. Saber qué cubren: lógica de riesgo (casos del APF1 §15.2), métricas académicas, matriz RBAC, render de las 18 páginas con datos vacíos y poblados, mapeo BD→app.
- [ ] **6.4** Poder explicar por qué la service role key no está en ningún archivo del repo y dónde vive.

## Suite 7 — Preguntas incómodas (ensayo oral)

Responde en voz alta, sin notas:

1. ¿Qué diferencia hay entre `calcRiesgo` (metrics.service) y `clasificarRiesgo` (lib)? *(La primera es la operativa del dashboard — promedio/asistencia/inactividad; la segunda implementa las reglas del APF1 §3.4.1 — inasistencia/logins/foros. Ambas testeadas.)*
2. ¿Por qué la primera corrida del flujo de alertas generó cientos de alertas? *(Todos los críticos existentes eran "nuevos" para el sistema; el anti-duplicados de 24 h lo normaliza desde la segunda corrida.)*
3. ¿Qué pasa si dos docentes suben el mismo estudiante por el formulario? *(Upsert por `codigo`: el segundo actualiza, no duplica.)*
4. Si mañana la UTP pide un modelo de ML real, ¿qué cambia? *(Solo el nodo de clasificación del flujo nocturno; `predictions_history` ya es el dataset de entrenamiento acumulándose, y la app no cambia porque solo lee `students.riesgo`.)*
5. ¿Por qué Vitest y no Jest, si el documento decía Jest? *(Vitest es el estándar del ecosistema Vite — mismo motor de build, API compatible con Jest; la discrepancia quedó registrada en RFC-001.)*

---

**Criterio de "listo para sustentar":** las 7 suites completas, con las preguntas de la suite 7 respondidas de memoria. Tiempo estimado del ejercicio completo: 60–90 minutos.
