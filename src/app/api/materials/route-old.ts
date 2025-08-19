import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tps_dashboard',
  user: process.env.POSTGRES_USER || 'tps_user',
  password: process.env.POSTGRES_PASSWORD || 'Abyansyah123',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const divisi = searchParams.get('divisi') || '';
    const status_alat = searchParams.get('status_alat') || '';

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(
        material_sap ILIKE $${paramCount} OR 
        material_description ILIKE $${paramCount} OR
        lokasi ILIKE $${paramCount} OR
        penempatan_alat ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (divisi) {
      conditions.push(`divisi = $${paramCount}`);
      params.push(divisi);
      paramCount++;
    }

    if (status_alat) {
      conditions.push(`status_alat = $${paramCount}`);
      params.push(status_alat);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM materials ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const dataQuery = `
      SELECT * FROM materials 
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);
    
    const dataResult = await pool.query(dataQuery, params);

    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const material = await request.json();

    const {
      divisi,
      material_sap,
      material_description,
      jenis,
      original_qty,
      qty,
      satuan,
      lokasi,
      penempatan_alat,
      kategori,
      photo,
      status_alat,
      status_data
    } = material;

    // Validate required fields
    const requiredFields = [
      'divisi', 'material_sap', 'material_description', 'jenis',
      'qty', 'satuan', 'lokasi', 'penempatan_alat', 'kategori', 'status_alat'
    ];
    
    for (const field of requiredFields) {
      if (!material[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const result = await pool.query(
      `INSERT INTO materials (
        divisi, material_sap, material_description, jenis,
        original_qty, qty, satuan, lokasi, penempatan_alat,
        kategori, photo, status_alat, status_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        divisi,
        material_sap,
        material_description,
        jenis,
        original_qty || qty, // Use original_qty if provided, otherwise use qty
        qty,
        satuan,
        lokasi,
        penempatan_alat,
        kategori,
        photo || null,
        status_alat,
        status_data || 'Active'
      ]
    );

    return NextResponse.json({
      message: 'Material created successfully',
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
