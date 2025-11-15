// ========================================
// RETELL AI - EXTRACTOR DE VARIABLES DE LEAD
// Extrae todas las variables necesarias del webhook de RetellAI
// para actualizar el estado del lead, scoring y acciones
// ========================================

const retellData = $input.first().json;

console.log('🔍 Procesando datos de RetellAI...');
console.log('Call ID:', retellData.call?.call_id || 'N/A');

// ========================================
// 1. EXTRAER INFORMACIÓN BÁSICA DE LA LLAMADA
// ========================================
const callInfo = {
  // IDs y referencias
  call_id_retell: retellData.call?.call_id || null,
  agent_id: retellData.call?.agent_id || null,

  // Números de teléfono
  from_number: retellData.call?.from_number || retellData.from_number || null,
  to_number: retellData.call?.to_number || retellData.to_number || null,

  // Dirección de la llamada
  direction: retellData.call?.direction || retellData.direction || 'outbound',

  // Tiempos de la llamada
  start_timestamp: retellData.call?.start_timestamp || null,
  end_timestamp: retellData.call?.end_timestamp || null,

  // Duración (convertir a milisegundos si viene en segundos)
  duration_ms: retellData.call?.call_duration_ms ||
               (retellData.call?.duration_seconds ? retellData.call.duration_seconds * 1000 : 0),

  // Estado de la llamada
  call_status: retellData.call?.call_status || 'completed',
  disconnect_reason: retellData.call?.disconnect_reason || retellData.call?.end_reason || null,

  // Costos
  audio_cost: retellData.call?.audio_cost || 0,
  llm_cost: retellData.call?.llm_cost || 0,
  total_cost: retellData.call?.total_cost || 0,

  // Transcripción
  transcript: retellData.call?.transcript || retellData.transcript || '',
  recording_url: retellData.call?.recording_url || retellData.call?.call_recording_url || null,

  // Uso de tokens LLM
  llm_token_usage: retellData.llm_token_usage || {},
};

console.log('📞 Información de llamada extraída');
console.log('- Duración:', callInfo.duration_ms, 'ms');
console.log('- Estado:', callInfo.call_status);
console.log('- Dirección:', callInfo.direction);

// ========================================
// 2. EXTRAER VARIABLES PERSONALIZADAS Y OUTPUT
// ========================================
const customData = retellData.call?.call_analysis ||
                   retellData.call?.metadata ||
                   retellData.metadata ||
                   {};

// Extraer resumen de la llamada
const resumen_llamada = retellData.resumen_llamada ||
                        customData.resumen_llamada ||
                        customData.call_summary ||
                        customData.summary ||
                        '';

// Extraer intención del cliente
const customer_intent = customData.customer_intent ||
                       customData.intencion_cliente ||
                       customData.intent ||
                       '';

// Extraer nivel de interés
const interest_level = customData.interest_level ||
                      customData.nivel_interes ||
                      '';

// Extraer producto/modelo de interés
const producto_interes = customData.producto_interes ||
                        customData.product_interest ||
                        customData.modelo ||
                        '';

// Extraer siguiente acción sugerida
const next_action = customData.next_action ||
                   customData.proxima_accion ||
                   customData.suggested_action ||
                   '';

// Extraer si se solicitó callback
const callback_requested = customData.callback_requested ||
                          customData.solicita_callback ||
                          false;

// Extraer si se agendó cita
const appointment_scheduled = customData.appointment_scheduled ||
                             customData.cita_agendada ||
                             false;

// Extraer fecha de cita si existe
const appointment_date = customData.appointment_date ||
                        customData.fecha_cita ||
                        null;

// Extraer presupuesto mencionado
const budget_mentioned = customData.budget_mentioned ||
                        customData.presupuesto_mencionado ||
                        null;

// Extraer urgencia detectada
const urgency_detected = customData.urgency ||
                        customData.urgencia ||
                        'media';

// Extraer sentimiento del cliente
const customer_sentiment = customData.sentiment ||
                          customData.sentimiento ||
                          'neutral';

