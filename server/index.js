import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

// Import configuration and middleware
import { testConnection } from './config/database.js';
import {
  apiLimiter,
  corsOptions,
  helmetConfig,
  requestLogger,
  errorHandler
} from './middleware/security.js';

// Import routes
import leadsRouter from './routes/leads.js';
import healthRouter from './routes/health.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ==================
// SECURITY MIDDLEWARE
// ==================

// Helmet for security headers
app.use(helmetConfig);

// CORS configuration
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger);

// ==================
// GENERAL MIDDLEWARE
// ==================

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// ==================
// ROUTES
// ==================

// Health check (no rate limiting)
app.use('/api/health', healthRouter);

// API routes
app.use('/api/leads', leadsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'n8n Lead Sync API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      leads: '/api/leads',
      documentation: '/api/docs (coming soon)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      '/api/health',
      '/api/leads'
    ]
  });
});

// ==================
// ERROR HANDLING
// ==================

app.use(errorHandler);

// ==================
// SERVER STARTUP
// ==================

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════╗');
      console.log('║   🚀 n8n Lead Sync API Server Started     ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
      console.log(`📡 Server:        http://localhost:${PORT}`);
      console.log(`🏥 Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`📊 Leads API:     http://localhost:${PORT}/api/leads`);
      console.log(`🌍 Environment:   ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS Origin:   ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log('');
      console.log('⚡ Server is ready to accept connections');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your .env file configuration');
    console.error('2. Verify database credentials');
    console.error('3. Ensure PostgreSQL is running and accessible');
    console.error('');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();