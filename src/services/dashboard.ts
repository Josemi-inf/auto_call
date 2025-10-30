import { pool } from './db';

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  activeWorkflows: number;
  pendingErrors: number;
  todayCalls: number;
  weeklyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'lead_created' | 'workflow_completed' | 'error' | 'lead_converted' | 'call_completed';
  message: string;
  time: string;
  status: 'success' | 'error' | 'warning';
  created_at: Date;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Consulta para obtener estadísticas de leads
    const leadsQuery = `
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN activo = true AND opt_out = false THEN 1 END) as active_leads,
        COUNT(CASE WHEN estado_actual = 'convertido' THEN 1 END) as converted_leads
      FROM leads
    `;

    // Consulta para workflows activos
    const workflowsQuery = `
      SELECT COUNT(*) as active_workflows
      FROM workflows
      WHERE activo = true
    `;

    // Consulta para errores pendientes
    const errorsQuery = `
      SELECT COUNT(*) as pending_errors
      FROM workflow_errors
      WHERE estado = 'pending'
    `;

    // Consulta para llamadas de hoy
    const callsQuery = `
      SELECT COUNT(*) as today_calls
      FROM call_logs
      WHERE DATE(fecha_llamada) = CURRENT_DATE
    `;

    // Ejecutar todas las consultas
    const [leadsResult, workflowsResult, errorsResult, callsResult] = await Promise.all([
      pool.query(leadsQuery),
      pool.query(workflowsQuery),
      pool.query(errorsQuery),
      pool.query(callsQuery)
    ]);

    // Calcular crecimiento semanal (comparar con la semana anterior)
    const growthQuery = `
      WITH current_week AS (
        SELECT COUNT(*) as current_count
        FROM leads
        WHERE created_at >= date_trunc('week', CURRENT_DATE)
      ),
      previous_week AS (
        SELECT COUNT(*) as previous_count
        FROM leads
        WHERE created_at >= date_trunc('week', CURRENT_DATE) - interval '1 week'
        AND created_at < date_trunc('week', CURRENT_DATE)
      )
      SELECT
        CASE
          WHEN previous_week.previous_count = 0 THEN 0
          ELSE ROUND(((current_week.current_count - previous_week.previous_count) * 100.0 / previous_week.previous_count), 1)
        END as growth_percentage
      FROM current_week, previous_week
    `;

    const growthResult = await pool.query(growthQuery);

    return {
      totalLeads: parseInt(leadsResult.rows[0].total_leads) || 0,
      activeLeads: parseInt(leadsResult.rows[0].active_leads) || 0,
      convertedLeads: parseInt(leadsResult.rows[0].converted_leads) || 0,
      activeWorkflows: parseInt(workflowsResult.rows[0].active_workflows) || 0,
      pendingErrors: parseInt(errorsResult.rows[0].pending_errors) || 0,
      todayCalls: parseInt(callsResult.rows[0].today_calls) || 0,
      weeklyGrowth: parseFloat(growthResult.rows[0]?.growth_percentage) || 0
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Devolver datos por defecto en caso de error
    return {
      totalLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
      activeWorkflows: 0,
      pendingErrors: 0,
      todayCalls: 0,
      weeklyGrowth: 0
    };
  }
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  try {
    const query = `
      WITH recent_leads AS (
        SELECT
          lead_id as id,
          'lead_created' as type,
          'Nuevo lead: ' || nombre || ' ' || apellidos || COALESCE(' - ' || source, '') as message,
          created_at,
          'success' as status
        FROM leads
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      ),
      recent_errors AS (
        SELECT
          error_id as id,
          'error' as type,
          titulo as message,
          created_at,
          CASE
            WHEN severidad = 'critical' THEN 'error'
            WHEN severidad = 'warning' THEN 'warning'
            ELSE 'error'
          END as status
        FROM workflow_errors
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      ),
      recent_calls AS (
        SELECT
          id,
          'call_completed' as type,
          'Llamada ' || estado || ' a ' || numero_destino as message,
          created_at,
          CASE
            WHEN estado = 'successful' THEN 'success'
            ELSE 'warning'
          END as status
        FROM call_logs
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      )
      SELECT * FROM (
        SELECT * FROM recent_leads
        UNION ALL
        SELECT * FROM recent_errors
        UNION ALL
        SELECT * FROM recent_calls
      ) combined
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      message: row.message,
      time: formatTimeAgo(row.created_at),
      status: row.status,
      created_at: row.created_at
    }));

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Función auxiliar para formatear tiempo relativo
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace unos segundos';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  }
}

export const getWeeklyLeadsData = async () => {
  try {
    const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as leads_count
      FROM leads
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching weekly leads data:', error);
    return [];
  }
};

export const getWorkflowPerformance = async () => {
  try {
    const query = `
      SELECT
        w.nombre,
        COUNT(wl.workflow_lead_id) as total_executions,
        COUNT(CASE WHEN wl.estado = 'completado' THEN 1 END) as successful,
        COUNT(CASE WHEN wl.estado = 'error' THEN 1 END) as failed
      FROM workflows w
      LEFT JOIN workflow_leads wl ON w.workflow_id = wl.workflow_id
      WHERE w.activo = true
      GROUP BY w.workflow_id, w.nombre
      ORDER BY total_executions DESC
      LIMIT 5
    `;

    const result = await pool.query(query);
    return result.rows.map(row => ({
      name: row.nombre,
      totalExecutions: parseInt(row.total_executions) || 0,
      successful: parseInt(row.successful) || 0,
      failed: parseInt(row.failed) || 0,
      successRate: row.total_executions > 0 ?
        Math.round((row.successful / row.total_executions) * 100) : 0
    }));
  } catch (error) {
    console.error('Error fetching workflow performance:', error);
    return [];
  }
};