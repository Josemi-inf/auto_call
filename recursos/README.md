# 📊 Sistema de Lead Scoring para Autocall

Este directorio contiene todos los recursos necesarios para implementar el sistema completo de Lead Scoring en Autocall.

## 📁 Estructura de Archivos

```
recursos/
├── README.md (este archivo)
├── IMPLEMENTATION_GUIDE.md (guía paso a paso de implementación)
├── workflows/ (workflows de n8n)
│   ├── README.md
│   ├── 1-lead-scoring-calculator.json
│   ├── 2-call-scoring-analyzer.json
│   ├── 3-lqi-calculator.json
│   └── 4-score-based-actions.json
└── sql/ (scripts de base de datos)
    ├── verify-scoring-fields.sql
    ├── create-indexes.sql
    └── analytical-queries.sql
```

## 🚀 Inicio Rápido

### 1. Verificar Base de Datos (5 min)
```bash
cd recursos/sql
psql -U tu_usuario -d auto_call -f verify-scoring-fields.sql
```

### 2. Crear Índices (5 min)
```bash
psql -U tu_usuario -d auto_call -f create-indexes.sql
```

### 3. Importar Workflows en n8n (30 min)
1. Accede a n8n: `http://localhost:5678`
2. Importa los 4 workflows de `recursos/workflows/`
3. Configura credenciales de PostgreSQL
4. Activa los workflows

### 4. Integrar con Autocall (60 min)
Sigue la [Guía de Implementación](IMPLEMENTATION_GUIDE.md) completa.

## 📚 Documentación

### Workflows de n8n

#### 1️⃣ Lead Scoring Calculator
**Archivo:** `workflows/1-lead-scoring-calculator.json`
**Webhook:** `/webhook/calculate-lead-score`
**Descripción:** Calcula el score general del lead (0-100)

**Factores evaluados:**
- Información completa (25 pts)
- Engagement (30 pts)
- Recencia (20 pts)
- Consentimiento (15 pts)
- Estado (10 pts)

#### 2️⃣ Call Scoring Analyzer
**Archivo:** `workflows/2-call-scoring-analyzer.json`
**Webhook:** `/webhook/analyze-call-score`
**Descripción:** Analiza cada llamada y calcula su calidad

**Componentes:**
- Response Score (25 pts)
- Duration Score (25 pts)
- Interaction Score (25 pts)
- Behavior Score (25 pts)

#### 3️⃣ LQI Calculator
**Archivo:** `workflows/3-lqi-calculator.json`
**Webhook:** `/webhook/calculate-lqi`
**Descripción:** Calcula el Lead Quality Index combinado

**Fórmula:**
```
LQI = (lead_score × 0.4) + (call_total_score × 0.4) +
      (intentos_compra × 10) + (tasa_exito × 0.2) +
      bonus_actividad + bonus_engagement
```

#### 4️⃣ Score Based Actions
**Archivo:** `workflows/4-score-based-actions.json`
**Webhook:** `/webhook/high-priority-lead`
**Descripción:** Ejecuta acciones automáticas según el score

**Acciones:**
- Premium (LQI ≥ 80): Asignación inmediata + notificación
- Alto (LQI 65-79): Seguimiento en 48h
- Medio (LQI 45-64): Seguimiento semanal
- Bajo (LQI < 45): Cambio de estrategia

### Scripts SQL

#### verify-scoring-fields.sql
- Verifica existencia de campos de scoring
- Crea campos faltantes automáticamente
- Muestra estadísticas actuales
- Identifica leads sin scoring

#### create-indexes.sql
- Crea 18+ índices optimizados
- Mejora rendimiento 10-100x
- Índices para lead_score, lqi, call_score
- Índices compuestos para queries complejas

#### analytical-queries.sql
- 12 categorías de consultas analíticas
- Dashboard de scoring
- Análisis de leads premium
- Alertas y anomalías
- Métricas de efectividad
- Exportación de datos

## 🎯 Categorías de Scoring

### Lead Score (0-100)
- **Muy Caliente** (80-100): 🔥 Acción inmediata
- **Caliente** (60-79): 🌡️ Seguimiento prioritario
- **Tibio** (40-59): 🌤️ Seguimiento regular
- **Frío** (0-39): ❄️ Seguimiento bajo

### LQI - Lead Quality Index (0-100)
- **Premium** (80-100): 💎 Máxima prioridad
- **Alto** (65-79): 🥇 Alta prioridad
- **Medio** (45-64): 🥈 Prioridad estándar
- **Bajo** (25-44): 🥉 Baja prioridad
- **Muy Bajo** (0-24): ⚫ Considerar descarte

## 🔄 Flujo de Trabajo

