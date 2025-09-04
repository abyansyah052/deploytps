import { NextResponse } from 'next/server';

// Import the same data structure from the main route
// In production, this would use database operations
interface SopItem {
  id: number;
  title: string;
  content: string;
  type: 'sop' | 'announcement';
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
}

// This should reference the same data as the main route
// In production, this would be handled by database operations
let sopData: SopItem[] = [
  {
    id: 1,
    title: 'Protokol Keselamatan Kerja',
    content: 'Selalu gunakan APD lengkap saat bekerja di area operasional:\n• Helm safety\n• Sepatu safety\n• Rompi safety\n• Sarung tangan kerja\n\nPastikan untuk melakukan inspeksi peralatan sebelum digunakan.',
    type: 'sop',
    priority: 'high',
    createdAt: '2024-02-20T08:00:00.000Z'
  },
  {
    id: 2,
    title: 'Pemberitahuan Maintenance Sistem',
    content: 'Maintenance sistem akan dilakukan pada hari Minggu, 25 Februari 2024 pukul 02:00 - 06:00 WIB.\n\nSelama periode ini, sistem mungkin tidak dapat diakses. Mohon untuk menyimpan pekerjaan Anda sebelum waktu maintenance.',
    type: 'announcement',
    priority: 'normal',
    createdAt: '2024-02-19T10:30:00.000Z'
  },
  {
    id: 3,
    title: 'Prosedur Pelaporan Incident',
    content: 'Jika terjadi incident di tempat kerja:\n\n1. Pastikan keselamatan diri dan rekan kerja\n2. Laporkan segera ke supervisor\n3. Isi form incident report\n4. Dokumentasikan dengan foto jika memungkinkan\n5. Ikuti instruksi tim safety',
    type: 'sop',
    priority: 'high',
    createdAt: '2024-02-18T14:15:00.000Z'
  }
];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    // Find the item to update
    const itemIndex = sopData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'SOP item not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.title || !body.content || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the item
    const updatedItem: SopItem = {
      ...sopData[itemIndex],
      title: body.title,
      content: body.content,
      type: body.type,
      priority: body.priority || 'normal'
    };

    sopData[itemIndex] = updatedItem;

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating SOP item:', error);
    return NextResponse.json(
      { error: 'Failed to update SOP item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Find the item to delete
    const itemIndex = sopData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'SOP item not found' },
        { status: 404 }
      );
    }

    // Remove the item
    const deletedItem = sopData.splice(itemIndex, 1)[0];

    return NextResponse.json({ 
      message: 'SOP item deleted successfully',
      item: deletedItem 
    });
  } catch (error) {
    console.error('Error deleting SOP item:', error);
    return NextResponse.json(
      { error: 'Failed to delete SOP item' },
      { status: 500 }
    );
  }
}
