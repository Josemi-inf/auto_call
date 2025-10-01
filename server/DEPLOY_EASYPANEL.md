# 🚀 Despliegue del Backend en Easypanel

Esta guía te ayudará a desplegar el backend de n8n Lead Sync en Easypanel para que pueda acceder a PostgreSQL internamente.

## 📋 Requisitos Previos

- Cuenta de Easypanel activa
- Acceso al panel de Easypanel
- Repositorio Git del proyecto (GitHub, GitLab, etc.)

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Subir cambios a GitHub

Desde la raíz del proyecto:

```bash
# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Add backend Dockerfile for Easypanel deployment"

# Subir a GitHub
git push origin main
```

## 🎯 Paso 2: Crear Aplicación en Easypanel

### 2.1 Acceder a Easypanel

1. Ve a tu panel de Easypanel: `https://panel.easypanel.io` (o tu URL personalizada)
2. Inicia sesión con tus credenciales

### 2.2 Crear Nueva Aplicación

1. Click en **"+ Create"** o **"New App"**
2. Selecciona **"From Git Repository"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `n8n-lead-sync`
5. Configura los siguientes parámetros:

**Configuración de Build:**
```
Name: n8n-lead-sync-api
Build Context: /server
Dockerfile Path: ./Dockerfile
Branch: main
```

### 2.3 Configurar Variables de Entorno

En la sección de **Environment Variables**, agrega:

```env
# Database Configuration (USAR URL INTERNA DE EASYPANEL)
DB_HOST=n8n_pgvector
DB_PORT=5432
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=ae5549e37573f5ce67f6
DB_SSL=false

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ IMPORTANTE:**
- `DB_HOST` debe ser `n8n_pgvector` (nombre interno del contenedor de PostgreSQL en Easypanel)
- `DB_SSL` debe ser `false` para conexiones internas
- `FRONTEND_URL` actualízalo con la URL de tu frontend cuando lo despliegues

### 2.4 Configurar Red

1. En **Network Settings**:
   - Habilita **"Expose Port"**
   - Puerto: `3000`
   - Protocolo: `HTTP`

2. Easypanel te asignará una URL como:
   ```
   https://n8n-lead-sync-api.ko9agy.easypanel.host
   ```

## 🔍 Paso 3: Desplegar

1. Click en **"Deploy"** o **"Create & Deploy"**
2. Espera a que el build se complete (1-3 minutos)
3. Verifica el estado en **Logs**

### Verificar Logs

Deberías ver algo como:

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
```

## ✅ Paso 4: Verificar Despliegue

### 4.1 Probar Health Check

```bash
curl https://n8n-lead-sync-api.ko9agy.easypanel.host/api/health
```

Deberías recibir:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T...",
  "database": {
    "connected": true,
    "serverTime": "..."
  }
}
```

### 4.2 Probar API de Leads

```bash
curl https://n8n-lead-sync-api.ko9agy.easypanel.host/api/leads
```

## 🔄 Paso 5: Actualizar Frontend

Actualiza el archivo `.env` del frontend con la nueva URL del backend:

```env
# API Backend (URL de producción de Easypanel)
VITE_API_BASE_URL=https://n8n-lead-sync-api.ko9agy.easypanel.host/api
```

Reinicia el frontend:

```bash
npm run dev
```

## 🎉 ¡Listo!

Ahora tu backend está desplegado en Easypanel y puede:
- ✅ Conectarse a PostgreSQL internamente
- ✅ Servir la API al frontend
- ✅ Escalar automáticamente
- ✅ Tener logs centralizados

## 🔧 Troubleshooting

### Error: "Database connection failed"

**Solución:**
1. Verifica que `DB_HOST=n8n_pgvector` (nombre interno del contenedor)
2. Asegúrate que PostgreSQL y el backend estén en la misma red de Easypanel
3. Revisa los logs del contenedor

### Error: "CORS error"

**Solución:**
1. Actualiza `FRONTEND_URL` con la URL correcta del frontend
2. Redespliega la aplicación

### Cambios no se reflejan

**Solución:**
1. Haz push de los cambios a GitHub
2. En Easypanel, ve a la app y click en **"Rebuild"**

## 📊 Monitoreo

- **Logs:** En Easypanel, ve a tu app → **Logs**
- **Métricas:** **Metrics** muestra CPU, RAM, requests
- **Health:** El endpoint `/api/health` reporta el estado

---

**Siguiente paso:** Una vez que el backend esté funcionando en Easypanel, puedes desplegar también el frontend o seguir usándolo localmente apuntando a la API en producción.
