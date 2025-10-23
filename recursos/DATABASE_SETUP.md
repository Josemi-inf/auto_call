# 🗃️ Database Setup - N8N Lead Sync

Esta guía te ayudará a configurar la base de datos PostgreSQL para la aplicación N8N Lead Sync.

## 📋 Requisitos Previos

- PostgreSQL 12+ instalado
- Acceso a la base de datos `n8n` en tu servidor
- Cliente PostgreSQL (pgAdmin, DBeaver, psql, etc.)

## 🔗 Configuración de Conexión

### Credenciales Actuales:
```
Host: n8n-pgvector-pgweb.ko9agy.easypanel.host
Host Interno: n8n.pgvector
Puerto: 5432
Base de Datos: n8n
Usuario: postgres
Contraseña: ae5549e37573f5ce67f6
SSL: No requerido
```

### Variables de Entorno (.env):
```env
VITE_DB_USER=postgres
VITE_DB_HOST=n8n-pgvector-pgweb.ko9agy.easypanel.host
VITE_DB_NAME=n8n
VITE_DB_PASSWORD=ae5549e37573f5ce67f6
VITE_DB_PORT=5432
VITE_DB_SSL=false
```

## 🚀 Instalación de la Base de Datos

### Paso 1: Ejecutar Script de Creación de Tablas

Ejecuta el siguiente archivo SQL en tu cliente PostgreSQL:

```bash
# Desde psql
psql -h n8n-pgvector-pgweb.ko9agy.easypanel.host -U postgres -d n8n -f scripts/create-tables.sql

# O copia y pega el contenido del archivo scripts/create-tables.sql
```

Este script creará las siguientes tablas:

#### 📊 Tablas Principales:
- **`leads`** - Información básica de leads
- **`concesionarios`** - Catálogo de concesionarios
- **`marcas`** - Catálogo de marcas de autos
- **`concesionario_marca`** - Relación N:M entre concesionarios y marcas
- **`lead_concesionario_marca`** - Intentos de compra de cada lead

#### 💬 Comunicaciones:
- **`conversaciones`** - Conversaciones por canal (WhatsApp, Email, Call)
- **`lead_messages`** - Mensajes individuales de cada conversación

#### 🔄 Workflows (n8n):
- **`workflows`** - Configuración de workflows de n8n
- **`workflow_leads`** - Leads asociados a workflows
- **`workflow_errors`** - Registro de errores de workflows

#### 📞 Llamadas:
- **`llamadas`** - Registro completo de llamadas realizadas

### Paso 2: Insertar Datos de Ejemplo (Opcional)

Para probar la aplicación con datos de ejemplo:

```bash
# Ejecutar script de datos de ejemplo
psql -h n8n-pgvector-pgweb.ko9agy.easypanel.host -U postgres -d n8n -f scripts/insert-sample-data.sql
```

Este script insertará:
- 4 concesionarios de ejemplo
- 6 leads de prueba
- Mensajes de conversación
- Llamadas de ejemplo
- Errores de workflows simulados

## 🏗️ Estructura de la Base de Datos

### Diagrama de Relaciones:

```
leads (1) ←→ (N) lead_concesionario_marca ←→ (1) concesionario_marca
                                              ↗                    ↘
                                   concesionarios (1) ←→ (N)      (N) ←→ (1) marcas

leads (1) ←→ (N) lead_messages ←→ (1) conversaciones
leads (1) ←→ (N) llamadas ←→ (1) workflows
workflows (1) ←→ (N) workflow_leads ←→ (1) leads
workflows (1) ←→ (N) workflow_errors
```

### Campos Clave:

#### Tabla `leads`:
- `lead_id` (UUID, PK)
- `nombre`, `apellidos`, `email`, `telefono`
- `telefono_e164` - Formato internacional para llamadas
- `estado_actual` - nuevo, en_seguimiento, convertido, perdido
- `source` - Facebook Ads, Google Ads, Web, etc.
- `campana` - Campaña específica que generó el lead

#### Tabla `llamadas`:
- `duracion` - En segundos
- `costo` - Costo de la llamada
- `latencia` - Latencia en milisegundos
- `estado` - successful, failed, no_answer, busy, rejected
- `proveedor` - Twilio, etc.

#### Tabla `workflow_errors`:
- `tipo` - connection, data, limit, workflow, system
- `severidad` - critical, error, warning, minor
- `estado` - pending, resolved, investigating
- `detalles` - JSON con información específica del error

