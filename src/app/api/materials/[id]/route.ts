import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'tps_dashboard',
  user: process.env.POSTGRES_USER || 'tps_user',
  password: process.env.POSTGRES_PASSWORD || 'Abyansyah123',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const materialId = parseInt(id);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM materials WHERE id = $1',
      [materialId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const materialId = parseInt(id);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      divisi,
      material_sap,
      material_description,
      jenis,
      qty,
      satuan,
      lokasi,
      penempatan_alat,
      kategori,
      photo,
      status_alat,
      status_data
    } = body;

    // Validate required fields
    const requiredFields = [
      'divisi', 'material_sap', 'material_description', 'jenis',
      'qty', 'satuan', 'lokasi', 'penempatan_alat', 'kategori', 'status_alat'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const result = await pool.query(
      `UPDATE materials SET 
        divisi = $1,
        material_sap = $2,
        material_description = $3,
        jenis = $4,
        qty = $5,
        satuan = $6,
        lokasi = $7,
        penempatan_alat = $8,
        kategori = $9,
        photo = $10,
        status_alat = $11,
        status_data = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        divisi,
        material_sap,
        material_description,
        jenis,
        qty,
        satuan,
        lokasi,
        penempatan_alat,
        kategori,
        photo || null,
        status_alat,
        status_data || 'Active',
        materialId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Material updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const materialId = parseInt(id);
    
    if (isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid material ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM materials WHERE id = $1 RETURNING *',
      [materialId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Material deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
