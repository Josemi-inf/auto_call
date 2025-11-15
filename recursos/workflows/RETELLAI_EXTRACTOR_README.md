# RetellAI Lead Variables Extractor

## 📋 Descripción

Este extractor procesa los webhooks de **RetellAI** y extrae todas las variables necesarias para actualizar completamente la información del lead en la base de datos, incluyendo:

- ✅ Estado del lead
- ✅ Lead scoring (puntuación)
- ✅ Calidad del lead
- ✅ Próxima acción y prioridad
- ✅ Notas automáticas
- ✅ Información de la llamada
- ✅ Análisis de sentimiento
- ✅ Intención del cliente
- ✅ Productos de interés
- ✅ Presupuesto mencionado
- ✅ Urgencia detectada
- ✅ Y mucho más...

## 🚀 Archivos Incluidos

### 1. `retellai-lead-extractor.js`
Código JavaScript/Node.js que contiene toda la lógica de extracción de variables. Este código debe copiarse dentro de un nodo **Code** de n8n.

**Características:**
- Extrae 50+ variables del webhook de RetellAI
- Calcula automáticamente el lead scoring
- Determina el estado del lead basado en la interacción
- Genera notas automáticas inteligentes
- Sugiere próximas acciones
- Calcula prioridad y urgencia

### 2. `5-retellai-webhook-processor.json`
Workflow completo de n8n listo para importar que demuestra cómo usar el extractor.

**Flujo del workflow:**
1. Recibe webhook de RetellAI
2. Extrae número de teléfono
3. Busca el lead en la base de datos
4. Extrae todas las variables del webhook
5. Inserta registro en `call_logs`
6. Actualiza tabla `leads`
7. Actualiza tabla `lead_concesionario_marca`
8. (Opcional) Envía WhatsApp de seguimiento
9. Recalcula lead score global
10. Retorna respuesta exitosa

## 📊 Variables Extraídas

### A) Para la tabla `call_logs`

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `call_id_retell` | String | ID de la llamada en RetellAI |
| `telefono` | String | Número de teléfono destino |
| `resultado` | String | Estado de la llamada (completed, failed, etc.) |
| `exitoso` | Boolean | Si la llamada fue exitosa |
| `duracion_ms` | Integer | Duración en milisegundos |
| `start_call` | Timestamp | Inicio de la llamada |
| `end_call` | Timestamp | Fin de la llamada |
| `canal` | String | 'retellai' |
| `agente_retell` | String | ID del agente en RetellAI |
| `url_llamada` | String | URL de la grabación |
| `transcripccion` | Text | Transcripción completa |
| `audio_cost` | Numeric | Costo del audio |
| `memory_cost` | Numeric | Costo de LLM |
| `input_data` | JSONB | Datos de entrada |
| `output_data` | JSONB | **Análisis completo de la llamada** |

### B) Para la tabla `leads`

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `estado_actual` | String | Nuevo estado (contactado, interesado, cita_agendada, etc.) |
| `lead_score_increment` | Integer | Puntos a sumar al score actual |
| `calidad_lead` | String | frio / tibio / caliente / muy_caliente |
| `last_contact_at` | Timestamp | Fecha del último contacto |
| `notas` | Text | Notas automáticas generadas |

### C) Para la tabla `lead_concesionario_marca`

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `estado` | String | Estado específico para este concesionario/marca |
| `urgencia` | String | baja / media / alta |
| `prioridad` | Integer | 1 (alta) - 5 (muy baja) |
| `modelo` | String | Modelo de interés detectado |
| `presupuesto_min` | Numeric | Presupuesto mínimo mencionado |
| `presupuesto_max` | Numeric | Presupuesto máximo mencionado |
| `fecha_proxima_accion` | Timestamp | Fecha programada para siguiente acción |
| `proxima_accion` | Text | Descripción de la próxima acción |
| `notas` | Text | Notas específicas de la llamada |
| `combustible_preferido` | String | Preferencia de combustible |
| `transmision` | String | Preferencia de transmisión |

### D) Datos en `output_data` (JSONB)

El campo `output_data` en `call_logs` contiene un análisis completo:

```json
{
  "resumen_llamada": "El cliente mostró interés en el modelo X...",
  "customer_intent": "interested / not_interested / callback / appointment",
  "interest_level": "high / medium / low",
  "customer_sentiment": "positive / neutral / negative",
  "urgency": "alta / media / baja",
  "producto_interes": "EBRO S700",
  "preferences": {
    "combustible": "diesel",
    "transmision": "automatica",
    "color": "negro"
  },
  "budget_mentioned": "20000-25000",
  "callback_requested": true,
  "appointment_scheduled": false,
  "appointment_date": null,
  "next_action": "Enviar información por WhatsApp",
  "objections": ["precio alto", "necesita consultar con pareja"],
  "pain_points": ["necesita coche familiar", "espacio de maletero"],
  "llm_token_usage": {
    "values": [1583, 1572, 1603, 1675],
    "average": 1608.25,
    "num_requests": 4
  },
  "opt_out_sensitive_data_storage": false,
  "data_storage_setting": "everything"
}
```

