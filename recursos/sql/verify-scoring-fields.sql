-- ========================================
-- VERIFICACIÓN DE CAMPOS DE SCORING EN LA TABLA LEADS
-- Fecha: 2025-11-14
-- Descripción: Verifica que todos los campos necesarios para el sistema de scoring existen
-- ========================================

-- ========================================
-- 1. VERIFICAR EXISTENCIA DE CAMPOS
-- ========================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name IN (
    -- Lead Scoring General
    'lead_score',
    'calidad_lead',

    -- Call Scoring
    'call_response_score',
    'call_duration_score',
    'call_interaction_score',
    'call_behavior_score',
    'call_total_score',
    'call_score_category',
    'call_score_breakdown',
    'call_score_updated_at',

    -- LQI (Lead Quality Index)
    'lqi',
    'lqi_breakdown',
    'categoria_lqi'
  )
ORDER BY column_name;

-- ========================================
-- 2. SCRIPT PARA CREAR CAMPOS SI NO EXISTEN
-- ========================================

-- Crear campos de Lead Scoring General si no existen
DO $$
BEGIN
  -- lead_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'lead_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN lead_score INTEGER;
    COMMENT ON COLUMN leads.lead_score IS 'Puntuación general del lead (0-100)';
  END IF;

  -- calidad_lead
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'calidad_lead'
  ) THEN
    ALTER TABLE leads ADD COLUMN calidad_lead VARCHAR(50);
    COMMENT ON COLUMN leads.calidad_lead IS 'Categoría de calidad: frio, tibio, caliente, muy_caliente';
  END IF;

  -- call_response_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_response_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_response_score INTEGER;
    COMMENT ON COLUMN leads.call_response_score IS 'Puntuación de respuesta en llamadas (0-25)';
  END IF;

  -- call_duration_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_duration_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_duration_score INTEGER;
    COMMENT ON COLUMN leads.call_duration_score IS 'Puntuación de duración de llamadas (0-25)';
  END IF;

  -- call_interaction_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_interaction_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_interaction_score INTEGER;
    COMMENT ON COLUMN leads.call_interaction_score IS 'Puntuación de interacción en llamadas (0-25)';
  END IF;

  -- call_behavior_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_behavior_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_behavior_score INTEGER;
    COMMENT ON COLUMN leads.call_behavior_score IS 'Puntuación de comportamiento en llamadas (0-25)';
  END IF;

  -- call_total_score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_total_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_total_score INTEGER;
    COMMENT ON COLUMN leads.call_total_score IS 'Puntuación total de llamadas (0-100)';
  END IF;

  -- call_score_category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_score_category'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_score_category VARCHAR(50);
    COMMENT ON COLUMN leads.call_score_category IS 'Categoría de call scoring: excelente, buena, regular, baja';
  END IF;

  -- call_score_breakdown
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_score_breakdown'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_score_breakdown JSONB;
    COMMENT ON COLUMN leads.call_score_breakdown IS 'Desglose detallado del scoring de llamadas';
  END IF;

  -- call_score_updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'call_score_updated_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN call_score_updated_at TIMESTAMP;
    COMMENT ON COLUMN leads.call_score_updated_at IS 'Última actualización del scoring de llamadas';
  END IF;

  -- lqi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'lqi'
  ) THEN
    ALTER TABLE leads ADD COLUMN lqi INTEGER;
    COMMENT ON COLUMN leads.lqi IS 'Lead Quality Index - Índice de calidad del lead (0-100)';
  END IF;

  -- lqi_breakdown
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'lqi_breakdown'
  ) THEN
    ALTER TABLE leads ADD COLUMN lqi_breakdown JSONB;
    COMMENT ON COLUMN leads.lqi_breakdown IS 'Desglose detallado del LQI';
  END IF;

  -- categoria_lqi
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'categoria_lqi'
  ) THEN
    ALTER TABLE leads ADD COLUMN categoria_lqi VARCHAR(50);
    COMMENT ON COLUMN leads.categoria_lqi IS 'Categoría del LQI: premium, alto, medio, bajo, muy_bajo';
  END IF;

