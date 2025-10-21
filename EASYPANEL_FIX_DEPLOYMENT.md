# 🔧 Arreglar Despliegue del Backend en Easypanel

## ⚠️ Problema Actual
- Backend en estado **amarillo** (no arranca)
- No hay logs de build
- No hay logs de runtime
- PostgreSQL está corriendo correctamente (verde)

## ✅ Solución Paso a Paso

### Paso 1: Eliminar la Aplicación Actual

1. Ve a Easypanel → `n8n-backend-autocall`
2. Click en **Settings** o el ícono de configuración (⚙️)
3. Scroll hasta abajo → **Delete Application**
4. Confirma la eliminación

### Paso 2: Crear Nueva Aplicación desde GitHub

1. En Easypanel, click en **"+ New"** o **"Create"**

2. Selecciona **"App"** → **"From Source"**

3. **Conecta GitHub:**
   - Si no está conectado, autoriza Easypanel a acceder a tu cuenta de GitHub
   - Selecciona tu repositorio (probablemente `n8n-lead-sync`)

4. **Configuración del Servicio:**

   ```
   Name: n8n-backend-autocall
   ```

### Paso 3: Configuración de Build ⚠️ MUY IMPORTANTE

En la sección de **Build**:

```
Source Directory: server
```

**NOTAS CRÍTICAS:**
- ✅ Debe decir `server` (sin slash, sin punto)
- ❌ NO pongas `/server` (con slash inicial)
- ❌ NO pongas `./server` (con punto-slash)
- ❌ NO pongas `server/` (con slash final)

El **Dockerfile Path** se detectará automáticamente como `Dockerfile`

### Paso 4: Variables de Entorno

Copia y pega estas variables **EXACTAMENTE** como están:

```env
DB_HOST=n8n_pgvector
DB_PORT=5432
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=ae5549e37573f5ce67f6
DB_SSL=false
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ VERIFICAR:**
- `DB_HOST=n8n_pgvector` (con guión bajo, NO guión)
- `DB_SSL=false` (minúsculas)
- `NODE_ENV=production` (minúsculas)

### Paso 5: Configuración de Puerto

En la sección **Ports** o **Networking**:

```
Port to Expose: 3000
```

- ✅ Marca **"Expose to Internet"** o similar
- El protocolo debe ser **HTTP**

Easypanel asignará una URL como:
```
https://n8n-backend-autocall.ko9agy.easypanel.host
```

### Paso 6: Deploy

1. Click en **"Deploy"** o **"Create & Deploy"**

2. **Espera 2-3 minutos** mientras:
   - Se clona el repositorio
   - Se construye la imagen Docker
   - Se inicia el contenedor

3. **Verifica el estado:**
   - Debe cambiar de amarillo → verde
   - Si se queda en amarillo o rojo, continúa al Paso 7

### Paso 7: Verificar Logs

Una vez desplegado, ve a **Logs** y deberías ver:

```
╔════════════════════════════════════════════╗
║   🚀 n8n Lead Sync API Server Started     ║
╚════════════════════════════════════════════╝

📡 Server:        http://localhost:3000
🏥 Health Check:  http://localhost:3000/api/health
📊 Leads API:     http://localhost:3000/api/leads
🌍 Environment:   production
🔒 CORS Origin:   http://localhost:8080

⚡ Server is ready to accept connections

🔌 Connecting to PostgreSQL...
   Host: n8n_pgvector
   Database: n8n
   User: postgres
   SSL: disabled

✅ Database connected successfully
📅 Server time: ...
🐘 PostgreSQL version: PostgreSQL 16...
```

### Paso 8: Probar la API

Abre una terminal y ejecuta:

```bash
# Health check
curl https://n8n-backend-autocall.ko9agy.easypanel.host/api/health
```

Deberías recibir:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T...",
  "database": {
    "connected": true,
    "serverTime": "..."
  }
}
```

Si recibes esto → **¡Éxito! ✅**

## 🐛 Troubleshooting

### Error: "Source directory not found"

**Solución:**
- Verifica que en GitHub el directorio `server/` existe
- Asegúrate de que `server/Dockerfile` existe
- Verifica que hiciste push de los últimos cambios a GitHub

### Error: "No Dockerfile found"

**Solución:**
- Verifica que el archivo se llama exactamente `Dockerfile` (con D mayúscula)
- NO debe ser `dockerfile.txt` o `.Dockerfile`
- Debe estar en `server/Dockerfile`

### El contenedor se reinicia constantemente

**Síntomas en logs:**
```
⚠️ Database connection failed: ETIMEDOUT
```

**Solución:**
1. Verifica que PostgreSQL (`n8n_pgvector`) está corriendo
2. Verifica que `DB_HOST=n8n_pgvector` (exacto)
3. Ambos deben estar en el mismo **Project** en Easypanel

### Puerto 3000 en uso

**Solución:**
- Elimina otras aplicaciones que usen el puerto 3000
- O cambia el puerto en las variables de entorno (`PORT=3001`)

## 📋 Checklist Final

Después del despliegue, verifica:

- ✅ El contenedor está en verde
- ✅ Los logs muestran "Database connected successfully"
- ✅ `curl` al `/api/health` devuelve `"status": "healthy"`
- ✅ `curl` al `/api/leads` devuelve datos (o array vacío `[]`)

## 🎯 Próximo Paso

Una vez que el backend esté funcionando:

1. Actualiza el frontend `.env`:
   ```env
   VITE_API_BASE_URL=https://n8n-backend-autocall.ko9agy.easypanel.host/api
   ```

2. Reinicia el frontend:
   ```bash
   npm run dev
   ```

3. Ve a la página de Leads en tu navegador

---

**Si después de seguir TODOS estos pasos sigue sin funcionar:**

1. Copia los logs COMPLETOS de Easypanel (tanto Build como Runtime)
2. Verifica que el Dockerfile existe en GitHub: `https://github.com/tu-usuario/n8n-lead-sync/blob/main/server/Dockerfile`
3. Comparte los logs para un diagnóstico más detallado

---

**Última actualización**: 2025-10-21
