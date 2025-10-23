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
      FROM public.leads l
      LEFT JOIN public.lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
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

    // Debug logging
    console.log('📊 Executing query with params:', { limit, offset, status, search });

    // First, let's test if the table exists from this connection
    const tableTest = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('leads', 'concesionario_marca', 'lead_concesionario_marca', 'concesionario', 'marca')
      ORDER BY table_name
    `);
    console.log('🔍 Tables visible from this pool:', tableTest.rows.map(r => r.table_name));

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
      LEFT JOIN concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN marca m ON cm.marca_id = m.marca_id
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

/**
 * GET /api/leads/:id/calls
 * Get call history for a specific lead
 * Optional query param: brand_dealership_id to filter by specific brand/dealership
 */
router.get('/:id/calls', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brand_dealership_id } = req.query;

    let query = `
      SELECT
        ll.llamada_id,
        ll.lead_id,
        ll.numero_origen,
        ll.numero_destino,
        ll.estado,
        ll.duracion,
        ll.costo,
        ll.latencia,
        ll.proveedor,
        ll.call_sid,
        ll.fecha_llamada,
        ll.metadata,
        ll.created_at,
        lcm.lead_concesionario_marca_id,
        c.nombre as concesionario,
        m.nombre as marca
      FROM public.llamadas ll
      LEFT JOIN public.lead_concesionario_marca lcm ON ll.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
      WHERE ll.lead_id = $1
    `;

    const params = [id];

    if (brand_dealership_id) {
      query += ` AND lcm.lead_concesionario_marca_id = $2`;
      params.push(brand_dealership_id);
    }

    query += ` ORDER BY ll.fecha_llamada DESC`;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id/whatsapp
 * Get WhatsApp messages for a specific lead
 * Optional query param: brand_dealership_id to filter by specific brand/dealership
 */
router.get('/:id/whatsapp', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brand_dealership_id } = req.query;

    let query = `
      SELECT
        lm.message_id,
        lm.conversacion_id,
        lm.lead_id,
        lm.tipo,
        lm.contenido,
        lm.sender,
        lm.timestamp_mensaje,
        lm.metadata,
        lm.created_at,
        lcm.lead_concesionario_marca_id,
        c.nombre as concesionario,
        m.nombre as marca
      FROM public.lead_messages lm
      LEFT JOIN public.lead_concesionario_marca lcm ON lm.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
      WHERE lm.lead_id = $1
      AND lm.tipo = 'whatsapp'
    `;

    const params = [id];

    if (brand_dealership_id) {
      query += ` AND lcm.lead_concesionario_marca_id = $2`;
      params.push(brand_dealership_id);
    }

    query += ` ORDER BY lm.timestamp_mensaje ASC`;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id/notes
 * Get notes for a specific lead
 * Optional query param: brand_dealership_id to filter by specific brand/dealership
 */
router.get('/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brand_dealership_id } = req.query;

    // Note: We need to create a notes table first
    // For now, return empty array
    res.json([]);

    /* When notes table is created, use this query:
    let query = `
      SELECT
        n.nota_id,
        n.lead_id,
        n.lead_concesionario_marca_id,
        n.usuario_id,
        n.contenido,
        n.created_at,
        n.updated_at,
        u.nombre as usuario_nombre,
        c.nombre as concesionario,
        m.nombre as marca
      FROM public.lead_notes n
      LEFT JOIN public.usuarios u ON n.usuario_id = u.usuario_id
      LEFT JOIN public.lead_concesionario_marca lcm ON n.lead_concesionario_marca_id = lcm.lead_concesionario_marca_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
      WHERE n.lead_id = $1
    `;

    const params = [id];

    if (brand_dealership_id) {
      query += ` AND n.lead_concesionario_marca_id = $2`;
      params.push(brand_dealership_id);
    }

    query += ` ORDER BY n.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
    */
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leads/:id/notes
 * Add a new note for a specific lead
 */
