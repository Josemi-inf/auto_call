-- ========================================
-- CONSULTAS ANALÍTICAS PARA EL SISTEMA DE SCORING
-- Fecha: 2025-11-14
-- Descripción: Queries útiles para monitorear y analizar el sistema de scoring
-- ========================================

-- ========================================
-- 1. DASHBOARD GENERAL DE SCORING
-- ========================================

-- Resumen ejecutivo de todos los scores
SELECT
  COUNT(*) as total_leads_activos,
  COUNT(CASE WHEN lead_score IS NOT NULL THEN 1 END) as con_lead_score,
  COUNT(CASE WHEN call_total_score IS NOT NULL THEN 1 END) as con_call_score,
  COUNT(CASE WHEN lqi IS NOT NULL THEN 1 END) as con_lqi,
  ROUND(AVG(lead_score), 2) as avg_lead_score,
  ROUND(AVG(call_total_score), 2) as avg_call_score,
  ROUND(AVG(lqi), 2) as avg_lqi,
  COUNT(CASE WHEN categoria_lqi = 'premium' THEN 1 END) as leads_premium,
  COUNT(CASE WHEN categoria_lqi = 'alto' THEN 1 END) as leads_alto,
  COUNT(CASE WHEN categoria_lqi = 'medio' THEN 1 END) as leads_medio,
  COUNT(CASE WHEN categoria_lqi = 'bajo' THEN 1 END) as leads_bajo
FROM leads
WHERE activo = true;

-- ========================================
-- 2. ANÁLISIS DE LEADS PREMIUM
-- ========================================

-- Top 50 Leads Premium ordenados por LQI
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.email,
  l.lqi,
  l.categoria_lqi,
  l.lead_score,
  l.call_total_score,
  l.estado_actual,
  COUNT(DISTINCT cl.call_id) as total_llamadas,
  COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END) as llamadas_exitosas,
  MAX(cl.created_at) as ultima_llamada,
  lcm.comercial_id,
  lcm.prioridad,
  l.created_at as fecha_creacion,
  EXTRACT(DAY FROM NOW() - l.created_at) as dias_desde_creacion
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
WHERE l.activo = true
  AND l.categoria_lqi IN ('premium', 'alto')
GROUP BY l.lead_id, l.nombre, l.apellidos, l.telefono, l.email, l.lqi,
         l.categoria_lqi, l.lead_score, l.call_total_score, l.estado_actual,
         lcm.comercial_id, lcm.prioridad, l.created_at
ORDER BY l.lqi DESC
LIMIT 50;

-- ========================================
-- 3. LEADS QUE NECESITAN ATENCIÓN URGENTE
-- ========================================

-- Leads premium sin comercial asignado
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lqi,
  l.categoria_lqi,
  l.estado_actual,
  l.created_at,
  EXTRACT(HOUR FROM NOW() - l.created_at) as horas_sin_asignar
FROM leads l
LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
WHERE l.activo = true
  AND l.categoria_lqi = 'premium'
  AND (lcm.comercial_id IS NULL OR lcm.comercial_id = '')
ORDER BY l.lqi DESC, l.created_at ASC;

-- Leads de alta calidad sin contacto reciente (>48h)
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lqi,
  l.categoria_lqi,
  MAX(cl.created_at) as ultima_llamada,
  EXTRACT(DAY FROM NOW() - MAX(cl.created_at)) as dias_sin_contacto,
  l.estado_actual
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.categoria_lqi IN ('premium', 'alto')
GROUP BY l.lead_id, l.nombre, l.apellidos, l.telefono, l.lqi, l.categoria_lqi, l.estado_actual
HAVING MAX(cl.created_at) < NOW() - INTERVAL '48 hours'
   OR MAX(cl.created_at) IS NULL
ORDER BY l.lqi DESC, dias_sin_contacto DESC;

-- ========================================
-- 4. ANÁLISIS DE EFECTIVIDAD DEL SCORING
-- ========================================

-- Tasa de conversión por categoría LQI
SELECT
  l.categoria_lqi,
  COUNT(DISTINCT l.lead_id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.estado_actual = 'convertido' THEN l.lead_id END) as convertidos,
  ROUND(
    COUNT(DISTINCT CASE WHEN l.estado_actual = 'convertido' THEN l.lead_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT l.lead_id), 0) * 100,
    2
  ) as tasa_conversion,
  ROUND(AVG(l.lqi), 2) as lqi_promedio,
  ROUND(AVG(COUNT(DISTINCT cl.call_id)), 2) as llamadas_promedio
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.categoria_lqi IS NOT NULL
GROUP BY l.categoria_lqi
ORDER BY
  CASE l.categoria_lqi
    WHEN 'premium' THEN 1
    WHEN 'alto' THEN 2
    WHEN 'medio' THEN 3
    WHEN 'bajo' THEN 4
    WHEN 'muy_bajo' THEN 5
  END;

