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
    console.log('✅ Connected to database\n');

    // Check lead_messages table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'lead_messages'
      ORDER BY ordinal_position
    `);

    console.log('📊 lead_messages table structure:');
    console.table(result.rows);

    // Check llamadas table structure
    const llamadasResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'llamadas'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 llamadas table structure:');
    console.table(llamadasResult.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
