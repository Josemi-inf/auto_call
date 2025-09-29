-- ====================
-- DATOS DE EJEMPLO - N8N LEAD SYNC
-- Script para insertar datos de prueba
-- ====================

-- Insertar concesionarios de ejemplo
INSERT INTO concesionarios (nombre, direccion, telefono, email, ciudad, codigo_postal) VALUES
    ('Toyota Madrid Norte', 'Calle Alcalá 123, Madrid', '+34 91 123 4567', 'info@toyotamadridnorte.com', 'Madrid', '28001'),
    ('BMW Premium Barcelona', 'Gran Via 456, Barcelona', '+34 93 234 5678', 'ventas@bmwbarcelona.com', 'Barcelona', '08001'),
    ('Mercedes Valencia', 'Avenida Blasco Ibáñez 789, Valencia', '+34 96 345 6789', 'contacto@mercedesvalencia.com', 'Valencia', '46001'),
    ('Audi Sevilla', 'Calle Sierpes 321, Sevilla', '+34 95 456 7890', 'info@audisevilla.com', 'Sevilla', '41001')
ON CONFLICT (nombre) DO NOTHING;

-- Obtener IDs de concesionarios para usar en relaciones
DO $$
DECLARE
    toyota_madrid_id UUID;
    bmw_barcelona_id UUID;
    mercedes_valencia_id UUID;
    audi_sevilla_id UUID;
    toyota_marca_id UUID;
    bmw_marca_id UUID;
    mercedes_marca_id UUID;
    audi_marca_id UUID;
BEGIN
    -- Obtener IDs de concesionarios
    SELECT concesionario_id INTO toyota_madrid_id FROM concesionarios WHERE nombre = 'Toyota Madrid Norte';
    SELECT concesionario_id INTO bmw_barcelona_id FROM concesionarios WHERE nombre = 'BMW Premium Barcelona';
    SELECT concesionario_id INTO mercedes_valencia_id FROM concesionarios WHERE nombre = 'Mercedes Valencia';
    SELECT concesionario_id INTO audi_sevilla_id FROM concesionarios WHERE nombre = 'Audi Sevilla';

    -- Obtener IDs de marcas
    SELECT marca_id INTO toyota_marca_id FROM marcas WHERE nombre = 'Toyota';
    SELECT marca_id INTO bmw_marca_id FROM marcas WHERE nombre = 'BMW';
    SELECT marca_id INTO mercedes_marca_id FROM marcas WHERE nombre = 'Mercedes-Benz';
    SELECT marca_id INTO audi_marca_id FROM marcas WHERE nombre = 'Audi';

    -- Crear relaciones concesionario-marca
    INSERT INTO concesionario_marca (concesionario_id, marca_id) VALUES
        (toyota_madrid_id, toyota_marca_id),
        (bmw_barcelona_id, bmw_marca_id),
        (mercedes_valencia_id, mercedes_marca_id),
        (audi_sevilla_id, audi_marca_id)
    ON CONFLICT (concesionario_id, marca_id) DO NOTHING;
END $$;

