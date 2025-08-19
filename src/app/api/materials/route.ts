import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET(request: NextRequest) {
  let client;
  try {
    console.log('🔄 Connecting to database for materials...');
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
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Map frontend field names to database column names
    const fieldMapping: { [key: string]: string } = {
      'nama_material': 'material_description',
      'kode_material': 'material_sap',
      'kategori': 'storeroom',
      'divisi': 'jenisnya',
      'satuan': 'base_unit_of_measure',
      'status': 'status',
      'lokasi': 'lokasi_fisik'
    };
    
    const sortField = fieldMapping[sortBy] || 'id';
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    // Optimized query with proper field mapping to new schema
    const materialsQuery = `
      SELECT 
        id, 
        REGEXP_REPLACE(TRIM(COALESCE(material_description, 'N/A')), '^[;,:\s]+', '', 'g') as nama_material,
        TRIM(COALESCE(material_sap, '')) as kode_material,
        TRIM(COALESCE(storeroom, '')) as kategori,
        TRIM(COALESCE(jenisnya, '')) as divisi,
        TRIM(COALESCE(base_unit_of_measure, '')) as satuan,
        TRIM(COALESCE(status, 'ACTIVE')) as status,
        image_url,
        TRIM(COALESCE(lokasi_sistem, '')) as lokasi_sistem,
        TRIM(COALESCE(lokasi_fisik, '')) as lokasi_fisik,
        TRIM(COALESCE(penempatan_pada_alat, '')) as penempatan_pada_alat,
        TRIM(COALESCE(deskripsi_penempatan, '')) as deskripsi_penempatan,
        created_at,
        updated_at
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
    
    client = await db.connect();
    console.log('✅ Database connected for materials GET');
    const [materialsResult, countResult] = await Promise.all([
      client.query(materialsQuery, queryParams),
      client.query(countQuery, queryParams.slice(0, -2)) // Exclude LIMIT and OFFSET params for count
    ]);
    
    const totalCount = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: materialsResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('❌ Database error in materials GET:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch materials',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released');
    }
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('📝 Materials POST - Starting...');
    
    const body = await request.json();
    console.log('📋 Materials POST - Body received:', body);
    
    const {
      nama_material,
      kode_material,
      kategori,
      divisi,
      satuan,
      status = 'ACTIVE',
      image_url,
      lokasi_sistem,
      lokasi_fisik,
      penempatan_pada_alat,
      deskripsi_penempatan
    } = body;

    // Validate required fields
    if (!nama_material) {
      return NextResponse.json(
        { error: 'Material name is required' },
        { status: 400 }
      );
    }

    client = await db.connect();
    console.log('✅ Database connected for materials POST');
    
    const result = await client.query(
      `INSERT INTO materials 
        (material_description, material_sap, storeroom, jenisnya, base_unit_of_measure, 
         status, image_url, lokasi_sistem, lokasi_fisik,
         penempatan_pada_alat, deskripsi_penempatan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [nama_material, kode_material, kategori, divisi, satuan, status, 
       image_url, lokasi_sistem, lokasi_fisik,
       penempatan_pada_alat, deskripsi_penempatan]
    );

    console.log('✅ Materials POST - Success:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Database error in materials POST:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create material',
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
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

export async function PUT(request: NextRequest) {
  let client;
  try {
    console.log('📝 Materials PUT - Starting...');
    
    const body = await request.json();
    console.log('📋 Materials PUT - Body received:', body);
    
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    // Map frontend field names to database column names
    const fieldMapping: Record<string, string> = {
      'nama_material': 'material_description',
      'kode_material': 'material_sap',
      'kategori': 'storeroom',
      'divisi': 'jenisnya',
      'satuan': 'base_unit_of_measure',
      'status': 'status',
      'image_url': 'image_url',
      'lokasi_sistem': 'lokasi_sistem',
      'lokasi_fisik': 'lokasi_fisik',
      'penempatan_pada_alat': 'penempatan_pada_alat',
      'deskripsi_penempatan': 'deskripsi_penempatan'
    };

    // Convert frontend field names to database column names
    const mappedData: Record<string, unknown> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      const dbColumn = fieldMapping[key] || key;
      mappedData[dbColumn] = value;
    });

    const fields = Object.keys(mappedData);
    const values = Object.values(mappedData);
    
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    client = await db.connect();
    console.log('✅ Database connected for materials PUT');
    
    console.log('🔄 Materials PUT - Query:', `UPDATE materials SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1}`);
    console.log('🔄 Materials PUT - Values:', [...values, id]);
    
    const result = await client.query(
      `UPDATE materials SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    console.log('✅ Materials PUT - Success:', result.rows[0]);
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('❌ Database error in materials PUT:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update material',
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
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

export async function DELETE(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    client = await db.connect();
    console.log('✅ Database connected for materials DELETE');
    
    const result = await client.query('DELETE FROM materials WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Material deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('❌ Database error in materials DELETE:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete material',
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
