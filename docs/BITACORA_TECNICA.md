# Bitácora técnica — VIGÍA

Registro detallado de todo lo realizado sobre el proyecto VIGÍA desde que se clonó el repositorio original del equipo (`pjcordova/proyecto-vigia`) hasta el estado actual. Su propósito es servir de material de análisis para la sustentación: qué se hizo, por qué, con qué tecnología, y cómo se verificó que funciona.

> Para el contexto de negocio (problema, objetivos, requerimientos) ver el documento APF1 del curso. Este documento cubre exclusivamente el trabajo de ingeniería de software.

---

## 1. Punto de partida: qué había cuando se clonó el repositorio

El repositorio original (commit `9db7eb0`, "Re-sincronización de despliegue para VIGIA") contenía una aplicación funcional pero con las características típicas de un proyecto de curso hecho contra el tiempo:

| Aspecto | Estado original |
| --- | --- |
| **Estructura** | Todo en `src/pages/*.jsx` (Login, Dashboard, Admin, CallCenter, Ejecutivo, KPIStudents, Section) sin separación por dominio |
| **Navegación** | Un `switch` sobre un campo `currentView` del estado global — no había URLs reales |
| **Roles** | No existían. Cualquier usuario logueado veía los 4 módulos con solo pulsar un botón |
| **Datos** | Estudiantes generados con `Math.random()` en el navegador en cada carga — nunca los mismos dos veces |
| **Calidad de código** | Sin ESLint, sin Prettier, sin ningún test |
| **CI/CD** | Un workflow de GitHub Actions que compilaba y desplegaba directo a Vercel, sin lint, sin tests, sin auditoría |
| **Documentación** | Ninguna (no había `README.md`) |
| **Credenciales** | Sueltas en archivos `.txt` en el escritorio del usuario, incluida la *service role key* de Supabase (acceso total a la base de datos) |
| **Colores/UI** | Gradientes de colores dispares sin sistema (violeta, cian, ámbar, esmeralda, rojo mezclados sin criterio) |

Un dato relevante encontrado en la auditoría inicial: el documento académico del curso (APF1) describía un pipeline de CI para **Next.js 14**, pero el proyecto real está construido en **Vite**. Esa discontinuidad entre lo documentado y lo implementado fue el disparador de todo el trabajo posterior.

---

## 2. Stack tecnológico

| Capa | Tecnología | Rol en el proyecto |
| --- | --- | --- |
| Lenguaje | JavaScript (ES2022+), JSX | Todo el frontend; sin TypeScript |
| Framework UI | React 19 | Componentes funcionales + Hooks (sin clases) |
| Bundler/Dev server | Vite 8 | Build, HMR, code-splitting |
| Enrutamiento | React Router 7 | Rutas reales, guards de autenticación y de rol |
| Estilos | Tailwind CSS 4 | Utility classes + *design tokens* vía `@theme` |
| Backend/BD | Supabase (PostgreSQL + Auth) | Autenticación, tabla de estudiantes, perfiles, políticas de seguridad (RLS) |
| IA generativa | Google Gemini 2.5 Flash | Generación de diagnósticos y correos de intervención |
| Gráficos | Recharts | Paneles Ejecutivo, Reportes, Indicadores |
| Exportación | ExcelJS + file-saver | Exportar reportes desde Call Center |
| Tests | Vitest + Testing Library + jsdom | Unitarios y de render de componentes |
| Lint/formato | ESLint 9 + Prettier 3 | Calidad y consistencia de código |
| CI/CD | GitHub Actions | 5 stages + deploy condicional |
| Hosting | Vercel | Despliegue continuo del frontend |
| Control de versiones | Git + GitHub (`DSRVIN/proyecto-vigia`) | — |

---

## 3. Bloques de trabajo realizados

### Bloque 1 — Alinear el proyecto con el documento académico (calidad, tests, CI/CD)

**Problema detectado:** el documento APF1 prometía un pipeline de 5 stages (lint → tests → build → auditoría → deploy) con Jest, ESLint y Prettier, pero nada de eso existía en el repositorio. El pipeline real solo compilaba y desplegaba, sin ninguna validación previa.

**Qué se hizo:**

