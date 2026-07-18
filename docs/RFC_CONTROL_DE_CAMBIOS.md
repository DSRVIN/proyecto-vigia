# VIGÍA — Registro de control de cambios (RFC)

Cambios de alcance formalizados según la matriz de gestión de cambios del documento APF1 (sección 13). Cada RFC sigue el formato del documento: activo, descripción, criticidad, aprobador y plan de rollback.

---

## RFC-001 — Corrección del stack documentado: Next.js → Vite

| Campo | Detalle |
| --- | --- |
| **ID** | RFC-001 |
| **Activo** | Documentación / Pipeline CI |
| **Criticidad** | Alta |
| **Estado** | Implementado |

**Descripción:** el documento APF1 (secciones 14–16) describía el pipeline de CI para Next.js 14, pero el proyecto está construido sobre Vite + React. Se corrigió el pipeline real (`.github/workflows/ci-cd.yml`) para el stack verdadero: build de Vite, verificación de tamaño de carga inicial, y variables `VITE_*` en lugar de `NEXT_PUBLIC_*`.

**Justificación:** un pipeline que documenta un framework distinto al implementado falla en su primera ejecución y resta credibilidad técnica al proyecto. La coherencia documento-código es evaluable en la sustentación.

**Plan de rollback:** reversión del commit del workflow en GitHub (git revert); el historial completo del pipeline se conserva en Actions.

**Aprobador sugerido según matriz APF1:** CCB + Sponsor (equivalente a CHG-01, criticidad alta).

---

## RFC-002 — Automatización de notificaciones (n8n) más allá del MVP

| Campo | Detalle |
| --- | --- |
| **ID** | RFC-002 |
| **Activo** | Aplicación / Infraestructura |
| **Criticidad** | Alta |
| **Estado** | Implementado parcialmente (registro de alertas); envío externo pendiente |

**Descripción:** el alcance del MVP (APF1 §1.8, Restricción de Acción Automática) establece que "el sistema no ejecutará acciones automatizadas directas (como envío de correos)". La fase 3B introduce automatización con n8n que **genera y registra alertas** en la base de datos (tabla `alerts`) y las presenta en el centro de notificaciones de la app. El **envío externo** (correo/WhatsApp al tutor) queda expresamente **deshabilitado** — existe como nodo marcado "TODO" en el flujo de alertas.

**Justificación:** el propio documento anticipa esta evolución ("futuras versiones incorporando... notificaciones en tiempo real", §5.3). Registrar la alerta no ejecuta una acción hacia el estudiante: la decisión de intervenir sigue siendo 100% del tutor, como exige la restricción. El envío externo se activará solo con la aprobación de este RFC en su segunda fase.

**Plan de rollback:** desactivar (Unpublish) los flujos en n8n; la aplicación vuelve automáticamente al modo de alertas derivadas del estado académico (el fallback está implementado). Los datos de `alerts` y `predictions_history` se conservan como histórico.

**Aprobador sugerido según matriz APF1:** CCB + Sponsor.

---

## RFC-003 — Modelo de 3 roles (DOCENTE / CALLCENTER / ADMIN)

| Campo | Detalle |
| --- | --- |
| **ID** | RFC-003 |
| **Activo** | Aplicación / Base de datos |
| **Criticidad** | Media |
| **Estado** | Implementado |

**Descripción:** la matriz de accesos original del APF1 (sección 12) contempla los roles Tutor/Docente, Coordinador y Administrador TI. La implementación consolidó el modelo en tres roles operativos — `DOCENTE`, `CALLCENTER` (Consejería/Retención) y `ADMIN` — aplicados en dos capas: guards de rutas en el frontend y políticas Row Level Security en la base de datos.

**Justificación:** el rol Call Center materializa al actor "Consejería Estudiantil UTP" identificado en los usuarios y necesidades (§2.2), con su módulo de retención, cola de llamadas y seguimiento de compromisos de pago.

**Plan de rollback:** la columna `profiles.role` tiene default `DOCENTE`; eliminar los guards devuelve el comportamiento anterior sin pérdida de datos.

**Aprobador sugerido según matriz APF1:** Project Manager.
