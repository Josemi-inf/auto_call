-- =====================================================
-- INSERTAR DATOS DE EJEMPLO PARA LA PÁGINA DE LEADS
-- Lead: Josemi Castro (6ab97b01-c160-42c6-9a63-16308cb0d31b)
-- =====================================================

-- 1. CREAR RELACIONES LEAD-CONCESIONARIO-MARCA
-- =====================================================

-- Relación 1: Hyundauto SEV - Hyundai (ALTA prioridad)
INSERT INTO lead_concesionario_marca (
  lead_id,
  concesionario_marca_id,
  fecha_entrada,
  estado,
  prioridad,
  modelo,
  combustible,
  transmision,
  presupuesto_min,
  presupuesto_max,
  urgencia,
  notas,
  proxima_accion,
  fecha_proxima_accion
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'cef7c5ac-a53c-4dec-84a0-db23c1d2fdb7', -- Hyundauto SEV - Hyundai
  NOW() - INTERVAL '5 days',
  'contactado',
  1, -- Alta prioridad
  'Tucson Tecno 1.6 T-GDi Híbrido 48V 180CV',
  'Híbrido',
  'Automático',
  32000,
  38000,
  'alta',
  'Cliente muy interesado, quiere prueba de manejo este fin de semana. Tiene Nissan Qashqai 2018 (95.000km) valorado en 12.000€',
  'Prueba de manejo programada + preparar documentación financiación',
  NOW() + INTERVAL '1 day'
);

-- Relación 2: KIA Mobilify - KIA (MEDIA prioridad)
INSERT INTO lead_concesionario_marca (
  lead_id,
  concesionario_marca_id,
  fecha_entrada,
  estado,
  prioridad,
  modelo,
  combustible,
  transmision,
  presupuesto_min,
  presupuesto_max,
  urgencia,
  notas,
  proxima_accion,
  fecha_proxima_accion
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'e69e32b7-a883-4823-bfc3-8c0fd546e0cb', -- KIA Mobilify - KIA
  NOW() - INTERVAL '3 days',
  'interesado',
  2, -- Media prioridad
  'Sportage Drive 1.6 T-GDi 150CV',
  'Gasolina',
  'Manual',
  28000,
  33000,
  'media',
  'Comparando opciones con Hyundai. Pendiente de enviar oferta personalizada',
  'Enviar oferta personalizada por email con desglose detallado',
  NOW() + INTERVAL '2 days'
);

-- Relación 3: Automocion Terry SEV - CUPRA (BAJA prioridad)
INSERT INTO lead_concesionario_marca (
  lead_id,
  concesionario_marca_id,
  fecha_entrada,
  estado,
  prioridad,
  modelo,
  combustible,
  transmision,
  presupuesto_min,
  presupuesto_max,
  urgencia,
  notas
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '3e4c072b-3444-4a2a-a15d-b585b1cfbb3d', -- Automocion Terry SEV - CUPRA
  NOW() - INTERVAL '1 day',
  'nuevo',
  3, -- Baja prioridad
  'Formentor VZ 2.0 TSI 310CV DSG 4Drive',
  'Gasolina',
  'Automático',
  40000,
  45000,
  'baja',
  'Opción secundaria. Presupuesto podría estar ajustado. No priorizar'
);

-- =====================================================
-- 2. CREAR LLAMADAS EN CALL_LOGS
-- =====================================================

-- Llamada 1: Exitosa con Hyundai (hace 4 días)
INSERT INTO call_logs (
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
  metadata
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '+34954123456',
  '34656191247',
  'successful',
  245,
  0.15,
  120,
  'Twilio',
  'CA' || MD5(random()::text),
  NOW() - INTERVAL '4 days 2 hours',
  jsonb_build_object(
    'recording_url', 'https://api.twilio.com/recordings/RE1234567890',
    'transcription', 'Cliente confirma interés en Hyundai Tucson. Agenda prueba de manejo para el sábado a las 11:00. Pregunta por opciones de financiación.',
    'agente_nombre', 'María González',
    'notas', 'Cliente educado y decidido. Tiene vehículo usado para entregar.'
  )
);

