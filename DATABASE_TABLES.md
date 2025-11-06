# Base de Datos - Tablas y Funciones

Este documento describe las tablas de la base de datos PostgreSQL utilizadas en el sistema de gestión de leads de n8n.

## 📊 Tablas Principales

### 1. `leads`
**Propósito**: Almacena la información básica de los leads (clientes potenciales)

**Campos principales**:
- `lead_id` (UUID): Identificador único del lead
- `nombre`: Nombre del cliente
- `apellidos`: Apellidos del cliente
- `email`: Correo electrónico
- `telefono`: Número de teléfono
- `estado_actual`: Estado del lead (nuevo, contactado, convertido, perdido)
- `ciudad`: Ciudad de residencia
- `cp`: Código postal
- `provincia`: Provincia
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización
- `last_contact_at`: Fecha del último contacto
- `activo`: Indica si el lead está activo
- `opt_out`: Indica si el lead ha optado por no recibir comunicaciones

### 2. `marca`
**Propósito**: Catálogo de marcas de vehículos

**Campos principales**:
- `marca_id`: Identificador único de la marca
- `nombre`: Nombre de la marca (Toyota, Honda, BMW, etc.)

### 3. `concesionario`
**Propósito**: Catálogo de concesionarios/dealerships

**Campos principales**:
- `concesionario_id`: Identificador único del concesionario
- `nombre`: Nombre del concesionario

### 4. `concesionario_marca`
**Propósito**: Tabla de relación entre concesionarios y marcas (un concesionario puede vender múltiples marcas)

**Campos principales**:
- `concesionario_marca_id`: Identificador único de la relación
- `concesionario_id`: FK a la tabla concesionario
- `marca_id`: FK a la tabla marca

### 5. `lead_concesionario_marca`
**Propósito**: Registra los intentos de compra de un lead para una marca específica en un concesionario

**Campos principales**:
- `lead_concesionario_marca_id`: Identificador único
- `lead_id`: FK a la tabla leads
- `concesionario_marca_id`: FK a la tabla concesionario_marca
- `modelo`: Modelo específico del vehículo de interés
- `estado`: Estado del intento (nuevo, interesado, contactado, convertido, perdido)
- `presupuesto_min`: Presupuesto mínimo del cliente
- `presupuesto_max`: Presupuesto máximo del cliente
- `fecha_entrada`: Fecha en que se registró el interés
- `fecha_cierre`: Fecha de cierre del proceso
- `notas`: Notas adicionales sobre el intento
- `motivo_perdida`: Motivo por el cual se perdió el lead
- `source`: Fuente del lead (Facebook, Google, web, etc.)

## 📞 Tablas de Comunicación

### 6. `call_logs`
**Propósito**: Registra todas las llamadas realizadas a los leads

**Campos principales**:
- `call_id`: Identificador único de la llamada
- `lead_id`: FK a la tabla leads
- `lead_concesionario_marca_id`: FK a la relación específica
- `telefono`: Número al que se llamó
- `resultado`: Resultado de la llamada (exitoso, failed, no_answer, etc.)
- `duracion_ms`: Duración en milisegundos
- `start_call`: Fecha y hora de inicio
- `end_call`: Fecha y hora de finalización
- `exitoso`: Booleano indicando si fue exitosa
- `canal`: Canal utilizado para la llamada
- `call_id_retell`: ID externo del sistema de llamadas
- `agent_name`: Nombre del agente que realizó la llamada
- `audio_cost`: Costo del audio
- `memory_cost`: Costo de memoria
- `output_data`: Datos adicionales en formato JSON

### 7. `lead_messages`
**Propósito**: Almacena mensajes de WhatsApp intercambiados con los leads

**Campos principales**:
- `id`: Identificador único del mensaje
- `lead_id`: FK a la tabla leads
- `tipo_mensaje`: Tipo (enviado, recibido)
- `contenido`: Contenido del mensaje
- `enviado`: Booleano indicando si fue enviado
- `leido`: Booleano indicando si fue leído
- `respondido`: Booleano indicando si fue respondido
- `whatsapp_message_id`: ID del mensaje en WhatsApp
- `media_url`: URL de archivos multimedia
- `created_at`: Fecha de creación

### 8. `lead_notes`
**Propósito**: Notas adicionales sobre los leads

**Campos principales**:
- `nota_id`: Identificador único de la nota
- `lead_id`: FK a la tabla leads
- `lead_concesionario_marca_id`: FK a la relación específica
- `usuario_id`: Usuario que creó la nota
- `contenido`: Contenido de la nota
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

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