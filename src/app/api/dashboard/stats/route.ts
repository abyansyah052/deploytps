import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  let client;
  try {
    console.log('🔄 Connecting to database for stats...');
    client = await db.connect();
    console.log('✅ Database connected for stats');
    
    // Single optimized query to get all stats at once
    const statsQuery = `
      SELECT 
        COUNT(*) as total_materials,
        COUNT(CASE WHEN COALESCE(original_qty, 0) < COALESCE(threshold_qty, 10) THEN 1 END) as low_stock,
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

    const [statsResult, categoryResult, topMaterialsResult, divisionResult] = await Promise.all([
      client.query(statsQuery),
      client.query(categoryQuery),
      client.query(topMaterialsQuery),
      client.query(divisionQuery)
    ]);
    
    const stats = statsResult.rows[0];
    
    client.release();
    
    return NextResponse.json({
      totalMaterials: parseInt(stats.total_materials),
      lowStock: parseInt(stats.low_stock),
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
