# 🚀 Guía Completa de Implementación del Sistema de Lead Scoring

## 📋 Tabla de Contenidos
1. [Pre-requisitos](#pre-requisitos)
2. [Pasos de Implementación](#pasos-de-implementación)
3. [Configuración de n8n](#configuración-de-n8n)
4. [Integración con Autocall](#integración-con-autocall)
5. [Testing](#testing)
6. [Monitoreo](#monitoreo)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pre-requisitos

### Software Necesario
- ✅ PostgreSQL 12+ instalado y funcionando
- ✅ n8n instalado (Docker o instalación local)
- ✅ Node.js 18+ para el backend de Autocall
- ✅ Acceso a la base de datos con permisos de escritura

### Conocimientos Requeridos
- ✅ Conocimiento básico de SQL
- ✅ Familiaridad con n8n (deseable)
- ✅ Comprensión del flujo de Autocall

---

## 📦 Pasos de Implementación

### **FASE 1: Preparación de la Base de Datos (30-60 min)**

#### Paso 1.1: Verificar campos de scoring
```bash
cd /home/user/auto_call/recursos/sql
psql -U tu_usuario -d auto_call -f verify-scoring-fields.sql
```

**Qué hace este script:**
- Verifica si existen los campos de scoring en la tabla `leads`
- Crea automáticamente los campos que falten
- Muestra estadísticas actuales de scoring

**Resultado esperado:**
```
✅ 13 campos de scoring verificados/creados
✅ Estadísticas generadas correctamente
```

#### Paso 1.2: Crear índices para optimización
```bash
psql -U tu_usuario -d auto_call -f create-indexes.sql
```

**Qué hace este script:**
- Crea 15+ índices optimizados para consultas de scoring
- Mejora el rendimiento de los workflows en 10-100x
- Optimiza las consultas desde Autocall

**Resultado esperado:**
```
✅ Índices creados: 18
✅ Tiempo de creación: 5-15 segundos
✅ Tamaño total de índices: ~50-200 MB
```

#### Paso 1.3: Backup de seguridad
```bash
pg_dump -U tu_usuario auto_call > backup_antes_scoring_$(date +%Y%m%d).sql
```

---

### **FASE 2: Instalación de Workflows n8n (45-90 min)**

#### Paso 2.1: Acceder a n8n

**Si usas Docker:**
```bash
cd /ruta/a/tu/n8n
docker-compose up -d
```

**Accede a:** `http://localhost:5678`

#### Paso 2.2: Configurar credenciales PostgreSQL

1. En n8n, ve a **Settings** → **Credentials**
2. Haz clic en **"+ New Credential"**
3. Busca y selecciona **"PostgreSQL"**
4. Completa los datos:
   ```
   Connection Type: Host
   Host: localhost (o tu host)
   Database: auto_call
   User: tu_usuario
   Password: tu_contraseña
   Port: 5432
   SSL Mode: disable (o según tu configuración)
   ```
5. Haz clic en **"Test Connection"** para verificar
6. Haz clic en **"Save"**

**⚠️ IMPORTANTE:** Anota el nombre de estas credenciales (ej: "PostgreSQL account")

#### Paso 2.3: Importar Workflow 1 - Lead Scoring Calculator

1. En n8n, haz clic en **menú ☰** → **Import from File**
2. Selecciona: `/home/user/auto_call/recursos/workflows/1-lead-scoring-calculator.json`
3. Haz clic en **"Import"**
4. Se abrirá el workflow importado
5. Haz clic en cada nodo de PostgreSQL (hay 2 nodos):
   - Nodo "Get Lead Data"
   - Nodo "Update Lead Score"
6. Para cada uno, en la sección **"Credential to connect with"**, selecciona las credenciales que creaste
7. Haz clic en **"Save"** (botón superior derecho)
8. Haz clic en **"Activate"** (toggle superior derecho)

**✅ Verificación:**
- El workflow debe mostrar "Active" en verde
- Anota la URL del webhook: `http://localhost:5678/webhook/calculate-lead-score`

#### Paso 2.4: Importar Workflow 2 - Call Scoring Analyzer

Repite el proceso del Paso 2.3 pero con:
- Archivo: `2-call-scoring-analyzer.json`
- Nodos PostgreSQL: "Get Call Data" y "Update Call Scores in Lead"
- Webhook URL: `http://localhost:5678/webhook/analyze-call-score`

#### Paso 2.5: Importar Workflow 3 - LQI Calculator

Repite el proceso del Paso 2.3 pero con:
- Archivo: `3-lqi-calculator.json`
- Nodos PostgreSQL: "Get Lead Complete Data" y "Update LQI in Database"
- Webhook URL: `http://localhost:5678/webhook/calculate-lqi`

#### Paso 2.6: Importar Workflow 4 - Score Based Actions

Repite el proceso del Paso 2.3 pero con:
- Archivo: `4-score-based-actions.json`
- Nodos PostgreSQL: Múltiples (asigna credenciales a todos)
- Webhook URL: `http://localhost:5678/webhook/high-priority-lead`

**⚠️ NOTA:** Este workflow tiene nodos adicionales que pueden fallar si no existen las tablas:
- `comerciales` (para asignar comerciales)
- `tareas_seguimiento` (para programar seguimientos)

Si no existen estas tablas, puedes:
- Crearlas (recomendado)
- O desactivar esos nodos temporalmente

---

### **FASE 3: Testing de Workflows (30 min)**

#### Paso 3.1: Obtener un lead_id real de prueba
```sql
SELECT lead_id, nombre, apellidos, telefono
FROM leads
WHERE activo = true
LIMIT 1;
```

Anota el `lead_id` (ej: `550e8400-e29b-41d4-a716-446655440000`)

#### Paso 3.2: Probar Workflow 1 - Lead Scoring Calculator

**Desde la terminal:**
```bash
curl -X POST http://localhost:5678/webhook/calculate-lead-score \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "TU_LEAD_ID_AQUI"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "lead_score": 67,
  "calidad_lead": "caliente",
  "breakdown": {
    "informacion_completa": 20,
    "engagement": 15,
    "recencia": 18,
    "consentimiento": 10,
    "estado": 8
  },
  "calculated_at": "2025-11-14T10:30:00.000Z"
}
```

**Verificar en la base de datos:**
```sql
SELECT lead_id, lead_score, calidad_lead
FROM leads
WHERE lead_id = 'TU_LEAD_ID_AQUI';
```

#### Paso 3.3: Probar Workflow 2 - Call Scoring Analyzer

Primero, obtener un `call_id`:
```sql
SELECT call_id, lead_id, exitoso, duracion_ms
FROM call_logs
ORDER BY created_at DESC
LIMIT 1;
```

Luego probar:
```bash
curl -X POST http://localhost:5678/webhook/analyze-call-score \
  -H "Content-Type: application/json" \
  -d '{"call_id": "TU_CALL_ID_AQUI"}'
```

#### Paso 3.4: Probar Workflow 3 - LQI Calculator

```bash
curl -X POST http://localhost:5678/webhook/calculate-lqi \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "TU_LEAD_ID_AQUI"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "lqi": 72,
  "categoria_lqi": "alto",
  "prioridad": 4,
  "recomendacion": "Lead de alta calidad. Seguimiento prioritario en 24h.",
  "factores_mejora": ["Mejorar calidad de llamadas"],
  "calculated_at": "2025-11-14T10:35:00.000Z"
}
```

#### Paso 3.5: Verificar en n8n

1. Ve a **Executions** en el menú lateral de n8n
2. Deberías ver las ejecuciones de tus tests
3. Haz clic en cada una para ver los detalles
4. Verifica que todas sean ✅ "Success"

---

### **FASE 4: Integración con Autocall Backend (60-90 min)**

#### Paso 4.1: Actualizar endpoints de API

**Archivo:** `server/routes/leads.js`

```javascript
// GET /api/leads/:id - Añadir campos de scoring
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        l.*,
        l.lead_score,
        l.calidad_lead,
        l.call_response_score,
        l.call_duration_score,
        l.call_interaction_score,
        l.call_behavior_score,
        l.call_total_score,
        l.call_score_category,
        l.call_score_breakdown,
        l.call_score_updated_at,
        l.lqi,
        l.categoria_lqi,
        l.lqi_breakdown,
        COUNT(DISTINCT cl.call_id) as total_llamadas,
        COUNT(DISTINCT CASE WHEN cl.exitoso THEN cl.call_id END) as llamadas_exitosas
      FROM leads l
      LEFT JOIN call_logs cl ON l.lead_id = cl.lead_id
      WHERE l.lead_id = $1
      GROUP BY l.lead_id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting lead:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

#### Paso 4.2: Crear endpoint para recalcular scoring

```javascript
// POST /api/leads/:id/recalculate-score
router.post('/:id/recalculate-score', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el lead existe
    const leadCheck = await pool.query(
      'SELECT lead_id FROM leads WHERE lead_id = $1',
      [id]
    );

    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    // Llamar a los workflows de n8n
    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';

    // 1. Calcular Lead Score
    await fetch(`${n8nBaseUrl}/webhook/calculate-lead-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: id })
    });

    // 2. Calcular LQI (el Call Score se calcula automáticamente con cada llamada)
    const lqiResponse = await fetch(`${n8nBaseUrl}/webhook/calculate-lqi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: id })
    });

    const lqiData = await lqiResponse.json();

    res.json({
      success: true,
      message: 'Scoring recalculado correctamente',
      lqi: lqiData.lqi,
      categoria_lqi: lqiData.categoria_lqi
    });
  } catch (error) {
    console.error('Error recalculating score:', error);
    res.status(500).json({ error: 'Error al recalcular scoring' });
  }
});
```

#### Paso 4.3: Integrar con registro de llamadas

**Archivo:** `server/routes/calls.js`

```javascript
// POST /api/calls - Al registrar una llamada, calcular scoring automáticamente
router.post('/', async (req, res) => {
  try {
    const { lead_id, exitoso, resultado, duracion_ms, output_data } = req.body;

    // Insertar la llamada en call_logs
    const insertQuery = `
      INSERT INTO call_logs (
        lead_id, exitoso, resultado, duracion_ms, output_data, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      lead_id,
      exitoso,
      resultado,
      duracion_ms,
      output_data
    ]);

    const newCall = result.rows[0];

    // Disparar cálculo de Call Scoring automáticamente
    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';

    // No esperar la respuesta (fire and forget)
    fetch(`${n8nBaseUrl}/webhook/analyze-call-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: newCall.call_id })
    }).catch(err => console.error('Error calling n8n webhook:', err));

    res.status(201).json(newCall);
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: 'Error al registrar llamada' });
  }
});
```

#### Paso 4.4: Añadir variable de entorno

**Archivo:** `.env`
```bash
N8N_WEBHOOK_URL=http://localhost:5678
```

---

### **FASE 5: Frontend - Visualización del Scoring (60-90 min)**

#### Paso 5.1: Crear componente LeadScoreCard

**Archivo:** `src/components/LeadScoreCard.tsx`

```typescript
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Phone, Star } from "lucide-react";

