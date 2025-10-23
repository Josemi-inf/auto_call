# 🚀 Solución Rápida al Error de Conexión de Base de Datos

## El Problema

```
Error: connect ETIMEDOUT 77.37.120.193:5432
```

Tu aplicación no puede conectarse a PostgreSQL en Easypanel porque **el puerto 5432 no está expuesto públicamente** (por seguridad).

## ✅ Solución Rápida - PostgreSQL Local

Para desarrollar localmente, usa PostgreSQL en Docker:

### Paso 1: Ejecutar el script de configuración

**Opción A - PowerShell (Recomendado):**
```powershell
powershell -ExecutionPolicy Bypass -File setup-local-db.ps1
```

**Opción B - Batch:**
```cmd
setup-local-db.bat
```

### Paso 2: Cambiar la configuración del servidor

Reemplaza el contenido de `server/.env` con el de `server/.env.local`:

**Windows:**
```cmd
cd server
copy .env.local .env
```

**PowerShell:**
```powershell
cd server
Copy-Item .env.local .env -Force
```

### Paso 3: Reiniciar el servidor backend

```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
```

## 📝 Comandos Útiles

### Gestión del contenedor Docker

```bash
# Ver estado
docker ps | findstr n8n-postgres

# Parar la base de datos
docker stop n8n-postgres

# Iniciar la base de datos
docker start n8n-postgres

# Ver logs
docker logs n8n-postgres

# Conectarse a PostgreSQL
docker exec -it n8n-postgres psql -U postgres -d n8n

# Eliminar el contenedor completamente
docker stop n8n-postgres
docker rm n8n-postgres
```

### Re-ejecutar los scripts de schema

Si necesitas resetear la base de datos:

```bash
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql
```

## 🔧 Configuración Manual (Si prefieres no usar los scripts)

### 1. Crear el contenedor manualmente

```bash
docker run --name n8n-postgres \
  -e POSTGRES_PASSWORD=localpass \
  -e POSTGRES_DB=n8n \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Esperar 10 segundos

```bash
timeout /t 10
```

### 3. Copiar y ejecutar scripts

```bash
docker cp scripts/create-all-missing-tables.sql n8n-postgres:/tmp/
docker cp scripts/insert-sample-data.sql n8n-postgres:/tmp/
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql
```

### 4. Actualizar server/.env

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=localpass
DB_SSL=false
```

## 🌐 Para Producción

Para conectarte a la base de datos de Easypanel en producción, necesitas:

1. **Desplegar el backend en Easypanel** (mismo servidor que la BD)
2. Usar el nombre interno del servicio: `n8n-pgvector-pgweb`
3. Ver la guía completa en: [DB_CONNECTION_GUIDE.md](./DB_CONNECTION_GUIDE.md)

## ❓ Troubleshooting

### Error: "docker: command not found"
- Instala Docker Desktop: https://www.docker.com/products/docker-desktop

### Error: "Cannot connect to Docker daemon"
- Inicia Docker Desktop
- Espera a que esté completamente iniciado (ícono de ballena en la barra de tareas)

### Error: "port is already allocated"
- Otro servicio está usando el puerto 5432
- Verifica con: `netstat -ano | findstr :5432`
- Para el servicio que lo está usando o cambia el puerto en el comando docker

### La base de datos no tiene datos
- Ejecuta los scripts de nuevo:
```bash
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql
docker exec n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql
```

## 📚 Más Información

- Guía completa de conexión: [DB_CONNECTION_GUIDE.md](./DB_CONNECTION_GUIDE.md)
- Documentación de PostgreSQL: https://www.postgresql.org/docs/
- Docker PostgreSQL: https://hub.docker.com/_/postgres

---

**¿Todo funcionando?** Ahora puedes:
1. Arrancar el frontend: `npm run dev` (desde la raíz)
2. Arrancar el backend: `npm run dev` (desde `/server`)
3. Abrir http://localhost:8080 en tu navegador
