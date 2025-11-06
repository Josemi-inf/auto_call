# Base de Datos - Tablas y Funciones

Este documento describe las tablas de la base de datos PostgreSQL utilizadas en el sistema de gestión de leads de n8n.

## 📊 Tablas Principales

### 1. `leads`
**Propósito**: Almacena la información básica de los leads (clientes potenciales)

**Campos completos**:
- `lead_id` (UUID): Identificador único del lead
- `nombre` (VARCHAR): Nombre del cliente
- `apellidos` (VARCHAR): Apellidos del cliente
- `email` (VARCHAR): Correo electrónico
- `telefono` (VARCHAR): Número de teléfono
- `cp` (VARCHAR): Código postal
- `ciudad` (VARCHAR): Ciudad de residencia
- `provincia` (VARCHAR): Provincia
- `estado_actual` (VARCHAR): Estado del lead (nuevo, contactado, convertido, perdido)
- `calidad_lead` (VARCHAR): Calificación de calidad del lead
- `lead_score` (INTEGER): Puntuación numérica del lead
- `activo` (BOOLEAN): Indica si el lead está activo
- `opt_out` (BOOLEAN): Indica si el lead ha optado por no recibir comunicaciones
- `duplicate_status` (VARCHAR): Estado de duplicación del lead
- `do_not_contact_reason` (VARCHAR): Razón para no contactar
- `notas` (TEXT): Notas generales del lead
- `consent_text` (TEXT): Texto de consentimiento
- `consent_ts` (TIMESTAMP): Fecha y hora del consentimiento
- `existing_lead_id` (UUID): ID de lead existente (para manejo de duplicados)
- `existing_created_at` (TIMESTAMP): Fecha de creación del lead existente
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización
- `last_contact_at` (TIMESTAMP): Fecha del último contacto

### 2. `marca`
**Propósito**: Catálogo de marcas de vehículos

**Campos completos**:
- `marca_id` (UUID): Identificador único de la marca
- `nombre` (VARCHAR): Nombre de la marca (Toyota, Honda, BMW, etc.)

### 3. `concesionario`
**Propósito**: Catálogo de concesionarios/dealerships

**Campos completos**:
- `concesionario_id` (UUID): Identificador único del concesionario
- `nombre` (VARCHAR): Nombre del concesionario
- `direccion` (VARCHAR): Dirección física del concesionario
- `ciudad` (VARCHAR): Ciudad donde se ubica
- `provincia` (VARCHAR): Provincia del concesionario
- `persona_contacto` (VARCHAR): Persona de contacto principal
- `telefono_contacto` (VARCHAR): Teléfono de contacto
- `email_contacto` (VARCHAR): Email de contacto
- `activo` (BOOLEAN): Indica si el concesionario está activo
- `created_at` (TIMESTAMP): Fecha de creación del registro

### 4. `concesionario_marca`
**Propósito**: Tabla de relación entre concesionarios y marcas (un concesionario puede vender múltiples marcas)

**Campos completos**:
- `concesionario_marca_id` (UUID): Identificador único de la relación
- `concesionario_id` (UUID): FK a la tabla concesionario
- `marca_id` (UUID): FK a la tabla marca

### 5. `lead_concesionario_marca`
**Propósito**: Registra los intentos de compra de un lead para una marca específica en un concesionario

