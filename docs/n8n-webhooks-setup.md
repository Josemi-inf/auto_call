# Configuración de Webhooks n8n para API de Leads

Esta guía te ayudará a crear workflows en n8n que funcionen como API REST para tu base de datos PostgreSQL.

## 🎯 Workflows a crear

Necesitas crear 4 workflows en n8n:

1. **GET Leads** - Obtener todos los leads
2. **GET Lead by ID** - Obtener un lead específico
3. **PATCH Update Lead** - Actualizar un lead
4. **DELETE Lead** - Eliminar un lead

---

## 📝 Workflow 1: GET Leads (Obtener todos los leads)

### Paso 1: Crear Workflow
1. En n8n, haz click en **"+ Add workflow"**
2. Nombre: `API - Get All Leads`

### Paso 2: Agregar nodo Webhook
1. Arrastra el nodo **"Webhook"** al canvas
2. Configura:
   - **HTTP Method**: `GET`
   - **Path**: `leads`
   - **Response Mode**: `Using 'Respond to Webhook' Node`
   - **Authentication**: `None` (o configura según necesites)

### Paso 3: Agregar nodo PostgreSQL
1. Arrastra el nodo **"Postgres"** después del Webhook
2. Configura:
   - **Credentials**: Selecciona o crea credenciales de PostgreSQL
   - **Operation**: `Execute Query`
   - **Query**:
   ```sql
   SELECT * FROM leads
   ORDER BY created_at DESC
   LIMIT 100;
   ```

### Paso 4: Agregar nodo Respond to Webhook
1. Arrastra el nodo **"Respond to Webhook"** después de PostgreSQL
2. Configura:
   - **Respond With**: `JSON`
   - **Response Body**:
   ```json
   {
     "data": {{ $json }}
   }
   ```

### Paso 5: Activar y copiar URL
1. Click en **"Active"** (toggle en la esquina superior derecha)
2. Copia la **Production URL** del nodo Webhook
3. Guarda esta URL, la necesitarás después

**URL esperada**: `https://tu-n8n.com/webhook/leads`

---

## 📝 Workflow 2: GET Lead by ID

### Paso 1: Crear Workflow
1. Nombre: `API - Get Lead by ID`

### Paso 2: Agregar nodo Webhook
1. **HTTP Method**: `GET`
2. **Path**: `leads/:id`
3. **Response Mode**: `Using 'Respond to Webhook' Node`

### Paso 3: Agregar nodo PostgreSQL
1. **Operation**: `Execute Query`
2. **Query**:
```sql
SELECT * FROM leads
WHERE lead_id = '{{ $('Webhook').params.id }}';
```

### Paso 4: Agregar nodo Respond to Webhook
1. **Response Body**:
```json
{
  "data": {{ $json[0] }}
}
```

### Paso 5: Activar y copiar URL
**URL esperada**: `https://tu-n8n.com/webhook/leads/:id`

---

## 📝 Workflow 3: PATCH Update Lead

### Paso 1: Crear Workflow
1. Nombre: `API - Update Lead`

### Paso 2: Agregar nodo Webhook
1. **HTTP Method**: `PATCH`
2. **Path**: `leads/:id`
3. **Response Mode**: `Using 'Respond to Webhook' Node`

### Paso 3: Agregar nodo Set (preparar datos)
1. Arrastra el nodo **"Set"** después del Webhook
2. Mapea los campos del body:
   - `leadId` = `{{ $('Webhook').params.id }}`
   - `nombre` = `{{ $json.body.nombre }}`
   - `apellidos` = `{{ $json.body.apellidos }}`
   - `email` = `{{ $json.body.email }}`
   - `ciudad` = `{{ $json.body.ciudad }}`
   - `provincia` = `{{ $json.body.provincia }}`
   - `codigo_postal` = `{{ $json.body.codigo_postal }}`

