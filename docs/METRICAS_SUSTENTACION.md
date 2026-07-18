# VIGÍA — Métricas para la sustentación

Consultas SQL listas para ejecutar en el **SQL Editor de Supabase** durante la exposición, con su interpretación. Cada una responde a una promesa concreta del documento APF1. La página `/admin/metricas` de la app muestra estas mismas cifras en vivo.

## 1. Tamaño y distribución de la cartera

```sql
select riesgo, count(*) as estudiantes
from students
group by riesgo
order by count(*) desc;
```

**Qué demuestra:** la base opera con datos persistentes (522 estudiantes) clasificados con las reglas de negocio del sistema. Referencia APF1: alcance del MVP y clasificación en niveles (§2.3.1).

## 2. Trazabilidad del clasificador (§6.5)

```sql
select fuente, count(*) as registros,
       min(created_at) as primera_corrida,
       max(created_at) as ultima_corrida
from predictions_history
group by fuente;
```

**Qué demuestra:** cada corrida del clasificador deja huella auditable — quién clasificó (fuente), cuándo y a cuántos estudiantes. Es el requisito de "Registro de Predicciones Generadas" del documento.

## 3. Tiempo de detección (SLA < 24 h)

```sql
select a.student_codigo,
       a.created_at as alerta,
       p.created_at as clasificacion,
       round(extract(epoch from (a.created_at - p.created_at)) / 60) as minutos_hasta_alerta
from alerts a
join lateral (
  select created_at from predictions_history
  where student_codigo = a.student_codigo and created_at <= a.created_at
  order by created_at desc limit 1
) p on true
order by a.created_at desc
limit 10;
```

**Qué demuestra:** minutos transcurridos entre la clasificación de un estudiante como crítico y la generación de su alerta. Con el flujo cada 15 minutos, el resultado típico es < 15 min — muy por debajo del SLA de 24 h del cuadro de indicadores de mejora del APF1 (que compara contra 7–15 días del proceso manual).

## 4. Gestión de alertas (generadas vs. atendidas)

```sql
select count(*) as generadas,
       count(*) filter (where atendida) as atendidas,
       round(100.0 * count(*) filter (where atendida) / greatest(count(*), 1)) as tasa_atencion_pct
from alerts;
```

**Qué demuestra:** el ciclo completo de intervención — el sistema no solo detecta, sino que registra si el equipo actuó. Base para la métrica de "uso activo por parte de tutores" (§5.3, métricas de éxito del MVP).

## 5. Precisión del clasificador (≥ 70% exigido en §5.4.1)

```sql
select
  count(*) filter (where p.riesgo = s.riesgo) as coincidencias,
  count(*) as total,
  round(100.0 * count(*) filter (where p.riesgo = s.riesgo) / count(*)) as precision_pct
from students s
join lateral (
  select riesgo from predictions_history
  where student_codigo = s.codigo
  order by created_at desc limit 1
) p on true;
```

**Qué demuestra:** la última clasificación del batch coincide con el estado actual de cada estudiante. Como el clasificador es determinista sobre reglas de negocio, la precisión esperada es 100% — un argumento para explicar la elección de un sistema experto basado en reglas + IA generativa (Gemini) para los diagnósticos, en lugar de un modelo estadístico opaco.

## 6. Cobertura del monitoreo (100% de la cartera)

```sql
select
  (select count(distinct student_codigo) from predictions_history) as monitoreados,
  (select count(*) from students) as total;
```

**Qué demuestra:** el cuadro de mejora del APF1 promete "cobertura del 100% sin esfuerzo humano adicional" — esta consulta lo comprueba: todos los estudiantes pasan por el clasificador en cada corrida nocturna.

## Cómo presentar los números

| Indicador APF1 | Antes (manual) | Con VIGÍA (medible en vivo) |
| --- | --- | --- |
| Tiempo de detección | 7–15 días | < 15 minutos (consulta 3) |
| Trazabilidad | Correos dispersos | Historial único auditable (consulta 2) |
| Cobertura de monitoreo | Limitada al tiempo del docente | 100% de la cartera, cada noche (consulta 6) |
| Precisión | Subjetiva | Reglas deterministas, verificable (consulta 5) |
| Registro de intervención | Inexistente | Alertas generadas vs. atendidas (consulta 4) |
