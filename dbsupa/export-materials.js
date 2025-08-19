const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration dari .env.local
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'tps_dashboard',
  user: 'tps_user',
  password: 'Abyansyah123',
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Function to escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Convert to string
  const str = String(value);
  
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// Function to export materials to CSV
async function exportMaterialsToCSV() {
  let client;
  
  try {
    console.log('🔗 Connecting to database...');
    client = await pool.connect();
    
    // Get all materials data (updated schema without stock fields)
    console.log('📊 Fetching materials data...');
    const query = `
      SELECT 
        id,
        jenisnya,
        material_sap,
        material_description,
        base_unit_of_measure,
        status,
        lokasi_sistem,
        lokasi_fisik,
        storeroom,
        penempatan_pada_alat,
        deskripsi_penempatan,
        image_url,
        created_at,
        updated_at
      FROM materials 
      ORDER BY id ASC
    `;
    
    const result = await client.query(query);
    console.log(`✅ Found ${result.rows.length} materials`);
    
    if (result.rows.length === 0) {
      console.log('⚠️ No data found in materials table');
      return;
    }
    
    // Create CSV header (updated without stock fields)
    const headers = [
      'ID',
      'Jenis Material',
      'Kode SAP',
      'Deskripsi Material',
      'Satuan',
      'Status',
      'Lokasi Sistem',
      'Lokasi Fisik',
      'Storeroom',
      'Penempatan pada Alat',
      'Deskripsi Penempatan',
      'URL Gambar',
      'Dibuat Pada',
      'Diupdate Pada'
    ];
    
    // Start building CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows (updated without stock fields)
    console.log('📝 Converting data to CSV format...');
    result.rows.forEach(row => {
      const csvRow = [
        escapeCSV(row.id),
        escapeCSV(row.jenisnya),
        escapeCSV(row.material_sap),
        escapeCSV(row.material_description),
        escapeCSV(row.base_unit_of_measure),
        escapeCSV(row.status),
        escapeCSV(row.lokasi_sistem),
        escapeCSV(row.lokasi_fisik),
        escapeCSV(row.storeroom),
        escapeCSV(row.penempatan_pada_alat),
        escapeCSV(row.deskripsi_penempatan),
        escapeCSV(row.image_url),
        escapeCSV(row.created_at),
        escapeCSV(row.updated_at)
      ];
      
      csvContent += csvRow.join(',') + '\n';
    });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `materials_export_${timestamp}.csv`;
    const filepath = path.join(__dirname, filename);
    
    // Write CSV file
    console.log('💾 Writing CSV file...');
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    console.log('🎉 Export completed successfully!');
    console.log(`📁 File saved: ${filepath}`);
    console.log(`📊 Records exported: ${result.rows.length}`);
    console.log(`📏 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
    
    // Show first few rows as preview
    console.log('\n📋 Preview (first 3 rows):');
    const lines = csvContent.split('\n');
    lines.slice(0, 4).forEach((line, index) => {
      if (line.trim()) {
        console.log(`${index === 0 ? 'Headers' : `Row ${index}`}: ${line.slice(0, 100)}${line.length > 100 ? '...' : ''}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error exporting materials:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the export
if (require.main === module) {
  console.log('🚀 Starting materials CSV export...');
  exportMaterialsToCSV();
}

module.exports = { exportMaterialsToCSV };
