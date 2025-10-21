# 🔧 Troubleshooting Backend en Easypanel

## ✅ Checklist de Configuración

### 1. Variables de Entorno Correctas

Ve a tu aplicación `n8n-backend-autocall` en Easypanel → **Environment Variables** y verifica:

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

**⚠️ IMPORTANTE:**
- `DB_HOST` debe ser `n8n_pgvector` (sin guiones, guión bajo)
- `DB_SSL` debe ser `false` para conexiones internas
- Si dice `n8n-pgvector-pgweb.ko9agy.easypanel.host` → **ESTÁ MAL**, cámbialo

### 2. Configuración de Build

En **Build Settings**:
- **Build Context**: `/server` (CON slash inicial)
- **Dockerfile Path**: `Dockerfile` (SIN ./ y SIN slash inicial)
- **Branch**: `main`

### 3. Configuración de Red

En **Network/Ports**:
- **Internal Port**: `3000`
- **Expose**: ✅ Habilitado
- **Protocol**: HTTP
- Debería tener una URL asignada como: `https://n8n-backend-autocall.ko9agy.easypanel.host`

### 4. Verificar Logs

En Easypanel → Tu App → **Logs**, deberías ver:

**✅ Logs correctos:**
```
╔════════════════════════════════════════════╗
║   🚀 n8n Lead Sync API Server Started     ║
╚════════════════════════════════════════════╝

📡 Server:        http://localhost:3000
🏥 Health Check:  http://localhost:3000/api/health
✅ Database is ready
```

**❌ Si ves errores comunes:**

#### Error 1: "ETIMEDOUT" o "ECONNREFUSED" a la base de datos
```
⚠️  Database connection failed: connect ETIMEDOUT
```
**Solución:**
- Verifica que `DB_HOST=n8n_pgvector` (nombre interno correcto)
- Verifica que PostgreSQL esté corriendo en Easypanel
- Asegúrate que ambos contenedores estén en la misma red

#### Error 2: "listen EADDRINUSE"
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución:**
- Reinicia el contenedor
- Verifica que no haya otro servicio en el puerto 3000

#### Error 3: Health check failed
```
Health check failed - container unhealthy
```
**Solución:**
- El servidor no responde en `/api/health`
- Revisa los logs para ver por qué no inicia
- Verifica que el puerto 3000 esté expuesto

### 5. Pasos para Arreglar

1. **Ve a Easypanel → n8n-backend-autocall**

2. **Actualiza las variables de entorno** (especialmente `DB_HOST`)

3. **Click en "Deploy" o "Rebuild"** para aplicar cambios

4. **Espera 1-2 minutos** mientras se construye

5. **Ve a "Logs"** y verifica que diga "Database is ready"

6. **Prueba el endpoint:**
   ```bash
   curl https://n8n-backend-autocall.ko9agy.easypanel.host/api/health
   ```

   Deberías recibir:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "database": {
       "connected": true
     }
   }
   ```

### 6. Verificar que PostgreSQL está corriendo

1. Ve a Easypanel → Busca tu contenedor de PostgreSQL (probablemente `n8n_pgvector`)
2. Verifica que esté **Running** (verde)
3. Si está parado, inícialo

### 7. Conexión de Red

En Easypanel, asegúrate de que:
- El backend y PostgreSQL estén en la **misma red/proyecto**
- PostgreSQL tenga el nombre de servicio `n8n_pgvector`
- El backend pueda resolver ese nombre

## 🎯 Testing Manual

Una vez que arranque, prueba estos endpoints:

```bash
# Health check
curl https://n8n-backend-autocall.ko9agy.easypanel.host/api/health

# Leads (debería devolver datos)
curl https://n8n-backend-autocall.ko9agy.easypanel.host/api/leads
```

## 📞 Necesitas más ayuda?

Si después de estos pasos sigue sin funcionar:

1. Copia los **logs completos** de Easypanel
2. Verifica la configuración exacta de variables de entorno
3. Revisa que PostgreSQL esté accesible internamente

---

**Última actualización**: 2025-10-21
