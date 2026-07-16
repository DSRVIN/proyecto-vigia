# VIGÍA — Sistema de Alerta Temprana Académica

Plataforma web para la identificación temprana de estudiantes en riesgo de deserción académica (UTP). Clasifica a los estudiantes por nivel de riesgo a partir de notas, asistencia y actividad en la plataforma, y apoya la intervención de tutores con diagnósticos y correos generados por IA.

## Stack tecnológico

| Capa          | Tecnología                                     |
| ------------- | ---------------------------------------------- |
| Frontend      | React 19 + Vite 8, Tailwind CSS 4              |
| Backend       | Supabase (PostgreSQL, Auth)                    |
| IA            | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Gráficos      | Recharts                                       |
| Exportación   | ExcelJS + file-saver                           |
| Despliegue    | Vercel                                         |
| CI/CD         | GitHub Actions (5 stages + deploy)             |

## Requisitos

- Node.js 20 LTS
- Cuenta de Supabase y API key de Google Gemini

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar con credenciales reales
npm run dev            # http://localhost:5173
```

## Scripts disponibles

| Script                  | Descripción                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo con HMR                     |
| `npm run build`         | Build de producción (`dist/`)                      |
| `npm run preview`       | Sirve el build de producción localmente            |
| `npm run lint`          | ESLint sobre todo el proyecto                      |
| `npm run format`        | Aplica formato Prettier                            |
| `npm run format:check`  | Verifica el formato sin modificar archivos         |
| `npm test`              | Tests unitarios (Vitest)                           |
| `npm run test:watch`    | Tests en modo watch                                |
| `npm run test:coverage` | Tests con reporte de cobertura (umbral 60%)        |

## Roles y control de acceso (RBAC)

El rol de cada usuario vive en la columna `role` de la tabla `profiles` (migración [002_roles.sql](supabase/migrations/002_roles.sql)) y define su módulo:

| Rol          | Módulo                         | Usuario demo |
| ------------ | ------------------------------ | ------------ |
| `DOCENTE`    | `/docente` (cursos, KPIs)      | `C13005` / `C13007` |
| `CALLCENTER` | `/callcenter` (retención)      | `C20001`     |
| `ADMIN`      | Todos + `/admin` y `/admin/ejecutivo` | `C30001` |

Las rutas están protegidas con guards de React Router (`RequireAuth`, `RequireRole`); un rol sin permiso es redirigido a su módulo de inicio. La capa de seguridad real son las políticas RLS de Supabase.

## Estructura del proyecto

```
src/
├── app/            # App, router (rutas + guards por rol) y layout general
├── features/
│   ├── auth/       # LoginPage, useAuth, roles.js, ProtectedRoute
│   ├── docente/    # Dashboard, Sección, KPIs, Calificaciones, Asistencias,
│   │               #   Reportes, Calendario, Mensajería, Recursos
│   ├── callcenter/ # Retención, Llamadas, Tickets, Conversaciones,
│   │               #   Indicadores, Historial, Agenda
│   ├── admin/      # Panel, Ejecutivo, Usuarios, Docentes, Facultades,
│   │               #   Roles y permisos, Integraciones
│   ├── shared/     # ConfiguracionPage (reutilizada por los 3 roles)
│   └── students/   # StudentModal (compartido entre módulos)
├── components/     # UI compartida (Header, Sidebar por rol, ui)
├── context/        # Estado global de datos (AppContext, useReducer)
├── data/           # Dataset de demostración
├── lib/            # clasificarRiesgo — reglas de negocio del documento APF1
├── services/       # metrics (cálculo de riesgo), ia (Gemini), messaging
└── supabaseClient.js
tests/              # Tests unitarios (riesgo, métricas, roles)
```

## Sistema de diseño

Definido como design tokens en [src/index.css](src/index.css) (`@theme` de Tailwind 4):

- **Un solo tono de marca** (`brand-*`, azul institucional) para datos, acciones y gráficos. Las series de los gráficos se diferencian por intensidad del mismo tono, no por colores distintos.
- **Neutros** (`slate-*`) para toda la estructura.
- **El semáforo (`risk-low/medium/high/critical`) se reserva exclusivamente para comunicar nivel de riesgo** — si algo es rojo, es riesgo crítico; el color codifica significado, nunca decoración. El nivel siempre va acompañado de etiqueta e ícono (accesible para daltonismo).
- El rojo UTP (`utp-red`) solo aparece en la marca del logo y el botón institucional del login.

## Lógica de clasificación de riesgo

- `src/services/metrics.service.js` → `calcRiesgo(promedio, asistencia, actividadDias)`: clasificación operativa del dashboard (`BAJO` / `MEDIO` / `ALTO` / `CRITICO`).
- `src/lib/clasificarRiesgo.js` → `clasificarRiesgo({ inasistencia, loginsSemanales, participacionForos })`: reglas de negocio del documento APF1, sección 3.4.1.

## CI/CD

El pipeline (`.github/workflows/ci-cd.yml`) se ejecuta en cada PR y push a `main`/`develop`:

1. **Stage 1-2** — Setup, ESLint y Prettier check
2. **Stage 3** — Tests unitarios con cobertura (reporte como artefacto)
3. **Stage 4** — Build de Vite + verificación de tamaño de bundle (≤ 2 MB)
4. **Stage 5** — `npm audit` (bloquea vulnerabilidades high/critical)
5. **CD** — Deploy a Vercel (solo en push a `main`, tras pasar todos los stages)

Secrets requeridos en GitHub (Settings → Secrets and variables → Actions): `SUPABASE_URL_TEST`, `SUPABASE_ANON_KEY_TEST`, `GEMINI_API_KEY_TEST`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Base de datos (Supabase)

Los estudiantes viven en la tabla `students` de Supabase y se cargan una sola vez
tras la autenticación (`src/features/shared/useStudentsLoader.js`), para todos los
roles y cualquier ruta de entrada. Las políticas RLS filtran por rol, así que la
misma consulta devuelve solo lo que cada usuario puede ver. Si la base aún no está
sembrada, la app usa una cartera de demostración para seguir siendo navegable.

Orden de ejecución en **SQL Editor** (una vez por proyecto):

1. [supabase/setup.sql](supabase/setup.sql) — tablas `profiles` / `students` / `grades`.
2. [supabase/migrations/002_roles.sql](supabase/migrations/002_roles.sql) — columna `role` y usuarios demo.
3. [supabase/migrations/003_datos_reales_rls.sql](supabase/migrations/003_datos_reales_rls.sql) — clasificación en `students`, `predictions_history` y RLS por rol.
4. [supabase/seed.sql](supabase/seed.sql) — 522 estudiantes de demostración.

El seed se regenera de forma determinista con `npm run db:seed`
([scripts/generate-seed.mjs](scripts/generate-seed.mjs)), reutilizando las funciones
reales de `metrics.service` para que el promedio y el riesgo coincidan con la app.
Las escrituras masivas (seed, ingesta, clasificación por lotes) usan la **service
role key**, reservada al backend/n8n; nunca al frontend.

## Seguridad

- Las credenciales viven en variables de entorno (`.env`, ignorado por git).
- Solo la **anon key** de Supabase se usa en el frontend; la **service role key** queda reservada para servicios de backend (p. ej. flujos de n8n).
- Acceso demo: usuarios `C13005` / `C13007`, contraseña `Utp2026#`.