-- Llamada 2: Sin respuesta con KIA (hace 3 días)
INSERT INTO call_logs (
  lead_id,
  numero_origen,
  numero_destino,
  estado,
  latencia,
  proveedor,
  call_sid,
  fecha_llamada,
  metadata
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '+34954987654',
  '34656191247',
  'no_answer',
  95,
  'Twilio',
  'CA' || MD5(random()::text),
  NOW() - INTERVAL '3 days 5 hours',
  jsonb_build_object(
    'agente_nombre', 'Carlos Ruiz',
    'notas', 'No contesta. Buzón de voz activado. Dejado mensaje.'
  )
);

-- Llamada 3: Exitosa con KIA (hace 2 días) - seguimiento
INSERT INTO call_logs (
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
  metadata
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '+34954987654',
  '34656191247',
  'successful',
  180,
  0.12,
  85,
  'Twilio',
  'CA' || MD5(random()::text),
  NOW() - INTERVAL '2 days 3 hours',
  jsonb_build_object(
    'recording_url', 'https://api.twilio.com/recordings/RE0987654321',
    'transcription', 'Cliente devuelve llamada. Interesado en KIA Sportage. Solicita información sobre garantías y mantenimiento incluido.',
    'agente_nombre', 'Carlos Ruiz',
    'notas', 'Cliente compara opciones. Enviar oferta por email con desglose detallado.'
  )
);

-- Llamada 4: Fallida con CUPRA (hace 1 día)
INSERT INTO call_logs (
  lead_id,
  numero_origen,
  numero_destino,
  estado,
  latencia,
  proveedor,
  call_sid,
  fecha_llamada,
  metadata
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '+34955111222',
  '34656191247',
  'busy',
  110,
  'Twilio',
  'CA' || MD5(random()::text),
  NOW() - INTERVAL '1 day 4 hours',
  jsonb_build_object(
    'agente_nombre', 'Laura Martínez',
    'notas', 'Línea ocupada. Reintentar en 2 horas.'
  )
);

-- Llamada 5: Exitosa reciente con Hyundai (hace 6 horas)
INSERT INTO call_logs (
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
  metadata
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '+34954123456',
  '34656191247',
  'successful',
  320,
  0.18,
  75,
  'Twilio',
  'CA' || MD5(random()::text),
  NOW() - INTERVAL '6 hours',
  jsonb_build_object(
    'recording_url', 'https://api.twilio.com/recordings/RE1122334455',
    'transcription', 'Confirmación de prueba de manejo para mañana sábado 11:00. Cliente pregunta si puede llevar a su esposa. Confirma dirección del concesionario.',
    'agente_nombre', 'María González',
    'notas', 'Cliente muy positivo. Alta probabilidad de cierre. Preparar documentación de financiación.'
  )
);

-- =====================================================
-- 3. CREAR MENSAJES DE WHATSAPP
-- =====================================================

-- Mensaje 1: Recibido del lead (hace 4 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  respondido,
  created_at,
  delivered_at,
  read_at,
  replied_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'recibido',
  'Hola, he visto su anuncio del Hyundai Tucson. ¿Está disponible para prueba de manejo?',
  false,
  false,
  false,
  true,
  NOW() - INTERVAL '4 days 10 hours',
  NOW() - INTERVAL '4 days 10 hours',
  NOW() - INTERVAL '4 days 10 hours',
  NOW() - INTERVAL '4 days 9 hours'
);

-- Mensaje 2: Enviado por agente (hace 4 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  respondido,
  created_at,
  delivered_at,
  read_at,
  replied_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'enviado',
  '¡Hola Josemi! 👋 Claro que sí, el Hyundai Tucson está disponible. ¿Qué día te viene mejor para la prueba? Estamos disponibles de lunes a sábado de 9:00 a 20:00.',
  true,
  true,
  true,
  true,
  NOW() - INTERVAL '4 days 9 hours',
  NOW() - INTERVAL '4 days 9 hours',
  NOW() - INTERVAL '4 days 8 hours 30 minutes',
  NOW() - INTERVAL '4 days 8 hours'
);

