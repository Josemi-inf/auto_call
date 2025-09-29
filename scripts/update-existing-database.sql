-- =====================================================
-- SCRIPT PARA ACTUALIZAR BASE DE DATOS EXISTENTE
-- Base en la estructura actual de auto_call
-- =====================================================

-- Las siguientes tablas YA EXISTEN y NO necesitan modificarse:
-- ✅ leads (con campos adicionales como telefono_valido, opt_out, consent_ts, etc.)
-- ✅ concesionarios
-- ✅ marcas
-- ✅ concesionario_marca
-- ✅ lead_concesionario_marca

-- =====================================================
-- CREAR TABLAS FALTANTES PARA EL SISTEMA COMPLETO
-- =====================================================

-- Extensión para UUID (por si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: conversaciones (NUEVA)
CREATE TABLE IF NOT EXISTS conversaciones (
    conversacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    canal VARCHAR(20) NOT NULL, -- whatsapp, email, call, system
    estado VARCHAR(20) DEFAULT 'activa', -- activa, cerrada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Tabla: lead_messages (NUEVA)
CREATE TABLE IF NOT EXISTS lead_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID,
    lead_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- whatsapp, email, call, system
    contenido TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL, -- lead, agent, system
    timestamp_mensaje TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Información adicional del mensaje
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(conversacion_id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Tabla: workflows (NUEVA)
CREATE TABLE IF NOT EXISTS workflows (
    workflow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    n8n_workflow_id VARCHAR(100), -- ID del workflow en n8n
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url_webhook VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    configuracion JSONB, -- Configuración específica del workflow
    ultimo_test TIMESTAMP WITH TIME ZONE,
    estado_test VARCHAR(20), -- success, error, pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: workflow_leads (NUEVA)
CREATE TABLE IF NOT EXISTS workflow_leads (
    workflow_lead_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL,
    lead_id UUID NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, ejecutando, completado, error
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    resultado JSONB, -- Resultado de la ejecución
    error_detalle TEXT,
    reintentos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Tabla: llamadas (NUEVA)
CREATE TABLE IF NOT EXISTS llamadas (
    llamada_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    workflow_id UUID,
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
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE SET NULL
);

-- Tabla: workflow_errors (NUEVA)
CREATE TABLE IF NOT EXISTS workflow_errors (
    error_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID,
    lead_id UUID,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- connection, data, limit, workflow, system
    severidad VARCHAR(20) NOT NULL, -- critical, error, warning, minor
    estado VARCHAR(20) DEFAULT 'pending', -- pending, resolved, investigating
    leads_afectados INTEGER DEFAULT 1,
    detalles JSONB, -- Detalles específicos del error
    fecha_error TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    resuelto_por VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE SET NULL
);

-- =====================================================
-- CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversaciones_lead_id ON conversaciones(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflows_activo ON workflows(activo);
CREATE INDEX IF NOT EXISTS idx_llamadas_lead_id ON llamadas(lead_id);
CREATE INDEX IF NOT EXISTS idx_errors_workflow_id ON workflow_errors(workflow_id);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;