- Se instalaron y configuraron **ESLint 9** (`eslint.config.js`, con el plugin `react-hooks` para detectar violaciones de las reglas de Hooks) y **Prettier 3** (`.prettierrc.json`, `.prettierignore`).
- Se instaló **Vitest** (no Jest, porque Vitest es el estándar para proyectos Vite — comparte el mismo motor de transformación y es significativamente más rápido; la API es compatible con Jest así que no hay curva de aprendizaje).
- Se creó `src/lib/clasificarRiesgo.js`: la función de clasificación de riesgo que el documento describe en la sección 3.4.1 (reglas de inasistencia > 30%, umbral de logins semanales, participación en foros) **no existía en el código**. Se implementó desde cero.
- Se escribieron los primeros tests unitarios (`tests/riesgo.test.js`, `tests/metrics.test.js`) cubriendo tanto esa función nueva como la lógica de negocio real que ya usaba el dashboard (`calcRiesgo`, `calcPromedio`, `notaVisual`, `calcNotaNecesaria` en `src/services/metrics.service.js`).
- Se reescribió `.github/workflows/ci-cd.yml` con los 5 stages reales:
  1. Setup + Lint + Format (ESLint, Prettier)
  2. Unit Tests + Coverage (Vitest, con reporte subido como artefacto)
  3. Build de Vite + verificación de tamaño de bundle
  4. Auditoría de seguridad (`npm audit --audit-level=high`, bloquea si hay vulnerabilidades críticas)
  5. Deploy a Vercel (solo en push a `main`, solo si los 4 stages anteriores pasan)
- Se corrigieron bugs reales encontrados durante este trabajo:
  - 7 llamadas a `useState` dentro de un `if` en `StudentModal.jsx` — una violación directa de las Reglas de los Hooks de React que podía crashear el modal en ciertos casos.
  - El objeto `actions` del contexto global se recreaba en cada render (sin `useMemo`), causando renders innecesarios en cascada.
  - Una vulnerabilidad *high* en Vite corregida con `npm audit fix`.
  - `ExcelJS` (~930 KB) se cargaba en el bundle inicial aunque solo se usa al hacer clic en "Exportar"; se convirtió a `import()` dinámico.
- Se creó el primer `README.md` del proyecto (setup, scripts, arquitectura, CI/CD).
- Se creó `.env.example` como plantilla, y se corrigió `.gitignore` para no exponer `.env` real ni subir la carpeta `coverage/`.

**Por qué funciona / cómo se validó:** cada uno de estos pasos se verificó ejecutando el comando real (`npm run lint`, `npm test`, `npm run build`) antes de dar el paso por bueno, y el pipeline completo se corrió en GitHub Actions (no solo localmente) hasta verlo en verde.

---

### Bloque 2 — Publicación en GitHub y despliegue en Vercel

- Se creó el repositorio `DSRVIN/proyecto-vigia` (privado) y se configuró el remoto original como `upstream` para no perder la trazabilidad con el repositorio del equipo.
- Se detectó y corrigió un bug de configuración real: el `vercel.json` heredado traía `"deploymentEnabled": false`, lo que **bloqueaba silenciosamente todos los despliegues automáticos** — la causa de que producción quedara "congelada" en una versión antigua durante varias iteraciones sin que hubiera ningún error visible. Se reemplazó por la configuración de *rewrites* necesaria para que las rutas de una SPA (`/login`, `/docente`, etc.) no devuelvan 404 al recargar.
- Se verificó el despliegue real inspeccionando el JavaScript compilado servido en producción (para confirmar, por ejemplo, que la URL de Supabase embebida era la del proyecto correcto y no la del equipo original).

---

### Bloque 3 — Control de acceso por rol (RBAC) + enrutamiento real

**Problema detectado:** no había ninguna diferenciación de permisos. El campo `currentView` del estado global decidía qué componente mostrar, pero cualquier usuario podía cambiarlo con un clic — no había ninguna restricción real, ni en el frontend ni en el backend.

**Qué se hizo:**

