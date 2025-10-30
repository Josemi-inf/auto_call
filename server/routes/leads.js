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
        l.estado_actual,
        l.ciudad,
        l.cp as codigo_postal,
        l.provincia,
        l.created_at,
        COALESCE(l.last_contact_at, l.updated_at, l.created_at) as last_contact_at,
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
              'source', lcm.source
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
        l.estado_actual,
        l.ciudad,
        l.cp,
        l.provincia,
        l.created_at,
        l.last_contact_at,
        l.updated_at
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
      estado_actual: lead.estado_actual,
      ciudad: lead.ciudad,
      cp: lead.codigo_postal,
      provincia: lead.provincia,
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
              'motivo_perdida', lcm.motivo_perdida,
              'source', lcm.source
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
      estado_actual = 'nuevo',
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
        estado_actual,
        ciudad,
        cp,
        provincia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      nombre,
      apellidos,
      email,
      telefono,
      estado_actual,
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
      SELECT DISTINCT ON (cl.id)
        cl.id as llamada_id,
        cl.lead_id,
        cl.numero_origen,
        cl.numero_destino,
        cl.estado,
        cl.duracion,
        cl.costo,
        cl.latencia,
        cl.proveedor,
        cl.call_sid,
        cl.fecha_llamada,
        cl.metadata,
        cl.created_at,
        lcm.lead_concesionario_marca_id,
        c.nombre as concesionario,
        m.nombre as marca
      FROM public.call_logs cl
      LEFT JOIN public.lead_concesionario_marca lcm ON cl.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario c ON cm.concesionario_id = c.concesionario_id
      LEFT JOIN public.marca m ON cm.marca_id = m.marca_id
      WHERE cl.lead_id = $1
    `;

    const params = [id];

    if (brand_dealership_id) {
      query += ` AND lcm.lead_concesionario_marca_id = $2`;
      params.push(brand_dealership_id);
    }

    query += ` ORDER BY cl.id, cl.fecha_llamada DESC`;

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
      SELECT DISTINCT ON (lm.id)
        lm.id as message_id,
        NULL as conversacion_id,
        lm.lead_id,
        lm.tipo_mensaje as tipo,
        lm.contenido,
        CASE
          WHEN lm.tipo_mensaje = 'enviado' THEN 'agent'
          WHEN lm.tipo_mensaje = 'recibido' THEN 'lead'
          ELSE 'system'
        END as sender,
        lm.created_at as timestamp_mensaje,
        jsonb_build_object(
          'enviado', lm.enviado,
          'leido', lm.leido,
          'respondido', lm.respondido,
          'whatsapp_message_id', lm.whatsapp_message_id,
          'media_url', lm.media_url
        ) as metadata,
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
    `;

    const params = [id];

    if (brand_dealership_id) {
      query += ` AND lcm.lead_concesionario_marca_id = $2`;
      params.push(brand_dealership_id);
    }

    query += ` ORDER BY lm.id, lm.created_at ASC`;

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

    let query = `
      SELECT
        n.nota_id,
        n.lead_id,
        n.lead_concesionario_marca_id,
        n.usuario_id,
        n.contenido,
        n.created_at,
        n.updated_at,
        NULL as usuario_nombre,
        c.nombre as concesionario,
        m.nombre as marca
      FROM public.lead_notes n
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

    const result = await pool.query(`
      INSERT INTO public.lead_notes (lead_id, lead_concesionario_marca_id, contenido, usuario_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, brand_dealership_id || null, content, null]);

    res.status(201).json(result.rows[0]);
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
      SELECT DISTINCT ON (cl.id)
        cl.id,
        'llamada' as tipo,
        cl.fecha_llamada as fecha,
        CASE
          WHEN cl.estado = 'successful' THEN '📞 Llamada exitosa'
          WHEN cl.estado = 'failed' THEN '📞 Llamada fallida'
          WHEN cl.estado = 'no_answer' THEN '📞 Llamada sin respuesta'
          ELSE '📞 Llamada'
        END as descripcion,
        c.nombre as marca,
        con.nombre as concesionario,
        NULL as agente,
        cl.metadata
      FROM public.call_logs cl
      LEFT JOIN public.lead_concesionario_marca lcm ON cl.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario con ON cm.concesionario_id = con.concesionario_id
      LEFT JOIN public.marca c ON cm.marca_id = c.marca_id
      WHERE cl.lead_id = $1
      ORDER BY cl.id, cl.fecha_llamada DESC
    `, [id]);

    timeline.push(...calls.rows);

    // Get WhatsApp messages
    const whatsapp = await pool.query(`
      SELECT DISTINCT ON (lm.id)
        lm.id,
        'whatsapp' as tipo,
        lm.created_at as fecha,
        CASE
          WHEN lm.tipo_mensaje = 'recibido' THEN '💬 WhatsApp recibido'
          WHEN lm.tipo_mensaje = 'enviado' THEN '💬 WhatsApp enviado'
          ELSE '💬 WhatsApp'
        END as descripcion,
        c.nombre as marca,
        con.nombre as concesionario,
        NULL as agente,
        jsonb_build_object(
          'contenido', lm.contenido,
          'enviado', lm.enviado,
          'leido', lm.leido,
          'respondido', lm.respondido
        ) as metadata
      FROM public.lead_messages lm
      LEFT JOIN public.lead_concesionario_marca lcm ON lm.lead_id = lcm.lead_id
      LEFT JOIN public.concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      LEFT JOIN public.concesionario con ON cm.concesionario_id = con.concesionario_id
      LEFT JOIN public.marca c ON cm.marca_id = c.marca_id
      WHERE lm.lead_id = $1
      ORDER BY lm.id, lm.created_at DESC
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
        'Lead creado' as descripcion,
        NULL as marca,
        NULL as concesionario,
        NULL as agente,
        '{}'::jsonb as metadata
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