**Campos completos**:
- `lead_concesionario_marca_id` (UUID): Identificador único
- `lead_id` (UUID): FK a la tabla leads
- `concesionario_marca_id` (UUID): FK a la tabla concesionario_marca
- `comercial_id` (UUID): ID del comercial asignado
- `comercial_nombre` (VARCHAR): Nombre del comercial
- `modelo` (VARCHAR): Modelo específico del vehículo de interés
- `marca` (VARCHAR): Marca del vehículo (desnormalizada)
- `concesionario` (VARCHAR): Nombre del concesionario (desnormalizada)
- `combustible` (VARCHAR): Tipo de combustible preferido
- `combustible_preferido` (VARCHAR): Combustible de preferencia
- `transmision` (VARCHAR): Tipo de transmisión (manual/automática)
- `estado` (VARCHAR): Estado del intento (nuevo, interesado, contactado, convertido, perdido)
- `urgencia` (VARCHAR): Nivel de urgencia del lead
- `prioridad` (INTEGER): Prioridad numérica
- `presupuesto_min` (NUMERIC): Presupuesto mínimo del cliente
- `presupuesto_max` (NUMERIC): Presupuesto máximo del cliente
- `fecha_entrada` (TIMESTAMP): Fecha en que se registró el interés
- `fecha_asignacion` (TIMESTAMP): Fecha de asignación al comercial
- `fecha_cierre` (TIMESTAMP): Fecha de cierre del proceso
- `fecha_proxima_accion` (TIMESTAMP): Fecha programada para próxima acción
- `next_action_at` (TIMESTAMP): Próxima acción programada
- `exclusive_until` (TIMESTAMP): Exclusividad hasta fecha específica
- `contact_lock_until` (TIMESTAMP): Bloqueo de contacto hasta fecha
- `notas` (TEXT): Notas adicionales sobre el intento
- `proxima_accion` (TEXT): Descripción de la próxima acción
- `motivo_perdida` (VARCHAR): Motivo por el cual se perdió el lead
- `source` (VARCHAR): Fuente del lead (Facebook, Google, web, etc.)
- `event` (VARCHAR): Evento o campaña específica
- `campana` (VARCHAR): Campaña de marketing
- `asignado_por` (VARCHAR): Quien asignó el lead

## 📞 Tablas de Comunicación

### 6. `call_logs`
**Propósito**: Registra todas las llamadas realizadas a los leads

**Campos completos**:
- `call_id` (UUID): Identificador único de la llamada
- `lead_id` (UUID): FK a la tabla leads
- `lead_concesionario_marca_id` (UUID): FK a la relación específica
- `telefono` (VARCHAR): Número al que se llamó
- `numero_llamada` (NUMERIC): Número secuencial de la llamada
- `intento_numero` (INTEGER): Número de intento
- `resultado` (VARCHAR): Resultado de la llamada (exitoso, failed, no_answer, etc.)
- `exitoso` (BOOLEAN): Booleano indicando si fue exitosa
- `duracion_ms` (INTEGER): Duración en milisegundos
- `start_call` (TIMESTAMP): Fecha y hora de inicio
- `end_call` (TIMESTAMP): Fecha y hora de finalización
- `canal` (VARCHAR): Canal utilizado para la llamada
- `agente` (VARCHAR): Agente que realizó la llamada
- `agent_name` (VARCHAR): Nombre del agente
- `agent_action` (VARCHAR): Acción realizada por el agente
- `agente_retell` (VARCHAR): Agente en sistema Retell
- `call_retell` (VARCHAR): ID de llamada en Retell
- `call_id_retell` (NUMERIC): ID numérico en sistema Retell
- `url_llamada` (VARCHAR): URL de la grabación
- `workflow_execution_id` (VARCHAR): ID de ejecución del workflow
- `transcripccion` (TEXT): Transcripción de la llamada
- `error_message` (TEXT): Mensaje de error si ocurrió
- `input_data` (JSONB): Datos de entrada de la llamada
- `output_data` (JSONB): Datos de salida de la llamada
- `audio_cost` (NUMERIC): Costo del audio
- `memory_cost` (NUMERIC): Costo de memoria
- `created_at` (TIMESTAMP): Fecha de creación del registro

### 7. `lead_messages`
**Propósito**: Almacena mensajes de WhatsApp intercambiados con los leads

