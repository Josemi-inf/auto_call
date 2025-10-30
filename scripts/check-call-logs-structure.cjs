const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'n8n_leads',
  user: 'postgres',
  password: 'postgres',
});

async function checkStructure() {
  const client = await pool.connect();
  try {
    console.log('=== Verificando estructura de call_logs ===\n');

    // Verificar columnas de call_logs
    const callLogsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'call_logs'
      ORDER BY ordinal_position;
    `);

    console.log('Columnas en call_logs:');
    console.table(callLogsColumns.rows);

    // Verificar columnas de llamadas
    const llamadasColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'llamadas'
      ORDER BY ordinal_position;
    `);

    console.log('\nColumnas en llamadas:');
    console.table(llamadasColumns.rows);

    // Comparar columnas
    console.log('\n=== Análisis de Diferencias ===');
    const callLogsColNames = callLogsColumns.rows.map(c => c.column_name);
    const llamadasColNames = llamadasColumns.rows.map(c => c.column_name);

    console.log('\nColumnas en llamadas pero NO en call_logs:');
    const missingInCallLogs = llamadasColNames.filter(col => !callLogsColNames.includes(col));
    console.log(missingInCallLogs.length > 0 ? missingInCallLogs : 'Ninguna');

    console.log('\nColumnas en call_logs pero NO en llamadas:');
    const extraInCallLogs = callLogsColNames.filter(col => !llamadasColNames.includes(col));
    console.log(extraInCallLogs.length > 0 ? extraInCallLogs : 'Ninguna');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkStructure();
