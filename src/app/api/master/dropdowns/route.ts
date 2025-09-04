import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// Ensure dropdown_options table exists
async function ensureDropdownTable() {
  let client;
  try {
    client = await db.connect();
    console.log('✅ Connected to database for dropdown table check');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dropdown_options'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating dropdown_options table...');
      
      await client.query(`
        CREATE TABLE dropdown_options (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          value VARCHAR(255) NOT NULL,
          division VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(type, value, COALESCE(division, ''))
        );
      `);

      // Insert default data
      const defaultValues = [
        // Divisions
        ['divisions', 'RTG', null],
        ['divisions', 'CC', null],
        ['divisions', 'ME', null],
        ['divisions', 'LAIN', null],
        // Store Rooms
        ['store_rooms', 'Store Room A', null],
        ['store_rooms', 'Store Room B', null],
        ['store_rooms', 'Store Room C', null],
        // Units of Measure
        ['units_of_measure', 'PCS', null],
        ['units_of_measure', 'KG', null],
        ['units_of_measure', 'LITER', null],
        ['units_of_measure', 'METER', null],
        ['units_of_measure', 'SET', null],
        // System Locations
        ['system_locations', 'Engine Room', null],
        ['system_locations', 'Control Room', null],
        ['system_locations', 'Hydraulic System', null],
        // Physical Locations
        ['physical_locations', 'Front', null],
        ['physical_locations', 'Rear', null],
        ['physical_locations', 'Left Side', null],
        ['physical_locations', 'Right Side', null],
        // Machine Placements
        ['machine_placements', 'Engine Compartment', null],
        ['machine_placements', 'Control Panel', null],
        ['machine_placements', 'Cabin Area', null],
        // Subsystem Placements
        ['subsystem_placements', 'Primary System', null],
        ['subsystem_placements', 'Secondary System', null],
        ['subsystem_placements', 'Backup System', null],
        // Material Status
        ['material_status', 'ACTIVE', null],
        ['material_status', 'INACTIVE', null],
        ['material_status', 'AVAILABLE', null],
        ['material_status', 'NOT AVAILABLE', null],
        // Machine Numbers
        ['machine_numbers', 'RTG-001', 'RTG'],
        ['machine_numbers', 'RTG-002', 'RTG'],
        ['machine_numbers', 'CC-001', 'CC'],
        ['machine_numbers', 'CC-002', 'CC'],
        ['machine_numbers', 'ME-001', 'ME'],
        ['machine_numbers', 'ME-002', 'ME']
      ];

      for (const [type, value, division] of defaultValues) {
        await client.query(`
          INSERT INTO dropdown_options (type, value, division) 
          VALUES ($1, $2, $3)
        `, [type, value, division]);
      }

      console.log('dropdown_options table created with default values');
    }
  } catch (error) {
    console.error('Error ensuring dropdown table:', error);
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released for ensureDropdownTable');
    }
  }
}

// Load existing data from materials table
async function loadExistingData() {
  let client;
  try {
    client = await db.connect();
    // Check if materials table exists first
    const materialsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'materials'
      );
    `);

    if (!materialsExists.rows[0].exists) {
      console.log('Materials table does not exist yet');
      return;
    }

    // Get existing columns from materials table
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'materials'
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);

    // Define mappings between materials table columns and dropdown types
    const columnMappings = [
      { type: 'divisions', column: 'jenisnya' },
      { type: 'store_rooms', column: 'storeroom' },
      { type: 'units_of_measure', column: 'base_unit_of_measure' },
      { type: 'material_status', column: 'status' },
      { type: 'system_locations', column: 'lokasi_sistem' },
      { type: 'physical_locations', column: 'lokasi_fisik' },
      { type: 'machine_placements', column: 'penempatan_pada_alat' },
      { type: 'subsystem_placements', column: 'deskripsi_penempatan' }
    ];

    // Insert data for each mapping where column exists
    for (const mapping of columnMappings) {
      if (existingColumns.includes(mapping.column)) {
        try {
          const result = await client.query(`
            SELECT DISTINCT ${mapping.column} as value 
            FROM materials 
            WHERE ${mapping.column} IS NOT NULL 
            AND ${mapping.column} != ''
          `);
          
          for (const row of result.rows) {
            await client.query(`
              INSERT INTO dropdown_options (type, value) 
              VALUES ($1, $2) 
              ON CONFLICT (type, value, COALESCE(division, '')) DO NOTHING
            `, [mapping.type, row.value]);
          }
        } catch (columnError) {
          console.log(`Error processing column ${mapping.column}:`, columnError instanceof Error ? columnError.message : String(columnError));
        }
      }
    }

    // Handle machine numbers with division if columns exist
    if (existingColumns.includes('machine_number') && existingColumns.includes('jenisnya')) {
      try {
        const machineResult = await client.query(`
          SELECT DISTINCT machine_number as value, jenisnya as division
          FROM materials 
          WHERE machine_number IS NOT NULL 
          AND machine_number != ''
          AND jenisnya IN ('RTG', 'CC', 'ME')
        `);
        
        for (const row of machineResult.rows) {
          await client.query(`
            INSERT INTO dropdown_options (type, value, division) 
            VALUES ('machine_numbers', $1, $2) 
            ON CONFLICT (type, value, COALESCE(division, '')) DO NOTHING
          `, [row.value, row.division]);
        }
      } catch (machineError) {
        console.log('Error processing machine numbers:', machineError instanceof Error ? machineError.message : String(machineError));
      }
    }

  } catch (error) {
    console.error('Error loading existing data:', error);
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released for loadExistingData');
    }
  }
}

export async function GET() {
  let client;
  try {
    await ensureDropdownTable();
    await loadExistingData();

    client = await db.connect();
    console.log('✅ Connected to database for dropdown GET');
    
    const result = await client.query(`
      SELECT type, value, division 
      FROM dropdown_options 
      ORDER BY type, division NULLS FIRST, value
      `);

      const dropdownData = {
        divisions: [],
        store_rooms: [],
        units_of_measure: [],
        system_locations: [],
        physical_locations: [],
        machine_placements: [],
        subsystem_placements: [],
        material_status: [],
        machine_numbers: {
          RTG: [],
          CC: [],
          ME: [],
          LAIN: []
        }
      };

      result.rows.forEach(row => {
        if (row.type === 'machine_numbers') {
          if (row.division && dropdownData.machine_numbers[row.division]) {
            dropdownData.machine_numbers[row.division].push(row.value);
          }
        } else {
          if (dropdownData[row.type] && !dropdownData[row.type].includes(row.value)) {
            dropdownData[row.type].push(row.value);
          }
        }
      });

      return NextResponse.json(dropdownData);
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropdown data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection released for dropdown GET');
    }
  }
}

export async function POST(request) {
  try {
    const { type, value, division } = await request.json();

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      );
    }

    const client = await db.connect();
    try {
      await client.query(
        'INSERT INTO dropdown_options (type, value, division) VALUES ($1, $2, $3)',
        [type, value, division || null]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding dropdown item:', error);
    if (error instanceof Error && 'code' in error && error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Item already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add dropdown item', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { type, value, division } = await request.json();

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      );
    }

    const client = await db.connect();
    try {
      const query = division 
        ? 'DELETE FROM dropdown_options WHERE type = $1 AND value = $2 AND division = $3'
        : 'DELETE FROM dropdown_options WHERE type = $1 AND value = $2 AND division IS NULL';
      
      const params = division ? [type, value, division] : [type, value];
      
      const result = await client.query(query, params);

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting dropdown item:', error);
    return NextResponse.json(
      { error: 'Failed to delete dropdown item', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