-- Insertar leads de ejemplo
INSERT INTO leads (nombre, apellidos, email, telefono, telefono_e164, estado_actual, source, campana, ciudad, codigo_postal) VALUES
    ('María', 'González', 'maria.gonzalez@email.com', '612 345 678', '+34612345678', 'nuevo', 'Facebook Ads', 'Campaña Toyota Hybrid', 'Madrid', '28001'),
    ('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '623 456 789', '+34623456789', 'en_seguimiento', 'Google Ads', 'BMW Serie 3', 'Barcelona', '08002'),
    ('Ana', 'Martín', 'ana.martin@email.com', '634 567 890', '+34634567890', 'contactado', 'Página Web', 'Mercedes Clase A', 'Valencia', '46002'),
    ('José', 'López', 'jose.lopez@email.com', '645 678 901', '+34645678901', 'perdido', 'Instagram', 'Audi A3', 'Sevilla', '41002'),
    ('Laura', 'García', 'laura.garcia@email.com', '656 789 012', '+34656789012', 'convertido', 'Referido', 'Toyota RAV4', 'Madrid', '28003'),
    ('David', 'Fernández', 'david.fernandez@email.com', '667 890 123', '+34667890123', 'calificado', 'Facebook Ads', 'BMW X1', 'Barcelona', '08003')
ON CONFLICT DO NOTHING;

-- Insertar intentos de compra (lead_concesionario_marca)
DO $$
DECLARE
    maria_id UUID;
    carlos_id UUID;
    ana_id UUID;
    jose_id UUID;
    laura_id UUID;
    david_id UUID;
    toyota_cm_id UUID;
    bmw_cm_id UUID;
    mercedes_cm_id UUID;
    audi_cm_id UUID;
BEGIN
    -- Obtener IDs de leads
    SELECT lead_id INTO maria_id FROM leads WHERE email = 'maria.gonzalez@email.com';
    SELECT lead_id INTO carlos_id FROM leads WHERE email = 'carlos.rodriguez@email.com';
    SELECT lead_id INTO ana_id FROM leads WHERE email = 'ana.martin@email.com';
    SELECT lead_id INTO jose_id FROM leads WHERE email = 'jose.lopez@email.com';
    SELECT lead_id INTO laura_id FROM leads WHERE email = 'laura.garcia@email.com';
    SELECT lead_id INTO david_id FROM leads WHERE email = 'david.fernandez@email.com';

    -- Obtener IDs de concesionario_marca
    SELECT cm.concesionario_marca_id INTO toyota_cm_id
    FROM concesionario_marca cm
    JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
    JOIN marcas m ON cm.marca_id = m.marca_id
    WHERE c.nombre = 'Toyota Madrid Norte' AND m.nombre = 'Toyota';

    SELECT cm.concesionario_marca_id INTO bmw_cm_id
    FROM concesionario_marca cm
    JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
    JOIN marcas m ON cm.marca_id = m.marca_id
    WHERE c.nombre = 'BMW Premium Barcelona' AND m.nombre = 'BMW';

    SELECT cm.concesionario_marca_id INTO mercedes_cm_id
    FROM concesionario_marca cm
    JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
    JOIN marcas m ON cm.marca_id = m.marca_id
    WHERE c.nombre = 'Mercedes Valencia' AND m.nombre = 'Mercedes-Benz';

    SELECT cm.concesionario_marca_id INTO audi_cm_id
    FROM concesionario_marca cm
    JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
    JOIN marcas m ON cm.marca_id = m.marca_id
    WHERE c.nombre = 'Audi Sevilla' AND m.nombre = 'Audi';

    -- Insertar intentos de compra
    INSERT INTO lead_concesionario_marca (lead_id, concesionario_marca_id, estado, modelo, presupuesto_min, presupuesto_max, notas) VALUES
        (maria_id, toyota_cm_id, 'nuevo', 'Corolla Hybrid', 25000.00, 30000.00, 'Interesada en híbrido, primera compra'),
        (carlos_id, bmw_cm_id, 'en_seguimiento', 'Serie 3', 35000.00, 45000.00, 'Busca coche ejecutivo, segunda llamada programada'),
        (ana_id, mercedes_cm_id, 'contactado', 'Clase A', 28000.00, 35000.00, 'Prefiere automático, color blanco'),
        (jose_id, audi_cm_id, 'perdido', 'A3', 30000.00, 38000.00, 'No se ajusta al presupuesto, busca más económico'),
        (laura_id, toyota_cm_id, 'convertido', 'RAV4', 32000.00, 38000.00, 'Compra realizada, entrega en 2 semanas'),
        (david_id, bmw_cm_id, 'calificado', 'X1', 38000.00, 45000.00, 'Interesado en SUV, financiación aprobada')
    ON CONFLICT DO NOTHING;
END $$;

-- Insertar conversaciones de ejemplo
DO $$
DECLARE
    maria_id UUID;
    carlos_id UUID;
    ana_id UUID;
    conv_maria_id UUID;
    conv_carlos_id UUID;
    conv_ana_id UUID;
BEGIN
    -- Obtener IDs de leads
    SELECT lead_id INTO maria_id FROM leads WHERE email = 'maria.gonzalez@email.com';
    SELECT lead_id INTO carlos_id FROM leads WHERE email = 'carlos.rodriguez@email.com';
    SELECT lead_id INTO ana_id FROM leads WHERE email = 'ana.martin@email.com';

    -- Insertar conversaciones
    INSERT INTO conversaciones (lead_id, canal, estado) VALUES
        (maria_id, 'whatsapp', 'activa'),
        (carlos_id, 'call', 'activa'),
        (ana_id, 'email', 'cerrada')
    RETURNING conversacion_id INTO conv_maria_id, conv_carlos_id, conv_ana_id;

    -- Obtener IDs de conversaciones para mensajes
    SELECT conversacion_id INTO conv_maria_id FROM conversaciones WHERE lead_id = maria_id AND canal = 'whatsapp';
    SELECT conversacion_id INTO conv_carlos_id FROM conversaciones WHERE lead_id = carlos_id AND canal = 'call';
    SELECT conversacion_id INTO conv_ana_id FROM conversaciones WHERE lead_id = ana_id AND canal = 'email';

    -- Insertar mensajes de ejemplo
    INSERT INTO lead_messages (conversacion_id, lead_id, tipo, contenido, sender, timestamp_mensaje) VALUES
        -- Conversación María (WhatsApp)
        (conv_maria_id, maria_id, 'whatsapp', 'Hola, me interesa el Toyota Corolla Hybrid. ¿Podrían enviarme más información?', 'lead', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        (conv_maria_id, maria_id, 'system', 'Mensaje automático enviado con información del vehículo', 'system', CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes'),
        (conv_maria_id, maria_id, 'whatsapp', 'Perfecto, gracias. ¿Cuándo podría visitarlos para una prueba de manejo?', 'lead', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes'),

        -- Conversación Carlos (Llamada)
        (conv_carlos_id, carlos_id, 'call', 'Llamada realizada - Interesado en BMW Serie 3, solicita segunda llamada', 'agent', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (conv_carlos_id, carlos_id, 'system', 'Llamada de seguimiento programada para mañana a las 10:00', 'system', CURRENT_TIMESTAMP - INTERVAL '23 hours'),

        -- Conversación Ana (Email)
        (conv_ana_id, ana_id, 'email', 'Consulta sobre Mercedes Clase A - Solicita información de precios', 'lead', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (conv_ana_id, ana_id, 'email', 'Información enviada sobre Mercedes Clase A con configuraciones disponibles', 'agent', CURRENT_TIMESTAMP - INTERVAL '2 days 20 hours')
    ON CONFLICT DO NOTHING;
END $$;

-- Insertar workflows de ejemplo
INSERT INTO workflows (n8n_workflow_id, nombre, descripcion, url_webhook, activo, configuracion) VALUES
    ('wf_001', 'Seguimiento Automático Toyota', 'Workflow para seguimiento de leads interesados en Toyota', 'https://n8n.example.com/webhook/toyota-follow', true, '{"interval": "24h", "retries": 3}'),
    ('wf_002', 'Llamadas BMW Premium', 'Workflow de llamadas para leads BMW con presupuesto alto', 'https://n8n.example.com/webhook/bmw-calls', true, '{"call_delay": "2h", "max_calls": 5}'),
    ('wf_003', 'Email Marketing Mercedes', 'Workflow de email marketing para leads Mercedes', 'https://n8n.example.com/webhook/mercedes-email', false, '{"email_template": "mercedes_promo", "send_time": "09:00"}'),
    ('wf_004', 'WhatsApp Audi', 'Workflow de WhatsApp automático para Audi', 'https://n8n.example.com/webhook/audi-whatsapp', true, '{"whatsapp_template": "audi_greeting", "delay": "30m"}')
ON CONFLICT (n8n_workflow_id) DO NOTHING;

-- Insertar llamadas de ejemplo
DO $$
DECLARE
    maria_id UUID;
    carlos_id UUID;
    david_id UUID;
    wf_toyota_id UUID;
    wf_bmw_id UUID;
BEGIN
    -- Obtener IDs necesarios
    SELECT lead_id INTO maria_id FROM leads WHERE email = 'maria.gonzalez@email.com';
    SELECT lead_id INTO carlos_id FROM leads WHERE email = 'carlos.rodriguez@email.com';
    SELECT lead_id INTO david_id FROM leads WHERE email = 'david.fernandez@email.com';

    SELECT workflow_id INTO wf_toyota_id FROM workflows WHERE n8n_workflow_id = 'wf_001';
    SELECT workflow_id INTO wf_bmw_id FROM workflows WHERE n8n_workflow_id = 'wf_002';

    -- Insertar llamadas
    INSERT INTO llamadas (lead_id, workflow_id, numero_origen, numero_destino, estado, duracion, costo, latencia, proveedor, call_sid, fecha_llamada) VALUES
        -- Llamadas exitosas
        (maria_id, wf_toyota_id, '+34911234567', '+34612345678', 'successful', 245, 0.15, 850, 'Twilio', 'CA1234567890abcdef1', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (carlos_id, wf_bmw_id, '+34933456789', '+34623456789', 'successful', 382, 0.22, 920, 'Twilio', 'CA1234567890abcdef2', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
        (david_id, wf_bmw_id, '+34933456789', '+34667890123', 'successful', 156, 0.12, 750, 'Twilio', 'CA1234567890abcdef3', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

        -- Llamadas fallidas
        (maria_id, wf_toyota_id, '+34911234567', '+34612345678', 'no_answer', 0, 0.05, 1200, 'Twilio', 'CA1234567890abcdef4', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
        (carlos_id, wf_bmw_id, '+34933456789', '+34623456789', 'busy', 0, 0.05, 680, 'Twilio', 'CA1234567890abcdef5', CURRENT_TIMESTAMP - INTERVAL '1 hour'),

        -- Llamadas con errores
        (david_id, wf_bmw_id, '+34933456789', '+34667890123', 'failed', 0, 0.02, 5000, 'Twilio', 'CA1234567890abcdef6', CURRENT_TIMESTAMP - INTERVAL '30 minutes')
    ON CONFLICT DO NOTHING;
END $$;

-- Insertar errores de ejemplo
DO $$
DECLARE
    wf_toyota_id UUID;
    wf_bmw_id UUID;
    maria_id UUID;
    carlos_id UUID;
BEGIN
    SELECT workflow_id INTO wf_toyota_id FROM workflows WHERE n8n_workflow_id = 'wf_001';
    SELECT workflow_id INTO wf_bmw_id FROM workflows WHERE n8n_workflow_id = 'wf_002';
    SELECT lead_id INTO maria_id FROM leads WHERE email = 'maria.gonzalez@email.com';
    SELECT lead_id INTO carlos_id FROM leads WHERE email = 'carlos.rodriguez@email.com';

    INSERT INTO workflow_errors (workflow_id, lead_id, titulo, descripcion, tipo, severidad, estado, leads_afectados, detalles) VALUES
        (wf_toyota_id, NULL, 'Error de conexión API n8n', 'Fallo al conectar con el endpoint de workflows. La API no responde correctamente.', 'connection', 'critical', 'pending', 12, '{"error": "Connection timeout after 30 seconds", "endpoint": "https://n8n.example.com/api/workflows/1/execute", "lastAttempt": "2024-01-15T14:35:00Z", "retryCount": 3}'),
        (NULL, carlos_id, 'Datos faltantes en lead', 'El lead no tiene número de teléfono configurado, imposible ejecutar llamada automática.', 'data', 'warning', 'pending', 1, '{"error": "Missing required field: phone_number", "leadId": "carlos_id", "leadName": "Carlos Rodríguez", "missingFields": ["phone_number"]}'),
        (wf_bmw_id, NULL, 'Límite de llamadas alcanzado', 'Se ha alcanzado el límite diario de llamadas del plan actual. Las siguientes llamadas se ejecutarán mañana.', 'limit', 'warning', 'resolved', 5, '{"limit": 1000, "used": 1000, "resetTime": "2024-01-15T00:00:00Z", "currentUsage": "1000/1000"}'),
        (wf_toyota_id, NULL, 'Workflow pausado por errores', 'El workflow se ha pausado automáticamente debido a múltiples errores consecutivos en las llamadas.', 'workflow', 'error', 'investigating', 8, '{"errorCount": 15, "consecutiveErrors": 8, "lastError": "SMS provider authentication failed", "pausedAt": "2024-01-14T09:30:00Z"})
    ON CONFLICT DO NOTHING;
END $$;

-- ====================
-- VERIFICAR DATOS INSERTADOS
-- ====================

-- Resumen de datos insertados
SELECT
    'Leads' as tabla,
    COUNT(*) as cantidad
FROM leads
WHERE activo = true

UNION ALL

SELECT
    'Concesionarios' as tabla,
    COUNT(*) as cantidad
FROM concesionarios

UNION ALL

SELECT
    'Intentos de Compra' as tabla,
    COUNT(*) as cantidad
FROM lead_concesionario_marca

UNION ALL

SELECT
    'Mensajes' as tabla,
    COUNT(*) as cantidad
FROM lead_messages

UNION ALL

SELECT
    'Llamadas' as tabla,
    COUNT(*) as cantidad
FROM llamadas

UNION ALL

SELECT
    'Workflows' as tabla,
    COUNT(*) as cantidad
FROM workflows

UNION ALL

SELECT
    'Errores' as tabla,
    COUNT(*) as cantidad
FROM workflow_errors

ORDER BY tabla;