-- Tasa de éxito en llamadas por categoría LQI
SELECT
  l.categoria_lqi,
  COUNT(DISTINCT cl.call_id) as total_llamadas,
  COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END) as llamadas_exitosas,
  ROUND(
    COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT cl.call_id), 0) * 100,
    2
  ) as tasa_exito_llamadas,
  ROUND(AVG(cl.duracion_ms / 1000.0 / 60.0), 2) as duracion_promedio_minutos
FROM leads l
INNER JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.categoria_lqi IS NOT NULL
GROUP BY l.categoria_lqi
ORDER BY
  CASE l.categoria_lqi
    WHEN 'premium' THEN 1
    WHEN 'alto' THEN 2
    WHEN 'medio' THEN 3
    WHEN 'bajo' THEN 4
    WHEN 'muy_bajo' THEN 5
  END;

-- ========================================
-- 5. EVOLUCIÓN TEMPORAL DEL SCORING
-- ========================================

-- Distribución de LQI por mes de creación
SELECT
  DATE_TRUNC('month', l.created_at) as mes,
  COUNT(*) as total_leads,
  ROUND(AVG(l.lqi), 2) as lqi_promedio,
  COUNT(CASE WHEN l.categoria_lqi = 'premium' THEN 1 END) as premium,
  COUNT(CASE WHEN l.categoria_lqi = 'alto' THEN 1 END) as alto,
  COUNT(CASE WHEN l.categoria_lqi = 'medio' THEN 1 END) as medio,
  COUNT(CASE WHEN l.categoria_lqi = 'bajo' THEN 1 END) as bajo
FROM leads l
WHERE l.activo = true
  AND l.created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', l.created_at)
ORDER BY mes DESC;

-- Evolución diaria del scoring (últimos 30 días)
SELECT
  DATE(l.call_score_updated_at) as fecha,
  COUNT(*) as scores_calculados,
  ROUND(AVG(l.lqi), 2) as lqi_promedio,
  ROUND(AVG(l.lead_score), 2) as lead_score_promedio,
  ROUND(AVG(l.call_total_score), 2) as call_score_promedio,
  COUNT(CASE WHEN l.categoria_lqi = 'premium' THEN 1 END) as premium_detectados
FROM leads l
WHERE l.activo = true
  AND l.call_score_updated_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(l.call_score_updated_at)
ORDER BY fecha DESC;

-- ========================================
-- 6. ANÁLISIS DE COMPORTAMIENTO DE LLAMADAS
-- ========================================

-- Análisis de call_score_breakdown
SELECT
  l.categoria_lqi,
  COUNT(*) as total_leads,
  ROUND(AVG((l.call_score_breakdown->>'response')::INTEGER), 2) as avg_response_score,
  ROUND(AVG((l.call_score_breakdown->>'duration')::INTEGER), 2) as avg_duration_score,
  ROUND(AVG((l.call_score_breakdown->>'interaction')::INTEGER), 2) as avg_interaction_score,
  ROUND(AVG((l.call_score_breakdown->>'behavior')::INTEGER), 2) as avg_behavior_score
FROM leads l
WHERE l.activo = true
  AND l.call_score_breakdown IS NOT NULL
  AND l.categoria_lqi IS NOT NULL
GROUP BY l.categoria_lqi
ORDER BY
  CASE l.categoria_lqi
    WHEN 'premium' THEN 1
    WHEN 'alto' THEN 2
    WHEN 'medio' THEN 3
    WHEN 'bajo' THEN 4
    WHEN 'muy_bajo' THEN 5
  END;

-- Resultados de llamadas por categoría LQI
SELECT
  l.categoria_lqi,
  cl.resultado,
  COUNT(*) as total_llamadas,
  ROUND(
    COUNT(*)::NUMERIC /
    SUM(COUNT(*)) OVER (PARTITION BY l.categoria_lqi) * 100,
    2
  ) as porcentaje
FROM leads l
INNER JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.categoria_lqi IS NOT NULL
GROUP BY l.categoria_lqi, cl.resultado
ORDER BY l.categoria_lqi, total_llamadas DESC;

-- ========================================
-- 7. ANÁLISIS DE LQI BREAKDOWN
-- ========================================