**Campos completos**:
- `id` (UUID): Identificador único del mensaje
- `lead_id` (UUID): FK a la tabla leads
- `tipo_mensaje` (VARCHAR): Tipo (enviado, recibido)
- `contenido` (TEXT): Contenido del mensaje
- `enviado` (BOOLEAN): Booleano indicando si fue enviado
- `entregado` (BOOLEAN): Booleano indicando si fue entregado
- `leido` (BOOLEAN): Booleano indicando si fue leído
- `respondido` (BOOLEAN): Booleano indicando si fue respondido
- `whatsapp_message_id` (VARCHAR): ID del mensaje en WhatsApp
- `media_url` (VARCHAR): URL de archivos multimedia
- `error_message` (TEXT): Mensaje de error si ocurrió
- `respuesta_usuario` (TEXT): Respuesta del usuario
- `created_at` (TIMESTAMP): Fecha de creación
- `delivered_at` (TIMESTAMP): Fecha de entrega
- `read_at` (TIMESTAMP): Fecha de lectura
- `replied_at` (TIMESTAMP): Fecha de respuesta

### 8. `lead_notes`
**Propósito**: Notas adicionales sobre los leads

**Campos completos**:
- `nota_id` (UUID): Identificador único de la nota
- `lead_id` (UUID): FK a la tabla leads
- `lead_concesionario_marca_id` (UUID): FK a la relación específica
- `usuario_id` (UUID): Usuario que creó la nota
- `contenido` (TEXT): Contenido de la nota
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

## 🚨 Tabla de Monitoreo

### 9. `workflow_errors`
**Propósito**: Registra errores en los workflows de n8n para monitoreo y resolución

**Campos completos**:
- `error_id` (UUID): Identificador único del error
- `workflow_id` (UUID): ID del workflow que falló
- `lead_id` (UUID): Lead afectado (si aplica)
- `titulo` (VARCHAR): Título del error
- `descripcion` (TEXT): Descripción detallada del error
- `tipo` (VARCHAR): Tipo de error (conexión, datos, lógica, etc.)
- `severidad` (VARCHAR): Severidad (baja, media, alta, crítica)
- `estado` (VARCHAR): Estado (pendiente, en_progreso, resuelto)
- `leads_afectados` (INTEGER): Número de leads afectados
- `detalles` (JSONB): Detalles técnicos del error
- `resuelto_por` (VARCHAR): Quien resolvió el error
- `fecha_error` (TIMESTAMP): Fecha y hora del error
- `fecha_resolucion` (TIMESTAMP): Fecha de resolución
- `created_at` (TIMESTAMP): Fecha de creación del registro
- `updated_at` (TIMESTAMP): Fecha de última actualización

## 🔄 Flujo de Datos

### Proceso típico de un lead:

1. **Creación**: Se crea un registro en `leads` con la información básica
2. **Asignación**: Se registra en `lead_concesionario_marca` el interés específico
3. **Comunicación**: Se registran llamadas en `call_logs` y mensajes en `lead_messages`
4. **Seguimiento**: Se añaden notas en `lead_notes` para documentar el proceso
5. **Conversión/Pérdida**: Se actualiza el estado en `lead_concesionario_marca`

### Relaciones principales:

```
leads (1) ←→ (N) lead_concesionario_marca (N) ←→ (1) concesionario_marca
                     ↓
               call_logs, lead_messages, lead_notes
```

## 📈 Uso en la Aplicación

- **Dashboard**: Utiliza agregaciones de `call_logs` y `leads` para mostrar estadísticas
- **Lista de Leads**: Consulta `leads` con joins a las tablas relacionadas
- **Detalle de Lead**: Combina información de todas las tablas para una vista completa
- **Estadísticas**: Agrupa datos por marca, concesionario y períodos de tiempo
- **Timeline**: Combina eventos de `call_logs`, `lead_messages` y cambios de estado

## 🗄️ Esquema de Base de Datos

La base de datos utiliza PostgreSQL con el esquema `public` y está optimizada para:
- Consultas rápidas con índices en campos clave
- Integridad referencial con foreign keys
- Flexibilidad para múltiples marcas y concesionarios por lead
- Trazabilidad completa de todas las interacciones