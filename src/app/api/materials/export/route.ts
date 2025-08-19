import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import * as XLSX from 'xlsx';

const pool = new Pool({
  user: 'tps_user',
  host: 'localhost',
  database: 'tps_dashboard',
  password: 'Abyansyah123',
  port: 5432,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division');

    const client = await pool.connect();
    
    let query = `
      SELECT 
        jenisnya as "Division",
        material_sap as "Material SAP",
        material_description as "Material Description",
        base_unit_of_measure as "Unit",
        status as "Status",
        lokasi_sistem as "System Location",
        lokasi_fisik as "Physical Location", 
        storeroom as "Storeroom",
        penempatan_pada_alat as "Equipment Placement",
        deskripsi_penempatan as "Placement Description",
        original_qty as "Quantity",
        threshold_qty as "Threshold Quantity",
        created_at as "Created Date"
      FROM materials
      WHERE 1=1
    `;
    
    const params: (string | number)[] = [];
    
    if (division && division !== 'all') {
      query += ' AND jenisnya = $1';
      params.push(division);
    }
    
    query += ' ORDER BY jenisnya, material_description';

    const result = await client.query(query, params);
    client.release();

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    
    // Auto-width columns
    const colWidths = Object.keys(result.rows[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Materials');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="materials_${division || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
