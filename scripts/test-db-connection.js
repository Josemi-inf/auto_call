import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const pool = new Pool({
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    database: process.env.VITE_DB_NAME,
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    host: process.env.VITE_DB_HOST || 'n8n-pgvector-pgweb.ko9agy.easypanel.host',
    ssl: process.env.VITE_DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

async function testConnection() {
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
}

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        await testConnection();
        console.log('✅ Database connection successful!');

        console.log('\n🔍 Testing leads table structure...');
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'leads'
            ORDER BY ordinal_position
        `);

        console.log('📊 Leads table columns:');
        result.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        console.log('\n🔍 Testing leads count...');
        const countResult = await pool.query('SELECT COUNT(*) as total FROM leads WHERE activo = true AND opt_out = false');
        console.log(`✅ Found ${countResult.rows[0].total} active leads`);

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    } finally {
        await pool.end();
    }
}

testDatabaseConnection();