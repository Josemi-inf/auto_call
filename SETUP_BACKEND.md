# 🚀 Guía de Configuración del Backend

Esta guía te ayudará a configurar y ejecutar el backend seguro de n8n Lead Sync.

## ✅ Paso 1: Configurar Variables de Entorno del Backend

1. **Abre el archivo:** `server/.env`

2. **Actualiza con tus credenciales de PostgreSQL:**

```env
# Database Configuration
DB_HOST=n8n-pgvector-pgweb.ko9agy.easypanel.host
DB_PORT=5432
DB_NAME=TU_NOMBRE_DE_BASE_DE_DATOS
DB_USER=TU_USUARIO
DB_PASSWORD=TU_CONTRASEÑA
DB_SSL=true

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## ✅ Paso 2: Verificar la Base de Datos

Asegúrate de que tu base de datos PostgreSQL tenga las tablas necesarias:

```bash
# Las tablas se crean con este script:
# scripts/create-tables.sql
```

Si aún no has creado las tablas, ejecútalas en tu cliente de PostgreSQL (pgAdmin, DBeaver, psql, etc.)

## ✅ Paso 3: Iniciar el Backend

```bash
cd server
npm run dev
```

Deberías ver:

```
╔════════════════════════════════════════════╗
║   🚀 n8n Lead Sync API Server Started     ║
╚════════════════════════════════════════════╝

📡 Server:        http://localhost:3000
🏥 Health Check:  http://localhost:3000/api/health
📊 Leads API:     http://localhost:3000/api/leads
🌍 Environment:   development
🔒 CORS Origin:   http://localhost:8080

⚡ Server is ready to accept connections
```

## ✅ Paso 4: Verificar la Conexión

Abre en tu navegador o con curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Deberías ver:
{
  "status": "healthy",
  "timestamp": "2025-09-30T...",
  "database": {
    "connected": true,
    "serverTime": "..."
  },
  ...
}
```

## ✅ Paso 5: Iniciar el Frontend

En otra terminal:

```bash
# En el directorio raíz del proyecto
npm run dev
```

El frontend se iniciará en `http://localhost:8080`

## ✅ Paso 6: Ver los Leads

1. Abre `http://localhost:8080`
2. Ve a la sección **Leads**
3. Deberías ver los leads de tu base de datos PostgreSQL

---

## 🔧 Troubleshooting

### ❌ Error: "Database connection failed"

**Problema:** No se puede conectar a PostgreSQL

**Solución:**
1. Verifica que las credenciales en `server/.env` sean correctas
2. Asegúrate que PostgreSQL esté accesible desde tu máquina
3. Verifica que el puerto 5432 no esté bloqueado por firewall
4. Si usas SSL, asegúrate que `DB_SSL=true`

### ❌ Error: "CORS error" en el navegador

**Problema:** El frontend no puede comunicarse con el backend

**Solución:**
1. Verifica que `FRONTEND_URL` en `server/.env` sea `http://localhost:8080`
2. Asegúrate que ambos servidores estén corriendo
3. Verifica que el frontend use `VITE_API_BASE_URL=http://localhost:3000/api` en `.env`

### ❌ Error: "Cannot find module"

**Problema:** Dependencias no instaladas

**Solución:**
```bash
cd server
npm install
```

### ❌ No veo leads en la página

**Problema:** La base de datos está vacía o hay error en la query

**Solución:**
1. Verifica en la consola del backend si hay errores
2. Ejecuta una query manual en tu cliente de PostgreSQL:
   ```sql
   SELECT * FROM leads LIMIT 10;
   ```
3. Si no hay datos, inserta datos de prueba con `scripts/insert-sample-data.sql`

---

## 📊 Arquitectura Final

```
Frontend (React + Vite)
    ↓ http://localhost:8080
    ↓
    ↓ fetch('/api/leads')
    ↓
Backend (Express)
    ↓ http://localhost:3000
    ↓ Validación
    ↓ Rate Limiting
    ↓ SQL Parametrizado
    ↓
PostgreSQL
    ↓ n8n-pgvector-pgweb.ko9agy.easypanel.host:5432
    ↓
Tablas: leads, concesionarios, marcas, etc.
```

---

## 🔒 Características de Seguridad Implementadas

✅ **Helmet** - Headers de seguridad HTTP
✅ **CORS** - Solo permite requests desde http://localhost:8080
✅ **Rate Limiting** - Máximo 100 requests cada 15 minutos por IP
✅ **Input Validation** - Valida todos los campos con express-validator
✅ **SQL Injection Protection** - Consultas parametrizadas con pg
✅ **Error Handling** - No expone detalles internos en producción
✅ **Request Logging** - Registra todas las peticiones con timestamp e IP
✅ **Compression** - Comprime respuestas para mejor rendimiento

---

## 🎉 ¡Listo!

Tu aplicación ahora está usando una arquitectura segura de 3 capas:

1. **Frontend React** - Interfaz de usuario
2. **Backend Express** - API REST segura
3. **PostgreSQL** - Base de datos

Los leads se cargan desde PostgreSQL a través del backend seguro. 🔒✨