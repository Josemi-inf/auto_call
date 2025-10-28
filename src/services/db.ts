import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    database: process.env.VITE_DB_NAME,
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    host: process.env.VITE_DB_HOST || 'n8n-pgvector-pgweb.ko9agy.easypanel.host',
    ssl: process.env.VITE_DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

// Función para probar la conexión
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Conexión exitosa a la base de datos:', result.rows[0]);
        client.release();
        return true;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
};

// Interfaces para tipar los resultados de las consultas
interface LeadDB {
    lead_id: string;
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    estado_actual: string;
    created_at: string;
    last_contact_at: string;
}

export interface LeadRecord {
    lead_id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
    estado_actual: string;
    created_at: Date;
    last_contact_at: Date;
    ciudad: string;
    cp: string;
    provincia: string;
    telefono_valido: boolean;
    opt_out: boolean;
}

export const getLeads = async () => {
    try {
        // Obtenemos todos los leads activos con sus campos reales
        const result = await pool.query(`
            SELECT
                l.lead_id,
                l.nombre,
                l.apellidos,
                l.email,
                l.telefono,
                l.estado_actual,
                l.ciudad,
                l.cp,
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
                l.telefono_valido,
                l.opt_out,
                l.created_at,
                l.last_contact_at
            ORDER BY l.created_at DESC
        `);

        // Transformamos los datos para que coincidan con la estructura esperada por el frontend
        return result.rows.map(lead => {
            const intentosCompra = Array.isArray(lead.intentos_compra) ? lead.intentos_compra : JSON.parse(lead.intentos_compra || '[]');
            const ultimoIntento = intentosCompra[0] || {};

            return {
                lead_id: lead.lead_id,
                name: `${lead.nombre} ${lead.apellidos}`.trim(),
                email: lead.email,
                phone: lead.telefono,
                status: lead.estado_actual,
                lastContact: lead.last_contact_at,
                concesionario: ultimoIntento.concesionario || '',
                marca: ultimoIntento.marca || '',
                modelo: ultimoIntento.modelo || '',
                intentos_compra: intentosCompra,
                // Campos adicionales de la estructura real
                ciudad: lead.ciudad,
                cp: lead.cp,
                provincia: lead.provincia,
                telefono_valido: lead.telefono_valido,
                opt_out: lead.opt_out
            };
        });
    } catch (error) {
        console.error('Error al obtener leads:', error);
        throw error;
    }
};

export const getLeadById = async (leadId: string) => {
    try {
        const result = await pool.query(`
            SELECT 
                l.*,
                lcm.estado as estado_concesionario,
                lcm.modelo,
                c.nombre as concesionario,
                m.nombre as marca,
                lcm.fecha_entrada,
                lcm.presupuesto_min,
                lcm.presupuesto_max
            FROM leads l
            LEFT JOIN lead_concesionario_marca lcm ON l.lead_id = lcm.lead_id
            LEFT JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
            LEFT JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
            LEFT JOIN marcas m ON cm.marca_id = m.marca_id
            WHERE l.lead_id = $1
            ORDER BY lcm.fecha_entrada DESC
            LIMIT 1
        `, [leadId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error al obtener lead por ID:', error);
        throw error;
    }
};

export const getLeadHistory = async (leadId: string) => {
    try {
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
                lcm.motivo_perdida
            FROM lead_concesionario_marca lcm
            JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
            JOIN concesionarios c ON cm.concesionario_id = c.concesionario_id
            JOIN marcas m ON cm.marca_id = m.marca_id
            WHERE lcm.lead_id = $1
            ORDER BY lcm.fecha_entrada DESC
        `, [leadId]);
        return result.rows;
    } catch (error) {
        console.error('Error al obtener historial del lead:', error);
        throw error;
    }
};