router.post('/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { brand_dealership_id, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // For now, return a mock response
    // When notes table is created, implement the actual insert
    const mockNote = {
      nota_id: `note_${Date.now()}`,
      lead_id: id,
      lead_concesionario_marca_id: brand_dealership_id,
      contenido: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usuario_nombre: 'Usuario Demo'
    };

    res.status(201).json(mockNote);

    /* When notes table is created, use this:
    const result = await pool.query(`
      INSERT INTO public.lead_notes (lead_id, lead_concesionario_marca_id, contenido, usuario_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, brand_dealership_id, content, null]);

    res.status(201).json(result.rows[0]);
    */
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id/timeline
 * Get unified timeline of all events for a specific lead
 */
router.get('/:id/timeline', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Combine all events from different sources into a unified timeline
    const timeline = [];

    // Get calls
    const calls = await pool.query(`
      SELECT
        ll.llamada_id as id,
        'llamada' as tipo,
        ll.fecha_llamada as fecha,
        CASE
          WHEN ll.estado = 'successful' THEN '📞 Llamada exitosa'
          WHEN ll.estado = 'failed' THEN '📞 Llamada fallida'
          WHEN ll.estado = 'no_answer' THEN '📞 Llamada sin respuesta'
          ELSE '📞 Llamada'
        END as descripcion,
        c.nombre as marca,
        con.nombre as concesionario,
        NULL as agente,
        ll.metadata
      FROM public.llamadas ll
      LEFT JOIN public.lead_concesionario_marca lcm ON ll.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario con ON cm.concesionario_id = con.concesionario_id
      LEFT JOIN public.marca c ON cm.marca_id = c.marca_id
      WHERE ll.lead_id = $1
    `, [id]);

    timeline.push(...calls.rows);

    // Get WhatsApp messages
    const whatsapp = await pool.query(`
      SELECT
        lm.message_id as id,
        'whatsapp' as tipo,
        lm.timestamp_mensaje as fecha,
        CASE
          WHEN lm.sender = 'lead' THEN '💬 WhatsApp recibido'
          WHEN lm.sender = 'system' THEN '💬 WhatsApp automático enviado'
          ELSE '💬 WhatsApp enviado'
        END as descripcion,
        c.nombre as marca,
        con.nombre as concesionario,
        lm.metadata->>'agente_nombre' as agente,
        lm.metadata
      FROM public.lead_messages lm
      LEFT JOIN public.lead_concesionario_marca lcm ON lm.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario con ON cm.concesionario_id = con.concesionario_id
      LEFT JOIN public.marca c ON cm.marca_id = c.marca_id
      WHERE lm.lead_id = $1 AND lm.tipo = 'whatsapp'
    `, [id]);

    timeline.push(...whatsapp.rows);

    // Get lead assignments
    const assignments = await pool.query(`
      SELECT
        lcm.lead_concesionario_marca_id as id,
        'asignacion' as tipo,
        lcm.fecha_entrada as fecha,
        '👤 Lead asignado a ' || c.nombre || ' - ' || m.nombre as descripcion,
        m.nombre as marca,
        c.nombre as concesionario,
        NULL as agente,
        NULL as metadata
      FROM public.lead_concesionario_marca lcm
      JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      JOIN public.marca m ON cm.marca_id = m.marca_id
      WHERE lcm.lead_id = $1
    `, [id]);

    timeline.push(...assignments.rows);

    // Get lead creation
    const leadCreated = await pool.query(`
      SELECT
        l.lead_id as id,
        'lead_creado' as tipo,
        l.created_at as fecha,
        '🎪 Lead creado desde campaña "' || COALESCE(l.campana, 'Sin campaña') || '"' as descripcion,
        NULL as marca,
        NULL as concesionario,
        NULL as agente,
        jsonb_build_object('source', l.source, 'campana', l.campana) as metadata
      FROM public.leads l
      WHERE l.lead_id = $1
    `, [id]);

    timeline.push(...leadCreated.rows);

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

export default router;