- Se agregó una columna `role` a la tabla `profiles` de Supabase (migración `002_roles.sql`), con 3 valores posibles: `DOCENTE`, `CALLCENTER`, `ADMIN`.
- Se instaló **React Router 7** y se reescribió toda la navegación como rutas reales (`/docente`, `/docente/curso/:cursoId`, `/callcenter`, `/admin`, `/admin/ejecutivo`, etc.), con *code-splitting* por módulo (`React.lazy`).
- Se crearon dos componentes *guard*:
  - `RequireAuth` — bloquea el acceso a cualquier ruta si no hay sesión iniciada.
  - `RequireRole` — restringe un grupo de rutas a los roles permitidos; si el rol no coincide, redirige silenciosamente al módulo de inicio de ese usuario (nunca a una pantalla de error).
- Se documentó explícitamente que **esta capa de guards es solo experiencia de usuario**: la seguridad real se implementó después con políticas RLS de Supabase (Bloque 5), porque un guard de frontend no impide que alguien consulte la API directamente con la clave pública.
- Se reestructuró todo `src/pages/*` en una arquitectura **por features** (patrón usado en proyectos React de escala media/grande):

  ```
  src/
  ├── app/            → App.jsx, router.jsx, layouts/AppLayout.jsx
  ├── features/
  │   ├── auth/        → LoginPage, useAuth, roles.js, ProtectedRoute
  │   ├── docente/      → páginas del rol docente
  │   ├── callcenter/   → páginas del rol call center
  │   ├── admin/        → páginas del rol admin
  │   └── shared/       → páginas/lógica compartida entre roles
  ├── components/       → UI reutilizable (Header, Sidebar, ui/)
  ├── context/          → estado global (AppContext)
  ├── data/, services/, lib/  → datos, lógica de negocio
  ```

  Los movimientos de archivo se hicieron con `git mv` para preservar el historial de cada archivo en `git blame`/`git log`.

**Por qué funciona:** el router de React Router evalúa los guards en cada navegación; si un docente edita la URL a mano para ir a `/admin`, el `RequireRole` lo intercepta antes de renderizar la página y lo redirige. Se verificó manualmente navegando a rutas protegidas sin el rol correspondiente y confirmando la redirección, y se escribieron tests unitarios de la función `canAccess()` que decide la matriz de permisos.

---

### Bloque 4 — Rediseño visual (sistema de diseño)

**Problema detectado:** colores decorativos sin criterio (7+ tonos distintos: violeta, púrpura, cian, teal, ámbar, esmeralda, rojo), gradientes usados como adorno en vez de para comunicar información, un breadcrumb duplicando el título de cada página, y ningún sistema de espaciado consistente.

**Qué se hizo:**

- Se definió un sistema de *design tokens* en `src/index.css` usando `@theme` de Tailwind 4: un único tono de marca (`brand-*`, azul institucional) y una escala semafórica reservada **exclusivamente** para comunicar nivel de riesgo (`risk-low/medium/high/critical`). Regla aplicada de forma consistente: si algo es rojo, significa riesgo crítico — nunca decoración.
- Se reemplazaron sistemáticamente los gradientes decorativos por colores planos del sistema en las 6 páginas principales (`EjecutivoDashboard`, `DashboardPage`, `KPIStudentsPage`, `SectionPage`, `StudentModal`, `CallCenterDashboard`).
- Se rediseñó el `Header` como una barra de navegación tipo Microsoft 365/Notion: divisores verticales azules finos entre secciones, avatar circular con iniciales del usuario, sin el breadcrumb redundante.
- Se creó un panel unificado para KPIs (antes 5 tarjetas sueltas con sombras y bordes independientes) siguiendo un patrón de dashboard empresarial: un solo contenedor blanco, divisores internos, mismo ancho por métrica.
- Se agregó una **barra lateral (`Sidebar.jsx`) por rol**, con la misma estructura visual para los 3 roles pero contenido distinto: agrupación por secciones con etiqueta (p. ej. "Académico", "Seguimiento", "Organización" para docente), tarjeta informativa inferior específica de cada rol, e ítem activo resaltado en el color correspondiente (azul para docente/call center, azul oscuro para admin).
- Se integraron 3 ilustraciones (una por rol) en los *heroes* de cada módulo.

**Por qué funciona / cómo se validó:** cada cambio de CSS/Tailwind se verificó con `npm run build` (Tailwind falla en compilación si una clase no existe en el `@theme`) y visualmente en el navegador embebido, revisando consola de errores y comparando capturas antes/después.

