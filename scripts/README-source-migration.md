# Migración: Agregar campo Source a lead_concesionario_marca

## Descripción
Esta migración agrega el campo `source` a la tabla `lead_concesionario_marca` para rastrear el origen de cada interés específico del lead (web, facebook, instagram, google, referido, llamada, etc.).

## ¿Cómo aplicar la migración?

### Opción 1: Usando psql (Recomendado)
```bash
psql -U tu_usuario -d nombre_base_datos -f scripts/add-source-to-lcm.sql
```

### Opción 2: Usando pgAdmin u otra herramienta GUI
1. Abre pgAdmin y conéctate a tu base de datos
2. Abre el archivo `scripts/add-source-to-lcm.sql`
3. Copia y pega el contenido en una nueva ventana de Query
4. Ejecuta el script

### Opción 3: Desde la línea de comandos de PostgreSQL
```sql
-- Conéctate a tu base de datos y ejecuta:
\i /ruta/completa/a/scripts/add-source-to-lcm.sql
```

## ¿Qué hace esta migración?
1. Agrega la columna `source` (VARCHAR(100)) a la tabla `lead_concesionario_marca`
2. Establece un valor por defecto 'sin_especificar' para registros existentes
3. Agrega un comentario descriptivo a la columna

## Campos source sugeridos
Los valores comunes que puedes usar para el campo source son:
- `web` - Formulario del sitio web
- `facebook` - Campaña de Facebook Ads
- `instagram` - Campaña de Instagram Ads
- `google` - Google Ads / Búsqueda orgánica
- `referido` - Referido por otro cliente
- `llamada` - Llamada telefónica entrante
- `whatsapp` - Contacto por WhatsApp
- `email` - Campaña de email marketing
- `feria` - Evento o feria automotriz
- `visita_concesionario` - Visita física al concesionario
- `sin_especificar` - No se especificó el origen

## Verificar que se aplicó correctamente
Después de ejecutar la migración, verifica con:
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'lead_concesionario_marca'
AND column_name = 'source';
```

Deberías ver:
```
 column_name | data_type | character_maximum_length
-------------+-----------+-------------------------
 source      | character varying | 100
```

## Cambios en el código
Esta migración ya está integrada en:
1. **Backend**: Las consultas SQL en `server/routes/leads.js` ya incluyen el campo `source`
2. **Frontend**: El componente `BrandDealershipCard.tsx` muestra el campo source en la sección de intereses
3. **Tipos TypeScript**: La interfaz `LeadConcesionarioMarca` en `src/types/index.ts` incluye el campo `source`

## Rollback (Deshacer cambios)
Si necesitas revertir esta migración:
```sql
ALTER TABLE lead_concesionario_marca DROP COLUMN IF EXISTS source;
```

**⚠️ ADVERTENCIA**: Esto eliminará permanentemente todos los datos de la columna source.
