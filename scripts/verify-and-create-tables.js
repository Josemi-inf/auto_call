import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.log('✅ Connected to database');

    // Check which tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📊 Existing tables:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));

    const existingTables = result.rows.map(r => r.table_name);
    const requiredTables = [
      'conversaciones',
      'lead_messages',
      'workflows',
      'workflow_leads',
      'llamadas',
      'workflow_errors'
    ];

    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log('\n✅ All required tables exist!');
      return;
    }

    console.log('\n⚠️  Missing tables:');
    missingTables.forEach(t => console.log(`   - ${t}`));

    console.log('\n🔨 Creating missing tables...');

    // Read and execute the SQL script
    const sqlScript = readFileSync(join(__dirname, 'create-all-missing-tables.sql'), 'utf8');
    await client.query(sqlScript);

    console.log('✅ Tables created successfully!');

    // Verify again
    const verifyResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📊 Final table list:');
    verifyResult.rows.forEach(row => console.log(`   - ${row.table_name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

main();