---

### Bloque 5 — Completar la navegación: 18 páginas nuevas por rol

**Problema detectado:** tras construir el sidebar por rol, la mayoría de sus ítems eran botones deshabilitados con la etiqueta "Pronto" — buena señal de roadmap, pero insuficiente para una demo completa.

**Qué se hizo:** se construyeron 18 páginas nuevas repartidas en los tres roles (Calificaciones, Asistencias, Reportes, Calendario, Mensajería y Recursos para Docente; Llamadas, Tickets, Conversaciones, Indicadores, Historial y Agenda para Call Center; Usuarios, Docentes, Facultades, Roles y permisos, e Integraciones para Admin), más una página de Configuración compartida por los tres roles.

Decisión de diseño explícita: las páginas que **sí** pueden calcularse desde los datos reales de la cartera de estudiantes (Calificaciones, Asistencias, Reportes, Usuarios, Roles y permisos) muestran datos genuinos. Las que dependen de integraciones aún no conectadas (telefonía, WhatsApp, correo) muestran un aviso explícito de "datos referenciales" en vez de simular que ya funcionan — una elección deliberada para no generar una falsa sensación de completitud ante un evaluador.

Se creó un componente compartido `PageShell.jsx` (hero + panel + aviso) para que las 18 páginas mantuvieran exactamente el mismo lenguaje visual sin duplicar código.

**Por qué funciona / cómo se validó:** se escribió una suite de *smoke tests* (`tests/pages.smoke.test.jsx`) que monta las 18 páginas con estado vacío (el escenario más propenso a errores de "no se puede leer propiedad de `undefined`") usando Testing Library + jsdom, y otra suite (`tests/pages.populated.test.jsx`) que las monta con una cartera de estudiantes simulada y verifica que el contenido real aparece en pantalla (nombres de estudiantes, cifras, encabezados). Total: 59 tests pasando en este punto.

---

### Bloque 6 — Datos reales en Supabase (fase 3, parte A)

**Problema detectado (el más importante de todo el proyecto):** pese a que la interfaz ya se veía completa, los estudiantes seguían siendo generados con `Math.random()` en el navegador — es decir, **nunca eran los mismos** entre una recarga y otra, y no había ninguna tabla de base de datos con la clasificación de riesgo real. Además, se descubrió que **solo el dashboard del docente cargaba estudiantes al estado global**: un usuario Call Center o Admin que entraba directo a su módulo (o recargaba una subpágina) se encontraba con el contexto vacío.

**Qué se hizo:**

- **Migración de esquema** (`003_datos_reales_rls.sql`): se agregaron a la tabla `students` las columnas necesarias para persistir la clasificación real (`notas` en formato `jsonb`, `promedio`, `nota_final`, `riesgo`, `docente_codigo`, datos de pago), y se creó la tabla `predictions_history` para dejar trazabilidad de cada reclasificación (requisito de la sección 6.5 del documento APF1, y base para medir "tiempo de detección" más adelante).
- **Seguridad a nivel de fila (Row Level Security)**: se reemplazó la política permisiva original (cualquier usuario autenticado leía cualquier estudiante) por una política que filtra según el rol del usuario que hace la consulta — un docente solo puede leer los estudiantes de sus propios cursos (comparando `profiles.codigo` con `students.docente_codigo`); call center y admin ven la cartera completa. Esto traslada la seguridad del frontend (fácilmente evadible) a la base de datos (no evadible sin credenciales privilegiadas).
- **Seed determinista** (`scripts/generate-seed.mjs` → `supabase/seed.sql`): un generador en Node.js que produce 522 estudiantes con un generador de números pseudoaleatorios de semilla fija (`mulberry32`), de modo que ejecutarlo dos veces produce exactamente el mismo resultado (a diferencia del `Math.random()` original). El generador **reutiliza las funciones reales de `metrics.service.js`** (`calcPromedio`, `notaVisual`, `calcRiesgo`, `calcNotaNecesaria`) para que el promedio y el nivel de riesgo del seed coincidan exactamente con lo que la propia aplicación calcularía — evitando que el dato sembrado y el dato calculado en pantalla puedan divergir.
- **Capa de datos centralizada** (`useStudentsLoader.js`): un hook que carga la cartera de estudiantes una sola vez, inmediatamente después de autenticar, desde el layout raíz (`AppLayout`) — no desde una página individual. Esto corrige el bug descrito arriba: ahora **cualquier rol, entrando por cualquier ruta**, tiene los datos disponibles. Incluye una función pura `mapDbStudent()` que traduce el formato de fila de Supabase (columnas `snake_case`) al modelo interno de la aplicación (`camelCase`), y un mecanismo de reserva (*fallback*) a datos de demostración si la base de datos aún no está sembrada, para que la aplicación nunca se quede en blanco.
- Se eliminó el `useEffect` de carga de datos que vivía duplicado dentro de `DashboardPage.jsx` (ahí es donde ocurría el bug original).

