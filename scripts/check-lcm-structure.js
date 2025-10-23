import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'n8n-pgvector-pgweb.ko9agy.easypanel.host',
  port: 5432,
  database: 'autos_call',
  user: 'postgres',
  password: 'ae5549e37573f5ce67f6',
  ssl: false
});

async function main() {
  try {
    await client.connect();

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'lead_concesionario_marca'
      ORDER BY ordinal_position
    `);

    console.log('📊 lead_concesionario_marca table structure:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
