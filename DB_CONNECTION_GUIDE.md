# Guía de Conexión a Base de Datos PostgreSQL en Easypanel

## Problema Actual
```
Error: connect ETIMEDOUT 77.37.120.193:5432
```

La conexión directa al puerto 5432 está bloqueada porque Easypanel no expone PostgreSQL públicamente por seguridad.

## Soluciones

### ✅ Opción 1: Desplegar el Backend en Easypanel (RECOMENDADO)

La mejor solución es desplegar tu backend Node.js/Express en el mismo Easypanel donde está PostgreSQL. De esta forma:

**Ventajas:**
- ✅ Conexión interna ultra-rápida
- ✅ Sin problemas de firewall
- ✅ Más seguro (DB no expuesta públicamente)
- ✅ Gratis (sin costos de túnel)

**Pasos:**

1. **Crear un nuevo servicio en Easypanel**
   - Tipo: Node.js
   - Puerto: 3000
   - Variables de entorno:
     ```env
     DB_HOST=n8n-pgvector-pgweb  # Nombre interno del servicio
     DB_PORT=5432
     DB_NAME=n8n
     DB_USER=postgres
     DB_PASSWORD=ae5549e37573f5ce67f6
     DB_SSL=false  # No necesario en red interna
     NODE_ENV=production
     FRONTEND_URL=https://tu-frontend.vercel.app
     ```

2. **Actualizar el archivo de conexión**
   ```javascript
   // server/config/database.js
   const pool = new Pool({
     host: process.env.DB_HOST, // Usa el nombre del servicio internamente
     port: parseInt(process.env.DB_PORT || '5432'),
     database: process.env.DB_NAME,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     ssl: process.env.DB_SSL === 'true' ? {
       rejectUnauthorized: false
     } : false,
   });
   ```

3. **Actualizar el frontend para usar la URL del backend en Easypanel**
   ```env
   # .env del frontend
   VITE_API_BASE_URL=https://tu-api.ko9agy.easypanel.host/api
   ```

---

### 🔧 Opción 2: Usar un Túnel SSH (Para desarrollo local)

Si quieres desarrollar localmente y conectarte a la BD de Easypanel:

1. **Configurar un túnel SSH en Easypanel:**
   - Ve a Settings > SSH Access en Easypanel
   - Genera una clave SSH si no la tienes

2. **Crear el túnel desde tu máquina local:**
   ```bash
   ssh -L 5432:n8n-pgvector-pgweb:5432 usuario@ko9agy.easypanel.host
   ```

3. **Actualizar tu `.env` local:**
   ```env
   DB_HOST=localhost  # El túnel redirige a localhost
   DB_PORT=5432
   DB_NAME=n8n
   DB_USER=postgres
   DB_PASSWORD=ae5549e37573f5ce67f6
   DB_SSL=false
   ```

**Nota:** Necesitas verificar si Easypanel permite conexiones SSH. Consulta su documentación.

---

### 🐘 Opción 3: Exponer PostgreSQL Públicamente (NO RECOMENDADO)

⚠️ **Esto es un riesgo de seguridad**, pero es posible:

1. En Easypanel, ve a la configuración de tu servicio PostgreSQL
2. Busca "Port Mappings" o "External Ports"
3. Mapea el puerto 5432 a un puerto externo
4. Configura restricciones de IP (whitelist)

**Riesgos:**
- ❌ Expone tu base de datos a internet
- ❌ Vulnerable a ataques de fuerza bruta
- ❌ Requiere configuración de firewall adicional

---

### 💾 Opción 4: Base de Datos Local para Desarrollo

Para desarrollo rápido, puedes usar PostgreSQL localmente:

1. **Instalar PostgreSQL localmente:**
   - Windows: https://www.postgresql.org/download/windows/
   - O usar Docker:
     ```bash
     docker run --name n8n-postgres -e POSTGRES_PASSWORD=localpass -e POSTGRES_DB=n8n -p 5432:5432 -d postgres:15
     ```

2. **Ejecutar los scripts de schema:**
   ```bash
   cd scripts
   psql -h localhost -U postgres -d n8n -f create-all-missing-tables.sql
   psql -h localhost -U postgres -d n8n -f insert-sample-data.sql
   ```

3. **Actualizar `.env` para local:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=n8n
   DB_USER=postgres
   DB_PASSWORD=localpass
   DB_SSL=false
   ```

---

## Recomendación Final

Para tu caso, te recomiendo:

### Para PRODUCCIÓN:
→ **Opción 1**: Desplegar el backend en Easypanel

### Para DESARROLLO:
→ **Opción 4**: PostgreSQL local con Docker + datos de prueba

Esto te permitirá:
- Desarrollar rápido sin depender de conexiones remotas
- No exponer credenciales de producción
- Tener datos de prueba separados

---

## Script Rápido para PostgreSQL Local con Docker

```bash
# Crear y arrancar PostgreSQL local
docker run --name n8n-postgres \
  -e POSTGRES_PASSWORD=localpass \
  -e POSTGRES_DB=n8n \
  -p 5432:5432 \
  -d postgres:15

# Esperar 5 segundos a que inicie
timeout /t 5

# Copiar los scripts al contenedor
docker cp scripts/create-all-missing-tables.sql n8n-postgres:/tmp/
docker cp scripts/insert-sample-data.sql n8n-postgres:/tmp/

# Ejecutar los scripts
docker exec -it n8n-postgres psql -U postgres -d n8n -f /tmp/create-all-missing-tables.sql
docker exec -it n8n-postgres psql -U postgres -d n8n -f /tmp/insert-sample-data.sql

echo "✅ Base de datos local configurada y lista!"
```

Actualiza tu `server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=localpass
DB_SSL=false
```

---

¿Cuál opción prefieres que implementemos?