**Por qué funciona / cómo se validó:**
- La función `mapDbStudent()` se probó de forma aislada (`tests/studentsLoader.test.js`) contra una fila de ejemplo con la forma exacta que devuelve Supabase, verificando que el mapeo de columnas, el parseo del JSON de notas y el enriquecimiento de datos académicos ocurren correctamente.
- Se verificó que el pipeline completo (lint, 64 tests, build) siguiera pasando tras el refactor.
- La verificación *end-to-end* (que un usuario real vea los 522 estudiantes reales en pantalla) queda pendiente de que se ejecuten los scripts SQL en el proyecto de Supabase del usuario — paso que, por política de seguridad, no se automatiza desde este entorno porque requiere las credenciales privilegiadas del propietario del proyecto.

---

### Bloque 7 — Automatización con n8n y cierre del circuito (fase 3, parte B)

**Problema a resolver:** el documento APF1 define ingesta por lotes, procesamiento nocturno y alertas tempranas, pero hasta aquí todos los procesos eran manuales y la campana de notificaciones de la app generaba sus alertas en el navegador (no existían como dato real).

**Qué se hizo:**

- **n8n self-hosted en Docker** (`n8n/docker-compose.yml`): la plataforma de automatización corre en la máquina local con volumen persistente (los flujos y credenciales sobreviven a reinicios y actualizaciones — se validó actualizando de la versión 1.80 a la 2.30 sin pérdida de datos).
- **Tres flujos de automatización** (versionados en `n8n/flows/`, sin ningún secreto — referencian la credencial por nombre):
  1. *Ingesta de notas (CSV)*: formulario web → validación de cada registro (curso existente, notas 0–20, asistencia 0–100, formato del docente) con log de rechazados → upsert en `students` calculando promedio y riesgo con la misma lógica de la app. Implementa la contingencia del Riesgo R1 del APF1.
  2. *Clasificación nocturna* (cron 3:00 am): reclasifica toda la cartera, escribe un registro por estudiante en `predictions_history` (trazabilidad §6.5) y actualiza solo los que cambiaron de nivel.
  3. *Alertas de riesgo crítico* (cada 15 min): detecta críticos sin alerta reciente (anti-duplicados de 24 h) e inserta la alerta en la tabla `alerts` (migración 004) con mensaje explicativo.
- **La service role key encontró su lugar correcto**: vive cifrada en las credenciales de n8n, restringida al dominio del proyecto Supabase (Allowed Domains) — nunca en el frontend ni en el repositorio.
- **Cierre del circuito en la app**: el centro de notificaciones dejó de inventar alertas en el cliente — ahora lee la tabla `alerts` real (con refresco cada 60 s) y permite marcarlas como atendidas (persistido en Supabase). Los contadores de la campana y del sidebar usan las alertas reales, con reserva al modo derivado si la tabla aún no está poblada.
- **Persistencia de sesión**: se corrigió que al recargar la página se perdiera el login — un hook restaura la sesión de Supabase guardada en localStorage antes de que el router decida redirigir (estado `authReady` + loader), y el logout ahora también cierra la sesión de Supabase, no solo el estado local.
- **Página de Métricas del Sistema** (`/admin/metricas`): indicadores calculados sobre las tablas reales — clasificaciones registradas, alertas generadas/atendidas, última corrida del batch y checklist de cumplimiento de los SLA del APF1.

