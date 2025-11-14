-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN DEL SISTEMA DE SCORING
-- Fecha: 2025-11-14
-- Descripción: Índices para mejorar el rendimiento de consultas de scoring
-- ========================================

-- ========================================
-- 1. ÍNDICES INDIVIDUALES PARA SCORING
-- ========================================

-- Índice para lead_score (ordenación descendente para obtener mejores leads)
CREATE INDEX IF NOT EXISTS idx_leads_lead_score
ON leads(lead_score DESC NULLS LAST)
WHERE activo = true;

-- Índice para calidad_lead (filtrado por categoría)
CREATE INDEX IF NOT EXISTS idx_leads_calidad_lead
ON leads(calidad_lead)
WHERE activo = true;

-- Índice para call_total_score
CREATE INDEX IF NOT EXISTS idx_leads_call_total_score
ON leads(call_total_score DESC NULLS LAST)
WHERE activo = true;

-- Índice para call_score_category
CREATE INDEX IF NOT EXISTS idx_leads_call_score_category
ON leads(call_score_category)
WHERE activo = true;

-- Índice para LQI (Lead Quality Index)
CREATE INDEX IF NOT EXISTS idx_leads_lqi
ON leads(lqi DESC NULLS LAST)
WHERE activo = true;

-- Índice para categoria_lqi
CREATE INDEX IF NOT EXISTS idx_leads_categoria_lqi
ON leads(categoria_lqi)
WHERE activo = true;

-- ========================================
-- 2. ÍNDICES COMPUESTOS PARA CONSULTAS COMPLEJAS
-- ========================================

-- Índice compuesto para filtrar por múltiples scores
CREATE INDEX IF NOT EXISTS idx_leads_scoring_composite
ON leads(lqi DESC, lead_score DESC, call_total_score DESC)
WHERE activo = true;

-- Índice para leads premium/alto que necesitan seguimiento
CREATE INDEX IF NOT EXISTS idx_leads_high_priority
ON leads(categoria_lqi, lqi DESC, updated_at DESC)
WHERE activo = true
  AND categoria_lqi IN ('premium', 'alto');

-- Índice para análisis de efectividad del scoring
CREATE INDEX IF NOT EXISTS idx_leads_scoring_analysis
ON leads(categoria_lqi, estado_actual, created_at)
WHERE activo = true;

-- ========================================
-- 3. ÍNDICES PARA CALL_LOGS
-- ========================================

-- Índice para buscar llamadas por lead
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id
ON call_logs(lead_id, created_at DESC);

-- Índice para llamadas exitosas
CREATE INDEX IF NOT EXISTS idx_call_logs_exitoso
ON call_logs(exitoso, created_at DESC);

-- Índice compuesto para análisis de llamadas
CREATE INDEX IF NOT EXISTS idx_call_logs_analysis
ON call_logs(lead_id, exitoso, created_at DESC);

-- ========================================
-- 4. ÍNDICES PARA LEAD_MESSAGES
-- ========================================

-- Índice para mensajes por lead
CREATE INDEX IF NOT EXISTS idx_lead_messages_lead_id
ON lead_messages(lead_id, created_at DESC);

-- Índice para análisis de engagement
CREATE INDEX IF NOT EXISTS idx_lead_messages_direction
ON lead_messages(lead_id, direccion, created_at DESC);

-- ========================================
-- 5. ÍNDICES PARA LEAD_CONCESIONARIO_MARCA
-- ========================================

-- Índice para prioridad y urgencia
CREATE INDEX IF NOT EXISTS idx_lcm_prioridad
ON lead_concesionario_marca(prioridad DESC, urgencia);

-- Índice para asignación de comerciales
CREATE INDEX IF NOT EXISTS idx_lcm_comercial
ON lead_concesionario_marca(comercial_id, prioridad DESC)
WHERE comercial_id IS NOT NULL;

-- Índice compuesto para leads en seguimiento
CREATE INDEX IF NOT EXISTS idx_lcm_seguimiento
ON lead_concesionario_marca(lead_id, estado, prioridad DESC, updated_at DESC);

-- ========================================
-- 6. ÍNDICES PARA TIMESTAMPS (RECENCIA)
-- ========================================