## 🔧 Configuración del Código

### Archivo `src/services/db.ts`:

El archivo ya está configurado para usar las variables de entorno. Asegúrate de que el archivo `.env` tenga las credenciales correctas.

### Funciones Disponibles:

```typescript
// Probar conexión
import { testConnection } from '@/services/db';
await testConnection();

// Obtener leads
import { getLeads } from '@/services/db';
const leads = await getLeads();

// Obtener lead específico
import { getLeadById } from '@/services/db';
const lead = await getLeadById('uuid-del-lead');

// Obtener historial del lead
import { getLeadHistory } from '@/services/db';
const history = await getLeadHistory('uuid-del-lead');
```

## 🧪 Verificación de la Instalación

### Script de Verificación:

```bash
# Ejecutar script de verificación
node scripts/check-database.js
```

Este script verificará:
- ✅ Conexión a la base de datos
- ✅ Existencia de todas las tablas requeridas
- ✅ Estructura de columnas
- ✅ Índices creados

### Consultas de Verificación Manual:

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT
  schemaname,
  tablename,
  n_tup_ins as "Rows"
FROM pg_stat_user_tables
ORDER BY tablename;

-- Verificar datos de ejemplo
SELECT COUNT(*) as total_leads FROM leads;
SELECT COUNT(*) as total_calls FROM llamadas;
SELECT COUNT(*) as total_messages FROM lead_messages;
```

## 🔒 Seguridad y Mejores Prácticas

### Recomendaciones:

1. **Variables de Entorno**: Nunca commitees el archivo `.env` al repositorio
2. **Conexiones**: Usa connection pooling (ya implementado con `pg.Pool`)
3. **Índices**: Los índices principales ya están creados para optimizar consultas
4. **Backups**: Configura backups automáticos en tu servidor PostgreSQL
5. **SSL**: Para producción, considera habilitar SSL/TLS

### Límites de Conexión:

```typescript
// Configuración actual del pool
const pool = new Pool({
    max: 20,          // Máximo 20 conexiones
    idleTimeoutMillis: 30000,  // 30 segundos
    connectionTimeoutMillis: 2000,  // 2 segundos
});
```

## 🚨 Troubleshooting

### Problemas Comunes:

1. **ETIMEDOUT**: El puerto 5432 no está expuesto públicamente
   - Solución: Usa pgweb o un túnel SSH

2. **ENOTFOUND**: Host no encontrado
   - Verifica que el host sea correcto
   - Usa el host interno solo desde Docker

3. **Authentication Failed**: Credenciales incorrectas
   - Verifica usuario y contraseña
   - Confirma que el usuario tenga permisos

4. **Connection Refused**: Servicio no disponible
   - Verifica que PostgreSQL esté corriendo
   - Confirma el puerto correcto

### Conexión a través de pgweb:

Si no puedes conectar directamente, usa la interfaz web:
```
URL: https://n8n-pgvector-pgweb.ko9agy.easypanel.host/
```

## 📈 Monitoreo y Mantenimiento

### Consultas de Monitoreo:

```sql
-- Leads por estado
SELECT estado_actual, COUNT(*)
FROM leads
GROUP BY estado_actual;

-- Estadísticas de llamadas
SELECT
    estado,
    COUNT(*) as cantidad,
    AVG(duracion) as duracion_promedio,
    SUM(costo) as costo_total
FROM llamadas
GROUP BY estado;

-- Errores pendientes
SELECT tipo, severidad, COUNT(*)
FROM workflow_errors
WHERE estado = 'pending'
GROUP BY tipo, severidad;
```

### Limpieza Periódica:

```sql
-- Limpiar mensajes antiguos (opcional)
DELETE FROM lead_messages
WHERE created_at < NOW() - INTERVAL '1 year';

-- Archivar leads inactivos
UPDATE leads
SET activo = false
WHERE last_contact_at < NOW() - INTERVAL '6 months'
AND estado_actual IN ('perdido', 'convertido');
```

---

## 📞 Soporte

Si tienes problemas con la configuración de la base de datos:

1. Verifica las credenciales en el archivo `.env`
2. Ejecuta el script `check-database.js` para diagnosticar
3. Revisa los logs de PostgreSQL en tu servidor
4. Contacta al administrador del servidor si persisten los problemas

---

**¡La base de datos está lista para usar! 🎉**