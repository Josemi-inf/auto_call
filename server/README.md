# n8n Lead Sync - Backend API Server

Servidor backend seguro con Express.js y PostgreSQL para la aplicación n8n Lead Sync.

## 🔒 Características de Seguridad

- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **CORS** - Control de origen cruzado configurado
- ✅ **Rate Limiting** - Protección contra ataques de fuerza bruta
- ✅ **Input Validation** - Validación de todas las peticiones con express-validator
- ✅ **SQL Injection Protection** - Consultas parametrizadas
- ✅ **Error Handling** - Manejo centralizado de errores
- ✅ **Request Logging** - Logs de todas las peticiones
- ✅ **Compression** - Compresión de respuestas

## 📋 Requisitos Previos

- Node.js v18 o superior
- PostgreSQL v14 o superior
- Acceso a la base de datos PostgreSQL

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   cd server
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copia `.env.example` a `.env`
   - Actualiza las credenciales de tu base de datos en `.env`

   ```env
   DB_HOST=tu-host-postgres
   DB_PORT=5432
   DB_NAME=nombre-bd
   DB_USER=usuario-bd
   DB_PASSWORD=contraseña-bd
   DB_SSL=true
   ```

3. **Verificar que las tablas de la base de datos existan:**
   - Ejecuta el script SQL: `../scripts/create-tables.sql` en tu base de datos PostgreSQL

## 🏃 Ejecución

### Modo Desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo Producción:
```bash
npm start
```

El servidor iniciará en: `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Verifica el estado del servidor y la conexión a la base de datos.

### Leads

#### Obtener todos los leads
```
GET /api/leads?limit=100&offset=0&status=nuevo&search=maria
```

Query Parameters:
- `limit` (opcional): Número de resultados (default: 100, max: 1000)
- `offset` (opcional): Offset para paginación (default: 0)
- `status` (opcional): Filtrar por estado (`nuevo`, `contactado`, `en_seguimiento`, etc.)
- `search` (opcional): Buscar por nombre, email, teléfono

#### Obtener un lead por ID
```
GET /api/leads/:id
```

#### Crear un nuevo lead
```
POST /api/leads
Content-Type: application/json

{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "telefono": "+34 600 123 456",
  "estado_actual": "nuevo",
  "source": "web",
  "campana": "verano2024"
}
```

#### Actualizar un lead
```
PATCH /api/leads/:id
Content-Type: application/json

{
  "estado_actual": "contactado",
  "email": "nuevo@email.com"
}
```

#### Eliminar un lead (soft delete)
```
DELETE /api/leads/:id
```

#### Obtener historial de un lead
```
GET /api/leads/:id/history
```

## 🔐 Seguridad

### Rate Limiting
- **API General**: 100 requests cada 15 minutos por IP
- **Endpoints sensibles**: 20 requests cada 15 minutos por IP

### CORS
Por defecto permite peticiones desde:
- `http://localhost:8080` (frontend en desarrollo)

Para cambiar el origen permitido, actualiza `FRONTEND_URL` en `.env`

### Validación de Inputs
Todos los endpoints validan automáticamente:
- Tipos de datos correctos
- Formatos válidos (email, UUID, teléfono)
- Longitud de campos
- Estados permitidos

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Verifica las credenciales en `.env`
- Asegúrate que PostgreSQL esté accesible
- Revisa que el puerto 5432 esté abierto
- Si usas SSL, verifica que `DB_SSL=true`

### Error: "CORS error"
- Verifica que `FRONTEND_URL` en `.env` coincida con la URL de tu frontend
- Asegúrate que el frontend esté corriendo en `http://localhost:8080`

### Error: "Cannot find module"
- Ejecuta `npm install` en el directorio `server/`

## 📊 Estructura del Proyecto

```
server/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── middleware/
│   ├── security.js          # Middleware de seguridad (CORS, rate limiting, etc.)
│   └── validators.js        # Validaciones de inputs
├── routes/
│   ├── leads.js            # Rutas de leads
│   └── health.js           # Health check
├── .env                    # Variables de entorno (no commitar)
├── .env.example           # Ejemplo de variables de entorno
├── index.js               # Punto de entrada del servidor
└── package.json           # Dependencias
```

## 🔧 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | - |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `DB_NAME` | Nombre de la base de datos | - |
| `DB_USER` | Usuario de la base de datos | - |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `DB_SSL` | Usar SSL para la conexión | false |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno (development/production) | development |
| `FRONTEND_URL` | URL del frontend para CORS | http://localhost:8080 |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | 100 |

## 📝 Logs

El servidor registra automáticamente:
- ✅ Requests exitosos (status 2xx-3xx)
- ❌ Requests fallidos (status 4xx-5xx)
- Duración de cada request
- IP del cliente

## 🚀 Deployment

Para producción:
1. Establece `NODE_ENV=production`
2. Usa un proceso manager como PM2
3. Configura un proxy inverso (nginx)
4. Habilita HTTPS
5. Configura rate limiting más estricto si es necesario