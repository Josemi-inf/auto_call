-- =====================================================
-- CREAR TODAS LAS TABLAS FALTANTES
-- =====================================================

-- Extensión para UUID (por si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
    conversacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    canal VARCHAR(20) NOT NULL, -- whatsapp, email, call, system
    estado VARCHAR(20) DEFAULT 'activa', -- activa, cerrada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE
);

-- Tabla: lead_messages
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

-- Tabla: workflows
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

-- Tabla: workflow_leads
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

-- Tabla: llamadas
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

-- Tabla: workflow_errors
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
-- INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Workflows de ejemplo
INSERT INTO workflows (nombre, descripcion, url_webhook, activo, estado_test) VALUES
('WhatsApp Follow-up', 'Seguimiento automático por WhatsApp después de 24h sin respuesta', 'https://tu-n8n.com/webhook/whatsapp-followup', true, 'success'),
('Email Campaign Welcome', 'Envío de email de bienvenida a nuevos leads', 'https://tu-n8n.com/webhook/email-welcome', true, 'success'),
('Lead Qualification', 'Calificación automática de leads basada en criterios', 'https://tu-n8n.com/webhook/lead-qualification', true, 'pending'),
('SMS Reminder', 'Recordatorio por SMS para citas programadas', 'https://tu-n8n.com/webhook/sms-reminder', false, 'error'),
('Cold Call Campaign', 'Campaña de llamadas en frío automatizada', 'https://tu-n8n.com/webhook/cold-call', true, 'success');

-- Errores de ejemplo
INSERT INTO workflow_errors (workflow_id, titulo, descripcion, tipo, severidad, estado, leads_afectados)
SELECT
    w.workflow_id,
    'Error de conexión con API de WhatsApp',
    'No se pudo establecer conexión con la API de WhatsApp Business. Timeout después de 30 segundos.',
    'connection',
    'critical',
    'pending',
    15
FROM workflows w WHERE w.nombre = 'WhatsApp Follow-up' LIMIT 1;

INSERT INTO workflow_errors (workflow_id, titulo, descripcion, tipo, severidad, estado, leads_afectados)
SELECT
    w.workflow_id,
    'Límite de API alcanzado',
    'Se ha alcanzado el límite diario de envío de emails (1000/día). Reintentando mañana.',
    'limit',
    'warning',
    'resolved',
    5
FROM workflows w WHERE w.nombre = 'Email Campaign Welcome' LIMIT 1;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar tablas creadas
SELECT
    table_name,
    CASE
        WHEN table_name IN ('leads', 'concesionarios', 'marcas', 'concesionario_marca', 'lead_concesionario_marca')
        THEN 'EXISTENTE'
        ELSE 'NUEVA'
    END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY estado, table_name;

-- Contar registros en las nuevas tablas
SELECT 'workflows' as tabla, COUNT(*) as registros FROM workflows
UNION ALL
SELECT 'workflow_errors' as tabla, COUNT(*) as registros FROM workflow_errors
UNION ALL
SELECT 'conversaciones' as tabla, COUNT(*) as registros FROM conversaciones
UNION ALL
SELECT 'lead_messages' as tabla, COUNT(*) as registros FROM lead_messages
UNION ALL
SELECT 'llamadas' as tabla, COUNT(*) as registros FROM llamadas;