### Paso 4: Agregar nodo PostgreSQL
1. **Operation**: `Execute Query`
2. **Query**:
```sql
UPDATE leads
SET
  nombre = COALESCE(NULLIF('{{ $json.nombre }}', ''), nombre),
  apellidos = COALESCE(NULLIF('{{ $json.apellidos }}', ''), apellidos),
  email = COALESCE(NULLIF('{{ $json.email }}', ''), email),
  ciudad = COALESCE(NULLIF('{{ $json.ciudad }}', ''), ciudad),
  provincia = COALESCE(NULLIF('{{ $json.provincia }}', ''), provincia),
  codigo_postal = COALESCE(NULLIF('{{ $json.codigo_postal }}', ''), codigo_postal),
  updated_at = CURRENT_TIMESTAMP
WHERE lead_id = '{{ $json.leadId }}'
RETURNING *;
```

### Paso 5: Agregar nodo Respond to Webhook
1. **Response Body**:
```json
{{ $json[0] }}
```

### Paso 6: Activar y copiar URL
**URL esperada**: `https://tu-n8n.com/webhook/leads/:id` (PATCH)

---

## 📝 Workflow 4: DELETE Lead

### Paso 1: Crear Workflow
1. Nombre: `API - Delete Lead`

### Paso 2: Agregar nodo Webhook
1. **HTTP Method**: `DELETE`
2. **Path**: `leads/:id`
3. **Response Mode**: `Using 'Respond to Webhook' Node`

### Paso 3: Agregar nodo PostgreSQL
1. **Operation**: `Execute Query`
2. **Query**:
```sql
DELETE FROM leads
WHERE lead_id = '{{ $('Webhook').params.id }}'
RETURNING lead_id;
```

### Paso 4: Agregar nodo Respond to Webhook
1. **Response Body**:
```json
{
  "success": true,
  "deleted_id": "{{ $json[0].lead_id }}"
}
```

### Paso 5: Activar y copiar URL
**URL esperada**: `https://tu-n8n.com/webhook/leads/:id` (DELETE)

---

## 🔧 Configuración de PostgreSQL en n8n

### Crear credenciales PostgreSQL:

1. En n8n, ve a **Settings → Credentials**
2. Click en **"+ Add Credential"**
3. Busca **"Postgres"**
4. Configura:
   - **Host**: Tu host de PostgreSQL (ej: `n8n-pgvector-pgweb.ko9agy.easypanel.host`)
   - **Database**: Nombre de tu base de datos
   - **User**: Usuario de PostgreSQL
   - **Password**: Contraseña
   - **Port**: `5432` (por defecto)
   - **SSL**: Activa si es necesario

---

## ✅ Verificación

Una vez creados los 4 workflows, deberías tener estas URLs:

```
GET    https://tu-n8n.com/webhook/leads
GET    https://tu-n8n.com/webhook/leads/:id
PATCH  https://tu-n8n.com/webhook/leads/:id
DELETE https://tu-n8n.com/webhook/leads/:id
```

---

## 🎯 Próximo paso

Una vez que hayas creado los workflows y tengas las URLs:

1. Copia la URL base de tu n8n (ej: `https://tu-n8n.com/webhook`)
2. Dímela para actualizar el archivo `.env` del frontend
3. Los cambios se guardarán automáticamente en PostgreSQL

---

## 🐛 Troubleshooting

### Error de conexión PostgreSQL
- Verifica que el host, usuario y contraseña sean correctos
- Asegúrate de que PostgreSQL acepte conexiones externas
- Verifica el puerto (normalmente 5432)

### Webhook no responde
- Asegúrate de que el workflow esté **ACTIVO** (toggle verde)
- Verifica que el nodo "Respond to Webhook" esté conectado correctamente
- Revisa los logs de ejecución en n8n

### Datos no se actualizan
- Verifica que el query SQL sea correcto
- Revisa que los nombres de las columnas coincidan con tu base de datos
- Comprueba los logs de ejecución para ver errores SQL

---

¿Necesitas ayuda con algún paso específico?