-- Índice para call_score_updated_at
CREATE INDEX IF NOT EXISTS idx_leads_call_score_updated
ON leads(call_score_updated_at DESC NULLS LAST)
WHERE activo = true;

-- Índice para última actividad
CREATE INDEX IF NOT EXISTS idx_leads_updated_at
ON leads(updated_at DESC)
WHERE activo = true;

-- ========================================
-- 7. ÍNDICES GIN PARA CAMPOS JSONB
-- ========================================

-- Índice GIN para búsquedas en call_score_breakdown
CREATE INDEX IF NOT EXISTS idx_leads_call_score_breakdown_gin
ON leads USING GIN (call_score_breakdown)
WHERE call_score_breakdown IS NOT NULL;

-- Índice GIN para búsquedas en lqi_breakdown
CREATE INDEX IF NOT EXISTS idx_leads_lqi_breakdown_gin
ON leads USING GIN (lqi_breakdown)
WHERE lqi_breakdown IS NOT NULL;

-- ========================================
-- 8. ÍNDICES PARCIALES PARA CASOS ESPECÍFICOS
-- ========================================

-- Índice para leads sin scoring (necesitan cálculo inicial)
CREATE INDEX IF NOT EXISTS idx_leads_sin_scoring
ON leads(lead_id, created_at)
WHERE activo = true
  AND (lead_score IS NULL OR lqi IS NULL);

-- Índice para leads con scoring desactualizado (>7 días)
CREATE INDEX IF NOT EXISTS idx_leads_scoring_desactualizado
ON leads(lead_id, call_score_updated_at)
WHERE activo = true
  AND call_score_updated_at < NOW() - INTERVAL '7 days';

-- Índice para leads premium sin comercial asignado (crítico)
CREATE INDEX IF NOT EXISTS idx_leads_premium_sin_asignar
ON leads(lead_id, lqi, categoria_lqi, updated_at)
WHERE activo = true
  AND categoria_lqi = 'premium'
  AND lead_id NOT IN (
    SELECT lead_id FROM lead_concesionario_marca WHERE comercial_id IS NOT NULL
  );

-- ========================================
-- 9. ANÁLISIS Y VERIFICACIÓN
-- ========================================

-- Verificar que todos los índices se crearon correctamente
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('leads', 'call_logs', 'lead_messages', 'lead_concesionario_marca')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Ver tamaño de los índices
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE tablename IN ('leads', 'call_logs', 'lead_messages', 'lead_concesionario_marca')
  AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- ========================================
-- 10. MANTENIMIENTO DE ÍNDICES
-- ========================================

-- Reindexar todas las tablas de scoring (ejecutar periódicamente)
-- NOTA: Esto puede ser lento en tablas grandes, ejecutar en horarios de baja carga
-- REINDEX TABLE leads;
-- REINDEX TABLE call_logs;
-- REINDEX TABLE lead_messages;
-- REINDEX TABLE lead_concesionario_marca;

-- Analizar estadísticas de las tablas para optimización del query planner
ANALYZE leads;
ANALYZE call_logs;
ANALYZE lead_messages;
ANALYZE lead_concesionario_marca;

-- ========================================
-- NOTAS DE IMPLEMENTACIÓN
-- ========================================
/*
1. Ejecutar este script en la base de datos de producción
2. Monitorear el tamaño de los índices regularmente
3. Si algún índice crece demasiado, considerar particionado
4. Ejecutar ANALYZE después de grandes cargas de datos
5. Considerar REINDEX mensualmente en tablas grandes

IMPACTO ESPERADO:
- Mejora de 10-100x en consultas de scoring
- Reducción de tiempo de respuesta de API
- Menor carga en el servidor de base de datos
- Mejor rendimiento de los workflows de n8n

TRADE-OFFS:
- Los índices ocupan espacio en disco (~10-20% del tamaño de la tabla)
- Los INSERT/UPDATE serán ligeramente más lentos
- Requieren mantenimiento periódico

MONITOREO:
-- Ver índices no utilizados (para eliminar si no son necesarios)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Ver índices más utilizados (valida la efectividad)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 20;
*/
