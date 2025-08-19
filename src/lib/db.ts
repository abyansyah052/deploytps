import { Pool } from 'pg';

const db = new Pool({
  user: process.env.DB_USER || 'tps_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tps_dashboard',
  password: process.env.DB_PASSWORD || 'Abyansyah123',
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL configuration for Supabase and other cloud databases
  ssl: process.env.DB_HOST?.includes('supabase.com') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
  // Connection timeout and pool settings
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 1
});

export default db;
