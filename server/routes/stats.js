import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/stats/overview
 * Get general overview statistics
 */
router.get('/overview', async (req, res, next) => {
  try {
    const { start_date, end_date, marca_id, concesionario_id } = req.query;

    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (start_date && end_date) {
      dateFilter = `AND ll.fecha_llamada BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    const query = `
      SELECT
        COUNT(DISTINCT l.lead_id) as total_leads,
        COUNT(ll.llamada_id) as total_llamadas,
        COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) as leads_exitosos,
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as porcentaje_exito,
        COUNT(CASE WHEN lcm.estado = 'no_interesado' THEN 1 END) as leads_no_interesados,
        COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END) as no_conectaron,
        COUNT(CASE WHEN ll.estado = 'busy' THEN 1 END) as buzon_voz,
        COUNT(CASE WHEN ll.estado = 'failed' THEN 1 END) as llamadas_fallidas,
        ROUND(AVG(ll.duracion), 0) as duracion_promedio,
        ROUND(
          COUNT(ll.llamada_id)::numeric / NULLIF(COUNT(DISTINCT l.lead_id), 0),
          2
        ) as intentos_medio
      FROM public.leads l
      LEFT JOIN public.lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.llamadas ll ON l.lead_id = ll.lead_id
      WHERE 1=1 ${dateFilter}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/by-marca
 * Get statistics grouped by marca
 */
router.get('/by-marca', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = `AND ll.fecha_llamada BETWEEN $1 AND $2`;
      params.push(start_date, end_date);
    }

    const query = `
      SELECT
        m.marca_id,
        m.nombre as marca,
        COUNT(DISTINCT l.lead_id) as total_leads,
        COUNT(ll.llamada_id) as total_llamadas,
        COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) as leads_exitosos,
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as porcentaje_exito,
        COUNT(CASE WHEN lcm.estado = 'no_interesado' THEN 1 END) as leads_no_interesados,
        COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END) as no_conectaron,
        COUNT(CASE WHEN ll.estado = 'busy' THEN 1 END) as buzon_voz,
        COUNT(CASE WHEN ll.estado = 'failed' THEN 1 END) as rellamadas,
        ROUND(
          COUNT(ll.llamada_id)::numeric / NULLIF(COUNT(DISTINCT l.lead_id), 0),
          2
        ) as intentos_medio,
        ROUND(AVG(ll.duracion), 0) as duracion_promedio
      FROM public.marca m
      JOIN public.concesionario_marca cm ON m.marca_id = cm.marca_id
      JOIN public.lead_concesionario_marca lcm ON cm.concesionario_marca_id = lcm.concesionario_marca_id
      JOIN public.leads l ON lcm.lead_id = l.lead_id
      LEFT JOIN public.llamadas ll ON l.lead_id = ll.lead_id
      WHERE 1=1 ${dateFilter}
      GROUP BY m.marca_id, m.nombre
      ORDER BY porcentaje_exito DESC NULLS LAST, total_leads DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/advanced
 * Get advanced analytics (conversion rates, efficiency)
 */
router.get('/advanced', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = `AND ll.fecha_llamada BETWEEN $1 AND $2`;
      params.push(start_date, end_date);
    }

    const query = `
      SELECT
        m.marca_id,
        m.nombre as marca,
        -- Tasas de conversión
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as tasa_exito,
        ROUND(
          COUNT(CASE WHEN lcm.estado = 'no_interesado' THEN 1 END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as tasa_rechazo,
        ROUND(
          (COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) -
           COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END))::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as tasa_contacto,
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(ll.llamada_id), 0),
          1
        ) as eficiencia_llamadas,
        ROUND(
          COUNT(ll.llamada_id)::numeric / NULLIF(COUNT(DISTINCT l.lead_id), 0),
          2
        ) as llamadas_por_lead,
        -- Análisis de contactabilidad
        ROUND(
          COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END)::numeric * 100.0 /
          NULLIF(COUNT(ll.llamada_id), 0),
          1
        ) as porcentaje_no_contesta,
        ROUND(
          COUNT(CASE WHEN ll.estado = 'busy' THEN 1 END)::numeric * 100.0 /
          NULLIF(COUNT(ll.llamada_id), 0),
          1
        ) as porcentaje_buzon,
        (COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END) +
         COUNT(CASE WHEN ll.estado = 'busy' THEN 1 END)) as total_incontactables,
        -- Evaluación
        CASE
          WHEN ROUND(
            COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
            NULLIF(COUNT(DISTINCT l.lead_id), 0), 1
          ) >= 10 THEN 'Regular'
          ELSE 'Mejorar'
        END as evaluacion,
        CASE
          WHEN (COUNT(CASE WHEN ll.estado = 'no_answer' THEN 1 END) +
                COUNT(CASE WHEN ll.estado = 'busy' THEN 1 END)) >
               COUNT(DISTINCT l.lead_id) * 0.5 THEN 'ALTA'
          ELSE 'MEDIA'
        END as prioridad_recontacto
      FROM public.marca m
      JOIN public.concesionario_marca cm ON m.marca_id = cm.marca_id
      JOIN public.lead_concesionario_marca lcm ON cm.concesionario_marca_id = lcm.concesionario_marca_id
      JOIN public.leads l ON lcm.lead_id = l.lead_id
      LEFT JOIN public.llamadas ll ON l.lead_id = ll.lead_id
      WHERE 1=1 ${dateFilter}
      GROUP BY m.marca_id, m.nombre
      ORDER BY tasa_exito DESC NULLS LAST
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/ranking
 * Get ranking of best performing marcas
 */