-- Mensaje 3: Recibido del lead (hace 4 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  respondido,
  created_at,
  delivered_at,
  read_at,
  replied_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'recibido',
  'Perfecto! El sábado me vendría bien. ¿Sobre las 11:00?',
  false,
  false,
  false,
  true,
  NOW() - INTERVAL '4 days 8 hours',
  NOW() - INTERVAL '4 days 8 hours',
  NOW() - INTERVAL '4 days 8 hours',
  NOW() - INTERVAL '4 days 7 hours 45 minutes'
);

-- Mensaje 4: Enviado por agente (hace 4 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  created_at,
  delivered_at,
  read_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'enviado',
  'Perfecto Josemi! 📅 Te esperamos el sábado a las 11:00 en Hyundauto Sevilla (Av. de la Innovación 7). Te envío la ubicación 📍',
  true,
  true,
  true,
  NOW() - INTERVAL '4 days 7 hours 45 minutes',
  NOW() - INTERVAL '4 days 7 hours 45 minutes',
  NOW() - INTERVAL '4 days 7 hours 30 minutes'
);

-- Mensaje 5: Recibido sobre KIA (hace 2 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  respondido,
  created_at,
  delivered_at,
  read_at,
  replied_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'recibido',
  'Buenos días, también estoy mirando el KIA Sportage. ¿Podrían enviarme una oferta?',
  false,
  false,
  false,
  true,
  NOW() - INTERVAL '2 days 5 hours',
  NOW() - INTERVAL '2 days 5 hours',
  NOW() - INTERVAL '2 days 5 hours',
  NOW() - INTERVAL '2 days 4 hours'
);

-- Mensaje 6: Enviado por agente KIA (hace 2 días)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  created_at,
  delivered_at,
  read_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'enviado',
  'Buenos días Josemi! 🚗 Por supuesto, te preparo una oferta personalizada del KIA Sportage. ¿Tienes vehículo para entregar? Te la envío en las próximas 2 horas por email.',
  true,
  true,
  true,
  NOW() - INTERVAL '2 days 4 hours',
  NOW() - INTERVAL '2 days 4 hours',
  NOW() - INTERVAL '2 days 3 hours'
);

-- Mensaje 7: Recibido confirmación (hace 6 horas)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  respondido,
  created_at,
  delivered_at,
  read_at,
  replied_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'recibido',
  '¿Puedo llevar a mi mujer a la prueba del Tucson mañana?',
  false,
  false,
  false,
  true,
  NOW() - INTERVAL '6 hours 30 minutes',
  NOW() - INTERVAL '6 hours 30 minutes',
  NOW() - INTERVAL '6 hours 30 minutes',
  NOW() - INTERVAL '6 hours 15 minutes'
);

-- Mensaje 8: Enviado confirmación (hace 6 horas)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  created_at,
  delivered_at,
  read_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'enviado',
  'Por supuesto! 👫 No hay problema, estaremos encantados de atenderlos a ambos. Os esperamos mañana a las 11:00. ¡Hasta entonces!',
  true,
  true,
  true,
  NOW() - INTERVAL '6 hours 15 minutes',
  NOW() - INTERVAL '6 hours 15 minutes',
  NOW() - INTERVAL '6 hours 10 minutes'
);

-- Mensaje 9: Automático de seguimiento (hace 1 hora)
INSERT INTO lead_messages (
  lead_id,
  tipo_mensaje,
  contenido,
  enviado,
  entregado,
  leido,
  created_at,
  delivered_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  'enviado',
  '🔔 Recordatorio: Mañana tienes tu prueba de manejo del Hyundai Tucson a las 11:00. ¿Necesitas que te enviemos de nuevo la dirección? Responde SÍ o NO.',
  true,
  true,
  false,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
);

-- =====================================================
-- 4. CREAR TABLA Y DATOS DE NOTAS
-- =====================================================

