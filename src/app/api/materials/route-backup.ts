import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'tps_user',
  host: 'l         penempatan_pada_alat, deskripsi_penempatan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [nama_material, kode_material, kategori, divisi, satuan, status, 
       original_qty, threshold_qty, image_url, lokasi_sistem, lokasi_fisik,
       penempatan_pada_alat, deskripsi_penempatan]
    );

    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();  database: 'tps_dashboard',
  password: 'Abyansyah123',
  port: 5432,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const division = searchParams.get('division') || '';
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (search) {
      whereConditions.push(`(COALESCE(material_description, 'N/A') ILIKE $${paramIndex} OR material_sap ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (category) {
      whereConditions.push(`storeroom = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    if (division) {
      whereConditions.push(`jenisnya = $${paramIndex}`);
      queryParams.push(division);
      paramIndex++;
    }
    
    if (status) {
      if (status === 'inactive') {
        whereConditions.push(`(status != 'ACTIVE' OR status IS NULL)`);
      } else if (status === 'active') {
        whereConditions.push(`status = 'ACTIVE'`);
      } else {
        whereConditions.push(`COALESCE(status, 'No Status') = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Optimized query with proper field mapping to new schema
    const materialsQuery = `
      SELECT 
        id, 
        COALESCE(material_description, 'N/A') as nama_material,
        material_sap as kode_material,
        storeroom as kategori,
        jenisnya as divisi,
        COALESCE(original_qty, 0) as original_qty,
        base_unit_of_measure as satuan,
        COALESCE(status, 'No Status') as status,
        COALESCE(threshold_qty, 10) as threshold_qty,
        image_url,
        lokasi_sistem,
        lokasi_fisik,
        penempatan_pada_alat,
        deskripsi_penempatan
      FROM materials 
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM materials 
      ${whereClause}
    `;
    
    queryParams.push(limit, offset);
    
    const client = await pool.connect();
    
    const [materialsResult, countResult] = await Promise.all([
      client.query(materialsQuery, queryParams),
      client.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    client.release();
    
    return NextResponse.json({
      materials: materialsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nama_material,  // material_description
      kode_material,  // material_sap
      kategori,       // storeroom  
      divisi,         // jenisnya
      satuan,         // base_unit_of_measure
      status = 'ACTIVE',
      original_qty = 0,
      threshold_qty = 10,
      image_url,
      lokasi_sistem,
      lokasi_fisik,
      penempatan_pada_alat,
      deskripsi_penempatan
    } = body;

    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO materials 
        (material_description, material_sap, storeroom, jenisnya, base_unit_of_measure, 
         status, original_qty, threshold_qty, image_url, lokasi_sistem, lokasi_fisik,
         penempatan_pada_alat, deskripsi_penempatan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [nama_material, kode_material, kategori, divisi, satuan, status, 
       original_qty, threshold_qty, image_url, lokasi_sistem, lokasi_fisik,
       penempatan_pada_alat, deskripsi_penempatan]
    );

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      nama_material, 
      kode_material, 
      kategori, 
      original_qty, 
      satuan, 
      status,
      threshold_qty,
      image_url,
      status_alat,
      divisi,
      lokasi,
      penempatan_alat
    } = body;
    
    const client = await pool.connect();
    
    const updateQuery = `
      UPDATE materials SET 
        material_description = $2, 
        material_sap = $3, 
        kategori = $4, 
        original_qty = $5,
        qty = $5,
        satuan = $6,
        status = $7,
        threshold_qty = $8,
        image_url = $9,
        photo = $9,
        status_alat = $10,
        divisi = $11,
        lokasi = $12,
        penempatan_alat = $13
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [
      id, nama_material || 'CC/ME', kode_material, kategori, original_qty,
      satuan, status, threshold_qty, image_url, status_alat,
      divisi, lokasi, penempatan_alat
    ]);
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    const deleteQuery = 'DELETE FROM materials WHERE id = $1 RETURNING id';
    const result = await client.query(deleteQuery, [id]);
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
