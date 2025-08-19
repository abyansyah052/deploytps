import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  let client;
  try {
    // Debug environment variables
    console.log('🔧 Environment variables check:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV
    });

    console.log('🔄 Connecting to database for stats...');
    client = await db.connect();
    console.log('✅ Database connected for stats');
    
    // Test basic connection first
    console.log('🧪 Testing database connection...');
    const testResult = await client.query('SELECT 1 as test');
    console.log('✅ Database test query successful:', testResult.rows);
    
    // Check if materials table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'materials'
    `);
    console.log('📊 Materials table check:', tableCheck.rows);
    
    // Single optimized query to get all stats at once (updated for new schema)
    const statsQuery = `
      SELECT 
        COUNT(*) as total_materials,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_materials,
        COUNT(CASE WHEN status != 'ACTIVE' OR status IS NULL THEN 1 END) as inactive_materials
      FROM materials;
    `;
    
    // Get category distribution (top 5 only for performance)
    const categoryQuery = `
      SELECT storeroom as kategori, COUNT(*) as count 
      FROM materials 
      WHERE storeroom IS NOT NULL AND storeroom != ''
      GROUP BY storeroom 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    
    // Get top materials by category
    const topMaterialsQuery = `
      SELECT 
        COALESCE(material_description, 'N/A') as name,
        storeroom as kategori,
        COALESCE(original_qty, 0) as quantity,
        COALESCE(status, 'No Status') as status
      FROM materials 
      ORDER BY original_qty DESC 
      LIMIT 5;
    `;

    // Get division statistics (ME, CC, RTG, Lain)
    const divisionQuery = `
      SELECT jenisnya as divisi, COUNT(*) as count 
      FROM materials 
      WHERE jenisnya IS NOT NULL AND jenisnya != ''
      GROUP BY jenisnya 
      ORDER BY count DESC;
    `;

    console.log('📋 Executing stats queries...');
    const [statsResult, categoryResult, topMaterialsResult, divisionResult] = await Promise.all([
      client.query(statsQuery),
      client.query(categoryQuery),
      client.query(topMaterialsQuery),
      client.query(divisionQuery)
    ]);
    
    console.log('📊 Query results:', {
      stats: statsResult.rows,
      categories: categoryResult.rows,
      topMaterials: topMaterialsResult.rows,
      divisions: divisionResult.rows
    });
    
    const stats = statsResult.rows[0];
    
    client.release();
    
    return NextResponse.json({
      totalMaterials: parseInt(stats.total_materials),
      activeEquipment: parseInt(stats.active_materials),
      lowStock: 0, // Removed stock management feature  
      categories: categoryResult.rows,
      topMaterials: topMaterialsResult.rows,
      divisionStats: divisionResult.rows,
      statusDistribution: [
        { name: 'Active', count: parseInt(stats.active_materials) },
        { name: 'Inactive', count: parseInt(stats.inactive_materials) }
      ],
      recentActivity: parseInt(stats.total_materials) // Can be enhanced later
    });
  } catch (error) {
    console.error('❌ Database error in stats API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released');
    }
  }
}
