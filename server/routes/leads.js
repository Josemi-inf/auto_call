import express from 'express';
import { pool } from '../config/database.js';
import {
  createLeadValidation,
  updateLeadValidation,
  getLeadByIdValidation,
  queryValidation
} from '../middleware/validators.js';

const router = express.Router();

/**
 * GET /api/leads
 * Get all leads with filters
 */
router.get('/', queryValidation, async (req, res, next) => {
  try {
    const {
      limit = 100,
      offset = 0,
      status,
      search
    } = req.query;

    let query = `
      SELECT
        l.lead_id,
        l.nombre,
        l.apellidos,
        l.email,
        l.telefono,
        l.telefono_e164,
        l.estado_actual,
        l.source,
        l.campana,
        l.ciudad,
        l.cp as codigo_postal,
        l.provincia,
        l.telefono_valido,
        l.opt_out,
        l.created_at,
        l.last_contact_at,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'lead_concesionario_marca_id', lcm.lead_concesionario_marca_id,
              'concesionario', c.nombre,
              'marca', m.nombre,
              'modelo', lcm.modelo,
              'estado', lcm.estado,
              'presupuesto_min', lcm.presupuesto_min,
              'presupuesto_max', lcm.presupuesto_max,
              'fecha_entrada', lcm.fecha_entrada,
              'notas', lcm.notas
            ) ORDER BY lcm.fecha_entrada DESC
          ) FILTER (WHERE c.nombre IS NOT NULL),
          '[]'
        ) as intentos_compra
      FROM leads l
      LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
      LEFT JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN marcas m ON cm.marca_id = m.marca_id
      WHERE l.activo = true AND l.opt_out = false
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by status
    if (status) {
      query += ` AND l.estado_actual = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Search filter
    if (search) {
      query += ` AND (
        l.nombre ILIKE $${paramIndex} OR
        l.apellidos ILIKE $${paramIndex} OR
        l.email ILIKE $${paramIndex} OR
        l.telefono ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY
        l.lead_id,
        l.nombre,
        l.apellidos,
        l.email,
        l.telefono,
        l.telefono_e164,
        l.estado_actual,
        l.source,
        l.campana,
        l.ciudad,
        l.cp,
        l.provincia,
        l.telefono_valido,
        l.opt_out,
        l.created_at,
        l.last_contact_at
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Transform data for frontend compatibility
    const leads = result.rows.map(lead => ({
      lead_id: lead.lead_id,
      nombre: lead.nombre,
      apellidos: lead.apellidos,
      email: lead.email,
      telefono: lead.telefono,
      telefono_e164: lead.telefono_e164,
      estado_actual: lead.estado_actual,
      source: lead.source,
      campana: lead.campana,
      ciudad: lead.ciudad,
      cp: lead.codigo_postal,
      provincia: lead.provincia,
      telefono_valido: lead.telefono_valido,
      opt_out: lead.opt_out,
      created_at: lead.created_at,
      last_contact_at: lead.last_contact_at,
      intentos_compra: lead.intentos_compra,
      // Add computed fields for backward compatibility
      concesionario: lead.intentos_compra[0]?.concesionario || '',
      marca: lead.intentos_compra[0]?.marca || '',
      modelo: lead.intentos_compra[0]?.modelo || ''
    }));

    res.json({
      data: leads,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id
 * Get a single lead by ID
 */
router.get('/:id', getLeadByIdValidation, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        l.*,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'lead_concesionario_marca_id', lcm.lead_concesionario_marca_id,
              'concesionario', c.nombre,
              'marca', m.nombre,
              'modelo', lcm.modelo,
              'estado', lcm.estado,
              'presupuesto_min', lcm.presupuesto_min,
              'presupuesto_max', lcm.presupuesto_max,
              'fecha_entrada', lcm.fecha_entrada,
              'notas', lcm.notas,
              'motivo_perdida', lcm.motivo_perdida
            ) ORDER BY lcm.fecha_entrada DESC
          ) FILTER (WHERE c.nombre IS NOT NULL),
          '[]'
        ) as intentos_compra
      FROM leads l
      LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
      LEFT JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN marcas m ON cm.marca_id = m.marca_id
      WHERE l.lead_id = $1
      GROUP BY l.lead_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leads
 * Create a new lead
 */
router.post('/', createLeadValidation, async (req, res, next) => {
  try {
    const {
      nombre,
      apellidos,
      email,
      telefono,
      telefono_e164,
      estado_actual = 'nuevo',
      source,
      campana,
      ciudad,
      codigo_postal,
      provincia
    } = req.body;

    const result = await pool.query(`
      INSERT INTO leads (
        nombre,
        apellidos,
        email,
        telefono,
        telefono_e164,
        estado_actual,
        source,
        campana,
        ciudad,
        codigo_postal,
        provincia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      nombre,
      apellidos,
      email,
      telefono,
      telefono_e164,
      estado_actual,
      source,
      campana,
      ciudad,
      codigo_postal,
      provincia
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/leads/:id
 * Update a lead
 */
router.patch('/:id', updateLeadValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const values = [id, ...fields.map(field => updates[field])];

    const result = await pool.query(`
      UPDATE leads
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE lead_id = $1
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/leads/:id
 * Soft delete a lead (set activo = false)
 */
router.delete('/:id', getLeadByIdValidation, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE leads
      SET activo = false, updated_at = CURRENT_TIMESTAMP
      WHERE lead_id = $1
      RETURNING lead_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully', lead_id: id });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id/history
 * Get lead history (all attempts)
 */
router.get('/:id/history', getLeadByIdValidation, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        lcm.lead_concesionario_marca_id,
        lcm.fecha_entrada,
        lcm.estado,
        lcm.modelo,
        lcm.presupuesto_min,
        lcm.presupuesto_max,
        c.nombre as concesionario,
        m.nombre as marca,
        lcm.notas,
        lcm.motivo_perdida,
        lcm.fecha_cierre
      FROM lead_concesionario_marca lcm
      JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
      JOIN marcas m ON cm.marca_id = m.marca_id
      WHERE lcm.lead_id = $1
      ORDER BY lcm.fecha_entrada DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;