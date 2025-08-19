import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const division = searchParams.get('division') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;
    
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];
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
    
    // Map frontend field names to database column names
    const fieldMapping: { [key: string]: string } = {
      'nama_material': 'material_description',
      'kode_material': 'material_sap',
      'kategori': 'storeroom',
      'divisi': 'jenisnya',
      'original_qty': 'original_qty',
      'satuan': 'base_unit_of_measure',
      'status': 'status',
      'threshold_qty': 'threshold_qty',
      'lokasi': 'lokasi_fisik'
    };
    
    const sortField = fieldMapping[sortBy] || 'id';
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
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
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM materials 
      ${whereClause}
    `;
    
    queryParams.push(limit);
    queryParams.push(offset);
    
    const client = await pool.connect();
    const [materialsResult, countResult] = await Promise.all([
      client.query(materialsQuery, queryParams),
      client.query(countQuery, queryParams.slice(0, -2))
    ]);
    
    client.release();
    
    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      materials: materialsResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
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

    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      nama_material,
      kode_material,
      kategori,
      divisi,
      satuan,
      status,
      original_qty,
      threshold_qty,
      image_url,
      lokasi_sistem,
      lokasi_fisik,
      penempatan_pada_alat,
      deskripsi_penempatan
    } = body;

    const client = await pool.connect();
    
    const result = await client.query(
      `UPDATE materials SET 
        material_description = $2,
        material_sap = $3,
        storeroom = $4,
        jenisnya = $5,
        base_unit_of_measure = $6,
        status = $7,
        original_qty = $8,
        threshold_qty = $9,
        image_url = $10,
        lokasi_sistem = $11,
        lokasi_fisik = $12,
        penempatan_pada_alat = $13,
        deskripsi_penempatan = $14,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id, nama_material, kode_material, kategori, divisi, satuan, 
       status, original_qty, threshold_qty, image_url, lokasi_sistem, 
       lokasi_fisik, penempatan_pada_alat, deskripsi_penempatan]
    );

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
    
    const result = await client.query(
      'DELETE FROM materials WHERE id = $1 RETURNING id',
      [id]
    );

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