**Por qué funciona / cómo se validó:** los flujos se importaron a n8n por CLI y se ejecutaron contra la base real (el nodo de lectura devolvió los 522 estudiantes; la primera corrida de clasificación pobló `predictions_history`; la ingesta del CSV de ejemplo insertó 4 registros y rechazó 1 inválido con sus errores listados). En la app: lint sin errores, suite de tests completa y build verificados tras cada cambio.

---

## 4. Archivos más importantes del proyecto (mapa de lectura)

| Archivo | Por qué es importante |
| --- | --- |
| `src/app/router.jsx` | Define todas las rutas de la aplicación y qué rol puede acceder a cada una |
| `src/features/auth/roles.js` | La única fuente de verdad sobre qué significa cada rol y a dónde pertenece |
| `src/features/auth/ProtectedRoute.jsx` | Los guards que hacen cumplir el RBAC en el frontend |
| `src/context/AppContext.jsx` | Estado global de la aplicación (reducer + acciones) |
| `src/features/shared/useStudentsLoader.js` | Carga y traduce los datos reales desde Supabase |
| `src/services/metrics.service.js` | La lógica de negocio real: cómo se calcula el promedio, la nota necesaria y el nivel de riesgo |
| `src/lib/clasificarRiesgo.js` | La función de clasificación descrita en el documento APF1 (distinta de `metrics.service.js`, que es la que usa el dashboard) |
| `supabase/migrations/*.sql` | Historia completa de cómo evolucionó el esquema de base de datos, en orden |
| `scripts/generate-seed.mjs` | Cómo se generan los datos de demostración de forma reproducible |
| `.github/workflows/ci-cd.yml` | Qué se valida automáticamente antes de que el código llegue a producción |
| `tests/*.test.js(x)` | Prueba viva de que la lógica de negocio y las páginas hacen lo que deberían |
| `n8n/docker-compose.yml` y `n8n/flows/*.json` | La capa de automatización: cómo corre n8n y qué hace cada flujo |
| `src/features/shared/useAlertsLoader.js` | Cómo la app consume las alertas reales generadas por n8n |
| `src/features/auth/useSessionRestore.js` | Cómo se restaura la sesión al recargar la página |
| `src/features/admin/MetricasPage.jsx` | Las métricas operativas calculadas sobre la trazabilidad real |

---

## 5. Estado actual del proyecto (métricas objetivas)

- **10 commits** desde el clon inicial hasta este punto, cada uno con su propio mensaje descriptivo y verificación de CI en verde.
- **~9,200 líneas de código** en `src/` (JS/JSX).
- **3 flujos de automatización n8n** activos (ingesta, clasificación nocturna, alertas) sobre Docker.
- **64 tests automatizados** (unitarios de lógica de negocio + smoke tests de componentes + tests de integración de datos), corriendo en cada `push` vía GitHub Actions.
- **0 errores de ESLint**, formato 100% consistente con Prettier.
- **3 roles funcionales** con control de acceso verificado tanto en frontend (router) como diseñado para backend (políticas RLS pendientes de aplicar por el usuario).
- **522 estudiantes** de datos de demostración generados de forma determinista y reproducible.
- **Pipeline de CI/CD de 5 stages + deploy condicional**, en verde en cada push a `main`.
- Aplicación desplegada en producción en Vercel, con despliegue automático en cada push.

## 6. Qué queda pendiente (próximos pasos)

1. **Ejecutar en Supabase** los scripts SQL generados (`setup.sql`, `002_roles.sql`, `003_datos_reales_rls.sql`, `seed.sql`) — paso manual que le corresponde al propietario del proyecto de Supabase por motivos de seguridad de credenciales.
2. **Automatización con n8n** (fase 3, parte B): flujo de ingesta de Excel/CSV con validación, clasificación de riesgo por lotes en horario nocturno (con registro en `predictions_history`), y alertas automáticas cuando un estudiante pasa a riesgo alto. Definido para correr *self-hosted* en Docker.
3. Registrar como cambio formal (usando la matriz de control de cambios del documento APF1) la decisión de automatizar notificaciones, dado que el alcance original del MVP excluye explícitamente el envío automático de correos.
