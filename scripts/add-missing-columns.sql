-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A TABLAS EXISTENTES
-- =====================================================
-- Ejecutar esto en PgWeb para asegurar que todas las columnas existen

-- Extensión para UUID (por si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREAR TABLA CONVERSACIONES (si no existe)
-- =====================================================

CREATE TABLE IF NOT EXISTS conversaciones (
    conversacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    canal VARCHAR(20) NOT NULL, -- whatsapp, email, call, system
    estado VARCHAR(20) DEFAULT 'activa', -- activa, cerrada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A TABLA LEADS
-- =====================================================

-- Verificar y agregar columnas que podrían faltar en leads
DO $$
BEGIN
    -- activo (para soft delete)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='activo') THEN
        ALTER TABLE leads ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;

    -- ciudad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='ciudad') THEN
        ALTER TABLE leads ADD COLUMN ciudad VARCHAR(100);
    END IF;

    -- provincia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='provincia') THEN
        ALTER TABLE leads ADD COLUMN provincia VARCHAR(100);
    END IF;

    -- cp (código postal)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='cp') THEN
        ALTER TABLE leads ADD COLUMN cp VARCHAR(10);
    END IF;

    -- telefono_valido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='telefono_valido') THEN
        ALTER TABLE leads ADD COLUMN telefono_valido BOOLEAN DEFAULT false;
    END IF;

    -- calidad_lead
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='calidad_lead') THEN
        ALTER TABLE leads ADD COLUMN calidad_lead VARCHAR(20) DEFAULT 'tibio';
    END IF;

    -- lead_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='leads' AND column_name='lead_score') THEN
        ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 50;
    END IF;
END $$;

-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A LEAD_CONCESIONARIO_MARCA
-- =====================================================

DO $$
BEGIN
    -- prioridad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='prioridad') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN prioridad INTEGER DEFAULT 3;
    END IF;

    -- combustible_preferido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='combustible_preferido') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN combustible_preferido VARCHAR(50);
    END IF;

    -- transmision
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='transmision') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN transmision VARCHAR(20);
    END IF;

    -- urgencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='urgencia') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN urgencia VARCHAR(20) DEFAULT 'media';
    END IF;

    -- proxima_accion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='proxima_accion') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN proxima_accion TEXT;
    END IF;

    -- fecha_proxima_accion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='fecha_proxima_accion') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN fecha_proxima_accion TIMESTAMP WITH TIME ZONE;
    END IF;

    -- comercial_nombre (para almacenar el nombre del comercial)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='lead_concesionario_marca' AND column_name='comercial_nombre') THEN
        ALTER TABLE lead_concesionario_marca ADD COLUMN comercial_nombre VARCHAR(255);
    END IF;
END $$;

-- =====================================================
-- CREAR ÍNDICES FALTANTES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversaciones_lead_id ON conversaciones(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflows_activo ON workflows(activo);
CREATE INDEX IF NOT EXISTS idx_llamadas_lead_id ON llamadas(lead_id);
CREATE INDEX IF NOT EXISTS idx_errors_workflow_id ON workflow_errors(workflow_id);
CREATE INDEX IF NOT EXISTS idx_leads_activo ON leads(activo);
CREATE INDEX IF NOT EXISTS idx_leads_opt_out ON leads(opt_out);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar todas las tablas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar columnas de la tabla leads
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- Contar registros en tablas principales
SELECT 'leads' as tabla, COUNT(*) as registros FROM leads
UNION ALL
SELECT 'lead_concesionario_marca' as tabla, COUNT(*) as registros FROM lead_concesionario_marca
UNION ALL
SELECT 'llamadas' as tabla, COUNT(*) as registros FROM llamadas
UNION ALL
SELECT 'workflows' as tabla, COUNT(*) as registros FROM workflows;