interface LeadScoreCardProps {
  lead: {
    lead_score?: number;
    calidad_lead?: string;
    call_total_score?: number;
    call_score_category?: string;
    lqi?: number;
    categoria_lqi?: string;
    lqi_breakdown?: any;
  };
}

const calidadColors: Record<string, string> = {
  muy_caliente: "bg-red-500 hover:bg-red-600",
  caliente: "bg-orange-500 hover:bg-orange-600",
  tibio: "bg-yellow-500 hover:bg-yellow-600",
  frio: "bg-blue-500 hover:bg-blue-600"
};

const lqiColors: Record<string, string> = {
  premium: "bg-purple-500 hover:bg-purple-600 text-white",
  alto: "bg-green-500 hover:bg-green-600 text-white",
  medio: "bg-blue-500 hover:bg-blue-600 text-white",
  bajo: "bg-yellow-500 hover:bg-yellow-600",
  muy_bajo: "bg-gray-500 hover:bg-gray-600 text-white"
};

export function LeadScoreCard({ lead }: LeadScoreCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Lead Scoring</h3>

      {/* Lead Score General */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Lead Score</span>
          </div>
          {lead.calidad_lead && (
            <Badge className={calidadColors[lead.calidad_lead] || ""}>
              {lead.calidad_lead.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
        <Progress value={lead.lead_score || 0} className="h-3 mb-1" />
        <p className="text-sm text-muted-foreground">
          {lead.lead_score || 0}/100 puntos
        </p>
      </div>

      {/* Call Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Call Score</span>
          </div>
          {lead.call_score_category && (
            <Badge variant="outline">
              {lead.call_score_category.toUpperCase()}
            </Badge>
          )}
        </div>
        <Progress value={lead.call_total_score || 0} className="h-3 mb-1" />
        <p className="text-sm text-muted-foreground">
          {lead.call_total_score || 0}/100 puntos
        </p>
      </div>

      {/* LQI - Lead Quality Index */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">LQI (Lead Quality Index)</span>
          </div>
          {lead.categoria_lqi && (
            <Badge className={lqiColors[lead.categoria_lqi] || ""}>
              {lead.categoria_lqi.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold text-center py-4">
          {lead.lqi || 0}
          <span className="text-sm text-muted-foreground ml-1">/100</span>
        </div>

        {/* Breakdown del LQI */}
        {lead.lqi_breakdown && (
          <div className="mt-4 pt-4 border-t space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Lead Score Component:</span>
              <span className="font-medium">{lead.lqi_breakdown.lead_score_component || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Call Score Component:</span>
              <span className="font-medium">{lead.lqi_breakdown.call_score_component || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus Actividad:</span>
              <span className="font-medium">{lead.lqi_breakdown.actividad_bonus || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus Engagement:</span>
              <span className="font-medium">{lead.lqi_breakdown.engagement_bonus || 0}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
```

#### Paso 5.2: Integrar en la página de detalle del lead

**Archivo:** `src/pages/LeadDetail.tsx`

```typescript
import { LeadScoreCard } from "@/components/LeadScoreCard";
// ... otros imports

export function LeadDetail() {
  const { id } = useParams();
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) throw new Error('Failed to fetch lead');
      return response.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información del lead (columna izquierda) */}
        <div className="md:col-span-2">
          {/* ... contenido existente ... */}
        </div>

        {/* Scoring (columna derecha) */}
        <div>
          <LeadScoreCard lead={lead} />
        </div>
      </div>
    </div>
  );
}
```

---

### **FASE 6: Automatización Completa (30 min)**

#### Paso 6.1: Calcular scoring inicial para leads existentes

```bash
# Script para calcular scoring de todos los leads sin score
```

**Crear archivo:** `scripts/calculate-initial-scoring.js`

```javascript
const fetch = require('node-fetch');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'auto_call',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  port: 5432
});

const N8N_BASE_URL = 'http://localhost:5678';

async function calculateInitialScoring() {
  try {
    // Obtener todos los leads sin scoring
    const result = await pool.query(`
      SELECT lead_id
      FROM leads
      WHERE activo = true
        AND (lead_score IS NULL OR lqi IS NULL)
      LIMIT 1000
    `);

    console.log(`Encontrados ${result.rows.length} leads sin scoring`);

    let processed = 0;
    let errors = 0;

    for (const row of result.rows) {
      try {
        // Calcular Lead Score
        await fetch(`${N8N_BASE_URL}/webhook/calculate-lead-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: row.lead_id })
        });

        // Calcular LQI
        await fetch(`${N8N_BASE_URL}/webhook/calculate-lqi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: row.lead_id })
        });

        processed++;

        if (processed % 10 === 0) {
          console.log(`Procesados: ${processed}/${result.rows.length}`);
        }

        // Pausa de 100ms para no saturar n8n
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error procesando lead ${row.lead_id}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Proceso completado!`);
    console.log(`   Procesados correctamente: ${processed}`);
    console.log(`   Errores: ${errors}`);
  } catch (error) {
    console.error('Error en el proceso:', error);
  } finally {
    await pool.end();
  }
}

calculateInitialScoring();
```

**Ejecutar:**
```bash
node scripts/calculate-initial-scoring.js
```

---

## ✅ Checklist Final de Implementación

### Base de Datos
- [ ] Campos de scoring verificados/creados
- [ ] Índices creados y optimizados
- [ ] Backup de seguridad realizado
- [ ] Scripts SQL probados

### n8n Workflows
- [ ] Workflow 1: Lead Scoring Calculator activado
- [ ] Workflow 2: Call Scoring Analyzer activado
- [ ] Workflow 3: LQI Calculator activado
- [ ] Workflow 4: Score Based Actions activado
- [ ] Credenciales de PostgreSQL configuradas
- [ ] Webhooks funcionando correctamente

### Backend API
- [ ] Endpoint GET /api/leads/:id actualizado con scoring
- [ ] Endpoint POST /api/leads/:id/recalculate-score creado
- [ ] Integración con registro de llamadas implementada
- [ ] Variable N8N_WEBHOOK_URL configurada

### Frontend
- [ ] Componente LeadScoreCard creado
- [ ] Integrado en página de detalle del lead
- [ ] Visualización correcta de scores

### Automatización
- [ ] Scoring inicial calculado para leads existentes
- [ ] Cálculo automático en nuevas llamadas funcionando
- [ ] Acciones automáticas configuradas (si aplica)

### Testing
- [ ] Test manual de cada workflow realizado
- [ ] Test de integración backend-n8n realizado
- [ ] Visualización en frontend verificada
- [ ] Performance de consultas verificado

### Documentación
- [ ] README de workflows leído
- [ ] Guía de implementación completada
- [ ] Scripts SQL documentados
- [ ] Troubleshooting conocido

---

## 🎉 ¡Implementación Completada!

Tu sistema de Lead Scoring está ahora completamente funcional y listo para:

✅ Calcular automáticamente el score de cada lead
✅ Analizar la calidad de cada llamada
✅ Calcular el LQI (Lead Quality Index) combinado
✅ Disparar acciones automáticas según el score
✅ Visualizar los scores en la interfaz de Autocall

### Próximos Pasos Recomendados:

1. **Monitorear durante 1 semana** el comportamiento del sistema
2. **Ajustar umbrales** de categorización según tus necesidades
3. **Configurar notificaciones** (Slack, email) para leads premium
4. **Analizar métricas** de efectividad del scoring
5. **Optimizar fórmulas** basándote en datos reales

---

## 📞 Soporte

Si tienes problemas durante la implementación:
- Revisa la sección [Troubleshooting](#troubleshooting)
- Consulta los logs de n8n: Settings → Log Streaming
- Verifica la consola de PostgreSQL
- Revisa los logs del backend de Autocall

---

**Última actualización:** 2025-11-14
**Versión:** 1.0.0
**Autor:** Sistema de Lead Scoring Autocall