// Extraer objeciones mencionadas
const objections = customData.objections ||
                  customData.objeciones ||
                  [];

// Extraer puntos de dolor (pain points)
const pain_points = customData.pain_points ||
                   customData.puntos_dolor ||
                   [];

// Extraer preferencias detectadas
const preferences = customData.preferences ||
                   customData.preferencias ||
                   {};

console.log('📊 Variables personalizadas extraídas');
console.log('- Resumen:', resumen_llamada.substring(0, 50) + '...');
console.log('- Nivel de interés:', interest_level);
console.log('- Urgencia:', urgency_detected);

// ========================================
// 3. DETERMINAR ESTADO DEL LEAD
// ========================================
let nuevo_estado_lead = 'contactado';
let exitoso = false;

// Analizar el estado basado en la llamada
if (callInfo.call_status === 'completed') {
  exitoso = true;

  // Determinar estado según nivel de interés
  if (appointment_scheduled) {
    nuevo_estado_lead = 'cita_agendada';
  } else if (interest_level === 'high' || interest_level === 'alto') {
    nuevo_estado_lead = 'muy_interesado';
  } else if (interest_level === 'medium' || interest_level === 'medio') {
    nuevo_estado_lead = 'interesado';
  } else if (interest_level === 'low' || interest_level === 'bajo') {
    nuevo_estado_lead = 'poco_interes';
  } else if (customer_intent === 'not_interested' || customer_sentiment === 'negative') {
    nuevo_estado_lead = 'no_interesado';
  } else {
    nuevo_estado_lead = 'en_seguimiento';
  }
} else if (callInfo.disconnect_reason === 'user_hangup') {
  nuevo_estado_lead = 'llamada_colgada';
  exitoso = false;
} else if (callInfo.call_status === 'no-answer' || callInfo.call_status === 'busy') {
  nuevo_estado_lead = 'sin_contacto';
  exitoso = false;
} else {
  nuevo_estado_lead = 'intento_fallido';
  exitoso = false;
}

console.log('📋 Estado determinado:', nuevo_estado_lead);
console.log('✓ Exitoso:', exitoso);

// ========================================
// 4. CALCULAR LEAD SCORING INCREMENTAL
// ========================================
let lead_score_increment = 0;

// Puntos por completar la llamada
if (exitoso) {
  lead_score_increment += 10;
}

// Puntos por duración de llamada
const duration_minutes = callInfo.duration_ms / 1000 / 60;
if (duration_minutes >= 5) {
  lead_score_increment += 15;
} else if (duration_minutes >= 3) {
  lead_score_increment += 10;
} else if (duration_minutes >= 1) {
  lead_score_increment += 5;
}

// Puntos por nivel de interés
if (interest_level === 'high' || interest_level === 'alto') {
  lead_score_increment += 20;
} else if (interest_level === 'medium' || interest_level === 'medio') {
  lead_score_increment += 10;
} else if (interest_level === 'low' || interest_level === 'bajo') {
  lead_score_increment += 5;
}

// Puntos por acciones positivas
if (appointment_scheduled) {
  lead_score_increment += 25;
}
if (callback_requested) {
  lead_score_increment += 15;
}
if (budget_mentioned) {
  lead_score_increment += 10;
}

// Penalización por sentimiento negativo
if (customer_sentiment === 'negative' || customer_sentiment === 'negativo') {
  lead_score_increment -= 10;
}

// Puntos por urgencia
if (urgency_detected === 'high' || urgency_detected === 'alta') {
  lead_score_increment += 10;
} else if (urgency_detected === 'medium' || urgency_detected === 'media') {
  lead_score_increment += 5;
}

console.log('🎯 Incremento de score calculado:', lead_score_increment);

// ========================================
// 5. DETERMINAR CALIDAD DEL LEAD
// ========================================
let calidad_lead = 'tibio';

// Calidad basada en acciones
if (appointment_scheduled) {
  calidad_lead = 'muy_caliente';
} else if (interest_level === 'high' || interest_level === 'alto') {
  calidad_lead = 'caliente';
} else if (callback_requested || interest_level === 'medium') {
  calidad_lead = 'tibio';
} else if (interest_level === 'low' || customer_sentiment === 'negative') {
  calidad_lead = 'frio';
}

