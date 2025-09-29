import { Pool } from 'pg';
import dotenv from 'dotenv';

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

async function checkDatabase() {
    try {
        console.log('🔌 Conectando a PostgreSQL...');
        console.log(`Host: ${process.env.VITE_DB_HOST}`);
        console.log(`Database: ${process.env.VITE_DB_NAME}`);
        console.log(`User: ${process.env.VITE_DB_USER}`);
        console.log('');

        // Test connection
        const client = await pool.connect();
        const now = await client.query('SELECT NOW()');
        console.log('✅ Conexión exitosa:', now.rows[0].now);
        console.log('');

        // Check existing tables
        const tablesResult = await client.query(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('📋 Tablas existentes en la base de datos:');
        if (tablesResult.rows.length === 0) {
            console.log('   No hay tablas en el esquema public');
        } else {
            tablesResult.rows.forEach(table => {
                console.log(`   - ${table.table_name} (${table.table_type})`);
            });
        }
        console.log('');

        // Check specific tables we need
        const requiredTables = [
            'leads', 'concesionarios', 'marcas', 'concesionario_marca',
            'lead_concesionario_marca', 'lead_messages', 'conversaciones',
            'workflow_leads', 'llamadas'
        ];

        console.log('🎯 Verificando tablas requeridas:');
        for (const tableName of requiredTables) {
            const exists = tablesResult.rows.some(row => row.table_name === tableName);
            console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);

            if (exists) {
                // Get column information
                const columnsResult = await client.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);

                console.log(`      Columnas:`);
                columnsResult.rows.forEach(col => {
                    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                    const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                    console.log(`        - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
                });
                console.log('');
            }
        }

        client.release();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('   Código:', error.code);
        }
    } finally {
        await pool.end();
    }
}

checkDatabase();