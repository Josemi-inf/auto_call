-- Crear solo la tabla workflows
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Insertar algunos workflows de ejemplo
INSERT INTO workflows (nombre, descripcion, url_webhook, activo) VALUES
('WhatsApp Follow-up', 'Seguimiento automático por WhatsApp', 'https://tu-n8n.com/webhook/whatsapp-followup', true),
('Email Campaign', 'Campaña de email marketing', 'https://tu-n8n.com/webhook/email-campaign', true),
('Lead Qualification', 'Calificación automática de leads', 'https://tu-n8n.com/webhook/lead-qualification', false);

-- Verificar que se creó correctamente
SELECT * FROM workflows;