-- Desglose promedio del LQI por categoría
SELECT
  l.categoria_lqi,
  COUNT(*) as total_leads,
  ROUND(AVG((l.lqi_breakdown->>'lead_score_component')::INTEGER), 2) as avg_lead_component,
  ROUND(AVG((l.lqi_breakdown->>'call_score_component')::INTEGER), 2) as avg_call_component,
  ROUND(AVG((l.lqi_breakdown->>'intentos_bonus')::INTEGER), 2) as avg_intentos_bonus,
  ROUND(AVG((l.lqi_breakdown->>'tasa_exito_component')::INTEGER), 2) as avg_tasa_exito_component,
  ROUND(AVG((l.lqi_breakdown->>'actividad_bonus')::INTEGER), 2) as avg_actividad_bonus,
  ROUND(AVG((l.lqi_breakdown->>'engagement_bonus')::INTEGER), 2) as avg_engagement_bonus
FROM leads l
WHERE l.activo = true
  AND l.lqi_breakdown IS NOT NULL
  AND l.categoria_lqi IS NOT NULL
GROUP BY l.categoria_lqi
ORDER BY
  CASE l.categoria_lqi
    WHEN 'premium' THEN 1
    WHEN 'alto' THEN 2
    WHEN 'medio' THEN 3
    WHEN 'bajo' THEN 4
    WHEN 'muy_bajo' THEN 5
  END;

-- ========================================
-- 8. LEADS CON POTENCIAL DE MEJORA
-- ========================================

-- Leads con alto lead_score pero bajo call_score
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lead_score,
  l.call_total_score,
  l.lqi,
  l.categoria_lqi,
  COUNT(DISTINCT cl.call_id) as intentos_llamada,
  COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END) as llamadas_exitosas,
  'Buen perfil pero difícil de contactar' as diagnostico,
  'Probar WhatsApp o cambiar horario' as recomendacion
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.lead_score >= 70
  AND (l.call_total_score < 30 OR l.call_total_score IS NULL)
GROUP BY l.lead_id, l.nombre, l.apellidos, l.telefono, l.lead_score,
         l.call_total_score, l.lqi, l.categoria_lqi
ORDER BY l.lead_score DESC
LIMIT 50;

-- Leads con bajo lead_score pero alto call_score
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lead_score,
  l.call_total_score,
  l.lqi,
  l.categoria_lqi,
  'Lead receptivo pero información incompleta' as diagnostico,
  'Completar datos personales durante llamada' as recomendacion
FROM leads l
WHERE l.activo = true
  AND (l.lead_score < 40 OR l.lead_score IS NULL)
  AND l.call_total_score >= 70
ORDER BY l.call_total_score DESC
LIMIT 50;

-- ========================================
-- 9. ANÁLISIS POR FUENTE DE LEADS
-- ========================================

-- Calidad promedio de leads por fuente
SELECT
  l.fuente,
  COUNT(*) as total_leads,
  ROUND(AVG(l.lqi), 2) as lqi_promedio,
  ROUND(AVG(l.lead_score), 2) as lead_score_promedio,
  COUNT(CASE WHEN l.categoria_lqi IN ('premium', 'alto') THEN 1 END) as leads_alta_calidad,
  ROUND(
    COUNT(CASE WHEN l.categoria_lqi IN ('premium', 'alto') THEN 1 END)::NUMERIC /
    COUNT(*) * 100,
    2
  ) as porcentaje_alta_calidad
FROM leads l
WHERE l.activo = true
  AND l.lqi IS NOT NULL
GROUP BY l.fuente
ORDER BY lqi_promedio DESC;

-- ========================================
-- 10. ALERTAS Y ANOMALÍAS
-- ========================================

-- Leads con scoring inconsistente (revisar)
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lead_score,
  l.calidad_lead,
  l.call_total_score,
  l.call_score_category,
  l.lqi,
  l.categoria_lqi,
  'Inconsistencia detectada' as alerta
FROM leads l
WHERE l.activo = true
  AND (
    -- lead_score no coincide con calidad_lead
    (l.lead_score >= 80 AND l.calidad_lead != 'muy_caliente') OR
    (l.lead_score >= 60 AND l.lead_score < 80 AND l.calidad_lead != 'caliente') OR
    (l.lead_score >= 40 AND l.lead_score < 60 AND l.calidad_lead != 'tibio') OR
    (l.lead_score < 40 AND l.calidad_lead != 'frio') OR

    -- lqi no coincide con categoria_lqi
    (l.lqi >= 80 AND l.categoria_lqi != 'premium') OR
    (l.lqi >= 65 AND l.lqi < 80 AND l.categoria_lqi != 'alto') OR
    (l.lqi >= 45 AND l.lqi < 65 AND l.categoria_lqi != 'medio') OR
    (l.lqi >= 25 AND l.lqi < 45 AND l.categoria_lqi != 'bajo') OR
    (l.lqi < 25 AND l.categoria_lqi != 'muy_bajo')
  )
