# Configuración sin Docker - Opciones Rápidas

## 🔍 Situación Actual

Docker no está instalado en tu sistema. Tienes 3 opciones:

---

## ✅ OPCIÓN 1: Instalar Docker Desktop (RECOMENDADO)

### Ventajas
- ✅ Fácil de instalar (5 minutos)
- ✅ Interfaz gráfica amigable
- ✅ Útil para muchos proyectos
- ✅ Gratis para uso personal

### Pasos

1. **Descargar Docker Desktop**
   - Ve a: https://www.docker.com/products/docker-desktop
   - Descarga la versión para Windows
   - Tamaño: ~500 MB

2. **Instalar**
   - Ejecuta el instalador
   - Acepta los términos
   - Reinicia tu computadora si te lo pide

3. **Verificar instalación**
   - Abre PowerShell
   - Ejecuta: `docker --version`
   - Deberías ver: `Docker version 24.x.x`

4. **Ejecutar el script**
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-local-db.ps1
   ```

**Tiempo total: ~10-15 minutos**

---

## 🚀 OPCIÓN 2: PostgreSQL Nativo en Windows (SIN DOCKER)

Si no quieres instalar Docker, puedes instalar PostgreSQL directamente.

### Pasos

1. **Descargar PostgreSQL**
   - Ve a: https://www.postgresql.org/download/windows/
   - O descarga directamente: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Versión recomendada: PostgreSQL 15.x (64-bit)

2. **Instalar PostgreSQL**
   - Ejecuta el instalador
   - **Contraseña:** cuando te pregunte, usa `localpass` (o anota la que uses)
   - **Puerto:** deja el predeterminado `5432`
   - **Locale:** Spanish, Spain (o el que prefieras)
   - Instala Stack Builder: NO (no lo necesitas)

3. **Crear la base de datos**
   ```powershell
   # Abre PowerShell y ejecuta:
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE n8n;"
   ```
   Te pedirá la contraseña que configuraste.

4. **Ejecutar los scripts de schema**
   ```powershell
   cd "C:\Users\Josemi IA\Documents\Josemi\IA_Docs\Apps\n8n-lead-sync"

   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d n8n -f scripts\create-all-missing-tables.sql

   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d n8n -f scripts\insert-sample-data.sql
   ```

5. **Actualizar server/.env**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=n8n
   DB_USER=postgres
   DB_PASSWORD=localpass  # O la contraseña que configuraste
   DB_SSL=false
   ```

6. **Reiniciar el backend**
   ```powershell
   cd server
   npm run dev
   ```

**Tiempo total: ~15-20 minutos**

---

## 🌐 OPCIÓN 3: Usar Base de Datos en la Nube (TEMPORAL)

Puedes usar un servicio de PostgreSQL gratuito en la nube temporalmente.

### 3A: ElephantSQL (Gratis hasta 20MB)

1. **Crear cuenta**
   - Ve a: https://www.elephantsql.com/
   - Registrate gratis
   - Crea una instancia "Tiny Turtle" (gratis)

2. **Obtener credenciales**
   - Copia la URL de conexión
   - Formato: `postgres://user:pass@server.db.elephantsql.com/dbname`

3. **Ejecutar scripts**
   Necesitas un cliente PostgreSQL. Instala `psql`:
   ```powershell
   winget install PostgreSQL.PostgreSQL
   ```

   Luego:
   ```powershell
   psql "TU_URL_DE_ELEPHANTSQL" -f scripts\create-all-missing-tables.sql
   psql "TU_URL_DE_ELEPHANTSQL" -f scripts\insert-sample-data.sql
   ```

4. **Actualizar .env**
   ```env
   DB_HOST=server.db.elephantsql.com
   DB_PORT=5432
   DB_NAME=tu_nombre_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_SSL=true
   ```

### 3B: Supabase (Gratis hasta 500MB)

1. **Crear proyecto**
   - Ve a: https://supabase.com/
   - Registrate y crea un proyecto nuevo
   - Elige región cercana

2. **Obtener credenciales**
   - Ve a Project Settings > Database
   - Copia las credenciales de conexión

3. **Usar la interfaz SQL**
   - Ve a SQL Editor en Supabase
   - Pega el contenido de `create-all-missing-tables.sql`
   - Ejecuta
   - Luego pega `insert-sample-data.sql`
   - Ejecuta

4. **Actualizar .env** con las credenciales de Supabase

---

## 📊 Comparación de Opciones

| Opción | Tiempo Setup | Facilidad | Costo | Recomendado |
|--------|--------------|-----------|-------|-------------|
| Docker Desktop | 10-15 min | ⭐⭐⭐⭐⭐ | Gratis | ✅ Mejor |
| PostgreSQL Nativo | 15-20 min | ⭐⭐⭐⭐ | Gratis | ✅ Bueno |
| ElephantSQL | 5-10 min | ⭐⭐⭐ | Gratis* | ⚠️ Temporal |
| Supabase | 5-10 min | ⭐⭐⭐⭐ | Gratis* | ⚠️ Temporal |

*Limitado en espacio/conexiones

---

## 🎯 Mi Recomendación

### Si tienes 15 minutos:
→ **Instala Docker Desktop**
- Lo usarás en otros proyectos
- Más fácil de gestionar
- Puedes crear/destruir bases de datos fácilmente

### Si quieres algo permanente sin Docker:
→ **PostgreSQL Nativo**
- No depende de Docker
- Rendimiento nativo
- Más control

### Si necesitas algo YA (en 5 minutos):
→ **Supabase**
- Rápido de configurar
- Interfaz web para gestionar datos
- Pero es temporal para desarrollo

---

## 🤔 ¿Qué Opción Prefieres?

Responde con el número:

**1** - Instalar Docker Desktop (te guío en la instalación)
**2** - PostgreSQL Nativo en Windows (te doy los comandos exactos)
**3** - Supabase en la nube (configuración rápida)

Y te ayudo paso a paso con la que elijas.

---

## 💡 Tip Pro

Si vas a desarrollar más proyectos web, **Docker Desktop** es una inversión de tiempo que vale la pena. Te permite:
- Correr cualquier base de datos (PostgreSQL, MySQL, MongoDB, etc.)
- Aislar entornos de desarrollo
- Replicar entornos de producción
- Trabajar con contenedores (cada vez más común en desarrollo web)

**Mi voto:** Opción 1 (Docker Desktop) 🐳
