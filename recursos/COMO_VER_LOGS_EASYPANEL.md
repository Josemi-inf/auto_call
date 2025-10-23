# Cómo ver los logs del contenedor en Easypanel

Para diagnosticar por qué el backend no arranca, necesito ver los logs del contenedor.

## 📋 Pasos para encontrar los logs:

### Opción 1: En la interfaz de la aplicación

1. Ve a **Easypanel** → Tu proyecto `n8n`
2. Click en la app **`backend_autocall`**
3. Busca un botón o pestaña que diga:
   - **"Logs"** (puede tener sub-pestañas: Build / Runtime / Application)
   - **"Registros"**
   - **"Console"**
   - **"Terminal"**

4. Si hay pestañas, selecciona:
   - **"Runtime"** o **"Application"** (NO "Build")

5. Copia TODO el texto que aparezca

### Opción 2: Usar el CLI de Docker en Easypanel

Si Easypanel tiene una sección de "Terminal" o "SSH":

```bash
# Ver logs del contenedor
docker logs backend_autocall

# O si el nombre es diferente, primero lista los contenedores
docker ps -a
```

### Opción 3: Inspeccionar el estado del contenedor

En la interfaz de Easypanel, busca información sobre:

- **Estado del contenedor**: Running / Unhealthy / Crashed / Restarting
- **Health check status**: Healthy / Unhealthy / Starting
- **Restart count**: Número de veces que ha reiniciado

## 🔍 Qué buscar en los logs:

Los logs deberían mostrar algo como esto si está intentando arrancar:

```
🔌 Testing database connection...
🔌 Connecting to PostgreSQL...
   Host: n8n_pgvector
   Database: n8n
   User: postgres
   SSL: disabled

❌ Database connection failed: [ERROR AQUÍ]
```

O si arranca correctamente:

```
╔════════════════════════════════════════════╗
║   🚀 n8n Lead Sync API Server Started     ║
╚════════════════════════════════════════════╝

📡 Server:        http://localhost:3000
🏥 Health Check:  http://localhost:3000/api/health
```

## ⚠️ Si no aparecen logs:

Significa que el contenedor está crasheando inmediatamente al arrancar. En ese caso:

1. Verifica que las **variables de entorno** estén correctamente configuradas
2. Intenta **redesplegar** la aplicación
3. Revisa el **estado del contenedor** en Easypanel

---

**Por favor, copia los logs y compártelos para poder ayudarte a solucionar el problema.**
