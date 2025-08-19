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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'File must be in .xlsx format' }, { status: 400 });
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 });
    }

    const client = await pool.connect();
    let insertedCount = 0;

    try {
      await client.query('BEGIN');

      for (const row of data as Record<string, unknown>[]) {
        // Validate required fields
        if (!row['Division'] || !row['Material SAP'] || !row['Material Description']) {
          console.warn('Skipping row with missing required fields:', row);
          continue;
        }

        // Insert into database
        const insertQuery = `
          INSERT INTO materials (
            jenisnya,
            material_sap,
            material_description,
            base_unit_of_measure,
            status,
            lokasi_sistem,
            lokasi_fisik,
            storeroom,
            penempatan_pada_alat,
            deskripsi_penempatan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (material_sap) DO UPDATE SET
            jenisnya = EXCLUDED.jenisnya,
            material_description = EXCLUDED.material_description,
            base_unit_of_measure = EXCLUDED.base_unit_of_measure,
            status = EXCLUDED.status,
            lokasi_sistem = EXCLUDED.lokasi_sistem,
            lokasi_fisik = EXCLUDED.lokasi_fisik,
            storeroom = EXCLUDED.storeroom,
            penempatan_pada_alat = EXCLUDED.penempatan_pada_alat,
            deskripsi_penempatan = EXCLUDED.deskripsi_penempatan,
            updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
          row['Division'] || '',
          row['Material SAP'] || '',
          row['Material Description'] || '',
          row['Unit'] || '',
          row['Status'] || 'ACTIVE',
          row['System Location'] || '',
          row['Physical Location'] || '',
          row['Storeroom'] || '',
          row['Equipment Placement'] || '',
          row['Placement Description'] || ''
        ];

        await client.query(insertQuery, values);
        insertedCount++;
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        message: 'Upload successful',
        count: insertedCount
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
