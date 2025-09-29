# Configuración de n8n para LeadFlow

## 📋 Resumen

Esta guía te explica cómo configurar n8n para trabajar con LeadFlow y probar webhooks correctamente.

## 🔧 Configuración Básica

### 1. Variables de Entorno

Edita el archivo `.env` y agrega tus URLs de n8n:

```env
# n8n Configuration
VITE_N8N_BASE_URL=https://tu-instancia-n8n.com
VITE_N8N_API_KEY=tu-api-key-aqui

# API Backend (opcional)
VITE_API_BASE_URL=https://tu-backend-api.com
```

### 2. Obtener API Key de n8n

1. Ve a tu instancia de n8n
2. Ir a **Settings** → **API Keys**
3. Crear nueva API key
4. Copiar el token y agregarlo a `VITE_N8N_API_KEY`

## 🔗 Configuración de Webhooks

### Formato de URL de Webhook de n8n

Las URLs de webhook de n8n típicamente tienen este formato:

```
https://tu-instancia-n8n.com/webhook/nombre-del-webhook
```

### Ejemplo de Workflow con Webhook

1. **Crear un nuevo workflow en n8n**
2. **Agregar un nodo Webhook:**
   - Trigger: Webhook
   - HTTP Method: POST
   - Path: `leadflow-test` (o el nombre que prefieras)

3. **La URL resultante será:**
   ```
   https://tu-instancia-n8n.com/webhook/leadflow-test
   ```

## 📝 Payload de Prueba

Cuando pruebes un webhook desde LeadFlow, se enviará este payload:

```json
{
  "test": true,
  "source": "LeadFlow Webhook Test",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "webhook_test": {
    "trigger_time": "2024-01-01T12:00:00.000Z",
    "test_id": "test_1704110400000",
    "app_name": "LeadFlow",
    "version": "1.0.0"
  },
  "sample_lead_data": {
    "lead_id": "sample_lead_123",
    "email": "test@leadflow.com",
    "name": "Test Lead",
    "phone": "+1234567890",
    "campaign": "webhook_test",
    "source": "manual_test",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🚀 Configuración de Workflows para Leads Reales

### Estructura de Datos de Lead

Cuando recibas leads reales, el payload será:

```json
{
  "lead_id": "uuid-del-lead",
  "email": "lead@example.com",
  "name": "Nombre del Lead",
  "phone": "+1234567890",
  "campaign": "nombre-de-campana",
  "source": "facebook_ads",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "campana-enero",
  "custom_fields": {
    "company": "Empresa del Lead",
    "interest": "producto-especifico"
  },
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

## 🛠️ Troubleshooting

### Problema: "No hace nada al probar webhook"

**Soluciones:**

1. **Verificar consola del navegador** (F12 → Console)
2. **Revisar configuración:**
   - ¿Está configurada `VITE_N8N_BASE_URL`?
   - ¿Es correcta la URL del webhook?
   - ¿Está activo el workflow en n8n?

3. **Probar directamente en n8n:**
   - Ve al workflow
   - Usa la función "Test Webhook" de n8n
   - Verifica que reciba datos

### Problema: Error CORS

Si ves errores de CORS, es normal. LeadFlow tiene fallbacks:

1. **Modo directo**: Intenta llamar directamente al webhook
2. **Modo no-cors**: Fallback que envía la petición pero no puede leer respuesta
3. **Backend proxy**: Si configuras `VITE_API_BASE_URL`

### Problema: "Webhook no responde"

1. **Verificar que el workflow esté activo**
2. **Comprobar la URL completa**
3. **Revisar logs en n8n** (si tienes acceso)

## 📊 Monitoreo

### En LeadFlow

- Estado del webhook se actualiza después de cada prueba
- Logs en consola del navegador
- Notificaciones toast con resultado

### En n8n

- Ve a **Executions** para ver ejecuciones
- Revisa logs de errores si los hay
- Verifica que los datos lleguen correctamente

## 🔄 Reiniciar Aplicación

Después de cambiar variables de entorno:

```bash
# Detener servidor de desarrollo
Ctrl+C

# Reiniciar
npm run dev
```

## 🆘 Soporte

Si tienes problemas:

1. **Revisar logs en consola**
2. **Verificar configuración de .env**
3. **Probar webhook directamente con herramientas como Postman**
4. **Revisar que n8n esté funcionando correctamente**

---

## 📝 Notas Adicionales

- Los webhooks se prueban inmediatamente al hacer clic en "Probar"
- El estado se guarda localmente y en caché
- Puedes tener múltiples webhooks configurados
- Cada webhook puede apuntar a diferentes workflows de n8n