END $$;

-- ========================================
-- 3. ESTADÍSTICAS DE SCORING ACTUAL
-- ========================================

-- Contar leads por calidad
SELECT
  calidad_lead,
  COUNT(*) as total,
  ROUND(AVG(lead_score), 2) as avg_lead_score,
  ROUND(AVG(lqi), 2) as avg_lqi
FROM leads
WHERE activo = true
GROUP BY calidad_lead
ORDER BY avg_lqi DESC NULLS LAST;

-- Contar leads por categoría LQI
SELECT
  categoria_lqi,
  COUNT(*) as total,
  ROUND(AVG(lqi), 2) as avg_lqi,
  ROUND(AVG(lead_score), 2) as avg_lead_score,
  ROUND(AVG(call_total_score), 2) as avg_call_score
FROM leads
WHERE activo = true
GROUP BY categoria_lqi
ORDER BY
  CASE categoria_lqi
    WHEN 'premium' THEN 1
    WHEN 'alto' THEN 2
    WHEN 'medio' THEN 3
    WHEN 'bajo' THEN 4
    WHEN 'muy_bajo' THEN 5
    ELSE 6
  END;

-- Contar leads por call score category
SELECT
  call_score_category,
  COUNT(*) as total,
  ROUND(AVG(call_total_score), 2) as avg_call_score
FROM leads
WHERE activo = true
GROUP BY call_score_category
ORDER BY avg_call_score DESC NULLS LAST;

-- ========================================
-- 4. LEADS SIN SCORING (NECESITAN CÁLCULO)
-- ========================================

SELECT
  COUNT(*) as total_sin_lead_score,
  COUNT(CASE WHEN lead_score IS NULL THEN 1 END) as sin_lead_score,
  COUNT(CASE WHEN call_total_score IS NULL THEN 1 END) as sin_call_score,
  COUNT(CASE WHEN lqi IS NULL THEN 1 END) as sin_lqi,
  COUNT(CASE WHEN lead_score IS NULL AND call_total_score IS NULL AND lqi IS NULL THEN 1 END) as sin_ningun_score
FROM leads
WHERE activo = true;

-- Listar los primeros 10 leads sin scoring
SELECT
  lead_id,
  nombre,
  apellidos,
  telefono,
  estado_actual,
  created_at,
  lead_score,
  call_total_score,
  lqi
FROM leads
WHERE activo = true
  AND (lead_score IS NULL OR lqi IS NULL)
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 5. DISTRIBUCIÓN DE SCORES
-- ========================================

-- Distribución de lead_score en rangos
SELECT
  CASE
    WHEN lead_score >= 80 THEN '80-100 (Muy Caliente)'
    WHEN lead_score >= 60 THEN '60-79 (Caliente)'
    WHEN lead_score >= 40 THEN '40-59 (Tibio)'
    WHEN lead_score >= 0 THEN '0-39 (Frío)'
    ELSE 'Sin Score'
  END as rango_lead_score,
  COUNT(*) as total_leads,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM leads WHERE activo = true) * 100, 2) as porcentaje
FROM leads
WHERE activo = true
GROUP BY rango_lead_score
ORDER BY
  CASE
    WHEN rango_lead_score = '80-100 (Muy Caliente)' THEN 1
    WHEN rango_lead_score = '60-79 (Caliente)' THEN 2
    WHEN rango_lead_score = '40-59 (Tibio)' THEN 3
    WHEN rango_lead_score = '0-39 (Frío)' THEN 4
    ELSE 5
  END;