ORDER BY l.lqi DESC;

-- Leads con scoring desactualizado (>7 días)
SELECT
  l.lead_id,
  l.nombre || ' ' || l.apellidos as nombre_completo,
  l.telefono,
  l.lqi,
  l.call_score_updated_at,
  EXTRACT(DAY FROM NOW() - l.call_score_updated_at) as dias_desactualizado,
  COUNT(DISTINCT cl.call_id) FILTER (WHERE cl.created_at > l.call_score_updated_at) as llamadas_nuevas
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
WHERE l.activo = true
  AND l.call_score_updated_at < NOW() - INTERVAL '7 days'
GROUP BY l.lead_id, l.nombre, l.apellidos, l.telefono, l.lqi, l.call_score_updated_at
HAVING COUNT(DISTINCT cl.call_id) FILTER (WHERE cl.created_at > l.call_score_updated_at) > 0
ORDER BY dias_desactualizado DESC, llamadas_nuevas DESC
LIMIT 100;

-- ========================================
-- 11. RENDIMIENTO DEL SISTEMA DE SCORING
-- ========================================

-- Velocidad de cálculo de scores (últimos 7 días)
SELECT
  DATE(call_score_updated_at) as fecha,
  COUNT(*) as total_calculos,
  MIN(call_score_updated_at) as primer_calculo,
  MAX(call_score_updated_at) as ultimo_calculo
FROM leads
WHERE call_score_updated_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(call_score_updated_at)
ORDER BY fecha DESC;

-- Estadísticas de ejecución de scoring
SELECT
  COUNT(*) as total_leads_con_scoring,
  MIN(call_score_updated_at) as primer_scoring,
  MAX(call_score_updated_at) as ultimo_scoring,
  EXTRACT(EPOCH FROM (MAX(call_score_updated_at) - MIN(call_score_updated_at))) / 3600 as horas_total,
  ROUND(
    COUNT(*)::NUMERIC /
    NULLIF(EXTRACT(EPOCH FROM (MAX(call_score_updated_at) - MIN(call_score_updated_at))) / 3600, 0),
    2
  ) as scores_por_hora
FROM leads
WHERE activo = true
  AND call_score_updated_at IS NOT NULL;

-- ========================================
-- 12. EXPORTAR DATOS PARA ANÁLISIS EXTERNO
-- ========================================

-- Dataset completo para análisis (CSV export)
SELECT
  l.lead_id,
  l.nombre,
  l.apellidos,
  l.telefono,
  l.email,
  l.ciudad,
  l.provincia,
  l.fuente,
  l.estado_actual,
  l.lead_score,
  l.calidad_lead,
  l.call_response_score,
  l.call_duration_score,
  l.call_interaction_score,
  l.call_behavior_score,
  l.call_total_score,
  l.call_score_category,
  l.lqi,
  l.categoria_lqi,
  COUNT(DISTINCT cl.call_id) as total_llamadas,
  COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END) as llamadas_exitosas,
  COUNT(DISTINCT lm.message_id) as total_mensajes,
  COUNT(DISTINCT lcm.lead_concesionario_marca_id) as intentos_compra,
  l.created_at,
  l.call_score_updated_at,
  lcm.prioridad,
  lcm.comercial_id
FROM leads l
LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
LEFT JOIN lead_messages lm ON l.lead_id = lm.lead_id
LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
WHERE l.activo = true
GROUP BY l.lead_id, l.nombre, l.apellidos, l.telefono, l.email, l.ciudad,
         l.provincia, l.fuente, l.estado_actual, l.lead_score, l.calidad_lead,
         l.call_response_score, l.call_duration_score, l.call_interaction_score,
         l.call_behavior_score, l.call_total_score, l.call_score_category,
         l.lqi, l.categoria_lqi, l.created_at, l.call_score_updated_at,
         lcm.prioridad, lcm.comercial_id
ORDER BY l.lqi DESC NULLS LAST;

-- ========================================
-- ✅ FIN DE CONSULTAS ANALÍTICAS
-- ========================================
