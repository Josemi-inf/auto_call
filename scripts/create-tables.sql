-- ====================
-- SCRIPT DE CREACIÓN DE TABLAS - N8N LEAD SYNC
-- Base de datos: auto_call (dentro de esquema n8n)
-- ====================

-- Configurar el esquema correcto
-- CREATE SCHEMA IF NOT EXISTS auto_call;
-- SET search_path TO auto_call, public;

-- Extensión para UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================
-- TABLAS PRINCIPALES
-- ====================

-- Tabla: concesionarios
CREATE TABLE IF NOT EXISTS concesionarios (
    concesionario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: marcas
CREATE TABLE IF NOT EXISTS marcas (
    marca_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: concesionario_marca (relación N:M)
CREATE TABLE IF NOT EXISTS concesionario_marca (
    concesionario_marca_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concesionario_id UUID NOT NULL,
    marca_id UUID NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concesionario_id) REFERENCES concesionarios(concesionario_id) ON DELETE CASCADE,
    FOREIGN KEY (marca_id) REFERENCES marcas(marca_id) ON DELETE CASCADE,
    UNIQUE(concesionario_id, marca_id)
);

-- Tabla: leads
CREATE TABLE IF NOT EXISTS leads (
    lead_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    telefono_e164 VARCHAR(20), -- Formato internacional E164
    estado_actual VARCHAR(50) DEFAULT 'nuevo',
    source VARCHAR(100), -- Fuente del lead
    campana VARCHAR(100), -- Campaña que generó el lead
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: lead_concesionario_marca
CREATE TABLE IF NOT EXISTS lead_concesionario_marca (
    lead_concesionario_marca_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    concesionario_marca_id UUID NOT NULL,
    estado VARCHAR(50) DEFAULT 'nuevo', -- nuevo, en_seguimiento, convertido, perdido
    modelo VARCHAR(100),
    fecha_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    presupuesto_min DECIMAL(10,2),
    presupuesto_max DECIMAL(10,2),
    notas TEXT,
    comercial_id UUID, -- Referencia al comercial asignado (puede ser tabla futura)
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    motivo_perdida TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (concesionario_marca_id) REFERENCES concesionario_marca(concesionario_marca_id) ON DELETE CASCADE
);

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

-- ====================
-- TABLAS PARA WORKFLOWS (N8N)
-- ====================

-- Tabla: workflows (configuración de workflows de n8n)
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

-- Tabla: workflow_leads (leads asociados a workflows)
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

-- ====================
-- TABLAS PARA LLAMADAS Y ESTADÍSTICAS
-- ====================

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

-- ====================
-- TABLAS PARA GESTIÓN DE ERRORES
-- ====================

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

-- ====================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ====================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado_actual);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON leads(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_activo ON leads(activo);

-- Índices para lead_concesionario_marca
CREATE INDEX IF NOT EXISTS idx_lcm_lead_id ON lead_concesionario_marca(lead_id);
CREATE INDEX IF NOT EXISTS idx_lcm_estado ON lead_concesionario_marca(estado);
CREATE INDEX IF NOT EXISTS idx_lcm_fecha_entrada ON lead_concesionario_marca(fecha_entrada);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_tipo ON lead_messages(tipo);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON lead_messages(timestamp_mensaje);
CREATE INDEX IF NOT EXISTS idx_messages_conversacion ON lead_messages(conversacion_id);

-- Índices para llamadas
CREATE INDEX IF NOT EXISTS idx_llamadas_lead_id ON llamadas(lead_id);
CREATE INDEX IF NOT EXISTS idx_llamadas_estado ON llamadas(estado);
CREATE INDEX IF NOT EXISTS idx_llamadas_fecha ON llamadas(fecha_llamada);
CREATE INDEX IF NOT EXISTS idx_llamadas_workflow ON llamadas(workflow_id);

-- Índices para workflow_leads
CREATE INDEX IF NOT EXISTS idx_workflow_leads_lead_id ON workflow_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflow_leads_workflow_id ON workflow_leads(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_leads_estado ON workflow_leads(estado);

-- Índices para errores
CREATE INDEX IF NOT EXISTS idx_errors_workflow_id ON workflow_errors(workflow_id);
CREATE INDEX IF NOT EXISTS idx_errors_estado ON workflow_errors(estado);
CREATE INDEX IF NOT EXISTS idx_errors_severidad ON workflow_errors(severidad);
CREATE INDEX IF NOT EXISTS idx_errors_fecha ON workflow_errors(fecha_error);

-- ====================
-- TRIGGERS PARA UPDATED_AT
-- ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas que lo necesiten
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concesionarios_updated_at BEFORE UPDATE ON concesionarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lcm_updated_at BEFORE UPDATE ON lead_concesionario_marca
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_leads_updated_at BEFORE UPDATE ON workflow_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_errors_updated_at BEFORE UPDATE ON workflow_errors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- DATOS INICIALES (OPCIONAL)
-- ====================

-- Insertar marcas básicas
INSERT INTO marcas (nombre) VALUES
    ('Toyota'),
    ('BMW'),
    ('Mercedes-Benz'),
    ('Audi'),
    ('Volkswagen'),
    ('Ford'),
    ('Hyundai'),
    ('Kia'),
    ('Nissan'),
    ('Peugeot')
ON CONFLICT (nombre) DO NOTHING;

-- Estados típicos de leads
-- Los estados se manejan como VARCHAR, valores típicos:
-- 'nuevo', 'contactado', 'en_seguimiento', 'calificado', 'propuesta_enviada', 'convertido', 'perdido'

-- ====================
-- COMENTARIOS EN TABLAS
-- ====================

COMMENT ON TABLE leads IS 'Tabla principal de leads del sistema';
COMMENT ON TABLE lead_concesionario_marca IS 'Intentos de compra de cada lead en diferentes concesionarios/marcas';
COMMENT ON TABLE llamadas IS 'Registro de todas las llamadas realizadas por los workflows';
COMMENT ON TABLE workflow_errors IS 'Registro de errores ocurridos en los workflows de n8n';
COMMENT ON TABLE workflows IS 'Configuración de workflows de n8n integrados';

COMMENT ON COLUMN leads.telefono_e164 IS 'Número de teléfono en formato internacional E164 para llamadas';
COMMENT ON COLUMN llamadas.duracion IS 'Duración de la llamada en segundos';
COMMENT ON COLUMN llamadas.latencia IS 'Tiempo de latencia de la llamada en milisegundos';
COMMENT ON COLUMN llamadas.costo IS 'Costo de la llamada en la moneda configurada';

-- ====================
-- FIN DEL SCRIPT
-- ====================

-- Verificar que las tablas se crearon correctamente
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'leads', 'concesionarios', 'marcas', 'concesionario_marca',
    'lead_concesionario_marca', 'lead_messages', 'conversaciones',
    'workflows', 'workflow_leads', 'llamadas', 'workflow_errors'
)
ORDER BY table_name;