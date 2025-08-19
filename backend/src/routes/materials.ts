import express from 'express';
import { db } from '../server';
import multer from 'multer';
import ExcelJS from 'exceljs';
import csv from 'csv-parser';
import fs from 'fs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Interface for Material
interface Material {
  id?: number;
  divisi: string;
  material_sap: string;
  material_description: string;
  jenis: string;
  original_qty: number;
  qty: number;
  satuan: string;
  lokasi: string;
  penempatan_alat: string;
  kategori: string;
  photo?: string;
  status_alat: string;
  status_data: string;
}

interface MaterialRow extends RowDataPacket, Material {}

// GET /api/materials - Get all materials with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      divisi,
      status_alat,
      penempatan_alat,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM materials WHERE 1=1';
    const params: any[] = [];

    // Add filters
    if (divisi) {
      query += ` AND divisi = ?`;
      params.push(divisi);
    }

    if (status_alat) {
      query += ` AND status_alat = ?`;
      params.push(status_alat);
    }

    if (penempatan_alat) {
      query += ` AND penempatan_alat = ?`;
      params.push(penempatan_alat);
    }

    if (search) {
      query += ` AND (material_description LIKE ? OR material_sap LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add pagination
    query += ` ORDER BY id LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [result] = await db.execute<MaterialRow[]>(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM materials WHERE 1=1';
    const countParams: any[] = [];

    if (divisi) {
      countQuery += ` AND divisi = ?`;
      countParams.push(divisi);
    }

    if (status_alat) {
      countQuery += ` AND status_alat = ?`;
      countParams.push(status_alat);
    }

    if (penempatan_alat) {
      countQuery += ` AND penempatan_alat = ?`;
      countParams.push(penempatan_alat);
    }

    if (search) {
      countQuery += ` AND (material_description LIKE ? OR material_sap LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      data: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// GET /api/materials/:id - Get single material
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute<MaterialRow[]>('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// POST /api/materials - Create new material
router.post('/', async (req, res) => {
  try {
    const material: Material = req.body;
    
    const query = `
      INSERT INTO materials (
        divisi, material_sap, material_description, jenis, original_qty, 
        qty, satuan, lokasi, penempatan_alat, kategori, photo, 
        status_alat, status_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      material.divisi,
      material.material_sap,
      material.material_description,
      material.jenis,
      material.original_qty,
      material.qty,
      material.satuan,
      material.lokasi,
      material.penempatan_alat,
      material.kategori,
      material.photo,
      material.status_alat,
      material.status_data
    ];

    const [result] = await db.execute<ResultSetHeader>(query, values);
    
    // Get the created material
    const [newMaterial] = await db.execute<MaterialRow[]>('SELECT * FROM materials WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newMaterial[0]);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// PUT /api/materials/:id - Update material
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material: Material = req.body;

    const query = `
      UPDATE materials SET
        divisi = ?, material_sap = ?, material_description = ?, jenis = ?,
        original_qty = ?, qty = ?, satuan = ?, lokasi = ?,
        penempatan_alat = ?, kategori = ?, photo = ?,
        status_alat = ?, status_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      material.divisi,
      material.material_sap,
      material.material_description,
      material.jenis,
      material.original_qty,
      material.qty,
      material.satuan,
      material.lokasi,
      material.penempatan_alat,
      material.kategori,
      material.photo,
      material.status_alat,
      material.status_data,
      id
    ];

    const [result] = await db.execute<ResultSetHeader>(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Get the updated material
    const [updatedMaterial] = await db.execute<MaterialRow[]>('SELECT * FROM materials WHERE id = ?', [id]);
    res.json(updatedMaterial[0]);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// DELETE /api/materials/:id - Delete material
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM materials WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// POST /api/materials/upload - Upload CSV/Excel file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const materials: Material[] = [];

    if (req.file.originalname.endsWith('.csv')) {
      // Parse CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            materials.push({
              divisi: row.divisi || '',
              material_sap: row.material_sap || '',
              material_description: row.material_description || '',
              jenis: row.jenis || '',
              original_qty: parseInt(row.original_qty) || 0,
              qty: parseInt(row.qty) || 0,
              satuan: row.satuan || '',
              lokasi: row.lokasi || '',
              penempatan_alat: row.penempatan_alat || '',
              kategori: row.kategori || '',
              photo: row.photo || '',
              status_alat: row.status_alat || '',
              status_data: row.status_data || ''
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (req.file.originalname.endsWith('.xlsx')) {
      // Parse Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      
      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        const values = row.values as any[];
        materials.push({
          divisi: values[1] || '',
          material_sap: values[2] || '',
          material_description: values[3] || '',
          jenis: values[4] || '',
          original_qty: parseInt(values[5]) || 0,
          qty: parseInt(values[6]) || 0,
          satuan: values[7] || '',
          lokasi: values[8] || '',
          penempatan_alat: values[9] || '',
          kategori: values[10] || '',
          photo: values[11] || '',
          status_alat: values[12] || '',
          status_data: values[13] || ''
        });
      });
    }

    // Insert materials into database
    for (const material of materials) {
      const query = `
        INSERT INTO materials (
          divisi, material_sap, material_description, jenis, original_qty,
          qty, satuan, lokasi, penempatan_alat, kategori, photo,
          status_alat, status_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          qty = VALUES(qty),
          status_data = VALUES(status_data),
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        material.divisi,
        material.material_sap,
        material.material_description,
        material.jenis,
        material.original_qty,
        material.qty,
        material.satuan,
        material.lokasi,
        material.penempatan_alat,
        material.kategori,
        material.photo,
        material.status_alat,
        material.status_data
      ];

      await db.execute(query, values);
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({ 
      message: 'File uploaded successfully', 
      count: materials.length 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// GET /api/materials/export - Export materials to Excel
router.get('/export', async (req, res) => {
  try {
    const { password } = req.query;
    
    // Simple password protection (in production, use proper authentication)
    if (password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const [result] = await db.execute<MaterialRow[]>('SELECT * FROM materials ORDER BY id');
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Materials');

    // Add headers
    worksheet.addRow([
      'ID', 'Divisi', 'Material SAP', 'Material Description', 'Jenis',
      'Original Qty', 'Qty', 'Satuan', 'Lokasi', 'Penempatan Alat',
      'Kategori', 'Photo', 'Status Alat', 'Status Data', 'Created At', 'Updated At'
    ]);

    // Add data
    result.forEach((material: any) => {
      worksheet.addRow([
        material.id,
        material.divisi,
        material.material_sap,
        material.material_description,
        material.jenis,
        material.original_qty,
        material.qty,
        material.satuan,
        material.lokasi,
        material.penempatan_alat,
        material.kategori,
        material.photo,
        material.status_alat,
        material.status_data,
        material.created_at,
        material.updated_at
      ]);
    });

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=materials.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting materials:', error);
    res.status(500).json({ error: 'Failed to export materials' });
  }
});

export default router;
