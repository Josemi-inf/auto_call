-- =====================================================
-- MIGRACIÓN DE DATOS: llamadas -> call_logs
-- =====================================================
-- Este script migra todos los datos de la tabla 'llamadas'
-- a la nueva tabla 'call_logs'
-- =====================================================

-- Verificar si la tabla call_logs existe, si no, crearla
CREATE TABLE IF NOT EXISTS call_logs (
    call_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    numero_origen VARCHAR(20),
    numero_destino VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL, -- successful, failed, no_answer, busy, rejected
    duracion INTEGER, -- Duración en segundos
    costo DECIMAL(10,4), -- Costo de la llamada
    latencia INTEGER, -- Latencia en milisegundos
    proveedor VARCHAR(50), -- Proveedor de la llamada (Twilio, etc.)
    call_sid VARCHAR(100), -- ID único de la llamada en el proveedor
    fecha_llamada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Información adicional de la llamada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_fecha_llamada ON call_logs(fecha_llamada);
CREATE INDEX IF NOT EXISTS idx_call_logs_estado ON call_logs(estado);

-- Verificar si hay datos en la tabla llamadas
DO $$
DECLARE
    llamadas_count INTEGER;
    call_logs_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO llamadas_count FROM llamadas;
    SELECT COUNT(*) INTO call_logs_count FROM call_logs;

    RAISE NOTICE 'Registros en llamadas: %', llamadas_count;
    RAISE NOTICE 'Registros en call_logs antes de migración: %', call_logs_count;
END $$;

-- Migrar datos de llamadas a call_logs
-- Solo migrar si hay datos en llamadas y call_logs está vacío o tiene menos registros
INSERT INTO call_logs (
    call_id,
    lead_id,
    numero_origen,
    numero_destino,
    estado,
    duracion,
    costo,
    latencia,
    proveedor,
    call_sid,
    fecha_llamada,
    metadata,
    created_at
)
SELECT
    llamada_id as call_id,
    lead_id,
    numero_origen,
    numero_destino,
    estado,
    duracion,
    costo,
    latencia,
    proveedor,
    call_sid,
    fecha_llamada,
    metadata,
    created_at
FROM llamadas
WHERE NOT EXISTS (
    SELECT 1 FROM call_logs cl WHERE cl.call_id = llamadas.llamada_id
);

-- Verificar resultados de la migración
DO $$
DECLARE
    llamadas_count INTEGER;
    call_logs_count INTEGER;
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO llamadas_count FROM llamadas;
    SELECT COUNT(*) INTO call_logs_count FROM call_logs;
    migrated_count := call_logs_count;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESUMEN DE MIGRACIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Registros en tabla llamadas: %', llamadas_count;
    RAISE NOTICE 'Registros en tabla call_logs: %', call_logs_count;
    RAISE NOTICE 'Registros migrados: %', migrated_count;
    RAISE NOTICE '========================================';

    IF call_logs_count >= llamadas_count THEN
        RAISE NOTICE '✅ Migración completada exitosamente';
    ELSE
        RAISE WARNING '⚠️ Algunos registros pueden no haberse migrado';
    END IF;
END $$;

-- Mostrar algunos registros de ejemplo de call_logs
SELECT
    '✅ Primeros 5 registros migrados a call_logs:' as mensaje;

SELECT
    call_id,
    lead_id,
    estado,
    duracion,
    fecha_llamada,
    proveedor
FROM call_logs
ORDER BY fecha_llamada DESC
LIMIT 5;
