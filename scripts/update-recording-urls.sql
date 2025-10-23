-- =====================================================
-- ACTUALIZAR URLs DE GRABACIÓN CON URL REAL DE RETELL AI
-- =====================================================

-- Actualizar las llamadas exitosas con la URL real de grabación
UPDATE llamadas
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{recording_url}',
  '"https://dxc03zgurdly9.cloudfront.net/5e4a8834a3af92d972f813a37ee68134bda6a1e83cbc1cbdae85829982215ece/recording.wav"'
)
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'
  AND estado = 'successful'
  AND metadata IS NOT NULL
  AND metadata ? 'recording_url';

-- Verificar las actualizaciones
SELECT
  llamada_id,
  fecha_llamada,
  estado,
  duracion,
  metadata->>'recording_url' as url_grabacion,
  metadata->>'agente_nombre' as agente
FROM llamadas
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'
  AND estado = 'successful'
ORDER BY fecha_llamada DESC;