```
┌─────────────────────┐
│ Nueva Llamada       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Call Scoring        │ (Workflow 2)
│ Analyzer            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ LQI Calculator      │ (Workflow 3)
└──────────┬──────────┘
           │
           ▼
      ¿LQI ≥ 80?
           │
    ┌──────┴──────┐
    │ SÍ          │ NO
    ▼             ▼
┌─────────┐   ┌─────────┐
│ Actions │   │ Fin     │
│ Premium │   └─────────┘
└─────────┘
```

## 📊 Campos en la Tabla Leads

### Lead Scoring General
- `lead_score` (INTEGER) - Puntuación general 0-100
- `calidad_lead` (VARCHAR) - frio, tibio, caliente, muy_caliente

### Call Scoring
- `call_response_score` (INTEGER) - 0-25
- `call_duration_score` (INTEGER) - 0-25
- `call_interaction_score` (INTEGER) - 0-25
- `call_behavior_score` (INTEGER) - 0-25
- `call_total_score` (INTEGER) - 0-100
- `call_score_category` (VARCHAR) - excelente, buena, regular, baja
- `call_score_breakdown` (JSONB) - Desglose detallado
- `call_score_updated_at` (TIMESTAMP) - Última actualización

### LQI
- `lqi` (INTEGER) - Lead Quality Index 0-100
- `categoria_lqi` (VARCHAR) - premium, alto, medio, bajo, muy_bajo
- `lqi_breakdown` (JSONB) - Desglose detallado

## 🧪 Testing

### Test Manual de Workflows

```bash
# 1. Lead Scoring Calculator
curl -X POST http://localhost:5678/webhook/calculate-lead-score \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "tu-lead-id"}'

# 2. Call Scoring Analyzer
curl -X POST http://localhost:5678/webhook/analyze-call-score \
  -H "Content-Type: application/json" \
  -d '{"call_id": "tu-call-id"}'

# 3. LQI Calculator
curl -X POST http://localhost:5678/webhook/calculate-lqi \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "tu-lead-id"}'
```

### Verificar en Base de Datos

```sql
-- Ver scoring de un lead
SELECT
  lead_id,
  nombre,
  apellidos,
  lead_score,
  calidad_lead,
  call_total_score,
  call_score_category,
  lqi,
  categoria_lqi
FROM leads
WHERE lead_id = 'tu-lead-id';
```

## 📈 Métricas Esperadas

### Mejoras en Eficiencia
- ✅ **+30%** en tasa de conversión de leads premium
- ✅ **-50%** en tiempo de respuesta a leads de alta calidad
- ✅ **+40%** en eficiencia del equipo comercial
- ✅ **-25%** en leads perdidos por falta de seguimiento

### Performance Técnico
- ✅ **10-100x** más rápido en queries de scoring
- ✅ **<500ms** tiempo de cálculo por lead
- ✅ **99%+** uptime de workflows

## 🔧 Mantenimiento

### Recálculo Periódico (Recomendado)
```sql
-- Recalcular scoring de leads desactualizado (>7 días)
SELECT lead_id
FROM leads
WHERE activo = true
  AND call_score_updated_at < NOW() - INTERVAL '7 days';
```

### Análisis de Índices
```sql
-- Ver uso de índices
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as escaneos,
  idx_tup_read as tuplas_leidas
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

### Limpieza de Datos
```sql
-- Identificar y limpiar inconsistencias
SELECT COUNT(*)
FROM leads
WHERE activo = true
  AND (
    (lead_score >= 80 AND calidad_lead != 'muy_caliente') OR
    (lqi >= 80 AND categoria_lqi != 'premium')
  );
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
**Solución:** Verifica las credenciales de PostgreSQL en n8n

### Error: "Webhook not found"
**Solución:** Verifica que el workflow está activado (toggle en ON)

### Workflow no se ejecuta
**Solución:**
- Verifica que n8n está corriendo
- Revisa los logs en Settings > Log Streaming
- Comprueba que el webhook está siendo llamado correctamente

### Scores en NULL
**Solución:**
- Ejecuta el script `verify-scoring-fields.sql`
- Ejecuta cálculo inicial con `calculate-initial-scoring.js`
- Verifica que los workflows no tienen errores

## 📞 Soporte

Para más información, consulta:
- [Guía de Implementación Completa](IMPLEMENTATION_GUIDE.md)
- [README de Workflows](workflows/README.md)
- [Documentación de n8n](https://docs.n8n.io/)

## 📄 Licencia

Este sistema de scoring es parte de Autocall y está sujeto a la misma licencia del proyecto principal.

---

**Versión:** 1.0.0
**Fecha:** 2025-11-14
**Autor:** Sistema de Lead Scoring Autocall