## 🎯 Estados del Lead

El extractor puede asignar automáticamente estos estados:

### Estados Positivos
- `contactado` - Lead contactado exitosamente
- `interesado` - Mostró interés medio
- `muy_interesado` - Alto nivel de interés detectado
- `en_seguimiento` - Requiere seguimiento
- `cita_agendada` - Se agendó una cita exitosamente

### Estados Neutrales
- `sin_contacto` - No contestó / ocupado
- `intento_fallido` - Error en la llamada

### Estados Negativos
- `no_interesado` - Cliente no está interesado
- `poco_interes` - Bajo nivel de interés
- `llamada_colgada` - Cliente colgó la llamada

## 📈 Sistema de Scoring

### Incremento de Puntuación

El extractor calcula un **incremento** al lead score basado en:

| Factor | Puntos |
|--------|--------|
| Llamada completada | +10 |
| Duración ≥ 5 minutos | +15 |
| Duración 3-5 minutos | +10 |
| Duración 1-3 minutos | +5 |
| Alto interés | +20 |
| Interés medio | +10 |
| Bajo interés | +5 |
| Cita agendada | +25 |
| Callback solicitado | +15 |
| Presupuesto mencionado | +10 |
| Urgencia alta | +10 |
| Urgencia media | +5 |
| Sentimiento negativo | -10 |

**Máximo incremento posible:** ~110 puntos
**Score total máximo:** 100 puntos (cap)

### Calidad del Lead

Basada en las acciones e interés:

- **muy_caliente** (80-100): Cita agendada
- **caliente** (60-79): Alto interés detectado
- **tibio** (40-59): Interés medio o callback solicitado
- **frio** (0-39): Bajo interés o sentimiento negativo

## 🔄 Próximas Acciones Automáticas

El extractor sugiere automáticamente la próxima acción:

| Condición | Acción | Tiempo | Prioridad |
|-----------|--------|--------|-----------|
| Cita agendada | Confirmar cita | Fecha de cita | 1 (Alta) |
| Callback solicitado | Devolver llamada | +2 horas | 2 (Media-Alta) |
| Alto interés | Seguimiento inmediato | +4 horas | 1 (Alta) |
| Llamada exitosa | Seguimiento | +2-3 días | 3 (Media) |
| No contestó | Reintentar llamada | +24 horas | 4 (Baja) |

## 🛠️ Cómo Usar

### Opción 1: Importar Workflow Completo

1. En n8n, ir a **Workflows** > **Import from File**
2. Seleccionar `5-retellai-webhook-processor.json`
3. Ajustar credenciales de PostgreSQL
4. Activar el workflow
5. Configurar RetellAI para enviar webhooks a: `https://tu-n8n.com/webhook/retellai-call-completed`

### Opción 2: Usar Solo el Código Extractor

1. Crear un nodo **Code** en tu workflow existente
2. Copiar el contenido de `retellai-lead-extractor.js`
3. Pegar en el editor de código del nodo
4. El nodo recibirá el JSON del webhook de RetellAI
5. El nodo retornará todas las variables extraídas

### Estructura de Input Esperada

El código espera recibir un objeto JSON con esta estructura:

```json
{
  "call": {
    "call_id": "abc123",
    "agent_id": "agent_456",
    "from_number": "+34854785014",
    "to_number": "+34628605634",
    "direction": "outbound",
    "call_duration_ms": 180000,
    "call_status": "completed",
    "transcript": "Transcripción completa...",
    "recording_url": "https://...",
    "call_analysis": {
      "resumen_llamada": "El cliente mostró interés...",
      "interest_level": "high",
      "customer_sentiment": "positive",
      ...
    }
  },
  "llm_token_usage": {...},
  "opt_out_sensitive_data_storage": false,
  "data_storage_setting": "everything"
}
```

### Estructura de Output

El código retorna un objeto con esta estructura:

```json
{
  "call_logs": {
    // Variables para insertar en call_logs
  },
  "leads": {
    // Variables para actualizar leads
  },
  "lead_concesionario_marca": {
    // Variables para actualizar lead_concesionario_marca
  },
  "lead_messages": {
    // Información para enviar WhatsApp
  },
  "metadata": {
    // Metadatos del procesamiento
  }
}
```

## 📝 Notas Automáticas

El extractor genera notas inteligentes automáticamente:

