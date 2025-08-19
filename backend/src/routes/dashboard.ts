import express from 'express';
import { db } from '../server';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total materials count
    const [totalMaterialsResult] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM materials');
    const totalMaterials = totalMaterialsResult[0].total;

    // Get materials by division
    const [divisionStatsResult] = await db.execute<RowDataPacket[]>(`
      SELECT divisi, COUNT(*) as count 
      FROM materials 
      GROUP BY divisi
    `);

    // Get materials by status
    const [statusStatsResult] = await db.execute<RowDataPacket[]>(`
      SELECT status_alat, COUNT(*) as count 
      FROM materials 
      GROUP BY status_alat
    `);

    // Get materials by placement
    const [placementStatsResult] = await db.execute<RowDataPacket[]>(`
      SELECT penempatan_alat, COUNT(*) as count 
      FROM materials 
      GROUP BY penempatan_alat 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Get recent activity (materials updated in last 7 days)
    const [recentActivityResult] = await db.execute<RowDataPacket[]>(`
      SELECT COUNT(*) as recent_updates 
      FROM materials 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get low stock items (qty < 10)
    const [lowStockResult] = await db.execute<RowDataPacket[]>(`
      SELECT COUNT(*) as low_stock_count 
      FROM materials 
      WHERE qty < 10
    `);

    // Get total quantity by division
    const [qtyByDivisionResult] = await db.execute<RowDataPacket[]>(`
      SELECT divisi, SUM(qty) as total_qty 
      FROM materials 
      GROUP BY divisi
    `);

    res.json({
      totalMaterials,
      divisionStats: divisionStatsResult,
      statusStats: statusStatsResult,
      placementStats: placementStatsResult,
      recentUpdates: recentActivityResult[0].recent_updates,
      lowStockCount: lowStockResult[0].low_stock_count,
      quantityByDivision: qtyByDivisionResult
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/charts/division - Get division chart data
router.get('/charts/division', async (req, res) => {
  try {
    const [result] = await db.execute<RowDataPacket[]>(`
      SELECT divisi, COUNT(*) as count 
      FROM materials 
      GROUP BY divisi
      ORDER BY count DESC
    `);

    const labels = result.map(row => row.divisi);
    const data = result.map(row => parseInt(row.count as string));

    res.json({
      labels,
      datasets: [{
        label: 'Materials by Division',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    });
  } catch (error) {
    console.error('Error fetching division chart data:', error);
    res.status(500).json({ error: 'Failed to fetch division chart data' });
  }
});

// GET /api/dashboard/charts/placement - Get placement chart data
router.get('/charts/placement', async (req, res) => {
  try {
    const [result] = await db.execute<RowDataPacket[]>(`
      SELECT penempatan_alat, COUNT(*) as count 
      FROM materials 
      GROUP BY penempatan_alat
      ORDER BY count DESC
      LIMIT 8
    `);

    const labels = result.map(row => row.penempatan_alat);
    const data = result.map(row => parseInt(row.count as string));

    res.json({
      labels,
      datasets: [{
        label: 'Materials by Placement',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    });
  } catch (error) {
    console.error('Error fetching placement chart data:', error);
    res.status(500).json({ error: 'Failed to fetch placement chart data' });
  }
});

// GET /api/dashboard/charts/status - Get status chart data
router.get('/charts/status', async (req, res) => {
  try {
    const [result] = await db.execute<RowDataPacket[]>(`
      SELECT status_alat, COUNT(*) as count 
      FROM materials 
      GROUP BY status_alat
      ORDER BY count DESC
    `);

    const labels = result.map(row => row.status_alat);
    const data = result.map(row => parseInt(row.count as string));

    res.json({
      labels,
      datasets: [{
        label: 'Materials by Status',
        data,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for active/good
          'rgba(239, 68, 68, 0.8)',   // Red for inactive/bad
          'rgba(251, 191, 36, 0.8)',  // Yellow for maintenance
          'rgba(156, 163, 175, 0.8)', // Gray for unknown
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1
      }]
    });
  } catch (error) {
    console.error('Error fetching status chart data:', error);
    res.status(500).json({ error: 'Failed to fetch status chart data' });
  }
});

// GET /api/dashboard/recent-materials - Get recently added/updated materials
router.get('/recent-materials', async (req, res) => {
  try {
    const [result] = await db.execute<RowDataPacket[]>(`
      SELECT id, material_sap, material_description, divisi, qty, updated_at
      FROM materials 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);

    res.json(result);
  } catch (error) {
    console.error('Error fetching recent materials:', error);
    res.status(500).json({ error: 'Failed to fetch recent materials' });
  }
});

// GET /api/dashboard/low-stock - Get low stock materials
router.get('/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const [result] = await db.execute<RowDataPacket[]>(`
      SELECT id, material_sap, material_description, divisi, qty, satuan
      FROM materials 
      WHERE qty < ?
      ORDER BY qty ASC 
      LIMIT 20
    `, [threshold]);

    res.json(result);
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    res.status(500).json({ error: 'Failed to fetch low stock materials' });
  }
});

export default router;