console.log('🌡️ Calidad del lead:', calidad_lead);

// ========================================
// 6. DETERMINAR PRÓXIMA ACCIÓN Y PRIORIDAD
// ========================================
let proxima_accion = '';
let fecha_proxima_accion = null;
let prioridad = 3; // Media por defecto

if (appointment_scheduled && appointment_date) {
  proxima_accion = `Cita agendada para ${appointment_date}`;
  fecha_proxima_accion = appointment_date;
  prioridad = 1; // Alta prioridad
} else if (callback_requested) {
  proxima_accion = 'Cliente solicitó que le devuelvan la llamada';
  // Programar callback para dentro de 2 horas
  const callbackDate = new Date();
  callbackDate.setHours(callbackDate.getHours() + 2);
  fecha_proxima_accion = callbackDate.toISOString();
  prioridad = 2; // Prioridad media-alta
} else if (next_action) {
  proxima_accion = next_action;
  // Programar acción para mañana
  const nextActionDate = new Date();
  nextActionDate.setDate(nextActionDate.getDate() + 1);
  fecha_proxima_accion = nextActionDate.toISOString();
  prioridad = 3;
} else if (interest_level === 'high' || interest_level === 'alto') {
  proxima_accion = 'Seguimiento inmediato - Alto interés detectado';
  const followupDate = new Date();
  followupDate.setHours(followupDate.getHours() + 4);
  fecha_proxima_accion = followupDate.toISOString();
  prioridad = 1;
} else if (exitoso) {
  proxima_accion = 'Seguimiento en 2-3 días';
  const followupDate = new Date();
  followupDate.setDate(followupDate.getDate() + 2);
  fecha_proxima_accion = followupDate.toISOString();
  prioridad = 3;
} else {
  proxima_accion = 'Reintentar llamada en 24 horas';
  const retryDate = new Date();
  retryDate.setDate(retryDate.getDate() + 1);
  fecha_proxima_accion = retryDate.toISOString();
  prioridad = 4; // Baja prioridad
}

console.log('📅 Próxima acción:', proxima_accion);
console.log('⚡ Prioridad:', prioridad);

// ========================================
// 7. CONSTRUIR NOTAS AUTOMÁTICAS
// ========================================
const notas_llamada = [];

if (resumen_llamada) {
  notas_llamada.push(`📝 Resumen: ${resumen_llamada}`);
}

if (customer_intent) {
  notas_llamada.push(`🎯 Intención: ${customer_intent}`);
}

if (producto_interes) {
  notas_llamada.push(`🚗 Producto de interés: ${producto_interes}`);
}

if (budget_mentioned) {
  notas_llamada.push(`💰 Presupuesto mencionado: ${budget_mentioned}`);
}

if (objections && objections.length > 0) {
  notas_llamada.push(`⚠️ Objeciones: ${objections.join(', ')}`);
}

if (pain_points && pain_points.length > 0) {
  notas_llamada.push(`🔴 Puntos de dolor: ${pain_points.join(', ')}`);
}

if (preferences && Object.keys(preferences).length > 0) {
  const prefList = Object.entries(preferences).map(([k, v]) => `${k}: ${v}`).join(', ');
  notas_llamada.push(`✨ Preferencias: ${prefList}`);
}

const notas_completas = notas_llamada.join('\n');

console.log('📄 Notas generadas:', notas_llamada.length, 'líneas');

// ========================================
// 8. CONSTRUIR OUTPUT_DATA PARA CALL_LOGS
// ========================================
const output_data = {
  // Resumen y análisis
  resumen_llamada: resumen_llamada,
  customer_intent: customer_intent,
  interest_level: interest_level,
  customer_sentiment: customer_sentiment,
  urgency: urgency_detected,

  // Productos y preferencias
  producto_interes: producto_interes,
  preferences: preferences,
  budget_mentioned: budget_mentioned,

  // Acciones
  callback_requested: callback_requested,
  appointment_scheduled: appointment_scheduled,
  appointment_date: appointment_date,
  next_action: next_action,

  // Objeciones y puntos de dolor
  objections: objections,
  pain_points: pain_points,

  // Análisis LLM
  llm_token_usage: callInfo.llm_token_usage,

  // Datos adicionales de RetellAI
  opt_out_sensitive_data_storage: retellData.opt_out_sensitive_data_storage || false,
  data_storage_setting: retellData.data_storage_setting || 'everything',

  // Metadata completa
  raw_metadata: customData
};

