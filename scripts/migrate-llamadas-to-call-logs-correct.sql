-- =====================================================
-- MIGRACIÓN CORRECTA: llamadas -> call_logs
-- =====================================================
-- Mapeo de columnas de llamadas a call_logs
-- =====================================================

-- IMPORTANTE: call_logs requiere lead_concesionario_marca_id
-- Si las llamadas no tienen esta relación, necesitamos asignar una por defecto

INSERT INTO call_logs (
    call_id,
    lead_id,
    lead_concesionario_marca_id,
    canal,
    resultado,
    exitoso,
    duracion_ms,
    telefono,
    created_at,
    start_call,
    output_data
)
SELECT
    ll.llamada_id as call_id,
    ll.lead_id,
    -- Intentar obtener el lead_concesionario_marca_id del lead
    COALESCE(
        (SELECT lcm.lead_concesionario_marca_id
         FROM lead_concesionario_marca lcm
         WHERE lcm.lead_id = ll.lead_id
         LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid -- UUID nulo si no existe
    ) as lead_concesionario_marca_id,
    COALESCE(ll.proveedor, 'telefono') as canal, -- Twilio -> telefono, o 'telefono' por defecto
    ll.estado as resultado, -- successful, failed, no_answer, busy, etc.
    CASE
        WHEN ll.estado = 'successful' THEN true
        ELSE false
    END as exitoso,
    COALESCE(ll.duracion * 1000, 0) as duracion_ms, -- Convertir segundos a milisegundos
    ll.numero_destino as telefono,
    ll.created_at,
    ll.fecha_llamada as start_call,
    ll.metadata as output_data
FROM llamadas ll
ON CONFLICT (call_id) DO NOTHING;

-- Verificar migración
SELECT
    (SELECT COUNT(*) FROM llamadas) as llamadas_total,
    (SELECT COUNT(*) FROM call_logs) as call_logs_total,
    (SELECT COUNT(*) FROM call_logs WHERE canal = 'telefono' OR canal = 'Twilio') as migradas_de_llamadas;