-- Crear tabla de notas si no existe
CREATE TABLE IF NOT EXISTS lead_notes (
  nota_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  lead_concesionario_marca_id UUID,
  usuario_id UUID,
  contenido TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
  FOREIGN KEY (lead_concesionario_marca_id) REFERENCES lead_concesionario_marca(lead_concesionario_marca_id) ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lcm_id ON lead_notes(lead_concesionario_marca_id);

-- Nota 1: General sobre el lead
INSERT INTO lead_notes (
  lead_id,
  contenido,
  created_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '🎯 Lead de alta calidad. Cliente serio y decidido. Tiene vehículo usado (Nissan Qashqai 2018) valorado en 12.000€ aproximadamente. Busca SUV familiar con buen equipamiento.',
  NOW() - INTERVAL '5 days'
);

-- Nota 2: Específica para Hyundai (necesitamos el ID de la relación)
INSERT INTO lead_notes (
  lead_id,
  lead_concesionario_marca_id,
  contenido,
  created_at
)
SELECT
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  lead_concesionario_marca_id,
  '✅ Primera opción del cliente. Le gusta el diseño y la tecnología del Tucson. Importante: quiere la versión híbrida por consumo. Valorar descuento adicional si cierra esta semana.',
  NOW() - INTERVAL '4 days'
FROM lead_concesionario_marca
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'
  AND concesionario_marca_id = 'cef7c5ac-a53c-4dec-84a0-db23c1d2fdb7'
LIMIT 1;

-- Nota 3: Específica para KIA
INSERT INTO lead_notes (
  lead_id,
  lead_concesionario_marca_id,
  contenido,
  created_at
)
SELECT
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  lead_concesionario_marca_id,
  '🤔 Cliente compara entre Hyundai Tucson y KIA Sportage. Ventaja: garantía de 7 años de KIA. Desventaja: precio ligeramente superior. Preparar oferta competitiva con extras incluidos.',
  NOW() - INTERVAL '2 days'
FROM lead_concesionario_marca
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'
  AND concesionario_marca_id = 'e69e32b7-a883-4823-bfc3-8c0fd546e0cb'
LIMIT 1;

-- Nota 4: Específica para CUPRA
INSERT INTO lead_notes (
  lead_id,
  lead_concesionario_marca_id,
  contenido,
  created_at
)
SELECT
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  lead_concesionario_marca_id,
  '⚠️ Opción secundaria. Cliente menciona CUPRA Formentor pero presupuesto podría ser ajustado. No priorizar a menos que caigan otras opciones. Esperar a ver resultado de prueba Hyundai.',
  NOW() - INTERVAL '1 day'
FROM lead_concesionario_marca
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'
  AND concesionario_marca_id = '3e4c072b-3444-4a2a-a15d-b585b1cfbb3d'
LIMIT 1;

-- Nota 5: Seguimiento reciente
INSERT INTO lead_notes (
  lead_id,
  contenido,
  created_at
)
VALUES (
  '6ab97b01-c160-42c6-9a63-16308cb0d31b',
  '📞 Última llamada muy positiva. Cliente confirma asistencia a prueba de manejo con esposa. Preparar: 1) Documentación financiación, 2) Tasación oficial vehículo usado, 3) Oferta por escrito con descuentos. Alta probabilidad de cierre post-prueba.',
  NOW() - INTERVAL '5 hours'
);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

SELECT '✅ Datos insertados correctamente' as mensaje;

-- Resumen de datos
SELECT
  'lead_concesionario_marca' as tabla,
  COUNT(*) as registros
FROM lead_concesionario_marca
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'

UNION ALL

SELECT
  'call_logs' as tabla,
  COUNT(*) as registros
FROM call_logs
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'

UNION ALL

SELECT
  'lead_messages' as tabla,
  COUNT(*) as registros
FROM lead_messages
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b'

UNION ALL

SELECT
  'lead_notes' as tabla,
  COUNT(*) as registros
FROM lead_notes
WHERE lead_id = '6ab97b01-c160-42c6-9a63-16308cb0d31b';
