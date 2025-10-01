import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].includes('your-'));

if (missingVars.length > 0) {
  console.error('');
  console.error('❌ Missing or incomplete database configuration in .env file:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('📝 Please update server/.env with your actual PostgreSQL credentials');
  console.error('   Example:');
  console.error('   DB_HOST=your-postgres-host.com');
  console.error('   DB_NAME=your_database_name');
  console.error('   DB_USER=your_username');
  console.error('   DB_PASSWORD=your_password');
  console.error('');
}

// Configure PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 30000, // Return an error after 30 seconds if connection could not be established
  query_timeout: 30000, // Query timeout
  statement_timeout: 30000, // Statement timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test database connection
export const testConnection = async () => {
  // Check if credentials are configured
  if (missingVars.length > 0) {
    throw new Error('Database credentials not configured. Please update server/.env file.');
  }

  try {
    console.log('');
    console.log(`🔌 Connecting to PostgreSQL...`);
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   SSL: ${process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'}`);
    console.log('');

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, version() as version');

    console.log('✅ Database connected successfully');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('🐘 PostgreSQL version:', result.rows[0].version.split(',')[0]);

    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('');

    // Provide helpful troubleshooting tips
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that DB_HOST is correct');
      console.error('   - Verify you have internet connection');
      console.error('   - Ensure the host is accessible from your network');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that PostgreSQL is running');
      console.error('   - Verify DB_PORT is correct (default: 5432)');
      console.error('   - Check firewall settings');
    } else if (error.message.includes('password')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Verify DB_USER and DB_PASSWORD are correct');
      console.error('   - Check that the user has access to the database');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Troubleshooting:');
      console.error('   - The database server is not responding');
      console.error('   - Check your network connection');
      console.error('   - Verify the host and port are correct');
      console.error('   - Check if there\'s a firewall blocking the connection');
    }
    console.error('');

    throw error;
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing database pool');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing database pool');
  await pool.end();
  process.exit(0);
});