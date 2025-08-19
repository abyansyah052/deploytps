import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET() {
  let client;
  try {
    console.log('🧪 TEST ENDPOINT - Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET',
    });

    console.log('🧪 TEST ENDPOINT - Attempting database connection...');
    client = await db.connect();
    console.log('✅ TEST ENDPOINT - Database connected successfully');
    
    // Simple test query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ TEST ENDPOINT - Test query successful:', result.rows[0]);
    
    // Check materials table
    const tableResult = await client.query(`
      SELECT COUNT(*) as total_materials 
      FROM materials 
      LIMIT 1
    `);
    console.log('✅ TEST ENDPOINT - Materials count:', tableResult.rows[0]);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connection_time: result.rows[0].current_time,
        database_version: result.rows[0].db_version,
        materials_count: tableResult.rows[0].total_materials,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT
        }
      }
    });
    
  } catch (error) {
    console.error('❌ TEST ENDPOINT - Database error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: {
        message: String(error),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT_SET',
          DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT_SET',
          DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT_SET',
          DB_USER: process.env.DB_USER ? 'SET' : 'NOT_SET',
          DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET'
        }
      }
    }, { status: 500 });
    
  } finally {
    if (client) {
      client.release();
      console.log('🔌 TEST ENDPOINT - Database connection released');
    }
  }
}
