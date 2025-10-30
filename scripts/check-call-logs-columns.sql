-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS call_logs Y llamadas
-- =====================================================

-- Ver columnas de call_logs
SELECT
    'call_logs' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'call_logs'
ORDER BY ordinal_position;

-- Separador
SELECT '========================================' as separador;

-- Ver columnas de llamadas
SELECT
    'llamadas' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'llamadas'
ORDER BY ordinal_position;

-- Separador
SELECT '========================================' as separador;

-- Columnas que están en llamadas pero NO en call_logs
SELECT
    'Columnas en llamadas pero NO en call_logs:' as info,
    ll.column_name
FROM information_schema.columns ll
WHERE ll.table_name = 'llamadas'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns cl
    WHERE cl.table_name = 'call_logs'
      AND cl.column_name = ll.column_name
  )
ORDER BY ll.ordinal_position;

-- Separador
SELECT '========================================' as separador;

-- Columnas que están en call_logs pero NO en llamadas
SELECT
    'Columnas en call_logs pero NO en llamadas:' as info,
    cl.column_name
FROM information_schema.columns cl
WHERE cl.table_name = 'call_logs'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns ll
    WHERE ll.table_name = 'llamadas'
      AND ll.column_name = cl.column_name
  )
ORDER BY cl.ordinal_position;
