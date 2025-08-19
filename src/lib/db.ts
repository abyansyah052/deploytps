import { Pool } from 'pg';

// Production-ready database configuration
const isProduction = process.env.NODE_ENV === 'production';

const db = new Pool({
  user: process.env.DB_USER || 'tps_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tps_dashboard',
  password: process.env.DB_PASSWORD || 'Abyansyah123',
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL configuration for production/Supabase
  ssl: isProduction || process.env.DB_HOST?.includes('supabase.com') 
    ? { 
        rejectUnauthorized: false
      }
    : false,
  // Connection timeout and pool settings for production
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 1,
  // Additional production settings
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Database connection error handling
db.on('connect', () => {
  console.log('✅ Connected to database');
});

db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default db;