router.get('/ranking', async (req, res, next) => {
  try {
    const { start_date, end_date, limit = 10 } = req.query;

    let dateFilter = '';
    const params = [limit];

    if (start_date && end_date) {
      dateFilter = `AND ll.fecha_llamada BETWEEN $2 AND $3`;
      params.push(start_date, end_date);
    }

    const query = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0) DESC,
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) DESC
        ) as posicion,
        m.marca_id,
        m.nombre as marca,
        COUNT(DISTINCT l.lead_id) as total_leads,
        COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) as leads_exitosos,
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as tasa_exito,
        COUNT(ll.llamada_id) as total_llamadas
      FROM public.marca m
      JOIN public.concesionario_marca cm ON m.marca_id = cm.marca_id
      JOIN public.lead_concesionario_marca lcm ON cm.concesionario_marca_id = lcm.concesionario_marca_id
      JOIN public.leads l ON lcm.lead_id = l.lead_id
      LEFT JOIN public.llamadas ll ON l.lead_id = ll.lead_id
      WHERE 1=1 ${dateFilter}
      GROUP BY m.marca_id, m.nombre
      HAVING COUNT(DISTINCT l.lead_id) > 0
      ORDER BY tasa_exito DESC NULLS LAST, leads_exitosos DESC
      LIMIT $1
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/timeline
 * Get statistics over time (daily/weekly/monthly)
 */
router.get('/timeline', async (req, res, next) => {
  try {
    const { start_date, end_date, interval = 'day', marca_id } = req.query;

    let dateFilter = '';
    let marcaFilter = '';
    const params = [];
    let paramIndex = 1;

    if (start_date && end_date) {
      dateFilter = `AND ll.fecha_llamada BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    if (marca_id) {
      marcaFilter = `AND m.marca_id = $${paramIndex}`;
      params.push(marca_id);
    }

    // Determinar el formato de agrupación según el intervalo
    const dateFormat = {
      day: "DATE(ll.fecha_llamada)",
      week: "DATE_TRUNC('week', ll.fecha_llamada)",
      month: "DATE_TRUNC('month', ll.fecha_llamada)"
    }[interval] || "DATE(ll.fecha_llamada)";

    const query = `
      SELECT
        ${dateFormat} as periodo,
        COUNT(DISTINCT l.lead_id) as total_leads,
        COUNT(ll.llamada_id) as total_llamadas,
        COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END) as leads_exitosos,
        ROUND(
          COUNT(DISTINCT CASE WHEN ll.estado = 'successful' THEN l.lead_id END)::numeric * 100.0 /
          NULLIF(COUNT(DISTINCT l.lead_id), 0),
          1
        ) as tasa_exito
      FROM public.leads l
      LEFT JOIN public.lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
      LEFT JOIN public.llamadas ll ON l.lead_id = ll.lead_id
      WHERE 1=1 ${dateFilter} ${marcaFilter}
      GROUP BY periodo
      ORDER BY periodo DESC
      LIMIT 30
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