```
📝 Resumen: El cliente mostró interés en el EBRO S700, pero está ocupado en este momento y prefiere que le envíen un WhatsApp.

🎯 Intención: interested_product_info

🚗 Producto de interés: EBRO S700

💰 Presupuesto mencionado: 20000-25000

⚠️ Objeciones: precio, disponibilidad

🔴 Puntos de dolor: necesita espacio, urgencia de compra

✨ Preferencias: combustible: diesel, transmision: automatica
```

## 🔧 Personalización

### Ajustar Sistema de Scoring

Editar la sección **4. CALCULAR LEAD SCORING INCREMENTAL** en `retellai-lead-extractor.js`:

```javascript
// Puntos por completar la llamada
if (exitoso) {
  lead_score_increment += 10; // Cambiar este valor
}

// Puntos por duración de llamada
const duration_minutes = callInfo.duration_ms / 1000 / 60;
if (duration_minutes >= 5) {
  lead_score_increment += 15; // Cambiar este valor
}
// ...
```

### Ajustar Próximas Acciones

Editar la sección **6. DETERMINAR PRÓXIMA ACCIÓN Y PRIORIDAD**:

```javascript
if (callback_requested) {
  proxima_accion = 'Cliente solicitó que le devuelvan la llamada';
  // Cambiar el tiempo de callback
  const callbackDate = new Date();
  callbackDate.setHours(callbackDate.getHours() + 2); // Cambiar a las horas que quieras
  fecha_proxima_accion = callbackDate.toISOString();
  prioridad = 2;
}
```

### Agregar Nuevas Variables

1. Extraer del webhook en la sección **2. EXTRAER VARIABLES PERSONALIZADAS**
2. Calcular o procesar en las secciones correspondientes
3. Agregar al objeto de retorno en la sección **9. RETORNAR TODAS LAS VARIABLES**

## 🧪 Testing

### Datos de Prueba

Usar este JSON para probar el extractor:

```json
{
  "call": {
    "call_id": "test_123",
    "agent_id": "agent_test",
    "from_number": "+34854785014",
    "to_number": "+34628605634",
    "direction": "outbound",
    "call_duration_ms": 180000,
    "call_status": "completed",
    "transcript": "Hola, me interesa el EBRO S700. ¿Podrías enviarme información por WhatsApp?",
    "recording_url": "https://example.com/recording.mp3",
    "call_analysis": {
      "resumen_llamada": "El cliente mostró interés en el EBRO S700 y solicitó información por WhatsApp",
      "interest_level": "high",
      "customer_sentiment": "positive",
      "customer_intent": "interested",
      "producto_interes": "EBRO S700",
      "callback_requested": false,
      "appointment_scheduled": false,
      "urgency": "media",
      "budget_mentioned": "20000-25000"
    }
  },
  "llm_token_usage": {
    "values": [1583, 1572],
    "average": 1577.5,
    "num_requests": 2
  }
}
```

### Resultado Esperado

- **Estado:** muy_interesado
- **Calidad:** caliente
- **Score increment:** ~45-60 puntos
- **Próxima acción:** Enviar información por WhatsApp
- **Prioridad:** 2 (Media-Alta)

## 🐛 Troubleshooting

### Error: "Cannot read property 'call' of undefined"

**Causa:** El webhook no está enviando el objeto `call`

**Solución:** Verificar la estructura del webhook de RetellAI. Puede que venga directamente en el root:

```javascript
// Cambiar línea 8 de:
const callInfo = retellData.call || {};

// A:
const callInfo = retellData.call || retellData || {};
```

### Error: "lead_id is undefined"

**Causa:** No se encontró el lead en la base de datos por teléfono

**Solución:**
1. Verificar que el teléfono en RetellAI coincida con el de la BD
2. Normalizar números de teléfono (quitar espacios, guiones, etc.)
3. Agregar lógica para crear lead si no existe

### No se actualiza el lead score

**Causa:** El campo `lead_score_increment` no está siendo sumado correctamente

**Solución:** Verificar la query de UPDATE en el workflow:

```sql
UPDATE leads
SET lead_score = LEAST(100, COALESCE(lead_score, 0) + {{ $json.leads.lead_score_increment }})
```

## 📚 Recursos Adicionales

- [Documentación de RetellAI](https://retellai.com/docs)
- [n8n Code Node Documentation](https://docs.n8n.io/code/)
- [PostgreSQL JSONB Functions](https://www.postgresql.org/docs/current/functions-json.html)

## 🤝 Contribuir

Para mejorar este extractor:

1. Editar `retellai-lead-extractor.js`
2. Probar con datos reales de RetellAI
3. Documentar cambios en este README
4. Actualizar el workflow si es necesario

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales

---

**Versión:** 1.0
**Última actualización:** 2025-11-15
**Autor:** Auto Call Team
**Contacto:** [Tu email o contacto]
