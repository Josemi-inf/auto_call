# Guía para Exponer Puerto 5432 de PostgreSQL en Easypanel

## ⚠️ ADVERTENCIA DE SEGURIDAD

Exponer PostgreSQL públicamente es un **riesgo de seguridad significativo**. Solo hazlo si:
- Es temporal para desarrollo
- Implementas todas las medidas de seguridad
- No hay datos sensibles en producción
- Tienes un plan de monitoreo

## 🔒 Medidas de Seguridad OBLIGATORIAS

### 1. Cambiar la Contraseña a una MUY Fuerte

```sql
-- Conectarte a PostgreSQL en Easypanel (a través de PgWeb o terminal)
ALTER USER postgres WITH PASSWORD 'TU_CONTRASEÑA_SUPER_SEGURA_MIN_32_CARACTERES';
```

**Genera una contraseña segura:**
```
Ejemplo: Kp9$mX2#vL8@nQ4&wR7!bT6^yH3%zF1*jC5
```

### 2. Configurar pg_hba.conf para Restringir IPs

En Easypanel, edita la configuración de PostgreSQL:

```conf
# Solo permitir tu IP pública
host    all    all    TU_IP_PUBLICA/32    md5

# O si trabajas desde múltiples ubicaciones (menos seguro)
host    all    all    0.0.0.0/0    scram-sha-256
```

**Para obtener tu IP pública:**
```bash
curl https://api.ipify.org
```

### 3. Limitar Conexiones Máximas

```sql
ALTER SYSTEM SET max_connections = 10;
SELECT pg_reload_conf();
```

### 4. Configurar Firewall en Easypanel

Si Easypanel tiene opciones de firewall:
- Whitelist solo tu IP
- Bloquear todo lo demás

### 5. Habilitar Logs de Conexión

```sql
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_duration = 'on';
SELECT pg_reload_conf();
```

## 📝 Pasos para Exponer el Puerto en Easypanel

### Paso 1: Ir a Configuración del Servicio

1. Abre Easypanel
2. Ve a tu servicio `n8n-pgvector-pgweb`
3. Busca la sección **"Domains & Ports"** o **"Network"**

### Paso 2: Exponer el Puerto

```
Puerto Interno: 5432
Puerto Público: 5432 (o cualquier otro puerto libre, ej: 15432)
Protocolo: TCP
```

**Recomendación:** Usa un puerto NO estándar (ej: `15432` en lugar de `5432`) para reducir escaneos automáticos.

### Paso 3: Guardar y Esperar

- Guarda los cambios
- Espera 1-2 minutos a que se aplique la configuración
- Anota el puerto público asignado

### Paso 4: Actualizar tu `.env`

```env
# Database Configuration - PRODUCCIÓN CON PUERTO EXPUESTO
DB_HOST=n8n-pgvector-pgweb.ko9agy.easypanel.host
DB_PORT=15432  # O el puerto que hayas configurado
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=TU_NUEVA_CONTRASEÑA_SUPER_SEGURA
DB_SSL=true
```

### Paso 5: Probar la Conexión

```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
```

## 🎯 MEJOR ALTERNATIVA (Recomendada)

En lugar de exponer el puerto, considera estas opciones MÁS SEGURAS:

### Opción A: Túnel SSH (Seguro para Desarrollo)

```bash
# Crear túnel SSH a través de Easypanel
ssh -L 5432:n8n-pgvector-pgweb:5432 usuario@ko9agy.easypanel.host

# En otra terminal, conectarte como si fuera local
# .env
DB_HOST=localhost
DB_PORT=5432
```

### Opción B: VPN de Easypanel

Verifica si Easypanel ofrece VPN o acceso privado a la red interna.

### Opción C: Desplegar Backend en Easypanel ⭐ (MEJOR)

**Esta es la solución de producción correcta:**

1. Crea un nuevo servicio en Easypanel para tu backend
2. Usa el nombre interno del servicio PostgreSQL
3. No expones ningún puerto públicamente

```env
# .env para backend EN Easypanel
DB_HOST=n8n-pgvector-pgweb  # Nombre interno, sin dominio
DB_PORT=5432
DB_NAME=n8n
DB_USER=postgres
DB_PASSWORD=ae5549e37573f5ce67f6
DB_SSL=false  # No necesario en red interna
```

**Ventajas:**
- ✅ Sin riesgos de seguridad
- ✅ Conexión ultra-rápida
- ✅ Gratis (sin exposición de puertos)
- ✅ Arquitectura de producción correcta

## 🔍 Monitoreo Después de Exponer

Si decides exponer el puerto, **monitorea activamente**:

```sql
-- Ver intentos de conexión
SELECT * FROM pg_stat_activity;

-- Ver logs de autenticación fallida
SELECT * FROM pg_stat_database;
```

## 📊 Comparación de Opciones

| Opción | Seguridad | Velocidad | Costo | Recomendado |
|--------|-----------|-----------|-------|-------------|
| PostgreSQL Local (Docker) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis | ✅ Desarrollo |
| Backend en Easypanel | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis | ✅ Producción |
| Túnel SSH | ⭐⭐⭐⭐ | ⭐⭐⭐ | Gratis | ✅ Temporal |
| Puerto Expuesto | ⭐ | ⭐⭐⭐⭐ | Gratis | ❌ Evitar |

## 🚨 Señales de Alerta

Si expones el puerto y ves esto, CIÉRRALO INMEDIATAMENTE:

```bash
# Múltiples intentos de conexión desde IPs desconocidas
# Logs llenos de "authentication failed"
# Tráfico de red anormalmente alto
# Intentos de SQL injection en los logs
```

## ✅ Checklist de Seguridad

Antes de exponer el puerto, verifica:

- [ ] Contraseña cambiada a algo súper seguro (32+ caracteres)
- [ ] pg_hba.conf configurado para tu IP solamente
- [ ] max_connections limitado
- [ ] Logs habilitados
- [ ] Puerto no estándar (no usar 5432)
- [ ] Plan de monitoreo activo
- [ ] Firewall configurado (si disponible)
- [ ] SSL habilitado
- [ ] Backups automáticos configurados
- [ ] Plan para cerrar el puerto después

## 🎓 Mi Recomendación Final

**NO EXPONGAS EL PUERTO**

En su lugar:

### Para DESARROLLO (Ahora):
```bash
# Usa PostgreSQL local con Docker
powershell -ExecutionPolicy Bypass -File setup-local-db.ps1
```

### Para PRODUCCIÓN (Después):
1. Despliega tu backend en Easypanel
2. Configura variables de entorno con nombre interno
3. Todo queda en red privada

**¿Por qué?**
- Cero riesgos de seguridad
- Más rápido (latencia interna < 1ms)
- Gratis
- Arquitectura correcta
- No requiere mantenimiento de seguridad

---

## 💬 ¿Necesitas Ayuda?

Si aún quieres exponer el puerto para un caso específico, dime:
1. ¿Por qué necesitas exponer el puerto?
2. ¿Es temporal o permanente?
3. ¿Hay datos sensibles?

Y te ayudo a configurarlo de la forma más segura posible.

---

**Resumen:** Puedes exponer el puerto, pero es como dejar tu casa con la puerta abierta. Mejor usa PostgreSQL local para desarrollo y despliega el backend en Easypanel para producción.
