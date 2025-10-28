-- Agregar columna source a lead_concesionario_marca
-- Esta columna indica de dónde provino el interés del lead para esta marca/concesionario específico

ALTER TABLE lead_concesionario_marca
ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- Comentario descriptivo
COMMENT ON COLUMN lead_concesionario_marca.source IS 'Origen del interés del lead: web, facebook, instagram, google, referido, llamada, etc.';

-- Actualizar registros existentes con un valor por defecto si es necesario
UPDATE lead_concesionario_marca
SET source = 'sin_especificar'
WHERE source IS NULL;