console.log('📦 Output data construido');

// ========================================
// 9. RETORNAR TODAS LAS VARIABLES EXTRAÍDAS
// ========================================
const resultado = {
  // ==========================================
  // VARIABLES PARA ACTUALIZAR CALL_LOGS
  // ==========================================
  call_logs: {
    call_id_retell: callInfo.call_id_retell,
    telefono: callInfo.to_number,
    numero_llamada: 1, // Se debe calcular desde la BD
    resultado: callInfo.call_status,
    exitoso: exitoso,
    duracion_ms: callInfo.duration_ms,
    start_call: callInfo.start_timestamp,
    end_call: callInfo.end_timestamp,
    canal: 'retellai',
    agente_retell: callInfo.agent_id,
    call_retell: callInfo.call_id_retell,
    url_llamada: callInfo.recording_url,
    transcripccion: callInfo.transcript,
    audio_cost: callInfo.audio_cost,
    memory_cost: callInfo.llm_cost,
    input_data: {
      from_number: callInfo.from_number,
      to_number: callInfo.to_number,
      direction: callInfo.direction
    },
    output_data: output_data,
    error_message: callInfo.disconnect_reason !== 'user_hangup' ? callInfo.disconnect_reason : null
  },

  // ==========================================
  // VARIABLES PARA ACTUALIZAR LEADS
  // ==========================================
  leads: {
    estado_actual: nuevo_estado_lead,
    lead_score_increment: lead_score_increment, // Incrementar, no reemplazar
    calidad_lead: calidad_lead,
    last_contact_at: new Date().toISOString(),
    notas: notas_completas // Agregar a las notas existentes
  },

  // ==========================================
  // VARIABLES PARA ACTUALIZAR LEAD_CONCESIONARIO_MARCA
  // ==========================================
  lead_concesionario_marca: {
    estado: nuevo_estado_lead,
    urgencia: urgency_detected,
    prioridad: prioridad,
    modelo: producto_interes || undefined,
    presupuesto_min: budget_mentioned ? parseFloat(budget_mentioned.split('-')[0]) : undefined,
    presupuesto_max: budget_mentioned ? parseFloat(budget_mentioned.split('-')[1]) : undefined,
    fecha_proxima_accion: fecha_proxima_accion,
    next_action_at: fecha_proxima_accion,
    proxima_accion: proxima_accion,
    notas: notas_completas,
    // Preferencias específicas
    combustible_preferido: preferences.combustible || preferences.fuel_type || undefined,
    transmision: preferences.transmision || preferences.transmission || undefined
  },

  // ==========================================
  // VARIABLES PARA LEAD_MESSAGES (si se envía WhatsApp)
  // ==========================================
  lead_messages: {
    should_send_whatsapp: callback_requested || appointment_scheduled,
    whatsapp_template: appointment_scheduled ? 'confirmacion_cita' : 'seguimiento_llamada',
    whatsapp_variables: {
      nombre: '', // Se debe obtener de la BD
      producto: producto_interes,
      fecha_cita: appointment_date,
      resumen: resumen_llamada
    }
  },

  // ==========================================
  // METADATA ADICIONAL
  // ==========================================
  metadata: {
    processed_at: new Date().toISOString(),
    retellai_webhook_version: '1.0',
    extractor_version: '1.0',
    call_direction: callInfo.direction,
    call_duration_seconds: Math.round(callInfo.duration_ms / 1000)
  }
};

console.log('✅ Extracción completada exitosamente');
console.log('='.repeat(50));

// Retornar el resultado
return [{
  json: resultado
}];