-- Distribución de LQI en rangos
SELECT
  CASE
    WHEN lqi >= 80 THEN '80-100 (Premium)'
    WHEN lqi >= 65 THEN '65-79 (Alto)'
    WHEN lqi >= 45 THEN '45-64 (Medio)'
    WHEN lqi >= 25 THEN '25-44 (Bajo)'
    WHEN lqi >= 0 THEN '0-24 (Muy Bajo)'
    ELSE 'Sin LQI'
  END as rango_lqi,
  COUNT(*) as total_leads,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM leads WHERE activo = true) * 100, 2) as porcentaje
FROM leads
WHERE activo = true
GROUP BY rango_lqi
ORDER BY
  CASE
    WHEN rango_lqi = '80-100 (Premium)' THEN 1
    WHEN rango_lqi = '65-79 (Alto)' THEN 2
    WHEN rango_lqi = '45-64 (Medio)' THEN 3
    WHEN rango_lqi = '25-44 (Bajo)' THEN 4
    WHEN rango_lqi = '0-24 (Muy Bajo)' THEN 5
    ELSE 6
  END;

-- ========================================
-- 6. TOP 20 LEADS POR LQI
-- ========================================

SELECT
  lead_id,
  nombre,
  apellidos,
  telefono,
  email,
  lqi,
  categoria_lqi,
  lead_score,
  calidad_lead,
  call_total_score,
  call_score_category,
  estado_actual,
  created_at,
  call_score_updated_at
FROM leads
WHERE activo = true
  AND lqi IS NOT NULL
ORDER BY lqi DESC
LIMIT 20;

-- ========================================
-- 7. VERIFICACIÓN DE INTEGRIDAD
-- ========================================

-- Verificar consistencia entre lead_score y calidad_lead
SELECT
  calidad_lead,
  MIN(lead_score) as min_score,
  MAX(lead_score) as max_score,
  COUNT(*) as total
FROM leads
WHERE activo = true
  AND lead_score IS NOT NULL
  AND calidad_lead IS NOT NULL
GROUP BY calidad_lead
ORDER BY min_score DESC;

-- Verificar consistencia entre lqi y categoria_lqi
SELECT
  categoria_lqi,
  MIN(lqi) as min_lqi,
  MAX(lqi) as max_lqi,
  COUNT(*) as total
FROM leads
WHERE activo = true
  AND lqi IS NOT NULL
  AND categoria_lqi IS NOT NULL
GROUP BY categoria_lqi
ORDER BY min_lqi DESC;

-- ========================================
-- 8. RESULTADO FINAL
-- ========================================

-- Resumen general del estado del scoring
SELECT
  'Total Leads Activos' as metrica,
  COUNT(*) as valor
FROM leads WHERE activo = true
UNION ALL
SELECT
  'Con Lead Score',
  COUNT(*)
FROM leads WHERE activo = true AND lead_score IS NOT NULL
UNION ALL
SELECT
  'Con Call Score',
  COUNT(*)
FROM leads WHERE activo = true AND call_total_score IS NOT NULL
UNION ALL
SELECT
  'Con LQI',
  COUNT(*)
FROM leads WHERE activo = true AND lqi IS NOT NULL
UNION ALL
SELECT
  'Score Completo (los 3)',
  COUNT(*)
FROM leads WHERE activo = true
  AND lead_score IS NOT NULL
  AND call_total_score IS NOT NULL
  AND lqi IS NOT NULL
UNION ALL
SELECT
  'Leads Premium (LQI >= 80)',
  COUNT(*)
FROM leads WHERE activo = true AND lqi >= 80
UNION ALL
SELECT
  'Leads Alto (LQI 65-79)',
  COUNT(*)
FROM leads WHERE activo = true AND lqi >= 65 AND lqi < 80;

-- ========================================
-- ✅ VERIFICACIÓN COMPLETA
-- ========================================
/*
Ejecutar este script completo para:
1. Verificar existencia de campos
2. Crear campos faltantes
3. Ver estadísticas actuales
4. Identificar leads sin scoring
5. Analizar distribución de scores
6. Verificar integridad de datos

Si algún campo no existe, se creará automáticamente.
Si hay leads sin scoring, se identificarán para procesarlos.
*/