/**
 * GET /api/leads/activity/recent
 * Get recent activity across all leads (for dashboard)
 */
router.get('/activity/recent', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent leads created
    const recentLeads = await pool.query(`
      SELECT
        l.lead_id as id,
        'lead_created' as type,
        CONCAT('Nuevo lead: ', l.nombre, ' ', l.apellidos) as message,
        l.created_at as timestamp,
        'success' as status
      FROM public.leads l
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // Get recent calls
    const recentCalls = await pool.query(`
      SELECT
        cl.id,
        CASE
          WHEN cl.estado = 'successful' THEN 'call_completed'
          WHEN cl.estado = 'failed' THEN 'call_failed'
          ELSE 'call_attempted'
        END as type,
        CONCAT('Llamada ', cl.estado, ' - ', l.nombre, ' ', l.apellidos) as message,
        cl.fecha_llamada as timestamp,
        CASE
          WHEN cl.estado = 'successful' THEN 'success'
          WHEN cl.estado = 'failed' THEN 'error'
          ELSE 'warning'
        END as status
      FROM public.call_logs cl
      LEFT JOIN public.leads l ON cl.lead_id = l.lead_id
      ORDER BY cl.fecha_llamada DESC
      LIMIT 5
    `);

    // Get recent WhatsApp messages
    const recentMessages = await pool.query(`
      SELECT
        lm.id as id,
        CASE
          WHEN lm.tipo_mensaje = 'recibido' THEN 'message_received'
          WHEN lm.tipo_mensaje = 'enviado' THEN 'message_sent'
          ELSE 'message'
        END as type,
        CONCAT('WhatsApp ', lm.tipo_mensaje, ' - ', l.nombre, ' ', l.apellidos) as message,
        lm.created_at as timestamp,
        'success' as status
      FROM public.lead_messages lm
      LEFT JOIN public.leads l ON lm.lead_id = l.lead_id
      ORDER BY lm.created_at DESC
      LIMIT 5
    `);

    // Combine all activities (notes table doesn't exist yet)
    const activities = [
      ...recentLeads.rows,
      ...recentCalls.rows,
      ...recentMessages.rows
    ];

    // Sort by timestamp descending and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    // Format timestamps to relative time
    const formattedActivities = limitedActivities.map(activity => {
      const now = new Date();
      const activityDate = new Date(activity.timestamp);
      const diffMs = now - activityDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 1) {
        timeAgo = 'Hace un momento';
      } else if (diffMins < 60) {
        timeAgo = `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      } else {
        timeAgo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      }

      return {
        ...activity,
        time: timeAgo,
        created_at: activity.timestamp
      };
    });

    res.json(formattedActivities);
  } catch (error) {
    next(error);
  }
});

export default router;